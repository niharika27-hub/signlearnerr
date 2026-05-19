import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getUserBadges, getBadgeStats } from "@/lib/authApi";
import { Trophy, Award, Zap, Flame } from "lucide-react";

function BadgeIcon({ icon }) {
  // Map badge emoji/icon to component
  const iconMap = {
    "✨": <span className="text-lg">✨</span>,
    "📚": <span className="text-lg">📚</span>,
    "🎯": <span className="text-lg">🎯</span>,
    "🔥": <Flame className="h-5 w-5 text-orange-500" />,
    "👑": <span className="text-lg">👑</span>,
    "🏅": <Award className="h-5 w-5 text-amber-600" />,
    "🏆": <Trophy className="h-5 w-5 text-yellow-600" />,
    "⚔️": <span className="text-lg">⚔️</span>,
    "💪": <span className="text-lg">💪</span>,
    "⭐": <span className="text-lg">⭐</span>,
    "💫": <span className="text-lg">💫</span>,
    "🌟": <Zap className="h-5 w-5 text-yellow-500" />,
  };
  return iconMap[icon] || <Award className="h-5 w-5 text-indigo-600" />;
}

export default function Badges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBadges() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [badgesRes, statsRes] = await Promise.all([
          getUserBadges(),
          getBadgeStats(),
        ]);
        setBadges(badgesRes.badges || []);
        setStats(statsRes.stats || null);
        setError(null);
      } catch (err) {
        console.error("Error fetching badges:", err);
        setError("Failed to load badges");
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, [user]);

  if (!user) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 text-center backdrop-blur">
        <p className="text-slate-600">Sign in to view your badges and achievements</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 text-center backdrop-blur">
        <p className="text-slate-600">Loading badges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-rose-50/70 p-8 text-center backdrop-blur">
        <p className="text-rose-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Badge Statistics */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/70 to-indigo-100/50 p-4 backdrop-blur">
            <div className="text-3xl font-bold text-indigo-900">{stats.totalBadges}</div>
            <p className="mt-1 text-sm font-semibold text-indigo-700">Total Badges</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50/70 to-emerald-100/50 p-4 backdrop-blur">
            <div className="text-3xl font-bold text-emerald-900">{stats.byCategory.progress}</div>
            <p className="mt-1 text-sm font-semibold text-emerald-700">Progress</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50/70 to-amber-100/50 p-4 backdrop-blur">
            <div className="text-3xl font-bold text-amber-900">{stats.byCategory.streak}</div>
            <p className="mt-1 text-sm font-semibold text-amber-700">Streak</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50/70 to-rose-100/50 p-4 backdrop-blur">
            <div className="text-3xl font-bold text-rose-900">{stats.byCategory.performance}</div>
            <p className="mt-1 text-sm font-semibold text-rose-700">Performance</p>
          </div>
        </div>
      )}

      {/* Badges Grid */}
      {badges.length > 0 ? (
        <div>
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">Your Achievements</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge._id}
                className="group rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-indigo-600 dark:hover:bg-slate-700/50"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900">
                    <BadgeIcon icon={badge.badgeIcon} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {badge.badgeName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {badge.badgeDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/30">
          <Trophy className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-600 dark:text-slate-400">
            No badges earned yet. Keep learning to unlock achievements!
          </p>
        </div>
      )}
    </div>
  );
}
