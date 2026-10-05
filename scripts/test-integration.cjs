// Execute the real provider/hook modules with deterministic React lifecycle and native adapters.
// These checks do not replace a physical iOS/Android test.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
const memory=new Map(),failKeys=new Set(),writeGates=new Map(),timers=new Map(),listeners=new Set();
let mono=10000,wall=1800000000000,activeHarness,timerId=0;
const NativeDate=Date;
class FakeDate extends NativeDate { constructor(...args){super(...(args.length?args:[wall]));} static now(){return wall;} }
const native={Alert:{alert:()=>{}},AppState:{currentState:'active',addEventListener:(_event,fn)=>{listeners.add(fn);return {remove:()=>listeners.delete(fn)}}}};
const storage={getItem:async k=>memory.get(k)??null,setItem:async(k,v)=>{await Promise.resolve();if(writeGates.has(k))await writeGates.get(k);if(failKeys.has(k))throw Error('write failed');memory.set(k,v)},removeItem:async k=>{if(failKeys.has(k))throw Error('write failed');memory.delete(k)},getAllKeys:async()=>[...memory.keys()],multiGet:async keys=>keys.map(k=>[k,memory.get(k)??null])};
function depsChanged(a,b){return !a||!b||a.length!==b.length||a.some((v,i)=>!Object.is(v,b[i]));}
const react={__esModule:true,createContext:()=>({Provider:'Provider'}),useContext:()=>activeHarness.value,
 useState:init=>{const h=activeHarness,i=h.cursor++;if(!(i in h.slots))h.slots[i]=typeof init==='function'?init():init;return [h.slots[i],v=>{h.slots[i]=typeof v==='function'?v(h.slots[i]):v;h.dirty=true}]},
 useRef:init=>{const h=activeHarness,i=h.cursor++;return h.slots[i]??(h.slots[i]={current:init})},
 useMemo:(fn,deps)=>{const h=activeHarness,i=h.cursor++;if(!h.slots[i]||depsChanged(h.slots[i].deps,deps))h.slots[i]={deps,value:fn()};return h.slots[i].value},
 useEffect:(fn,deps)=>{const h=activeHarness,i=h.cursor++;if(!h.slots[i]||depsChanged(h.slots[i].deps,deps)){const old=h.slots[i];h.effects.push(()=>{old?.cleanup?.();h.slots[i]={deps,cleanup:fn()}})}},
 createElement:(kind,props)=>{if(kind==='Provider')activeHarness.value=props.value;return null}};
react.useCallback=(fn,deps)=>react.useMemo(()=>fn,deps);react.default=react;
const cache=new Map();function load(file){file=path.resolve(root,file);if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{exports,require:id=>id==='react'?react:id==='react-native'?native:id==='@react-native-async-storage/async-storage'?{__esModule:true,default:storage}:load(resolve(file,id)),Date:FakeDate,performance:{now:()=>mono},Math,Map,Set,JSON,Promise,setInterval:fn=>{timers.set(++timerId,fn);return timerId},clearInterval:id=>timers.delete(id)});return exports;}
function resolve(file,id){const p=path.resolve(path.dirname(file),id);return fs.existsSync(p+'.ts')?p+'.ts':p+'.tsx';}
function harness(fn){const h={slots:[],effects:[],cursor:0,dirty:false,value:null,render(){activeHarness=h;h.cursor=0;h.dirty=false;const out=fn();if(out)h.value=out;const effects=h.effects.splice(0);effects.forEach(run=>run());return h.value},unmount(){for(const slot of h.slots)slot?.cleanup?.()}};h.render();return h;}
async function settle(h){for(let i=0;i<40;i++){await Promise.resolve();if(h?.dirty)h.render();}}
(async()=>{
 const {WorkoutProvider}=load('src/context/WorkoutContext.tsx');const provider=harness(()=>WorkoutProvider({children:null}));await settle(provider);
 // Setup must not report success when settings cannot be saved.
 failKeys.add('kb.settings.v4');assert.equal(await provider.value.updateSettings({onboardingComplete:true}),false);await settle(provider);assert.equal(provider.value.settings.onboardingComplete,false);
 failKeys.clear();assert.equal(await provider.value.updateSettings({onboardingComplete:true}),true);await settle(provider);assert.equal(provider.value.settings.onboardingComplete,true);
 const input={name:'A',category:'Strength',mode:'reps',value:10,unilateral:false,equipment:'bodyweight'};
 await Promise.all([provider.value.addCustomExercise(input),provider.value.addCustomExercise({...input,name:'B'})]);await settle(provider);
 assert.equal(provider.value.customExercises.length,2);assert.equal(provider.value.plan.items.length,2);
 assert.ok(provider.value.plan.items.every(i=>provider.value.exercises.some(e=>e.id===i.exerciseId)));
 await Promise.all([provider.value.saveCurrent(),provider.value.saveCurrent()]);await settle(provider);assert.equal(provider.value.saved.length,2);
 await Promise.all(Array.from({length:74},()=>provider.value.saveCurrent()));await settle(provider);assert.equal(provider.value.saved.length,76);
 const ids=provider.value.saved.map(x=>x.id);await Promise.all(ids.map(id=>provider.value.deleteSaved(id)));await settle(provider);assert.equal(provider.value.saved.length,0);
 const entry={sessionId:'outbox-1',planName:'Recovery',completedAt:'2026-09-29T10:00:00.000Z',durationSeconds:20,weightKg:0,rounds:1,exerciseCount:1,totalReps:0,volumeKg:0};
 failKeys.add('kb.history.v2');assert.equal(await provider.value.completeWorkout(entry),'pending');await settle(provider);assert.equal(provider.value.pendingHistory.length,1);
 failKeys.clear();await provider.value.retryPending();await settle(provider);assert.equal(provider.value.pendingHistory.length,0);assert.equal(provider.value.history[0].completedAt,entry.completedAt);
 await provider.value.completeWorkout(entry);await settle(provider);assert.equal(provider.value.history.length,1);
 const {readStored,archiveAndReset,exportStoredCopies}=load('src/storage/store.ts');const {validHistory}=load('src/storage/validation.ts');
 memory.set('kb.history.v2','BROKEN ORIGINAL');await assert.rejects(readStored('kb.history.v2',validHistory));assert.equal(await provider.value.completeWorkout({...entry,sessionId:'outbox-2'}),'pending');await provider.value.recoverHistory();await settle(provider);
 assert.equal(provider.value.history.length,1);assert.ok((await exportStoredCopies()).includes('BROKEN ORIGINAL'));
 memory.set('kb.protected','original');failKeys.add(`kb.protected.backup.${wall}`);await assert.rejects(archiveAndReset('kb.protected'));assert.equal(memory.get('kb.protected'),'original');failKeys.clear();
 const {useWorkoutSession}=load('src/hooks/useWorkoutSession.ts');const {BASE_EXERCISES}=load('src/data/exercises.ts');const plan={name:'Clock',weightKg:0,rounds:1,restSeconds:0,items:[{key:'x',exerciseId:'plank',mode:'time',value:20,side:'alternate'}]};
 let hook=harness(()=>useWorkoutSession(true));await settle(hook);await hook.value.start(plan,BASE_EXERCISES,false);await settle(hook);
 const advance=async ms=>{mono+=ms;for(const fn of timers.values())fn();await settle(hook)};
 await advance(4000);const work=hook.value.session.workMs;assert.equal(work,1000);
 wall+=3600000;await advance(1000);assert.equal(hook.value.session.workMs,2000);
 wall-=7200000;await advance(1000);assert.equal(hook.value.session.workMs,3000);
 native.AppState.currentState='background';listeners.forEach(fn=>fn('background'));await settle(hook);await advance(10000);assert.equal(hook.value.session.workMs,3000);assert.equal(hook.value.session.paused,true);
 hook.unmount();await settle();native.AppState.currentState='active';hook=harness(()=>useWorkoutSession(true));await settle(hook);assert.equal(hook.value.session.paused,true);assert.equal(hook.value.session.workMs,3000);
 hook.value.act('resume');await settle(hook);await advance(17000);assert.equal(hook.value.session.phase,'done');assert.ok(hook.value.session.finishedAt);await hook.value.acknowledge();hook.unmount();await settle();assert.equal(memory.has('kb.activeSession.v1'),false);
 // Leaving during the initial checkpoint write must persist a paused session.
 let release;writeGates.set('kb.activeSession.v1',new Promise(resolve=>release=resolve));
 let starting=harness(()=>useWorkoutSession(true));await settle(starting);const inFlight=starting.value.start(plan,BASE_EXERCISES,false);await settle(starting);starting.unmount();release();writeGates.delete('kb.activeSession.v1');await inFlight;await settle();
 let restored=harness(()=>useWorkoutSession(true));await settle(restored);assert.equal(restored.value.session.paused,true);await restored.value.discard();restored.unmount();await settle();
 // Checkpoint deletion failure must remain recoverable; acknowledgement can be retried.
 let failedAck=harness(()=>useWorkoutSession(true));await settle(failedAck);await failedAck.value.start(plan,BASE_EXERCISES,false);await settle(failedAck);failedAck.value.act('finish-partial');await settle(failedAck);
 failKeys.add('kb.activeSession.v1');await assert.rejects(failedAck.value.acknowledge());assert.ok(memory.has('kb.activeSession.v1'));failKeys.clear();await failedAck.value.acknowledge();failedAck.unmount();await settle();assert.equal(memory.has('kb.activeSession.v1'),false);
 provider.unmount();console.log('PASS: concurrent provider mutations, pending results, recovery archives, deduplication, calendar jumps, background pause, remount recovery and checkpoint acknowledgement.');
})().catch(error=>{console.error(error);process.exitCode=1});
