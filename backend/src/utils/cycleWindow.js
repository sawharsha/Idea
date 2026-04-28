const isWithin = (date, start, end) => date >= start && date <= end;

const getWeekOfMonth = (date = new Date()) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const adjustedDate = dayOfMonth + firstDay.getDay();
  return Math.ceil(adjustedDate / 7);
};

const buildCycles = (date = new Date()) => {
  const cycles = [];
  let start = new Date("2026-04-20T00:00:00");
  const end = new Date(date);

  while (start <= end) {
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

    const label = `${start.toLocaleString("en-US", {
      month: "long",
    })} ${start.getFullYear()} Cycle ${cycles.length % 2 === 0 ? "2" : "1"}`;

    cycles.push({
      label,
      cycleLabel: label,
      submissionStart: new Date(start),
      submissionClose,
      submissionEnd: submissionClose,
      votingStart,
      votingEnd,
      winnerAnnounceDate,
      announcementDate: winnerAnnounceDate,
    });

    start = new Date(winnerAnnounceDate);
    start.setHours(0, 0, 0, 0);
  }

  return cycles;
};

const getCandidateCycles = (date = new Date()) => buildCycles(date);

const findCycleForDate = (date = new Date()) => {
  const target = new Date(date);
  return (
    buildCycles(target).find((cycle) =>
      isWithin(target, cycle.submissionStart, cycle.votingEnd)
    ) || null
  );
};

const getCycleWindowByLabel = (cycleLabel, date = new Date()) => {
  const cycles = buildCycles(date);
  const match = cycles.find((cycle) => cycle.cycleLabel === cycleLabel);

  if (match) return match;

  return (
    cycles.find((cycle) => cycle.cycleLabel.replace(/\s\d{4}\s/, " ") === cycleLabel) ||
    null
  );
};

const getCurrentCycleWindow = (date = new Date()) => {
  const now = new Date(date);
  const cycles = buildCycles(now);
  const submissionCycle =
    cycles.find((cycle) =>
      isWithin(now, cycle.submissionStart, cycle.submissionClose)
    ) || null;
  const votingCycle =
    cycles.find((cycle) => isWithin(now, cycle.votingStart, cycle.votingEnd)) ||
    null;
  const activeCycle =
    cycles.find((cycle) =>
      isWithin(now, cycle.submissionStart, cycle.winnerAnnounceDate)
    ) || null;
  const latestAnnouncedCycle =
    [...cycles]
      .filter((cycle) => now >= cycle.winnerAnnounceDate)
      .sort((a, b) => b.winnerAnnounceDate - a.winnerAnnounceDate)[0] || null;
  const displayCycle =
    activeCycle || latestAnnouncedCycle || cycles[cycles.length - 1] || null;

  return {
    cycleLabel: displayCycle?.cycleLabel || "",
    submissionCycleLabel: submissionCycle?.cycleLabel || "",
    votingCycleLabel: votingCycle?.cycleLabel || "",
    winnerCycleLabel: latestAnnouncedCycle?.cycleLabel || "",
    isSubmissionOpen: Boolean(submissionCycle),
    isVotingOpen: Boolean(votingCycle),
    isWinnerAnnounced: Boolean(
      displayCycle && now >= displayCycle.winnerAnnounceDate
    ),
    submissionStart: displayCycle?.submissionStart || null,
    submissionClose: displayCycle?.submissionClose || null,
    submissionEnd: displayCycle?.submissionClose || null,
    votingStart: displayCycle?.votingStart || null,
    votingEnd: displayCycle?.votingEnd || null,
    winnerAnnounceDate: displayCycle?.winnerAnnounceDate || null,
    announcementDate: displayCycle?.winnerAnnounceDate || null,
    submissionCycle,
    votingCycle,
    activeCycle,
    latestAnnouncedCycle,
  };
};

module.exports = {
  getWeekOfMonth,
  buildCycles,
  getCandidateCycles,
  findCycleForDate,
  getCurrentCycleWindow,
  getCycleWindowByLabel,
};
