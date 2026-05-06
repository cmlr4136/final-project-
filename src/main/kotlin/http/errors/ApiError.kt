/*
 * 这个文件做什么：统一 API 错误响应结构。
 * What this file is for: a consistent error response shape.
 */

package com.example.http.errors

import kotlinx.serialization.Serializable

@Serializable
data class ApiError(
    val message: String,
)

