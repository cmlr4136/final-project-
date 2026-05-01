/*
 * 这个文件做什么：训练计划 API（计划 CRUD + 条目管理）。
 * What this file is for: training plan API (CRUD + items).
 * 服务器内部顺序是：
请求进来
AuthPlugin 取出 token
查数据库，知道这个 token 属于用户 A
把用户 A 的信息临时挂到这次请求上
路由匹配到 /api/plans
这个接口里调用 call.requireUser()
成功拿到“用户 A”
用 user.id 去数据库查 TrainingPlans.userId = 用户A
把用户 A 自己的计划返回
 */

package com.example.routes

import com.example.api.AddPlanItemRequest
import com.example.api.CreatePlanRequest
import com.example.api.PlanItemDto
import com.example.api.TrainingPlanDto
import com.example.api.UpdatePlanRequest
import com.example.auth.requireUser
import com.example.db.dbQuery
import com.example.db.tables.PlanItems
import com.example.db.tables.TrainingPlans
import com.example.util.UtcClock
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.update
import java.util.UUID

fun Route.planRoutes() {
    route("/plans") {
        get {
            val user = call.requireUser()
            val plans = dbQuery {
                TrainingPlans.selectAll()
                    .where { TrainingPlans.userId eq user.id }
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

        get("/{id}/items") {
            val user = call.requireUser()
            val planId = call.parameters["id"]?.toUuidOrThrow("planId") ?: throw IllegalArgumentException("Missing id")

            val items = dbQuery {
                val own = TrainingPlans.selectAll().where { TrainingPlans.id eq planId and (TrainingPlans.userId eq user.id) }.limit(1).any()
                if (!own) return@dbQuery null

                PlanItems.selectAll()
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
            }

            if (items == null) {
                call.respond(HttpStatusCode.NotFound)
                return@get
            }
            call.respond(items)
        }

        post("/{id}/items") {
            val user = call.requireUser()
            val planId = call.parameters["id"]?.toUuidOrThrow("planId") ?: throw IllegalArgumentException("Missing id")
            val req = call.receive<AddPlanItemRequest>()
            val exerciseId = req.exerciseId.toUuidOrThrow("exerciseId")

            val created = dbQuery {
                val own = TrainingPlans.selectAll().where { TrainingPlans.id eq planId and (TrainingPlans.userId eq user.id) }.limit(1).any()
                if (!own) return@dbQuery null

                val id = UUID.randomUUID()
                PlanItems.insert {
                    it[PlanItems.id] = id
                    it[PlanItems.planId] = planId
                    it[PlanItems.exerciseId] = exerciseId
                    it[targetSets] = req.targetSets
                    it[targetReps] = req.targetReps
                    it[targetWeight] = req.targetWeight
                    it[targetDurationSec] = req.targetDurationSec
                }

                PlanItemDto(
                    id = id.toString(),
                    planId = planId.toString(),
                    exerciseId = exerciseId.toString(),
                    targetSets = req.targetSets,
                    targetReps = req.targetReps,
                    targetWeight = req.targetWeight,
                    targetDurationSec = req.targetDurationSec,
                )
            }

            if (created == null) {
                call.respond(HttpStatusCode.NotFound)
                return@post
            }
            call.respond(HttpStatusCode.Created, created)
        }
    }

    route("/plan-items") {
        delete("/{id}") {
            val user = call.requireUser()
            val itemId = call.parameters["id"]?.toUuidOrThrow("planItemId") ?: throw IllegalArgumentException("Missing id")

            val deleted = dbQuery {
                val item = PlanItems.selectAll().where { PlanItems.id eq itemId }.singleOrNull() ?: return@dbQuery 0
                val planId = item[PlanItems.planId]
                val own = TrainingPlans.selectAll().where { TrainingPlans.id eq planId and (TrainingPlans.userId eq user.id) }.limit(1).any()
                if (!own) return@dbQuery 0
                PlanItems.deleteWhere { PlanItems.id eq itemId }
            }

            if (deleted == 0) {
                call.respond(HttpStatusCode.NotFound)
                return@delete
            }
            call.respond(HttpStatusCode.OK)
        }
    }
}
