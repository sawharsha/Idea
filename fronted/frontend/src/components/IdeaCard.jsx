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
    <div className="group w-full max-w-full min-w-0 bg-white/95 rounded-[2.5rem] border border-[#0B1220]/10 shadow-xl shadow-[#0B1220]/5 p-6 md:p-8 transition-all duration-500 ease-out hover:shadow-[0_40px_100px_rgba(11,18,32,0.15)] hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden animate-fade-up">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 min-w-0 relative z-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className="absolute -inset-2 bg-[#D4AF37]/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src={idea.createdBy?.photoUrl || `https://ui-avatars.com/api/?background=F8F5EF&color=D4AF37&name=${encodeURIComponent(idea.createdBy?.name || "User")}`}
              alt={idea.createdBy?.name}
              className="relative h-14 w-14 rounded-2xl object-cover border-2 border-[#D4AF37]/10 shadow-md group-hover:rotate-3 transition-transform duration-500"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0B1220] truncate group-hover:text-[#D4AF37] transition-colors">{idea.createdBy?.name}</h4>
            <div className="flex items-center gap-2 mt-1">
               <div className="h-1.5 w-1.5 bg-[#D4AF37] rounded-full animate-pulse" />
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#1F2937]/30 truncate">{idea.createdBy?.department || "Member"}</p>
            </div>
          </div>
        </div>
        
        {idea.priority && (
          <div className={`shrink-0 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.4em] border shadow-sm transition-all duration-500 ${
            idea.priority === 'High' ? 'bg-red-500/10 text-red-600 border-red-500/20 group-hover:bg-red-600 group-hover:text-white' :
            idea.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white' :
            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white'
          }`}>
            {idea.priority}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="cursor-pointer space-y-4 mb-8 relative z-10" onClick={() => onOpen(idea)}>
        <div className="space-y-2">
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#D4AF37] opacity-60">Idea Concept</p>
           <h3 className="text-2xl md:text-3xl font-black text-[#0B1220] tracking-tight group-hover:translate-x-1 transition-transform duration-500 leading-[1.1]">
            {idea.title}
          </h3>
        </div>
        <p className="text-[#1F2937]/50 text-sm line-clamp-3 leading-relaxed font-bold italic">
          "{idea.description}"
        </p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 mb-10 relative z-10">
        <span className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#F8F5EF] rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1220] border border-[#0B1220]/5 transition-all duration-500 hover:bg-[#0B1220] hover:text-white">
          <Tag size={14} className="text-[#D4AF37]" /> {idea.category || 'CONCEPT'}
        </span>
        <span className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#F8F5EF] rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1220] border border-[#0B1220]/5 transition-all duration-500 hover:bg-[#0B1220] hover:text-white">
          <Calendar size={14} className="text-[#D4AF37]" /> {new Date(idea.createdAt || idea.submittedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-8 border-t border-[#0B1220]/5 mt-auto relative z-10">
        <button
          onClick={() => onVote(idea._id)}
          disabled={hasVoted}
          className={`group/vote relative flex items-center gap-4 px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.4em] transition-all duration-500 shadow-xl ${
            hasVoted
              ? 'bg-[#0B1220] text-white cursor-default shadow-inner border border-white/10'
              : 'bg-[#D4AF37] text-[#0B1220] hover:bg-[#0B1220] hover:text-white shadow-[#D4AF37]/30 hover:shadow-[#0B1220]/40 active:scale-95'
          }`}
        >
          <div className="flex items-center gap-3">
             <Vote size={18} className={!hasVoted ? "group-hover/vote:rotate-12 transition-transform duration-300" : ""} />
             {hasVoted ? 'Validated' : 'Vote'}
          </div>
          <span className={`ml-4 border-l pl-5 font-black text-lg tracking-tighter ${hasVoted ? 'border-white/20' : 'border-[#0B1220]/20'}`}>
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