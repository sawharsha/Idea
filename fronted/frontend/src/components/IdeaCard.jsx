import { Vote, Calendar, MessageSquare, Tag, User, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function IdeaCard({ idea, onVote, onOpen }) {
  const { userInfo } = useAuth();
  const currentUserId = userInfo?.user?.id || userInfo?.user?._id;
  const ownerId = idea.user?._id || idea.userId || idea.createdBy?._id || idea.createdBy;
  const hasVoted = (idea.likes || idea.votes || []).includes(currentUserId);
  const isOwner = ownerId?.toString() === currentUserId?.toString();

  const getVoteCount = () => {
    if (Array.isArray(idea.votes)) return idea.votes.length;
    if (Array.isArray(idea.likes)) return idea.likes.length;
    return idea.votes || idea.likes || idea.likesCount || idea.voteCount || 0;
  };

  return (
    <div className="group w-full max-w-full min-w-0 bg-white/95 rounded-xl border border-[#0B1220]/10 shadow-sm p-4 md:p-5 transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.01] flex flex-col justify-between relative overflow-hidden animate-fade-up">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-125" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 min-w-0 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={idea.createdBy?.photoUrl || `https://ui-avatars.com/api/?background=F8F5EF&color=D4AF37&name=${encodeURIComponent(idea.createdBy?.name || "User")}`}
              alt={idea.createdBy?.name}
              className="relative h-10 w-10 rounded-lg object-cover border border-[#D4AF37]/10 shadow-sm transition-transform duration-300"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#0B1220] truncate group-hover:text-[#D4AF37] transition-colors">{idea.createdBy?.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="h-1 w-1 bg-[#D4AF37] rounded-full" />
               <p className="text-[8px] font-bold uppercase tracking-wider text-[#1F2937]/40 truncate">{idea.createdBy?.department || "Member"}</p>
            </div>
          </div>
        </div>
        
        {idea.priority && (
          <div className={`shrink-0 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider border shadow-sm transition-all duration-300 ${
            idea.priority === 'High' ? 'bg-red-500/10 text-red-600 border-red-500/20 group-hover:bg-red-600 group-hover:text-white' :
            idea.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white' :
            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white'
          }`}>
            {idea.priority}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="cursor-pointer space-y-3 mb-6 relative z-10" onClick={() => onOpen(idea)}>
        <div className="space-y-1">
           <p className="text-[8px] font-bold uppercase tracking-wider text-[#D4AF37] opacity-60">Idea Concept</p>
           <h3 className="text-lg font-bold text-[#0B1220] tracking-tight group-hover:translate-x-0.5 transition-transform duration-300 leading-tight">
            {idea.title}
          </h3>
        </div>
        <p className="text-[#1F2937]/60 text-xs line-clamp-2 leading-relaxed font-medium italic">
          "{idea.description}"
        </p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F8F5EF] rounded-lg text-[9px] font-bold uppercase tracking-wider text-[#0B1220] border border-[#0B1220]/5 transition-all duration-300 hover:bg-[#0B1220] hover:text-white">
          <Tag size={12} className="text-[#D4AF37]" /> {idea.category || 'CONCEPT'}
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F8F5EF] rounded-lg text-[9px] font-bold uppercase tracking-wider text-[#0B1220] border border-[#0B1220]/5 transition-all duration-300 hover:bg-[#0B1220] hover:text-white">
          <Calendar size={12} className="text-[#D4AF37]" /> {new Date(idea.createdAt || idea.submittedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-[#0B1220]/5 mt-auto relative z-10">
        <button
          onClick={() => onVote(idea._id)}
          disabled={hasVoted}
          className={`group/vote relative flex items-center gap-3 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
            hasVoted
              ? 'bg-[#0B1220] text-white cursor-default border border-white/10'
              : 'bg-[#D4AF37] text-[#0B1220] hover:bg-[#0B1220] hover:text-white shadow-sm hover:shadow-md active:scale-95'
          }`}
        >
          <div className="flex items-center gap-2">
             <Vote size={16} className={!hasVoted ? "group-hover/vote:rotate-12 transition-transform duration-300" : ""} />
             {hasVoted ? 'Validated' : 'Vote'}
          </div>
          <span className={`ml-3 border-l pl-3 font-bold text-sm tracking-tight ${hasVoted ? 'border-white/20' : 'border-[#0B1220]/20'}`}>
            {getVoteCount()}
          </span>
        </button>

        <div className="flex items-center gap-6">
          {isOwner && (
            <button
              onClick={(e) => { e.stopPropagation(); console.log("Edit idea:", idea._id); }}
              className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] hover:text-[#0B1220] transition-all border-b-2 border-transparent hover:border-[#D4AF37] pb-1"
            >
              Modify
            </button>
          )}
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