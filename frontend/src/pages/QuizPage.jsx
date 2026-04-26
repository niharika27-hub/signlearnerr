import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookCheck, CheckCircle2, CircleCheckBig, Clock3, Crosshair, Target } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";
import { Particles } from "@/components/ui/particles";
import learningContent from "@/data/learning-content.json";
import { completeLesson, getApiErrorMessage, getModules } from "@/lib/authApi";

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

function resolveLessonIdFromQuestions(questions, lessonIdByTitle) {
  const matchCounts = new Map();

  questions.forEach((question) => {
    const key = normalizeKey(question?.lessonTitle);
    const matchedLessonId = lessonIdByTitle[key];
    if (!matchedLessonId) {
      return;
    }

    const existing = matchCounts.get(matchedLessonId) || {
      count: 0,
      lessonTitle: question.lessonTitle,
    };

    existing.count += 1;
    matchCounts.set(matchedLessonId, existing);
  });

  let bestMatch = null;
  for (const [matchedLessonId, metadata] of matchCounts.entries()) {
    if (!bestMatch || metadata.count > bestMatch.count) {
      bestMatch = {
        lessonId: matchedLessonId,
        lessonTitle: metadata.lessonTitle,
        count: metadata.count,
      };
    }
  }

  return bestMatch;
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
  const [lessonIdByTitle, setLessonIdByTitle] = useState({});

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

  const activeQuestion = questions[currentQuestionIndex] || null;

  useEffect(() => {
    async function fetchLessonMap() {
      try {
        const response = await getModules();
        const modules = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.modules)
            ? response.modules
            : [];

        const nextMap = {};
        modules.forEach((module) => {
          const lessons = Array.isArray(module?.lessons) ? module.lessons : [];
          lessons.forEach((entry) => {
            const titleKey = normalizeKey(entry?.title);
            const id = entry?._id || entry?.id;
            if (!titleKey || !id || nextMap[titleKey]) {
              return;
            }
            nextMap[titleKey] = String(id);
          });
        });

        setLessonIdByTitle(nextMap);
      } catch (error) {
        console.error("Failed to resolve lessons for quiz auto-link:", error);
      }
    }

    fetchLessonMap();
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

    const unansweredCount = questions.reduce(
      (count, _question, index) => (answers[index] === undefined ? count + 1 : count),
      0
    );

    if (unansweredCount > 0) {
      setFeedbackMessage(`Please answer all questions before submitting (${unansweredCount} left).`);
      return;
    }

    const correctCount = questions.reduce(
      (count, question, index) => (answers[index] === question.correctOptionIndex ? count + 1 : count),
      0
    );
    const score = Math.round((correctCount / questions.length) * 100);

    let syncMessage = "Quiz completed, but no matching lesson was found for progress sync.";
    let syncedToProgress = false;
    let matchedLessonTitle = "";

    const resolvedLessonMatch = lessonId
      ? { lessonId, lessonTitle: lessonTitle || "this lesson" }
      : resolveLessonIdFromQuestions(questions, lessonIdByTitle);

    const resolvedLessonId = resolvedLessonMatch?.lessonId || "";
    matchedLessonTitle = resolvedLessonMatch?.lessonTitle || "";

    if (resolvedLessonId) {
      try {
        setSubmitting(true);
        await completeLesson(resolvedLessonId, score);
        syncedToProgress = true;
        syncMessage = matchedLessonTitle
          ? `Score saved and progress updated for ${matchedLessonTitle}.`
          : "Score saved and progress updated successfully.";
      } catch (error) {
        syncMessage = getApiErrorMessage(error, "Quiz submitted, but progress sync failed.");
      } finally {
        setSubmitting(false);
      }
    }

    setResult({
      correctCount,
      totalQuestions: questions.length,
      score,
      syncedToProgress,
      matchedLessonTitle,
      syncMessage,
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
            Measure your understanding with adaptive quizzes designed to improve
            recognition speed and signing confidence.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              Quiz Bank: 200+ items
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
              Quick mode active: progress is auto-linked when a quiz question matches a backend lesson title.
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
                    onClick={() => setCurrentQuestionIndex((current) => Math.max(current - 1, 0))}
                    disabled={currentQuestionIndex === 0}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((current) => Math.min(current + 1, questions.length - 1))}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Next question
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {submitting ? "Saving score..." : "Submit quiz"}
                    </button>
                  )}
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
