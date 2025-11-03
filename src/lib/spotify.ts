// lib/spotify.ts

export async function getAppAccessToken(clientId: string, clientSecret: string) {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${token}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });
  if (!res.ok) throw new Error(`Spotify token error: ${res.status}`);
  return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>;
}

// --- allowlist + normalization from earlier stays the same ---
const SEED_ALLOWLIST = new Set<string>([
  "ambient","baroque","classical","electronic","jazz","lo-fi","synthwave","piano","chill","study"
]);
const MANUAL_MAP: Record<string,string> = {
  "neo-classical":"classical","string quartet":"classical","nature sounds":"ambient",
  "lofi":"lo-fi","lo-fi":"lo-fi","synth":"electronic","synthwave":"synthwave",
  "electronic":"electronic","baroque":"baroque","ambient":"ambient","jazz":"jazz",
  "classical":"classical","piano":"piano","chill":"chill","study":"study"
};
function normalizeOne(tag: string): string | null {
  const t = (MANUAL_MAP[tag.toLowerCase()] || tag.toLowerCase()).trim();
  if (SEED_ALLOWLIST.has(t)) return t;
  const stripped = t.replace(/[^a-z0-9]+/g, "");
  for (const s of SEED_ALLOWLIST) if (s.replace(/[^a-z0-9]+/g, "") === stripped) return s;
  return null;
}
export async function normalizeSeedGenres(_token: string, genres: string[], keywords?: string[]) {
  const candidates = [...(genres||[]), ...(keywords||[])];
  const out: string[] = [];
  for (const c of candidates) {
    const g = normalizeOne(c);
    if (g && !out.includes(g)) out.push(g);
    if (out.length >= 5) break;
  }
  if (!out.length) out.push("ambient","classical","lo-fi");
  return out.slice(0,5);
}

// --- RECS with market param ---
export async function getRecommendations({
  token,
  genres,
  target,
  market = "US"
}: {
  token: string;
  genres: string[];
  target?: { energy?: number; valence?: number; instrumentalness?: number; tempo?: number };
  market?: string;
}) {
  const params = new URLSearchParams();
  if (genres.length) params.set("seed_genres", genres.slice(0,5).join(","));
  if (target?.energy !== undefined) params.set("target_energy", String(target.energy));
  if (target?.valence !== undefined) params.set("target_valence", String(target.valence));
  if (target?.instrumentalness !== undefined) params.set("target_instrumentalness", String(target.instrumentalness));
  if (target?.tempo !== undefined) params.set("target_tempo", String(target.tempo));
  if (market) params.set("market", market);

  const res = await fetch(`https://api.spotify.com/v1/recommendations?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text().catch(()=>"");
    throw new Error(`Spotify recs error: ${res.status} ${text}`);
  }
  return res.json();
}

// --- NEW: Search fallback (still Spotify) ---
export async function searchTracks({
  token,
  query,
  limit = 20,
  market = "US"
}: {
  token: string;
  query: string;
  limit?: number;
  market?: string;
}) {
  const params = new URLSearchParams({ q: query, type: "track", limit: String(limit) });
  if (market) params.set("market", market);
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text().catch(()=>"");
    throw new Error(`Spotify search error: ${res.status} ${text}`);
  }
  return res.json();
}
