/*
 * 这个文件做什么：统一获取 UTC 时间，方便测试与一致性。
 * What this file is for: centralized UTC time helper for consistency.
 */

package com.example.util

import java.time.Instant

object UtcClock {
    fun now(): Instant = Instant.now()
}

