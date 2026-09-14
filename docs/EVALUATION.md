# Competition evaluation — 14 September 2026

This evaluation covers two independent included workflows with deliberately seeded baseline defects, repaired candidates and real isolated Chrome execution. The primary appointment pair uses two live NVIDIA Nemotron 3.5 Lightning calls per run through Nebius Token Factory. The Fieldnotes pair repeats the deterministic runner, comparison and receipt path without model calls, separating workflow reuse from the qualifying runtime proof.

The public homepage does not hard-code the portfolio result. Each workflow manifest declares its baseline, candidate, known defect IDs and invariant IDs. `/api/benchmark` selects the latest server-managed pair for each workflow, recomputes both evidence receipts, reads every screenshot from disk and checks the observed comparison states against that ground truth. The homepage shows the aggregate only when every workflow verifies.

Current portfolio-verifier evidence:

- Harbour Appointments: baseline `cd0f86d0-ad51-4e77-9a43-5785e0e8889f`, candidate `75e488db-93c7-4c2b-a1af-826fcb3ccdd2`
- Fieldnotes: baseline `9f67a852-c07e-444d-8d4c-dcc01302a2aa`, candidate `b417a60d-f983-4e66-b474-4ea86834c14e`

The current aggregate check completes in approximately 11 ms on the local evidence store. The separate qualifying appointment pair below preserves the live Nemotron/Nebius runtime evidence.

| Ground-truth result            | Harbour Appointments | Fieldnotes | Portfolio |
| ------------------------------ | -------------------: | ---------: | --------: |
| Known seeded defects           |                    2 |          1 |       3/3 |
| Defects reported               |                    2 |          1 |       3/3 |
| Repairs classified as resolved |                    2 |          1 |       3/3 |
| Passing invariants preserved   |                    1 |          2 |         3 |
| Regressions reported           |                    0 |          0 |         0 |
| Excluded boundaries unverified |                    1 |          1 |         2 |
| Screenshot files verified      |                    8 |          8 |        16 |

## Qualifying appointment pair

| Measure                             | Baseline | Candidate |
| ----------------------------------- | -------: | --------: |
| Known seeded defects                |        2 |         0 |
| Defects reported                    |        2 |         0 |
| Existing invariant reported passing |        1 |         1 |
| Browser screenshots                 |        4 |         4 |
| End-to-end run time                 |   3.51 s |    2.85 s |
| Nemotron plan + advice latency      |   2.18 s |    1.49 s |
| Nemotron tokens                     |      716 |       726 |
| SHA-256 receipt verified            |      yes |       yes |

The server-managed paired workflow classified both seeded failures as resolved, the required-name invariant as unchanged, and excluded coverage as unverified. It produced zero regressions and did not convert unknown coverage into a pass. The pair relationship survives reloads, and the server independently recomputed each report receipt and all eight screenshot hashes from disk before displaying verification.

The model received only the reviewed check catalog and expected behavior. It returned one validated risk hypothesis for every check and ordered the complete catalog. The browser runner still executed every check, and deterministic assertions produced every verdict. The post-run call selected one action from a server-owned catalog. Invalid model identifiers, omitted checks, provider failures and malformed outputs fail closed in the automated tests.

Appointment evidence IDs:

- Baseline: `75db5178-f87b-4d16-88e9-3e917f9a9a19`
- Candidate: `86f39150-bbd6-4039-b352-959da94e3097`

## Independent Fieldnotes pair

The current v0.1.13 runner executed the same server-managed workflow against a separate notes application. The seeded build lost a saved note after reload; the candidate retained it. Blank-note validation and duplicate prevention passed in both builds, excluded authentication and browser coverage remained unverified, and the comparison reported one resolution with zero regressions. Both receipts and all eight screenshots verified from disk.

- Baseline: `9f67a852-c07e-444d-8d4c-dcc01302a2aa`
- Candidate: `b417a60d-f983-4e66-b474-4ea86834c14e`
- End-to-end pair time: 2.44 s
- Model calls: none; this pair measures runner reuse rather than additional model behavior

Receipts prove that the saved report fields and screenshots still match the captured artifact set. They are integrity checks rather than third-party signatures.

This is a controlled functional benchmark of the two included scenarios. It does not measure production defect prevalence, developer time saved, cross-browser behavior or user adoption.
