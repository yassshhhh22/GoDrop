import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  getProductsInCategory,
} from '../controllers/category.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  getAllCategoriesValidator,
  categoryIdValidator,
  getProductsInCategoryValidator,
} from '../validators/index.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', validate(getAllCategoriesValidator), getAllCategories);
router.get(
  '/:id/products',
  validate(getProductsInCategoryValidator),
  getProductsInCategory
);
router.get('/:id', validate(categoryIdValidator), getCategoryById);

export default router;
