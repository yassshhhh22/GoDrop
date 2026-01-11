import React, { useState } from "react";
import ViewImage from "./ViewImage";
import ImageGallery from "./ImageGallery";

const ProductImageViewer = ({ product }) => {
  const [showSingleImage, setShowSingleImage] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = product?.images || [];
  const primaryImage = images[0] || "/placeholder.png";

  if (images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-secondary-500">No image available</p>
      </div>
    );
  }

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    if (images.length > 1) {
      setShowGallery(true);
    } else {
      setShowSingleImage(true);
    }
  };

  return (
    <>
      {/* Main Product Image */}
      <div className="relative">
        <div
          onClick={() => handleImageClick(0)}
          className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
        >
          <img
            src={primaryImage}
            alt={product?.name || "Product image"}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gray-900 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-gray-50 bg-gray-900 bg-opacity-75 px-4 py-2 rounded text-sm">
              Click to view
            </span>
          </div>
        </div>

        {/* Image Count Badge */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-gray-50 px-3 py-1 rounded-full text-xs font-medium">
            {images.length} photos
          </div>
        )}
      </div>

      {/* Thumbnail Grid - If multiple images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {images.slice(0, 4).map((img, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className="aspect-square bg-gray-100 rounded overflow-hidden border-2 border-gray-200 hover:border-primary-500 transition-colors"
            >
              <img
                src={img}
                alt={`${product?.name} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center text-gray-50 font-medium">
                  +{images.length - 4}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      {showSingleImage && (
        <ViewImage
          url={images[selectedImageIndex]}
          close={() => setShowSingleImage(false)}
          alt={product?.name}
        />
      )}

      {showGallery && (
        <ImageGallery
          images={images}
          initialIndex={selectedImageIndex}
          close={() => setShowGallery(false)}
          title={product?.name || "Product Images"}
        />
      )}
    </>
  );
};

export default ProductImageViewer;
