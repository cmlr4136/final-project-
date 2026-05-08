/*
 * 这个文件做什么：定义对外 API 的请求/响应数据结构（DTO）。
 * What this file is for: define request/response DTOs for the public API.
 * Defines request formats and Response formats
 */

package com.example.api

import kotlinx.serialization.Serializable

@Serializable
data class UserDto(
    val id: String,
    val email: String,
    val displayName: String,
    val isAdmin: Boolean,
    val createdAt: String,
    val exercises: List<PlanItemDto> = listOf()
)

@Serializable
data class AuthResponse(
    val token: String,
    val user: UserDto,
)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    val displayName: String,
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
)

@Serializable
data class ExerciseDto(
    val id: String,
    val name: String,
    val muscleGroup: String,
    val equipment: String? = null,
    val notes: String? = null,
    val createdAt: String,
)

@Serializable
data class CreateExerciseRequest(
    val name: String,
    val muscleGroup: String,
    val equipment: String? = null,
    val notes: String? = null,
)

@Serializable
data class TrainingPlanDto(
    val id: String,
    val name: String,
    val goal: String?,
    val createdAt: String,
    val exercises: List<PlanItemDto> = listOf() 
)

@Serializable
data class CreatePlanRequest(
    val name: String,
    val goal: String? = null,
)

@Serializable
data class UpdatePlanRequest(
    val name: String,
    val goal: String? = null,
)

@Serializable
data class PlanItemDto(
    val id: String,
    val planId: String,
    val exerciseId: String,
    val targetSets: Int? = null,
    val targetReps: Int? = null,
    val targetWeight: Double? = null,
    val targetDurationSec: Int? = null,
)

@Serializable
data class AddPlanItemRequest(
    val exerciseId: String,
    val targetSets: Int? = null,
    val targetReps: Int? = null,
    val targetWeight: Double? = null,
    val targetDurationSec: Int? = null,
)

@Serializable
data class WorkoutSessionDto(
    val id: String,
    val planId: String? = null,
    val startedAt: String,
    val endedAt: String? = null,
    val notes: String? = null,
)

@Serializable
data class CreateWorkoutSessionRequest(
    val planId: String? = null,
    val notes: String? = null,
)

@Serializable
data class SetEntryDto(
    val id: String,
    val sessionId: String,
    val exerciseId: String,
    val setIndex: Int,
    val reps: Int? = null,
    val weight: Double? = null,
    val durationSec: Int? = null,
)

@Serializable
data class AddSetEntryRequest(
    val exerciseId: String,
    val setIndex: Int,
    val reps: Int? = null,
    val weight: Double? = null,
    val durationSec: Int? = null,
)

@Serializable
data class UpdateSetEntryRequest(
    val reps: Int? = null,
    val weight: Double? = null,
    val durationSec: Int? = null,
)

@Serializable
data class TrainingGroupDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val isPublic: Boolean,
    val createdAt: String,
    val memberCount: Int? = null,
)

@Serializable
data class CreateGroupRequest(
    val name: String,
    val description: String? = null,
    val isPublic: Boolean = true,
)

@Serializable
data class GroupMessageDto(
    val id: String,
    val groupId: String,
    val userId: String,
    val content: String,
    val createdAt: String,
    val senderName: String? = null,
)

@Serializable
data class PostGroupMessageRequest(
    val content: String,
)

