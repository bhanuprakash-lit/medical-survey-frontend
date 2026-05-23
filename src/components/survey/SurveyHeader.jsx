/**
 * SurveyHeader Component
 * The main header for the survey flow. 
 * Displays the title, outlet name, overall progress, and sync status.
 * Also contains the stage navigation indicator.
 */
const SurveyHeader = ({
  title,
  outletName,
  progress,
  saveStatus,
  online,             // Boolean for network status (Online sync vs Offline draft)
  currentStage,
  stages,
  currentQuestionIndex,
  totalQuestions,
}) => {
  const activeStageIndex = stages.findIndex((stage) => stage.id === currentStage?.id);

  return (
    <header className="z-30 shrink-0 px-3 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]">
      <div className="mx-auto max-w-[430px] rounded-lg border border-slate-100 bg-white/95 p-3 shadow-[0_10px_26px_-20px_rgba(15,35,63,0.35)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* Branding/Context Badge */}
            <div className="inline-flex items-center gap-2 rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-sky-700">
              Medical AI Survey
            </div>
            <h1 className="mt-2 truncate text-base font-black text-slate-900">
              {title}
            </h1>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              Current outlet: {outletName || 'Not selected'}
            </p>
          </div>

          {/* Large Progress Percentage */}
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Complete
            </div>
            <div className="mt-0.5 text-xl font-black text-slate-900">
              {progress}%
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-3">
          <div className="h-1 overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-400 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Row (Question Count, Save Status, Network Status) */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="rounded-md border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="rounded-md border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-600">
              {saveStatus}
            </div>
            <div
              className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                online
                  ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                  : 'border border-amber-100 bg-amber-50 text-amber-700'
              }`}
            >
              {online ? 'Online sync' : 'Offline draft'}
            </div>
          </div>
        </div>

        <div className="mt-3 flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
          <div className="shrink-0 rounded bg-sky-600 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
            Stage {activeStageIndex + 1 || 1}/{stages.length || 1}
          </div>
          <div className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">
            {currentStage?.title || 'Survey'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SurveyHeader;
