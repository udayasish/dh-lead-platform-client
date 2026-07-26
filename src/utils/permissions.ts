import type { User, UserRole } from "../types/auth";

// Mirrors the server guard. UX only — the server is the real gate.
export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.role === role;
};

export const isAdmin = (user: User | null) => user?.role === "admin";

export const canModifyLead = (
  user: User | null,
  lead: { assignedToId: string | null }
): boolean => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return lead.assignedToId === user.id;
};
