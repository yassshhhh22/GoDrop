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
      <div className="w-full flex justify-center px-8 pt-8 pb-4">
        <div
          className={`w-full max-w-7xl h-auto rounded-3xl overflow-hidden ${
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
      <div className="w-full flex justify-center px-8 pb-8">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden min-h-[180px] flex items-center justify-center touch-pan-x bg-white"
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
      <div className="w-full flex justify-center px-8 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-5 md:gap-6 justify-center w-full max-w-7xl">
          {loading ? (
            // Loading Skeleton
            new Array(12).fill(null).map((c, index) => (
              <div
                key={index + "loadingcategory"}
                className="bg-grey-50 rounded-lg p-4 aspect-square flex flex-col gap-3 animate-pulse border border-secondary-100"
              >
                <div className="bg-secondary-100 flex-1 rounded"></div>
                <div className="bg-secondary-100 h-4 rounded"></div>
              </div>
            ))
          ) : Array.isArray(categories) && categories.length > 0 ? (
            categories.map((cat) => (
              <div
                key={cat._id}
                className="cursor-pointer"
                onClick={() => handleCategoryClick(cat._id)}
              >
                <div className="bg-grey-50 rounded-lg p-4 h-full flex flex-col">
                  <div className="aspect-square mb-3 flex items-center justify-center">
                    <img
                      src={cat.images?.[0] || "/placeholder.png"}
                      alt={cat.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <p className="text-center text-xs md:text-sm font-medium text-secondary-900 line-clamp-2 mt-2">
                    {cat.name}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-secondary-500 text-base">
                No categories available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category-wise Product Display */}
      <div className="w-full px-8 pb-10 ">
        {" "}
        {/* Added space-y-12 for spacing */}
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
