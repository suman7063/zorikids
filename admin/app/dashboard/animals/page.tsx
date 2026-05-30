"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Animal = {
  id: string; key: string; name_hi: string; name_en: string;
  sound_word: string; bg: string; accent: string;
  image_url: string | null; video_url: string | null; sound_url: string | null;
  is_published: boolean;
};

const EMPTY_FORM = {
  key: "", name_hi: "", name_en: "", sound_word: "",
  bg: "#FEF9C3", accent: "#CA8A04",
};

export default function AnimalsPage() {
  const [animals, setAnimals]         = useState<Animal[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<Animal | null>(null);
  const [uploading, setUploading]     = useState<"video" | "sound" | "image" | null>(null);
  const [toast, setToast]             = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);

  // Form file previews
  const [formImage, setFormImage]     = useState<File | null>(null);
  const [formVideo, setFormVideo]     = useState<File | null>(null);
  const [formSound, setFormSound]     = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);

  useEffect(() => { fetchAnimals(); }, []);

  async function fetchAnimals() {
    setLoading(true);
    const { data } = await supabase.from("animals").select("*").order("name_en");
    setAnimals(data ?? []);
    setLoading(false);
  }

  async function uploadToStorage(file: File, bucket: string, key: string) {
    const ext  = file.name.split(".").pop();
    const path = `${key}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function addAnimal(e: React.FormEvent) {
    e.preventDefault();
    if (!form.key || !form.name_en || !form.name_hi) return;
    setSaving(true);
    try {
      let image_url = null, video_url = null, sound_url = null;
      if (formImage) image_url = await uploadToStorage(formImage, "animal-images", form.key);
      if (formVideo) video_url = await uploadToStorage(formVideo, "animal-videos", form.key);
      if (formSound) sound_url = await uploadToStorage(formSound, "animal-sounds", form.key);

      const { error } = await supabase.from("animals").insert({
        ...form, image_url, video_url, sound_url, is_published: false,
      });
      if (error) throw error;
      showToast("Animal added!");
      resetForm();
      fetchAnimals();
    } catch (err: any) {
      showToast("Error: " + err.message);
    }
    setSaving(false);
  }

  function resetForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setFormImage(null); setFormVideo(null); setFormSound(null);
    setFormImagePreview(null);
  }

  function handleImagePick(file: File) {
    setFormImage(file);
    setFormImagePreview(URL.createObjectURL(file));
  }

  async function deleteAnimal(animal: Animal) {
    if (!confirm(`Delete ${animal.name_en}?`)) return;
    await supabase.from("animals").delete().eq("id", animal.id);
    setSelected(null); fetchAnimals(); showToast("Deleted!");
  }

  async function togglePublish(animal: Animal) {
    await supabase.from("animals").update({ is_published: !animal.is_published }).eq("id", animal.id);
    const updated = { ...animal, is_published: !animal.is_published };
    setSelected(updated); fetchAnimals();
  }

  async function uploadFile(animal: Animal, type: "video" | "sound" | "image", file: File) {
    setUploading(type);
    const bucket = type === "video" ? "animal-videos" : type === "sound" ? "animal-sounds" : "animal-images";
    try {
      const url = await uploadToStorage(file, bucket, animal.key);
      const field = type === "video" ? "video_url" : type === "sound" ? "sound_url" : "image_url";
      await supabase.from("animals").update({ [field]: url }).eq("id", animal.id);
      showToast(`${type} uploaded!`);
      const updated = { ...animal, [field]: url };
      setSelected(updated); fetchAnimals();
    } catch (err: any) { showToast("Upload failed: " + err.message); }
    setUploading(null);
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
            <p className="text-gray-400 text-sm">Tap to manage content</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition">
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
              <div key={a.id} onClick={() => setSelected(a)}
                className={`flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm cursor-pointer border-2 transition
                  ${selected?.id === a.id ? "border-amber-400" : "border-transparent hover:border-gray-200"}`}>
                {a.image_url
                  ? <img src={a.image_url} className="w-12 h-12 rounded-xl object-cover" />
                  : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 text-xl">📷</div>
                }
                <div className="flex-1">
                  <p className="font-bold text-gray-700">{a.name_en} <span className="text-gray-400 font-normal">/ {a.name_hi}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.sound_word}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.image_url ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {a.image_url ? "🖼 Image" : "No Image"}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.video_url ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
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
          <div className="text-center mb-4">
            {selected.image_url
              ? <img src={selected.image_url} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-2" />
              : <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-2 text-gray-300 text-4xl">📷</div>
            }
            <h2 className="font-black text-gray-800 text-xl">{selected.name_en}</h2>
            <p className="text-gray-400 text-sm">{selected.name_hi} · {selected.sound_word}</p>
          </div>

          {[
            { type: "image" as const, label: "Image", accept: "image/*", icon: "🖼", color: "green" },
            { type: "video" as const, label: "Video (MP4)", accept: "video/mp4", icon: "🎬", color: "amber" },
            { type: "sound" as const, label: "Sound (MP3)", accept: "audio/mp3,audio/mpeg", icon: "🔊", color: "purple" },
          ].map(({ type, label, accept, icon, color }) => (
            <div key={type} className="mb-3">
              <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</p>
              {type === "video" && selected.video_url && <video src={selected.video_url} className="w-full rounded-xl mb-2" controls muted />}
              {type === "sound" && selected.sound_url && <audio src={selected.sound_url} className="w-full mb-2" controls />}
              <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl border-2 border-dashed cursor-pointer text-sm font-semibold transition
                border-gray-200 text-gray-400 hover:border-${color}-300 hover:text-${color}-500 ${uploading === type ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading === type ? "Uploading..." : (selected as any)[`${type}_url`] ? `🔄 Replace` : `📤 Upload ${icon}`}
                <input type="file" accept={accept} className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(selected, type, e.target.files[0])} />
              </label>
            </div>
          ))}

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={addAnimal} className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-black text-gray-800 text-xl mb-6">Add New Animal</h2>
            <div className="flex flex-col gap-4">
              {[
                { label: "Key (unique, lowercase)", key: "key", placeholder: "e.g. lion" },
                { label: "Name (English)", key: "name_en", placeholder: "e.g. Lion" },
                { label: "Name (Hindi)", key: "name_hi", placeholder: "e.g. शेर" },
                { label: "Sound Word", key: "sound_word", placeholder: "e.g. Roaar!" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">{f.label}</label>
                  <input
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
                    required={f.key !== "sound_word"}
                  />
                </div>
              ))}

              {/* Image upload */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Image</label>
                {formImagePreview && <img src={formImagePreview} className="w-20 h-20 rounded-xl object-cover mb-2" />}
                <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500 cursor-pointer text-sm font-semibold transition">
                  {formImage ? `✓ ${formImage.name}` : "📷 Upload Image"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImagePick(e.target.files[0])} />
                </label>
              </div>

              {/* Video upload */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Video (MP4)</label>
                <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 cursor-pointer text-sm font-semibold transition">
                  {formVideo ? `✓ ${formVideo.name}` : "🎬 Upload MP4"}
                  <input type="file" accept="video/mp4" className="hidden"
                    onChange={(e) => e.target.files?.[0] && setFormVideo(e.target.files[0])} />
                </label>
              </div>

              {/* Sound upload */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Sound (MP3)</label>
                <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500 cursor-pointer text-sm font-semibold transition">
                  {formSound ? `✓ ${formSound.name}` : "🔊 Upload MP3"}
                  <input type="file" accept="audio/mp3,audio/mpeg" className="hidden"
                    onChange={(e) => e.target.files?.[0] && setFormSound(e.target.files[0])} />
                </label>
              </div>

              {/* Colors */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Background</label>
                  <input type="color" value={form.bg}
                    onChange={(e) => setForm((prev) => ({ ...prev, bg: e.target.value }))}
                    className="w-full h-10 rounded-xl border-2 border-gray-200 cursor-pointer" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Accent</label>
                  <input type="color" value={form.accent}
                    onChange={(e) => setForm((prev) => ({ ...prev, accent: e.target.value }))}
                    className="w-full h-10 rounded-xl border-2 border-gray-200 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={resetForm}
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
