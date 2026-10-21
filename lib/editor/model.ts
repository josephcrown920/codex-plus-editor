import {effectIds,motionIds} from './effects';
import { z } from 'zod';
export const assetSchema=z.object({id:z.string().min(1).max(100),name:z.string().max(200),kind:z.enum(['video','image','audio']),src:z.string().max(500).refine(s=>s.startsWith('/api/media?')||s==='/demo/anubis.jpg','Unsupported media source'),duration:z.number().positive().max(14400),thumbnail:z.string().max(200000).optional(),waveform:z.array(z.number().min(0).max(1)).max(200).optional()});
export const trackSchema=z.object({id:z.string().min(1),name:z.string().max(80),kind:z.enum(['video','audio','text']),muted:z.boolean(),hidden:z.boolean(),locked:z.boolean()});
export const clipSchema=z.object({vignette:z.number().min(0).max(1).optional(),grain:z.number().min(0).max(1).optional(),bloom:z.number().min(0).max(1).optional(),ghost:z.number().min(0).max(1).optional(),letterbox:z.number().min(0).max(.2).optional(),mirror:z.enum(['none','horizontal','vertical']).optional(),kaleidoscope:z.boolean().optional(),effect:z.enum(effectIds).optional(),motion:z.enum(motionIds).optional(),fade:z.number().min(0).max(3).optional(),id:z.string().min(1),trackId:z.string(),assetId:z.string().optional(),name:z.string().max(200),start:z.number().min(0).max(14400),duration:z.number().min(.04).max(14400),offset:z.number().min(0).max(14400),text:z.string().max(500).optional(),x:z.number().min(-100).max(100),y:z.number().min(-100).max(100),scale:z.number().min(.1).max(4),opacity:z.number().min(0).max(1),volume:z.number().min(0).max(1),fontSize:z.number().min(12).max(200),color:z.string().regex(/^#[a-fA-F0-9]{6}$/)});
export const projectSchema=z.object({version:z.literal(1),id:z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),name:z.string().min(1).max(100),ratio:z.enum(['16:9','9:16','1:1']),assets:z.array(assetSchema).max(200),tracks:z.array(trackSchema).max(24),clips:z.array(clipSchema).max(1000)}).superRefine((p,c)=>{
const assets=new Map(p.assets.map(a=>[a.id,a]));const tracks=new Map(p.tracks.map(t=>[t.id,t]));
for(const xs of [p.assets,p.tracks,p.clips])if(new Set(xs.map(x=>x.id)).size!==xs.length)c.addIssue({code:'custom',message:'Duplicate IDs'});
for(const clip of p.clips){const t=tracks.get(clip.trackId),a=clip.assetId?assets.get(clip.assetId):undefined;if(!t)c.addIssue({code:'custom',message:'Missing track'});if(clip.assetId&&!a)c.addIssue({code:'custom',message:'Missing asset'});if(t&&((t.kind==='text'&&!clip.text)||(t.kind==='audio'&&a?.kind!=='audio')||(t.kind==='video'&&(!a||a.kind==='audio'))))c.addIssue({code:'custom',message:'Clip does not match track'});if(a&&a.kind!=='image'&&clip.offset+clip.duration>a.duration+.05)c.addIssue({code:'custom',message:'Clip exceeds source duration'});if(clip.start+clip.duration>14400)c.addIssue({code:'custom',message:'Timeline exceeds four hours'});}
});
export type Asset=z.infer<typeof assetSchema>;export type Track=z.infer<typeof trackSchema>;export type Clip=z.infer<typeof clipSchema>;export type Project=z.infer<typeof projectSchema>;
export const uid=()=>crypto.randomUUID();
export function emptyProject(name='Untitled sequence'):Project{return {version:1,id:uid(),name,ratio:'16:9',assets:[],tracks:[{id:'text-1',name:'Titles',kind:'text',muted:false,hidden:false,locked:false},{id:'video-1',name:'Video 1',kind:'video',muted:false,hidden:false,locked:false},{id:'audio-1',name:'Audio 1',kind:'audio',muted:false,hidden:false,locked:false}],clips:[]};}
export const duration=(p:Project)=>Math.max(0,...p.clips.map(c=>c.start+c.duration));
export function makeClip(trackId:string,asset?:Asset,start=0,text?:string):Clip{return {id:uid(),trackId,assetId:asset?.id,name:text?'Title':asset?.name||'Clip',start,duration:asset?Math.min(asset.duration,asset.kind==='image'?8:14400):5,offset:0,text,x:0,y:0,scale:1,opacity:1,volume:1,fontSize:56,color:'#ffffff'};}
export type Edit={type:'split';clipId:string;time:number}|{type:'update';clipId:string;patch:Partial<Clip>}|{type:'delete';clipId:string}|{type:'duplicate';clipId:string}|{type:'add';clip:Clip}|{type:'ratio';ratio:Project['ratio']}|{type:'track';trackId:string;patch:Partial<Track>};
export function applyEdit(project:Project,edit:Edit):Project{
const p=structuredClone(project);if(edit.type==='ratio'){p.ratio=edit.ratio;return projectSchema.parse(p);}
if(edit.type==='track'){const t=p.tracks.find(t=>t.id===edit.trackId);if(!t)throw Error('Track not found');Object.assign(t,edit.patch,{id:t.id});return projectSchema.parse(p);}
if(edit.type==='add'){const track=p.tracks.find(t=>t.id===edit.clip.trackId);if(!track||track.locked)throw Error('Choose an unlocked track');p.clips.push(edit.clip);return projectSchema.parse(p);}
const c=p.clips.find(c=>c.id===edit.clipId);if(!c)throw Error('Select a clip first');if(p.tracks.find(t=>t.id===c.trackId)?.locked)throw Error('Unlock this track first');
if(edit.type==='split'){if(edit.time<=c.start+.04||edit.time>=c.start+c.duration-.04)throw Error('Place the playhead inside the selected clip');const first=edit.time-c.start;p.clips.push({...c,id:uid(),start:edit.time,offset:c.offset+first,duration:c.duration-first});c.duration=first;}
if(edit.type==='update'){const target=p.tracks.find(t=>t.id===(edit.patch.trackId||c.trackId));if(!target||target.locked)throw Error('Choose an unlocked destination track');Object.assign(c,edit.patch,{id:c.id});}
if(edit.type==='delete')p.clips=p.clips.filter(x=>x.id!==c.id);
if(edit.type==='duplicate')p.clips.push({...c,id:uid(),start:c.start+c.duration});
return projectSchema.parse(p);
}
export function parseCommand(p:Project,selected:string|undefined,time:number,input:string):{edit:Edit;summary:string}{
const s=input.trim(),lower=s.toLowerCase();const c=p.clips.find(c=>c.id===selected);const need=()=>{if(!c)throw Error('Select a clip on the timeline first');return c;};
if(/vertical|9:16/.test(lower))return {edit:{type:'ratio',ratio:'9:16'},summary:'Change the project to 9:16'};
if(/square|1:1/.test(lower))return {edit:{type:'ratio',ratio:'1:1'},summary:'Change the project to 1:1'};
if(/landscape|16:9/.test(lower))return {edit:{type:'ratio',ratio:'16:9'},summary:'Change the project to 16:9'};
if(/split|cut.*(?:at|playhead)/.test(lower)){const clip=need();const n=lower.match(/(?:at|to)\s*(\d+(?:\.\d+)?)/);const at=n?Number(n[1]):time;return {edit:{type:'split',clipId:clip.id,time:at},summary:`Split ${clip.name} at ${at.toFixed(2)}s`};}
if(/trim|shorten/.test(lower)){const clip=need();const n=lower.match(/(?:to|for)\s*(\d+(?:\.\d+)?)/);if(!n)throw Error('Try “Trim selected clip to 5 seconds”');return {edit:{type:'update',clipId:clip.id,patch:{duration:Number(n[1])}},summary:`Trim ${clip.name} to ${n[1]}s`};}
if(/delete|remove/.test(lower))return {edit:{type:'delete',clipId:need().id},summary:'Delete the selected clip'};
if(/duplicate/.test(lower))return {edit:{type:'duplicate',clipId:need().id},summary:'Duplicate the selected clip'};
if(/volume|quieter|mute|lower.*music/.test(lower)){const clip=need();const n=lower.match(/(\d+(?:\.\d+)?)\s*%/);return {edit:{type:'update',clipId:clip.id,patch:{volume:/mute/.test(lower)?0:n?Math.min(1,Number(n[1])/100):.3}},summary:'Adjust the selected clip’s volume'};}
if(/move/.test(lower)){const clip=need();const n=lower.match(/(?:to|at)\s*(\d+(?:\.\d+)?)/);if(!n)throw Error('Try “Move selected clip to 3 seconds”');return {edit:{type:'update',clipId:clip.id,patch:{start:Number(n[1])}},summary:`Move ${clip.name} to ${n[1]}s`};}
if(/title|text|caption/.test(lower)){const match=s.match(/[“"]([^”"]+)[”"]/)||s.match(/(?:saying|says|text|title)\s+(.+)/i);const text=match?.[1]?.trim();if(!text)throw Error('Try ‘Add a title saying “NBA JOSH”’');const track=p.tracks.find(t=>t.kind==='text'&&!t.locked);if(!track)throw Error('Add an unlocked text track first');return {edit:{type:'add',clip:makeClip(track.id,undefined,time,text)},summary:`Add title “${text}” at ${time.toFixed(2)}s`};}
throw Error('Local commands support split, trim, move, duplicate, delete, volume, titles, and aspect ratio. Select a clip, then try “Trim selected clip to 5 seconds”.');
}
