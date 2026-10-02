const express = require('express');
const router = express.Router();
const {
  getClinics, getClinic, createClinic, updateClinic, deleteClinic,
} = require('../controllers/clinicController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');

const profileUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

router.get('/', getClinics);
router.get('/:id', optionalAuth, getClinic);
router.post('/', protect, authorize('clinic', 'admin'), createClinic);
router.put('/:id', protect, authorize('clinic', 'admin'), profileUpload, updateClinic);
router.delete('/:id', protect, authorize('clinic', 'admin'), deleteClinic);

module.exports = router;
