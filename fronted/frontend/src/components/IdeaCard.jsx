import { Vote, Calendar, MessageSquare, Tag, Trash2, Edit } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { 
  isVotingOpenForIdea, 
  isSubmissionOpenForIdea,
  isOwnIdea, 
  hasUserVotedThisIdea, 
  hasUserVotedInCycle,
  getOwnerId
} from "../utils/cycleHelper";
import { getVoteButtonDisplay } from "../utils/voteButtonDisplay";

export default function IdeaCard({ idea, onVote, onOpen, onDelete, onEdit, allIdeas = [] }) {
  const { userInfo } = useAuth();
  const user = userInfo?.user;
  const authUser = userInfo?.user;
  const currentUserId =
    user?._id ||
    user?.id ||
    userInfo?._id ||
    userInfo?.id ||
    authUser?._id ||
    authUser?.id;
  const isAdmin =
    user?.role === "admin" ||
    user?.role === "superadmin" ||
    userInfo?.role === "admin" ||
    userInfo?.role === "superadmin";

  const isOwner = isOwnIdea(idea, currentUserId);
  const submissionOpen = isSubmissionOpenForIdea(idea);
  
  const canEditIdea = isOwner && submissionOpen;
  const canDeleteIdea = isAdmin;
  
  const votingOpen = isVotingOpenForIdea(idea);
  const votedThisIdea = hasUserVotedThisIdea(idea, currentUserId);
  const votedInCycle = hasUserVotedInCycle(idea, allIdeas, currentUserId);

  const voteButtonDisplay = getVoteButtonDisplay({
    isOwnIdea: isOwner,
    hasUserVotedThisIdea: votedThisIdea,
    hasUserVotedInCycle: votedInCycle,
    isVotingOpen: votingOpen,
  });

  const getVoteCount = () => {
    if (Array.isArray(idea.votes)) return idea.votes.length;
    if (Array.isArray(idea.likes)) return idea.likes.length;
    return idea.votes || idea.likes || idea.likesCount || idea.voteCount || 0;
  };

  return (
    <div 
      className="premium-card flex flex-col h-[280px] p-5 group cursor-pointer animate-fade-up hover:scale-[1.02] border border-[#0B1F3A]/10 shadow-lg relative bg-white rounded-3xl"
      onClick={() => onOpen(idea)}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#F8F5EF] flex items-center justify-center border border-[#D4AF37]/20 shadow-sm shrink-0 overflow-hidden relative">
            {idea.createdBy?.photoUrl ? (
              <img src={idea.createdBy.photoUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-[#D4AF37] font-bold text-[10px]">
                {(idea.createdBy?.name || "U")[0].toUpperCase()}
              </span>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-[#0B1F3A]/10 rounded-full" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[10px] font-bold text-[#0B1220] truncate">{idea.createdBy?.name || "Anonymous User"}</h3>
            <p className="text-[8px] font-semibold text-[#1F2937]/50 uppercase tracking-widest">{idea.createdBy?.department || "Member"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {canEditIdea && onEdit && (
            <button
              onClick={() => onEdit(idea)}
              className="p-1.5 text-[#1F2937]/30 hover:text-[#0B1220] hover:bg-[#F8F5EF] rounded-lg transition-all"
              title="Edit Idea"
            >
              <Edit size={14} />
            </button>
          )}
          {canDeleteIdea && onDelete && (
            <button
              onClick={() => onDelete(idea._id)}
              className="p-1.5 text-[#1F2937]/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Idea"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-1.5 mb-2">
          <Tag size={10} className="text-[#D4AF37]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded cursor-default pointer-events-none hover:bg-none hover:text-current transition-none">
            {idea.category || idea.type || "General"}
          </span>
          <span className="text-[9px] font-semibold text-[#1F2937]/30 flex items-center gap-1 ml-auto cursor-default pointer-events-none hover:bg-none hover:text-current transition-none">
             <Calendar size={10} />
             {new Date(idea.createdAt || idea.submittedAt).toLocaleDateString()}
          </span>
        </div>
        <h4 className="text-sm font-bold text-[#0B1220] line-clamp-2 leading-tight mb-2 group-hover:text-[#D4AF37] transition-colors">{idea.title}</h4>
        <p className="text-xs text-[#6B7280] line-clamp-3 leading-relaxed flex-1 italic">"{idea.description}"</p>
      </div>

      {/* Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#0B1F3A]/10 pt-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onVote(idea._id)}
          disabled={voteButtonDisplay.disabled}
          className={`group/vote relative flex items-center justify-center gap-2 ${voteButtonDisplay.className}`}
        >
          <Vote size={16} className={!voteButtonDisplay.disabled ? "group-hover/vote:rotate-12 transition-transform duration-300" : ""} />
          {voteButtonDisplay.text}
          <span className={`ml-3 border-l pl-3 font-bold text-sm tracking-tight ${votedThisIdea ? 'border-white/20' : 'border-[#0B1220]/20'}`}>
            {getVoteCount()}
          </span>
        </button>
        <div className="flex gap-4 items-center flex-wrap justify-end min-w-0">
          <button
            onClick={() => onOpen(idea)}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#1F2937]/30 hover:text-[#0B1220] transition-all group/details"
          >
            <div className="p-2 bg-[#F8F5EF] rounded-xl group-hover/details:bg-[#D4AF37] group-hover/details:text-[#0B1220] transition-colors">
               <MessageSquare size={16} />
            </div>
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
