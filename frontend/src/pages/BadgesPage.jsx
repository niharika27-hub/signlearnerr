import { useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Badges from "@/components/Badges";

export default function BadgesPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12 dark:from-slate-900 dark:to-slate-800">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Your Achievements</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Earn badges as you progress through your learning journey
            </p>
          </div>

          <Badges />
        </div>
      </div>
    </ProtectedRoute>
  );
}
