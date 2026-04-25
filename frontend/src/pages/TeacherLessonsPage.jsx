import { useEffect, useMemo, useState } from "react";
import {
  createTeacherLesson,
  deleteTeacherLesson,
  getTeacherModules,
  updateTeacherLesson,
} from "@/lib/authApi";
import { useAuth } from "@/lib/AuthContext";

const EMPTY_LESSON_FORM = {
  title: "",
  description: "",
  contentUrl: "",
  duration: 5,
  order: 1,
  difficultyLevel: "beginner",
  isActive: true,
};

const DIFFICULTY_OPTIONS = ["beginner", "intermediate", "advanced"];

function LessonEditor({ lesson, moduleId, onSaved, onDeleted }) {
  const [form, setForm] = useState({
    title: lesson.title,
    description: lesson.description || "",
    contentUrl: lesson.contentUrl || "",
    duration: lesson.duration,
    order: lesson.order,
    difficultyLevel: lesson.difficultyLevel || "beginner",
    isActive: lesson.isActive ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    setIsSaving(true);
    try {
      const response = await updateTeacherLesson(lesson._id, {
        ...form,
        duration: Number(form.duration),
        order: Number(form.order),
      });
      onSaved(response.data);
      setSaved("Lesson updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update lesson.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this lesson?");
    if (!confirmed) {
      return;
    }

    setError("");
    setSaved("");
    setIsSaving(true);
    try {
      await deleteTeacherLesson(lesson._id);
      onDeleted(moduleId, lesson._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lesson.");
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Lesson Title
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Content URL
          <input
            value={form.contentUrl}
            onChange={(event) => setForm((current) => ({ ...current, contentUrl: event.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="mt-3 block text-sm font-semibold text-slate-700">
        Description
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <label className="text-sm font-semibold text-slate-700">
          Order
          <input
            type="number"
            value={form.order}
            onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Duration
          <input
            type="number"
            value={form.duration}
            onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Difficulty
          <select
            value={form.difficultyLevel}
            onChange={(event) => setForm((current) => ({ ...current, difficultyLevel: event.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          Active
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Save Lesson
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSaving}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700"
        >
          Delete Lesson
        </button>
        {saved ? <span className="text-xs font-semibold text-emerald-700">{saved}</span> : null}
        {error ? <span className="text-xs font-semibold text-rose-700">{error}</span> : null}
      </div>
    </form>
  );
}

function ModuleLessonsCard({ moduleItem, onModulesChanged }) {
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  async function handleCreateLesson(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    setIsSaving(true);
    try {
      await createTeacherLesson(moduleItem._id, {
        ...lessonForm,
        duration: Number(lessonForm.duration),
        order: Number(lessonForm.order),
      });
      setLessonForm({ ...EMPTY_LESSON_FORM, order: Number(lessonForm.order) + 1 });
      setSaved("Lesson added.");
      onModulesChanged();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lesson.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleLessonSaved(updatedLesson) {
    onModulesChanged(updatedLesson);
  }

  function handleLessonDeleted(_moduleId, _lessonId) {
    onModulesChanged();
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Module</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{moduleItem.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{moduleItem.description}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {Array.isArray(moduleItem.lessons) ? moduleItem.lessons.length : 0} lessons
        </span>
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <h3 className="text-sm font-bold text-slate-900">Lessons</h3>
        <div className="mt-3 space-y-3">
          {(moduleItem.lessons || []).map((lesson) => (
            <LessonEditor
              key={lesson._id}
              lesson={lesson}
              moduleId={moduleItem._id}
              onSaved={handleLessonSaved}
              onDeleted={handleLessonDeleted}
            />
          ))}
        </div>

        <form onSubmit={handleCreateLesson} className="mt-4 grid gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-4 md:grid-cols-5">
          <input
            required
            value={lessonForm.title}
            onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="New lesson title"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          />
          <input
            type="number"
            value={lessonForm.order}
            onChange={(event) => setLessonForm((current) => ({ ...current, order: event.target.value }))}
            placeholder="Order"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          />
          <input
            type="number"
            value={lessonForm.duration}
            onChange={(event) => setLessonForm((current) => ({ ...current, duration: event.target.value }))}
            placeholder="Minutes"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          />
          <input
            value={lessonForm.contentUrl}
            onChange={(event) => setLessonForm((current) => ({ ...current, contentUrl: event.target.value }))}
            placeholder="Content URL"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          />
          <button type="submit" disabled={isSaving} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            Add Lesson
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {saved ? <span className="text-xs font-semibold text-emerald-700">{saved}</span> : null}
          {error ? <span className="text-xs font-semibold text-rose-700">{error}</span> : null}
        </div>
      </section>
    </article>
  );
}

function TeacherLessonsPage() {
  const { user } = useAuth();
  const roleValue = String(user?.role || "").toLowerCase();
  const isTeacher = roleValue === "teacher";
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadModules() {
    setLoading(true);
    setError("");
    try {
      const response = await getTeacherModules();
      setModules(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load modules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isTeacher) {
      loadModules();
    }
  }, [isTeacher]);

  const sortedModules = useMemo(() => {
    return [...modules].sort((left, right) => left.orderIndex - right.orderIndex);
  }, [modules]);

  function handleModulesChanged() {
    loadModules();
  }

  if (!isTeacher) {
    return (
      <div className="pt-24 px-6 pb-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-rose-700">Teacher Access Required</h1>
          <p className="mt-2 text-sm font-medium text-rose-700">
            Only teacher accounts can access the lesson content panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 pb-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-indigo-700 uppercase">Teacher Panel</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Manage Lesson Content</h1>
          <p className="mt-2 text-sm text-slate-600">
            Edit lesson content, reorder lessons, and publish updates without user assignment or module deletion.
          </p>
        </div>

        {loading ? <p className="text-sm text-slate-600">Loading modules...</p> : null}
        {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="space-y-4">
          {sortedModules.map((moduleItem) => (
            <ModuleLessonsCard key={moduleItem._id} moduleItem={moduleItem} onModulesChanged={handleModulesChanged} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeacherLessonsPage;