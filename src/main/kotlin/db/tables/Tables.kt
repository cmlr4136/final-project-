/*
 * This file defines the physical structure of the tables where data will be stored 
 */

package com.example.db.tables

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp

object Users : Table("users") {
    val id = uuid("id")
    val email = varchar("email", 255).uniqueIndex()
    val passwordHash = varchar("password_hash", 255)
    val displayName = varchar("display_name", 100)
    val isAdmin = bool("is_admin").default(false)
    val createdAt = timestamp("created_at")
    override val primaryKey = PrimaryKey(id)
}

object Exercises : Table("exercises") {
    val id = uuid("id")
    val name = varchar("name", 120)
    val muscleGroup = varchar("muscle_group", 60)
    val equipment = varchar("equipment", 60).nullable()
    val notes = varchar("notes", 2000).nullable()
    val createdAt = timestamp("created_at")
    override val primaryKey = PrimaryKey(id)
    init {
        index(isUnique = false, columns = arrayOf(name))
    }
}

object TrainingPlans : Table("training_plans") {
    val id = uuid("id")
    val userId = uuid("user_id")
    val name = varchar("name", 120)
    val goal = varchar("goal", 500).nullable()
    val createdAt = timestamp("created_at")
    override val primaryKey = PrimaryKey(id)
    init {
        index(isUnique = false, columns = arrayOf(userId))
    }
}

object PlanItems : Table("plan_items") {
    val id = uuid("id")
    val planId = uuid("plan_id")
    val exerciseId = uuid("exercise_id")
    val targetSets = integer("target_sets").nullable()
    val targetReps = integer("target_reps").nullable()
    val targetWeight = double("target_weight").nullable()
    val targetDurationSec = integer("target_duration_sec").nullable()
    override val primaryKey = PrimaryKey(id)
    init {
        index(isUnique = false, columns = arrayOf(planId))
        index(isUnique = false, columns = arrayOf(exerciseId))
    }
}

object WorkoutSessions : Table("workout_sessions") {
    val id = uuid("id")
    val userId = uuid("user_id")
    val planId = uuid("plan_id").nullable()
    val startedAt = timestamp("started_at")
    val endedAt = timestamp("ended_at").nullable()
    val notes = varchar("notes", 2000).nullable()
    override val primaryKey = PrimaryKey(id)
    init {
        index(isUnique = false, columns = arrayOf(userId, startedAt))
    }
}

object SetEntries : Table("set_entries") {
    val id = uuid("id")
    val sessionId = uuid("session_id")
    val exerciseId = uuid("exercise_id")
    val setIndex = integer("set_index")
    val reps = integer("reps").nullable()
    val weight = double("weight").nullable()
    val durationSec = integer("duration_sec").nullable()
    override val primaryKey = PrimaryKey(id)
    init {
        index(isUnique = false, columns = arrayOf(sessionId))
    }
}

object TrainingGroups : Table("training_groups") {
    val id = uuid("id")
    val name = varchar("name", 120)
    val description = varchar("description", 2000).nullable()
    val createdBy = uuid("created_by")
    val isPublic = bool("is_public").default(true)
    val createdAt = timestamp("created_at")
    override val primaryKey = PrimaryKey(id)
    init {
        index(isUnique = false, columns = arrayOf(isPublic))
    }
}

object GroupMemberships : Table("group_memberships") {
    val groupId = uuid("group_id")
    val userId = uuid("user_id")
    val role = varchar("role", 20).default("MEMBER")
    val joinedAt = timestamp("joined_at")
    override val primaryKey = PrimaryKey(groupId, userId)
    init {
        index(isUnique = false, columns = arrayOf(userId))
    }
}

object GroupMessages : Table("group_messages") {
    val id = uuid("id")
    val groupId = uuid("group_id")
    val userId = uuid("user_id")
    val content = varchar("content", 2000)
    val createdAt = timestamp("created_at")
    override val primaryKey = PrimaryKey(id)
    init {
        index(isUnique = false, columns = arrayOf(groupId, createdAt))
    }
}

object AuthTokens : Table("auth_tokens") {
    val token = varchar("token", 64)
    val userId = uuid("user_id")
    val createdAt = timestamp("created_at")
    val expiresAt = timestamp("expires_at")
    override val primaryKey = PrimaryKey(token)
    init {
        index(isUnique = false, columns = arrayOf(userId))
    }
}
