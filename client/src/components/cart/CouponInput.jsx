import React, { useState } from "react";
import { MdLocalOffer, MdClose } from "react-icons/md";
import { useForm } from "react-hook-form";
import useCartStore from "../../stores/cartStore";
import * as couponService from "../../services/coupon.service.js";
import { errorAlert, successAlert } from "../../utils/alerts.jsx";
import Loading from "../layout/Loading";

const CouponInput = () => {
  const {
    appliedCoupon,
    couponDiscount,
    _backendSubtotal,
    fetchCart,
    removeCouponCode,
  } = useCartStore();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const couponCodeInput = watch("couponCode");

  const subtotal = _backendSubtotal || 0;

  const handleApplyCoupon = async (data) => {
    if (!data.couponCode || data.couponCode.trim() === "") {
      errorAlert("Please enter a coupon code");
      return;
    }

    setLoading(true);
    try {
      console.log("🎟️ Applying coupon:", data.couponCode);

      const result = await couponService.applyCoupon(data.couponCode);

      if (result && result.coupon) {
        console.log("✅ Coupon applied:", result);
        successAlert(`Coupon ${result.coupon.code} applied successfully!`);
        reset();

        // ✅ CRITICAL: Fetch cart to update ALL state including discount
        console.log("🔄 Fetching updated cart...");
        await fetchCart();
        console.log("✅ Cart updated with coupon discount");
      }
    } catch (err) {
      console.error("❌ Coupon error:", err.response?.data || err.message);
      errorAlert(err.response?.data?.message || "Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setLoading(true);
    try {
      console.log("🗑️ Removing coupon...");
      await removeCouponCode();
      successAlert("Coupon removed successfully!");

      // No need to call fetchCart again, store does it
      console.log("✅ Cart updated after removing coupon");
    } catch (err) {
      console.error(
        "❌ Remove coupon error:",
        err.response?.data || err.message
      );
      errorAlert(err.response?.data?.message || "Failed to remove coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <MdLocalOffer size={20} className="text-primary-600" />
        Apply Coupon
      </h3>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-primary-50 border border-primary-200 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary-600">
              {appliedCoupon.code}
            </span>
            <span className="text-sm text-secondary-600">
              Save ₹{couponDiscount || 0}
            </span>
          </div>
          <button
            onClick={handleRemoveCoupon}
            disabled={loading}
            className="text-error hover:text-error/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loading size={16} /> : <MdClose size={20} />}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(handleApplyCoupon)}
          className="flex flex-col gap-2"
        >
          <input
            type="text"
            placeholder="Enter coupon code"
            {...register("couponCode", {
              required: false,
              minLength: { value: 1, message: "Coupon code required" },
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none disabled:bg-secondary-50 disabled:cursor-not-allowed"
            disabled={loading}
          />
          {errors.couponCode && (
            <p className="text-error text-sm">{errors.couponCode.message}</p>
          )}

          <button
            type="submit"
            disabled={
              loading || !couponCodeInput || couponCodeInput.trim() === ""
            }
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-50 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loading size={16} />
                Applying...
              </>
            ) : (
              "Apply"
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default CouponInput;
