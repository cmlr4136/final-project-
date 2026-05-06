/*
 * 这个文件做什么：训练群组（简化版）API。
 * What this file is for: training groups (minimal) API.
 */

package com.example.routes

import com.example.api.CreateGroupRequest
import com.example.api.GroupMessageDto
import com.example.api.PostGroupMessageRequest
import com.example.api.TrainingGroupDto
import com.example.auth.requireAdmin
import com.example.auth.requireUser
import com.example.db.dbQuery
import com.example.db.tables.GroupMemberships
import com.example.db.tables.GroupMessages
import com.example.db.tables.TrainingGroups
import com.example.db.tables.Users
import com.example.util.UtcClock
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.inList
import org.jetbrains.exposed.sql.SqlExpressionBuilder.notInList
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.andWhere
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.insertIgnore
import org.jetbrains.exposed.sql.selectAll
import java.time.Instant
import java.util.UUID

fun Route.groupRoutes() {
    route("/groups") {
        get {
            call.requireUser()
            val groups = dbQuery {
                TrainingGroups.selectAll()
                    .where { TrainingGroups.isPublic eq true }
                    .orderBy(TrainingGroups.createdAt, SortOrder.DESC)
                    .limit(200)
                    .map {
                        TrainingGroupDto(
                            id = it[TrainingGroups.id].toString(),
                            name = it[TrainingGroups.name],
                            description = it[TrainingGroups.description],
                            isPublic = it[TrainingGroups.isPublic],
                            createdAt = it[TrainingGroups.createdAt].toString(),
                        )
                    }
            }
            call.respond(groups)
        }

        get("/my") {
            val user = call.requireUser()
            val groups = dbQuery {
                val myGroupIds = GroupMemberships.selectAll()
                    .where { GroupMemberships.userId eq user.id }
                    .limit(500)
                    .map { it[GroupMemberships.groupId] }

                if (myGroupIds.isEmpty()) {
                    emptyList()
                } else {
                    TrainingGroups.selectAll()
                        .where { TrainingGroups.id inList myGroupIds }
                        .orderBy(TrainingGroups.createdAt, SortOrder.DESC)
                        .limit(200)
                        .map {
                            TrainingGroupDto(
                                id = it[TrainingGroups.id].toString(),
                                name = it[TrainingGroups.name],
                                description = it[TrainingGroups.description],
                                isPublic = it[TrainingGroups.isPublic],
                                createdAt = it[TrainingGroups.createdAt].toString(),
                            )
                        }
                }
            }
            call.respond(groups)
        }

        get("/discover") {
            val user = call.requireUser()
            val groups = dbQuery {
                val myGroupIds = GroupMemberships.selectAll()
                    .where { GroupMemberships.userId eq user.id }
                    .limit(500)
                    .map { it[GroupMemberships.groupId] }

                val baseQuery = TrainingGroups.selectAll().where { TrainingGroups.isPublic eq true }
                val filteredQuery = if (myGroupIds.isEmpty()) baseQuery else baseQuery.andWhere { TrainingGroups.id notInList myGroupIds }

                filteredQuery
                    .orderBy(TrainingGroups.createdAt, SortOrder.DESC)
                    .limit(200)
                    .map {
                        TrainingGroupDto(
                            id = it[TrainingGroups.id].toString(),
                            name = it[TrainingGroups.name],
                            description = it[TrainingGroups.description],
                            isPublic = it[TrainingGroups.isPublic],
                            createdAt = it[TrainingGroups.createdAt].toString(),
                        )
                    }
            }
            call.respond(groups)
        }

        get("/{id}") {
            val user = call.requireUser()
            val groupId = call.parameters["id"]?.toUuidOrThrow("groupId") ?: throw IllegalArgumentException("Missing id")

            val group = dbQuery {
                val row = TrainingGroups.selectAll().where { TrainingGroups.id eq groupId }.singleOrNull() ?: return@dbQuery null
                val isMember = GroupMemberships.selectAll()
                    .where { (GroupMemberships.groupId eq groupId) and (GroupMemberships.userId eq user.id) }
                    .limit(1)
                    .any()

                val memberCount = GroupMemberships.selectAll()
                    .where { GroupMemberships.groupId eq groupId }
                    .count()
                    .toInt()

                if (!row[TrainingGroups.isPublic] && !isMember) {
                    return@dbQuery TrainingGroupAccess.Denied
                }

                TrainingGroupAccess.Allowed(
                    TrainingGroupDto(
                        id = row[TrainingGroups.id].toString(),
                        name = row[TrainingGroups.name],
                        description = row[TrainingGroups.description],
                        isPublic = row[TrainingGroups.isPublic],
                        createdAt = row[TrainingGroups.createdAt].toString(),
                        memberCount = memberCount,
                    ),
                )
            }

            when (group) {
                null -> call.respond(HttpStatusCode.NotFound)
                TrainingGroupAccess.Denied -> call.respond(HttpStatusCode.Forbidden)
                is TrainingGroupAccess.Allowed -> call.respond(group.dto)
            }
        }

        post {
            val admin = call.requireAdmin()
            val req = call.receive<CreateGroupRequest>()
            if (req.name.isBlank()) throw IllegalArgumentException("name required")

            val id = UUID.randomUUID()
            val now = UtcClock.now()
            dbQuery {
                TrainingGroups.insert {
                    it[TrainingGroups.id] = id
                    it[name] = req.name
                    it[description] = req.description
                    it[createdBy] = admin.id
                    it[isPublic] = req.isPublic
                    it[createdAt] = now
                }

                GroupMemberships.insert {
                    it[groupId] = id
                    it[userId] = admin.id
                    it[role] = "OWNER"
                    it[joinedAt] = now
                }
            }

            call.respond(
                HttpStatusCode.Created,
                TrainingGroupDto(
                    id = id.toString(),
                    name = req.name,
                    description = req.description,
                    isPublic = req.isPublic,
                    createdAt = now.toString(),
                ),
            )
        }

        post("/{id}/join") {
            val user = call.requireUser()
            val groupId = call.parameters["id"]?.toUuidOrThrow("groupId") ?: throw IllegalArgumentException("Missing id")

            dbQuery {
                TrainingGroups.selectAll().where { TrainingGroups.id eq groupId }.singleOrNull() ?: return@dbQuery
                GroupMemberships.insertIgnore {
                    it[GroupMemberships.groupId] = groupId
                    it[GroupMemberships.userId] = user.id
                    it[GroupMemberships.role] = "MEMBER"
                    it[GroupMemberships.joinedAt] = UtcClock.now()
                }
            }
            call.respond(HttpStatusCode.OK)
        }

        post("/{id}/leave") {
            val user = call.requireUser()
            val groupId = call.parameters["id"]?.toUuidOrThrow("groupId") ?: throw IllegalArgumentException("Missing id")
            dbQuery {
                GroupMemberships.deleteWhere { (GroupMemberships.groupId eq groupId) and (GroupMemberships.userId eq user.id) }
            }
            call.respond(HttpStatusCode.OK)
        }

        delete("/{id}") {
            call.requireAdmin()
            val groupId = call.parameters["id"]?.toUuidOrThrow("groupId") ?: throw IllegalArgumentException("Missing id")

            val deleted = dbQuery {
                val exists = TrainingGroups.selectAll()
                    .where { TrainingGroups.id eq groupId }
                    .limit(1)
                    .any()
                if (!exists) return@dbQuery false

                GroupMessages.deleteWhere { GroupMessages.groupId eq groupId }
                GroupMemberships.deleteWhere { GroupMemberships.groupId eq groupId }
                TrainingGroups.deleteWhere { TrainingGroups.id eq groupId }
                true
            }

            if (!deleted) {
                call.respond(HttpStatusCode.NotFound)
                return@delete
            }
            call.respond(HttpStatusCode.OK)
        }

        get("/{id}/messages") {
            val user = call.requireUser()
            val groupId = call.parameters["id"]?.toUuidOrThrow("groupId") ?: throw IllegalArgumentException("Missing id")
            val after = call.request.queryParameters["after"]?.let {
                runCatching { Instant.parse(it) }.getOrElse { throw IllegalArgumentException("Invalid 'after' timestamp") }
            }

            val isMember = dbQuery {
                GroupMemberships.selectAll()
                    .where { (GroupMemberships.groupId eq groupId) and (GroupMemberships.userId eq user.id) }
                    .limit(1)
                    .any()
            }
            if (!isMember) {
                call.respond(HttpStatusCode.Forbidden)
                return@get
            }

            val messages = dbQuery {
                GroupMessages
                    .join(Users, JoinType.INNER, onColumn = GroupMessages.userId, otherColumn = Users.id)
                    .selectAll()
                    .where { GroupMessages.groupId eq groupId }
                    .let { query ->
                        if (after == null) query else query.andWhere { GroupMessages.createdAt greaterEq after }
                    }
                    .orderBy(GroupMessages.createdAt, SortOrder.DESC)
                    .limit(100)
                    .map {
                        GroupMessageDto(
                            id = it[GroupMessages.id].toString(),
                            groupId = it[GroupMessages.groupId].toString(),
                            userId = it[GroupMessages.userId].toString(),
                            content = it[GroupMessages.content],
                            createdAt = it[GroupMessages.createdAt].toString(),
                            senderName = it[Users.displayName],
                        )
                    }
            }
            call.respond(messages)
        }

        post("/{id}/messages") {
            val user = call.requireUser()
            val groupId = call.parameters["id"]?.toUuidOrThrow("groupId") ?: throw IllegalArgumentException("Missing id")
            val req = call.receive<PostGroupMessageRequest>()
            if (req.content.isBlank()) throw IllegalArgumentException("content required")

            val created = dbQuery {
                val isMember = GroupMemberships.selectAll()
                    .where { (GroupMemberships.groupId eq groupId) and (GroupMemberships.userId eq user.id) }
                    .limit(1)
                    .any()
                if (!isMember) return@dbQuery null

                val id = UUID.randomUUID()
                val now = UtcClock.now()
                GroupMessages.insert {
                    it[GroupMessages.id] = id
                    it[GroupMessages.groupId] = groupId
                    it[GroupMessages.userId] = user.id
                    it[content] = req.content
                    it[createdAt] = now
                }

                GroupMessageDto(
                    id = id.toString(),
                    groupId = groupId.toString(),
                    userId = user.id.toString(),
                    content = req.content,
                    createdAt = now.toString(),
                    senderName = user.displayName,
                )
            }

            if (created == null) {
                call.respond(HttpStatusCode.Forbidden)
                return@post
            }
            call.respond(HttpStatusCode.Created, created)
        }
    }
}

private sealed interface TrainingGroupAccess {
    data object Denied : TrainingGroupAccess
    data class Allowed(val dto: TrainingGroupDto) : TrainingGroupAccess
}
