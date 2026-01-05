import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: {
        validator: function (arr) {
          return arr.length > 0 && arr.length <= 5;
        },
        message: 'Product must have between 1 and 5 images',
      },
    },

    imagePublicIds: {
      type: [String],
      default: [],
    },

    price: { type: Number, required: true },
    discountPrice: {
      type: Number,
      min: 0,
    },

    // ✅ NEW: Business pricing
    businessPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    // ✅ NEW: Minimum Order Quantity (for business users)
    moq: {
      type: Number,
      min: 1,
      default: 1,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      enum: ['kg', 'g', 'L', 'ml', 'piece'],
      default: 'piece',
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', tags: 'text', description: 'text' });

// Index for category filtering
productSchema.index({ category: 1, inStock: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
