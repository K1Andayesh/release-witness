# Changelog

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
