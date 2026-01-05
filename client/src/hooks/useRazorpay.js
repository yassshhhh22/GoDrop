import { useEffect, useState } from "react";
import { errorAlert, successAlert } from "../utils/alerts";
import api from "../services/api";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore"; // ✅ ADD: Import cart store
import { useNavigate } from "react-router-dom";

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart); // ✅ ADD: Get clearCart
  const giftWrap = useCartStore((state) => state.giftWrap); // Get giftWrap state
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async (orderData) => {
    try {
      setIsLoading(true);

      console.log("🔑 Initiating payment with order data:", orderData);

      // ✅ NEW: Step 1 - Create Razorpay order WITHOUT creating DB order
      // This endpoint will return razorpayOrderId and amount from cart
      const paymentOrder = await api.post("/payment/create-razorpay-order", {
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        giftWrap: giftWrap, // Pass giftWrap
      });

      console.log("💳 Razorpay order created:", paymentOrder.data);

      const { razorpayOrderId, amount, currency } = paymentOrder.data.data;

      // ✅ Step 2: Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        errorAlert("Failed to load payment gateway. Please try again.");
        setIsLoading(false);
        return false;
      }

      // ✅ Step 3: Get Razorpay key from environment
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!keyId || keyId === "rzp_test_your_key_here") {
        errorAlert("Payment gateway not configured. Please contact support.");
        setIsLoading(false);
        return false;
      }

      // ✅ Step 4: Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount * 100,
        currency: currency,
        name: "GoDrop",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            // ✅ Create order AFTER payment success
            const verifyResponse = await api.post(
              "/payment/verify-and-create-order",
              {
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                deliveryAddress: orderData.deliveryAddress,
                paymentMethod: orderData.paymentMethod,
                giftWrap: giftWrap, // Pass giftWrap
              }
            );

            if (verifyResponse.data.success) {
              // ✅ Clear cart from frontend store
              clearCart();

              successAlert(
                "Payment successful! Your order is pending admin approval."
              );
              setIsLoading(false);

              // ✅ Navigate to orders page
              navigate("/orders");

              return true;
            } else {
              errorAlert("Payment verified but order creation failed.");
              setIsLoading(false);
              return false;
            }
          } catch (error) {
            console.error("❌ Error creating order:", error);
            errorAlert(
              error.response?.data?.message ||
                "Payment successful but order creation failed."
            );
            setIsLoading(false);
            return false;
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#0749A2",
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            errorAlert("Payment cancelled.");
          },
        },
      };

      console.log("🚀 Opening Razorpay checkout...");

      if (!window.Razorpay) {
        errorAlert("Razorpay is not loaded. Please refresh and try again.");
        setIsLoading(false);
        return false;
      }

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("❌ Payment failed:", response.error);
        setIsLoading(false);
        errorAlert(
          response.error.description || "Payment failed. Please try again."
        );
      });

      rzp.open();

      // ✅ IMPORTANT: Return true immediately, actual success is handled in the handler
      return true;
    } catch (error) {
      console.error("❌ Payment initiation error:", error);
      errorAlert(
        error.response?.data?.message ||
          error.message ||
          "Failed to initiate payment"
      );
      setIsLoading(false);
      return false;
    }
  };

  return { initiatePayment };
};
