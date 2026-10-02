const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Hospital = require('../models/Hospital');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');

const fieldMap = { Hospital: 'hospital', Clinic: 'clinic', Doctor: 'doctor' };
const modelMap = { Hospital, Clinic, Doctor };

// @desc    Book / request an appointment
// @route   POST /api/appointments
// @access  Private (patient)
const createAppointment = asyncHandler(async (req, res) => {
  const { targetType, targetId, patientName, patientPhone, preferredDate, preferredTime, reason } = req.body;

  if (!targetType || !targetId || !patientName || !patientPhone || !preferredDate || !preferredTime) {
    throw new ApiError(400, 'Please complete all required fields.');
  }
  if (!fieldMap[targetType]) throw new ApiError(400, 'Invalid appointment target.');

  const Model = modelMap[targetType];
  const target = await Model.findById(targetId);
  if (!target) throw new ApiError(404, 'Listing not found.');

  const appointment = await Appointment.create({
    patient: req.user._id,
    targetType,
    [fieldMap[targetType]]: targetId,
    patientName,
    patientPhone,
    preferredDate,
    preferredTime,
    reason: reason || '',
  });

  await Notification.create({
    user: target.owner,
    title: 'New appointment request',
    message: `${patientName} requested an appointment on ${new Date(preferredDate).toDateString()}.`,
    type: 'appointment',
  });

  res.status(201).json({ success: true, message: 'Appointment requested successfully.', data: appointment });
});

// @desc    Get appointments (patient sees own; provider sees requests for their listing)
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = {};

  if (req.user.role === 'patient') {
    query.patient = req.user._id;
  } else if (['hospital', 'clinic', 'doctor'].includes(req.user.role)) {
    const fieldName = fieldMap[req.user.profileModel];
    query[fieldName] = req.user.profileRef;
  }
  // admin sees all

  if (status) query.status = status;

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email phone')
    .populate('hospital', 'name city')
    .populate('clinic', 'name city')
    .populate('doctor', 'name city')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: appointments.length, data: appointments });
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private (provider owner, admin)
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found.');

  const fieldName = fieldMap[appointment.targetType];
  const isProviderOwner =
    req.user.profileModel === appointment.targetType &&
    String(appointment[fieldName]) === String(req.user.profileRef);
  const isPatientOwner = String(appointment.patient) === String(req.user._id);

  if (!isProviderOwner && !isPatientOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update this appointment.');
  }

  if (req.body.status) appointment.status = req.body.status;
  await appointment.save();

  await Notification.create({
    user: appointment.patient,
    title: 'Appointment update',
    message: `Your appointment status is now "${appointment.status}".`,
    type: 'appointment',
  });

  res.json({ success: true, message: 'Appointment updated.', data: appointment });
});

// @desc    Cancel/delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Appointment not found.');

  const isPatientOwner = String(appointment.patient) === String(req.user._id);
  if (!isPatientOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this appointment.');
  }

  await appointment.deleteOne();
  res.json({ success: true, message: 'Appointment cancelled.' });
});

module.exports = { createAppointment, getAppointments, updateAppointment, deleteAppointment };
