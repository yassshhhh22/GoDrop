import { create } from "zustand";
import * as orderService from "../services/order.service";
import useCartStore from "./cartStore";
import useConfigStore from "./configStore";

/**
 * Order Store
 * Manages user orders and order tracking
 */
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

  /**
   * Fetch all orders for current user
   */
  fetchOrders: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });

      const response = await orderService.getOrders({
        page: get().currentPage,
        limit: 10,
        ...params,
      });

      set({
        orders: response.orders || [],
        totalPages: response.pagination?.totalPages || 1,
        currentPage: response.pagination?.page || 1,
        isLoading: false,
      });

      return response;
    } catch (error) {
      console.error("❌ Failed to fetch orders:", error);
      set({ isLoading: false, error: error.message });
      return { orders: [] };
    }
  },

  /**
   * Fetch single order by ID
   */
  fetchOrderById: async (orderId) => {
    try {
      set({ isLoading: true, error: null });

      const order = await orderService.getOrderById(orderId);

      set({
        selectedOrder: order,
        isLoading: false,
      });

      return order;
    } catch (error) {
      console.error("❌ Failed to fetch order:", error);
      set({ isLoading: false, error: error.message });
      return null;
    }
  },

  /**
   * Create new order
   */
  createOrder: async (orderData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await orderService.createOrder(orderData);

      set((state) => ({
        orders: [response, ...state.orders],
        selectedOrder: response,
        isLoading: false,
      }));

      return response;
    } catch (error) {
      console.error("❌ Failed to create order:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Place order with better UX - wrapper around createOrder
   * Fetches current pricing from backend before creating order
   */
  placeOrder: async (orderData) => {
    try {
      set({ isLoading: true, error: null });

      // Ensure we have latest pricing from backend
      const configStore = useConfigStore.getState();
      const cartStore = useCartStore.getState();

      try {
        await configStore.fetchAllConfig();
      } catch (error) {
        console.warn(
          "⚠️ Could not refresh pricing from backend, using cached values"
        );
      }

      // Calculate final summary with backend prices
      const orderSummary = await cartStore.getOrderSummary(
        orderData.giftWrap?.enabled || false
      );

      // Merge pricing information into order data
      const finalOrderData = {
        ...orderData,
        subtotal: orderSummary.subtotal,
        deliveryFee: orderSummary.deliveryFee,
        giftWrapCharge: orderSummary.giftWrapCharge,
        couponDiscount: orderSummary.couponDiscount,
        total: orderSummary.total,
      };

      const response = await orderService.createOrder(finalOrderData);

      set((state) => ({
        orders: [response, ...state.orders],
        selectedOrder: response,
        isLoading: false,
      }));

      return {
        success: true,
        data: response,
        message: "Order placed successfully!",
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to place order";

      console.error("❌ Failed to place order:", error);
      set({ isLoading: false, error: errorMessage });

      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Track order in real-time
   */
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
      console.error("❌ Failed to track order:", error);
      set({ isLoading: false, error: error.message });
      return null;
    }
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId, reason = "") => {
    try {
      set({ isLoading: true, error: null });

      const cancelledOrder = await orderService.cancelOrder(orderId, reason);

      // Update orders list
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
        // Update selected order if it's the one being cancelled
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

      return cancelledOrder;
    } catch (error) {
      console.error("❌ Failed to cancel order:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Set selected order
   */
  setSelectedOrder: (order) => {
    set({ selectedOrder: order });
  },

  /**
   * Clear selected order
   */
  clearSelectedOrder: () => {
    set({ selectedOrder: null, trackingData: null });
  },

  /**
   * Update order status (for real-time updates from socket)
   */
  updateOrderStatus: (orderId, newStatus) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.orderId === orderId ? { ...order, status: newStatus } : order
      ),
      selectedOrder:
        state.selectedOrder?.orderId === orderId
          ? { ...state.selectedOrder, status: newStatus }
          : state.selectedOrder,
    }));
  },

  /**
   * Set current page
   */
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  /**
   * Get order by ID from local state
   */
  getOrderById: (orderId) => {
    const { orders } = get();
    return orders.find((order) => order.orderId === orderId);
  },

  /**
   * Get orders by status
   */
  getOrdersByStatus: (status) => {
    const { orders } = get();
    return orders.filter((order) => order.status === status);
  },
}));

export default useOrderStore;
