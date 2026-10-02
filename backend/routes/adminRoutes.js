const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getUsers, verifyListing, updateUserStatus, deleteUser, getListings,
} = require('../controllers/adminController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/listings', getListings);
router.put('/verify/:id', verifyListing);
router.put('/user/:id/status', updateUserStatus);
router.delete('/user/:id', deleteUser);

module.exports = router;
