import React, { useEffect } from "react";
import { MdLocalOffer } from "react-icons/md";
import useCartStore from "../../stores/cartStore";
import useConfigStore from "../../stores/configStore";
import { formatPrice } from "../../utils/priceFormatter";
// Import CouponInput
import CouponInput from "./CouponInput";

const CartSummary = ({ onCheckout, showCouponSection = true }) => {
  // ✅ NEW: Use config store
  const {
    getDeliveryFee,
    getAmountForFreeDelivery,
    fetchDeliveryConfig,
    giftWrapCharge,
  } = useConfigStore();

  // ✅ Use cart selectors
  const subtotal = useCartStore((state) => state.subtotal);
  const couponDiscount = useCartStore((state) => state.couponDiscount);
  const total = useCartStore((state) => state.total);
  const cartCount = useCartStore((state) => state.cartCount);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const giftWrap = useCartStore((state) => state.giftWrap); // Get giftWrap state

  // ✅ Calculate delivery fee from config
  const deliveryFee = getDeliveryFee(subtotal);
  const giftWrapFee = giftWrap.enabled ? giftWrapCharge : 0; // Calculate gift wrap fee

  // ✅ Fetch config on mount
  useEffect(() => {
    fetchDeliveryConfig();

    // ✅ Log cart changes
    console.log("📊 CartSummary state updated:", {
      subtotal,
      couponDiscount,
      deliveryFee,
      giftWrapFee,
      total,
      appliedCoupon: appliedCoupon?.code,
    });
  }, [
    fetchDeliveryConfig,
    subtotal,
    couponDiscount,
    deliveryFee,
    giftWrapFee,
    total,
    appliedCoupon,
  ]);

  if (cartCount === 0) {
    return null;
  }

  return (
    <div className="p-4 space-y-3">
      {/* Bill Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-900">
          <span>Item Total ({cartCount} items)</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {deliveryFee > 0 && (
          <div className="flex justify-between text-gray-900">
            <span>Delivery Fee</span>
            <span className="font-medium">{formatPrice(deliveryFee)}</span>
          </div>
        )}

        {deliveryFee === 0 && (
          <div className="flex justify-between text-primary-600">
            <span className="flex items-center gap-1">
              <span>Delivery Fee</span>
              <span className="text-xs">🎉</span>
            </span>
            <span className="font-medium">FREE</span>
          </div>
        )}

        {/* ✅ CRITICAL: Show coupon discount BEFORE CouponInput */}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-primary-600">
            <span className="flex items-center gap-1">
              <MdLocalOffer size={16} />
              Coupon Discount
              {appliedCoupon && (
                <span className="text-xs">({appliedCoupon.code})</span>
              )}
            </span>
            <span className="font-medium text-lg">
              -{formatPrice(couponDiscount)}
            </span>
          </div>
        )}

        {giftWrap.enabled && (
          <div className="flex justify-between text-gray-900">
            <span>Gift Wrap</span>
            <span className="font-medium">{formatPrice(giftWrapFee)}</span>
          </div>
        )}

        {/* Coupon Input Section */}
        {showCouponSection && <CouponInput />}

        {deliveryFee > 0 && (
          <p className="text-xs text-warning bg-warning bg-opacity-10 p-2 rounded">
            Add {formatPrice(getAmountForFreeDelivery(subtotal))} more for FREE
            delivery
          </p>
        )}
      </div>

      {/* Total */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-gray-900">To Pay</span>
          <span className="font-bold text-xl text-gray-900">
            {formatPrice(total)}
          </span>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          disabled={cartCount === 0}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-50 py-3 rounded-lg font-semibold transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>

      {/* Savings Info */}
      {couponDiscount > 0 && (
        <p className="text-xs text-center text-primary-600 font-semibold">
          ✅ You're saving {formatPrice(couponDiscount)} on this order! 🎉
        </p>
      )}
    </div>
  );
};

export default CartSummary;
