/*
 * 这个文件做什么：前端用到的最小 API 类型定义（与后端 DTO 对应）。
 * What this file is for: minimal API type definitions on frontend (mirrors backend DTOs).
 */

export type UserDto = {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: UserDto;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ExerciseDto = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type TrainingPlanDto = {
  id: string;
  name: string;
  goal?: string | null;
  createdAt: string;
  exercises?: PlanItemDto[];
};

export type WorkoutSessionDto = {
  id: string;
  planId?: string | null;
  startedAt: string;
  endedAt?: string | null;
  notes?: string | null;
};

export type TrainingGroupDto = {
  id: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  createdAt: string;
  memberCount?: number;
};

export type GroupMessageDto = {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  createdAt: string;
  senderName?: string;
};
export interface AddPlanItemRequest {
  exerciseId: string;
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
  targetDurationSec?: number;
}

export interface PlanItemDto {
  id: string;
  planId: string;
  exerciseId: string;
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
  targetDurationSec?: number;
}
