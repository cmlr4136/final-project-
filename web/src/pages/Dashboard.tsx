import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "@/stores/settingsStore";
import { useState, useEffect } from "react";
import { fitnessApi } from "@/api/fitnessApi";
import type { WorkoutSessionDto } from "@/api/types";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const unit = useSettingsStore((s) => s.unit);
  const [workouts, setWorkouts] = useState<WorkoutSessionDto[]>([]);
  const token = useAuthStore((s) => s.token);

useEffect(() => {
  if (!token) return;
  fitnessApi.listWorkouts().then(setWorkouts).catch(() => {});
}, [token]);

  function displayWeight(kg: number): string {
    return unit === "lbs" ? `${(kg * 2.20462).toFixed(1)} lbs` : `${kg} kg`;
  }

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">
        Hello, {user?.displayName ?? "there"} 👋
      </h1>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/workouts")}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Start Empty Workout
        </button>
        <button
          onClick={() => navigate("/plans")}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-100"
        >
          Start Plan
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">This week's stats:</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-sm text-zinc-500">Total Weight Moved</p>
            <p className="text-2xl font-bold text-zinc-900">{displayWeight(0)}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-sm text-zinc-500">Time Elapsed</p>
            <p className="text-2xl font-bold text-zinc-900">0 min</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-sm text-zinc-500">Workouts</p>
            <p className="text-2xl font-bold text-zinc-900">{workouts.length}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">All Workouts:</h2>
        <div className="space-y-2">
          {workouts.length === 0 && (
            <p className="text-sm text-zinc-500">No workouts yet.</p>
          )}
          {workouts.map((w) => (
            <div
              key={w.id}
              onClick={() => navigate(`/workouts/${w.id}`, { state: { workout: w } })}
              className="cursor-pointer flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:bg-zinc-50"
            >
              <p className="text-sm font-medium text-zinc-900">
                {new Date(w.startedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-zinc-500">
                {w.endedAt
                  ? `${Math.round((new Date(w.endedAt).getTime() - new Date(w.startedAt).getTime()) / 60000)} min`
                  : "In progress"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}