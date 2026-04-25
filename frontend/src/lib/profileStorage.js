export const PROFILE_STORAGE_KEY = "signlearn_profile";
export const SESSION_STORAGE_KEY = "signlearn_session";

import {
  getStoredProfileFromCookie,
  saveStoredProfileToCookie,
  getSessionFromCookie,
  saveSessionToCookie,
  clearAuthCookies,
} from "./cookieStorage";

export const ROLE_CATEGORY_OPTIONS = [
  {
    value: "accessibility-needs",
    label: "Category 1: Learner with accessibility needs",
    description: "For users who are hard of hearing or have speech-related communication needs.",
  },
  {
    value: "support-circle",
    label: "Category 2: Family / Teacher / Doctor",
    description: "For supporters and professionals helping learners practice sign language.",
  },
];

export const ROLE_OPTIONS_BY_CATEGORY = {
  "accessibility-needs": [
    {
      value: "hard-of-hearing-learner",
      label: "Hard of hearing learner",
      description: "Visual-first learning path with comprehension checkpoints.",
    },
    {
      value: "speech-support-learner",
      label: "Speech support learner",
      description: "Communication confidence exercises with structured pacing.",
    },
  ],
  "support-circle": [
    {
      value: "family-member",
      label: "Family member",
      description: "Everyday conversation and home practice guidance.",
    },
    {
      value: "teacher",
      label: "Teacher",
      description: "Classroom-friendly modules and progress insights.",
    },
    {
      value: "doctor",
      label: "Doctor / Therapist",
      description: "Communication-focused prompts for care settings.",
    },
  ],
};

function hasBrowserWindow() {
  return typeof window !== "undefined";
}

export function getRolesForCategory(category) {
  return ROLE_OPTIONS_BY_CATEGORY[category] ?? [];
}

export function getStoredProfile() {
  if (!hasBrowserWindow()) {
    return null;
  }

  return getStoredProfileFromCookie();
}

export function saveStoredProfile(profile) {
  if (!hasBrowserWindow()) {
    return;
  }

  saveStoredProfileToCookie(profile);
  
  // Dispatch a custom event so components like AppNavbar can listen
  window.dispatchEvent(
    new CustomEvent("profileUpdated", { detail: profile })
  );
}

export function saveSession(session) {
  if (!hasBrowserWindow()) {
    return;
  }

  saveSessionToCookie(session);
}

export function clearProfile() {
  if (!hasBrowserWindow()) {
    return;
  }

  clearAuthCookies();
  
  // Dispatch event when profile is cleared
  window.dispatchEvent(
    new CustomEvent("profileUpdated", { detail: null })
  );
}

export function clearSession() {
  if (!hasBrowserWindow()) {
    return;
  }

  clearAuthCookies();
}

export function getStoredSession() {
  if (!hasBrowserWindow()) {
    return null;
  }

  return getSessionFromCookie();
}

export function createStarterRecommendations(roleValue) {
  if (roleValue === "teacher") {
    return ["Classroom signs basics", "Assessment-ready lesson set", "Peer practice prompts"];
  }

  if (roleValue === "doctor") {
    return ["Clinical communication signs", "Patient comfort phrases", "Emergency cue drills"];
  }

  if (roleValue === "family-member") {
    return ["Home routine signs", "Emotion & support phrases", "Daily check-in practice"];
  }

  return ["Alphabet and fingerspelling", "Essential daily phrases", "Beginner gesture drills"];
}
