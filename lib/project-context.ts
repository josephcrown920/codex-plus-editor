import {storage} from './server-store';
import {projectContextSchema} from './editor/context';
export async function projectContext(id?:string){if(!id)return null;const object=await storage().bucket.get(`workspace/contexts/${id}`);if(!object)return null;const record=await object.json<{data:unknown}>();const c=projectContextSchema.parse(record.data);return c.enabled?c:null;}
