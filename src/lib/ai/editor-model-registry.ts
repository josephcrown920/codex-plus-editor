/**
 * Unified model catalog for Codex Plus Editor.
 * Display names are product requests, not verified provider model IDs.
 * No model is marked available until its adapter, credentials and capabilities pass validation.
 */
export type ModelModality = "image" | "video" | "chat";
export type ModelCapability = "text-to-image" | "image-to-image" | "text-to-video" | "image-to-video" | "motion-reference" | "performance-transfer" | "character-reference" | "scene-builder" | "chat" | "vision";
export type ModelStatus = "adapter-required" | "provider-verification-required";
export interface EditorModel {
  id: string;
  label: string;
  modality: ModelModality;
  capabilities: ModelCapability[];
  status: ModelStatus;
  providerModelId?: string;
  notes?: string;
}
const image = (id: string, label: string): EditorModel => ({ id, label, modality: "image", capabilities: ["text-to-image", "image-to-image", "character-reference", "scene-builder"], status: "adapter-required" });
const video = (id: string, label: string, capabilities: ModelCapability[] = []): EditorModel => ({ id, label, modality: "video", capabilities: ["text-to-video", "image-to-video", "scene-builder", ...capabilities], status: "provider-verification-required" });
const chat = (id: string, label: string): EditorModel => ({ id, label, modality: "chat", capabilities: ["chat"], status: "adapter-required" });
export const editorModels: EditorModel[] = [
  image("flux", "FLUX"), image("mini-flux", "Mini FLUX"), image("seedream", "Seedream"), image("sunburst", "Sunburst"), image("gpt-image", "GPT Image"), image("wan-image", "Wan Image"), image("flare", "Flare"),
  video("seedance-2-5", "Seedance 2.5"), video("seedance-2-mini", "Seedance 2.0 Mini"), video("minimax", "MiniMax"), video("wan-video", "Wan Video", ["motion-reference"]), video("kling", "Kling", ["motion-reference"]), video("omnihuman", "OmniHuman", ["performance-transfer"]), 
  chat("deepseek", "DeepSeek"), chat("claude", "Claude"), chat("fable", "Fable"), chat("gemini", "Gemini"), chat("glm", "GLM"), chat("astra", "Astra"), chat("sol", "Sol"), chat("gpt-2", "GPT 2"),
];
export const getModelsByModality = (modality: ModelModality) => editorModels.filter(model => model.modality === modality);
export const getModelsByCapability = (capability: ModelCapability) => editorModels.filter(model => model.capabilities.includes(capability));
export const isModelReady = (model: EditorModel) => Boolean(model.providerModelId && model.status === "adapter-required" && false); // Fail closed until runtime adapter validation is implemented.
