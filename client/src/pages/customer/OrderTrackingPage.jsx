import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { MdArrowBack, MdMyLocation, MdLocalShipping } from "react-icons/md";
import useOrderStore from "../../stores/orderStore";
import { formatPrice } from "../../utils/priceFormatter";
import Loading from "../../components/layout/Loading";
import { trackOrder as trackOrderService } from "../../services/order.service"; // ✅ Import service
import { errorAlert } from "../../utils/alerts";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, fetchOrderById, isLoading } = useOrderStore();
  const location = useLocation(); // ✅ Initialize useLocation

  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [deliveryPartnerLocation, setDeliveryPartnerLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Map Configuration
  const mapContainerStyle = {
    width: "100%",
    height: "500px",
  };

  const defaultCenter = {
    lat: 19.076, // Mumbai default
    lng: 72.8777,
  };

  // ✅ Fetch order details
  useEffect(() => {
    if (orderId) {
      const { orderType } = location.state || {}; // ✅ Get orderType from state
      fetchOrderById(orderId, orderType); // ✅ Pass orderType to fetcher
    }
  }, [orderId, location.state]); // ✅ Add location.state to dependency array

  // ✅ Get user's delivery address coordinates (geocoding)
  useEffect(() => {
    if (selectedOrder?.deliveryAddress) {
      geocodeAddress(selectedOrder.deliveryAddress.address);
    }
  }, [selectedOrder]);

  // ✅ Poll delivery partner location every 30 seconds
  useEffect(() => {
    if (!selectedOrder?.deliveryPartner) return;

    const fetchPartnerLocation = async () => {
      try {
        // ✅ Use service instead of fetch
        const data = await trackOrderService(orderId);

        if (data?.deliveryPartner?.liveLocation) {
          const { latitude, longitude } = data.deliveryPartner.liveLocation;
          setDeliveryPartnerLocation({ lat: latitude, lng: longitude });
        }
      } catch (error) {
        console.error("Failed to fetch partner location:", error);

        // ✅ Check if it's a 401 error
        if (error.response?.status === 401) {
          errorAlert("Session expired. Please login again.");
          navigate("/login");
        }
      }
    };

    // Fetch immediately
    fetchPartnerLocation();

    // Poll every 30 seconds
    const interval = setInterval(fetchPartnerLocation, 30000);

    return () => clearInterval(interval);
  }, [selectedOrder, orderId, navigate]);

  // ✅ Calculate route when both locations available
  useEffect(() => {
    if (deliveryPartnerLocation && userLocation && window.google) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: deliveryPartnerLocation,
          destination: userLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
          }
        }
      );
    }
  }, [deliveryPartnerLocation, userLocation]);

  // ✅ Geocode address to lat/lng
  const geocodeAddress = (address) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        setUserLocation(location);
      }
    });
  };

  // ✅ Center map on markers
  useEffect(() => {
    if (map && deliveryPartnerLocation && userLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(deliveryPartnerLocation);
      bounds.extend(userLocation);
      map.fitBounds(bounds);
    }
  }, [map, deliveryPartnerLocation, userLocation]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      picked: { bg: "bg-blue-100", text: "text-blue-600", label: "Picked Up" },
      arriving: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        label: "On The Way",
      },
      delivered: {
        bg: "bg-green-100",
        text: "text-green-600",
        label: "Delivered",
      },
    };

    const config = statusConfig[status] || statusConfig.picked;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size={150} />
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-secondary-500 mb-4">Order not found</p>
          <Link
            to="/orders"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-grey-50 rounded-lg font-medium transition-colors inline-block"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = selectedOrder;

  return (
    <div className="bg-grey-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={
              () =>
                navigate(`/order/${orderId}`, {
                  state: { orderType: order.orderType },
                }) // ✅ Pass orderType back to OrderDetailPage
            }
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <MdArrowBack size={20} />
            Back to Order Details
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-grey-900 mb-1">
                Track Order #{order.orderId}
              </h1>
              <p className="text-secondary-500">Real-time delivery tracking</p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Map */}
          <div className="lg:col-span-2">
            <div className="bg-grey-50 border border-grey-200 rounded-lg overflow-hidden">
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={
                    deliveryPartnerLocation || userLocation || defaultCenter
                  }
                  zoom={14}
                  onLoad={setMap}
                >
                  {/* User's Delivery Location */}
                  {userLocation && (
                    <Marker
                      position={userLocation}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      }}
                      title="Your Delivery Location"
                    />
                  )}

                  {/* Delivery Partner Location */}
                  {deliveryPartnerLocation && (
                    <Marker
                      position={deliveryPartnerLocation}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                      }}
                      title="Delivery Partner"
                    />
                  )}

                  {/* Route */}
                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              </LoadScript>
            </div>

            {/* Map Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm text-secondary-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span>Delivery Partner</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-error rounded-full"></div>
                <span>Your Location</span>
              </div>
            </div>
          </div>

          {/* Right: Delivery Info */}
          <div className="space-y-4">
            {/* Delivery Partner Info */}
            {order.deliveryPartner && (
              <div className="bg-grey-50 border border-grey-200 rounded-lg p-4">
                <h3 className="font-semibold text-grey-900 mb-3 flex items-center gap-2">
                  <MdLocalShipping size={20} />
                  Delivery Partner
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Name:</span>
                    <span className="font-medium text-grey-900">
                      {order.deliveryPartner.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Phone:</span>
                    <a
                      href={`tel:${order.deliveryPartner.phone}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {order.deliveryPartner.phone}
                    </a>
                  </div>
                  {order.deliveryPartner.vehicleDetails && (
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Vehicle:</span>
                      <span className="font-medium text-grey-900">
                        {order.deliveryPartner.vehicleDetails.type}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            <div className="bg-grey-50 border border-grey-200 rounded-lg p-4">
              <h3 className="font-semibold text-grey-900 mb-3 flex items-center gap-2">
                <MdMyLocation size={20} />
                Delivery Address
              </h3>
              <p className="text-secondary-600 text-sm">
                {order.deliveryAddress?.address}
                {order.deliveryAddress?.landmark && (
                  <>
                    <br />
                    Landmark: {order.deliveryAddress.landmark}
                  </>
                )}
                <br />
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{" "}
                {order.deliveryAddress?.pincode}
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-grey-50 border border-grey-200 rounded-lg p-4">
              <h3 className="font-semibold text-grey-900 mb-3">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Items Total:</span>
                  <span className="font-medium text-grey-900">
                    {formatPrice(order.itemsTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Delivery Fee:</span>
                  <span className="font-medium text-grey-900">
                    {formatPrice(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-grey-200 pt-2">
                  <span className="font-semibold text-grey-900">Total:</span>
                  <span className="font-bold text-grey-900">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            {directions && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-grey-900">
                  <strong>Estimated Arrival:</strong>
                  <br />
                  {directions.routes[0].legs[0].duration.text} (
                  {directions.routes[0].legs[0].distance.text})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
