const express = require('express');
const router = express.Router();
const {
  createAppointment, getAppointments, updateAppointment, deleteAppointment,
} = require('../controllers/appointmentController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

router.post('/', protect, authorize('patient'), createAppointment);
router.get('/', protect, getAppointments);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
