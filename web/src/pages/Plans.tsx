import { useState, useEffect } from "react";
import { fitnessApi } from "@/api/fitnessApi";
import type { TrainingPlanDto } from "@/api/types";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Plans() {
  const [plans, setPlans] = useState<TrainingPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
  loadPlans();
}, [location.state]);
  function loadPlans() {
  setLoading(true);

  fitnessApi
    .listPlans()
    .then((data) => {
      setPlans(data);
      setLoading(false);
    })
    .catch(() => {
      setError("Failed to load plans");
      setLoading(false);
    });
}

  useEffect(() => {
  loadPlans();
}, [location.state]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Plans</h1>
        <button
          onClick={() => navigate("/plans/new")}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          + Create Plan
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-900">Your Saved Plans:</h2>

        {loading && <p className="text-sm text-zinc-500">Loading...</p>}

        {!loading && plans.length === 0 && (
          <p className="text-sm text-zinc-500">No plans yet. Create one above.</p>
        )}

        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => navigate(`/plans/${plan.id}`)}
            className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm space-y-1 hover:bg-zinc-50 transition-colors"
          >
            <p className="text-sm font-medium text-zinc-900">{plan.name}</p>
            {plan.goal && <p className="text-xs text-zinc-500">{plan.goal}</p>}
            <p className="text-xs text-zinc-400">
              Created {new Date(plan.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
