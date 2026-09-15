# Release Witness

[![CI](https://github.com/K1Andayesh/release-witness/actions/workflows/ci.yml/badge.svg)](https://github.com/K1Andayesh/release-witness/actions/workflows/ci.yml)
[![Live demo](https://img.shields.io/badge/live_demo-open-193925)](https://release-witness.139-99-135-89.sslip.io)
[![Demo video](https://img.shields.io/badge/demo_video-watch-c4302b)](https://youtu.be/O8Ijn85__6U)

![Release Witness — Evidence before confidence](public/assets/release-witness-cover-v1.jpg)

A PR-preview QA agent that turns a change description into a bounded risk map, executes the same reviewed browser contract against a baseline and candidate, and compares the evidence. NVIDIA Nemotron through Nebius maps the change to every reviewed check and chooses a constrained advisory next action; deterministic browser assertions own every verdict.

**Public competition demo:** https://release-witness.139-99-135-89.sslip.io

**Natural-narration demo video:** https://youtu.be/O8Ijn85__6U

**Verified source release:** https://github.com/K1Andayesh/release-witness/releases/tag/v0.1.34

**Required runtime:** saved qualifying runs show `nvidia/Nemotron-3_5-Lightning` executing through Nebius Token Factory, including returned model identity, provider, latency and token usage. The hosted judge tour replays those verified records without requiring credentials or spending judge credits.

## Judge evidence map

| Criterion                    | Shipped evidence                                                                                                                                              | Fastest verification                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technological implementation | Four receipt-verified Nemotron calls through Nebius, strict model schemas, isolated Chrome checks, versioned run receipts and a source-bound portfolio digest | [Benchmark receipt](https://release-witness.139-99-135-89.sslip.io/api/benchmark/report) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)                                                     |
| Design                       | One-click baseline/candidate review, side-by-side changed evidence, explicit unknowns, responsive judge view and printable receipt                            | [Appointment comparison](https://release-witness.139-99-135-89.sslip.io/#790c7762-e9bf-4ab7-abdb-31854091c15d~b2998668-7680-4f95-9811-76b7e6132e6a)                                             |
| Potential impact             | A release-review artifact for small product teams: change risk, observed behavior, repair status and untested boundaries in one place                         | [Two-workflow evaluation](docs/EVALUATION.md)                                                                                                                                                   |
| Quality of idea              | The model must cover the reviewed catalog but cannot invent checks or decide outcomes; every claim remains traceable to browser evidence                      | [`docs/JUDGING.md`](docs/JUDGING.md) and the [Fieldnotes comparison](https://release-witness.139-99-135-89.sslip.io/#ae47fe51-8953-4fd7-b096-ae9ef91df395~79e33d76-c634-44f7-aebf-534d240bfa56) |

## Verified benchmark

Across two included ground-truth workflows, Release Witness detected **3/3 known defects (100%)** and correctly classified **3/3 repairs (100%)**, with **zero observed regressions**. It preserved three passing invariants, kept both excluded-coverage boundaries unverified and freshly verified all 16 screenshot hashes. Both benchmark pairs record **four receipt-verified Nemotron runs, 12 grounded risk hypotheses and four allow-listed advisories** through Nebius Token Factory, covering 2,848 tokens and 7.49 seconds of measured model work. The homepage reads these figures from the [server-derived benchmark endpoint](https://release-witness.139-99-135-89.sslip.io/api/benchmark), which checks manifest ground truth, paired results, four run receipts and every screenshot file before certifying the portfolio. A [human-readable benchmark receipt](https://release-witness.139-99-135-89.sslip.io/api/benchmark/report) presents the verified result, exact workflow and pair identities, measured model contribution, all four run-receipt digests and a deterministic aggregate SHA-256 digest that also binds the exact release version, source URL, immutable Git commit and downloadable source-archive hash. Each workflow card links to its exact baseline-to-candidate comparison, and the page is designed for desktop, mobile and print review. These figures describe the controlled included scenarios; they are not a claim about all production defects. See [`docs/EVALUATION.md`](docs/EVALUATION.md), the [model-backed appointment comparison](https://release-witness.139-99-135-89.sslip.io/#790c7762-e9bf-4ab7-abdb-31854091c15d~b2998668-7680-4f95-9811-76b7e6132e6a) and the [model-backed Fieldnotes comparison](https://release-witness.139-99-135-89.sslip.io/#ae47fe51-8953-4fd7-b096-ae9ef91df395~79e33d76-c634-44f7-aebf-534d240bfa56).

The competition case is mapped directly to the four equally weighted judging criteria in [`docs/JUDGING.md`](docs/JUDGING.md).

The [`architecture and trust-boundary map`](docs/ARCHITECTURE.md) shows the full path from change description and bounded Nemotron planning to isolated Chrome assertions, durable receipts and a freshly verified release comparison.

## Run

Requires Node.js 22+ and installed Google Chrome.

```powershell
npm ci
npm start
```

Open http://127.0.0.1:4317. Fresh checkouts need a local `.env` copied from `.env.example`. Without model credentials, uncheck Nemotron and run the browser suite independently. Never publish `.env` or local artifacts.

For a headless pass/fail check suitable for CI:

```powershell
npm run witness -- --suite booking-v1 --build candidate --change "Verify the repaired appointment candidate."
```

The command exits `0` only when every supported check passes, `1` for a failure or incomplete result, and `2` for invalid input or a runner error. Use `--help` for all options.

The default Harbour Appointments scenario has a baseline with two seeded defects and a repaired candidate. **Run baseline + candidate** executes the pair sequentially and opens the comparison automatically. Booking persistence and sold-out availability change from fail to pass; required-name validation remains passing; excluded coverage stays unverified. The candidate is supplied by the demo, not repaired automatically.

For judges, a clean public-demo visit opens the current model-backed appointment candidate with its exact server-managed baseline already selected. **Start 90-second tour** returns to that strongest pair, **Second workflow proof** opens the independent model-backed Fieldnotes pair, **Exact deployed source** resolves to the immutable commit running in production, and **Benchmark receipt** exposes the portfolio totals, pair IDs, measured model contribution and aggregate digest from the same judge strip. Across both pairs, four versioned server-verified SHA-256 receipts cover report decisions, returned model, Nebius provider, timing, token totals and every stored screenshot hash. See `docs/EVALUATION.md` for scope and evidence IDs.

Workflow definitions live in `manifests/`. They use a small allow-listed browser action language and may target included paths, explicit local HTTP preview URLs or read-only HTTPS pages. Add a validated JSON manifest and restart the server; runner code does not need a scenario-specific branch. See `docs/MANIFESTS.md`.

Saved JSON and screenshots survive restart under ignored `artifacts/runs/`. Completed runs receive a versioned SHA-256 receipt; the server recomputes the report digest and reads every screenshot from disk before showing the verified badge. The current receipt schema covers browser decisions, model identity, provider, timing, tokens and screenshot hashes. This proves internal artifact consistency, not who produced the files. View report opens readable Markdown text and includes the hashes; Download report requests a Markdown attachment.

## Verification

```powershell
npm run check
npm test
npm run format:check
```

Twenty-two contract/failure tests pass. Actual Chrome verification covers the server-managed paired-run workflow, persisted pair identity, judge-tour comparison restoration after reload, receipt verification and tamper detection, release-source, commit and archive binding, both appointment defects, the repaired candidate, before/after comparison, model-budget gating, model planning/advice, provider-failure fallback and public-demo restrictions. See `docs/QA.md`, `docs/DEMO.md` and `docs/READINESS.md`.

## Model and scope controls

The eligible model is `nvidia/Nemotron-3_5-Lightning`. Each model-enabled run uses two bounded calls: risk map then advice. The risk map must include every allow-listed check exactly once and a short hypothesis tied to its expected behavior. Every supported check still executes. Advisory choices cannot invent checks or alter browser outcomes. Invalid or unavailable model responses are displayed explicitly; the browser suite remains usable.

A persistent configurable development ledger, 1600 output-token limit per call, 45-second timeout and no retries bound use. Model-enabled runs require two remaining calls so a partial plan-only run cannot begin. The hosted demo disables live calls and presents saved verified model records; local operators set their own bounded allowance after reviewing provider access and budget. Standalone integration probes are separate from this ledger. It is not a live billing integration.

The server binds loopback. Mutating workflows may target only included paths or explicit `http://localhost`/`http://127.0.0.1` previews. Explicit HTTPS targets are accepted only when every action is read-only, and the runner blocks all origins except the Release Witness server and exact target origin. One server owns each artifact directory. This MVP has no authentication and is not prepared for public multi-user hosting.

The repository includes an MIT license, CI workflow, security guidance, a Devpost draft, a sub-three-minute demo script and a publication checklist. The bounded public demo is deployed on OVHcloud.

For a hosted competition test build, use the supplied `Dockerfile` and follow `docs/DEPLOYMENT.md`. Public demo mode disables model calls and hides saved runs, reports, comparisons, receipts, exports and evidence when their suite is not in the active public manifest catalog. It is suitable for the synthetic included scenarios; it is not a multi-tenant service for private projects.
