import { createHash } from "node:crypto";

function attestationPayload(run) {
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

export function attestRun(run) {
  return {
    algorithm: "SHA-256",
    digest: createHash("sha256")
      .update(JSON.stringify(attestationPayload(run)))
      .digest("hex"),
    scope:
      "Run decisions, observations, model provenance and screenshot hashes",
  };
}

export function verifyAttestation(run) {
  return (
    run.attestation?.algorithm === "SHA-256" &&
    run.attestation.digest === attestRun(run).digest
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
    };
  });
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
