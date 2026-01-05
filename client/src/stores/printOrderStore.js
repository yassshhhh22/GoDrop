import { create } from "zustand";
import * as printOrderService from "../services/printOrder.service";
import { promiseAlert } from "../utils/alerts.jsx";
import useOrderStore from "./orderStore";

const usePrintOrderStore = create((set) => ({
  isLoading: false,
  error: null,

  createPrintOrder: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await promiseAlert(
        printOrderService.createPrintOrder(formData),
        {
          loading: "Uploading files and creating your order...",
          success: "Print order created successfully!",
          error: (err) =>
            err.response?.data?.message || "Failed to create print order",
        }
      );

      if (result) {
        // Invalidate and refetch the main orders list
        useOrderStore.getState().fetchOrders();
        return result;
      }
      return null;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message,
      });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default usePrintOrderStore;
