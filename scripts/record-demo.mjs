import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const base =
  process.env.DEMO_URL || "https://release-witness.139-99-135-89.sslip.io";
const candidate = "86f39150-bbd6-4039-b352-959da94e3097";
const baseline = "75db5178-f87b-4d16-88e9-3e917f9a9a19";
const outputDirectory = resolve("artifacts/video");
const output = resolve(outputDirectory, "release-witness-demo.webm");

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  recordVideo: { dir: outputDirectory, size: { width: 1600, height: 900 } },
});
const page = await context.newPage();

async function caption(title, text, duration = 5500) {
  await page.evaluate(
    ({ title, text }) => {
      document.querySelector("#demo-caption")?.remove();
      const caption = document.createElement("aside");
      caption.id = "demo-caption";
      caption.setAttribute("aria-label", "Video narration");
      caption.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
      Object.assign(caption.style, {
        position: "fixed",
        zIndex: "9999",
        left: "50%",
        bottom: "28px",
        transform: "translateX(-50%)",
        width: "min(1100px, calc(100% - 48px))",
        padding: "18px 22px",
        display: "grid",
        gap: "6px",
        color: "#fff",
        background: "rgba(23, 43, 35, .96)",
        border: "1px solid #8fe0ac",
        borderRadius: "9px",
        boxShadow: "0 18px 45px rgba(0,0,0,.28)",
        fontFamily: "Inter, Segoe UI, sans-serif",
      });
      caption.querySelector("strong").style.cssText =
        "font-size:20px;color:#b9f58b";
      caption.querySelector("span").style.cssText =
        "font-size:16px;line-height:1.45";
      document.body.append(caption);
    },
    { title, text },
  );
  await page.waitForTimeout(duration);
  await page.evaluate(() => document.querySelector("#demo-caption")?.remove());
}

try {
  await page.goto(`${base}/#${candidate}`, { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "The checked workflows passed." })
    .waitFor();
  await caption(
    "A release result needs a receipt.",
    "Release Witness turns a change into bounded risks, runs reviewed browser checks, and preserves evidence a human can assess.",
    6500,
  );

  await page.getByRole("button", { name: "Start 90-second tour →" }).click();
  await page.locator(".comparison-callout").waitFor();
  await page.locator(".plan").scrollIntoViewIfNeeded();
  await caption(
    "Nemotron maps change risk.",
    "NVIDIA Nemotron 3.5 Lightning through Nebius must map every known check. It may order the catalog, but it cannot remove coverage or decide a verdict.",
    7000,
  );

  await page.locator("#check-booking-persistence summary").click();
  await page.locator("#check-booking-persistence").scrollIntoViewIfNeeded();
  await caption(
    "Change → risk → contract → verified receipt.",
    "The server recomputes the report receipt and every stored screenshot hash before showing verification beside the exact browser observation.",
    7500,
  );

  await page.locator(".comparison").scrollIntoViewIfNeeded();
  await caption(
    "The comparison keeps uncertainty visible.",
    "Two concerns resolved. Zero observed regressions. One invariant unchanged. Authentication, payments, and other browsers remain explicitly unverified.",
    7500,
  );

  await page.goto(`${base}/#${baseline}`, { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "A release concern, with evidence." })
    .waitFor();
  await page.locator("#check-booking-persistence").scrollIntoViewIfNeeded();
  await caption(
    "The baseline contains two known defects.",
    "Release Witness found both: a booking disappears after reload, and a sold-out slot remains selectable. Required-name validation still passes.",
    7500,
  );

  await page.goto(`${base}/#${candidate}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Start 90-second tour →" }).click();
  await page.locator(".comparison-callout").waitFor();
  await page.locator(".interpretation").scrollIntoViewIfNeeded();
  await caption(
    "Bounded advice, with provider provenance.",
    "The saved live record shows model identity, Nebius provider, latency, and token use. Advice comes from an allow-listed action catalog and never changes browser evidence.",
    7500,
  );

  await page.locator(".comparison-callout").scrollIntoViewIfNeeded();
  await caption(
    "Measured on known ground truth.",
    "2 of 2 seeded defects detected. 2 of 2 repairs classified as resolved. Each real model-enabled run completed in under five seconds.",
    7000,
  );

  await page.locator(".intro").scrollIntoViewIfNeeded();
  await caption(
    "Release Witness",
    "Evidence before confidence. Inspect the live demo and reproduce every supported result.",
    5500,
  );
} finally {
  const video = page.video();
  await context.close();
  await video.saveAs(output);
  await browser.close();
}

console.log(output);
