const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

const modelMap = { Hospital, Clinic, Doctor };

// @desc    List all hospital/clinic/doctor listings regardless of verification status
// @route   GET /api/admin/listings?type=Hospital|Clinic|Doctor
// @access  Private (admin)
const getListings = asyncHandler(async (req, res) => {
  const { type, status, search, page = 1, limit = 20 } = req.query;
  if (!modelMap[type]) throw new ApiError(400, 'Invalid listing type.');

  const Model = modelMap[type];
  const query = {};
  if (status) query.verificationStatus = status;
  if (search) query.name = { $regex: search, $options: 'i' };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [listings, total] = await Promise.all([
    Model.find(query).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Model.countDocuments(query),
  ]);

  res.json({ success: true, count: listings.length, total, page: pageNum, data: listings });
});

// @desc    Admin dashboard summary stats
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalHospitals, totalClinics, totalDoctors, totalPatients,
    pendingHospitals, pendingClinics, pendingDoctors, totalAppointments, totalReviews,
  ] = await Promise.all([
    User.countDocuments(),
    Hospital.countDocuments(),
    Clinic.countDocuments(),
    Doctor.countDocuments(),
    User.countDocuments({ role: 'patient' }),
    Hospital.countDocuments({ verificationStatus: 'pending' }),
    Clinic.countDocuments({ verificationStatus: 'pending' }),
    Doctor.countDocuments({ verificationStatus: 'pending' }),
    Appointment.countDocuments(),
    Review.countDocuments(),
  ]);

  // Monthly registrations for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthly = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers, totalHospitals, totalClinics, totalDoctors, totalPatients,
      pendingVerifications: pendingHospitals + pendingClinics + pendingDoctors,
      pendingHospitals, pendingClinics, pendingDoctors,
      totalAppointments, totalReviews,
      monthlyRegistrations: monthly.map((m) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        count: m.count,
      })),
    },
  });
});

// @desc    List all users (filter by role/status)
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  res.json({ success: true, count: users.length, total, page: pageNum, data: users });
});

// @desc    Approve or reject a hospital/clinic/doctor listing
// @route   PUT /api/admin/verify/:id
// @access  Private (admin)
const verifyListing = asyncHandler(async (req, res) => {
  const { type, action } = req.body; // type: Hospital|Clinic|Doctor, action: approve|reject
  if (!modelMap[type]) throw new ApiError(400, 'Invalid listing type.');
  if (!['approve', 'reject'].includes(action)) throw new ApiError(400, 'Invalid action.');

  const Model = modelMap[type];
  const listing = await Model.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.');

  listing.verificationStatus = action === 'approve' ? 'approved' : 'rejected';
  await listing.save();

  await User.findByIdAndUpdate(listing.owner, {
    status: action === 'approve' ? 'approved' : 'rejected',
  });

  res.json({ success: true, message: `Listing ${action}d.`, data: listing });
});

// @desc    Suspend / reactivate a user account
// @route   PUT /api/admin/user/:id/status
// @access  Private (admin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'suspended', 'pending', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status.');
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  user.status = status;
  await user.save();

  res.json({ success: true, message: `User status set to ${status}.`, data: user });
});

// @desc    Delete a user (and their profile listing, if any)
// @route   DELETE /api/admin/user/:id
// @access  Private (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  if (user.profileRef && user.profileModel) {
    const Model = modelMap[user.profileModel];
    await Model.findByIdAndDelete(user.profileRef);
  }
  await user.deleteOne();

  res.json({ success: true, message: 'User deleted.' });
});

module.exports = { getDashboardStats, getUsers, verifyListing, updateUserStatus, deleteUser, getListings };
