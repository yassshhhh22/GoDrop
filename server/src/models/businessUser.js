import mongoose from 'mongoose';

const businessUserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^\+91[6-9]\d{9}$/,
    },
    role: {
      type: String,
      enum: ['BusinessUser'],
      default: 'BusinessUser',
    },
    isActivated: {
      type: Boolean,
      default: true,
    },

    // Verification status
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    approvedAt: {
      type: Date,
    },

    // ✅ FIXED: Business details - Make fields optional initially
    businessDetails: {
      companyName: {
        type: String,
        // ✅ REMOVED: required: true (will validate in controller)
        trim: true,
      },
      gstNumber: {
        type: String,
        // ✅ REMOVED: required: true
        trim: true,
        uppercase: true,
        match: [
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
          'Invalid GST number format',
        ],
      },
      contactPerson: {
        type: String,
        // ✅ REMOVED: required: true
        trim: true,
      },
      email: {
        type: String,
        // ✅ REMOVED: required: true
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      },
      address: {
        type: String,
        // ✅ REMOVED: required: true
        trim: true,
      },
    },

    // Single registered address (for deliveries)
    registeredAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
    },
  },
  { timestamps: true }
);

// ✅ NEW: Custom validation - Only require business details if status is not Pending
businessUserSchema.pre('save', function (next) {
  // If user is trying to get approved/rejected, business details must be complete
  if (
    this.verificationStatus !== 'Pending' ||
    this.businessDetails?.companyName
  ) {
    const requiredFields = [
      'companyName',
      'gstNumber',
      'contactPerson',
      'email',
      'address',
    ];
    const missingFields = requiredFields.filter(
      (field) => !this.businessDetails?.[field]
    );

    if (missingFields.length > 0 && this.verificationStatus === 'Approved') {
      return next(
        new Error(
          `Cannot approve business user. Missing fields: ${missingFields.join(', ')}`
        )
      );
    }
  }

  next();
});

businessUserSchema.index({ verificationStatus: 1 });
businessUserSchema.index({ 'businessDetails.gstNumber': 1 });

const BusinessUser = mongoose.model('BusinessUser', businessUserSchema);

export default BusinessUser;
