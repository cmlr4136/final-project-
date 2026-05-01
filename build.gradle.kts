/*
 * 这个文件是Gradle 构建配置文件，意思是在项目启动的一开始Gradle会先读这个文件查看要怎么设置整个项目
 * 声明后端使用的插件、依赖、Java/Kotlin 版本以及启动方式
 * 运行项目时，Gradle 会先读取这里的配置，准备好 Ktor、Netty、数据库、JSON 序列化等运行环境
 * 通过 io.ktor.server.netty.EngineMain 启动服务器，再去加载 application.yaml 和 Application.module()
 * 读完这个文件后再去读 application.yaml
 */
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktor)
    alias(libs.plugins.kotlin.plugin.serialization)
}

group = "com.example"
version = "0.0.1"

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.postgresql)
    implementation(libs.h2)
    implementation(libs.exposed.core)
    implementation(libs.exposed.jdbc)
    implementation(libs.exposed.javatime)
    implementation(libs.ktor.server.host.common)
    implementation(libs.ktor.server.status.pages)
    implementation(libs.ktor.server.netty)
    implementation(libs.logback.classic)
    implementation(libs.ktor.server.config.yaml)
    testImplementation(libs.ktor.server.test.host)
    testImplementation(libs.kotlin.test.junit)
}
