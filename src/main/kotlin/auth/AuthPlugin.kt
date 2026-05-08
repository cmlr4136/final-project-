/* * This file handles user authentication and session validation. 
 * It extracts Bearer tokens from request headers to identify the user 
 * and provides helper methods to enforce access control across the API.
 */
package com.example.auth

import com.example.db.dbQuery
import com.example.db.tables.AuthTokens
import com.example.db.tables.Users
import com.example.util.UtcClock
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.util.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greater
import org.jetbrains.exposed.sql.select
import java.util.UUID

data class AuthUser(
    val id: UUID,
    val email: String,
    val displayName: String,
    val isAdmin: Boolean,
)

class UnauthorizedException : RuntimeException("Unauthorized")

class ForbiddenException(message: String = "Forbidden") : RuntimeException(message)

private val AuthUserKey = AttributeKey<AuthUser>("auth-user")

val AuthPlugin = createApplicationPlugin(name = "AuthPlugin") {
    onCall { call ->
        val token = call.request.headers[HttpHeaders.Authorization]
            ?.trim()
            ?.removePrefix("Bearer ")
            ?.takeIf { it.isNotBlank() }
            ?: return@onCall

        val user = dbQuery {
            val now = UtcClock.now()
            val tokenRow = AuthTokens.select(AuthTokens.userId)
                .where { (AuthTokens.token eq token) and (AuthTokens.expiresAt greater now) }
                .singleOrNull()
                ?: return@dbQuery null

            Users.select(Users.id, Users.email, Users.displayName, Users.isAdmin)
                .where { Users.id eq tokenRow[AuthTokens.userId] }
                .singleOrNull()
                ?.let {
                    AuthUser(
                        id = it[Users.id],
                        email = it[Users.email],
                        displayName = it[Users.displayName],
                        isAdmin = it[Users.isAdmin],
                    )
                }
        }

        if (user != null) {
            call.attributes.put(AuthUserKey, user)
        }
    }
}

suspend fun ApplicationCall.requireUser(): AuthUser {
    return attributes.getOrNull(AuthUserKey)
        ?: throw UnauthorizedException()
}

suspend fun ApplicationCall.requireAdmin(): AuthUser {
    val user = requireUser()
    if (!user.isAdmin) {
        throw ForbiddenException("Admin only")
    }
    return user
}
