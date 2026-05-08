/*
 * This file is for centralized UTC time helper for consistency.
 */

package com.example.util

import java.time.Instant

object UtcClock {
    fun now(): Instant = Instant.now()
}

