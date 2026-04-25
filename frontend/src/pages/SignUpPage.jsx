import { motion } from "framer-motion";
import { Camera, Images, UserCircle2 } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import StickySectionLabel from "@/components/StickySectionLabel";
import { useAuth } from "@/lib/AuthContext";
import { uploadAvatarFile } from "@/lib/authApi";
import { AVATAR_PRESETS } from "@/lib/avatarPresets";
import { prepareAvatarImageFile } from "@/lib/imageProcessing";
import {
  ROLE_CATEGORY_OPTIONS,
  getRolesForCategory,
} from "@/lib/profileStorage";

function SignUpPage() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleCategory, setRoleCategory] = useState(ROLE_CATEGORY_OPTIONS[0].value);
  const [role, setRole] = useState(getRolesForCategory(ROLE_CATEGORY_OPTIONS[0].value)[0].value);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState("");
  const avatarPhotosInputRef = useRef(null);
  const avatarCameraInputRef = useRef(null);
  const avatarMenuRef = useRef(null);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isAvatarPresetOpen, setIsAvatarPresetOpen] = useState(false);
  const [isPreparingAvatar, setIsPreparingAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check for Google OAuth token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    if (token) {
      loginWithGoogle(token).then((result) => {
        if (result.success) {
          navigate("/profile");
        } else {
          setErrorMessage(result.error || "Google signup failed");
        }
      });
    }
  }, [loginWithGoogle, navigate]);

  useEffect(() => {
    if (!isAvatarMenuOpen) {
      return;
    }

    function handleOutsideClick(event) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [isAvatarMenuOpen]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const roleOptions = useMemo(() => getRolesForCategory(roleCategory), [roleCategory]);

  function handleCategoryChange(nextCategory) {
    setRoleCategory(nextCategory);
    const nextRoles = getRolesForCategory(nextCategory);
    setRole(nextRoles[0]?.value ?? "");
  }

  function openInputPicker(inputRef) {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  }

  function clearAvatarSelection() {
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setSelectedAvatarUrl("");
    setAvatarPreview("");
  }

  function selectPresetAvatar(url) {
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setSelectedAvatarUrl(url);
    setAvatarPreview(url);
    setIsAvatarPresetOpen(false);
    setIsAvatarMenuOpen(false);
  }

  async function handleAvatarInputChange(event) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) {
      return;
    }

    setErrorMessage("");
    setIsPreparingAvatar(true);

    try {
      const processedFile = await prepareAvatarImageFile(file, {
        size: 512,
        quality: 0.9,
      });

      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarFile(processedFile);
      setSelectedAvatarUrl("");
      setAvatarPreview(URL.createObjectURL(processedFile));
    } catch (error) {
      setErrorMessage(error.message || "Could not process selected image.");
    } finally {
      setIsPreparingAvatar(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      let uploadedAvatarUrl = selectedAvatarUrl || null;
      if (avatarFile) {
        const uploadResult = await uploadAvatarFile(avatarFile);
        uploadedAvatarUrl = uploadResult.url;
      }

      const result = await signup({
        fullName,
        email,
        password,
        roleCategory,
        role,
        roleLabel: roleOptions.find((item) => item.value === role)?.label ?? role,
        photoURL: uploadedAvatarUrl,
        avatar: uploadedAvatarUrl,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Unable to create account right now.");
        setIsSubmitting(false);
        return;
      }

      // Account created successfully - redirect to login
      setSuccessMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || "Unable to create account right now.");
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
            className="mt-6 grid gap-6 rounded-3xl border border-slate-200/80 bg-white/75 p-6 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.55)] backdrop-blur sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/75 px-2 text-slate-500">Create your account with email</span>
              </div>
            </div>

            <div className="mx-auto" ref={avatarMenuRef}>
              <button
                type="button"
                onClick={() => setIsAvatarMenuOpen((open) => !open)}
                className="group relative h-24 w-24"
                aria-label="Choose profile image"
              >
                <div className="h-full w-full overflow-hidden rounded-full ring-2 ring-indigo-200 transition group-hover:ring-indigo-300">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-3xl font-bold text-indigo-800">
                      {String(fullName || email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute right-1 bottom-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-sm">
                  <Camera className="h-4 w-4" />
                </div>
              </button>

              {isAvatarMenuOpen && (
                <>
                <div className="mt-3 hidden w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg sm:block">
                  {!isAvatarPresetOpen ? (
                    <>
                  <button
                    type="button"
                    onClick={() => {
                      openInputPicker(avatarCameraInputRef);
                      setIsAvatarMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Camera className="h-4 w-4 text-indigo-700" />
                    Camera
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      openInputPicker(avatarPhotosInputRef);
                      setIsAvatarMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Images className="h-4 w-4 text-indigo-700" />
                    Photos
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarPresetOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <UserCircle2 className="h-4 w-4 text-indigo-700" />
                    Avatar
                  </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsAvatarPresetOpen(false)}
                        className="mb-2 w-full rounded-xl px-3 py-2 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase transition hover:bg-slate-100"
                      >
                        Back
                      </button>
                      <div className="grid grid-cols-4 gap-2 px-1 pb-1">
                        {AVATAR_PRESETS.map((presetUrl) => (
                          <button
                            key={presetUrl}
                            type="button"
                            onClick={() => selectPresetAvatar(presetUrl)}
                            className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-transparent transition hover:ring-indigo-300"
                          >
                            <img src={presetUrl} alt="Preset avatar" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div
                  className="fixed inset-0 z-40 bg-slate-900/30 sm:hidden"
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                    setIsAvatarPresetOpen(false);
                  }}
                />
                <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-slate-200 bg-white px-5 pb-6 pt-4 shadow-2xl sm:hidden">
                  <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-300" />
                  {!isAvatarPresetOpen ? (
                    <>
                  <button
                    type="button"
                    onClick={() => {
                      openInputPicker(avatarCameraInputRef);
                      setIsAvatarMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-base font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                      <Camera className="h-5 w-5" />
                    </span>
                    Camera
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      openInputPicker(avatarPhotosInputRef);
                      setIsAvatarMenuOpen(false);
                    }}
                    className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-base font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                      <Images className="h-5 w-5" />
                    </span>
                    Photos
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarPresetOpen(true);
                    }}
                    className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-base font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                      <UserCircle2 className="h-5 w-5" />
                    </span>
                    Avatar
                  </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsAvatarPresetOpen(false)}
                        className="mb-3 w-full rounded-2xl px-3 py-2 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase transition hover:bg-slate-100"
                      >
                        Back
                      </button>
                      <div className="grid grid-cols-4 gap-3 px-1">
                        {AVATAR_PRESETS.map((presetUrl) => (
                          <button
                            key={`mobile-${presetUrl}`}
                            type="button"
                            onClick={() => selectPresetAvatar(presetUrl)}
                            className="h-14 w-14 overflow-hidden rounded-full ring-2 ring-transparent transition hover:ring-indigo-300"
                          >
                            <img src={presetUrl} alt="Preset avatar" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          clearAvatarSelection();
                          setIsAvatarMenuOpen(false);
                          setIsAvatarPresetOpen(false);
                        }}
                        className="mt-4 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Use Initial Avatar
                      </button>
                    </>
                  )}
                </div>
                </>
              )}

              <input
                ref={avatarPhotosInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarInputChange}
                className="sr-only"
              />

              <input
                ref={avatarCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleAvatarInputChange}
                className="sr-only"
              />
            </div>

            {isPreparingAvatar && (
              <p className="-mt-3 text-center text-xs font-semibold text-indigo-700">Optimizing image...</p>
            )}

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

            <div className="pt-2">
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/75 px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => (window.location.href = "http://localhost:5000/api/auth/google")}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition group-hover:border-slate-300">
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </span>
                Sign up with Google
              </button>
            </div>

            {errorMessage && (
              <p className="text-sm font-medium text-rose-700" role="alert">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="text-sm font-medium text-emerald-700" role="alert">
                {successMessage}
              </p>
            )}
          </form>
        </div>
      </motion.section>
    </div>
  );
}

export default SignUpPage;
