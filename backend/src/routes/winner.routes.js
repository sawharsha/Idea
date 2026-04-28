const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorizeRoles } = require("../middlewares/auth.middleware");
const {
  getAllAvailableWeeks,
  getWinnersByWeek,
  finalizeWeekNow,
  selectWinner,
} = require("../controllers/winner.controller");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin", "user"));

router.get("/weeks", asyncHandler(getAllAvailableWeeks));
router.put(
  "/select/:ideaId",
  authorizeRoles("admin"),
  asyncHandler(selectWinner)
);
router.get("/:weekLabel", asyncHandler(getWinnersByWeek));
router.post("/finalize", authorizeRoles("admin"), asyncHandler(finalizeWeekNow));

module.exports = router;
