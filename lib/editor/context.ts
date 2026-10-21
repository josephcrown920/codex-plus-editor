import {z} from 'zod';
import {productionSchema} from './production';
export const projectContextSchema=z.object({production:productionSchema.optional(),enabled:z.boolean().default(true),brief:z.string().max(12000).default(''),notebook:z.string().max(20000).default(''),references:z.string().max(4000).default('')});
export type ProjectContext=z.infer<typeof projectContextSchema>;
export const emptyContext=():ProjectContext=>({enabled:true,brief:'',notebook:'',references:''});
