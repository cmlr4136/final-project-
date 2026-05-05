/*
 * 这个文件做什么：提供一个最简单的应用外壳（顶部导航 + 内容区域）。
 * What this file is for: a minimal app shell (top nav + content area).
 */

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/plans", label: "Plans" },
  { to: "/groups", label: "Group Chats" },
  { to: "/exercises", label: "Exercises" },
  { to: "/settings", label: "Settings" },
];

function NavItem(props: { to: string; label: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        [
          "rounded-md px-3 py-2 text-sm transition",
          isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
        ].join(" ")
      }
    >
      {props.label}
    </NavLink>
  );
}

export default function AppShell() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <div className="text-xl font-bold text-zinc-900">FitTrack</div>
          <nav className="flex flex-wrap gap-1">
            {navItems.map((it) => (
              <NavItem key={it.to} to={it.to} label={it.label} />
            ))}
          </nav>
          
          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-zinc-700">{user.displayName}</span>
                <button
                  onClick={() => { clear(); navigate("/auth/login"); }}
                  className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/auth/login"
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

