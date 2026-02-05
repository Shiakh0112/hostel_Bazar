const express = require('express');
const {
  createDiscount,
  getDiscounts,
  validateDiscount,
  applyDiscount,
  updateDiscount,
  deleteDiscount
} = require('../controllers/discount.controller');
const auth = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');

const router = express.Router();

// Owner routes
router.post('/', auth, roleAuth(['owner']), createDiscount);
router.get('/', auth, roleAuth(['owner']), getDiscounts);
router.put('/:discountId', auth, roleAuth(['owner']), updateDiscount);
router.delete('/:discountId', auth, roleAuth(['owner']), deleteDiscount);

// Student routes
router.post('/validate', auth, roleAuth(['student']), validateDiscount);
router.post('/apply', auth, roleAuth(['student']), applyDiscount);

module.exports = router;