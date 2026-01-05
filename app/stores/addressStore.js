import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as customerService from "../services/customer.service";

/**
 * Address Store
 * Manages customer delivery addresses
 */
const useAddressStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // STATE
      // ========================================
      addresses: [],
      selectedAddressId: null,
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
          const addresses = await customerService.getAddresses();
          set({
            addresses: addresses || [],
            isLoading: false,
          });
          return addresses;
        } catch (error) {
          const errorMsg = error.message || "Failed to fetch addresses";
          set({ isLoading: false, error: errorMsg });
          throw error;
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
            isLoading: false,
          }));

          return newAddress;
        } catch (error) {
          const errorMsg = error.message || "Failed to add address";
          set({ isLoading: false, error: errorMsg });
          throw error;
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
            isLoading: false,
          }));

          return updatedAddress;
        } catch (error) {
          const errorMsg = error.message || "Failed to update address";
          set({ isLoading: false, error: errorMsg });
          throw error;
        }
      },

      /**
       * Delete address
       */
      deleteAddress: async (addressId) => {
        try {
          set({ isLoading: true, error: null });
          await customerService.deleteAddress(addressId);

          set((state) => ({
            addresses: state.addresses.filter((addr) => addr._id !== addressId),
            // Clear selected address if it was the one being deleted
            selectedAddressId:
              state.selectedAddressId === addressId
                ? null
                : state.selectedAddressId,
            isLoading: false,
          }));

          return true;
        } catch (error) {
          const errorMsg = error.message || "Failed to delete address";
          set({ isLoading: false, error: errorMsg });
          throw error;
        }
      },

      /**
       * Set selected address
       */
      setSelectedAddress: (addressId) => {
        const { addresses } = get();
        const address = addresses.find((addr) => addr._id === addressId);

        if (address) {
          set({ selectedAddressId: addressId });
          return true;
        }

        return false;
      },

      /**
       * Get selected address object
       */
      getSelectedAddress: () => {
        const { addresses, selectedAddressId } = get();
        return addresses.find((addr) => addr._id === selectedAddressId) || null;
      },

      /**
       * Set address as default
       */
      setDefaultAddress: async (addressId) => {
        try {
          set({ isLoading: true, error: null });
          const updatedAddress = await customerService.setDefaultAddress(
            addressId
          );

          set((state) => ({
            addresses: state.addresses.map((addr) =>
              addr._id === addressId
                ? { ...addr, isDefault: true }
                : { ...addr, isDefault: false }
            ),
            selectedAddressId: addressId,
            isLoading: false,
          }));

          return updatedAddress;
        } catch (error) {
          const errorMsg = error.message || "Failed to set default address";
          set({ isLoading: false, error: errorMsg });
          throw error;
        }
      },

      /**
       * Get default address
       */
      getDefaultAddress: () => {
        const { addresses } = get();
        return addresses.find((addr) => addr.isDefault) || addresses[0] || null;
      },

      /**
       * Clear all addresses
       */
      clearAddresses: () => {
        set({
          addresses: [],
          selectedAddressId: null,
        });
      },
    }),
    {
      name: "godrop-addresses",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAddressStore;
