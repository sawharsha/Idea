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
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#0B1220]/80 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white max-w-6xl w-full mx-auto max-h-[90vh] overflow-hidden rounded-[3.5rem] border border-[#D4AF37]/20 shadow-[0_40px_120px_rgba(0,0,0,0.4)] animate-scale-in flex flex-col relative group"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-8 md:px-12 py-8 border-b border-[#0B1220]/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-[#F8F5EF] text-[#D4AF37] border border-[#D4AF37]/20 flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 duration-500">
              <Sparkles size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Project Insights</p>
              <h2 className="text-2xl font-black tracking-tighter text-[#0B1220]">Idea Details</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-14 w-14 flex items-center justify-center hover:bg-[#F8F5EF] rounded-full transition-all text-[#1F2937]/20 hover:text-[#0B1220] active:scale-90 border border-transparent hover:border-[#0B1220]/5 shadow-sm"
          >
            <X size={28} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-16 items-start">
            
            {/* Primary Details */}
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#F8F5EF] text-[#D4AF37] border border-[#D4AF37]/20">
                  <Tag size={16} />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">{idea.category || 'CONCEPT'}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-[#0B1220] leading-[0.9] tracking-tighter italic">
                  {idea.title}
                </h1>
                <div className="h-2 w-20 bg-[#D4AF37] rounded-full" />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#D4AF37]">
                  <FileText size={20} />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em]">Project Description</h4>
                </div>
                <div className="rounded-[2.5rem] bg-[#F8F5EF]/60 border border-[#0B1220]/5 p-8 md:p-10 shadow-inner">
                  <p className="text-[#1F2937]/70 text-lg md:text-xl font-bold italic leading-relaxed whitespace-pre-wrap">
                    "{idea.description}"
                  </p>
                </div>
              </div>

              {/* Assets Section */}
              {idea.fileUrl && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-[#D4AF37]">
                    <Sparkles size={20} />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em]">Attached Assets</h4>
                  </div>
                  <button 
                    onClick={() => handleViewFile(idea)}
                    className="w-full sm:w-auto h-20 flex items-center justify-center gap-6 px-12 rounded-[2rem] bg-[#0B1220] text-white font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl transition-all duration-500 hover:bg-[#D4AF37] hover:text-[#0B1220] hover:-translate-y-1 active:scale-95 group/btn"
                  >
                    <ExternalLink size={24} className="group-hover/btn:rotate-12 transition-transform" />
                    View Attached Files
                  </button>
                </div>
              )}
            </div>

            {/* Submitter & Statistics Panel */}
            <div className="space-y-8 lg:sticky lg:top-0">
              {/* Profile Integration */}
              <div className="bg-[#F8F5EF] rounded-[2.5rem] border border-[#0B1220]/5 p-8 space-y-8 shadow-inner relative overflow-hidden group/analyst">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-[#D4AF37]">
                    <User size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em]">Submitted By</h4>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-[#D4AF37]/10 blur-xl rounded-full" />
                      <img 
                        src={idea.createdBy?.photoUrl || `https://ui-avatars.com/api/?background=FFFFFF&color=0B1220&size=256&name=${encodeURIComponent(idea.createdBy?.name || "User")}`} 
                        className="relative h-20 w-20 rounded-[1.5rem] object-cover border-4 border-white shadow-2xl transition-transform duration-500 group-hover/analyst:rotate-3"
                        alt=""
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[#0B1220] text-2xl tracking-tighter truncate">{idea.createdBy?.name || "Anonymous"}</p>
                      <p className="text-[11px] font-bold text-[#1F2937]/40 uppercase tracking-widest mt-1 italic">{idea.createdBy?.department || "Team Member"}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-[#0B1220]/5 space-y-6">
                  <div className="flex items-center gap-3 text-[#D4AF37]">
                    <Calendar size={18} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em]">Submission Date</h4>
                  </div>
                  <p className="font-black text-[#0B1220] text-base tracking-tight italic">
                    {new Date(idea.createdAt || idea.submittedAt).toLocaleDateString(undefined, { dateStyle: 'full' })}
                  </p>
                </div>
              </div>

              {/* Engagement Analytics */}
              <div className="bg-white rounded-[2.5rem] p-10 border border-[#D4AF37]/20 shadow-[0_30px_80px_rgba(11,18,32,0.1)] space-y-10 text-center relative overflow-hidden group/votes">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-3">
                   <div className="h-16 w-16 bg-[#F8F5EF] rounded-2xl flex items-center justify-center text-[#D4AF37] mx-auto border border-[#D4AF37]/10 shadow-inner group-hover/votes:scale-110 transition-transform duration-500">
                    <BarChart3 size={32} />
                  </div>
                  <p className="text-6xl font-black text-[#0B1220] tracking-tighter">
                    {getVoteCount()}
                  </p>
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#D4AF37] animate-pulse">Community Votes</p>
                </div>
                
                <button
                  onClick={() => onVote(idea._id)}
                  disabled={hasVoted}
                  className={`w-full h-20 flex items-center justify-center gap-4 rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all duration-500 active:scale-95 shadow-2xl ${
                    hasVoted 
                    ? 'bg-[#0B1220] text-white cursor-default shadow-inner' 
                    : 'bg-[#D4AF37] text-[#0B1220] hover:bg-[#0B1220] hover:text-white shadow-[#D4AF37]/30 hover:shadow-[#0B1220]/40'
                  }`}
                >
                  <Vote size={24} className={!hasVoted ? "animate-pulse" : ""} />
                  {hasVoted ? "Voted" : "Vote Now"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-[#F8F5EF]/30 px-10 py-8 border-t border-[#0B1220]/5 flex items-center justify-between">
           <div className="hidden sm:flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#1F2937]/30 italic">
              <Sparkles size={16} className="text-[#D4AF37]" /> SIVION Innovation Hub
           </div>
           <button 
            onClick={onClose}
            className="w-full sm:w-auto px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] text-[#0B1220] bg-white border border-[#0B1220]/10 hover:bg-[#0B1220] hover:text-white hover:border-[#0B1220] transition-all duration-500 active:scale-95 shadow-xl"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}
