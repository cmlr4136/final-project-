/*
 * 这个文件做什么：用 zustand 存储登录态（token + user）。
 * What this file is for: store auth state via zustand (token + user).
 */

import { create } from "zustand";
import type { UserDto } from "@/api/types";

type AuthState = {
  token: string | null;
  user: UserDto | null;
  setAuth: (token: string, user: UserDto) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  clear: () => set({ token: null, user: null }),
}));

