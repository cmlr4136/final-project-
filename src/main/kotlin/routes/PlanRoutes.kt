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
                    .map {
                        TrainingPlanDto(
                            id = it[TrainingPlans.id].toString(),
                            name = it[TrainingPlans.name],
                            goal = it[TrainingPlans.goal],
                            createdAt = it[TrainingPlans.createdAt].toString()
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