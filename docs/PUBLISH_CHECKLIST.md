# Publication checklist

The local source package is ready for publication review. These remaining actions create or change external state and should be completed only when publication is authorized.

## Source

- [x] Create the public GitHub repository: https://github.com/K1Andayesh/release-witness
- [x] Review the publication archive for secrets; `.env`, `artifacts/`, `node_modules/` and Git metadata are excluded. Remaining key-shaped values are explicitly synthetic QA fixtures.
- [x] Confirm `npm ci` and all 20 tests pass from a clean extraction of the publication archive.
- [x] Push the source with the MIT license.
- [x] Confirm GitHub Actions passes, including the Chrome smoke suite.

## Hosted demo

- [x] Deploy the bounded public demo on OVHcloud with the exact `PUBLIC_BASE_URL` and persistent artifact storage.
- [x] Keep the hosted build limited to the synthetic included scenarios. Local-only manifests and model calls are disabled.
- [ ] Keep a stable judging deployment available free of charge and without restriction through 15 December 2026.
- [x] Verify the demo through its public HTTPS URL without authentication or a Nebius key.

## Video and entry

- [x] Produce and inspect a naturally paced 93.29-second 1600 × 900 narrated MP4 with the verified receipt and no private data.
- [x] Upload the natural-narration MP4 publicly: https://youtu.be/LVYa90poYM8
- [x] Prepare and inspect a 1672 × 941 project cover for Devpost and social previews: `public/assets/release-witness-cover-v1.jpg`.
- [x] Replace all three publication links in `DEVPOST_DRAFT.md` with verified public URLs.
- [x] Recheck the official rules, deadline and Best Apps and Agents requirements on 14 September 2026. The deadline is 30 October 2026 at 10:00 PDT (31 October at 04:00 AEDT).
- [ ] Paste the final copy into Devpost, preview every section and verify the source, demo and video links.
- [ ] Submit only after final user authorization, then preserve the visible submitted confirmation.
