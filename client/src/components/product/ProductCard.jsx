import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import AddToCartButton from "../cart/AddToCartButton";
import {
  formatPrice,
  calculateDiscountPercentage,
} from "../../utils/priceFormatter";

const ProductCard = ({ data }) => {
  if (!data) {
    console.error("❌ ProductCard: data prop is missing");
    return null;
  }

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const url = `/product/${data._id}`;

  const { getCustomerType } = useAuthStore();
  const customerType = getCustomerType();

  // ✅ FIXED: Calculate prices and discount
  const currentPrice =
    customerType === "Business" && data.businessPrice
      ? data.businessPrice
      : data.discountPrice || data.price;

  const originalPrice = customerType === "Business" ? data.price : data.price;

  const discount =
    originalPrice && currentPrice < originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  // ✅ FIX: Define hasDiscount
  const hasDiscount = discount > 0;

  return (
    <Link
      to={url}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      }}
      className="py-2 px-2 grid gap-2 min-w-20 max-w-40 rounded-lg cursor-pointer bg-white shadow-sm relative"
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-0 left-0 z-10 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-tr-xl rounded-bl-xl">
          {discount}% OFF
        </div>
      )}
      {/* Product Image */}
      <div className="min-h-16 w-full max-h-20 rounded-lg overflow-hidden bg-white flex items-center justify-center">
        <img
          src={data.images?.[0] || "/placeholder.png"}
          alt={data.name}
          className="w-full h-full object-scale-down"
          loading="lazy"
        />
      </div>

      {/* Delivery Time & MOQ Badge */}
      <div className="flex items-center gap-2 px-4 mt-2">
        {customerType === "Business" && data.moq && data.moq > 1 && (
          <p className="text-xs text-secondary-600 bg-secondary-100 px-2 rounded-full">
            MOQ: {data.moq}
          </p>
        )}
      </div>

      {/* Product Name */}
      <div
        className="text-left font-medium tracking-tight text-ellipsis text-sm line-clamp-2 text-grey-900 mt-1"
        style={{ paddingLeft: "6px" }}
      >
        {data.name}
      </div>

      {/* Unit/Quantity */}
      <div
        className="text-xs text-secondary-500 mb-1"
        style={{ paddingLeft: "7px" }}
      >
        {data.quantity
          ? `${data.quantity} ${data.unit || "piece"}`
          : data.unit || "piece"}
      </div>

      {/* Price & Add to Cart */}
      <div className="flex items-center justify-between gap-2 text-sm mt-2 px-2">
        <div className="flex items-center gap-2 flex-nowrap">
          <div className="font-semibold text-grey-900 text-base whitespace-nowrap">
            {formatPrice(currentPrice)}
          </div>
          {hasDiscount && (
            <div className="text-secondary-400 line-through text-xs whitespace-nowrap">
              {formatPrice(originalPrice)}
            </div>
          )}
        </div>
        <div className="">
          {!data.inStock || data.stock === 0 ? (
            <p className="text-error text-xs text-center font-medium">
              Out of stock
            </p>
          ) : (
            <div
              style={{ paddingRight: "8px", paddingBottom: "4px" }}
              className="w-20 min-w-20 flex justify-center"
            >
              <AddToCartButton
                data={data}
                className="bg-[#f8fff8] border border-green-600 rounded-md h-7 px-2 py-1 text-green-700 font-semibold shadow-none hover:bg-[#f0fff0] transition flex items-center justify-center w-full text-xs"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
