import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){try{return next(specifier,context)}catch(error){if(specifier.startsWith('.')&&!/\.[a-z]+$/.test(specifier))return next(specifier+'.ts',context);throw error}}});
import assert from 'node:assert/strict';
const {generationSchema}=await import('../lib/editor/generation.ts');
const {submitCogVideoX,waitForCogVideoX,persistCogVideoXFile}=await import('../lib/huggingface-cogvideo.ts');

const request={id:crypto.randomUUID(),kind:'video',provider:'huggingface',model:'cogvideox-zero',prompt:'A red kite rises above the beach at sunrise'};
assert.equal(generationSchema.parse(request).provider,'huggingface');
assert.throws(()=>generationSchema.parse({...request,kind:'frames'}),/prompt-to-video only/);
assert.throws(()=>generationSchema.parse({...request,provider:'fal'}),/Select Hugging Face/);

const eventId=await submitCogVideoX(request.prompt,async(url,init)=>{
  assert.equal(url,'https://kaidjuric-cogvideox-5b-text-to-video.hf.space/gradio_api/call/generate');
  assert.deepEqual(JSON.parse(init.body).data,[request.prompt,50,49,6,'',-1]);
  return Response.json({event_id:'event_123'});
});
assert.equal(eventId,'event_123');

const resultUrl=await waitForCogVideoX(eventId,async(url)=>{
  assert.equal(url.endsWith('/event_123'),true);
  return new Response('event: complete\ndata: [{"video":{"url":"https://kaidjuric-cogvideox-5b-text-to-video.hf.space/gradio_api/file=/tmp/result.mp4","path":"/tmp/result.mp4"}}]\n\n',{headers:{'content-type':'text/event-stream'}});
});
assert.equal(resultUrl,'https://kaidjuric-cogvideox-5b-text-to-video.hf.space/gradio_api/file=/tmp/result.mp4');
await assert.rejects(()=>waitForCogVideoX('../bad',async()=>Response.json({})),/Invalid CogVideoX job ID/);

let saved;
await persistCogVideoXFile(resultUrl,'project/job',{
  async put(key,bytes,options){saved={key,bytes,options};},
},async()=>new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'video/mp4'}}));
assert.equal(saved.key,'project/job');
assert.equal(saved.bytes.byteLength,3);
assert.equal(saved.options.httpMetadata.contentType,'video/mp4');
await assert.rejects(()=>persistCogVideoXFile('https://example.com/gradio_api/file=/x.mp4','x',{async put(){}},async()=>Response.error()),/unexpected media URL/);
console.log('PASS: free CogVideoX request validation, Gradio queue response parsing, URL restrictions and persisted MP4 output.');
