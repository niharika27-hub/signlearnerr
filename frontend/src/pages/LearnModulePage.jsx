import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { completeLesson, getModule } from "@/lib/authApi";
import { formatCategoryLabel } from "@/lib/moduleCategories";
import {
  getLessonCoveragePoints,
  getLessonResourceImages,
} from "@/lib/lessonResources";
import { getLessonVideoSources } from "@/lib/lessonVideoSources";

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "ogg", "m3u8", "m4v", "avi", "mkv"]);

function normalizeMediaUrl(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (/^www\./i.test(value)) {
    return `https://${value}`;
  }

  return value;
}

function getPrimaryLessonMediaUrl(lesson) {
  return (
    lesson?.contentUrl ||
    lesson?.mediaUrl ||
    lesson?.videoUrl ||
    lesson?.imageUrl ||
    lesson?.content ||
    ""
  );
}

function isYouTubeSearchUrl(url) {
  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url, "https://example.com");
    const host = parsedUrl.hostname.toLowerCase();
    if (!host.includes("youtube.com") && !host.includes("youtube-nocookie.com")) {
      return false;
    }

    if (parsedUrl.searchParams.get("listType") === "search") {
      return true;
    }

    if (parsedUrl.pathname === "/results" && parsedUrl.searchParams.get("search_query")) {
      return true;
    }

    return false;
  } catch (_error) {
    return false;
  }
}

function isLikelyVideoUrl(url) {
  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url, "https://example.com");
    const path = parsedUrl.pathname.toLowerCase();
    if (/\/special:filepath\//i.test(path)) {
      return true;
    }

    const extension = path.includes(".") ? path.split(".").pop() : "";
    return VIDEO_EXTENSIONS.has(String(extension || "").toLowerCase());
  } catch (_error) {
    return /\.(mp4|webm|mov|ogg|m3u8|m4v|avi|mkv|ogv)(\?|$)/i.test(url);
  }
}

function buildLessonVideoSources(moduleData, lesson) {
  const seen = new Set();
  const sources = [];

  function addSource(url) {
    const normalized = normalizeMediaUrl(url);
    if (!normalized) {
      return;
    }

    const sourceKey = normalized.toLowerCase();
    if (seen.has(sourceKey)) {
      return;
    }

    if (isYouTubeSearchUrl(normalized)) {
      return;
    }

    if (!isLikelyVideoUrl(normalized)) {
      return;
    }

    seen.add(sourceKey);
    sources.push(normalized);
  }

  addSource(getPrimaryLessonMediaUrl(lesson));

  const fallbackSources = getLessonVideoSources(
    moduleData?.title,
    lesson?.title,
    moduleData?.category
  );
  fallbackSources.forEach((entry) => addSource(entry));

  return sources;
}

function LessonVideoPlayer({ title, videoSources }) {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [playbackError, setPlaybackError] = useState("");

  useEffect(() => {
    setActiveVideoIndex(0);
    setPlaybackError("");
  }, [videoSources]);

  if (!videoSources.length) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-500">
        No playable video source found for this lesson.
      </div>
    );
  }

  const safeIndex = Math.min(activeVideoIndex, videoSources.length - 1);
  const activeSource = videoSources[safeIndex];

  function handleVideoError() {
    if (safeIndex < videoSources.length - 1) {
      setActiveVideoIndex(safeIndex + 1);
      return;
    }

    setPlaybackError("This video source is unavailable right now.");
  }

  return (
    <div className="mt-3">
      <video
        key={activeSource}
        controls
        preload="metadata"
        onError={handleVideoError}
        className="h-56 w-full rounded-xl border border-slate-200 bg-black object-contain"
      >
        <source src={activeSource} />
        Your browser does not support this video format.
      </video>

      {videoSources.length > 1 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {videoSources.map((source, index) => (
            <button
              key={`${source}-${index}`}
              type="button"
              onClick={() => {
                setPlaybackError("");
                setActiveVideoIndex(index);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                index === safeIndex
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              Source {index + 1}
            </button>
          ))}
        </div>
      ) : null}

      {playbackError ? <p className="mt-2 text-xs font-semibold text-rose-700">{playbackError}</p> : null}

      <p className="mt-2 text-[11px] text-slate-500">Video: {title}</p>
    </div>
  );
}

function LearnModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleLoading, setModuleLoading] = useState(true);
  const [moduleError, setModuleError] = useState("");
  const [completingLessonId, setCompletingLessonId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  async function loadModuleDetails() {
    if (!moduleId) {
      return;
    }

    try {
      setModuleLoading(true);
      setModuleError("");
      const response = await getModule(moduleId);
      setSelectedModule(response.data || response.module || null);
    } catch (error) {
      console.error("Failed to fetch module details:", error);
      setModuleError("Failed to load module details");
      setSelectedModule(null);
    } finally {
      setModuleLoading(false);
    }
  }

  useEffect(() => {
    loadModuleDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  useEffect(() => {
    if (!selectedModule?.lessons?.length) {
      setSelectedLessonId("");
      return;
    }

    setSelectedLessonId((current) => {
      const stillExists = selectedModule.lessons.some(
        (lesson) => String(lesson._id) === String(current)
      );

      if (stillExists) {
        return current;
      }

      return String(selectedModule.lessons[0]._id);
    });
  }, [selectedModule]);

  const completedLessons = useMemo(() => {
    if (!selectedModule?.lessons) {
      return 0;
    }

    return selectedModule.lessons.filter((lesson) => lesson.isCompleted).length;
  }, [selectedModule]);

  const selectedLesson = useMemo(() => {
    if (!selectedModule?.lessons?.length) {
      return null;
    }

    return (
      selectedModule.lessons.find((lesson) => String(lesson._id) === String(selectedLessonId)) ||
      selectedModule.lessons[0]
    );
  }, [selectedLessonId, selectedModule]);

  const selectedLessonCoverage = useMemo(() => {
    if (!selectedLesson) {
      return [];
    }

    return getLessonCoveragePoints(
      selectedModule?.title,
      selectedLesson.title,
      selectedLesson.description
    );
  }, [selectedLesson, selectedModule]);

  const selectedLessonImages = useMemo(() => {
    if (!selectedLesson) {
      return [];
    }

    return getLessonResourceImages(selectedModule?.title, selectedLesson.title);
  }, [selectedLesson, selectedModule]);

  const selectedLessonVideoSources = useMemo(() => {
    if (!selectedLesson) {
      return [];
    }

    return buildLessonVideoSources(selectedModule, selectedLesson);
  }, [selectedLesson, selectedModule]);

  async function handleCompleteLesson(lessonId) {
    if (!lessonId) {
      return;
    }

    try {
      setCompletingLessonId(String(lessonId));
      await completeLesson(lessonId);
      await loadModuleDetails();
    } catch (error) {
      console.error("Failed to complete lesson:", error);
      setModuleError(error.response?.data?.message || "Failed to mark lesson complete.");
    } finally {
      setCompletingLessonId("");
    }
  }

  return (
    <div className="pt-24 px-6 pb-20">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-indigo-700 uppercase">Learning Content</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {selectedModule?.title || "Loading module"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {selectedModule?.description || "Fetching lessons for this module."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedModule ? (
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {formatCategoryLabel(selectedModule.category)}
              </span>
            ) : null}
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              {selectedModule ? `${completedLessons}/${selectedModule.lessons?.length || 0} completed` : "0/0 completed"}
            </span>
            <button
              type="button"
              onClick={() => navigate("/learn")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Back to modules
            </button>
          </div>
        </div>

        {moduleLoading ? <p className="mt-4 text-sm text-slate-600">Loading module lessons...</p> : null}
        {moduleError ? <p className="mt-4 text-sm font-semibold text-rose-700">{moduleError}</p> : null}

        {!moduleLoading && selectedModule?.lessons?.length ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 lg:sticky lg:top-24 lg:h-fit">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Lesson Navigator</p>
              <div className="mt-3 space-y-3">
                {selectedModule.lessons.map((lesson) => {
                  const coveragePoints = getLessonCoveragePoints(
                    selectedModule?.title,
                    lesson.title,
                    lesson.description
                  );

                  const isSelectedLesson = String(lesson._id) === String(selectedLesson?._id);

                  return (
                    <button
                      key={`sidebar-${lesson._id}`}
                      type="button"
                      onClick={() => setSelectedLessonId(String(lesson._id))}
                      className={`block w-full rounded-xl border px-3 py-3 text-left transition ${
                        isSelectedLesson
                          ? "border-indigo-300 bg-indigo-50/70"
                          : "border-slate-200 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                        Lesson {lesson.order}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-slate-900">{lesson.title}</h3>
                      <ul className="mt-2 space-y-1 text-xs text-slate-600">
                        {coveragePoints.slice(0, 3).map((point) => (
                          <li key={`${lesson._id}-${point}`}>• {point}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </aside>

            {selectedLesson ? (
              <article
                id={`lesson-${selectedLesson._id}`}
                key={selectedLesson._id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Lesson {selectedLesson.order}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-slate-900">{selectedLesson.title}</h2>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        selectedLesson.isCompleted
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {selectedLesson.isCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">{selectedLesson.description || "No description yet."}</p>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {selectedLessonImages.slice(0, 3).map((imageUrl, index) => (
                      <img
                        key={`${selectedLesson._id}-img-${index}`}
                        src={imageUrl}
                        alt={`${selectedLesson.title} sign reference ${index + 1}`}
                        loading="lazy"
                        className="h-20 w-full rounded-lg border border-slate-200 bg-white object-cover"
                      />
                    ))}
                  </div>

                  <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">This lesson covers</p>
                    <ul className="mt-1 space-y-1 text-xs text-slate-600">
                      {selectedLessonCoverage.slice(0, 3).map((point) => (
                        <li key={`${selectedLesson._id}-cover-${point}`}>• {point}</li>
                      ))}
                    </ul>
                  </div>

                  <LessonVideoPlayer
                    title={selectedLesson.title}
                    videoSources={selectedLessonVideoSources}
                  />

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500">{selectedLesson.duration || 0} min</span>
                    <button
                      type="button"
                      onClick={() => handleCompleteLesson(selectedLesson._id)}
                      disabled={selectedLesson.isCompleted || completingLessonId === String(selectedLesson._id)}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {selectedLesson.isCompleted
                        ? "Completed"
                        : completingLessonId === String(selectedLesson._id)
                          ? "Saving..."
                          : "Mark Complete"}
                    </button>
                  </div>
              </article>
            ) : null}
          </div>
        ) : null}

        {!moduleLoading && selectedModule && (!selectedModule.lessons || selectedModule.lessons.length === 0) ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-600">
            This module has no lessons yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default LearnModulePage;
