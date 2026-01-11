import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { MdReceipt, MdShoppingBag } from "react-icons/md";
import useOrderStore from "../../stores/orderStore";
import { formatPrice } from "../../utils/priceFormatter";
import Loading from "../../components/layout/Loading";

const OrdersPage = () => {
  const { orders, fetchOrders, isLoading } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  // Helper function for status badge with professional colors
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Pending Approval",
      },
      confirmed: {
        bg: "bg-primary-100",
        text: "text-primary-600",
        label: "Confirmed",
      },
      picked: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        label: "Picked Up",
      },
      arriving: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        label: "On The Way",
      },
      delivered: {
        bg: "bg-green-100",
        text: "text-green-600",
        label: "Delivered",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-600",
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-4 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text} border border-transparent`}
        style={{ minWidth: 120, display: "inline-block", textAlign: "center" }}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size={150} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600 text-base">View and track your orders</p>
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto">
            <MdShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-full">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col"
              >
                {/* Header */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        Order #{order.orderId}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {order.orderType === "print" ? "Pages" : "Items"}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {order.orderType === "print"
                        ? order.printDetails?.totalPages || "N/A"
                        : order.items?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold text-gray-900">
                      {order.payment?.method === "cod" ? "COD" : "Online"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Total</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to={`/order/${order.orderId}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-green-600 bg-white rounded-lg transition-colors duration-200 font-semibold text-sm group"
                  style={{
                    color: "#16a34a",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#16a34a";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.color = "#16a34a";
                  }}
                >
                  <MdReceipt size={18} />
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
