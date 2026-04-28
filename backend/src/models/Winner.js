const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
  {
    cycleLabel: {
      type: String,
      required: true,
      trim: true,
    },
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: true,
    },
    selectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    selectionType: {
      type: String,
      enum: ["auto", "manual"],
      required: true,
      default: "manual",
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

winnerSchema.index({ cycleLabel: 1 }, { unique: true });

module.exports = mongoose.model("Winner", winnerSchema);
