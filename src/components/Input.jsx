const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  id,
  error,
  hint,
  readOnly = false,
  className = '',
}) => {
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between px-1">
        <label
          htmlFor={id || name}
          className={`text-sm font-semibold ${
            error ? 'text-rose-600' : 'text-slate-700'
          }`}
        >
          {label}
        </label>
        {hint ? <span className="text-xs font-medium text-slate-400">{hint}</span> : null}
      </div>
      <div className="relative group">
        <input
          type={type}
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`block min-h-12 w-full rounded-lg border px-3 py-3 text-[15px] text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] outline-none transition-all duration-200 placeholder:text-slate-400 ${className} ${
            error 
              ? 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
              : 'border-slate-200/80 bg-white/88 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10'
          }`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <div className={`h-2.5 w-2.5 rounded-full transition-colors ${error ? 'bg-rose-400' : value ? 'bg-emerald-400' : 'bg-slate-200'}`} />
        </div>
      </div>
      {error && (
        <p className="mt-2 px-1 text-xs font-semibold text-rose-500 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
