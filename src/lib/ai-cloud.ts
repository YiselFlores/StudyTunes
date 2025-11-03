import OpenAI from "openai";


export async function subjectToMusicCloud(subject: string) {
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const sys = `You map study topics to music for focus. Return compact JSON: {"genres":[],"keywords":[],"description":"","vibe":{"energy":0-1,"valence":0-1,"instrumentalness":0-1,"tempo":BPM}}. Keep instrumental-friendly.`;
const u = `Subject: ${subject}`;
const r = await client.chat.completions.create({
model: "gpt-4.1-mini",
messages: [{ role: "system", content: sys }, { role: "user", content: u }]
});
return JSON.parse(r.choices[0].message!.content || "{}");
}


export async function factCloud(subject: string) {
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const u = `Give ONE short (<= 2 sentences) helpful, exam-friendly fact about "${subject}". No fluff.`;
const r = await client.chat.completions.create({
model: "gpt-4.1-mini",
messages: [{ role: "user", content: u }]
});
return r.choices[0].message!.content?.trim() || "";
}