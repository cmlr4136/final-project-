import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fitnessApi } from "@/api/fitnessApi";
import type { TrainingPlanDto, ExerciseDto } from "@/api/types";

export default function PlanView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TrainingPlanDto | null>(null);
  const [exerciseDb, setExerciseDb] = useState<ExerciseDto[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
<<<<<<< HEAD
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

  if (loading) return <p className="text-sm text-zinc-500 mt-4">Loading plan...</p>;
  if (error || !plan) return <p className="text-sm text-red-500 mt-4">{error || "Plan not found"}</p>;

  return (
  <section className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">{plan.name}</h1>
        {plan.goal && <p className="text-sm text-zinc-500">{plan.goal}</p>}
=======
    if (id) {
      // Fetch both the Plan and the Master Exercise list at the same time
      Promise.all([
        fitnessApi.getPlan(id),
        fitnessApi.listExercises()
      ])
      .then(([planData, exData]) => {
        setPlan(planData);
        setExerciseDb(exData); // We use this to translate the ID into the real Name!
      })
      .catch(() => setError("Failed to load plan details."));
    }
  }, [id]);

  if (error) return <p className="text-sm text-red-500 p-4">{error}</p>;
  if (!plan) return <p className="p-4 text-zinc-500">Loading plan...</p>;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Plan Details</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate("/plans")} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">Back</button>
          <Link to={`/plans/${id}/edit`} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700">Edit Plan</Link>
        </div>
>>>>>>> 9b208e04fd50e9ca372c353866b8c742605ab030
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

<<<<<<< HEAD
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
  )}
=======
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-zinc-900">{plan.name}</h2>
        {plan.goal && <p className="text-zinc-500">{plan.goal}</p>}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-zinc-900">Exercises</h3>
        
        {(!plan.exercises || plan.exercises.length === 0) ? (
          <p className="text-sm text-zinc-500">No exercises added to this plan yet.</p>
        ) : (
          plan.exercises.map((item) => {
            // Find the real name of the exercise from the database!
            const exName = exerciseDb.find(e => e.id === item.exerciseId)?.name || "Unknown Exercise";
            
            return (
              <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-zinc-900 mb-3">{exName}</p>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500 block text-xs">Sets</span>
                    <span className="font-medium">{item.targetSets || "-"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-xs">Reps</span>
                    <span className="font-medium">{item.targetReps || "-"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-xs">Weight</span>
                    <span className="font-medium">{item.targetWeight ? `${item.targetWeight} kg` : "-"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-xs">Time</span>
                    <span className="font-medium">{item.targetDurationSec ? `${item.targetDurationSec / 60} min` : "-"}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
>>>>>>> 9b208e04fd50e9ca372c353866b8c742605ab030
