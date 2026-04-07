/*
 * 这个文件做什么：登录页占位（后续会接 /api/auth/login）。
 * What this file is for: login page placeholder (later connect to /api/auth/login).
 */

import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="mx-auto max-w-sm space-y-3 p-6">
      <h1 className="text-base font-semibold text-zinc-900">Login</h1>
      <p className="text-sm text-zinc-600">Placeholder page.</p>
      <Link to="/auth/register" className="text-sm text-zinc-900 underline">
        Go to Register
      </Link>
    </div>
  );
}

