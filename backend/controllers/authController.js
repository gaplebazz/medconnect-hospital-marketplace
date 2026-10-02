const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

// @desc    Register a new user (any role)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { role, email, phone, password, confirmPassword } = req.body;

  if (!role || !['hospital', 'clinic', 'doctor', 'patient'].includes(role)) {
    throw new ApiError(400, 'Please select a valid account type.');
  }
  if (!email || !phone || !password) {
    throw new ApiError(400, 'Please complete all required fields.');
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match.');
  }

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
  if (existing) {
    throw new ApiError(400, 'Email or phone number already registered.');
  }

  let name;
  if (role === 'hospital') name = req.body.hospitalName || req.body.name;
  else if (role === 'clinic') name = req.body.clinicName || req.body.name;
  else name = req.body.name;

  if (!name) throw new ApiError(400, 'Name is required.');

  // Create the base auth user first (unverified profile ref attached after)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    password,
    role,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    city: req.body.city,
    state: req.body.state,
  });

  try {
    if (role === 'hospital') {
      const hospital = await Hospital.create({
        owner: user._id,
        name: req.body.hospitalName || name,
        adminName: req.body.adminName || req.body.hospitalAdminName,
        email: email.toLowerCase(),
        phone,
        licenseNumber: req.body.licenseNumber,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        description: req.body.description || '',
        emergencyService: req.body.emergencyService === 'true' || req.body.emergencyService === true,
        available247: req.body.available247 === 'true' || req.body.available247 === true,
        departments: parseListField(req.body.departments),
        specialities: parseListField(req.body.specialities),
        facilities: parseListField(req.body.facilities),
        website: req.body.website || '',
        logo: req.files?.logo?.[0] ? `/uploads/logos/${req.files.logo[0].filename}` : '',
        images: req.files?.images ? req.files.images.map((f) => `/uploads/gallery/${f.filename}`) : [],
      });
      user.profileRef = hospital._id;
      user.profileModel = 'Hospital';
      await user.save();
    } else if (role === 'clinic') {
      const clinic = await Clinic.create({
        owner: user._id,
        name: req.body.clinicName || name,
        ownerName: req.body.ownerName || req.body.doctorName,
        email: email.toLowerCase(),
        phone,
        registrationNumber: req.body.registrationNumber,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        description: req.body.description || '',
        specialities: parseListField(req.body.specialities),
        facilities: parseListField(req.body.facilities),
        openingHours: req.body.openingHours || '',
        website: req.body.website || '',
        logo: req.files?.logo?.[0] ? `/uploads/logos/${req.files.logo[0].filename}` : '',
        images: req.files?.images ? req.files.images.map((f) => `/uploads/gallery/${f.filename}`) : [],
      });
      user.profileRef = clinic._id;
      user.profileModel = 'Clinic';
      await user.save();
    } else if (role === 'doctor') {
      const doctor = await Doctor.create({
        owner: user._id,
        name,
        email: email.toLowerCase(),
        phone,
        registrationNumber: req.body.registrationNumber || req.body.medicalRegistrationNumber,
        qualification: req.body.qualification,
        specialization: req.body.specialization,
        experience: Number(req.body.experience) || 0,
        gender: req.body.gender,
        consultationFee: Number(req.body.consultationFee) || 0,
        languages: parseListField(req.body.languages),
        affiliation: req.body.affiliation || '',
        address: req.body.address || '',
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode || '',
        about: req.body.about || '',
        profilePhoto: req.files?.profilePhoto?.[0]
          ? `/uploads/profiles/${req.files.profilePhoto[0].filename}`
          : '',
        availableDays: parseListField(req.body.availableDays),
        availableTime: req.body.availableTime || '',
        // Optional relational link to an existing Hospital/Clinic listing, selected
        // from a dropdown at registration. Falls back to the free-text `affiliation`
        // field when the doctor isn't tied to a listed provider.
        affiliatedHospital: req.body.affiliatedHospital || undefined,
        affiliatedClinic: req.body.affiliatedClinic || undefined,
      });
      user.profileRef = doctor._id;
      user.profileModel = 'Doctor';
      await user.save();
    }
  } catch (err) {
    // Roll back the user record if profile creation fails, so we never leave
    // an orphaned login with no profile behind.
    await User.findByIdAndDelete(user._id);
    throw err;
  }

  const token = generateToken(user._id, user.role);
  res.status(201).json({
    success: true,
    message:
      role === 'patient'
        ? 'Registration successful! You can now log in.'
        : 'Registration successful! Your profile is pending admin verification.',
    token,
    user: sanitizeUser(user),
  });
});

function parseListField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // not JSON, fall through to comma split
  }
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// @desc    Login with email or phone
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, 'Please provide email/phone and password.');
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email/phone or password.');
  }

  if (user.status === 'suspended') {
    throw new ApiError(403, 'Your account has been suspended. Contact support.');
  }

  const token = generateToken(user._id, user.role);
  res.json({ success: true, message: 'Login successful.', token, user: sanitizeUser(user) });
});

// @desc    Get current logged-in user + profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  let profile = null;
  if (user.profileRef && user.profileModel) {
    const Model = { Hospital, Clinic, Doctor }[user.profileModel];
    profile = await Model.findById(user.profileRef);
  }
  res.json({ success: true, user: sanitizeUser(user), profile });
});

// @desc    Request a password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  // Always respond the same way to avoid leaking which emails are registered
  const genericResponse = {
    success: true,
    message: 'If an account exists for that email, a reset link has been generated.',
  };

  if (!user) return res.json(genericResponse);

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // In production this token would be emailed to the user via a mail service
  // (e.g. Nodemailer + SMTP/SendGrid). For local development we log it here
  // and also return it directly so the reset flow is testable end-to-end.
  console.log(`🔑 Password reset token for ${user.email}: ${resetToken}`);

  res.json({
    ...genericResponse,
    ...(process.env.NODE_ENV === 'development' && { devResetToken: resetToken }),
  });
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw new ApiError(400, 'Token and new password are required.');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, 'Invalid or expired reset token.');

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. You can now log in.' });
});

module.exports = { register, login, getMe, forgotPassword, resetPassword };
