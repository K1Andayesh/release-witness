# Changelog

## 0.1.45 — 2026-09-17

- Require the recorded Nemotron request and provider-returned model IDs, HTTP 200 status and completed stop reason before the portfolio certifies a model-backed run. A missing returned-model field can no longer pass by falling back to the requested model.
- Add a regression showing that the prior v2 run receipt remains intact after that field is removed, while model certification now fails closed. Existing saved model-backed pairs retain certification because their recorded responses contain the required metadata.

## 0.1.44 — 2026-09-17

- Make **Verified delta** wait for the saved comparison to finish loading before expanding and focusing its evidence. A fast click on a slow connection now lands on the changed check instead of leaving the judge at the comparison section.
- Cover the delayed-response path in real Chrome with a deliberately slowed comparison request.

## 0.1.43 — 2026-09-17

- Keep the evidence item in view when a judge selects a tour step on a short or 200%-zoomed screen; the verified-delta step now centres its expanded comparison check instead of scrolling only to the enclosing section.
- Guard focused evidence visibility on a 390 × 450 Chrome viewport.

## 0.1.42 — 2026-09-17

- Identify completed Nemotron planning as a recorded model call in the judge report, so the saved evidence cannot imply a new live call on the credential-free public demo.

## 0.1.41 — 2026-09-17

- Make the judge tour bring its report heading into the visible viewport on narrow screens as well as desktop.
- Add four direct evidence steps linking the saved Nemotron risk map, browser observations, bounded advice and verified before/after comparison; the public path makes no fresh model calls.
- Exercise mobile focus, viewport visibility, evidence-step navigation and reflow in real Chrome.
- Enlarge report download and evidence-link touch targets on narrow screens.

## 0.1.40 — 2026-09-17

- Correct insufficient small-text contrast and enlarge the judge-resource links' touch targets.
- Give the benchmark's per-workflow evidence landmarks distinct names and make metric groups and homepage outcomes validly labelled for assistive technology.
- Add real-Chrome axe checks of the expanded judge comparison and benchmark receipt to the regression suite; desktop and narrow-screen audits now report zero automated violations in the tested states.

## 0.1.39 — 2026-09-17

- Correct the singular resolved-concern label in both comparison summaries when a workflow has one repaired defect.
- Verify the published judge path in Microsoft Edge, including the second workflow, receipt, focus transfer and narrow-screen reflow.

## 0.1.38 — 2026-09-17

- Gate the judge tour on the server-verified model-backed pair instead of inferring proof from saved run metadata.
- Recheck benchmark integrity every ten seconds while the page is open, so changed or missing screenshots withdraw the tour and portfolio claim without requiring a reload.
- Exercise a newer corrupted model-backed pair alongside an older intact pair in real Chrome; certification fails closed without silently falling back.

## 0.1.37 — 2026-09-16

- Make a public demo without saved model evidence explicit: disable the unavailable judge tour, remove its proof promise and explain that live model calls are disabled.
- Keep browser-only results inspectable while the portfolio remains uncertified, and exercise that fresh-install path in actual Chrome and the contract suite.

## 0.1.36 — 2026-09-16

- Keep the published benchmark on the newest completed model-backed pair for each workflow when visitors create newer browser-only demo pairs.
- Require verified model evidence before certifying the aggregate portfolio; still recheck the chosen pair's receipts and screenshots so altered evidence fails closed.
- Cover this selection with a regression test and an actual Chrome paired run.

## 0.1.35 — 2026-09-16

- Separate defect detection from repair resolution in the headline judge metric.
- State both verified 3/3 outcomes directly instead of compressing them into an ambiguous label.
- Preserve the same server-derived benchmark and explicit evidence boundaries.

## 0.1.34 — 2026-09-15

- Label the verified evidence total as screenshots so the judge-facing metric is self-explanatory.
- Reconcile the repository handoff with the completed Devpost preview and saved entry fields.
- Keep the release provenance links synchronized with the deployed source.

## 0.1.33 — 2026-09-15

- Publish the synchronized 1:47 two-workflow demo with naturally paced Australian English narration.
- Point the judge entry path, repository and submission materials to the verified public YouTube URL.
- Preserve the exact video master, captions and source-bound portfolio receipt as publication evidence.

## 0.1.32 — 2026-09-14

- Replace historical demo run IDs with the currently certified public benchmark pairs.
- Extend the walkthrough across both appointment and Fieldnotes workflows plus the source-bound portfolio receipt.
- Document a synchronized 1:47 narration cut using a natural Australian English neural voice.
- Keep exported source text on portable LF line endings so clean release archives pass the same formatting gate.

## 0.1.31 — 2026-09-14

- Bind the SHA-256 of the exact downloadable source archive into the aggregate benchmark receipt.
- Publish the source archive link and digest beside the release and immutable commit provenance.
- Expose the deployed archive digest through the status API for machine verification.

## 0.1.30 — 2026-09-14

- Resolve the landing page's source shortcut to the immutable commit deployed behind the public demo.
- Keep the repository URL as the static loading fallback and switch to exact provenance after benchmark verification.
- Cover the exact deployed-source link in the real-Chrome judge-tour contract.

## 0.1.29 — 2026-09-14

- Bind the immutable Git commit and its direct source link into the aggregate benchmark receipt.
- Expose the covered commit on the judge-readable receipt and status API.
- Verify in contract tests that changing only the source commit changes the aggregate digest.

## 0.1.28 — 2026-09-14

- Bind the exact release version and GitHub source URL into the aggregate benchmark receipt.
- Make source changes alter the portfolio digest even when the underlying browser evidence is unchanged.
- Add a focused receipt contract proving release provenance is cryptographically covered.

## 0.1.27 — 2026-09-14

- Verify Nebius/Nemotron planning and advice across both included workflows.
- Surface portfolio-wide model runs, grounded hypotheses, advisories, token use and measured model time.
- Replace the ambiguous zero-authority hero metric with the positive receipt-verified model-run total while retaining the browser-verdict boundary in plain language.

## 0.1.26 — 2026-09-14

- Open a clean public-demo visit on the strongest verified model-backed comparison instead of the newest arbitrary saved run.
- Resolve the judge tour through the candidate's exact server-managed baseline relationship.
- Prevent the guided comparison from drifting to an unrelated older baseline as saved history grows.

## 0.1.25 — 2026-09-14

- Remove a load-sensitive fixed delay from interrupted-run recovery verification.
- Poll the real run state to a bounded deadline before asserting durable interruption evidence.
- Keep the CI gate strict while eliminating a timing race observed on one tag runner.

## 0.1.24 — 2026-09-14

- Bind the machine-readable benchmark response to the deployed release version and exact GitHub release URL.
- Link the judge-facing certification directly to the source archive and commit for that release.
- Keep release provenance visible beside certification on desktop and mobile.

## 0.1.23 — 2026-09-14

- Surface the receipt-verified model runtime alongside token usage in the judge summary.
- Show the verified model time on the exact workflow card that used Nemotron.
- Preserve a balanced mobile model-evidence grid with the additional measured field.

## 0.1.22 — 2026-09-14

- Surface the independently verified 3/3 baseline defect-detection result in the portfolio summary.
- Add defect-detection metrics to each workflow card and show that both workflows verify.
- Rebalance the evidence grids for clearer desktop and mobile scanning.

## 0.1.21 — 2026-09-14

- Preserve visible certification and evidence-group boundaries in Windows forced-colours mode.
- Add real-Chrome regression coverage for the benchmark status and workflow cards under forced colours.

## 0.1.20 — 2026-09-14

- Replace the raw benchmark text export with a scannable judge-facing evidence page.
- Present the portfolio result, verified Nemotron contribution, workflow identities, receipt digests and evidence limits as semantic sections.
- Link each workflow card directly to its exact baseline-to-candidate comparison.
- Add responsive and print layouts plus real-Chrome coverage for the report's critical evidence path.

## 0.1.19 — 2026-09-14

- Measure the Nemotron contribution on the exact benchmark pair: verified runs, grounded hypotheses, allow-listed advisories, tokens and latency.
- Add versioned run receipts that cover the returned NVIDIA model, Nebius provider, model timing and token totals as well as browser decisions and screenshots.
- Surface two receipt-verified Nemotron runs, six grounded risk hypotheses and two bounded advisories in the judge view and benchmark receipt.
- Add integration coverage for all four model calls and fail the model-evidence claim when a covered screenshot is changed.

## 0.1.18 — 2026-09-14

- Add a judge-facing benchmark receipt with the verified workflow pair IDs, totals and explicit coverage limits.
- Generate a deterministic aggregate SHA-256 digest over portfolio ground truth, pair identity, comparison results and verified run-receipt digests.
- Change the aggregate digest when benchmark evidence is tampered with and cover the public receipt route in the contract suite.

## 0.1.17 — 2026-09-14

- Require benchmark runs to match an independently loaded, completed pair record.
- Verify pair suite, build order, run IDs, pair positions and candidate baseline reference before certification.
- Add focused contract coverage for forged candidate and stale baseline relationships.

## 0.1.16 — 2026-09-14

- Add manifest-declared benchmark ground truth for known defects and preserved invariants.
- Derive the public 3/3 portfolio claim from the latest server-managed pairs, fresh receipt checks and every stored screenshot.
- Withhold the homepage result when any workflow, expected comparison state, receipt or screenshot fails verification.
- Add tamper regression coverage for benchmark certification.

## 0.1.15 — 2026-09-14

- Add a judge-strip link that opens the independent Fieldnotes comparison directly.
- Derive the route from the latest completed server-managed pair and hide the link when paired evidence is unavailable.
- Preserve keyboard focus transfer and the existing public-source and natural-demo entry points.

## 0.1.14 — 2026-09-14

- Extend the controlled benchmark to the independent Fieldnotes workflow with a fresh server-managed Chrome pair.
- Publish a two-workflow claim: 3/3 seeded defects detected and resolved, three passing invariants preserved, zero regressions and two explicit unverified boundaries.
- Add verified Fieldnotes evidence IDs and a direct public comparison route to the evaluation and judging guides.

## 0.1.13 — 2026-09-14

- Added an inspected 16:9 Release Witness project cover for Devpost, repository and social-preview use.
- Served the optimized cover as an explicit JPEG asset with Open Graph and large-card metadata.
- Added a static-asset contract covering status, media type and non-empty image content.

## 0.1.12 — 2026-09-14

- Corrected hosted receipt provenance from `Saved locally` to `Saved in demo evidence store`.
- Kept local-preview wording unchanged for developers running their own evidence directory.
- Added the hosted provenance label to the real-Chrome judge journey contract.

## 0.1.11 — 2026-09-14

- Added a reviewer-first architecture and trust-boundary map.
- Documented authority, target restrictions, evidence verification and fail-closed behavior by component.
- Linked the map from the README and judging guide so technical reviewers can assess it before reading implementation details.

## 0.1.10 — 2026-09-14

- Named the initial audience and demonstrated release-review value directly in the public hero.
- Replaced generic social metadata with the concrete pull-request, Chrome-evidence and explicit-unknowns proposition.
- Kept the impact claim evidence-bounded without invented adoption or productivity figures.

## 0.1.9 — 2026-09-14

- Surfaced the qualifying NVIDIA Nemotron and Nebius Token Factory runtime record in the judge entry point.
- Derived returned model identity, provider, latency and token usage from a saved model-backed run instead of presenting a static claim.
- Tightened the README and judging guide around the required competition runtime.

## 0.1.8 — 2026-09-14

- Reduced saved-run noise by showing the six most recent receipts by default.
- Preserved access to every receipt through an accessible, reversible history control.
- Kept the selected run and routed comparison baseline visible even when they fall outside the recent set.

## 0.1.7 — 2026-09-14

- Preserved button and evidence boundaries when Chrome activates forced colours.
- Added a real-Chrome forced-colours assertion to the judge-tour regression test.

## 0.1.6 — 2026-09-14

- Linked the public source and natural 93-second demo from the judge entry point.
- Exposed the running package version in the status API and public footer.
- Added description and social-sharing metadata to the hosted demo.

## 0.1.5 — 2026-09-14

- Recomputed both baseline and candidate receipts whenever a comparison loads.
- Added a combined receipt result with the number of screenshot files freshly checked from disk.

## 0.1.4 — 2026-09-14

- Added inline baseline/candidate evidence drill-downs for resolved, regressed and still-failing checks.
- Kept the comparison summary as the polite live region while leaving evidence controls with their native semantics.
- Corrected the README's verified-comparison link to preserve both evidence IDs.

## 0.1.3 — 2026-09-14

- Added the measured release delta directly below report metrics.
- Synchronized the setup panel with the selected evidence and improved judge-tour focus handling.
- Hid non-public historical suites and their direct evidence routes in public-demo mode.

## 0.1.2 — 2026-09-14

- Persisted candidate and baseline IDs in judge-tour links and restored the exact comparison after reload.
- Added real-Chrome reload coverage for the judge tour.

## 0.1.1 — 2026-09-14

- Moved paired baseline/candidate execution into a durable server-managed job.
- Persisted the exact comparison relationship and restored it automatically after reload.
- Reverified evidence receipts on every view instead of caching integrity results.
- Corrected horizontal-fit assertions to measure rendered text bounds.
- Kept the publication package self-contained with only synthetic demo workflows.
- Added a real-Chrome paired-execution contract; all 19 tests pass.

## 0.1.0 — 2026-09-14

- Added a manifest-driven Playwright runner with isolated checks, screenshots, explicit unknown coverage and persisted reports.
- Added before/after comparison with resolved, regression, unchanged and unverified states.
- Integrated NVIDIA Nemotron 3.5 Lightning through Nebius Token Factory for constrained check ordering and advisory actions.
- Added the self-contained Harbour Appointments and Fieldnotes workflows.
- Added a fail-closed CLI suitable for local use and CI.
- Added failure handling for provider errors, invalid model output, browser launch failure, interrupted runs and malformed reports.
