/*
 * 这个文件做什么：生成/存储/撤销登录 token（简化版）。
 * This file manages the lifecycle of the login session 
 * by interracting with the authtokens table in the database
 */

package com.example.auth

import com.example.db.dbQuery
import com.example.db.tables.AuthTokens
import com.example.util.UtcClock
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import java.security.SecureRandom
import java.time.Duration
import java.util.UUID

object TokenService {
    private val random = SecureRandom()

    suspend fun issue(userId: UUID, ttl: Duration): String {
        val token = randomToken()
        val now = UtcClock.now()
        val expiresAt = now.plus(ttl)

        dbQuery {
            AuthTokens.insert {
                it[AuthTokens.token] = token
                it[AuthTokens.userId] = userId
                it[AuthTokens.createdAt] = now
                it[AuthTokens.expiresAt] = expiresAt
            }
        }
        return token
    }

    suspend fun revoke(token: String) {
        dbQuery {
            AuthTokens.deleteWhere { AuthTokens.token eq token }
        }
    }

    private fun randomToken(): String {
        val bytes = ByteArray(32)
        random.nextBytes(bytes)
        return bytes.joinToString("") { "%02x".format(it) }
    }
}
