// e2e: /generate is public now — render + pending-hint + note + screenshot generation.
import puppeteer from "puppeteer-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = process.env.BASE_URL || "http://localhost:3000";
const results = [];

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    // Optional: pin the prod alias to a known-good edge IP (some ISPs have
    // transient routing issues with individual Vercel anycast IPs).
    ...(process.env.PINNED_IP
      ? [
          `--host-resolver-rules=MAP pickup-line-generator-tau.vercel.app ${process.env.PINNED_IP}`,
        ]
      : []),
  ],
});

async function openPage() {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`CONSOLE: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`HTTP${r.status()}: ${r.url()}`);
  });
  return { page, errors };
}

const submitNoteForm = (pg) =>
  pg.evaluate(() => {
    const form = document.getElementById("crushDescription")?.closest("form");
    form?.querySelector('button[type="submit"]')?.click();
  });

// --- 1) plain render/hydration ---
{
  const opened = await openPage();
  const page = opened.page;
  await page.goto(`${BASE}/generate`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));
  const html = await page.content();
  results.push({
    test: "render",
    finalUrl: page.url(),
    crashed: html.includes("client-side exception"),
    hasForm: html.includes("Upload a chat screenshot"),
    errors: opened.errors,
  });
  await page.close();
}

// --- 2) note-only generation + pending hint ---
{
  const opened = await openPage();
  const page = opened.page;
  await page.goto(`${BASE}/generate`, { waitUntil: "networkidle2", timeout: 60000 });
  await page.type("#crushDescription", "we vibe on banter, I want to ask her out");
  await submitNoteForm(page);
  let hintShown = false;
  let generated = false;
  try {
    await page.waitForFunction(
      () => document.body.innerText.includes("Writing your lines"),
      { timeout: 8000 },
    );
    hintShown = true;
  } catch {
    /* hint may flash by fast */
  }
  try {
    await page.waitForFunction(
      () => document.body.innerText.includes("Copy the below pick up lines"),
      { timeout: 90000 },
    );
    generated = true;
  } catch {
    /* not found */
  }
  const html = await page.content();
  results.push({
    test: "note-generation",
    hintShown,
    generated,
    crashed: html.includes("client-side exception"),
    errors: opened.errors,
  });
  await page.close();
}

// --- 3) screenshot upload + generation ---
{
  const opened = await openPage();
  const page = opened.page;
  await page.goto(`${BASE}/generate`, { waitUntil: "networkidle2", timeout: 60000 });
  const input = await page.$('input[type="file"]');
  await input.uploadFile("C:\\Users\\USER\\Desktop\\pickup-line-generator\\test\\mock-chat.png");
  await new Promise((r) => setTimeout(r, 3000)); // frame extraction
  const html1 = await page.content();
  const framesShown = html1.includes("chat frame 1");
  await submitNoteForm(page);
  let generated = false;
  try {
    await page.waitForFunction(
      () => document.body.innerText.includes("Copy the below pick up lines"),
      { timeout: 90000 },
    );
    generated = true;
  } catch {
    /* not found */
  }
  const html2 = await page.content();
  results.push({
    test: "upload-generation",
    framesShown,
    generated,
    crashed:
      html1.includes("client-side exception") || html2.includes("client-side exception"),
    errors: opened.errors,
  });
  await page.close();
}

// --- 4) legacy /login redirects to /generate ---
{
  const opened = await openPage();
  const page = opened.page;
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 60000 });
  results.push({
    test: "legacy-login-redirect",
    finalUrl: page.url(),
    ok: page.url().endsWith("/generate"),
    errors: opened.errors,
  });
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
