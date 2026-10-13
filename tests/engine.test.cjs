const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../src/engine.js');
const start=(id='telemetry',v='malicious')=>E.reduce(E.create(id,v),{type:'start'});
const at=(run,time)=>{while(run.time<time)run=E.reduce(run,{type:'step'});return run;};
const action=(run,option,role='operator')=>E.reduce(run,{type:'action',option,role,rationale:'Synthetic test decision'});
test('Three independent cases and paired starting symptoms',()=>{
 assert.equal(Object.keys(E.scenarios).length,3);
 for(const id of ['telemetry','link'])assert.deepEqual(E.visible(start(id,'benign'),'operator'),E.visible(start(id,'malicious'),'operator'));
 assert.throws(()=>E.create('unknown'));assert.throws(()=>E.create('command','benign'));
});
test('Role visibility and delayed evidence preserve source and receipt times',()=>{
 let r=at(start('link'),60);assert(!E.visible(r,'operator').some(e=>e.id==='delayed'));
 r=at(r,90);const delayed=E.visible(r,'operator').find(e=>e.id==='delayed');assert.equal(delayed.sourceTime,15);assert.equal(delayed.receiptTime,90);
 assert(!E.visible(r,'operator').some(e=>e.id==='link-trace'));assert.equal(E.visible(r,'instructor').length,4);
});
test('Decision snapshot never gains later evidence',()=>{
 let r=action(start(),'hold');const ids=structuredClone(r.actions[0].evidenceIds);r=at(r,180);
 assert.deepEqual(r.actions[0].evidenceIds,ids);assert(!ids.includes('reference'));assert(E.visible(r,'operator').some(e=>e.id==='reference'));
});
test('Invalid actions fail without mutating the input',()=>{
 const r=start(),before=JSON.stringify(r);assert.throws(()=>action(r,'correct'),/required evidence/);assert.throws(()=>action(r,'hold','instructor'),/crew action/);assert.throws(()=>action(r,'unknown'));
 assert.equal(JSON.stringify(r),before);assert.throws(()=>E.reduce(E.create(),{type:'step'}));
});
test('Same correction has different consequences across matched telemetry variants',()=>{
 const benign=at(action(at(start('telemetry','benign'),60),'correct'),180),malicious=at(action(at(start(),60),'correct'),180);
 assert.equal(benign.mission.opportunity,'Configured observation missed');assert.equal(malicious.mission.opportunity,'Configured observation preserved');
 assert.equal(at(action(start('telemetry','benign'),'hold'),180).mission.opportunity,'Configured observation preserved');
});
test('Command containment and alternate-route restoration are separate steps',()=>{
 let r=at(start('command'),30);r=action(r,'contain','cyber');assert.match(r.mission.command,/isolated/);assert.throws(()=>action(r,'restore'),/required evidence/);
 r=at(r,90);r=action(r,'restore');assert.match(r.mission.command,/Alternate route available/);assert.match(at(r,180).mission.opportunity,/Control path available/);
 assert.throws(()=>action(at(start('command'),90),'restore'),/Contain/);
});
test('Recovery requires an open contact and a received forecast',()=>{
 assert.throws(()=>action(at(start('link'),60),'recover'),/not open/);
 const r=action(at(start('link'),90),'recover');assert.match(r.mission.link,/available/);
 assert.throws(()=>action(at(start('link'),180),'recover'),/Completed runs/);
});
test('Replay preserves interleaved notes, pause and actions exactly',()=>{
 let r=start();r=E.reduce(r,{type:'note',role:'cyber',text:'<img src=x onerror=alert(1)>'});r=E.reduce(r,{type:'pause'});r=action(r,'hold');r=at(r,180);
 assert.deepEqual(E.replay(r),r);assert.equal(r.notes[0].text,'<img src=x onerror=alert(1)>');
 assert.deepEqual(E.replay(E.create()),E.create());
});
test('Alternative is distinct and retains initial configuration and decision clock',()=>{
 const r=at(action(at(start(),60),'hold'),180),before=JSON.stringify(r),b=E.alternative(r,'correct','operator');
 assert.equal(b.configuration,r.configuration);assert.equal(b.actions[0].time,r.actions[0].time);assert.equal(b.parent,r.id);assert.notEqual(b.id,r.id);assert.equal(JSON.stringify(r),before);assert.notEqual(b.mission.opportunity,r.mission.opportunity);
});
test('Independent reset and stopped-run progression',()=>{
 const complete=at(action(start(),'hold'),180),fresh=E.create('command');assert.equal(fresh.actions.length,0);assert.equal(fresh.time,0);assert.throws(()=>E.reduce(complete,{type:'step'}));
 const stop=E.reduce(start(),{type:'stop'});assert.match(stop.result,/no final mission outcome/);assert.deepEqual(E.replay(stop),stop);
});
test('Seek requests coordination without fabricating a sensor reading',()=>{
 let r=action(start(),'seek');assert.equal(r.coordination.length,1);assert(!E.visible(r,'operator').some(e=>e.id==='shared-1'));
 r=at(r,30);assert(E.visible(r,'operator').some(e=>e.id==='shared-1'));assert(!E.visible(r,'operator').some(e=>e.id==='reference'));
});

test('Alternative preserves earlier evidence-seeking time',()=>{
 let r=action(start(),'seek');r=at(r,60);r=action(r,'hold');r=at(r,180);const b=E.alternative(r,'correct','operator');assert.equal(b.actions[0].time,0);assert.equal(b.actions[1].time,60);assert.deepEqual(b.actions[1].evidenceIds,r.actions[1].evidenceIds);
});

test('Crew handoff keeps source evidence and arrives after the send time',()=>{
 let r=E.reduce(E.create('command'),{type:'start'});r=E.reduce(r,{type:'step'});
 assert.throws(()=>E.reduce(r,{type:'share',role:'operator',evidenceId:'provenance'}),/received/);
 r=E.reduce(r,{type:'share',role:'cyber',evidenceId:'provenance'});
 assert.equal(E.visible(r,'operator').some(e=>e.id==='handoff-1'),false);
 r=E.reduce(r,{type:'step'});const h=E.visible(r,'operator').find(e=>e.id==='handoff-1');
 assert.equal(h.sourceTime,5);assert.equal(h.receiptTime,60);assert.equal(h.parentEvent,'provenance');assert.equal(h.artifact.kind,'Authorization audit');
 assert.deepEqual(E.replay(r),r);
});
test('Fault injection is instructor-controlled, changes state and gates recovery',()=>{
 let r=E.reduce(E.create('link'),{type:'start'});
 assert.throws(()=>E.reduce(r,{type:'inject',role:'operator',fault:'communications'}),/Instructor/);
 assert.throws(()=>E.reduce(r,{type:'inject',role:'instructor',fault:'malicious'}),/compatible/);
 r=E.reduce(r,{type:'inject',role:'instructor',fault:'communications'});
 assert.match(r.mission.link,/Lost/);assert.throws(()=>E.reduce(r,{type:'action',role:'operator',option:'resolve-fault'}),/check/);
 assert.throws(()=>E.reduce(r,{type:'inject',role:'instructor',fault:'antenna'}),/Recover/);
 r=E.reduce(r,{type:'step'});r=E.reduce(r,{type:'action',role:'operator',option:'resolve-fault'});
 assert.equal(r.faults[0].resolved,true);assert.deepEqual(E.replay(r),r);
 const prior=r;const branch=E.alternative(r,'hold','operator');assert.equal(branch.faults.length,1);assert.equal(branch.faults[0].resolved,false);assert.match(branch.result,/unresolved/);assert.deepEqual(r,prior);
});
test('Unresolved inject survives endpoint and reset clears faults and handoffs',()=>{
 let r=E.reduce(E.create('command'),{type:'start'});r=E.reduce(r,{type:'inject',role:'instructor',fault:'malicious'});
 for(let i=0;i<6;i++)r=E.reduce(r,{type:'step'});
 assert.match(r.result,/unresolved/);assert.equal(E.create().faults.length,0);assert.equal(E.create().handoffs.length,0);
});
