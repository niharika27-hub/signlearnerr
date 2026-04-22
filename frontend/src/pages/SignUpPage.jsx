import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";
import { useAuth } from "@/lib/AuthContext";
import {
  ROLE_CATEGORY_OPTIONS,
  getRolesForCategory,
} from "@/lib/profileStorage";

function SignUpPage() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleCategory, setRoleCategory] = useState(ROLE_CATEGORY_OPTIONS[0].value);
  const [role, setRole] = useState(getRolesForCategory(ROLE_CATEGORY_OPTIONS[0].value)[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check for Google OAuth token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    if (token) {
      loginWithGoogle(token).then((result) => {
        if (result.success) {
          navigate("/profile");
        } else {
          setErrorMessage(result.error || "Google signup failed");
        }
      });
    }
  }, [loginWithGoogle, navigate]);

  const handleGoogleSignup = () => {
    // Redirect to Google OAuth
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const roleOptions = useMemo(() => getRolesForCategory(roleCategory), [roleCategory]);

  function handleCategoryChange(nextCategory) {
    setRoleCategory(nextCategory);
    const nextRoles = getRolesForCategory(nextCategory);
    setRole(nextRoles[0]?.value ?? "");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const result = await signup({
        fullName,
        email,
        password,
        roleCategory,
        role,
        roleLabel: roleOptions.find((item) => item.value === role)?.label ?? role,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Unable to create account right now.");
        setIsSubmitting(false);
        return;
      }

      // Account created successfully - redirect to login
      setSuccessMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || "Unable to create account right now.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pt-20">
      <motion.section
        data-scene="Signup"
        className="px-6 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <StickySectionLabel label="Onboarding" />
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
            Create account
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            Sign up with your learning category
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            Choose one of the 2 categories and we will personalize your learning journey from day one.
          </p>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <form
            className="mt-6 grid gap-6 rounded-3xl border border-slate-200/80 bg-white/75 p-6 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.55)] backdrop-blur sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/75 px-2 text-slate-500">Create your account with email</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Full name
                <input
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Your name"
                />
              </label>

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
            </div>

            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Password
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                placeholder="At least 6 characters"
              />
            </label>

            <div>
              <p className="text-sm font-semibold text-slate-800">Choose category</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {ROLE_CATEGORY_OPTIONS.map((category) => {
                  const active = roleCategory === category.value;

                  return (
                    <label
                      key={category.value}
                      className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
                        active
                          ? "border-indigo-300 bg-indigo-50/80"
                          : "border-slate-200 bg-white/70 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role-category"
                        value={category.value}
                        checked={active}
                        onChange={() => handleCategoryChange(category.value)}
                        className="sr-only"
                      />
                      <p className="text-sm font-semibold text-slate-900">{category.label}</p>
                      <p className="mt-1 text-xs text-slate-600">{category.description}</p>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">Select your role</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {roleOptions.map((item) => {
                  const active = role === item.value;

                  return (
                    <label
                      key={item.value}
                      className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
                        active
                          ? "border-cyan-300 bg-cyan-50/85"
                          : "border-slate-200 bg-white/70 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={item.value}
                        checked={active}
                        onChange={() => setRole(item.value)}
                        className="sr-only"
                      />
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                    </label>
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
              <Link
                to="/login"
                className="rounded-xl border border-slate-200 bg-white/75 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                I already have an account
              </Link>
            </div>

            {errorMessage && (
              <p className="text-sm font-medium text-rose-700" role="alert">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="text-sm font-medium text-emerald-700" role="alert">
                {successMessage}
              </p>
            )}
          </form>
        </div>
      </motion.section>
    </div>
  );
}

export default SignUpPage;
