const express = require('express');
const router = express.Router();
const { getProviderOverview, getAffiliatedDoctors } = require('../controllers/dashboardController');
const protect = require('../middleware/auth');

router.use(protect);
router.get('/overview', getProviderOverview);
router.get('/doctors', getAffiliatedDoctors);

module.exports = router;
