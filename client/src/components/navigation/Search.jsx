import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import useProductStore from "../../stores/productStore";
import useUIStore from "../../stores/uiStore";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchPage, setIsSearchPage] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { searchProducts, clearSearch } = useProductStore();
  const { isMobile } = useUIStore();

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const queryFromURL = searchParams.get("q") || "";

  useEffect(() => {
    const isSearch = location.pathname === "/search";
    setIsSearchPage(isSearch);

    // Set initial search value from URL
    if (isSearch && queryFromURL) {
      setSearchValue(queryFromURL);
    }
  }, [location, queryFromURL]);

  useEffect(() => {
    // Clear search results when leaving search page
    return () => {
      if (!location.pathname.includes("/search")) {
        clearSearch();
      }
    };
  }, [location.pathname, clearSearch]);

  const redirectToSearchPage = () => {
    navigate("/search");
  };

  const handleOnChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Update URL and trigger search
    const url = `/search?q=${encodeURIComponent(value)}`;
    navigate(url, { replace: true });

    // Debounce search API call
    if (value.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        searchProducts(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (value.trim().length === 0) {
      clearSearch();
    }
  };

  return (
    <div className="w-full min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-lg border border-grey-200 overflow-hidden flex items-center text-secondary-500 bg-secondary-50 group focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
      <div>
        {isMobile && isSearchPage ? (
          <Link
            to={"/"}
            className="flex justify-center items-center h-full p-2 m-1 text-grey-900 group-focus-within:text-primary-600 bg-grey-50 rounded-full shadow-md hover:bg-grey-100 transition-colors"
          >
            <FaArrowLeft size={20} />
          </Link>
        ) : (
          <button
            className="flex justify-center items-center h-full p-3 text-secondary-500 group-focus-within:text-primary-600 transition-colors"
            aria-label="Search"
          >
            <IoSearch size={22} />
          </button>
        )}
      </div>

      <div className="w-full h-full">
        {!isSearchPage ? (
          // Not in search page - Show animated placeholder
          <div
            onClick={redirectToSearchPage}
            className="w-full h-full flex items-center cursor-pointer text-secondary-500"
          >
            <TypeAnimation
              sequence={[
                'Search "milk"',
                1000,
                'Search "bread"',
                1000,
                'Search "sugar"',
                1000,
                'Search "paneer"',
                1000,
                'Search "chocolate"',
                1000,
                'Search "curd"',
                1000,
                'Search "rice"',
                1000,
                'Search "eggs"',
                1000,
                'Search "chips"',
                1000,
                'Search "atta"',
                1000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              style={{ fontSize: "14px" }}
            />
          </div>
        ) : (
          // When on search page - Show input
          <div className="w-full h-full">
            <input
              type="text"
              placeholder="Search for groceries, vegetables, fruits..."
              autoFocus
              value={searchValue}
              className="bg-transparent w-full h-full outline-none text-grey-900 placeholder:text-secondary-400 px-2"
              onChange={handleOnChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
