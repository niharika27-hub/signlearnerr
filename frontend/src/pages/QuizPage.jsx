import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookCheck, CheckCircle2, CircleCheckBig, Clock3, Crosshair, Target } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";
import { Particles } from "@/components/ui/particles";
import learningContent from "@/data/learning-content.json";
import { completeLesson, getApiErrorMessage, getQuizAttempts, saveQuizAttempt } from "@/lib/authApi";

const modes = [
  {
    id: "speed",
    title: "Speed Quiz",
    detail: "5 quick questions to sharpen reaction speed",
    icon: Clock3,
    questionCount: 5,
  },
  {
    id: "accuracy",
    title: "Accuracy Quiz",
    detail: "8 questions focused on precision and consistency",
    icon: Target,
    questionCount: 8,
  },
  {
    id: "scenario",
    title: "Scenario Quiz",
    detail: "6 context questions for real-world signing situations",
    icon: BookCheck,
    questionCount: 6,
  },
];

function toQuestionBank() {
  const modules = Array.isArray(learningContent?.modules) ? learningContent.modules : [];

  return modules.flatMap((module) => {
    const categories = Array.isArray(module?.categories) ? module.categories : [];

    return categories.flatMap((category) => {
      const lessons = Array.isArray(category?.lessons) ? category.lessons : [];

      return lessons
        .filter((lesson) => lesson?.quiz?.question && Array.isArray(lesson?.quiz?.options))
        .map((lesson) => ({
          id: lesson.lessonKey || `${module.moduleKey}-${category.categoryKey}-${lesson.title}`,
          moduleTitle: module.title || "Module",
          lessonTitle: lesson.title || "Lesson",
          question: lesson.quiz.question,
          options: lesson.quiz.options,
          correctOptionIndex: Number(lesson.quiz.correctOptionIndex ?? -1),
          explanation: lesson.quiz.explanation || "",
        }))
        .filter((entry) => entry.correctOptionIndex >= 0 && entry.correctOptionIndex < entry.options.length);
    });
  });
}

function shuffleArray(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }
  return copy;
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeAttempt(input = {}) {
  const completedAt = input?.completedAt ? new Date(input.completedAt).toISOString() : new Date().toISOString();
  const stableId =
    input?._id ||
    input?.id ||
    `${input?.modeId || "quiz"}-${completedAt}-${input?.score ?? 0}-${input?.correctCount ?? 0}`;

  return {
    id: String(stableId),
    modeId: String(input?.modeId || "unknown"),
    modeTitle: String(input?.modeTitle || "Quiz"),
    score: Number(input?.score ?? 0),
    correctCount: Number(input?.correctCount ?? 0),
    totalQuestions: Number(input?.totalQuestions ?? 0),
    syncedToProgress: Boolean(input?.syncedToProgress),
    lessonId: input?.lessonId ? String(input.lessonId) : null,
    lessonTitle: input?.lessonTitle ? String(input.lessonTitle) : null,
    completedAt,
  };
}

function QuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lessonId") || "";
  const lessonTitle = searchParams.get("lessonTitle") || "";

  const [selectedModeId, setSelectedModeId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);

  const questionBank = useMemo(() => toQuestionBank(), []);

  const scopedQuestionBank = useMemo(() => {
    if (!lessonTitle) {
      return questionBank;
    }

    const normalizedLessonTitle = lessonTitle.trim().toLowerCase();
    const filteredQuestions = questionBank.filter(
      (entry) => entry.lessonTitle.trim().toLowerCase() === normalizedLessonTitle
    );

    return filteredQuestions.length > 0 ? filteredQuestions : questionBank;
  }, [lessonTitle, questionBank]);

  const selectedMode = useMemo(
    () => modes.find((entry) => entry.id === selectedModeId) || null,
    [selectedModeId]
  );

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(questions.length - answeredCount, 0);

  const activeQuestion = questions[currentQuestionIndex] || null;

  useEffect(() => {
    let isDisposed = false;

    async function loadAttempts() {
      try {
        const response = await getQuizAttempts(5);
        const attempts = Array.isArray(response?.data?.attempts)
          ? response.data.attempts.map(normalizeAttempt)
          : [];

        if (!isDisposed) {
          setRecentAttempts(attempts);
        }
      } catch (_error) {
        if (!isDisposed) {
          setRecentAttempts([]);
        }
      }
    }

    loadAttempts();

    return () => {
      isDisposed = true;
    };
  }, []);

  function resetQuizState() {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFeedbackMessage("");
    setSubmitting(false);
    setResult(null);
  }

  function startMode(mode) {
    const pickedQuestions = shuffleArray(scopedQuestionBank).slice(0, mode.questionCount);
    setSelectedModeId(mode.id);
    setQuestions(pickedQuestions);
    resetQuizState();
  }

  async function handleSubmitQuiz() {
    if (!questions.length) {
      setFeedbackMessage("No quiz questions are available yet.");
      return;
    }

    const unansweredQuestionCount = questions.reduce(
      (count, _question, index) => (answers[index] === undefined ? count + 1 : count),
      0
    );

    if (unansweredQuestionCount > 0) {
      setFeedbackMessage(`Please answer all questions before submitting (${unansweredQuestionCount} left).`);
      return;
    }

    const correctCount = questions.reduce(
      (count, question, index) => (answers[index] === question.correctOptionIndex ? count + 1 : count),
      0
    );
    const score = Math.round((correctCount / questions.length) * 100);

    const questionReview = questions.map((question, index) => {
      const selectedOptionIndex = Number(answers[index]);
      const isCorrect = selectedOptionIndex === question.correctOptionIndex;

      return {
        id: question.id,
        question: question.question,
        selectedOptionIndex,
        selectedOption: question.options[selectedOptionIndex] || "Not answered",
        correctOptionIndex: question.correctOptionIndex,
        correctOption: question.options[question.correctOptionIndex] || "",
        explanation: question.explanation || "",
        isCorrect,
      };
    });

    let syncMessage = "Quiz completed in practice mode. Open a lesson quiz to sync score with progress.";
    let syncedToProgress = false;

    if (lessonId) {
      try {
        setSubmitting(true);
        await completeLesson(lessonId, score);
        syncedToProgress = true;
        syncMessage = lessonTitle
          ? `Score saved and progress updated for ${lessonTitle}.`
          : "Score saved and progress updated successfully.";
      } catch (error) {
        syncMessage = getApiErrorMessage(error, "Quiz submitted, but progress sync failed.");
      } finally {
        setSubmitting(false);
      }
    }

    const attemptRecord = normalizeAttempt({
      id: `attempt-${Date.now()}`,
      modeId: selectedMode?.id || "unknown",
      modeTitle: selectedMode?.title || "Quiz",
      score,
      correctCount,
      totalQuestions: questions.length,
      syncedToProgress,
      lessonId: lessonId || null,
      lessonTitle: lessonTitle || null,
      completedAt: new Date().toISOString(),
    });

    try {
      const saveResponse = await saveQuizAttempt(attemptRecord);
      const savedAttempt = saveResponse?.data?.attempt
        ? normalizeAttempt(saveResponse.data.attempt)
        : attemptRecord;
      const serverAttempts = Array.isArray(saveResponse?.data?.recentAttempts)
        ? saveResponse.data.recentAttempts.map(normalizeAttempt)
        : [];

      setRecentAttempts(serverAttempts.length > 0 ? serverAttempts.slice(0, 5) : [savedAttempt]);
    } catch (_error) {
      setRecentAttempts((current) => [attemptRecord, ...current].slice(0, 5));
    }

    setResult({
      attemptId: attemptRecord.id,
      correctCount,
      totalQuestions: questions.length,
      score,
      syncedToProgress,
      syncMessage,
      questionReview,
    });
    setFeedbackMessage("");
  }

  return (
    <div className="relative pt-20">
      <Particles
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        quantity={60}
        color="#b387e5"
      />

      <motion.section
        data-scene="Quiz Intro"
        className="px-6 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <StickySectionLabel label="Quiz Intro" />
          <p className="text-xs font-semibold tracking-[0.18em] text-fuchsia-900/80 uppercase">
            Quiz Arena
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            {lessonTitle ? `Checkpoint: ${lessonTitle}` : "Test what you retain"}
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Measure your understanding with mode-based quizzes designed to improve
            recognition speed and signing confidence.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Quiz Bank: {scopedQuestionBank.length} item{scopedQuestionBank.length === 1 ? "" : "s"}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Target Accuracy: 90%
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Recommended Rounds: 3/day
            </div>
          </div>

          {!lessonId ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              Quick mode active: scores are saved as practice attempts. Open a lesson quiz to sync with progress.
            </div>
          ) : null}
        </div>
      </motion.section>

      {!selectedMode ? (
        <section data-scene="Quiz Modes" className="px-6 pb-20">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {modes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.article
                  key={mode.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.07, duration: 0.45 }}
                  className="glass rounded-3xl border border-slate-200/80 p-6 shadow-soft"
                >
                  <div className="inline-flex rounded-xl border border-slate-200 bg-white/85 p-2 text-fuchsia-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold text-slate-900">{mode.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{mode.detail}</p>
                  <p className="mt-2 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                    {Math.min(mode.questionCount, scopedQuestionBank.length)} questions
                  </p>
                  <button
                    type="button"
                    onClick={() => startMode(mode)}
                    disabled={scopedQuestionBank.length === 0}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CircleCheckBig className="h-4 w-4" />
                    Start Mode
                  </button>
                </motion.article>
              );
            })}
          </div>
        </section>
      ) : null}

      {selectedMode ? (
        <section className="px-6 pb-14">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-soft sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">{selectedMode.title}</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">Question {Math.min(currentQuestionIndex + 1, questions.length)} of {questions.length}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedModeId("");
                  setQuestions([]);
                  resetQuizState();
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Change mode
              </button>
            </div>

            {activeQuestion ? (
              <div className="mt-5">
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                  Answered {Object.keys(answers).length}/{questions.length}
                </p>
                <p className="text-sm font-semibold text-indigo-700">
                  {activeQuestion.moduleTitle} - {activeQuestion.lessonTitle}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{activeQuestion.question}</h3>

                <div className="mt-4 grid gap-2">
                  {activeQuestion.options.map((option, optionIndex) => {
                    const isActive = answers[currentQuestionIndex] === optionIndex;
                    return (
                      <button
                        key={`${activeQuestion.id}-${option}`}
                        type="button"
                        onClick={() => {
                          setAnswers((current) => ({
                            ...current,
                            [currentQuestionIndex]: optionIndex,
                          }));
                          setFeedbackMessage("");
                        }}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                          isActive
                            ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIndex((current) => Math.max(current - 1, 0));
                    }}
                    disabled={currentQuestionIndex === 0}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentQuestionIndex((current) => Math.min(current + 1, questions.length - 1));
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      Next question
                    </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={submitting || unansweredCount > 0}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {submitting ? "Saving score..." : "Submit quiz"}
                    </button>
                  </div>
                </div>

                {feedbackMessage ? (
                  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                    {feedbackMessage}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                No quiz questions are available for this mode yet.
              </p>
            )}

            {result ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">Quiz complete</p>
                </div>
                <p className="mt-2 text-sm text-emerald-900">
                  You scored <span className="font-semibold">{result.score}%</span> ({result.correctCount}/{result.totalQuestions} correct).
                </p>
                <p className="mt-1 text-sm text-emerald-900">{result.syncMessage}</p>
                <p className="mt-1 text-xs font-semibold text-emerald-800/90">Attempt ID: {result.attemptId}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/progress")}
                    className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800"
                  >
                    View progress
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/learn")}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Continue learning
                  </button>
                </div>

                <div className="mt-5 rounded-xl border border-emerald-200/80 bg-white/75 p-3">
                  <p className="text-xs font-semibold tracking-[0.14em] text-emerald-800 uppercase">Answer Review</p>
                  <div className="mt-2 space-y-2">
                    {result.questionReview.map((entry, index) => (
                      <div
                        key={`${entry.id}-${index}`}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          entry.isCorrect
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-rose-200 bg-rose-50 text-rose-900"
                        }`}
                      >
                        <p className="font-semibold">Q{index + 1}. {entry.question}</p>
                        <p className="mt-1">Your answer: {entry.selectedOption}</p>
                        {!entry.isCorrect ? (
                          <p className="mt-1">Correct answer: {entry.correctOption}</p>
                        ) : null}
                        {entry.explanation ? (
                          <p className="mt-1 text-xs font-medium opacity-85">Why: {entry.explanation}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                {recentAttempts.length > 0 ? (
                  <div className="mt-4 rounded-xl border border-emerald-200/80 bg-white/75 p-3">
                    <p className="text-xs font-semibold tracking-[0.14em] text-emerald-800 uppercase">Recent Attempts</p>
                    <ul className="mt-2 space-y-1 text-sm text-emerald-900">
					  {recentAttempts.map((attempt, index) => (
						<li key={`${attempt.id}-${attempt.completedAt}-${index}`}>
                          {attempt.modeTitle}: {attempt.score}% ({attempt.correctCount}/{attempt.totalQuestions})
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white/75 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Quiz Tip</p>
              <p className="mt-2 text-sm text-slate-700">
                Use a short daily quiz to improve long-term retention faster than
                single long sessions.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900">
              <Crosshair className="h-4 w-4" />
              Streak Bonus Active
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default QuizPage;
