const Idea = require("../models/Idea");
const WeeklyWinner = require("../models/WeeklyWinner");
const Winner = require("../models/Winner");
const { successResponse } = require("../utils/apiResponse");
const { getWeekLabel } = require("../utils/weekLabel");
const {
  getCurrentCycleWindow,
  getCycleWindowByLabel,
} = require("../utils/cycleWindow");
const finalizeWeeklyWinners = require("../utils/finalizeWeeklyWinners");

const formatWinnerIdea = (idea, rank = 1) => ({
  rank,
  votes: idea.likesCount || 0,
  idea: {
    _id: idea._id,
    title: idea.title,
    createdBy: {
      _id: idea.createdBy?._id || idea.createdBy || null,
      name: idea.createdBy?.name || "Unknown User",
      photoUrl: idea.createdBy?.photoUrl || "",
    },
  },
});

const getManualWinner = async (cycleLabel) =>
  Winner.findOne({ cycleLabel })
    .populate({
      path: "idea",
      populate: {
        path: "createdBy",
        select: "name photoUrl",
      },
    })
    .populate("selectedBy", "name email");

const getAllAvailableWeeks = async (req, res) => {
  const historyWeeks = await WeeklyWinner.distinct("weekLabel");
  const ideaWeeks = await Idea.distinct("weekLabel");
  const cycleWindow = getCurrentCycleWindow();
  const currentWeek = cycleWindow.cycleLabel || getWeekLabel();

  let weeks = [
    ...new Set([
      ...historyWeeks,
      ...ideaWeeks,
      currentWeek,
      cycleWindow.winnerCycleLabel,
    ]),
  ];

  weeks = weeks
    .filter((week) => week && typeof week === "string" && week.trim() !== "")
    .sort((a, b) => b.localeCompare(a));

  res.status(200).json(
    successResponse("Available weeks fetched successfully", weeks)
  );
};

const getWinnersByWeek = async (req, res) => {
  const cycleWindow = getCurrentCycleWindow();
  const selectedWeek = decodeURIComponent(
    req.params.weekLabel ||
      req.query.week ||
      cycleWindow.winnerCycleLabel ||
      getWeekLabel()
  );
  const selectedCycleWindow = getCycleWindowByLabel(selectedWeek);

  if (
    selectedCycleWindow &&
    new Date() < selectedCycleWindow.announcementDate
  ) {
    return res.status(200).json(
      successResponse("Winners will be announced on Monday.", {
        weekLabel: selectedWeek,
        winners: [],
        announcementDate: selectedCycleWindow.announcementDate,
      })
    );
  }

  const manualWinner = await getManualWinner(selectedWeek);

  if (manualWinner?.idea) {
    const winner = formatWinnerIdea(manualWinner.idea);

    return res.status(200).json(
      successResponse("Winners fetched successfully", {
        weekLabel: selectedWeek,
        isTie: false,
        winnerPending: false,
        selectionType: manualWinner.selectionType,
        selectedBy: manualWinner.selectedBy,
        winners: [winner],
      })
    );
  }

  const ideas = await Idea.find({ weekLabel: selectedWeek })
    .populate("createdBy", "name photoUrl")
    .sort({ likesCount: -1, createdAt: 1 });

  if (!ideas.length) {
    return res.status(200).json(
      successResponse("Winners fetched successfully", {
        weekLabel: selectedWeek,
        isTie: false,
        winnerPending: false,
        winners: [],
      })
    );
  }

  const topVotes = ideas[0].likesCount || 0;
  const topIdeas = ideas.filter((idea) => (idea.likesCount || 0) === topVotes);

  if (topIdeas.length > 1) {
    const formattedTopIdeas = topIdeas.map((idea, index) =>
      formatWinnerIdea(idea, index + 1)
    );

    return res.status(200).json(
      successResponse(
        "Multiple ideas have the same top votes. Admin must select the final winner.",
        {
          weekLabel: selectedWeek,
          isTie: true,
          winnerPending: true,
          topIdeas: formattedTopIdeas,
          tieCandidates: formattedTopIdeas,
          winners: [],
        }
      )
    );
  }

  const winners = [formatWinnerIdea(topIdeas[0])];

  res.status(200).json(
    successResponse("Winners fetched successfully", {
      weekLabel: selectedWeek,
      isTie: false,
      winnerPending: false,
      selectionType: "auto",
      winners,
    })
  );
};

const selectWinner = async (req, res) => {
  const { ideaId } = req.params;

  const idea = await Idea.findById(ideaId).populate(
    "createdBy",
    "name photoUrl"
  );

  if (!idea) {
    const error = new Error("Idea not found");
    error.statusCode = 404;
    throw error;
  }

  const cycleIdeas = await Idea.find({ weekLabel: idea.weekLabel }).sort({
    likesCount: -1,
    createdAt: 1,
  });
  const topVotes = cycleIdeas[0]?.likesCount || 0;
  const topIdeaIds = cycleIdeas
    .filter((cycleIdea) => (cycleIdea.likesCount || 0) === topVotes)
    .map((cycleIdea) => cycleIdea._id.toString());

  if (topIdeaIds.length < 2 || !topIdeaIds.includes(idea._id.toString())) {
    const error = new Error(
      "Manual winner selection is allowed only for tied top-vote ideas."
    );
    error.statusCode = 400;
    throw error;
  }

  await Idea.updateMany(
    { weekLabel: idea.weekLabel },
    { $set: { isWinnerSelectedByAdmin: false } }
  );

  idea.isWinnerSelectedByAdmin = true;
  await idea.save();

  await Winner.findOneAndUpdate(
    { cycleLabel: idea.weekLabel },
    {
      cycleLabel: idea.weekLabel,
      idea: idea._id,
      selectedBy: req.user._id,
      selectionType: "manual",
      reason: "Tie resolved by admin",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(
    successResponse("Winner selected successfully", {
      weekLabel: idea.weekLabel,
      isTie: false,
      winnerPending: false,
      selectionType: "manual",
      winners: [formatWinnerIdea(idea)],
    })
  );
};

const finalizeWeekNow = async (req, res) => {
  const { weekLabel } = req.body;

  if (!weekLabel) {
    const error = new Error("weekLabel is required");
    error.statusCode = 400;
    throw error;
  }

  await finalizeWeeklyWinners(weekLabel);

  const winners = await WeeklyWinner.find({ weekLabel })
    .populate({
      path: "userId",
      select: "name photoUrl",
    })
    .sort({ rank: 1 });

  const formattedWinners = winners.map((item) => ({
    rank: item.rank,
    votes: item.votes,
    idea: {
      _id: item.ideaId,
      title: item.title,
      createdBy: {
        _id: item.userId?._id || null,
        name: item.userId?.name || item.userName || "Unknown User",
        photoUrl: item.userId?.photoUrl || item.photoUrl || "",
      },
    },
  }));

  res.status(200).json(
    successResponse("Week finalized successfully", {
      weekLabel,
      winners: formattedWinners,
    })
  );
};

module.exports = {
  getAllAvailableWeeks,
  getWinnersByWeek,
  finalizeWeekNow,
  selectWinner,
};
