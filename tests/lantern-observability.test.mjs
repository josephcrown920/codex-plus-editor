import assert from 'node:assert/strict';
const {createLogger}=await import('../lib/lantern/observability.ts');
const messages=[],oldLog=console.log,oldError=console.error;
console.log=s=>messages.push(JSON.parse(s));console.error=s=>messages.push(JSON.parse(s));
try{const log=createLogger('warn',{service:'studio'});log.info('filtered');log.child({stage:'generation'}).warn('failure',{status:400});log.error('error');assert.equal(messages.length,2);assert.equal(messages[0].service,'studio');assert.equal(messages[0].stage,'generation');assert.equal(messages[0].status,400);assert.equal(messages[1].level,'error');assert.ok(!Number.isNaN(Date.parse(messages[0].ts)));}finally{console.log=oldLog;console.error=oldError;}
console.log('PASS: recovered structured logger level filtering, child fields, timestamps and error output.');
