import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { MdSearch } from "react-icons/md";
import useProductStore from "../../stores/productStore";
import ProductCard from "../../components/product/ProductCard";
import Loading from "../../components/layout/Loading";
import NoData from "../../components/ui/NoData";
import noDataImage from "../../assets/nothing here yet.webp";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("q") || "";
  const [searchError, setSearchError] = useState("");

  const {
    searchResults,
    searchProducts,
    loading,
    currentPage,
    totalPages,
    setPage,
    clearSearch,
  } = useProductStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
    if (searchQuery && searchQuery.trim().length >= 2) {
      setSearchError("");
      searchProducts(searchQuery);
    } else {
      clearSearch();
      if (searchQuery && searchQuery.trim().length > 0) {
        setSearchError("Search query must be at least 2 characters long.");
      } else {
        setSearchError("");
      }
    }

    return () => {
      clearSearch();
    };
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = localSearchQuery.trim();
    if (trimmedQuery.length >= 2) {
      setSearchError("");
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else if (trimmedQuery.length > 0) {
      setSearchError("Search query must be at least 2 characters long.");
    } else {
      setSearchError("");
      navigate("/search");
    }
  };

  const handleFetchMore = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
      searchProducts(searchQuery, { page: currentPage + 1 });
    }
  };

  const loadingArrayCard = new Array(10).fill(null);

  return (
    <section className="bg-grey-50 min-h-screen">
      <div className="container mx-auto p-4">
        {/* Search Results Header */}
        {searchQuery && !searchError && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-grey-900 mb-2">
              Search Results for "{searchQuery}"
            </h1>
            <p className="text-secondary-500">
              {searchResults.length} product
              {searchResults.length !== 1 ? "s" : ""} found
            </p>
          </div>
        )}

        {/* Infinite Scroll Results */}
        <InfiniteScroll
          dataLength={searchResults.length}
          next={handleFetchMore}
          hasMore={currentPage < totalPages}
          loader={
            <div className="flex justify-center py-6">
              <Loading size={50} />
            </div>
          }
          endMessage={
            searchResults.length > 0 && (
              <p className="text-center text-secondary-500 py-6">
                No more products to load
              </p>
            )
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Search Results */}
            {searchResults.map((product, index) => (
              <ProductCard
                key={product._id + "searchProduct" + index}
                data={product}
              />
            ))}

            {/* Loading Skeleton */}
            {loading &&
              loadingArrayCard.map((_, index) => (
                <div
                  key={"loadingsearchpage" + index}
                  className="bg-grey-50 border border-grey-200 rounded-lg p-3 animate-pulse"
                >
                  <div className="bg-secondary-100 h-40 rounded mb-3"></div>
                  <div className="bg-secondary-100 h-4 rounded mb-2"></div>
                  <div className="bg-secondary-100 h-4 rounded w-2/3 mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="bg-secondary-100 h-6 rounded w-20"></div>
                    <div className="bg-secondary-100 h-8 w-8 rounded"></div>
                  </div>
                </div>
              ))}
          </div>
        </InfiniteScroll>

        {/* No Results Found */}
        {!searchResults.length && !loading && searchQuery && (
          <div className="flex flex-col justify-center items-center w-full mx-auto py-12">
            <img
              src={noDataImage}
              alt="No results found"
              className="w-full h-full max-w-xs max-h-xs block mb-6"
            />
            <h2 className="text-xl font-semibold text-grey-900 mb-2">
              No products found
            </h2>
            <p className="text-secondary-500 text-center mb-6">
              We couldn't find any products matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setLocalSearchQuery("");
                navigate("/");
              }}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-grey-50 rounded-lg font-medium transition-colors"
            >
              Browse All Products
            </button>
          </div>
        )}

        {/* Empty Search State */}
        {!searchQuery && (
          <div className="flex flex-col justify-center items-center w-full mx-auto py-12 h-[60vh]">
            <MdSearch size={80} className="text-secondary-300 mb-4" />
            <h2 className="text-xl font-semibold text-grey-900 mb-2 text-center">
              Start Searching
            </h2>
            <p className="text-secondary-500 text-center">
              Enter a product name to search
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchPage;
