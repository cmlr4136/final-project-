import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "@/stores/settingsStore";

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const unit = useSettingsStore((s) => s.unit);
  const setUnit = useSettingsStore((s) => s.setUnit);

  function handleSignOut() {
    clear();
    navigate("/auth/login");
  }

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4 max-w-md">
        <div className="space-y-1">
          <p className="text-sm text-zinc-500">Display Name</p>
          <p className="text-sm font-medium text-zinc-900">{user?.displayName ?? "—"}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-zinc-500">Email</p>
          <p className="text-sm font-medium text-zinc-900">{user?.email ?? "—"}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-zinc-500">Join Date</p>
          <p className="text-sm font-medium text-zinc-900">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-zinc-500">Measurement Unit</p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setUnit("kg")}
              className={`px-4 py-2 rounded-md text-sm border transition ${
                unit === "kg"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
              }`}
            >
              kg
            </button>
            <button
              onClick={() => setUnit("lbs")}
              className={`px-4 py-2 rounded-md text-sm border transition ${
                unit === "lbs"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
              }`}
            >
              lbs
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
      >
        Sign Out
      </button>
    </section>
  );
}