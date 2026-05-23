const Header = ({ title, description, icon, eyebrow, align = 'center' }) => {
  const centered = align === 'center';

  return (
    <div className={`mb-8 flex w-full flex-col ${centered ? 'items-center text-center' : 'items-start text-left'} gap-4`}>
      {eyebrow ? (
        <div className="rounded-full border border-sky-200/70 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
          {eyebrow}
        </div>
      ) : null}
      {icon ? (
        <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-4 text-sky-700 shadow-[0_16px_30px_-20px_rgba(15,35,63,0.32)] backdrop-blur">
          {icon}
        </div>
      ) : (
        <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r from-sky-600 to-cyan-400 opacity-70 ${centered ? '' : 'ml-1'}`} />
      )}

      <div className={`space-y-2 ${centered ? 'max-w-[280px]' : 'max-w-[320px]'}`}>
        <h1 className="text-[1.8rem] font-black tracking-[-0.03em] leading-[1.05] text-slate-900">
          {title}
        </h1>
        {description && (
          <p className={`text-sm leading-relaxed text-slate-500 ${centered ? 'px-2' : ''}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default Header;
