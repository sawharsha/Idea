import { useEffect, useMemo, useState } from "react";
import { Trophy, History, Crown, Calendar, Sparkles, Vote, ChevronRight, ArrowLeft } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import winnersHero from "../assets/winners-hero.png";

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

const canShowWinner = (cycle) => {
  return new Date() >= new Date(cycle.winnerAnnounceDate);
};

const getVoteCount = (idea) => {
  if (Array.isArray(idea?.votes)) return idea.votes.length;
  if (Array.isArray(idea?.likes)) return idea.likes.length;
  return idea?.votes || idea?.likes || idea?.voteCount || idea?.likesCount || 0;
};

const isDateInCycle = (date, cycle) => {
  if (!date || !cycle) return false;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  return d >= new Date(cycle.submissionStart) && d <= new Date(cycle.votingEnd);
};

const isIdeaInCycle = (idea, cycle) => {
  const ideaDate = idea?.createdAt || idea?.submittedAt;
  return isDateInCycle(ideaDate, cycle);
};

const getVisibleCycles = (ideaList, date = new Date()) => {
  const now = new Date(date);
  return buildCycles(now)
    .filter((cycle) => {
      const hasIdeas = ideaList.some((idea) => isIdeaInCycle(idea, cycle));
      return new Date(cycle.submissionStart) <= now || hasIdeas;
    })
    .sort((a, b) => new Date(b.submissionStart) - new Date(a.submissionStart));
};

const findCurrentCycle = () => {
  const now = new Date();
  return buildCycles(now).find(
    (cycle) => now >= new Date(cycle.submissionStart) && now <= new Date(cycle.votingEnd)
  ) || null;
};

const getWinnerForCycle = (cycle, allIdeas) => {
  const cycleIdeas = allIdeas.filter((idea) => isIdeaInCycle(idea, cycle));

  if (!cycleIdeas.length) return null;

  const sorted = [...cycleIdeas].sort(
    (a, b) => getVoteCount(b) - getVoteCount(a)
  );

  return sorted[0];
};

const formatCycleLabel = (cycle) => {
  if (!cycle) return "";
  const start = new Date(cycle.submissionStart);
  const end = new Date(cycle.votingEnd);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
};

const getUser = (idea) => idea?.createdBy || idea?.user || {};

const getUserName = (idea) => getUser(idea)?.name || "Unknown User";

const getUserDepartment = (idea) => getUser(idea)?.department || "Community Member";

const getUserPhoto = (idea) => {
  const user = getUser(idea);
  return user?.photoUrl || `https://ui-avatars.com/api/?background=F8F5EF&color=D4AF37&name=${encodeURIComponent(user?.name || "Winner")}`;
};

export default function WinnersPage() {
  const [weeks, setWeeks] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [selectedCycleValue, setSelectedCycleValue] = useState("");
  const [winnerData, setWinnerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const [weeksRes, ideasRes] = await Promise.all([
        api.get("/winners/weeks"),
        api.get("/ideas", { params: { limit: 1000 } }),
      ]);

      const availableWeeks = weeksRes.data.data || [];
      const fetchedIdeas = Array.isArray(ideasRes.data.data)
        ? ideasRes.data.data
        : ideasRes.data.data?.ideas || ideasRes.data.ideas || [];

      setWeeks(availableWeeks);
      setIdeas(fetchedIdeas);
    } catch (error) {
      console.error("Winners page fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cycles = useMemo(() => {
    const cycleMap = new Map();

    getVisibleCycles(ideas).forEach((cycle) => {
      cycleMap.set(cycle.label, {
        ...cycle,
        weekLabel: cycle.label,
      });
    });

    ideas.forEach((idea) => {
      const ideaDate = new Date(idea.createdAt || idea.submittedAt);
      if (Number.isNaN(ideaDate.getTime())) return;
      const range = buildCycles(ideaDate).find((cycle) => isIdeaInCycle(idea, cycle));
      if (!range) return;
      const key = range.label;
      const existing = cycleMap.get(key);

      cycleMap.set(key, {
        ...range,
        weekLabel: idea.weekLabel || existing?.weekLabel || range.label,
        label: range.label,
      });
    });

    if (!cycleMap.size && weeks.length > 0) {
      const range = getVisibleCycles(ideas)[0];
      if (range) {
        cycleMap.set(range.label, {
          ...range,
          weekLabel: weeks.includes(range.label) ? range.label : weeks[0],
          label: range.label,
        });
      }
    }

    return Array.from(cycleMap.values())
      .sort((a, b) => new Date(b.submissionStart) - new Date(a.submissionStart));
  }, [ideas, weeks]);

  useEffect(() => {
    if (cycles.length > 0 && !cycles.some((cycle) => cycle.label === selectedCycleValue)) {
      const activeCycle = findCurrentCycle();
      const defaultCycle = cycles.find((cycle) => cycle.label === activeCycle?.label) || cycles[0];
      setSelectedCycleValue(defaultCycle.label);
    }
  }, [cycles, selectedCycleValue]);

  const selectedCycle = useMemo(() => {
    return cycles.find((cycle) => cycle.label === selectedCycleValue) || cycles[0] || null;
  }, [cycles, selectedCycleValue]);

  useEffect(() => {
    if (!selectedCycle?.weekLabel) return;
    fetchWinner(selectedCycle.weekLabel);
  }, [selectedCycle?.weekLabel]);

  const fetchWinner = async (week) => {
    try {
      const { data } = await api.get(`/winners/${encodeURIComponent(week)}`);
      setWinnerData(data.data);
    } catch (error) {
      console.error("Winner fetch error:", error);
      setWinnerData(null);
    }
  };

  const cycleIdeas = useMemo(() => {
    if (!selectedCycle) return [];
    return ideas.filter((idea) => isIdeaInCycle(idea, selectedCycle));
  }, [ideas, selectedCycle]);

  const selectedCycleWinner = useMemo(() => {
    if (!selectedCycle) return null;
    return getWinnerForCycle(selectedCycle, ideas);
  }, [ideas, selectedCycle]);

  const winnerResult = useMemo(() => {
    if (!selectedCycle) {
      return { status: "empty", message: "No ideas found for this cycle." };
    }

    if (!selectedCycleWinner) {
      return { status: "empty", message: "No ideas found for this cycle." };
    }

    if (!canShowWinner(selectedCycle)) {
      const now = new Date();
      return {
        status: now > selectedCycle.votingEnd ? "monday" : "pending",
        message: now > selectedCycle.votingEnd
          ? "Winner will be announced on Monday @ 09:00 AM."
          : "Winner will be identified after voting closes.",
      };
    }

    const sortedIdeas = [...cycleIdeas].sort(
      (a, b) => getVoteCount(b) - getVoteCount(a)
    );

    const topVote = getVoteCount(sortedIdeas[0]);
    const tiedIdeas = sortedIdeas.filter(
      (idea) => getVoteCount(idea) === topVote
    );

    const adminSelectedWinner = winnerData?.selectionType === "manual"
      ? winnerData?.winners?.[0]
      : null;

    if (tiedIdeas.length > 1) {
      if (adminSelectedWinner?.idea?._id) {
        const fullIdea =
          cycleIdeas.find((idea) => idea._id === adminSelectedWinner.idea._id) ||
          adminSelectedWinner.idea;

        return {
          status: "winner",
          idea: fullIdea,
          votes: adminSelectedWinner.votes ?? getVoteCount(fullIdea),
          selectionType: "manual",
        };
      }

      return {
        status: "tie",
        message: "Tied result. Review in progress.",
        tiedIdeas,
      };
    }

    return {
      status: "winner",
      idea: selectedCycleWinner,
      votes: topVote,
      selectionType: "auto",
    };
  }, [cycleIdeas, selectedCycle, selectedCycleWinner, winnerData]);

  const previousWinners = useMemo(() => {
    return cycles
      .filter((cycle) => cycle.label !== selectedCycle?.label && canShowWinner(cycle))
      .map((cycle) => {
        const idea = getWinnerForCycle(cycle, ideas);
        return idea
          ? {
              cycle,
              idea,
              votes: getVoteCount(idea),
            }
          : null;
      })
      .filter(Boolean)
      .slice(0, 6);
  }, [cycles, ideas, selectedCycle?.label]);

  return (
    <div className="min-h-screen w-full bg-[#F8F5EF] text-[#1F2937] font-sans tracking-tight overflow-x-hidden selection:bg-[#D4AF37]/20 selection:text-[#0B1220]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-16 animate-fade-in">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 rounded-[3rem] bg-[#0B1220] border border-[#D4AF37]/20 shadow-[0_40px_100px_rgba(11,18,32,0.4)] p-8 md:p-14 overflow-hidden relative group animate-fade-up">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.1),transparent_40%)] pointer-events-none" />
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#D4AF37] flex items-center gap-3 animate-pulse">
                <Sparkles size={16} /> Winners Circle
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[0.9] italic">Weekly <span className="text-[#D4AF37] not-italic">Champions.</span></h1>
              <div className="h-2 w-20 bg-[#D4AF37] rounded-full mt-6" />
            </div>
            <p className="max-w-xl text-lg sm:text-xl text-white/60 font-bold leading-relaxed italic">Celebrating the best ideas. View the winners of every cycle.</p>
          </div>
          <div className="relative h-64 md:h-80 lg:h-[400px] overflow-hidden rounded-[2.5rem] border border-[#D4AF37]/20 bg-[#111827] shadow-2xl group/hero">
            <img src={winnersHero} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-95 transition-transform duration-[2000ms] group-hover/hero:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220]/70 via-transparent to-[#D4AF37]/15 pointer-events-none" />
          </div>
        </section>

        {/* Selection Bar */}
        <section className="bg-white/95 rounded-[2.5rem] border border-[#0B1220]/10 shadow-2xl p-6 md:p-8 animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-[1.5rem] bg-[#F8F5EF] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20 shadow-lg group">
                <History size={28} className="transition-transform group-hover:rotate-12 duration-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-1">
                  Select Cycle
                </p>
                <p className="text-xl font-black text-[#0B1220] tracking-tight">
                  {selectedCycle ? selectedCycle.label : "Loading..."}
                </p>
              </div>
            </div>

            <div className="relative group min-w-[320px]">
              <select
                value={selectedCycleValue}
                onChange={(e) => setSelectedCycleValue(e.target.value)}
                className="w-full rounded-2xl border border-[#0B1220]/10 bg-[#F8F5EF]/70 px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-[#0B1220] outline-none transition-all duration-500 focus:border-[#D4AF37] focus:ring-8 focus:ring-[#D4AF37]/10 focus:bg-white cursor-pointer shadow-sm appearance-none"
              >
                {cycles.map((cycle) => (
                  <option key={cycle.label} value={cycle.label}>
                    {cycle.label} | {formatCycleLabel(cycle)}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#D4AF37]">
                <Calendar size={20} />
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="min-h-[480px] flex items-center justify-center rounded-[3rem] bg-white/80 border border-[#D4AF37]/10 animate-fade-in shadow-inner">
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-full border-4 border-[#D4AF37]/10 border-t-[#D4AF37] animate-spin shadow-2xl" />
              <p className="text-[11px] font-black uppercase tracking-[0.6em] text-[#D4AF37] animate-pulse">Loading Winners Circle...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-20">
            <WinnerResultCard result={winnerResult} selectedCycle={selectedCycle} />

            <section className="space-y-12 animate-fade-up">
              <div className="flex items-center justify-between gap-6 px-4">
                <div className="space-y-2">
                   <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#D4AF37]">Past Winners</p>
                   <h2 className="text-3xl md:text-5xl font-black text-[#0B1220] tracking-tighter">Previous Winners</h2>
                   <div className="h-1.5 w-12 bg-[#D4AF37] rounded-full" />
                </div>
                <Calendar className="text-[#D4AF37]/30" size={48} />
              </div>

              {previousWinners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {previousWinners.map((winner) => (
                    <div key={winner.idea._id} className="group rounded-[2.5rem] bg-white/95 border border-[#0B1220]/10 p-8 flex items-center gap-8 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(11,18,32,0.15)] transition-all duration-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
                      <div className="relative h-20 w-20 shrink-0 rounded-[1.5rem] overflow-hidden border-2 border-[#D4AF37]/20 p-1 bg-[#F8F5EF] shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        <img
                          src={winner.idea?.createdBy?.photoUrl || `https://ui-avatars.com/api/?background=FFFFFF&color=0B1220&size=256&name=${encodeURIComponent(winner.idea?.createdBy?.name || "Winner")}`}
                          className="h-full w-full rounded-[1.25rem] object-cover"
                          alt=""
                        />
                      </div>
                      <div className="min-w-0 flex-1 relative z-10">
                        <p className="text-base font-black text-[#0B1220] truncate group-hover:text-[#D4AF37] transition-colors">
                          {winner.idea?.createdBy?.name || "Unknown User"}
                        </p>
                        <p className="text-[11px] font-bold text-[#1F2937]/40 truncate mt-1 italic leading-relaxed">
                          "{winner.idea?.title || "Winning idea"}"
                        </p>
                        <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-[#D4AF37] text-[#0B1220] text-[10px] font-black shadow-lg">
                          <Vote size={12} /> {winner.votes || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[3rem] border-2 border-dashed border-[#D4AF37]/20 bg-[#F8F5EF]/60 py-32 text-center flex flex-col items-center justify-center shadow-inner group hover:border-[#D4AF37]/40 transition-all duration-700">
                   <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center text-[#D4AF37]/20 shadow-xl mb-8 group-hover:scale-110 transition-transform duration-500">
                    <History size={48} />
                  </div>
                  <p className="text-[#1F2937]/30 font-black uppercase tracking-[0.6em] text-sm italic">No winner history yet...</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function WinnerResultCard({ result, selectedCycle }) {
  if (result.status !== "winner") {
    return (
      <section className="rounded-[3.5rem] bg-white/95 border border-[#D4AF37]/20 shadow-[0_40px_120px_rgba(11,18,32,0.15)] p-10 md:p-20 min-h-[480px] flex flex-col items-center justify-center text-center animate-fade-up relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />
        <div className="relative">
          <div className="absolute -inset-10 bg-[#D4AF37]/10 blur-3xl rounded-full animate-pulse" />
          <div className="relative h-32 w-32 rounded-full bg-[#F8F5EF] text-[#D4AF37]/40 flex items-center justify-center border border-[#D4AF37]/20 mb-10 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
            <Trophy size={64} />
          </div>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-[#0B1220] tracking-tighter leading-tight relative z-10">
          {result.message}
        </h2>
        {result.status === "tie" && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full relative z-10 animate-fade-in">
            {result.tiedIdeas.map((idea) => (
              <div key={idea._id} className="group/tie rounded-[2rem] bg-[#F8F5EF]/80 border border-[#0B1220]/5 p-6 flex items-center gap-6 text-left hover:bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <img src={getUserPhoto(idea)} className="h-16 w-16 rounded-[1.25rem] object-cover border-2 border-[#D4AF37]/20 shadow-lg group-hover/tie:rotate-3 transition-transform" alt="" />
                <div className="min-w-0">
                  <p className="text-base font-black text-[#0B1220] truncate">{getUserName(idea)}</p>
                  <p className="text-[11px] font-bold text-[#1F2937]/45 truncate italic mt-1 leading-relaxed">"{idea.title}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  const idea = result.idea;

  return (
    <section className="rounded-[4rem] bg-white/95 border border-[#D4AF37]/30 shadow-[0_50px_150px_rgba(11,18,32,0.2)] p-8 md:p-16 overflow-hidden relative animate-fade-up group">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0B1220]/5 translate-y-1/2 -translate-x-1/2 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)] gap-16 items-center">
        <div className="relative flex items-center justify-center group/winner">
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/15 blur-3xl animate-pulse" />
          <div className="relative rounded-[3rem] bg-gradient-to-br from-[#D4AF37] via-[#F8F5EF] to-[#0B1220] p-2 shadow-[0_40px_100px_rgba(212,175,55,0.3)] transition-transform duration-700 group-hover/winner:scale-[1.02]">
            <img
              src={getUserPhoto(idea)}
              className="h-72 w-72 md:h-96 md:w-96 rounded-[2.75rem] object-cover border-8 border-white shadow-inner"
              alt=""
            />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-[2rem] bg-[#0B1220] text-[#D4AF37] border-8 border-white h-24 w-24 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 group-hover/winner:scale-125 group-hover/winner:rotate-12">
            <Crown size={48} />
          </div>
        </div>

        <div className="space-y-10 text-center lg:text-left relative z-10">
          <div className="inline-flex items-center gap-3 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-6 py-3 text-[#D4AF37] shadow-xl">
            <Sparkles size={20} className="animate-spin-slow" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">
              {result.selectionType === "manual" ? "Admin Final Winner" : "Weekly Champion"}
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-7xl font-black text-[#0B1220] tracking-tighter leading-[0.9]">
              {getUserName(idea)}
            </h2>
            <div className="flex items-center justify-center lg:justify-start gap-3 text-base font-bold text-[#1F2937]/45 tracking-widest italic uppercase">
               <div className="h-px w-8 bg-[#D4AF37]/40" /> {getUserDepartment(idea)}
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-[#F8F5EF]/80 border border-[#0B1220]/5 p-8 md:p-12 shadow-inner group/idea transition-all duration-500 hover:bg-white hover:shadow-2xl hover:-translate-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-5">
              Winning Idea
            </p>
            <h3 className="text-3xl md:text-4xl font-black text-[#0B1220] tracking-tight group-hover:text-[#D4AF37] transition-colors duration-300">
              {idea?.title || "Untitled Idea"}
            </h3>
            <p className="mt-6 text-base md:text-xl leading-relaxed text-[#1F2937]/65 font-bold italic">
              "{idea?.description || "No description available."}"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div className="rounded-[2.5rem] bg-[#0B1220] text-white p-8 flex items-center gap-6 shadow-[0_20px_50px_rgba(11,18,32,0.3)] transition-all duration-500 hover:-translate-y-2 group/stats">
              <div className="h-16 w-16 rounded-[1.5rem] bg-[#D4AF37] text-[#0B1220] flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover/stats:scale-110 group-hover/stats:rotate-6">
                <Vote size={32} />
              </div>
              <div>
                <p className="text-5xl font-black tracking-tighter leading-none">{result.votes}</p>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 mt-2">Votes</p>
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-[#F8F5EF] border border-[#0B1220]/10 p-8 flex items-center gap-6 shadow-xl transition-all duration-500 hover:-translate-y-2 group/cycle">
              <div className="h-16 w-16 rounded-[1.5rem] bg-white text-[#D4AF37] flex items-center justify-center border-2 border-[#D4AF37]/20 shadow-lg transition-transform duration-500 group-hover/cycle:scale-110 group-hover/cycle:rotate-6">
                <Calendar size={32} />
              </div>
              <div>
                <p className="text-base font-black text-[#0B1220] tracking-tight">{formatCycleLabel(selectedCycle)}</p>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1F2937]/35 mt-2">Winning Cycle</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
