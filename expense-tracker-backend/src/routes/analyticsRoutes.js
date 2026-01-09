const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  expenseByCategory,
  incomeByCategory,
  accountAnalysis,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/expense-by-category", authMiddleware, expenseByCategory);
router.get("/income-by-category", authMiddleware, incomeByCategory);
router.get("/account-analysis", authMiddleware, accountAnalysis);

module.exports = router;
