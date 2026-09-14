import { verdict } from "./report.mjs";

export function parseCliArgs(args) {
  const options = { analyze: false, port: 4321 };
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === "--analyze") options.analyze = true;
    else if (["--suite", "--build", "--change", "--port"].includes(argument)) {
      const value = args[++index];
      if (!value) throw new Error(`${argument} requires a value.`);
      options[argument.slice(2)] =
        argument === "--port" ? Number(value) : value;
    } else if (argument === "--help") options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!options.help && (!options.suite || !options.build))
    throw new Error("--suite and --build are required.");
  if (
    !Number.isInteger(options.port) ||
    options.port < 1024 ||
    options.port > 65535
  )
    throw new Error("--port must be an integer from 1024 to 65535.");
  return options;
}

export function cliExitCode(run) {
  return verdict(run) === "checked-pass" ? 0 : 1;
}

export function formatCliReport(run) {
  const lines = [
    `Release Witness ${run.id}`,
    `${run.targetName} / ${run.buildLabel}`,
    `Outcome: ${verdict(run)}`,
    "",
  ];
  for (const check of run.checks)
    lines.push(`${check.status.padEnd(10)} ${check.title}: ${check.observed}`);
  lines.push("", `JSON: artifacts/runs/${run.id}.json`);
  return lines.join("\n");
}

export const cliHelp = `Usage:
  npm run witness -- --suite <manifest-id> --build <build-id> [options]

Options:
  --change <text>   Change description recorded in the report
  --analyze         Use two Nebius model calls when allowance is available
  --port <number>   Temporary local runner port (default 4321)
  --help            Show this help

Exit code 0 means every supported check passed. Failures, missing evidence and
interrupted runs return exit code 1.`;
