# Devpost submission draft

## Project name

Release Witness

## Tagline

A release result needs a receipt: browser QA for the change you are shipping.

## Track

Best Apps and Agents

## Inspiration

Small teams often review a pull request with a mix of intuition, stale checklists and screenshots that are difficult to reproduce. A passing test suite can still miss the workflow that matters, while an AI summary can sound confident without having observed the product. Release Witness was built to join those pieces: execute a bounded browser contract, preserve the evidence and let a model advise only within what was actually checked.

## What it does

Release Witness turns a developer's change description into a bounded risk map, then runs a baseline and candidate build as one release-review action using reviewed JSON workflow manifests. Each check runs in a fresh Chrome context and records the risk hypothesis, reproduction steps, expected and observed behavior, screenshots and console errors. The resulting report distinguishes pass, fail and not-tested coverage. It opens a comparison that classifies each check as resolved, regressed, unchanged or unverified, places changed evidence side by side, and freshly verifies both SHA-256 receipts against the reports and every screenshot on disk.

The included appointment demo starts with two seeded defects: a booking disappears after reload and a sold-out time can still be selected. The candidate repairs both while preserving required-name validation. A smaller Fieldnotes workflow demonstrates that the same model contract and runner execute another reviewed application without scenario-specific branches.

The first users are small product teams reviewing pull requests without a dedicated QA function. The product gives the reviewer a compact answer to three questions: what risk did the change create, what did Chrome actually observe, and which claims remain untested? A one-click judge tour opens the strongest saved Nemotron-backed comparison without requiring credentials or spending credits.

## Why the idea is different

The model's authority stops before the verdict. Nemotron must map the change to every reviewed check, but the manifest defines coverage, Chrome produces observations and deterministic assertions decide outcomes. The product's final artifact is therefore a release receipt that connects model reasoning, browser evidence, explicit unknowns and exact source provenance. A fluent model answer cannot turn missing evidence into confidence.

## How we built it

The application uses a loopback Node.js server, a dependency-light browser UI, Playwright with Google Chrome and validated JSON manifests. An allow-listed interpreter supports navigation, form actions, screenshots and explicit assertions. Reports are written atomically and survive restart.

NVIDIA Nemotron 3.5 Lightning runs through the Nebius Token Factory API. The first bounded call maps the change to a specific risk hypothesis for every known check and orders the complete catalog. After execution, the second call chooses an advisory next action from server-provided options. The model cannot add or omit a check, rewrite a browser result or turn unknown coverage into a pass. Invalid or unavailable model output is shown explicitly while the browser evidence remains usable.

## Challenges

The hardest part was keeping model assistance useful without letting it become the source of truth. Early free-form advice could invent unsupported work. We replaced it with strict schemas, allow-listed identifiers and server-owned wording. We also had to preserve useful reports across provider failures, browser failures and restarts, and distinguish an observed failure from a check that never ran.

## Accomplishments

- Detected 3/3 declared seeded defects and classified 3/3 repairs across two controlled workflows, while preserving three passing invariants, reporting zero observed regressions and keeping both excluded-coverage boundaries unverified.
- Verified the required NVIDIA/Nebius runtime across both applications: four receipted Nemotron 3.5 Lightning runs through Nebius Token Factory, 12 grounded risk hypotheses, four allow-listed advisories, 2,848 tokens and 7.49 seconds of measured model work.
- Demonstrated reuse on Harbour Appointments and Fieldnotes through validated manifests; the same model contract, browser runner and receipt path execute both without scenario-specific runner branches.
- Added a server-derived portfolio verifier that checks declared ground truth, durable pair relationships, four versioned run receipts and all 16 screenshot files before certifying the public 3/3 result.
- Bound the exact release, immutable Git commit and downloadable source-archive SHA-256 into a responsive, printable benchmark receipt with direct links to both comparisons and all four source run-receipt digests.
- Designed a one-click judge path from bounded model risk to browser observations, side-by-side repair evidence and explicit unknowns, verified on desktop and at 390 × 844 without horizontal overflow.
- Covered model schemas, provider failures, tampering, unsafe targets, concurrency, restart recovery, paired execution, public-demo isolation and the real-Chrome judge journey with 22 passing tests and public CI.

## What we learned

AI is most credible in release review when its authority is narrower than the evidence system around it. Structured choices, deterministic execution and visible unknowns produced a more useful result than asking a model to judge an application from prose alone.

## What's next

Next steps are authenticated team workspaces, encrypted evidence storage, more browser engines, reusable manifest tooling and integrations that attach a report to a pull request. Public hosting also needs authentication, tenant isolation, retention controls and a safe worker architecture before it can accept arbitrary projects.

## Built with

Node.js, JavaScript, Playwright, Google Chrome, NVIDIA Nemotron 3.5 Lightning and Nebius Token Factory.

## Nebius and NVIDIA feedback

Token Factory's OpenAI-compatible chat-completions interface made initial integration straightforward, and serving Nemotron without managing GPU infrastructure kept the prototype focused on the product. Model identity and token-usage fields were useful for preserving evidence. Nemotron produced useful prioritization when the task was tightly constrained, but concise structured output required disabling extended thinking and validating every identifier. Clearer model-specific examples for structured responses, reasoning-token behavior and trial-versus-billing status would reduce integration time. The product therefore treats provider output as bounded advice and keeps browser evidence useful when an inference fails.

## Submission-period work

Release Witness was created during the hackathon submission period. The application, manifests, runner, model contracts, evidence format, CLI and publication package in this repository are the competition work.

## Public links

- Source repository: https://github.com/K1Andayesh/release-witness
- Verified source release: https://github.com/K1Andayesh/release-witness/releases/tag/v0.1.32
- Working demo: https://release-witness.139-99-135-89.sslip.io
- Demo video, under three minutes: https://youtu.be/LVYa90poYM8

## Gallery asset

- Project cover: `public/assets/release-witness-cover-v1.jpg` — 1672 × 941, 16:9 landscape, 144 KB.
- Alt text: `Release Witness — Evidence before confidence. Abstract failed and resolved evidence cards connected by a receipt trail.`
- The cover is brand artwork rather than a product screenshot. The public demo and video remain the evidence of product behavior.
