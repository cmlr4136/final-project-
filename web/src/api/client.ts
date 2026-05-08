/*
 * 这个文件做什么：一个精简的 fetch 封装（自动带 token、统一错误）。
 * What this file is for: a tiny fetch wrapper (auto token, consistent errors).
 */

import { useAuthStore } from "@/stores/authStore";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function apiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (fromEnv ?? "http://localhost:8080").replace(/\/$/, "");
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${apiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message = extractErrorMessage(data) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

function extractErrorMessage(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;
  const msg = record["message"];
  return typeof msg === "string" && msg.trim() ? msg : null;
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
};