import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fitnessApi } from "@/api/fitnessApi";
import type { WorkoutSessionDto, ExerciseDto } from "@/api/types";

export default function WorkoutView() {
  const location = useLocation();
  const navigate = useNavigate();
  const workout = location.state?.workout as WorkoutSessionDto | undefined;

  const [sets, setSets] = useState<any[]>([]);
  const [exercises, setExercises] = useState<Record<string, ExerciseDto>>({});

  useEffect(() => {
    if (!workout) return;
    
    // Fetch both the sets for this workout AND the exercise library to match names
    Promise.all([
      fitnessApi.getSessionSets(workout.id),
      fitnessApi.listExercises()
    ]).then(([setsData, exData]) => {
      setSets(setsData);
      const exMap: Record<string, ExerciseDto> = {};
      exData.forEach(ex => exMap[ex.id] = ex);
      setExercises(exMap);
    }).catch(err => console.error("Failed to load workout details", err));
  }, [workout]);

  if (!workout) return <p className="text-sm text-red-600">Workout not found.</p>;

  // Safely calculate duration
  let durationStr = "In Progress";
  if (workout.endedAt) {
      const diffMs = new Date(workout.endedAt).getTime() - new Date(workout.startedAt).getTime();
      const mins = Math.round(diffMs / 60000);
      durationStr = mins > 0 ? `${mins} min` : "< 1 min";
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Workout — {new Date(workout.startedAt).toLocaleDateString()}
          </h1>
          {workout.notes && <p className="text-sm text-zinc-500">{workout.notes}</p>}
        </div>
        <button onClick={() => navigate(-1)} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
          Back
        </button>
      </div>

      <div className="flex gap-4 text-sm text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
        <p>Started: {new Date(workout.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        <p>Duration: <span className="font-medium text-zinc-900">{durationStr}</span></p>
      </div>

      <div className="space-y-4 pt-2">
        <h2 className="font-semibold text-zinc-900">Session Details</h2>
        {sets.length === 0 ? (
            <p className="text-sm text-zinc-500 italic">No specific exercises were logged for this session.</p>
        ) : (
            <div className="space-y-3">
                {sets.map((set, i) => {
                    const exName = exercises[set.exerciseId]?.name || "Unknown Exercise";
                    return (
                        <div key={set.id} className="p-4 border border-zinc-200 rounded-xl bg-white shadow-sm">
                            <p className="font-semibold text-sm text-zinc-900 mb-1">{i + 1}. {exName}</p>
                            <p className="text-sm text-zinc-600 flex gap-3">
                                {set.reps ? <span>{set.reps} reps</span> : null} 
                                {set.weight ? <span>{set.weight} kg</span> : null}
                                {set.durationSec ? <span>{Math.round(set.durationSec / 60)} min</span> : null}
                            </p>
                        </div>
                    )
                })}
            </div>
        )}
      </div>
    </section>
  );
}