export default function AppInput({
  label,
  className = "",
  muted = false,
  icon,
  ...props
}) {
  return (
    <div className="space-y-2.5">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37] ml-1 block">
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
          className={`w-full h-12 premium-input px-4 text-sm font-medium ${icon ? 'pl-12' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
