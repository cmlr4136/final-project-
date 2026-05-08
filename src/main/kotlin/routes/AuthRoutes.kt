/**
 * This file defines the API endpoints for user registration, login, and logout.
 * It manages user identity verification, password hashing for security.
 */

package com.example.routes

import com.example.api.AuthResponse
import com.example.api.LoginRequest
import com.example.api.RegisterRequest
import com.example.api.UserDto
import com.example.auth.TokenService
import com.example.auth.requireUser
import com.example.db.dbQuery
import com.example.db.tables.Users
import com.example.http.errors.ApiError
import com.example.security.PasswordHasher
import com.example.util.UtcClock
import io.ktor.http.*     
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import java.time.Duration
import java.util.UUID



fun Route.authRoutes() {
    route("/auth") {
        post("/register") {
            val req = call.receive<RegisterRequest>()
            if (req.email.isBlank() || req.password.isBlank() || req.displayName.isBlank()) {
                throw IllegalArgumentException("email/password/displayName required")
            }

            val userId = UUID.randomUUID()
            val now = UtcClock.now()
            val passwordHash = PasswordHasher.hash(req.password)

            val created = dbQuery {
                val exists = Users.select(Users.id).where { Users.email eq req.email }.limit(1).any()
                if (exists) return@dbQuery null

                Users.insert {
                    it[id] = userId
                    it[email] = req.email
                    it[Users.passwordHash] = passwordHash
                    it[displayName] = req.displayName
                    it[isAdmin] = false
                    it[createdAt] = now
                }
                true
            }

            if (created != true) {
                call.respond(HttpStatusCode.Conflict, ApiError("Email already exists"))
                return@post
            }

            val token = TokenService.issue(userId, tokenTtl(call.application.environment.config))
            val user = UserDto(
                id = userId.toString(),
                email = req.email,
                displayName = req.displayName,
                isAdmin = false,
                createdAt = now.toString(),
            )
            call.respond(AuthResponse(token = token, user = user))
        }

        post("/login") {
            val req = call.receive<LoginRequest>()
            if (req.email.isBlank() || req.password.isBlank()) {
                throw IllegalArgumentException("email/password required")
            }

            val result = dbQuery {
                Users.selectAll()
                    .where { Users.email eq req.email }
                    .singleOrNull()
            }

            if (result == null || !PasswordHasher.verify(req.password, result[Users.passwordHash])) {
                call.respond(HttpStatusCode.Unauthorized, ApiError("Invalid credentials"))
                return@post
            }

            val userId = result[Users.id]
            val token = TokenService.issue(userId, tokenTtl(call.application.environment.config))

            val user = UserDto(
                id = userId.toString(),
                email = result[Users.email],
                displayName = result[Users.displayName],
                isAdmin = result[Users.isAdmin],
                createdAt = result[Users.createdAt].toString(),
            )
            call.respond(AuthResponse(token = token, user = user))
        }

        post("/logout") {
            call.requireUser()
            val token = call.request.headers[HttpHeaders.Authorization]
                ?.trim()
                ?.removePrefix("Bearer ")
                ?.takeIf { it.isNotBlank() }

            if (token == null) {
                call.respond(HttpStatusCode.BadRequest, ApiError("Missing token"))
                return@post
            }

            TokenService.revoke(token)
            call.respond(HttpStatusCode.OK)
        }
    }
}

private fun tokenTtl(config: ApplicationConfig): Duration {
    val hours = config.propertyOrNull("auth.tokenTtlHours")?.getString()?.toLongOrNull() ?: 168L
    return Duration.ofHours(hours)
}
