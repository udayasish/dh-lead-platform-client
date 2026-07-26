import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";
import type { Credentials, User } from "../types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "loading",
  error: null,
};

export const loadUser = createAsyncThunk("auth/loadUser", async () => {
  return await authApi.me();
});

export const login = createAsyncThunk<
  User,
  Credentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { user } = await authApi.login(credentials);
    return user;
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "Unable to sign in right now";
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await authApi.logout().catch(() => undefined);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      })
      .addCase(login.pending, (state) => {
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.status = "unauthenticated";
        state.error = action.payload ?? "Unable to sign in right now";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "unauthenticated";
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
