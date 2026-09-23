import { createHash } from "node:crypto";

function legacyAttestationPayload(run) {
  return {
    id: run.id,
    suite: run.suite,
    build: run.build,
    pairId: run.pairId,
    pairPosition: run.pairPosition,
    comparisonBaselineId: run.comparisonBaselineId,
    change: run.change,
    checks: run.checks.map((check) => ({
      id: check.id,
      status: check.status,
      expected: check.expected,
      observed: check.observed,
      screenshots: check.screenshots.map(({ label, url, sha256 }) => ({
        label,
        url,
        sha256,
      })),
    })),
    plan: {
      state: run.plan?.state,
      order: run.plan?.order,
      risks: run.plan?.risks,
      model: run.plan?.returnedModel || run.plan?.model,
    },
    analysis: {
      state: run.analysis?.state,
      action: run.analysis?.action,
      evidenceIds: run.analysis?.evidenceIds,
      model: run.analysis?.returnedModel || run.analysis?.model,
    },
  };
}

function attestationPayload(run) {
  const payload = legacyAttestationPayload(run);
  payload.plan = {
    ...payload.plan,
    provider: run.plan?.provider,
    durationMs: run.plan?.durationMs,
    totalTokens: run.plan?.usage?.total_tokens,
  };
  payload.analysis = {
    ...payload.analysis,
    provider: run.analysis?.provider,
    durationMs: run.analysis?.durationMs,
    totalTokens: run.analysis?.usage?.total_tokens,
  };
  return payload;
}

function fullRunAttestationPayload(run) {
  const { attestation, ...payload } = run;
  return payload;
}

export function attestRun(run) {
  return {
    schema: "run-v3",
    algorithm: "SHA-256",
    digest: createHash("sha256")
      .update(JSON.stringify(fullRunAttestationPayload(run)))
      .digest("hex"),
    scope:
      "Full saved run record except this receipt, including model and browser evidence",
  };
}

export function attestBenchmark(certification, release) {
  return {
    algorithm: "SHA-256",
    digest: createHash("sha256")
      .update(JSON.stringify({ ...certification, release }))
      .digest("hex"),
    scope:
      "Benchmark ground truth, pair identities, comparison totals, verified model contribution, run receipts, exact release source, commit and source archive hash",
  };
}

export function verifyAttestation(run) {
  const payload =
    run.attestation?.schema === "run-v3"
      ? fullRunAttestationPayload(run)
      : run.attestation?.schema === "run-v2"
        ? attestationPayload(run)
        : legacyAttestationPayload(run);
  return (
    run.attestation?.algorithm === "SHA-256" &&
    run.attestation.digest ===
      createHash("sha256").update(JSON.stringify(payload)).digest("hex")
  );
}

export function verdict(run) {
  if (["planning", "running", "analyzing"].includes(run.state))
    return "running";
  if (run.state !== "complete") return "interrupted";
  if (run.checks.some((check) => check.status === "fail")) return "concern";
  if (
    run.checks
      .filter((check) => check.id !== "coverage")
      .some((check) => check.status !== "pass")
  )
    return "incomplete";
  return "checked-pass";
}

export function compareRuns(before, after) {
  if (
    before.id === after.id ||
    before.suite !== after.suite ||
    before.state !== "complete" ||
    after.state !== "complete"
  ) {
    throw new Error("Choose two different completed runs of the same suite.");
  }
  return before.checks.map((old) => {
    const current = after.checks.find((check) => check.id === old.id);
    let change = "unchanged";
    if (
      !current ||
      old.status === "not-tested" ||
      current.status === "not-tested"
    )
      change = "unverified";
    else if (old.status === "fail" && current.status === "pass")
      change = "resolved";
    else if (old.status === "pass" && current.status === "fail")
      change = "regression";
    else if (current.status === "fail") change = "still-failing";
    return {
      id: old.id,
      title: old.title,
      before: old.status,
      after: current?.status || "not-tested",
      change,
      beforeObserved: old.observed || "No observation was recorded.",
      afterObserved: current?.observed || "No observation was recorded.",
      beforeScreenshots: old.screenshots || [],
      afterScreenshots: current?.screenshots || [],
    };
  });
}

export function verifyPairRelationship(manifest, pair, baseline, candidate) {
  const benchmark = manifest?.benchmark;
  return Boolean(
    benchmark &&
    pair?.state === "complete" &&
    pair.suite === manifest.id &&
    Array.isArray(pair.builds) &&
    pair.builds.length === 2 &&
    pair.builds[0] === benchmark.baselineBuild &&
    pair.builds[1] === benchmark.candidateBuild &&
    pair.baselineId === baseline?.id &&
    pair.candidateId === candidate?.id &&
    baseline?.suite === manifest.id &&
    candidate?.suite === manifest.id &&
    baseline.build === benchmark.baselineBuild &&
    candidate.build === benchmark.candidateBuild &&
    baseline.state === "complete" &&
    candidate.state === "complete" &&
    baseline.pairId === pair.id &&
    candidate.pairId === pair.id &&
    baseline.pairPosition === "baseline" &&
    candidate.pairPosition === "candidate" &&
    candidate.comparisonBaselineId === baseline.id,
  );
}

export function measureModelContribution(
  manifest,
  modelRuns,
  receiptsVerified,
) {
  const expectedIds = manifest.checks.map((check) => check.id);
  const evidenceIds = new Set([...expectedIds, "coverage"]);
  const requiredModel = "nvidia/Nemotron-3_5-Lightning";
  const requiredProvider = "Nebius Token Factory";
  const inspected = modelRuns.map((run) => {
    let planGrounded = false;
    try {
      validatePlan(
        {
          order: run.plan?.order,
          reason: run.plan?.reason,
          risks: run.plan?.risks,
        },
        expectedIds,
      );
      planGrounded = true;
    } catch {}
    const adviceEvidence = run.analysis?.evidenceIds;
    const adviceGrounded =
      run.analysis?.state === "complete" &&
      ["repeat-check", "expand-coverage"].includes(run.analysis?.action) &&
      Array.isArray(adviceEvidence) &&
      adviceEvidence.length === 1 &&
      evidenceIds.has(adviceEvidence[0]) &&
      (run.analysis.action === "expand-coverage") ===
        (adviceEvidence[0] === "coverage");
    const identityVerified =
      run.plan?.model === requiredModel &&
      run.plan?.returnedModel === requiredModel &&
      run.plan?.httpStatus === 200 &&
      run.plan?.finishReason === "stop" &&
      run.analysis?.model === requiredModel &&
      run.analysis?.returnedModel === requiredModel &&
      run.analysis?.httpStatus === 200 &&
      run.analysis?.finishReason === "stop" &&
      run.plan?.provider === requiredProvider &&
      run.analysis?.provider === requiredProvider;
    const runtimeMeasured =
      Number.isFinite(run.plan?.usage?.total_tokens) &&
      run.plan.usage.total_tokens > 0 &&
      Number.isFinite(run.analysis?.usage?.total_tokens) &&
      run.analysis.usage.total_tokens > 0 &&
      Number.isFinite(run.plan?.durationMs) &&
      run.plan.durationMs >= 0 &&
      Number.isFinite(run.analysis?.durationMs) &&
      run.analysis.durationMs >= 0;
    const numeric = (value) =>
      Number.isFinite(value) && value >= 0 ? value : 0;
    return {
      verified:
        run.state === "complete" &&
        run.plan?.state === "complete" &&
        planGrounded &&
        adviceGrounded &&
        identityVerified &&
        runtimeMeasured,
      riskHypotheses: planGrounded ? run.plan.risks.length : 0,
      advisories: adviceGrounded ? 1 : 0,
      tokens:
        numeric(run.plan?.usage?.total_tokens) +
        numeric(run.analysis?.usage?.total_tokens),
      durationMs:
        numeric(run.plan?.durationMs) + numeric(run.analysis?.durationMs),
    };
  });
  const receiptsComplete = receiptsVerified === modelRuns.length;
  const receiptsCoverRuntime = modelRuns.every(
    (run) => run.attestation?.schema === "run-v3",
  );
  const verified =
    modelRuns.length === 2 &&
    receiptsComplete &&
    receiptsCoverRuntime &&
    inspected.every((run) => run.verified);
  const totals = inspected.reduce(
    (summary, run) => ({
      riskHypotheses: summary.riskHypotheses + run.riskHypotheses,
      advisories: summary.advisories + run.advisories,
      tokens: summary.tokens + run.tokens,
      durationMs: summary.durationMs + run.durationMs,
    }),
    { riskHypotheses: 0, advisories: 0, tokens: 0, durationMs: 0 },
  );
  return {
    verified,
    model: requiredModel,
    provider: requiredProvider,
    runsVerified: verified ? modelRuns.length : 0,
    riskHypothesesVerified: verified ? totals.riskHypotheses : 0,
    advisoriesVerified: verified ? totals.advisories : 0,
    tokensVerified: verified ? totals.tokens : 0,
    durationMsVerified: verified ? totals.durationMs : 0,
    reason: verified
      ? "Both provider responses returned the required model with completed HTTP 200 calls; both plans cover every allowed check, both advisories cite allow-listed evidence and both v3 run receipts cover the complete saved records."
      : modelRuns.every(
            (run) =>
              run.plan?.state !== "complete" &&
              run.analysis?.state !== "complete",
          )
        ? "This pair did not request model planning and advice."
        : "Both runs need grounded Nemotron plans, allow-listed advisories and verified receipts.",
  };
}

export function measureBrowserEvidence(runs, receiptsVerified) {
  const recordedVersions = runs.map((run) => run.browser);
  const versionsValid = recordedVersions.every(
    (version) =>
      typeof version === "string" && /^\d+\.\d+\.\d+\.\d+$/.test(version),
  );
  const verified =
    runs.length === 2 && receiptsVerified === runs.length && versionsValid;
  return {
    verified,
    product: "Google Chrome",
    runsVerified: verified ? runs.length : 0,
    versions: verified ? [...new Set(recordedVersions)] : [],
    reason: verified
      ? "Both execution records include receipt-bound Google Chrome versions."
      : "Both runs need valid receipt-bound Google Chrome versions.",
  };
}

export function validatePlan(value, ids) {
  const risks = value?.risks;
  if (
    !value ||
    !Array.isArray(value.order) ||
    value.order.length !== ids.length ||
    new Set(value.order).size !== ids.length ||
    value.order.some((id) => !ids.includes(id)) ||
    typeof value.reason !== "string" ||
    !value.reason.trim() ||
    value.reason.length > 600 ||
    !Array.isArray(risks) ||
    risks.length !== ids.length ||
    new Set(risks.map((risk) => risk?.checkId)).size !== ids.length ||
    risks.some(
      (risk) =>
        !ids.includes(risk?.checkId) ||
        typeof risk.hypothesis !== "string" ||
        !risk.hypothesis.trim() ||
        risk.hypothesis.length > 240,
    )
  ) {
    throw new Error("The model plan did not match the allowed check catalog.");
  }
  return {
    order: value.order,
    reason: value.reason,
    risks: risks.map(({ checkId, hypothesis }) => ({ checkId, hypothesis })),
  };
}

export function validateAdvice(value, checks) {
  const check = checks.find((item) => item.id === value?.nextCheckId);
  if (
    !check ||
    !["repeat-check", "expand-coverage"].includes(value.action) ||
    (value.action === "expand-coverage") !== (check.id === "coverage")
  )
    throw new Error(
      "Model suggestion was outside the supported action catalog.",
    );
  return {
    action: value.action,
    evidenceIds: [check.id],
    text:
      value.action === "expand-coverage"
        ? "Suggestion: add a separate test suite for the authentication and browser coverage currently marked not tested."
        : `Suggestion: repeat “${check.title}” in a clean session using the recorded reproduction steps.`,
  };
}
