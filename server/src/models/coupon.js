import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Coupon description
    description: {
      type: String,
      required: true,
    },

    // Discount type
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },

    // Discount value
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    // Maximum discount (for percentage type)
    maxDiscount: {
      type: Number,
      default: null,
    },

    // Minimum order amount required
    minOrderAmount: {
      type: Number,
      default: 0,
    },

    // Valid from date
    validFrom: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Valid until date
    validUntil: {
      type: Date,
      required: true,
      index: true,
    },

    // Usage limits
    usageLimit: {
      type: Number,
      default: null,
    },

    // Current usage count
    usedCount: {
      type: Number,
      default: 0,
    },

    // Per-user usage limit
    perUserLimit: {
      type: Number,
      default: 1,
    },

    // Users who have used this coupon
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        orderId: {
          type: String,
        },
      },
    ],

    // Applicable to
    applicableTo: {
      categories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
      products: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
      // Empty arrays mean applicable to all
    },

    // First order only
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },

    // Active status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Created by admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

// Virtual to check if coupon is expired
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.validUntil;
});

// Virtual to check if usage limit reached
couponSchema.virtual('isUsageLimitReached').get(function () {
  if (this.usageLimit === null) return false;
  return this.usedCount >= this.usageLimit;
});

// Method to check if user can use this coupon
couponSchema.methods.canUserUseCoupon = function (userId) {
  const userUsageCount = this.usedBy.filter(
    (usage) => usage.user && usage.user.toString() === userId.toString()
  ).length;

  return userUsageCount < this.perUserLimit;
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  if (orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount should be ₹${this.minOrderAmount}`,
      discount: 0,
    };
  }

  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    // Fixed discount
    discount = this.discountValue;
  }

  // Don't let discount exceed order amount
  discount = Math.min(discount, orderAmount);

  return {
    valid: true,
    discount: Math.round(discount),
    finalAmount: orderAmount - discount,
  };
};

// Ensure virtuals are included in JSON
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
