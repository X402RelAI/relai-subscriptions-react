import { chromium } from "playwright-core";
import { readdirSync } from "node:fs";

const base = `${process.env.HOME}/.cache/ms-playwright`;
const exe = readdirSync(base).find((d) => d.startsWith("chromium_headless_shell"));
const execPath = `${base}/${exe}/chrome-headless-shell-linux64/chrome-headless-shell`;

const browser = await chromium.launch({ executablePath: execPath });
const page = await browser.newPage({
  viewport: { width: 1240, height: 900 },
  deviceScaleFactor: 2,
});
await page.goto("http://localhost:4317/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1200);

const sections = await page.$$(".demo-section");
let i = 0;
for (const s of sections) {
  const out = `preview-${String(i).padStart(2, "0")}.png`;
  await s.screenshot({ path: out });
  console.log("shot", out);
  i++;
}
await browser.close();
