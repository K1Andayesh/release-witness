# Public demo deployment

Current deployment: https://release-witness.139-99-135-89.sslip.io on OVHcloud, served by Caddy from loopback port 4317.

- systemd service: `release-witness.service`
- service account: `releasewitness`
- application root: `/srv/release-witness`
- persistent evidence: `/srv/release-witness/shared/artifacts`
- browser runtime: Playwright Chromium 153.0.8010.12
- active release: `20260914T043000Z`

The included container runs a deliberately bounded public demo. It exposes the synthetic Harbour Appointments and Fieldnotes suites, excludes manifests marked `localOnly`, and disables model calls even if a key is accidentally present. Saved model evidence remains available only when it is deliberately included in the deployment's artifact volume.

## Required configuration

Build the supplied `Dockerfile`, expose container port 4317 and mount persistent storage at `/app/artifacts` if reports should survive a restart. Set:

```text
PUBLIC_BASE_URL=https://your-public-host.example
```

The image already sets:

```text
HOST=0.0.0.0
PORT=4317
BROWSER_CHANNEL=chromium
PUBLIC_DEMO_MODE=true
NEBIUS_INFERENCE_APPROVED=false
```

Terminate TLS at the hosting platform or reverse proxy. `PUBLIC_BASE_URL` is also the only extra host and browser origin accepted by the server, so use the exact externally visible origin without a path.

## Verification

After deployment, use a signed-out browser to confirm:

1. `/api/status` returns HTTP 200 and reports model access unavailable.
2. The catalog contains the self-contained Harbour Appointments and Fieldnotes workflows.
3. The repaired appointment candidate completes with three passes and explicit untested coverage.
4. View report and screenshot links use the public origin and survive a restart when storage is mounted.
5. Requests with another Host or Origin receive HTTP 403.

This mode is a competition test build, not a general hosted QA service. Do not add private targets, customer data or credentials to its manifests or artifact volume. Authentication, tenant isolation, encrypted storage, retention controls and isolated workers are required before offering arbitrary projects to multiple users.

## Update procedure

Create a timestamped directory under `/srv/release-witness/releases`, install from `package-lock.json`, link its `artifacts` directory to `../../shared/artifacts`, update `/srv/release-witness/current`, and restart only `release-witness.service`. Validate any Caddy change as a temporary combined configuration before installing it. Keep the previous release and the Caddy backup until the new public run passes.
