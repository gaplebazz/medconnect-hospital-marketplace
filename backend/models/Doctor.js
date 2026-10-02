const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, default: 0 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    consultationFee: { type: Number, required: true, default: 0 },
    languages: [{ type: String }],
    affiliation: { type: String, default: '' }, // hospital/clinic name (free text)
    affiliatedHospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    affiliatedClinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
    address: { type: String, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, default: '' },
    about: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    availableDays: [{ type: String }],
    availableTime: { type: String, default: '' },
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

doctorSchema.index({ name: 'text', city: 'text', specialization: 'text' });
doctorSchema.index({ city: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
