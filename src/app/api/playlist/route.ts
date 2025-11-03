// app/api/playlist/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { getAppAccessToken, getRecommendations, normalizeSeedGenres, searchTracks } from "@/lib/spotify";

export async function POST(req: NextRequest) {
  const { subject } = await req.json();

  // Get AI vibe
  const vibeRes = await fetch(new URL("/api/subject-to-music", req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject })
  });
  const vibe = await vibeRes.json();

  const hasCID = !!process.env.SPOTIFY_CLIENT_ID;
  const hasCS  = !!process.env.SPOTIFY_CLIENT_SECRET;
  if (!hasCID || !hasCS) {
    const q = encodeURIComponent((vibe.genres?.length ? vibe.genres : vibe.keywords || ["study music"]).join(" "));
    return NextResponse.json({
      provider: "youtube_search",
      url: `https://www.youtube.com/results?search_query=${q}+playlist`,
      tracks: [],
      vibe,
      reason: "no_spotify_creds",
      flags: { hasCID, hasCS, where: "env-check" }
    });
  }

  try {
    const { access_token } = await getAppAccessToken(process.env.SPOTIFY_CLIENT_ID!, process.env.SPOTIFY_CLIENT_SECRET!);
    const seedGenres = await normalizeSeedGenres(access_token, vibe.genres || [], vibe.keywords || []);

    try {
      // First try Recommendations (with market)
      const recs = await getRecommendations({
        token: access_token,
        genres: seedGenres,
        target: vibe.vibe || { energy: 0.3, valence: 0.35, instrumentalness: 0.85, tempo: 70 },
        market: "US"
      });

      const tracks = (recs.tracks ?? []).map((t: any) => ({
        id: t.id,
        name: t.name,
        artists: t.artists?.map((a: any) => a.name).join(", "),
        url: t.external_urls?.spotify
      }));

      if (tracks.length > 0) {
        return NextResponse.json({ provider: "spotify", seedGenres, vibe, tracks });
      }
      // If empty, fall through to search
      throw new Error("empty_recommendations");
    } catch (err: any) {
      // Fallback: use Spotify SEARCH to return tracks
      const q = (seedGenres.length ? seedGenres : (vibe.keywords || ["ambient study instrumental"])).join(" ");
      const search = await searchTracks({ token: access_token, query: `${q} instrumental`, market: "US", limit: 20 });
      const items = search?.tracks?.items || [];
      const tracks = items.map((t: any) => ({
        id: t.id,
        name: t.name,
        artists: t.artists?.map((a: any) => a.name).join(", "),
        url: t.external_urls?.spotify
      }));

      if (tracks.length > 0) {
        return NextResponse.json({ provider: "spotify", seedGenres, vibe, tracks, via: "search_fallback" });
      }
      // If still nothing, last resort is YouTube
      const yq = encodeURIComponent(q);
      return NextResponse.json({
        provider: "youtube_search",
        url: `https://www.youtube.com/results?search_query=${yq}+playlist`,
        tracks: [],
        vibe,
        reason: "spotify_error_after_search",
        error: err?.message || String(err)
      });
    }
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error("[spotify] recommendations failed:", msg);
    const q = encodeURIComponent((vibe.genres?.length ? vibe.genres : vibe.keywords || ["study music"]).join(" "));
    return NextResponse.json({
      provider: "youtube_search",
      url: `https://www.youtube.com/results?search_query=${q}+playlist`,
      tracks: [],
      vibe,
      reason: "spotify_error",
      error: msg,
      flags: { where: "catch" }
    });
  }
}
