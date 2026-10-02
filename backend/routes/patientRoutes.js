const express = require('express');
const router = express.Router();
const { toggleSave, getSaved, updateProfile } = require('../controllers/patientController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');

router.use(protect, authorize('patient'));
router.post('/save', toggleSave);
router.get('/saved', getSaved);
router.put('/profile', upload.single('avatar'), updateProfile);

module.exports = router;
