import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fitnessApi } from "@/api/fitnessApi";

type ExerciseEntry = {
  id: number;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  time: string;
};

function newEntry(id: number): ExerciseEntry {
  return { id, name: "", sets: "", reps: "", weight: "", time: "" };
}

function ExerciseTemplate({ entry, onChange, onRemove }: any) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900">Exercise</p>
        <button onClick={() => onRemove(entry.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Exercise Name</label>
        <input type="text" value={entry.name} onChange={(e) => onChange(entry.id, "name", e.target.value)} placeholder="e.g. Bench Press" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Sets</label>
          <input type="number" value={entry.sets} onChange={(e) => onChange(entry.id, "sets", e.target.value)} placeholder="3" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Reps</label>
          <input type="number" value={entry.reps} onChange={(e) => onChange(entry.id, "reps", e.target.value)} placeholder="10" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Weight (kg)</label>
          <input type="number" value={entry.weight} onChange={(e) => onChange(entry.id, "weight", e.target.value)} placeholder="60" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Time (min)</label>
          <input type="number" value={entry.time} onChange={(e) => onChange(entry.id, "time", e.target.value)} placeholder="5" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
        </div>
      </div>
    </div>
  );
}

export default function PlanForm() {
  const { id } = useParams<{ id: string }>(); // Z URL, jeśli edytujemy
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [planName, setPlanName] = useState("");
  const [planGoal, setPlanGoal] = useState("");
  const [exercises, setExercises] = useState<ExerciseEntry[]>([newEntry(1)]);
  const [nextId, setNextId] = useState(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  if (isEditing && id) {
    fitnessApi.getPlan(id)
      .then((plan) => {
        setPlanName(plan.name);
        setPlanGoal(plan.goal || "");
      })
      .catch(() => {
        setError("Plan not found");
        navigate("/plans");
      });
  }
}, [id]);


  function handleChange(id: number, field: keyof ExerciseEntry, value: string) {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function handleAddExercise() {
    setExercises((prev) => [...prev, newEntry(nextId)]);
    setNextId((n) => n + 1);
  }

  function handleRemove(id: number) {
  setExercises((prev) => prev.filter((e) => e.id !== id));
}

async function handleDelete() {
  if (!id) return;

  try {
    await fitnessApi.deletePlan(id);

    setPlanName("");
    setPlanGoal("");
    setExercises([]);

    navigate("/plans");
  } catch (err) {
    setError("Failed to delete plan");
  }
}

async function handleSave() {
  if (!planName.trim()) {
    setError("Plan name is required");
    return;
  }

  setSaving(true);
  try {
    if (isEditing && id) {
      await fitnessApi.updatePlan(id, {
        name: planName,
        goal: planGoal || null,
        exercises,
      });
    } else {
      await fitnessApi.createPlan({
        name: planName,
        goal: planGoal || null,
        exercises,
      });
    }

    navigate("/plans");
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Failed to save plan");
  } finally {
    setSaving(false);
  }
}

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">
          {isEditing ? "Edit Plan" : "Create Plan"}
        </h1>
        <button onClick={() => navigate(-1)} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
          Cancel
        </button>
      </div>

      <div className="space-y-3 max-w-md">
        <div className="space-y-1">
          <label className="text-sm text-zinc-500">Plan Name</label>
          <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. Push Pull Legs" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-zinc-500">Goal (optional)</label>
          <input type="text" value={planGoal} onChange={(e) => setPlanGoal(e.target.value)} placeholder="e.g. Build muscle" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500" />
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map((entry) => (
          <ExerciseTemplate key={entry.id} entry={entry} onChange={handleChange} onRemove={handleRemove} />
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button onClick={handleAddExercise} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">+ Add Exercise</button>
        <button onClick={handleSave} disabled={saving} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Plan"}
        </button>
        {isEditing && (
        <button
            onClick={handleDelete}
            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
            Delete
        </button>
        )}
      </div>
    </section>
  );
}