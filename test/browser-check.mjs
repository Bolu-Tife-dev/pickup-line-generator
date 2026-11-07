// Loads the production site in headless Chrome and captures ALL client errors
import puppeteer from "puppeteer-core";

const CHROME =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "https://pickup-line-generator-tau.vercel.app";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const report = [];
async function watch(url, label) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`CONSOLE: ${m.text()}`);
  });
  page.on("requestfailed", (r) =>
    errors.push(`REQFAIL: ${r.url()} :: ${r.failure()?.errorText}`),
  );
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`HTTP${r.status()}: ${r.url()}`);
  });
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 4000));
    const html = await page.content();
    const crashed = html.includes("client-side exception");
    const title = await page.title();
    report.push({
      label,
      finalUrl: page.url(),
      title,
      crashed,
      errors,
    });
  } catch (e) {
    report.push({ label, navError: String(e), errors });
  }
  await page.close();
}

await watch(`${BASE}/`, "landing");
await watch(`${BASE}/login`, "login");
await watch(`${BASE}/generate`, "generate-unauth");

console.log(JSON.stringify(report, null, 2));
await browser.close();
