import express from 'express';
import {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
} from '../controllers/product.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  getAllProductsValidator,
  productIdValidator,
  searchProductsValidator,
  getProductsByCategoryValidator,
  getFeaturedProductsValidator,
} from '../validators/index.js';


const router = express.Router();

router.use(optionalAuth);

router.get('/', validate(getAllProductsValidator),optionalAuth, getAllProducts);
router.get('/search', validate(searchProductsValidator), searchProducts);
router.get(
  '/featured',
  validate(getFeaturedProductsValidator),
  getFeaturedProducts
);
router.get(
  '/category/:categoryId',
  validate(getProductsByCategoryValidator),
  getProductsByCategory
);
router.get('/:id', validate(productIdValidator),optionalAuth, getProductById);

export default router;
