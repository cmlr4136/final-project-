/*
 * 这个文件做什么：路由层常用的小工具（参数解析等）。
 * What this file is for: small routing utilities (parameter parsing, etc.).
 */

package com.example.routes

import java.util.UUID

fun String.toUuidOrThrow(fieldName: String): UUID {
    return try {
        UUID.fromString(this)
    } catch (_: IllegalArgumentException) {
        throw IllegalArgumentException("Invalid $fieldName")
    }
}

