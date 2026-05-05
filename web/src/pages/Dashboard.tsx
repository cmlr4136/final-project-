//Used for home page

import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "@/stores/settingsStore";



export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const unit = useSettingsStore((s) => s.unit);

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
            <p className="text-2xl font-bold text-zinc-900">{displayWeight(1)}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-sm text-zinc-500">Time Elapsed</p>
            <p className="text-2xl font-bold text-zinc-900">0 min</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-1">
            <p className="text-sm text-zinc-500">Workouts</p>
            <p className="text-2xl font-bold text-zinc-900">0</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-zinc-900 mb-3">Recent Workouts:</h2>
        <div className="space-y-2">
          {[
            { day: "Monday", title: "Push Day", time: "45 min" },
            { day: "Wednesday", title: "Pull Day", time: "50 min" },
            { day: "Friday", title: "Leg Day", time: "60 min" },
          ].map((workout) => (
            <div
              key={workout.day}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
            >
              <p className="text-sm font-medium text-zinc-900">{workout.day}</p>
              <p className="text-sm text-zinc-700">{workout.title}</p>
              <p className="text-sm text-zinc-500">{workout.time}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}