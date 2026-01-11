import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdFilterList, MdClose } from "react-icons/md";
import useProductStore from "../../stores/productStore";
import ProductCard from "../../components/product/ProductCard";
import ProductFilters from "../../components/product/ProductFilters";
import Loading from "../../components/layout/Loading";
import NoData from "../../components/ui/NoData";
import Pagination from "../../components/navigation/Pagination";

const CategoryPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const categoryId = params.categoryId;

  const [showFilters, setShowFilters] = useState(false);

  const {
    products,
    loading,
    currentPage,
    totalPages,
    filters,
    fetchProductsByCategory,
    setFilters,
    setPage,
    resetFilters,
    getCategoryById,
  } = useProductStore();

  const [categoryInfo, setCategoryInfo] = useState(null);

  useEffect(() => {
    if (categoryId) {
      // Fetch category info
      getCategoryById(categoryId).then((category) => {
        setCategoryInfo(category);
      });

      // Fetch products in this category
      fetchProductsByCategory(categoryId);
    }
  }, [categoryId, currentPage]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-6 max-w-[1440px]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-2 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 ">
              {categoryInfo?.name || "Products"}
            </h1>
            {!loading && (
              <p className="text-gray-400 mt-0.5 text-[11px] font-medium">
                Showing {products.length} results
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-secondary-200 rounded-full text-secondary-700 font-medium shadow-sm hover:bg-secondary-50 hover:border-secondary-300 transition-all w-full md:w-auto active:scale-95"
            >
              <MdFilterList className="text-xl" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex gap-8 relative items-start">
          {/* Mobile Overlay */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Filters Sidebar */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50 w-[280px] lg:w-72 bg-white lg:bg-transparent shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 h-full lg:h-auto
              ${showFilters ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <div className="h-full flex flex-col lg:block bg-white lg:bg-transparent">
              {/* Mobile Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-secondary-100 lg:hidden">
                <h2 className="text-xl font-bold text-secondary-900">
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 -mr-2 text-secondary-500 hover:text-secondary-900 hover:bg-secondary-50 rounded-full transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto lg:overflow-visible p-6 lg:p-0">
                <div className="bg-transparent p-0 lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 pr-4">
                    <h3 className="font-semibold text-gray-700 text-[10px] tracking-wide">
                      Filters
                    </h3>
                    <button
                      onClick={handleResetFilters}
                      className="text-[10px] font-semibold uppercase tracking-wide text-primary-600 hover:text-primary-700 transition-colors px-2 py-1 hover:bg-primary-50 rounded"
                    >
                      Reset
                    </button>
                  </div>

                  <ProductFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 w-full min-w-0 pl-0 lg:pl-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loading size={60} />
                <p className="mt-4 text-secondary-500 font-medium animate-pulse">
                  Loading products...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-secondary-200">
                <NoData message="No products found in this category" />
                <button
                  onClick={handleResetFilters}
                  className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm active:transform active:scale-95"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} data={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center pt-8 border-t border-secondary-200">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
