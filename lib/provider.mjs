import { readFile, writeFile, rename } from "node:fs/promises";
import { performance } from "node:perf_hooks";

export async function modelAllowance(directory) {
  const configured = Number(process.env.MODEL_CALL_LIMIT || 10);
  const limit =
    Number.isInteger(configured) && configured > 0 && configured <= 100
      ? configured
      : 10;
  try {
    const ledger = JSON.parse(
      await readFile(new URL("../model-call-ledger.json", directory), "utf8"),
    );
    return Number.isInteger(ledger.calls) && ledger.calls >= 0
      ? {
          used: ledger.calls,
          limit,
          remaining: Math.max(0, limit - ledger.calls),
        }
      : { used: limit, limit, remaining: 0 };
  } catch (error) {
    if (error.code === "ENOENT") return { used: 0, limit, remaining: limit };
    return { used: limit, limit, remaining: 0 };
  }
}

export async function modelCall(
  messages,
  directory,
  { json = false, transport = fetch, timeoutMs = 45000 } = {},
) {
  const model = process.env.NEBIUS_MODEL || "nvidia/Nemotron-3_5-Lightning";
  const result = { state: "failed", model, provider: "Nebius Token Factory" };
  const started = performance.now();
  try {
    if (
      !process.env.NEBIUS_API_KEY ||
      process.env.NEBIUS_INFERENCE_APPROVED !== "true"
    )
      throw new Error("Model access is not configured or enabled.");
    if (model !== "nvidia/Nemotron-3_5-Lightning")
      throw new Error(
        "This development allowance supports Nemotron Lightning only.",
      );
    const path = new URL("../model-call-ledger.json", directory);
    let ledger = { calls: 0 };
    try {
      ledger = JSON.parse(await readFile(path, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const allowance = await modelAllowance(directory);
    if (
      !Number.isInteger(ledger.calls) ||
      ledger.calls < 0 ||
      ledger.calls >= allowance.limit
    )
      throw new Error(
        `The ${allowance.limit}-call development allowance is exhausted. Browser checks remain available.`,
      );
    ledger.calls++;
    const temp = new URL("../model-call-ledger.tmp", directory);
    await writeFile(temp, JSON.stringify(ledger));
    await rename(temp, path);
    const response = await transport(
      "https://api.tokenfactory.nebius.com/v1/chat/completions",
      {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEBIUS_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 1600,
          chat_template_kwargs: { enable_thinking: false },
          store: false,
          ...(json ? { response_format: { type: "json_object" } } : {}),
          messages,
        }),
      },
    );
    result.httpStatus = response.status;
    if (!response.ok)
      throw new Error(`Provider returned HTTP ${response.status}.`);
    const data = await response.json();
    result.usage = data.usage;
    result.returnedModel = data.model;
    result.finishReason = data.choices?.[0]?.finish_reason;
    if (data.model !== model || result.finishReason !== "stop")
      throw new Error(
        "Provider answer was incomplete or model identity did not match.",
      );
    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim())
      throw new Error("Provider returned no answer.");
    result.text = answer;
    result.state = "complete";
  } catch (error) {
    result.error =
      error.name === "TimeoutError"
        ? "Provider timed out. Browser evidence is preserved."
        : error.message;
  }
  result.durationMs = Math.round(performance.now() - started);
  return result;
}
