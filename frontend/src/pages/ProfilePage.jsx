import { motion } from "framer-motion";
import { PencilLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";
import {
  ROLE_CATEGORY_OPTIONS,
  getRolesForCategory,
} from "@/lib/profileStorage";
import { updateProfile, changePassword, deleteAccount, uploadAvatarFile } from "@/lib/authApi";
import { useAuth } from "@/lib/AuthContext";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // profile, security, account
  
  // Change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Delete account form
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    setProfile(user ?? null);
    setAvatarLoadFailed(false);
  }, [user]);

  const roleOptions = useMemo(() => {
    if (!profile?.roleCategory) {
      return [];
    }

    return getRolesForCategory(profile.roleCategory);
  }, [profile?.roleCategory]);

  const profileImageUrl = profile?.avatar || profile?.photoURL || user?.avatar || user?.photoURL || "";
  const profileInitial = String(profile?.fullName || profile?.email || "U").charAt(0).toUpperCase();
  const profileDisplayName = profile?.fullName || user?.fullName || "Your";

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

  function handleAvatarLoadError() {
    setAvatarLoadFailed(true);
  }

  async function handleAvatarFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setErrorMessage("");
    setSavedMessage("");
    setIsAvatarUploading(true);

    try {
      const uploadResult = await uploadAvatarFile(file);
      const imageUrl = uploadResult.url;

      const persisted = await updateProfile({
        photoURL: imageUrl,
        avatar: imageUrl,
      });

      const updatedUser = persisted.user;
      setProfile((current) => ({
        ...current,
        photoURL: updatedUser.photoURL ?? imageUrl,
        avatar: updatedUser.avatar ?? imageUrl,
      }));
      setUser((current) => ({
        ...current,
        photoURL: updatedUser.photoURL ?? imageUrl,
        avatar: updatedUser.avatar ?? imageUrl,
      }));
      setSavedMessage("Avatar updated successfully!");
      window.setTimeout(() => setSavedMessage(""), 2200);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Failed to upload avatar.");
    } finally {
      setIsAvatarUploading(false);
      event.target.value = "";
    }
  }

  async function handleSave(event) {
  event.preventDefault();
  setErrorMessage("");
  setSavedMessage("");
  setIsSubmitting(true);

  try {
    const res = await updateProfile({
      fullName: profile.fullName,
      roleCategory: profile.roleCategory,
      role: profile.role,
      roleLabel: profile.roleLabel,
      photoURL: profile.photoURL || null,
      avatar: profile.avatar || null,
    });
    const user = res.user;

    const updatedProfile = {
      ...profile,
      fullName: user.fullName,
      photoURL: user.photoURL ?? null,
      avatar: user.avatar ?? null,
      roleLabel: user.roleLabel,
    };

    setProfile(updatedProfile);
    setUser(updatedProfile);

    setSavedMessage("Profile updated successfully!");
    window.setTimeout(() => setSavedMessage(""), 2200);
  } catch (error) {
    setErrorMessage(error.message || "Failed to update profile.");
  } finally {
    setIsSubmitting(false);
  }
}

  async function handleChangePassword(event) {
    event.preventDefault();
    setErrorMessage("");
    setSavedMessage("");
    setIsSubmitting(true);

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords don't match.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      setIsSubmitting(false);
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSavedMessage("Password changed successfully!");
      window.setTimeout(() => setSavedMessage(""), 2200);
    } catch (error) {
      setErrorMessage(error.message || "Failed to change password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAccount(event) {
    event.preventDefault();
    setErrorMessage("");
    setSavedMessage("");
    setIsSubmitting(true);

    try {
      await deleteAccount({ password: deletePassword });

      setProfile(null);
      setUser(null);
      navigate("/login");
      setSavedMessage("Account deleted successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete account.");
    } finally {
      setIsSubmitting(false);
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
            Manage your role category and preferences. This helps tailor lessons and dashboard recommendations.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="mt-8 flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-3 font-semibold text-sm transition border-b-2 ${
                activeTab === "profile"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              📝 Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-3 font-semibold text-sm transition border-b-2 ${
                activeTab === "security"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              🔒 Security
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-4 py-3 font-semibold text-sm transition border-b-2 ${
                activeTab === "account"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              ⚙️ Account
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
                <form
                  onSubmit={handleSave}
                  className="rounded-3xl border border-slate-200/80 bg-white/75 p-6 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.55)] backdrop-blur sm:p-8"
                >
                  <h2 className="text-lg font-bold text-slate-900 mb-4">📝 Update Your Profile</h2>

                  <div className="mb-5 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/70 p-5">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => document.getElementById("profile-avatar-input")?.click()}
                            className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800 ring-2 ring-indigo-200 transition hover:ring-indigo-300"
                            aria-label="Change profile photo"
                          >
                            {profileImageUrl && !avatarLoadFailed ? (
                              <img
                                src={profileImageUrl}
                                alt="Profile avatar"
                                className="h-full w-full object-cover"
                                onError={handleAvatarLoadError}
                              />
                            ) : (
                              <span>{profileInitial}</span>
                            )}
                            <span className="absolute right-0 bottom-0 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-sm transition group-hover:bg-indigo-700">
                              <PencilLine className="h-4 w-4" />
                            </span>
                          </button>
                          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase leading-none text-indigo-700">Edit</span>
                        </div>
                        <div className="pt-1">
                          <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Avatar</p>
                          <h3 className="mt-1 text-lg font-semibold text-slate-900">{profileDisplayName}</h3>
                          <p className="mt-1 max-w-md text-sm text-slate-600">
                            Tap the edit icon to change your profile photo.
                          </p>
                        </div>
                      </div>
                    </div>

                    <input
                      id="profile-avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      disabled={isAvatarUploading}
                      className="sr-only"
                    />
                  </div>

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
                      Email
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
                      disabled={isSubmitting}
                      className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "💾 Save Changes"}
                    </button>
                    {savedMessage && <span className="text-sm font-medium text-emerald-700">{savedMessage}</span>}
                  </div>
                </form>

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
                </aside>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form
                onSubmit={handleChangePassword}
                className="max-w-md rounded-3xl border border-slate-200/80 bg-white/75 p-6 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.55)] backdrop-blur sm:p-8"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4">🔒 Change Password</h3>

                <label className="block space-y-2 text-sm font-semibold text-slate-700 mb-4">
                  Current Password
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  />
                </label>

                <label className="block space-y-2 text-sm font-semibold text-slate-700 mb-4">
                  New Password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  />
                </label>

                <label className="block space-y-2 text-sm font-semibold text-slate-700 mb-5">
                  Confirm New Password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "🔄 Update Password"}
                </button>
                {savedMessage && <div className="mt-3 text-sm font-medium text-emerald-700">{savedMessage}</div>}
              </form>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <form
                onSubmit={handleDeleteAccount}
                className="max-w-md rounded-3xl border border-red-200/80 bg-red-50/75 p-6 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.55)] backdrop-blur sm:p-8"
              >
                <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ Delete Account</h3>
                <p className="text-sm text-red-700 mb-5">This action cannot be undone. All your data will be permanently deleted.</p>

                <label className="block space-y-2 text-sm font-semibold text-red-700 mb-5">
                  Enter your password to confirm:
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-red-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-200"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Deleting..." : "🗑️ Permanently Delete Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default ProfilePage;
