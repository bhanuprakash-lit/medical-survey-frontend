import { memo } from 'react';
import QuestionField from './QuestionField';
import { getQuestionTypeLabel } from '../../utils/survey';

/**
 * QuestionCard Component
 * Wraps an individual survey question with metadata (index, type, required status).
 * Handles the visual container, error banners, and renders the specific QuestionField.
 */
const QuestionCard = ({ 
  question, 
  index, 
  totalQuestions, 
  value, 
  error,          // Validation error message if present
  onChange, 
  registerRef     // Ref callback for smooth scrolling to this question
}) => {
  return (
    <article
      ref={registerRef}
      className={`max-h-[calc(100svh-14.5rem)] overflow-y-auto rounded-lg border p-3 shadow-[0_14px_28px_-24px_rgba(15,35,63,0.16)] transition-all duration-200 ${
        error
          ? 'border-rose-200 bg-rose-50/70'
          : 'border-slate-100 bg-white'
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2 w-full">
            {/* Metadata Badges: Question Number, Type, and Requirement */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Q{index + 1}
              </div>
              <div className="rounded-md border border-slate-200 bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                {getQuestionTypeLabel(question.type)}
              </div>
              {question.isRequired ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-rose-700">
                  Required
                </div>
              ) : null}
            </div>

            {/* Local Error Banner */}
            {error ? (
              <div className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 animate-in fade-in slide-in-bottom duration-300">
                {error}
              </div>
            ) : null}

            <div>
              {/* Question Text & Internal Code */}
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                {question.questionCode ? (
                  <div className="w-fit shrink-0 rounded-md border border-sky-100 bg-sky-50/80 px-2 py-1 text-[11px] font-bold tracking-wide text-sky-700">
                    {question.questionCode}
                  </div>
                ) : null}
                <h3 className="text-lg font-black leading-6 text-slate-900">
                  {question.text}
                </h3>
              </div>
              {question.helpText ? (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {question.helpText}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* The actual input field (dynamically rendered based on type) */}
        <QuestionField
          question={question}
          value={value}
          error={error}
          onChange={onChange}
        />
      </div>
    </article>
  );
};

export default memo(QuestionCard);
