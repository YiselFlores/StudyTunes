// app/api/spotify-health/route.ts
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getAppAccessToken } from "@/lib/spotify";

export async function GET() {
  try {
    const cid = process.env.SPOTIFY_CLIENT_ID;
    const cs = process.env.SPOTIFY_CLIENT_SECRET;
    if (!cid || !cs) return NextResponse.json({ ok: false, step: "env", msg: "Missing env" }, { status: 400 });

    const tokenResp = await getAppAccessToken(cid, cs);
    const token = tokenResp.access_token;

    // Minimal search to prove token works
    const r = await fetch("https://api.spotify.com/v1/search?q=ambient&type=track&limit=1", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const ok = r.ok;
    const sample = ok ? await r.json() : { status: r.status, text: await r.text().catch(() => "") };

    return NextResponse.json({ ok, token_len: token?.length || 0, sample });
  } catch (e: any) {
    return NextResponse.json({ ok: false, step: "health", error: e?.message || String(e) }, { status: 500 });
  }
}

