import { create } from "zustand";
import * as deliveryService from "../services/deliveryPartner.service";
import { errorAlert, successAlert } from "../utils/alerts";

const useDeliveryPartnerStore = create((set, get) => ({
  // State
  orders: [],
  selectedOrder: null,
  isAvailable: true,
  isLoading: false,
  error: null,
  currentLocation: null,

  // Fetch assigned orders
  fetchOrders: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });
      const data = await deliveryService.getDeliveryOrders(params);
      set({ orders: data.orders || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      errorAlert(error.message || "Failed to fetch orders");
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      set({ isLoading: true, error: null });
      const updatedOrder = await deliveryService.updateOrderStatus(orderId, status);
      
      // Update order in list
      set((state) => ({
        orders: state.orders.map((order) =>
          order.orderId === orderId ? { ...order, status } : order
        ),
        selectedOrder: state.selectedOrder?.orderId === orderId 
          ? { ...state.selectedOrder, status } 
          : state.selectedOrder,
        isLoading: false,
      }));

      successAlert(`Order status updated to ${status}`);
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      errorAlert(error.message || "Failed to update order status");
      return false;
    }
  },

  // Update live location
  updateLocation: async (latitude, longitude) => {
    try {
      await deliveryService.updateLocation(latitude, longitude);
      set({ currentLocation: { latitude, longitude } });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Set selected order
  setSelectedOrder: (order) => {
    set({ selectedOrder: order });
  },

  // Clear selected order
  clearSelectedOrder: () => {
    set({ selectedOrder: null });
  },

  // Toggle availability (if needed in future)
  toggleAvailability: async (isAvailable) => {
    try {
      set({ isLoading: true });
      // Backend endpoint not yet exposed, placeholder
      set({ isAvailable, isLoading: false });
      successAlert(`You are now ${isAvailable ? "available" : "unavailable"}`);
    } catch (error) {
      set({ isLoading: false });
      errorAlert("Failed to update availability");
    }
  },
}));

export default useDeliveryPartnerStore;