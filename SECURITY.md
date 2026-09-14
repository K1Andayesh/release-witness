# Security

Release Witness is a local development tool. It binds to loopback and has no authentication, tenancy or public-hosting controls.

The bounded competition deployment uses public-demo mode. It exposes only active public manifests, disables model calls, filters saved history by that manifest catalog, and blocks direct access to excluded reports, comparisons, receipts, exports and evidence. This reduces accidental exposure from a reused artifact volume; it does not provide tenant isolation.

## Supported use

- Keep `.env` and `artifacts/` private. Reports can contain screenshots, target URLs and console output.
- Review manifests as source code. They control which pages and interactions the browser runner executes.
- Use dedicated test accounts and non-production data for mutating workflows.
- Keep remote-target manifests read-only. The validator rejects fill, select, click and double-click actions for HTTPS targets.
- Rotate the Nebius key if it is exposed. Do not include credentials in issues or reports.

## Reporting a vulnerability

Please report security issues privately to the repository owner rather than opening a public issue. Include the affected version, reproduction steps, impact and any suggested mitigation.
