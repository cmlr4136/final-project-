/**
 * This file handles the live recording of training data. It manages 
 * workout "sessions" (start/end times) and the individual "set entries" 
 * (reps, weight, and duration) performed during those sessions. 
 * Includes ownership validation to ensure users only modify their own data.
 */

package com.example.routes

import com.example.api.AddSetEntryRequest
import com.example.api.CreateWorkoutSessionRequest
import com.example.api.SetEntryDto
import com.example.api.UpdateSetEntryRequest
import com.example.api.WorkoutSessionDto
import com.example.auth.requireUser
import com.example.db.dbQuery
import com.example.db.tables.SetEntries
import com.example.db.tables.TrainingPlans
import com.example.db.tables.WorkoutSessions
import com.example.util.UtcClock
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.lessEq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.andWhere
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import java.time.Instant
import java.util.UUID

fun Route.workoutRoutes() {
    route("/workout-sessions") {
        patch("/{id}/finish") {
            val user = call.requireUser()
            val sessionId = call.parameters["id"]?.toUuidOrThrow("sessionId") 
                ?: throw IllegalArgumentException("Missing id")

            val now = UtcClock.now()
            val updated = dbQuery {
                WorkoutSessions.update({ 
                    (WorkoutSessions.id eq sessionId) and (WorkoutSessions.userId eq user.id) 
                }) {
                    it[endedAt] = now
                }
            }

            if (updated == 0) {
                call.respond(HttpStatusCode.NotFound)
                return@patch
            }
            call.respond(HttpStatusCode.OK)
        }
        post {
            val user = call.requireUser()
            val req = call.receive<CreateWorkoutSessionRequest>()
            val planId = req.planId?.toUuidOrThrow("planId")

            val now = UtcClock.now()
            val id = UUID.randomUUID()

            val created = dbQuery {
                if (planId != null) {
                    val own = TrainingPlans.selectAll()
                        .where { (TrainingPlans.id eq planId) and (TrainingPlans.userId eq user.id) }
                        .limit(1)
                        .any()
                    if (!own) return@dbQuery null
                }

                WorkoutSessions.insert {
                    it[WorkoutSessions.id] = id
                    it[userId] = user.id
                    it[WorkoutSessions.planId] = planId
                    it[startedAt] = now
                    it[notes] = req.notes
                    it[endedAt] = null
                }

                WorkoutSessionDto(
                    id = id.toString(),
                    planId = planId?.toString(),
                    startedAt = now.toString(),
                    endedAt = null,
                    notes = req.notes,
                )
            }

            if (created == null) {
                call.respond(HttpStatusCode.NotFound)
                return@post
            }

            call.respond(HttpStatusCode.Created, created)
        }

        get {
            val user = call.requireUser()
            val from = call.request.queryParameters["from"]?.let(::parseInstantOrThrow)
            val to = call.request.queryParameters["to"]?.let(::parseInstantOrThrow)

            val list = dbQuery {
                val q = WorkoutSessions.selectAll().where { WorkoutSessions.userId eq user.id }
                if (from != null) q.andWhere { WorkoutSessions.startedAt greaterEq from }
                if (to != null) q.andWhere { WorkoutSessions.startedAt lessEq to }

                q.orderBy(WorkoutSessions.startedAt, SortOrder.DESC).limit(200).map {
                    WorkoutSessionDto(
                        id = it[WorkoutSessions.id].toString(),
                        planId = it[WorkoutSessions.planId]?.toString(),
                        startedAt = it[WorkoutSessions.startedAt].toString(),
                        endedAt = it[WorkoutSessions.endedAt]?.toString(),
                        notes = it[WorkoutSessions.notes],
                    )
                }
            }
            call.respond(list)
        }

        post("/{id}/sets") {
            val user = call.requireUser()
            val sessionId = call.parameters["id"]?.toUuidOrThrow("sessionId") ?: throw IllegalArgumentException("Missing id")
            val req = call.receive<AddSetEntryRequest>()
            val exerciseId = req.exerciseId.toUuidOrThrow("exerciseId")

            val created = dbQuery {
                val own = WorkoutSessions.selectAll()
                    .where { (WorkoutSessions.id eq sessionId) and (WorkoutSessions.userId eq user.id) }
                    .limit(1)
                    .any()
                if (!own) return@dbQuery null

                val id = UUID.randomUUID()
                SetEntries.insert {
                    it[SetEntries.id] = id
                    it[SetEntries.sessionId] = sessionId
                    it[SetEntries.exerciseId] = exerciseId
                    it[setIndex] = req.setIndex
                    it[reps] = req.reps
                    it[weight] = req.weight
                    it[durationSec] = req.durationSec
                }

                SetEntryDto(
                    id = id.toString(),
                    sessionId = sessionId.toString(),
                    exerciseId = exerciseId.toString(),
                    setIndex = req.setIndex,
                    reps = req.reps,
                    weight = req.weight,
                    durationSec = req.durationSec,
                )
            }

            if (created == null) {
                call.respond(HttpStatusCode.NotFound)
                return@post
            }
            call.respond(HttpStatusCode.Created, created)
        }
    }

    patch("/{id}/finish") {
            val user = call.requireUser()
            val sessionId = call.parameters["id"]?.toUuidOrThrow("sessionId") ?: throw IllegalArgumentException("Missing id")

            val updated = dbQuery {
                // 1. Verify the workout belongs to the user
                val own = WorkoutSessions.selectAll()
                    .where { (WorkoutSessions.id eq sessionId) and (WorkoutSessions.userId eq user.id) }
                    .limit(1)
                    .any()
                
                if (!own) return@dbQuery 0

                // 2. Update the endedAt timestamp to right now
                WorkoutSessions.update({ WorkoutSessions.id eq sessionId }) {
                    it[endedAt] = UtcClock.now()
                }
            }

            if (updated == 0) {
                call.respond(HttpStatusCode.NotFound)
                return@patch
            }
            call.respond(HttpStatusCode.OK)
        }

    route("/sets") {
        put("/{id}") {
            val user = call.requireUser()
            val setId = call.parameters["id"]?.toUuidOrThrow("setId") ?: throw IllegalArgumentException("Missing id")
            val req = call.receive<UpdateSetEntryRequest>()

            val updated = dbQuery {
                val set = SetEntries.selectAll().where { SetEntries.id eq setId }.singleOrNull() ?: return@dbQuery 0
                val sessionId = set[SetEntries.sessionId]
                val own = WorkoutSessions.selectAll()
                    .where { (WorkoutSessions.id eq sessionId) and (WorkoutSessions.userId eq user.id) }
                    .limit(1)
                    .any()
                if (!own) return@dbQuery 0

                SetEntries.update({ SetEntries.id eq setId }) {
                    it[reps] = req.reps
                    it[weight] = req.weight
                    it[durationSec] = req.durationSec
                }
            }

            if (updated == 0) {
                call.respond(HttpStatusCode.NotFound)
                return@put
            }
            call.respond(HttpStatusCode.OK)
        }

        delete("/{id}") {
            val user = call.requireUser()
            val setId = call.parameters["id"]?.toUuidOrThrow("setId") ?: throw IllegalArgumentException("Missing id")

            val deleted = dbQuery {
                val set = SetEntries.selectAll().where { SetEntries.id eq setId }.singleOrNull() ?: return@dbQuery 0
                val sessionId = set[SetEntries.sessionId]
                val own = WorkoutSessions.selectAll()
                    .where { (WorkoutSessions.id eq sessionId) and (WorkoutSessions.userId eq user.id) }
                    .limit(1)
                    .any()
                if (!own) return@dbQuery 0

                SetEntries.deleteWhere { SetEntries.id eq setId }
            }

            if (deleted == 0) {
                call.respond(HttpStatusCode.NotFound)
                return@delete
            }
            call.respond(HttpStatusCode.OK)
        }

        get("/{id}/sets") {
            val user = call.requireUser()
            val sessionId = call.parameters["id"]?.toUuidOrThrow("sessionId") 
                ?: throw IllegalArgumentException("Missing id")

            val sets = dbQuery {
                // 1. Verify ownership
                val own = WorkoutSessions.selectAll()
                    .where { (WorkoutSessions.id eq sessionId) and (WorkoutSessions.userId eq user.id) }
                    .limit(1)
                    .any()
                if (!own) return@dbQuery null

                // 2. Fetch all sets for this session
                SetEntries.selectAll().where { SetEntries.sessionId eq sessionId }
                    .orderBy(SetEntries.setIndex to SortOrder.ASC)
                    .map {
                        SetEntryDto(
                            id = it[SetEntries.id].toString(),
                            sessionId = it[SetEntries.sessionId].toString(),
                            exerciseId = it[SetEntries.exerciseId].toString(),
                            setIndex = it[SetEntries.setIndex],
                            reps = it[SetEntries.reps],
                            weight = it[SetEntries.weight],
                            durationSec = it[SetEntries.durationSec]
                        )
                    }
            }

            if (sets == null) {
                call.respond(HttpStatusCode.NotFound)
                return@get
            }
            call.respond(sets)
        }
    }
}


private fun parseInstantOrThrow(value: String): Instant {
    return try {
        Instant.parse(value)
    } catch (_: Exception) {
        throw IllegalArgumentException("Invalid datetime format, expected ISO-8601")
    }
}
