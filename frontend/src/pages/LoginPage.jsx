import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";
import { loginUser } from "@/lib/authApi";
import {
  ROLE_CATEGORY_OPTIONS,
  ROLE_OPTIONS_BY_CATEGORY,
  createStarterRecommendations,
  getStoredProfile,
  saveSession,
  saveStoredProfile,
} from "@/lib/profileStorage";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const roleOptions = useMemo(
    () => Object.entries(ROLE_OPTIONS_BY_CATEGORY).flatMap(([, items]) => items),
    []
  );
  const [selectedRole, setSelectedRole] = useState(roleOptions[0].value);

  function inferCategoryFromRole(roleValue) {
    if (ROLE_OPTIONS_BY_CATEGORY["accessibility-needs"].some((item) => item.value === roleValue)) {
      return "accessibility-needs";
    }

    return "support-circle";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const existingProfile = getStoredProfile();
      const { user } = await loginUser({ email, password });

      const fallbackRole = selectedRole;
      const fallbackCategory = inferCategoryFromRole(fallbackRole);
      const fallbackRoleLabel = roleOptions.find((item) => item.value === fallbackRole)?.label ?? fallbackRole;
      const normalizedProfile = {
        fullName: user?.fullName ?? existingProfile?.fullName ?? email.split("@")[0] ?? "SignLearn member",
        email: user?.email ?? email,
        roleCategory: user?.roleCategory ?? existingProfile?.roleCategory ?? fallbackCategory,
        role: user?.role ?? existingProfile?.role ?? fallbackRole,
        roleLabel: user?.roleLabel ?? existingProfile?.roleLabel ?? fallbackRoleLabel,
        joinedAt: user?.joinedAt ?? existingProfile?.joinedAt ?? new Date().toISOString(),
        goals: existingProfile?.goals ?? ["Start module 1", "Practice consistently", "Track weekly improvement"],
        recommendations:
          existingProfile?.recommendations ?? createStarterRecommendations(user?.role ?? existingProfile?.role ?? fallbackRole),
        completion: existingProfile?.completion ?? {
          modulesCompleted: 0,
          totalModules: 12,
          streakDays: 0,
        },
      };

      saveStoredProfile(normalizedProfile);

      saveSession({
        email: normalizedProfile.email,
        role: normalizedProfile.role,
        rememberMe,
        loggedInAt: new Date().toISOString(),
      });

      // Dispatch custom event to notify navbar of login
      window.dispatchEvent(new Event("user-logged-in"));

      navigate("/profile");
    } catch (error) {
      setErrorMessage(error.message || "Unable to log in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pt-20">
      <motion.section
        data-scene="Login"
        className="px-6 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <StickySectionLabel label="Welcome back" />
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
            Sign in
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            Log in to continue learning
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            Continue where you left off. You can also choose your user role so your profile section stays personalized.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <form
              className="rounded-3xl border border-slate-200/80 bg-white/75 p-6 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.55)] backdrop-blur sm:p-8"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-4">
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Email
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Password
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                    placeholder="••••••••"
                  />
                </label>

                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-300"
                  />
                  Keep me logged in
                </label>

                <div>
                  <p className="text-sm font-semibold text-slate-800">Sign in as</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {roleOptions.map((item) => {
                      const active = selectedRole === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setSelectedRole(item.value)}
                          className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                            active
                              ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                              : "border-slate-200 bg-white/75 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Logging in..." : "Log in"}
                  </button>
                  <Link
                    to="/signup"
                    className="rounded-xl border border-slate-200 bg-white/75 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                  >
                    Create new account
                  </Link>
                </div>

                {errorMessage && (
                  <p className="text-sm font-medium text-rose-700" role="alert">
                    {errorMessage}
                  </p>
                )}
              </div>
            </form>

            <aside className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 backdrop-blur sm:p-8">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Role categories</p>
              <div className="mt-4 space-y-4">
                {ROLE_CATEGORY_OPTIONS.map((category) => (
                  <div key={category.value} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <p className="text-sm font-semibold text-slate-900">{category.label}</p>
                    <p className="mt-1 text-xs text-slate-600">{category.description}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default LoginPage;
