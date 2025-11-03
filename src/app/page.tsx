"use client";
import { useState } from "react";
import PlaylistCard from "@/components/PlaylistCard";

export default function Home() {
  const [subject, setSubject] = useState("");
  const [fact, setFact] = useState("");
  const [playlist, setPlaylist] = useState<any>(null);
  const [vibe, setVibe] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Accept subject as an argument to avoid stale state bugs
  async function refresh(forSubject?: string) {
    const s = (forSubject ?? subject).trim();
    if (!s) return;
    setLoading(true);
    try {
      const ts = Date.now().toString(); // cache-buster just in case
      const [factsRes, playlistRes] = await Promise.all([
        fetch(`/api/facts?t=${ts}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          cache: "no-store",
          body: JSON.stringify({ subject: s })
        }),
        fetch(`/api/playlist?t=${ts}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          cache: "no-store",
          body: JSON.stringify({ subject: s })
        })
      ]);
      const factsJson = await factsRes.json();
      const playlistJson = await playlistRes.json();
      setFact(factsJson.fact);
      setPlaylist(playlistJson);
      setVibe(playlistJson.vibe);
    } finally {
      setLoading(false);
    }
  }

  const quickPicks = [
    "Computer Algorithms",
    "Immunology",
    "Linear Algebra",
    "Shakespeare",
    "Neuroscience"
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-pink-50 via-violet-50 to-blue-50" />
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-md">
          <h1 className="text-balance bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-3xl font-extrabold text-transparent">
            Set the Scene — Your AI ambiance productivity curator
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Tell me what you’re studying and I’ll match the vibe, play focus-friendly tracks, and drop helpful mini facts.
          </p>

          <div className="mt-5 flex items-center gap-2">
            <div className="relative w-full">
              <input
                className="w-full rounded-xl border border-neutral-200/70 bg-white/70 px-4 py-3 pr-24 text-sm shadow-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-violet-300 focus:bg-white focus:shadow-md"
                placeholder="What are you studying? (e.g., Roman law, Immunology, Kafka)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") refresh();
                }}
              />
              <button
                onClick={() => refresh()}
                disabled={!subject.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Thinking…" : "Go"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickPicks.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setSubject(q);
                  // Call refresh with the *new* value to avoid stale state
                  refresh(q);
                }}
                className="rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-xs text-neutral-700 hover:border-violet-300 hover:text-violet-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {loading && (
            <div className="animate-pulse rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-md">
              <div className="h-4 w-24 rounded bg-neutral-200/70" />
              <div className="mt-2 h-4 w-3/5 rounded bg-neutral-200/70" />
              <div className="mt-2 h-4 w-2/5 rounded bg-neutral-200/70" />
            </div>
          )}

          {!loading && vibe && (
            <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow backdrop-blur-md">
              <div className="text-sm font-semibold text-neutral-800">Vibe</div>
              <p className="mt-1 text-sm text-neutral-700">
                {vibe.description || "Personalized focus vibe."}
              </p>
              {vibe.vibe && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-600">
                  <span className="rounded-full bg-violet-50 px-2 py-1">
                    energy: <b>{vibe.vibe.energy ?? "—"}</b>
                  </span>
                  <span className="rounded-full bg-violet-50 px-2 py-1">
                    valence: <b>{vibe.vibe.valence ?? "—"}</b>
                  </span>
                  <span className="rounded-full bg-violet-50 px-2 py-1">
                    instrumentalness: <b>{vibe.vibe.instrumentalness ?? "—"}</b>
                  </span>
                  <span className="rounded-full bg-violet-50 px-2 py-1">
                    tempo: <b>{vibe.vibe.tempo ?? "—"} BPM</b>
                  </span>
                </div>
              )}
            </div>
          )}

          {!loading && fact && (
            <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow backdrop-blur-md">
              <div className="text-xs uppercase tracking-wide text-neutral-500">Helpful fact</div>
              <p className="mt-1 text-sm text-neutral-800">{fact}</p>
            </div>
          )}

          {!loading && playlist && (
            <div className="rounded-2xl border border-white/60 bg-white/70 p-3 shadow backdrop-blur-md">
              <PlaylistCard
                provider={playlist.provider}
                tracks={playlist.tracks}
                url={playlist.url}
                reason={playlist.reason}
                seedGenres={playlist.seedGenres}
                error={playlist.error}
                flags={playlist.flags}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
