import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create axios instance
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.100:5000/api",
  timeout: 10000,
  withCredentials: true,
});

/**
 * Request Interceptor - Add auth token to headers
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("❌ Error reading token from AsyncStorage:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor - Handle token refresh on 401
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token - logout user
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          await AsyncStorage.removeItem("user");
          throw new Error("Session expired. Please login again.");
        }

        // Try to refresh token
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Store new tokens
        await AsyncStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem("refreshToken", newRefreshToken);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        // Clear auth data
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("user");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
