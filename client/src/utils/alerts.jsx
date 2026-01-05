import toast from "react-hot-toast";

/**
 * ========================================
 * ALERT UTILITIES (React Hot Toast)
 * ========================================
 */

/**
 * Show success toast
 * @param {string} message - Success message
 * @param {Object} options - Toast options
 * @returns {string} Toast ID
 */
export const successAlert = (message, options = {}) => {
  return toast.success(message, {
    duration: 3000,
    position: "top-center",
    style: {
      background: "#EBFFD7",
      color: "#35670d",
      border: "1px solid #6CC51D",
      padding: "16px",
      borderRadius: "8px",
    },
    iconTheme: {
      primary: "#6CC51D",
      secondary: "#EBFFD7",
    },
    ...options,
  });
};

/**
 * Show error toast
 * @param {string} message - Error message
 * @param {Object} options - Toast options
 * @returns {string} Toast ID
 */
export const errorAlert = (message, options = {}) => {
  return toast.error(message, {
    duration: 4000,
    position: "top-center",
    style: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #ef4444",
      padding: "16px",
      borderRadius: "8px",
    },
    iconTheme: {
      primary: "#ef4444",
      secondary: "#fee2e2",
    },
    ...options,
  });
};

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @param {Object} options - Toast options
 * @returns {string} Toast ID
 */
export const warningAlert = (message, options = {}) => {
  return toast(message, {
    duration: 3500,
    position: "top-center",
    icon: "⚠️",
    style: {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #f59e0b",
      padding: "16px",
      borderRadius: "8px",
    },
    ...options,
  });
};

/**
 * Show info toast
 * @param {string} message - Info message
 * @param {Object} options - Toast options
 * @returns {string} Toast ID
 */
export const infoAlert = (message, options = {}) => {
  return toast(message, {
    duration: 3000,
    position: "top-center",
    icon: "ℹ️",
    style: {
      background: "#dbeafe",
      color: "#1e3a8a",
      border: "1px solid #3b82f6",
      padding: "16px",
      borderRadius: "8px",
    },
    ...options,
  });
};

/**
 * Show loading toast
 * @param {string} message - Loading message
 * @param {Object} options - Toast options
 * @returns {string} Toast ID
 */
export const loadingAlert = (message = "Loading...", options = {}) => {
  return toast.loading(message, {
    position: "top-center",
    style: {
      background: "#F4F5F9",
      color: "#868889",
      border: "1px solid #EBEBEB",
      padding: "16px",
      borderRadius: "8px",
    },
    ...options,
  });
};

/**
 * Dismiss specific toast or all toasts
 * @param {string} toastId - Optional toast ID to dismiss
 */
export const closeAlert = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

/**
 * Show confirmation toast with actions
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 * @param {Object} options - Toast options
 * @returns {string} Toast ID
 */
export const confirmAlert = (message, onConfirm, onCancel, options = {}) => {
  return toast(
    (t) => (
      <div className="flex flex-col gap-3">
        <p className="text-grey-900 font-medium">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
            className="px-4 py-2 rounded bg-grey-200 hover:bg-grey-300 text-grey-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onConfirm) onConfirm();
            }}
            className="px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 text-grey-50 font-medium transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: "top-center",
      style: {
        background: "#FFFFFF",
        border: "1px solid #EBEBEB",
        padding: "16px",
        borderRadius: "8px",
        minWidth: "300px",
      },
      ...options,
    }
  );
};

/**
 * Show delete confirmation toast
 * @param {string} itemName - Name of item to delete
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 * @returns {string} Toast ID
 */
export const deleteConfirmAlert = (
  itemName = "this item",
  onConfirm,
  onCancel
) => {
  return toast(
    (t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-grey-900 font-semibold mb-1">
            Delete Confirmation
          </p>
          <p className="text-secondary-500 text-sm">
            Are you sure you want to delete {itemName}?
            <br />
            <span className="text-error font-medium">
              This action cannot be undone.
            </span>
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
            className="px-4 py-2 rounded bg-grey-200 hover:bg-grey-300 text-grey-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onConfirm) onConfirm();
            }}
            className="px-4 py-2 rounded bg-error hover:bg-red-600 text-grey-50 font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: "top-center",
      style: {
        background: "#FFFFFF",
        border: "1px solid #EBEBEB",
        padding: "16px",
        borderRadius: "8px",
        minWidth: "350px",
      },
    }
  );
};

/**
 * Update existing toast message
 * @param {string} toastId - Toast ID to update
 * @param {Object} options - Toast options
 */
export const updateAlert = (toastId, options) => {
  toast.success(options.message || "Success!", {
    id: toastId,
    ...options,
  });
};

/**
 * Show promise-based toast (loading -> success/error)
 * @param {Promise} promise - Promise to track
 * @param {Object} messages - Messages for different states
 * @returns {Promise}
 */
export const promiseAlert = (
  promise,
  messages = {
    loading: "Loading...",
    success: "Success!",
    error: "Error occurred",
  }
) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      style: {
        minWidth: "250px",
        padding: "16px",
        borderRadius: "8px",
      },
      success: {
        duration: 3000,
        style: {
          background: "#EBFFD7",
          color: "#35670d",
          border: "1px solid #6CC51D",
        },
        iconTheme: {
          primary: "#6CC51D",
          secondary: "#EBFFD7",
        },
      },
      error: {
        duration: 4000,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #ef4444",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "#fee2e2",
        },
      },
    }
  );
};

/**
 * Show custom toast with HTML content
 * @param {React.Component} content - Custom React component
 * @param {Object} options - Toast options
 * @returns {string} Toast ID
 */
export const customAlert = (content, options = {}) => {
  return toast.custom(content, {
    duration: 3000,
    position: "top-center",
    ...options,
  });
};
