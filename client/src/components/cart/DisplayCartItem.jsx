import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { FaCaretRight } from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
import useCartStore from "../../stores/cartStore";
import useConfigStore from "../../stores/configStore.js";
import useAuthStore from "../../stores/authStore.js";
import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "../../utils/priceFormatter.js";
import { warningAlert } from "../../utils/alerts.jsx";
import imageEmpty from "../../assets/empty_cart.webp";

const DisplayCartItem = ({ close }) => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  const {
    getDeliveryFee,
    getAmountForFreeDelivery,
    fetchDeliveryConfig,
    giftWrapCharge,
  } = useConfigStore();

  const items = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const _backendSubtotal = useCartStore((state) => state._backendSubtotal);
  const _backendTotalItems = useCartStore((state) => state._backendTotalItems);
  const couponDiscount = useCartStore((state) => state.couponDiscount);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const giftWrap = useCartStore((state) => state.giftWrap);

  const subtotal = _backendSubtotal || 0;
  const cartCount = _backendTotalItems || 0;
  const deliveryFee = getDeliveryFee(subtotal);
  const giftWrapFee = giftWrap.enabled ? giftWrapCharge : 0;
  const total = subtotal + deliveryFee - couponDiscount + giftWrapFee;

  const { isAuthenticated, getCustomerType } = useAuthStore();
  const customerType = getCustomerType();

  const savings =
    items.reduce((totalSavings, cartItem) => {
      const product = isAuthenticated ? cartItem.item : cartItem;
      if (!product) return totalSavings;

      if (customerType === "Business") {
        const saving =
          (product.price || 0) - (product.businessPrice || product.price || 0);
        return totalSavings + saving * (cartItem.count || 0);
      } else {
        const saving =
          (product.price || 0) - (product.discountPrice || product.price || 0);
        return totalSavings + saving * (cartItem.count || 0);
      }
    }, 0) + couponDiscount;

  useEffect(() => {
    fetchDeliveryConfig();
    const loadCart = async () => {
      if (isAuthenticated) {
        setIsReady(false);
        await fetchCart();
        setIsReady(true);
      } else {
        setIsReady(true);
      }
    };

    loadCart();
  }, [isAuthenticated, fetchCart, fetchDeliveryConfig]);

  const redirectToCheckoutPage = () => {
    if (!isAuthenticated) {
      warningAlert("Please login to proceed to checkout");
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      warningAlert("Your cart is empty");
      return;
    }

    navigate("/checkout");
    if (close) {
      close();
    }
  };

  const hasItems = items.length > 0;

  return (
    <div
      className="fixed top-0 right-0 w-full max-w-md h-screen bg-white shadow-2xl flex flex-col z-50 border-l border-grey-200"
      style={{ animation: "slideInRight 0.3s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-center p-4 shadow-sm gap-3 justify-between bg-white border-b border-grey-200">
        <h2 className="font-bold text-grey-900 text-xl flex items-center gap-2">
          <BsCart4 size={26} />
          <span>Cart ({cartCount})</span>
        </h2>
        <button
          onClick={close}
          className="hover:text-error transition-colors p-2 hover:bg-grey-100 rounded-full"
        >
          <IoClose size={26} />
        </button>
      </div>

      {/* Cart Content - Scrollable */}
      <div className="flex-1 bg-[#f6f6f6] p-0 overflow-y-auto">
        {hasItems ? (
          <div className="space-y-6 px-5 py-5">
            {/* Savings Banner */}
            {savings > 0 && (
              <div className="flex items-center justify-between px-4 py-2 bg-[#e9f8e5] text-green-700 rounded-lg text-base font-semibold">
                <span>Your total savings</span>
                <span>{formatPrice(savings)}</span>
              </div>
            )}

            {/* Cart Items */}
            <div className="bg-white rounded-2xl p-5 space-y-6 shadow-md">
              {items.map((cartItem, index) => {
                const product = isAuthenticated ? cartItem.item : cartItem;
                const quantity = cartItem.count || 0;

                const price = isAuthenticated
                  ? product?.appliedPrice ||
                    product?.discountPrice ||
                    product?.businessPrice ||
                    product?.price ||
                    0
                  : product?.discountPrice || product?.price || 0;

                return (
                  <div
                    key={product?._id + "cartItemDisplay" + index}
                    className="flex w-full gap-4 items-center"
                  >
                    <div className="w-20 h-20 bg-[#f6f6f6] border border-grey-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={product?.images?.[0] || "/placeholder.png"}
                        alt={product?.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-grey-900 font-semibold truncate">
                        {product?.name}
                      </p>
                      <p className="text-secondary-500 text-sm mt-1">
                        {product?.unit || "piece"}
                      </p>
                      <p className="font-bold text-grey-900 mt-1 text-lg">
                        {formatPrice(price)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center bg-[#f6f6f6] rounded-lg border border-grey-200">
                        <AddToCartButton
                          data={product}
                          className="w-10 h-10 text-xl font-bold"
                          btnClassName="w-10 h-10 text-xl"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bill Details */}
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="font-bold text-grey-900 mb-4 text-lg tracking-wide">
                Bill details
              </h3>
              <div className="space-y-4 text-base">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-700 font-medium">
                    Items subtotal
                  </span>
                  <span className="text-grey-900 font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-700 font-medium">
                    Total quantity
                  </span>
                  <span className="text-grey-900 font-semibold">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-700 font-medium">
                    Delivery charge
                  </span>
                  <span className="text-grey-900 font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-primary-600 font-semibold">
                        FREE
                      </span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 font-medium">
                      Coupon discount
                    </span>
                    <span className="text-primary-600 font-semibold">
                      -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                )}
                {giftWrap.enabled && (
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-700 font-medium">
                      Gift Wrap
                    </span>
                    <span className="font-semibold text-grey-900">
                      {formatPrice(giftWrapFee)}
                    </span>
                  </div>
                )}
                <div className="border-t border-grey-200 my-2"></div>
                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="text-grey-900">Grand total</span>
                  <span className="text-grey-900">{formatPrice(total)}</span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-secondary-500 mt-2">
                    Add {formatPrice(getAmountForFreeDelivery(subtotal))} more
                    for FREE delivery
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl flex flex-col justify-center items-center py-8 h-full min-h-[380px] shadow-sm mx-2 mt-4">
            <img
              src={imageEmpty}
              alt="Empty Cart"
              className="w-full max-w-xs h-auto object-scale-down mb-0"
            />
            <div className="flex flex-col items-center justify-center flex-1 w-full mt-2">
              <p className="text-secondary-700 mb-10 text-2xl font-bold text-center">
                Your cart is empty
              </p>
              <Link
                onClick={close}
                to="/"
                className="bg-green-600 hover:bg-green-700 px-10 py-4 text-white rounded-md font-semibold text-lg shadow-md transition-all duration-200 flex items-center justify-center"
                style={{ minWidth: 200, letterSpacing: "0.01em" }}
              >
                Shop Now
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Button - Fixed at Bottom */}
      {hasItems && (
        <div className="p-0 bg-white border-t border-grey-200 shadow-lg">
          <button
            onClick={redirectToCheckoutPage}
            className="bg-[#13a538] hover:bg-[#0e8c2c] text-white w-full px-6 font-bold text-lg py-5 rounded-md flex items-center justify-between transition-colors"
            style={{ minHeight: "60px" }}
          >
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold leading-tight">
                {formatPrice(total)}{" "}
                <span className="text-base font-normal">
                  {cartCount > 0 &&
                    `(${cartCount} item${cartCount > 1 ? "s" : ""})`}
                </span>
              </span>
              <span className="text-xs font-normal opacity-80 mt-1 tracking-wide">
                TOTAL
              </span>
            </div>
            <div className="flex items-center gap-1 text-2xl font-bold">
              <span>Proceed</span>
              <FaCaretRight />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default DisplayCartItem;
