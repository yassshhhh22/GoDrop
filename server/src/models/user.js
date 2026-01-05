import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Base User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    role: {
      type: String,
      enum: ['Customer', 'Admin', 'DeliveryPartner'],
      required: true,
    },
    isActivated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
  {
    ...userSchema.obj,
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    role: { type: String, enum: ['Customer'], default: 'Customer' },

    // Addresses - Text only, no coordinates
    addresses: [
      {
        label: {
          type: String,
          enum: ['Home', 'Work', 'Other'],
          required: true,
        },
        address: {
          type: String,
          required: true,
          minlength: 10,
          maxlength: 200,
        },
        landmark: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],

    email: { type: String },
    lastOrderDate: { type: Date },
  },
  { timestamps: true }
);

const deliveryPartnerSchema = new mongoose.Schema(
  {
    ...userSchema.obj,
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['DeliveryPartner'],
      default: 'DeliveryPartner',
    },

    email: { type: String }, // Optional

    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      lastUpdated: { type: Date },
    },

    // Availability
    isAvailable: { type: Boolean, default: true },

    // Branch assignment
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },

    // Vehicle details
    vehicleDetails: {
      type: {
        type: String,
        enum: ['bike', 'scooter', 'bicycle', 'car'],
      },
      number: { type: String },
      model: { type: String },
    },

    // Document verification
    documents: {
      drivingLicense: { type: String },
      aadhar: { type: String },
      vehicleRC: { type: String },
    },
    documentStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);



deliveryPartnerSchema.index({ branch: 1, isAvailable: 1 });

// ========== ADMIN SCHEMA ==========
const adminSchema = new mongoose.Schema(
  {
    ...userSchema.obj,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['Admin'], default: 'Admin' },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.skipPasswordHash) {
    delete this.skipPasswordHash;
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export models
export const Customer = mongoose.model('Customer', customerSchema);
export const DeliveryPartner = mongoose.model(
  'DeliveryPartner',
  deliveryPartnerSchema
);
export const Admin = mongoose.model('Admin', adminSchema);
