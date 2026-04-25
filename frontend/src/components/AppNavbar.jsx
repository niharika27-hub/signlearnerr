import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut, ChevronDown, User, BarChart3, BookOpen } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getStoredProfile } from "@/lib/profileStorage";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Learn", to: "/learn" },
  { label: "Practice", to: "/practice" },
  { label: "Progress", to: "/progress" },
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [storedUser, setStoredUser] = useState(() => getStoredProfile());
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleProfileUpdated(event) {
      setStoredUser(event.detail ?? getStoredProfile());
    }

    window.addEventListener("profileUpdated", handleProfileUpdated);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdated);
  }, []);

  useEffect(() => {
    if (user) {
      setStoredUser(user);
    }
  }, [user]);

  const activeUser = useMemo(() => user ?? storedUser ?? null, [storedUser, user]);

  const roleValue = String(activeUser?.role || "").toLowerCase();
  const isAdmin = roleValue === "admin" || Boolean(activeUser?.isAdminOverride);
  const isTeacher = roleValue === "teacher";
  const computedNavItems = isAdmin
    ? [...navItems, { label: "Admin", to: "/admin/modules" }]
    : isTeacher
      ? [...navItems, { label: "Teacher", to: "/teacher/lessons" }]
    : navItems;
  const userMenuItems = [
    { label: "Profile", to: "/profile", icon: User },
    { label: "Progress", to: "/progress", icon: BarChart3 },
    ...(isAdmin ? [{ label: "Admin Panel", to: "/admin/modules", icon: BookOpen }] : []),
    ...(isTeacher ? [{ label: "Teacher Panel", to: "/teacher/lessons", icon: BookOpen }] : []),
  ];

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  async function handleLogout() {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const userInitial = String(activeUser?.fullName || activeUser?.email || "U").charAt(0).toUpperCase();
  const userAvatarUrl = activeUser?.photoURL || activeUser?.avatar || "";

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
            {activeUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen((open) => !open);
                    setIsMobileUserMenuOpen(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/75 px-3 py-2 text-sm font-semibold text-slate-700 backdrop-blur transition hover:bg-white"
                >
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt="User avatar"
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-indigo-200/70"
                    />
                  ) : (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100/90 text-indigo-900 text-xs font-bold ring-1 ring-indigo-200/70">
                      {userInitial}
                    </span>
                  )}
                  <span className="max-w-[120px] truncate">{activeUser.fullName || activeUser.email}</span>
                  <ChevronDown className={`h-4 w-4 text-indigo-700/80 transition ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-2 backdrop-blur shadow-[0_20px_55px_-28px_rgba(15,23,42,0.45)]"
                    >
                      <div className="px-3 py-2.5">
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">Signed in as</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{activeUser.fullName || "User"}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{activeUser.email}</p>
                      </div>

                      <div className="my-1 h-px bg-gradient-to-r from-indigo-100/70 via-cyan-100/60 to-indigo-100/70" />

                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50/70 hover:text-indigo-900"
                          >
                            <Icon className="h-4 w-4 text-indigo-700/75" />
                            {item.label}
                          </NavLink>
                        );
                      })}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
          onClick={() => {
            setIsOpen((open) => !open);
            setIsMobileUserMenuOpen(false);
          }}
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
              {activeUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsMobileUserMenuOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 backdrop-blur"
                  >
                    <span className="inline-flex items-center gap-2">
                      {userAvatarUrl ? (
                        <img
                          src={userAvatarUrl}
                          alt="User avatar"
                          className="h-7 w-7 rounded-full object-cover ring-1 ring-indigo-200/70"
                        />
                      ) : (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100/90 text-indigo-900 text-xs font-bold ring-1 ring-indigo-200/70">
                          {userInitial}
                        </span>
                      )}
                      {activeUser.fullName || activeUser.email}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-indigo-700/80 transition ${isMobileUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isMobileUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-2 backdrop-blur"
                      >
                        {userMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={`mobile-${item.to}`}
                              to={item.to}
                              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50/70 hover:text-indigo-900"
                              onClick={() => {
                                setIsMobileUserMenuOpen(false);
                                setIsOpen(false);
                              }}
                            >
                              <Icon className="h-4 w-4 text-indigo-700/75" />
                              {item.label}
                            </NavLink>
                          );
                        })}

                        <button
                          type="button"
                          onClick={async () => {
                            await handleLogout();
                            setIsMobileUserMenuOpen(false);
                            setIsOpen(false);
                          }}
                          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
