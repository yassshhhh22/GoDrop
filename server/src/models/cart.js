import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'customerType',
      required: true,
      unique: true, // One cart per customer
    },
    customerType: {
      type: String,
      enum: ['Customer', 'BusinessUser'],
      required: true,
      default: 'Customer',
    },
    items: [
      {
        item: {
          // Changed from 'product' to 'item'
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        count: {
          type: Number,
          required: true,
          min: 1,
        },
        // REMOVED: priceAtAdd - we'll fetch price from Product dynamically
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // ✅ ADD: These fields to persist coupon data
    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual for total items
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.count, 0);
});

// UPDATED: Calculate price dynamically from populated product
cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((total, cartItem) => {
    const product = cartItem.item;
    if (!product) return total;
    const price =
      product.discountPrice || product.businessPrice || product.price;
    return total + price * cartItem.count;
  }, 0);
});

// Ensure virtuals are included in JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
