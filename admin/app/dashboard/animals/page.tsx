"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Animal = {
  id: string; key: string; name_hi: string; name_en: string;
  sound_word: string;
  image_url: string | null; video_url: string | null; sound_url: string | null;
  is_published: boolean;
};

const HINDI_MAP: Record<string, string> = {
  lion: "शेर", elephant: "हाथी", cow: "गाय", dog: "कुत्ता",
  cat: "बिल्ली", frog: "मेंढक", duck: "बतख", pig: "सूअर",
  horse: "घोड़ा", chick: "चूजा", tiger: "बाघ", bear: "भालू",
  monkey: "बंदर", rabbit: "खरगोश", snake: "सांप", fish: "मछली",
  bird: "पक्षी", deer: "हिरण", fox: "लोमड़ी", peacock: "मोर",
  camel: "ऊंट", zebra: "ज़ेब्रा", giraffe: "जिराफ़", parrot: "तोता",
};

const EMPTY_FORM = { key: "", name_hi: "", name_en: "" };

export default function AnimalsPage() {
  const [animals, setAnimals]         = useState<Animal[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<Animal | null>(null);
  const [uploading, setUploading]     = useState<"video" | "sound" | "image" | null>(null);
  const [toast, setToast]             = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [formImage, setFormImage]     = useState<File | null>(null);
  const [formVideo, setFormVideo]     = useState<File | null>(null);
  const [formSound, setFormSound]     = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formVideoPreview, setFormVideoPreview] = useState<string | null>(null);
  const [formSoundPreview, setFormSoundPreview] = useState<string | null>(null);

  useEffect(() => { fetchAnimals(); }, []);

  async function fetchAnimals() {
    setLoading(true);
    const { data } = await supabase.from("animals").select("*").order("name_en");
    setAnimals(data ?? []);
    setLoading(false);
  }

  async function uploadToStorage(file: File, bucket: string, key: string) {
    const ext  = file.name.split(".").pop();
    const path = `${key}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
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
        key: form.key, name_en: form.name_en, name_hi: form.name_hi,
        sound_word: "", image_url, video_url, sound_url, is_published: false,
      });
      if (error) throw error;
      showToast("Animal added!");
      resetForm();
      fetchAnimals();
    } catch (err: any) { showToast("Error: " + err.message); }
    setSaving(false);
  }

  function resetForm() {
    setShowForm(false); setForm(EMPTY_FORM);
    setFormImage(null); setFormVideo(null); setFormSound(null);
    setFormImagePreview(null); setFormVideoPreview(null); setFormSoundPreview(null);
  }

  async function deleteAnimal(animal: Animal) {
    if (!confirm(`Delete ${animal.name_en}?`)) return;
    await supabase.from("animals").delete().eq("id", animal.id);
    setSelected(null); fetchAnimals(); showToast("Deleted!");
  }

  async function togglePublish(animal: Animal) {
    await supabase.from("animals").update({ is_published: !animal.is_published }).eq("id", animal.id);
    setSelected({ ...animal, is_published: !animal.is_published });
    fetchAnimals();
  }

  async function uploadFile(animal: Animal, type: "video" | "sound" | "image", file: File) {
    setUploading(type);
    const bucket = type === "video" ? "animal-videos" : type === "sound" ? "animal-sounds" : "animal-images";
    try {
      const url = await uploadToStorage(file, bucket, animal.key);
      const field = type === "video" ? "video_url" : type === "sound" ? "sound_url" : "image_url";
      await supabase.from("animals").update({ [field]: url }).eq("id", animal.id);
      showToast(`${type} uploaded!`);
      setSelected({ ...animal, [field]: url });
      fetchAnimals();
    } catch (err: any) { showToast("Upload failed: " + err.message); }
    setUploading(null);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div>
      {/* Header */}
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

      {/* List */}
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
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                {[
                  { show: !!a.image_url, yes: "🖼 Image",  no: "No Image",  yc: "green",  nc: "gray" },
                  { show: !!a.video_url, yes: "🎬 Video",  no: "No Video",  yc: "blue",   nc: "gray" },
                  { show: !!a.sound_url, yes: "🔊 Sound",  no: "No Sound",  yc: "purple", nc: "gray" },
                  { show: a.is_published, yes: "Live",     no: "Draft",     yc: "blue",   nc: "orange" },
                ].map((b, i) => (
                  <span key={i} className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${b.show ? `bg-${b.yc}-100 text-${b.yc}-700` : `bg-gray-100 text-gray-400`}`}>
                    {b.show ? b.yes : b.no}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${selected.is_published ? "bg-green-400" : "bg-orange-400"}`} />
                <div>
                  <h2 className="font-black text-gray-800 text-lg">{selected.name_en} / {selected.name_hi}</h2>
                  <p className="text-xs text-gray-400">{selected.is_published ? "Live on App" : "Draft"}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">✕</button>
            </div>

            {/* 2-col grid */}
            <div className="grid grid-cols-2 gap-4 p-6">
              {/* Image */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Image</p>
                <div className="rounded-xl overflow-hidden aspect-square bg-black flex items-center justify-center">
                  {selected.image_url
                    ? <img src={selected.image_url} className="w-full h-full object-cover" />
                    : <span className="text-gray-600 text-4xl">📷</span>}
                </div>
                <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl border-2 border-dashed cursor-pointer text-xs font-bold transition border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500 ${uploading === "image" ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploading === "image" ? "Uploading..." : selected.image_url ? "🔄 Replace Image" : "📤 Upload Image"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadFile(selected, "image", e.target.files[0])} />
                </label>
              </div>

              {/* Video */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Video (MP4)</p>
                <div className="rounded-xl overflow-hidden aspect-square bg-black flex items-center justify-center">
                  {selected.video_url
                    ? <video src={selected.video_url} className="w-full h-full object-cover" controls muted />
                    : <span className="text-gray-600 text-4xl">🎬</span>}
                </div>
                <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl border-2 border-dashed cursor-pointer text-xs font-bold transition border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 ${uploading === "video" ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploading === "video" ? "Uploading..." : selected.video_url ? "🔄 Replace Video" : "📤 Upload Video"}
                  <input type="file" accept="video/mp4" className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadFile(selected, "video", e.target.files[0])} />
                </label>
              </div>

              {/* Sound full width */}
              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sound (MP3)</p>
                {selected.sound_url
                  ? <audio src={selected.sound_url} controls className="w-full mb-2" />
                  : <div className="bg-gray-50 rounded-xl py-4 flex items-center justify-center text-gray-300 text-sm mb-2">No sound uploaded</div>
                }
                <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl border-2 border-dashed cursor-pointer text-xs font-bold transition border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500 ${uploading === "sound" ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploading === "sound" ? "Uploading..." : selected.sound_url ? "🔄 Replace Sound" : "📤 Upload Sound"}
                  <input type="file" accept="audio/mp3,audio/mpeg" className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadFile(selected, "sound", e.target.files[0])} />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => deleteAnimal(selected)}
                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-400 font-semibold text-sm hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition">
                🗑 Delete
              </button>
              <button onClick={() => togglePublish(selected)}
                className={`flex-1 py-2.5 rounded-xl font-black text-sm transition
                  ${selected.is_published ? "bg-red-100 text-red-500 hover:bg-red-200" : "bg-green-500 text-white hover:bg-green-600"}`}>
                {selected.is_published ? "⬇ Unpublish" : "🚀 Publish to App"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Animal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={addAnimal} className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-black text-gray-800 text-xl mb-6">Add New Animal</h2>
            <div className="flex flex-col gap-4">
              {/* English name → auto generates key + hindi */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Name (English)</label>
                <input
                  value={form.name_en}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name_en: val,
                      key: val.toLowerCase().trim().replace(/\s+/g, "_"),
                      name_hi: HINDI_MAP[val.toLowerCase().trim()] ?? prev.name_hi,
                    }));
                  }}
                  placeholder="e.g. Lion"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Name (Hindi)</label>
                <input
                  value={form.name_hi}
                  onChange={(e) => setForm((prev) => ({ ...prev, name_hi: e.target.value }))}
                  placeholder="e.g. शेर"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Image */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Image</label>
                {formImagePreview && <img src={formImagePreview} className="w-24 h-24 rounded-xl object-cover mb-2" />}
                <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500 cursor-pointer text-sm font-semibold transition">
                  {formImage ? `✓ ${formImage.name}` : "📷 Upload Image"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) { setFormImage(e.target.files[0]); setFormImagePreview(URL.createObjectURL(e.target.files[0])); }}} />
                </label>
              </div>

              {/* Video */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Video (MP4)</label>
                {formVideoPreview && <video src={formVideoPreview} controls muted className="w-full rounded-xl mb-2 max-h-40" />}
                <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 cursor-pointer text-sm font-semibold transition">
                  {formVideo ? `✓ ${formVideo.name}` : "🎬 Upload MP4"}
                  <input type="file" accept="video/mp4" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) { setFormVideo(e.target.files[0]); setFormVideoPreview(URL.createObjectURL(e.target.files[0])); }}} />
                </label>
              </div>

              {/* Sound */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">Sound (MP3)</label>
                {formSoundPreview && <audio src={formSoundPreview} controls className="w-full mb-2" />}
                <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500 cursor-pointer text-sm font-semibold transition">
                  {formSound ? `✓ ${formSound.name}` : "🔊 Upload MP3"}
                  <input type="file" accept="audio/mp3,audio/mpeg" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) { setFormSound(e.target.files[0]); setFormSoundPreview(URL.createObjectURL(e.target.files[0])); }}} />
                </label>
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
