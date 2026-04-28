import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { sendFeedback, getApiErrorMessage } from "@/lib/authApi";

export default function Footer() {
  const { pathname } = useLocation();
  const [form, setForm] = useState({ name: "", email: "", type: "feedback", message: "", page: pathname });
  const [status, setStatus] = useState({ loading: false, success: null, error: null });
  const [open, setOpen] = useState(false);

  function update(field) {
    return (e) => setForm((s) => ({ ...s, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, success: null, error: null });

    try {
      const payload = { ...form, page: pathname };
      const res = await sendFeedback(payload);
      if (res?.ok) {
        setStatus({ loading: false, success: res.message || "Thanks — we received your message.", error: null });
        setForm({ name: "", email: "", type: "feedback", message: "", page: pathname });
        setOpen(false);
      } else {
        throw new Error(res?.message || "Failed to send");
      }
    } catch (err) {
      setStatus({ loading: false, success: null, error: getApiErrorMessage(err, "Failed to send message.") });
    }
  }

  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL ?? "muskanmittal249@gmail.com";

  return (
    <footer className="mt-12 bg-white/60 border-t border-slate-200 text-slate-700 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-indigo-50 flex items-center justify-center font-bold text-indigo-700">SL</div>
              <div>
                <div className="text-lg font-semibold text-slate-900">SignLearner</div>
                <div className="text-xs text-slate-500">Learn sign language with confidence</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 max-w-sm">Practical lessons, camera practice, and progress tracking — designed for learners and teachers.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/learn" className="hover:text-indigo-700">Learn</Link></li>
                <li><Link to="/practice" className="hover:text-indigo-700">Practice</Link></li>
                <li><Link to="/quiz" className="hover:text-indigo-700">Quiz</Link></li>
                <li><Link to="/progress" className="hover:text-indigo-700">Progress</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/" className="hover:text-indigo-700">Home</Link></li>
                <li><Link to="/login" className="hover:text-indigo-700">Log in</Link></li>
                <li><Link to="/signup" className="hover:text-indigo-700">Sign up</Link></li>
                <li><a href="/privacy" className="hover:text-indigo-700">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Contact & Feedback</h4>
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 mt-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.94 6.34A2 2 0 014 6h12a2 2 0 011.06.34l-7.06 4.41L2.94 6.34z" />
                <path d="M18 8.24v5.26a2 2 0 01-2 2H4a2 2 0 01-2-2V8.24l7.06 4.41a1 1 0 001.06 0L18 8.24z" />
              </svg>
              <div className="text-sm text-slate-700">
                <div>Email: <a href={`mailto:${supportEmail}`} className="text-indigo-600 hover:underline">{supportEmail}</a></div>
                <div className="mt-1 text-sm text-slate-600">Address: 123 Sign St, Example City</div>
              </div>
            </div>

            <div className="mt-4">
              <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white/75 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white">
                {open ? "Close feedback" : "Send feedback"}
              </button>
            </div>

            {open && (
              <div className="mt-4 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input value={form.name} onChange={update("name")} placeholder="Your name" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" />
                    <input value={form.email} onChange={update("email")} placeholder="Email" type="email" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" />
                  </div>

                  <select value={form.type} onChange={update("type")} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <option value="feedback">Feedback</option>
                    <option value="bug">Bug report</option>
                    <option value="support">Support</option>
                    <option value="other">Other</option>
                  </select>

                  <textarea value={form.message} onChange={update("message")} rows={4} placeholder="How can we help?" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" required />

                  <div className="flex items-center gap-3">
                    <button type="submit" className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white text-sm font-semibold hover:bg-indigo-700" disabled={status.loading}>
                      {status.loading ? "Sending..." : "Send"}
                    </button>
                    {status.success && <div className="text-sm text-emerald-600">{status.success}</div>}
                    {status.error && <div className="text-sm text-orange-600">{status.error}</div>}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          <div>© {new Date().getFullYear()} SignLearner — All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
