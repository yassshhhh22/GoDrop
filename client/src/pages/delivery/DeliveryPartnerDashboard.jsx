import React, { useEffect, useState } from "react";
import {
  MdLocalShipping,
  MdLocationOn,
  MdCheckCircle,
  MdPendingActions,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import useDeliveryPartnerStore from "../../stores/deliveryPartnerStore";
import useAuthStore from "../../stores/authStore";
import Loading from "../../components/layout/Loading";
import { formatPrice } from "../../utils/priceFormatter";

const DeliveryPartnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders, fetchOrders, updateOrderStatus, updateLocation, isLoading } =
    useDeliveryPartnerStore();

  const [filter, setFilter] = useState("all");
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Enable live location tracking
  useEffect(() => {
    if (!locationEnabled) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
      },
      (error) => {
        },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationEnabled, updateLocation]);

  const toggleLocationTracking = () => {
    if (!locationEnabled) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationEnabled(true);
        },
        (error) => {
          alert("Please enable location permission to track deliveries");
        }
      );
    } else {
      setLocationEnabled(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    fetchOrders(); // Refresh list
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-warning bg-opacity-20 text-warning",
      confirmed: "bg-primary-100 text-primary-600",
      picked: "bg-blue-100 text-blue-600",
      arriving: "bg-purple-100 text-purple-600",
      delivered: "bg-green-100 text-green-600",
      cancelled: "bg-error bg-opacity-20 text-error",
    };
    return colors[status] || "bg-gray-200 text-gray-600";
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      confirmed: "picked",
      picked: "arriving",
      arriving: "delivered",
    };
    return statusFlow[currentStatus];
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => {
          if (filter === "active")
            return ["confirmed", "picked", "arriving"].includes(order.status);
          if (filter === "completed") return order.status === "delivered";
          return true;
        });

  // Stats
  const activeOrders = orders.filter((o) =>
    ["confirmed", "picked", "arriving"].includes(o.status)
  ).length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;
  const totalEarnings = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size={150} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name || "Delivery Partner"}
          </h1>
          <p className="text-secondary-500">
            Manage your deliveries efficiently
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-500 text-sm">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeOrders}
                </p>
              </div>
              <MdPendingActions className="text-primary-600" size={40} />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-500 text-sm">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedOrders}
                </p>
              </div>
              <MdCheckCircle className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(totalEarnings)}
                </p>
              </div>
              <MdLocalShipping className="text-warning" size={40} />
            </div>
          </div>
        </div>

        {/* Location Tracking Toggle */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdLocationOn
                className={
                  locationEnabled ? "text-primary-600" : "text-gray-400"
                }
                size={24}
              />
              <div>
                <p className="font-semibold text-gray-900">
                  Live Location Tracking
                </p>
                <p className="text-sm text-secondary-500">
                  {locationEnabled
                    ? "Currently tracking your location"
                    : "Enable to share live location with customers"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleLocationTracking}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                locationEnabled
                  ? "bg-error text-gray-50 hover:bg-error/90"
                  : "bg-primary-600 text-gray-50 hover:bg-primary-700"
              }`}
            >
              {locationEnabled ? "Stop Tracking" : "Start Tracking"}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {["all", "active", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === tab
                  ? "bg-primary-600 text-gray-50"
                  : "bg-gray-50 border border-gray-200 text-gray-900 hover:bg-secondary-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <MdLocalShipping
                className="mx-auto text-secondary-300 mb-4"
                size={64}
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Orders Found
              </h3>
              <p className="text-secondary-500">
                {filter === "active"
                  ? "No active deliveries at the moment"
                  : filter === "completed"
                  ? "No completed deliveries yet"
                  : "You don't have any assigned orders"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-sm text-secondary-500">
                      {order.orderType === "print"
                        ? "Print Order"
                        : "Normal Order"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-4 p-3 bg-secondary-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Customer: {order.customer?.name || "N/A"}
                  </p>
                  <p className="text-sm text-secondary-600">
                    Phone: {order.customer?.phone || "N/A"}
                  </p>
                </div>

                {/* Delivery Address */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <MdLocationOn size={16} />
                    Delivery Address
                  </p>
                  <p className="text-sm text-secondary-600">
                    {order.deliveryAddress?.address}
                    {order.deliveryAddress?.landmark && (
                      <>
                        <br />
                        Landmark: {order.deliveryAddress.landmark}
                      </>
                    )}
                    <br />
                    {order.deliveryAddress?.city},{" "}
                    {order.deliveryAddress?.state} -{" "}
                    {order.deliveryAddress?.pincode}
                  </p>
                </div>

                {/* Order Details */}
                <div className="flex items-center justify-between mb-4 p-3 bg-primary-50 rounded-lg">
                  <div>
                    <p className="text-sm text-secondary-600">Total Amount</p>
                    <p className="font-bold text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Delivery Fee</p>
                    <p className="font-bold text-gray-900">
                      {formatPrice(order.deliveryFee || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Payment</p>
                    <p className="font-bold text-gray-900">
                      {order.payment?.method === "cod" ? "COD" : "Paid"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/order/${order.orderId}`, {
                        state: { orderType: order.orderType },
                      })
                    } // ✅ Pass orderType in state
                    className="flex-1 px-4 py-2 bg-secondary-100 text-gray-900 rounded-lg font-medium hover:bg-secondary-200 transition-colors"
                  >
                    View Details
                  </button>

                  {getNextStatus(order.status) && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          order.orderId,
                          getNextStatus(order.status)
                        )
                      }
                      className="flex-1 px-4 py-2 bg-primary-600 text-gray-50 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Mark as {getNextStatus(order.status)}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerDashboard;
