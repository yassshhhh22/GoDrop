import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as productService from "../../services/product.service";
import CardLoading from "../ui/CardLoading";
import ProductCard from "./ProductCard";

const CategoryWiseProductDisplay = ({ id, name }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadingCardNumber = new Array(6).fill(null);

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);

      const productsResponse = await productService.getProductsByCategory(id, {
        limit: 12,
      });

      const validProducts = (productsResponse.products || []).filter(
        (product) => product && product._id
      );

      setProducts(validProducts);
    } catch (error) {
      console.error(`Failed to fetch products for ${name}:`, error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategoryProducts();
    }
  }, [id]);

  return (
    <div className="my-12 w-full flex flex-col items-center">
      {/* Increased spacing between categories */}
      <div className="w-full max-w-7xl px-8 flex items-center justify-between gap-4 mb-6">
        {/* Softer, cleaner font style with increased size */}
        <h3 className="font-sans font-bold text-3xl text-gray-800 tracking-normal">
          {name}
        </h3>
        <Link
          to={`/category/${id}`}
          className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          See All
        </Link>
      </div>
      {/* Add extra margin here */}
      <div className="h-4" />
      {/* Normal Grid – no slider */}
      <div
        className="w-full max-w-4xl grid grid-cols-2 lg:grid-cols-5 gap-x-2"
        style={{ marginLeft: 70, marginRight: "auto" }}
      >
        {loading &&
          loadingCardNumber.map((_, index) => (
            <CardLoading key={"CategorywiseProductDisplay" + index} />
          ))}
        {!loading &&
          products.length > 0 &&
          products.map((product) => (
            <ProductCard data={product} key={product._id + "CategoryDisplay"} />
          ))}
        {!loading && products.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-secondary-500">
              No products found in this category
            </p>
          </div>
        )}
      </div>
      {/* Add extra space after each category block */}
      <div className="h-12" />
    </div>
  );
};

export default CategoryWiseProductDisplay;
