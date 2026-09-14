# Startup evidence — 9 September 2026

## Observed state

- Workspace initially contained INITIAL.md only. Node v24.11.1 and Python 3.14.0 are installed.
- Devpost registration completed as a solo participant on 9 September 2026. Verified "Thanks for registering!" at https://devpost.com/submit-to/30790-nebius-x-nvidia-global-ai-hackathon/manage/submissions. No project submitted.
- Token Factory contact/profile onboarding completed following user confirmation. Company fields left blank, marketing opt-in off and zero data retention selected. The authenticated default-project workspace appeared; credit balance and API model access still need verification.
- User completed billing. Authenticated workspace then displayed a $1 trial allowance with 29 days remaining. It states that post-trial usage automatically becomes paid; no paid usage authorization has been granted to the agent.
- User explicitly authorized creation and local storage of the project API key. Key named nebius-hackathon-local exists in default-project; secret stored in ignored .env without printing it. No secret is included in evidence files.
- No NEBIUS environment-variable names were present in the current process.
- Public provider UI advertised nvidia/Nemotron-3_5-Lightning at approximately $0.06 per million input tokens and $0.24 per million output tokens. These are catalog observations, not verified account billing terms or spending approval.

## Rules rechecked

Sources: https://nebiusglobalaihackathon.devpost.com/rules and https://nebiusglobalaihackathon.devpost.com/resources

Submission closes 31 October 2026 at 04:00 AEDT. Maintain the 23 October internal target. A runtime Token Factory call plus an NVIDIA open-source model is required; Best Apps and Agents specifies Nemotron. The coding track requires Token Factory Sandboxes. Retain the proposed apps track pending final product fit.

Australia is not explicitly listed among excluded locations. Personal age, conflict and residency eligibility still need verification. No explicit AI-assistance prohibition was found in the reviewed rules; original-work ownership and third-party licensing obligations still apply. This is a recorded reading, not an organizer ruling.

Judging access must remain available through 15 December 2026. Prepare public source with an open-source license, a working demo and a public video shorter than three minutes. Publication and final submission remain separate authorization steps.

## Next steps

1. Registration complete; retain the confirmation above.
2. Before sustained development, obtain hackathon Builder credits or define a separate approved budget. The small trial proves integration but is not the build budget. Review the post-trial paid-usage preference.
3. API configuration and initial inference are complete. Recheck trial availability before further batches; the local approval flag is a manual gate, not a live balance check.
4. M0 integration proof is complete based on the evidence below. Provider dashboard accounting may lag; calculated costs are not an invoice.
5. Narrow M1 to a controlled synthetic notes app: save/reload persistence, empty-input validation and duplicate-submission behavior. Separate executed findings from model suggestions. Use a seeded persistence defect, then demonstrate a successful recheck after its repair.

No production targets, hardware purchases or dedicated GPU endpoints are needed for this initial proof.

## M0 runtime evidence

All calls used https://api.tokenfactory.nebius.com/v1 and nvidia/Nemotron-3_5-Lightning on 9 September 2026. These are synthetic observations supplied to a model; no application browser test has yet executed.

- artifacts/nebius-probe-1788931319280.json: HTTP 200, but the 256-token response was truncated during reasoning. This is connectivity evidence only. The probe now rejects non-stop finish reasons and mismatched model identities.
- artifacts/nebius-probe-1788931355114.json: complete answer, but it speculated about client-side storage without evidence. Grounding instructions were tightened; this answer is not the accepted quality example.
- artifacts/nebius-probe-1788931375800.json: accepted initial answer; HTTP 200, returned model matches, finish_reason=stop. Inference latency 3326 ms; 122 prompt tokens and 845 completion tokens, including 792 reasoning tokens. It correctly describes loss of persistence and labels a repeat check as a suggestion, without inventing a root cause. One example establishes integration, not general model quality.
- artifacts/nebius-probe-1788931363194.json: deliberately invalid synthetic key received HTTP 401; script exited nonzero, persisted a blocked report and made no inference request.
- Three inference calls totaled 278 input and 1386 output tokens. At the displayed approximate $0.06/$0.24 per million input/output rates, estimated consumption is $0.00034932, covered by the observed trial. Actual account metering still needs reconciliation.
- Billing dashboard inspection after the calls showed "Billing: Suspended", $0.00 balance and "No usage", while the header continued to show a $1 trial with 29 days remaining. The successful HTTP 200 inference calls are verified; sustained billing readiness is not. This could reflect separate trial/paid billing states or delayed accounting, but that explanation is unverified. Resolve before sustained runs; no top-up or paid billing change made.

API behavior reference: https://docs.tokenfactory.nebius.com/api-reference/inference/create-chat-completion

## Billing resolution and first product slice

On 9 September, following the user's update, the authenticated Prices page visibly showed Billing: Active, a $0 cash balance and $1 trial allowance with 29 days remaining. This resolves the previously observed suspended state. The small prototype calls use the observed trial allowance; no paid-budget expansion was authorized.

The first local product slice is now implemented and verified through Chrome. See SPEC.md and QA.md. A real model truncation failure led to using chat_template_kwargs.enable_thinking=false for this concise interpretation step; observed reasoning token usage became zero. NVIDIA reference: https://docs.nvidia.com/nim/large-language-models/2.0.10/get-started/advanced/get-started-nemotron-3.5-lightning.html
