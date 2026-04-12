import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Learn", to: "/learn" },
  { label: "Practice", to: "/practice" },
  { label: "Progress", to: "/progress" },
];

function linkClass({ isActive }) {
  return `rounded-xl px-4 py-2 text-sm font-semibold tracking-wide transition ${
    isActive
      ? "bg-indigo-100 text-indigo-900"
      : "text-slate-600 hover:bg-white/75 hover:text-slate-900"
  }`;
}

function AppNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="pointer-events-none fixed top-0 right-0 left-0 z-50 p-4">
      <nav className="pointer-events-auto mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 shadow-soft backdrop-blur-xl">
        <NavLink to="/" className="font-display text-lg font-semibold text-slate-900">
          SignLearn AI
        </NavLink>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-800 md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-auto mx-auto mt-2 w-full max-w-6xl rounded-2xl border border-slate-200 bg-white/90 p-3 backdrop-blur-xl md:hidden"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default AppNavbar;
