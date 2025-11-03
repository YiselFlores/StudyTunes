export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() {
  const hasKey = !!process.env.OPENAI_API_KEY;
  if (!hasKey) {
    return NextResponse.json({ ok: false, reason: "no_env_key" }, { status: 400 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const r = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: "Say OK." }],
      max_tokens: 3,
      temperature: 0
    });
    return NextResponse.json({
      ok: true,
      model: "gpt-4.1-mini",
      text: r.choices?.[0]?.message?.content?.trim() ?? ""
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
