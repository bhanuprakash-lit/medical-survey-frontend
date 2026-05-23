const STAGE_FALLBACK_TITLE = 'General Survey';

/**
 * Sanitizes numeric values from API payloads.
 */
const toNumberOrFallback = (value, fallback) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

/**
 * Normalizes varied backend question types into a set of standard frontend keys.
 * Handles variations like 'open-ended' vs 'textarea' or 'star' vs 'rating'.
 */
const normalizeType = (rawType) => {
  const value = String(rawType || 'text')
    .trim()
    .toLowerCase()
    .replace(/[\s/-]+/g, '_');

  if (value.includes('rank')) return 'rank_top_3';
  if (value.includes('multi')) return 'multi_select';
  if (value.includes('single') || value.includes('radio')) return 'single_select';
  if (value.includes('rating') || value.includes('scale') || value.includes('star')) return 'rating';
  if (value.includes('open_ended') || value.includes('open-ended') || value.includes('open')) return 'textarea';
  if (value.includes('textarea') || value.includes('long_text')) return 'textarea';
  if (value.includes('numeric') || value.includes('number') || value.includes('integer')) return 'numeric';
  if (value.includes('yes_no') || value.includes('boolean') || value.includes('toggle')) return 'yes_no';
  if (value.includes('dropdown') || value === 'select') return 'dropdown';
  if (value.includes('observation') || value.includes('agent_note') || value.includes('internal_note')) return 'observation';
  if (value.includes('textarea') || value.includes('notes')) return 'textarea';
  return 'text';
};

/**
 * Converts strings to Title Case (e.g., "GENERAL_INFO" -> "General Info").
 */
const toTitleCase = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

/**
 * Normalizes individual options for select-type questions.
 * Ensures every option has a 'value', 'label', and unique 'id'.
 */
const normalizeOption = (option, index) => {
  if (typeof option === 'string') {
    return {
      value: option,
      label: option,
      id: `${option}-${index}`,
    };
  }

  const value = option?.value ?? option?.option_value ?? option?.label ?? option?.name ?? `option-${index}`;
  const label =
    option?.label ??
    option?.option_text ??
    option?.name ??
    option?.text ??
    String(value);

  return {
    value: String(value),
    label: String(label),
    id: option?.id ?? `${value}-${index}`,
    order: toNumberOrFallback(option?.option_order, index),
  };
};

/**
 * Infers survey stage details from varied question-level category fields.
 */
const inferStage = (question, index) => {
  const rawTitle =
    question.stage_title ||
    question.stage_name ||
    question.stage ||
    question.section_title ||
    question.section_name ||
    question.section ||
    question.category ||
    question.group ||
    question.module ||
    '';

  const title = rawTitle ? toTitleCase(rawTitle) : STAGE_FALLBACK_TITLE;
  const rawKey = question.stage_id || question.section_id || rawTitle || `stage-${index}`;

  return {
    id: String(rawKey).trim().toLowerCase().replace(/[\s/]+/g, '-'),
    title,
    order: Number(question.stage_order ?? question.section_order ?? index),
    description:
      question.stage_description ||
      question.section_description ||
      `Capture responses for ${title.toLowerCase()}.`,
  };
};

/**
 * Flattens nested stage-based payloads into a flat array of questions.
 * Handles API responses where questions are grouped in a 'questions' property.
 */
export const extractQuestionsFromPayload = (payload) => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.flatMap((entry, stageIndex) => {
    if (Array.isArray(entry?.questions)) {
      return entry.questions.map((question, questionIndex) => ({
        ...question,
        stage: question.stage || entry.stage || entry.stage_name || entry.stage_title,
        stage_name: question.stage_name || entry.stage_name || entry.stage,
        stage_title: question.stage_title || entry.stage_title || entry.stage,
        stage_order: question.stage_order ?? entry.stage_order ?? stageIndex,
        stage_description:
          question.stage_description ||
          entry.stage_description ||
          `Capture responses for ${toTitleCase(entry.stage || entry.stage_title || entry.stage_name || STAGE_FALLBACK_TITLE).toLowerCase()}.`,
        section_theme: question.section_theme || entry.section_theme || '',
        question_order: question.question_order ?? questionIndex,
      }));
    }

    return [entry];
  });
};

/**
 * The core normalization function.
 * Converts a raw API question object into the standardized internal format used by the UI.
 */
export const normalizeQuestion = (question, index) => {
  const stage = inferStage(question, index);
  const normalizedType = normalizeType(
    question.question_type || question.input_type || question.type
  );
  const rawRequired =
    question.is_required ??
    question.required ??
    question.mandatory ??
    question.is_mandatory;

  return {
    id: String(question.id ?? `question-${index}`),
    text: question.question_text || question.label || `Question ${index + 1}`,
    type: normalizedType,
    isRequired: Boolean(rawRequired),
    order: toNumberOrFallback(question.question_order, index),
    options: Array.isArray(question.options)
      ? [...question.options]
          .sort(
            (a, b) =>
              toNumberOrFallback(a?.option_order, Number.MAX_SAFE_INTEGER) -
              toNumberOrFallback(b?.option_order, Number.MAX_SAFE_INTEGER)
          )
          .map(normalizeOption)
      : [],
    helpText:
      question.help_text ||
      question.description ||
      ((normalizedType === 'textarea' || normalizedType === 'observation')
        ? (question.options?.[0]?.option_text || '')
        : ''),
    minSelection: toNumberOrFallback(
      question.min_selection ?? question.minSelection,
      normalizedType === 'rank_top_3' ? 3 : 0
    ),
    placeholder: question.placeholder || '',
    sectionTheme: question.section_theme || '',
    maxLength: toNumberOrFallback(question.max_length ?? question.maxLength, 0),
    questionCode: question.question_code || '',
    stage,
    raw: question,
  };
};

/**
 * Groups flat questions back into logical stages for the Sidebar and Summary views.
 */
export const buildStages = (questions) => {
  const stageMap = new Map();

  [...questions]
    .sort((a, b) => a.order - b.order)
    .forEach((question) => {
      const existingStage = stageMap.get(question.stage.id);
      if (!existingStage) {
        stageMap.set(question.stage.id, {
          id: question.stage.id,
          title: question.stage.title,
          description: question.stage.description,
          order: question.stage.order,
          questions: [question],
          requiredCount: question.isRequired ? 1 : 0,
        });
        return;
      }

      existingStage.questions.push(question);
      existingStage.requiredCount += question.isRequired ? 1 : 0;
    });

  return [...stageMap.values()].sort((a, b) => a.order - b.order);
};

/**
 * Checks if a question has been sufficiently answered.
 * Handles edge cases for arrays, ratings, and empty strings.
 */
export const hasQuestionAnswer = (question, answer) => {
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  if (question.type === 'rank_top_3') {
    return Array.isArray(answer) && answer.length > 0;
  }

  if (question.type === 'rating') {
    return Number(answer) > 0;
  }

  return String(answer ?? '').trim() !== '';
};

/**
 * Returns a localized error message if a question fails validation.
 * Checks for requirement, numeric validity, and minimum selection counts.
 */
export const getValidationMessage = (question, answer) => {
  if (question.isRequired && !hasQuestionAnswer(question, answer)) {
    return 'This question is required.';
  }

  if (question.type === 'numeric' && String(answer ?? '').trim() !== '' && Number.isNaN(Number(answer))) {
    return 'Enter a valid number.';
  }

  if (question.type === 'multi_select' && Array.isArray(answer) && question.minSelection > 0 && answer.length < question.minSelection) {
    return `Select at least ${question.minSelection} options.`;
  }

  if (question.type === 'rank_top_3') {
    const rankedAnswers = Array.isArray(answer) ? answer : [];
    const requiredCount = question.minSelection || 3;

    if (question.isRequired && rankedAnswers.length < requiredCount) {
      return `Rank your top ${requiredCount} choices to continue.`;
    }

    if (rankedAnswers.length > 0 && rankedAnswers.length < requiredCount) {
      return `Add ${requiredCount - rankedAnswers.length} more choice${requiredCount - rankedAnswers.length === 1 ? '' : 's'} to complete the ranking.`;
    }
  }

  return '';
};

/**
 * Returns a human-friendly label for internal question types.
 */
export const getQuestionTypeLabel = (type) =>
  ({
    single_select: 'Single Select',
    multi_select: 'Multi Select',
    rating: 'Rating',
    text: 'Text Input',
    textarea: 'Text Area',
    numeric: 'Numeric',
    yes_no: 'Yes / No',
    dropdown: 'Dropdown',
    observation: 'Observation',
    rank_top_3: 'Rank Top 3',
  }[type] || 'Response');

export const getQuestionLabel = (question) => question.text || `Question ${question.id}`;

/**
 * Calculates real-time progress for a specific stage.
 */
export const getStageProgress = (stage, answers) => {
  if (!stage) {
    return {
      answered: 0,
      requiredAnswered: 0,
      percent: 0,
    };
  }

  const answered = stage.questions.filter((question) =>
    hasQuestionAnswer(question, answers[question.id])
  ).length;
  const requiredAnswered = stage.questions.filter((question) =>
    question.isRequired && hasQuestionAnswer(question, answers[question.id])
  ).length;

  return {
    answered,
    requiredAnswered,
    percent: stage.questions.length ? Math.round((answered / stage.questions.length) * 100) : 0,
  };
};

/**
 * Calculates overall completion percentage for the entire survey.
 */
export const getCompletionPercentage = (questions, answers) => {
  if (!questions.length) {
    return 0;
  }

  const answeredCount = questions.filter((question) =>
    hasQuestionAnswer(question, answers[question.id])
  ).length;

  return Math.round((answeredCount / questions.length) * 100);
};

export const getNextStageId = (stages, currentStageId) => {
  const index = stages.findIndex((stage) => stage.id === currentStageId);
  if (index === -1 || index >= stages.length - 1) {
    return null;
  }
  return stages[index + 1].id;
};

export const getPreviousStageId = (stages, currentStageId) => {
  const index = stages.findIndex((stage) => stage.id === currentStageId);
  if (index <= 0) {
    return null;
  }
  return stages[index - 1].id;
};

/* --- LocalStorage Draft Helpers --- */

export const createDraftPayload = ({ answers, currentStageId, currentQuestionId, completionPercentage }) => ({
  answers,
  currentStageId,
  currentQuestionId,
  completionPercentage,
  updatedAt: new Date().toISOString(),
});

export const loadDraft = (key) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Draft load failed:', error);
    return null;
  }
};

export const removeDraft = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('Draft removal failed:', error);
  }
};

/**
 * Formats the save status state into a human-readable string.
 */
export const formatSaveStatus = (saveState) => {
  if (saveState.status === 'saving') return 'Saving draft...';
  if (saveState.status === 'error') return 'Save failed';
  if (saveState.lastSavedAt) {
    return `Saved ${new Date(saveState.lastSavedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }
  return 'Draft ready';
};

/**
 * Heuristically identifies the outlet/store name from captured answers.
 */
export const getOutletName = (questions, answers) => {
  const candidateQuestion = questions.find((question) => {
    const text = question.text.toLowerCase();
    return text.includes('outlet name') || text.includes('store name') || text.includes('shop name');
  });

  if (!candidateQuestion) {
    return '';
  }

  const answer = answers[candidateQuestion.id];
  return String(answer || '').trim();
};
