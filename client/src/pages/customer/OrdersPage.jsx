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
    <div className="bg-grey-50 min-h-screen py-8 px-2 sm:px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-grey-900 mb-2">My Orders</h1>
          <p className="text-secondary-500 text-base">View and track your orders</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white border border-grey-200 rounded-2xl p-12 text-center shadow-sm">
            <MdShoppingBag
              size={64}
              className="mx-auto text-secondary-300 mb-4"
            />
            <h3 className="text-xl font-semibold text-grey-900 mb-2">
              No orders yet
            </h3>
            <p className="text-secondary-500 mb-6">
              Start shopping to see your orders here
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-grey-50 rounded-lg font-medium transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-grey-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
              >
                <div className="w-full flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-grey-900 mb-2">
                        Order #{order.orderId}
                      </h3>
                      <p className="text-sm text-secondary-500 mb-2">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center">{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600 mb-2">
                    <span>
                      {order.orderType === "print"
                        ? `${order.printDetails?.totalPages || "N/A"} Pages`
                        : `${order.items?.length || 0} ${
                            order.items?.length === 1 ? "item" : "items"
                          }`}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      {order.payment?.method === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </span>
                  </div>

                  <div className="border-t border-grey-200 pt-6 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                      <p className="text-sm text-secondary-500 mb-2">Total Amount</p>
                      <p className="text-xl font-bold text-grey-900">
                        {formatPrice(order.totalPrice)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                      <Link
                        to={`/order/${order.orderId}`}
                        className="flex items-center gap-2 px-5 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-grey-50 transition-colors font-medium text-base w-full sm:w-auto justify-center"
                      >
                        <MdReceipt size={20} />
                        View Details
                      </Link>
                     
                      
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
