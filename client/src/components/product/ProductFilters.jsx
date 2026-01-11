import React from "react";

const ProductFilters = ({ filters, onFilterChange }) => {
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value ? Number(value) : null,
    });
  };

  const handleStockChange = (e) => {
    onFilterChange({
      ...filters,
      inStock: e.target.checked ? true : null,
    });
  };

  const handleSortChange = (e) => {
    onFilterChange({
      ...filters,
      sort: e.target.value,
    });
  };

  return (
    <div className="space-y-3 pr-2 pl-1">
      {/* Price Range */}
      <div className="pb-2 border-b border-gray-100">
        <h4 className="font-semibold text-gray-600 mb-1.5 text-[10px]">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice || ""}
            onChange={handlePriceChange}
            placeholder="Min"
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          />
          <span className="text-gray-400 text-xs">-</span>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice || ""}
            onChange={handlePriceChange}
            placeholder="Max"
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="pb-2 border-b border-gray-100">
        <h4 className="font-semibold text-gray-600 mb-1.5 text-[10px]">
          Availability
        </h4>
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={handleStockChange}
              className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-primary-600 checked:bg-primary-600 hover:border-primary-500"
            />
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
              width="8"
              height="8"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[11px] text-gray-600 group-hover:text-gray-900 transition-colors">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Sort By */}
      <div>
        <h4 className="font-semibold text-gray-600 mb-1.5 text-[10px]">
          Sort By
        </h4>
        <div className="relative">
          <select
            name="sort"
            value={filters.sort || ""}
            onChange={handleSortChange}
            className="w-full appearance-none px-2 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer transition-all"
          >
            <option value="">Default Sorting</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="name_desc">Name: Z-A</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
