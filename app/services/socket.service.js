import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

let socket = null;

/**
 * ========================================
 * SOCKET.IO SERVICES (Mobile)
 * Real-time order updates and notifications
 * ========================================
 */

/**
 * Initialize socket connection
 * @param {Object} options - Socket options
 * @returns socket instance
 */
export const initSocket = async (options = {}) => {
  if (socket?.connected) {
    console.log("✅ Socket already connected");
    return socket;
  }

  try {
    const token = await AsyncStorage.getItem("accessToken");
    const user = await AsyncStorage.getItem("user");

    socket = io(
      process.env.EXPO_PUBLIC_SOCKET_URL || "http://192.168.0.100:5000",
      {
        auth: {
          token: token || "",
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
        ...options,
      }
    );

    // Connection events
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    return socket;
  } catch (error) {
    console.error("❌ Error initializing socket:", error);
    return null;
  }
};

/**
 * Get socket instance
 * @returns socket instance or null
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("✅ Socket disconnected");
  }
};

/**
 * Listen to order status updates
 * @param {Function} callback - Function to call when order status changes
 * @returns Unsubscribe function
 */
export const onOrderStatusUpdate = (callback) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized");
    return () => {};
  }

  socket.on("order:status-updated", (data) => {
    console.log("📦 Order status updated:", data);
    callback(data);
  });

  // Return unsubscribe function
  return () => socket.off("order:status-updated");
};

/**
 * Listen to delivery location updates
 * @param {string} orderId - Order ID to track
 * @param {Function} callback - Function to call when location updates
 * @returns Unsubscribe function
 */
export const onDeliveryLocationUpdate = (orderId, callback) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized");
    return () => {};
  }

  const eventName = `delivery:location-${orderId}`;

  socket.on(eventName, (data) => {
    console.log("📍 Delivery location updated:", data);
    callback(data);
  });

  // Return unsubscribe function
  return () => socket.off(eventName);
};

/**
 * Listen to notifications
 * @param {Function} callback - Function to call on new notification
 * @returns Unsubscribe function
 */
export const onNotification = (callback) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized");
    return () => {};
  }

  socket.on("notification", (data) => {
    console.log("🔔 Notification received:", data);
    callback(data);
  });

  // Return unsubscribe function
  return () => socket.off("notification");
};

/**
 * Listen to order assignment (for delivery partners)
 * @param {Function} callback - Function to call when order assigned
 * @returns Unsubscribe function
 */
export const onOrderAssignment = (callback) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized");
    return () => {};
  }

  socket.on("order:assigned", (data) => {
    console.log("📋 Order assigned:", data);
    callback(data);
  });

  // Return unsubscribe function
  return () => socket.off("order:assigned");
};

/**
 * Emit event to server
 * @param {string} eventName - Event name
 * @param {any} data - Event data
 */
export const emitEvent = (eventName, data = {}) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized");
    return;
  }

  socket.emit(eventName, data);
};

/**
 * Join a room (e.g., join order tracking room)
 * @param {string} roomName - Room name
 */
export const joinRoom = (roomName) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized");
    return;
  }

  socket.emit("join-room", { room: roomName });
  console.log(`✅ Joined room: ${roomName}`);
};

/**
 * Leave a room
 * @param {string} roomName - Room name
 */
export const leaveRoom = (roomName) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized");
    return;
  }

  socket.emit("leave-room", { room: roomName });
  console.log(`✅ Left room: ${roomName}`);
};

/**
 * Listen to custom event
 * @param {string} eventName - Event name
 * @param {Function} callback - Callback function
 * @returns Unsubscribe function
 */
export const on = (eventName, callback) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized");
    return () => {};
  }

  socket.on(eventName, callback);
  return () => socket.off(eventName);
};

/**
 * Emit custom event with callback
 * @param {string} eventName - Event name
 * @param {any} data - Event data
 * @param {Function} callback - Callback function
 */
export const emit = (eventName, data, callback) => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized");
    return;
  }

  if (callback) {
    socket.emit(eventName, data, callback);
  } else {
    socket.emit(eventName, data);
  }
};
