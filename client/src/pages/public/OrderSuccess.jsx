import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MdCheckCircle, MdShoppingBag, MdHome } from "react-icons/md";
import useOrderStore from "../../stores/orderStore";
import useCartStore from "../../stores/cartStore";
import { formatPrice } from "../../utils/priceFormatter";
import { formatDate } from "../../utils/dateHelpers";
import Loading from "../../components/layout/Loading";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  const { fetchOrderById, selectedOrder } = useOrderStore();
  const { clearCart } = useCartStore();

  // Get order ID from URL params
  const orderId = searchParams.get("orderId") || searchParams.get("order_id");

  useEffect(() => {
    if (!orderId) {
      navigate("/", { replace: true });
      return;
    }

    // Fetch order details
    const loadOrder = async () => {
      setIsLoadingOrder(true);
      await fetchOrderById(orderId);
      setIsLoadingOrder(false);
    };

    loadOrder();

    // Clear cart after successful order
    clearCart();
  }, [orderId]);

  if (isLoadingOrder) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loading size={150} />
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-secondary-500 mb-4">Order not found</p>
          <Link
            to="/"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-gray-50 rounded-lg font-medium transition-colors inline-block"
          >
            Go To Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-primary-600 bg-opacity-10 border-2 border-primary-600 rounded-lg p-6 py-8 mx-auto shadow-lg">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary-600 rounded-full p-4">
            <MdCheckCircle size={64} className="text-gray-50" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-primary-600 font-bold text-3xl mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-secondary-600">
            Thank you for your order. Check My orders for your order status
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="font-semibold text-gray-900 text-lg mb-4">
            Order Details
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-secondary-500">Order ID</p>
              <p className="font-semibold text-gray-900">
                {selectedOrder.orderId}
              </p>
            </div>

            <div>
              <p className="text-secondary-500">Order Date</p>
              <p className="font-semibold text-gray-900">
                {formatDate(selectedOrder.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-secondary-500">
                {selectedOrder.orderType === "print"
                  ? "Total Files"
                  : "Total Items"}
              </p>
              <p className="font-semibold text-gray-900">
                {selectedOrder.orderType === "print"
                  ? `${selectedOrder.printDetails?.files?.length || 0} file(s)`
                  : `${selectedOrder.items.length} ${
                      selectedOrder.items.length === 1 ? "item" : "items"
                    }`}
              </p>
            </div>

            <div>
              <p className="text-secondary-500">Total Amount</p>
              <p className="font-semibold text-gray-900 text-lg">
                {formatPrice(selectedOrder.totalPrice)}
              </p>
            </div>

            <div>
              <p className="text-secondary-500">Payment Method</p>
              <p className="font-semibold text-gray-900">
                {selectedOrder.payment?.method === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
            </div>

            <div>
              <p className="text-secondary-500">Status</p>
              <span className="inline-block px-3 py-1 bg-warning text-gray-900 rounded-full text-xs font-medium">
                {selectedOrder.status}
              </span>
            </div>
          </div>

          {/* Order Breakdown */}
          {selectedOrder.pricing && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600">Items Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(selectedOrder.pricing.subtotal)}
                </span>
              </div>
              {selectedOrder.pricing.discount > 0 && (
                <div className="flex justify-between text-primary-600">
                  <span>Coupon Discount</span>
                  <span className="font-medium">
                    -{formatPrice(selectedOrder.pricing.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-secondary-600">Delivery Fee</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(selectedOrder.pricing.deliveryFee)}
                </span>
              </div>
              {selectedOrder.pricing.giftWrapFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-secondary-600">Gift Wrap</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(selectedOrder.pricing.giftWrapFee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                <span className="text-gray-900">Total Price</span>
                <span className="text-gray-900">
                  {formatPrice(selectedOrder.pricing.totalPrice)}
                </span>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {selectedOrder.deliveryAddress && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-secondary-500 text-sm mb-1">
                Delivery Address
              </p>
              <p className="text-gray-900 text-sm">
                {selectedOrder.deliveryAddress.address}
                {selectedOrder.deliveryAddress.landmark &&
                  `, ${selectedOrder.deliveryAddress.landmark}`}
              </p>
              <p className="text-gray-900 text-sm">
                {selectedOrder.deliveryAddress.city &&
                  `${selectedOrder.deliveryAddress.city}, `}
                {selectedOrder.deliveryAddress.state &&
                  `${selectedOrder.deliveryAddress.state} `}
                {selectedOrder.deliveryAddress.pincode}
              </p>
            </div>
          )}

          {/* Estimated Delivery */}
          {selectedOrder.estimatedDeliveryTime && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-secondary-500 text-sm mb-1">
                Estimated Delivery
              </p>
              <p className="text-gray-900 font-medium">
                {formatDate(selectedOrder.estimatedDeliveryTime)}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/order/${selectedOrder.orderId}`}
            state={{ orderType: selectedOrder.orderType }}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-gray-50 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <MdShoppingBag size={20} />
            View Details
          </Link>

          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-primary-600 bg-gray-50 text-primary-600 hover:bg-primary-600 hover:text-gray-50 transition-all px-6 py-3 rounded-lg font-medium"
          >
            <MdHome size={20} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
