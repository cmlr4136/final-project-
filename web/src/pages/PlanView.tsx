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
  setLoading(true); // Ensure loading starts as true
  
  fitnessApi.getPlan(id)
    .then((data) => {
      setPlan(data);
      setLoading(false); // SUCCESS: Stop loading
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      setError("Failed to load plan details.");
      setLoading(false); // ERROR: Stop loading so we can see the error message
    });
}, [id]);


if (loading) return <p className="text-sm text-zinc-500 mt-4">Loading plan...</p>;
if (error || !plan) return <p className="text-sm text-red-500 mt-4">{error || "Plan not found"}</p>;

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
          <button
            onClick={() => navigate("/plans")}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Back
          </button>
          <button
            onClick={() => navigate(`/plans/${plan.id}/edit`)}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
          >
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
                <p>Sets: <span className="font-medium text-zinc-900">{ex.sets}</span></p>
                <p>Reps: <span className="font-medium text-zinc-900">{ex.reps}</span></p>
                <p>Weight: <span className="font-medium text-zinc-900">{ex.weight} kg</span></p>
                <p>Time: <span className="font-medium text-zinc-900">{ex.time} min</span></p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">No exercises added to this plan yet.</p>
        )}
      </div>
    </section>
  );
}