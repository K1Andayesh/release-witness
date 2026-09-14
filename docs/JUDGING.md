# Judging guide

Release Witness is entered in **Best Apps and Agents**. This guide maps the shipped evidence to the four equally weighted judging criteria in the official rules.

## Technological implementation

- NVIDIA Nemotron 3.5 Lightning runs through Nebius Token Factory in two bounded calls: a pre-run risk map and a post-run advisory action.
- The judge view surfaces the exact benchmark pair's verified model contribution before the workflow controls: two receipted Nemotron runs, six grounded risk hypotheses, two allow-listed advisories, returned model identity, Nebius provider and token usage.
- Strict schemas require one risk hypothesis for every allow-listed check. The model cannot omit checks, add checks or determine a verdict.
- A server-managed job runs the reviewed contract against baseline and candidate in isolated Chrome contexts, then persists their relationship across reloads. Loading the comparison freshly verifies both receipts and every referenced screenshot file.
- Deterministic assertions produce the verdicts. SHA-256 receipts are recomputed from each report and every stored screenshot before the UI shows verification.
- The portfolio benchmark is server-derived rather than editorial: manifest ground truth identifies seeded defects and invariants, and `/api/benchmark` verifies the latest paired results, four receipts and all 16 screenshot files before the homepage can show 3/3. It separately verifies that both appointment plans cover every allowed check and both advisories cite allow-listed evidence. `/api/benchmark/report` exposes the same certification, pair IDs, model measurements and aggregate SHA-256 digest as a judge-readable receipt.
- Twenty-one automated tests and the public GitHub Actions workflow cover contracts, persisted pair identity, failure handling, tamper detection, concurrency, restart recovery, paired execution, judge-tour reload restoration and a real-Chrome smoke run.
- The [`architecture and trust-boundary map`](ARCHITECTURE.md) makes the authority split, execution boundary and fail-closed behavior reviewable without reading the implementation first.

## Design

- **Start 90-second tour** takes a judge directly to the strongest saved model-backed comparison without credentials or model spend. **Second workflow proof** opens the independent Fieldnotes comparison, and **Benchmark receipt** opens the portfolio certification from the same judge strip. The entry point also links to the public source and natural 93-second walkthrough.
- A controlled-benchmark release delta places the measured two resolutions and zero regressions directly below the result metrics.
- The comparison separates resolved, regressed, unchanged and unverified checks instead of collapsing them into one score.
- Every decision expands into its model hypothesis, reviewed expectation, observed behavior, reproduction steps, screenshots and receipt status. Changed checks also place the baseline and candidate observations and screenshots side by side.
- The responsive public UI was checked at 390 × 844 as well as desktop size, with no horizontal overflow. The main keyboard path includes a visible skip link and moves focus to the judge-tour report.

## Potential impact

The initial audience is small product teams that review pull requests without dedicated QA. Their current evidence is often split across prose, test output and screenshots. Release Witness packages the release question into a durable artifact: what changed, what Chrome observed, what improved or regressed, and what remains untested. Across the appointment and Fieldnotes workflows, the controlled benchmark detected 3/3 seeded defects, classified 3/3 repairs, preserved three invariants and reported zero regressions. This demonstrates reuse of the evidence pipeline without estimating productivity gains that have not yet been measured.

## Quality of the idea

The model's useful role is deliberately narrower than the evidence system around it. Nemotron turns a change description into hypotheses tied to known behavior, but cannot manufacture coverage or overrule the browser. This makes AI assistance auditable: a judge can follow every model suggestion to an executed check and every verdict to evidence, while unknowns remain visible.

## Fast verification

1. Open the [public demo](https://release-witness.139-99-135-89.sslip.io) and choose **Start 90-second tour**.
2. Confirm the comparison reports two resolved checks, zero regressions, one unchanged check and one unverified boundary.
3. Open a resolved comparison check to inspect the baseline and candidate observations and screenshots together.
4. Open **Benchmark receipt** and confirm the aggregate digest, 3/3 result, pair IDs, four run receipts and 16 screenshots.
5. Review [`EVALUATION.md`](EVALUATION.md) for the ground-truth table and explicit limits.
6. Open the [independent Fieldnotes comparison](https://release-witness.139-99-135-89.sslip.io/#56b5d993-1298-4272-9c68-0cf5e0356f15~223c548b-9eda-40cd-aed1-5716d6677adb) to verify the same runner and receipt path on another workflow.

Public source: https://github.com/K1Andayesh/release-witness

Natural-narration demo: https://youtu.be/LVYa90poYM8
