export type TimelineSelection = { clipIds: string[]; trackIds: string[]; playheadMs: number; inMs?: number; outMs?: number };
export type TimelineCommand =
  | { type: "split"; clipId: string; atMs: number }
  | { type: "trim"; clipId: string; startMs: number; endMs: number }
  | { type: "move"; clipId: string; trackId: string; startMs: number }
  | { type: "delete"; clipIds: string[] }
  | { type: "generate"; modality: "image" | "video"; modelId: string; prompt: string; insertAtMs: number }
  | { type: "motion-control"; modelId: string; sourceClipId: string; characterAssetId: string; insertAtMs: number };

export interface TimelineAgentContext {
  selection: TimelineSelection;
  projectId: string;
  transcript?: string;
  sceneSummary?: string;
}

export interface TimelineAgentAdapter {
  getContext(): Promise<TimelineAgentContext>;
  preview(commands: TimelineCommand[]): Promise<void>;
  apply(commands: TimelineCommand[]): Promise<void>;
  undo(): Promise<void>;
}

/**
 * Timeline agent contract.
 * Chat models plan commands; the editor adapter owns mutations.
 * Destructive edits should be previewed/confirmed by the UI before apply().
 */
export class TimelineAgent {
  constructor(private adapter: TimelineAgentAdapter) {}
  async context() { return this.adapter.getContext(); }
  async preview(commands: TimelineCommand[]) { return this.adapter.preview(commands); }
  async execute(commands: TimelineCommand[]) { return this.adapter.apply(commands); }
  async undo() { return this.adapter.undo(); }
}
