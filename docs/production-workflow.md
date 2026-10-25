# Codex Editor production workflow

Open `/w?view=producer`. Create a free local outline from a brief or explicitly request a model-written shot list using a connected chat provider. Saved, enabled project context is included in model planning; asset metadata is available, but this does not inspect footage pixels.

Review the shots, sources, narration, captions and optional library music. Save edits, set a maximum number of media requests, approve, and build. The request cap is not a currency budget: each provider charges its own account. Existing library visuals need no generation. AI planning and narration may incur their respective provider charges.

Runs persist with revisions. Each media submission is claimed before dispatch and uses a stable ID. Concurrent steps cannot submit the same shot twice. Pause stops new work; it cannot undo accepted provider requests. Unconfirmed submissions are never retried automatically. Check provider history before explicitly replacing a failed shot. Temporary status failures can be refreshed against the same provider request.

Completed media is stored privately. Import and assemble appends a sequence to the unchanged source timeline as one undoable edit. Changed timelines require a new plan. Narration timing is checked against video duration and supported speed limits. Library assets can be reused, and unused assets can be removed from the library without deleting saved media.

Library references shared with generation vendors use signed links valid for one hour. Keys remain server-side. MCP can create and read production drafts and return project-specific review links; those tools do not dispatch paid media jobs.

Export uses browser canvas and MediaRecorder. WebM is supported where the browser supports MediaRecorder; MP4 is offered only when that browser advertises an MP4 encoder. Export runs in real time. This is not a distributed background render farm.

## Verification

The runtime suite uses mocked vendor responses and real Worker/R2 emulation. It checks authorization, encrypted credentials, signed media and ranges, durable runs, request caps, concurrent claims, pause/resume, idempotent completed steps, and replacement narration storage. Pure timeline tests cover assembly, stale timeline rejection, source bounds, music and captions. Paid vendor generation, real browser recording, visual responsive QA and optional external sandbox services are not validated by these tests. Vendor credentials, available models, account quota and commercial SDK licences remain external requirements.
