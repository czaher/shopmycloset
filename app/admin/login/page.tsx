"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Wrong password.");
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl text-warm-brown text-center mb-2">Admin</h1>
        <p className="text-center text-sm text-muted-brown mb-8">Shop My Closet</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 bg-white border border-warm-beige rounded-2xl p-7">
          <div>
            <label className="text-xs font-medium text-muted-brown uppercase tracking-wide block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full border border-warm-beige rounded-xl px-4 py-2.5 text-sm bg-cream text-warm-brown focus:outline-none focus:border-terra transition-colors"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-terra hover:bg-terra-dark text-cream font-medium rounded-xl py-3 text-sm tracking-wide transition-colors disabled:opacity-60"
          >
            {loading ? "..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
