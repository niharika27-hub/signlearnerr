import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getStoredProfile } from "@/lib/profileStorage";
import { logoutUser } from "@/lib/authApi";
import { clearAuthCookies } from "@/lib/cookieStorage";

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
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadProfile = () => {
    const profile = getStoredProfile();
    setUser(profile);
  };

  useEffect(() => {
    // Load profile on mount
    loadProfile();

    // Listen for storage changes (when user logs in/out from another tab)
    const handleStorageChange = () => {
      loadProfile();
    };

    // Listen for visibility changes (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadProfile();
      }
    };

    // Listen for custom login event
    const handleUserLoggedIn = () => {
      loadProfile();
    };

    // Listen for user profile update event
    const handleUserUpdated = () => {
      loadProfile();
    };

    // Listen for user logout event
    const handleUserLoggedOut = () => {
      setUser(null);
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", loadProfile);
    window.addEventListener("user-logged-in", handleUserLoggedIn);
    window.addEventListener("user-updated", handleUserUpdated);
    window.addEventListener("user-logged-out", handleUserLoggedOut);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", loadProfile);
      window.removeEventListener("user-logged-in", handleUserLoggedIn);
      window.removeEventListener("user-updated", handleUserUpdated);
      window.removeEventListener("user-logged-out", handleUserLoggedOut);
    };
  }, []);

  async function handleLogout() {
    try {
      await logoutUser();
      clearAuthCookies();
      setUser(null);
      setIsOpen(false);
      window.dispatchEvent(new Event("user-logged-out"));
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API call fails
      clearAuthCookies();
      setUser(null);
      setIsOpen(false);
      window.dispatchEvent(new Event("user-logged-out"));
      navigate("/");
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
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                    {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{user.fullName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-200 bg-white/75 p-2 text-slate-700 hover:bg-white hover:text-slate-900 transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
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

            <div className="mt-2 space-y-2 border-t border-slate-200 pt-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 rounded-xl">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                      {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{user.fullName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition flex items-center justify-center gap-2"
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
