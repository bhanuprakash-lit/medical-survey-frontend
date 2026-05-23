const Button = ({
  children,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary',
  isLoading = false,
  loading = false,
  disabled = false,
}) => {
  const busy = isLoading || loading;
  const baseStyles = 'relative inline-flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-3 text-sm font-semibold tracking-[0.01em] transition-all duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100';

  const variants = {
    primary: 'bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-500 text-white shadow-[0_14px_30px_-14px_rgba(14,116,201,0.75)] hover:brightness-[1.03]',
    secondary: 'border border-slate-200/80 bg-white/90 text-slate-700 shadow-[0_8px_22px_-18px_rgba(15,35,63,0.35)] hover:bg-slate-50',
    outline: 'border border-sky-200 bg-sky-50/70 text-sky-700 hover:bg-sky-100/80',
    ghost: 'min-h-11 rounded-lg bg-transparent px-4 py-3 text-slate-500 hover:bg-slate-100/80 hover:text-slate-700',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/16 via-transparent to-transparent opacity-60" />
      {busy ? (
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="relative z-10 font-semibold">Processing...</span>
        </div>
      ) : <span className="relative z-10">{children}</span>}
    </button>
  );
};

export default Button;
