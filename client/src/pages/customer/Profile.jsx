import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import useAuthStore from "../../stores/authStore";
import { updateProfile, getProfile } from "../../services/customer.service";
import { successAlert, errorAlert } from "../../utils/alerts.jsx";

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ NEW: Redirect business users to business profile
  useEffect(() => {
    if (user?.role === "BusinessUser") {
      navigate("/business/profile", { replace: true });
    }
  }, [user, navigate]);

  // ✅ NEW: Fetch fresh profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const profile = await getProfile();

        // ✅ Update form with fresh data
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
        });

        // ✅ Also update auth store with fresh data
        updateUser(profile);
      } catch (error) {
        errorAlert("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "Customer") {
      fetchProfileData();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ Backend returns { customer: { id, name, email, phone } }
      const updatedData = await updateProfile(formData);

      // ✅ Fetch full profile again to get complete data
      const fullProfile = await getProfile();

      // ✅ Update auth store with complete profile
      updateUser(fullProfile);

      // ✅ Update form with fresh data
      setFormData({
        name: fullProfile.name || "",
        email: fullProfile.email || "",
      });

      successAlert("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      errorAlert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  // ✅ Show loading state during initial fetch
  if (isLoading && !formData.name) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <p className="text-secondary-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-start justify-center pt-6 md:pt-12 pb-4 md:pb-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-0 flex flex-col justify-center mx-2">
        <div className="px-4 md:px-6 pt-2 md:pt-4 pb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            My Profile
          </h2>
          <p className="text-secondary-500 mb-6 md:mb-8 text-center text-base md:text-lg">
            View and update your profile details.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 md:gap-8 px-4 md:px-6 pb-6 md:pb-8"
        >
          {/* Phone (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={user?.phone || ""}
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-secondary-50 text-secondary-500 cursor-not-allowed"
            />
            <p className="text-xs text-secondary-500 mt-1">
              Phone number cannot be changed
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full bg-secondary-50 border border-gray-200 rounded-lg px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm ${
                isEditing
                  ? "focus:ring-2 focus:ring-primary-500"
                  : "cursor-not-allowed"
              }`}
              style={{
                boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                minHeight: 44,
              }}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full bg-secondary-50 border border-gray-200 rounded-lg px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm ${
                isEditing
                  ? "focus:ring-2 focus:ring-primary-500"
                  : "cursor-not-allowed"
              }`}
              style={{
                boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                minHeight: 44,
              }}
            />
          </div>

          {/* Role Badge */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Account Type
            </label>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                {user?.role === "BusinessUser" ? "Business" : "Customer"}
              </span>
              {user?.role === "BusinessUser" && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.verificationStatus === "Approved"
                      ? "bg-primary-100 text-primary-600"
                      : user?.verificationStatus === "Pending"
                      ? "bg-warning bg-opacity-20 text-warning"
                      : "bg-error bg-opacity-20 text-error"
                  }`}
                >
                  {user?.verificationStatus}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-gray-50 rounded-xl font-semibold transition-all duration-200 focus:outline-none text-base"
                style={{ minHeight: "48px" }}
              >
                <MdEdit size={20} />
                Edit
              </button>
            )}
            {isEditing && (
              <>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-50 rounded-xl font-semibold transition-all duration-200 focus:outline-none text-base"
                  style={{ minHeight: "48px" }}
                >
                  <MdSave size={20} />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary-200 hover:bg-secondary-300 text-gray-900 rounded-xl font-semibold transition-all duration-200 focus:outline-none text-base"
                  style={{ minHeight: "48px" }}
                >
                  <MdCancel size={20} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
