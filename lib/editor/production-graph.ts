// Adapted from the recovered Lantern planner; uses the recovered shared contracts.
import type {AgentGraph,AgentNode,Craft} from '../lantern/types';
export type {AgentGraph,AgentNode,Craft} from '../lantern/types';

const CRAFT_HINTS: Array<{ re: RegExp; craft: Craft }> = [
  { re: /\b(ad|promo|ugc|commercial|cta)\b/i, craft: 'ad' },
  { re: /\b(tiktok|reel|short|social)\b/i, craft: 'social' },
  { re: /\b(explain|tutorial|course|how to|lesson)\b/i, craft: 'explainer' },
  { re: /\b(docu|documentary)\b/i, craft: 'documentary' },
  { re: /\b(short film|narrative|scene)\b/i, craft: 'short_film' },
  { re: /\b(music video|mv|lyric)\b/i, craft: 'music_video' },
  { re: /\b(product|sku|unbox)\b/i, craft: 'product' },
  { re: /\b(avatar|talking head|presenter)\b/i, craft: 'avatar' },
  { re: /\b(wedding|event|footage|vlog)\b/i, craft: 'event_edit' },
];

export function classifyCraft(brief: string): Craft {
  if (/\b(music video|mv|lyric)\b/i.test(brief)) return 'music_video';
  if (/\bshort film\b/i.test(brief)) return 'short_film';
  for (const h of CRAFT_HINTS) if (h.re.test(brief)) return h.craft;
  return 'other';
}

function node(id: string, type: AgentNode['type'], dependsOn: string[], input: unknown): AgentNode {
  return { id, type, dependsOn, input };
}

export function planGraph(projectId: string, brief: string, opts?: { hasFootage?: boolean; hasTrack?: boolean; hasScript?: boolean }): AgentGraph {
  const craft = classifyCraft(brief);
  const nodes: AgentNode[] = [node('classify', 'classify', [], { brief, craft })];
  if (!opts?.hasScript) nodes.push(node('script', 'script', ['classify'], { brief }));
  nodes.push(node('storyboard', 'storyboard', [opts?.hasScript ? 'classify' : 'script'], { brief }));
  if (craft === 'music_video' && !opts?.hasTrack) {
    nodes.push(node('ask-track', 'ask_user', ['classify'], { question: 'Upload the master track. Picture syncs to it.' }));
  }
  if (craft === 'event_edit' && !opts?.hasFootage) {
    nodes.push(node('ask-footage', 'ask_user', ['classify'], { question: 'Upload the footage to cut.' }));
  }
  nodes.push(node('voice', 'voice', ['storyboard'], { from: opts?.hasScript ? 'provided-script' : 'script' }));
  nodes.push(node('generate', 'generate', ['storyboard', 'voice'], { from: 'storyboard' }));
  nodes.push(node('stock', 'stock', ['storyboard'], { from: 'storyboard' }));
  nodes.push(node('music', 'music', ['storyboard'], { from: 'craft' }));
  nodes.push(node('assemble', 'assemble', ['generate', 'stock', 'voice', 'music', ...nodes.filter(n=>n.type==='ask_user').map(n=>n.id)], {}));
  nodes.push(node('captions', 'captions', ['assemble'], {}));
  nodes.push(node('qa', 'qa', ['captions'], { maxAttempts: 3 }));
  nodes.push(node('revise', 'revise', ['qa'], { onlyIf: 'qa.failed' }));
  nodes.push(node('render', 'render', ['revise'], { requiresApprovedQA: true }));
  return { id: crypto.randomUUID(), projectId, craft, nodes };
}

export function readyNodes(graph: AgentGraph, done: Set<string>, failed: Set<string>) {
  return graph.nodes.filter((n) => {
    if (done.has(n.id) || failed.has(n.id)) return false;
    return n.dependsOn.every((d) => done.has(d));
  });
}
