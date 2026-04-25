import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";
import { resetPasswordWithOtp } from "@/lib/authApi";

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [email, setEmail] = useState(urlEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (!email || !otp) {
      setErrorMessage("Email and OTP are required.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(newPassword)) {
      setErrorMessage(
        "Password must be at least 6 characters and include uppercase, lowercase, and a number."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await resetPasswordWithOtp({ email, otp, newPassword });
      setSuccessMessage(data.message || "Password updated successfully.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      const firstValidationError = Array.isArray(backendErrors) ? backendErrors[0]?.message : null;
      setErrorMessage(
        firstValidationError ||
          error.response?.data?.message ||
          "Unable to reset password."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pt-20">
      <motion.section
        data-scene="Reset Password"
        className="px-6 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-3xl">
          <StickySectionLabel label="New Password" />
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">
            Reset password
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            Choose a new password
          </h1>

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

              <label className="space-y-2 text-sm font-semibold text-slate-700">
                OTP code
                <input
                  required
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter 6-digit code"
                />
              </label>

              <label className="space-y-2 text-sm font-semibold text-slate-700">
                New password
                <input
                  required
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  placeholder="6+ chars, uppercase, lowercase, number"
                />
              </label>

              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Confirm new password
                <input
                  required
                  type="password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Re-enter new password"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Resetting..." : "Reset password"}
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

export default ResetPasswordPage;
