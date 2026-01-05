import { io } from "socket.io-client";
import { API_BASE_URL } from "../utils/constants";
import useOrderStore from "../stores/orderStore";
import toast from "react-hot-toast";

let socket = null;

export const connectSocket = (orderId) => {
  if (socket) return socket;

  socket = io(API_BASE_URL.replace("/api", ""), {
    transports: ["websocket"],
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket.IO connected");

    if (orderId) {
      socket.emit("joinOrder", orderId);
    }
  });

  socket.on("orderStatusUpdate", ({ orderId, status }) => {
    useOrderStore.getState().updateOrderStatus(orderId, status);
    toast.success(`Order ${orderId}: ${status}`);
  });

  socket.on("deliveryPartnerLocation", ({ latitude, longitude }) => {
    // Update tracking map
    console.log("Delivery partner location:", latitude, longitude);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket.IO disconnected");
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
