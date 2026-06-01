"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const NAV = [
  { href: "/dashboard",            label: "Overview",   icon: "📊" },
  { href: "/dashboard/animals",    label: "Animals",    icon: "🐾" },
  { href: "/dashboard/alphabets",  label: "Alphabets",  icon: "🔤" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    if (localStorage.getItem("admin_auth") !== "true") router.push("/login");
  }, []);

  function handleLogout() {
    localStorage.removeItem("admin_auth");
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-8 px-4 gap-2">
        <div className="text-center mb-6">
          <div className="text-3xl">🐾</div>
          <p className="text-xs font-black text-gray-400 mt-1">ZORIKIDS ADMIN</p>
        </div>

        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
              ${pathname === item.href
                ? "bg-amber-400 text-white"
                : "text-gray-500 hover:bg-gray-100"
              }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-100 transition"
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
