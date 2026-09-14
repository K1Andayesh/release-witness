// Isolated UI failure exercise: synthetic credentials, no external inference.
// This launcher never returns fabricated model success and does not read .env.
import { startServer } from "../server.mjs";
import { mkdir } from "node:fs/promises";
process.env.NEBIUS_API_KEY = "synthetic-ui-qa-key";
process.env.NEBIUS_INFERENCE_APPROVED = "true";
const directory = new URL("../artifacts/ui-qa/runs/", import.meta.url);
await mkdir(directory, { recursive: true });
await startServer({
  port: 4318,
  directory,
  runnerOptions: {
    providerOptions: {
      transport: async () => new Response("", { status: 401 }),
    },
  },
});
