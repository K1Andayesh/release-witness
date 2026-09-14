# Publication checklist

The local source package is ready for publication review. These remaining actions create or change external state and should be completed only when publication is authorized.

## Source

- [ ] Create a public GitHub, GitLab or Bitbucket repository.
- [x] Review the publication archive for secrets; `.env`, `artifacts/`, `node_modules/` and Git metadata are excluded. Remaining key-shaped values are explicitly synthetic QA fixtures.
- [x] Confirm `npm ci` and all 19 tests pass from a clean extraction of the publication archive.
- [ ] Push the source with the MIT license.
- [ ] Confirm GitHub Actions passes, including the Chrome smoke suite.

## Hosted demo

- [x] Deploy the bounded public demo on OVHcloud with the exact `PUBLIC_BASE_URL` and persistent artifact storage.
- [x] Keep the hosted build limited to the synthetic included scenarios. Local-only manifests and model calls are disabled.
- [ ] Keep a stable judging deployment available free of charge and without restriction through 15 December 2026.
- [x] Verify the demo through its public HTTPS URL without authentication or a Nebius key.

## Video and entry

- [x] Produce and inspect a 59.92-second 1600 × 900 narrated MP4 with visible captions, the verified receipt and no private data.
- [ ] Review `artifacts/video/release-witness-demo-narrated.mp4` and upload the approved file as a public YouTube video.
- [ ] Replace all three placeholders in `DEVPOST_DRAFT.md` with verified public links.
- [ ] Recheck the official rules, deadline, track requirements and personal eligibility immediately before submission.
- [ ] Paste the final copy into Devpost, preview every section and verify the source, demo and video links.
- [ ] Submit only after final user authorization, then preserve the visible submitted confirmation.
