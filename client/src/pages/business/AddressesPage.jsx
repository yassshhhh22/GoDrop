import React, { useState, useEffect } from "react";
import { MdDelete, MdEdit, MdHome, MdWork, MdLocationOn } from "react-icons/md";
import { IoAdd } from "react-icons/io5";
import useAddressStore from "../../stores/addressStore";
import AddAddress from "../../components/forms/AddAddress";
import EditAddressDetails from "../../components/forms/EditAddressDetails";
import ConfirmBox from "../../components/layout/ConfirmBox";
import Loading from "../../components/layout/Loading";
import useAuthStore from "../../stores/authStore"; // ✅ FIX: Remove curly braces (default export)
import { useNavigate } from "react-router-dom";
import { errorAlert } from "../../utils/alerts";

const AddressesPage = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteAddressId, setDeleteAddressId] = useState(null);

  const {
    addresses,
    fetchAddresses,
    deleteAddress,
    setDefaultAddress,
    isLoading,
  } = useAddressStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ NEW: Redirect BusinessUser to dashboard
    if (user?.role === "BusinessUser") {
      errorAlert("Business users don't have multiple delivery addresses");
      navigate("/business/dashboard", { replace: true });
      return;
    }

    fetchAddresses();
  }, [user, navigate]);

  const handleDeleteClick = (addressId) => {
    setDeleteAddressId(addressId);
  };

  const handleConfirmDelete = async () => {
    if (deleteAddressId) {
      await deleteAddress(deleteAddressId);
      setDeleteAddressId(null);
    }
  };

  const handleEditClick = (address) => {
    setEditData(address);
    setOpenEditModal(true);
  };

  const handleSetDefault = async (addressId) => {
    await setDefaultAddress(addressId);
  };

  const getAddressIcon = (label) => {
    switch (label) {
      case "Home":
        return <MdHome size={20} className="text-primary-600" />;
      case "Work":
        return <MdWork size={20} className="text-primary-600" />;
      default:
        return <MdLocationOn size={20} className="text-primary-600" />;
    }
  };

  if (isLoading && addresses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size={150} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Saved Addresses
            </h1>
            <button
              onClick={() => setOpenAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              <IoAdd size={18} />
              Add Address
            </button>
          </div>
          <p className="text-gray-600">Manage your delivery addresses</p>
        </div>

        {/* Addresses Grid */}
        {addresses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <MdLocationOn size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No addresses saved
            </h3>
            <p className="text-gray-600 mb-6">
              Add your delivery address to place orders
            </p>
            <button
              onClick={() => setOpenAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <IoAdd size={20} />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <div
                key={address._id || index}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Address Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getAddressIcon(address.label)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {address.label}
                        </h3>
                      </div>
                      {address.isDefault && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-gray-900 font-medium mb-1">
                      {address.address}
                    </p>

                    {address.landmark && (
                      <p className="text-gray-600 text-sm mb-2">
                        Landmark: {address.landmark}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-gray-600 text-sm">
                      {address.city && <span>{address.city}</span>}
                      {address.state && <span>•</span>}
                      {address.state && <span>{address.state}</span>}
                      {address.pincode && <span>•</span>}
                      {address.pincode && <span>{address.pincode}</span>}
                    </div>

                    {/* Set Default Button */}
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address._id)}
                        className="text-green-600 hover:text-green-700 text-sm font-semibold transition-colors mt-3"
                      >
                        Set as default
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEditClick(address)}
                      className="p-2.5 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                      title="Edit address"
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(address._id)}
                      className="p-2.5 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                      title="Delete address"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add More Button */}
            <button
              onClick={() => setOpenAddModal(true)}
              className="w-full h-32 bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-green-600 hover:bg-green-50 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-green-600">
                <IoAdd size={28} />
                <span className="font-semibold text-sm">Add New Address</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {openAddModal && <AddAddress close={() => setOpenAddModal(false)} />}

      {/* Edit Address Modal */}
      {openEditModal && editData && (
        <EditAddressDetails
          data={editData}
          close={() => {
            setOpenEditModal(false);
            setEditData(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteAddressId && (
        <ConfirmBox
          close={() => setDeleteAddressId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Address"
          message="Are you sure you want to delete this address? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
};

export default AddressesPage;
