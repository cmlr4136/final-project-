/*
 * What this file is for: configure HTTP features (JSON, error handling, etc.).
 */

package com.example.http

import com.example.auth.ForbiddenException
import com.example.auth.UnauthorizedException
import com.example.http.errors.ApiError
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import kotlinx.serialization.json.Json

fun Application.configureHttp() {
    //配置 CORS 允许前端访问后端，从而可以跨域请求，这是因为我们用的前端是 React + Vite，后端是 Ktor + Netty，
    //前端开发服务器跑在 localhost:5173，后端跑在 localhost:8080，两者不是同源，所以浏览器跨域访问时需要后端配置 CORS所以要想跨域请求，
    //浏览器发现前端和后端不是同一个源（origin），所以会触发同源策略，需要后端明确允许跨域
    install(CORS) {
        allowHost("localhost:5173", schemes = listOf("http", "https"))
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
    }
    //告诉后端如何处理 JSON 格式的请求体和响应体，以及如何解析和序列化 JSON 数据
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = false//返回的 JSON 不做漂亮缩进
                isLenient = true//解析 JSON 时稍微宽松一点，允许 JSON 中有额外的字段或值
                ignoreUnknownKeys = true//忽略 JSON 中的未知字段，只解析已知的字段
            },
        )
    }
//后端不会因为 extra 多出来就炸掉
//下面是错误处理
    install(StatusPages) {
        exception<UnauthorizedException> { call, _ ->
            call.respond(HttpStatusCode.Unauthorized, ApiError(message = "Unauthorized"))
        }
        exception<ForbiddenException> { call, cause ->
            call.respond(HttpStatusCode.Forbidden, ApiError(message = cause.message ?: "Forbidden"))
        }
        exception<IllegalArgumentException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, ApiError(message = cause.message ?: "Bad request"))
        }//第一种错误，请求体格式错误，也就是前端发送的 JSON 格式有误
        exception<Throwable> { call, cause ->
            call.application.log.error("Unhandled error", cause)
            call.respond(HttpStatusCode.InternalServerError, ApiError(message = "Internal server error"))
        }//如果出现别的没处理的异常
    }
}
