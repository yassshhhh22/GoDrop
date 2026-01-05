import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  addItemToCartValidator,
  updateCartItemValidator,
  removeCartItemValidator,
} from '../validators/cart.validator.js';

const router = express.Router();

// ✅ CHANGE: Add 'BusinessUser' to all cart routes
router.get('/', authenticate, authorize('Customer', 'BusinessUser'), getCart);

router.post(
  '/add',
  authenticate,
  authorize('Customer', 'BusinessUser'), // ✅ Add BusinessUser
  validate(addItemToCartValidator),
  addToCart
);

router.put(
  '/update/:itemId',
  authenticate,
  authorize('Customer', 'BusinessUser'), // ✅ Add BusinessUser
  validate(updateCartItemValidator),
  updateCartItem
);

router.delete(
  '/remove/:itemId',
  authenticate,
  authorize('Customer', 'BusinessUser'), // ✅ Add BusinessUser
  validate(removeCartItemValidator),
  removeCartItem
);

router.delete(
  '/clear',
  authenticate,
  authorize('Customer', 'BusinessUser'), // ✅ Add BusinessUser
  clearCart
);

export default router;
