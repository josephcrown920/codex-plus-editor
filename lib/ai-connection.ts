import {env} from 'cloudflare:workers';
import {storage} from './server-store';
export type Connection={apiKey:string;models:string[];model:string};
const decode=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const encode=(s:Uint8Array)=>btoa(Array.from(s,c=>String.fromCharCode(c)).join(''));
async function encryptionKey(){const secret=env.AI_CONFIG_ENCRYPTION_KEY;if(!secret)throw Error('Secure connection storage is unavailable');return crypto.subtle.importKey('raw',decode(secret),{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function setConnection(config:Connection){const key=await encryptionKey(),iv=crypto.getRandomValues(new Uint8Array(12)),encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(config)));const value=JSON.stringify({iv:encode(iv),data:encode(new Uint8Array(encrypted))});await storage().db.prepare('INSERT INTO connections (id, encrypted) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET encrypted = excluded.encrypted').bind('openai',value).run();}
export async function getConnection():Promise<Connection|undefined>{const row=await storage().db.prepare('SELECT encrypted FROM connections WHERE id = ?').bind('openai').first<{encrypted:string}>();if(!row)return;const data=JSON.parse(row.encrypted) as {iv:string;data:string};const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(data.iv)},await encryptionKey(),decode(data.data));return JSON.parse(new TextDecoder().decode(bytes)) as Connection;}
export async function removeConnection(){await storage().db.prepare('DELETE FROM connections WHERE id = ?').bind('openai').run();}
export const connectionStatus=(c?:Connection)=>({connected:!!c,models:c?.models||[],model:c?.model||'',provider:c?'OpenAI':null});
