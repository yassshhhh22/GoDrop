import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { FaCaretRight } from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
import { MdShoppingCart } from "react-icons/md";
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
      className="fixed top-0 right-0 w-full max-w-md h-screen bg-white shadow-2xl flex flex-col z-50 border-l border-gray-200"
      style={{ animation: "slideInRight 0.3s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-center p-4 gap-3 justify-between bg-white border-b border-secondary-200">
        <h2 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
          <BsCart4 size={24} />
          <span>Cart ({cartCount})</span>
        </h2>
        <button
          onClick={close}
          className="hover:text-error transition-colors p-2 hover:bg-secondary-100 rounded-full"
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
              <div className="flex items-center justify-between px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                <span>Your total savings</span>
                <span>{formatPrice(savings)}</span>
              </div>
            )}

            {/* Cart Items */}
            <div className="bg-white rounded-2xl p-5 space-y-6 border border-secondary-200">
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
                    <div className="w-20 h-20 bg-secondary-50 border border-secondary-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={product?.images?.[0] || "/placeholder.png"}
                        alt={product?.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-secondary-900 font-semibold truncate">
                        {product?.name}
                      </p>
                      <p className="text-secondary-500 text-sm mt-1">
                        {product?.unit || "piece"}
                      </p>
                      <p className="font-bold text-secondary-900 mt-1 text-lg">
                        {formatPrice(price)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center bg-secondary-50 rounded-lg border border-secondary-200">
                        <AddToCartButton
                          data={product}
                          className="w-14 h-12 text-lg font-bold"
                          btnClassName="w-14 h-12 text-lg"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bill Details */}
            <div className="bg-white rounded-2xl p-4 border border-secondary-200">
              <h3 className="font-semibold text-gray-700 mb-3 text-xs tracking-wide uppercase">
                Bill details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-normal text-xs">
                    Items subtotal
                  </span>
                  <span className="text-gray-900 font-semibold text-sm">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-normal text-xs">
                    Total quantity
                  </span>
                  <span className="text-gray-900 font-semibold text-sm">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-normal text-xs">
                    Delivery charge
                  </span>
                  <span className="text-gray-900 font-semibold text-sm">
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
                    <span className="text-green-600 font-normal text-xs">
                      Coupon discount
                    </span>
                    <span className="text-green-600 font-semibold text-sm">
                      -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                )}
                {giftWrap.enabled && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-normal text-xs">
                      Gift Wrap
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {formatPrice(giftWrapFee)}
                    </span>
                  </div>
                )}
                <div className="border-t border-secondary-200 my-2"></div>
                <div className="flex justify-between items-center font-semibold text-sm">
                  <span className="text-gray-900">Grand total</span>
                  <span className="text-primary-600 font-bold text-base">
                    {formatPrice(total)}
                  </span>
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
          <div className="bg-secondary-50 rounded-xl flex flex-col justify-center items-center py-12 h-full min-h-[380px] border border-secondary-200 mx-2 mt-4 gap-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                <MdShoppingCart size={28} className="text-primary-600" />
              </div>
              <p className="text-gray-900 text-base font-semibold">
                Your cart is empty
              </p>
            </div>
            <Link
              onClick={close}
              to="/"
              className="bg-secondary-300 hover:bg-secondary-800 px-10 py-3 text-white font-bold text-base transition-colors rounded-lg whitespace-nowrap border-2 border-secondary-800 shadow-sm"
            >
              Shop Now
            </Link>
          </div>
        )}
      </div>

      {/* Checkout Button - Fixed at Bottom */}
      {hasItems && (
        <div className="p-0 bg-white border-t border-secondary-200">
          <button
            onClick={redirectToCheckoutPage}
            className="bg-primary-600 hover:bg-primary-700 text-white w-full px-6 font-bold text-lg py-5 rounded-md flex items-center justify-between transition-colors"
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
