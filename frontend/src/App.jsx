import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import ScrollProgressHud from "@/components/ScrollProgressHud";
import SignLanguageBackground from "@/components/SignLanguageBackground";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLenisSmoothScroll } from "@/hooks/useLenisSmoothScroll";
import HomePage from "@/pages/HomePage";
import LearnPage from "@/pages/LearnPage";
import LoginPage from "@/pages/LoginPage";
import PracticePage from "@/pages/PracticePage";
import ProgressPage from "@/pages/ProgressPage";
import ProfilePage from "@/pages/ProfilePage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import SignUpPage from "@/pages/SignUpPage";
import AdminModulesPage from "@/pages/AdminModulesPage";

function App() {
  const { pathname } = useLocation();

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
          <Route
            path="/admin/modules"
            element={
              <ProtectedRoute>
                <AdminModulesPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;
