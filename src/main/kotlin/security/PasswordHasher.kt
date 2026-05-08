/*
 * This file is for demo-grade password hashing (not production-grade).
 */

package com.example.security

import java.security.MessageDigest
import java.security.SecureRandom

object PasswordHasher {
    private val random = SecureRandom()

    fun hash(password: String): String {
        val saltBytes = ByteArray(16)
        random.nextBytes(saltBytes)
        val saltHex = saltBytes.toHex()
        val hashHex = sha256("$saltHex:$password")
        return "$saltHex:$hashHex"
    }

    fun verify(password: String, stored: String): Boolean {
        val parts = stored.split(":", limit = 2)
        if (parts.size != 2) return false
        val saltHex = parts[0]
        val expected = parts[1]
        val actual = sha256("$saltHex:$password")
        return constantTimeEquals(expected, actual)
    }

    private fun sha256(input: String): String {
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray(Charsets.UTF_8))
        return bytes.toHex()
    }

    private fun constantTimeEquals(a: String, b: String): Boolean {
        if (a.length != b.length) return false
        var result = 0
        for (i in a.indices) {
            result = result or (a[i].code xor b[i].code)
        }
        return result == 0
    }
}

private fun ByteArray.toHex(): String {
    val sb = StringBuilder(size * 2)
    for (b in this) sb.append("%02x".format(b))
    return sb.toString()
}

