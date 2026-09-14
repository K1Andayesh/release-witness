# Workflow manifests

Each JSON file in `manifests/` defines one bounded comparison suite. Restart the server after adding or editing a manifest. Invalid manifests stop startup rather than silently weakening coverage.

A manifest supplies an ID, display name, release question, default change description, exactly two builds, one to eight supported checks, and an explicit coverage boundary. A build target may be an included `/path`, an explicit local HTTP URL on `localhost` or `127.0.0.1`, or an HTTPS page. HTTPS targets must be entirely read-only: manifests containing `fill`, `select`, `click` or `doubleClick` are rejected.

Each check contains human-readable reproduction steps and one to twenty allow-listed actions. Supported actions are:

- `navigate` and `reload`
- `fill`, `select`, `click`, `doubleClick` and `waitFor`
- `screenshot` with stage `before` or `after`
- `assertCount`, `assertText`, `assertDisabled`, `assertVisible` and `assertHorizontalFit`

A check may set a viewport from 320–1920 pixels wide and 480–1200 pixels high. `assertHorizontalFit` measures the selected element against the current viewport bounds.

Locators use accessible `label`, `role`, `text` or `testId` fields. Assertions determine pass/fail. Navigation or browser-operation failure produces `not-tested`, preserving the distinction between an observed product failure and missing evidence.

Use `manifests/booking-v1.json` as the primary example. It demonstrates a local baseline/candidate pair with two independently repaired defects. `manifests/notes-v1.json` preserves the original smaller scenario and shows that the runner is reusable.

Manifests are trusted project configuration reviewed with the source. The browser blocks every request whose origin is neither the Release Witness server nor the exact selected target origin. Redirects to another origin and third-party resources are blocked, so keep remote checks narrow and resilient to nonessential external assets.
