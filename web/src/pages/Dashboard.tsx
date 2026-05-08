import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "@/stores/settingsStore";
import { fitnessApi } from "@/api/fitnessApi";
import type { WorkoutSessionDto } from "@/api/types";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const unit = useSettingsStore((s) => s.unit);

  const [workouts, setWorkouts] = useState<WorkoutSessionDto[]>([]);
  const [stats, setStats] = useState({ totalWeight: 0, workoutCount: 0, timeElapsed: 0 });

  // Helper to handle unit conversion for display
  const displayWeight = (kg: number): string => {
    return unit === "lbs" ? `${(kg * 2.20462).toFixed(1)} lbs` : `${kg} kg`;
  };

  useEffect(() => {
    if (!token) return;

    async function loadDashboardData() {
      try {
        // Load stats and full workout history in parallel
        const [statsRes, workoutsList] = await Promise.all([
          fitnessApi.get("/api/stats/summary"),
          fitnessApi.listWorkouts()
        ]);

        setStats(statsRes.data);
        setWorkouts(workoutsList);
      } catch (err) {
        console.error("Dashboard sync failed:", err);
      }
    }

    loadDashboardData();
  }, [token]);

  const handleStartEmptyWorkout = async () => {
  try {
    const res = await fitnessApi.post("/api/workout-sessions", {
      notes: "Quick Workout",
      planId: null
    });
    
    const newSessionId = res.data.id;
    navigate(`/workouts/${newSessionId}`);
  } catch (err) {
    console.error("Could not start workout:", err);
  }
};

// Then in your JSX:
<button onClick={handleStartEmptyWorkout} className="...">
  Start Empty Workout
</button>

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900">
          Hello, {user?.displayName ?? "Athlete"} 👋
        </h1>
      </header>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button 
          onClick={() => navigate("/workouts/active")} 
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

      {/* Weekly Stats Grid */}
      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-3">This week's stats:</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-sm text-zinc-500">Total Volume</p>
            <p className="text-2xl font-bold text-zinc-900">{displayWeight(stats.totalWeight)}</p>
          </div>
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

      {/* Workout History Feed */}
      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-3">Recent Activity:</h2>
        <div className="space-y-3">
          {workouts.length === 0 ? (
            <p className="text-sm text-zinc-500 italic">No workouts recorded yet. Time to hit the gym!</p>
          ) : (
            workouts.map((w) => (
              <div
                key={w.id}
                onClick={() => navigate(`/workouts/${w.id}`, { state: { workout: w } })}
                className="group cursor-pointer flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 transition-all"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 group-hover:text-black">
                    {w.notes || "Unnamed Session"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(w.startedAt).toLocaleDateString(undefined, { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="text-zinc-400 group-hover:text-zinc-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}