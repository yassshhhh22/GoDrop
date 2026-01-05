import asyncHandler from 'express-async-handler';
import { Category, Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';


export const getAllCategories = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const query = {};

  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const categories = await Category.find(query).sort({ priority: -1, name: 1 });

  // Count products in each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        category: category._id,
        inStock: true,
      });

      return {
        ...category.toObject(),
        productCount,
      };
    })
  );

 

  res.json(
    new ApiResponse(
      200,
      {
        categories: categoriesWithCount,
        count: categoriesWithCount.length,
      },
      'Categories retrieved successfully'
    )
  );
});


export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Get product count in this category
  const productCount = await Product.countDocuments({
    category: category._id,
    inStock: true,
  });

  const categoryWithCount = {
    ...category.toObject(),
    productCount,
  };

  res.json(
    new ApiResponse(
      200,
      categoryWithCount,
      'Category retrieved successfully'
    )
  );
});


export const getProductsInCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Verify category exists
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const skip = (page - 1) * limit;

  // Build sort object
  const sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const products = await Product.find({
    category: id,
    inStock: true,
  })
    .populate('category', 'name image')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments({
    category: id,
    inStock: true,
  });



  res.json(
    new ApiResponse(
      200,
      {
        category: {
          _id: category._id,
          name: category.name,
          image: category.image,
        },
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Products retrieved successfully'
    )
  );
});