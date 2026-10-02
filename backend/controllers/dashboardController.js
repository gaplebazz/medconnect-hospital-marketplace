const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Review = require('../models/Review');

const modelMap = { Hospital: require('../models/Hospital'), Clinic: require('../models/Clinic'), Doctor };
const fieldMap = { Hospital: 'hospital', Clinic: 'clinic', Doctor: 'doctor' };

// @desc    Get overview stats for the logged-in provider (hospital/clinic/doctor)
// @route   GET /api/dashboard/overview
// @access  Private (hospital, clinic, doctor)
const getProviderOverview = asyncHandler(async (req, res) => {
  if (!['hospital', 'clinic', 'doctor'].includes(req.user.role)) {
    throw new ApiError(403, 'Only providers have a provider dashboard.');
  }
  if (!req.user.profileRef) throw new ApiError(400, 'No profile found for this account.');

  const Model = modelMap[req.user.profileModel];
  const profile = await Model.findById(req.user.profileRef);
  const fieldName = fieldMap[req.user.profileModel];

  const [totalAppointments, pendingAppointments, totalReviews, doctorCount] = await Promise.all([
    Appointment.countDocuments({ [fieldName]: req.user.profileRef }),
    Appointment.countDocuments({ [fieldName]: req.user.profileRef, status: 'pending' }),
    Review.countDocuments({ [fieldName]: req.user.profileRef }),
    req.user.profileModel === 'Hospital'
      ? Doctor.countDocuments({ affiliatedHospital: req.user.profileRef })
      : req.user.profileModel === 'Clinic'
      ? Doctor.countDocuments({ affiliatedClinic: req.user.profileRef })
      : Promise.resolve(0),
  ]);

  res.json({
    success: true,
    data: {
      profile,
      profileViews: profile.profileViews,
      rating: profile.rating,
      verificationStatus: profile.verificationStatus,
      totalAppointments,
      pendingAppointments,
      totalReviews,
      doctorCount,
    },
  });
});

// @desc    List doctors affiliated with the logged-in hospital or clinic
// @route   GET /api/dashboard/doctors
// @access  Private (hospital, clinic)
const getAffiliatedDoctors = asyncHandler(async (req, res) => {
  if (!['hospital', 'clinic'].includes(req.user.role)) {
    throw new ApiError(403, 'Only hospitals and clinics can view affiliated doctors.');
  }
  const filter =
    req.user.profileModel === 'Hospital'
      ? { affiliatedHospital: req.user.profileRef }
      : { affiliatedClinic: req.user.profileRef };
  const doctors = await Doctor.find(filter);
  res.json({ success: true, count: doctors.length, data: doctors });
});

module.exports = { getProviderOverview, getAffiliatedDoctors };
