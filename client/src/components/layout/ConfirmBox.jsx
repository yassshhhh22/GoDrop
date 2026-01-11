import React from "react";
import { IoClose } from "react-icons/io5";

const ConfirmBox = ({
  close,
  onConfirm,
  onCancel,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger', 'warning', 'primary'
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (close) {
      close();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (close) {
      close();
    }
  };

  // Define button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case "danger":
        return {
          cancel:
            "px-4 py-2 border rounded border-error text-error hover:bg-error hover:text-gray-50 transition-colors",
          confirm:
            "px-4 py-2 border rounded border-error bg-error text-gray-50 hover:bg-red-600 transition-colors",
        };
      case "warning":
        return {
          cancel:
            "px-4 py-2 border rounded border-gray-300 text-gray-900 hover:bg-gray-100 transition-colors",
          confirm:
            "px-4 py-2 border rounded border-warning bg-warning text-gray-900 hover:bg-yellow-600 transition-colors",
        };
      case "primary":
        return {
          cancel:
            "px-4 py-2 border rounded border-gray-300 text-gray-900 hover:bg-gray-100 transition-colors",
          confirm:
            "px-4 py-2 border rounded border-primary-600 bg-primary-600 text-gray-50 hover:bg-primary-700 transition-colors",
        };
      default:
        return {
          cancel:
            "px-4 py-2 border rounded border-gray-300 text-gray-900 hover:bg-gray-100 transition-colors",
          confirm:
            "px-4 py-2 border rounded border-primary-600 bg-primary-600 text-gray-50 hover:bg-primary-700 transition-colors",
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <div className="fixed inset-0 z-5  backdrop-blur-sm p-4 flex justify-center items-center">
      <div className="bg-gray-50 w-full max-w-md p-4 rounded shadow-lg">
        <div className="flex justify-between items-center gap-3">
          <h1 className="font-semibold text-gray-900">{title}</h1>
          <button
            onClick={close}
            className="hover:text-error transition-colors"
          >
            <IoClose size={25} />
          </button>
        </div>

        <p className="my-4 text-gray-900">{message}</p>

        <div className="w-fit ml-auto flex items-center gap-3">
          <button onClick={handleCancel} className={buttonStyles.cancel}>
            {cancelText}
          </button>
          <button onClick={handleConfirm} className={buttonStyles.confirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
