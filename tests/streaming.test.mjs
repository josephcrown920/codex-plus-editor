import assert from 'node:assert/strict';
import {collectProviderStream} from '../lib/provider-stream.ts';
import {readAssistantStream} from '../lib/editor/assistant-stream.ts';
function response(events,ndjson=false){const bytes=new TextEncoder().encode(events.map(e=>ndjson?JSON.stringify(e)+'\n':'data: '+JSON.stringify(e)+'\n\n').join(''));return new Response(new ReadableStream({start(c){for(let i=0;i<bytes.length;i+=7)c.enqueue(bytes.slice(i,i+7));c.close()}}),{headers:{'content-type':ndjson?'application/x-ndjson':'text/event-stream'}})}
const args=JSON.stringify({summary:'Test',edits:[]});
for(const [provider,events] of [
['openrouter',[{choices:[{delta:{content:'Hello 🌊',tool_calls:[{index:0,function:{name:'propose_timeline_edits',arguments:args.slice(0,8)}}]}}]},{choices:[{delta:{tool_calls:[{index:0,function:{arguments:args.slice(8)}}]},finish_reason:'tool_calls'}]}]],
['claude',[{type:'content_block_start',index:0,content_block:{type:'tool_use',name:'propose_timeline_edits'}},{type:'content_block_delta',index:0,delta:{type:'input_json_delta',partial_json:args}},{type:'content_block_delta',index:1,delta:{type:'text_delta',text:'Hello 🌊'}},{type:'message_stop'}]],
['ollama',[{message:{content:'Hello 🌊',tool_calls:[{function:{name:'propose_timeline_edits',arguments:JSON.parse(args)}}]}},{done:true}]],
['openai',[{type:'response.output_text.delta',delta:'Hello 🌊'},{type:'response.output_item.added',item:{id:'one',type:'function_call',name:'propose_timeline_edits',arguments:''}},{type:'response.function_call_arguments.delta',item_id:'one',delta:args},{type:'response.completed'}]]]){let text='';const normalized=await collectProviderStream(response(events,provider==='ollama'),provider,t=>text+=t);const data=await normalized.json();assert.equal(text,'Hello 🌊');const tool=data.output.find(x=>x.type==='function_call');assert.equal(tool.name,'propose_timeline_edits');assert.deepEqual(JSON.parse(tool.arguments),JSON.parse(args));}
await assert.rejects(collectProviderStream(response([{choices:[{delta:{content:'Partial'}}]}]),'openrouter',()=>{}),/before completion/);
const client=await readAssistantStream(response([{type:'phase',message:'Validating'},{type:'delta',text:'Ready'},{type:'result',plan:{summary:'Done',edits:[]}}],true),()=>{});assert.equal(client.summary,'Done');await assert.rejects(readAssistantStream(response([{type:'error',message:'Invalid edit'}],true),()=>{}),/Invalid edit/);
console.log('PASS: four provider streams, split UTF-8 chunks, tool aggregation, completion requirements and client errors.');
