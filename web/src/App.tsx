import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Dashboard from "@/pages/Dashboard";
import Exercises from "@/pages/Exercises";
import Groups from "@/pages/Groups";
import Login from "@/pages/auth/Login";
import Plans from "@/pages/Plans";
import Register from "@/pages/auth/Register";
import Settings from "@/pages/Settings";
import { useAuthStore } from "@/stores/authStore";

function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  return token ? <AppShell /> : <Navigate to="/auth/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/settings" element={<Settings />} />        </Route>

        <Route path="*" element={<div className="p-6 text-sm text-zinc-600">404 Not Found</div>} />
      </Routes>
    </Router>
  );
}