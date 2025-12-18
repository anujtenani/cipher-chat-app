import { apiGet } from "@/utils/api";
import { create } from "zustand";

export interface User {
  id: string;
  username: string;
}

interface AuthState {
  isAuthenticated: "unknown" | "yes" | "no";
  init: () => Promise<{
    access_token?: string;
  }>;
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: "unknown",
  user: null,
  setUser: (user: User | null) =>
    set({ user, isAuthenticated: user ? "yes" : "no" }),
  init: async () => {
    // Simulate an async auth check
    return apiGet<{ access_token?: string; user?: User }>("/auth/me").then(
      (data) => {
        if (data.access_token) {
          set({ isAuthenticated: "yes", user: data.user });
        } else {
          set({ isAuthenticated: "no", user: null });
        }
        return data;
      }
    );
  },
}));
