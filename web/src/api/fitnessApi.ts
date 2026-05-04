/*
 * 这个文件做什么：按业务封装的 API 方法（占位，后续可扩展）。
 * What this file is for: domain-level API functions (stub, extend later).
 */

import { apiClient } from "@/api/client";
import type {
  AuthResponse,
  ExerciseDto,
  GroupMessageDto,
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

  listExercises: () => apiClient.get<ExerciseDto[]>("/exercises"),
  listPlans: () => apiClient.get<TrainingPlanDto[]>("/api/plans"),
  listWorkouts: () => apiClient.get<WorkoutSessionDto[]>("/api/workout-sessions"),
  listGroups: () => apiClient.get<TrainingGroupDto[]>("/api/groups"), // get all groups
  getMyGroups: () => apiClient.get<TrainingGroupDto[]>("/api/groups/my"), // get groups the user is part of
  getDiscoverGroups: () => apiClient.get<TrainingGroupDto[]>("/api/groups/discover"), // get groups the user is not part of
  getGroupDetails: (groupId: string | number) => apiClient.get<TrainingGroupDto>(`/api/groups/${groupId}`), // get details of a specific group
  joinGroup: (groupId: string | number) => apiClient.post<void>(`/api/groups/${groupId}/join`), // join a group
  leaveGroup: (groupId: string | number) => apiClient.post<void>(`/api/groups/${groupId}/leave`), // leave a group
  getGroupMessages: (groupId: string | number, params?: { after?: string }) => {
    const qs = params?.after ? `?after=${encodeURIComponent(params.after)}` : "";
    return apiClient.get<GroupMessageDto[]>(`/api/groups/${groupId}/messages${qs}`);
  },
  sendMessage: (groupId: string | number, content: string) => apiClient.post<GroupMessageDto>(`/api/groups/${groupId}/messages`, { content }), // send a message to a group
  createGroup: (data: { name: string; description: string }) => apiClient.post<TrainingGroupDto>("/api/groups", data),
};
