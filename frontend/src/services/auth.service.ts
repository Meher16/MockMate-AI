import { api } from "@/lib/axios";
import type { AuthResponse, ApiResponse, User } from "@/types";

export const authService = {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse["data"]> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse["data"]> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return response.data.data!.user;
  },
};
