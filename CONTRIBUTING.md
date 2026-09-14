# Contributing

Release Witness welcomes focused fixes and new bounded workflow examples.

1. Use Node.js 22 or newer and install dependencies with `npm ci`.
2. Keep secrets in `.env`; start from `.env.example`.
3. Add workflows as validated JSON under `manifests/`. Keep remote targets read-only.
4. Run `npm run check`, `npm test` and `npm run format:check` before proposing a change.
5. Include the behavior being changed, the evidence used to verify it and any coverage that remains unknown.

Do not add unrestricted script execution, arbitrary network access or claims that a bounded passing suite proves an entire release is safe.
