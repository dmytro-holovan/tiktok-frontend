import { request } from "./client";
import type { AuthResponse, User } from "./types";

export const authApi = {
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  register: (body: { email: string; password: string; displayName?: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: (token: string) => request<User>("/auth/me", {}, token),
};
