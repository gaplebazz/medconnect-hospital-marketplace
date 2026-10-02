const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    adminName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true },
    description: { type: String, default: '' },
    emergencyService: { type: Boolean, default: false },
    available247: { type: Boolean, default: false },
    departments: [{ type: String }],
    specialities: [{ type: String }],
    facilities: [{ type: String }],
    website: { type: String, default: '' },
    logo: { type: String, default: '' },
    images: [{ type: String }],
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

hospitalSchema.index({ name: 'text', city: 'text', specialities: 'text' });
hospitalSchema.index({ city: 1 });
hospitalSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
