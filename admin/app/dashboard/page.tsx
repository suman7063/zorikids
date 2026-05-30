"use client";
import { useEffect, useState } from "react";
import { supabase, Animal } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("animals").select("*").then(({ data }) => {
      setAnimals(data ?? []);
      setLoading(false);
    });
  }, []);

  const total     = animals.length;
  const published = animals.filter((a) => a.is_published).length;
  const withVideo = animals.filter((a) => a.video_url).length;
  const withSound = animals.filter((a) => a.sound_url).length;

  const stats = [
    { label: "Total Animals", value: total,            icon: "🐾", color: "bg-amber-100 text-amber-700"  },
    { label: "Published",     value: published,        icon: "✅", color: "bg-green-100 text-green-700"  },
    { label: "With Video",    value: withVideo,        icon: "🎬", color: "bg-blue-100 text-blue-700"    },
    { label: "Missing Video", value: total - withVideo, icon: "⏳", color: "bg-red-100 text-red-600"     },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-800 mb-1">Overview</h1>
      <p className="text-gray-400 text-sm mb-8">ZoriKids content status</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-black">{loading ? "—" : s.value}</div>
            <div className="text-sm font-semibold mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-700">All Animals</h2>
          <Link href="/dashboard/animals" className="text-sm text-amber-500 font-semibold hover:underline">
            Manage →
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {animals.map((a) => (
              <div key={a.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <span className="text-2xl">{a.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-700 text-sm">{a.name_en} / {a.name_hi}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${a.video_url ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {a.video_url ? "Video ✓" : "No Video"}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${a.sound_url ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}`}>
                    {a.sound_url ? "Sound ✓" : "No Sound"}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${a.is_published ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
                    {a.is_published ? "Live" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
            {!animals.length && (
              <p className="text-gray-400 text-sm text-center py-8">
                Koi animal nahi —{" "}
                <Link href="/dashboard/animals" className="text-amber-500 underline">Animals tab</Link> se add karo
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
