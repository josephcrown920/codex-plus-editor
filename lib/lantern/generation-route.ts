import {ModelRouter} from './providers/router';
import type {GenerationTask,TaskKind} from './types';
import type {GenerationRequest} from '../editor/generation';
const taskKinds:Record<GenerationRequest['kind'],TaskKind>={image:'image.generate',video:'video.generate',frames:'video.generate',motion:'video.generate','motion-style':'video.generate',lipsync:'video.lipsync','upscale-image':'enhance.upscale','upscale-video':'enhance.upscale','face-swap':'image.edit','remove-bg':'enhance.bg_remove','remove-bg-video':'enhance.bg_remove',relight:'image.edit',vfx:'video.generate'};
export function routeGeneration(input:GenerationRequest,connected:boolean){
 const kind=taskKinds[input.kind];
 const refs=[input.imageUrl,input.videoUrl,input.audioUrl,input.lastFrameUrl,input.faceUrl].filter((url):url is string=>!!url).map(url=>({url,role:'source'}));
 // These are the constraints already validated for this request by generationSchema.
 // Do not invent additional capability claims for vendor model versions.
 const kinds:TaskKind[]=input.provider==='byteplus'?['video.generate']:[kind];
 const router=new ModelRouter([{id:input.provider,available:()=>connected,capabilities:{kinds,aspects:['16:9','9:16','1:1'],resolutions:[],maxDurationMs:0,maxRefs:5,nativeAudio:false,identityLocks:false}}]);
 return router.pick({kind,prompt:input.prompt,refs,constraints:{aspectRatio:input.ratio},pinProviderId:input.provider}).id;
}
