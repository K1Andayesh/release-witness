import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";

const live = process.argv.includes("--live");
const base = "https://api.tokenfactory.nebius.com/v1";
const key = process.env.NEBIUS_API_KEY;
const model = process.env.NEBIUS_MODEL || "nvidia/Nemotron-3_5-Lightning";
const report = {
  timestamp: new Date().toISOString(),
  provider: base,
  requestedModel: model,
  liveRequested: live,
  status: "blocked",
  requests: [],
};
async function request(path, body) {
  const started = performance.now();
  const response = await fetch(`${base}/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(45000),
    redirect: "error",
  });
  report.requests.push({
    path,
    httpStatus: response.status,
    latencyMs: Math.round(performance.now() - started),
  });
  if (!response.ok)
    throw new Error(
      `Provider HTTP ${response.status}; response body omitted to avoid recording sensitive diagnostics.`,
    );
  return response.json();
}
try {
  if (!key)
    throw new Error("NEBIUS_API_KEY is missing. No network request made.");
  if (!model.toLowerCase().startsWith("nvidia/"))
    throw new Error("Select an NVIDIA model for this competition probe.");
  const catalog = await request("models");
  if (!Array.isArray(catalog.data))
    throw new Error("Unexpected model catalog response.");
  report.nvidiaModels = catalog.data
    .map((item) => item.id)
    .filter(
      (id) => typeof id === "string" && id.toLowerCase().startsWith("nvidia/"),
    );
  if (!report.nvidiaModels.includes(model))
    throw new Error(
      "Requested model is absent from the authenticated catalog.",
    );
  report.status = "catalog_verified";
  if (live) {
    if (process.env.NEBIUS_INFERENCE_APPROVED !== "true")
      throw new Error(
        "Verify credits or cost authorization, then set NEBIUS_INFERENCE_APPROVED=true. No inference request made.",
      );
    const result = await request("chat/completions", {
      model,
      max_tokens: 1024,
      reasoning_effort: "low",
      store: false,
      messages: [
        {
          role: "system",
          content:
            "You assess supplied web application observations. You have not executed tests yourself. Classify only what was observed. Root cause is unknown: do not suggest a likely cause or storage technology without supporting evidence. Suggest one repeatable recheck and clearly label it as a suggestion, not an executed result.",
        },
        {
          role: "user",
          content:
            "An executed browser check saved a synthetic note, reloaded the page, and observed that the note was absent. Expected: the saved note remains. In two sentences, classify this observation and suggest one recheck. Do not invent evidence.",
        },
      ],
    });
    const choice = result.choices?.[0];
    report.returnedModel = result.model ?? null;
    report.response = choice?.message?.content ?? null;
    report.finishReason = choice?.finish_reason ?? null;
    report.usage = result.usage ?? null;
    if (typeof report.response !== "string" || !report.response.trim())
      throw new Error("Provider returned no visible answer.");
    if (report.finishReason !== "stop")
      throw new Error(
        "Provider did not finish normally; a truncated answer is not a successful probe.",
      );
    if (report.returnedModel !== model)
      throw new Error(
        "Returned model identity differs from the requested model.",
      );
    report.status = "inference_received";
    report.reviewRequired =
      "Check answer grounding, returned model identity, usage and billing before marking M0 complete.";
  }
} catch (error) {
  report.status = "blocked";
  report.error = error instanceof Error ? error.message : "Unknown failure";
  process.exitCode = 1;
}
await mkdir("artifacts", { recursive: true });
const path = `artifacts/nebius-probe-${Date.now()}.json`;
await writeFile(path, JSON.stringify(report, null, 2) + "\n");
console.log(
  JSON.stringify(
    { status: report.status, evidence: path, error: report.error },
    null,
    2,
  ),
);
