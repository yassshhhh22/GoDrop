import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MdLocationOn, MdAdd } from "react-icons/md";
import useCartStore from "../../stores/cartStore.js";
import useConfigStore from "../../stores/configStore.js";
import useAddressStore from "../../stores/addressStore.js";
import useAuthStore from "../../stores/authStore.js";
import useOrderStore from "../../stores/orderStore.js";
import AddAddress from "../../components/forms/AddAddress";
import { formatPrice } from "../../utils/priceFormatter.js";
import { createOrder } from "../../services/order.service.js";
import { useRazorpay } from "../../hooks/useRazorpay.js";
import { successAlert, errorAlert } from "../../utils/alerts.jsx";
import Loading from "../../components/layout/Loading.jsx";
import CouponInput from "../../components/cart/CouponInput";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [registeredAddress, setRegisteredAddress] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  const {
    fetchDeliveryConfig,
    getDeliveryFee,
    qualifiesForFreeDelivery,
    giftWrapCharge,
  } = useConfigStore();

  const items = useCartStore((state) => state.items);
  const _backendSubtotal = useCartStore((state) => state._backendSubtotal);
  const _backendTotalItems = useCartStore((state) => state._backendTotalItems);
  const couponDiscount = useCartStore((state) => state.couponDiscount);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon); // Get applied coupon
  const giftWrap = useCartStore((state) => state.giftWrap);
  const toggleGiftWrap = useCartStore((state) => state.toggleGiftWrap);
  const setGiftWrapMessage = useCartStore((state) => state.setGiftWrapMessage);
  const clearCart = useCartStore((state) => state.clearCart);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const subtotal = _backendSubtotal || 0;
  const cartCount = _backendTotalItems || 0;
  const deliveryFee = getDeliveryFee(subtotal);
  const giftWrapFee = giftWrap.enabled ? giftWrapCharge : 0;
  const total = subtotal + deliveryFee - couponDiscount + giftWrapFee;

  console.log("💳 Checkout breakdown:", {
    subtotal,
    deliveryFee,
    giftWrapCharge,
    giftWrapFee,
    couponDiscount,
    appliedCoupon: appliedCoupon?.code, // Log applied coupon code
    total,
    configLoaded,
    note: "No tax included",
  });

  const { addresses, fetchAddresses, selectedAddress, selectAddress } =
    useAddressStore();

  const { user, isAuthenticated } = useAuthStore();
  const { addOrder } = useOrderStore();
  const { initiatePayment } = useRazorpay();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    const initializeCheckout = async () => {
      try {
        const config = await fetchDeliveryConfig();
        console.log("✅ Config loaded:", config);
        setConfigLoaded(true);

        await fetchCart();

        if (user?.role !== "BusinessUser") {
          fetchAddresses();
        } else {
          setRegisteredAddress(user.registeredAddress);
        }
      } catch (error) {
        console.error("❌ Checkout initialization error:", error);
        setConfigLoaded(true);
      }
    };

    initializeCheckout();
  }, [
    isAuthenticated,
    items.length,
    user,
    fetchDeliveryConfig,
    fetchCart,
    fetchAddresses,
  ]);

  useEffect(() => {
    if (user?.role === "BusinessUser" && user?.registeredAddress) {
      setSelectedAddressId("registered");
      selectAddress("registered");
    } else if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((addr) => addr.isDefault);
      const addressToSelect = defaultAddr || addresses[0];
      setSelectedAddressId(addressToSelect._id);
      selectAddress(addressToSelect._id);
    }
  }, [addresses, user]);

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    selectAddress(addressId);
  };

  const handleCashOnDelivery = async () => {
    if (!selectedAddressId) {
      errorAlert("Please select a delivery address");
      return;
    }

    try {
      setIsProcessing(true);

      // ✅ Log coupon details before sending
      console.log("📝 COD Order Summary:", {
        subtotal,
        couponDiscount,
        appliedCoupon: appliedCoupon?.code,
        deliveryFee,
        giftWrapFee,
        total,
      });

      const orderData = {
        deliveryAddress: {
          label: selectedAddress.label,
          address: selectedAddress.address,
          landmark: selectedAddress.landmark || "",
          city: selectedAddress.city || "",
          state: selectedAddress.state || "",
          pincode: selectedAddress.pincode || "",
        },
        paymentMethod: "cod",
        giftWrap: {
          enabled: giftWrap.enabled,
          message: giftWrap.message,
        },
        couponCode: appliedCoupon?.code, // ✅ Pass coupon code
      };

      console.log("📤 Sending order data:", orderData);

      const newOrder = await createOrder(orderData);

      console.log("✅ Order created:", newOrder);

      if (newOrder) {
        // ✅ Verify discount was applied in order
        console.log("💾 Order details from backend:", {
          orderId: newOrder.orderId,
          subtotal: newOrder.pricing.subtotal,
          discount: newOrder.pricing.discount,
          deliveryFee: newOrder.pricing.deliveryFee,
          totalPrice: newOrder.pricing.totalPrice,
        });

        if (newOrder.status === "pending") {
          successAlert(
            "Order placed! Your order is pending admin approval. You'll be notified once confirmed."
          );
        } else {
          successAlert("Order placed successfully!");
        }

        clearCart();
        navigate(`/order-success?orderId=${newOrder.orderId}`);
      }
    } catch (error) {
      console.error("❌ Order creation error:", error);
      errorAlert(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!selectedAddressId) {
      errorAlert("Please select a delivery address");
      return;
    }

    try {
      setIsProcessing(true);

      // ✅ Log coupon details before sending
      console.log("📝 Online Payment Order Summary:", {
        subtotal,
        couponDiscount,
        appliedCoupon: appliedCoupon?.code,
        deliveryFee,
        giftWrapFee,
        total,
      });

      const orderData = {
        deliveryAddress: {
          label: selectedAddress.label,
          address: selectedAddress.address,
          landmark: selectedAddress.landmark || "",
          city: selectedAddress.city || "",
          state: selectedAddress.state || "",
          pincode: selectedAddress.pincode || "",
        },
        paymentMethod: "razorpay",
        giftWrap: {
          enabled: giftWrap.enabled,
          message: giftWrap.message,
        },
        couponCode: appliedCoupon?.code, // ✅ Pass coupon code
      };

      console.log("📤 Sending payment order data:", orderData);

      await initiatePayment(orderData);
    } catch (error) {
      console.error("❌ Payment initiation error:", error);
      errorAlert("Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  const handleRegisteredAddressChange = (e) => {
    const { name, value } = e.target;
    setRegisteredAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisteredAddressSave = async () => {
    if (!registeredAddress?.address || !registeredAddress?.city) {
      return errorAlert("Please fill in all required fields");
    }

    try {
      setIsProcessing(true);

      // Here you would typically make an API call to save the registered address
      // For this example, we'll just simulate a successful save with a timeout
      setTimeout(() => {
        successAlert("Registered address updated successfully!");
        selectAddress("registered");
        setSelectedAddressId("registered");
      }, 1000);
    } catch (error) {
      errorAlert("Failed to update registered address");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Add a loading state while config is loading
  if (!configLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-secondary-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <section className="bg-secondary-50 min-h-screen">
      <div className="container mx-auto p-4 flex flex-col lg:flex-row w-full gap-8 justify-between">
        {/* Left Section - Address Selection */}
        <div className="w-full">
          <h3 className="text-lg font-semibold text-grey-900 mb-6">
            {user?.role === "BusinessUser"
              ? "Delivery Address"
              : "Choose your delivery address"}
          </h3>

          <div className="bg-grey-50 p-6 rounded-lg border border-grey-200 space-y-6">
            {user?.role === "BusinessUser" ? (
              registeredAddress ? (
                <div className="border-2 border-primary-600 bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-grey-900">
                      Registered Business Address
                    </span>
                    <Link
                      to="/business/profile"
                      className="text-xs text-primary-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                  <p className="text-grey-900 mb-1">
                    {registeredAddress.street}
                  </p>
                  {registeredAddress.landmark && (
                    <p className="text-secondary-500 text-sm mb-1">
                      Landmark: {registeredAddress.landmark}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-secondary-500 text-sm">
                    {registeredAddress.city && (
                      <span>{registeredAddress.city}</span>
                    )}
                    {registeredAddress.state && (
                      <span>• {registeredAddress.state}</span>
                    )}
                    {registeredAddress.pincode && (
                      <span>• {registeredAddress.pincode}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-error mb-4">
                    No registered address found. Please update your business
                    profile.
                  </p>
                  <Link
                    to="/business/profile"
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-grey-50 rounded-lg font-medium transition-colors inline-block"
                  >
                    Update Business Profile
                  </Link>
                </div>
              )
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MdLocationOn
                  size={48}
                  className="mx-auto text-secondary-300 mb-3"
                />
                <p className="text-secondary-500 mb-4">No saved addresses</p>
                <button
                  onClick={() => setOpenAddressModal(true)}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-grey-50 rounded-lg font-medium transition-colors"
                >
                  Add Delivery Address
                </button>
              </div>
            ) : (
              <>
                {addresses.map((address, index) => (
                  <label
                    key={address._id}
                    htmlFor={`address-${index}`}
                    className="block cursor-pointer"
                  >
                    <div
                      className={`border-2 rounded-lg p-4 transition-all ${
                        selectedAddressId === address._id
                          ? "border-primary-600 bg-primary-50"
                          : "border-grey-200 bg-grey-50 hover:bg-secondary-50"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="pt-1">
                          <input
                            id={`address-${index}`}
                            type="radio"
                            value={address._id}
                            checked={selectedAddressId === address._id}
                            onChange={() => handleAddressSelect(address._id)}
                            name="address"
                            className="w-4 h-4 accent-primary-600"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-grey-900">
                              {address.label}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-primary-600 text-grey-50 rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-grey-900 mb-1">
                            {address.address}
                          </p>
                          {address.landmark && (
                            <p className="text-secondary-500 text-sm mb-1">
                              Landmark: {address.landmark}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 text-secondary-500 text-sm">
                            {address.city && <span>{address.city}</span>}
                            {address.state && <span>• {address.state}</span>}
                            {address.pincode && (
                              <span>• {address.pincode}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}

                <button
                  onClick={() => setOpenAddressModal(true)}
                  className="w-full h-16 bg-secondary-50 border-2 border-dashed border-grey-300 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition-colors group"
                >
                  <MdAdd
                    size={24}
                    className="text-secondary-500 group-hover:text-primary-600"
                  />
                  <span className="font-medium text-secondary-500 group-hover:text-primary-600">
                    Add New Address
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className="w-full max-w-md">
          <div className="bg-grey-50 rounded-lg border border-grey-200 p-8 sticky top-24">
            <h3 className="text-lg font-semibold text-grey-900 mb-6">
              Order Summary
            </h3>

            {/* Bill Details */}
            <div className="space-y-6 mb-6 pb-6 border-b border-grey-200">
              <div className="flex justify-between text-grey-900 items-center">
                <p>Items Total ({cartCount} items)</p>
                <p className="font-medium">{formatPrice(subtotal)}</p>
              </div>

              {deliveryFee > 0 ? (
                <div className="flex justify-between text-grey-900 items-center">
                  <p>Delivery Fee</p>
                  <p className="font-medium">{formatPrice(deliveryFee)}</p>
                </div>
              ) : (
                <div className="flex justify-between text-primary-600 items-center">
                  <p className="flex items-center gap-1">
                    Delivery Fee <span className="text-xs">🎉</span>
                  </p>
                  <p className="font-medium">FREE</p>
                </div>
              )}

              {couponDiscount > 0 && user?.role !== "BusinessUser" && (
                <div className="flex justify-between text-primary-600 items-center">
                  <p>Coupon Discount</p>
                  <p className="font-medium">-{formatPrice(couponDiscount)}</p>
                </div>
              )}

              {/* Gift Wrap Option - Only for non-business users */}
              {user?.role !== "BusinessUser" && (
                <>
                  <div className="flex items-center justify-between text-grey-900">
                    <label
                      htmlFor="giftWrapToggle"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        id="giftWrapToggle"
                        checked={giftWrap.enabled}
                        onChange={toggleGiftWrap}
                        className="w-4 h-4 accent-primary-600"
                      />
                      <span>Gift Wrap</span>
                    </label>
                    <span className="font-medium">
                      {formatPrice(giftWrapFee)}
                    </span>
                  </div>

                  {giftWrap.enabled && (
                    <textarea
                      className="w-full p-3 border border-grey-200 rounded-lg text-sm"
                      rows="2"
                      placeholder="Add a gift message (optional, max 200 characters)"
                      value={giftWrap.message}
                      onChange={(e) => setGiftWrapMessage(e.target.value)}
                      maxLength={200}
                    ></textarea>
                  )}
                </>
              )}
            </div>

            {/* Coupon Input Section - Only for non-business users */}
            {user?.role !== "BusinessUser" && (
              <div className="mb-6">
                <CouponInput />
              </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-grey-200">
              <p className="font-semibold text-grey-900 text-lg">Grand Total</p>
              <p className="font-bold text-grey-900 text-2xl">
                {formatPrice(total)}
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-8">
              <p className="font-medium text-grey-900 mb-4">
                Select Payment Method
              </p>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border-2 border-grey-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-grey-900 font-medium">
                    Online Payment
                  </span>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-grey-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-grey-900 font-medium">
                    Cash on Delivery
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {paymentMethod === "razorpay" ? (
                <button
                  onClick={handleOnlinePayment}
                  disabled={!selectedAddressId || isProcessing}
                  className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-grey-300 disabled:cursor-not-allowed text-grey-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  {isProcessing ? <>Processing...</> : "Pay Online"}
                </button>
              ) : (
                <button
                  onClick={handleCashOnDelivery}
                  disabled={!selectedAddressId || isProcessing}
                  className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-grey-300 disabled:cursor-not-allowed text-grey-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  {isProcessing ? <>Placing Order...</> : "Place Order"}
                </button>
              )}
            </div>

            {/* Info Text */}
            <p className="text-xs text-secondary-500 text-center mt-8">
              By placing this order, you agree to our Terms & Conditions
            </p>
          </div>
        </div>
      </div>

      {/* Add Address Modal - Only for Customer */}
      {openAddressModal && user?.role !== "BusinessUser" && (
        <AddAddress close={() => setOpenAddressModal(false)} />
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-grey-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-grey-50 p-6 rounded-lg text-center">
            <Loading size={100} />
            <p className="mt-4 text-grey-900 font-medium">
              Processing your order...
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default CheckoutPage;
