const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Doctor = require('../models/Doctor');

// @desc    List doctors with search, filters, sort, pagination
// @route   GET /api/doctors
// @access  Public
const getDoctors = asyncHandler(async (req, res) => {
  const {
    search, city, specialization, gender, minExperience, maxFee, minRating,
    sort, page = 1, limit = 9,
  } = req.query;

  const query = { verificationStatus: 'approved' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
    ];
  }
  if (city) query.city = { $regex: city, $options: 'i' };
  if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
  if (gender) query.gender = gender;
  if (minExperience) query.experience = { $gte: Number(minExperience) };
  if (maxFee) query.consultationFee = { $lte: Number(maxFee) };
  if (minRating) query.rating = { $gte: Number(minRating) };

  let sortOption = { createdAt: -1 };
  if (sort === 'rating') sortOption = { rating: -1 };
  if (sort === 'experience') sortOption = { experience: -1 };
  if (sort === 'fee') sortOption = { consultationFee: 1 };
  if (sort === 'name') sortOption = { name: 1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [doctors, total] = await Promise.all([
    Doctor.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Doctor.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: doctors.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: doctors,
  });
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('affiliatedHospital', 'name city')
    .populate('affiliatedClinic', 'name city');
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  const isOwnerOrAdmin =
    req.user && (req.user.role === 'admin' || String(doctor.owner) === String(req.user._id));

  if (doctor.verificationStatus !== 'approved' && !isOwnerOrAdmin) {
    throw new ApiError(404, 'Doctor not found.');
  }

  if (!isOwnerOrAdmin) {
    doctor.profileViews += 1;
    await doctor.save();
  }

  res.json({ success: true, data: doctor });
});

// @desc    Create doctor profile
// @route   POST /api/doctors
// @access  Private (doctor, admin)
const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, data: doctor });
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (owner, admin)
const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  const isOwner = String(doctor.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to edit this profile.');
  }

  const allowedFields = [
    'name', 'phone', 'qualification', 'specialization', 'experience', 'consultationFee',
    'languages', 'affiliation', 'address', 'city', 'state', 'pincode', 'about',
    'availableDays', 'availableTime',
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) doctor[field] = req.body[field];
  });

  // Relational affiliation links - empty string clears the link
  if (req.body.affiliatedHospital !== undefined) {
    doctor.affiliatedHospital = req.body.affiliatedHospital || undefined;
  }
  if (req.body.affiliatedClinic !== undefined) {
    doctor.affiliatedClinic = req.body.affiliatedClinic || undefined;
  }

  if (req.files?.profilePhoto?.[0]) {
    doctor.profilePhoto = `/uploads/profiles/${req.files.profilePhoto[0].filename}`;
  }

  await doctor.save();
  res.json({ success: true, message: 'Doctor profile updated.', data: doctor });
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (owner, admin)
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, 'Doctor not found.');

  const isOwner = String(doctor.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this profile.');
  }

  await doctor.deleteOne();
  res.json({ success: true, message: 'Doctor profile deleted.' });
});

module.exports = { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor };
