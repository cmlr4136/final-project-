import { useLocation, useNavigate } from "react-router-dom";
import type { WorkoutSessionDto } from "@/api/types";

export default function WorkoutView() {
  const location = useLocation();
  const navigate = useNavigate();
  const workout = location.state?.workout as WorkoutSessionDto | undefined;

  if (!workout) return <p className="text-sm text-red-600">Workout not found.</p>;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Workout — {new Date(workout.startedAt).toLocaleDateString()}
          </h1>
          {workout.notes && <p className="text-sm text-zinc-500">{workout.notes}</p>}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          Back
        </button>
      </div>

      <p className="text-sm text-zinc-500">
        Started: {new Date(workout.startedAt).toLocaleTimeString()}
      </p>
      {workout.endedAt && (
        <p className="text-sm text-zinc-500">
          Duration: {Math.round((new Date(workout.endedAt).getTime() - new Date(workout.startedAt).getTime()) / 60000)} min
        </p>
      )}

      <p className="text-sm text-zinc-500">Exercise details coming soon.</p>
    </section>
  );
}