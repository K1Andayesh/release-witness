# Changelog

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
