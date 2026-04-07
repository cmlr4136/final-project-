/*
 * 这个文件做什么：初始化数据库连接与建表（H2 + Exposed）。
 * What this file is for: initialize DB connection and create tables (H2 + Exposed).
 */

package com.example.db

import com.example.db.tables.AuthTokens
import com.example.db.tables.Exercises
import com.example.db.tables.GroupMemberships
import com.example.db.tables.GroupMessages
import com.example.db.tables.PlanItems
import com.example.db.tables.SetEntries
import com.example.db.tables.TrainingGroups
import com.example.db.tables.TrainingPlans
import com.example.db.tables.Users
import com.example.db.tables.WorkoutSessions
import com.example.security.PasswordHasher
import com.example.util.UtcClock
import io.ktor.server.config.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

object DatabaseFactory {
    lateinit var database: Database
        private set

    fun init(config: ApplicationConfig) {
        val url = config.propertyOrNull("db.url")?.getString()
            ?: "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE"
        val driver = config.propertyOrNull("db.driver")?.getString() ?: "org.h2.Driver"
        val user = config.propertyOrNull("db.user")?.getString() ?: "sa"
        val password = config.propertyOrNull("db.password")?.getString() ?: ""

        database = Database.connect(url = url, driver = driver, user = user, password = password)

        transaction(database) {
            SchemaUtils.createMissingTablesAndColumns(
                Users,
                Exercises,
                TrainingPlans,
                PlanItems,
                WorkoutSessions,
                SetEntries,
                TrainingGroups,
                GroupMemberships,
                GroupMessages,
                AuthTokens,
            )
        }

        seedAdminIfMissing(config)
        seedExercisesIfEmpty()
    }

    private fun seedAdminIfMissing(config: ApplicationConfig) {
        val email = config.propertyOrNull("seed.adminEmail")?.getString() ?: "admin@example.com"
        val password = config.propertyOrNull("seed.adminPassword")?.getString() ?: "admin"

        transaction(database) {
            val exists = Users.select(Users.id).where { Users.email eq email }.limit(1).any()
            if (exists) return@transaction

            val passwordHash = PasswordHasher.hash(password)
            Users.insert {
                it[id] = UUID.randomUUID()
                it[Users.email] = email
                it[Users.passwordHash] = passwordHash
                it[displayName] = "Admin"
                it[isAdmin] = true
                it[createdAt] = UtcClock.now()
            }
        }
    }

    private fun seedExercisesIfEmpty() {
        transaction(database) {
            val exists = Exercises.select(Exercises.id).limit(1).any()
            if (exists) return@transaction

            val now = UtcClock.now()
            val rows = listOf(
                Triple("Walking", "Cardio", "None"),
                Triple("Running", "Cardio", "None"),
                Triple("Swimming", "Cardio", "Pool"),
                Triple("Cycling", "Cardio", "Bike"),
                Triple("Bench Press", "Chest", "Barbell"),
                Triple("Squat", "Legs", "Barbell"),
            )

            rows.forEach { (name, muscle, equipment) ->
                Exercises.insert {
                    it[id] = UUID.randomUUID()
                    it[Exercises.name] = name
                    it[muscleGroup] = muscle
                    it[Exercises.equipment] = equipment
                    it[notes] = null
                    it[createdAt] = now
                }
            }
        }
    }
}
