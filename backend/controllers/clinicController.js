const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Clinic = require('../models/Clinic');

// @desc    List clinics with search, filters, sort, pagination
// @route   GET /api/clinics
// @access  Public
const getClinics = asyncHandler(async (req, res) => {
  const { search, city, speciality, minRating, maxFee, sort, page = 1, limit = 9 } = req.query;

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
  if (minRating) query.rating = { $gte: Number(minRating) };
  if (maxFee) query.consultationFee = { $lte: Number(maxFee) };

  let sortOption = { createdAt: -1 };
  if (sort === 'rating') sortOption = { rating: -1 };
  if (sort === 'fee') sortOption = { consultationFee: 1 };
  if (sort === 'name') sortOption = { name: 1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [clinics, total] = await Promise.all([
    Clinic.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Clinic.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: clinics.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: clinics,
  });
});

// @desc    Get single clinic
// @route   GET /api/clinics/:id
// @access  Public
const getClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findById(req.params.id);
  if (!clinic) throw new ApiError(404, 'Clinic not found.');

  const isOwnerOrAdmin =
    req.user && (req.user.role === 'admin' || String(clinic.owner) === String(req.user._id));

  if (clinic.verificationStatus !== 'approved' && !isOwnerOrAdmin) {
    throw new ApiError(404, 'Clinic not found.');
  }

  if (!isOwnerOrAdmin) {
    clinic.profileViews += 1;
    await clinic.save();
  }

  res.json({ success: true, data: clinic });
});

// @desc    Create clinic profile
// @route   POST /api/clinics
// @access  Private (clinic, admin)
const createClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, data: clinic });
});

// @desc    Update clinic profile
// @route   PUT /api/clinics/:id
// @access  Private (owner, admin)
const updateClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findById(req.params.id);
  if (!clinic) throw new ApiError(404, 'Clinic not found.');

  const isOwner = String(clinic.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to edit this clinic.');
  }

  const allowedFields = [
    'name', 'ownerName', 'phone', 'address', 'city', 'state', 'pincode',
    'description', 'specialities', 'facilities', 'openingHours', 'website',
    'consultationFee',
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) clinic[field] = req.body[field];
  });

  if (req.files?.logo?.[0]) clinic.logo = `/uploads/logos/${req.files.logo[0].filename}`;
  if (req.files?.images) {
    clinic.images = [...clinic.images, ...req.files.images.map((f) => `/uploads/gallery/${f.filename}`)];
  }

  await clinic.save();
  res.json({ success: true, message: 'Clinic profile updated.', data: clinic });
});

// @desc    Delete clinic
// @route   DELETE /api/clinics/:id
// @access  Private (owner, admin)
const deleteClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findById(req.params.id);
  if (!clinic) throw new ApiError(404, 'Clinic not found.');

  const isOwner = String(clinic.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this clinic.');
  }

  await clinic.deleteOne();
  res.json({ success: true, message: 'Clinic deleted.' });
});

module.exports = { getClinics, getClinic, createClinic, updateClinic, deleteClinic };
