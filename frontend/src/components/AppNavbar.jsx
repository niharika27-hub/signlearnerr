import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Learn", to: "/learn" },
  { label: "Practice", to: "/practice" },
  { label: "Progress", to: "/progress" },
  { label: "Profile", to: "/profile" },
];

const authItems = [
  { label: "Log in", to: "/login", style: "subtle" },
  { label: "Sign up", to: "/signup", style: "primary" },
];

function linkClass({ isActive }) {
  return `rounded-xl px-4 py-2 text-sm font-semibold tracking-wide transition ${
    isActive
      ? "bg-indigo-100 text-indigo-900"
      : "text-slate-600 hover:bg-white/75 hover:text-slate-900"
  }`;
}

function AppNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roleValue = String(user?.role || "").toLowerCase();
  const isAdmin = roleValue === "admin" || Boolean(user?.isAdminOverride);
  const isTeacher = roleValue === "teacher";
  const computedNavItems = isAdmin
    ? [...navItems, { label: "Admin", to: "/admin/modules" }]
    : isTeacher
      ? [...navItems, { label: "Teacher", to: "/teacher/lessons" }]
    : navItems;

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <header className="pointer-events-none fixed top-0 right-0 left-0 z-50 p-4">
      <nav className="pointer-events-auto mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 shadow-soft backdrop-blur-xl">
        <NavLink to="/" className="font-display text-lg font-semibold text-slate-900">
          SignLearn AI
        </NavLink>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2">
            {computedNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
            {user ? (
              <>
                <span className="text-sm font-semibold text-slate-700">
                  👋 {user.fullName}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              authItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2 text-sm font-semibold tracking-wide transition ${
                      item.style === "primary"
                        ? isActive
                          ? "bg-indigo-700 text-white"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                        : isActive
                          ? "bg-slate-200 text-slate-900"
                          : "border border-slate-200 bg-white/75 text-slate-700 hover:bg-white hover:text-slate-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))
            )}
          </div>
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
            {computedNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-2 space-y-2 border-t border-slate-200 pt-3">
              {user ? (
                <>
                  <div className="block px-4 py-3 text-sm font-semibold text-slate-700">
                    👋 {user.fullName}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                authItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      item.style === "primary"
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "border border-slate-200 bg-white/75 text-slate-700 hover:bg-white hover:text-slate-900"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default AppNavbar;
