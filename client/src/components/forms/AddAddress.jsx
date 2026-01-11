import React from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import useAddressStore from "../../stores/addressStore";
import Loading from "../layout/Loading";

const AddAddress = ({ close }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: "Home",
      address: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
    },
  });
  const { addAddress, isLoading } = useAddressStore();

  const onSubmit = async (formData) => {
    const addressData = {
      label: formData.label,
      address: formData.address.trim(),
      landmark: formData.landmark?.trim() || "",
      city: formData.city?.trim() || "",
      state: formData.state?.trim() || "",
      pincode: formData.pincode?.trim() || "",
    };

    const newAddress = await addAddress(addressData);

    if (newAddress) {
      reset();
      if (close) {
        close();
      }
    }
  };

  return (
    <section className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Add New Address</h2>
          <button
            onClick={close}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
            disabled={isLoading}
          >
            <IoClose size={24} className="text-gray-600" />
          </button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-2xl z-10">
            <Loading size={150} />
          </div>
        )}

        <form className="p-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Address Type */}
          <div>
            <label
              htmlFor="label"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Address Type <span className="text-red-500">*</span>
            </label>
            <select
              id="label"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              {...register("label", { required: "Address type is required" })}
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
            {errors.label && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.label.message}
              </span>
            )}
          </div>

          {/* Complete Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Complete Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              placeholder="House/Flat no, Building, Area, Street"
              {...register("address", {
                required: "Address is required",
                minLength: {
                  value: 10,
                  message: "Address must be at least 10 characters",
                },
                maxLength: {
                  value: 200,
                  message: "Address cannot exceed 200 characters",
                },
              })}
            />
            {errors.address && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.address.message}
              </span>
            )}
          </div>

          {/* Landmark */}
          <div>
            <label
              htmlFor="landmark"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Landmark
            </label>
            <input
              type="text"
              id="landmark"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Nearby landmark (optional)"
              {...register("landmark")}
            />
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="City name"
              {...register("city")}
            />
          </div>

          {/* State */}
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="State name"
              {...register("state")}
            />
          </div>

          {/* Pincode */}
          <div>
            <label
              htmlFor="pincode"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Pincode
            </label>
            <input
              type="text"
              id="pincode"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="6-digit pincode"
              {...register("pincode", {
                pattern: {
                  value: /^\d{6}$/,
                  message: "Pincode must be 6 digits",
                },
              })}
            />
            {errors.pincode && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.pincode.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mt-6"
          >
            {isLoading ? "Adding..." : "Add Address"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddAddress;
