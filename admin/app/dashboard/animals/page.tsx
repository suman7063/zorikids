"use client";
import { useEffect, useState } from "react";
import { supabase, Animal } from "@/lib/supabase";

const DEFAULT_ANIMALS = [
  { key: "elephant", name_hi: "हाथी",   name_en: "Elephant", sound_word: "Paon Paon!", emoji: "🐘", bg: "#E0F2FE", accent: "#0284C7" },
  { key: "lion",     name_hi: "शेर",    name_en: "Lion",      sound_word: "Roaar!",    emoji: "🦁", bg: "#FEF9C3", accent: "#CA8A04" },
  { key: "cow",      name_hi: "गाय",    name_en: "Cow",       sound_word: "Moooo!",    emoji: "🐮", bg: "#DCFCE7", accent: "#16A34A" },
  { key: "dog",      name_hi: "कुत्ता", name_en: "Dog",       sound_word: "Woof!",     emoji: "🐶", bg: "#FFF7ED", accent: "#EA580C" },
  { key: "cat",      name_hi: "बिल्ली", name_en: "Cat",       sound_word: "Meow!",     emoji: "🐱", bg: "#F5F3FF", accent: "#7C3AED" },
  { key: "frog",     name_hi: "मेंढक",  name_en: "Frog",      sound_word: "Ribbit!",   emoji: "🐸", bg: "#ECFDF5", accent: "#059669" },
  { key: "duck",     name_hi: "बतख",    name_en: "Duck",      sound_word: "Quack!",    emoji: "🦆", bg: "#EFF6FF", accent: "#2563EB" },
  { key: "pig",      name_hi: "सूअर",   name_en: "Pig",       sound_word: "Oink!",     emoji: "🐷", bg: "#FFF0F6", accent: "#DB2777" },
  { key: "horse",    name_hi: "घोड़ा",  name_en: "Horse",     sound_word: "Neigh!",    emoji: "🐴", bg: "#FFF7ED", accent: "#B45309" },
  { key: "chick",    name_hi: "चूजा",   name_en: "Chick",     sound_word: "Cheep!",    emoji: "🐥", bg: "#FEFCE8", accent: "#D97706" },
];

export default function AnimalsPage() {
  const [animals, setAnimals]       = useState<Animal[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Animal | null>(null);
  const [uploading, setUploading]   = useState<"video" | "sound" | null>(null);
  const [toast, setToast]           = useState("");

  useEffect(() => { fetchAnimals(); }, []);

  async function fetchAnimals() {
    setLoading(true);
    const { data } = await supabase.from("animals").select("*").order("name_en");
    setAnimals(data ?? []);
    setLoading(false);
  }

  async function seedAnimals() {
    await supabase.from("animals").upsert(
      DEFAULT_ANIMALS.map((a) => ({ ...a, is_published: false, video_url: null, sound_url: null })),
      { onConflict: "key" }
    );
    showToast("Animals seeded!");
    fetchAnimals();
  }

  async function togglePublish(animal: Animal) {
    await supabase.from("animals").update({ is_published: !animal.is_published }).eq("id", animal.id);
    fetchAnimals();
    if (selected?.id === animal.id) setSelected({ ...animal, is_published: !animal.is_published });
  }

  async function uploadFile(animal: Animal, type: "video" | "sound", file: File) {
    setUploading(type);
    const bucket = type === "video" ? "animal-videos" : "animal-sounds";
    const ext    = file.name.split(".").pop();
    const path   = `${animal.key}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { showToast("Upload failed: " + error.message); setUploading(null); return; }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const url = urlData.publicUrl;

    await supabase.from("animals").update(
      type === "video" ? { video_url: url } : { sound_url: url }
    ).eq("id", animal.id);

    showToast(`${type === "video" ? "Video" : "Sound"} uploaded!`);
    setUploading(null);
    fetchAnimals();
    setSelected((prev) => prev ? { ...prev, [type === "video" ? "video_url" : "sound_url"]: url } : prev);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className="flex gap-6">
      {/* Animal list */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Animals</h1>
            <p className="text-gray-400 text-sm">Tap to manage video & sound</p>
          </div>
          {animals.length === 0 && !loading && (
            <button
              onClick={seedAnimals}
              className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition"
            >
              + Seed Animals
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {animals.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelected(a)}
                className={`flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm cursor-pointer border-2 transition
                  ${selected?.id === a.id ? "border-amber-400" : "border-transparent hover:border-gray-200"}`}
              >
                <span className="text-3xl">{a.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-700">{a.name_en} <span className="text-gray-400 font-normal">/ {a.name_hi}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.sound_word}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.video_url ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {a.video_url ? "🎬 Video" : "No Video"}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.sound_url ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}`}>
                    {a.sound_url ? "🔊 Sound" : "No Sound"}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.is_published ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-500"}`}>
                    {a.is_published ? "Live" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-80 bg-white rounded-2xl shadow-sm p-6 h-fit sticky top-0">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{selected.emoji}</div>
            <h2 className="font-black text-gray-800 text-xl">{selected.name_en}</h2>
            <p className="text-gray-400 text-sm">{selected.name_hi} · {selected.sound_word}</p>
          </div>

          {/* Video upload */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Video (MP4)</p>
            {selected.video_url && (
              <video src={selected.video_url} className="w-full rounded-xl mb-2" controls muted />
            )}
            <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed cursor-pointer text-sm font-semibold transition
              ${uploading === "video" ? "border-amber-300 text-amber-400" : "border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500"}`}>
              {uploading === "video" ? "Uploading..." : selected.video_url ? "🔄 Replace Video" : "📤 Upload MP4"}
              <input
                type="file" accept="video/mp4" className="hidden"
                disabled={!!uploading}
                onChange={(e) => e.target.files?.[0] && uploadFile(selected, "video", e.target.files[0])}
              />
            </label>
          </div>

          {/* Sound upload */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Sound (MP3)</p>
            {selected.sound_url && (
              <audio src={selected.sound_url} className="w-full mb-2" controls />
            )}
            <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed cursor-pointer text-sm font-semibold transition
              ${uploading === "sound" ? "border-purple-300 text-purple-400" : "border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500"}`}>
              {uploading === "sound" ? "Uploading..." : selected.sound_url ? "🔄 Replace Sound" : "📤 Upload MP3"}
              <input
                type="file" accept="audio/mp3,audio/mpeg" className="hidden"
                disabled={!!uploading}
                onChange={(e) => e.target.files?.[0] && uploadFile(selected, "sound", e.target.files[0])}
              />
            </label>
          </div>

          {/* Publish toggle */}
          <button
            onClick={() => togglePublish(selected)}
            className={`w-full py-3 rounded-xl font-black text-sm transition
              ${selected.is_published
                ? "bg-red-100 text-red-500 hover:bg-red-200"
                : "bg-green-500 text-white hover:bg-green-600"
              }`}
          >
            {selected.is_published ? "⬇ Unpublish" : "🚀 Publish to App"}
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
