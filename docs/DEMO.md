# Local demonstration

Start with `npm start`, then open http://127.0.0.1:4317. Harbour Appointments is the default manifest. Nemotron is automatically unavailable when fewer than two calls remain, so this walkthrough does not consume the final call.

1. Click **Start 90-second tour** to open candidate `790c7762-e9bf-4ab7-abdb-31854091c15d` with baseline `b2998668-7680-4f95-9811-76b7e6132e6a` already selected.
2. Confirm the candidate receipt is verified, then expand a check to inspect its risk hypothesis, exact observation, steps and screenshots.
3. Read the comparison: persistence and sold-out availability are resolved, required-name validation is unchanged, and excluded coverage remains unverified.
4. Open the baseline to see both failures and its separately verified receipt.
5. Open View report for a portable evidence record with report and screenshot SHA-256 hashes. Open JSON exposes the structured report without manifest actions or credentials.
6. To repeat the release workflow, click **Run baseline + candidate**. Each check gets a clean Chrome context and the comparison opens when both runs finish.
7. Switch the Workflow manifest to Fieldnotes to show that the same runner loads a different target, build pair and check catalog without scenario-specific runner code.

Explain that the candidate builds are supplied by the demo. Release Witness compares their observed behavior; it does not patch the application. Passing a bounded suite is not approval to release an entire app.
