import http from "node:http";
import { readFile, writeFile, mkdir, rename, readdir } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import { runChecks } from "./lib/runner.mjs";
import {
  attestRun,
  compareRuns,
  verifyAttestation,
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
  directory = new URL("./artifacts/runs/", import.meta.url),
  runnerOptions = {},
} = {}) {
  const packageMetadata = JSON.parse(
    await readFile(new URL("./package.json", import.meta.url), "utf8"),
  );
  const origin = `http://127.0.0.1:${port}`;
  const reportOrigin = publicBaseUrl ? new URL(publicBaseUrl).origin : origin;
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
          const escaped = reportText.replace(
            /[&<>]/g,
            (character) =>
              ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character],
          );
          return reply(
            res,
            200,
            `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Release Witness report</title><link rel="stylesheet" href="/style.css"><main><a href="/#${run.id}">Back to run</a><pre class="export-text">${escaped}</pre></main></html>`,
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
