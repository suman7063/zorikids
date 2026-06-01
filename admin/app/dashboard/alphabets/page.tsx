"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Alphabet = {
  id: string; letter: string; word: string;
  image_url: string | null; video_url: string | null; is_published: boolean;
};

const A_TO_Z = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const DEFAULT_WORDS: Record<string, string> = {
  A: "Apple", B: "Ball", C: "Cat", D: "Dog", E: "Elephant",
  F: "Fish", G: "Goat", H: "Horse", I: "Ice cream", J: "Jar",
  K: "Kite", L: "Lion", M: "Monkey", N: "Nest", O: "Orange",
  P: "Parrot", Q: "Queen", R: "Rabbit", S: "Sun", T: "Tiger",
  U: "Umbrella", V: "Van", W: "Watermelon", X: "Xylophone",
  Y: "Yak", Z: "Zebra",
};

export default function AlphabetsPage() {
  const [alphabets, setAlphabets]   = useState<Alphabet[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Alphabet | null>(null);
  const [uploading, setUploading]   = useState<"image" | "video" | null>(null);
  const [toast, setToast]           = useState("");
  const [editWord, setEditWord]     = useState("");

  useEffect(() => { fetchAlphabets(); }, []);

  async function fetchAlphabets() {
    setLoading(true);
    const { data } = await supabase.from("alphabets").select("*").order("letter");
    setAlphabets(data ?? []);
    setLoading(false);
  }

  async function seedAlphabets() {
    const rows = A_TO_Z.map((l) => ({
      letter: l, word: DEFAULT_WORDS[l] ?? l,
      image_url: null, is_published: false,
    }));
    await supabase.from("alphabets").upsert(rows, { onConflict: "letter" });
    showToast("A-Z seeded!");
    fetchAlphabets();
  }

  async function togglePublish(a: Alphabet) {
    await supabase.from("alphabets").update({ is_published: !a.is_published }).eq("id", a.id);
    setSelected({ ...a, is_published: !a.is_published });
    fetchAlphabets();
  }

  async function updateWord(a: Alphabet) {
    if (!editWord.trim()) return;
    await supabase.from("alphabets").update({ word: editWord.trim() }).eq("id", a.id);
    setSelected({ ...a, word: editWord.trim() });
    fetchAlphabets();
    showToast("Word updated!");
  }

  async function uploadFile(a: Alphabet, type: "image" | "video", file: File) {
    setUploading(type);
    const ext    = file.name.split(".").pop();
    const bucket = type === "image" ? "alphabet-images" : "alphabet-videos";
    const path   = `${a.letter.toLowerCase()}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { showToast("Upload failed"); setUploading(null); return; }
    const url   = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    const field = type === "image" ? "image_url" : "video_url";
    await supabase.from("alphabets").update({ [field]: `${url}?t=${Date.now()}` }).eq("id", a.id);
    setSelected({ ...a, [field]: url });
    fetchAlphabets();
    showToast(`${type === "image" ? "Image" : "Video"} uploaded!`);
    setUploading(null);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const published = alphabets.filter((a) => a.is_published).length;
  const withImage = alphabets.filter((a) => a.image_url).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Alphabets A–Z</h1>
          <p className="text-gray-400 text-sm">{published}/26 published · {withImage}/26 with image</p>
        </div>
        {alphabets.length === 0 && !loading && (
          <button onClick={seedAlphabets}
            className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition">
            + Seed A–Z
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-20">Loading...</p>
      ) : (
        <div className="grid grid-cols-6 gap-3">
          {alphabets.map((a) => (
            <div key={a.id} onClick={() => { setSelected(a); setEditWord(a.word); }}
              className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition aspect-square flex flex-col items-center justify-center
                ${selected?.id === a.id ? "border-amber-400" : "border-transparent hover:border-gray-200"}`}
              style={{ background: a.image_url ? "transparent" : "#F3F4F6" }}>
              {a.image_url
                ? <img src={a.image_url} className="w-full h-full object-cover absolute inset-0" />
                : <span className="text-gray-300 text-2xl">📷</span>
              }
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                <span className="text-white font-black text-3xl drop-shadow">{a.letter}</span>
                <span className="text-white text-xs font-semibold drop-shadow">{a.word}</span>
              </div>
              {a.is_published && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <span className="text-3xl font-black text-amber-600">{selected.letter}</span>
                </div>
                <div>
                  <p className="font-black text-gray-800 text-lg">{selected.letter} is for {selected.word}</p>
                  <p className="text-xs text-gray-400">{selected.is_published ? "✅ Live" : "⏳ Draft"}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">✕</button>
            </div>

            {/* Image */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Image</p>
              {selected.image_url
                ? <img src={selected.image_url} className="w-full h-48 object-cover rounded-xl mb-2" />
                : <div className="w-full h-48 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 mb-2 text-5xl">📷</div>
              }
              <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl border-2 border-dashed cursor-pointer text-xs font-bold transition border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading === "image" ? "Uploading..." : selected.image_url ? "🔄 Replace Image" : "📤 Upload Image"}
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(selected, "image", e.target.files[0])} />
              </label>
            </div>

            {/* Video */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Video (MP4)</p>
              {selected.video_url && <video src={selected.video_url} controls muted className="w-full rounded-xl mb-2 max-h-40" />}
              <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl border-2 border-dashed cursor-pointer text-xs font-bold transition border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading === "video" ? "Uploading..." : selected.video_url ? "🔄 Replace Video" : "📤 Upload MP4"}
                <input type="file" accept="video/mp4" className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(selected, "video", e.target.files[0])} />
              </label>
            </div>

            {/* Word edit */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Word</p>
              <div className="flex gap-2">
                <input value={editWord} onChange={(e) => setEditWord(e.target.value)}
                  className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-amber-400" />
                <button onClick={() => updateWord(selected)}
                  className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition">
                  Save
                </button>
              </div>
            </div>

            <button onClick={() => togglePublish(selected)}
              className={`w-full py-3 rounded-xl font-black text-sm transition
                ${selected.is_published ? "bg-red-100 text-red-500 hover:bg-red-200" : "bg-green-500 text-white hover:bg-green-600"}`}>
              {selected.is_published ? "⬇ Unpublish" : "🚀 Publish to App"}
            </button>
          </div>
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
