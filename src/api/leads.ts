import { api } from "./client";
import type {
  CaptureLeadInput,
  Lead,
  LeadDetail,
  LeadFilters,
  LeadListItem,
  LeadNote,
  LeadStatus,
} from "../types/lead";

export interface SearchLeadsParams {
  q?: string;
  filters?: LeadFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const leadsApi = {
  capture: (data: CaptureLeadInput) => api.post<Lead>("/leads/public", data),

  create: (data: CaptureLeadInput & { assignedToId?: string | null }) =>
    api.post<Lead>("/leads", data),

  get: (id: string) => api.get<LeadDetail>(`/leads/${id}`),

  update: (id: string, data: Partial<CaptureLeadInput>) =>
    api.patch<Lead>(`/leads/${id}`, data),

  changeStatus: (id: string, status: LeadStatus) =>
    api.patch<Lead>(`/leads/${id}/status`, { status }),

  assign: (id: string, assignedToId: string | null) =>
    api.patch<Lead>(`/leads/${id}/assign`, { assignedToId }),

  addNote: (id: string, body: string) =>
    api.post<LeadNote>(`/leads/${id}/notes`, { body }),

  remove: (id: string) => api.delete<{ deleted: boolean }>(`/leads/${id}`),

  search: (params: SearchLeadsParams) =>
    api.search<LeadListItem>({ resource: "leads", ...params }),
};
