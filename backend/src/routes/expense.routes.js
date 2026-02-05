const express = require('express');
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getExpenseStats
} = require('../controllers/expense.controller');
const auth = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// Owner routes
router.post('/', auth, roleAuth(['owner']), upload.single('receipt'), createExpense);
router.get('/', auth, roleAuth(['owner']), getExpenses);
router.get('/stats', auth, roleAuth(['owner']), getExpenseStats);
router.put('/:expenseId', auth, roleAuth(['owner']), upload.single('receipt'), updateExpense);
router.delete('/:expenseId', auth, roleAuth(['owner']), deleteExpense);

module.exports = router;