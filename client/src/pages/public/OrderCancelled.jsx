import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MdCancel, MdHome } from "react-icons/md";
import useOrderStore from "../../stores/orderStore";
import useCartStore from "../../stores/cartStore";

const OrderCancelled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);

  const { fetchOrderById, selectedOrder } = useOrderStore();
  const { clearCart } = useCartStore();

  // Get order ID from URL params or state
  const orderId = searchParams.get("orderId") || searchParams.get("order_id");

  useEffect(() => {
    // Fetch order details if orderId is present
    if (orderId) {
      fetchOrderById(orderId).then((order) => {
        if (order) {
          setOrderDetails(order);
        }
      });
    }

    // Clear cart on mount (order was attempted)
    clearCart();
  }, [orderId]);

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  const handleRetry = () => {
    if (orderDetails) {
      navigate("/checkout", {
        state: {
          retryOrder: true,
          previousOrderId: orderId,
        },
      });
    } else {
      navigate("/cart");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-error bg-opacity-10 border-2 border-error rounded-lg p-6 py-8 mx-auto flex flex-col justify-center items-center gap-6 shadow-lg">
        {/* Icon */}
        <div className="bg-error rounded-full p-4">
          <MdCancel size={64} className="text-gray-50" />
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-error font-bold text-2xl mb-2">Order Cancelled</p>
          {orderDetails ? (
            <div className="text-secondary-600 space-y-1">
              <p className="text-sm">
                Order ID:{" "}
                <span className="font-medium">{orderDetails.orderId}</span>
              </p>
              {orderDetails.cancellationReason && (
                <p className="text-sm italic">
                  "{orderDetails.cancellationReason}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-secondary-600 text-sm">
              Your order was not completed. Please try again.
            </p>
          )}
        </div>

        {/* Payment Info (if payment failed) */}
        {searchParams.get("error") && (
          <div className="w-full bg-warning bg-opacity-10 border border-warning rounded p-3">
            <p className="text-sm text-gray-900 text-center">
              <strong>Payment Failed:</strong>{" "}
              {decodeURIComponent(searchParams.get("error"))}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-error text-error hover:bg-error hover:text-gray-50 transition-all px-6 py-3 rounded-lg font-medium"
          >
            <MdHome size={20} />
            Go To Home
          </Link>

          <button
            onClick={handleRetry}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-gray-50 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retry Order
          </button>
        </div>

        {/* Additional Help */}
        <div className="text-center mt-4">
          <p className="text-sm text-secondary-500">
            Need help?{" "}
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-700 font-medium underline"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderCancelled;
