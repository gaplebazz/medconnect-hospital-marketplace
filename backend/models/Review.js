const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['Hospital', 'Clinic', 'Doctor'], required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    reported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ hospital: 1 });
reviewSchema.index({ clinic: 1 });
reviewSchema.index({ doctor: 1 });

module.exports = mongoose.model('Review', reviewSchema);
