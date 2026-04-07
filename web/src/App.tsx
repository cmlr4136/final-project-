/*
 * 这个文件做什么：前端路由入口，定义页面路径与布局。
 * What this file is for: frontend routing entry, defines routes and layout.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Dashboard from "@/pages/Dashboard";
import Exercises from "@/pages/Exercises";
import Groups from "@/pages/Groups";
import Login from "@/pages/auth/Login";
import Plans from "@/pages/Plans";
import Register from "@/pages/auth/Register";
import Workouts from "@/pages/Workouts";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/groups" element={<Groups />} />
        </Route>

        <Route path="*" element={<div className="p-6 text-sm text-zinc-600">404 Not Found</div>} />
      </Routes>
    </Router>
  );
}
