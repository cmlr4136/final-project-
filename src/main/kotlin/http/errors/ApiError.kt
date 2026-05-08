/*
 * This file contains a consistent error response shape.
 */

package com.example.http.errors

import kotlinx.serialization.Serializable

@Serializable
data class ApiError(
    val message: String,
)

