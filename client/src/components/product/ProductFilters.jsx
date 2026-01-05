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
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="font-medium text-grey-900 mb-3">Price Range</h4>
        <div className="space-y-2">
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice || ""}
            onChange={handlePriceChange}
            placeholder="Min Price"
            className="w-full px-3 py-2 border border-grey-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-600 outline-none"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice || ""}
            onChange={handlePriceChange}
            placeholder="Max Price"
            className="w-full px-3 py-2 border border-grey-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-600 outline-none"
          />
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <h4 className="font-medium text-grey-900 mb-3">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={handleStockChange}
            className="w-4 h-4 text-primary-600 border-grey-300 rounded focus:ring-primary-500"
          />
          <span className="text-grey-900">In Stock Only</span>
        </label>
      </div>

      {/* Sort By */}
      <div>
        <h4 className="font-medium text-grey-900 mb-3">Sort By</h4>
        <select
          value={filters.sort || "createdAt"}
          onChange={handleSortChange}
          className="w-full px-3 py-2 border border-grey-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-600 outline-none bg-grey-50"
        >
          <option value="createdAt">Newest First</option>
          <option value="name">Name (A-Z)</option>
          <option value="price">Price (Low to High)</option>
          <option value="-price">Price (High to Low)</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;
