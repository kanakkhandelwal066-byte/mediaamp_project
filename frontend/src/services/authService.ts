import { api } from "./api";
import { ApiResponse, AuthResponse, User } from "../types";

export const authService = {
  async register(data: { email: string; password: string; full_name: string; phone?: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return res.data.data;
  },

  async getProfile(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },

  saveAuth(auth: AuthResponse) {
    localStorage.setItem("cinebook_token", auth.access_token);
    localStorage.setItem("cinebook_user", JSON.stringify(auth.user));
  },

  getStoredUser(): User | null {
    const u = localStorage.getItem("cinebook_user");
    return u ? JSON.parse(u) : null;
  },

  logout() {
    localStorage.removeItem("cinebook_token");
    localStorage.removeItem("cinebook_user");
  }
};
