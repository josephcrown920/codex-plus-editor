import {z} from 'zod';
export const workflows=['Casting','Production Design','Storyboarding','PDP Assets','Transitions','VFX','Pre-viz'] as const;
export const providers=['openai','claude','ollama','openrouter','gemini'] as const;
export const productionSchema=z.object({
 workflow:z.enum(workflows).default('Storyboarding'),
 provider:z.enum(providers).default('openai'),
 characters:z.string().max(6000).default(''),
 design:z.string().max(6000).default(''),
 shots:z.string().max(10000).default(''),
 continuity:z.string().max(6000).default(''),
 decisions:z.string().max(6000).default(''),
 referenceNotes:z.string().max(6000).default(''),
});
export type Production=z.infer<typeof productionSchema>;
export const emptyProduction=()=>productionSchema.parse({});
export function productionRoles(workflow:typeof workflows[number]){return [workflow==='Casting'?'Casting director':workflow==='Production Design'?'Production designer':workflow==='PDP Assets'?'Product director':workflow==='Transitions'?'Transition designer':workflow==='VFX'?'VFX supervisor':workflow==='Pre-viz'?'Pre-viz director':'Storyboard director','Continuity supervisor','Reference analyst'];}
export const productionFields=[['characters','Character bible','Stable character IDs, appearance, wardrobe, voice, approved reference asset IDs.'],['design','Production design','Locations, palette, lighting, props, product details and camera language.'],['shots','Shot board','Number each shot; include duration, action, camera, asset IDs, first/last frame references and status.'],['continuity','Continuity rules','Match screen direction, eyelines, wardrobe, props, time of day, and the preceding approved shot.'],['decisions','Decision memory','Approved and rejected ideas, reasons, revision notes and rules to retain.'],['referenceNotes','Reference extraction notes','Observed framing, palette, lighting, pacing and source frame timestamps. Links are not fetched.']] as const;
