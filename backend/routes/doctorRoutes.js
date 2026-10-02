const express = require('express');
const router = express.Router();
const {
  getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor,
} = require('../controllers/doctorController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');

const profileUpload = upload.fields([{ name: 'profilePhoto', maxCount: 1 }]);

router.get('/', getDoctors);
router.get('/:id', optionalAuth, getDoctor);
router.post('/', protect, authorize('doctor', 'admin'), createDoctor);
router.put('/:id', protect, authorize('doctor', 'admin'), profileUpload, updateDoctor);
router.delete('/:id', protect, authorize('doctor', 'admin'), deleteDoctor);

module.exports = router;
