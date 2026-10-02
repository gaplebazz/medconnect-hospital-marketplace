const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const fieldMap = {
  Hospital: 'savedHospitals',
  Clinic: 'savedClinics',
  Doctor: 'savedDoctors',
};

// @desc    Toggle save/unsave a hospital, clinic, or doctor
// @route   POST /api/patients/save
// @access  Private (patient)
const toggleSave = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.body;
  if (!fieldMap[targetType]) throw new ApiError(400, 'Invalid target type.');

  const field = fieldMap[targetType];
  const user = await User.findById(req.user._id);
  const idx = user[field].findIndex((id) => String(id) === String(targetId));

  if (idx > -1) {
    user[field].splice(idx, 1);
  } else {
    user[field].push(targetId);
  }
  await user.save();

  res.json({
    success: true,
    saved: idx === -1,
    message: idx === -1 ? 'Added to saved list.' : 'Removed from saved list.',
  });
});

// @desc    Get patient's saved providers
// @route   GET /api/patients/saved
// @access  Private (patient)
const getSaved = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('savedHospitals')
    .populate('savedClinics')
    .populate('savedDoctors');

  res.json({
    success: true,
    data: {
      hospitals: user.savedHospitals,
      clinics: user.savedClinics,
      doctors: user.savedDoctors,
    },
  });
});

// @desc    Update own patient profile
// @route   PUT /api/patients/profile
// @access  Private (patient)
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const allowed = ['name', 'phone', 'dateOfBirth', 'gender', 'city', 'state'];
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });
  if (req.file) user.avatar = `/uploads/profiles/${req.file.filename}`;
  await user.save();
  const obj = user.toObject();
  delete obj.password;
  res.json({ success: true, message: 'Profile updated.', data: obj });
});

module.exports = { toggleSave, getSaved, updateProfile };
