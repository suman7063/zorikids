import { supabase } from "@/lib/supabase";

export default async function DashboardPage() {
  const { data: animals } = await supabase.from("animals").select("*");
  const total     = animals?.length ?? 0;
  const published = animals?.filter((a) => a.is_published).length ?? 0;
  const withVideo = animals?.filter((a) => a.video_url).length ?? 0;

  const stats = [
    { label: "Total Animals", value: total,     icon: "🐾", color: "bg-amber-100 text-amber-700" },
    { label: "Published",     value: published, icon: "✅", color: "bg-green-100 text-green-700" },
    { label: "With Video",    value: withVideo, icon: "🎬", color: "bg-blue-100 text-blue-700"   },
    { label: "Missing Video", value: total - withVideo, icon: "⏳", color: "bg-red-100 text-red-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-800 mb-1">Overview</h1>
      <p className="text-gray-400 text-sm mb-8">ZoriKids content status</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-black">{s.value}</div>
            <div className="text-sm font-semibold mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-black text-gray-700 mb-4">All Animals</h2>
        <div className="flex flex-col gap-2">
          {animals?.map((a) => (
            <div key={a.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
              <span className="text-2xl">{a.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-700 text-sm">{a.name_en} / {a.name_hi}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${a.video_url ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                {a.video_url ? "Video ✓" : "No Video"}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${a.is_published ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
                {a.is_published ? "Live" : "Draft"}
              </span>
            </div>
          ))}
          {!animals?.length && (
            <p className="text-gray-400 text-sm text-center py-8">
              Koi animal nahi — Animals tab se add karo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
