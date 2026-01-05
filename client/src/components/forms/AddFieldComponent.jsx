import React from "react";
import { IoClose } from "react-icons/io5";

const AddFieldComponent = ({
  close,
  value,
  onChange,
  submit,
  isLoading = false,
  placeholder = "Enter field name",
  title = "Add Field",
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (submit && value.trim()) {
      submit();
    }
  };

  return (
    <section className="fixed top-0 bottom-0 right-0 left-0 bg-grey-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-grey-50 rounded p-4 w-full max-w-md">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-semibold text-grey-900">{title}</h1>
          <button
            onClick={close}
            className="hover:text-error transition-colors"
            type="button"
            disabled={isLoading}
          >
            <IoClose size={25} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            className="bg-secondary-50 my-3 p-2 border border-grey-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 rounded w-full transition-colors"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={isLoading}
            required
          />

          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-grey-300 disabled:cursor-not-allowed px-4 py-2 rounded mx-auto w-fit block text-grey-900 font-medium transition-colors"
          >
            {isLoading ? "Adding..." : "Add Field"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddFieldComponent;
