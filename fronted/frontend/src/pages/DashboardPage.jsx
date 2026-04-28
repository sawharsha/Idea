import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Lightbulb, Vote, TrendingUp, Calendar, ChevronRight, Sparkles } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import dashboardHero from "../assets/dashboard-hero.png";

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalIdeas: 0, totalVotes: 0, ideasThisWeek: 0 });
  const [topIdeas, setTopIdeas] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, topIdeasRes, winnersRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/top-ideas"),
        api.get("/winners/weeks"),
      ]);
      setStats(statsRes.data.data || {});
      setTopIdeas(topIdeasRes.data.data?.ideas || []);
      const weeks = winnersRes.data.data || [];
      if (weeks.length > 0) {
        const winRes = await api.get(`/winners/${encodeURIComponent(weeks[0])}`);
        setWinner(winRes.data.data?.winners?.find((w) => w.rank === 1) || null);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  const cardStyle = "bg-white/95 rounded-[2rem] border border-[#0B1220]/10 shadow-xl shadow-[#0B1220]/5 p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group";

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#1F2937] font-sans tracking-tight overflow-x-hidden selection:bg-[#D4AF37]/20 selection:text-[#0B1220]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-16 animate-fade-in">
        
        {/* 1. Weekly Winner - First Priority */}
        <section className="space-y-6 animate-fade-up">
          <div className="flex items-center gap-4 px-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#D4AF37]">Weekly Spotlight</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
          </div>
          
          <div className="bg-[#0B1220] rounded-[3rem] p-8 md:p-14 text-white relative overflow-hidden shadow-[0_40px_100px_rgba(11,18,32,0.4)] border border-[#D4AF37]/20 group">
            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.08),transparent_40%)] pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            {winner ? (
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
                  <div className="relative">
                    <div className="absolute -inset-6 bg-[#D4AF37]/15 blur-3xl rounded-full animate-pulse" />
                    <div className="relative h-40 w-40 md:h-56 md:w-56 rounded-[3rem] overflow-hidden border-4 border-[#D4AF37]/30 shadow-2xl bg-[#111827] p-1">
                      <img 
                        src={winner?.idea?.createdBy?.photoUrl || `https://ui-avatars.com/api/?background=FFFFFF&color=0B1220&size=256&name=${encodeURIComponent(winner?.idea?.createdBy?.name)}`} 
                        alt={winner?.idea?.createdBy?.name}
                        className="h-full w-full rounded-[2.5rem] object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-[#D4AF37] text-[#0B1220] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.4)] border-4 border-[#0B1220] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <Crown size={32} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                      <Sparkles size={14} className="text-[#D4AF37]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Weekly Champion</span>
                    </div>
                    <h3 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] text-white">{winner.idea.createdBy?.name}</h3>
                    <p className="text-white/60 text-xl md:text-2xl font-bold italic line-clamp-2 max-w-xl leading-relaxed">
                      "{winner.idea.title}"
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center lg:items-end gap-6">
                  <div className="px-12 py-6 rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 text-center shadow-inner group-hover:border-[#D4AF37]/30 transition-all duration-500">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-2">Validated Votes</p>
                    <p className="text-4xl font-black tracking-tighter">{winner.votes} <span className="text-xl text-white/40 font-bold ml-1 uppercase">Votes</span></p>
                  </div>
                  <Link to="/winners" className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-[#D4AF37] transition-all duration-300 group/btn">
                    Hall of Fame <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-2" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative z-10 py-16 flex flex-col items-center gap-8 text-center">
                <div className="relative">
                   <div className="absolute -inset-8 bg-[#D4AF37]/5 blur-3xl rounded-full" />
                   <div className="h-32 w-32 rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37]/40 border-2 border-dashed border-[#D4AF37]/20 shadow-inner">
                    <Calendar size={56} className="animate-pulse" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight text-white">Next Winner Announcement</h3>
                  <p className="text-[#D4AF37] text-[12px] font-black uppercase tracking-[0.5em] animate-pulse">Coming this Monday @ 09:00 AM</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. Dashboard Hero Banner - Second Priority */}
        <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 rounded-[3rem] bg-white border border-[#0B1220]/5 shadow-2xl p-8 md:p-14 overflow-hidden relative group animate-fade-up">
          <div className="absolute top-0 left-0 w-full h-full bg-[#F8F5EF]/30 pointer-events-none" />
          <div className="space-y-10 relative z-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#0B1220]/5 border border-[#0B1220]/10 text-[11px] font-black uppercase tracking-[0.4em] text-[#0B1220]">
                <Sparkles size={16} className="text-[#D4AF37]" /> SIVION Idea Hub
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-[#0B1220] leading-[0.9]">
                Fuel Your <br /> <span className="text-[#D4AF37] italic">Ideas.</span>
              </h1>
              <div className="h-2 w-20 bg-[#D4AF37] rounded-full" />
            </div>
            <p className="max-w-md text-[#1F2937]/70 text-lg md:text-xl font-bold leading-relaxed">
              Orchestrate the future of tech. Submit ideas, cast votes, and rise through the cycles.
            </p>
            <div className="flex pt-6">
              <Link to="/submit-idea" className="px-12 py-5 bg-[#0B1220] text-white rounded-full text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(11,18,32,0.3)] hover:bg-[#D4AF37] hover:text-[#0B1220] transition-all duration-500 active:scale-95 hover:-translate-y-1">
                Submit Idea
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#0B1220]/5 bg-[#0B1220] shadow-[0_40px_80px_rgba(0,0,0,0.2)] h-72 md:h-[420px] group/hero">
            <img
              src={dashboardHero}
              alt="Dashboard visual"
              className="h-full w-full object-cover opacity-90 transition-transform duration-[2000ms] group-hover/hero:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220]/80 via-transparent to-[#D4AF37]/10 pointer-events-none" />
          </div>
        </section>

        {/* 3. Stats & Content - Third Priority */}
        <section className="space-y-20 animate-fade-up">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { label: "Total Ideas", value: stats.totalIdeas, icon: <Lightbulb size={30} />, desc: "Global repository" },
              { label: "Votes Cast", value: stats.totalVotes, icon: <Vote size={30} />, desc: "Active engagement" },
              { label: "Idea Velocity", value: stats.ideasThisWeek, icon: <TrendingUp size={30} />, desc: "Weekly momentum" },
            ].map((stat, i) => (
              <div key={i} className={cardStyle}>
                <div className="flex items-center justify-between mb-10">
                  <div className="p-5 bg-[#F8F5EF] rounded-2xl flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/10 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">{stat.icon}</div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F2937]/30">{stat.desc}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37] mb-3">{stat.label}</p>
                <h3 className="text-5xl font-black text-[#0B1220] tracking-tighter">{stat.value || 0}</h3>
              </div>
            ))}
          </div>

          {/* Top Ideas Section */}
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0B1220]">Top Rated Ideas</h2>
                <div className="h-1.5 w-12 bg-[#D4AF37] rounded-full" />
              </div>
              <Link to="/ideas" className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-[#D4AF37] hover:text-[#0B1220] transition-all duration-300 border-b-2 border-[#D4AF37]/30 pb-2 hover:border-[#0B1220] group/all">
                Explore All <ChevronRight size={16} className="transition-transform group-hover/all:translate-x-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {topIdeas.length > 0 ? (
                topIdeas.map((idea, index) => (
                  <div key={idea._id} className={`${cardStyle} flex flex-col sm:flex-row items-stretch gap-10 overflow-hidden relative`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#0B1220] text-[#D4AF37] font-black text-3xl shadow-2xl border-4 border-[#D4AF37]/10 self-start sm:self-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between relative z-10">
                      <div className="space-y-3">
                        <h4 className="text-2xl md:text-3xl font-black text-[#0B1220] truncate group-hover:text-[#D4AF37] transition-colors duration-300">{idea.title}</h4>
                        <p className="text-[#1F2937]/60 text-base line-clamp-2 font-bold leading-relaxed italic">"{idea.description}"</p>
                      </div>
                      <div className="flex items-center flex-wrap gap-6 mt-10 pt-10 border-t border-[#0B1220]/5">
                        <div className="flex items-center gap-2.5 text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">
                          <Vote size={20} /> {idea.likesCount} Votes
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1F2937]/30 bg-[#F8F5EF] px-6 py-2.5 rounded-full border border-[#D4AF37]/10 transition-colors duration-300 group-hover:bg-[#0B1220] group-hover:text-white">
                          {idea.category || 'CONCEPT'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white/50 rounded-[3rem] border-2 border-dashed border-[#D4AF37]/20 py-32 text-center flex flex-col items-center justify-center shadow-inner group hover:border-[#D4AF37]/40 transition-all duration-700">
                   <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center text-[#D4AF37]/20 shadow-xl mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Lightbulb size={48} />
                  </div>
                  <p className="text-[#1F2937]/30 font-black uppercase tracking-[0.6em] text-sm italic">Synchronizing idea feed...</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
