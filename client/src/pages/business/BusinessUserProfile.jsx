import React, { useState, useEffect } from "react";
import { MdEdit, MdSave, MdCancel, MdBusiness } from "react-icons/md";
import useAuthStore from "../../stores/authStore";
import {
  updateBusinessProfile,
  getBusinessProfile,
  updateRegisteredAddress as updateAddressAPI,
} from "../../services/businessUser.service";
import { successAlert, errorAlert } from "../../utils/alerts.jsx";

const BusinessUserProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    gstNumber: "",
    contactPerson: "",
    email: "",
    address: "",
    // ✅ NEW: Add registered address fields
    registeredAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ NEW: Fetch fresh business profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const businessUser = await getBusinessProfile();

        setFormData({
          companyName: businessUser?.businessDetails?.companyName || "",
          gstNumber: businessUser?.businessDetails?.gstNumber || "",
          contactPerson: businessUser?.businessDetails?.contactPerson || "",
          email: businessUser?.businessDetails?.email || "",
          address: businessUser?.businessDetails?.address || "",
          // ✅ NEW: Load registered address
          registeredAddress: {
            street: businessUser?.registeredAddress?.street || "",
            city: businessUser?.registeredAddress?.city || "",
            state: businessUser?.registeredAddress?.state || "",
            pincode: businessUser?.registeredAddress?.pincode || "",
            landmark: businessUser?.registeredAddress?.landmark || "",
          },
        });

        updateUser(businessUser);
      } catch (error) {
        errorAlert("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Handle nested registeredAddress fields
    if (name.startsWith("registeredAddress.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        registeredAddress: {
          ...prev.registeredAddress,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      registeredAddress: {
        ...prev.registeredAddress,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedUser = await updateBusinessProfile(formData);
      updateUser(updatedUser);

      setFormData({
        companyName: updatedUser.businessDetails?.companyName || "",
        gstNumber: updatedUser.businessDetails?.gstNumber || "",
        contactPerson: updatedUser.businessDetails?.contactPerson || "",
        email: updatedUser.businessDetails?.email || "",
        address: updatedUser.businessDetails?.address || "",
        // ✅ NEW: Update registered address
        registeredAddress: {
          street: updatedUser.registeredAddress?.street || "",
          city: updatedUser.registeredAddress?.city || "",
          state: updatedUser.registeredAddress?.state || "",
          pincode: updatedUser.registeredAddress?.pincode || "",
          landmark: updatedUser.registeredAddress?.landmark || "",
        },
      });

      successAlert("Business profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      errorAlert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisteredAddressSave = async () => {
    if (
      !formData.registeredAddress?.street ||
      !formData.registeredAddress?.city
    ) {
      errorAlert("Please fill in all required fields");
      return;
    }

    try {
      setIsProcessing(true);

      // ✅ Call backend API
      const updatedAddress = await updateAddressAPI(formData.registeredAddress);

      // ✅ Update local state
      setFormData((prev) => ({
        ...prev,
        registeredAddress: updatedAddress,
      }));

      setIsEditingAddress(false);
      successAlert("Address updated successfully!");
    } catch (error) {
      errorAlert(error.response?.data?.message || "Failed to update address");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      companyName: user?.businessDetails?.companyName || "",
      gstNumber: user?.businessDetails?.gstNumber || "",
      contactPerson: user?.businessDetails?.contactPerson || "",
      email: user?.businessDetails?.email || "",
      address: user?.businessDetails?.address || "",
      // ✅ NEW: Reset registered address
      registeredAddress: {
        street: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-grey-50 min-h-screen flex items-start justify-center pt-6 md:pt-12 pb-4 md:pb-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-0 flex flex-col justify-center mx-2">
        <div className="px-4 md:px-6 pt-2 md:pt-4 pb-2">
          <div className="flex items-center gap-3 justify-center mb-2">
            <MdBusiness size={32} className="text-primary-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-grey-900">
              Business Profile
            </h2>
          </div>
          <p className="text-secondary-500 mb-6 md:mb-8 text-center text-base md:text-lg">
            View and update your business details and delivery address.
          </p>
        </div>
        <div className="px-4 md:px-6 pb-6 md:pb-8">
          {/* Verification Status */}
          <div className="mb-6 p-4 bg-secondary-50 rounded-lg border border-grey-200">
            <div className="flex items-center justify-between">
              <span className="text-grey-900 font-medium">
                Verification Status:
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.verificationStatus === "Approved"
                    ? "bg-primary-100 text-primary-600"
                    : user?.verificationStatus === "Pending"
                    ? "bg-warning bg-opacity-20 text-warning"
                    : "bg-error bg-opacity-20 text-error"
                }`}
              >
                {user?.verificationStatus || "Pending"}
              </span>
            </div>
            {user?.verificationStatus === "Rejected" &&
              user?.rejectionReason && (
                <p className="text-error text-sm mt-2">
                  Rejection Reason: {user.rejectionReason}
                </p>
              )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">
            {/* Phone (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-grey-900 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={user?.phone || ""}
                disabled
                className="w-full bg-secondary-50 border border-grey-200 rounded-lg px-4 py-2 text-base font-medium text-secondary-500 cursor-not-allowed shadow-sm"
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-grey-900 mb-2">
                Company Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg transition-colors text-base font-medium text-grey-900 shadow-sm ${
                  isEditing
                    ? "border-grey-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-600"
                    : "border-grey-200 bg-secondary-50 cursor-not-allowed"
                } outline-none`}
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
                required
              />
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium text-grey-900 mb-2">
                GST Number <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg transition-colors uppercase text-base font-medium text-grey-900 shadow-sm ${
                  isEditing
                    ? "border-grey-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-600"
                    : "border-grey-200 bg-secondary-50 cursor-not-allowed"
                } outline-none`}
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
                pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                placeholder="22AAAAA0000A1Z5"
                required
              />
              <p className="text-xs text-secondary-500 mt-1">
                Format: 22AAAAA0000A1Z5
              </p>
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-grey-900 mb-2">
                Contact Person <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg transition-colors text-base font-medium text-grey-900 shadow-sm ${
                  isEditing
                    ? "border-grey-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-600"
                    : "border-grey-200 bg-secondary-50 cursor-not-allowed"
                } outline-none`}
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-grey-900 mb-2">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg transition-colors text-base font-medium text-grey-900 shadow-sm ${
                  isEditing
                    ? "border-grey-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-600"
                    : "border-grey-200 bg-secondary-50 cursor-not-allowed"
                } outline-none`}
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-grey-900 mb-2">
                Business Address <span className="text-error">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg transition-colors text-base font-medium text-grey-900 shadow-sm ${
                  isEditing
                    ? "border-grey-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-600"
                    : "border-grey-200 bg-secondary-50 cursor-not-allowed"
                } outline-none`}
                style={{
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                  minHeight: 44,
                }}
                required
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-grey-300 text-grey-50 rounded-lg font-medium transition-colors"
                  style={{ minHeight: "48px" }}
                >
                  <MdSave size={20} />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-secondary-200 hover:bg-secondary-300 text-grey-900 rounded-lg font-medium transition-colors"
                  style={{ minHeight: "48px" }}
                >
                  <MdCancel size={20} />
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Registered Address Section */}
          <div className="border-t border-grey-200 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-grey-900">
                Registered Delivery Address
              </h3>
              {!isEditingAddress && (
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingAddress ? (
              <div className="space-y-4 p-4 bg-secondary-50 rounded-lg border border-grey-200">
                {/* Street Address */}
                <div>
                  <label className="block text-sm font-medium text-grey-900 mb-2">
                    Street Address <span className="text-error">*</span>
                  </label>
                  <textarea
                    name="street"
                    value={formData.registeredAddress?.street || ""}
                    onChange={handleAddressChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-600 outline-none text-base font-medium text-grey-900 shadow-sm"
                    placeholder="Building no, Street name, Area"
                    style={{
                      boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                      minHeight: 44,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-grey-900 mb-2">
                      City <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.registeredAddress?.city || ""}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-600 outline-none text-base font-medium text-grey-900 shadow-sm"
                      style={{
                        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                        minHeight: 44,
                      }}
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-grey-900 mb-2">
                      State <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.registeredAddress?.state || ""}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-600 outline-none text-base font-medium text-grey-900 shadow-sm"
                      style={{
                        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                        minHeight: 44,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-grey-900 mb-2">
                      Pincode <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.registeredAddress?.pincode || ""}
                      onChange={handleAddressChange}
                      pattern="\d{6}"
                      className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-600 outline-none text-base font-medium text-grey-900 shadow-sm"
                      placeholder="600001"
                      style={{
                        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                        minHeight: 44,
                      }}
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-sm font-medium text-grey-900 mb-2">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.registeredAddress?.landmark || ""}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border border-grey-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-600 outline-none text-base font-medium text-grey-900 shadow-sm"
                      placeholder="Near landmark"
                      style={{
                        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                        minHeight: 44,
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setIsEditingAddress(false)}
                    className="flex-1 px-4 py-2 bg-secondary-200 hover:bg-secondary-300 text-grey-900 rounded-lg font-medium transition-colors"
                    style={{ minHeight: "44px" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegisteredAddressSave}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-grey-300 text-grey-50 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    style={{ minHeight: "44px" }}
                  >
                    {isProcessing ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div className="p-4 bg-secondary-50 rounded-lg border border-grey-200">
                {formData.registeredAddress?.street ? (
                  <div className="text-secondary-600 space-y-1 text-sm">
                    <p>{formData.registeredAddress.street}</p>
                    {formData.registeredAddress.landmark && (
                      <p className="text-secondary-500">
                        Landmark: {formData.registeredAddress.landmark}
                      </p>
                    )}
                    <p>
                      {formData.registeredAddress.city},
                      {formData.registeredAddress.state} -
                      {formData.registeredAddress.pincode}
                    </p>
                  </div>
                ) : (
                  <p className="text-secondary-500 text-sm">
                    No registered address set
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessUserProfile;
