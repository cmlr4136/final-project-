/*
 * 这个文件做什么：按业务封装的 API 方法（占位，后续可扩展）。
 * What this file is for: domain-level API functions (stub, extend later).
 */

import { apiClient } from "@/api/client";
import type {
  AuthResponse,
  ExerciseDto,
  LoginRequest,
  RegisterRequest,
  TrainingGroupDto,
  TrainingPlanDto,
  WorkoutSessionDto,
} from "@/api/types";

export const fitnessApi = {
  register: (req: RegisterRequest) => apiClient.post<AuthResponse>("/api/auth/register", req),
  login: (req: LoginRequest) => apiClient.post<AuthResponse>("/api/auth/login", req),
  logout: () => apiClient.post<void>("/api/auth/logout"),

  listExercises: () => apiClient.get<ExerciseDto[]>("/api/exercises"),
  listPlans: () => apiClient.get<TrainingPlanDto[]>("/api/plans"),
  listWorkouts: () => apiClient.get<WorkoutSessionDto[]>("/api/workout-sessions"),
  listGroups: () => apiClient.get<TrainingGroupDto[]>("/api/groups"),
};

