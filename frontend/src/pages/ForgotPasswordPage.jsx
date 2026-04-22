import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";
import { requestPasswordReset } from "@/lib/authApi";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");
    setResetUrl("");

    try {
      const data = await requestPasswordReset({ email });
      setSuccessMessage(data.message || "If your email exists, reset instructions have been sent.");
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to process your request right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pt-20">
      <motion.section
        data-scene="Forgot Password"
        className="px-6 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-3xl">
          <StickySectionLabel label="Account Recovery" />
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
            Forgot password
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            Reset your password
          </h1>
          <p className="mt-4 text-slate-600">
            Enter your account email and we will generate a secure reset link.
          </p>

          <form
            className="mt-8 rounded-3xl border border-slate-200/80 bg-white/75 p-6 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.55)] backdrop-blur sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4">
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Account email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  placeholder="you@example.com"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Generating..." : "Send reset link"}
                </button>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-200 bg-white/75 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  Back to login
                </Link>
              </div>

              {successMessage && (
                <p className="text-sm font-medium text-emerald-700" role="status">
                  {successMessage}
                </p>
              )}

              {resetUrl && (
                <p className="break-all text-xs text-slate-600">
                  Dev reset link: {resetUrl}
                </p>
              )}

              {errorMessage && (
                <p className="text-sm font-medium text-rose-700" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>
          </form>
        </div>
      </motion.section>
    </div>
  );
}

export default ForgotPasswordPage;
