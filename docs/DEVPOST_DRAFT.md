# Devpost submission draft

## Project name

Release Witness

## Tagline

Evidence-backed browser QA for the change you are about to ship.

## Track

Best Apps and Agents

## Inspiration

Small teams often review a pull request with a mix of intuition, stale checklists and screenshots that are difficult to reproduce. A passing test suite can still miss the workflow that matters, while an AI summary can sound confident without having observed the product. Release Witness was built to join those pieces: execute a bounded browser contract, preserve the evidence and let a model advise only within what was actually checked.

## What it does

Release Witness turns a developer's change description into a bounded risk map, then runs a baseline and candidate build as one release-review action using reviewed JSON workflow manifests. Each check runs in a fresh Chrome context and records the risk hypothesis, reproduction steps, expected and observed behavior, screenshots and console errors. The resulting report distinguishes pass, fail and not-tested coverage. It opens a comparison that classifies each check as resolved, regressed, unchanged or unverified, places changed evidence side by side, and freshly verifies both SHA-256 receipts against the reports and every screenshot on disk.

The included appointment demo starts with two seeded defects: a booking disappears after reload and a sold-out time can still be selected. The candidate repairs both while preserving required-name validation. A smaller Fieldnotes workflow demonstrates that the same runner executes another reviewed contract without scenario-specific branches.

The first users are small product teams reviewing pull requests without a dedicated QA function. The product gives the reviewer a compact answer to three questions: what risk did the change create, what did Chrome actually observe, and which claims remain untested? A one-click judge tour opens the strongest saved Nemotron-backed comparison without requiring credentials or spending credits.

## How we built it

The application uses a loopback Node.js server, a dependency-light browser UI, Playwright with Google Chrome and validated JSON manifests. An allow-listed interpreter supports navigation, form actions, screenshots and explicit assertions. Reports are written atomically and survive restart.

NVIDIA Nemotron 3.5 Lightning runs through the Nebius Token Factory API. The first bounded call maps the change to a specific risk hypothesis for every known check and orders the complete catalog. After execution, the second call chooses an advisory next action from server-provided options. The model cannot add or omit a check, rewrite a browser result or turn unknown coverage into a pass. Invalid or unavailable model output is shown explicitly while the browser evidence remains usable.

## Challenges

The hardest part was keeping model assistance useful without letting it become the source of truth. Early free-form advice could invent unsupported work. We replaced it with strict schemas, allow-listed identifiers and server-owned wording. We also had to preserve useful reports across provider failures, browser failures and restarts, and distinguish an observed failure from a check that never ran.

## Accomplishments

- Achieved 100% detection (2/2) and 100% repair classification (2/2) on the included ground-truth benchmark, with zero observed regressions and no unknown coverage converted into a pass.
- Demonstrated two independent defects changing from fail to pass with visible screenshots and reproduction steps.
- Added a one-click judge tour from live model risk to browser evidence to baseline/candidate resolution.
- Added a durable server-managed baseline/candidate workflow and freshly verified evidence receipts with screenshot-level SHA-256 hashes.
- Preserved explicit not-tested boundaries throughout reports and comparisons.
- Added a fail-closed CLI and automated contract/failure tests.
- Integrated the required NVIDIA model through Nebius with bounded calls, no retries and a persistent development allowance.
- Scored the controlled appointment benchmark against known ground truth: 2/2 seeded defects detected, 2/2 fixes classified as resolved, one invariant preserved and zero regressions reported. Model-enabled runs completed in 3.51 and 2.85 seconds, with both receipts and all eight screenshots verified.

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
- Working demo: https://release-witness.139-99-135-89.sslip.io
- Demo video, under three minutes: https://youtu.be/LVYa90poYM8
