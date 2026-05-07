import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fitnessApi } from "@/api/fitnessApi";
import type { ExerciseDto } from "@/api/types";

// 1. We changed 'name' to 'exerciseId' to match the backend!
type ExerciseEntry = {
  id: number;
  exerciseId: string; 
  sets: string;
  reps: string;
  weight: string;
  time: string;
};
type ExerciseTemplateProps = {
  entry: ExerciseEntry;
  onChange: (id: number, field: keyof ExerciseEntry, value: string) => void;
  onRemove: (id: number) => void;
  availableExercises: ExerciseDto[];
};

function newEntry(id: number): ExerciseEntry {
  return { id, exerciseId: "", sets: "", reps: "", weight: "", time: "" };
}

function ExerciseTemplate({ entry, onChange, onRemove, availableExercises }: ExerciseTemplateProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900">Exercise</p>
        <button onClick={() => onRemove(entry.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Select Exercise</label>
        {/* 2. Changed from a text input to a dropdown mapping to your real exercises! */}
        <select 
          value={entry.exerciseId} 
          onChange={(e) => onChange(entry.id, "exerciseId", e.target.value)} 
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        >
          <option value="">Select an exercise...</option>
          {availableExercises.map((ex: ExerciseDto) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Sets</label>
          <input type="number" value={entry.sets} onChange={(e) => onChange(entry.id, "sets", e.target.value)} placeholder="3" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Reps</label>
          <input type="number" value={entry.reps} onChange={(e) => onChange(entry.id, "reps", e.target.value)} placeholder="10" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Weight (kg)</label>
          <input type="number" value={entry.weight} onChange={(e) => onChange(entry.id, "weight", e.target.value)} placeholder="60" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Time (min)</label>
          <input type="number" value={entry.time} onChange={(e) => onChange(entry.id, "time", e.target.value)} placeholder="5" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none" />
        </div>
      </div>
    </div>
  );
}

export default function PlanForm() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [planName, setPlanName] = useState("");
  const [planGoal, setPlanGoal] = useState("");
  const [exercises, setExercises] = useState<ExerciseEntry[]>([newEntry(1)]);
  const [availableExercises, setAvailableExercises] = useState<ExerciseDto[]>([]);
  const [nextId, setNextId] = useState(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
    fitnessApi.listExercises()
      .then((data) => setAvailableExercises(data))
      .catch(() => setError("Failed to load exercises database."));
  }, []);
 
  // 3. Fetch all available exercises from the database when the page loads
  useEffect(() => {
    if (isEditing && id) {
      fitnessApi.getPlan(id)
        .then((plan) => {
          setPlanName(plan.name);
          setPlanGoal(plan.goal || "");
          
          // Translate the backend's PlanItemDto back into the form's ExerciseEntry format
          if (plan.exercises && plan.exercises.length > 0) {
            const mappedExercises = plan.exercises.map((ex, index) => ({
              id: index + 1,
              exerciseId: ex.exerciseId,
              sets: ex.targetSets ? ex.targetSets.toString() : "",
              reps: ex.targetReps ? ex.targetReps.toString() : "",
              weight: ex.targetWeight ? ex.targetWeight.toString() : "",
              time: ex.targetDurationSec ? (ex.targetDurationSec / 60).toString() : "" // Convert seconds back to minutes!
            }));
            setExercises(mappedExercises);
          } else {
            setExercises([newEntry(1)]);
          }
        })
        .catch(() => {
          setError("Plan not found");
          navigate("/plans", { state: { refresh: Date.now() } });
        });
    }
  }, [id, isEditing, navigate]);

  // ... (Keep your existing useEffect for fetching a plan if isEditing is true)

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

  async function handleSave() {
    if (!planName.trim()) return setError("Plan name is required");
    
    setSaving(true);
    try {
      let currentPlanId = id;

      // 4. Create the parent plan first
      if (!isEditing) {
        const newPlan = await fitnessApi.createPlan({ name: planName, goal: planGoal || null });
        currentPlanId = newPlan.id;
      } else {
        await fitnessApi.updatePlan(currentPlanId!, { name: planName, goal: planGoal || null });
      }

      // 5. Fire off all the API calls to save the individual exercise items to that plan!
      if (!isEditing && currentPlanId) {
        await Promise.all(
          exercises.map((ex) => {
            if (!ex.exerciseId) return Promise.resolve(); // Skip if they left the dropdown blank
            return fitnessApi.addPlanItem(currentPlanId!, {
              exerciseId: ex.exerciseId,
              targetSets: ex.sets ? parseInt(ex.sets) : undefined,
              targetReps: ex.reps ? parseInt(ex.reps) : undefined,
              targetWeight: ex.weight ? parseFloat(ex.weight) : undefined,
              targetDurationSec: ex.time ? parseInt(ex.time) * 60 : undefined, // Convert mins to seconds
            });
          })
        );
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
        <h1 className="text-xl font-semibold text-zinc-900">{isEditing ? "Edit Plan" : "Create Plan"}</h1>
        <button onClick={() => navigate(-1)} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">Cancel</button>
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
          <ExerciseTemplate 
            key={entry.id} 
            entry={entry} 
            onChange={handleChange} 
            onRemove={handleRemove} 
            availableExercises={availableExercises} 
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button onClick={handleAddExercise} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">+ Add Exercise</button>
        <button onClick={handleSave} disabled={saving} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Plan"}
        </button>
      </div>
    </section>
  );
}