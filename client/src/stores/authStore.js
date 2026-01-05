import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authService from "../services/auth.service";
import { errorAlert, successAlert } from "../utils/alerts.jsx";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // STATE
      // ========================================
      user: null,
      accessToken: null, // ✅ In memory (lost on refresh)
      refreshToken: null, // ✅ Persisted in localStorage (mobile compatible)
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ========================================
      // ACTIONS
      // ========================================

      /**
       * Send OTP to phone
       */
      sendOTP: async (phone, role) => {
        try {
          set({ isLoading: true, error: null });
          await authService.sendOTP(phone, role);
          set({ isLoading: false });
          successAlert("OTP sent successfully!");
          return true;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          errorAlert(error.message || "Failed to send OTP");
          return false;
        }
      },

      /**
       * Verify OTP and login
       */
      verifyOTP: async (phone, otp, role) => {
        try {
          set({ isLoading: true, error: null });
          const data = await authService.verifyOTP(phone, otp, role);

          // ✅ Store BOTH tokens
          set({
            user: data.user,
            accessToken: data.accessToken, // Memory (web) / AsyncStorage (mobile)
            refreshToken: data.refreshToken, // ✅ Persisted
            isAuthenticated: true,
            isLoading: false,
          });

          successAlert("Login successful!");
          return true;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          errorAlert(error.message || "Invalid OTP");
          return false;
        }
      },

      /**
       * ✅ Refresh access token using stored refresh token
       */
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
          } catch (userError) {
            // Silent fail - just log error
          }

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

      /**
       * Update user in store
       */
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      /**
       * Logout user
       */
      logout: async () => {
        try {
          await authService.logout();
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          successAlert("Logged out successfully");
        } catch (error) {
          errorAlert("Logout failed");
        }
      },

      /**
       * Get customer type (Retail or Business)
       */
      getCustomerType: () => {
        const { user } = get();
        if (user?.role === "BusinessUser") {
          return user.verificationStatus === "Approved" ? "Business" : "Retail";
        }
        return "Retail";
      },

      /**
       * Get user role
       */
      getRole: () => {
        const { user } = get();
        return user?.role || null;
      },

      /**
       * Check if user is customer
       */
      isCustomer: () => {
        return get().user?.role === "Customer";
      },

      /**
       * Check if user is business user
       */
      isBusinessUser: () => {
        return get().user?.role === "BusinessUser";
      },

      /**
       * Check if user is delivery partner
       */
      isDeliveryPartner: () => {
        return get().user?.role === "DeliveryPartner";
      },

      /**
       * ✅ NEW: Get redirect path based on role
       */
      getRedirectPath: () => {
        const { user } = get();
        if (!user) return "/";

        switch (user.role) {
          case "DeliveryPartner":
            return "/delivery/dashboard";
          case "BusinessUser":
            return "/business/dashboard";
          default:
            return "/";
        }
      },
    }),
    {
      name: "godrop-auth",
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken, // ✅ Persist refresh token
        isAuthenticated: state.isAuthenticated,
        // ✅ NEW: Also persist accessToken temporarily (for page refresh)
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useAuthStore;
