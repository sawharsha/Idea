import { useEffect, useState, useMemo } from "react";
import { Search, Lightbulb, Filter, X, History, TrendingUp, Trophy, Calendar, Sparkles, Edit, Vote as VoteIcon } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import IdeaModal from "../components/IdeaModal";
import { useAuth } from "../context/AuthContext";

// --- Helpers ---

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

    const label = `${start.toLocaleString("default", { month: "long" })} ${start.getFullYear()} Cycle ${cycles.length % 2 === 0 ? "2" : "1"}`;

    cycles.push({
      label,
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

const getVoteCount = (idea) => {
  if (Array.isArray(idea.votes)) return idea.votes.length;
  if (Array.isArray(idea.likes)) return idea.likes.length;
  return idea.votes || idea.likes || idea.voteCount || 0;
};

const getIdeaDate = (idea) => idea?.createdAt || idea?.submittedAt;

const isIdeaInCycle = (idea, cycle) => {
  if (!idea || !cycle) return false;
  const date = new Date(getIdeaDate(idea));
  if (Number.isNaN(date.getTime())) return false;
  return date >= new Date(cycle.submissionStart) && date <= new Date(cycle.votingEnd);
};

const getVisibleCycles = (ideaList, date = new Date()) => {
  const now = new Date(date);
  const latestIdeaDate = ideaList.reduce((latest, idea) => {
    const ideaDate = new Date(getIdeaDate(idea));
    return !Number.isNaN(ideaDate.getTime()) && ideaDate > latest ? ideaDate : latest;
  }, now);

  return buildCycles(latestIdeaDate)
    .filter((cycle) => {
      const hasIdeas = ideaList.some((idea) => isIdeaInCycle(idea, cycle));
      return new Date(cycle.submissionStart) <= now || hasIdeas;
    })
    .sort((a, b) => new Date(b.submissionStart) - new Date(a.submissionStart));
};

const findCycleForIdea = (idea) => {
  const date = new Date(getIdeaDate(idea));
  if (Number.isNaN(date.getTime())) return null;
  return buildCycles(date).find((cycle) => isIdeaInCycle(idea, cycle)) || null;
};

const findCurrentCycle = () => {
  const now = new Date();
  return buildCycles(now).find(
    (cycle) => now >= new Date(cycle.submissionStart) && now <= new Date(cycle.votingEnd)
  ) || null;
};

const canVote = (idea) => {
  const cycle = findCycleForIdea(idea);
  if (!cycle) return false;
  const now = new Date();
  return now >= cycle.votingStart && now <= cycle.votingEnd;
};

const canEdit = (idea) => {
  const cycle = findCycleForIdea(idea);
  if (!cycle) return false;
  return new Date() <= cycle.submissionClose;
};

// --- Component ---

export default function IdeasPage() {
  const { userInfo } = useAuth();
  const currentUser = userInfo?.user;

  const [ideas, setIdeas] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("top");

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/ideas");
      const fetchedIdeas = Array.isArray(data.data) 
        ? data.data 
        : (data.data?.ideas || data.ideas || []);
      setIdeas(fetchedIdeas);
      setCycles(generateCycles(fetchedIdeas));
    } catch (error) {
      console.error("Fetch ideas error:", error);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCycles = (ideaList) => {
    const currentCycle = findCurrentCycle();
    const visibleCycles = getVisibleCycles(ideaList);

    const options = visibleCycles
      .map(range => ({
        label: range.label,
        value: JSON.stringify({
          label: range.label,
          submissionStart: range.submissionStart,
          submissionClose: range.submissionClose,
          votingStart: range.votingStart,
          votingEnd: range.votingEnd,
          winnerAnnounceDate: range.winnerAnnounceDate,
        })
      }));

    const currentOption = options.find((option) => option.label === currentCycle?.label);
    setSelectedCycle(currentOption?.value || options[0]?.value || "");

    return options;
  };

  const handleVote = async (id) => {
    try {
      await api.post(`/ideas/${id}/like`);
      fetchIdeas();
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  const handleClear = () => {
    setSearch("");
    setSelectedCategory("all");
    const currentOption = cycles.find((cycle) => cycle.label === findCurrentCycle()?.label);
    setSelectedCycle(currentOption?.value || cycles[0]?.value || "");
    setShowSuggestions(false);
  };

  const isMyIdea = (idea) => {
    const ownerId = idea.user?._id || idea.userId || idea.createdBy?._id || idea.createdBy;
    const currentUserId = currentUser?.id || currentUser?._id;
    return ownerId?.toString() === currentUserId?.toString();
  };

  const matchesCategory = (idea) => {
    return (
      selectedCategory === "all" ||
      idea.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  };

  const suggestions = useMemo(() => {
    if (!search || search.length < 2) return [];
    const lowerSearch = search.toLowerCase();
    const set = new Set();
    ideas.forEach(idea => {
      if (idea.title?.toLowerCase().includes(lowerSearch)) set.add(idea.title);
      if (idea.category?.toLowerCase().includes(lowerSearch)) set.add(idea.category);
    });
    return Array.from(set).slice(0, 5);
  }, [search, ideas]);

  // Logic partitions
  const currentCycle = findCurrentCycle();
  const selectedCycleObj = useMemo(() => {
    if (!selectedCycle || selectedCycle === "all") return currentCycle;

    try {
      return JSON.parse(selectedCycle);
    } catch {
      return currentCycle;
    }
  }, [selectedCycle, currentCycle]);

  const allIdeasFeed = useMemo(() => {
    return ideas.filter(idea => {
      const categoryMatch = matchesCategory(idea);
      const cycleMatch = !selectedCycleObj || isIdeaInCycle(idea, selectedCycleObj);
      const searchMatch = !search || 
        idea.title?.toLowerCase().includes(search.toLowerCase()) || 
        idea.description?.toLowerCase().includes(search.toLowerCase()) ||
        idea.category?.toLowerCase().includes(search.toLowerCase()) ||
        idea.createdBy?.name?.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && cycleMatch && searchMatch;
    });
  }, [ideas, selectedCycleObj, selectedCategory, search]);

  const topRatedIdeas = useMemo(() => {
    return [...ideas]
      .sort((a, b) => getVoteCount(b) - getVoteCount(a))
      .slice(0, 3);
  }, [ideas]);

  const trendingIdeas = useMemo(() => {
    return currentCycle
      ? ideas
          .filter((idea) => isIdeaInCycle(idea, currentCycle))
          .sort((a, b) => getVoteCount(b) - getVoteCount(a))
          .slice(0, 3)
      : [];
  }, [ideas, currentCycle]);

  const categories = ["all", "Software", "Hardware"];

  const renderIdeaRow = (idea, rank = null, compact = false) => {
    const voteStatus = canVote(idea);
    const editStatus = isMyIdea(idea) && canEdit(idea);
    const currentUserId = currentUser?.id || currentUser?._id;
    const hasVoted = (idea.likes || idea.votes || []).includes(currentUserId);
    if (compact) {
      return (
        <div key={idea._id} className="p-3 rounded-xl bg-[#F8F5EF]/50 border border-[#0B1220]/5 hover:bg-white transition-all group cursor-pointer" onClick={() => setSelectedIdea(idea)}>
          <div className="flex items-start gap-3">
            {rank && <span className="text-base font-bold text-[#D4AF37] italic">#{rank}</span>}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-[#0B1220] truncate group-hover:text-[#D4AF37] transition-colors">{idea.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[7px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/5 px-2 py-0.5 rounded-md">{idea.category}</span>
                <span className="text-[7px] font-bold uppercase tracking-wider text-[#1F2937]/30">• {getVoteCount(idea)} Votes</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={idea._id} className="rounded-2xl md:rounded-3xl bg-white/95 border border-[#0B1220]/10 shadow-sm p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all duration-300 hover:shadow-md group animate-fade-up">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="shrink-0 h-12 w-12 rounded-lg bg-[#F8F5EF] border border-[#D4AF37]/20 overflow-hidden relative shadow-sm">
            <img 
              src={idea.createdBy?.photoUrl || `https://ui-avatars.com/api/?background=F8F5EF&color=D4AF37&name=${encodeURIComponent(idea.createdBy?.name || "User")}`} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt=""
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-0.5 rounded-md">{idea.category}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#1F2937]/30 flex items-center gap-1.5">
                <Calendar size={10} /> {new Date(getIdeaDate(idea)).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#0B1220] truncate cursor-pointer hover:text-[#D4AF37] transition-colors" onClick={() => setSelectedIdea(idea)}>{idea.title}</h3>
            <p className="text-[#1F2937]/60 text-xs line-clamp-1 font-medium mt-1 italic leading-relaxed">"{idea.description}"</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#1F2937]/40">
                <div className="h-1.5 w-1.5 bg-[#D4AF37] rounded-full" /> {idea.createdBy?.name || "Anonymous User"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#0B1220]/5">
          <div className="text-right mr-2">
            <p className="text-[8px] font-bold uppercase tracking-wider text-[#1F2937]/30 mb-0.5">Votes</p>
            <p className="text-xl font-bold text-[#0B1220] tracking-tight">{getVoteCount(idea)}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {editStatus && (
              <button onClick={(e) => { e.stopPropagation(); console.log("Edit idea", idea._id); }} className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#0B1220]/5 text-[#0B1220] hover:bg-[#0B1220] hover:text-white transition-all border border-[#0B1220]/10 shadow-sm active:scale-95">
                <Edit size={16} />
              </button>
            )}
            
            <button
              onClick={() => handleVote(idea._id)}
              disabled={!voteStatus || hasVoted}
              className={`h-10 px-6 rounded-lg flex flex-col items-center justify-center transition-all min-w-[110px] shadow-sm ${
                hasVoted ? "bg-[#0B1220] text-white cursor-default" : 
                voteStatus ? "bg-[#D4AF37] text-[#0B1220] hover:bg-[#0B1220] hover:text-white active:scale-95" : 
                "bg-[#F8F5EF] text-[#1F2937]/20 border border-[#0B1220]/10 cursor-not-allowed shadow-none"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider">
                <VoteIcon size={14} className={(!hasVoted && voteStatus) ? "animate-pulse" : ""} />
                {hasVoted ? "Voted" : voteStatus ? "Vote" : "Locked"}
              </div>
              {!voteStatus && !hasVoted && (
                <span className="text-[7px] font-bold uppercase tracking-wider opacity-60 mt-0.5">
                  {new Date() < findCycleForIdea(idea)?.votingStart ? "Opening Soon" : "Cycle Closed"}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F5EF] font-sans tracking-tight text-[#1F2937] overflow-x-hidden selection:bg-[#D4AF37]/20 selection:text-[#0B1220]">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 animate-fade-in">
        
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 md:gap-8 rounded-[2rem] bg-[#0B1220] border border-[#D4AF37]/20 shadow-lg p-6 md:p-8 min-h-[280px] md:min-h-[340px] overflow-hidden relative group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.1),transparent_40%)] pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                <Sparkles size={14} /> Global Idea Stream
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight italic">Explore <span className="text-[#D4AF37] not-italic">Ideas.</span></h1>
              <div className="h-1 w-12 bg-[#D4AF37] rounded-full mt-4" />
            </div>
            <p className="max-w-xl text-base sm:text-lg text-white/60 font-medium leading-relaxed italic">Discover and vote on community ideas across every cycle.</p>
          </div>
          <div className="relative h-auto max-h-[280px] md:max-h-[340px] overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-[#111827] shadow-xl group/hero">
            <img src="/assests/ideapage.png" alt="" className="w-full h-auto max-h-[280px] md:max-h-[340px] object-cover object-center opacity-95 transition-transform duration-[2000ms] group-hover/hero:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220]/70 via-transparent to-[#D4AF37]/15 pointer-events-none" />
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bg-white/95 rounded-xl border border-[#0B1220]/10 shadow-lg p-3 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 relative z-40 items-center animate-fade-up">
          <div className="relative group h-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] transition-transform duration-300" size={18} />
            <input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full h-full pl-12 pr-6 bg-[#F8F5EF]/70 border border-transparent rounded-lg outline-none text-xs font-bold text-[#0B1220] placeholder:text-[#1F2937]/20 focus:border-[#D4AF37]/30 focus:ring-4 focus:ring-[#D4AF37]/10 transition-all duration-300"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl rounded-lg shadow-xl border border-[#0B1220]/10 z-50 overflow-hidden animate-scale-in">
                {suggestions.map((s, i) => (
                  <button key={i} className="w-full text-left px-6 py-3 hover:bg-[#F8F5EF] text-[10px] font-bold uppercase tracking-wider text-[#0B1220] transition-colors border-b border-[#0B1220]/5 last:border-none" onClick={() => { setSearch(s); setShowSuggestions(false); }}>{s}</button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 px-4 bg-[#F8F5EF]/70 rounded-lg border border-[#0B1220]/5 h-12 group transition-all duration-300 focus-within:border-[#D4AF37]/30 focus-within:bg-white">
            <Filter size={16} className="text-[#D4AF37] group-hover:rotate-6 transition-transform" />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-transparent text-[10px] font-bold uppercase tracking-wider text-[#0B1220] outline-none cursor-pointer h-full">
              {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 px-4 bg-[#F8F5EF]/70 rounded-lg border border-[#0B1220]/5 h-12 group transition-all duration-300 focus-within:border-[#D4AF37]/30 focus-within:bg-white">
            <History size={16} className="text-[#D4AF37] group-hover:rotate-6 transition-transform" />
            <select value={selectedCycle} onChange={(e) => setSelectedCycle(e.target.value)} className="w-full bg-transparent text-[10px] font-bold uppercase tracking-wider text-[#0B1220] outline-none cursor-pointer h-full">
              {cycles.map((c, i) => <option key={i} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <button onClick={handleClear} className="h-12 w-12 flex items-center justify-center bg-white text-[#1F2937]/30 rounded-lg border border-[#0B1220]/5 hover:text-[#0B1220] hover:border-[#D4AF37]/40 transition-all duration-300 active:scale-95 shadow-sm"><X size={20} /></button>
        </section>
 
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-12 items-start">
          
          {/* Feed */}
          <div className="min-w-0 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-white rounded-xl shadow-md border border-[#D4AF37]/20 text-[#D4AF37]"><Calendar size={18} /></div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold tracking-tight text-[#0B1220]">Idea Feed</h2>
                <div className="h-1 w-8 bg-[#D4AF37] rounded-full" />
              </div>
            </div>

            {loading ? (
              <div className="space-y-8 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-44 bg-white rounded-[2.5rem] border border-[#0B1220]/10" />)}
              </div>
            ) : (
              <div className="space-y-8">
                {allIdeasFeed.length > 0 ? (
                  allIdeasFeed.map(idea => renderIdeaRow(idea))
                ) : (
                  <div className="min-h-[300px] bg-white rounded-[3rem] border-2 border-dashed border-[#D4AF37]/20 py-20 px-10 text-center flex flex-col items-center justify-center shadow-inner group transition-all duration-700 hover:border-[#D4AF37]/40">
                    <div className="h-20 w-20 bg-[#F8F5EF] rounded-full flex items-center justify-center text-[#D4AF37]/20 mb-8 group-hover:scale-110 transition-transform duration-500">
                      <Lightbulb size={48} />
                    </div>
                    <h3 className="text-[12px] font-black text-[#1F2937]/30 uppercase tracking-[0.5em] italic">No ideas found</h3>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full xl:sticky xl:top-24 space-y-8 animate-fade-up">
            {/* Tabs Toggle */}
            <div className="flex items-center gap-2 rounded-xl bg-white/95 border border-[#0B1220]/10 shadow-lg p-2 h-14">
              <button
                onClick={() => setActiveTab("top")}
                className={`flex-1 h-full rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "top" ? "bg-[#0B1220] text-white shadow-md" : "text-[#0B1220] hover:bg-[#0B1220]/5"
                }`}
              >
                Global Top
              </button>
              <button
                onClick={() => setActiveTab("trending")}
                className={`flex-1 h-full rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "trending" ? "bg-[#0B1220] text-white shadow-md" : "text-[#0B1220] hover:bg-[#0B1220]/5"
                }`}
              >
                Trending
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="rounded-xl bg-white/95 border border-[#0B1220]/10 shadow-lg p-5 space-y-6 animate-fade-in">
              <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {activeTab === "top" && (
                  <>
                    <div className="flex items-center justify-between px-2 mb-4">
                      <div className="space-y-0.5">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">Top Rated</h3>
                        <div className="h-0.5 w-6 bg-[#D4AF37] rounded-full" />
                      </div>
                      <Trophy size={16} className="text-[#D4AF37]" />
                    </div>
                    <div className="space-y-4">
                      {topRatedIdeas.length > 0 ? (
                        topRatedIdeas.map((idea, i) => renderIdeaRow(idea, i + 1, true))
                      ) : (
                        <div className="min-h-[220px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#D4AF37]/10 rounded-[2rem] bg-[#F8F5EF]/30">
                          <Trophy size={32} className="text-[#1F2937]/10 mb-4" />
                          <p className="text-[10px] font-black text-[#1F2937]/30 uppercase tracking-[0.4em] leading-relaxed italic">Loading ideas...</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {activeTab === "trending" && (
                  <>
                    <div className="flex items-center justify-between px-4 mb-6">
                      <div className="space-y-1">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Trending Now</h3>
                        <div className="h-1 w-8 bg-[#D4AF37] rounded-full" />
                      </div>
                      <TrendingUp size={20} className="text-[#D4AF37] animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      {trendingIdeas.length > 0 ? (
                        trendingIdeas.map((idea, i) => renderIdeaRow(idea, i + 1, true))
                      ) : (
                        <div className="min-h-[220px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#D4AF37]/10 rounded-[2rem] bg-[#F8F5EF]/30">
                          <TrendingUp size={32} className="text-[#1F2937]/10 mb-4" />
                          <p className="text-[10px] font-black text-[#1F2937]/30 uppercase tracking-[0.4em] leading-relaxed italic">Awaiting momentum...</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <IdeaModal idea={selectedIdea} onClose={() => setSelectedIdea(null)} onVote={handleVote} />
    </div>
  );
}
