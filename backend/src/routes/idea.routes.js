const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { protect, authorizeRoles } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { selectWinner } = require("../controllers/winner.controller");
const {
  createIdea,
  getAllIdeas,
  getMyIdeas,
  getIdeasByUser,
  updateIdea,
  deleteIdea,
  toggleLikeIdea,
  viewIdeaFile,
} = require("../controllers/idea.controller");

const router = express.Router();

/* public view route */
router.get("/:id/file", asyncHandler(viewIdeaFile));

/* protected routes */
router.use(protect);

router.get("/", asyncHandler(getAllIdeas));
router.get("/my", asyncHandler(getMyIdeas));
router.get("/user/:userId", asyncHandler(getIdeasByUser));
router.post(
  "/select-winner/:ideaId",
  authorizeRoles("admin"),
  asyncHandler(selectWinner)
);
router.post("/", upload.single("file"), asyncHandler(createIdea));
router.put("/:id", upload.single("file"), asyncHandler(updateIdea));
router.put("/:id/like", asyncHandler(toggleLikeIdea));
router.delete("/:id", asyncHandler(deleteIdea));

module.exports = router;
