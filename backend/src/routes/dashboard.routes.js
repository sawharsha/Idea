const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorizeRoles } = require("../middlewares/auth.middleware");
const { getDashboardStats, getTopIdeasThisWeek, getWeeklyWinnerSummary } = require("../controllers/dashboard.controller");

const router = express.Router();
router.use(protect);
router.use(authorizeRoles("admin", "user"));
router.get("/stats", asyncHandler(getDashboardStats));
router.get("/top-ideas", asyncHandler(getTopIdeasThisWeek));
router.get("/winners", asyncHandler(getWeeklyWinnerSummary));
module.exports = router;
