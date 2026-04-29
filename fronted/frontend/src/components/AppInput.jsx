export default function AppInput({
  label,
  className = "",
  muted = false,
  icon,
  ...props
}) {
  return (
    <div className="space-y-3">
      {label && (
        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-[#D4AF37] ml-2 block">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37] group-focus-within:scale-110 group-focus-within:rotate-6 transition-transform duration-500">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-lg border border-[#0B1220]/10 bg-[#F8F5EF]/70 px-4 py-3 text-sm font-medium text-[#0B1220] outline-none transition-all duration-300 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 focus:bg-white placeholder:text-[#1F2937]/30 shadow-sm ${icon ? 'pl-12' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
