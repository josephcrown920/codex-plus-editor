import {projectContextSchema} from './context';
import {z} from 'zod';
import {projectSchema} from './model';
import {graphSchema} from './graph';
export const sessionSchema=z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(100),project:projectSchema,context:projectContextSchema.optional(),environmentId:z.string().uuid().optional(),graph:graphSchema,view:z.object({time:z.number().min(0).max(14400),zoom:z.number().min(10).max(150),showChat:z.boolean(),showAssets:z.boolean(),agentMode:z.enum(['local','ai','claude','ollama','openrouter'])}),messages:z.array(z.object({id:z.string().max(100),role:z.enum(['user','assistant']),text:z.string().max(8000)})).max(100)});
export type StudioSession=z.infer<typeof sessionSchema>;
