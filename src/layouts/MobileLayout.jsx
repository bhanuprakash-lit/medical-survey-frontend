const MobileLayout = ({ children }) => {
  return (
    <div className="fixed inset-0 overflow-hidden app-gradient text-slate-900 selection:bg-sky-100 selection:text-sky-700">
      <div className="mx-auto flex h-[100svh] w-full max-w-[430px] flex-col overflow-hidden bg-white shadow-[0_10px_60px_rgba(15,35,63,0.14)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/80 to-transparent" />

        <main className="flex-grow flex flex-col z-10 h-full min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MobileLayout;
