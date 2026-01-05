import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus } from "react-icons/fa6";
import useCartStore from "../../stores/cartStore";
import useAuthStore from "../../stores/authStore";
import Loading from "../layout/Loading";

const AddToCartButton = ({ data, className = "" }) => {
  const { items, addItem, updateQuantity, removeItem, isSyncing } =
    useCartStore();
  const { isAuthenticated, getCustomerType } = useAuthStore();
  const customerType = getCustomerType();

  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [cartItemId, setCartItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Get MOQ for business users
  const moq = customerType === "BusinessUser" && data?.moq ? data.moq : 1;

  // Check if item exists in cart
  useEffect(() => {
    if (!data?._id) return;

    const cartItem = items.find((item) => {
      if (isAuthenticated) {
        return item.item?._id === data._id;
      } else {
        return item._id === data._id;
      }
    });

    if (cartItem) {
      setIsInCart(true);
      setQuantity(cartItem.count);
      setCartItemId(data._id);
    } else {
      setIsInCart(false);
      setQuantity(0);
      setCartItemId(null);
    }
  }, [data, items, isAuthenticated]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!data || !data._id) {
      toast.error("Product data not available");
      return;
    }

    console.log("🛒 AddToCartButton: Adding item", {
      productId: data._id,
      productName: data.name,
      moq,
      customerType,
      isAuthenticated,
    });

    try {
      setIsLoading(true);
      // ✅ Add with MOQ quantity for business users initially
      await addItem(data, moq);
      console.log("✅ Item added successfully");
    } catch (error) {
      console.error("❌ Failed to add to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItemId) return;

    try {
      setIsLoading(true);
      // ✅ Increase by 1
      await updateQuantity(cartItemId, quantity + 1);
    } catch (error) {
      console.error("Failed to increase quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItemId) return;

    try {
      setIsLoading(true);
      const newQuantity = quantity - 1;

      // ✅ Remove if going below MOQ
      if (newQuantity < moq) {
        await removeItem(cartItemId);
      } else {
        await updateQuantity(cartItemId, newQuantity);
      }
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isSyncing || isLoading;

  return (
    <div className="w-full">
      {isInCart ? (
        <div className="flex w-full h-full gap-0.5 p-0.5 border border-green-600 rounded-md bg-[#f8fff8]">
          <button
            onClick={handleDecreaseQty}
            disabled={isDisabled}
            className="flex-1 h-6 rounded-sm text-green-700 flex items-center justify-center hover:bg-green-50 transition"
          >
            {isDisabled ? (
              <div className="w-3 h-3 border border-grey-50 border-t-transparent rounded-full animate-spin" />
            ) : (
              "-"
            )}
          </button>

          <p className="flex-1 font-semibold flex items-center justify-center text-grey-900 text-xs">
            {quantity}
          </p>

          <button
            onClick={handleIncreaseQty}
            disabled={isDisabled}
            className="flex-1 h-6 rounded-sm text-green-700 flex items-center justify-center hover:bg-green-50 transition"
          >
            {isDisabled ? (
              <div className="w-3 h-3 border border-grey-50 border-t-transparent rounded-full animate-spin" />
            ) : (
              "+"
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`bg-primary-600 hover:bg-primary-700 disabled:bg-grey-300 disabled:cursor-not-allowed text-grey-50 px-2 lg:px-4 py-1 rounded w-full font-medium transition-colors flex items-center justify-center gap-1 ${className}`}
        >
          {isDisabled ? (
            <div className="w-4 h-4 border-2 border-grey-50 border-t-transparent rounded-full animate-spin" />
          ) : moq > 1 ? (
            <>
              <span>Add</span>
              <span className="font-bold">{moq}</span>
            </>
          ) : (
            "Add"
          )}
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;