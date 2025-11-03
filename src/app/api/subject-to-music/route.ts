export const runtime = 'nodejs'; // ensure Node.js runtime (not Edge) for @xenova
import { NextRequest, NextResponse } from "next/server";
import { subjectToMusicLocal } from "@/lib/ai-local";
import { subjectToMusicCloud } from "@/lib/ai-cloud";


export async function POST(req: NextRequest) {
const { subject } = await req.json();
try {
if (process.env.OPENAI_API_KEY) {
const json = await subjectToMusicCloud(subject);
return NextResponse.json(json);
}
} catch {}
try {
const json = await subjectToMusicLocal(subject);
return NextResponse.json(json);
} catch (e) {
// ultra-robust fallback if local model fails (no network, etc.)
const text = (subject || "study").toLowerCase();
const isTech = /computer|code|algorithm|math|calculus|sql|data/.test(text);
const genres = isTech ? ["synthwave", "electronic"] : ["ambient", "classical"];
return NextResponse.json({
genres,
keywords: genres,
description: `Fallback vibe for ${subject}: ${genres.join(" + ")}.`,
vibe: { energy: isTech ? 0.5 : 0.25, valence: 0.35, instrumentalness: 0.9, tempo: isTech ? 95 : 65 }
});
}
}