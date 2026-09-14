# Competition evaluation — 14 September 2026

This evaluation uses two live NVIDIA Nemotron 3.5 Lightning calls per run through Nebius Token Factory and real isolated Chrome execution. The defects are deliberately seeded in the baseline fixture so detection and resolution can be scored against known ground truth.

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

Evidence IDs:

- Baseline: `75db5178-f87b-4d16-88e9-3e917f9a9a19`
- Candidate: `86f39150-bbd6-4039-b352-959da94e3097`

Receipts prove that the saved report fields and screenshots still match the captured artifact set. They are integrity checks rather than third-party signatures.

This is a controlled functional benchmark of the included scenario. It does not measure production defect prevalence, developer time saved, cross-browser behavior or user adoption.
