import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const base =
  process.env.DEMO_URL || "https://release-witness.139-99-135-89.sslip.io";
const outputDirectory = resolve("artifacts/video");
const output = resolve(outputDirectory, "release-witness-demo-v2.webm");

const benchmark = await (await fetch(`${base}/api/benchmark`)).json();
if (!benchmark.complete)
  throw new Error("The public benchmark is not certified.");
const appointments = benchmark.suites.find(
  (suite) => suite.id === "booking-v1",
);
const fieldnotes = benchmark.suites.find((suite) => suite.id === "notes-v1");
if (!appointments?.verified || !fieldnotes?.verified)
  throw new Error(
    "Both public benchmark workflows must verify before recording.",
  );

const comparisonUrl = (suite) =>
  `${base}/#${suite.candidateId}~${suite.baselineId}`;

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  recordVideo: { dir: outputDirectory, size: { width: 1600, height: 900 } },
});
const page = await context.newPage();

async function caption(title, text, duration) {
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

async function openComparison(suite) {
  await page.goto(comparisonUrl(suite), { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "The checked workflows passed." })
    .waitFor();
}

try {
  await openComparison(appointments);
  await page.locator(".intro").scrollIntoViewIfNeeded();
  await caption(
    "A release result needs a receipt.",
    "Release Witness turns a change into bounded risks, reviewed Chrome checks and evidence a human can assess.",
    10_000,
  );

  await page.getByRole("button", { name: "Start 90-second tour →" }).click();
  await page.locator(".plan").scrollIntoViewIfNeeded();
  await caption(
    "Nemotron maps every reviewed risk.",
    "NVIDIA Nemotron 3.5 Lightning runs through Nebius Token Factory. It can prioritize the catalog, but it cannot remove coverage or decide a verdict.",
    13_000,
  );

  await page.goto(`${base}/#${appointments.baselineId}`, {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("heading", { name: "A release concern, with evidence." })
    .waitFor();
  await page.locator("#check-booking-persistence summary").click();
  await page.locator("#check-booking-persistence").scrollIntoViewIfNeeded();
  await caption(
    "The appointment baseline contains two defects.",
    "Booking persistence and sold-out availability fail. Required-name validation remains passing.",
    12_000,
  );

  await openComparison(appointments);
  await page
    .locator("summary")
    .filter({ hasText: "Booking survives reload" })
    .last()
    .click();
  await page.locator(".comparison-evidence").first().scrollIntoViewIfNeeded();
  await caption(
    "The candidate resolves both concerns.",
    "Before-and-after observations, reproduction steps and screenshots stay together. Unknown browser, payment and authentication coverage remains visible.",
    15_000,
  );

  await openComparison(fieldnotes);
  await page
    .locator("summary")
    .filter({ hasText: "Saved note survives reload" })
    .last()
    .click();
  await page.locator(".comparison-evidence").first().scrollIntoViewIfNeeded();
  await caption(
    "The same contract runs on Fieldnotes.",
    "Persistence changes from fail to pass while validation and duplicate prevention stay passing, without scenario-specific runner code.",
    16_000,
  );

  await openComparison(appointments);
  await page.locator(".proof-points").scrollIntoViewIfNeeded();
  await caption(
    "Measured across two workflows.",
    "3 of 3 defects detected. 3 of 3 repairs classified. Four receipted Nemotron runs contribute 12 grounded hypotheses and four bounded advisories.",
    17_000,
  );

  await page.goto(`${base}/api/benchmark/report`, { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "Evidence a judge can trace." })
    .waitFor();
  await page.locator(".benchmark-report-hero").scrollIntoViewIfNeeded();
  await caption(
    "One traceable portfolio receipt.",
    "Four run receipts and 16 screenshots verify. The aggregate binds the exact release, immutable commit and downloadable source-archive hash.",
    16_000,
  );

  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator(".intro").scrollIntoViewIfNeeded();
  await caption("Release Witness", "Evidence before confidence.", 4_000);
} finally {
  const video = page.video();
  await context.close();
  await video.saveAs(output);
  await browser.close();
}

console.log(output);
