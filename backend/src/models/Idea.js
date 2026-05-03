const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Software", "Hardware"],
      required: true,
      default: "Software",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Average", "Low"],
      default: "Low",
    },
    weekLabel: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    filePublicId: {
      type: String,
      default: "",
    },
    fileResourceType: {
      type: String,
      default: "",
    },
    fileFormat: {
      type: String,
      default: "",
    },
    originalFileName: {
      type: String,
      default: "",
    },
    fileMimeType: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    isWinnerSelectedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Idea", ideaSchema);
