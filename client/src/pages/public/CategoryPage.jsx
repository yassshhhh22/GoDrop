import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdFilterList } from "react-icons/md";
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
    <section className="bg-grey-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-grey-50 border border-grey-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-grey-900">
                {categoryInfo?.name || "Products"}
              </h1>
              {!loading && (
                <p className="text-secondary-500 text-sm mt-1">
                  {products.length} products available
                </p>
              )}
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-grey-50 border border-grey-200 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <MdFilterList size={20} />
              Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-64 shrink-0`}
          >
            <div className="bg-grey-50 border border-grey-200 rounded-lg p-4 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-4">
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

          {/* Products Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loading size={150} />
              </div>
            ) : products.length === 0 ? (
              <NoData message="No products found in this category" />
            ) : (
              <>
                {/* Products Display */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

export default CategoryPage;
