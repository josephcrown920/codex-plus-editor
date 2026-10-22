// Lantern's recovered ObjectStore contract, adapted to Codex Studio's private R2 storage.
import {storage} from './server-store';
export interface ObjectStore {
 put(key:string,body:Uint8Array,contentType:string):Promise<void>;
 get(key:string):Promise<Uint8Array>;
 delete(key:string):Promise<void>;
 publicUrl(key:string):string;
}
export function validateObjectKey(key:string){if(!key||key.startsWith('/')||key.includes('\\')||key.split('/').some(p=>!p||p==='.'||p==='..'))throw Error('Invalid object key');return key;}
export class R2Store implements ObjectStore {
 async put(key:string,body:Uint8Array,contentType:string){await storage().bucket.put(validateObjectKey(key),body,{httpMetadata:{contentType}});}
 async get(key:string){const o=await storage().bucket.get(validateObjectKey(key));if(!o)throw Error('Object not found');return new Uint8Array(await o.arrayBuffer());}
 async delete(key:string){await storage().bucket.delete(validateObjectKey(key));}
 // Contract name retained from Lantern. This is an owner-authenticated media URL,
 // not public access and not an externally accessible generation input URL.
 publicUrl(key:string){return '/api/media?key='+encodeURIComponent(validateObjectKey(key));}
 async json<T>(key:string):Promise<T|null>{const o=await storage().bucket.get(validateObjectKey(key));return o?o.json<T>():null;}
}
export const objectStore=new R2Store();
