const express = require('express');
const router = express.Router();
const { getSpecialities, createSpeciality, deleteSpeciality } = require('../controllers/specialityController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/', getSpecialities);
router.post('/', protect, authorize('admin'), createSpeciality);
router.delete('/:id', protect, authorize('admin'), deleteSpeciality);

module.exports = router;
