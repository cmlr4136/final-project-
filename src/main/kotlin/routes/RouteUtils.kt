/*
 This file is for small routing utilities (parameter parsing, etc.).
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

