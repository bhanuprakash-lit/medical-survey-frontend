import { getStageProgress } from '../../utils/survey';

/**
 * StageSidebar Component
 * Provides a vertical progress rail (on desktop) or horizontal rail (on mobile).
 * Shows completion status for each logical stage of the survey.
 */
const StageSidebar = ({
  stages,                // Array of stage objects with questions and requirements
  currentStageId,
  answers,
  errors,                // Global error state to highlight stages with missing answers
  completionPercentage,
}) => {
  return (
    <aside className="border-b border-white/60 bg-[rgba(255,255,255,0.62)] px-4 py-4 backdrop-blur-xl lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="flex items-start justify-between gap-4 lg:flex-col lg:items-stretch">
        {/* Header section with instructions */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Survey Stages
          </div>
          <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-900">
            Section progress
          </h2>
          <p className="mt-2 hidden text-sm leading-6 text-slate-500 lg:block">
            This rail is view-only so the interview stays guided one question at a time.
          </p>
        </div>

        {/* Global completion percentage display */}
        <div className="min-w-[92px] rounded-[1.4rem] border border-white/70 bg-white/85 p-3 text-right shadow-[0_18px_36px_-30px_rgba(15,35,63,0.55)] lg:text-left">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Completed
          </div>
          <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-900">
            {completionPercentage}%
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {stages.map((stage, index) => {
          /* Calculate local progress for this specific stage */
          const progress = getStageProgress(stage, answers);
          const hasErrors = stage.questions.some((question) => errors[question.id]);
          const isActive = currentStageId === stage.id;
          const isComplete = progress.requiredAnswered >= stage.requiredCount && !hasErrors;

          return (
            <div
              key={stage.id}
              className={`min-w-[240px] rounded-[1.5rem] border p-4 text-left transition-all duration-200 lg:min-w-0 ${
                isActive
                  ? 'border-sky-300 bg-sky-50/90 shadow-[0_20px_40px_-28px_rgba(14,116,201,0.65)]'
                  : 'border-white/70 bg-white/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Stage {index + 1}
                  </div>
                  <div className="mt-1 text-sm font-bold leading-5 text-slate-900">
                    {stage.title}
                  </div>
                </div>
                {/* Status Indicator (Error, OK, or Answer Count) */}
                <div
                  className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-bold ${
                    hasErrors
                      ? 'bg-rose-100 text-rose-700'
                      : isComplete
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {hasErrors ? '!' : isComplete ? 'OK' : `${progress.answered}`}
                </div>
              </div>

              {/* Individual Stage Progress Bar */}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    hasErrors ? 'bg-rose-400' : 'bg-gradient-to-r from-sky-600 to-cyan-400'
                  }`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{progress.answered} / {stage.questions.length} answered</span>
                <span>{progress.requiredAnswered} / {stage.requiredCount} required</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default StageSidebar;
