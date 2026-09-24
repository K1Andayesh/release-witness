import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateDeployment } from "../lib/deployment.mjs";

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}.`);
  return response.json();
}

export async function verifyDeployment({
  baseUrl,
  expectedVersion,
  expectedCommit,
  expectedArchiveSha256,
  attempts = 15,
  retryDelayMs = 1_000,
}) {
  let lastFailure = "The service did not answer.";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const [status, benchmark] = await Promise.all([
        fetchJson(`${baseUrl}/api/status`),
        fetchJson(`${baseUrl}/api/benchmark`),
      ]);
      const result = validateDeployment({
        status,
        benchmark,
        expectedVersion,
        expectedCommit,
        expectedArchiveSha256,
      });
      if (result.ready) return result;
      lastFailure = result.failures.join(" ");
    } catch (error) {
      lastFailure = error.message;
    }
    if (attempt < attempts) await wait(retryDelayMs);
  }
  throw new Error(lastFailure);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const [baseUrl, expectedCommit, expectedArchiveSha256, versionOverride] =
    process.argv.slice(2);
  if (
    !/^https?:\/\//.test(baseUrl || "") ||
    !/^[a-f0-9]{40}$/.test(expectedCommit || "") ||
    !/^[a-f0-9]{64}$/i.test(expectedArchiveSha256 || "")
  ) {
    console.error(
      "Usage: node scripts/verify-deployment.mjs <base-url> <commit> <archive-sha256> [version]",
    );
    process.exitCode = 2;
  } else {
    const packageMetadata = JSON.parse(
      await readFile(new URL("../package.json", import.meta.url), "utf8"),
    );
    try {
      const result = await verifyDeployment({
        baseUrl: baseUrl.replace(/\/$/, ""),
        expectedVersion: versionOverride || packageMetadata.version,
        expectedCommit,
        expectedArchiveSha256,
      });
      console.log(JSON.stringify(result.summary));
    } catch (error) {
      console.error(`Deployment verification failed: ${error.message}`);
      process.exitCode = 3;
    }
  }
}
