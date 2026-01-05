import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { MdShoppingCart } from "react-icons/md";
import useCartStore from "../../stores/cartStore";
import useAuthStore from "../../stores/authStore";
import DisplayCartItem from "../../components/cart/DisplayCartItem";
import CartSummary from "../../components/cart/CartSummary";
import EmptyCart from "../../components/cart/EmptyCart";
import Loading from "../../components/layout/Loading";

const CartMobilePage = () => {
  const navigate = useNavigate();
  const { items, fetchCart, isLoading, cartCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <Loading size={150} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-50 pb-24">
      {/* Mobile Header */}
      <div className="sticky top-0 z-30 bg-grey-50 border-b border-grey-200 shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
          >
            <IoArrowBack size={24} className="text-grey-900" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-grey-900 flex items-center gap-2">
              <MdShoppingCart size={24} />
              My Cart
              {cartCount > 0 && (
                <span className="text-sm font-normal text-secondary-500">
                  ({cartCount} {cartCount === 1 ? "item" : "items"})
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {/* Cart Items */}
          <div className="p-4 space-y-3">
            <DisplayCartItem />
          </div>

          {/* Bottom Fixed Checkout Section */}
          <div className="fixed bottom-0 left-0 right-0 bg-grey-50 border-t border-grey-200 shadow-lg z-40">
            <CartSummary onCheckout={handleCheckout} />
          </div>
        </>
      )}
    </div>
  );
};

export default CartMobilePage;
