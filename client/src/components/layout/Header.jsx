import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Search from "../navigation/Search";
import { FaRegCircleUser } from "react-icons/fa6";
import { BsCart4 } from "react-icons/bs";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import { MdPrint } from "react-icons/md";
import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import useUIStore from "../../stores/uiStore";
import UserMenu from "../navigation/UserMenu";
import logoImage from "../../assets/text.png";
import DisplayCartItem from "../cart/DisplayCartItem";
import LoginModal from "../modals/LoginModal";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuthStore();
  const { items, totalItems, fetchCart } = useCartStore();
  const {
    openCartSection,
    setOpenCartSection,
    toggleCart,
    isCartOpen,
    openCart,
    closeCart,
    openLoginModal,
  } = useUIStore();

  const [openUserMenu, setOpenUserMenu] = useState(false);

  const isSearchPage = location.pathname === "/search";

  const handleCloseUserMenu = () => {
    setOpenUserMenu(false);
  };

  const handleMobileUser = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/user-menu");
  };

  const handleOpenCart = () => {
    if (isAuthenticated) {
      fetchCart();
    }
    openCart();
  };

  const redirectToLoginPage = () => {
    openLoginModal();
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setOpenUserMenu(false);
    }
  }, [isAuthenticated]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <header
        className={`h-16 lg:h-20 sticky top-0 z-40 flex flex-col justify-center gap-1 bg-white w-full border-b border-gray-200`}
      >
        <div
          className={`hidden sm:flex w-full max-w-screen-7xl mx-auto flex items-center justify-between px-2 lg:px-6`}
        >
          {/* Logo - Left, with controllable padding */}
          <div style={{ paddingLeft: "2rem" }}
            className={`h-full p-2 box-border flex items-center pl-2 lg:pl-8`}
          >
            <Link to="/" className="h-full flex items-center gap-2">
              <div className="p-1 box-border">
                <img
                  src={logoImage}
                  alt="GoDrop Logo"
                  className="w-16 lg:w-20 lg:w-36"
                />
              </div>
            </Link>
          </div>
          {/* Search - Desktop - Center */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-auto">
            <Search />
          </div>
          {/* User and Cart - Right Side */}
          <div className={`flex items-center gap-4 lg:gap-6`}>
            {/* Print Button */}
            <Link
              to="/print-order"
              title="Print Documents"
              className="flex items-center gap-1.5 text-gray-900 hover:text-primary-600 transition-colors"
            >
              <MdPrint size={22} />
              <span className="hidden lg:inline">Print</span>
            </Link>

            {/* User Section - Desktop */}
            <div className="hidden lg:block relative">
              {isAuthenticated ? (
                <div
                  onClick={() => setOpenUserMenu(!openUserMenu)}
                  className="flex select-none items-center gap-1 cursor-pointer text-gray-900 hover:text-primary-600 transition-colors"
                >
                  <p>Account</p>
                  {openUserMenu ? (
                    <GoTriangleUp size={22} />
                  ) : (
                    <GoTriangleDown size={22} />
                  )}
                </div>
              ) : (
                <button
                  onClick={redirectToLoginPage}
                  className="text-base px-2 text-gray-900 hover:text-primary-600 transition-colors"
                >
                  Login
                </button>
              )}
              {/* User Menu Dropdown */}
              {openUserMenu && isAuthenticated && (
                <div className="absolute right-0 top-12 z-50">
                  <div className="bg-white rounded p-4 min-w-52 lg:shadow-lg border border-gray-200">
                    <UserMenu close={handleCloseUserMenu} />
                  </div>
                </div>
              )}
            </div>
            {/* User Icon - Mobile */}
            <button
              onClick={handleMobileUser}
              className="lg:hidden text-gray-900 hover:text-primary-600 transition-colors"
            >
              <FaRegCircleUser size={22} />
            </button>
            {/* Cart Button - Desktop - Rectangular Container */}
            <div className="hidden lg:block w-40 h-8 flex items-center justify-center">
              <button
                onClick={handleOpenCart}
                className="w-30 h-full text-gray-900 hover:text-primary-600 flex items-center gap-2 bg-primary-50 hover:bg-primary-100 px-3 py-3 rounded-lg transition-all relative hover:shadow-2xs border border-primary-200"
              >
                <BsCart4 size={24} className="text-primary-600" />
                <div className="flex flex-col items-start whitespace-nowrap">
                  <span className="text-lg font text-primary-600">My Cart</span>
                  {totalItems > 0 && (
                    <span className="text-xs text-secondary-600">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                  )}
                </div>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
            {/* Cart Button - Mobile (Icon Only) */}
            <button
              onClick={handleOpenCart}
              className="lg:hidden text-gray-900 hover:text-primary-600 flex items-center gap-2 bg-primary-50 px-2 py-2 rounded transition-colors relative"
            >
              <BsCart4 size={22} className="text-primary-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Search - Mobile */}
        <div className="sm:hidden w-full px-2 lg:hidden">
          <Search />
        </div>
      </header>

      {isCartOpen && <DisplayCartItem close={closeCart} />}

      <LoginModal />
    </>
  );
};

export default Header;
