import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "../services/auth.service";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      sendOTP: async (phone, role = "customer") => {
        try {
          set({ isLoading: true, error: null });
          const result = await authService.sendOTP(phone, role);
          set({ isLoading: false });
          return result;
        } catch (error) {
          const errorMsg = error.message || "Failed to send OTP";
          set({ isLoading: false, error: errorMsg });
          throw error;
        }
      },

      verifyOTP: async (phone, otp, role = "customer") => {
        set({ isLoading: true, error: null });

        const data = await authService.verifyOTP(phone, otp, role);

        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        return data;
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          return null;
        }

        try {
          const data = await authService.refreshToken(refreshToken);

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
          });

          try {
            const user = await authService.getCurrentUser();
            set({ user });
          } catch (userError) {}

          return data.accessToken;
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          return null;
        }
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      logout: async () => {
        try {
          await authService.logout();
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          return true;
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      isAuth: () => {
        return get().isAuthenticated && !!get().accessToken;
      },

      getRole: () => {
        return get().user?.role || "customer";
      },
    }),
    {
      name: "godrop-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
