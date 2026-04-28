const mongoose = require("mongoose");

const weeklyWinnerSchema = new mongoose.Schema(
  {
    weekLabel: {
      type: String,
      required: true,
      trim: true,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    finalizedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

weeklyWinnerSchema.index({ weekLabel: 1, rank: 1 }, { unique: true });

module.exports = mongoose.model("WeeklyWinner", weeklyWinnerSchema);