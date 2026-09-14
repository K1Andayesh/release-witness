# Narrated demo video

The publication candidate is `artifacts/video/release-witness-demo-natural-v2.mp4`.

- Duration: 106.68 seconds
- Video: H.264 High, 1600 × 900, 25 fps
- Audio: AAC LC, mono, naturally paced Australian English narration
- Voice: `en-AU-WilliamMultilingualNeural`, friendly/positive catalog voice, rate -4%, pitch -2 Hz
- SHA-256: `1F4B0966956F42FEE88AE38E8726D4B23D87BA3AEEDFE8B144970E09546E0BD3`
- Captions: `artifacts/video/release-witness-demo-natural-v2.vtt`

The recording uses the public competition deployment and both saved live Nemotron evidence pairs. Narration and synchronized proof states cover the model's bounded role, deterministic browser verdicts, both workflows, the server-verified SHA-256 portfolio receipt, controlled ground truth and explicitly unverified coverage. It contains no credentials, private application data or customer data.

The final MP4 passed a complete FFmpeg decode. Eight visual proof states are cut to the narration chapter boundaries so page-load timing cannot move the evidence away from the spoken explanation. The same MP4 and WebVTT captions are available as versioned assets on the public v0.1.32 GitHub release.

Public YouTube video: https://youtu.be/O8Ijn85__6U

Run `npm run record:demo` to recreate the captioned WebM from the current public deployment. Narration and MP4 encoding are publication artifacts and are not required to run the product.
