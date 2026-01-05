import asyncHandler from 'express-async-handler';
import { Cart, Product } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';
import { validateMOQ, getProductPrice } from '../utils/businessHelpers.js';

const MESSAGES = {
  CART_EMPTY: 'Your cart is empty',
  PRODUCT_NOT_FOUND: 'Product not found',
  OUT_OF_STOCK: 'Product is out of stock',
  ITEM_ADDED: 'Item added to cart successfully',
  ITEM_UPDATED: 'Cart item updated successfully',
  ITEM_REMOVED: 'Item removed from cart',
  CART_CLEARED: 'Cart cleared successfully',
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.userId })
    .populate({
      path: 'items.item',
      select: 'name price businessPrice discountPrice images inStock stock',
    })
    .populate({
      path: 'appliedCoupon', // ✅ ADD: Populate coupon details
      select: 'code description discountType discountValue maxDiscount',
    });

  if (!cart) {
    // Create empty cart if doesn't exist
    const customerType =
      req.userRole === 'BusinessUser' ? 'BusinessUser' : 'Customer';
    const newCart = await Cart.create({ customer: req.userId, customerType });
    return res.json(
      new ApiResponse(
        200,
        {
          _id: newCart._id,
          items: [],
          subtotal: 0,
          totalItems: 0,
          appliedCoupon: null,
          couponDiscount: 0,
        },
        'Cart retrieved successfully'
      )
    );
  }

  const subtotal = cart.items.reduce((total, item) => {
    const product = item.item;
    if (!product) return total;
    const price =
      product.discountPrice || product.businessPrice || product.price;
    return total + price * item.count;
  }, 0);

  const totalItems = cart.items.reduce((total, item) => total + item.count, 0);

  res.json(
    new ApiResponse(
      200,
      {
        _id: cart._id,
        items: cart.items,
        subtotal,
        totalItems,
        appliedCoupon: cart.appliedCoupon || null,
        couponDiscount: cart.couponDiscount || 0,
      },
      'Cart retrieved successfully'
    )
  );
});

export const addToCart = asyncHandler(async (req, res) => {
  const { item, count = 1 } = req.body;

  const product = await Product.findById(item);

  if (!product) {
    throw new ApiError(404, MESSAGES.PRODUCT_NOT_FOUND);
  }

  if (!product.inStock) {
    throw new ApiError(400, MESSAGES.OUT_OF_STOCK);
  }

  if (product.stock < count) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  const moqValidation = validateMOQ(count, product, req.customerType);
  if (!moqValidation.valid) {
    throw new ApiError(400, moqValidation.message);
  }

  let cart = await Cart.findOne({ customer: req.userId });

  if (!cart) {
    const customerType =
      req.userRole === 'BusinessUser' ? 'BusinessUser' : 'Customer';
    cart = await Cart.create({
      customer: req.userId,
      customerType,
      items: [{ item, count }],
    });
  } else {
    const existingItemIndex = cart.items.findIndex(
      (cartItem) => cartItem.item.toString() === item
    );

    if (existingItemIndex > -1) {
      const newCount = cart.items[existingItemIndex].count + count;

      const moqValidation = validateMOQ(newCount, product, req.customerType);
      if (!moqValidation.valid) {
        throw new ApiError(400, moqValidation.message);
      }

      if (product.stock < newCount) {
        throw new ApiError(
          400,
          `Only ${product.stock} items available in stock`
        );
      }

      cart.items[existingItemIndex].count = newCount;
    } else {
      cart.items.push({ item, count });
    }

    await cart.save();
  }

  await cart.populate([
    {
      path: 'items.item',
      select: 'name price businessPrice discountPrice images moq inStock stock',
    },
    {
      path: 'appliedCoupon',
      select: 'code description discountType discountValue maxDiscount',
    },
  ]);

  const subtotal = cart.items.reduce((total, cartItem) => {
    const product = cartItem.item;
    if (!product) return total;
    const price =
      product.discountPrice || product.businessPrice || product.price;
    return total + price * cartItem.count;
  }, 0);

  const totalItems = cart.items.reduce((total, item) => total + item.count, 0);

  res.json(
    new ApiResponse(
      200,
      {
        _id: cart._id,
        items: cart.items,
        subtotal,
        totalItems,
        appliedCoupon: cart.appliedCoupon || null,
        couponDiscount: cart.couponDiscount || 0,
      },
      'Item added to cart successfully'
    )
  );
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { count } = req.body;

  const cart = await Cart.findOne({ customer: req.userId });

  if (!cart) {
    throw new ApiError(404, MESSAGES.CART_EMPTY);
  }

  const itemIndex = cart.items.findIndex(
    (cartItem) => cartItem.item.toString() === itemId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  const product = await Product.findById(itemId);

  if (!product) {
    throw new ApiError(404, MESSAGES.PRODUCT_NOT_FOUND);
  }

  const moqValidation = validateMOQ(count, product, req.customerType);
  if (!moqValidation.valid) {
    throw new ApiError(400, moqValidation.message);
  }

  if (product.stock < count) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  cart.items[itemIndex].count = count;
  await cart.save();

  await cart.populate([
    {
      path: 'items.item',
      select: 'name price businessPrice discountPrice images moq',
    },
    {
      path: 'appliedCoupon', // ✅ ADD: Populate coupon
      select: 'code description discountType discountValue maxDiscount',
    },
  ]);

  const subtotal = cart.items.reduce((total, cartItem) => {
    const product = cartItem.item;
    if (!product) return total;
    const price =
      product.discountPrice || product.businessPrice || product.price;
    return total + price * cartItem.count;
  }, 0);

  const totalItems = cart.items.reduce((total, item) => total + item.count, 0);

  res.json(
    new ApiResponse(
      200,
      {
        _id: cart._id,
        items: cart.items,
        subtotal,
        totalItems,
        appliedCoupon: cart.appliedCoupon || null,
        couponDiscount: cart.couponDiscount || 0,
      },
      'Cart item updated successfully'
    )
  );
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ customer: req.userId });

  if (!cart) {
    throw new ApiError(404, MESSAGES.CART_EMPTY);
  }

  const itemIndex = cart.items.findIndex(
    (cartItem) => cartItem.item.toString() === itemId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  await cart.populate([
    {
      path: 'items.item',
      select: 'name price businessPrice discountPrice images moq',
    },
    {
      path: 'appliedCoupon',
      select: 'code description discountType discountValue maxDiscount',
    },
  ]);

  const subtotal = cart.items.reduce((total, cartItem) => {
    const product = cartItem.item;
    if (!product) return total;
    const price =
      product.discountPrice || product.businessPrice || product.price;
    return total + price * cartItem.count;
  }, 0);

  const totalItems = cart.items.reduce((total, item) => total + item.count, 0);

  res.json(
    new ApiResponse(
      200,
      {
        _id: cart._id,
        items: cart.items,
        subtotal,
        totalItems,
        appliedCoupon: cart.appliedCoupon || null,
        couponDiscount: cart.couponDiscount || 0,
      },
      'Item removed from cart successfully'
    )
  );
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.userId });

  if (!cart) {
    throw new ApiError(404, MESSAGES.CART_EMPTY);
  }

  cart.items = [];
  cart.appliedCoupon = null;
  cart.couponDiscount = 0;
  await cart.save();

  res.json(
    new ApiResponse(
      200,
      {
        _id: cart._id,
        items: [],
        subtotal: 0,
        totalItems: 0,
        appliedCoupon: null,
        couponDiscount: 0,
      },
      'Cart cleared successfully'
    )
  );
});

/**
 * Format cart with correct pricing based on customer type
 */
const formatCartForCustomer = (cart, customerType) => {
  if (!cart) return null;

  const cartObj = cart.toObject ? cart.toObject() : cart;

  const formattedItems = cartObj.items.map((cartItem) => {
    const product = cartItem.item;
    const appliedPrice = getProductPrice(product, customerType);

    return {
      _id: cartItem._id,
      item: {
        _id: product._id,
        name: product.name,
        images: product.images,
        appliedPrice, // Price used for this customer
        inStock: product.inStock,
        stock: product.stock,
        // Hide irrelevant pricing
        ...(customerType === 'BusinessUser'
          ? {
              businessPrice: product.businessPrice,
              moq: product.moq,
            }
          : {
              price: product.price,
              discountPrice: product.discountPrice,
            }),
      },
      count: cartItem.count,
      subtotal: appliedPrice * cartItem.count,
      addedAt: cartItem.addedAt,
    };
  });

  const subtotal = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = formattedItems.reduce((sum, item) => sum + item.count, 0);

  return {
    _id: cartObj._id,
    customer: cartObj.customer,
    items: formattedItems,
    subtotal,
    totalItems,
    createdAt: cartObj.createdAt,
    updatedAt: cartObj.updatedAt,
  };
};
