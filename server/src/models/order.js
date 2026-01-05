import mongoose from 'mongoose';
import Counter from './counter.js';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    orderType: {
      type: String,
      enum: ['normal', 'print'],
      default: 'normal',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'customerType',
      required: true,
      index: true,
    },
    customerType: {
      type: String,
      enum: ['Customer', 'BusinessUser'],
      required: true,
      default: 'Customer',
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPartner',

      index: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      index: true,
    },
    items: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        count: { type: Number },
      },
    ],
    printDetails: {
      files: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
          filename: { type: String, required: true },
          pageCount: { type: Number, required: true },
          fileType: {
            type: String,
            enum: ['pdf', 'image'],
            required: true,
          },
        },
      ],
      description: { type: String },
      colorType: {
        type: String,
        enum: ['bw', 'color'],
      },
      pageSize: {
        type: String,
        enum: ['A4'],
        default: 'A4',
      },
      printSides: {
        type: String,
        enum: ['single-sided', 'double-sided'],
        default: 'single-sided',
      },
      bindingType: {
        type: String,
        enum: ['none', 'stapled', 'spiral'],
        default: 'none',
      },
      totalPages: { type: Number },
      printCost: { type: Number },
    },
    giftWrap: {
      enabled: { type: Boolean, default: false },
      charge: { type: Number, default: 0 },
      message: { type: String },
    },

    deliveryAddress: {
      label: { type: String },
      address: { type: String, required: true },
      landmark: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },

    deliveryPersonLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      lastUpdated: { type: Date },
    },

    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'picked',
        'arriving',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            'pending',
            'confirmed',
            'picked',
            'arriving',
            'delivered',
            'cancelled',
            'refunded',
          ],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'statusHistory.updatedByModel',
        },
        updatedByModel: {
          type: String,
          enum: ['Customer', 'Admin', 'DeliveryPartner', 'BusinessUser'], // ✅ ADD: 'BusinessUser'
        },
      },
    ],
    payment: {
      method: {
        type: String,
        enum: ['razorpay', 'cod'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'refunded'],
        default: 'pending',
      },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      paidAt: { type: Date },
    },
    itemsTotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    deliveryFee: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    invoiceUrl: { type: String },
    cancellationReason: { type: String },
    cancelledBy: {
      type: String,
      enum: ['Customer', 'DeliveryPartner', 'Admin'],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    assignedAt: { type: Date },
  },
  { timestamps: true }
);

async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.sequence_value;
}

orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const sequenceValue = await getNextSequenceValue('orderId');
    this.orderId = `ORDR${sequenceValue.toString().padStart(5, '0')}`;

    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ deliveryPartner: 1, status: 1 });
orderSchema.index({ orderType: 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
