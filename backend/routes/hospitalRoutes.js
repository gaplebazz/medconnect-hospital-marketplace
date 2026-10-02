const express = require('express');
const router = express.Router();
const {
  getHospitals, getHospital, createHospital, updateHospital, deleteHospital,
} = require('../controllers/hospitalController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');
const optionalAuth = require('../middleware/optionalAuth');

const profileUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

router.get('/', getHospitals);
router.get('/:id', optionalAuth, getHospital);
router.post('/', protect, authorize('hospital', 'admin'), createHospital);
router.put('/:id', protect, authorize('hospital', 'admin'), profileUpload, updateHospital);
router.delete('/:id', protect, authorize('hospital', 'admin'), deleteHospital);

module.exports = router;
