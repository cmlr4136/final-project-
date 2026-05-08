package com.example

// 这个文件属于 com.example 这个命名空间
import com.example.db.DatabaseFactory
import com.example.http.configureHttp
import com.example.routes.configureRoutes
import io.ktor.server.application.*

// 启动 Ktor 应用程序。把启动过程交给 Ktor 的 Netty 引擎
fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

// 负责配置 HTTP、连接数据库、注册所有接口
fun Application.module() {
    // 先配置 HTTP 层能力
    configureHttp()
    
    // 初始化数据库连接与建表
    DatabaseFactory.init(environment.config)
    
    // 注册所有路由
    configureRoutes()
}