export default function AppCard({ children, className = "" }) {
  return (
    <div className={`premium-card p-5 md:p-6 group relative overflow-hidden ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
