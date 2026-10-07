import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));const {Miniflare}=wranglerRequire('miniflare');
const root=path.resolve('dist/server');const files=(await readdir(root,{recursive:true})).filter(f=>/\.m?js$/.test(f)&&f!=='index.js');const modules=[{type:'ESModule',path:path.join(root,'index.js')},...files.map(f=>({type:'ESModule',path:path.join(root,f)}))];
const mf=new Miniflare({modules,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET']});
try{
const db=await mf.getD1Database('DB');await db.prepare(await readFile('drizzle/0000_furry_matthew_murdock.sql','utf8')).run();
const r=await mf.dispatchFetch('https://aurora.test/');const html=await r.text();assert.equal(r.status,200,html.slice(0,1000));assert.match(html,/What should we create/);assert.match(html,/Timeline/);assert.match(html,/Aurora/);
const model=await import('../lib/editor/model.ts');const p=model.emptyProject('Smoke test');
const saved=await mf.dispatchFetch('https://aurora.test/api/projects',{method:'POST',headers:{'content-type':'application/json',origin:'https://aurora.test'},body:JSON.stringify({project:p})});assert.equal(saved.status,200,await saved.clone().text());assert.equal((await saved.json()).revision,1);
const read=await mf.dispatchFetch('https://aurora.test/api/projects?id='+p.id);assert.deepEqual((await read.json()).project,p);
const conflict=await mf.dispatchFetch('https://aurora.test/api/projects',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({project:p,revision:0})});assert.equal(conflict.status,409);
const unsafe=await mf.dispatchFetch('https://aurora.test/api/projects',{method:'POST',headers:{'content-type':'application/json',origin:'https://elsewhere.test'},body:JSON.stringify({project:p})});assert.equal(unsafe.status,400);
const bytes=new Uint8Array([137,80,78,71,13,10,26,10]);const key=p.id+'/image';const upload=await mf.dispatchFetch('https://aurora.test/api/media?key='+encodeURIComponent(key),{method:'POST',headers:{'content-type':'image/png','content-length':String(bytes.length)},body:bytes});assert.equal(upload.status,200,await upload.clone().text());const image=await mf.dispatchFetch('https://aurora.test/api/media?key='+encodeURIComponent(key));assert.deepEqual(new Uint8Array(await image.arrayBuffer()),bytes);
const partial=await mf.dispatchFetch('https://aurora.test/api/media?key='+encodeURIComponent(key),{headers:{range:'bytes=2-5'}});assert.equal(partial.status,206);assert.equal(partial.headers.get('content-range'),'bytes 2-5/8');assert.deepEqual(new Uint8Array(await partial.arrayBuffer()),bytes.slice(2,6));
console.log('PASS: rendered editor, project save/read, revision conflicts, origin validation, media upload/read, byte-range seeking.');
}finally{await mf.dispose();}
