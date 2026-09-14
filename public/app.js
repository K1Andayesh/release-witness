const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function routeState() {
  const [runId = "", baselineId = ""] = location.hash.slice(1).split("~", 2);
  return { runId, baselineId };
}
function routeHash(runId, baselineId = "") {
  return baselineId ? `${runId}~${baselineId}` : runId;
}
const initialRoute = routeState();
let selected = initialRoute.runId,
  all = [],
  catalog = [],
  submitting = false,
  connected = false,
  routeBaseline = initialRoute.baselineId,
  currentStatus = {},
  pairProgress = "";
const busy = (run) => ["planning", "running", "analyzing"].includes(run?.state);
const label = (status) =>
  status === "not-tested"
    ? "Not tested"
    : status[0].toUpperCase() + status.slice(1);
const planRisk = (run, checkId) =>
  run.plan?.risks?.find((risk) => risk.checkId === checkId)?.hypothesis;
async function api(path, options) {
  const response = await fetch(path, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
}
function currentRequest() {
  return {
    suite: $("#suite").value,
    change: $("#change").value,
    analyze: $("#analyze").checked,
  };
}
async function startRun(build, request = currentRequest()) {
  return api("/api/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      build,
      ...request,
    }),
  });
}
async function startPair(request) {
  return api("/api/pairs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}
async function waitForPair(id) {
  for (;;) {
    const pair = await api(`/api/pairs/${id}`);
    if (pair.state !== "running") return pair;
    pairProgress =
      pair.step === "candidate"
        ? "Running candidate (2 of 2)…"
        : "Running baseline (1 of 2)…";
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
}
function activeManifest() {
  return catalog.find((manifest) => manifest.id === $("#suite").value);
}
function syncSetup() {
  const manifest = activeManifest();
  if (!manifest) return;
  $("#build").innerHTML = manifest.builds
    .map(
      (build) =>
        `<option value="${esc(build.id)}">${esc(build.label)}</option>`,
    )
    .join("");
  $("#suite-question").textContent = manifest.question;
  $("#change").value = manifest.defaultChange;
  $("#scope-name").textContent = `${manifest.name} / ${manifest.id}`;
  $("#scope-checks").textContent =
    `${manifest.checks.length} browser checks · isolated Chrome`;
  $("#scope-coverage").textContent = `${manifest.coverage} excluded`;
  syncBuild();
}
function syncBuild() {
  const manifest = activeManifest();
  const build = manifest?.builds.find((item) => item.id === $("#build").value);
  if (build) $("#fixture-link").href = build.path;
}
$("#suite").addEventListener("change", syncSetup);
$("#build").addEventListener("change", syncBuild);
$("#run-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitting || all.some(busy)) return;
  submitting = true;
  $("#start").disabled = true;
  $("#run-message").textContent = "Starting isolated browser…";
  try {
    const run = await startRun($("#build").value, currentRequest());
    all = [run, ...all.filter((item) => item.id !== run.id)];
    selected = run.id;
    routeBaseline = "";
    location.hash = selected;
    await refresh();
  } catch (error) {
    $("#run-message").textContent = error.message;
  } finally {
    submitting = false;
    $("#start").disabled = all.some(busy);
    $("#run-pair").disabled = all.some(busy);
  }
});
$("#run-pair").addEventListener("click", async () => {
  if (submitting || all.some(busy)) return;
  const builds = activeManifest()?.builds || [];
  if (builds.length < 2) {
    $("#run-message").textContent =
      "This workflow needs both a baseline and candidate build.";
    return;
  }
  if (
    $("#analyze").checked &&
    (currentStatus.modelAllowance?.remaining ?? 0) < 4
  ) {
    $("#run-message").textContent =
      "Four model calls are required for a model-backed pair. Turn off Nemotron to run the browser pair.";
    return;
  }
  submitting = true;
  $("#start").disabled = true;
  $("#run-pair").disabled = true;
  try {
    pairProgress = `Running baseline (1 of 2)…`;
    $("#run-message").textContent = pairProgress;
    const pair = await startPair(currentRequest());
    const result = await waitForPair(pair.id);
    if (result.state !== "complete")
      throw new Error(result.error || "The paired review was interrupted.");
    selected = result.candidateId;
    routeBaseline = result.baselineId;
    location.hash = routeHash(result.candidateId, result.baselineId);
    pairProgress = "Pair complete. Opening the release comparison.";
    await refresh();
    render();
    document.querySelector(".results")?.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    pairProgress = error.message;
    $("#run-message").textContent = pairProgress;
  } finally {
    submitting = false;
    setTimeout(() => {
      pairProgress = "";
    }, 4000);
    $("#start").disabled = all.some(busy);
    $("#run-pair").disabled = all.some(busy);
  }
});
$("#judge-tour").addEventListener("click", () => {
  const booking = all
    .filter((run) => run.suite === "booking-v1" && run.state === "complete")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const candidate =
    booking.find(
      (run) =>
        run.build === "candidate" &&
        run.plan?.state === "complete" &&
        run.analysis?.state === "complete",
    ) || booking.find((run) => run.build === "candidate");
  const baseline = booking.find(
    (run) =>
      run.build === "baseline" &&
      (!candidate || run.createdAt < candidate.createdAt),
  );
  if (!candidate || !baseline) {
    $("#run-message").textContent =
      "The guided comparison needs one completed baseline and candidate run.";
    return;
  }
  routeBaseline = baseline.id;
  const targetHash = routeHash(candidate.id, baseline.id);
  const changedRun = location.hash.slice(1) !== targetHash;
  selected = candidate.id;
  if (changedRun) location.hash = targetHash;
  else render();
  document.querySelector(".results")?.scrollIntoView({ behavior: "smooth" });
});
window.addEventListener("hashchange", () => {
  const route = routeState();
  selected = route.runId;
  routeBaseline = route.baselineId;
  render();
});
function render() {
  $("#history").innerHTML = all.length
    ? all
        .map(
          (run) =>
            `<button class="history-item ${run.id === selected ? "selected" : ""}" data-run="${run.id}"><span><strong>${esc(run.buildLabel || (run.build === "fixed" ? "Repaired build" : "Seeded defect"))}</strong><small>${esc(run.targetName || "Fieldnotes")} · ${new Date(run.createdAt).toLocaleString()}</small></span><span class="history-state">${busy(run) ? "Running" : run.state === "interrupted" ? "Interrupted" : run.checks.some((c) => c.status === "fail") ? "Issue found" : "Reviewed"} →</span></button>`,
        )
        .join("")
    : '<p class="muted">Your runs will appear here.</p>';
  document.querySelectorAll("[data-run]").forEach(
    (button) =>
      (button.onclick = () => {
        routeBaseline = "";
        location.hash = button.dataset.run;
      }),
  );
  const run = all.find((item) => item.id === selected);
  if (!run) {
    if (selected)
      $("#report").innerHTML =
        '<div class="empty-state"><h2>Run not found</h2><p>Choose a saved run or start a new check.</p></div>';
    return;
  }
  const count = (status) =>
    run.checks.filter((c) => c.status === status).length;
  const failure = count("fail") > 0;
  const verdict = busy(run)
    ? run.state === "planning"
      ? "Prioritizing the checks…"
      : run.state === "analyzing"
        ? "Interpreting the evidence…"
        : "Watching the workflow…"
    : run.state === "interrupted"
      ? "Run interrupted"
      : failure
        ? "A release concern, with evidence."
        : run.checks
              .filter((check) => check.id !== "coverage")
              .some((check) => check.status !== "pass")
          ? "The run needs more evidence."
          : "The checked workflows passed.";
  const analysis = run.analysis;
  $("#report").innerHTML =
    `<div class="report-heading"><p class="eyebrow">02 / WITNESS REPORT <span>${esc(run.id.slice(0, 8))}</span></p><h2>${verdict}</h2><p class="muted">${esc(run.targetName || "Fieldnotes")} · ${esc(run.buildLabel || run.build)} <span> / ${esc(run.suite)} / ${esc(new Date(run.createdAt).toLocaleTimeString())}</span></p></div>
  ${run.error ? `<p class="error">${esc(run.error)}</p>` : ""}<div class="metrics"><div><strong class="pass">${count("pass")}</strong><span>Passed</span></div><div><strong class="fail">${count("fail")}</strong><span>Failed</span></div><div><strong>${count("not-tested")}</strong><span>Not tested</span></div><div><strong>${run.checks.reduce((n, c) => n + c.screenshots.length, 0)}</strong><span>Screenshots</span></div></div>
  ${run.attestation ? `<section class="receipt" id="integrity-result"><div><strong>VERIFYING EVIDENCE RECEIPT…</strong><span>Checking the saved report and every screenshot.</span></div><code>SHA-256 ${esc(run.attestation.digest.slice(0, 16))}…</code></section>` : ""}
  ${run.plan ? `<section class="plan"><div class="plan-title"><p class="eyebrow">${run.plan.state === "complete" ? "NEMOTRON RISK MAP" : "STANDARD RISK MAP"}</p>${run.plan.state === "complete" ? '<span class="model-proof">LIVE MODEL RECORD</span>' : ""}</div><p>${esc(run.plan.order.join(" → "))}</p><p class="fine-print">Change under review: ${esc(run.change || "Not recorded")}</p><p class="muted">${esc(run.plan.reason)}</p>${run.plan.error ? `<p class="error">${esc(run.plan.error)}</p>` : ""}${run.plan.state === "complete" ? `<p class="model-meta">${esc(run.plan.returnedModel || run.plan.model)} via ${esc(run.plan.provider)} · ${(run.plan.durationMs / 1000).toFixed(1)}s · ${run.plan.usage?.total_tokens ?? "Unknown"} tokens</p>` : ""}<p class="fine-print">Every reviewed check still runs. The model maps change risk; browser assertions determine results.</p></section>` : ""}
  <div class="checklist">${run.checks.map((c) => `<details id="check-${c.id}" class="check" ${c.status === "fail" ? "open" : ""}><summary><span class="status-symbol ${c.status}">${c.status === "pass" ? "✓" : c.status === "fail" ? "!" : "–"}</span><span class="check-name"><strong>${esc(c.title)}</strong><small>${esc(c.id)} ${c.durationMs ? `· ${(c.durationMs / 1000).toFixed(1)}s` : ""}</small></span><span class="badge ${c.status}">${label(c.status)}</span><span class="chevron">⌄</span></summary><div class="check-body">${planRisk(run, c.id) ? `<div class="risk-hypothesis"><span class="eyebrow">CHANGE RISK</span><p>${esc(planRisk(run, c.id))}</p></div>` : ""}<div class="observations"><div><span class="eyebrow">EXPECTED</span><p>${esc(c.expected)}</p></div><div><span class="eyebrow">OBSERVED</span><p>${esc(c.observed)}</p></div></div>${c.steps.length ? `<h3>Reproduce this check</h3><ol>${c.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}<div class="shots">${c.screenshots.map((s) => `<a href="${s.url}" target="_blank" rel="noopener"><img src="${s.url}" alt="${esc(c.title)} — ${s.label}" loading="lazy"><span>${s.label} ↗</span></a>`).join("")}</div>${c.logs.length ? `<h3>Browser errors</h3><pre>${esc(c.logs.join("\n"))}</pre>` : ""}</div></details>`).join("")}</div>
  <section class="interpretation"><div class="section-label"><span>03 / MODEL INTERPRETATION</span><span class="tag">ADVISORY</span></div><h3>Suggested next check</h3>${analysis.state === "complete" ? `<p class="model-text">${esc(analysis.action ? analysis.text : "Historical model wording is retained in the JSON export; it predates the bounded action contract.")}</p><p class="fine-print">Evidence: ${esc((analysis.evidenceIds || []).join(", ") || "See recorded checks")}</p><p class="model-meta">${esc(analysis.model)} via Nebius · ${(analysis.durationMs / 1000).toFixed(1)}s · ${analysis.usage?.total_tokens ?? "Unknown"} tokens</p>` : analysis.state === "failed" ? `<p class="error">${esc(analysis.error)}</p>` : `<p class="muted">${analysis.state === "skipped" ? "Model interpretation was not requested. The browser results stand on their own." : "Nemotron will interpret the observations after the browser checks finish."}</p>`}<p class="fine-print">Model suggestions are not executed checks and do not change the results above.</p></section>
  <section class="comparison"><label for="baseline">Compare with an earlier run</label><select id="baseline"><option value="">Choose a baseline…</option>${all
    .filter(
      (r) =>
        r.id !== run.id &&
        r.state === "complete" &&
        r.suite === run.suite &&
        r.createdAt < run.createdAt,
    )
    .map(
      (r) =>
        `<option value="${r.id}">${esc(r.buildLabel || r.build)} · ${esc(new Date(r.createdAt).toLocaleString())} · ${r.id.slice(0, 8)}</option>`,
    )
    .join(
      "",
    )}</select><div id="comparison-result" role="status"></div></section>
  <div class="report-actions"><a href="/api/runs/${run.id}/report" target="_blank" rel="noopener">View report ↗</a><a href="/api/runs/${run.id}/export" download>Download report</a><a href="/api/runs/${run.id}" target="_blank" rel="noopener">Open JSON ↗</a><span>${busy(run) ? "Evidence is being captured." : "Saved locally · available after reload"}</span></div>`;
  $("#baseline").disabled = run.state !== "complete";
  $("#baseline").onchange = async () => {
    const target = $("#comparison-result");
    const baselineId = $("#baseline").value;
    routeBaseline = baselineId;
    const nextHash = routeHash(run.id, baselineId);
    if (location.hash.slice(1) !== nextHash)
      history.replaceState(null, "", `#${nextHash}`);
    if (!baselineId) {
      target.replaceChildren();
      return;
    }
    try {
      const diff = await api(
        `/api/compare?before=${baselineId}&after=${run.id}`,
      );
      const total = (change) =>
        diff.changes.filter((item) => item.change === change).length;
      target.innerHTML = `<div class="comparison-callout"><strong>${total("resolved")} concerns resolved</strong><span>${total("regression")} regressions · ${total("unchanged")} unchanged · ${total("unverified")} unverified</span></div><table><thead><tr><th>Check</th><th>Before</th><th>Now</th><th>Change</th></tr></thead><tbody>${diff.changes.map((c) => `<tr><td>${esc(c.title)}</td><td>${esc(c.before)}</td><td>${esc(c.after)}</td><td>${esc(c.change)}</td></tr>`).join("")}</tbody></table><p class="fine-print">Only matching checks are comparable. Untested coverage stays unverified.</p>`;
    } catch (error) {
      target.textContent = error.message;
    }
  };
  const preferredBaseline = routeBaseline || run.comparisonBaselineId;
  if (
    preferredBaseline &&
    [...$("#baseline").options].some(
      (option) => option.value === preferredBaseline,
    )
  ) {
    $("#baseline").value = preferredBaseline;
    $("#baseline").dispatchEvent(new Event("change"));
  }
  if (run.attestation) verifyReceipt(run);
}
async function verifyReceipt(run) {
  let result;
  try {
    result = await api(`/api/runs/${run.id}/integrity`);
  } catch (error) {
    result = { verified: false, reason: error.message };
  }
  if (selected !== run.id) return;
  const target = $("#integrity-result");
  if (!target) return;
  target.innerHTML = result.verified
    ? `<div><strong>✓ VERIFIED EVIDENCE RECEIPT</strong><span>${result.fileCount} screenshots and the report match their recorded SHA-256 hashes.</span></div><code>SHA-256 ${esc(result.digest.slice(0, 16))}…</code>`
    : `<div><strong class="fail">RECEIPT CHECK FAILED</strong><span>${esc(result.reason)}</span></div>`;
}
let signature = "";
async function refresh() {
  try {
    const [runs, status, manifests] = await Promise.all([
      api("/api/runs"),
      api("/api/status"),
      catalog.length ? Promise.resolve(catalog) : api("/api/catalog"),
    ]);
    all = runs;
    currentStatus = status;
    if (!catalog.length) {
      catalog = manifests;
      $("#suite").innerHTML = catalog
        .map(
          (manifest) =>
            `<option value="${esc(manifest.id)}">${esc(manifest.name)}</option>`,
        )
        .join("");
      syncSetup();
    }
    connected = true;
    $("#connection").textContent = status.publicDemo
      ? "● Public demo connected"
      : "● Local runner connected";
    $("#environment-tag").textContent = status.publicDemo
      ? "PUBLIC DEMO"
      : "LOCAL PREVIEW";
    $("#connection").classList.remove("offline");
    const calls = status.modelAllowance?.remaining ?? 0;
    const limit = status.modelAllowance?.limit ?? 10;
    const canAnalyze = status.modelConfigured && calls >= 2;
    $("#analyze").disabled = !canAnalyze;
    if (!canAnalyze) $("#analyze").checked = false;
    $("#model-note").textContent = canAnalyze
      ? `Two bounded calls · ${calls} of ${limit} remaining`
      : status.publicDemo
        ? "Live calls disabled · judge tour includes verified model records"
        : status.modelConfigured
          ? `${calls} of ${limit} calls remain · browser-only runs available`
          : "Model access unavailable · browser-only runs available";
    $("#start").disabled = submitting || status.busy;
    $("#run-pair").disabled = submitting || status.busy;
    if (!selected && all.length) {
      selected = all[0].id;
      routeBaseline = "";
      history.replaceState(null, "", `#${selected}`);
    }
    const next = JSON.stringify(all);
    if (next !== signature) {
      signature = next;
      render();
    }
    $("#run-message").textContent = pairProgress
      ? pairProgress
      : status.busy
        ? "Run in progress. Results are saved as checks finish."
        : status.publicDemo
          ? "Ready. Only the selected included demo build will be checked."
          : "Ready. Only the selected local preview will be checked.";
  } catch (error) {
    connected = false;
    $("#connection").textContent = "● Runner disconnected";
    $("#connection").classList.add("offline");
    $("#run-message").textContent =
      "Cannot reach the local server. Start it with npm start.";
    $("#start").disabled = true;
    $("#run-pair").disabled = true;
  }
}
await refresh();
setInterval(refresh, 1500);
