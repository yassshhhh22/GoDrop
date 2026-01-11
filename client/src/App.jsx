import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { ROUTES } from "./routes";
import HomePage from "./pages/public/HomePage";
import SearchPage from "./pages/public/SearchPage";
import CategoryPage from "./pages/public/CategoryPage";
import ProductDetailPage from "./pages/public/ProductDetailPage";
import ProductsPage from "./pages/public/ProductsPage";
import OrderSuccess from "./pages/public/OrderSuccess";
import OrderCancelled from "./pages/public/OrderCancelled";
import PaymentPending from "./pages/public/PaymentPending";
import LoginPage from "./pages/public/LoginPage";
import CheckoutPage from "./pages/public/CheckoutPage";
import UserMenuMobile from "./pages/public/UserMenuMobile";
import DisplayCartItem from "./components/cart/DisplayCartItem";
import LoginModal from "./components/modals/LoginModal";
import useUIStore from "./stores/uiStore";
import useAuthStore from "./stores/authStore";
import CartMobilePage from "./pages/public/CartMobilePage";
import ProfilePage from "./pages/customer/Profile";
import OrdersPage from "./pages/customer/OrdersPage";
import AddressesPage from "./pages/business/AddressesPage";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import ProtectedRoute from "./components/navigation/ProtectedRoute";
import * as authService from "./services/auth.service"; // ✅ ADD: Import authService
import OrderDetailPage from "./pages/customer/OrderDetailPage";
import BusinessUserProfile from "./pages/business/BusinessUserProfile";
import OrderTrackingPage from "./pages/customer/OrderTrackingPage";
import DeliveryPartnerDashboard from "./pages/delivery/DeliveryPartnerDashboard";
import PrintOrderPage from "./pages/public/PrintOrderPage";
import Loading from "./components/layout/Loading"; // Add import for Loading component

function App() {
  const { setDeviceType } = useUIStore();
  const {
    refreshAccessToken,
    isAuthenticated,
    accessToken,
    refreshToken,
    updateUser,
  } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const { isCartOpen, closeCart, isLoginModalOpen } = useUIStore();

  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated && refreshToken && !accessToken) {
        await refreshAccessToken();
      }

      if (isAuthenticated && accessToken) {
        try {
          const user = await authService.getCurrentUser();
          updateUser(user);
        } catch (error) {
          // Silent fail
        }
      }

      setIsInitialized(true);
    };

    initializeAuth();
  }, []); // ✅ Run only once on mount

  // ✅ Show loading until auth is initialized
  if (!isInitialized) {
    return <Loading size={150} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fff",
              color: "#1f2937",
            },
          }}
        />

        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            {/* ---------- Public Routes ---------- */}
            <Route path={ROUTES.PUBLIC.HOME} element={<HomePage />} />
            <Route path={ROUTES.PUBLIC.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.PUBLIC.SEARCH} element={<SearchPage />} />
            <Route path={ROUTES.PUBLIC.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.PUBLIC.CATEGORY} element={<CategoryPage />} />
            <Route
              path={ROUTES.PUBLIC.PRODUCT_DETAIL}
              element={<ProductDetailPage />}
            />

            {/* ---------- Utility Routes ---------- */}
            <Route path={ROUTES.PUBLIC.CART} element={<CartMobilePage />} />
            <Route
              path={ROUTES.PUBLIC.USER_MENU}
              element={<UserMenuMobile />}
            />
            <Route
              path={ROUTES.PUBLIC.PRINT_ORDER}
              element={<PrintOrderPage />}
            />

            {/* ---------- Payment/Status Routes ---------- */}
            <Route path={ROUTES.PAYMENT.SUCCESS} element={<OrderSuccess />} />
            <Route
              path={ROUTES.PAYMENT.CANCELLED}
              element={<OrderCancelled />}
            />
            <Route path={ROUTES.PAYMENT.PENDING} element={<PaymentPending />} />

            {/* ---------- Customer Routes (Protected) ---------- */}
            <Route
              path={ROUTES.CUSTOMER.CHECKOUT} // ✅ Add Checkout route
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CUSTOMER.PROFILE}
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CUSTOMER.ORDERS}
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CUSTOMER.ADDRESSES}
              element={
                <ProtectedRoute>
                  <AddressesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CUSTOMER.ORDER_DETAIL}
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CUSTOMER.TRACK_ORDER}
              element={
                <ProtectedRoute>
                  <OrderTrackingPage />
                </ProtectedRoute>
              }
            />

            {/* ---------- Business Routes (Protected) ---------- */}
            <Route
              path={ROUTES.BUSINESS.DASHBOARD}
              element={
                <ProtectedRoute requiredRole="BusinessUser">
                  <BusinessDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.BUSINESS.PROFILE}
              element={
                <ProtectedRoute requiredRole="BusinessUser">
                  <BusinessUserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.BUSINESS.ORDERS}
              element={
                <ProtectedRoute requiredRole="BusinessUser">
                  <OrdersPage />
                </ProtectedRoute>
              }
            />

            {/* ---------- Delivery Routes (Protected) ---------- */}
            <Route
              path={ROUTES.DELIVERY.DASHBOARD}
              element={
                <ProtectedRoute requiredRole="DeliveryPartner">
                  <DeliveryPartnerDashboard />
                </ProtectedRoute>
              }
            />

            {/* ---------- Fallback ---------- */}
            <Route
              path={ROUTES.FALLBACK}
              element={<Navigate to={ROUTES.PUBLIC.HOME} replace />}
            />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

        {/* Cart Sidebar */}
        {isCartOpen && <DisplayCartItem close={closeCart} />}

        {/* Login Modal (Desktop) */}
        {isLoginModalOpen && <LoginModal />}
      </div>
    </BrowserRouter>
  );
}
export default App;
