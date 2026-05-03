export const buildCycles = () => {
  const cycles = [];
  let start = new Date("2026-04-20T00:00:00");

  while (start <= new Date()) {
    const submissionClose = new Date(start);
    submissionClose.setDate(start.getDate() + 11);
    submissionClose.setHours(12, 0, 0, 0);

    const votingStart = new Date(submissionClose);

    const votingEnd = new Date(submissionClose);
    votingEnd.setDate(submissionClose.getDate() + 2);
    votingEnd.setHours(23, 59, 59, 999);

    const winnerAnnounceDate = new Date(submissionClose);
    winnerAnnounceDate.setDate(submissionClose.getDate() + 3);
    winnerAnnounceDate.setHours(9, 0, 0, 0);

    cycles.push({
      submissionStart: new Date(start),
      submissionClose,
      votingStart,
      votingEnd,
      winnerAnnounceDate,
    });

    start = new Date(winnerAnnounceDate);
    start.setHours(0, 0, 0, 0);
  }

  return cycles;
};

export const findCycleForIdea = (idea) => {
  const date = new Date(idea.createdAt || idea.submittedAt);
  return buildCycles().find(
    (cycle) => date >= cycle.submissionStart && date <= cycle.votingEnd
  ) || null;
};

export const isVotingOpenForIdea = (idea) => {
  const cycle = findCycleForIdea(idea);
  if (!cycle) return false;

  const now = new Date();
  return now >= cycle.votingStart && now <= cycle.votingEnd;
};

export const isSubmissionOpenForIdea = (idea) => {
  const cycle = findCycleForIdea(idea);
  if (!cycle) return false;

  const now = new Date();
  return now >= cycle.submissionStart && now <= cycle.submissionClose;
};

export const getOwnerId = (idea) =>
  idea.user?._id ||
  idea.userId?._id ||
  idea.userId ||
  idea.createdBy?._id ||
  idea.createdBy ||
  idea.author?._id ||
  idea.author;

export const isOwnIdea = (idea, currentUserId) =>
  String(getOwnerId(idea)) === String(currentUserId);

export const hasUserVotedThisIdea = (idea, currentUserId) => {
  const likes = idea.likes || [];
  const votes = idea.votes || [];
  return likes.some((v) => String(v) === String(currentUserId)) || 
         votes.some((v) => String(v) === String(currentUserId));
};

export const hasUserVotedInCycle = (idea, allIdeas, currentUserId) => {
  const cycle = findCycleForIdea(idea);
  if (!cycle) return false;

  return allIdeas.some((item) => {
    const itemDate = new Date(item.createdAt || item.submittedAt);
    const sameCycle =
      itemDate >= cycle.submissionStart && itemDate <= cycle.votingEnd;

    const itemLikes = item.likes || [];
    const itemVotes = item.votes || [];
    const voted = itemLikes.some((v) => String(v) === String(currentUserId)) ||
                  itemVotes.some((v) => String(v) === String(currentUserId));

    return sameCycle && voted && String(item._id) !== String(idea._id);
  });
};
