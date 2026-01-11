import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MdHourglassEmpty, MdRefresh, MdHome } from "react-icons/md";
import useOrderStore from "../../stores/orderStore";

const PaymentPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(30);

  const { fetchOrderById } = useOrderStore();

  const orderId = searchParams.get("orderId") || searchParams.get("order_id");

  useEffect(() => {
    if (!orderId) {
      navigate("/", { replace: true });
      return;
    }

    // Auto-refresh countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkPaymentStatus();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId]);

  const checkPaymentStatus = async () => {
    if (orderId) {
      const order = await fetchOrderById(orderId);

      if (order) {
        if (order.paymentStatus === "Completed") {
          navigate(`/order-success?orderId=${orderId}`, { replace: true });
        } else if (order.paymentStatus === "Failed") {
          navigate(`/order-cancelled?orderId=${orderId}`, { replace: true });
        }
      }
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-warning bg-opacity-10 border-2 border-warning rounded-lg p-6 py-8 mx-auto flex flex-col justify-center items-center gap-6 shadow-lg">
        {/* Icon with animation */}
        <div className="bg-warning rounded-full p-4 animate-pulse">
          <MdHourglassEmpty size={64} className="text-gray-900" />
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-gray-900 font-bold text-2xl mb-2">
            Payment Pending
          </p>
          <p className="text-secondary-600 text-sm mb-4">
            We're waiting for payment confirmation. This usually takes a few
            seconds.
          </p>
          {orderId && (
            <p className="text-secondary-600 text-sm">
              Order ID: <span className="font-medium">{orderId}</span>
            </p>
          )}
        </div>

        {/* Auto-refresh info */}
        <div className="w-full bg-gray-50 border border-gray-200 rounded p-4 text-center">
          <p className="text-sm text-secondary-600">
            Auto-refreshing in{" "}
            <span className="font-bold text-gray-900">{countdown}</span>{" "}
            seconds...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-warning h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={checkPaymentStatus}
            className="flex-1 flex items-center justify-center gap-2 bg-warning hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <MdRefresh size={20} />
            Check Status
          </button>

          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-warning text-gray-900 hover:bg-warning transition-all px-6 py-3 rounded-lg font-medium"
          >
            <MdHome size={20} />
            Go To Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-secondary-500">
            If payment was successful, you'll be redirected automatically.
          </p>
          <p className="text-xs text-secondary-500 mt-1">
            Contact support if this takes too long.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
