import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaAngleRight, FaAngleLeft, FaStar } from "react-icons/fa6";
import { MdLocalShipping, MdVerified, MdInventory } from "react-icons/md";
import useProductStore from "../stores/productStore";
import useCartStore from "../stores/cartStore";
import useAuthStore from "../stores/authStore";
import { formatPrice } from "../utils/priceFormatter";
import Loading from "../components/layout/Loading";
import AddToCartButton from "../components/AddToCartButton";
import image1 from "../assets/minute_delivery.png";
import image2 from "../assets/Best_Prices_Offers.png";
import image3 from "../assets/Wide_Assortment.png";

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

  return (
    <section className="bg-grey-50 min-h-screen">
      <div className="container mx-auto p-4 grid lg:grid-cols-2 gap-6">
        {/* Left Section - Images */}
        <div>
          {/* Main Image */}
          <div className="bg-grey-50 border border-grey-200 lg:min-h-[65vh] lg:max-h-[65vh] rounded min-h-56 max-h-56 h-full w-full flex items-center justify-center">
            <img
              src={images[selectedImageIndex] || "/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          </div>

          {/* Image Dots Indicator */}
          <div className="flex items-center justify-center gap-3 my-4">
            {images.map((img, index) => (
              <button
                key={img + index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-colors ${
                  index === selectedImageIndex
                    ? "bg-primary-600"
                    : "bg-grey-300"
                }`}
              />
            ))}
          </div>

          {/* Thumbnail Carousel */}
          <div className="grid relative">
            <div
              ref={imageContainer}
              className="flex gap-4 z-10 relative w-full overflow-x-auto scrollbar-none"
            >
              {images.map((img, index) => (
                <div
                  key={img + index}
                  className={`w-20 h-20 min-h-20 min-w-20 cursor-pointer border-2 rounded ${
                    index === selectedImageIndex
                      ? "border-primary-600"
                      : "border-grey-200"
                  } bg-grey-50`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              ))}
            </div>

            {/* Scroll Buttons */}
            {images.length > 4 && (
              <div className="w-full -ml-3 h-full hidden lg:flex justify-between absolute items-center pointer-events-none">
                <button
                  onClick={handleScrollLeft}
                  className="z-10 bg-grey-50 border border-grey-200 p-2 rounded-full shadow-lg pointer-events-auto hover:bg-secondary-50"
                >
                  <FaAngleLeft />
                </button>
                <button
                  onClick={handleScrollRight}
                  className="z-10 bg-grey-50 border border-grey-200 p-2 rounded-full shadow-lg pointer-events-auto hover:bg-secondary-50"
                >
                  <FaAngleRight />
                </button>
              </div>
            )}
          </div>

          {/* Product Details (Desktop) */}
          <div className="my-6 hidden lg:grid gap-4 bg-grey-50 border border-grey-200 rounded-lg p-4">
            <div>
              <p className="font-semibold text-grey-900 mb-1">Description</p>
              <p className="text-secondary-600">{product.description}</p>
            </div>

            {product.unit && product.quantity && (
              <div>
                <p className="font-semibold text-grey-900 mb-1">Unit</p>
                <p className="text-secondary-600">
                  {product.quantity} {product.unit}
                </p>
              </div>
            )}

            {customerType === "Business" && product.moq && (
              <div>
                <p className="font-semibold text-grey-900 mb-1">
                  Minimum Order Quantity (MOQ)
                </p>
                <p className="text-secondary-600">{product.moq} units</p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div>
                <p className="font-semibold text-grey-900 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Product Info */}
        <div className="p-4 lg:pl-7">
          {/* Quick Info Badge */}
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-primary-600 text-grey-50 px-3 py-1 rounded-full text-sm font-medium">
              Quick Delivery
            </span>
            {product.inStock && (
              <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                In Stock
              </span>
            )}
          </div>

          {/* Product Name */}
          <h1 className="text-2xl lg:text-3xl font-bold text-grey-900 mb-2">
            {product.name}
          </h1>

          {/* Unit */}
          {product.unit && product.quantity && (
            <p className="text-secondary-500 mb-4">
              {product.quantity} {product.unit}
            </p>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-warning">
                <FaStar />
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-secondary-400 text-sm">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}

          <div className="h-px bg-grey-200 my-4" />

          {/* Price Section */}
          <div className="mb-6">
            <p className="text-secondary-500 mb-2">Price</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="border-2 border-primary-600 px-4 py-2 rounded-lg bg-primary-50">
                <p className="font-bold text-2xl text-grey-900">
                  {formatPrice(currentPrice)}
                </p>
              </div>

              {originalPrice && discount > 0 && (
                <>
                  <p className="text-lg text-secondary-400 line-through">
                    {formatPrice(originalPrice)}
                  </p>
                  <p className="font-bold text-primary-600 text-xl">
                    {discount}%{" "}
                    <span className="text-sm text-secondary-500">OFF</span>
                  </p>
                </>
              )}
            </div>

            {/* Savings Info */}
            {discount > 0 && (
              <p className="text-sm text-primary-600 mt-2">
                You save {formatPrice(originalPrice - currentPrice)}!
              </p>
            )}
          </div>

          {/* Stock Status & Add to Cart */}
          {!product.inStock ? (
            <div className="my-4 p-4 bg-error bg-opacity-10 border border-error rounded-lg">
              <p className="text-error font-semibold">Out of Stock</p>
              <p className="text-sm text-secondary-600 mt-1">
                This product is currently unavailable
              </p>
            </div>
          ) : (
            <div className="my-4">
              <AddToCartButton data={product} />{" "}
              {/* ✅ FIX: Changed from product to data */}
            </div>
          )}

          <div className="h-px bg-grey-200 my-6" />

          {/* Why Shop Section */}
          <h2 className="font-semibold text-grey-900 text-lg mb-4">
            Why shop from GoDrop?
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={image1}
                alt="Superfast delivery"
                className="w-16 h-16 shrink-0"
              />
              <div>
                <div className="font-semibold text-grey-900">
                  Superfast Delivery
                </div>
                <p className="text-sm text-secondary-600">
                  Get your order delivered to your doorstep at the earliest from
                  dark stores near you.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <img
                src={image2}
                alt="Best prices offers"
                className="w-16 h-16 shrink-0"
              />
              <div>
                <div className="font-semibold text-grey-900">
                  Best Prices & Offers
                </div>
                <p className="text-sm text-secondary-600">
                  Best price destination with offers directly from the
                  manufacturers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <img
                src={image3}
                alt="Wide Assortment"
                className="w-16 h-16 shrink-0"
              />
              <div>
                <div className="font-semibold text-grey-900">
                  Wide Assortment
                </div>
                <p className="text-sm text-secondary-600">
                  Choose from 5000+ products across food, personal care,
                  household & other categories.
                </p>
              </div>
            </div>
          </div>

          {/* Product Details (Mobile) */}
          <div className="my-6 lg:hidden grid gap-4 bg-grey-50 border border-grey-200 rounded-lg p-4">
            <div>
              <p className="font-semibold text-grey-900 mb-1">Description</p>
              <p className="text-secondary-600">{product.description}</p>
            </div>

            {product.unit && product.quantity && (
              <div>
                <p className="font-semibold text-grey-900 mb-1">Unit</p>
                <p className="text-secondary-600">
                  {product.quantity} {product.unit}
                </p>
              </div>
            )}

            {customerType === "Business" && product.moq && (
              <div>
                <p className="font-semibold text-grey-900 mb-1">
                  Minimum Order Quantity
                </p>
                <p className="text-secondary-600">{product.moq} units</p>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div>
                <p className="font-semibold text-grey-900 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;
