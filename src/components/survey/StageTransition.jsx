const StageTransition = ({ stage, stageIndex, totalStages, visible }) => {
  if (!visible || !stage) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-6 backdrop-blur-md">
      <div className="stage-transition-card w-full max-w-[360px] rounded-xl border border-white/15 bg-white p-5 text-center shadow-[0_30px_90px_-35px_rgba(0,0,0,0.75)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-sky-600 text-lg font-black text-white">
          {stageIndex + 1}
        </div>
        <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-700">
          Stage {stageIndex + 1} of {totalStages}
        </div>
        <h2 className="mt-2 text-xl font-black leading-6 text-slate-950">
          {stage.title}
        </h2>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="stage-transition-progress h-full rounded-full bg-sky-600" />
        </div>
      </div>
    </div>
  );
};

export default StageTransition;
