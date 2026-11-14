// Test the exact server-side IMAGE-MODE pipeline with the mock chat screenshot.
//
// The system prompt is loaded straight from lib/ai/instructions.ts (transpiled
// in-memory) so this test can never drift from what the app actually sends.
// NOTE: instructions.ts must stay free of imports for that to work.
import { readFileSync, existsSync } from "node:fs";
import ts from "typescript";
import OpenAI from "openai";

// --- prompt: single source of truth -----------------------------------------
const source = readFileSync("lib/ai/instructions.ts", "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { chatAnalysisInstructions } = await import(
  "data:text/javascript;base64," + Buffer.from(js).toString("base64")
);
if (!chatAnalysisInstructions) {
  throw new Error("Could not load chatAnalysisInstructions from lib/ai/instructions.ts");
}
if (!/['"]vibe['"]/.test(chatAnalysisInstructions)) {
  throw new Error("Loaded prompt does not ask for the vibe object — check instructions.ts");
}
console.log("Loaded prompt from lib/ai/instructions.ts (%d chars)", chatAnalysisInstructions.length);

// --- env: .env.local is what the README tells you to create; .env as fallback
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2];
  }
}

const GEM = process.env.GEMINI_API_KEY;
if (!GEM) {
  console.error("GEMINI_API_KEY not set — add it to .env.local (or .env) and retry.");
  process.exit(1);
}

const gemini = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: GEM,
  timeout: 30000,
  maxRetries: 0,
});

const b64 = readFileSync("test/mock-chat.png").toString("base64");

const t0 = Date.now();
const response = await gemini.chat.completions.create({
  model: "gemini-3.1-flash-lite",
  messages: [
    { role: "system", content: chatAnalysisInstructions },
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

let failed = false;

// The vibe analysis must come back BEFORE the lines are usable.
const mood = data?.vibe?.mood;
if (typeof mood === "string" && mood.trim()) {
  console.log(`\n=== Chat vibe: ${mood} ===\n${data.vibe.summary ?? "(no summary)"}`);
} else {
  failed = true;
  console.error("\nFAIL: response is missing vibe.mood — the analysis step did not run.");
}

const lines = Array.isArray(data?.pickupLines) ? data.pickupLines : [];
if (lines.length > 0) {
  lines.forEach((line, i) => {
    const text = typeof line === "string" ? line : line?.text;
    console.log(`\n=== Reply ${i + 1} ===\n${text}`);
  });
} else {
  failed = true;
  console.error("FAIL: response is missing pickupLines.");
}

process.exitCode = failed ? 1 : 0;
