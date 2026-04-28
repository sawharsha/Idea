const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const {
  registerUser,
  loginUser,
  updateProfile,
  deleteProfile,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", upload.single("photo"), asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.put("/profile", protect, upload.single("photo"), asyncHandler(updateProfile));
router.delete("/profile", protect, asyncHandler(deleteProfile));

module.exports = router;