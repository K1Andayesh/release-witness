# First vertical-slice QA — 9 September 2026

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
