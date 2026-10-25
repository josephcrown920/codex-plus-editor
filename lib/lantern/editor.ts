// Recovered Lantern timeline helpers, adapted for browser use and track locks.
import type { AspectRatio, ResolutionName, TimelineClip, TimelineDocument, TimelineTrack } from './types';
import { ASPECT_PIXELS } from './types';

export function emptyTimeline(projectId: string, aspect: AspectRatio, resolution: ResolutionName, fps = 30): TimelineDocument {
  const px = ASPECT_PIXELS[aspect][resolution];
  return {
    id: crypto.randomUUID(),
    projectId,
    fps,
    width: px.w,
    height: px.h,
    sampleRate: 48000,
    tracks: [
      emptyTrack('video', 'V1'),
      emptyTrack('audio', 'A1'),
      emptyTrack('caption', 'Captions'),
      emptyTrack('title', 'Titles'),
    ],
    transitions: [],
  };
}

export function emptyTrack(kind: TimelineTrack['kind'], name: string): TimelineTrack {
  return { id: crypto.randomUUID(), kind, name, muted: false, locked: false, clips: [] };
}

export function clipFromAsset(assetId: string, startMs: number, durationMs: number): TimelineClip {
  return {
    id: crypto.randomUUID(),
    assetId,
    startMs,
    endMs: startMs + durationMs,
    inMs: 0,
    outMs: durationMs,
    transform: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
    volume: 1,
    speed: 1,
    effects: [],
  };
}

export function appendClip(doc: TimelineDocument, trackKind: TimelineTrack['kind'], clip: TimelineClip): TimelineDocument {
  const target = doc.tracks.find(t=>t.kind===trackKind&&!t.locked);
  if(!target) throw Error('No unlocked matching track');
  const start = target.clips.reduce((max,c)=>Math.max(max,c.endMs),0);
  const duration = clip.endMs-clip.startMs;
  if(!Number.isFinite(duration)||duration<=0)throw Error('Invalid clip duration');
  return {...doc,tracks:doc.tracks.map(t=>t.id===target.id?{...t,clips:[...t.clips,{...clip,startMs:start,endMs:start+duration}]}:t)};
}

export function durationMs(doc: TimelineDocument) {
  return doc.tracks.reduce((max, t) => Math.max(max, t.clips.reduce((m, c) => Math.max(m, c.endMs), 0)), 0);
}

export function relayout(doc: TimelineDocument, aspect: AspectRatio, resolution: ResolutionName): TimelineDocument {
  const px = ASPECT_PIXELS[aspect][resolution];
  return { ...doc, width: px.w, height: px.h };
}

