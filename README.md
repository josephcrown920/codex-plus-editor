# Codex Studio

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

The Create button opens image generation (FLUX.1 Schnell), video generation (Wan 2.2), motion transfer (Kling 2.6 Motion Control), and lip sync (Sync v2 Pro) through fal.ai. Connect a fal key in the panel; it is encrypted using the existing `AI_CONFIG_ENCRYPTION_KEY`. Generation is charged to the connected fal account, with no included Codex Studio credits. A saved key is not proof of model access or sufficient balance. No paid requests are made just by saving it.

Motion transfer takes public HTTPS character-image and reference-video URLs. Lip sync takes public HTTPS face-video and speech-audio URLs. These inputs are sent to fal. Model details and current pricing are linked in the panel. Completed media can be previewed, downloaded, and imported into the Library, then added to an unlocked timeline track. Jobs persist in R2 and can be checked after reopening the panel. Unconfirmed submissions must be checked in fal history before resubmitting; cancellation is a request and does not promise a refund.

Prompt optimization supports a free local template and an optional OpenAI-powered rewrite using the editing assistant's existing API connection. Both are reviewable before generation. Clip properties include color effects, pan/zoom presets, and visual fades, applied by the timeline renderer during preview and WebM export.

`/` and `/w` open the same signed-in editor. The public site's editor and API routes are restricted to the configured owner email (`AURORA_OWNER_EMAIL` in Sites runtime secrets). Existing projects, media, and connection records are preserved. No provider keys are embedded in the browser bundle.

Verification: TypeScript checking, editor model tests, and Miniflare runtime smoke tests with mocked OpenAI/fal responses. Real paid generation and browser rendering require additional live verification.

## Codex Studio project insights

The glass workspace uses cyan and violet accents, translucent panels, and readable surfaces. The sidebar and assistant include a prompt optimizer for timeline editing and generation. Free local optimization is available without credentials; optional AI optimization uses the connected OpenAI account. Optimized prompts are editable and are never submitted automatically.

Project insights automatically inspect timeline and media metadata after changes, with a toggle to pause automatic reviews. Local suggestions cover visual fades, motion on still images, gaps, and potentially loud background audio. The review does not watch footage or listen to audio. Each proposal supports Apply, Edit, and Ignore; no proposal changes the project until explicitly applied, and application enters the normal undo history. AI review is an explicit, separately billed action. Stale proposals are disabled when the project changes, and all modified proposals are validated before application.

## Version 5: media tools, provider adapters, and MCP

The workspace uses black glass, gold controls, and red accents. Create includes Topaz image/video upscaling (2×/4×), image face swap, character motion transfer, lip sync, and first/last-frame video. fal endpoints and their input fields were checked against provider OpenAPI schemas. BytePlus ModelArk connects directly to its documented task API for video and first/last-frame tasks; activate the configured model in your own BytePlus account. Outputs can expire; import them promptly. All provider jobs require an explicit UI submission and use provider billing.

Integrations adds encrypted Claude API and BytePlus ModelArk credentials. Claude discovers models from the key and plans edits using the same validated proposal format as OpenAI. Codex/ChatGPT can use the Site MCP plugin. The MCP server provides project reads, metadata review, validated timeline proposals, media-job proposals, and stored job status. Timeline proposals enter the agent inbox and remain unapplied until reviewed; media proposals open Create for explicit submission. No subscriptions or third-party credentials are supplied by this deployment.

The actual BytePlus AMK editor SDK is installed at `@byteplus/amk-editor@0.0.8`, initialized browser-side in `/byteplus`, and connected through an owner-authenticated server proxy. It requires an existing AMK backend, backend token, BytePlus project ID, and commercial license URL. It manages a separate BytePlus project; automatic conversion from the local canvas timeline is not implemented. Signing VOD APIs and configuring a commercial account remain the AMK backend's responsibility. See https://docs.byteplus.com/en/docs/byteplus-vod/integrating_video_editing_web_sdk .

HyperFrames uses `@hyperframes/player@0.8.149` to preview generated title compositions and exports their HTML. Its MP4 engine needs a Node/FFmpeg runtime outside Cloudflare Workers. The actual upstream Codex plugin is available at `/plugins/hyperframes-plugin.zip`, with source revision and checksum at `/plugins/hyperframes-plugin.json`. It was built using the upstream packaging script and is ready to upload into Codex; packaging does not install it. See https://github.com/heygen-com/hyperframes .

Sites connector eligibility discovery is absent in this tool environment, so existing ChatGPT app connections cannot be declared or enabled here. No arbitrary connector proxy or broad app grants were added. The independent provider APIs and Site MCP capability are implemented without bypassing that boundary.

Verification uses model tests, TypeScript, a production build, and mocked-provider runtime checks. Live paid generation, licensed AMK backend operations, browser rendering, external Claude/Codex OAuth connections, and hosted connector consent have not been verified.
