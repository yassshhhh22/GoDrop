import { useCallback } from "react";
import useAuthStore from "../stores/authStore";
import { logout as logoutAPI } from "../services/auth.service";

/**
 * Custom hook for authentication
 * @returns {Object} Auth state and methods
 */
const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Actions from store
  const setAuth = useAuthStore((state) => state.setAuth);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logoutStore = useAuthStore((state) => state.logout);

  // Computed values
  const getRole = useAuthStore((state) => state.getRole);
  const isCustomer = useAuthStore((state) => state.isCustomer);
  const isBusinessUser = useAuthStore((state) => state.isBusinessUser);
  const isDeliveryPartner = useAuthStore((state) => state.isDeliveryPartner);
  const canPlaceOrder = useAuthStore((state) => state.canPlaceOrder);

  // Logout with API call
  const logout = useCallback(async () => {
    try {
      await logoutAPI(); // Call backend to clear cookies
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logoutStore(); // Clear local state regardless
    }
  }, [logoutStore]);

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    isLoading,

    // Actions
    setAuth,
    updateUser,
    logout,

    // Computed
    role: getRole(),
    isCustomer: isCustomer(),
    isBusinessUser: isBusinessUser(),
    isDeliveryPartner: isDeliveryPartner(),
    canPlaceOrder: canPlaceOrder(),
  };
};

export default useAuth;
