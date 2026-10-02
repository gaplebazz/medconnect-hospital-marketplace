const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Hospital = require('../models/Hospital');

// @desc    List hospitals with search, filters, sort, pagination
// @route   GET /api/hospitals
// @access  Public
const getHospitals = asyncHandler(async (req, res) => {
  const {
    search,
    city,
    speciality,
    emergency,
    available247,
    minRating,
    sort,
    page = 1,
    limit = 9,
  } = req.query;

  const query = { verificationStatus: 'approved' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { specialities: { $regex: search, $options: 'i' } },
    ];
  }
  if (city) query.city = { $regex: city, $options: 'i' };
  if (speciality) query.specialities = { $regex: speciality, $options: 'i' };
  if (emergency === 'true') query.emergencyService = true;
  if (available247 === 'true') query.available247 = true;
  if (minRating) query.rating = { $gte: Number(minRating) };

  let sortOption = { createdAt: -1 };
  if (sort === 'rating') sortOption = { rating: -1 };
  if (sort === 'name') sortOption = { name: 1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [hospitals, total] = await Promise.all([
    Hospital.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Hospital.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: hospitals.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: hospitals,
  });
});

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
// @access  Public
const getHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) throw new ApiError(404, 'Hospital not found.');

  const isOwnerOrAdmin =
    req.user && (req.user.role === 'admin' || String(hospital.owner) === String(req.user._id));

  if (hospital.verificationStatus !== 'approved' && !isOwnerOrAdmin) {
    throw new ApiError(404, 'Hospital not found.');
  }

  if (!isOwnerOrAdmin) {
    hospital.profileViews += 1;
    await hospital.save();
  }

  res.json({ success: true, data: hospital });
});

// @desc    Create hospital profile (admin use / fallback; normally created at registration)
// @route   POST /api/hospitals
// @access  Private (hospital, admin)
const createHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, data: hospital });
});

// @desc    Update hospital profile
// @route   PUT /api/hospitals/:id
// @access  Private (owner, admin)
const updateHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) throw new ApiError(404, 'Hospital not found.');

  const isOwner = String(hospital.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to edit this hospital.');
  }

  const allowedFields = [
    'name', 'adminName', 'phone', 'address', 'city', 'state', 'pincode',
    'description', 'emergencyService', 'available247', 'departments',
    'specialities', 'facilities', 'website',
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) hospital[field] = req.body[field];
  });

  if (req.files?.logo?.[0]) hospital.logo = `/uploads/logos/${req.files.logo[0].filename}`;
  if (req.files?.images) {
    hospital.images = [...hospital.images, ...req.files.images.map((f) => `/uploads/gallery/${f.filename}`)];
  }

  // Editing profile after approval sends it back for re-verification only if
  // core identity fields changed; here we keep it simple and preserve status.
  await hospital.save();
  res.json({ success: true, message: 'Hospital profile updated.', data: hospital });
});

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
// @access  Private (owner, admin)
const deleteHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) throw new ApiError(404, 'Hospital not found.');

  const isOwner = String(hospital.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this hospital.');
  }

  await hospital.deleteOne();
  res.json({ success: true, message: 'Hospital deleted.' });
});

module.exports = { getHospitals, getHospital, createHospital, updateHospital, deleteHospital };
