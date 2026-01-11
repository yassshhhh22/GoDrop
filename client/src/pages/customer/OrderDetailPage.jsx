import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  MdArrowBack,
  MdLocalShipping,
  MdPayment,
  MdCancel,
} from "react-icons/md";
import useOrderStore from "../../stores/orderStore";
import useAuthStore from "../../stores/authStore";
import { formatPrice } from "../../utils/priceFormatter";
import Loading from "../../components/layout/Loading";
import ConfirmBox from "../../components/layout/ConfirmBox";
import { successAlert, errorAlert } from "../../utils/alerts.jsx";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, fetchOrderById, cancelOrder, isLoading } =
    useOrderStore();
  const { getCustomerType } = useAuthStore();
  const customerType = getCustomerType();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (orderId) {
      const { orderType } = location.state || {};
      fetchOrderById(orderId, orderType);
    }
  }, [orderId, location.state]);

  // Professional status badge (same style as delivered)
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

  // ✅ NEW: Check if order can be cancelled
  const canCancel = () => {
    if (!selectedOrder) return false;
    return ["pending", "confirmed"].includes(selectedOrder.status);
  };

  // ✅ NEW: Handle cancel order
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      errorAlert("Please provide a cancellation reason");
      return;
    }

    try {
      const cancelled = await cancelOrder(orderId, cancelReason);

      if (cancelled) {
        setShowCancelConfirm(false);
        setCancelReason("");
        // Refresh order data
        fetchOrderById(orderId);
      }
    } catch (error) {
      errorAlert("Failed to cancel order");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size={150} />
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-secondary-500 mb-4">Order not found</p>
          <Link
            to="/orders"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-gray-50 rounded-lg font-medium transition-colors inline-block"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = selectedOrder;

  return (
    <div className="bg-gray-50 min-h-screen flex items-start justify-center py-8 px-2 sm:px-4">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-0 flex flex-col justify-center mt-8">
        {/* Header */}
        <div className="px-4 md:px-6 pt-6 md:pt-8 pb-2">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <MdArrowBack size={20} />
            Back to Orders
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Order #{order.orderId}
              </h1>
              <p className="text-secondary-500">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 mx-4 mt-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-4">
            {order.orderType === "print" ? "Print Files" : "Items"}
          </h2>
          <div className="space-y-6">
            {order.orderType === "print" ? (
              order.printDetails?.files?.length > 0 ? (
                order.printDetails.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 items-center"
                  >
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {file.filename}
                      </h3>
                      <p className="text-sm text-secondary-500 mb-1">
                        Pages: {file.pageCount} | Type: {file.fileType}
                      </p>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 text-sm hover:underline"
                      >
                        View File
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary-500 text-center">
                  No print files found.
                </p>
              )
            ) : (
              order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <img
                    src={item.item?.images?.[0] || "/placeholder.png"}
                    alt={item.item?.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.item?.name}
                    </h3>
                    <p className="text-sm text-secondary-500 mb-1">
                      Quantity: {item.count}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(
                        customerType === "Business"
                          ? (item.item?.businessPrice || 0) * (item.count || 1)
                          : (item.item?.discountPrice || 0) * (item.count || 1)
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 mx-4">
          <h2 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <MdLocalShipping size={24} />
            Delivery Address
          </h2>
          <div className="text-secondary-600 space-y-1">
            <p>{order.deliveryAddress?.address}</p>
            {order.deliveryAddress?.landmark && (
              <p>Landmark: {order.deliveryAddress.landmark}</p>
            )}
            <p>
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{" "}
              {order.deliveryAddress?.pincode}
            </p>
          </div>
        </div>

        {/* Payment & Pricing */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 mx-4">
          <h2 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <MdPayment size={24} />
            Payment Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-secondary-600">Items Total</span>
              <span className="font-medium text-gray-900">
                {formatPrice(order.pricing?.subtotal || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Delivery Fee</span>
              <span className="font-medium text-gray-900">
                {formatPrice(order.pricing?.deliveryFee || 0)}
              </span>
            </div>
            {/* Giftwrap Section */}
            {order.pricing?.giftWrapFee > 0 && (
              <div className="flex justify-between">
                <span className="text-secondary-600">Giftwrap</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.pricing.giftWrapFee)}
                </span>
              </div>
            )}
            {/* Coupon Section */}
            {order.pricing?.discount > 0 && order.appliedCoupon && (
              <div className="flex justify-between">
                <span className="text-secondary-600">
                  Coupon ({order.appliedCoupon?.code || "Applied"})
                </span>
                <span className="font-medium text-green-700">
                  -{formatPrice(order.pricing.discount)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="font-bold text-gray-900 text-xl">
                {formatPrice(order.pricing?.totalPrice || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Payment Method</span>
              <span className="font-medium text-gray-900">
                {order.payment?.method === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </span>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mx-4 mb-8">
          <h2 className="font-semibold text-gray-900 text-lg mb-4">
            Order Actions
          </h2>
          <div className="flex flex-col gap-4">
            {/* Cancel Order Button - Only if cancellable */}
            {canCancel() && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-error hover:bg-error/90 text-white rounded-xl font-semibold transition-all duration-200 focus:outline-none text-base"
                style={{ minHeight: "48px" }}
              >
                <MdCancel size={20} />
                Cancel Order
              </button>
            )}
            {/* Track Order Button - If in transit */}
            {["picked", "arriving"].includes(order.status) && (
              <Link
                to={`/track-order/${orderId}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-gray-50 rounded-xl font-semibold transition-all duration-200 focus:outline-none text-base"
                style={{ minHeight: "48px" }}
              >
                <MdLocalShipping size={20} />
                Track Order
              </Link>
            )}
          </div>
          {/* Cancellation Info */}
          {!canCancel() &&
            order.status !== "delivered" &&
            order.status !== "cancelled" && (
              <p className="text-sm text-secondary-500 mt-4 text-center">
                Order cannot be cancelled at this stage
              </p>
            )}
        </div>
      </div>
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed backdrop-blur-xl inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cancel Order
            </h3>
            <p className="text-secondary-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>

            {/* Cancellation Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Reason for cancellation <span className="text-error">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Changed my mind, Found better price..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-error focus:border-error outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setCancelReason("");
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary-200 hover:bg-secondary-300 text-gray-900 rounded-xl font-semibold transition-all duration-200 focus:outline-none text-base"
                style={{ minHeight: "48px" }}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-error hover:bg-error/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 focus:outline-none text-base"
                style={{ minHeight: "48px" }}
              >
                {isLoading ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
