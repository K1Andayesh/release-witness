# Release Witness local MVP specification

Audience: independent developers reviewing a small web change before release.

Targets are declared by reviewed JSON manifests. Each defines exactly two included, local-preview or read-only HTTPS builds, one to eight checks and an explicit coverage boundary. The primary booking suite checks persistence, sold-out availability and required-name validation; the smaller Fieldnotes suite demonstrates reuse. Every check runs in a fresh isolated Chrome context and records expected/observed values, steps, screenshots and console errors. Unsupported coverage and browser-execution failures remain not tested.

Architecture: loopback Node HTTP server, vanilla browser UI, validated JSON manifests, allow-listed Playwright action interpreter and atomic JSON reports. Mutating targets are limited to included paths or exact local HTTP preview origins; HTTPS targets must use read-only operations. The browser blocks every other origin; manifests cannot execute shell commands. One active run; restart converts incomplete runs to interrupted. Malformed reports are skipped and completed evidence survives restart.

Optional NVIDIA Nemotron/Nebius plan uses the change description to order the allow-listed checks, exactly once each. Invalid planning falls back explicitly to the standard suite. After browser execution a second model call selects only a known check/action; server-owned wording prevents invented features and root causes. Model results do not change observations or verdicts. Legacy freeform advice is retained in original JSON but hidden from current report advice.

Comparison accepts distinct completed runs of the same suite. Fail to pass is resolved, pass to fail is regression, and unknown coverage is always unverified. Export exposes the evidence as JSON and readable/downloadable Markdown text.

Controls: persistent ten-call product ledger, 1600 output tokens per call, 45-second timeout, no retries, eligible model identity check and backend-only ignored credential. This is a development allowance, not live balance enforcement. Each enabled run needs two calls; the server rejects model-enabled starts when fewer than two remain.

The same run pipeline is available through a CLI that exits successfully only when all supported checks pass. Local acceptance evidence is in QA.md. Remaining product/entry work is in READINESS.md and PUBLISH_CHECKLIST.md.
