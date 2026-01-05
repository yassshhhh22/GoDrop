import { create } from "zustand";

const useUIStore = create((set) => ({
  // Modal states
  isLoginModalOpen: false,
  isCartOpen: false,

  // Device detection (set on mount)
  isMobile: false,
  isTablet: false,
  isDesktop: true,

  // Actions
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  toggleLoginModal: () =>
    set((state) => ({ isLoginModalOpen: !state.isLoginModalOpen })),

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  setDeviceType: (isMobile, isTablet, isDesktop) => {
    set({ isMobile, isTablet, isDesktop });
  },
}));

export default useUIStore;
