const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createAccount,
  getAccounts,
  deleteAccount,
} = require("../controllers/accountController");

const router = express.Router();

router.post("/", authMiddleware, createAccount);
router.get("/", authMiddleware, getAccounts);
router.delete("/:id", authMiddleware, deleteAccount);

module.exports = router;
