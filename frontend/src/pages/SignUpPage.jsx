import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";
import { signupUser } from "@/lib/authApi";
import {
  ROLE_CATEGORY_OPTIONS,
  getRolesForCategory,
} from "@/lib/profileStorage";

function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleCategory, setRoleCategory] = useState(ROLE_CATEGORY_OPTIONS[0].value);
  const [role, setRole] = useState(getRolesForCategory(ROLE_CATEGORY_OPTIONS[0].value)[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const roleOptions = useMemo(() => getRolesForCategory(roleCategory), [roleCategory]);

  function handleCategoryChange(nextCategory) {
    setRoleCategory(nextCategory);
    const nextRoles = getRolesForCategory(nextCategory);
    setRole(nextRoles[0]?.value ?? "");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await signupUser({
        fullName,
        email,
        password,
        roleCategory,
        role,
        roleLabel: roleOptions.find((item) => item.value === role)?.label ?? role,
      });

      // Account created successfully - redirect to login
      // User will see their name only AFTER they login
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.message || "Unable to create account right now.");
    } finally {
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

          <form
            className="mt-8 grid gap-6 rounded-3xl border border-slate-200/80 bg-white/75 p-6 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.55)] backdrop-blur sm:p-8"
            onSubmit={handleSubmit}
          >
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
          </form>
        </div>
      </motion.section>
    </div>
  );
}

export default SignUpPage;
