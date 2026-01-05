import { create } from "zustand";
import * as orderService from "../services/order.service";
import {
  successAlert,
  errorAlert,
  promiseAlert,
  infoAlert,
} from "../utils/alerts.jsx";
import * as printOrderService from "../services/printOrder.service"; // ✅ Import printOrderService

const useOrderStore = create((set, get) => ({
  // ========================================
  // STATE
  // ========================================
  orders: [],
  selectedOrder: null,
  trackingData: null,
  isLoading: false,
  error: null,

  currentPage: 1,
  totalPages: 1,

  // ========================================
  // ACTIONS
  // ========================================

  fetchOrders: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });

      const response = await orderService.getAllOrders({
        page: get().currentPage,
        limit: 10,
        ...params,
      });

      set({
        orders: response.orders,
        totalPages: response.pagination?.totalPages || 1,
        currentPage: response.pagination?.page || 1,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      errorAlert("Failed to load orders");
    }
  },

  fetchOrderById: async (orderId, orderType) => {
    try {
      set({ isLoading: true, error: null });

      let order;
      if (orderType === "print") {
        // ✅ Conditionally call printOrderService for print orders
        order = await printOrderService.getPrintOrderById(orderId);
      } else {
        order = await orderService.getOrderById(orderId);
      }

      set({
        selectedOrder: order,
        isLoading: false,
      });

      return order;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      errorAlert("Order not found");
      return null;
    }
  },

  createOrder: async (orderData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await orderService.createOrder(orderData);

      set({
        orders: [response, ...get().orders],
        selectedOrder: response,
        isLoading: false,
      });

      // ✅ Single toast - no duplicate
      successAlert(
        response.status === "pending"
          ? "Order placed! Waiting for admin approval"
          : "Order placed successfully!"
      );

      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      errorAlert(error.response?.data?.message || "Failed to place order");
      return null;
    }
  },

  placeOrder: async (orderData) => {
    return promiseAlert(
      orderService.createOrder(orderData).then((order) => {
        set((state) => ({
          orders: [order, ...state.orders],
        }));
        return order;
      }),
      {
        loading: "Placing order...",
        success: "Order placed successfully!",
        error: "Failed to place order",
      }
    );
  },

  cancelOrder: async (orderId, reason) => {
    try {
      set({ isLoading: true, error: null });

      const cancelledOrder = await orderService.cancelOrder(orderId, reason);

      // ✅ Update orders list
      set((state) => ({
        orders: state.orders.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                status: "cancelled",
                cancellationReason: cancelledOrder.cancellationReason,
              }
            : order
        ),
        // ✅ Update selectedOrder if it's the one being cancelled
        selectedOrder:
          state.selectedOrder?.orderId === orderId
            ? {
                ...state.selectedOrder,
                status: "cancelled",
                cancellationReason: cancelledOrder.cancellationReason,
              }
            : state.selectedOrder,
        isLoading: false,
      }));

      successAlert("Order cancelled successfully");
      return cancelledOrder;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to cancel order";
      errorAlert(message);
      set({ error: message, isLoading: false });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  trackOrder: async (orderId) => {
    try {
      set({ isLoading: true, error: null });

      const trackingData = await orderService.trackOrder(orderId);

      set({
        trackingData,
        isLoading: false,
      });

      return trackingData;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to track order";

      // ✅ Check if it's an auth error
      if (error.response?.status === 401) {
        errorAlert("Please login again to track your order");
      } else {
        errorAlert(message);
      }

      set({ error: message, isLoading: false });
      return null;
    }
  },

  updateOrderStatus: (orderId, status) => {
    set({
      orders: get().orders.map((order) =>
        order.orderId === orderId ? { ...order, status } : order
      ),
    });

    if (get().selectedOrder?.orderId === orderId) {
      set({
        selectedOrder: { ...get().selectedOrder, status },
      });
    }
  },

  // ========================================
  // PAGINATION
  // ========================================
  setPage: (page) => {
    set({ currentPage: page });
    get().fetchOrders();
  },

  // ========================================
  // UTILITIES
  // ========================================
  clearSelectedOrder: () => {
    set({ selectedOrder: null, trackingData: null });
  },
}));

export default useOrderStore;
