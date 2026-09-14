import { readFile, readdir } from "node:fs/promises";

const allowedOps = new Set([
  "navigate",
  "fill",
  "select",
  "click",
  "doubleClick",
  "reload",
  "waitFor",
  "screenshot",
  "assertCount",
  "assertText",
  "assertDisabled",
  "assertVisible",
  "assertHorizontalFit",
]);
const allowedBy = new Set(["label", "role", "text", "testId"]);
const safeId = /^[a-z][a-z0-9-]{1,48}$/;

export function validateManifest(value) {
  if (!value || !safeId.test(value.id) || typeof value.name !== "string")
    throw new Error("Manifest identity is invalid.");
  if (value.localOnly !== undefined && typeof value.localOnly !== "boolean")
    throw new Error(`Manifest ${value.id} has an invalid localOnly flag.`);
  if (typeof value.question !== "string" || value.question.length > 180)
    throw new Error(`Manifest ${value.id} needs a bounded question.`);
  if (
    typeof value.defaultChange !== "string" ||
    value.defaultChange.length > 600
  )
    throw new Error(`Manifest ${value.id} needs a bounded default change.`);
  if (!Array.isArray(value.builds) || value.builds.length !== 2)
    throw new Error(`Manifest ${value.id} must define two builds.`);
  for (const build of value.builds) {
    let safeTarget = false;
    try {
      const parsed = new URL(build.path, "http://127.0.0.1");
      safeTarget = build.path.startsWith("/")
        ? !build.path.startsWith("//")
        : parsed.protocol === "https:" ||
          (parsed.protocol === "http:" &&
            ["127.0.0.1", "localhost"].includes(parsed.hostname));
    } catch {}
    if (
      !safeId.test(build.id) ||
      typeof build.label !== "string" ||
      typeof build.path !== "string" ||
      !safeTarget
    )
      throw new Error(`Manifest ${value.id} contains an unsafe build.`);
  }
  if (
    new Set(value.builds.map((build) => build.id)).size !== value.builds.length
  )
    throw new Error(`Manifest ${value.id} repeats a build ID.`);
  const hasRemoteTarget = value.builds.some((build) => {
    if (build.path.startsWith("/")) return false;
    return !["127.0.0.1", "localhost"].includes(new URL(build.path).hostname);
  });
  if (
    !Array.isArray(value.checks) ||
    value.checks.length < 1 ||
    value.checks.length > 8
  )
    throw new Error(`Manifest ${value.id} must define one to eight checks.`);
  for (const check of value.checks) {
    if (
      !safeId.test(check.id) ||
      typeof check.title !== "string" ||
      typeof check.expected !== "string" ||
      !Array.isArray(check.steps) ||
      !Array.isArray(check.actions) ||
      check.actions.length < 1 ||
      check.actions.length > 20
    )
      throw new Error(`Manifest ${value.id} contains an invalid check.`);
    for (const action of check.actions) {
      if (!allowedOps.has(action.op))
        throw new Error(`Manifest ${value.id} contains an unsupported action.`);
      if (action.by !== undefined && !allowedBy.has(action.by))
        throw new Error(
          `Manifest ${value.id} contains an unsupported locator.`,
        );
      for (const field of ["name", "value", "hasText", "equals"])
        if (typeof action[field] === "string" && action[field].length > 240)
          throw new Error(`Manifest ${value.id} contains an oversized action.`);
      const usesLocator = !["navigate", "reload", "screenshot"].includes(
        action.op,
      );
      if (
        (usesLocator &&
          (!allowedBy.has(action.by) ||
            (action.by !== "role" && typeof action.name !== "string"))) ||
        (action.by === "role" && typeof action.role !== "string") ||
        (["fill", "select"].includes(action.op) &&
          typeof action.value !== "string") ||
        (action.op === "screenshot" &&
          !["before", "after"].includes(action.stage)) ||
        (action.op === "assertCount" &&
          (!Number.isInteger(action.equals) || action.equals < 0)) ||
        (action.op === "assertText" && typeof action.equals !== "string") ||
        (action.op === "assertDisabled" &&
          typeof action.equals !== "boolean") ||
        (action.op === "assertVisible" && typeof action.equals !== "boolean") ||
        (action.op === "assertHorizontalFit" &&
          typeof action.equals !== "boolean")
      )
        throw new Error(`Manifest ${value.id} contains an incomplete action.`);
      if (
        hasRemoteTarget &&
        ["fill", "select", "click", "doubleClick"].includes(action.op)
      )
        throw new Error(`Manifest ${value.id} cannot mutate a remote target.`);
    }
    if (!check.actions.some((action) => action.op.startsWith("assert")))
      throw new Error(
        `Manifest ${value.id} check ${check.id} has no assertion.`,
      );
    if (
      check.viewport !== undefined &&
      (!Number.isInteger(check.viewport.width) ||
        !Number.isInteger(check.viewport.height) ||
        check.viewport.width < 320 ||
        check.viewport.width > 1920 ||
        check.viewport.height < 480 ||
        check.viewport.height > 1200)
    )
      throw new Error(`Manifest ${value.id} contains an invalid viewport.`);
  }
  if (
    new Set(value.checks.map((check) => check.id)).size !== value.checks.length
  )
    throw new Error(`Manifest ${value.id} repeats a check ID.`);
  if (
    !value.coverage ||
    typeof value.coverage.title !== "string" ||
    typeof value.coverage.expected !== "string" ||
    typeof value.coverage.observed !== "string"
  )
    throw new Error(
      `Manifest ${value.id} needs an explicit coverage boundary.`,
    );
  return value;
}

export async function loadManifests() {
  const directory = new URL("../manifests/", import.meta.url);
  const catalog = new Map();
  for (const name of (await readdir(directory))
    .filter((name) => name.endsWith(".json"))
    .sort()) {
    const manifest = validateManifest(
      JSON.parse(await readFile(new URL(name, directory), "utf8")),
    );
    if (catalog.has(manifest.id))
      throw new Error(`Duplicate manifest ${manifest.id}.`);
    catalog.set(manifest.id, manifest);
  }
  return catalog;
}

export function publicCatalog(catalog) {
  return [...catalog.values()].map(
    ({ id, name, question, defaultChange, builds, coverage, checks }) => ({
      id,
      name,
      question,
      defaultChange,
      builds,
      coverage: coverage.title,
      checks: checks.map(({ id: checkId, title }) => ({ id: checkId, title })),
    }),
  );
}
