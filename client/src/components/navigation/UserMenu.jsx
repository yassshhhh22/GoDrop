import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineExternalLink } from "react-icons/hi";
import useAuthStore from "../../stores/authStore";
import ConfirmBox from "../layout/ConfirmBox";
import Divider from "../layout/Divider";

const UserMenu = ({ close }) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { user, logout, isBusinessUser, getCustomerType } = useAuthStore();

  const handleLogout = async () => {
    // ✅ Close confirmation modal first
    setShowLogoutConfirm(false);

    // ✅ Close user menu if provided
    if (close) {
      close();
    }

    // ✅ Call logout (will redirect automatically)
    await logout();
  };

  const handleClose = () => {
    if (close) {
      close();
    }
  };

  const customerType = getCustomerType();
  const displayName = user?.name || user?.phone || "User";

  return (
    <div className="min-w-[250px]">
      {/* User Info */}
      <div className="font-semibold text-grey-900">My Account</div>
      <div className="text-sm flex items-center gap-2 mt-1">
        <p className="text-secondary-500">{displayName}</p>
        {customerType && (
          <span className="px-2 py-0.5 bg-primary-100 text-primary-600 rounded text-xs font-medium">
            {customerType}
          </span>
        )}
      </div>

      <Divider />

      {/* Menu Items for all users */}
      <div className="grid gap-2">
        <Link
          onClick={handleClose}
          to="/profile"
          className="px-3 py-2 hover:bg-primary-100 rounded transition-colors text-grey-900"
        >
          My Profile
        </Link>
        <Link
          onClick={handleClose}
          to="/orders"
          className="px-3 py-2 hover:bg-primary-100 rounded transition-colors text-grey-900"
        >
          My Orders
        </Link>

        {/* ✅ NEW: Only show for Customer, not BusinessUser */}
        {!isBusinessUser() && (
          <Link
            onClick={handleClose}
            to="/addresses"
            className="px-3 py-2 hover:bg-primary-100 rounded transition-colors text-grey-900"
          >
            My Addresses
          </Link>
        )}
      </div>

      <Divider />

      {/* Business User Menu Items */}
      {isBusinessUser() && (
        <>
          <div className="grid gap-2">
            <Link
              onClick={handleClose}
              to="/business/dashboard"
              className="px-3 py-2 hover:bg-primary-100 rounded transition-colors text-grey-900 flex items-center justify-between"
            >
              <span>Business Dashboard</span>
              <HiOutlineExternalLink />
            </Link>
            <Link
              onClick={handleClose}
              to="/business/orders"
              className="px-3 py-2 hover:bg-primary-100 rounded transition-colors text-grey-900"
            >
              Business Orders
            </Link>
            <Link
              onClick={handleClose}
              to="/business/profile"
              className="px-3 py-2 hover:bg-primary-100 rounded transition-colors text-grey-900"
            >
              Company Details
            </Link>
          </div>

          <Divider />
        </>
      )}

      {/* Logout */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full text-left px-3 py-2 hover:bg-red hover:bg-opacity-10 hover:text-error rounded transition-colors text-grey-900"
      >
        Log Out
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <ConfirmBox
          close={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Logout"
          message="Are you sure you want to logout?"
          confirmText="Logout"
          cancelText="Cancel"
          variant="warning"
        />
      )}
    </div>
  );
};

export default UserMenu;
