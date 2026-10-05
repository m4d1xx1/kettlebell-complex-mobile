const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const memory = new Map(); let failWrites = false, failReads = false;
const storage = { getItem: async key => { if(failReads) throw Error('disk read'); return memory.get(key) ?? null; }, setItem: async (key, value) => { if(failWrites) throw Error('disk full'); await new Promise(r=>setTimeout(r, key==='order'&&value==='1'?8:0)); memory.set(key,value); }, removeItem: async key => { if(failWrites) throw Error('disk full'); memory.delete(key); } };
const cache = new Map();
function load(file) {
  file = path.resolve(root,file); if (cache.has(file)) return cache.get(file);
  const exports = {}; cache.set(file,exports);
  const code = ts.transpileModule(fs.readFileSync(file,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code,{ exports, require: id => id==='@react-native-async-storage/async-storage'?{__esModule:true,default:storage}:load(path.resolve(path.dirname(file),id)+'.ts'), setTimeout, Date, Math, Map, Set, JSON });
  return exports;
}
const { BASE_EXERCISES } = load('src/data/exercises.ts');
const { createSession, tickSession, actOnSession, restoreSession, remainingSeconds, sessionSummary, validSession, planFingerprint } = load('src/workout/session.ts');
const { readStored, writeStored } = load('src/storage/store.ts');
const { validPlan, validExercises, validHistory } = load('src/storage/validation.ts');
const plan = { name:'Test',weightKg:16,rounds:2,restSeconds:5,items:[{key:'a',exerciseId:'plank',mode:'time',value:10,side:'alternate'}] };
const start = (p=plan,manual=false) => createSession(p,BASE_EXERCISES,manual,1000);
let s = tickSession(start(),29000); // delayed callback crosses countdown, work, rest and work
assert.equal(s.phase,'done'); let result=sessionSummary(s);assert.equal(result.workSeconds,20);assert.equal(result.restSeconds,5);assert.equal(result.bodyweight.totalSeconds,20);assert.equal(result.rounds,2);assert.equal(s.status,'completed');
s=actOnSession(start(),'pause',8500);assert.equal(remainingSeconds(s),6);s=tickSession(s,108500);assert.equal(remainingSeconds(s),6);assert.equal(sessionSummary(s).workSeconds,5);s=actOnSession(s,'resume',108500);s=tickSession(s,114000);assert.equal(s.phase,'rest');assert.equal(sessionSummary(s).pauseSeconds,100);
s=tickSession(start(plan,true),19000);assert.equal(s.waiting,true);s=tickSession(s,29000);assert.equal(s.round,1);assert.equal(sessionSummary(s).pauseSeconds,10);s=actOnSession(s,'continue',29000);assert.equal(s.round,2);assert.equal(s.phase,'exercise');
s=actOnSession(tickSession(start({...plan,rounds:1}),4000),'next',6500);assert.equal(s.phase,'done');assert.equal(s.status,'partial');assert.equal(sessionSummary(s).bodyweight.totalSeconds,2);assert.equal(sessionSummary(s).rounds,0);
const reps={...plan,rounds:1,items:[{key:'r',exerciseId:'swing',mode:'reps',value:12,side:'alternate'},{key:'p',exerciseId:'push-up',mode:'reps',value:8,side:'alternate'}]};
s=actOnSession(tickSession(start(reps),4000),'next',14000);s=actOnSession(s,'skip',18000);result=sessionSummary(s);assert.equal(result.totalReps,12);assert.equal(result.volumeKg,192);assert.equal(s.status,'partial');
s=actOnSession(start(reps),'finish-partial',14000);assert.equal(sessionSummary(s).totalReps,0);assert.equal(sessionSummary(s).workSeconds,10);
s=actOnSession(tickSession(start(reps),4000),'next',14000);s=actOnSession(s,'back',15000);assert.equal(s.results.length,0);assert.equal(s.index,0);s=actOnSession(s,'next',24000);assert.equal(sessionSummary(s).totalReps,12);
s=restoreSession(tickSession(start(),6500),1e8);assert.equal(s.paused,true);assert.equal(remainingSeconds(s),8);assert.equal(validSession(JSON.parse(JSON.stringify(s))),true);s=tickSession(s,1e8+5000);assert.equal(remainingSeconds(s),8);
assert.equal(validSession({...s,index:999}),false);assert.equal(validPlan({...plan,rounds:NaN}),false);assert.equal(validExercises(BASE_EXERCISES),true);assert.equal(validHistory([{id:'bad'}]),false);
assert.equal(planFingerprint(plan,BASE_EXERCISES,false),planFingerprint({...plan,name:'Renamed',items:plan.items.map(i=>({...i,key:'new-key'}))},BASE_EXERCISES,false));
for(const changed of [{...plan,weightKg:24},{...plan,restSeconds:30},{...plan,items:[{...plan.items[0],value:20}]}]) assert.notEqual(planFingerprint(plan,BASE_EXERCISES,false),planFingerprint(changed,BASE_EXERCISES,false));
// Real epoch timestamps must survive checkpoint validation.
assert.equal(validSession(createSession(plan, BASE_EXERCISES, false, Date.now())), true);
const corrupt = tickSession(start(), 29000);
assert.equal(validSession({...corrupt, fingerprint: 'wrong'}), false);
assert.equal(validSession({...corrupt, results: [{...corrupt.results[0],seconds:999}]}), false);
// Hands-free timing: the same elapsed time drives the rep label and pose.
const { remainingReps, repPlayback } = load('src/workout/repTiming.ts');
const timing = {secondsPerRep:3,transitionSeconds:5};
const automatic = {...reps,rounds:2,restSeconds:5,items:[{...reps.items[0],value:2},{...reps.items[1],value:1}]};
let auto = createSession(automatic,BASE_EXERCISES,false,1000,timing);
assert.notEqual(auto.fingerprint,start(automatic).fingerprint);
auto=tickSession(auto,4000);assert.equal(auto.phase,'exercise');
auto=tickSession(auto,6999);assert.equal(remainingReps(2,auto.phaseMs,3),2);
assert.ok(repPlayback('swing',auto.phaseMs,3).progress>0.99);
auto=tickSession(auto,7000);assert.equal(remainingReps(2,auto.phaseMs,3),1);assert.equal(repPlayback('swing',auto.phaseMs,3).progress,0);
auto=actOnSession(auto,'pause',7500);const frozenPose=repPlayback('swing',auto.phaseMs,3);
auto=tickSession(auto,17500);assert.deepEqual(repPlayback('swing',auto.phaseMs,3),frozenPose);
auto=actOnSession(auto,'resume',17500);auto=tickSession(auto,20000);
assert.equal(auto.phase,'transition');assert.equal(auto.index,1);assert.equal(auto.results[0].estimatedReps,true);assert.equal(remainingSeconds(auto),5);
assert.equal(validSession(JSON.parse(JSON.stringify(auto))),true);
const recoveredAuto=restoreSession(auto,90000);assert.equal(recoveredAuto.paused,true);assert.equal(tickSession(recoveredAuto,95000).phaseMs,auto.phaseMs);
// A stale next action at a deadline must not skip the next exercise.
let boundary=tickSession(createSession(automatic,BASE_EXERCISES,false,1000,timing),4000);
boundary=actOnSession(boundary,'next',10000);assert.equal(boundary.phase,'transition');assert.equal(boundary.results.length,1);
// The complete sequence takes 18s work + 10s switches + 5s round rest.
auto=tickSession(createSession(automatic,BASE_EXERCISES,false,1000,timing),37000);
assert.equal(auto.phase,'done');assert.equal(auto.results.length,4);assert.equal(sessionSummary(auto).totalReps,6);
assert.equal(sessionSummary(auto).workSeconds,18);assert.equal(sessionSummary(auto).restSeconds,15);assert.equal(validSession(auto),true);
// Manual round rest remains opt-in, even with automatic exercises.
auto=tickSession(createSession(automatic,BASE_EXERCISES,true,1000,timing),50000);assert.equal(auto.waiting,true);assert.equal(auto.round,1);
auto=actOnSession(auto,'continue',50000);assert.equal(auto.round,2);assert.equal(auto.phase,'exercise');
// No transition after the final exercise; zero switch time also works.
auto=tickSession(createSession({...automatic,rounds:1},BASE_EXERCISES,false,1000,{...timing,transitionSeconds:0}),13000);assert.equal(auto.phase,'done');
// Separate left/right steps get a switch countdown and reset their reps.
const sided={...automatic,rounds:1,items:[{key:'side',exerciseId:'clean',mode:'reps',value:1,side:'both'}]};
auto=tickSession(createSession(sided,BASE_EXERCISES,false,1000,timing),7000);assert.equal(auto.phase,'transition');assert.equal(auto.steps[auto.index].side,'right');
auto=tickSession(auto,12000);assert.equal(remainingReps(1,auto.phaseMs,3),1);
// Authored two-sided loops count one rep per side, including an odd last rep.
for(const id of ['farmer-march','front-rack-march','mountain-climber','high-knees','bodyweight-reverse-lunge']) {
 assert.equal(repPlayback(id,3000,3).progress,0.5);assert.equal(repPlayback(id,6000,3).progress,0);assert.equal(remainingReps(3,9000,3),0);
}
assert.equal(validSession({...auto,autoTiming:{secondsPerRep:0,transitionSeconds:5}}),false);
const {validSettings}=load('src/storage/validation.ts');
assert.equal(validSettings({autoAdvanceExercises:true,secondsPerRep:3,transitionSeconds:5}),true);
assert.equal(validSettings({secondsPerRep:NaN}),false);assert.equal(validSettings({transitionSeconds:1.5}),false);
const { quickStartPlan } = load('src/workout/quickStart.ts');
const { calculatePlanStats } = load('src/workout/steps.ts');
const { timingFromSettings } = load('src/workout/timing.ts');
assert.equal(timingFromSettings({autoAdvanceExercises:false}),undefined);
assert.equal(JSON.stringify(timingFromSettings({})),JSON.stringify(timing));
// Every automatic estimate must reach done on the same deadline as the runner.
for (const restSeconds of [0,5,60]) for (const rounds of [1,3]) for (const transitionSeconds of [0,5,60]) {
  const p={...sided,rounds,restSeconds};
  const pace={secondsPerRep:3.5,transitionSeconds};
  const duration=calculatePlanStats(p,BASE_EXERCISES,pace).estimatedSeconds;
  const run=createSession(p,BASE_EXERCISES,false,0,pace);
  assert.notEqual(tickSession(run,duration*1000-1).phase,'done');
  assert.equal(tickSession(run,duration*1000).phase,'done');
}
assert.equal(calculatePlanStats({...plan,items:[]},BASE_EXERCISES,timing).estimatedSeconds,0);
for (const equipment of ['kettlebell','bodyweight']) for (const minutes of [10,15,20]) for (const level of ['Beginner','Intermediate']) for (const goal of ['Strength','Conditioning']) {
  const quick = quickStartPlan(equipment,minutes,level,goal,16,BASE_EXERCISES);
  assert.equal(validPlan(quick),true);
  const run = createSession(quick,BASE_EXERCISES,false,Date.now());
  assert.equal(validSession(run),true);
  assert.ok(run.steps.every(step => (step.exercise.equipment ?? 'kettlebell') === equipment));
  for (const pace of [timing,{secondsPerRep:10,transitionSeconds:60}]) {
    const guided=quickStartPlan(equipment,minutes,level,goal,16,BASE_EXERCISES,pace);
    const duration=calculatePlanStats(guided,BASE_EXERCISES,pace).estimatedSeconds;
    const error=Math.abs(duration-minutes*60);
    for(let rounds=1;rounds<=30;rounds++) assert.ok(error<=Math.abs(calculatePlanStats({...guided,rounds},BASE_EXERCISES,pace).estimatedSeconds-minutes*60));
    assert.equal(tickSession(createSession(guided,BASE_EXERCISES,false,0,pace),duration*1000).phase,'done');
  }
}
// Every phase/transition must remain recoverable after serialization.
for (const manual of [false,true]) {
  let run = createSession(plan,BASE_EXERCISES,manual,Date.now());
  for(let i=0;i<100;i++) {
    run = tickSession(run,run.lastAt+500);
    assert.equal(validSession(JSON.parse(JSON.stringify(run))),true);
    if(run.waiting) run=actOnSession(run,'continue',run.lastAt);
  }
}
const {compareWork}=load('src/workout/comparison.ts');
const rested=tickSession(start(),29000);
let skippedRest=tickSession(start(),14000);skippedRest=actOnSession(skippedRest,'continue',14000);skippedRest=tickSession(skippedRest,24000);
const prior={id:'prior',sessionId:'prior',status:'completed',timeBasis:'monotonic-v2',fingerprint:rested.fingerprint,workSeconds:20,restSeconds:5,pauseSeconds:0};
assert.equal(compareWork(skippedRest,[prior]).workDelta,0);
assert.equal(compareWork(skippedRest,[{...prior,timeBasis:'active-v1'}]),null);
// Actual rep entry preserves partial work, side identity and recovery compatibility.
const repPlan={...reps,items:[{...reps.items[0],value:10}]};
const entry = (run,count,endWorkout=false) => ({type:'record-reps',reps:count,round:run.round,stepKey:run.steps[run.index].stepKey,endWorkout});
for(const count of [0,6,10]) {
  let run=actOnSession(tickSession(start(repPlan),4000),'pause',10000);
  run=actOnSession(run,entry(run,count),13000);
  assert.equal(sessionSummary(run).totalReps,count);assert.equal(sessionSummary(run).volumeKg,count*16);
  assert.equal(run.status,count===10?'completed':'partial');assert.equal(validSession(JSON.parse(JSON.stringify(run))),true);
}
let partial=tickSession(start(reps),4000);partial=actOnSession(partial,entry(partial,6,true),12000);assert.equal(partial.phase,'done');assert.equal(partial.results[0].reps,6);assert.equal(partial.status,'partial');
for(const count of [-1,11,1.5,NaN]) {const run=tickSession(start(repPlan),4000);assert.equal(actOnSession(run,entry(run,count),5000).results.length,0);}
const sidePlan={...repPlan,items:[{key:'side',exerciseId:'row',mode:'reps',value:10,side:'both'}]};
let bilateral=tickSession(start(sidePlan),4000);const old=entry(bilateral,6);bilateral=actOnSession(bilateral,old,5000);assert.equal(bilateral.index,1);bilateral=actOnSession(bilateral,old,6000);assert.equal(bilateral.results.length,1);bilateral=actOnSession(bilateral,entry(bilateral,8),7000);assert.equal(sessionSummary(bilateral).totalReps,14);
// Focus and experience must change the actual prescription, not just its title.
const prescription = p => JSON.stringify({rest:p.restSeconds,items:p.items.map(({exerciseId,mode,value,side})=>({exerciseId,mode,value,side}))});
for(const equipment of ['kettlebell','bodyweight']) {
  for(const level of ['Beginner','Intermediate']) assert.notEqual(prescription(quickStartPlan(equipment,10,level,'Strength',16,BASE_EXERCISES)),prescription(quickStartPlan(equipment,10,level,'Conditioning',16,BASE_EXERCISES)));
  for(const goal of ['Strength','Conditioning']) assert.notEqual(prescription(quickStartPlan(equipment,10,'Beginner',goal,16,BASE_EXERCISES)),prescription(quickStartPlan(equipment,10,'Intermediate',goal,16,BASE_EXERCISES)));
}
const {getMotion,samplePose}=load('src/animation/exercisePoses.ts');
const bones=[['hip','shoulder',24],['shoulder','head',10],['hip','leftKnee',18],['hip','rightKnee',18],['leftKnee','leftFoot',18],['rightKnee','rightFoot',18],['shoulder','leftElbow',16],['shoulder','rightElbow',16],['leftElbow','leftHand',15.5],['rightElbow','rightHand',15.5]];
for(const e of BASE_EXERCISES) {
  const motion=getMotion(e.id,e.visual,e.equipment??'kettlebell');let prev=samplePose(motion,0);
  for(let i=0;i<=1000;i++) {
    const pose=samplePose(motion,i/1000);
    for(const [a,b,length] of bones) assert.ok(Math.abs(Math.hypot(pose[a].x-pose[b].x,pose[a].y-pose[b].y)-length)<1e-6,e.id+' changing bone length');
    for(const [key,point] of Object.entries(pose)) if(typeof point==='object') {
      assert.ok(point.x>=0&&point.x<=100&&point.y>=0&&point.y<=100,e.id+' outside canvas');
      assert.ok(Math.hypot(point.x-prev[key].x,point.y-prev[key].y)<2,e.id+' discontinuous joint');
    }
    prev=pose;
  }
}
(async()=>{
  await Promise.all([writeStored('order',1),writeStored('order',2)]);assert.equal(memory.get('order'),'2');
  memory.set('broken','{bad json');await assert.rejects(readStored('broken',validPlan));await assert.rejects(writeStored('broken',plan));assert.equal(memory.get('broken'),'{bad json');
  failReads=true;await assert.rejects(readStored('unread',validPlan));failReads=false;await assert.rejects(writeStored('unread',plan));
  await readStored('unread',validPlan);await writeStored('unread',plan);assert.equal((await readStored('unread',validPlan)).rounds,2);
  failWrites=true;await assert.rejects(writeStored('order',3));failWrites=false;await writeStored('order',4);assert.equal(memory.get('order'),'4');
  console.log('PASS: delayed clocks, pauses, manual rest, partial/skip results, backtracking, recovery, fingerprints, validators, ordered writes and failure preservation.');
})().catch(e=>{console.error(e);process.exitCode=1});
