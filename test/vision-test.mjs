// Test the exact server-side IMAGE-MODE pipeline with the mock chat screenshot
import { readFile } from "node:fs/promises";
import OpenAI from "openai";

const GEM = process.env.GEMINI_API_KEY,
  GQ = process.env.GROQ_API_KEY;
for (const line of await readFile(".env", "utf8").then((t) => t.split(/\r?\n/))) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2];
}

const gemini = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY,
});

const sys =
  "You are a dating conversation wingman. The user will attach 1-6 screenshots (or frames from a screen recording) of a chat conversation with their crush. Analyze the FULL conversation: identify who the user is (usually the person who would send the NEXT message - typically the one the screenshots were taken for/last messages are from the crush), the tone, energy, emojis, slang, pace and the current state of the conversation. " +
  "Then generate a 'pickupLines' array of EXACTLY two elements, each an object with fields 'id' (number) and 'text' (string). " +
  "Each text is a perfect short reply (or pickup line) the user could send as their NEXT message: it must continue the conversation naturally, match or playfully elevate the tone already in the chat, reference a specific detail from the chat (a word, emoji, joke or moment), and feel flirty-confident without being cringe or pushy. " +
  "Where the platform or language of the chat suggests it, keep abbreviations/casual style consistent with how the user already writes. Return ONLY the JSON object, no prose.";

const{ readFileSync } = await import("node:fs");
const b64 = readFileSync("test/mock-chat.png").toString("base64");

const t0 = Date.now();
const response = await gemini.chat.completions.create({
  model: "gemini-3.1-flash-lite",
  messages: [
    { role: "system", content: sys },
    {
      role: "user",
      content: [
        { type: "text", text: "Here is 1 screenshot of my chat conversation. Analyze it and write my perfect next message as described." },
        { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
      ],
    },
  ],
  response_format: { type: "json_object" },
  max_tokens: 2000,
  temperature: 1,
});
const data = JSON.parse(response.choices[0].message.content);
console.log("MODEL RAW JSON:", data);
console.log(`latency: ${Date.now() - t0}ms`);
console.log("\n=== Reply 1 ===\n" + data.pickupLines[0].text);
console.log("\n=== Reply 2 ===\n" + data.pickupLines[1].text);
