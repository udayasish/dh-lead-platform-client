import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import leadsReducer from "./leadsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
