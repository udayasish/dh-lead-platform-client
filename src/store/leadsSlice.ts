import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { leadsApi } from "../api/leads";
import { ApiError } from "../api/client";
import type { PageMeta } from "../api/client";
import type { LeadListItem, LeadStatus } from "../types/lead";

interface LeadsState {
  items: LeadListItem[];
  meta: PageMeta;
  q: string;
  status: LeadStatus | "";
  assignedToId: string;
  page: number;
  loading: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  items: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  q: "",
  status: "",
  assignedToId: "",
  page: 1,
  loading: true,
  error: null,
};

export const fetchLeads = createAsyncThunk<
  { data: LeadListItem[]; meta: PageMeta },
  void,
  { state: { leads: LeadsState }; rejectValue: string }
>("leads/fetch", async (_, { getState, rejectWithValue }) => {
  const { q, status, assignedToId, page, meta } = getState().leads;
  try {
    return await leadsApi.search({
      q: q.trim() || undefined,
      page,
      limit: meta.limit,
      filters: {
        ...(status ? { status } : {}),
        ...(assignedToId === "unassigned"
          ? { assignedToId: null }
          : assignedToId
            ? { assignedToId }
            : {}),
      },
    });
  } catch (err) {
    return rejectWithValue(
      err instanceof ApiError ? err.message : "Could not load leads"
    );
  }
});

const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.q = action.payload;
      state.page = 1;
    },
    setStatus: (state, action: PayloadAction<LeadStatus | "">) => {
      state.status = action.payload;
      state.page = 1;
    },
    setAssignee: (state, action: PayloadAction<string>) => {
      state.assignedToId = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetFilters: (state) => {
      state.q = "";
      state.status = "";
      state.assignedToId = "";
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.items = action.payload.data;
        state.meta = action.payload.meta;
        state.loading = false;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Could not load leads";
      });
  },
});

export const { setQuery, setStatus, setAssignee, setPage, resetFilters } =
  leadsSlice.actions;
export default leadsSlice.reducer;
