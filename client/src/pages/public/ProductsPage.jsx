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
    <section className="bg-grey-50 min-h-screen">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-grey-900">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : categoryId
                ? "Products"
                : "All Products"}
            </h1>
            {!loading && (
              <p className="text-secondary-500 text-sm mt-1">
                {products.length} products found
              </p>
            )}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-grey-50 border border-grey-200 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <MdFilterList size={20} />
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-grey-50 border border-grey-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary-600 text-grey-50"
                    : "text-secondary-500 hover:bg-secondary-50"
                }`}
              >
                <MdGridView size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-primary-600 text-grey-50"
                    : "text-secondary-500 hover:bg-secondary-50"
                }`}
              >
                <MdViewList size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[250px_1fr] gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block bg-grey-50 border border-grey-200 rounded-lg p-6 h-fit sticky top-4`}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-grey-900">Filters</h3>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Reset
                </button>
              </div>

              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
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
                      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      : "flex flex-col gap-4"
                  }
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      data={product} // ✅ Changed from 'product' to 'data' to match ProductCard props
                    />
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
