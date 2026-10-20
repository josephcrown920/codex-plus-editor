# Aurora Studio

A private Codex-inspired video editing workspace built with React, TypeScript, Vinext and Cloudflare Workers.

## Working features

- Media imports to R2 (100 MB per file), D1 project metadata with optimistic revision checks.
- Layered video/image, text and audio tracks; trimming, splitting, moving, duplication, track mute/visibility/lock, transformations and undo/redo.
- Canvas preview composed from the project model, synchronized video/audio playback and real-time WebM export with mixed audio.
- Rule-based local commands and optional OpenAI Responses API editing plans, approval, browser speech recognition input, feature-detected WebMCP tools.
- Project JSON import/export. JSON references media in this workspace; it does not bundle the original media.

## Current limits

- Connect an OpenAI API key in Assistant settings to use account-available GPT models. Keys are encrypted with AES-256-GCM using the server-only AI_CONFIG_ENCRYPTION_KEY secret. Local commands remain available. AI sees instructions and timeline metadata, not footage.
- MP4 rendering, scheduled jobs, ComfyUI, generation plugins and AI voice replies are not enabled.
- Browser video/audio format support determines playback. WebM recording requires MediaRecorder and canvas captureStream; keep the tab visible during real-time export.
- 30 fps exports: landscape 1280 × 720, portrait 720 × 1280, square 1080 × 1080.

## Development

Use the package manager in the lockfile. `node --experimental-strip-types tests/editor.test.mjs` checks editing invariants. `node node_modules/typescript/bin/tsc --noEmit` checks types. Sites build and hosting scripts own production publishing.

Schema changes use Drizzle migrations. Production migrations are immutable once applied.

## Create studio (version 3)

The Create button opens image generation (FLUX.1 Schnell), video generation (Wan 2.2), motion transfer (Kling 2.6 Motion Control), and lip sync (Sync v2 Pro) through fal.ai. Connect a fal key in the panel; it is encrypted using the existing `AI_CONFIG_ENCRYPTION_KEY`. Generation is charged to the connected fal account, with no included Aurora credits. A saved key is not proof of model access or sufficient balance. No paid requests are made just by saving it.

Motion transfer takes public HTTPS character-image and reference-video URLs. Lip sync takes public HTTPS face-video and speech-audio URLs. These inputs are sent to fal. Model details and current pricing are linked in the panel. Completed media can be previewed, downloaded, and imported into the Library, then added to an unlocked timeline track. Jobs persist in R2 and can be checked after reopening the panel. Unconfirmed submissions must be checked in fal history before resubmitting; cancellation is a request and does not promise a refund.

Prompt optimization supports a free local template and an optional OpenAI-powered rewrite using the editing assistant's existing API connection. Both are reviewable before generation. Clip properties include color effects, pan/zoom presets, and visual fades, applied by the timeline renderer during preview and WebM export.

`/` and `/w` open the same signed-in editor. The public site's editor and API routes are restricted to the configured owner email (`AURORA_OWNER_EMAIL` in Sites runtime secrets). Existing projects, media, and connection records are preserved. No provider keys are embedded in the browser bundle.

Verification: TypeScript checking, editor model tests, and Miniflare runtime smoke tests with mocked OpenAI/fal responses. Real paid generation and browser rendering require additional live verification.
