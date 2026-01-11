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

  const moq = customerType === "BusinessUser" && data?.moq ? data.moq : 1;

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

    try {
      setIsLoading(true);
      await addItem(data, moq);
    } catch (error) {
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
      await updateQuantity(cartItemId, quantity + 1);
    } catch (error) {
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

      if (newQuantity < moq) {
        await removeItem(cartItemId);
      } else {
        await updateQuantity(cartItemId, newQuantity);
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isSyncing || isLoading;

  return (
    <div className="w-full">
      {isInCart ? (
        <div className="flex w-full h-7 gap-0.5 p-0.5 border border-primary-500 rounded-md bg-primary-100">
          <button
            onClick={handleDecreaseQty}
            disabled={isDisabled}
            className="flex-1 rounded-sm text-primary-700 flex items-center justify-center hover:bg-primary-200 transition"
          >
            {isDisabled ? (
              <div className="w-3 h-3 border border-gray-50 border-t-transparent rounded-full animate-spin" />
            ) : (
              "-"
            )}
          </button>

          <p className="flex-1 font-semibold flex items-center justify-center text-gray-900 text-xs">
            {quantity}
          </p>

          <button
            onClick={handleIncreaseQty}
            disabled={isDisabled}
            className="flex-1 rounded-sm text-primary-700 flex items-center justify-center hover:bg-primary-200 transition"
          >
            {isDisabled ? (
              <div className="w-3 h-3 border border-gray-50 border-t-transparent rounded-full animate-spin" />
            ) : (
              "+"
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`h-7 bg-success hover:bg-success/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 lg:px-4 py-1 rounded w-full font-medium transition-colors flex items-center justify-center gap-1 text-xs ${className}`}
        >
          {isDisabled ? (
            <div className="w-4 h-4 border-2 border-gray-50 border-t-transparent rounded-full animate-spin" />
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
