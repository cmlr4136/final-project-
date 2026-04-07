/*
 * 这个文件做什么：提供一个最简单的应用外壳（顶部导航 + 内容区域）。
 * What this file is for: a minimal app shell (top nav + content area).
 */

import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/exercises", label: "Exercises" },
  { to: "/plans", label: "Plans" },
  { to: "/workouts", label: "Workouts" },
  { to: "/groups", label: "Groups" },
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
  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <div className="text-sm font-semibold text-zinc-900">Fitness</div>
          <nav className="flex flex-wrap gap-1">
            {navItems.map((it) => (
              <NavItem key={it.to} to={it.to} label={it.label} />
            ))}
          </nav>
          <div className="ml-auto">
            <NavLink
              to="/auth/login"
              className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Login
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

