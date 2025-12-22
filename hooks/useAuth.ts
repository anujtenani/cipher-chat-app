import { apiGet, apiPost, setAccessToken } from "@/utils/api";
import { AuthenticatedUser } from "@/utils/api_types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useLocalSettings } from "./useLocalSettings";

interface AuthState {
  isAuthenticated: "unknown" | "yes" | "no";
  init: () => Promise<{
    access_token?: string;
  }>;
  logout: () => Promise<void>;
  user: AuthenticatedUser | null;
  updateProfile: (data: Partial<AuthenticatedUser>) => void;
  setUser: (user: AuthenticatedUser | null) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: "unknown",
      user: null,
      logout: async () => {
        await setAccessToken(null);
        set({ isAuthenticated: "no", user: null });
      },
      setUser: (user: AuthenticatedUser | null) =>
        set({ user, isAuthenticated: user ? "yes" : "no" }),
      updateProfile: (data: Partial<AuthenticatedUser>) => {
        const previousUser = useAuth.getState().user;
        set({
          user: previousUser ? { ...previousUser, ...data } : null,
        });
        apiPost("/auth/update-profile", data).catch((error) => {
          set({ user: previousUser });
        });
      },
      init: async () => {
        // Simulate an async auth check
        await useLocalSettings.getState().init();
        return apiGet<{ access_token?: string; user?: AuthenticatedUser }>(
          "/auth/me"
        ).then((data) => {
          if (data.access_token) {
            set({ isAuthenticated: "yes", user: data.user });
          } else {
            set({ isAuthenticated: "no", user: null });
          }
          return data;
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
