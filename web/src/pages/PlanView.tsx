import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fitnessApi } from "@/api/fitnessApi";
import type { TrainingPlanDto } from "@/api/types";

export default function PlanView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<TrainingPlanDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fitnessApi.getPlan(id)
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to load plan details.");
        setLoading(false);
      });
  }, [id]);

  const handleStartWorkout = () => {
    if (!plan) return;
    
    // Initialize the workout store with this plan's exercises
    const workoutExercises = plan.exercises.map((ex: any) => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      sets: ex.targetSets,
      reps: ex.targetReps,
      weight: ex.targetWeight,
    }));

    startWorkout(plan.name); 
    setExercises(workoutExercises);
    navigate("/workouts/active");
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{plan?.name}</h1>
        <button 
          onClick={handleStartWorkout}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Start This Workout
        </button>
      </div>
    </section>
  );
}

  if (loading) return <p className="text-sm text-zinc-500 mt-4">Loading plan...</p>;
  if (error || !plan) return <p className="text-sm text-red-500 mt-4">{error || "Plan not found"}</p>;

  return (
  <section className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">{plan.name}</h1>
        {plan.goal && <p className="text-sm text-zinc-500">{plan.goal}</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => navigate("/plans")} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
          Back
        </button>
        <button onClick={() => navigate(`/plans/${plan.id}/edit`)} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700">
          Edit Plan
        </button>
      </div>
    </div>

    <div className="space-y-4 mt-6">
      <h2 className="text-base font-semibold text-zinc-900">Exercises in this plan:</h2>
      {plan.exercises && plan.exercises.length > 0 ? (
        plan.exercises.map((ex: any, index: number) => (
          <div key={index} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-zinc-900">{ex.name || `Exercise ${index + 1}`}</p>
            <div className="grid grid-cols-4 gap-2 text-sm text-zinc-600">
              <p>Sets: <span className="font-medium text-zinc-900">{ex.targetSets || 0}</span></p>
              <p>Reps: <span className="font-medium text-zinc-900">{ex.targetReps || 0}</span></p>
              <p>Weight: <span className="font-medium text-zinc-900">{ex.targetWeight || 0} kg</span></p>
              <p>Time: <span className="font-medium text-zinc-900">{ex.targetDurationSec || 0}s</span></p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-zinc-500">No exercises added to this plan yet.</p>
      )}
    </div>
  </section>
  )