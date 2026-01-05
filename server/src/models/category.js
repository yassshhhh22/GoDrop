import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    images: {
      type: [String],
      required: [true, 'At least one category image is required'],
      validate: {
        validator: function (arr) {
          return arr.length > 0 && arr.length <= 3;
        },
        message: 'Category must have between 1 and 3 images',
      },
    },
    imagePublicIds: {
      type: [String],
      default: [],
    },
    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ priority: -1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
