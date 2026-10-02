const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Speciality = require('../models/Speciality');

// @desc    List all specialities
// @route   GET /api/specialities
// @access  Public
const getSpecialities = asyncHandler(async (req, res) => {
  const specialities = await Speciality.find().sort({ name: 1 });
  res.json({ success: true, count: specialities.length, data: specialities });
});

// @desc    Create a speciality
// @route   POST /api/specialities
// @access  Private (admin)
const createSpeciality = asyncHandler(async (req, res) => {
  const { name, icon, image, description } = req.body;
  if (!name) throw new ApiError(400, 'Speciality name is required.');
  const exists = await Speciality.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  if (exists) throw new ApiError(400, 'Speciality already exists.');
  const speciality = await Speciality.create({ name, icon, image, description });
  res.status(201).json({ success: true, data: speciality });
});

// @desc    Delete a speciality
// @route   DELETE /api/specialities/:id
// @access  Private (admin)
const deleteSpeciality = asyncHandler(async (req, res) => {
  const speciality = await Speciality.findById(req.params.id);
  if (!speciality) throw new ApiError(404, 'Speciality not found.');
  await speciality.deleteOne();
  res.json({ success: true, message: 'Speciality removed.' });
});

module.exports = { getSpecialities, createSpeciality, deleteSpeciality };
