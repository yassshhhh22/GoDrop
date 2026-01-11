import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MdStore,
  MdVerifiedUser,
  MdPending,
  MdCancel,
  MdShoppingBag,
  MdReceipt,
} from "react-icons/md";
import useAuthStore from "../../stores/authStore";
import useOrderStore from "../../stores/orderStore";

const BusinessDashboard = () => {
  const { user } = useAuthStore();
  const { orders, fetchOrders, isLoading } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "Pending").length,
    completedOrders: orders.filter((o) => o.status === "Delivered").length,
  };

  const getVerificationStatusColor = () => {
    switch (user?.verificationStatus) {
      case "Approved":
        return "bg-primary-100 text-primary-600";
      case "Pending":
        return "bg-warning bg-opacity-20 text-warning";
      case "Rejected":
        return "bg-error bg-opacity-20 text-error";
      default:
        return "bg-secondary-100 text-secondary-600";
    }
  };

  const getVerificationIcon = () => {
    switch (user?.verificationStatus) {
      case "Approved":
        return <MdVerifiedUser size={24} />;
      case "Pending":
        return <MdPending size={24} />;
      case "Rejected":
        return <MdCancel size={24} />;
      default:
        return <MdStore size={24} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-start justify-center pt-6 md:pt-12 pb-4 md:pb-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-0 flex flex-col justify-center mx-2">
        {/* Header */}
        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
            Business Dashboard
          </h1>
          <p className="text-secondary-500 text-center text-base md:text-lg">
            Manage your business account and orders
          </p>
        </div>

        <div className="px-4 md:px-8 pb-8">
          {/* Verification Status Card */}
          <div
            className={`${getVerificationStatusColor()} border-2 border-current rounded-xl p-6 mb-8 shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 bg-opacity-20 rounded-full">
                {getVerificationIcon()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  Verification Status:{" "}
                  {user?.verificationStatus || "Not Submitted"}
                </h3>
                {user?.verificationStatus === "Approved" && (
                  <p>
                    Your business account is verified. Enjoy wholesale pricing!
                  </p>
                )}
                {user?.verificationStatus === "Pending" && (
                  <p>
                    Your application is under review. You can browse products
                    but cannot place orders yet.
                  </p>
                )}
                {user?.verificationStatus === "Rejected" && (
                  <>
                    <p className="mb-2">
                      Your application was rejected: {user?.rejectionReason}
                    </p>
                    <Link
                      to="/business/register"
                      className="inline-block px-4 py-2 bg-gray-50 text-error font-medium rounded-lg hover:bg-opacity-80 transition-colors"
                    >
                      Reapply
                    </Link>
                  </>
                )}
                {!user?.verificationStatus && (
                  <>
                    <p className="mb-2">
                      Complete your business registration to access wholesale
                      pricing
                    </p>
                    <Link
                      to="/business/register"
                      className="inline-block px-4 py-2 bg-gray-50 font-medium rounded-lg hover:bg-opacity-80 transition-colors"
                    >
                      Complete Registration
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-secondary-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-secondary-500">
                  Total Orders
                </h3>
                <MdShoppingBag className="text-primary-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalOrders}
              </p>
            </div>

            <div className="bg-secondary-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-secondary-500">
                  Pending Orders
                </h3>
                <MdPending className="text-warning" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.pendingOrders}
              </p>
            </div>

            <div className="bg-secondary-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-secondary-500">
                  Completed Orders
                </h3>
                <MdVerifiedUser className="text-primary-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.completedOrders}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-secondary-50 border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/business/profile"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <MdStore size={24} className="text-primary-600" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Business Profile
                  </h4>
                  <p className="text-sm text-secondary-500">
                    View and edit business details
                  </p>
                </div>
              </Link>

              <Link
                to="/orders"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <MdReceipt size={24} className="text-primary-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Order History</h4>
                  <p className="text-sm text-secondary-500">
                    View all your orders
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
