import { useAuthStore } from "@/stores/authStore";

export default function Settings() {
  const user = useAuthStore((s) => s.user);

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
      </div>
    </section>
  );
}