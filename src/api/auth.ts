import { api } from "./client";
import type { Credentials, User } from "../types/auth";

interface SessionResponse {
  user: User;
}

export const authApi = {
  login: (credentials: Credentials) =>
    api.post<SessionResponse>("/auth/login", credentials),

  register: (input: Credentials & { name: string }) =>
    api.post<SessionResponse>("/auth/register", input),

  logout: () => api.post<{ loggedOut: boolean }>("/auth/logout"),

  me: () => api.get<User>("/auth/me"),
};
