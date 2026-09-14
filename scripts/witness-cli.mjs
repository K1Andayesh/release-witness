import { startServer } from "../server.mjs";
import {
  cliExitCode,
  cliHelp,
  formatCliReport,
  parseCliArgs,
} from "../lib/cli.mjs";

let server;
try {
  const options = parseCliArgs(process.argv.slice(2));
  if (options.help) {
    console.log(cliHelp);
  } else {
    const origin = `http://127.0.0.1:${options.port}`;
    server = await startServer({ port: options.port });
    const response = await fetch(`${origin}/api/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({
        suite: options.suite,
        build: options.build,
        change: options.change,
        analyze: options.analyze,
      }),
    });
    const accepted = await response.json();
    if (!response.ok)
      throw new Error(accepted.error || "Run was not accepted.");
    const deadline = Date.now() + 90_000;
    let run = accepted;
    while (["planning", "running", "analyzing"].includes(run.state)) {
      if (Date.now() > deadline)
        throw new Error("Run did not finish within 90 seconds.");
      await new Promise((resolve) => setTimeout(resolve, 150));
      const report = await fetch(`${origin}/api/runs/${accepted.id}`);
      if (!report.ok) throw new Error("Saved run could not be read.");
      run = await report.json();
    }
    console.log(formatCliReport(run));
    process.exitCode = cliExitCode(run);
  }
} catch (error) {
  console.error(`Release Witness: ${error.message}`);
  process.exitCode = 2;
} finally {
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
