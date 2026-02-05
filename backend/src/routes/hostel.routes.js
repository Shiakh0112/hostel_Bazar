const express = require('express');
const {
  createHostel,
  getAllHostels,
  getHostelById,
  getOwnerHostels,
  updateHostel,
  uploadHostelImages,
  deleteHostel,
  fixMissingRooms
} = require('../controllers/hostel.controller');
const auth = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const { validateHostel } = require('../validations/hostel.validation');

const router = express.Router();

// Public routes
router.get('/', getAllHostels);
router.get('/:id', getHostelById);

// Protected routes
router.post('/', auth, roleAuth(['owner']), upload.array('images', 10), validateHostel, createHostel);
router.get('/owner/my-hostels', auth, roleAuth(['owner']), getOwnerHostels);
router.put('/:id', auth, roleAuth(['owner']), updateHostel);
router.post('/:id/images', auth, roleAuth(['owner']), upload.array('images', 10), uploadHostelImages);
router.delete('/:id', auth, roleAuth(['owner']), deleteHostel);

// Admin/Fix routes
router.post('/fix-missing-rooms', auth, roleAuth(['owner', 'admin', 'staff']), fixMissingRooms);

module.exports = router;