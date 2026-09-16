# Release Witness QA record

## Browser-only pair cannot displace model-backed benchmark — 16 September 2026

- Actual Chrome used **Run baseline + candidate** on the local public demo with live model calls disabled. The newer browser-only appointment pair `275e683f` → `6c679ce7` completed and its before/after comparison showed two resolved defects, one preserved invariant and one unverified coverage boundary.
- Before and after that run, `/api/benchmark` selected the same saved model-backed appointment pair `15ebbae0-7309-4607-a752-f9306afd0395`, retained four verified model runs and 16 screenshots across both workflows, and returned the same local SHA-256 attestation `596d39fc45aba9450aede8f6c6927f8712b335844a3d950d8d135219f302238e`.
- A contract regression creates a newer browser-only pair and asserts that the selected pair and attestation remain unchanged. Existing screenshot-tamper coverage still requires the selected evidence to fail closed.

## First vertical-slice QA — 9 September 2026

Actual product UI tested through Chrome at http://127.0.0.1:4317. The product's runner independently launched isolated headless Chrome 152.0.7977.65 against the local fixture. No checks ran against user production apps.

| UI run                                | Evidence                             | Result                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Seeded defect + live Nemotron         | f72c9ea8-0e16-4b2f-b5f5-4f55c1d00dc4 | Persistence failed: note visible before reload, zero matches afterward. Validation and double click passed. Four screenshots; model correctly referenced failing persistence. |
| Repaired build + live Nemotron        | f3f2f567-fccf-4248-ba1f-d857554a425a | Three supported checks passed, excluded coverage not tested. Model exhausted 1600 tokens; UI displayed unavailable interpretation and retained browser evidence.              |
| Repaired build with thinking disabled | 1b6d89b6-3a81-4072-9d38-83301b9ee781 | Three supported checks passed. Complete interpretation: 69 output tokens, zero reasoning tokens, 1454 ms provider latency.                                                    |

Reports and screenshots are stored under artifacts/runs/. The UI renders exact expected/observed values and numbered reproduction steps. Opened the repaired persistence detail and visually inspected both screenshots: the saved note remains after reload. Desktop layout had no visible clipping in the inspected views.

After a server restart and browser reload, the earlier repaired report, counts, failure message and both saved histories remained visible. Run buttons disabled during active work and re-enabled afterward. Source syntax checks passed. npm install reported zero dependency vulnerabilities.

## Limits and remaining QA

- This demonstrates the initial flow, not full M3 completion or submission readiness.
- Model output is advisory and still needs stronger evaluation. The repaired-run phrase "strong functional stability" overstates the narrow evidence; the UI limits its conclusion to checked workflows and explicitly retains untested coverage. Do not use this phrase as a product claim.
- The product has not yet been exercised through provider timeout/401, browser launch failure, interrupted-run recovery, concurrent submissions or corrupted report files. M0's standalone probe did verify HTTP 401 separately.
- Mobile viewport, keyboard-only navigation, screen-reader behavior and other browsers remain unverified.
- Trial spending estimates use catalog prices, not reconciled billing. Ten-call persistent guard caps this demo's model calls; there is no live balance integration.
- Provider output failure was observed naturally; no fabricated successful response was substituted.

## Local MVP extension — 9 September 2026

- Actual Chrome run `4dbfec66-523f-400d-bc8f-4b486c594b46`: validation-related change made Nemotron prioritize validation first; the actual runner followed that order. Persistence failed; two other supported checks passed.
- Actual Chrome run `c305d151-5abf-432f-91a0-4fe2582b824f`: final action contract, live plan persistence/duplicate/validation, three passes, four screenshots, excluded coverage not tested. Model chose a supported repeat-persistence action; canonical wording displays separately from execution.
- Comparison through the UI against `4dbfec66` showed persistence resolved, two unchanged checks, and unverified excluded coverage.
- Isolated failure server on port 4318 used an injected HTTP 401 transport, never the real key. UI run `9e2de958-28c7-4c05-b2e8-51a1b78a6485` visibly retained real 2-pass/1-fail browser evidence, standard-plan fallback and explicit model failure. It did not fabricate advice.
- An intermediate freeform model suggestion invented sorting. The final contract now accepts only allow-listed actions and uses server-owned wording. Historical wording remains preserved in raw JSON, not presented as current advice.
- `npm test`: 14 passing tests, including injected 401/429/timeout/truncation/malformed/empty/mismatched model replies, allowance exhaustion, plan/action rejection, comparison regression/unknown behavior, concurrent submissions, interrupted recovery, malformed report skipping, browser launch failure, cross-origin denial and secret-path 404. These injections verify failure handling; they are not live provider failures.
- Download clicked in actual Chrome was blocked with ERR_BLOCKED_BY_CLIENT. Added an in-browser text view as an alternative. Do not claim a downloaded local file was verified.
- Desktop screenshots and native keyboard baseline selection were checked. Responsive viewport override did not take effect in this browser session; mobile and full keyboard/screen-reader QA remain unverified.

The earlier untested failure-boundary and freeform-advice notes above are superseded by these results. Product breadth/differentiation, non-Chrome coverage, public deployment and submission remain outstanding.
Final report-page check: after restarting the server, Chrome rendered /api/runs/c305d151-5abf-432f-91a0-4fe2582b824f/report with all expected/observed values, steps, evidence URLs and bounded advice. Back to run returned to the saved report. The view uses an escaped HTML wrapper because direct text/download navigation was blocked in this browser session.

## Manifest-driven appointment extension — 10 September 2026

- Actual Chrome baseline `0be75853-68d2-4072-a8e0-10bc8044e475`: booking persistence failed with count zero after reload; the sold-out option was enabled; required-name validation passed. The UI showed one pass, two failures, one not-tested boundary and four screenshots.
- Actual Chrome candidate `f2b652d7-2827-4d3c-b82e-d7f79250a863`: persistence, sold-out availability and required-name validation passed. The post-reload screenshot visibly contained `Jordan Lee · 10:00 AM`. Coverage remained not tested.
- The actual comparison UI showed both failures as resolved, required-name validation unchanged and excluded coverage unverified.
- Harbour Appointments and Fieldnotes load from validated JSON manifests. Browser actions are interpreted from an allow-list; the runner has no appointment-specific branch. Local external-preview URLs are restricted to HTTP loopback hosts and all other browser origins are blocked.
- With one of ten model calls remaining, the UI disabled Nemotron and explained that browser-only runs remain available. The server independently rejects a model-enabled request unless two calls remain.
- `npm test`: 15 passing tests after the extension. New coverage validates both manifests, rejects remote targets and unknown actions, and checks the two-call start gate.

This extension was tested in desktop Chrome 153. A 390 × 844 Chrome viewport had no horizontal overflow (`scrollWidth` 375 within `innerWidth` 390). Visual inspection found a joined mobile heading caused by a hidden line break; the rule was removed and rechecked. Full keyboard/screen-reader operation, other browsers and a representative external local project remain unverified.

## OVHcloud public-demo verification — 14 September 2026

- Deployed release `20260914T043000Z` under the dedicated `releasewitness` account on OVHcloud. The service listens only on `127.0.0.1:4317`; Caddy provides HTTPS at `release-witness.139-99-135-89.sslip.io`.
- Public demo mode visibly exposes Harbour Appointments and Fieldnotes only. Nemotron is disabled and no Nebius key is installed.
- Server-side Chromium run `77656430-aa0a-40b9-bd31-41d9d88d87e0` passed booking persistence, sold-out availability and required-name validation with four saved screenshots.
- Public UI run `516c18d0-60e1-491d-94ad-d73b9f4f145a` repeated the same three passes over HTTPS. The public report and evidence URLs use the HTTPS hostname.
- At a 390 × 844 browser viewport, the dashboard reported `innerWidth=390` and `scrollWidth=375`; visual inspection found no horizontal clipping in the setup, saved-runs or report sections.
- The public UI run remained readable after restarting only `release-witness.service`.
- Caddy configuration was validated before installation. Let’s Encrypt issued a certificate for the demo hostname, and HTTP redirects to HTTPS.

The deployed demo still leaves authentication, payments, other browsers, screen readers and private-project multi-tenancy untested.

## Paired workflow and evidence receipts — 14 September 2026

- Actual public-mode UI pair `ef194146` → `4f808250` ran baseline then candidate and opened the comparison automatically: two resolved, zero regressions, one unchanged and one unverified.
- Actual model-enabled UI pair `75db5178` → `86f39150` used four bounded Nemotron calls. The baseline reported one pass and two failures; the candidate reported three passes. Both plans and advisory actions completed with recorded model identity, latency and token use.
- The baseline receipt `a03a926bdb961283…` and candidate receipt `bd9b17436b261aa0…` independently verified their report content and four screenshot files each. A contract test changes a stored screenshot after attestation and confirms verification fails.
- `npm test`: 20 passing tests. The real-Chrome contracts start a server-managed pair, verify its durable relationship and receipt, and confirm the judge-tour comparison survives a full page reload. Syntax and Prettier checks also pass.

The receipt is a consistency proof for the stored artifact set, not an external signature or proof of who created it.

## Server-managed pair hardening — 14 September 2026

- Actual UI pair `a8b75a4c` created baseline `c76d6530` and candidate `14aeca71` as one server-owned operation. The result showed two resolved concerns, zero regressions, one unchanged check and one unverified coverage boundary.
- Reloading the candidate URL restored its exact baseline selection and comparison without client-side pair state. The candidate receipt freshly verified all four screenshots after reload.
- At a 390 × 844 viewport, the completed comparison measured `scrollWidth=375` within `innerWidth=390`; the setup and results stacked within the viewport.
- The request snapshots suite, change and analysis settings at start, so edits during execution cannot split a pair across different inputs.
- Publication scope now contains only the self-contained Harbour Appointments and Fieldnotes fixtures.
- `npm test`: 20 passing tests. `npm run check` and Prettier validation pass.
- Deployed release `20260914T072600Z` to the OVH demo. Public UI pair `665addd5` → `d042418f` completed over HTTPS, freshly verified the candidate receipt, displayed the expected 2 resolved / 0 regression comparison, and restored that exact comparison after reload.

## Judge-tour route persistence — 14 September 2026

- A senior browser QA pass found that the guided model-backed candidate survived reload but its manually selected comparison baseline did not. The URL now carries both run IDs, so a copied or reloaded judge-tour link restores the exact comparison.
- An actual Chrome regression test clicks **Start 90-second tour**, confirms the selected baseline and two resolved concerns, reloads the page, and confirms both again.
- Existing single-run hashes remain compatible. Server-managed candidates can still recover their baseline from the persisted run relationship.

## Judge-facing UX and public evidence isolation — 14 September 2026

- Current browser screenshots showed that the judge tour initially left the setup panel on the baseline while displaying a candidate report. The panel now follows the selected saved run, so the workflow, build, test-app link and change description agree with the evidence on screen.
- The measured release delta now appears directly below the report metrics: two concerns resolved, zero regressions, one unchanged check and one unverified boundary. It is explicitly labeled as a controlled benchmark.
- Keyboard verification in actual Chrome confirms that the first Tab exposes **Skip to current report**, Enter moves focus to the report heading without changing the evidence route, and the judge tour also moves focus to its result. Receipt updates use a polite live region.
- The same Chrome contract reloads the full candidate-and-baseline route at 390 × 844 and confirms the document does not overflow horizontally.
- Public-demo mode now filters saved runs whose suites are outside the public manifest catalog and returns 404 for their direct JSON, report, export, receipt, comparison and evidence routes. This was verified against a deliberately seeded hidden run.

Screenshot inspection found a clear entry point, coherent result hierarchy and visible boundaries. Representative screen-reader output, Windows high-contrast mode, 200% zoom and non-Chrome engines remain unverified.

## Paired evidence inspection — 14 September 2026

- The comparison API now returns the recorded baseline and candidate observations and screenshot references for each matching check, alongside its status transition.
- Actual Chrome opened the first resolved comparison check and displayed the failing baseline and repaired candidate side by side: `Expected count 1; observed 0.` before and `Expected count 1; observed 1.` now.
- The same panel displayed two baseline and two candidate screenshots with descriptive link and image labels. At narrow widths, the evidence columns stack into one reading order.
- The real-Chrome contract now expands this panel and asserts both observations. All 21 tests, syntax checks and formatting validation pass.

## Forced-colour accessibility — 14 September 2026

- Actual Chrome forced-colours emulation preserved the page structure, text, form controls, comparison states and evidence hierarchy.
- The first inspection showed that the green judge-tour button lost its authored fill without gaining an explicit boundary. Forced-colour CSS now gives buttons and evidence callouts a system-colour border and uses the system highlight colour for focus.
- The real-Chrome judge-tour test activates forced colours and asserts that the primary tour control retains a solid border.

A representative Windows OS high-contrast session, 200% browser zoom, full screen-reader operation and non-Chrome engines remain unverified.

## Saved-run focus — 14 September 2026

- Actual Chrome initially renders six recent saved runs instead of the full 18-record history on the prepared public dataset.
- The `Show all 18 saved runs` control exposes the complete history, updates `aria-expanded` from `false` to `true`, and changes to `Show 6 recent runs`.
- Automated real-Chrome coverage verifies the six-item default, complete expansion, accessible state and continued judge-tour behavior.

No receipts are deleted or hidden from the API. A routed selected run and its comparison baseline stay visible even when either falls outside the six most recent records.

## Competition runtime proof — 14 September 2026

- Actual Chrome displays the qualifying runtime record before the workflow controls: `nvidia/Nemotron-3_5-Lightning via Nebius Token Factory`.
- The accompanying values are read from the saved model-backed run and expose the recorded latency, token usage and route to the detailed verified evidence.
- The real-Chrome judge-tour test asserts the runtime model/provider identity and token metadata before continuing through the comparison.

## Audience and impact framing — 14 September 2026

- The public hero names small product teams without dedicated QA as the initial audience.
- The demonstrated value is stated as one path from a pull-request change to Chrome evidence, a before/after release decision and explicit unknowns.
- No adoption, time-saving or defect-prevention numbers are presented because those outcomes have not been measured with external users.

## Hosted evidence provenance — 14 September 2026

- The public report now says `Saved in demo evidence store · available after reload` rather than implying that hosted evidence is local to the judge.
- Local preview mode retains `Saved locally · available after reload` because its artifact directory belongs to the local operator.
- The real-Chrome public-demo contract asserts the hosted label before the judge tour continues.

## Two-workflow benchmark — 14 September 2026

- A fresh v0.1.13 server-managed Fieldnotes pair ran in Chrome 153: baseline `9f67a852` and candidate `b417a60d`.
- The persistence check changed from fail to pass; blank-note validation and duplicate prevention remained passing; excluded coverage remained not tested. The comparison reported one resolution, two unchanged checks, zero regressions and one unverified boundary.
- Both SHA-256 receipts and all eight Fieldnotes screenshots were freshly verified from disk. Combined with the qualifying appointment pair, the controlled portfolio detected 3/3 seeded defects, classified 3/3 repairs, preserved three invariants and reported zero regressions across two workflows.
- The judge strip now derives a direct **Second workflow proof** route from the latest completed, server-managed Fieldnotes pair rather than hard-coding evidence IDs. It stays hidden when no valid paired evidence is available.
- The new `/api/benchmark` verifier accepts a workflow only when its latest server-managed pair matches declared defect and invariant IDs, reports no regressions, keeps its coverage boundary unverified and passes both receipt checks. A real-Chrome contract test tampers with a benchmark screenshot and confirms certification fails.
- Fresh current-version appointment pair `cd0f86d0` → `75e488db` supplied the missing durable pair relationship. With the Fieldnotes pair, the local verifier returned `complete: true`, 3/3 repairs, three preserved invariants, zero regressions, two unverified boundaries, four verified receipts and 16 verified screenshot files in 11 ms.
- Actual Chrome read those values through the public UI code rather than static markup. At 390 × 844, the evidence-derived proof remained visible with `scrollWidth=375` and no horizontal overflow.
- Benchmark certification now requires a matching persisted pair record: pair ID, suite, build order, completion state, baseline/candidate IDs, run positions and candidate baseline reference must all agree. A focused contract test rejects both a mismatched pair candidate and a stale candidate baseline reference.
- The judge strip links to a human-readable portfolio receipt. The receipt exposes the exact pair IDs and a stable aggregate SHA-256 digest over certified ground truth, comparison totals, both verified run-receipt digests, the exact release source, immutable Git commit and source-archive SHA-256. The contract suite confirms the digest is well formed, is rendered by `/api/benchmark/report`, changes after screenshot tampering invalidates a covered receipt, and differs when the source commit or archive changes.

## Receipt-covered Nemotron benchmark — 14 September 2026

- Fresh server-managed appointment pair `15ebbae0` ran baseline `b2998668` and candidate `790c7762` with four live calls to `nvidia/Nemotron-3_5-Lightning` through Nebius Token Factory.
- The plans produced six grounded hypotheses across the two runs and covered every allow-listed check exactly once. Both post-run advisories selected an allow-listed evidence ID. The combined recorded model work was 1,460 tokens and 3.78 seconds.
- Fresh Fieldnotes pair `7fc874fb` reran the independent workflow without model calls. All four current benchmark reports use `run-v2` receipts that bind model/provider/timing/token metadata where present, as well as decisions, observations and screenshot hashes.
- The local portfolio endpoint verified 3/3 repairs, three invariants, zero regressions, four receipts, 16 screenshots, two Nemotron runs, six grounded hypotheses and two advisories. Its aggregate receipt was `794189c7291ace23668433e00f0afd0c956d6748849601293292bc35ce8699b1` before deployment.
- The integration suite now executes four deterministic provider calls in a real server-managed Chrome pair and checks these model measurements. Changing a receipted runtime token count invalidates the run; changing a screenshot removes both functional and model-evidence certification.
- Actual Chrome kept the verified model contribution visible after repeated refreshes. At 390 × 844 it reported `scrollWidth=390` with no horizontal overflow.

## Judge-readable benchmark receipt — 14 September 2026

- Actual Chrome rendered `/api/benchmark/report` as a semantic evidence page with a certified portfolio status, aggregate SHA-256 digest, 3/3 repair result, model contribution, exact workflow pair IDs, four run-receipt digests and links to both comparisons.
- Desktop visual inspection found a clear hierarchy from certification to portfolio totals, model evidence and workflow artifacts. At 390 × 844, the report remained readable and had no horizontal overflow.
- Chrome print emulation hid navigation, changed the page background to white and retained the report heading and evidence content without horizontal overflow.
- Windows forced-colours emulation retained solid boundaries around the certification status, workflow cards, receipt groups and model evidence. The screenshot remained readable without relying on colour.
- The real-Chrome contract verifies the report heading, fail-closed certification state, Fieldnotes comparison route, forced-colours boundaries and mobile width. The full suite remains 21 passing tests.
- The portfolio summary now displays the separately verified 3/3 baseline detection result alongside 3/3 repair classification, and each workflow card exposes its own detection result. Chrome verifies the exact metric rather than inferring it from the repair count.
- The model summary now renders the receipt-covered 3.78-second aggregate model duration alongside the 1,460 verified tokens, and the appointment workflow card repeats that measured timing within its model-evidence group.
- The benchmark JSON and judge page now identify the deployed version and link directly to its matching GitHub release. The real-Chrome contract checks the exact versioned source URL, removing manual correlation between evidence and code.
- A tag CI run exposed a load-sensitive fixed 250 ms wait in the injected browser-launch failure test. The assertion now polls the actual run endpoint to a five-second deadline, preserving the strict interrupted-state and durable-file checks without assuming runner speed. The original run passed on rerun before this hardening.
- A clean public-demo visit now resolves the newest model-backed candidate through its exact `comparisonBaselineId`, matching pair identity and pair positions before selecting it. The fixture includes a newer unrelated baseline to prove recency cannot override pair identity; real-Chrome coverage asserts that the initial URL, build control, baseline control and two-resolution comparison all show the intended appointment pair without a judge click.
- Actual Chrome created Fieldnotes pair `b792cb96` through the local product UI with model planning enabled. Baseline `79e33d76` and candidate `ae47fe51` each completed a grounded three-check risk map, the browser suite and an allow-listed advisory through `nvidia/Nemotron-3_5-Lightning` on Nebius Token Factory. The pair reports one resolution, two unchanged invariants, zero regressions and one unverified boundary; both receipts and all eight screenshots verify. Together with the appointment pair, the portfolio now covers four model-backed runs, 12 hypotheses, four advisories, 2,848 tokens and 7.49 seconds of receipt-bound model work.
