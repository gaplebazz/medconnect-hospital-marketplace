const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// The User model is the single account/authentication record for every role.
// Role-specific profile data (hospital details, doctor qualifications, etc.)
// lives in separate collections (Hospital, Clinic, Doctor) linked via `profileRef`.
// Patients and Admins store their extra fields directly on this document since
// they are comparatively simple.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['hospital', 'clinic', 'doctor', 'patient', 'admin'],
      required: true,
    },
    // Only relevant for hospital / clinic / doctor roles
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: function () {
        return this.role === 'patient' || this.role === 'admin' ? 'approved' : 'pending';
      },
    },
    profileRef: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'profileModel',
    },
    profileModel: {
      type: String,
      enum: ['Hospital', 'Clinic', 'Doctor'],
    },
    // Patient-only fields
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    city: String,
    state: String,
    savedHospitals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }],
    savedClinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
    savedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    avatar: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// email and phone already get unique indexes from `unique: true` above
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
