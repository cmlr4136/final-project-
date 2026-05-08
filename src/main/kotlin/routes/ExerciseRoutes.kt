/**
 * This file manages the API endpoints for the master exercise list.
 * It allows users to search and filter exercises by muscle group or equipment,
 * and provides restricted access for administrators to add new exercises 
 * to the global library.
 */

package com.example.routes

import com.example.api.CreateExerciseRequest
import com.example.api.ExerciseDto
import com.example.auth.requireAdmin
import com.example.auth.requireUser
import com.example.db.dbQuery
import com.example.db.tables.Exercises
import com.example.util.UtcClock
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.like
import org.jetbrains.exposed.sql.andWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import java.util.UUID

fun Route.exerciseRoutes() {
    route("/exercises") {
        get {
            call.requireUser()
            val query = call.request.queryParameters["query"]?.trim()?.takeIf { it.isNotBlank() }
            val muscleGroup = call.request.queryParameters["muscleGroup"]?.trim()?.takeIf { it.isNotBlank() }
            val equipment = call.request.queryParameters["equipment"]?.trim()?.takeIf { it.isNotBlank() }

            val items = dbQuery {
                val q = Exercises.selectAll()
                if (query != null) q.andWhere { Exercises.name like "%$query%" }
                if (muscleGroup != null) q.andWhere { Exercises.muscleGroup eq muscleGroup }
                if (equipment != null) q.andWhere { Exercises.equipment eq equipment }

                q.limit(200).map {
                    ExerciseDto(
                        id = it[Exercises.id].toString(),
                        name = it[Exercises.name],
                        muscleGroup = it[Exercises.muscleGroup],
                        equipment = it[Exercises.equipment],
                        notes = it[Exercises.notes],
                        createdAt = it[Exercises.createdAt].toString(),
                    )
                }
            }

            call.respond(items)
        }

        get("/{id}") {
            call.requireUser()
            val id = call.parameters["id"]?.toUuidOrThrow("exerciseId") ?: throw IllegalArgumentException("Missing id")
            val dto = dbQuery {
                Exercises.selectAll().where { Exercises.id eq id }.singleOrNull()?.let {
                    ExerciseDto(
                        id = it[Exercises.id].toString(),
                        name = it[Exercises.name],
                        muscleGroup = it[Exercises.muscleGroup],
                        equipment = it[Exercises.equipment],
                        notes = it[Exercises.notes],
                        createdAt = it[Exercises.createdAt].toString(),
                    )
                }
            }
            if (dto == null) {
                call.respond(HttpStatusCode.NotFound)
                return@get
            }
            call.respond(dto)
        }

        post {
            call.requireAdmin()
            val req = call.receive<CreateExerciseRequest>()
            if (req.name.isBlank() || req.muscleGroup.isBlank()) throw IllegalArgumentException("name/muscleGroup required")

            val id = UUID.randomUUID()
            val now = UtcClock.now()
            dbQuery {
                Exercises.insert {
                    it[Exercises.id] = id
                    it[name] = req.name
                    it[muscleGroup] = req.muscleGroup
                    it[equipment] = req.equipment
                    it[notes] = req.notes
                    it[createdAt] = now
                }
            }
            call.respond(
                HttpStatusCode.Created,
                ExerciseDto(
                    id = id.toString(),
                    name = req.name,
                    muscleGroup = req.muscleGroup,
                    equipment = req.equipment,
                    notes = req.notes,
                    createdAt = now.toString(),
                ),
            )
        }
    }
}
