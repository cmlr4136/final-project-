/*
 * 这个文件做什么：端到端的 API 冒烟测试，确保核心流程能跑通。
 * What this file is for: end-to-end API smoke tests to ensure core flows work.
 */

package com.example

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

class ApplicationTest {

    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun testRoot() = testApplication {
        application { module() }
        client.get("/").apply {
            assertEquals(HttpStatusCode.OK, status)
        }
    }

    @Test
    fun testRegisterPlanWorkoutFlow() = testApplication {
        application { module() }

        val email = "u1@example.com"
        val token = register(email = email, password = "pass123", displayName = "User1")

        val planId = client.post("/api/plans") {
            bearer(token)
            contentType(ContentType.Application.Json)
            setBody("""{"name":"10K Base","goal":"Run 10K"}""")
        }.also { assertEquals(HttpStatusCode.Created, it.status) }
            .bodyAsJson()["id"]?.jsonPrimitive?.content
        assertNotNull(planId)

        client.get("/api/plans") {
            bearer(token)
        }.also { assertEquals(HttpStatusCode.OK, it.status) }

        val sessionId = client.post("/api/workout-sessions") {
            bearer(token)
            contentType(ContentType.Application.Json)
            setBody("""{"planId":"$planId","notes":"easy run"}""")
        }.also { assertEquals(HttpStatusCode.Created, it.status) }
            .bodyAsJson()["id"]?.jsonPrimitive?.content
        assertNotNull(sessionId)

        val exerciseId = firstExerciseId(token)
        client.post("/api/workout-sessions/$sessionId/sets") {
            bearer(token)
            contentType(ContentType.Application.Json)
            setBody("""{"exerciseId":"$exerciseId","setIndex":1,"durationSec":1800}""")
        }.also { assertEquals(HttpStatusCode.Created, it.status) }
    }

    @Test
    fun testAdminCanCreateGroupUserCanJoinAndPost() = testApplication {
        application { module() }

        val adminToken = login(email = "admin@example.com", password = "admin")
        val userToken = register(email = "u2@example.com", password = "pass123", displayName = "User2")

        val groupId = client.post("/api/groups") {
            bearer(adminToken)
            contentType(ContentType.Application.Json)
            setBody("""{"name":"10K Runners","description":"For 10K training","isPublic":true}""")
        }.also { assertEquals(HttpStatusCode.Created, it.status) }
            .bodyAsJson()["id"]?.jsonPrimitive?.content
        assertNotNull(groupId)

        client.post("/api/groups/$groupId/join") {
            bearer(userToken)
        }.also { assertEquals(HttpStatusCode.OK, it.status) }

        client.post("/api/groups/$groupId/messages") {
            bearer(userToken)
            contentType(ContentType.Application.Json)
            setBody("""{"content":"Hi everyone"}""")
        }.also { assertEquals(HttpStatusCode.Created, it.status) }
    }

    private suspend fun ApplicationTestBuilder.register(email: String, password: String, displayName: String): String {
        val res = client.post("/api/auth/register") {
            contentType(ContentType.Application.Json)
            setBody("""{"email":"$email","password":"$password","displayName":"$displayName"}""")
        }
        assertEquals(HttpStatusCode.OK, res.status)
        return res.bodyAsJson()["token"]!!.jsonPrimitive.content
    }

    private suspend fun ApplicationTestBuilder.login(email: String, password: String): String {
        val res = client.post("/api/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"email":"$email","password":"$password"}""")
        }
        assertEquals(HttpStatusCode.OK, res.status)
        return res.bodyAsJson()["token"]!!.jsonPrimitive.content
    }

    private suspend fun ApplicationTestBuilder.firstExerciseId(token: String): String {
        val res = client.get("/api/exercises") { bearer(token) }
        assertEquals(HttpStatusCode.OK, res.status)
        val arr = json.parseToJsonElement(res.bodyAsText()).jsonArray
        return arr.first().jsonObject["id"]!!.jsonPrimitive.content
    }

    private fun HttpRequestBuilder.bearer(token: String) {
        header(HttpHeaders.Authorization, "Bearer $token")
    }

    private suspend fun HttpResponse.bodyAsJson() = json.parseToJsonElement(bodyAsText()).jsonObject
}
