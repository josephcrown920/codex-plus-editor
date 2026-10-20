import {Sandbox} from 'e2b';
import {getConnection} from './ai-connection';
import {storage} from './server-store';
export type Environment={id:string;name:string;template:string;sandboxId:string;ptyPid?:number;status:'running'|'paused'|'terminated'|'unknown';createdAt:string;updatedAt:string};
export async function sandboxKey(){const c=await getConnection('e2b');if(!c)throw Error('Connect your E2B key in Environments first. Sandbox compute is billed by E2B.');return c.apiKey;}
export async function environment(id:string){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id))throw Error('Invalid environment ID');const object=await storage().bucket.get(`environments/${id}`);if(!object)throw Error('Environment not found');return object.json<Environment>();}
export async function saveEnvironment(e:Environment){await storage().bucket.put(`environments/${e.id}`,JSON.stringify(e),{customMetadata:{name:e.name,status:e.status,updatedAt:e.updatedAt}});}
export async function connectEnvironment(e:Environment){if(e.status==='terminated')throw Error('This environment was terminated. Create a new one.');return Sandbox.connect(e.sandboxId,{apiKey:await sandboxKey(),timeoutMs:300000});}
export async function ensurePty(e:Environment,sandbox:Sandbox){if(e.ptyPid){try{const processes=await sandbox.commands.list();if(processes.some(p=>p.pid===e.ptyPid))return e.ptyPid;}catch{}}const handle=await sandbox.pty.create({cols:100,rows:28,cwd:'/home/user',envs:{TERM:'xterm-256color'},timeoutMs:0,onData:()=>{}});e.ptyPid=handle.pid;await handle.disconnect();e.status='running';e.updatedAt=new Date().toISOString();await saveEnvironment(e);return e.ptyPid;}
export {Sandbox};
