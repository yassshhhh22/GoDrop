import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdFilterList, MdGridView, MdViewList } from "react-icons/md";
import useProductStore from "../../stores/productStore";
import ProductCard from "../../components/product/ProductCard"; // ✅ Changed from ProductCard to ProductCard
import ProductFilters from "../../components/product/ProductFilters";
import Loading from "../../components/layout/Loading";
import NoData from "../../components/ui/NoData";
import Pagination from "../../components/navigation/Pagination";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  const {
    products,
    loading,
    currentPage,
    totalPages,
    filters,
    fetchProducts,
    setFilters,
    setPage,
    resetFilters,
  } = useProductStore();

  // Get query params
  const categoryId = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    // Fetch products on mount or when filters change
    const params = {};

    if (categoryId) {
      params.category = categoryId;
    }

    if (searchQuery) {
      params.search = searchQuery;
    }

    fetchProducts(params);
  }, [categoryId, searchQuery]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const handlePageChange = (page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="bg-white min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : categoryId
                  ? "Products"
                  : "All Products"}
              </h1>
              {!loading && (
                <p className="text-gray-600 text-sm mt-1">
                  {products.length} products found
                </p>
              )}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MdFilterList size={18} />
                <span className="text-sm font-semibold text-gray-900">
                  Filters
                </span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <MdGridView size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <MdViewList size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex relative gap-6">
          {/* Mobile Overlay */}
          {showFilters && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowFilters(false)}
            />
          )}
          {/* Filters Sidebar */}
          <aside
            className={`
              fixed lg:sticky top-0 left-0 h-screen lg:h-auto z-50 lg:z-10
              w-80 lg:w-72 bg-white overflow-y-auto
              border-r border-gray-100 lg:border
              transition-transform duration-300 ease-in-out
              ${
                showFilters
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }
            `}
            style={{ top: "72px" }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MdFilterList className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-6 hidden lg:flex">
                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Reset
                </button>
              </div>

              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />

              <button
                onClick={handleResetFilters}
                className="w-full mt-6 px-4 py-2 bg-white text-primary-600 font-semibold text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 lg:hidden"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Products Grid/List */}
          <main className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loading size={150} />
              </div>
            ) : products.length === 0 ? (
              <NoData message="No products found" />
            ) : (
              <>
                {/* Products Display */}
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0"
                      : "flex flex-col gap-4"
                  }
                >
                  {products.map((product) => (
                    <ProductCard key={product._id} data={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default ProductsPage;
