const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true },
    description: { type: String, default: '' },
    specialities: [{ type: String }],
    facilities: [{ type: String }],
    openingHours: { type: String, default: '' },
    website: { type: String, default: '' },
    logo: { type: String, default: '' },
    images: [{ type: String }],
    consultationFee: { type: Number, default: 0 },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

clinicSchema.index({ name: 'text', city: 'text', specialities: 'text' });
clinicSchema.index({ city: 1 });
clinicSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Clinic', clinicSchema);
