import { api } from "./client";
import type { UserRole } from "../types/auth";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export const usersApi = {
  search: (params: { q?: string; page?: number; limit?: number } = {}) =>
    api.search<TeamMember>({
      resource: "users",
      sortBy: "name",
      sortOrder: "asc",
      limit: 100,
      ...params,
    }),
};
