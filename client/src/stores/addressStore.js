import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as customerService from "../services/customer.service";
import {
  successAlert,
  errorAlert,
  deleteConfirmAlert,
} from "../utils/alerts.jsx";
import useAuthStore from "./authStore"; // Import useAuthStore

const useAddressStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // STATE
      // ========================================
      addresses: [],
      selectedAddress: null,
      isLoading: false,
      error: null,

      // ========================================
      // ACTIONS
      // ========================================

      /**
       * Fetch all addresses
       */
      fetchAddresses: async () => {
        try {
          set({ isLoading: true, error: null });

          // ✅ FIX: Use different endpoint based on user role
          const { user } = useAuthStore.getState();

          if (user?.role === "BusinessUser") {
            // ✅ BusinessUser doesn't have multiple addresses
            // They only have registeredAddress, not an addresses array
            set({ addresses: [], isLoading: false });
            return;
          }

          // For Customer - fetch addresses
          const profile = await customerService.getProfile();
          set({ addresses: profile.addresses || [] });
        } catch (error) {
          const message =
            error.response?.data?.message || "Failed to fetch addresses";
          errorAlert(message);
          set({ error: message });
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Add new address
       */
      addAddress: async (addressData) => {
        try {
          set({ isLoading: true, error: null });
          const newAddress = await customerService.addAddress(addressData);

          set((state) => ({
            addresses: [...state.addresses, newAddress],
          }));

          successAlert("Address added successfully");
          return newAddress;
        } catch (error) {
          const message =
            error.response?.data?.message || "Failed to add address";
          errorAlert(message);
          set({ error: message });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Update address
       */
      updateAddress: async (addressId, addressData) => {
        try {
          set({ isLoading: true, error: null });
          const updatedAddress = await customerService.updateAddress(
            addressId,
            addressData
          );

          set((state) => ({
            addresses: state.addresses.map((addr) =>
              addr._id === addressId ? updatedAddress : addr
            ),
          }));

          successAlert("Address updated successfully");
          return updatedAddress;
        } catch (error) {
          const message =
            error.response?.data?.message || "Failed to update address";
          errorAlert(message);
          set({ error: message });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Delete address
       */
      deleteAddress: async (addressId) => {
        const confirmed = await deleteConfirmAlert("this address", async () => {
          try {
            set({ isLoading: true, error: null });
            await customerService.deleteAddress(addressId);

            set((state) => ({
              addresses: state.addresses.filter(
                (addr) => addr._id !== addressId
              ),
              selectedAddress:
                state.selectedAddress?._id === addressId
                  ? null
                  : state.selectedAddress,
            }));

            successAlert("Address deleted successfully");
          } catch (error) {
            const message =
              error.response?.data?.message || "Failed to delete address";
            errorAlert(message);
            set({ error: message });
          } finally {
            set({ isLoading: false });
          }
        });
      },

      /**
       * Set default address
       */
      setDefaultAddress: async (addressId) => {
        try {
          set({ isLoading: true, error: null });
          const updatedAddress = await customerService.setDefaultAddress(
            addressId
          );

          set((state) => ({
            addresses: state.addresses.map((addr) => ({
              ...addr,
              isDefault: addr._id === addressId,
            })),
          }));

          successAlert("Default address updated");
          return updatedAddress;
        } catch (error) {
          const message =
            error.response?.data?.message || "Failed to set default address";
          errorAlert(message);
          set({ error: message });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Select address for checkout
       */
      selectAddress: (addressId) => {
        const address = get().addresses.find((addr) => addr._id === addressId);
        if (address) {
          set({ selectedAddress: address });
        }
      },

      /**
       * Clear all addresses
       */
      clearAddresses: () => {
        set({ addresses: [], selectedAddress: null });
      },
    }),
    {
      name: "godrop-addresses",
      partialize: (state) => ({
        addresses: state.addresses,
        selectedAddress: state.selectedAddress,
      }),
    }
  )
);

export default useAddressStore;
