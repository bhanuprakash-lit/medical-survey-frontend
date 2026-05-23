import Button from '../Button';

/**
 * ProgressFooter Component
 * Sticky footer containing navigation controls (Previous/Next) and progress status.
 * Adapts its actions when the Survey Summary is open.
 */
const ProgressFooter = ({
  currentQuestionIndex,
  totalQuestions,
  saveStatus,     // String indicating if data is saved (e.g., "Saved to draft")
  isSummaryOpen,  // Boolean to toggle between question navigation and submission
  onPrevious,
  onNext,
  onOpenSummary,
  onBackFromSummary,
  onSubmit,
}) => {
  const isFirstQuestion = currentQuestionIndex <= 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-2">
      {/* Glassmorphism Navigation Bar */}
      <div className="pointer-events-auto mx-auto flex max-w-[430px] flex-col gap-2 rounded-lg border border-slate-100 bg-white/96 p-2 shadow-[0_-10px_28px_-24px_rgba(15,35,63,0.32)] backdrop-blur-xl">
        
        {/* Status Label (Draft Save Status or Instructions) */}
        <div className="px-1 text-center text-[11px] font-semibold text-slate-500">
          {isSummaryOpen
            ? 'Check any missing required answers before submitting.'
            : saveStatus}
        </div>

        <div className="flex gap-3">
          {isSummaryOpen ? (
            /* Controls for the Summary/Review state */
            <>
              <Button variant="secondary" onClick={onBackFromSummary} className="min-h-11 flex-1 rounded-lg py-2">
                Back
              </Button>
              <Button onClick={onSubmit} className="min-h-11 flex-[2] rounded-lg py-2">
                Confirm submission
              </Button>
            </>
          ) : (
            /* Controls for standard question navigation */
            <>
              <Button
                variant="secondary"
                onClick={onPrevious}
                disabled={isFirstQuestion}
                className="min-h-11 flex-1 rounded-lg py-2"
              >
                Previous
              </Button>
              {isLastQuestion ? (
                <Button onClick={onOpenSummary} className="min-h-11 flex-1 rounded-lg py-2">
                  Submit
                </Button>
              ) : (
                <Button onClick={onNext} className="min-h-11 flex-1 rounded-lg py-2">
                  Next
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressFooter;
