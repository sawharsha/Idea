export default function AppButton({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const baseStyle = "flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide text-sm transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0";
  
  const variants = {
    primary: "bg-[#D4AF37] text-[#0B1220] px-5 py-2.5 shadow-lg shadow-[#D4AF37]/25 hover:bg-[#0B1F3A] hover:text-white",
    primaryLg: "bg-[#D4AF37] text-[#0B1220] px-7 py-3 text-sm shadow-lg shadow-[#D4AF37]/25 hover:bg-[#0B1F3A] hover:text-white",
    secondary: "bg-white/10 text-white border border-white/15 px-5 py-2.5 hover:bg-white/15",
    danger: "bg-red-500/10 text-red-600 border border-red-500/20 px-5 py-3 hover:bg-red-600 hover:text-white shadow-xl shadow-[#0B1F3A]/10",
  };

  return (
    <button className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
