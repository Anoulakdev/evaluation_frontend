import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";

export interface UserProfile {
  id: number;
  username: string;
  roleId: number;
  role?: { id: number; name: string } | null;
  first_name?: string | null;
  last_name?: string | null;
  emp_code?: string | null;
  gender?: string | null;
  tel?: string | null;
  email?: string | null;
  empimg?: string | null;
  posId?: number | null;
  departmentId?: number | null;
  divisionId?: number | null;
  officeId?: number | null;
  unitId?: number | null;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await axios.get("/api/auth/me");
      if (res.data.success && res.data.user) {
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch {
      // Ignore logout errors
    } finally {
      Cookies.remove("token");
      Cookies.remove("access_token");
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
}));
