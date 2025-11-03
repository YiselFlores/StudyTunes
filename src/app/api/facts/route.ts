export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { subject } = await req.json();
  const s = String(subject || "").trim();

  if (!s) {
    return NextResponse.json(
      { fact: "Tell me what you're studying and I'll give you a fact!", error: null },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // No key: neutral, not motivational, but we keep the app running
    return NextResponse.json(
      { fact: `Topic: ${s}.`, error: "no_openai_key" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const client = new OpenAI({ apiKey });

  // Try a list of models in order (accounts sometimes lack access to a specific one)
  const MODELS = ["gpt-4.1-mini", "gpt-4o-mini", "gpt-3.5-turbo"];

  const prompt = `
Provide EXACTLY ONE academically accurate sentence related to:
"${s}"

Rules:
- One sentence only
- No advice, no encouragement, no meta commentary
- No intro like "Here's a fact:"
- College-level clarity
- Output ONLY the sentence
`.trim();

  let lastErr: string | null = null;

  for (const model of MODELS) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 60,
        temperature: 0.2
      });
      const message = completion?.choices?.[0]?.message?.content ?? "";
      const fact = message.trim();
      if (fact) {
        return new NextResponse(JSON.stringify({ fact, error: null, model }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
        });
      }
      lastErr = "empty_response";
    } catch (e:any) {
      lastErr = e?.message || String(e);
      // Try next model
    }
  }

  // All models failed → return safe minimal text + surface the reason so you can see it in dev
  return NextResponse.json(
    { fact: `Topic: ${s}.`, error: lastErr || "unknown_ai_error" },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
