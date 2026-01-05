import asyncHandler from 'express-async-handler';
import { Product, Category } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';
import { formatProductForCustomer } from '../utils/businessHelpers.js';

export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    minPrice,
    maxPrice,
    inStock,
    sort = '-createdAt',
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (inStock !== undefined) {
    query.inStock = inStock === 'true';
  }

  if (minPrice || maxPrice) {
    const priceField =
      req.customerType === 'BusinessUser' ? 'businessPrice' : 'price';
    query[priceField] = {};
    if (minPrice) query[priceField].$gte = Number(minPrice);
    if (maxPrice) query[priceField].$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(query),
  ]);

  const formattedProducts = products.map((product) =>
    formatProductForCustomer(product, req.customerType)
  );

  res.json(
    new ApiResponse(
      200,
      {
        products: formattedProducts,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalProducts: total,
          limit: Number(limit),
        },
      },
      'Products retrieved successfully'
    )
  );
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id)
    .populate('category', 'name')
    .lean();

  if (!product) {
    throw new ApiError(404, MESSAGES.PRODUCT_NOT_FOUND);
  }

  const formattedProduct = formatProductForCustomer(product, req.customerType);

  res.json(
    new ApiResponse(
      200,
      { product: formattedProduct },
      'Product retrieved successfully'
    )
  );
});

export const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.trim() === '') {
    throw new ApiError(400, 'Search query is required');
  }

  const skip = (page - 1) * limit;

  // Text search using MongoDB text index
  const products = await Product.find({
    $text: { $search: q },
  })
    .populate('category', 'name image')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments({
    $text: { $search: q },
  });

  

  res.json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
        query: q,
      },
      'Search results retrieved successfully'
    )
  );
});

export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const skip = (page - 1) * limit;

  const sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const products = await Product.find({ category: categoryId })
    .populate('category', 'name image')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Product.countDocuments({ category: categoryId });

  const formattedProducts = products.map((product) =>
    formatProductForCustomer(product, req.customerType)
  );



  res.json(
    new ApiResponse(
      200,
      {
        products: formattedProducts, 
        category: {
          _id: category._id,
          name: category.name,
          image: category.image,
        },
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

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // Featured products criteria: high rating, in stock, and sorted by rating
  const products = await Product.find({
    inStock: true,
    rating: { $gte: 4 },
  })
    .populate('category', 'name image')
    .sort({ rating: -1, createdAt: -1 })
    .limit(parseInt(limit));

  

  res.json(
    new ApiResponse(
      200,
      {
        products,
        count: products.length,
      },
      'Featured products retrieved successfully'
    )
  );
});
