import {z} from 'zod';
import type {BrandKit} from './types';
// Adapted from Lantern's brand API input, scoped to the current saved project.
export type ProjectBrandKit=Pick<BrandKit,'name'|'palette'|'typefaces'>;
const color=z.string().regex(/^#[a-fA-F0-9]{6}$/);
export const projectBrandSchema:z.ZodType<ProjectBrandKit>=z.object({name:z.string().trim().min(1).max(100),palette:z.object({background:z.array(color).max(8),accent:z.array(color).max(8)}),typefaces:z.object({display:z.string().trim().min(1).max(80),body:z.string().trim().min(1).max(80)})});
export const newProjectBrand=():ProjectBrandKit=>({name:'Project brand',palette:{background:['#091326'],accent:['#8de4ee']},typefaces:{display:'Arial',body:'Arial'}});
