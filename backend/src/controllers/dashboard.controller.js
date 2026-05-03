const Idea = require("../models/Idea");
const Winner = require("../models/Winner");
const { successResponse } = require("../utils/apiResponse");
const { getCurrentCycleWindow } = require("../utils/cycleWindow");

const formatWinnerIdea = (idea, rank = 1) => ({
  rank,
  votes: idea.likesCount || 0,
  idea,
});

const getDashboardStats = async (req, res) => {
  const cycleWindow = getCurrentCycleWindow();
  const currentWeekLabel = cycleWindow.cycleLabel;

  const totalIdeas = await Idea.countDocuments();
  const ideasThisWeek = await Idea.countDocuments({
    weekLabel: currentWeekLabel,
  });

  const votesAgg = await Idea.aggregate([
    {
      $group: {
        _id: null,
        totalVotes: { $sum: "$likesCount" },
      },
    },
  ]);

  const totalVotes = votesAgg[0]?.totalVotes || 0;

  res.status(200).json(
    successResponse("Dashboard stats fetched successfully", {
      totalIdeas,
      totalVotes,
      ideasThisWeek,
      currentWeekLabel,
      currentCycleLabel: currentWeekLabel,
      isSubmissionOpen: cycleWindow.isSubmissionOpen,
      isVotingOpen: cycleWindow.isVotingOpen,
      announcementDate: cycleWindow.announcementDate,
    })
  );
};

const getTopIdeasThisWeek = async (req, res) => {
  const cycleWindow = getCurrentCycleWindow();
  const currentWeekLabel = cycleWindow.votingCycleLabel || cycleWindow.cycleLabel;

  const ideas = await Idea.find({ weekLabel: currentWeekLabel })
    .populate("createdBy", "name email role department photoUrl")
    .sort({ likesCount: -1, createdAt: -1 })
    .limit(5);

  res.status(200).json(
    successResponse("Top ideas fetched successfully", {
      weekLabel: currentWeekLabel,
      ideas,
    })
  );
};

const getWeeklyWinnerSummary = async (req, res) => {
  const cycleWindow = getCurrentCycleWindow();
  const currentWeekLabel = cycleWindow.winnerCycleLabel || cycleWindow.cycleLabel;

  if (!cycleWindow.latestAnnouncedCycle) {
    return res.status(200).json(
      successResponse("Winners will be announced on Monday.", {
        weekLabel: currentWeekLabel,
        winners: [],
        announcementDate: cycleWindow.announcementDate,
      })
    );
  }

  const manualWinner = await Winner.findOne({ cycleLabel: currentWeekLabel })
    .populate({
      path: "idea",
      populate: {
        path: "createdBy",
        select: "name email role department photoUrl",
      },
    });

  if (manualWinner?.idea) {
    return res.status(200).json(
      successResponse("Weekly winners fetched successfully", {
        weekLabel: currentWeekLabel,
        isTie: false,
        winnerPending: false,
        selectionType: "manual",
        winners: [formatWinnerIdea(manualWinner.idea)],
      })
    );
  }

  const ideas = await Idea.find({ weekLabel: currentWeekLabel })
    .populate("createdBy", "name email role department photoUrl")
    .sort({ likesCount: -1, createdAt: 1 })
    .limit(3);

  if (!ideas.length) {
    return res.status(200).json(
      successResponse("Weekly winners fetched successfully", {
        weekLabel: currentWeekLabel,
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
          weekLabel: currentWeekLabel,
          isTie: true,
          winnerPending: true,
          topIdeas: formattedTopIdeas,
          tieCandidates: formattedTopIdeas,
          winners: [],
        }
      )
    );
  }

  res.status(200).json(
    successResponse("Weekly winners fetched successfully", {
      weekLabel: currentWeekLabel,
      isTie: false,
      winnerPending: false,
      selectionType: "auto",
      winners: [formatWinnerIdea(ideas[0])],
    })
  );
};

module.exports = {
  getDashboardStats,
  getTopIdeasThisWeek,
  getWeeklyWinnerSummary,
};
