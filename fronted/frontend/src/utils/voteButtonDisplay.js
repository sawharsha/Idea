const baseVoteButtonClass =
  "min-w-[150px] h-12 rounded-full px-5 text-sm font-bold tracking-wide transition-all duration-300";

const disabledNeutralClass =
  "bg-[#F8F5EF] text-[#0B1220]/35 border border-[#0B1220]/10 cursor-not-allowed shadow-sm";

const activeUnvoteClass =
  "bg-[#0B1F3A] text-white shadow-lg hover:-translate-y-0.5";

const voteClass =
  "bg-[#D4AF37] text-[#0B1220] shadow-lg hover:-translate-y-0.5";

export const getVoteButtonDisplay = ({
  isOwnIdea,
  hasUserVotedThisIdea,
  hasUserVotedInCycle,
  isVotingOpen,
}) => {
  if (isOwnIdea && hasUserVotedThisIdea) {
    return {
      text: "Remove Self Vote",
      disabled: !isVotingOpen,
      className: `${baseVoteButtonClass} ${
        isVotingOpen ? activeUnvoteClass : disabledNeutralClass
      }`,
    };
  }

  if (isOwnIdea) {
    return {
      text: "Own Idea",
      disabled: true,
      className: `${baseVoteButtonClass} ${disabledNeutralClass}`,
    };
  }

  if (!isVotingOpen) {
    return {
      text: "Locked",
      disabled: true,
      className: `${baseVoteButtonClass} ${disabledNeutralClass}`,
    };
  }

  if (hasUserVotedThisIdea) {
    return {
      text: "Unvote",
      disabled: false,
      className: `${baseVoteButtonClass} ${activeUnvoteClass}`,
    };
  }

  if (hasUserVotedInCycle) {
    return {
      text: "Already Voted",
      disabled: true,
      className: `${baseVoteButtonClass} ${disabledNeutralClass}`,
    };
  }

  return {
    text: "Vote",
    disabled: false,
    className: `${baseVoteButtonClass} ${voteClass}`,
  };
};
