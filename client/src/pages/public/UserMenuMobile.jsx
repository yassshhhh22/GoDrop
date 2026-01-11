import React from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import UserMenu from "../../components/navigation/UserMenu";

const UserMenuMobile = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <section className="bg-gray-50 min-h-screen w-full py-2">
      <button
        onClick={handleClose}
        className="text-gray-900 block w-fit ml-auto mr-4 hover:bg-secondary-100 p-2 rounded-full transition-colors"
        aria-label="Close menu"
      >
        <IoClose size={25} />
      </button>
      <div className="container mx-auto px-3 pb-8">
        <UserMenu />
      </div>
    </section>
  );
};

export default UserMenuMobile;
