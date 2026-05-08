//Page that displays list of excersizes

import { useState, useEffect } from "react";
import { fitnessApi } from "@/api/fitnessApi";
import type { ExerciseDto } from "@/api/types";

const FILTERS = ["All", "Arms & Shoulders", "Chest", "Back", "Legs", "Abs", "Cardio"];

const MUSCLE_MAP: Record<string, string> = {
  "Arms & Shoulders": "arms",
  "Chest": "chest",
  "Back": "back",
  "Legs": "legs",
  "Abs": "abs",
  "Cardio": "cardio",
};

export default function Exercises() {
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
  fitnessApi.listExercises()
    .then(setExercises)
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
}, []);

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      ex.muscleGroup.toLowerCase().includes(MUSCLE_MAP[activeFilter] ?? "");
    return matchesSearch && matchesFilter;
  });

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-zinc-900">Exercises</h1>

      <input
        type="text"
        placeholder="Search exercises..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-1.5 text-sm border transition ${
              activeFilter === filter
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-zinc-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-y-auto max-h-[60vh] space-y-2 pr-1">
        {filtered.length === 0 && !loading ? (
          <p className="text-sm text-zinc-500">No exercises found.</p>
        ) : (
          filtered.map((ex) => (
            <div
              key={ex.id}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm space-y-1"
            >
              <p className="text-sm font-medium text-zinc-900">{ex.name}</p>
              <p className="text-xs text-zinc-500">{ex.muscleGroup}{ex.equipment ? ` · ${ex.equipment}` : ""}</p>
              {ex.notes && <p className="text-xs text-zinc-400">{ex.notes}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}