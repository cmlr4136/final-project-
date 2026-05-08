import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettingsStore } from "@/stores/settingsStore";
import { fitnessApi } from "@/api/fitnessApi";
import { apiClient } from "@/api/client";
import type { WorkoutSessionDto } from "@/api/types";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const location = useLocation();
  const unit = useSettingsStore((s) => s.unit);

  const [workouts, setWorkouts] = useState<WorkoutSessionDto[]>([]);
  const [stats, setStats] = useState({ totalWeight: 0, workoutCount: 0, timeElapsed: 0 });

  const displayWeight = (kg: number): string => {
    return unit === "lbs" ? `${(kg * 2.20462).toFixed(1)} lbs` : `${kg} kg`;
  };

  useEffect(() => {
    if (!token) return;

    async function loadDashboardData() {
      try {
        // 1. Fetch Workouts with cache buster
        const workoutsList = await apiClient.get<WorkoutSessionDto[]>(`/api/workout-sessions?t=${Date.now()}`);
        setWorkouts(workoutsList);

        // 2. Filter for this week
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weeklyWorkouts = workoutsList.filter((w: any) => new Date(w.startedAt) >= lastWeek);

        let totalMin = 0;
        let totalVol = 0;

        // 3. Loop through workouts to calculate Time and Volume
        for (const w of weeklyWorkouts) {
          if (w.endedAt) {
            const diff = new Date(w.endedAt).getTime() - new Date(w.startedAt).getTime();
            totalMin += Math.ceil(diff / 60000); // Use ceil so short tests count
          }

          try {
            const sets = await fitnessApi.getSessionSets(w.id);
            sets.forEach((s: any) => {
              const wVal = parseFloat(s.weight);
              const rVal = parseInt(s.reps);
              if (!isNaN(wVal) && !isNaN(rVal)) {
                totalVol += (wVal * rVal);
              }
            });
          } catch (e) {
            console.warn("Could not fetch sets for workout", w.id);
          }
        }

        setStats({
          totalWeight: totalVol,
          workoutCount: weeklyWorkouts.length,
          timeElapsed: totalMin
        });

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }

    loadDashboardData();
  }, [token, location.key]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900">
          Hello, {user?.displayName ?? "Athlete"} 👋
        </h1>
      </header>

      <div className="flex gap-3">
        <button 
          onClick={() => navigate("/workouts")} 
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
        >
          Start Empty Workout
        </button>
        <button 
          onClick={() => navigate("/plans")} 
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          Start Plan
        </button>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-3">This week's stats:</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-sm text-zinc-500">Time Elapsed</p>
            <p className="text-2xl font-bold text-zinc-900">{stats.timeElapsed} min</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-sm text-zinc-500">Workouts</p>
            <p className="text-2xl font-bold text-zinc-900">{stats.workoutCount}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-3">Recent Activity:</h2>
        <div className="space-y-3">
          {workouts.length === 0 ? (
            <p className="text-sm text-zinc-500 italic">No workouts recorded yet.</p>
          ) : (
            workouts.map((w) => (
              <div
                key={w.id}
                className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm transition-all"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 group-hover:text-black">
                    {w.notes || "Unnamed Session"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(w.startedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}