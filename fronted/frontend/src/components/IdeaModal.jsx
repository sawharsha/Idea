import { X, Vote, Calendar, Tag, FileText, Lightbulb, User, ExternalLink, Sparkles, ChevronRight, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function IdeaModal({ idea, onClose, onVote }) {
  const { userInfo } = useAuth();
  
  if (!idea) return null;

  const currentUserId = userInfo?.user?.id || userInfo?.user?._id;
  const hasVoted = (idea.likes || idea.votes || []).includes(currentUserId);

  const getVoteCount = () => {
    if (Array.isArray(idea.votes)) return idea.votes.length;
    if (Array.isArray(idea.likes)) return idea.likes.length;
    return idea.votes || idea.likes || idea.likesCount || idea.voteCount || 0;
  };

  const handleViewFile = (idea) => {
    if (!idea?._id) {
      alert("Invalid idea file.");
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.open(`${apiUrl}/ideas/${idea._id}/file`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6 bg-[#0B1220]/80 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white max-w-5xl w-full mx-auto max-h-[90vh] overflow-hidden rounded-2xl border border-[#D4AF37]/20 shadow-2xl animate-scale-in flex flex-col relative group"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 md:px-8 py-5 border-b border-[#0B1220]/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-[#F8F5EF] text-[#D4AF37] border border-[#D4AF37]/20 flex items-center justify-center shadow-md transition-transform group-hover:rotate-12 duration-500">
              <Sparkles size={20} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">Project Insights</p>
              <h2 className="text-xl font-bold tracking-tight text-[#0B1220]">Idea Details</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center hover:bg-[#F8F5EF] rounded-full transition-all text-[#1F2937]/20 hover:text-[#0B1220] active:scale-90 border border-transparent hover:border-[#0B1220]/5 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
            
            {/* Primary Details */}
            <div className="space-y-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F8F5EF] text-[#D4AF37] border border-[#D4AF37]/20">
                  <Tag size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{idea.category || 'CONCEPT'}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-[#0B1220] leading-tight tracking-tight italic">
                  {idea.title}
                </h1>
                <div className="h-1.5 w-16 bg-[#D4AF37] rounded-full" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <FileText size={16} />
                  <h4 className="text-[10px] font-bold uppercase tracking-wider">Project Description</h4>
                </div>
                <div className="rounded-xl bg-[#F8F5EF]/60 border border-[#0B1220]/5 p-6 md:p-8 shadow-inner">
                  <p className="text-[#1F2937]/70 text-base md:text-lg font-medium italic leading-relaxed whitespace-pre-wrap">
                    "{idea.description}"
                  </p>
                </div>
              </div>

              {/* Assets Section */}
              {idea.fileUrl && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Sparkles size={16} />
                    <h4 className="text-[10px] font-bold uppercase tracking-wider">Attached Assets</h4>
                  </div>
                  <button 
                    onClick={() => handleViewFile(idea)}
                    className="w-full sm:w-auto h-14 flex items-center justify-center gap-4 px-8 rounded-lg bg-[#0B1220] text-white font-bold uppercase tracking-wider text-[10px] shadow-lg transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#0B1220] active:scale-95 group/btn"
                  >
                    <ExternalLink size={18} className="group-hover/btn:rotate-12 transition-transform" />
                    View Attached Files
                  </button>
                </div>
              )}
            </div>

            {/* Submitter & Statistics Panel */}
            <div className="space-y-6 lg:sticky lg:top-0">
              {/* Profile Integration */}
              <div className="bg-[#F8F5EF] rounded-xl border border-[#0B1220]/5 p-6 space-y-6 shadow-inner relative overflow-hidden group/analyst">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <User size={16} />
                    <h4 className="text-[9px] font-bold uppercase tracking-wider">Submitted By</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-[#D4AF37]/10 blur-lg rounded-full" />
                      <img 
                        src={idea.createdBy?.photoUrl || `https://ui-avatars.com/api/?background=FFFFFF&color=0B1220&size=256&name=${encodeURIComponent(idea.createdBy?.name || "User")}`} 
                        className="relative h-14 w-14 rounded-xl object-cover border-2 border-white shadow-lg transition-transform duration-500 group-hover/analyst:rotate-3"
                        alt=""
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#0B1220] text-lg tracking-tight truncate">{idea.createdBy?.name || "Anonymous"}</p>
                      <p className="text-[10px] font-medium text-[#1F2937]/40 uppercase tracking-wider mt-0.5 italic">{idea.createdBy?.department || "Team Member"}</p>
                    </div>
                  </div>
                </div>
 
                <div className="pt-6 border-t border-[#0B1220]/5 space-y-4">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Calendar size={16} />
                    <h4 className="text-[9px] font-bold uppercase tracking-wider">Submission Date</h4>
                  </div>
                  <p className="font-bold text-[#0B1220] text-sm tracking-tight italic">
                    {new Date(idea.createdAt || idea.submittedAt).toLocaleDateString(undefined, { dateStyle: 'full' })}
                  </p>
                </div>
              </div>

              {/* Engagement Analytics */}
              <div className="bg-white rounded-xl p-8 border border-[#D4AF37]/20 shadow-md space-y-6 text-center relative overflow-hidden group/votes">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2">
                   <div className="h-12 w-12 bg-[#F8F5EF] rounded-xl flex items-center justify-center text-[#D4AF37] mx-auto border border-[#D4AF37]/10 shadow-inner group-hover/votes:scale-110 transition-transform">
                    <BarChart3 size={24} />
                  </div>
                  <p className="text-5xl font-bold text-[#0B1220] tracking-tight">
                    {getVoteCount()}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">Community Votes</p>
                </div>
                
                <button
                  onClick={() => onVote(idea._id)}
                  disabled={hasVoted}
                  className={`w-full h-14 flex items-center justify-center gap-3 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-md ${
                    hasVoted 
                    ? 'bg-[#0B1220] text-white cursor-default' 
                    : 'bg-[#D4AF37] text-[#0B1220] hover:bg-[#0B1220] hover:text-white'
                  }`}
                >
                  <Vote size={20} className={!hasVoted ? "animate-pulse" : ""} />
                  {hasVoted ? "Voted" : "Vote Now"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-[#F8F5EF]/30 px-6 py-5 border-t border-[#0B1220]/5 flex items-center justify-between">
           <div className="hidden sm:flex items-center gap-3 text-[9px] font-bold uppercase tracking-wider text-[#1F2937]/30 italic">
              <Sparkles size={14} className="text-[#D4AF37]" /> SIVION Innovation Hub
           </div>
           <button 
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#0B1220] bg-white border border-[#0B1220]/10 hover:bg-[#0B1220] hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}
