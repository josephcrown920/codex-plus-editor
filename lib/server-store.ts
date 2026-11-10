import {AsyncLocalStorage} from 'node:async_hooks';
import {createLogger} from './lantern/observability';
import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
type WorkspaceStore={db:D1Database;bucket:R2Bucket;workspaceId:string};
const workspaceContext=new AsyncLocalStorage<WorkspaceStore>();
export function withWorkspace<T>(workspace:WorkspaceStore,callback:()=>T):T{return workspaceContext.run(workspace,callback);}
const requestLogger=createLogger('warn',{service:'codex-studio'});

function relativeKey(key:string){if(!key||key.startsWith('/')||key.split('/').some(p=>p==='..'||p==='.'))throw Error('Invalid storage key');return key;}
function scopedBucket(bucket:R2Bucket,workspaceId:string):R2Bucket {
 const prefix=workspaceId==='legacy'?'':`users/${workspaceId}/`;
 const key=(value:string)=>{relativeKey(value);if(!prefix&&value.startsWith('users/'))throw Error('Invalid legacy storage key');return prefix+value;};
 const object=<T extends R2Object|null>(value:T):T=>value?new Proxy(value,{get(target,property){if(property==='key')return target.key.slice(prefix.length);const v=Reflect.get(target,property);return typeof v==='function'?v.bind(target):v;}}):value;
 return new Proxy(bucket,{get(target,property){
  if(property==='get')return async(value:string,options?:R2GetOptions)=>object(await target.get(key(value),options));
  if(property==='head')return async(value:string)=>object(await target.head(key(value)));
  if(property==='put')return async(value:string,body:any,options?:R2PutOptions)=>object(await target.put(key(value),body,options));
  if(property==='delete')return (value:string|string[])=>target.delete(Array.isArray(value)?value.map(key):key(value));
  if(property==='list')return async(options:R2ListOptions={})=>{const result=await target.list({...options,prefix:prefix+(options.prefix||'')});return {...result,objects:result.objects.filter(o=>prefix||!o.key.startsWith('users/')).map(o=>object(o))};};
  throw Error('Unsupported workspace storage operation');
 }});
}
/** Used for a provider download only after its workspace-bound signature is verified. */
export function sharedMediaBucket(workspaceId:string){if(!/^(legacy|[a-f0-9]{64})$/.test(workspaceId)||!env.BUCKET)throw Error('Invalid workspace');return scopedBucket(env.BUCKET,workspaceId);}
export async function storage():Promise<WorkspaceStore>{
 const current=workspaceContext.getStore();if(current)return current;
 if(!env.DB||!env.BUCKET)throw Error('Project storage is unavailable');
 const user=await getChatGPTUser();if(!user)throw Error('Sign in with ChatGPT to use your workspace');
 // One-time compatibility claim for pre-customer data. Sign-in is never restricted;
 // the first account that opens this migrated workspace inherits its old records.
 let legacy=await env.DB.prepare("SELECT user_id FROM legacy_workspace_owner WHERE id = 'legacy'").first<{user_id:string}>();
 if(!legacy){
  await env.DB.prepare("INSERT INTO legacy_workspace_owner (id, user_id) VALUES ('legacy', ?) ON CONFLICT(id) DO NOTHING").bind(user.userId).run();
  legacy=await env.DB.prepare("SELECT user_id FROM legacy_workspace_owner WHERE id = 'legacy'").first<{user_id:string}>();
 }
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(user.userId));
 const workspaceId=legacy?.user_id===user.userId?'legacy':Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 return {db:env.DB,bucket:scopedBucket(env.BUCKET,workspaceId),workspaceId};
}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw Error('Invalid origin');}
export const jsonError=(e:unknown,status=400)=>{requestLogger.warn('Request failed',{status,errorType:e instanceof Error?e.name:'UnknownError'});return Response.json({error:e instanceof Error?e.message:'Request failed'},{status});};
