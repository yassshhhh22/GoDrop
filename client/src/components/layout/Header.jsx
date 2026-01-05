import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Search from "../navigation/Search";
import { FaRegCircleUser } from "react-icons/fa6";
import { BsCart4 } from "react-icons/bs";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import { MdMenu, MdPrint } from "react-icons/md";
import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import useUIStore from "../../stores/uiStore";
import UserMenu from "../navigation/UserMenu";
import useMobile from "../../hooks/useMobile";
import logoImage from "../../assets/text.png"; // ✅ Import logo
import DisplayCartItem from "../cart/DisplayCartItem";
import LoginModal from "../modals/LoginModal";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile] = useMobile();

  // ✅ Subscribe to auth state changes
  const { isAuthenticated, user } = useAuthStore();
  const { items, totalItems, fetchCart } = useCartStore(); // ✅ Add fetchCart
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
    // ✅ Fetch fresh cart data before opening
    if (isAuthenticated) {
      fetchCart();
    }
    openCart();
  };

  const redirectToLoginPage = () => {
    if (isMobile) {
      navigate("/login");
    } else {
      openLoginModal();
    }
  };

  // ✅ Close user menu when auth state changes (logout)
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
        className={`h-16 lg:h-20 sticky top-0 z-40 flex flex-col justify-center gap-1 bg-grey-50 w-full border-b-gray-200 border`}
      >
        {!(isSearchPage && isMobile) && (
          <div
            className={`w-full ${
              isMobile ? "" : "max-w-screen-7xl mx-auto"
            } flex items-center justify-between px-2 lg:px-6`}
          >
            {/* Logo - Left, with controllable padding */}
            <div
              className={`h-full p-2 box-border flex items-center ${
                isMobile ? "" : ""
              }`}
              style={{ paddingLeft: isMobile ? "0.5rem" : "2rem" }}
            >
              <Link to="/" className="h-full flex items-center gap-2">
                <div className="p-1 box-border">
                  <img
                    src={logoImage}
                    alt="GoDrop Logo"
                    className={isMobile ? "w-16" : "w-20 lg:w-36"}
                  />
                </div>
              </Link>
            </div>
            {/* Search - Desktop - Center */}
            {!isMobile && (
              <div className="hidden lg:block flex-1 max-w-2xl mx-auto">
                <Search />
              </div>
            )}
            {/* User and Cart - Right Side */}
            <div
              className={`flex items-center ${
                isMobile ? "gap-2" : "gap-4 lg:gap-6"
              }`}
            >
              {/* Print Button */}
              <Link
                to="/print-order"
                title="Print Documents"
                className="flex items-center gap-1.5 text-grey-900 hover:text-primary-600 transition-colors"
              >
                <MdPrint size={isMobile ? 24 : 22} />
                {!isMobile && <span>Print</span>}
              </Link>

              {/* User Section - Desktop */}
              {!isMobile && (
                <div className="relative">
                  {isAuthenticated ? (
                    <div
                      onClick={() => setOpenUserMenu(!openUserMenu)}
                      className="flex select-none items-center gap-1 cursor-pointer text-grey-900 hover:text-primary-600 transition-colors"
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
                      className="text-base px-2 text-grey-900 hover:text-primary-600 transition-colors"
                    >
                      Login
                    </button>
                  )}
                  {/* User Menu Dropdown */}
                  {openUserMenu && isAuthenticated && (
                    <div className="absolute right-0 top-12 z-50">
                      <div className="bg-grey-50 rounded p-4 min-w-52 lg:shadow-lg border border-grey-200">
                        <UserMenu close={handleCloseUserMenu} />
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* User Icon - Mobile */}
              {isMobile && (
                <button
                  onClick={handleMobileUser}
                  className="text-grey-900 hover:text-primary-600 transition-colors"
                >
                  <FaRegCircleUser size={22} />
                </button>
              )}
              {/* Cart Button - Desktop - Rectangular Container */}
              {!isMobile && (
                <div className="w-40 h-8 flex items-center justify-center">
                  <button
                    onClick={handleOpenCart}
                    className="w-30 h-full text-grey-900 hover:text-primary-600 flex items-center gap-2 bg-primary-50 hover:bg-primary-100 px-3 py-3 rounded-lg transition-all relative hover:shadow-2xs border border-primary-200"
                  >
                    <BsCart4 size={24} className="text-primary-600" />
                    <div className="flex flex-col items-start whitespace-nowrap">
                      <span className="text-lg font text-primary-600">
                        My Cart
                      </span>
                      {totalItems > 0 && (
                        <span className="text-xs text-secondary-600">
                          {totalItems} {totalItems === 1 ? "item" : "items"}
                        </span>
                      )}
                    </div>
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-error text-grey-50 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </div>
              )}
              {/* Cart Button - Mobile (Icon Only) */}
              {isMobile && (
                <button
                  onClick={handleOpenCart}
                  className="text-gray-900 hover:text-primary-600 flex items-center gap-2 bg-primary-50 px-2 py-2 rounded transition-colors relative"
                >
                  <BsCart4 size={22} className="text-primary-600" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-grey-50 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}
              {/* Mobile Menu */}
              {/* Hamburger removed for mobile view */}
              {/* {isMobile && (
                <button className="text-grey-900">
                  <MdMenu size={22} />
                </button>
              )} */}
            </div>
          </div>
        )}
        {/* Search - Mobile (on search page) */}
        {isMobile && (
          <div className="w-full px-2 lg:hidden">
            <Search />
          </div>
        )}
      </header>

      {/* Cart Sidebar */}
      {isCartOpen && <DisplayCartItem close={closeCart} />}

      {/* Login Modal (Desktop) */}
      <LoginModal />
    </>
  );
};

export default Header;
