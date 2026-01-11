import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import banner from "../../assets/banner.jpg";
import bannerMobile from "../../assets/banner-mobile.jpg";
import useProductStore from "../../stores/productStore";
import CategoryWiseProductDisplay from "../../components/product/CategoryWiseProductDisplay";
import Loading from "../../components/layout/Loading";

const HomePage = () => {
  const navigate = useNavigate();

  const { categories, fetchCategories, loading } = useProductStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  if (loading && categories.length === 0) {
    return <Loading size={150} />;
  }

  return (
    <section className="bg-white min-h-screen">
      {/* Banner Section */}
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div
          className={`w-full max-w-7xl h-auto rounded-xl overflow-hidden ${
            !banner && "animate-pulse bg-secondary-100 min-h-48"
          }`}
        >
          <img
            src={banner}
            className="w-full h-auto object-cover hidden lg:block"
            alt="banner"
          />
          <img
            src={bannerMobile}
            className="w-full h-auto object-cover lg:hidden"
            alt="banner"
          />
        </div>
      </div>

      {/* Small Banners Section */}
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 pb-8">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden min-h-[180px] flex items-center justify-center touch-pan-x bg-white border border-secondary-200"
            >
              <img
                src={banner}
                alt={`banner-${i}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4 w-full max-w-7xl">
          {loading ? (
            // Loading Skeleton
            new Array(12).fill(null).map((c, index) => (
              <div
                key={index + "loadingcategory"}
                className="bg-white rounded-lg p-3 aspect-square flex flex-col gap-3 animate-pulse border border-secondary-200"
              >
                <div className="bg-secondary-100 flex-1 rounded-lg"></div>
                <div className="bg-secondary-100 h-3 rounded"></div>
              </div>
            ))
          ) : Array.isArray(categories) && categories.length > 0 ? (
            categories.map((cat) => (
              <div
                key={cat._id}
                className="cursor-pointer group"
                onClick={() => handleCategoryClick(cat._id)}
              >
                <div className="bg-white rounded-lg p-3 h-full flex flex-col border border-secondary-200 hover:border-secondary-300 transition-all duration-200">
                  <div className="aspect-square mb-2 flex items-center justify-center overflow-hidden rounded-lg bg-secondary-50">
                    <img
                      src={cat.images?.[0] || "/placeholder.png"}
                      alt={cat.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <p className="text-center text-xs sm:text-sm font-semibold text-secondary-900 line-clamp-2 mt-1">
                    {cat.name}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-secondary-600 text-base">
                No categories available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category-wise Product Display */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-10 space-y-12">
        {Array.isArray(categories) &&
          categories.length > 0 &&
          categories.map((c) => (
            <CategoryWiseProductDisplay
              key={c._id + "CategorywiseProduct"}
              id={c._id}
              name={c.name}
            />
          ))}
      </div>
    </section>
  );
};

export default HomePage;
