/*
 * 这个文件做什么：注册所有 HTTP 路由（/api/...）。
 * What this file is for: register all HTTP routes (/api/...).
 * 给所有路径添加前缀 "/api"
 * 检查请求的内容是否包含 JSON 格式的数据
 */

package com.example.routes

import com.example.auth.AuthPlugin
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRoutes() {
    install(AuthPlugin)

    routing {
        get("/") { call.respondText("OK") }
        staticResources("/static", "static")

        route("/api") {
            authRoutes()
            exerciseRoutes()
            planRoutes()
            workoutRoutes()
            groupRoutes()
        }
    }
}
