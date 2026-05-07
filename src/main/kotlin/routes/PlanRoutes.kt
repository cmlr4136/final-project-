package com.example.routes

import com.example.api.*
import com.example.auth.requireUser
import com.example.db.dbQuery
import com.example.db.tables.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import java.util.*

fun Route.planRoutes() {
    route("/plans") {
        
        // 1. GET ALL PLANS
        get {
            val user = call.requireUser()
            val plans = dbQuery {
                TrainingPlans.selectAll()
                    .where { TrainingPlans.userId eq user.id }
<<<<<<< HEAD
=======
                    .orderBy(TrainingPlans.createdAt, org.jetbrains.exposed.sql.SortOrder.DESC)
                    .map {
                        TrainingPlanDto(
                            id = it[TrainingPlans.id].toString(),
                            name = it[TrainingPlans.name],
                            goal = it[TrainingPlans.goal],
                            createdAt = it[TrainingPlans.createdAt].toString(),
                        )
                    }
            }
            call.respond(plans)
        }

        post {
            val user = call.requireUser()
            val req = call.receive<CreatePlanRequest>()
            if (req.name.isBlank()) throw IllegalArgumentException("name required")

            val id = UUID.randomUUID()
            val now = UtcClock.now()
            dbQuery {
                TrainingPlans.insert {
                    it[TrainingPlans.id] = id
                    it[userId] = user.id
                    it[name] = req.name
                    it[goal] = req.goal
                    it[createdAt] = now
                }
            }

            call.respond(
                HttpStatusCode.Created,
                TrainingPlanDto(id = id.toString(), name = req.name, goal = req.goal, createdAt = now.toString()),
            )
        }

        put("/{id}") {
            val user = call.requireUser()
            val planId = call.parameters["id"]?.toUuidOrThrow("planId") ?: throw IllegalArgumentException("Missing id")
            val req = call.receive<UpdatePlanRequest>()
            if (req.name.isBlank()) throw IllegalArgumentException("name required")

            val updated = dbQuery {
                TrainingPlans.update({ TrainingPlans.id eq planId and (TrainingPlans.userId eq user.id) }) {
                    it[name] = req.name
                    it[goal] = req.goal
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
            val planId = call.parameters["id"]?.toUuidOrThrow("planId") ?: throw IllegalArgumentException("Missing id")
            val deleted = dbQuery {
                TrainingPlans.deleteWhere { TrainingPlans.id eq planId and (TrainingPlans.userId eq user.id) }
            }
            if (deleted == 0) {
                call.respond(HttpStatusCode.NotFound)
                return@delete
            }
            call.respond(HttpStatusCode.OK)
        }

        get("/{id}") {
            val user = call.requireUser()
            val planId = call.parameters["id"]?.toUuidOrThrow("planId") 
                ?: throw IllegalArgumentException("Missing id")

            val plan = dbQuery {
                // 1. FIRST, fetch all the exercise items for this plan!
                val items = PlanItems.selectAll()
                    .where { PlanItems.planId eq planId }
                    .map {
                        PlanItemDto(
                            id = it[PlanItems.id].toString(),
                            planId = it[PlanItems.planId].toString(),
                            exerciseId = it[PlanItems.exerciseId].toString(),
                            targetSets = it[PlanItems.targetSets],
                            targetReps = it[PlanItems.targetReps],
                            targetWeight = it[PlanItems.targetWeight],
                            targetDurationSec = it[PlanItems.targetDurationSec],
                        )
                    }

                // 2. THEN, fetch the plan and attach the items we just found!
                TrainingPlans.selectAll()
                    .where { TrainingPlans.id eq planId and (TrainingPlans.userId eq user.id) }
>>>>>>> 9b208e04fd50e9ca372c353866b8c742605ab030
                    .map {
                        TrainingPlanDto(
                            id = it[TrainingPlans.id].toString(),
                            name = it[TrainingPlans.name],
                            goal = it[TrainingPlans.goal],
                            createdAt = it[TrainingPlans.createdAt].toString(),
                            exercises = items // <--- Attach them here!
                        )
                    }
            }
            call.respond(plans)
        }

        // 2. GET SINGLE PLAN (The one we fixed for exercises)
        get("/{id}") {
            val user = call.requireUser()
            val idParam = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
            val uuidId = try { UUID.fromString(idParam) } catch (e: Exception) {
                return@get call.respond(HttpStatusCode.BadRequest, "Invalid ID format")
            }

            val planWithExercises = dbQuery {
                val planRow = TrainingPlans.selectAll()
                    .where { TrainingPlans.id eq uuidId and (TrainingPlans.userId eq user.id) }
                    .singleOrNull() ?: return@dbQuery null

                val exerciseRows = PlanItems.selectAll()
                    .where { PlanItems.planId eq uuidId }
                    .map {
                        PlanItemDto(
                            id = it[PlanItems.id].toString(),
                            planId = it[PlanItems.planId].toString(),
                            exerciseId = it[PlanItems.exerciseId].toString(),
                            targetSets = it[PlanItems.targetSets],
                            targetReps = it[PlanItems.targetReps],
                            targetWeight = it[PlanItems.targetWeight],
                            targetDurationSec = it[PlanItems.targetDurationSec]
                        )
                    }

                TrainingPlanDto(
                    id = planRow[TrainingPlans.id].toString(),
                    name = planRow[TrainingPlans.name],
                    goal = planRow[TrainingPlans.goal],
                    createdAt = planRow[TrainingPlans.createdAt].toString(),
                    exercises = exerciseRows
                )
            }

            if (planWithExercises == null) {
                call.respond(HttpStatusCode.NotFound)
            } else {
                call.respond(planWithExercises)
            }
        }

        // 3. POST NEW PLAN
        post {
            val user = call.requireUser()
            val dto = call.receive<TrainingPlanDto>()
            val newId = dbQuery {
                TrainingPlans.insert {
                    it[id] = UUID.randomUUID()
                    it[userId] = user.id
                    it[name] = dto.name
                    it[goal] = dto.goal
                }[TrainingPlans.id]
            }
            call.respond(HttpStatusCode.Created, mapOf("id" to newId.toString()))
        }

        // 4. DELETE PLAN
        delete("/{id}") {
            val user = call.requireUser()
            val idParam = call.parameters["id"] ?: return@delete call.respond(HttpStatusCode.BadRequest)
            val uuidId = UUID.fromString(idParam)
            
            dbQuery {
                TrainingPlans.deleteWhere { TrainingPlans.id eq uuidId and (userId eq user.id) }
            }
            call.respond(HttpStatusCode.OK, "Deleted")
        }
    }
}