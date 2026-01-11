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
    return null;
  }

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const url = `/product/${data._id}`;

  const { getCustomerType } = useAuthStore();
  const customerType = getCustomerType();

  const currentPrice =
    customerType === "Business" && data.businessPrice
      ? data.businessPrice
      : data.discountPrice || data.price;

  const originalPrice = customerType === "Business" ? data.price : data.price;

  const discount =
    originalPrice && currentPrice < originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  const hasDiscount = discount > 0;

  return (
    <div className="p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
      <Link
        to={url}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "instant" });
        }}
        className="py-2 px-2 grid gap-2 min-w-32 max-w-36 bg-transparent transition-colors relative"
      >
        {hasDiscount && (
          <div className="absolute -top-2 -left-2 z-10 bg-white text-primary-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border border-primary-600">
            {discount}% OFF
          </div>
        )}
        <div className="min-h-20 w-full rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
          <img
            src={data.images?.[0] || "/placeholder.png"}
            alt={data.name}
            className="w-full h-full object-scale-down"
            loading="lazy"
          />
        </div>

        <div className="flex items-center gap-2 px-3 mt-2">
          {customerType === "Business" && data.moq && data.moq > 1 && (
            <p className="text-xs text-secondary-600 bg-secondary-50 px-2 py-1 rounded-full">
              MOQ: {data.moq}
            </p>
          )}
        </div>

        <div className="text-left font-medium text-sm line-clamp-2 text-gray-900 px-3 mt-2">
          {data.name}
        </div>

        <div className="text-xs text-secondary-500 px-3 mt-1">
          {data.quantity
            ? `${data.quantity} ${data.unit || "piece"}`
            : data.unit || "piece"}
        </div>

        <div className="flex items-center justify-between gap-2 text-sm px-3 mt-3">
          <div className="flex items-center gap-1 flex-nowrap">
            <div className="font-semibold text-gray-900 text-base">
              {formatPrice(currentPrice)}
            </div>
            {hasDiscount && (
              <div className="text-secondary-400 line-through text-xs">
                {formatPrice(originalPrice)}
              </div>
            )}
          </div>
          <div>
            {!data.inStock || data.stock === 0 ? (
              <p className="text-error text-xs font-medium">Out of stock</p>
            ) : (
              <div className="w-20 flex justify-center">
                <AddToCartButton
                  data={data}
                  className="bg-primary-50 border border-primary-600 rounded-md h-7 px-2 py-1 text-primary-600 font-semibold shadow-none hover:bg-primary-100 transition flex items-center justify-center w-full text-xs"
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
