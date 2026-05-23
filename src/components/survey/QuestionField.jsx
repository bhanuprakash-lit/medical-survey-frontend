import { memo, useMemo, useState } from 'react';

const optionButtonBase =
  'min-h-11 w-full rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all duration-200';

const inputBase =
  'min-h-11 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-4';

const getInputStateClass = (error) =>
  error
    ? 'border-rose-300 bg-rose-50/70 focus:border-rose-500 focus:ring-rose-500/10'
    : 'border-slate-200 bg-white/90 focus:border-sky-500 focus:ring-sky-500/10';

const autosizeTextarea = (event) => {
  const element = event.target;
  element.style.height = 'auto';
  element.style.height = `${element.scrollHeight}px`;
};

/**
 * QuestionField Component
 * The heavy-lifter of the survey UI. Dynamically renders the correct input type 
 * based on the question definition (e.g., single select, rating, rank top 3).
 */
const QuestionField = ({ question, value, onChange, error }) => {
  const [query, setQuery] = useState(''); // Used for searchable dropdowns
  const options = useMemo(() => question.options || [], [question.options]);

  // Filters options for searchable dropdowns
  const filteredOptions = useMemo(() => {
    if (question.type !== 'dropdown' || options.length <= 7 || !query.trim()) {
      return options;
    }

    const term = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, query, question.type]);

  // Logic for Multi-Select (Toggle values in array)
  const updateMultiSelect = (optionValue) => {
    const currentValues = Array.isArray(value) ? value : [];
    const nextValues = currentValues.includes(optionValue)
      ? currentValues.filter((item) => item !== optionValue)
      : [...currentValues, optionValue];

    onChange(question, nextValues);
  };

  // Logic for Ranking (Select up to 3 and manage order)
  const updateRankChoice = (optionValue) => {
    const currentValues = Array.isArray(value) ? value : [];

    if (currentValues.includes(optionValue)) {
      onChange(
        question,
        currentValues.filter((item) => item !== optionValue)
      );
      return;
    }

    if (currentValues.length >= 3) {
      onChange(question, [...currentValues.slice(1), optionValue]);
      return;
    }

    onChange(question, [...currentValues, optionValue]);
  };

  // Reorder ranked items
  const moveRankChoice = (optionValue, direction) => {
    const currentValues = Array.isArray(value) ? [...value] : [];
    const currentIndex = currentValues.indexOf(optionValue);

    if (currentIndex === -1) {
      return;
    }

    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= currentValues.length) {
      return;
    }

    [currentValues[currentIndex], currentValues[nextIndex]] = [
      currentValues[nextIndex],
      currentValues[currentIndex],
    ];

    onChange(question, currentValues);
  };

  /* --- Render Helpers for specific input types --- */

  const renderSingleSelect = () => (
    <div className="grid gap-2">
      {options.map((option) => {
        const checked = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(question, option.value)}
            className={`${optionButtonBase} ${
              checked
                ? 'border-sky-400 bg-sky-50 text-sky-800 shadow-[0_18px_30px_-24px_rgba(14,116,201,0.72)]'
                : 'border-slate-200 bg-white/85 text-slate-700 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span>{option.label}</span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
                  checked ? 'border-sky-500 bg-sky-500 text-white scale-110' : 'border-slate-300 scale-100'
                }`}
              >
                {checked && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderMultiSelect = () => {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <div className="space-y-2">
        <div className="grid gap-2">
          {options.map((option) => {
            const checked = selectedValues.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateMultiSelect(option.value)}
                className={`${optionButtonBase} ${
                  checked
                    ? 'border-sky-300 bg-sky-50 text-sky-800'
                    : 'border-slate-200 bg-white/85 text-slate-700 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{option.label}</span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-300 ${
                      checked
                        ? 'border-sky-500 bg-sky-500 text-white scale-110'
                        : 'border-slate-300 scale-100'
                    }`}
                  >
                    {checked && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {selectedValues.length ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedValues.map((selectedValue) => {
              const label =
                options.find((option) => option.value === selectedValue)?.label || selectedValue;

              return (
                <span
                  key={selectedValue}
                  className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700"
                >
                  {label}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  const renderRating = () => (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* 5-Star Rating System */}
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => {
          const active = Number(value) >= rating;
          const isCurrent = Number(value) === rating;

          return (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(question, rating)}
              className={`group relative flex h-11 w-11 items-center justify-center transition-all duration-300 active:scale-90 ${
                isCurrent ? 'scale-125' : 'scale-100'
              }`}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill={active ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-colors duration-300 ${
                  active ? 'text-amber-400' : 'text-slate-300 group-hover:text-amber-200'
                }`}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          );
        })}
      </div>
      
      {value && (
        <div className="rounded-md bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 animate-in fade-in zoom-in duration-300">
          Rating: {value} / 5
        </div>
      )}
    </div>
  );

  const renderInput = () => (
    <input
      type="text"
      value={value || ''}
      onChange={(event) => onChange(question, event.target.value)}
      placeholder={question.placeholder || 'Type your answer'}
      maxLength={question.maxLength || undefined}
      className={`${inputBase} ${getInputStateClass(error)}`}
    />
  );

  const renderTextArea = (rows = 5, label = 'Detailed response') => {
    const textValue = value || '';

    return (
      <div className="space-y-2">
        <textarea
          rows={rows}
          value={textValue}
          onChange={(event) => onChange(question, event.target.value)}
          onInput={autosizeTextarea} // Auto-expands as user types
          placeholder={question.placeholder || 'Add your notes here'}
          maxLength={question.maxLength || undefined}
          className={`min-h-24 w-full resize-none overflow-hidden rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-4 ${getInputStateClass(error)}`}
        />
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          <span>{question.maxLength ? `Limit ${question.maxLength} characters` : label}</span>
          <span>{textValue.length} characters</span>
        </div>
      </div>
    );
  };

  const renderDropdown = () => (
    <div className="space-y-3">
      {/* Search Input for large option lists */}
      {options.length > 7 ? (
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search options"
          className={`min-h-11 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-4 ${getInputStateClass(error)}`}
        />
      ) : null}

      <select
        value={value || ''}
        onChange={(event) => onChange(question, event.target.value)}
        className={`${inputBase} ${getInputStateClass(error)}`}
      >
        <option value="">Select an option</option>
        {filteredOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderRankTop3 = () => {
    const rankedValues = Array.isArray(value) ? value : [];
    const selectedOptions = rankedValues
      .map((rankedValue) => options.find((option) => option.value === rankedValue))
      .filter(Boolean);
    const availableOptions = options.filter((option) => !rankedValues.includes(option.value));

    return (
      <div className="space-y-4">
        {/* Ranked Slots Section */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Top 3 Ranking
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-700">
                Select three choices, then adjust their order.
              </div>
            </div>
            <div className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">
              {rankedValues.length}/3 selected
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {[0, 1, 2].map((slotIndex) => {
              const option = selectedOptions[slotIndex];

              return (
                <div
                  key={`rank-slot-${slotIndex}`}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                    option
                      ? 'border-sky-200 bg-white text-slate-800'
                      : 'border-dashed border-slate-300 bg-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                      {slotIndex + 1}
                    </div>
                    <div className="text-xs font-semibold">
                      {option ? option.label : `Add choice ${slotIndex + 1}`}
                    </div>
                  </div>

                  {option ? (
                    /* Ranking Management Controls (Up, Down, Remove) */
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveRankChoice(option.value, 'up')}
                        disabled={slotIndex === 0}
                        className="min-h-8 rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRankChoice(option.value, 'down')}
                        disabled={slotIndex === selectedOptions.length - 1}
                        className="min-h-8 rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRankChoice(option.value)}
                        className="min-h-8 rounded-md border border-rose-200 bg-rose-50 px-2 text-xs font-bold text-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Options to Select From */}
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Available choices
          </div>
          <div className="grid gap-2">
            {availableOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateRankChoice(option.value)}
                className={`${optionButtonBase} border-slate-200 bg-white/85 text-slate-700 hover:border-slate-300 hover:bg-white`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{option.label}</span>
                  <span className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Add
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* --- Main Switch for Question Types --- */
  switch (question.type) {
    case 'single_select':
      return renderSingleSelect();
    case 'multi_select':
      return renderMultiSelect();
    case 'rating':
      return renderRating();
    case 'textarea':
      return renderTextArea(5, 'Detailed response');
    case 'dropdown':
      return renderDropdown();
    case 'observation':
      return renderTextArea(6, 'Internal note for the survey agent');
    case 'rank_top_3':
      return renderRankTop3();
    case 'numeric':
      return (
        <input
          type="text"
          inputMode="decimal"
          value={value || ''}
          onChange={(event) => onChange(question, event.target.value)}
          placeholder={question.placeholder || 'Enter a number'}
          className={`${inputBase} ${getInputStateClass(error)}`}
        />
      );
    case 'text':
    default:
      return renderInput();
  }
};

export default memo(QuestionField);
