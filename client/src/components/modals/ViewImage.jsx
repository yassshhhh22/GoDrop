import React, { useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";

const ViewImage = ({ url, close, alt = "Image preview" }) => {
  // Close modal on Escape key press
  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape" && close) {
        close();
      }
    },
    [close]
  );

  useEffect(() => {
    // Add escape key listener
    document.addEventListener("keydown", handleEscape);

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [handleEscape]);

  // Close modal when clicking backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && close) {
      close();
    }
  };

  if (!url) {
    return null;
  }

  return (
    <div
      className="fixed top-0 bottom-0 right-0 left-0 bg-grey-900 bg-opacity-80 flex justify-center items-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-grey-50 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-grey-200 bg-grey-50">
          <h3 className="text-grey-900 font-medium">Image Preview</h3>
          <button
            onClick={close}
            className="hover:text-error transition-colors p-1 rounded-full hover:bg-grey-100"
            aria-label="Close preview"
          >
            <IoClose size={25} />
          </button>
        </div>

        {/* Image Container */}
        <div
          className="relative bg-grey-900 flex items-center justify-center p-4"
          style={{ maxHeight: "calc(90vh - 80px)" }}
        >
          <img
            src={url}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded"
            loading="lazy"
            onError={(e) => {
              e.target.src = "/placeholder.png"; // Fallback image
              e.target.alt = "Image not available";
            }}
          />
        </div>

        {/* Footer - Optional Actions */}
        <div className="flex justify-between items-center p-4 border-t border-grey-200 bg-grey-50">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
          >
            Open in new tab →
          </a>
          <a
            href={url}
            download
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-grey-50 rounded text-sm font-medium transition-colors"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default ViewImage;
