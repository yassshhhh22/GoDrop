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
    <div>
      {/* Header */}
      <div className="bg-grey-50 shadow-sm px-4 py-3 flex justify-between gap-4 items-center rounded-lg border border-grey-200 mb-4">
        <h2 className="font-semibold text-grey-900 text-ellipsis line-clamp-1">
          Saved Addresses
        </h2>
        <button
          onClick={() => setOpenAddModal(true)}
          className="border border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-600 hover:text-grey-50 transition-colors flex items-center gap-2 font-medium"
        >
          <IoAdd size={20} />
          Add Address
        </button>
      </div>

      {/* Address List */}
      <div className="bg-secondary-50 p-4 grid gap-4 rounded-lg">
        {addresses.length === 0 ? (
          <div className="text-center py-12 bg-grey-50 rounded-lg border border-grey-200">
            <MdLocationOn
              size={64}
              className="mx-auto text-secondary-300 mb-4"
            />
            <h3 className="text-lg font-semibold text-grey-900 mb-2">
              No addresses saved
            </h3>
            <p className="text-secondary-500 mb-6">
              Add your delivery address to place orders
            </p>
            <button
              onClick={() => setOpenAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-grey-50 rounded-lg font-medium transition-colors"
            >
              <IoAdd size={20} />
              Add Your First Address
            </button>
          </div>
        ) : (
          <>
            {addresses.map((address, index) => (
              <div
                key={address._id || index}
                className="border border-grey-200 rounded-lg p-4 flex gap-4 bg-grey-50 hover:shadow-md transition-shadow"
              >
                {/* Address Icon & Content */}
                <div className="w-full">
                  <div className="flex items-start gap-3 mb-3">
                    {getAddressIcon(address.label)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-grey-900">
                          {address.label}
                        </h3>
                        {address.isDefault && (
                          <span className="px-3 py-1 bg-primary-600 text-grey-50 rounded-full text-xs font-medium">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-grey-900 mb-1">{address.address}</p>

                      {address.landmark && (
                        <p className="text-secondary-500 text-sm mb-1">
                          Landmark: {address.landmark}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 text-secondary-500 text-sm">
                        {address.city && <span>{address.city}</span>}
                        {address.state && <span>• {address.state}</span>}
                        {address.pincode && <span>• {address.pincode}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Set Default Button */}
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                    >
                      Set as default
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEditClick(address)}
                    className="bg-primary-100 text-primary-600 p-2 rounded hover:bg-primary-600 hover:text-grey-50 transition-colors"
                    title="Edit address"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(address._id)}
                    className="bg-error bg-opacity-10 text-error p-2 rounded hover:bg-error hover:text-grey-50 transition-colors"
                    title="Delete address"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add More Button */}
            <button
              onClick={() => setOpenAddModal(true)}
              className="h-20 bg-secondary-50 border-2 border-dashed border-grey-300 rounded-lg flex justify-center items-center cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition-colors group"
            >
              <div className="flex items-center gap-2 text-secondary-500 group-hover:text-primary-600">
                <IoAdd size={24} />
                <span className="font-medium">Add New Address</span>
              </div>
            </button>
          </>
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
