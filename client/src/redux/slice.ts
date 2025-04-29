import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  userId: string | null;
  role: "admin" | "user" | "restricted" | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  username: null,
  userId: null,
  role: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ accessToken: string; refreshToken: string, username: string, userId: string, role: "admin" | "user" | "restricted" }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.username = action.payload.username;
      state.userId = action.payload.userId;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.username = null;
      state.userId = null;
      state.role = null;
    },
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    setRole: (state, action: PayloadAction<"admin" | "user" | "restricted">) => {
      state.role = action.payload;
    },
  },
});

export const { login, logout, setUsername, setRole } = authSlice.actions;
export default authSlice.reducer;
