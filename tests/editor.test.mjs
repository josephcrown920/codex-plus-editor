import assert from 'node:assert/strict';
import {emptyProject,makeClip,applyEdit,parseCommand,projectSchema,duration} from '../lib/editor/model.ts';
const p=emptyProject('Test');const asset={id:'footage',name:'Footage',kind:'video',src:'/api/media?key=test%2Ffootage',duration:12};p.assets=[asset];const c=makeClip('video-1',asset);p.clips=[c];
const split=applyEdit(p,{type:'split',clipId:c.id,time:4});assert.equal(split.clips.length,2);assert.equal(split.clips[0].duration,4);assert.equal(split.clips[1].start,4);assert.equal(split.clips[1].offset,4);assert.equal(split.clips[1].duration,8);assert.equal(duration(split),12);assert.equal(p.clips.length,1);
assert.throws(()=>applyEdit(p,{type:'split',clipId:c.id,time:0}));assert.throws(()=>applyEdit(p,{type:'update',clipId:c.id,patch:{offset:8}}));
const trimmed=applyEdit(p,parseCommand(p,c.id,0,'Trim selected clip to 5 seconds').edit);assert.equal(trimmed.clips[0].duration,5);
const title=applyEdit(p,parseCommand(p,c.id,2,'Add a title saying “NBA JOSH”').edit);assert.equal(title.clips[1].text,'NBA JOSH');assert.equal(title.clips[1].start,2);
const vertical=applyEdit(p,parseCommand(p,c.id,0,'Make the project vertical').edit);assert.equal(vertical.ratio,'9:16');
const quieter=applyEdit(p,parseCommand(p,c.id,0,'Set volume to 25%').edit);assert.equal(quieter.clips[0].volume,.25);
const locked=applyEdit(p,{type:'track',trackId:'video-1',patch:{locked:true}});assert.throws(()=>applyEdit(locked,{type:'delete',clipId:c.id}));
assert.throws(()=>projectSchema.parse({...p,assets:[{...asset,src:'https://untrusted.example/video'}]}));assert.throws(()=>projectSchema.parse({...p,clips:[c,{...c}]}));assert.throws(()=>parseCommand(p,undefined,0,'Delete selected clip'));
const deleted=applyEdit(p,{type:'delete',clipId:c.id});assert.equal(deleted.clips.length,0);assert.equal(duration(deleted),0);
console.log('PASS: split offsets, trims, source bounds, title commands, aspect ratio, volume, track locks, invalid sources and IDs, deletion.');

const effect=applyEdit(p,{type:'update',clipId:c.id,patch:{effect:'mono',motion:'zoom-in',fade:.5}});assert.equal(effect.clips[0].effect,'mono');assert.equal(effect.clips[0].motion,'zoom-in');assert.throws(()=>applyEdit(p,{type:'update',clipId:c.id,patch:{effect:'invalid'}}));assert.throws(()=>applyEdit(p,{type:'update',clipId:c.id,patch:{fade:4}}));
const {generationSchema,generationInput,optimizeLocally}=await import('../lib/editor/generation.ts');const input=generationSchema.parse({id:crypto.randomUUID(),kind:'motion',imageUrl:'https://example.com/a.jpg',videoUrl:'https://example.com/a.mp4'});assert.equal(generationInput(input).character_orientation,'video');assert.throws(()=>generationSchema.parse({...input,imageUrl:'http://127.0.0.1/a'}));assert.throws(()=>generationSchema.parse({id:crypto.randomUUID(),kind:'lipsync'}));assert.match(optimizeLocally('A bird','video'),/A bird/);console.log('PASS: effects and fades validated, motion inputs, missing lip-sync inputs rejected, local prompt preservation.');
