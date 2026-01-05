import React from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import useAddressStore from "../../stores/addressStore";
import Loading from "../layout/Loading";

const EditAddressDetails = ({ close, data }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: data.label || "Home",
      address: data.address || "",
      landmark: data.landmark || "",
      city: data.city || "",
      state: data.state || "",
      pincode: data.pincode || "",
    },
  });

  const { updateAddress, isLoading } = useAddressStore();

  const onSubmit = async (formData) => {
    const addressData = {
      label: formData.label,
      address: formData.address.trim(),
      landmark: formData.landmark?.trim() || "",
      city: formData.city?.trim() || "",
      state: formData.state?.trim() || "",
      pincode: formData.pincode?.trim() || "",
    };

    const updatedAddress = await updateAddress(data._id, addressData);

    if (updatedAddress) {
      reset();
      if (close) {
        close();
      }
    }
  };

  return (
    <section className="bg-grey-900 fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-70 h-screen overflow-auto">
      <div className="bg-grey-50 p-4 w-full max-w-lg mt-8 mx-auto rounded shadow-lg relative">
        <div className="flex justify-between items-center gap-4">
          <h2 className="font-semibold text-grey-900">Edit Address</h2>
          <button
            onClick={close}
            className="hover:text-error transition-colors"
            type="button"
            disabled={isLoading}
          >
            <IoClose size={25} />
          </button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-grey-50 bg-opacity-90 flex items-center justify-center rounded z-10">
            <Loading size={150} />
          </div>
        )}

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Address Type */}
          <div className="grid gap-1">
            <label htmlFor="label" className="text-grey-900 font-medium">
              Address Type : <span className="text-error">*</span>
            </label>
            <select
              id="label"
              className="border border-grey-200 bg-secondary-50 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...register("label", { required: "Address type is required" })}
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
            {errors.label && (
              <span className="text-error text-sm">{errors.label.message}</span>
            )}
          </div>

          {/* Complete Address */}
          <div className="grid gap-1">
            <label htmlFor="address" className="text-grey-900 font-medium">
              Complete Address : <span className="text-error">*</span>
            </label>
            <textarea
              id="address"
              rows={3}
              className="border border-grey-200 bg-secondary-50 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <span className="text-error text-sm">
                {errors.address.message}
              </span>
            )}
          </div>

          {/* Landmark */}
          <div className="grid gap-1">
            <label htmlFor="landmark" className="text-grey-900 font-medium">
              Landmark :
            </label>
            <input
              type="text"
              id="landmark"
              className="border border-grey-200 bg-secondary-50 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nearby landmark (optional)"
              {...register("landmark")}
            />
          </div>

          {/* City */}
          <div className="grid gap-1">
            <label htmlFor="city" className="text-grey-900 font-medium">
              City :
            </label>
            <input
              type="text"
              id="city"
              className="border border-grey-200 bg-secondary-50 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="City name"
              {...register("city")}
            />
          </div>

          {/* State */}
          <div className="grid gap-1">
            <label htmlFor="state" className="text-grey-900 font-medium">
              State :
            </label>
            <input
              type="text"
              id="state"
              className="border border-grey-200 bg-secondary-50 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="State name"
              {...register("state")}
            />
          </div>

          {/* Pincode */}
          <div className="grid gap-1">
            <label htmlFor="pincode" className="text-grey-900 font-medium">
              Pincode :
            </label>
            <input
              type="text"
              id="pincode"
              className="border border-grey-200 bg-secondary-50 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="6-digit pincode"
              {...register("pincode", {
                pattern: {
                  value: /^\d{6}$/,
                  message: "Pincode must be 6 digits",
                },
              })}
            />
            {errors.pincode && (
              <span className="text-error text-sm">
                {errors.pincode.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-grey-300 disabled:cursor-not-allowed w-full py-2 font-semibold mt-4 rounded text-grey-50 transition-colors"
          >
            {isLoading ? "Updating..." : "Update Address"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditAddressDetails;
