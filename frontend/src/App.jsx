import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppNavbar from "@/components/AppNavbar";
import ScrollProgressHud from "@/components/ScrollProgressHud";
import SignLanguageBackground from "@/components/SignLanguageBackground";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLenisSmoothScroll } from "@/hooks/useLenisSmoothScroll";
import { useAuth } from "@/lib/AuthContext";
import HomePage from "@/pages/HomePage";
import LearnPage from "@/pages/LearnPage";
import LoginPage from "@/pages/LoginPage";
import PracticePage from "@/pages/PracticePage";
import ProgressPage from "@/pages/ProgressPage";
import ProfilePage from "@/pages/ProfilePage";
import SignUpPage from "@/pages/SignUpPage";

function App() {
  const { pathname } = useLocation();
  const { init } = useAuth();

  // Initialize auth on app load
  useEffect(() => {
    init?.();
  }, [init]);

  useLenisSmoothScroll(pathname);

  return (
    <main className="relative overflow-hidden text-slate-900">
      <div className="app-atmosphere" />
      <SignLanguageBackground />
      <div className="ambient-fill" />
      <div className="mesh-lines" />
      <div className="noise-overlay" />
      <div className="relative z-10">
        <AppNavbar />
        <ScrollProgressHud />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <LearnPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <PracticePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;
