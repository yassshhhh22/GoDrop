import React from "react";

const CardLoading = () => {
  return (
    <div className="border border-grey-200 py-2 lg:p-4 grid gap-1 lg:gap-3 min-w-36 lg:min-w-52 rounded cursor-pointer bg-grey-50 animate-pulse">
      {/* Image Skeleton */}
      <div className="min-h-24 bg-secondary-50 rounded shimmer"></div>

      {/* Category/Tag Skeleton */}
      <div className="p-2 lg:p-3 bg-secondary-50 rounded w-20 shimmer"></div>

      {/* Product Name Skeleton */}
      <div className="p-2 lg:p-3 bg-secondary-50 rounded shimmer"></div>

      {/* Unit/Quantity Skeleton */}
      <div className="p-2 lg:p-3 bg-secondary-50 rounded w-14 shimmer"></div>

      {/* Price and Add to Cart Button Skeleton */}
      <div className="flex items-center justify-between gap-3">
        <div className="p-2 lg:p-3 bg-secondary-50 rounded w-20 shimmer"></div>
        <div className="p-2 lg:p-3 bg-secondary-50 rounded w-20 shimmer"></div>
      </div>
    </div>
  );
};

export default CardLoading;
