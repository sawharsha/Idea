import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Lightbulb, Vote, TrendingUp, Calendar, ChevronRight, Sparkles } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

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
  if (Array.isArray(idea?.votes)) return idea.votes.length;
  if (Array.isArray(idea?.likes)) return idea.likes.length;
  return idea?.votes || idea?.likes || idea?.voteCount || idea?.likesCount || 0;
};

const isIdeaInCycle = (idea, cycle) => {
  const ideaDate = new Date(idea?.createdAt || idea?.submittedAt);
  if (Number.isNaN(ideaDate.getTime())) return false;
  return ideaDate >= new Date(cycle.submissionStart) && ideaDate <= new Date(cycle.votingEnd);
};

const getUserPhoto = (idea) => {
  const user = idea?.createdBy || idea?.user || {};
  return user?.photoUrl || `https://ui-avatars.com/api/?background=FFFFFF&color=0B1220&size=256&name=${encodeURIComponent(user?.name || "Winner")}`;
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalIdeas: 0, totalVotes: 0, ideasThisWeek: 0 });
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ideasRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/ideas", { params: { limit: 1000 } }),
      ]);
      setStats(statsRes.data.data || {});

      const allIdeas = Array.isArray(ideasRes.data.data)
        ? ideasRes.data.data
        : ideasRes.data.data?.ideas || ideasRes.data.ideas || [];

      const now = new Date();
      const cycles = buildCycles(now).sort((a, b) => b.submissionStart - a.submissionStart);
      
      const latestCycle = cycles.find(c => now >= c.submissionStart);
      let targetCycle = null;
      let status = "winner";
      let message = "";

      if (latestCycle) {
        if (now >= latestCycle.winnerAnnounceDate) {
          targetCycle = latestCycle;
        } else if (now > latestCycle.votingEnd) {
          status = "pending";
          message = "Winner will be announced on Monday.";
        } else {
          targetCycle = cycles.find(c => now >= c.winnerAnnounceDate);
          if (!targetCycle) {
            status = "empty";
            message = "No winner yet.";
          }
        }
      } else {
        status = "empty";
        message = "No winner yet.";
      }

      if (targetCycle) {
        const winRes = await api.get(`/winners/${encodeURIComponent(targetCycle.label)}`);
        const winnerData = winRes.data.data;
        const cycleIdeas = allIdeas.filter(idea => isIdeaInCycle(idea, targetCycle));
        
        if (cycleIdeas.length === 0) {
          setWinner({ status: "empty", message: "No winner yet.", cycle: targetCycle });
        } else {
          const sorted = [...cycleIdeas].sort((a, b) => getVoteCount(b) - getVoteCount(a));
          const topVote = getVoteCount(sorted[0]);
          const tiedIdeas = sorted.filter(idea => getVoteCount(idea) === topVote);
          const adminSelectedWinner = winnerData?.selectionType === "manual" ? winnerData?.winners?.[0] : null;

          if (tiedIdeas.length > 1 && !adminSelectedWinner) {
            setWinner({ status: "tie", message: "Tie detected. Admin decision pending.", cycle: targetCycle });
          } else {
            const finalWinner = adminSelectedWinner || { idea: sorted[0], votes: topVote };
            setWinner({ 
              status: "winner", 
              idea: finalWinner.idea, 
              votes: finalWinner.votes, 
              cycle: targetCycle,
              selectionType: winnerData?.selectionType 
            });
          }
        }
      } else {
        setWinner({ status, message, cycle: latestCycle });
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  const cardStyle = "premium-card p-5 md:p-6 group relative overflow-hidden";

  return (
    <div className="premium-page">
      <Navbar />

      <main className="premium-shell animate-fade-in">
        
        {/* 1. Weekly Winner - First Priority */}
        <section className="space-y-4 animate-fade-up">
          <div className="flex items-center gap-3 px-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Weekly Spotlight</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
          </div>
          
          <div className="premium-hero min-h-[260px] md:min-h-[320px] flex flex-col justify-center text-white group">
            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.08),transparent_40%)] pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            {winner?.status === "winner" ? (
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-[#D4AF37]/15 blur-3xl rounded-full animate-pulse" />
                    <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/30 shadow-xl bg-[#111827] p-0.5">
                      <img 
                        src={getUserPhoto(winner.idea)} 
                        alt={winner.idea.createdBy?.name || "Winner"}
                        className="h-full w-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#D4AF37] text-[#0B1220] rounded-xl flex items-center justify-center shadow-md border-2 border-[#0B1220] transition-transform duration-300 group-hover:scale-110">
                      <Crown size={20} />
                    </div>
                  </div>

                  <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                      <Sparkles size={12} className="text-[#D4AF37]" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">
                        {winner.selectionType === "manual" ? "Admin Final Winner" : "Weekly Champion"}
                      </span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                      {winner.idea.createdBy?.name || winner.idea.user?.name || "Winner"}
                    </h3>
                    <p className="text-white/60 text-sm md:text-base font-medium italic line-clamp-2 max-w-xl">
                      "{winner.idea.title}"
                    </p>
                    {winner.cycle && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 pt-1">
                        {winner.cycle.label}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center lg:items-end gap-4">
                  <div className="px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center shadow-inner group-hover:border-[#D4AF37]/30 transition-all duration-300">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">Validated Votes</p>
                    <p className="text-2xl font-bold tracking-tight">{winner.votes} <span className="text-sm text-white/40 font-bold ml-1 uppercase">Votes</span></p>
                  </div>
                  <Link to="/winners" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-[#D4AF37] transition-all duration-300 group/btn">
                    Hall of Fame <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative z-10 py-10 md:py-12 flex flex-col items-center gap-6 text-center">
                <div className="relative">
                   <div className="absolute -inset-8 bg-[#D4AF37]/5 blur-3xl rounded-full" />
                   <div className="h-32 w-32 rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37]/40 border-2 border-dashed border-[#D4AF37]/20 shadow-inner group-hover:scale-105 transition-transform">
                    {winner?.status === "tie" ? <Vote size={56} className="animate-pulse" /> : <Calendar size={56} className="animate-pulse" />}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                    {winner?.message || "Next Winner Announcement"}
                  </h3>
                  {winner?.cycle && (
                    <p className="text-[#D4AF37] text-[12px] font-black uppercase tracking-[0.5em]">
                      {winner.cycle.label}
                    </p>
                  )}
                  {!winner?.cycle && winner?.status !== "empty" && (
                    <p className="text-[#D4AF37] text-[12px] font-black uppercase tracking-[0.5em] animate-pulse">Coming this Monday @ 09:00 AM</p>
                  )}
                </div>
                <Link to="/winners" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-[#D4AF37] transition-all duration-300 group/btn pt-4">
                  Hall of Fame <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 2. Dashboard Hero Banner - Second Priority */}
        <section className="premium-hero grid grid-cols-1 lg:grid-cols-2 items-center gap-8 min-h-[260px] md:min-h-[320px] group animate-fade-up">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.1),transparent_40%)] pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">
                <Sparkles size={14} className="text-[#D4AF37]" /> SIVION Idea Hub
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Fuel Your <br /> <span className="text-[#D4AF37] italic">Ideas.</span>
              </h1>
              <div className="h-1 w-12 bg-[#D4AF37] rounded-full" />
            </div>
            <p className="max-w-md text-sm md:text-base text-white/70 font-medium leading-relaxed">
              Orchestrate the future of tech. Submit ideas, cast votes, and rise through the cycles.
            </p>
            <div className="flex pt-4">
              <Link to="/submit-idea" className="px-5 py-2.5 bg-[#D4AF37] text-[#0B1220] rounded-full text-sm font-medium tracking-wide shadow-xl shadow-[#D4AF37]/25 hover:bg-white hover:text-[#0B1220] hover:scale-105 transition-all duration-300 ease-out active:scale-95">
                Submit Idea
              </Link>
            </div>
          </div>
 
          <div className="relative h-auto max-h-[280px] md:max-h-[340px] overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#111827] shadow-2xl group/hero">
            <img
              src="/assests/dashboard.png"
              alt="Dashboard visual"
              className="w-full h-auto max-h-[280px] md:max-h-[340px] object-cover object-center opacity-90 transition-transform duration-[2000ms] group-hover/hero:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220]/80 via-transparent to-[#D4AF37]/10 pointer-events-none" />
          </div>
        </section>

        {/* 3. Stats & Content - Third Priority */}
        <section className="space-y-10 animate-fade-up">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Total Ideas", value: stats.totalIdeas, icon: <Lightbulb size={24} />, desc: "Global repository" },
              { label: "Votes Cast", value: stats.totalVotes, icon: <Vote size={24} />, desc: "Active engagement" },
              { label: "Idea Velocity", value: stats.ideasThisWeek, icon: <TrendingUp size={24} />, desc: "Weekly momentum" },
            ].map((stat, i) => (
              <div key={i} className={cardStyle}>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-[#F8F5EF] rounded-xl flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/10 shadow-sm transition-transform duration-300 group-hover:scale-110">{stat.icon}</div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#1F2937]/30">{stat.desc}</span>
                </div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-[#0B1220] tracking-tight">{stat.value || 0}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
