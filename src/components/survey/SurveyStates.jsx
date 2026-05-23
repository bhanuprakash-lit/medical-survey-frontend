import Button from '../Button';

/**
 * LoadingState
 * Full-screen skeleton loader used while questions are being fetched.
 */
export const LoadingState = () => (
  <div className="flex h-full min-h-0 flex-col gap-3 px-3 py-4">
    <div className="mx-auto w-full max-w-[430px]">
      <div className="grid gap-3">
        {/* Sidebar Skeleton */}
        <div className="space-y-2 rounded-lg border border-slate-100 bg-white/80 p-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="h-20 animate-pulse rounded-lg bg-white/80" />
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-lg bg-white/80" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * ErrorState
 * Displayed when a critical error occurs (e.g., API failure).
 */
export const ErrorState = ({ message, onRetry }) => (
  <div className="flex h-full items-center justify-center px-4 py-6">
    <div className="w-full max-w-[430px] rounded-lg border border-rose-100 bg-white/90 p-5 text-center shadow-[0_20px_45px_-32px_rgba(15,35,63,0.4)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 text-xl text-rose-600">
        !
      </div>
      <h2 className="mt-4 text-xl font-black text-slate-900">Unable to load survey</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
      <div className="mt-6">
        <Button onClick={onRetry}>Retry</Button>
      </div>
    </div>
  </div>
);

/**
 * EmptyState
 * Displayed when the question list is empty.
 */
export const EmptyState = () => (
  <div className="flex h-full items-center justify-center px-4 py-6">
    <div className="w-full max-w-[430px] rounded-lg border border-slate-200 bg-white/90 p-5 text-center shadow-[0_20px_45px_-32px_rgba(15,35,63,0.4)]">
      <h2 className="text-xl font-black text-slate-900">No survey questions found</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        The API returned an empty list, so there are no questions to render yet.
      </p>
    </div>
  </div>
);

/**
 * SubmissionModal
 * Centered modal for final confirmation before sending data to the backend.
 */
export const SubmissionModal = ({ open, stages, answers, onClose, onConfirm }) => {
  if (!open) {
    return null;
  }

  // Calculate total captured answers for the confirmation summary
  const answeredCount = stages.reduce((count, stage) => {
    return count + stage.questions.filter((question) => {
      const answer = answers[question.id];
      return Array.isArray(answer) ? answer.length > 0 : String(answer ?? '').trim() !== '';
    }).length;
  }, 0);

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-slate-950/30 px-3 pb-3 pt-16 backdrop-blur-sm">
      <div className="w-full max-w-[430px] rounded-lg border border-white/80 bg-white p-4 shadow-[0_30px_80px_-35px_rgba(15,35,63,0.6)]">
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Confirm Submission
        </div>
        <h3 className="mt-2 text-xl font-black text-slate-900">
          Submit this survey now?
        </h3>
        <p className="mt-2 text-sm leading-5 text-slate-500">
          This will submit the survey and clear the local draft.
        </p>

        {/* Quick stats grid */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Stages</div>
            <div className="mt-1 text-xl font-black text-slate-900">{stages.length}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Answers</div>
            <div className="mt-1 text-xl font-black text-slate-900">{answeredCount}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Final submit
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * SuccessState
 * Full-screen success view displayed after a successful submission.
 */
export const SuccessState = ({ submissionRecord, onStartNew, onChangeSurveyor }) => (
  <div className="flex h-full w-full flex-col items-center justify-center px-4 py-8 overflow-y-auto">
    {/* Animated Success Card */}
    <div className="my-auto w-full max-w-[430px] animate-in fade-in slide-in-bottom rounded-lg border border-white bg-white/90 p-5 shadow-[0_40px_100px_-32px_rgba(15,35,63,0.12)]">
      
      {/* Pulse Animation & Checkmark Icon */}
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20 opacity-75 duration-1000"></div>
        <div className="relative flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13 9 17 19 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="mt-5 text-center">
        <div className="inline-flex rounded-md bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
          Success
        </div>
        <h2 className="mt-3 text-2xl font-black text-slate-900">
          Survey Submitted!
        </h2>
        <p className="mt-2 text-sm leading-5 text-slate-500">
          The outlet data has been successfully recorded. The local draft and session have been cleared.
        </p>
      </div>

      {/* Record details (e.g., Store ID) */}
      <div className="mt-6 grid gap-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Survey ID</span>
            <span className="text-sm font-black text-slate-700">{submissionRecord?.surveyId}</span>
          </div>
        </div>
      </div>

      {/* Navigation actions after completion */}
      <div className="mt-5 flex flex-col gap-2">
        <Button 
          onClick={onStartNew}
          className="shadow-xl shadow-sky-100"
        >
          Start another survey
        </Button>
        <Button 
          variant="secondary" 
          onClick={onChangeSurveyor}
        >
          Change surveyor
        </Button>
      </div>
    </div>
  </div>
);
