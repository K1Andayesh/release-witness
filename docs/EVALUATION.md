# Competition evaluation — 14 September 2026

This evaluation covers two independent included workflows with deliberately seeded baseline defects, repaired candidates and real isolated Chrome execution. The primary appointment pair uses two live NVIDIA Nemotron 3.5 Lightning calls per run through Nebius Token Factory. The Fieldnotes pair repeats the deterministic runner, comparison and receipt path without model calls, separating workflow reuse from the qualifying runtime proof.

The public homepage does not hard-code the portfolio result. Each workflow manifest declares its baseline, candidate, known defect IDs and invariant IDs. `/api/benchmark` selects the latest server-managed pair for each workflow, recomputes both evidence receipts, reads every screenshot from disk and checks the observed comparison states against that ground truth. The homepage shows the aggregate only when every workflow verifies. `/api/benchmark/report` renders the same verified state as a readable receipt, names all four underlying run-receipt digests and includes a deterministic SHA-256 digest over the ground truth, pair identities, comparison totals and verified run-receipt digests; its generation timestamp is intentionally outside the digest.

Current portfolio-verifier evidence:

- Harbour Appointments: baseline `b2998668-7680-4f95-9811-76b7e6132e6a`, candidate `790c7762-e9bf-4ab7-abdb-31854091c15d`
- Fieldnotes: baseline `223c548b-9eda-40cd-aed1-5716d6677adb`, candidate `56b5d993-1298-4272-9c68-0cf5e0356f15`

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
| End-to-end run time                 |   3.75 s |    2.96 s |
| Nemotron plan + advice latency      |   2.27 s |    1.52 s |
| Nemotron tokens                     |      721 |       739 |
| SHA-256 receipt verified            |      yes |       yes |

The server-managed paired workflow classified both seeded failures as resolved, the required-name invariant as unchanged, and excluded coverage as unverified. It produced zero regressions and did not convert unknown coverage into a pass. Both Nemotron plans covered all three allow-listed checks with a grounded hypothesis, and both advisories cited an allow-listed evidence ID. The pair relationship survives reloads, and the server independently recomputed each versioned report receipt and all eight screenshot hashes from disk before displaying verification.

The model received only the reviewed check catalog and expected behavior. It returned one validated risk hypothesis for every check and ordered the complete catalog. The browser runner still executed every check, and deterministic assertions produced every verdict. The post-run call selected one action from a server-owned catalog. Invalid model identifiers, omitted checks, provider failures and malformed outputs fail closed in the automated tests.

Appointment evidence IDs:

- Pair: `15ebbae0-7309-4607-a752-f9306afd0395`
- Baseline: `b2998668-7680-4f95-9811-76b7e6132e6a`
- Candidate: `790c7762-e9bf-4ab7-abdb-31854091c15d`

## Independent Fieldnotes pair

The current runner executed the same server-managed workflow against a separate notes application. The seeded build lost a saved note after reload; the candidate retained it. Blank-note validation and duplicate prevention passed in both builds, excluded authentication and browser coverage remained unverified, and the comparison reported one resolution with zero regressions. Both receipts and all eight screenshots verified from disk.

- Pair: `7fc874fb-8665-4baf-97e2-715f80757d3c`
- Baseline: `223c548b-9eda-40cd-aed1-5716d6677adb`
- Candidate: `56b5d993-1298-4272-9c68-0cf5e0356f15`
- End-to-end pair time: 3.14 s
- Model calls: none; this pair measures runner reuse rather than additional model behavior

Run receipts prove that the saved report fields and screenshots still match each captured artifact set. The portfolio receipt binds the verified run-receipt digests to the scored benchmark and changes if a covered result or receipt changes. These are integrity checks rather than third-party signatures.

This is a controlled functional benchmark of the two included scenarios. It does not measure production defect prevalence, developer time saved, cross-browser behavior or user adoption.
