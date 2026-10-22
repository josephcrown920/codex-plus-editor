import {objectStore} from './object-store';
import {projectContextSchema} from './editor/context';
export async function projectContext(id?:string){if(!id)return null;const record=await objectStore.json<{data:unknown}>(`workspace/contexts/${id}`);if(!record)return null;const c=projectContextSchema.parse(record.data);return c.enabled?c:null;}
