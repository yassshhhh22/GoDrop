import toast from "react-hot-toast";

/**
 * Show success toast
 */
export const successAlert = (message = "Success!", options = {}) => {
  return toast.success(message, {
    duration: 3000,
    position: "top-center",
    className: "border-l-4 border-success bg-white shadow-lg",
    ...options,
  });
};

/**
 * Show error toast
 */
export const errorAlert = (message = "Something went wrong!", options = {}) => {
  return toast.error(message, {
    duration: 4000,
    position: "top-center",
    className: "border-l-4 border-error bg-white shadow-lg",
    ...options,
  });
};

/**
 * Show warning toast
 */
export const warningAlert = (message = "Warning!", options = {}) => {
  return toast(message, {
    duration: 3500,
    position: "top-center",
    icon: "⚠️",
    className: "border-l-4 border-warning bg-white shadow-lg",
    ...options,
  });
};

/**
 * Show info toast
 */
export const infoAlert = (message = "Information", options = {}) => {
  return toast(message, {
    duration: 3000,
    position: "top-center",
    icon: "ℹ️",
    className: "border-l-4 border-info bg-white shadow-lg",
    ...options,
  });
};

/**
 * Show loading toast
 */
export const loadingAlert = (message = "Loading...", options = {}) => {
  return toast.loading(message, {
    position: "top-center",
    ...options,
  });
};

/**
 * Dismiss toast(s)
 */
export const closeAlert = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

/**
 * Confirmation toast with actions
 */
export const confirmAlert = (message, onConfirm, onCancel, options = {}) => {
  return toast(
    (t) => (
      <div className="flex flex-col gap-3">
        <p className="text-gray-900 font-medium">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onConfirm) onConfirm();
            }}
            className="px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: "top-center",
      className: "border-l-4 border-primary-600",
      ...options,
    }
  );
};

/**
 * Delete confirmation toast
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
          <p className="text-gray-900 font-semibold mb-1">
            Delete Confirmation
          </p>
          <p className="text-gray-600 text-sm">
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
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onConfirm) onConfirm();
            }}
            className="px-4 py-2 rounded bg-error hover:bg-red-600 text-white font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: "top-center",
      className: "border-l-4 border-error",
    }
  );
};

/**
 * Promise-based toast (loading -> success/error)
 */
export const promiseAlert = (
  promise,
  messages = {
    loading: "Loading...",
    success: "Success!",
    error: "Error occurred",
  }
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
};

/**
 * Custom toast with React component
 */
export const customAlert = (content, options = {}) => {
  return toast.custom(content, {
    duration: 3000,
    position: "top-center",
    ...options,
  });
};
