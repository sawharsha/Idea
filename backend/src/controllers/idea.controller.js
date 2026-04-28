const Idea = require("../models/Idea");
const axios = require("axios");
const path = require("path");
const cloudinary = require("../config/cloudinary");
const { successResponse } = require("../utils/apiResponse");
const { getWeekLabel } = require("../utils/weekLabel");
const {
  getCurrentCycleWindow,
  getCycleWindowByLabel,
} = require("../utils/cycleWindow");

const getUploadedFileData = (file) => {
  if (!file) return {};

  const isImage = file.mimetype?.startsWith("image/");
  const fileFormat =
    file.format || path.extname(file.originalname || "").replace(".", "");

  return {
    fileUrl: file.path || file.secure_url || file.url,
    filePublicId: file.filename || file.public_id,
    fileResourceType: file.resource_type || (isImage ? "image" : "raw"),
    fileFormat,
    originalFileName: file.originalname,
    fileMimeType: file.mimetype,
  };
};

const getStoredIdeaFileData = (idea) => {
  const legacyFile =
    idea.get?.("file") || idea.toObject?.({ getters: false, virtuals: false })?.file || {};

  return {
    fileUrl: idea.fileUrl || legacyFile.url || legacyFile.path || "",
    filePublicId: idea.filePublicId || legacyFile.publicId || legacyFile.public_id || "",
    fileResourceType:
      idea.fileResourceType ||
      legacyFile.resourceType ||
      legacyFile.resource_type ||
      (idea.fileMimeType?.startsWith("image/") ? "image" : "raw"),
    fileFormat: idea.fileFormat || legacyFile.format || "",
    originalFileName:
      idea.originalFileName ||
      legacyFile.originalName ||
      legacyFile.originalFileName ||
      "idea-file",
    fileMimeType: idea.fileMimeType || legacyFile.fileType || legacyFile.mimetype || "",
  };
};

const updateWeeklyPriorities = async (weekLabel) => {
  const ideas = await Idea.find({ weekLabel }).sort({
    likesCount: -1,
    createdAt: 1,
  });

  for (let i = 0; i < ideas.length; i++) {
    if (i === 0) {
      ideas[i].priority = "High";
    } else if (i === 1) {
      ideas[i].priority = "Medium";
    } else if (i === 2) {
      ideas[i].priority = "Average";
    } else {
      ideas[i].priority = "Low";
    }

    await ideas[i].save();
  }
};

const createIdea = async (req, res) => {
  console.log("BODY:", req.body);
  console.log("Uploaded file:", req.file);

  const cycleWindow = getCurrentCycleWindow();

  if (!cycleWindow.isSubmissionOpen) {
    const error = new Error(
      "Idea submission is currently closed. Please wait for the next submission cycle."
    );
    error.statusCode = 403;
    throw error;
  }

  const { title, description, category } = req.body;
  const currentWeekLabel = cycleWindow.submissionCycleLabel;
  const submissionCycle = cycleWindow.submissionCycle;

  const alreadySubmitted = await Idea.findOne({
    createdBy: req.user._id,
    createdAt: {
      $gte: submissionCycle.submissionStart,
      $lte: submissionCycle.votingEnd,
    },
  });

  if (alreadySubmitted) {
    return res.status(400).json({
      message: "You can submit only one idea per cycle.",
    });
  }

  const fileData = getUploadedFileData(req.file);

  const idea = await Idea.create({
    title,
    description,
    type: category || "Software", // Map category to type
    weekLabel: currentWeekLabel,
    createdBy: req.user._id,
    priority: req.body.priority || "Low",
    ...fileData,
  });

  await updateWeeklyPriorities(currentWeekLabel);

  res.status(201).json(successResponse("Idea created successfully", idea));
};

const getAllIdeas = async (req, res) => {
  const { search, filter, week, type, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { type: { $regex: search, $options: "i" } },
    ];
  }

  if (week) {
    query.weekLabel = week;
  }

  if (type) {
    query.type = type;
  }

  let sortOption = { likesCount: -1, createdAt: -1 };

  if (filter === "new") {
    sortOption = { createdAt: -1 };
  } else if (filter === "top" || filter === "trending") {
    sortOption = { likesCount: -1, createdAt: -1 };
  } else if (filter === "thisWeek") {
    query.weekLabel = getWeekLabel();
    sortOption = { likesCount: -1, createdAt: -1 };
  }

  const currentPage = Number(page);
  const currentLimit = Number(limit);
  const skip = (currentPage - 1) * currentLimit;

  const ideas = await Idea.find(query)
    .populate("createdBy", "name email role department photoUrl")
    .sort(sortOption)
    .skip(skip)
    .limit(currentLimit);

  const total = await Idea.countDocuments(query);

  res.status(200).json(
    successResponse("Ideas fetched successfully", {
      ideas,
      pagination: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    })
  );
};

const getMyIdeas = async (req, res) => {
  const ideas = await Idea.find({ createdBy: req.user._id })
    .populate("createdBy", "name email role department photoUrl")
    .sort({ createdAt: -1 });

  res.status(200).json(successResponse("My ideas fetched successfully", ideas));
};

const getIdeasByUser = async (req, res) => {
  const { userId } = req.params;

  const ideas = await Idea.find({ createdBy: userId })
    .populate("createdBy", "name email role department photoUrl")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(successResponse("User ideas fetched successfully", ideas));
};

const updateIdea = async (req, res) => {
  console.log("Uploaded file:", req.file);
  const { id } = req.params;
  const { title, description, type } = req.body;
  const cycleWindow = getCurrentCycleWindow();

  const idea = await Idea.findById(id);

  if (!idea) {
    const error = new Error("Idea not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    !cycleWindow.isSubmissionOpen ||
    idea.weekLabel !== cycleWindow.submissionCycleLabel
  ) {
    const error = new Error(
      "Idea submission is currently closed. Please wait for the next submission cycle."
    );
    error.statusCode = 403;
    throw error;
  }

  const isAdminOwner =
    req.user.role === "admin" &&
    idea.createdBy.toString() === req.user._id.toString();

  if (!isAdminOwner) {
    const error = new Error("You are not allowed to edit ideas.");
    error.statusCode = 403;
    throw error;
  }

  if (title !== undefined) idea.title = title;
  if (description !== undefined) idea.description = description;
  if (type !== undefined) idea.type = type;

  if (req.file) {
    const fileData = getUploadedFileData(req.file);
    idea.fileUrl = fileData.fileUrl || "";
    idea.filePublicId = fileData.filePublicId || "";
    idea.fileResourceType = fileData.fileResourceType || "";
    idea.fileFormat = fileData.fileFormat || "";
    idea.originalFileName = fileData.originalFileName || "";
    idea.fileMimeType = fileData.fileMimeType || "";
  }

  await idea.save();
  await updateWeeklyPriorities(idea.weekLabel);

  res.status(200).json(successResponse("Idea updated successfully", idea));
};

const deleteIdea = async (req, res) => {
  const { id } = req.params;

  const idea = await Idea.findById(id);

  if (!idea) {
    const error = new Error("Idea not found");
    error.statusCode = 404;
    throw error;
  }

  if (req.user.role !== "admin") {
    const error = new Error("You are not allowed to delete ideas.");
    error.statusCode = 403;
    throw error;
  }

  const weekLabel = idea.weekLabel;

  await idea.deleteOne();
  await updateWeeklyPriorities(weekLabel);

  res.status(200).json(successResponse("Idea deleted successfully"));
};

const toggleLikeIdea = async (req, res) => {
  const { id } = req.params;
  const now = new Date();

  const idea = await Idea.findById(id);

  if (!idea) {
    const error = new Error("Idea not found");
    error.statusCode = 404;
    throw error;
  }

  const ideaCycleWindow = getCycleWindowByLabel(idea.weekLabel, now);

  if (
    !ideaCycleWindow ||
    now < ideaCycleWindow.votingStart ||
    now > ideaCycleWindow.votingEnd
  ) {
    const error = new Error(
      "Voting is currently closed. Voting opens after the submission period ends."
    );
    error.statusCode = 403;
    throw error;
  }

  const alreadyLiked = idea.likes.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  if (alreadyLiked) {
    idea.likes = idea.likes.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );
  } else {
    idea.likes.push(req.user._id);
  }

  idea.likesCount = idea.likes.length;
  await idea.save();

  await updateWeeklyPriorities(idea.weekLabel);

  res.status(200).json(successResponse("Idea like toggled successfully", idea));
};

const viewIdeaFile = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    const fileData = getStoredIdeaFileData(idea);

    if (!fileData.filePublicId && !fileData.fileUrl) {
      console.log("No fileUrl saved in DB for idea:", idea);
      return res.status(404).json({ message: "No file attached" });
    }

    if (!idea.fileUrl) {
      idea.fileUrl = fileData.fileUrl || "";
      idea.filePublicId = fileData.filePublicId || "";
      idea.fileResourceType = fileData.fileResourceType || "";
      idea.fileFormat = fileData.fileFormat || "";
      idea.originalFileName = fileData.originalFileName || "";
      idea.fileMimeType = fileData.fileMimeType || "";
      await idea.save();
    }

    const signedUrl = fileData.filePublicId
      ? cloudinary.utils.private_download_url(
          fileData.filePublicId,
          fileData.fileFormat || "",
          {
            resource_type: fileData.fileResourceType || "raw",
            type: "upload",
            expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
            attachment: false,
          }
        )
      : fileData.fileUrl;

    const response = await axios.get(signedUrl, {
      responseType: "stream",
    });

    res.setHeader(
      "Content-Type",
      fileData.fileMimeType || response.headers["content-type"] || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${fileData.originalFileName || "idea-file"}"`
    );

    response.data.pipe(res);
  } catch (error) {
    console.error("View idea file error:", error);
    return res.status(500).json({
      message: "File opening failed",
      error: error.message,
    });
  }
};

module.exports = {
  createIdea,
  getAllIdeas,
  getMyIdeas,
  getIdeasByUser,
  updateIdea,
  deleteIdea,
  toggleLikeIdea,
  viewIdeaFile,
};
