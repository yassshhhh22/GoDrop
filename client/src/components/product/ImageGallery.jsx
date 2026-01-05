import React, { useState, useEffect, useCallback } from "react";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";

const ImageGallery = ({
  images = [],
  initialIndex = 0,
  close,
  title = "Image Gallery",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = images[currentIndex];
  const totalImages = images.length;

  // Navigation handlers
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalImages);
    setIsZoomed(false);
  }, [totalImages]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
    setIsZoomed(false);
  }, [totalImages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && close) {
        close();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "unset";
    };
  }, [close, goToNext, goToPrevious]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && close) {
      close();
    }
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-grey-900 bg-opacity-90 flex flex-col z-50 animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-grey-900 bg-opacity-95">
        <div className="text-grey-50">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-secondary-300">
            {currentIndex + 1} / {totalImages}
          </p>
        </div>
        <button
          onClick={close}
          className="text-grey-50 hover:text-error transition-colors p-2 rounded-full hover:bg-grey-800"
          aria-label="Close gallery"
        >
          <IoClose size={28} />
        </button>
      </div>

      {/* Main Image */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <img
          src={currentImage}
          alt={`Image ${currentIndex + 1}`}
          className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
          loading="lazy"
        />

        {/* Navigation Arrows */}
        {totalImages > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-grey-900 bg-opacity-75 hover:bg-opacity-100 text-grey-50 p-3 rounded-full transition-all"
              aria-label="Previous image"
            >
              <IoChevronBack size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-grey-900 bg-opacity-75 hover:bg-opacity-100 text-grey-50 p-3 rounded-full transition-all"
              aria-label="Next image"
            >
              <IoChevronForward size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {totalImages > 1 && (
        <div className="bg-grey-900 bg-opacity-95 p-4">
          <div className="flex gap-2 overflow-x-auto max-w-4xl mx-auto scrollbar-thin scrollbar-thumb-grey-600">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsZoomed(false);
                }}
                className={`shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-primary-500 scale-110"
                    : "border-grey-600 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 p-4 bg-grey-900 bg-opacity-95">
        <a
          href={currentImage}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-grey-50 rounded text-sm font-medium transition-colors"
        >
          Open Original
        </a>
        <a
          href={currentImage}
          download={`image-${currentIndex + 1}`}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-grey-50 rounded text-sm font-medium transition-colors"
        >
          Download
        </a>
      </div>
    </div>
  );
};

export default ImageGallery;
