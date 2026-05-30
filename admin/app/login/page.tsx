"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "zorikids@admin123") {
      localStorage.setItem("admin_auth", "true");
      router.push("/dashboard");
    } else {
      setError("Wrong password");
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-2xl font-black text-gray-800">ZoriKids Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Content Management</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-amber-400 transition"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="bg-amber-400 hover:bg-amber-500 text-white font-black rounded-xl py-3 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
