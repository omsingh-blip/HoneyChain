
import { create } from "zustand";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService";

const TOKEN_KEY = "honeychain-token";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,

  register: async (userData) => {
    set({ isLoading: true });

    try {
      const response = await registerUser(userData);

      localStorage.setItem(TOKEN_KEY, response.token);

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });

      return {
        success: false,
        message:
          error.response?.data?.message || "Registration failed.",
      };
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });

    try {
      const response = await loginUser(credentials);

      localStorage.setItem(TOKEN_KEY, response.token);

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });

      return {
        success: false,
        message: error.response?.data?.message || "Login failed.",
      };
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitializing: false,
      });

      return;
    }

    try {
      const response = await getCurrentUser();

      set({
        user: response.user,
        token,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch {
      localStorage.removeItem(TOKEN_KEY);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
