const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // The appointment can target a hospital, clinic, or doctor listing
    targetType: { type: String, enum: ['Hospital', 'Clinic', 'Doctor'], required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ hospital: 1 });
appointmentSchema.index({ clinic: 1 });
appointmentSchema.index({ doctor: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
