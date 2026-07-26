export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string | null;
  message: string | null;
  status: LeadStatus;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListItem extends Lead {
  assigneeName: string | null;
}

export interface LeadNote {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string };
}

export type LeadActivityType =
  | "created"
  | "status_changed"
  | "assigned"
  | "note_added";

export interface LeadActivity {
  id: string;
  type: LeadActivityType;
  detail: string | null;
  createdAt: string;
  actorId: string | null;
  actorName: string | null;
}

export interface LeadDetail extends Lead {
  assignee: { id: string; name: string; email: string } | null;
  notes: LeadNote[];
  activities: LeadActivity[];
}

export interface LeadFilters {
  status?: LeadStatus;
  assignedToId?: string | null;
}

export interface CaptureLeadInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  message?: string;
}
