import type {Project} from './model';
// Read source frames without changing the editor's playback or audio.
export async function sampleProjectFrames(project:Project,signal:AbortSignal){
const frames:{image:string;label:string}[]=[];
for(const clip of project.clips.filter(c=>!project.tracks.find(t=>t.id===c.trackId)?.hidden).slice().sort((a,b)=>a.start-b.start)){
if(frames.length>=6)break;
const asset=project.assets.find(a=>a.id===clip.assetId);if(!asset||asset.kind==='audio')continue;
signal.throwIfAborted();const media=asset.kind==='image'?new Image():document.createElement('video');
try{await new Promise<void>((resolve,reject)=>{const done=()=>{clearTimeout(timer);signal.removeEventListener('abort',abort);media.onload=null;media.onerror=null;if(media instanceof HTMLVideoElement)media.onloadeddata=null};const abort=()=>{done();reject(Error('Visual review cancelled'))};const timer=setTimeout(()=>{done();reject(Error('Media loading timed out'))},15000);media.onload=()=>{done();resolve()};media.onerror=()=>{done();reject(Error('Could not load '+asset.name))};signal.addEventListener('abort',abort,{once:true});if(media instanceof HTMLVideoElement){media.muted=true;media.preload='auto';media.onloadeddata=()=>{done();resolve()}}media.src=asset.src;});
const offsets=asset.kind==='video'?[Math.min(asset.duration-.05,clip.offset+clip.duration*.2),Math.min(asset.duration-.05,clip.offset+clip.duration*.8)]:[0];
for(const offset of offsets){if(frames.length>=6)break;signal.throwIfAborted();if(media instanceof HTMLVideoElement&&Math.abs(media.currentTime-offset)>.01)await new Promise<void>((resolve,reject)=>{const done=()=>{clearTimeout(timer);signal.removeEventListener('abort',abort);media.onseeked=null;media.onerror=null};const abort=()=>{done();reject(Error('Visual review cancelled'))};const timer=setTimeout(()=>{done();reject(Error('Frame extraction timed out'))},10000);signal.addEventListener('abort',abort,{once:true});media.onseeked=()=>{done();resolve()};media.onerror=()=>{done();reject(Error('Frame extraction failed'))};media.currentTime=Math.max(0,offset)});
const w=media instanceof HTMLVideoElement?media.videoWidth:media.naturalWidth,h=media instanceof HTMLVideoElement?media.videoHeight:media.naturalHeight;if(!w||!h)throw Error('No readable frame');const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(w*Math.min(1,640/Math.max(w,h))));canvas.height=Math.max(1,Math.round(h*Math.min(1,640/Math.max(w,h))));canvas.getContext('2d')!.drawImage(media,0,0,canvas.width,canvas.height);frames.push({image:canvas.toDataURL('image/jpeg',.7).split(',')[1],label:`Clip ${clip.id}, ${asset.name}, source ${offset.toFixed(2)}s, timeline ${(clip.start+(asset.kind==='image'?0:offset-clip.offset)).toFixed(2)}s`});}
}finally{if(media instanceof HTMLVideoElement){media.pause();media.removeAttribute('src');media.load()}}}
if(!frames.length)throw Error('Add an image or video clip for visual review');return frames;
}
