# Nebius × NVIDIA Global AI Hackathon 2026 — initial brief

## Approval and current state

Keyvan approved this competition on 9 September 2026: “I approve both you have suggested”. Participation and starting the work are approved. This folder is the project home.

- Preparation: startup rules/access review and a dependency-free integration probe prepared on 9 September 2026. See docs/STARTUP.md and README.md.
- Registration: completed on 9 September 2026 as a solo participant. Devpost displayed "Thanks for registering!" and the hackathon project dashboard.
- Nebius account/model access: billing completed by the user; authenticated account showed a $1 trial with 29 days remaining. Authorized project key stored in ignored .env. Real NVIDIA Nemotron inference and HTTP 401 failure handling verified. See docs/STARTUP.md for response, usage and limitations.
- Implementation and UI testing: first local vertical slice built as Release Witness. Actual UI runs verified seeded failure, repaired pass, screenshot evidence, provider-truncation failure display and persistence over server restart. Broader M3 evaluation remains. See docs/QA.md.
- Submission package: source license, CI, security guidance, Devpost draft, demo script and publication checklist prepared locally on 14 September 2026. Public repository, hosted demo, video upload and final submission remain external publication actions and have not occurred.
- Proposed concept below is a starting direction, not a validated product specification.

## Competition facts

- [Competition overview](https://nebiusglobalaihackathon.devpost.com/)
- [Official rules](https://nebiusglobalaihackathon.devpost.com/rules)
- [Developer resources](https://nebiusglobalaihackathon.devpost.com/resources)
- Submission deadline: 30 October 2026 at 10:00 am PDT; **31 October 2026 at 4:00 am AEDT (Australia/Sydney)**.
- Internal completion target: **23 October 2026**, preserving a week for submission problems.
- Preferred starting track: **Best Apps and Agents**. Consider Coding and Agentic Engineering only if the implemented entry satisfies its Token Factory Sandbox requirements.
- Required integration: run through Nebius Token Factory or Nebius AI Cloud and use at least one NVIDIA open-source model. A real runtime inference call can satisfy the Nebius integration requirement described in the rules.
- Main cash prizes: US$20,000 / US$10,000 / US$6,000. Best Use of Tavily: US$3,000, only if earned through a qualifying integration.
- The advertised US$50,000 includes city awards linked to in-person attendance. Track awards are Jetson hardware, not cash; do not count them as accessible cash winnings.
- Judging: technological implementation, design, potential impact and quality of the idea.

Facts were researched from official pages on 9 September 2026. Recheck rules and deadlines before registration and submission. Individual Australian participation appears eligible under published exclusions; personal eligibility and conflicts still require verification.

## Constraints

- Work as Keyvan as an independent entrant, using only entrant-owned or properly licensed code and assets.
- **No Apple devices are available or to be purchased.** No Mac, iPhone, iPad, Apple Watch or paid cloud Mac dependency. Use Windows, a browser interface and a backend.
- No Physical AI track or hardware purchase planned. NVIDIA models run through the required provider; do not assume owning NVIDIA hardware is required.
- Verify actual provider/model availability, credit terms and costs before dependency-heavy implementation. The earlier US$150 estimate is not spending approval.
- Do not commit or push unless specifically asked. Prepare public artifacts locally before seeking any remaining publication authorization.
- No unapproved public posts, outreach or final submission. Registration and local implementation are approved, subject to actual eligibility and access. Do not ask for this same participation approval again.
- Coordinate milestones with Amazon and the existing Shipaton workload. Do not reuse a competition entry across events without verifying the rules and documenting original work.

## Proposed product and scope

An evidence-backed release-readiness agent that exercises a supplied web application, connects each detected issue to a reproducible observation and produces a reviewable release checklist.

Start with a controlled local test application and one supported stack. NVIDIA inference through Nebius should materially help choose checks, interpret observations or explain a finding. The demo must distinguish model suggestions from executed checks and verified outcomes.

Initial MVP:

1. Browser interface to start a check against the supplied test application.
2. A bounded set of real checks for important user workflows.
3. Backend model calls to an eligible NVIDIA model through Nebius.
4. Evidence capture: steps, observed versus expected behavior, relevant screenshots/logs and result state.
5. Release checklist with pass, fail and not-tested states; saved reports survive reload.
6. A repeatable seeded defect and successful recheck after a fix, demonstrating useful feedback.

Exclude arbitrary production targets, unrestricted shell execution, automatic deployment, unsupported stacks and claims that passing a small set of checks proves a whole application is safe to release. Do not build a coding agent unless it provides a clear advantage and meets the chosen track rules.

## Milestones and evidence

| Stage                       | Work                                                                                                                 | Exit evidence                                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| M0 — entry and integration  | Recheck eligibility/AI-tool rules, register, verify provider access and execute one NVIDIA model call through Nebius | Verified registration; actual model/provider identity, response, failure behavior and measured usage recorded without exposing secrets |
| M1 — specification          | Choose track, test app, bounded checks, architecture and cost controls                                               | Narrow spec; evaluation scenarios; clear mapping to mandatory integrations                                                             |
| M2 — working product        | Build the check-to-evidence-to-report workflow                                                                       | Browser-visible run with real executed checks and persisted results                                                                    |
| M3 — quality and evaluation | Test actual UI, seeded defects, false positives, timeout/provider failures and repeat runs                           | Reproducible findings, honest limitations and observed latency/cost                                                                    |
| M4 — entry package          | Prepare runnable source, license choice, demo access, feedback and video                                             | Reproducible package and draft submission; internal completion by 23 October                                                           |
| M5 — submit                 | Complete authorized publication and submission steps                                                                 | Visible submitted status and accessible final links                                                                                    |

Planning estimate: 15–22 focused build days plus 5–7 QA/demo days, with roughly 3–6 user hours for access, product decisions and review. Revise after M0; these are estimates, not demonstrated throughput.

## Submission checklist

- Working eligible NVIDIA/Nebius runtime integration and correct track selection.
- Working hosted demo or test build accessible to judges.
- Public GitHub, GitLab or Bitbucket source with an open-source license and setup/run instructions, once publication is authorized.
- Public YouTube video of at most three minutes showing the product working and explaining the required technology use.
- Project description and feedback on provider/model tooling.
- Written explanation of any significant update to pre-existing work.
- Final rule check, accessible demo during judging and saved submission confirmation.

## Next action

Complete the external publication sequence in `docs/PUBLISH_CHECKLIST.md`: create the public repository, harden and host an authenticated demo, record the sub-three-minute video, replace link placeholders, recheck the rules and submit after final authorization. The local product is available at http://127.0.0.1:4317.

## Local MVP handoff

The bounded local MVP, real-project read-only comparison and publication package are implemented. See docs/READINESS.md for current acceptance, docs/DEMO.md for a repeatable walkthrough and docs/QA.md for the evidence record.
