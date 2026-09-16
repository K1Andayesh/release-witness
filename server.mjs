import http from "node:http";
import { readFile, writeFile, mkdir, rename, readdir } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import { runChecks } from "./lib/runner.mjs";
import {
  attestBenchmark,
  attestRun,
  compareRuns,
  measureModelContribution,
  verifyAttestation,
  verifyPairRelationship,
  verdict,
} from "./lib/report.mjs";
import { loadManifests, publicCatalog } from "./lib/manifests.mjs";
import { modelAllowance } from "./lib/provider.mjs";
import { pathToFileURL } from "node:url";

export async function startServer({
  port = Number(process.env.PORT || 4317),
  host = process.env.HOST || "127.0.0.1",
  publicBaseUrl = process.env.PUBLIC_BASE_URL || "",
  publicDemo = process.env.PUBLIC_DEMO_MODE === "true",
  sourceCommit = process.env.RELEASE_COMMIT || "",
  sourceArchiveSha256 = process.env.RELEASE_ARCHIVE_SHA256 || "",
  directory = new URL("./artifacts/runs/", import.meta.url),
  runnerOptions = {},
} = {}) {
  const packageMetadata = JSON.parse(
    await readFile(new URL("./package.json", import.meta.url), "utf8"),
  );
  const origin = `http://127.0.0.1:${port}`;
  const reportOrigin = publicBaseUrl ? new URL(publicBaseUrl).origin : origin;
  const sourceRepository = "https://github.com/K1Andayesh/release-witness";
  const normalizedSourceCommit = /^[a-f0-9]{40}$/.test(sourceCommit)
    ? sourceCommit
    : null;
  const normalizedSourceArchiveSha256 = /^[a-f0-9]{64}$/i.test(
    sourceArchiveSha256,
  )
    ? sourceArchiveSha256.toLowerCase()
    : null;
  const allowedHosts = new Set([
    `127.0.0.1:${port}`,
    `localhost:${port}`,
    ...(publicBaseUrl ? [new URL(publicBaseUrl).host] : []),
  ]);
  const allManifests = await loadManifests();
  const manifests = new Map(
    [...allManifests].filter(
      ([, manifest]) => !publicDemo || manifest.localOnly !== true,
    ),
  );
  await mkdir(directory, { recursive: true });
  const runs = new Map();
  const pairs = new Map();
  let busy = false;
  async function save(run) {
    const target = new URL(`${run.id}.json`, directory);
    const temp = new URL(`${run.id}.tmp`, directory);
    await writeFile(temp, JSON.stringify(run, null, 2));
    await rename(temp, target);
    runs.set(run.id, structuredClone(run));
  }
  async function savePair(pair) {
    const target = new URL(`${pair.id}.pair.json`, directory);
    const temp = new URL(`${pair.id}.pair.tmp`, directory);
    await writeFile(temp, JSON.stringify(pair, null, 2));
    await rename(temp, target);
    pairs.set(pair.id, structuredClone(pair));
  }
  async function verifyEvidence(run) {
    if (!verifyAttestation(run))
      return {
        verified: false,
        fileCount: 0,
        reason: "The run receipt is missing or does not match its report.",
      };
    const screenshots = run.checks.flatMap((check) => check.screenshots);
    for (const screenshot of screenshots) {
      const match = screenshot.url.match(
        new RegExp(`^/evidence/${run.id}/([a-z0-9-]+\\.png)$`),
      );
      if (!match || !/^[a-f0-9]{64}$/.test(screenshot.sha256 || ""))
        return {
          verified: false,
          fileCount: screenshots.length,
          reason: "A screenshot reference is not covered by the receipt.",
        };
      try {
        const actual = createHash("sha256")
          .update(await readFile(new URL(`${run.id}/${match[1]}`, directory)))
          .digest("hex");
        if (actual !== screenshot.sha256)
          return {
            verified: false,
            fileCount: screenshots.length,
            reason: "A stored screenshot does not match its recorded hash.",
          };
      } catch {
        return {
          verified: false,
          fileCount: screenshots.length,
          reason: "A receipt screenshot is unavailable.",
        };
      }
    }
    return {
      verified: true,
      fileCount: screenshots.length,
      digest: run.attestation.digest,
      reason: "The report and every screenshot match the SHA-256 receipt.",
    };
  }
  const storedNames = await readdir(directory);
  for (const name of storedNames) {
    if (!/^[a-f0-9-]+\.json$/.test(name)) continue;
    let run;
    try {
      run = JSON.parse(await readFile(new URL(name, directory), "utf8"));
      if (
        `${run.id}.json` !== name ||
        !Array.isArray(run.checks) ||
        !run.analysis
      )
        throw new Error("Invalid report");
      if (publicDemo && !manifests.has(run.suite)) continue;
    } catch {
      console.error(`Unreadable report skipped: ${name}`);
      continue;
    }
    if (["planning", "running", "analyzing"].includes(run.state)) {
      run.state = "interrupted";
      run.error = "Server stopped before this run finished.";
      if (run.analysis.state === "pending")
        run.analysis = {
          state: "failed",
          error: "Run interrupted before interpretation completed.",
        };
      run.finishedAt = new Date().toISOString();
      await save(run);
    } else runs.set(run.id, run);
  }
  for (const name of storedNames) {
    if (!/^[a-f0-9-]+\.pair\.json$/.test(name)) continue;
    try {
      const pair = JSON.parse(await readFile(new URL(name, directory), "utf8"));
      if (`${pair.id}.pair.json` !== name || !Array.isArray(pair.builds))
        throw new Error("Invalid pair");
      if (publicDemo && !manifests.has(pair.suite)) continue;
      if (pair.state === "running") {
        pair.state = "interrupted";
        pair.error = "Server stopped before the paired review finished.";
        pair.finishedAt = new Date().toISOString();
        await savePair(pair);
      } else pairs.set(pair.id, pair);
    } catch {
      console.error(`Unreadable pair skipped: ${name}`);
    }
  }

  function newRun(manifest, build, input, relationship = {}) {
    return {
      id: randomUUID(),
      build: build.id,
      buildLabel: build.label,
      targetName: manifest.name,
      change: input.change?.trim() || manifest.defaultChange,
      createdAt: new Date().toISOString(),
      state: "running",
      suite: manifest.id,
      checks: [],
      analysis: { state: input.analyze ? "pending" : "skipped" },
      ...relationship,
    };
  }

  async function executeRun(run, manifest, analyze) {
    try {
      await runChecks(run, {
        origin,
        directory,
        save,
        analyze,
        manifest,
        ...runnerOptions,
      });
      run.state = "complete";
    } catch (error) {
      run.state = "interrupted";
      run.error = error.message.split("\n")[0].slice(0, 300);
      if (run.analysis.state === "pending")
        run.analysis = {
          state: "failed",
          error: "Run interrupted before interpretation completed.",
        };
    } finally {
      run.finishedAt = new Date().toISOString();
      if (run.state === "complete") run.attestation = attestRun(run);
      await save(run);
    }
    return run;
  }

  async function executePair(pair, manifest, input) {
    try {
      const baseline = newRun(manifest, manifest.builds[0], input, {
        pairId: pair.id,
        pairPosition: "baseline",
      });
      pair.baselineId = baseline.id;
      await save(baseline);
      await savePair(pair);
      await executeRun(baseline, manifest, input.analyze);
      if (baseline.state !== "complete")
        throw new Error("The baseline run was interrupted; the pair stopped.");

      pair.step = "candidate";
      const candidate = newRun(manifest, manifest.builds[1], input, {
        pairId: pair.id,
        pairPosition: "candidate",
        comparisonBaselineId: baseline.id,
      });
      pair.candidateId = candidate.id;
      await save(candidate);
      await savePair(pair);
      await executeRun(candidate, manifest, input.analyze);
      if (candidate.state !== "complete")
        throw new Error(
          "The candidate run was interrupted; comparison is unavailable.",
        );
      pair.state = "complete";
      pair.step = "complete";
    } catch (error) {
      pair.state = "interrupted";
      pair.error = error.message.split("\n")[0].slice(0, 300);
    } finally {
      pair.finishedAt = new Date().toISOString();
      try {
        await savePair(pair);
      } finally {
        busy = false;
      }
    }
  }
  async function benchmarkSummary() {
    const definitions = [...manifests.values()].filter(
      (manifest) => manifest.benchmark,
    );
    const suites = [];
    for (const manifest of definitions) {
      const groundTruth = manifest.benchmark;
      const candidates = [...runs.values()]
        .filter(
          (run) =>
            run.suite === manifest.id &&
            run.build === groundTruth.candidateBuild &&
            run.state === "complete" &&
            run.comparisonBaselineId,
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .filter((run) => {
          const baseline = runs.get(run.comparisonBaselineId);
          const pair = pairs.get(run.pairId);
          return verifyPairRelationship(manifest, pair, baseline, run);
        });
      // A judge can run a new browser-only pair in public demo mode. Keep the
      // competition benchmark on the newest model-backed pair when one exists.
      // Receipt validation still happens below, so altered evidence fails closed.
      const candidate =
        candidates.find((run) => {
          const baseline = runs.get(run.comparisonBaselineId);
          return [baseline, run].every(
            (item) =>
              item?.plan?.state === "complete" &&
              item?.analysis?.state === "complete",
          );
        }) || candidates[0];
      const baseline = candidate
        ? runs.get(candidate.comparisonBaselineId)
        : undefined;
      if (!baseline || !candidate) {
        suites.push({
          id: manifest.id,
          name: manifest.name,
          verified: false,
          reason: "A completed server-managed benchmark pair is unavailable.",
          knownDefects: groundTruth.knownDefectIds.length,
        });
        continue;
      }
      const changes = compareRuns(baseline, candidate);
      const byId = new Map(changes.map((change) => [change.id, change]));
      const [baselineReceipt, candidateReceipt] = await Promise.all([
        verifyEvidence(baseline),
        verifyEvidence(candidate),
      ]);
      const defectsDetected = groundTruth.knownDefectIds.filter(
        (id) => byId.get(id)?.before === "fail",
      ).length;
      const repairsResolved = groundTruth.knownDefectIds.filter(
        (id) => byId.get(id)?.change === "resolved",
      ).length;
      const invariantsPreserved = groundTruth.invariantIds.filter((id) => {
        const change = byId.get(id);
        return (
          change?.before === "pass" &&
          change.after === "pass" &&
          change.change === "unchanged"
        );
      }).length;
      const regressions = changes.filter(
        (change) => change.change === "regression",
      ).length;
      const boundariesUnverified = changes.filter(
        (change) => change.id === "coverage" && change.change === "unverified",
      ).length;
      const receiptsVerified = [baselineReceipt, candidateReceipt].filter(
        (receipt) => receipt.verified,
      ).length;
      const screenshotFilesVerified = [baselineReceipt, candidateReceipt]
        .filter((receipt) => receipt.verified)
        .reduce((total, receipt) => total + receipt.fileCount, 0);
      const modelEvidence = measureModelContribution(
        manifest,
        [baseline, candidate],
        receiptsVerified,
      );
      const verified =
        defectsDetected === groundTruth.knownDefectIds.length &&
        repairsResolved === groundTruth.knownDefectIds.length &&
        invariantsPreserved === groundTruth.invariantIds.length &&
        regressions === 0 &&
        boundariesUnverified === 1 &&
        receiptsVerified === 2;
      const failures = [];
      if (defectsDetected !== groundTruth.knownDefectIds.length)
        failures.push("The baseline did not expose every declared defect.");
      if (repairsResolved !== groundTruth.knownDefectIds.length)
        failures.push("The candidate did not resolve every declared defect.");
      if (invariantsPreserved !== groundTruth.invariantIds.length)
        failures.push("A declared invariant was not preserved.");
      if (regressions > 0)
        failures.push("The comparison contains a regression.");
      if (boundariesUnverified !== 1)
        failures.push("The coverage boundary was not retained as unverified.");
      if (receiptsVerified !== 2)
        failures.push("Both evidence receipts did not verify.");
      suites.push({
        id: manifest.id,
        name: manifest.name,
        verified,
        reason: verified
          ? "Declared ground truth, comparison states and both evidence receipts verify."
          : failures.join(" "),
        pairId: candidate.pairId,
        baselineId: baseline.id,
        candidateId: candidate.id,
        route: `#${candidate.id}~${baseline.id}`,
        knownDefects: groundTruth.knownDefectIds.length,
        defectsDetected,
        repairsResolved,
        invariantsPreserved,
        regressions,
        boundariesUnverified,
        receiptsVerified,
        screenshotFilesVerified,
        receiptDigests: {
          baseline: baselineReceipt.digest || null,
          candidate: candidateReceipt.digest || null,
        },
        modelBacked: modelEvidence.verified,
        modelEvidence,
      });
    }
    const totals = suites.reduce(
      (summary, suite) => ({
        knownDefects: summary.knownDefects + suite.knownDefects,
        defectsDetected: summary.defectsDetected + (suite.defectsDetected || 0),
        repairsResolved: summary.repairsResolved + (suite.repairsResolved || 0),
        invariantsPreserved:
          summary.invariantsPreserved + (suite.invariantsPreserved || 0),
        regressions: summary.regressions + (suite.regressions || 0),
        boundariesUnverified:
          summary.boundariesUnverified + (suite.boundariesUnverified || 0),
        receiptsVerified:
          summary.receiptsVerified + (suite.receiptsVerified || 0),
        screenshotFilesVerified:
          summary.screenshotFilesVerified +
          (suite.screenshotFilesVerified || 0),
        modelRunsVerified:
          summary.modelRunsVerified + (suite.modelEvidence?.runsVerified || 0),
        riskHypothesesVerified:
          summary.riskHypothesesVerified +
          (suite.modelEvidence?.riskHypothesesVerified || 0),
        advisoriesVerified:
          summary.advisoriesVerified +
          (suite.modelEvidence?.advisoriesVerified || 0),
        modelTokensVerified:
          summary.modelTokensVerified +
          (suite.modelEvidence?.tokensVerified || 0),
        modelDurationMsVerified:
          summary.modelDurationMsVerified +
          (suite.modelEvidence?.durationMsVerified || 0),
      }),
      {
        knownDefects: 0,
        defectsDetected: 0,
        repairsResolved: 0,
        invariantsPreserved: 0,
        regressions: 0,
        boundariesUnverified: 0,
        receiptsVerified: 0,
        screenshotFilesVerified: 0,
        modelRunsVerified: 0,
        riskHypothesesVerified: 0,
        advisoriesVerified: 0,
        modelTokensVerified: 0,
        modelDurationMsVerified: 0,
      },
    );
    const complete =
      definitions.length > 0 &&
      suites.length === definitions.length &&
      suites.every((suite) => suite.verified && suite.modelEvidence.verified);
    const release = {
      version: packageMetadata.version,
      source: `${sourceRepository}/releases/tag/v${packageMetadata.version}`,
      commit: normalizedSourceCommit,
      commitSource: normalizedSourceCommit
        ? `${sourceRepository}/commit/${normalizedSourceCommit}`
        : null,
      archiveSha256: normalizedSourceArchiveSha256,
      archiveSource: normalizedSourceArchiveSha256
        ? `${sourceRepository}/releases/download/v${packageMetadata.version}/release-witness-publication-ready-v${packageMetadata.version}-r1.tar.gz`
        : null,
    };
    const certification = {
      complete,
      suites: suites.map(
        ({
          id,
          verified,
          pairId,
          baselineId,
          candidateId,
          knownDefects,
          defectsDetected,
          repairsResolved,
          invariantsPreserved,
          regressions,
          boundariesUnverified,
          receiptsVerified,
          screenshotFilesVerified,
          receiptDigests,
          modelEvidence,
        }) => ({
          id,
          verified,
          pairId,
          baselineId,
          candidateId,
          knownDefects,
          defectsDetected,
          repairsResolved,
          invariantsPreserved,
          regressions,
          boundariesUnverified,
          receiptsVerified,
          screenshotFilesVerified,
          receiptDigests,
          modelEvidence,
        }),
      ),
      totals,
    };
    return {
      ...certification,
      release,
      generatedAt: new Date().toISOString(),
      suites,
      attestation: attestBenchmark(certification, release),
    };
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  }
  function reply(res, code, data, type = "application/json") {
    res.writeHead(code, {
      "Content-Type": type,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy":
        "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'",
    });
    res.end(type === "application/json" ? JSON.stringify(data) : data);
  }
  const assets = new Map([
    ["/", "index.html"],
    ["/app.js", "app.js"],
    ["/style.css", "style.css"],
    ["/fixture", "fixture.html"],
    ["/fixture.js", "fixture.js"],
    ["/booking", "booking.html"],
    ["/booking.js", "booking.js"],
    [
      "/assets/release-witness-cover-v1.jpg",
      "assets/release-witness-cover-v1.jpg",
    ],
  ]);
  const server = http.createServer(async (req, res) => {
    try {
      if (!allowedHosts.has(req.headers.host))
        return reply(res, 403, { error: "Host is not allowed." });
      const url = new URL(req.url, origin);
      if (req.method === "POST") {
        if (
          ![origin, `http://localhost:${port}`, reportOrigin].includes(
            req.headers.origin,
          ) ||
          !req.headers["content-type"]?.startsWith("application/json")
        )
          return reply(res, 403, { error: "Same-origin JSON required." });
        if (!["/api/runs", "/api/pairs"].includes(url.pathname))
          return reply(res, 404, { error: "Not found." });
        if (busy)
          return reply(res, 409, {
            error: "A check is already running. Please wait.",
          });
        let body = "";
        for await (const chunk of req) {
          body += chunk;
          if (body.length > 2048)
            return reply(res, 413, { error: "Request too large." });
        }
        let input;
        try {
          input = JSON.parse(body);
        } catch {
          return reply(res, 400, { error: "Invalid JSON." });
        }
        const manifest = manifests.get(input.suite);
        const paired = url.pathname === "/api/pairs";
        const build = paired
          ? undefined
          : manifest?.builds.find((item) => item.id === input.build);
        if (
          !manifest ||
          (!paired && !build) ||
          typeof input.analyze !== "boolean"
        )
          return reply(res, 400, {
            error: paired
              ? "Choose an included suite and analysis mode."
              : "Choose an included suite, build and analysis mode.",
          });
        if (
          input.change !== undefined &&
          (typeof input.change !== "string" || input.change.length > 600)
        )
          return reply(res, 400, {
            error: "Change description must be at most 600 characters.",
          });
        if (busy)
          return reply(res, 409, {
            error: "A check is already running. Please wait.",
          });
        if (input.analyze && publicDemo)
          return reply(res, 400, {
            error: "Model calls are disabled in public demo mode.",
          });
        const requiredCalls = paired ? 4 : 2;
        if (
          input.analyze &&
          (await modelAllowance(directory)).remaining < requiredCalls
        )
          return reply(res, 400, {
            error: `${requiredCalls === 4 ? "Four" : "Two"} model calls are required. Run browser checks without Nemotron or review the allowance.`,
          });
        busy = true;
        if (paired) {
          const pair = {
            id: randomUUID(),
            suite: manifest.id,
            change: input.change?.trim() || manifest.defaultChange,
            analyze: input.analyze,
            builds: manifest.builds.map(({ id }) => id),
            state: "running",
            step: "baseline",
            createdAt: new Date().toISOString(),
          };
          try {
            await savePair(pair);
          } catch (error) {
            busy = false;
            throw error;
          }
          reply(res, 202, pair);
          executePair(pair, manifest, input).catch((error) =>
            console.error("Pair persistence failed:", error.code || error.name),
          );
          return;
        }
        const run = newRun(manifest, build, input);
        try {
          await save(run);
        } catch (error) {
          busy = false;
          throw error;
        }
        reply(res, 202, run);
        executeRun(run, manifest, input.analyze)
          .finally(() => {
            busy = false;
          })
          .catch((error) =>
            console.error("Run persistence failed:", error.code || error.name),
          );
        return;
      }
      if (req.method !== "GET")
        return reply(res, 405, { error: "Method not allowed." });
      if (url.pathname === "/api/runs")
        return reply(
          res,
          200,
          [...runs.values()].sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
          ),
        );
      if (url.pathname === "/api/catalog")
        return reply(res, 200, publicCatalog(manifests));
      if (url.pathname === "/api/benchmark")
        return reply(res, 200, await benchmarkSummary());
      if (url.pathname === "/api/benchmark/report") {
        const benchmark = await benchmarkSummary();
        const metric = (value, label, ariaLabel = `${label}: ${value}`) =>
          `<div class="benchmark-metric" aria-label="${escapeHtml(ariaLabel)}"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
        const modelDuration = (durationMs) =>
          durationMs >= 1000
            ? `${(durationMs / 1000).toFixed(2)} s`
            : `${durationMs} ms`;
        const suiteCards = benchmark.suites
          .map((suite) => {
            const model = suite.modelEvidence;
            const comparisonUrl = suite.route
              ? `${reportOrigin}/${suite.route}`
              : "";
            return `<article class="benchmark-suite-card" data-suite-id="${escapeHtml(suite.id)}" data-pair-id="${escapeHtml(suite.pairId || "")}">
  <header><div><span class="eyebrow">WORKFLOW EVIDENCE</span><h3>${escapeHtml(suite.name)}</h3></div><span class="certification-chip ${suite.verified ? "verified" : "invalid"}">${suite.verified ? "Verified" : "Not verified"}</span></header>
  <p class="suite-reason">${escapeHtml(suite.reason)}</p>
  <dl class="evidence-identifiers">
    <div><dt>Pair</dt><dd><code>${escapeHtml(suite.pairId || "Unavailable")}</code></dd></div>
    <div><dt>Baseline</dt><dd><code>${escapeHtml(suite.baselineId || "Unavailable")}</code></dd></div>
    <div><dt>Candidate</dt><dd><code>${escapeHtml(suite.candidateId || "Unavailable")}</code></dd></div>
  </dl>
  <div class="suite-metrics">
    ${metric(`${suite.defectsDetected || 0}/${suite.knownDefects}`, "defects detected")}
    ${metric(`${suite.repairsResolved || 0}/${suite.knownDefects}`, "repairs resolved")}
    ${metric(suite.invariantsPreserved || 0, "invariants preserved")}
    ${metric(suite.regressions || 0, "regressions")}
    ${metric(`${suite.receiptsVerified || 0}/2`, "run receipts")}
    ${metric(suite.screenshotFilesVerified || 0, "screenshots")}
  </div>
  <section class="receipt-digests" aria-label="Run receipt digests">
    <div><span>Baseline receipt</span><code>SHA-256 ${escapeHtml(suite.receiptDigests?.baseline || "Unavailable")}</code></div>
    <div><span>Candidate receipt</span><code>SHA-256 ${escapeHtml(suite.receiptDigests?.candidate || "Unavailable")}</code></div>
  </section>
  <section class="suite-model-proof ${model?.verified ? "verified" : "unused"}" aria-label="Model evidence">
    <span class="eyebrow">${model?.verified ? "VERIFIED MODEL EVIDENCE" : "MODEL ROLE"}</span>
    <p>${escapeHtml(model?.reason || "Model evidence is unavailable.")}</p>
    ${
      model?.verified
        ? `<div class="model-proof-facts"><span>${model.runsVerified} runs</span><span>${model.riskHypothesesVerified} hypotheses</span><span>${model.advisoriesVerified} advisories</span><span>${Number(model.tokensVerified).toLocaleString()} tokens</span><span>${modelDuration(model.durationMsVerified)} model time</span></div><p class="fine-print">${escapeHtml(model.model)} via ${escapeHtml(model.provider)}</p>`
        : ""
    }
  </section>
  ${comparisonUrl ? `<a class="comparison-link" href="${escapeHtml(comparisonUrl)}">Open ${escapeHtml(suite.name)} comparison →</a>` : ""}
</article>`;
          })
          .join("");
        return reply(
          res,
          200,
          `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Server-verified Release Witness benchmark evidence"><title>Release Witness benchmark verification</title><link rel="stylesheet" href="/style.css"></head><body class="benchmark-report-page"><div class="benchmark-report-shell"><a class="report-back" href="/">← Back to Release Witness</a><header class="benchmark-report-hero"><div class="report-provenance"><a href="${escapeHtml(benchmark.release.source)}" target="_blank" rel="noopener">Release ${escapeHtml(benchmark.release.version)} source ↗</a>${benchmark.release.commitSource ? `<a href="${escapeHtml(benchmark.release.commitSource)}" target="_blank" rel="noopener">Commit ${escapeHtml(benchmark.release.commit.slice(0, 8))} ↗</a>` : ""}${benchmark.release.archiveSource ? `<a href="${escapeHtml(benchmark.release.archiveSource)}">Source archive ↗</a>` : ""}<span class="certification-status ${benchmark.complete ? "verified" : "invalid"}" data-status="${benchmark.complete ? "certified" : "not-certified"}">Portfolio certified: ${benchmark.complete ? "yes" : "no"}</span></div><p class="eyebrow">SERVER-VERIFIED BENCHMARK</p><h1>Evidence a judge can trace.</h1><p>The aggregate below is derived from manifest ground truth, durable pair identity, comparison states, four run receipts and every referenced screenshot.</p><div class="portfolio-receipt"><span>Portfolio receipt</span><code>SHA-256 ${escapeHtml(benchmark.attestation.digest)}</code><small>${escapeHtml(benchmark.attestation.scope)}</small>${benchmark.release.archiveSha256 ? `<small>Source archive SHA-256 ${escapeHtml(benchmark.release.archiveSha256)}</small>` : ""}</div></header><main class="benchmark-report"><section aria-labelledby="portfolio-summary"><div class="report-section-heading"><div><span class="eyebrow">CONTROLLED RESULT</span><h2 id="portfolio-summary">Verified portfolio</h2></div><p>Generated <time datetime="${escapeHtml(benchmark.generatedAt)}">${escapeHtml(benchmark.generatedAt)}</time></p></div><div class="benchmark-metrics">
${metric(`${benchmark.totals.defectsDetected}/${benchmark.totals.knownDefects}`, "defects detected", `Defects detected: ${benchmark.totals.defectsDetected}/${benchmark.totals.knownDefects}`)}
${metric(`${benchmark.totals.repairsResolved}/${benchmark.totals.knownDefects}`, "repairs resolved", `Repairs resolved: ${benchmark.totals.repairsResolved}/${benchmark.totals.knownDefects}`)}
${metric(benchmark.totals.invariantsPreserved, "invariants preserved", `Passing invariants preserved: ${benchmark.totals.invariantsPreserved}`)}
${metric(benchmark.totals.regressions, "regressions", `Regressions: ${benchmark.totals.regressions}`)}
${metric(benchmark.totals.boundariesUnverified, "boundaries unverified", `Unverified coverage boundaries: ${benchmark.totals.boundariesUnverified}`)}
${metric(benchmark.totals.receiptsVerified, "run receipts", `Run receipts verified: ${benchmark.totals.receiptsVerified}`)}
${metric(benchmark.totals.screenshotFilesVerified, "screenshots", `Screenshot files verified: ${benchmark.totals.screenshotFilesVerified}`)}
${metric(`${benchmark.suites.filter((suite) => suite.verified).length}/${benchmark.suites.length}`, "workflows verified", `Workflows verified: ${benchmark.suites.filter((suite) => suite.verified).length}/${benchmark.suites.length}`)}
</div></section><section class="benchmark-model-summary" aria-labelledby="model-summary"><div><span class="eyebrow">VERIFIED NEMOTRON CONTRIBUTION</span><h2 id="model-summary">The model work is part of the receipt.</h2><p>The benchmark verifies exact model and provider identity, complete check coverage, grounded hypotheses, allow-listed advice, recorded runtime totals and intact browser evidence.</p></div><div class="model-summary-metrics">
${metric(benchmark.totals.modelRunsVerified, "Nemotron runs verified", `Nemotron runs verified: ${benchmark.totals.modelRunsVerified}`)}
${metric(benchmark.totals.riskHypothesesVerified, "grounded hypotheses", `Grounded risk hypotheses verified: ${benchmark.totals.riskHypothesesVerified}`)}
${metric(benchmark.totals.advisoriesVerified, "allow-listed advisories", `Allow-listed advisories verified: ${benchmark.totals.advisoriesVerified}`)}
${metric(Number(benchmark.totals.modelTokensVerified).toLocaleString(), "verified model tokens", `Verified model tokens: ${benchmark.totals.modelTokensVerified}`)}
${metric(modelDuration(benchmark.totals.modelDurationMsVerified), "verified model time", `Verified model duration: ${modelDuration(benchmark.totals.modelDurationMsVerified)}`)}
</div></section><section aria-labelledby="workflow-evidence"><div class="report-section-heading"><div><span class="eyebrow">TRACEABLE ARTIFACTS</span><h2 id="workflow-evidence">Workflow evidence</h2></div><p>Each card links to the exact baseline-to-candidate comparison.</p></div><div class="benchmark-suite-grid">${suiteCards}</div></section><aside class="benchmark-boundary"><strong>Evidence boundary</strong><p>This receipt covers the controlled included scenarios. It is not a claim about all production defects or a third-party signature.</p></aside></main><footer class="benchmark-report-footer"><span>Release Witness · evidence before confidence</span><a href="/api/benchmark">Open machine-readable JSON →</a></footer></div></body></html>`,
          "text/html; charset=utf-8",
        );
      }
      if (url.pathname === "/api/status")
        return reply(res, 200, {
          busy,
          publicDemo,
          modelConfigured: Boolean(
            !publicDemo &&
            process.env.NEBIUS_API_KEY &&
            process.env.NEBIUS_INFERENCE_APPROVED === "true",
          ),
          modelAllowance: await modelAllowance(directory),
          model: process.env.NEBIUS_MODEL || "nvidia/Nemotron-3_5-Lightning",
          version: packageMetadata.version,
          releaseCommit: normalizedSourceCommit,
          releaseArchiveSha256: normalizedSourceArchiveSha256,
        });
      if (/^\/api\/pairs\/[a-f0-9-]+$/.test(url.pathname)) {
        const pair = pairs.get(url.pathname.split("/").pop());
        return reply(
          res,
          pair ? 200 : 404,
          pair || { error: "Pair not found." },
        );
      }
      if (url.pathname === "/api/compare") {
        const before = runs.get(url.searchParams.get("before")),
          after = runs.get(url.searchParams.get("after"));
        if (!before || !after)
          return reply(res, 404, { error: "Both saved runs are required." });
        try {
          const [beforeReceipt, afterReceipt] = await Promise.all([
            before.attestation ? verifyEvidence(before) : null,
            after.attestation ? verifyEvidence(after) : null,
          ]);
          return reply(res, 200, {
            before: before.id,
            after: after.id,
            changes: compareRuns(before, after),
            receipts: {
              before: beforeReceipt,
              after: afterReceipt,
            },
          });
        } catch (error) {
          return reply(res, 400, { error: error.message });
        }
      }
      const integrity = url.pathname.match(
        /^\/api\/runs\/([a-f0-9-]+)\/integrity$/,
      );
      if (integrity) {
        const run = runs.get(integrity[1]);
        if (!run) return reply(res, 404, { error: "Run not found." });
        return reply(res, 200, await verifyEvidence(run));
      }
      if (/^\/api\/runs\/[a-f0-9-]+\/(export|report)$/.test(url.pathname)) {
        const run = runs.get(url.pathname.split("/")[3]);
        if (!run) return reply(res, 404, { error: "Run not found." });
        const lines = [
          `# Release Witness report ${run.id}`,
          `Build: ${run.build} | Suite: ${run.suite} | Created: ${run.createdAt}`,
          `Outcome: ${verdict(run)}`,
          ...(run.attestation
            ? [`Evidence receipt: SHA-256 ${run.attestation.digest}`]
            : []),
          "",
          "Only the listed checks were executed. This is not an overall release approval.",
          "",
        ];
        for (const check of run.checks) {
          lines.push(
            `## ${check.title}: ${check.status}`,
            `Expected: ${check.expected}`,
            `Observed: ${check.observed}`,
            ...check.steps.map((step, i) => `${i + 1}. ${step}`),
            ...check.screenshots.map(
              (s) =>
                `Evidence: ${reportOrigin}${s.url}${s.sha256 ? ` | SHA-256 ${s.sha256}` : ""}`,
            ),
            "",
          );
        }
        lines.push(
          "## Advisory suggestion",
          run.analysis.state === "complete" && run.analysis.action
            ? run.analysis.text
            : `Unavailable: ${run.analysis.error || (run.analysis.state === "complete" ? "Historical advice predates the bounded action contract; see original JSON." : run.analysis.state)}`,
        );
        if (url.pathname.endsWith("/export"))
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="witness-${run.id}.md"`,
          );
        const reportText = lines.join("\n\n");
        if (url.pathname.endsWith("/report")) {
          return reply(
            res,
            200,
            `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Release Witness report</title><link rel="stylesheet" href="/style.css"><main><a href="/#${run.id}">Back to run</a><pre class="export-text">${escapeHtml(reportText)}</pre></main></html>`,
            "text/html; charset=utf-8",
          );
        }
        return reply(res, 200, reportText, "text/plain; charset=utf-8");
      }
      if (/^\/api\/runs\/[a-f0-9-]+$/.test(url.pathname)) {
        const run = runs.get(url.pathname.split("/").pop());
        return reply(res, run ? 200 : 404, run || { error: "Run not found." });
      }
      const evidence = url.pathname.match(
        /^\/evidence\/([a-f0-9-]+)\/[a-z][a-z0-9-]{1,48}-(before|after)\.png$/,
      );
      if (evidence) {
        if (!runs.has(evidence[1]))
          return reply(res, 404, { error: "Run not found." });
        const relative = url.pathname.slice("/evidence/".length);
        return reply(
          res,
          200,
          await readFile(new URL(relative, directory)),
          "image/png",
        );
      }
      if (assets.has(url.pathname)) {
        const file = assets.get(url.pathname);
        return reply(
          res,
          200,
          await readFile(new URL(`./public/${file}`, import.meta.url)),
          file.endsWith(".js")
            ? "text/javascript"
            : file.endsWith(".css")
              ? "text/css"
              : file.endsWith(".jpg")
                ? "image/jpeg"
                : "text/html",
        );
      }
      return reply(res, 404, { error: "Not found." });
    } catch (error) {
      reply(res, error.code === "ENOENT" ? 404 : 500, {
        error:
          error.code === "ENOENT"
            ? "Not found."
            : "Request could not be completed.",
      });
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  console.log(`Release Witness: ${reportOrigin}`);
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await startServer();
