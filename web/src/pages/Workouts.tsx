import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function Workouts() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<WorkoutEntry[]>([newEntry(1)]);
  const [nextId, setNextId] = useState(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allExercises, setAllExercises] = useState<ExerciseDto[]>([]);

  useEffect(() => {
    fitnessApi.listExercises().then(setAllExercises).catch(() => {});
  }, []);

  function handleSearch(id: number, query: string) {
    const results = allExercises.filter((ex) =>
      ex.name.toLowerCase().includes(query.toLowerCase())
    );
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, search: query, results, exercise: null } : e))
    );
  }

  function handleSelect(id: number, exercise: ExerciseDto) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, exercise, search: exercise.name, results: [] } : e
      )
    );
  }

  function handleChange(id: number, field: keyof WorkoutEntry, value: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  function handleRemove(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleAdd() {
    setEntries((prev) => [...prev, newEntry(nextId)]);
    setNextId((n) => n + 1);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fitnessApi.createWorkout({ notes: null });
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save workout");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">New Workout</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900">Exercise</p>
              <button
                onClick={() => handleRemove(entry.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>

            {/* Exercise search */}
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
                    <div
                      key={ex.id}
                      onClick={() => handleSelect(entry.id, ex)}
                      className="px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                    >
                      {ex.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sets/Reps/Weight/Time */}
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Sets</label>
                <input
                  type="number"
                  value={entry.sets}
                  onChange={(e) => handleChange(entry.id, "sets", e.target.value)}
                  placeholder="3"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Reps</label>
                <input
                  type="number"
                  value={entry.reps}
                  onChange={(e) => handleChange(entry.id, "reps", e.target.value)}
                  placeholder="10"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Weight (kg)</label>
                <input
                  type="number"
                  value={entry.weight}
                  onChange={(e) => handleChange(entry.id, "weight", e.target.value)}
                  placeholder="60"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Time (min)</label>
                <input
                  type="number"
                  value={entry.time}
                  onChange={(e) => handleChange(entry.id, "time", e.target.value)}
                  placeholder="5"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          + Add Exercise
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Finish Workout"}
        </button>
      </div>
    </section>
  );
}