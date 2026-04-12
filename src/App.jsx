import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import ScrollProgressHud from "@/components/ScrollProgressHud";
import SignLanguageBackground from "@/components/SignLanguageBackground";
import { useLenisSmoothScroll } from "@/hooks/useLenisSmoothScroll";
import HomePage from "@/pages/HomePage";
import LearnPage from "@/pages/LearnPage";
import PracticePage from "@/pages/PracticePage";
import ProgressPage from "@/pages/ProgressPage";

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
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;
