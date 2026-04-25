import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";
import { useAuth } from "@/lib/AuthContext";
import {
  ROLE_CATEGORY_OPTIONS,
  ROLE_OPTIONS_BY_CATEGORY,
} from "@/lib/profileStorage";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const roleOptions = useMemo(
    () => Object.entries(ROLE_OPTIONS_BY_CATEGORY).flatMap(([, items]) => items),
    []
  );

  const [selectedRole, setSelectedRole] = useState(roleOptions[0]?.value || "");

  useEffect(() => {
    // Token handling removed - Google callback sets cookie directly
    // init() in AuthContext will automatically restore user from cookie
  }, []);

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
      const result = await login(email, password);
      
      if (!result.success) {
        setErrorMessage(result.error || "Unable to log in right now.");
        setIsSubmitting(false);
        return;
      }

      // Login successful - AuthContext has user, navigate to home
      navigate("/");
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
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/75 px-2 text-slate-500">Sign in with your account</span>
                  </div>
                </div>

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

                <div>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-indigo-700 transition hover:text-indigo-900"
                  >
                    Forgot password?
                  </Link>
                </div>

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

                <div className="pt-2">
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white/75 px-2 text-slate-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => (window.location.href = "http://localhost:5000/api/auth/google")}
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition group-hover:border-slate-300">
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </span>
                    Continue with Google
                  </button>
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
