import Button from '../Button';
import { getStageProgress } from '../../utils/survey';

/**
 * SurveySummary Component
 * Full-screen review screen shown before final submission.
 * Lists all stages, their progress, and highlights any missing required answers.
 */
const SurveySummary = ({ stages, answers, errors, onBack, onSubmit }) => {
  // Calculate total missing required answers across all stages
  const totalRequiredMissing = stages.reduce((count, stage) => {
    return count + stage.questions.filter((question) => errors[question.id]).length;
  }, 0);

  return (
    <div className="mx-auto flex max-w-[430px] flex-col gap-3 pb-8">
      {/* Summary Header with Status Badge */}
      <div className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-[0_20px_45px_-32px_rgba(15,35,63,0.45)]">
        <div className="flex flex-col gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Final Review
            </div>
            <h2 className="mt-2 text-xl font-black text-slate-900">
              Review before submitting
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-500">
              Check each section, resolve any required responses still missing, and then confirm the final survey submission.
            </p>
          </div>
          {/* Missing Answers Counter */}
          <div className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            totalRequiredMissing
              ? 'border border-rose-200 bg-rose-50 text-rose-700'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}>
            {totalRequiredMissing ? `${totalRequiredMissing} required answers missing` : 'All required answers complete'}
          </div>
        </div>
      </div>

      {/* Stage-by-Stage Breakdown */}
      {stages.map((stage, index) => {
        const progress = getStageProgress(stage, answers);
        const stageErrors = stage.questions.filter((question) => errors[question.id]);

        return (
          <div
            key={stage.id}
            className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-[0_20px_45px_-32px_rgba(15,35,63,0.35)]"
          >
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Stage {index + 1}
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{stage.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {progress.answered} of {stage.questions.length} answers captured. {progress.requiredAnswered} of {stage.requiredCount} required answers completed.
                </p>
              </div>
              <div className="w-fit rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Review only
              </div>
            </div>

            {/* Local Error List for this Stage */}
            {stageErrors.length ? (
              <div className="mt-4 flex flex-col gap-2">
                {stageErrors.map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    disabled
                    className="rounded-lg border border-rose-100 bg-rose-50/70 px-3 py-2 text-left"
                  >
                    <div className="text-sm font-semibold text-rose-700">{question.text}</div>
                    <div className="mt-1 text-xs text-rose-500">{errors[question.id]}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                This section is ready for submission.
              </div>
            )}
          </div>
        );
      })}

      {/* Footer Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onBack}>
          Back to survey
        </Button>
        <Button onClick={onSubmit}>
          Confirm submission
        </Button>
      </div>
    </div>
  );
};

export default SurveySummary;
