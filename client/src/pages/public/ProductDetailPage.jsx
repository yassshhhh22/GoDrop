import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaAngleRight, FaAngleLeft, FaStar } from "react-icons/fa6";
import useProductStore from "../../stores/productStore";
import useCartStore from "../../stores/cartStore";
import useAuthStore from "../../stores/authStore";
import { formatPrice } from "../../utils/priceFormatter";
import Loading from "../../components/layout/Loading";
import AddToCartButton from "../../components/cart/AddToCartButton";
import image1 from "../../assets/minute_delivery.png";
import image2 from "../../assets/Best_Prices_Offers.png";
import image3 from "../../assets/Wide_Assortment.png";
import CategoryWiseProductDisplay from "../../components/product/CategoryWiseProductDisplay";

const ProductDetailPage = () => {
  const { id } = useParams(); // ✅ FIX: Get 'id' instead of extracting from slug
  const navigate = useNavigate();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const imageContainer = useRef();

  const { selectedProduct, fetchProductById, loading } = useProductStore();
  const { getCustomerType } = useAuthStore();
  const customerType = getCustomerType();

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id]);

  const handleScrollRight = () => {
    imageContainer.current.scrollLeft += 100;
  };

  const handleScrollLeft = () => {
    imageContainer.current.scrollLeft -= 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size={150} />
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary-500 mb-4">Product not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-grey-50 rounded-lg font-medium transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const product = selectedProduct;
  const images = product.images || [];

  // Calculate pricing based on customer type
  const currentPrice =
    customerType === "Business"
      ? product.businessPrice || product.price
      : product.discountPrice || product.price;
  const originalPrice = customerType === "Business" ? null : product.price;
  const discount =
    originalPrice && currentPrice < originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  // Get category id and name for CategoryWiseProductDisplay
  const categoryId =
    product.category && typeof product.category === "object"
      ? product.category._id
      : product.category;
  const categoryName =
    product.category && typeof product.category === "object"
      ? product.category.name
      : product.category || "Category";

  return (
    <section className="bg-white min-h-screen">
      <div className="w-full px-2 sm:px-4 py-6 sm:py-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left: Product Image & Thumbnails */}
        <div className="flex flex-col items-center">
          <div className="bg-white border border-grey-200 rounded-lg flex items-center justify-center w-full max-w-[400px] min-h-[220px] sm:min-h-[340px] max-h-[400px] mx-auto">
            <img
              src={images[selectedImageIndex] || "/placeholder.png"}
              alt={product.name}
              className="object-contain w-full h-full p-4 sm:p-6"
              style={{ maxHeight: 320 }}
            />
          </div>
          {/* Thumbnails */}
          <div className="flex items-center gap-2 mt-4 sm:mt-6 flex-wrap justify-center">
            {images.map((img, idx) => (
              <button
                key={img + idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`border rounded-lg w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-white ${
                  idx === selectedImageIndex
                    ? "border-primary-600"
                    : "border-grey-200"
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  className="object-contain w-8 h-8 sm:w-12 sm:h-12"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col justify-start mt-8 md:mt-0">
          {/* Product Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-grey-900 mb-4 sm:mb-5">
            {product.name}
          </h1>
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="flex items-center gap-1 text-warning">
                <FaStar />
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-secondary-400 text-sm">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}
          {/* Unit */}
          {product.unit && product.quantity && (
            <div className="text-secondary-500 mb-4 sm:mb-5 text-base">
              {product.quantity} {product.unit}
            </div>
          )}
          {/* Price + Add to Cart (mobile: row, desktop: stacked) */}
          <div className="flex flex-col sm:block">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold text-grey-900">
                {formatPrice(currentPrice)}
              </span>
              {originalPrice && discount > 0 && (
                <>
                  <span className="text-base sm:text-lg text-secondary-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                  {/* Discount percent: show only on desktop here */}
                  <span className="hidden sm:inline font-bold text-primary-600 text-base sm:text-lg">
                    {discount}% OFF
                  </span>
                </>
              )}
              {/* Add to Cart Button (mobile only, right of price) */}
              <span className="ml-auto sm:hidden">
                {product.inStock ? (
                  <AddToCartButton data={product} />
                ) : (
                  <span className="p-2 text-error text-sm">Out of Stock</span>
                )}
              </span>
            </div>
            {/* Discount percent: show only on mobile below price */}
            {originalPrice && discount > 0 && (
              <div className="sm:hidden font-bold text-primary-600 text-base mb-2">
                {discount}% OFF
              </div>
            )}
            {/* Savings */}
            {discount > 0 && (
              <div className="text-sm text-primary-600 mb-4 sm:mb-5">
                You save {formatPrice(originalPrice - currentPrice)}!
              </div>
            )}
            {/* Add to Cart Button (desktop only, below price) */}
            <div className="hidden sm:block mt-2 mb-6 sm:mb-8">
              {product.inStock ? (
                <AddToCartButton data={product} />
              ) : (
                <div className="p-3 bg-error bg-opacity-10 border border-error rounded-lg text-error font-semibold">
                  Out of Stock
                </div>
              )}
            </div>
          </div>
          {/* Description */}
          <div className="mb-3">
            <span className="font-semibold text-grey-900">Description: </span>
            <span className="text-secondary-600">{product.description}</span>
          </div>
          {/* Unit (below description) */}
          {product.unit && product.quantity && (
            <div className="mb-4 sm:mb-5">
              <span className="font-semibold text-grey-900">Unit: </span>
              <span className="text-secondary-600">
                {product.quantity} {product.unit}
              </span>
            </div>
          )}
          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-4 sm:mb-5 flex flex-wrap gap-2">
              {product.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* MOQ for Business */}
          {customerType === "Business" && product.moq && (
            <div className="mb-5 sm:mb-7">
              <span className="font-semibold text-grey-900">Minimum Order Quantity (MOQ): </span>
              <span className="text-secondary-600">{product.moq} units</span>
            </div>
          )}
          {/* Why Shop Section */}
          <div className="mt-8 sm:mt-10">
            <h2 className="font-semibold text-grey-900 text-lg mb-3 sm:mb-4">
              Why shop from GoDrop?
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <img src={image1} alt="Superfast delivery" className="w-10 h-10 sm:w-12 sm:h-12" />
                <div>
                  <div className="font-semibold text-grey-900 text-base">
                    Superfast Delivery
                  </div>
                  <div className="text-sm text-secondary-600">
                    Get your order delivered to your doorstep at the earliest from
                    dark stores near you.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <img src={image2} alt="Best prices offers" className="w-10 h-10 sm:w-12 sm:h-12" />
                <div>
                  <div className="font-semibold text-grey-900 text-base">
                    Best Prices & Offers
                  </div>
                  <div className="text-sm text-secondary-600">
                    Best price destination with offers directly from the
                    manufacturers.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <img src={image3} alt="Wide Assortment" className="w-10 h-10 sm:w-12 sm:h-12" />
                <div>
                  <div className="font-semibold text-grey-900 text-base">
                    Wide Assortment
                  </div>
                  <div className="text-sm text-secondary-600">
                    Choose from 5000+ products across food, personal care,
                    household & other categories.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Products in this category */}
      {categoryId && (
        <div className="w-full mt-10 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-grey-900 mb-4 sm:mb-6 px-2 sm:px-4">
            Products in this category
          </h2>
          <CategoryWiseProductDisplay id={categoryId} name={categoryName} />
        </div>
      )}
    </section>
  );
};

export default ProductDetailPage;
