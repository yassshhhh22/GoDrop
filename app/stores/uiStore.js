import { create } from "zustand";

/**
 * UI Store
 * Manages global UI state (modals, alerts, loading states)
 */
const useUIStore = create((set) => ({
  // ========================================
  // STATE
  // ========================================

  // Modal states
  modals: {
    loginModal: false,
    filterModal: false,
    cartModal: false,
    addressModal: false,
    paymentModal: false,
  },

  // Global loading state
  isGlobalLoading: false,
  loadingMessage: "",

  // Toast/Alert queue
  toasts: [],

  // Bottom sheet state
  bottomSheetContent: null,
  isBottomSheetOpen: false,

  // ========================================
  // MODAL ACTIONS
  // ========================================

  /**
   * Open modal
   */
  openModal: (modalName) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: true,
      },
    }));
  },

  /**
   * Close modal
   */
  closeModal: (modalName) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: false,
      },
    }));
  },

  /**
   * Toggle modal
   */
  toggleModal: (modalName) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: !state.modals[modalName],
      },
    }));
  },

  /**
   * Close all modals
   */
  closeAllModals: () => {
    set({
      modals: {
        loginModal: false,
        filterModal: false,
        cartModal: false,
        addressModal: false,
        paymentModal: false,
      },
    });
  },

  /**
   * Check if modal is open
   */
  isModalOpen: (modalName) => {
    const { modals } = get();
    return modals[modalName] || false;
  },

  // ========================================
  // LOADING ACTIONS
  // ========================================

  /**
   * Start global loading
   */
  startLoading: (message = "Loading...") => {
    set({
      isGlobalLoading: true,
      loadingMessage: message,
    });
  },

  /**
   * Stop global loading
   */
  stopLoading: () => {
    set({
      isGlobalLoading: false,
      loadingMessage: "",
    });
  },

  /**
   * Update loading message
   */
  setLoadingMessage: (message) => {
    set({ loadingMessage: message });
  },

  // ========================================
  // TOAST ACTIONS
  // ========================================

  /**
   * Show toast
   */
  showToast: (message, type = "info", duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    // Auto remove toast after duration
    setTimeout(() => {
      get().removeToast(id);
    }, duration);

    return id;
  },

  /**
   * Remove specific toast
   */
  removeToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    }));
  },

  /**
   * Clear all toasts
   */
  clearToasts: () => {
    set({ toasts: [] });
  },

  // ========================================
  // BOTTOM SHEET ACTIONS
  // ========================================

  /**
   * Open bottom sheet
   */
  openBottomSheet: (content) => {
    set({
      bottomSheetContent: content,
      isBottomSheetOpen: true,
    });
  },

  /**
   * Close bottom sheet
   */
  closeBottomSheet: () => {
    set({
      bottomSheetContent: null,
      isBottomSheetOpen: false,
    });
  },
}));

// Get function for use in synchronous contexts
export const get = () => useUIStore.getState();

export default useUIStore;
