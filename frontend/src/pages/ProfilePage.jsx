import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Lock, Trash2, LogOut, Check } from "lucide-react";
import StickySectionLabel from "@/components/StickySectionLabel";
import { updateUser, deleteUser, logoutUser, changePassword } from "@/lib/authApi";
import {
  ROLE_CATEGORY_OPTIONS,
  getRolesForCategory,
  getStoredProfile,
  saveStoredProfile,
  clearSession,
} from "@/lib/profileStorage";

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeSection, setActiveSection] = useState("profile"); // "profile", "password", "delete"
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    password: false,
    delete: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    const stored = getStoredProfile();
    setProfile(stored);
  }, []);

  const roleOptions = useMemo(() => {
    if (!profile?.roleCategory) {
      return [];
    }

    return getRolesForCategory(profile.roleCategory);
  }, [profile?.roleCategory]);

  function handleCategoryChange(nextCategory) {
    const nextRoles = getRolesForCategory(nextCategory);

    setProfile((current) => ({
      ...current,
      roleCategory: nextCategory,
      role: nextRoles[0]?.value ?? "",
      roleLabel: nextRoles[0]?.label ?? "",
    }));
  }

  function handleRoleChange(nextRole) {
    const selectedRole = roleOptions.find((item) => item.value === nextRole);

    setProfile((current) => ({
      ...current,
      role: nextRole,
      roleLabel: selectedRole?.label ?? nextRole,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setErrorMessage("");
    setSavedMessage("");
    setIsSaving(true);

    try {
      const { user } = await updateUser({
        fullName: profile.fullName,
        roleCategory: profile.roleCategory,
        role: profile.role,
        roleLabel: profile.roleLabel,
      });

      // Update local storage with new data
      const updatedProfile = {
        ...profile,
        fullName: user?.fullName ?? profile.fullName,
        roleCategory: user?.roleCategory ?? profile.roleCategory,
        role: user?.role ?? profile.role,
        roleLabel: user?.roleLabel ?? profile.roleLabel,
      };

      setProfile(updatedProfile);
      saveStoredProfile(updatedProfile);
      setSavedMessage("Profile updated successfully.");
      // Dispatch custom event to notify navbar of profile update
      window.dispatchEvent(new Event("user-updated"));
      window.setTimeout(() => setSavedMessage(""), 2200);
    } catch (error) {
      setErrorMessage(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setErrorMessage("Please enter your password to confirm deletion.");
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);

    try {
      await deleteUser(deletePassword);
      clearSession();
      window.dispatchEvent(new Event("user-logged-out"));
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete account.");
      setDeletePassword("");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => setPasswordMessage(""), 2200);
    } catch (error) {
      setPasswordError(error.message || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      clearSession();
      window.dispatchEvent(new Event("user-logged-out"));
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      setErrorMessage("Failed to logout. Please try again.");
      setIsLoggingOut(false);
    }
  }

  if (!profile) {
    return (
      <div className="pt-24 px-6 pb-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white/80 p-8 text-center backdrop-blur">
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">Profile</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">No profile yet</h1>
          <p className="mt-3 text-slate-600">
            Create an account or log in first, then this section will show your role and personalized journey.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Go to Sign up
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Go to Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <motion.section
        data-scene="Profile"
        className="px-6 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <StickySectionLabel label="User profile" />
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-900/80 uppercase">Account</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
            Your profile section
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            Manage your account settings, update your profile, change password, or log out.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setActiveSection("profile");
                toggleSection("profile");
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                expandedSections.profile
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50"
              }`}
            >
              Update Profile
            </button>
            <button
              onClick={() => {
                setActiveSection("password");
                toggleSection("password");
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                expandedSections.password
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-amber-50"
              }`}
            >
              <Lock className="h-4 w-4" />
              Change Password
            </button>
            <button
              onClick={() => {
                setActiveSection("delete");
                toggleSection("delete");
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                expandedSections.delete
                  ? "bg-rose-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-rose-50"
              }`}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="ml-auto flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>

          {/* Profile Card */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            {/* Main Content */}
            <div className="space-y-4">
              {/* Profile Update Section */}
              <motion.div
                initial={false}
                animate={{ height: expandedSections.profile ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <form
                  onSubmit={handleSave}
                  className="rounded-3xl border border-slate-200/80 bg-white/75 p-6 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.55)] backdrop-blur sm:p-8"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection("profile")}
                    className="flex w-full items-center justify-between mb-4"
                  >
                    <h2 className="text-lg font-semibold text-slate-900">Update Profile</h2>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-600 transition ${
                        expandedSections.profile ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-semibold text-slate-700">
                      Full name
                      <input
                        value={profile.fullName ?? ""}
                        onChange={(event) =>
                          setProfile((current) => ({ ...current, fullName: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      />
                    </label>

                    <label className="space-y-2 text-sm font-semibold text-slate-700">
                      Email (read-only)
                      <input
                        type="email"
                        value={profile.email ?? ""}
                        disabled
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm font-medium text-slate-500 outline-none cursor-not-allowed"
                      />
                    </label>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-semibold text-slate-700">
                      Category
                      <select
                        value={profile.roleCategory}
                        onChange={(event) => handleCategoryChange(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      >
                        {ROLE_CATEGORY_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-semibold text-slate-700">
                      Role
                      <select
                        value={profile.role}
                        onChange={(event) => handleRoleChange(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      >
                        {roleOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block space-y-2 text-sm font-semibold text-slate-700">
                    Goals (comma separated)
                    <input
                      value={(profile.goals ?? []).join(", ")}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          goals: event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                    />
                  </label>

                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? "Saving..." : (
                        <>
                          <Check className="h-4 w-4" />
                          Save profile
                        </>
                      )}
                    </button>
                    {savedMessage && (
                      <span className="text-sm font-medium text-emerald-700 flex items-center gap-1">
                        <Check className="h-4 w-4" /> {savedMessage}
                      </span>
                    )}
                  </div>

                  {errorMessage && (
                    <p className="mt-3 text-sm font-medium text-rose-700">{errorMessage}</p>
                  )}
                </form>
              </motion.div>

              {/* Password Change Section */}
              <motion.div
                initial={false}
                animate={{ height: expandedSections.password ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => toggleSection("password")}
                    className="flex w-full items-center justify-between mb-4"
                  >
                    <h2 className="text-lg font-semibold text-amber-900">Change Password</h2>
                    <ChevronDown
                      className={`h-5 w-5 text-amber-600 transition ${
                        expandedSections.password ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <label className="block space-y-1 text-sm font-semibold text-slate-700">
                      Current password
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        placeholder="Enter current password"
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
                      />
                    </label>
                    <label className="block space-y-1 text-sm font-semibold text-slate-700">
                      New password
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="Enter new password (min. 6 characters)"
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
                      />
                    </label>
                    <label className="block space-y-1 text-sm font-semibold text-slate-700">
                      Confirm password
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirm new password"
                        className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isChangingPassword ? "Changing..." : (
                        <>
                          <Check className="h-4 w-4" />
                          Change password
                        </>
                      )}
                    </button>
                    {passwordMessage && (
                      <p className="text-sm font-medium text-emerald-700 flex items-center gap-1">
                        <Check className="h-4 w-4" /> {passwordMessage}
                      </p>
                    )}
                    {passwordError && (
                      <p className="text-sm font-medium text-rose-700">{passwordError}</p>
                    )}
                  </form>
                </div>
              </motion.div>

              {/* Delete Account Section */}
              <motion.div
                initial={false}
                animate={{ height: expandedSections.delete ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => toggleSection("delete")}
                    className="flex w-full items-center justify-between mb-4"
                  >
                    <h2 className="text-lg font-semibold text-rose-900">Delete Account</h2>
                    <ChevronDown
                      className={`h-5 w-5 text-rose-600 transition ${
                        expandedSections.delete ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <p className="text-sm text-rose-700 mb-4">
                    Deleting your account is permanent and cannot be undone. All your data will be lost.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete My Account
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-rose-900">
                        Enter your password to confirm deletion:
                      </p>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(event) => setDeletePassword(event.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeletePassword("");
                          }}
                          className="flex-1 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="flex-1 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isDeleting ? "Deleting..." : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Confirm Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <p className="mt-3 text-sm font-medium text-rose-700">{errorMessage}</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar - User Info Card */}
            <aside className="space-y-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white/75 p-6 backdrop-blur">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Current role</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{profile.roleLabel}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Joined {new Date(profile.joinedAt).toLocaleDateString()} and building consistent communication progress.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/75 p-6 backdrop-blur">
                <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Starter recommendations</p>
                <ul className="mt-3 space-y-2">
                  {(profile.recommendations ?? []).map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account Details */}
              <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6 backdrop-blur">
                <p className="text-xs font-semibold tracking-[0.16em] text-indigo-600 uppercase">Account Details</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-indigo-600 font-semibold">Email</p>
                    <p className="text-sm font-medium text-indigo-900">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 font-semibold">Role Category</p>
                    <p className="text-sm font-medium text-indigo-900">{profile.roleCategory}</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 font-semibold">Member Since</p>
                    <p className="text-sm font-medium text-indigo-900">
                      {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default ProfilePage;
