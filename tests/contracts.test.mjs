import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import {
  attestRun,
  compareRuns,
  verdict,
  verifyAttestation,
  validatePlan,
  validateAdvice,
} from "../lib/report.mjs";
import { modelCall } from "../lib/provider.mjs";
import { loadManifests, validateManifest } from "../lib/manifests.mjs";
import { startServer } from "../server.mjs";
import { cliExitCode, parseCliArgs } from "../lib/cli.mjs";

async function directory() {
  const base = await mkdtemp(join(tmpdir(), "witness-qa-"));
  const runs = join(base, "runs");
  await mkdir(runs);
  return pathToFileURL(runs + "/");
}
test("advice is restricted to real check actions, never invented features", () => {
  const checks = [
    { id: "persistence", title: "Persistence" },
    { id: "coverage", title: "Coverage" },
  ];
  assert.throws(() =>
    validateAdvice({ nextCheckId: "sorting", action: "repeat-check" }, checks),
  );
  assert.throws(() =>
    validateAdvice({ nextCheckId: "coverage", action: "repeat-check" }, checks),
  );
  assert.equal(
    validateAdvice(
      { nextCheckId: "persistence", action: "repeat-check" },
      checks,
    ).action,
    "repeat-check",
  );
});
test("a pass after unknown coverage is never a resolved defect", () => {
  const before = {
    id: "a",
    suite: "s",
    state: "complete",
    checks: [{ id: "x", status: "not-tested" }],
  };
  const after = { ...before, id: "b", checks: [{ id: "x", status: "pass" }] };
  assert.equal(compareRuns(before, after)[0].change, "unverified");
  assert.throws(() => compareRuns(before, { ...after, suite: "other" }));
  assert.throws(() => compareRuns(before, { ...after, state: "interrupted" }));
});
test("comparison exposes fixes and regressions independently", () => {
  const before = {
    id: "a",
    suite: "s",
    state: "complete",
    checks: [
      {
        id: "x",
        status: "fail",
        observed: "The booking disappeared.",
        screenshots: [{ label: "Before", url: "/before.png" }],
      },
      { id: "y", status: "pass", screenshots: [] },
    ],
  };
  const after = {
    ...before,
    id: "b",
    checks: [
      {
        id: "x",
        status: "pass",
        observed: "The booking remained.",
        screenshots: [{ label: "Now", url: "/now.png" }],
      },
      { id: "y", status: "fail", screenshots: [] },
    ],
  };
  assert.deepEqual(
    compareRuns(before, after).map((c) => c.change),
    ["resolved", "regression"],
  );
  const resolved = compareRuns(before, after)[0];
  assert.equal(resolved.beforeObserved, "The booking disappeared.");
  assert.equal(resolved.afterObserved, "The booking remained.");
  assert.equal(resolved.beforeScreenshots[0].url, "/before.png");
  assert.equal(resolved.afterScreenshots[0].url, "/now.png");
});
test("model plans cannot omit, duplicate or invent checks", () => {
  for (const order of [["x"], ["x", "x"], ["x", "shell"]])
    assert.throws(() =>
      validatePlan(
        {
          order,
          reason: "test",
          risks: [
            { checkId: "x", hypothesis: "Risk x" },
            { checkId: "y", hypothesis: "Risk y" },
          ],
        },
        ["x", "y"],
      ),
    );
  assert.deepEqual(
    validatePlan(
      {
        order: ["y", "x"],
        reason: "Change affects y.",
        risks: [
          { checkId: "y", hypothesis: "Y may regress." },
          { checkId: "x", hypothesis: "X must remain stable." },
        ],
      },
      ["x", "y"],
    ).order,
    ["y", "x"],
  );
  assert.throws(() =>
    validatePlan(
      {
        order: ["x", "y"],
        reason: "test",
        risks: [
          { checkId: "x", hypothesis: "Risk x" },
          { checkId: "shell", hypothesis: "Invented" },
        ],
      },
      ["x", "y"],
    ),
  );
  assert.equal(
    verdict({ state: "complete", checks: [{ id: "x", status: "not-tested" }] }),
    "incomplete",
  );
});

test("run receipts detect decision or evidence-reference changes", () => {
  const run = {
    id: "receipt",
    suite: "suite",
    build: "candidate",
    change: "Save behavior changed.",
    checks: [
      {
        id: "save",
        status: "pass",
        expected: "One saved item.",
        observed: "One saved item.",
        screenshots: [
          {
            label: "Observed",
            url: "/evidence/receipt/save.png",
            sha256: "a".repeat(64),
          },
        ],
      },
    ],
    plan: { state: "standard", order: ["save"], risks: [] },
    analysis: { state: "skipped" },
  };
  run.attestation = attestRun(run);
  assert.equal(verifyAttestation(run), true);
  run.checks[0].observed = "Changed after receipt.";
  assert.equal(verifyAttestation(run), false);
});

test("declarative manifests load and reject unsafe targets or actions", async () => {
  const manifests = await loadManifests();
  assert.deepEqual([...manifests.keys()], ["booking-v1", "notes-v1"]);
  assert.equal(manifests.get("booking-v1").checks.length, 3);
  const valid = structuredClone(manifests.get("booking-v1"));
  valid.builds[0].path = "http://localhost:4400/baseline";
  assert.equal(validateManifest(valid).builds[0].path, valid.builds[0].path);
  valid.builds[0].path = "http://untrusted.example";
  assert.throws(() => validateManifest(valid), /unsafe build/);
  const invented = structuredClone(manifests.get("booking-v1"));
  invented.checks[0].actions[0].op = "shell";
  assert.throws(() => validateManifest(invented), /unsupported action/);
  const assertionFree = structuredClone(manifests.get("booking-v1"));
  assertionFree.checks[0].actions = [{ op: "navigate" }];
  assert.throws(() => validateManifest(assertionFree), /no assertion/);
  const remoteMutation = structuredClone(manifests.get("booking-v1"));
  remoteMutation.builds[0].path = "https://example.com/";
  remoteMutation.checks[0].actions.splice(1, 0, {
    op: "click",
    by: "role",
    role: "link",
    name: "Book",
  });
  assert.throws(() => validateManifest(remoteMutation), /cannot mutate/);
});

test("CLI requires an explicit target and fails closed on incomplete evidence", () => {
  assert.deepEqual(
    parseCliArgs(["--suite", "booking-v1", "--build", "candidate"]),
    { analyze: false, port: 4321, suite: "booking-v1", build: "candidate" },
  );
  assert.throws(() => parseCliArgs([]), /required/);
  assert.equal(
    cliExitCode({
      state: "complete",
      checks: [
        { id: "check", status: "pass" },
        { id: "coverage", status: "not-tested" },
      ],
    }),
    0,
  );
  assert.equal(
    cliExitCode({
      state: "complete",
      checks: [{ id: "check", status: "not-tested" }],
    }),
    1,
  );
});

test("provider failure boundaries preserve honest state", async (t) => {
  process.env.NEBIUS_API_KEY = "synthetic-qa-key";
  process.env.NEBIUS_INFERENCE_APPROVED = "true";
  const model = "nvidia/Nemotron-3_5-Lightning";
  const data = (finish = "stop", name = model, content = "{}") => ({
    model: name,
    choices: [{ finish_reason: finish, message: { content } }],
    usage: { total_tokens: 10 },
  });
  for (const [name, transport, pattern] of [
    ["401", async () => new Response("", { status: 401 }), /401/],
    ["429", async () => new Response("", { status: 429 }), /429/],
    ["truncation", async () => Response.json(data("length")), /incomplete/],
    [
      "identity mismatch",
      async () => Response.json(data("stop", "wrong")),
      /identity/,
    ],
    [
      "empty answer",
      async () => Response.json(data("stop", model, "")),
      /no answer/,
    ],
    [
      "malformed response",
      async () => new Response("not-json"),
      /JSON|Unexpected/,
    ],
  ])
    await t.test(name, async () => {
      let calls = 0;
      const result = await modelCall([], await directory(), {
        transport: async (...args) => {
          calls++;
          return transport(...args);
        },
      });
      assert.equal(result.state, "failed");
      assert.match(result.error, pattern);
      assert.equal(calls, 1);
      assert.equal(result.text, undefined);
    });
  await t.test("timeout", async () => {
    const result = await modelCall([], await directory(), {
      timeoutMs: 20,
      transport: (_url, { signal }) =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(() => resolve(Response.json(data())), 100);
          signal.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(signal.reason);
          });
        }),
    });
    assert.match(result.error, /timed out/);
  });
  await t.test("exhausted allowance makes no request", async () => {
    const dir = await directory();
    await writeFile(
      new URL("../model-call-ledger.json", dir),
      ' {"calls":10} ',
    );
    let called = false;
    const result = await modelCall([], dir, {
      transport: async () => {
        called = true;
      },
    });
    assert.equal(called, false);
    assert.match(result.error, /exhausted/);
  });
});

test("HTTP boundaries, concurrency and restart recovery", async (t) => {
  const dir = await directory();
  const id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  await writeFile(
    new URL(`${id}.json`, dir),
    JSON.stringify({
      id,
      state: "planning",
      createdAt: new Date().toISOString(),
      checks: [],
      analysis: { state: "pending" },
    }),
  );
  await writeFile(
    new URL("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb.json", dir),
    "broken",
  );
  await writeFile(new URL("../model-call-ledger.json", dir), '{"calls":9}');
  const server = await startServer({
    port: 4322,
    directory: dir,
    runnerOptions: {
      launchBrowser: async () => {
        await new Promise((r) => setTimeout(r, 150));
        throw new Error("QA browser launch failed");
      },
    },
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const base = "http://127.0.0.1:4322";
  const recovered = await (await fetch(`${base}/api/runs/${id}`)).json();
  assert.equal(recovered.state, "interrupted");
  assert.equal(recovered.analysis.state, "failed");
  assert.equal((await fetch(`${base}/.env`)).status, 404);
  const status = await (await fetch(`${base}/api/status`)).json();
  assert.equal(status.modelAllowance.remaining, 1);
  assert.equal(
    (
      await fetch(`${base}/api/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://elsewhere.example",
        },
        body: "{}",
      })
    ).status,
    403,
  );
  const send = (body) =>
    fetch(`${base}/api/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: base },
      body: JSON.stringify(body),
    });
  assert.equal(
    (await send({ suite: "notes-v1", build: "fixed", analyze: true })).status,
    400,
  );
  assert.equal(
    (await send({ build: "http://private-host", analyze: false })).status,
    400,
  );
  const replies = await Promise.all([
    send({ suite: "notes-v1", build: "fixed", analyze: false }),
    send({ suite: "notes-v1", build: "fixed", analyze: false }),
  ]);
  assert.deepEqual(replies.map((r) => r.status).sort(), [202, 409]);
  const accepted = await replies.find((r) => r.status === 202).json();
  await new Promise((r) => setTimeout(r, 250));
  const report = await (await fetch(`${base}/api/runs/${accepted.id}`)).json();
  assert.equal(report.state, "interrupted");
  assert.equal(report.checks.filter((c) => c.status === "pass").length, 0);
  const stored = JSON.parse(
    await readFile(new URL(`${accepted.id}.json`, dir), "utf8"),
  );
  assert.equal(stored.state, "interrupted");
});

test("server-managed pairs persist their relationship and comparison", async (t) => {
  const dir = await directory();
  const port = 4331;
  const base = `http://127.0.0.1:${port}`;
  const server = await startServer({ port, directory: dir, publicDemo: true });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const response = await fetch(`${base}/api/pairs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({
      suite: "booking-v1",
      change: "Verify the paired release review.",
      analyze: false,
    }),
  });
  assert.equal(response.status, 202);
  let pair = await response.json();
  const deadline = Date.now() + 30_000;
  while (pair.state === "running" && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    pair = await (await fetch(`${base}/api/pairs/${pair.id}`)).json();
  }
  assert.equal(pair.state, "complete");
  const baseline = await (
    await fetch(`${base}/api/runs/${pair.baselineId}`)
  ).json();
  const candidate = await (
    await fetch(`${base}/api/runs/${pair.candidateId}`)
  ).json();
  assert.equal(baseline.pairId, pair.id);
  assert.equal(candidate.pairId, pair.id);
  assert.equal(candidate.comparisonBaselineId, baseline.id);
  assert.equal(verifyAttestation(candidate), true);
  const comparison = await (
    await fetch(
      `${base}/api/compare?before=${baseline.id}&after=${candidate.id}`,
    )
  ).json();
  assert.equal(
    comparison.changes.filter((item) => item.change === "resolved").length,
    2,
  );
  assert.equal(comparison.receipts.before.verified, true);
  assert.equal(comparison.receipts.after.verified, true);
  assert.equal(comparison.receipts.before.fileCount, 4);
  assert.equal(comparison.receipts.after.fileCount, 4);
});

test("the judge-tour comparison survives a browser reload", async (t) => {
  const dir = await directory();
  const baselineId = "11111111-1111-4111-8111-111111111111";
  const candidateId = "22222222-2222-4222-8222-222222222222";
  const createdAt = new Date("2026-09-14T00:00:00.000Z");
  const checks = (repaired) => [
    {
      id: "booking-persistence",
      title: "Booking survives reload",
      status: repaired ? "pass" : "fail",
      expected: "The booking remains after reload.",
      observed: repaired ? "Booking remained." : "Booking disappeared.",
      durationMs: 1,
      steps: [],
      logs: [],
      screenshots: [],
    },
    {
      id: "sold-out-slot",
      title: "Sold-out slot cannot be selected",
      status: repaired ? "pass" : "fail",
      expected: "The sold-out slot is disabled.",
      observed: repaired ? "Slot was disabled." : "Slot was selectable.",
      durationMs: 1,
      steps: [],
      logs: [],
      screenshots: [],
    },
    {
      id: "required-name",
      title: "Customer name is required",
      status: "pass",
      expected: "A name is required.",
      observed: "Blank name was rejected.",
      durationMs: 1,
      steps: [],
      logs: [],
      screenshots: [],
    },
    {
      id: "coverage",
      title: "Authentication, payments and other browsers",
      status: "not-tested",
      expected: "Outside this suite.",
      observed: "Not tested.",
      durationMs: 0,
      steps: [],
      logs: [],
      screenshots: [],
    },
  ];
  const run = (id, build, time, repaired) => ({
    id,
    suite: "booking-v1",
    build,
    buildLabel:
      build === "baseline"
        ? "Baseline · Two seeded defects"
        : "Candidate · Repairs applied",
    targetName: "Harbour Appointments",
    change: "Verify both booking rules.",
    createdAt: time.toISOString(),
    state: "complete",
    checks: checks(repaired),
    plan: {
      state: "complete",
      order: ["booking-persistence", "sold-out-slot", "required-name"],
      risks: [],
      reason: "Reviewed model record.",
      model: "nvidia/Nemotron-3_5-Lightning",
      provider: "Nebius Token Factory",
      durationMs: 1,
      usage: { total_tokens: 1 },
    },
    analysis: {
      state: "complete",
      action: "expand-coverage",
      text: "Expand the explicitly unverified coverage.",
      evidenceIds: ["coverage"],
      model: "nvidia/Nemotron-3_5-Lightning",
      durationMs: 1,
      usage: { total_tokens: 1 },
    },
  });
  await writeFile(
    new URL(`${baselineId}.json`, dir),
    JSON.stringify(run(baselineId, "baseline", createdAt, false)),
  );
  await writeFile(
    new URL(`${candidateId}.json`, dir),
    JSON.stringify(
      run(candidateId, "candidate", new Date(createdAt.getTime() + 1000), true),
    ),
  );
  for (let index = 0; index < 6; index += 1) {
    const archiveId = `33333333-3333-4333-8333-${String(index).padStart(12, "0")}`;
    await writeFile(
      new URL(`${archiveId}.json`, dir),
      JSON.stringify(
        run(
          archiveId,
          "baseline",
          new Date(createdAt.getTime() - (index + 1) * 1000),
          false,
        ),
      ),
    );
  }

  const port = 4332;
  const base = `http://127.0.0.1:${port}`;
  const server = await startServer({ port, directory: dir, publicDemo: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  t.after(async () => {
    await browser.close();
    server.closeAllConnections();
    server.close();
  });
  const page = await browser.newPage();
  await page.goto(base);
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").getAttribute("id"), "skip-report");
  await page.keyboard.press("Enter");
  assert.equal(
    await page
      .locator("#report h2")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  assert.equal(await page.locator(".history-item").count(), 6);
  const historyToggle = page.getByRole("button", {
    name: "Show all 8 saved runs",
  });
  assert.equal(await historyToggle.getAttribute("aria-expanded"), "false");
  await historyToggle.click();
  assert.equal(await page.locator(".history-item").count(), 8);
  assert.equal(
    await page
      .getByRole("button", { name: "Show 6 recent runs" })
      .getAttribute("aria-expanded"),
    "true",
  );
  await page.getByRole("button", { name: /Start 90-second tour/ }).click();
  await page.locator("#comparison-result .comparison-callout").waitFor();
  assert.match(
    await page.locator("#comparison-summary").innerText(),
    /2 concerns resolved[\s\S]*0 regressions/,
  );
  assert.equal(await page.locator("#baseline").inputValue(), baselineId);
  assert.equal(await page.locator("#build").inputValue(), "candidate");
  assert.equal(
    await page
      .locator("#report h2")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  assert.equal(new URL(page.url()).hash, `#${candidateId}~${baselineId}`);

  await page.reload();
  await page.locator("#comparison-result .comparison-callout").waitFor();
  assert.match(
    await page.locator("#comparison-summary").innerText(),
    /2 concerns resolved[\s\S]*0 regressions/,
  );
  assert.equal(await page.locator("#baseline").inputValue(), baselineId);
  assert.equal(await page.locator("#build").inputValue(), "candidate");
  assert.match(
    await page.locator("#comparison-result").innerText(),
    /2 concerns resolved/,
  );
  const proof = page.locator(".comparison-evidence").first();
  await proof.locator("summary").click();
  assert.match(await proof.innerText(), /Booking disappeared\./);
  assert.match(await proof.innerText(), /Booking remained\./);
  await page.setViewportSize({ width: 390, height: 844 });
  const widths = await page.evaluate(() => ({
    inner: window.innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.equal(widths.inner, 390);
  assert.ok(widths.scroll <= widths.inner);
  await page.emulateMedia({ forcedColors: "active" });
  assert.equal(
    await page
      .getByRole("button", { name: /Start 90-second tour/ })
      .evaluate((element) => getComputedStyle(element).borderStyle),
    "solid",
  );
  await page.emulateMedia({ forcedColors: "none" });
});

test("public demo mode excludes local projects and model spending", async (t) => {
  const dir = await directory();
  const receiptId = "cccccccc-cccc-cccc-cccc-cccccccccccc";
  const receiptRun = {
    id: receiptId,
    suite: "booking-v1",
    build: "candidate",
    change: "Receipt fixture",
    createdAt: new Date().toISOString(),
    state: "complete",
    checks: [
      {
        id: "receipt-check",
        status: "pass",
        expected: "Stored evidence.",
        observed: "Stored evidence.",
        steps: [],
        logs: [],
        screenshots: [
          {
            label: "Observed",
            url: `/evidence/${receiptId}/receipt.png`,
            sha256: createHash("sha256").update("receipt-image").digest("hex"),
          },
        ],
      },
    ],
    plan: { state: "standard", order: ["receipt-check"], risks: [] },
    analysis: { state: "skipped" },
  };
  receiptRun.attestation = attestRun(receiptRun);
  await mkdir(new URL(`${receiptId}/`, dir));
  await writeFile(new URL(`${receiptId}/receipt.png`, dir), "receipt-image");
  await writeFile(
    new URL(`${receiptId}.json`, dir),
    JSON.stringify(receiptRun),
  );
  const hiddenId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
  const hiddenRun = structuredClone(receiptRun);
  hiddenRun.id = hiddenId;
  hiddenRun.suite = "private-preview-v1";
  hiddenRun.checks[0].screenshots[0].url = `/evidence/${hiddenId}/hidden-after.png`;
  hiddenRun.checks[0].screenshots[0].sha256 = createHash("sha256")
    .update("hidden-image")
    .digest("hex");
  hiddenRun.attestation = attestRun(hiddenRun);
  await mkdir(new URL(`${hiddenId}/`, dir));
  await writeFile(new URL(`${hiddenId}/hidden-after.png`, dir), "hidden-image");
  await writeFile(new URL(`${hiddenId}.json`, dir), JSON.stringify(hiddenRun));
  const port = 4323;
  const server = await startServer({
    port,
    directory: dir,
    publicDemo: true,
    publicBaseUrl: "https://release-witness.example",
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const base = `http://127.0.0.1:${port}`;
  const catalog = await (await fetch(`${base}/api/catalog`)).json();
  assert.deepEqual(
    catalog.map((manifest) => manifest.id),
    ["booking-v1", "notes-v1"],
  );
  const visibleRuns = await (await fetch(`${base}/api/runs`)).json();
  assert.equal(
    visibleRuns.some((run) => run.id === hiddenId),
    false,
  );
  for (const path of [
    `/api/runs/${hiddenId}`,
    `/api/runs/${hiddenId}/integrity`,
    `/api/runs/${hiddenId}/report`,
    `/api/runs/${hiddenId}/export`,
    `/evidence/${hiddenId}/hidden-after.png`,
  ])
    assert.equal((await fetch(`${base}${path}`)).status, 404);
  assert.equal(
    (await fetch(`${base}/api/compare?before=${hiddenId}&after=${receiptId}`))
      .status,
    404,
  );
  const status = await (await fetch(`${base}/api/status`)).json();
  assert.equal(status.modelConfigured, false);
  assert.equal(status.version, "0.1.8");
  assert.equal(status.publicDemo, true);
  const integrity = await (
    await fetch(`${base}/api/runs/${receiptId}/integrity`)
  ).json();
  assert.equal(integrity.verified, true);
  assert.equal(integrity.fileCount, 1);
  await writeFile(new URL(`${receiptId}/receipt.png`, dir), "changed-image");
  assert.equal(
    (await (await fetch(`${base}/api/runs/${receiptId}/integrity`)).json())
      .verified,
    false,
  );
  const response = await fetch(`${base}/api/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({ suite: "notes-v1", build: "fixed", analyze: true }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /public demo mode/);
});
