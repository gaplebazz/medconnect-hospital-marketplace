const express = require('express');
const router = express.Router();
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/', getReviews);
router.post('/', protect, authorize('patient'), createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
