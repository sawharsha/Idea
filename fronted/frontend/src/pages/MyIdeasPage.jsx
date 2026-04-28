import { useEffect, useState } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import IdeaCard from "../components/IdeaCard";
import IdeaModal from "../components/IdeaModal";
import { useNavigate } from "react-router-dom";

export default function MyIdeasPage() {
  const navigate = useNavigate();
  const [myIdeas, setMyIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyIdeas();
  }, []);

  const fetchMyIdeas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/ideas", { params: { mine: true } });
      setMyIdeas(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id) => {
    try {
      await api.post(`/ideas/${id}/like`);
      fetchMyIdeas();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F5EF] font-sans tracking-tight text-[#1F2937] overflow-x-hidden selection:bg-[#D4AF37]/20 selection:text-[#0B1220]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 space-y-8 animate-fade-in">
        
        {/* Header Section */}
        <section className="space-y-8 animate-fade-up">
          <div className="flex items-center justify-between gap-6 px-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0B1220] rounded-xl text-[#D4AF37] shadow-lg">
                <Lightbulb size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Submission Status</p>
                <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-[#0B1220]">My Ideas</h2>
              </div>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-[#0B1220]/10 to-transparent hidden sm:block" />
            <button 
              onClick={() => navigate("/submit-idea")}
              className="px-6 py-3 bg-[#0B1220] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#D4AF37] hover:text-[#0B1220] transition-all duration-300 active:scale-95"
            >
              Submit Idea
            </button>
          </div>

          <div className="flex items-center gap-3 px-2 py-1">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                <Sparkles size={12} /> Personal Collection
             </div>
             <div className="text-[9px] font-bold text-[#1F2937]/40 uppercase tracking-widest">
                {myIdeas.length} {myIdeas.length === 1 ? 'Idea' : 'Ideas'} Submitted
             </div>
          </div>
        </section>

        {/* Ideas Grid */}
        <section className="animate-fade-up">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-64 bg-white/50 rounded-[2rem] border border-[#0B1220]/5 animate-pulse" />
               ))}
             </div>
          ) : myIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myIdeas.map((idea) => (
                <IdeaCard key={idea._id} idea={idea} onVote={handleVote} onOpen={setSelectedIdea} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border-2 border-dashed border-[#D4AF37]/20 py-20 text-center flex flex-col items-center justify-center shadow-inner group hover:border-[#D4AF37]/40 transition-all duration-700">
               <div className="h-20 w-20 bg-[#F8F5EF] rounded-full flex items-center justify-center text-[#D4AF37]/20 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Lightbulb size={40} />
              </div>
              <h3 className="text-xl font-black text-[#0B1220] tracking-tight">No ideas submitted yet.</h3>
              <p className="text-[#1F2937]/30 text-[10px] font-bold uppercase tracking-[0.3em] mt-3 italic">Submit your first idea to get started.</p>
              <button onClick={() => navigate("/submit-idea")} className="mt-8 px-10 py-4 bg-[#0B1220] text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-[#D4AF37] hover:text-[#0B1220] transition-all duration-300 active:scale-95">
                Submit Idea
              </button>
            </div>
          )}
        </section>
      </main>

      <IdeaModal 
        idea={selectedIdea} 
        onClose={() => setSelectedIdea(null)} 
        onVote={handleVote}
      />
    </div>
  );
}
