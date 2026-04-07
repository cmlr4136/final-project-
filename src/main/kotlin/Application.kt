/*
 * 这个文件做什么：应用入口与模块装配。
 * What this file is for: application entry point and module wiring.
 */

package com.example

import com.example.db.DatabaseFactory
import com.example.http.configureHttp
import com.example.routes.configureRoutes
import io.ktor.server.application.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureHttp()
    DatabaseFactory.init(environment.config)
    configureRoutes()
}
