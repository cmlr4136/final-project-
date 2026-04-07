/*
 * 这个文件做什么：注册页占位（后续会接 /api/auth/register）。
 * What this file is for: register page placeholder (later connect to /api/auth/register).
 */

import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="mx-auto max-w-sm space-y-3 p-6">
      <h1 className="text-base font-semibold text-zinc-900">Register</h1>
      <p className="text-sm text-zinc-600">Placeholder page.</p>
      <Link to="/auth/login" className="text-sm text-zinc-900 underline">
        Go to Login
      </Link>
    </div>
  );
}
