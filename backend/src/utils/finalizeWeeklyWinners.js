const Idea = require("../models/Idea");
const WeeklyWinner = require("../models/WeeklyWinner");

const finalizeWeeklyWinners = async (weekLabel) => {
  if (!weekLabel) return [];

  const alreadyFinalized = await WeeklyWinner.find({ weekLabel });
  if (alreadyFinalized.length > 0) {
    return alreadyFinalized;
  }

  const ideas = await Idea.find({ weekLabel })
    .populate("createdBy", "name photoUrl")
    .sort({ likesCount: -1, createdAt: 1 })
    .limit(3);

  if (!ideas.length) return [];

  const winnerDocs = ideas.map((idea, index) => ({
    weekLabel,
    rank: index + 1,
    ideaId: idea._id,
    userId: idea.createdBy?._id || idea.createdBy,
    votes: idea.likesCount || 0,
    title: idea.title || "Untitled Idea",
    userName: idea.createdBy?.name || "Unknown User",
    photoUrl: idea.createdBy?.photoUrl || "",
  }));

  await WeeklyWinner.insertMany(winnerDocs);

  return WeeklyWinner.find({ weekLabel })
    .populate("userId", "name photoUrl")
    .sort({ rank: 1 });
};

module.exports = finalizeWeeklyWinners;