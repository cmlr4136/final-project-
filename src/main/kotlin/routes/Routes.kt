/**
 * This file acts as the central hub for the application's URL structure. 
 * It installs the authentication middleware, defines the global "/api" 
 * prefix for all endpoints, and registers the individual routing modules 
 * for users, exercises, plans, workouts, and groups.
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
