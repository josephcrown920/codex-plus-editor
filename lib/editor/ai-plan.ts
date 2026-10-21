import {z} from 'zod';
import {clipSchema,trackSchema,applyEdit,type Edit,type Project} from './model';
export const editSchema=z.discriminatedUnion('type',[
z.object({type:z.literal('split'),clipId:z.string(),time:z.number().min(0)}),
z.object({type:z.literal('update'),clipId:z.string(),patch:clipSchema.partial().omit({id:true})}),
z.object({type:z.literal('delete'),clipId:z.string()}),z.object({type:z.literal('duplicate'),clipId:z.string()}),
z.object({type:z.literal('add'),clip:clipSchema}),z.object({type:z.literal('ratio'),ratio:z.enum(['16:9','9:16','1:1'])}),
z.object({type:z.literal('track'),trackId:z.string(),patch:trackSchema.partial().omit({id:true})})]);
export const planSchema=z.object({summary:z.string().min(1).max(1000),edits:z.array(editSchema).max(30)});
export function applyPlan(p:Project,edits:Edit[]){return edits.reduce((next,e)=>applyEdit(next,e),p);}
export const planTool={type:'function',name:'propose_timeline_edits',description:'Propose a validated batch of video timeline edits. The app will request approval when configured; do not say edits are already applied.',strict:false,parameters:{type:'object',additionalProperties:false,properties:{summary:{type:'string'},edits:{type:'array',maxItems:30,items:{type:'object',properties:{type:{type:'string',enum:['split','update','delete','duplicate','add','ratio','track']},clipId:{type:'string'},time:{type:'number'},trackId:{type:'string'},ratio:{type:'string',enum:['16:9','9:16','1:1']},patch:{type:'object',description:'Only the fields to change: name,trackId,start,duration,offset,text,x,y,scale,opacity,volume,fontSize,color,effect,motion,fade,vignette,grain,bloom,ghost,letterbox,mirror,kaleidoscope,layout,reveal,scanlines,particles,bpm, or track fields name,muted,hidden,locked.'},clip:{type:'object',description:'Complete clip: id,trackId,assetId for media,name,start,duration,offset,text for titles,x,y,scale,opacity,volume,fontSize,color.'}},required:['type']}}},required:['summary','edits']}};
