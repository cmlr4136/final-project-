import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fitnessApi } from "@/api/fitnessApi";
import type { ExerciseDto } from "@/api/types";

type WorkoutEntry = {
  id: number;
  exercise: ExerciseDto | null;
  sets: string;
  reps: string;
  weight: string;
  time: string;
  search: string;
  results: ExerciseDto[];
};

function newEntry(id: number): WorkoutEntry {
  return { id, exercise: null, sets: "", reps: "", weight: "", time: "", search: "", results: [] };
}

//Format seconds into MM:SS
function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Workouts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");

  const [entries, setEntries] = useState<WorkoutEntry[]>([newEntry(1)]);
  const [nextId, setNextId] = useState(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [allExercises, setAllExercises] = useState<ExerciseDto[]>([]);
  const [workoutTitle, setWorkoutTitle] = useState("New Workout");
  const [workoutName, setWorkoutName] = useState("");


  
  const [seconds, setSeconds] = useState(0);

  //Start the Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Exercises and Plan
  useEffect(() => {
    Promise.all([
      fitnessApi.listExercises(),
      planId ? fitnessApi.getPlan(planId) : Promise.resolve(null)
    ])
    .then(([exData, planData]) => {
      setAllExercises(exData);

      if (planData) {
        setWorkoutTitle(planData.name); 
        
        // Auto-populate the exercises if the plan has them
        if (planData.exercises && planData.exercises.length > 0) {
          const mapped = planData.exercises.map((item, index) => {
            const matchedEx = exData.find(e => e.id === item.exerciseId) || null;
            return {
              id: index + 1,
              exercise: matchedEx,
              search: matchedEx ? matchedEx.name : "",
              results: [],
              sets: item.targetSets ? item.targetSets.toString() : "",
              reps: item.targetReps ? item.targetReps.toString() : "",
              weight: item.targetWeight ? item.targetWeight.toString() : "",
              time: item.targetDurationSec ? (item.targetDurationSec / 60).toString() : ""
            };
          });
          setEntries(mapped);
          setNextId(planData.exercises.length + 1);
        }
      }
    })
    .catch(() => setError("Failed to load workout data."));
  }, [planId]);

  function handleSearch(id: number, query: string) {
    const results = allExercises.filter((ex) =>
      ex.name.toLowerCase().includes(query.toLowerCase())
    );
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, search: query, results, exercise: null } : e)));
  }

  function handleSelect(id: number, exercise: ExerciseDto) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, exercise, search: exercise.name, results: [] } : e));
  }

  function handleChange(id: number, field: keyof WorkoutEntry, value: string) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function handleRemove(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleAdd() {
    setEntries((prev) => [...prev, newEntry(nextId)]);
    setNextId((n) => n + 1);
  }

  async function handleSave() {
    const missingSelection = entries.some(e => e.search.trim() !== "" && !e.exercise);
    if (missingSelection) {
      setError("Please click and select the exercise from the dropdown menu!");
      return; // Stop saving until they select it
    }
    setSaving(true);
    try {
      //Create the main workout session
      const session = await fitnessApi.createWorkout({ 
        planId: planId || null, 
        notes: `${workoutName || "Workout"} | ${formatTime(seconds)}`
      });
      
      // 2. Loop through every tracked exercise and save it to the database!
      await Promise.all(
        entries.map((ex, index) => {
          if (!ex.exercise) return Promise.resolve(); // Skip empty rows
          return fitnessApi.addSetEntry(session.id, {
            exerciseId: ex.exercise.id,
            setIndex: index + 1, // Saves the order of the workout
            reps: ex.reps ? parseInt(ex.reps) : undefined,
            weight: ex.weight ? parseFloat(ex.weight) : undefined,
            durationSec: ex.time ? parseInt(ex.time) * 60 : undefined,
          });
        })
      );
      
      await fitnessApi.finishWorkout(session.id);

      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save workout");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{workoutTitle}</h1>
          <div className="mt-1 flex items-center gap-2 text-zinc-500 font-mono text-lg">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {formatTime(seconds)}
          </div>
        </div>

        <div className="space-y-1 max-w-md">
          <label className="text-sm text-zinc-500">Workout Name (optional)</label>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g. Push Day"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>
        
        <button onClick={() => navigate(-1)} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900">Exercise</p>
              <button onClick={() => handleRemove(entry.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>

            <div className="space-y-1 relative">
              <label className="text-xs text-zinc-500">Exercise Name</label>
              <input
                type="text"
                value={entry.search}
                onChange={(e) => handleSearch(entry.id, e.target.value)}
                placeholder="Search exercises..."
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              />
              {entry.results.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-zinc-200 rounded-md shadow-md max-h-40 overflow-y-auto">
                  {entry.results.map((ex) => (
                    <div key={ex.id} onClick={() => handleSelect(entry.id, ex)} className="px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 cursor-pointer">
                      {ex.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Sets</label>
                <input type="number" value={entry.sets} onChange={(e) => handleChange(entry.id, "sets", e.target.value)} placeholder="3" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Reps</label>
                <input type="number" value={entry.reps} onChange={(e) => handleChange(entry.id, "reps", e.target.value)} placeholder="10" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Weight (kg)</label>
                <input type="number" value={entry.weight} onChange={(e) => handleChange(entry.id, "weight", e.target.value)} placeholder="60" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Time (min)</label>
                <input type="number" value={entry.time} onChange={(e) => handleChange(entry.id, "time", e.target.value)} placeholder="5" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button onClick={handleAdd} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">+ Add Exercise</button>
        <button onClick={handleSave} disabled={saving} className="rounded-md bg-zinc-900 px-6 py-2 text-sm font-bold text-white hover:bg-zinc-700 disabled:opacity-50 shadow-sm">
          {saving ? "Saving..." : "Finish Workout"}
        </button>
      </div>
    </section>
  );
}