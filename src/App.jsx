import { useEffect, useMemo, useRef, useState } from 'react';
import SurveyHeader from './components/survey/SurveyHeader';
import QuestionCard from './components/survey/QuestionCard';
import ProgressFooter from './components/survey/ProgressFooter';
import SurveySummary from './components/survey/SurveySummary';
import StageTransition from './components/survey/StageTransition';
import SubmissionsDashboard from './screens/admin/SubmissionsDashboard';
import AdminLogin from './screens/admin/AdminLogin';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  SubmissionModal,
  SuccessState,
} from './components/survey/SurveyStates';
import MobileLayout from './layouts/MobileLayout';
import { AUTH_STORAGE_KEY, ENDPOINTS, authHeaders } from './config/api';
import SurveyTaker from './screens/SurveyTaker';
import StoreDetails from './screens/StoreDetails';
import {
  buildStages,
  createDraftPayload,
  formatSaveStatus,
  getCompletionPercentage,
  getOutletName,
  getQuestionLabel,
  getStageProgress,
  getValidationMessage,
  hasQuestionAnswer,
  loadDraft,
  normalizeQuestion,
  extractQuestionsFromPayload,
  removeDraft,
} from './utils/survey';

// --- Configuration & Persistence Keys ---
const DRAFT_KEY = 'kirana-ai-survey-draft-v1';
const ACTIVE_SESSION_KEY = 'kirana-ai-active-session';
const SURVEYOR_KEY = 'kirana-ai-surveyor-v1';

function App() {
  // --- State: User & Flow Context ---
  const [surveyorContext, setSurveyorContext] = useState(() => {
    try {
      const stored = window.localStorage.getItem(SURVEYOR_KEY);
      return stored ? JSON.parse(stored) : { surveyorId: null, surveyorName: '', token: '' };
    } catch (e) {
      return { surveyorId: null, surveyorName: '', token: '' };
    }
  });

  const [flowStep, setFlowStep] = useState(() => {
    try {
      const storedSurveyor = window.localStorage.getItem(SURVEYOR_KEY);
      const storedSession = window.localStorage.getItem(ACTIVE_SESSION_KEY);
      const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth && storedSession) return 'survey';
      if (storedAuth && storedSurveyor) return 'store';
      return 'surveyor';
    } catch (e) {
      return 'surveyor';
    }
  });

  // --- State: Survey Data & Progress ---
  const [activeSession, setActiveSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionRecord, setSubmissionRecord] = useState(null);
  const [transitionStageId, setTransitionStageId] = useState(null);

  // --- State: System Status ---
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [saveState, setSaveState] = useState({
    status: 'idle',
    lastSavedAt: null,
  });
  const [draftReady, setDraftReady] = useState(false);
  
  // --- State: Admin Management ---
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Simple URL routing for Admin access
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setIsAdminView(true);
    }
  }, []);

  // --- Refs: DOM & Logic Tracking ---
  const questionRefs = useRef({});
  const surveyScrollRef = useRef(null);
  const hydratedDraftRef = useRef(false);
  const previousSerializedAnswersRef = useRef('');

  // --- Memoized Derived Data ---
  // Normalizes raw question data from API into a consistent format
  const normalizedQuestions = useMemo(
    () => questions.map((question, index) => normalizeQuestion(question, index)),
    [questions]
  );

  // Groups questions into logical survey stages (e.g., "General Info", "Inventory")
  const stages = useMemo(() => buildStages(normalizedQuestions), [normalizedQuestions]);

  // Ensures questions are processed in their intended sequence
  const orderedQuestions = useMemo(
    () => [...normalizedQuestions].sort((a, b) => a.order - b.order),
    [normalizedQuestions]
  );

  // Finds the current question object based on active ID
  const currentQuestion = useMemo(
    () =>
      orderedQuestions.find((question) => question.id === currentQuestionId) ||
      orderedQuestions[0] ||
      null,
    [currentQuestionId, orderedQuestions]
  );

  const currentQuestionIndex = useMemo(
    () => orderedQuestions.findIndex((question) => question.id === currentQuestion?.id),
    [currentQuestion?.id, orderedQuestions]
  );

  const currentStage = useMemo(
    () =>
      stages.find((stage) => stage.id === currentQuestion?.stage.id) ||
      stages[0] ||
      null,
    [currentQuestion?.stage.id, stages]
  );

  // Calculates overall progress percentage
  const completionPercentage = useMemo(
    () => getCompletionPercentage(normalizedQuestions, answers),
    [normalizedQuestions, answers]
  );

  const outletName = useMemo(
    () => activeSession?.store_name || getOutletName(normalizedQuestions, answers),
    [activeSession?.store_name, normalizedQuestions, answers]
  );

  // --- Effect: Restore Active Session ---
  useEffect(() => {
    if (flowStep !== 'survey' || activeSession) {
      return;
    }

    try {
      const storedSession = window.localStorage.getItem(ACTIVE_SESSION_KEY);
      if (storedSession) {
        setActiveSession(JSON.parse(storedSession));
      }
    } catch (error) {
      console.error('Session load failed:', error);
    }
  }, [activeSession, flowStep]);

  // --- Effect: Fetch Survey Questions ---
  useEffect(() => {
    if (flowStep !== 'survey') {
      setLoading(false);
      return undefined;
    }

    const abortController = new AbortController();

    const fetchQuestions = async () => {
      setLoading(true);
      setFetchError('');

      try {
        const response = await fetch(ENDPOINTS.GET_SURVEY_QUESTIONS, {
          method: 'GET',
          headers: authHeaders({
            Accept: 'application/json',
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const payload = extractQuestionsFromPayload(data);
        setQuestions(payload);

        // Load draft data from LocalStorage if it exists
        const draft = loadDraft(DRAFT_KEY);

        if (draft?.answers && typeof draft.answers === 'object') {
          setAnswers(draft.answers);
          previousSerializedAnswersRef.current = JSON.stringify(draft.answers);
        } else {
          setAnswers({});
          previousSerializedAnswersRef.current = '';
        }

        const nextOrderedQuestions = payload.map((q, i) => normalizeQuestion(q, i))
          .sort((a, b) => a.order - b.order);

        // Restore user's last position in the survey
        if (
          draft?.currentQuestionId &&
          nextOrderedQuestions.some((question) => question.id === draft.currentQuestionId)
        ) {
          setCurrentQuestionId(draft.currentQuestionId);
        } else {
          setCurrentQuestionId(nextOrderedQuestions[0]?.id || null);
        }

        hydratedDraftRef.current = true;
        setDraftReady(true);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Survey question fetch failed:', error);
          setFetchError('We could not load the survey questions. Check the connection and retry.');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchQuestions();

    return () => abortController.abort();
  }, [flowStep]);

  // --- Effect: Automatic Draft Saving ---
  useEffect(() => {
    if (!draftReady) {
      return undefined;
    }

    const serializedAnswers = JSON.stringify(answers);
    const stageId = currentStage?.id || stages[0]?.id || null;
    const questionId = currentQuestionId || orderedQuestions[0]?.id || null;
    
    // Check if anything has actually changed before saving
    const hasChanges =
      serializedAnswers !== previousSerializedAnswersRef.current ||
      stageId !== loadDraft(DRAFT_KEY)?.currentStageId ||
      questionId !== loadDraft(DRAFT_KEY)?.currentQuestionId;

    if (!hasChanges) {
      return undefined;
    }

    setSaveState((prev) => ({ ...prev, status: 'saving' }));

    // Debounced save to avoid excessive LocalStorage writes
    const saveTimer = window.setTimeout(() => {
      try {
        const payload = createDraftPayload({
          answers,
          currentStageId: stageId,
          currentQuestionId: questionId,
          completionPercentage,
        });
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
        previousSerializedAnswersRef.current = serializedAnswers;
        setSaveState({
          status: 'saved',
          lastSavedAt: payload.updatedAt,
        });
      } catch (error) {
        console.error('Draft save failed:', error);
        setSaveState((prev) => ({
          ...prev,
          status: 'error',
        }));
      }
    }, 450);

    return () => window.clearTimeout(saveTimer);
  }, [answers, completionPercentage, currentQuestionId, currentStage?.id, draftReady, orderedQuestions, stages]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (saveState.status === 'saving') {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveState.status]);

  // --- Handlers: Survey Interaction ---
  const updateAnswer = (question, value) => {
    let nextValue = value;

    if (question.type === 'numeric') {
      nextValue = String(value).replace(/[^\d.]/g, '');
    }

    setAnswers((prev) => ({
      ...prev,
      [question.id]: nextValue,
    }));

    // Clear error message once user starts typing
    setErrors((prev) => {
      if (!prev[question.id]) {
        return prev;
      }
      const nextErrors = { ...prev };
      delete nextErrors[question.id];
      return nextErrors;
    });
  };

  // Scrolls smoothly to a specific question, useful for validation errors
  const scrollToQuestion = (questionId) => {
    const scrollContainer = surveyScrollRef.current;
    const element = questionRefs.current[questionId];
    if (element) {
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const topOffset = elementRect.top - containerRect.top + scrollContainer.scrollTop - 16;
        scrollContainer.scrollTo({ top: Math.max(topOffset, 0), behavior: 'smooth' });
      } else {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const firstFocusable = element.querySelector('input, textarea, button, select');
      if (firstFocusable) {
        firstFocusable.focus({ preventScroll: true });
      }
    }
  };

  // Validates a single question against its requirements
  const validateQuestion = (question) => {
    if (!question) {
      return true;
    }

    const message = getValidationMessage(question, answers[question.id]);

    setErrors((prev) => {
      const nextErrors = { ...prev };
      if (message) {
        nextErrors[question.id] = message;
      } else {
        delete nextErrors[question.id];
      }
      return nextErrors;
    });

    if (message) {
      scrollToQuestion(question.id);
      return false;
    }

    return true;
  };

  // Validates every question in the survey (used before final submission)
  const validateAllStages = () => {
    const nextErrors = {};

    stages.forEach((stage) => {
      stage.questions.forEach((question) => {
        const message = getValidationMessage(question, answers[question.id]);
        if (message) {
          nextErrors[question.id] = message;
        }
      });
    });

    setErrors(nextErrors);

    const firstInvalidStage = stages.find((stage) =>
      stage.questions.some((question) => nextErrors[question.id])
    );

    if (firstInvalidStage) {
      setIsSummaryOpen(false);
      const invalidQuestion = firstInvalidStage.questions.find(
        (question) => nextErrors[question.id]
      );
      if (invalidQuestion) {
        setCurrentQuestionId(invalidQuestion.id);
        window.setTimeout(() => scrollToQuestion(invalidQuestion.id), 80);
      }
      return false;
    }

    return true;
  };

  // Navigation: Move to next question or open summary
  const goToNext = () => {
    if (!currentQuestion) {
      return;
    }

    // Ensure the question is answered before moving to the next one
    if (!hasQuestionAnswer(currentQuestion, answers[currentQuestion.id])) {
      setErrors((prev) => ({
        ...prev,
        [currentQuestion.id]: 'Please answer the question before you move.',
      }));
      return;
    }

    const questionIsValid = validateQuestion(currentQuestion);
    if (!questionIsValid) {
      return;
    }

    const nextQuestion = orderedQuestions[currentQuestionIndex + 1];
    if (nextQuestion) {
      if (nextQuestion.stage.id !== currentQuestion.stage.id) {
        setTransitionStageId(nextQuestion.stage.id);
        window.setTimeout(() => {
          setTransitionStageId((stageId) =>
            stageId === nextQuestion.stage.id ? null : stageId
          );
        }, 1250);
      }
      setCurrentQuestionId(nextQuestion.id);
      surveyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSummaryOpen(true);
  };

  // Navigation: Move to previous question
  const goToPrevious = () => {
    if (!currentQuestion) {
      return;
    }

    const previousQuestion = orderedQuestions[currentQuestionIndex - 1];
    if (previousQuestion) {
      setCurrentQuestionId(previousQuestion.id);
      surveyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Resets all survey state and clears drafts
  const resetSurvey = () => {
    removeDraft(DRAFT_KEY);
    try {
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch (error) {
      console.error('Session removal failed:', error);
    }
    hydratedDraftRef.current = false;
    previousSerializedAnswersRef.current = '';
    setAnswers({});
    setErrors({});
    setQuestions([]);
    setCurrentQuestionId(null);
    setSubmissionRecord(null);
    setIsSummaryOpen(false);
    setShowSubmitModal(false);
    setSaveState({
      status: 'idle',
      lastSavedAt: null,
    });
    setActiveSession(null);
  };

  const handleClearSurveyor = () => {
    try {
      window.localStorage.removeItem(SURVEYOR_KEY);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Surveyor removal failed:', error);
    }
    setSurveyorContext({ surveyorId: null, surveyorName: '', token: '' });
  };

  // --- Final Submission Logic ---
  const confirmSubmission = async () => {
    if (!validateAllStages()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare the payload in the format expected by the backend
      const formattedResponses = normalizedQuestions
        .filter((q) => hasQuestionAnswer(q, answers[q.id]))
        .map((q) => {
          const rawAnswer = answers[q.id];
          let answerArray = [];

          if (Array.isArray(rawAnswer)) {
            answerArray = rawAnswer.map(String);
          } else if (rawAnswer !== undefined && rawAnswer !== null) {
            answerArray = [String(rawAnswer)];
          }

          return {
            question_id: parseInt(q.id, 10),
            answers: answerArray,
          };
        });

      const payload = {
        store_id: activeSession?.store_id || 0,
        session_id: activeSession?.session_id || activeSession?.id || "",
        responses: formattedResponses,
      };

      const response = await fetch(ENDPOINTS.SUBMIT_SURVEY, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Submission failed');
      }

      const now = new Date().toISOString();
      const displayId = activeSession?.store_id || 'N/A';

      setSubmissionRecord({
        surveyId: displayId,
        submittedAt: now,
        totalQuestions: normalizedQuestions.length,
        answeredQuestions: formattedResponses.length,
      });

      setShowSubmitModal(false);
      setIsSummaryOpen(false);
      removeDraft(DRAFT_KEY);
      try {
        window.localStorage.removeItem(ACTIVE_SESSION_KEY);
      } catch (error) {
        console.error('Session removal failed:', error);
      }
      setActiveSession(null);
      setSaveState({
        status: 'saved',
        lastSavedAt: now,
      });
    } catch (error) {
      console.error('Final submission error:', error);
      // alert(`Submission failed: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const errorSummary = currentQuestion
    ? [currentQuestion]
        .filter((question) => errors[question.id])
        .map((question) => ({
          id: question.id,
          label: getQuestionLabel(question),
          message: errors[question.id],
        }))
    : [];

  if (isAdminView) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin 
          onLogin={() => setIsAdminAuthenticated(true)} 
          onBack={() => {
            setIsAdminView(false);
            window.history.pushState({}, '', '/');
          }} 
        />
      );
    }
    return <SubmissionsDashboard onBack={() => {
      setIsAdminView(false);
      setIsAdminAuthenticated(false);
      window.history.pushState({}, '', '/');
    }} />;
  }

  if (flowStep === 'surveyor') {
    return (
      <MobileLayout>
        <div className="relative">
          {/* Double-tap the top-right corner to open the Admin Panel - Currently Disabled */}
          {/* 
          <div 
            onDoubleClick={() => setIsAdminView(true)}
            className="absolute top-0 right-0 h-16 w-16 z-50 cursor-default"
            title="Double-click for Admin Access"
          />
          */}
          <SurveyTaker
            onComplete={(surveyorId, surveyorName, token) => {
              const context = { surveyorId, surveyorName, token };
              try {
                window.localStorage.setItem(SURVEYOR_KEY, JSON.stringify(context));
              } catch (e) {
                console.error('Failed to save surveyor:', e);
              }
              setSurveyorContext(context);
              setFlowStep('store');
            }}
          />
        </div>
      </MobileLayout>
    );
  }

  if (flowStep === 'store') {
    return (
      <MobileLayout>
        <StoreDetails
          surveyorId={surveyorContext.surveyorId}
          surveyorName={surveyorContext.surveyorName}
          onComplete={(action) => {
            if (action === 'back') {
              handleClearSurveyor();
              setFlowStep('surveyor');
              return;
            }

            setActiveSession(action);
            setFlowStep('survey');
          }}
        />
      </MobileLayout>
    );
  }

  if (submissionRecord) {
    return (
      <MobileLayout>
        <SuccessState
          submissionRecord={submissionRecord}
          onStartNew={() => {
            resetSurvey();
            setFlowStep('store');
          }}
          onChangeSurveyor={() => {
            resetSurvey();
            handleClearSurveyor();
            setFlowStep('surveyor');
          }}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {loading ? (
        <LoadingState />
      ) : fetchError ? (
        <ErrorState
          message={fetchError}
          onRetry={() => window.location.reload()}
        />
      ) : !normalizedQuestions.length ? (
        <EmptyState />
      ) : (
        <div className="flex h-full min-h-0 flex-col bg-[#f6f9fc]">
          <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <SurveyHeader
              title="Survey Questions"
              outletName={outletName}
              progress={completionPercentage}
              saveStatus={formatSaveStatus(saveState)}
              online={online}
              currentStage={currentStage}
              stages={stages}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={orderedQuestions.length}
            />

            <div
              ref={surveyScrollRef}
              className="scrollbar-hidden flex-1 overflow-y-auto px-3 pb-28 pt-2"
            >
              {isSummaryOpen ? (
                <SurveySummary
                  stages={stages}
                  answers={answers}
                  errors={errors}
                  onBack={() => setIsSummaryOpen(false)}
                  onSubmit={() => {
                    if (validateAllStages()) {
                      setShowSubmitModal(true);
                    }
                  }}
                />
              ) : (
                <div className="mx-auto flex min-h-full w-full max-w-[430px] items-start justify-center py-2">
                  <div className="w-full animate-in fade-in slide-in-bottom">
                    <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-[0_18px_40px_-34px_rgba(15,35,63,0.34)]">
                      <div className="flex flex-col gap-2">
                        {currentQuestion ? (
                          <QuestionCard
                            key={currentQuestion.id}
                            question={currentQuestion}
                            index={currentQuestionIndex}
                            totalQuestions={orderedQuestions.length}
                            value={answers[currentQuestion.id]}
                            error={errors[currentQuestion.id]}
                            onChange={updateAnswer}
                            registerRef={(element) => {
                              questionRefs.current[currentQuestion.id] = element;
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ProgressFooter
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={orderedQuestions.length}
              saveStatus={formatSaveStatus(saveState)}
              isSummaryOpen={isSummaryOpen}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onOpenSummary={() => setIsSummaryOpen(true)}
              onBackFromSummary={() => setIsSummaryOpen(false)}
              onSubmit={() => {
                if (validateAllStages()) {
                  setShowSubmitModal(true);
                }
              }}
            />

            <SubmissionModal
              open={showSubmitModal}
              stages={stages}
              answers={answers}
              onClose={() => setShowSubmitModal(false)}
              onConfirm={confirmSubmission}
            />
            <StageTransition
              visible={Boolean(transitionStageId)}
              stage={stages.find((stage) => stage.id === transitionStageId)}
              stageIndex={Math.max(0, stages.findIndex((stage) => stage.id === transitionStageId))}
              totalStages={stages.length}
            />
          </section>
        </div>
      )}
    </MobileLayout>
  );
}

export default App;
