// Centralized route path constants for GoDrop

export const ROUTES = {
  PUBLIC: {
    HOME: "/",
    LOGIN: "/login",
    SEARCH: "/search",
    PRODUCTS: "/products",
    CATEGORY: "/category/:categoryId",
    PRODUCT_DETAIL: "/product/:id",
    PRINT_ORDER: "/print-order",
    CART: "/cart",
    USER_MENU: "/user-menu",
   
  },
  PAYMENT: {
    SUCCESS: "/order-success",
    CANCELLED: "/order-cancelled",
    PENDING: "/payment-pending",
  },
  CUSTOMER: {
    PROFILE: "/profile",
    ORDERS: "/orders",
    ADDRESSES: "/addresses",
    ORDER_DETAIL: "/order/:orderId",
    TRACK_ORDER: "/track-order/:orderId",
     CHECKOUT: "/checkout",
  },
  BUSINESS: {
    DASHBOARD: "/business/dashboard",
    PROFILE: "/business/profile",
    ORDERS: "/business/orders",
    ADDRESSES: "/business/addresses",
  },
  DELIVERY: {
    DASHBOARD: "/delivery/dashboard",
  },
  FALLBACK: "*",
};
