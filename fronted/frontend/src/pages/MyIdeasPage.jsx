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

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8 animate-fade-in">
        
        {/* Header Section */}
        <section className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0B1220] rounded-xl text-[#D4AF37] shadow-md">
                <Lightbulb size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">Submission Status</p>
                <h2 className="text-2xl font-bold tracking-tight text-[#0B1220]">My Ideas</h2>
              </div>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-[#0B1220]/10 to-transparent hidden sm:block" />
            <button 
              onClick={() => navigate("/submit-idea")}
              className="px-5 py-3 md:py-4 bg-[#0B1220] text-white rounded-full text-sm font-bold uppercase tracking-wider shadow-md hover:bg-[#D4AF37] hover:text-[#0B1220] transition-all duration-300 active:scale-95"
            >
              Submit Idea
            </button>
          </div>

          <div className="flex items-center gap-2 px-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[8px] font-bold uppercase tracking-wider text-[#D4AF37]">
                <Sparkles size={10} /> Personal Collection
             </div>
             <div className="text-[8px] font-bold text-[#1F2937]/40 uppercase tracking-wider">
                {myIdeas.length} {myIdeas.length === 1 ? 'Idea' : 'Ideas'} Submitted
             </div>
          </div>
        </section>

        {/* Ideas Grid */}
        <section className="animate-fade-up">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-64 bg-white/50 rounded-xl border border-[#0B1220]/5 animate-pulse" />
               ))}
             </div>
          ) : myIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myIdeas.map((idea) => (
                <IdeaCard key={idea._id} idea={idea} onVote={handleVote} onOpen={setSelectedIdea} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl md:rounded-3xl border-2 border-dashed border-[#D4AF37]/20 py-16 text-center flex flex-col items-center justify-center shadow-inner group transition-all duration-300">
               <div className="h-16 w-16 bg-[#F8F5EF] rounded-full flex items-center justify-center text-[#D4AF37]/20 mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1220] tracking-tight">No ideas submitted yet.</h3>
              <p className="text-[#1F2937]/30 text-[9px] font-bold uppercase tracking-wider mt-2 italic">Submit your first idea to get started.</p>
              <button onClick={() => navigate("/submit-idea")} className="mt-6 px-5 py-3 md:py-4 bg-[#0B1220] text-white rounded-full text-sm font-bold uppercase tracking-wider shadow-md hover:bg-[#D4AF37] hover:text-[#0B1220] transition-all duration-300 active:scale-95">
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
