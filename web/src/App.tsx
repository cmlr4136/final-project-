import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import Dashboard from "@/pages/Dashboard";
import Exercises from "@/pages/Exercises";
import GroupChat from "@/pages/GroupChat";
import Groups from "@/pages/Groups";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Settings from "@/pages/Settings";
import Plans from "./pages/Plans";
import PlanView from "./pages/PlanView";
import PlanForm from "./pages/PlanForm";
import Workouts from "@/pages/Workouts";
import WorkoutView from "@/pages/WorkoutView";



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/new" element={<PlanForm />} />
          <Route path="/plans/:id" element={<PlanView />} />
          <Route path="/plans/:id/edit" element={<PlanForm />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/:id" element={<WorkoutView />} />
              
        </Route>

        <Route path="/groups/:groupId" element={<GroupChat />} />

        <Route path="*" element={<div className="p-6 text-sm text-zinc-600">404 Not Found</div>} />
      </Routes>
    </Router>
  );
}