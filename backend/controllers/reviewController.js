const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Review = require('../models/Review');
const Hospital = require('../models/Hospital');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');

const modelMap = { Hospital, Clinic, Doctor };
const fieldMap = { Hospital: 'hospital', Clinic: 'clinic', Doctor: 'doctor' };

async function recalcRating(targetType, targetId) {
  const field = fieldMap[targetType];
  const stats = await Review.aggregate([
    { $match: { [field]: targetId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const Model = modelMap[targetType];
  if (stats.length > 0) {
    await Model.findByIdAndUpdate(targetId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  } else {
    await Model.findByIdAndUpdate(targetId, { rating: 0, numReviews: 0 });
  }
}

// @desc    Get reviews (filter by hospital/clinic/doctor id)
// @route   GET /api/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const { hospital, clinic, doctor, page = 1, limit = 10 } = req.query;
  const query = {};
  if (hospital) query.hospital = hospital;
  if (clinic) query.clinic = clinic;
  if (doctor) query.doctor = doctor;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments(query),
  ]);

  res.json({ success: true, count: reviews.length, total, page: pageNum, data: reviews });
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (patient)
const createReview = asyncHandler(async (req, res) => {
  const { targetType, targetId, rating, comment } = req.body;
  if (!targetType || !targetId || !rating || !comment) {
    throw new ApiError(400, 'Please complete all required fields.');
  }
  if (!fieldMap[targetType]) throw new ApiError(400, 'Invalid review target type.');

  const Model = modelMap[targetType];
  const target = await Model.findById(targetId);
  if (!target) throw new ApiError(404, 'Listing not found.');

  const review = await Review.create({
    user: req.user._id,
    targetType,
    [fieldMap[targetType]]: targetId,
    rating,
    comment,
  });

  await recalcRating(targetType, targetId);

  res.status(201).json({ success: true, message: 'Review submitted.', data: review });
});

// @desc    Update own review
// @route   PUT /api/reviews/:id
// @access  Private (review owner)
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');
  if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only edit your own reviews.');
  }

  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = req.body.comment;
  await review.save();

  const targetId = review[fieldMap[review.targetType]];
  await recalcRating(review.targetType, targetId);

  res.json({ success: true, message: 'Review updated.', data: review });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (review owner, admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');
  if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own reviews.');
  }

  const targetType = review.targetType;
  const targetId = review[fieldMap[targetType]];
  await review.deleteOne();
  await recalcRating(targetType, targetId);

  res.json({ success: true, message: 'Review deleted.' });
});

module.exports = { getReviews, createReview, updateReview, deleteReview };
