/*
 * 这个文件做什么：提供一个统一的数据库事务入口（协程安全）。
 * What this file is for: provide a single DB transaction helper (coroutine-friendly).
 */

package com.example.db

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction

suspend fun <T> dbQuery(block: suspend () -> T): T {
    return newSuspendedTransaction(Dispatchers.IO, DatabaseFactory.database) { block() }
}

