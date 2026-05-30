"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Animal = {
  id: string; key: string; name_hi: string; name_en: string;
  sound_word: string; emoji: string; bg: string; accent: string;
  video_url: string | null; sound_url: string | null; is_published: boolean;
};

const EMPTY_FORM = {
  key: "", name_hi: "", name_en: "", sound_word: "", emoji: "",
  bg: "#FEF9C3", accent: "#CA8A04",
};

export default function AnimalsPage() {
  const [animals, setAnimals]     = useState<Animal[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Animal | null>(null);
  const [uploading, setUploading] = useState<"video" | "sound" | null>(null);
  const [toast, setToast]         = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchAnimals(); }, []);

  async function fetchAnimals() {
    setLoading(true);
    const { data } = await supabase.from("animals").select("*").order("name_en");
    setAnimals(data ?? []);
    setLoading(false);
  }

  async function addAnimal(e: React.FormEvent) {
    e.preventDefault();
    if (!form.key || !form.name_en || !form.name_hi || !form.emoji) return;
    setSaving(true);
    const { error } = await supabase.from("animals").insert({
      ...form, is_published: false, video_url: null, sound_url: null,
    });
    if (error) { showToast("Error: " + error.message); }
    else { showToast("Animal added!"); setShowForm(false); setForm(EMPTY_FORM); fetchAnimals(); }
    setSaving(false);
  }

  async function deleteAnimal(animal: Animal) {
    if (!confirm(`Delete ${animal.name_en}?`)) return;
    await supabase.from("animals").delete().eq("id", animal.id);
    setSelected(null);
    fetchAnimals();
    showToast("Deleted!");
  }

  async function togglePublish(animal: Animal) {
    await supabase.from("animals").update({ is_published: !animal.is_published }).eq("id", animal.id);
    const updated = { ...animal, is_published: !animal.is_published };
    setSelected(updated);
    fetchAnimals();
  }

  async function uploadFile(animal: Animal, type: "video" | "sound", file: File) {
    setUploading(type);
    const bucket = type === "video" ? "animal-videos" : "animal-sounds";
    const ext    = file.name.split(".").pop();
    const path   = `${animal.key}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { showToast("Upload failed: " + error.message); setUploading(null); return; }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    await supabase.from("animals").update(
      type === "video" ? { video_url: urlData.publicUrl } : { sound_url: urlData.publicUrl }
    ).eq("id", animal.id);
    showToast(`${type === "video" ? "Video" : "Sound"} uploaded!`);
    setUploading(null);
    const updated = { ...animal, [type === "video" ? "video_url" : "sound_url"]: urlData.publicUrl };
    setSelected(updated);
    fetchAnimals();
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className="flex gap-6">
      {/* List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Animals</h1>
            <p className="text-gray-400 text-sm">Tap to manage video & sound</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition"
          >
            + Add Animal
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-20">Loading...</p>
        ) : animals.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🐾</div>
            <p className="font-semibold">Koi animal nahi</p>
            <p className="text-sm mt-1">+ Add Animal se shuru karo</p>
          </div>
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

          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Video (MP4)</p>
            {selected.video_url && <video src={selected.video_url} className="w-full rounded-xl mb-2" controls muted />}
            <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed cursor-pointer text-sm font-semibold transition
              ${uploading === "video" ? "border-amber-300 text-amber-400" : "border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500"}`}>
              {uploading === "video" ? "Uploading..." : selected.video_url ? "🔄 Replace Video" : "📤 Upload MP4"}
              <input type="file" accept="video/mp4" className="hidden" disabled={!!uploading}
                onChange={(e) => e.target.files?.[0] && uploadFile(selected, "video", e.target.files[0])} />
            </label>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Sound (MP3)</p>
            {selected.sound_url && <audio src={selected.sound_url} className="w-full mb-2" controls />}
            <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed cursor-pointer text-sm font-semibold transition
              ${uploading === "sound" ? "border-purple-300 text-purple-400" : "border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500"}`}>
              {uploading === "sound" ? "Uploading..." : selected.sound_url ? "🔄 Replace Sound" : "📤 Upload MP3"}
              <input type="file" accept="audio/mp3,audio/mpeg" className="hidden" disabled={!!uploading}
                onChange={(e) => e.target.files?.[0] && uploadFile(selected, "sound", e.target.files[0])} />
            </label>
          </div>

          <button onClick={() => togglePublish(selected)}
            className={`w-full py-3 rounded-xl font-black text-sm transition mb-3
              ${selected.is_published ? "bg-red-100 text-red-500 hover:bg-red-200" : "bg-green-500 text-white hover:bg-green-600"}`}>
            {selected.is_published ? "⬇ Unpublish" : "🚀 Publish to App"}
          </button>

          <button onClick={() => deleteAnimal(selected)}
            className="w-full py-2 rounded-xl font-semibold text-sm text-gray-400 hover:bg-red-50 hover:text-red-400 transition">
            🗑 Delete
          </button>
        </div>
      )}

      {/* Add Animal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={addAnimal} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h2 className="font-black text-gray-800 text-xl mb-6">Add New Animal</h2>
            <div className="flex flex-col gap-3">
              {[
                { label: "Key (unique, lowercase)", key: "key", placeholder: "e.g. lion" },
                { label: "Name (English)", key: "name_en", placeholder: "e.g. Lion" },
                { label: "Name (Hindi)", key: "name_hi", placeholder: "e.g. शेर" },
                { label: "Sound Word", key: "sound_word", placeholder: "e.g. Roaar!" },
                { label: "Emoji", key: "emoji", placeholder: "e.g. 🦁" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">{f.label}</label>
                  <input
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              ))}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Background Color</label>
                  <input type="color" value={form.bg}
                    onChange={(e) => setForm((prev) => ({ ...prev, bg: e.target.value }))}
                    className="w-full h-10 rounded-xl border-2 border-gray-200 cursor-pointer" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Accent Color</label>
                  <input type="color" value={form.accent}
                    onChange={(e) => setForm((prev) => ({ ...prev, accent: e.target.value }))}
                    className="w-full h-10 rounded-xl border-2 border-gray-200 cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-3 rounded-xl bg-amber-400 text-white font-black text-sm hover:bg-amber-500 disabled:opacity-50">
                {saving ? "Saving..." : "Add Animal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
