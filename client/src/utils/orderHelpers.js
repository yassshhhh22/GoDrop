/**
 * Get order status configuration (colors, labels, icons)
 */
export const getOrderStatusConfig = (status) => {
  const statusMap = {
    pending: {
      label: "Pending Approval",
      color: "warning",
      bgClass: "bg-warning bg-opacity-20",
      textClass: "text-warning",
      description: "Waiting for admin confirmation",
    },
    confirmed: {
      label: "Confirmed",
      color: "primary",
      bgClass: "bg-primary-100",
      textClass: "text-primary-600",
      description: "Order confirmed, preparing for pickup",
    },
    picked: {
      label: "Picked Up",
      color: "blue",
      bgClass: "bg-blue-100",
      textClass: "text-blue-600",
      description: "Order picked up by delivery partner",
    },
    arriving: {
      label: "On The Way",
      color: "purple",
      bgClass: "bg-purple-100",
      textClass: "text-purple-600",
      description: "Delivery partner is on the way",
    },
    delivered: {
      label: "Delivered",
      color: "green",
      bgClass: "bg-green-100",
      textClass: "text-green-600",
      description: "Order delivered successfully",
    },
    cancelled: {
      label: "Cancelled",
      color: "error",
      bgClass: "bg-error bg-opacity-20",
      textClass: "text-error",
      description: "Order has been cancelled",
    },
  };

  return statusMap[status] || statusMap.pending;
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (status) => {
  return ["pending", "confirmed"].includes(status);
};
