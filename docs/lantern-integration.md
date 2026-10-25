# Recovered Lantern integration

The user supplied 13 recovered Lantern files from their InVideo build. Originals remain at /workspace/recovery/lantern. This is a partial source recovery, not InVideo's internal source code.

Merged components:
- packages/agent/src/index.ts -> lib/editor/production-graph.ts: intent classification, task graph and readiness helper. Missing upstream types were reconstructed locally. Uses Web Crypto rather than Node Crypto for browser compatibility. Specific music-video/short-film intents take precedence over generic phrases. Assembly depends on missing-input stages, existing scripts no longer reference an absent script node, and rendering follows revision. These are planning dependencies, not a complete workflow executor.
- Orchestrator displays this graph locally and the server provides it as a checklist to the existing bounded edit-agent tool loop. The existing edit approval, provider allowances and explicit generation/export controls remain authoritative.
- packages/storage/src/index.ts -> lib/object-store.ts: recovered ObjectStore contract with R2 implementation replacing Node filesystem/S3 SDK imports. Saved project-context reads now use this adapter. Media URLs require the existing owner authentication; they are not public URLs for external providers. Added object-key validation. Existing CAS workspace writes retain their original implementation to preserve conflict handling.

The root pnpm/Turbo/Docker configs and package-specific configs belong to a separate Hono/Postgres/Redis/Next monorepo. They are preserved as recovered originals, not layered over Codex Studio's working Sites build. Most Lantern application modules remain missing. No standalone Lantern backend, stock provider, new generation model or autonomous end-to-end rendering is claimed by this merge.

## Batch 1 integration
The full recovered shared contracts now live in lib/lantern/types.ts; the production graph imports AgentGraph, AgentNode and Craft from those originals instead of reconstructed types. Recovered provider contracts live in lib/lantern/providers/types.ts. ModelRouter is adapted for explicit provider selection, aspect/resolution/duration/reference/identity/budget filtering and development-only mock opt-in. It does not silently switch providers or retry submissions. The existing generation POST validates the requested provider through this router before recording/submitting a job; actual vendor requests, encrypted connections and idempotency remain in the existing job implementation.

The recovered mock and live stubs are retained in the independent Lantern export only. Stub model names and fabricated credit estimates are not promoted into production models or billing. The independent ZIP contains only recovered project files, without Codex Studio additions, chat exports or recovery notes. It remains incomplete until missing modules and package manifests arrive.
