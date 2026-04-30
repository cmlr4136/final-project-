/*
 * 这个文件做什么：应用入口与模块装配。
 * What this file is for: application entry point and module wiring.
 * 程序启动后，Ktor 先接管服务器启动，再调用 module()，而 module() 负责配置 HTTP、连接数据库、注册所有接口
 */

package com.example
//这个文件属于 com.example 这个命名空间。后面别的文件如果也写 package com.example,它们就在同一个包里。

import com.example.db.DatabaseFactory
//导入 DatabaseFactory 类可以使用 init()() 方法初始化数据库连接与建表。
import com.example.http.configureHttp
//导入 configureHttp 函数。它负责配置 HTTP 相关功能，比如 JSON 序列化、异常处理
import com.example.routes.configureRoutes
//导入 configureRoutes 这个函数。它负责注册所有接口路由，比如 /api/auth、/api/plans 这些。
import io.ktor.server.application.*
//导入 Ktor 应用程序相关的函数，比如 Application.module()。

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
    //启动 Ktor 应用程序。把启动过程交给 Ktor 的 Netty 引擎
}
//在之前的 application.yaml 中，我们声明了启动时要调用的模块是 com.example.ApplicationKt.module
//而 module() 函数就是这个模块，负责配置 HTTP、连接数据库、注册所有接口
fun Application.module() {
    configureHttp()
    //先配置 HTTP 层能力
    DatabaseFactory.init(environment.config)
    //初始化数据库连接与建表
    //environment：当前 Ktor 应用的运行环境，config：运行配置对象，里面有 application.yaml 里的内容
    //DatabaseFactory.init(...)：读取这些配置，连接数据库、建表、初始化种子数据
    configureRoutes()
    //注册所有路由。
    //也就是把各种接口挂到服务器上
}
