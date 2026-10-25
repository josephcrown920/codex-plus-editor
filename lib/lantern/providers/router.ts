// Adapted from Lantern ModelRouter. Routing only: submission and polling remain
// in Codex Studio's existing generation job lifecycle to avoid duplicate jobs.
import type {GenerationTask,CreditEstimate} from '../types';
import type {GenerationProvider} from './types';
import {ProviderError} from './types';
export type RoutingProvider=Pick<GenerationProvider,'id'|'available'|'capabilities'> & {estimate?:(task:GenerationTask)=>CreditEstimate};
export class ModelRouter {
 constructor(private providers:RoutingProvider[],private allowMock=false){}
 list(){return this.providers.map(p=>({id:p.id,available:p.available(),kinds:p.capabilities.kinds,nativeAudio:p.capabilities.nativeAudio}));}
 pick(task:GenerationTask):RoutingProvider{
  const eligible=this.providers.filter(p=>{
   const c=p.capabilities;
   if(!p.available()||(!this.allowMock&&p.id==='mock')||!c.kinds.includes(task.kind))return false;
   if(task.pinProviderId&&p.id!==task.pinProviderId)return false;
   if(task.constraints.aspectRatio&&!c.aspects.includes(task.constraints.aspectRatio))return false;
   if(task.constraints.resolution&&!c.resolutions.includes(task.constraints.resolution))return false;
   if(task.constraints.durationMs!==undefined&&(!Number.isFinite(task.constraints.durationMs)||task.constraints.durationMs<0||task.constraints.durationMs>c.maxDurationMs))return false;
   if((task.refs?.length||0)>c.maxRefs)return false;
   if(task.lockHandles?.length&&!c.identityLocks)return false;
   if(task.budgetCredits!==undefined){
    if(!Number.isFinite(task.budgetCredits)||task.budgetCredits<0||!p.estimate)return false;
    const e=p.estimate(task);if(!Number.isFinite(e.max)||e.max<0||e.max>task.budgetCredits)return false;
   }
   return true;
  });
  const result=eligible.find(p=>p.id!=='mock')||eligible[0];
  if(!result)throw new ProviderError('no_provider','No connected provider matches the requested model, inputs and constraints.');
  return result;
 }
}
