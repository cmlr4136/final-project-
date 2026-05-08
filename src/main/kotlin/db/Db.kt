/**
 * Database Transaction Helper
 * This file provides a coroutine-safe wrapper for all database operations.
 * It ensures that database queries run on a background IO thread and 
 * manages SQL transactions to maintain data integrity and server performance.
 */

package com.example.db

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction

suspend fun <T> dbQuery(block: suspend () -> T): T {
    return newSuspendedTransaction(Dispatchers.IO, DatabaseFactory.database) { block() }
}

