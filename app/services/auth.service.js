import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const sendOTP = async (phone, role = "customer") => {
  try {
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

    const response = await api.post("/auth/send-otp", {
      phone: formattedPhone,
      role: formattedRole,
    });
    return response.data.data;
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message ||
      errorData?.msg ||
      error.message ||
      "Failed to send OTP";
    throw new Error(errorMessage);
  }
};

export const verifyOTP = async (phone, otp, role = "customer") => {
  const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

  const response = await api.post("/auth/verify-otp", {
    phone: formattedPhone,
    otp,
    role: formattedRole,
  });

  return response.data.data;
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 * @param {string} refreshToken - Stored refresh token
 * @returns { accessToken, refreshToken }
 */
export const refreshToken = async (refreshToken) => {
  try {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    // Update tokens in AsyncStorage
    await AsyncStorage.setItem("accessToken", accessToken);
    if (newRefreshToken) {
      await AsyncStorage.setItem("refreshToken", newRefreshToken);
    }

    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    const user = response.data.data.user;
    await AsyncStorage.setItem("user", JSON.stringify(user));

    return user;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
  } finally {
    await Promise.all([
      AsyncStorage.removeItem("accessToken"),
      AsyncStorage.removeItem("refreshToken"),
      AsyncStorage.removeItem("user"),
    ]);
  }
};

/**
 * Get stored user from AsyncStorage
 * @returns { user } or null
 */
export const getStoredUser = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("❌ Error reading user from AsyncStorage:", error);
    return null;
  }
};

/**
 * Get stored access token from AsyncStorage
 * @returns { string } token or null
 */
export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem("accessToken");
  } catch (error) {
    console.error("❌ Error reading token from AsyncStorage:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns { boolean }
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    return !!token;
  } catch (error) {
    return false;
  }
};
