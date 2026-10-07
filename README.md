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
