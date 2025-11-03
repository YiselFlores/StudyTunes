// Local, $0 AI using @xenova/transformers (zero-shot subject→music tags)
import { pipeline, env } from "@xenova/transformers";
// Allow downloading models at runtime (needed on server)
// Cache in browser to avoid re-downloading
if (typeof window === "undefined") {
env.allowRemoteModels = true;
env.useBrowserCache = false;
} else {
env.allowRemoteModels = true;
env.useBrowserCache = true;
}


let classifier: any;
const LABELS = [
"classical", "baroque", "string quartet", "ambient", "lofi",
"piano", "jazz", "neo-classical", "synthwave", "electronic", "nature sounds"
];


export async function subjectToMusicLocal(subject: string) {
if (!classifier) classifier = await pipeline("zero-shot-classification", "Xenova/nli-deberta-v3-xsmall");
const out = await classifier(subject, LABELS);
const ranked: string[] = out.labels.slice(0, 4);


const isElectronic = /synth|electronic/.test(ranked.join(","));
const vibe = {
energy: isElectronic ? 0.5 : 0.25,
valence: 0.35,
instrumentalness: 0.85,
tempo: isElectronic ? 95 : 65
};


return {
genres: ranked.filter(x => ["classical","baroque","ambient","jazz","synthwave","electronic"].includes(x)),
keywords: ranked,
description: `Calibrated for ${subject}: ${ranked.slice(0,2).join(" + ")}.`,
vibe
};
}


// Offline mini fact bank as a fallback
const BANK: Record<string, string[]> = {
"greek mythology": [
"Apollo and Artemis are twin deities born to Zeus and Leto.",
"Mnemosyne personifies memory; the Muses are said to be her daughters."
],
"calculus": [
"Newton and Leibniz developed differential calculus independently.",
"The Mean Value Theorem ensures a tangent parallel to the secant over [a,b]."
],
"philosophy": [
"Socratic questioning exposes hidden assumptions by probing definitions.",
"Kant’s categorical imperative tests if your maxim can be universal law."
],
"computer science": [
"Dijkstra’s algorithm finds shortest paths with non-negative edges.",
"Big-O abstracts away constants to compare growth rates."
]
};


export function factLocal(subject: string) {
const k = Object.keys(BANK).find(key => subject.toLowerCase().includes(key)) || "computer science";
const base = BANK[k];
const pick = base[Math.floor(Math.random() * base.length)];
const openers = ["Quick note:", "Study tip:", "Remember:", "Good to know:"];
return `${openers[Math.floor(Math.random()*openers.length)]} ${pick}`;
}