const SPACE_ROOT = 'https://kaidjuric-cogvideox-5b-text-to-video.hf.space';
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function videoUrlFrom(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = videoUrlFrom(item);
      if (found) return found;
    }
    return undefined;
  }
  if (!isRecord(value)) return undefined;
  const video = value.video;
  if (isRecord(video) && typeof video.url === 'string') return video.url;
  for (const child of Object.values(value)) {
    const found = videoUrlFrom(child);
    if (found) return found;
  }
  return undefined;
}

function trustedSpaceFileUrl(raw: string): URL {
  const url = new URL(raw, SPACE_ROOT);
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !(url.hostname === 'hf.space' || url.hostname.endsWith('.hf.space')) ||
      !url.pathname.startsWith('/gradio_api/file=')) {
    throw new Error('CogVideoX returned an unexpected media URL');
  }
  return url;
}

export async function submitCogVideoX(prompt: string, fetchImpl: typeof fetch = fetch): Promise<string> {
  const response = await fetchImpl(`${SPACE_ROOT}/gradio_api/call/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: [prompt, 50, 49, 6, '', -1] }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).slice(0, 300);
    throw new Error(`Hugging Face CogVideoX submission failed (${response.status}). The public free demo may be busy or its visitor quota may be exhausted.${detail ? ` ${detail}` : ''}`);
  }
  const payload = await response.json() as { event_id?: unknown };
  if (typeof payload.event_id !== 'string' || !payload.event_id) throw new Error('CogVideoX did not return a job ID');
  return payload.event_id;
}

export async function waitForCogVideoX(eventId: string, fetchImpl: typeof fetch = fetch): Promise<string> {
  if (!/^[a-zA-Z0-9_-]{1,200}$/.test(eventId)) throw new Error('Invalid CogVideoX job ID');
  const response = await fetchImpl(`${SPACE_ROOT}/gradio_api/call/generate/${encodeURIComponent(eventId)}`, {
    headers: { accept: 'text/event-stream' },
    signal: AbortSignal.timeout(240_000),
  });
  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).slice(0, 300);
    throw new Error(`CogVideoX status request failed (${response.status}).${detail ? ` ${detail}` : ''}`);
  }
  const stream = await response.text();
  for (const block of stream.split(/\r?\n\r?\n/)) {
    const lines = block.split(/\r?\n/);
    const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
    const data = lines.filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n');
    if (event === 'error') throw new Error(`CogVideoX generation failed: ${data.slice(0, 300) || 'unknown error'}`);
    if (event !== 'complete' || !data) continue;
    let result: unknown;
    try { result = JSON.parse(data); } catch { throw new Error('CogVideoX returned an unreadable result'); }
    const rawUrl = videoUrlFrom(result);
    if (!rawUrl) throw new Error('CogVideoX completed without a video file');
    return trustedSpaceFileUrl(rawUrl).href;
  }
  throw new Error('CogVideoX job is still running; refresh to check again');
}

export async function persistCogVideoXFile(
  remoteUrl: string,
  key: string,
  bucket: { put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string } }): Promise<unknown> },
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const url = trustedSpaceFileUrl(remoteUrl);
  const response = await fetchImpl(url.href, { signal: AbortSignal.timeout(90_000), redirect: 'error' });
  if (!response.ok) throw new Error(`CogVideoX result download failed (${response.status})`);
  const contentType = response.headers.get('content-type')?.split(';')[0] || '';
  if (contentType !== 'video/mp4') throw new Error('CogVideoX did not return an MP4 video');
  const bytes = await response.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_VIDEO_BYTES) throw new Error('CogVideoX video is empty or exceeds the 100 MB import limit');
  await bucket.put(key, bytes, { httpMetadata: { contentType } });
}

export const COGVIDEOX_SPACE_URL = 'https://huggingface.co/spaces/kaidjuric/cogvideox-5b-text-to-video';
export const COGVIDEOX_MODEL_LABEL = 'CogVideoX-5B';
