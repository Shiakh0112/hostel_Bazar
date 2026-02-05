const express = require('express');
const router = express.Router();
const {
  addEmergencyContact,
  getEmergencyContacts,
  updateEmergencyContact,
  deleteEmergencyContact,
  getStudentEmergencyContacts
} = require('../controllers/emergencyContact.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Student routes
router.post('/', authMiddleware, addEmergencyContact);
router.get('/', authMiddleware, getEmergencyContacts);
router.put('/:contactId', authMiddleware, updateEmergencyContact);
router.delete('/:contactId', authMiddleware, deleteEmergencyContact);

// Owner/Staff routes
router.get('/student/:studentId', authMiddleware, roleMiddleware(['owner', 'staff']), getStudentEmergencyContacts);

module.exports = router;