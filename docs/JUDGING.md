# Judging guide

Release Witness is entered in **Best Apps and Agents**. This guide maps the shipped evidence to the four equally weighted judging criteria in the official rules.

Verified source release: https://github.com/K1Andayesh/release-witness/releases/tag/v0.1.37

## Technological implementation

- NVIDIA Nemotron 3.5 Lightning runs through Nebius Token Factory in two bounded calls: a pre-run risk map and a post-run advisory action.
- The judge view surfaces portfolio-wide verified model contribution before the workflow controls: four receipted Nemotron runs across two applications, 12 grounded risk hypotheses, four allow-listed advisories, returned model identity, Nebius provider, 2,848 tokens and 7.49 seconds of recorded model work.
- Strict schemas require one risk hypothesis for every allow-listed check. The model cannot omit checks, add checks or determine a verdict.
- A server-managed job runs the reviewed contract against baseline and candidate in isolated Chrome contexts, then persists their relationship across reloads. Loading the comparison freshly verifies both receipts and every referenced screenshot file.
- Deterministic assertions produce the verdicts. SHA-256 receipts are recomputed from each report and every stored screenshot before the UI shows verification.
- The portfolio benchmark is server-derived rather than editorial: manifest ground truth identifies seeded defects and invariants, and `/api/benchmark` verifies the newest completed model-backed pair for each workflow, four receipts and all 16 screenshot files before the homepage can show 3/3. New browser-only demo pairs cannot replace that evidence. It separately verifies that both appointment plans cover every allowed check and both advisories cite allow-listed evidence. `/api/benchmark/report` presents the same certification as a scannable, printable receipt with the 3/3 defect-detection and repair results, both verified workflows, pair IDs, model measurements, four run-receipt digests, an aggregate SHA-256 digest and direct comparison links. The digest binds the exact release version, source URL, immutable commit and downloadable source-archive hash shown on the page.
- Twenty-two automated tests and the public GitHub Actions workflow cover contracts, persisted pair identity, failure handling, tamper detection, release-source, commit and archive binding, concurrency, restart recovery, paired execution, judge-tour reload restoration and a real-Chrome smoke run.
- The [`architecture and trust-boundary map`](ARCHITECTURE.md) makes the authority split, execution boundary and fail-closed behavior reviewable without reading the implementation first.

## Design

- A clean public-demo visit opens directly on the strongest saved model-backed comparison without credentials or model spend. **Start 90-second tour** restores that exact pair, **Second workflow proof** opens the independent model-backed Fieldnotes comparison, and **Benchmark receipt** opens the portfolio certification from the same judge strip. The entry point also links to the public source and natural 1:47 two-workflow walkthrough.
- If saved model evidence is unavailable, the public demo disables the judge tour and marks the portfolio and model evidence unavailable. Browser-only checks remain usable without implying an NVIDIA model result.
- A controlled-benchmark release delta places the measured two resolutions and zero regressions directly below the result metrics.
- The comparison separates resolved, regressed, unchanged and unverified checks instead of collapsing them into one score.
- Every decision expands into its model hypothesis, reviewed expectation, observed behavior, reproduction steps, screenshots and receipt status. Changed checks also place the baseline and candidate observations and screenshots side by side.
- The responsive public UI and benchmark receipt were checked at 390 × 844 as well as desktop size, with no horizontal overflow. The receipt also has a dedicated print layout. The main keyboard path includes a visible skip link and moves focus to the judge-tour report.

## Potential impact

The initial audience is small product teams that review pull requests without dedicated QA. Their current evidence is often split across prose, test output and screenshots. Release Witness packages the release question into a durable artifact: what changed, what Chrome observed, what improved or regressed, and what remains untested. Across the appointment and Fieldnotes workflows, the controlled benchmark detected 3/3 seeded defects, classified 3/3 repairs, preserved three invariants and reported zero regressions. This demonstrates reuse of the evidence pipeline without estimating productivity gains that have not yet been measured.

## Quality of the idea

The model's useful role is deliberately narrower than the evidence system around it. Nemotron turns a change description into hypotheses tied to known behavior, but cannot manufacture coverage or overrule the browser. This makes AI assistance auditable: a judge can follow every model suggestion to an executed check and every verdict to evidence, while unknowns remain visible.

## Fast verification

1. Open the [public demo](https://release-witness.139-99-135-89.sslip.io); the exact appointment candidate and baseline are already selected.
2. Confirm the comparison reports two resolved checks, zero regressions, one unchanged check and one unverified boundary.
3. Open a resolved comparison check to inspect the baseline and candidate observations and screenshots together.
4. Open **Benchmark receipt** and confirm the aggregate digest, 3/3 result, pair IDs, four run receipts and 16 screenshots. Use either workflow card to open its exact comparison.
5. Review [`EVALUATION.md`](EVALUATION.md) for the ground-truth table and explicit limits.
6. Open the [model-backed Fieldnotes comparison](https://release-witness.139-99-135-89.sslip.io/#ae47fe51-8953-4fd7-b096-ae9ef91df395~79e33d76-c634-44f7-aebf-534d240bfa56) to verify the same model contract, runner and receipt path on another workflow.

Public source: https://github.com/K1Andayesh/release-witness

Natural-narration demo: https://youtu.be/O8Ijn85__6U
