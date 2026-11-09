/* Howler 2.2.4/MIT. Recording-derived action stems are mixed OFFLINE.
 * Auditory approval is pending. No Lexicon/FMOD is used here.
 * Impact calls never wait for decoding or queue stale sounds. */
window.AudioMatrix=(()=>{
 'use strict';
 const data=window.ACTION_FOLEY_DATA,profiles=data.profiles,banks=new Map(),voices=new Map(),charges=new Map(),inFlight=new Set(),variants=new Map(),trace=[],failed=new Set(),media=new WeakMap(),tailTimers=new Set();
 const limit=6,budget=16*1024*1024,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
 let ctx,musicBus,bedBus,limiter,meter,active=false,unlocked=false,sound=true,epoch=0,duckUntil=0,voiceUntil=0,duckTimer,mainAction,lastEnemies=[],maxVoices=0,misses=0,pressure=0;
 let settings={enabled:true,level:.75};
 const log=(type,detail={})=>{trace.push({type,at:ctx?.currentTime||0,...detail});if(trace.length>160)trace.shift()};
 function prefs(){try{Object.assign(settings,JSON.parse(localStorage.getItem('erion-chapter-sfx-v1')||'{}'))}catch{}}
 function init(){if(ctx)return ctx;if(window.GameAudio)ctx=GameAudio.context();else{Howler.autoSuspend=false;Howler.autoUnlock=false;Howler.volume(Howler.volume());ctx=Howler.ctx}if(!ctx)throw Error('Web Audio unavailable');
  musicBus=ctx.createGain();bedBus=ctx.createGain();limiter=ctx.createDynamicsCompressor();meter=ctx.createAnalyser();meter.fftSize=256;
  limiter.threshold.value=-6;limiter.knee.value=3;limiter.ratio.value=12;limiter.attack.value=.002;limiter.release.value=.15;
  // stable-music-r19: SFX cannot trigger gain reduction on music or ambience.
  Howler.masterGain.disconnect();Howler.masterGain.connect(limiter);limiter.connect(meter);musicBus.connect(ctx.destination);bedBus.connect(ctx.destination);meter.connect(GameAudio.effectsInput());return ctx;
 }
 function ramp(bus,to,ms){if(!ctx||!bus)return;const p=bus.gain,t=ctx.currentTime;if(p.cancelAndHoldAtTime)p.cancelAndHoldAtTime(t);else{const v=p.value;p.cancelScheduledValues(t);p.setValueAtTime(v,t)}p.linearRampToValueAtTime(to,t+ms/1000)}
 let narrationDucked=false;
 function refreshDuck(){clearTimeout(duckTimer);const now=performance.now(),speech=now<voiceUntil;
  if(speech!==narrationDucked){narrationDucked=speech;ramp(musicBus,speech?.28:1,speech?120:500);ramp(bedBus,speech?.18:1,speech?120:500);}
  if(speech)duckTimer=setTimeout(refreshDuck,voiceUntil-now+10);
 }
 function duck(){/* Combat SFX keep the background level steady. */}
 function stop(key){const v=voices.get(key);if(!v)return;voices.delete(key);v.howl.stop(v.id)}
 function stopGroup(group){for(const[k,v]of [...voices])if(v.group===group)stop(k)}
 function unload(){for(const key of [...voices.keys()])stop(key);for(const row of banks.values()){clearTimeout(row.timer);row.resolve?.(false);row.howl.unload()}banks.clear()}
 function profile(e={}){const p=profiles[e.kind]||profiles[e.id]||Object.values(profiles).find(p=>p.name===e.name);if(p)return p;
  const n=e.name||'',family=e.audioFamily||(/觸腕|蟹|螯|螺|蛇|鰭|鰻/.test(n)?'ocean':/鸌|鳥|翼/.test(n)?'wing':/晶燈|晶箱|晶/.test(n)?'crystal':/撬棍|護送|護衛|鎚/.test(n)?'mechanism':/根|荊|木|藤/.test(n)?'plant':'beast');
  return {kind:e.id||n,name:n,family,scale:1,skill:/觸腕/.test(n)?'tentacle_slam':/晶箱/.test(n)?'crystal_box':family+'_skill'};
 }
 const keyOf=e=>e?.index??e?.id??e?.name??e?.kind,pan=e=>clamp(((e?.x??.5)-.5)*1.3,-.85,.85);
 function needed(enemies=lastEnemies){return new Set(['common','mechanism',...enemies.map(e=>profile(e).family)])}
 function loadBank(family){if(banks.has(family))return banks.get(family).promise;init();const def=data.banks[family];if(!def)return Promise.resolve(false);
  const pcm=f=>Math.ceil(data.banks[f].decodedBytes*ctx.sampleRate/32000),bytes=[...banks.keys()].reduce((n,f)=>n+pcm(f),0);if(bytes+pcm(family)>budget){log('bank-budget',{family});return Promise.resolve(false)}
  const row={howl:null,promise:null,resolve:null,timer:null};row.promise=new Promise(r=>row.resolve=r);banks.set(family,row);
  const finish=ok=>{if(banks.get(family)!==row)return;clearTimeout(row.timer);if(!ok)failed.add(family);row.resolve?.(ok);row.resolve=null};
  row.howl=new Howl({src:[def.src],format:['mp3'],sprite:def.sprite,preload:true,pool:limit,volume:0,
   onload:()=>finish(true),onloaderror:()=>finish(false),onplayerror:id=>{stop(family+':'+id);log('play-error',{family,id})},onend:id=>{const key=family+':'+id,v=voices.get(key);voices.delete(key);if(v?.tail&&v.epoch===epoch)ecologyTail()}});
  row.timer=setTimeout(()=>{finish(false);row.howl.unload();banks.delete(family)},15000);return row.promise;
 }
 function preload(enemies=lastEnemies){const want=needed(enemies);for(const[f,row]of [...banks])if(!want.has(f)&&![...voices.values()].some(v=>v.family===f)){clearTimeout(row.timer);row.resolve?.(false);row.howl.unload();banks.delete(f)}return Promise.all([...want].map(loadBank)).then(a=>a.every(Boolean))}
 const can=()=>active&&unlocked&&sound&&settings.enabled!==false&&clamp(settings.level)>0&&ctx?.state==='running'&&!document.hidden&&!window.GameAudio?.blocked;
 function sample(name,{volume=.55,pan=0,group='fx',priority=2,rate=1,tail=false}={}){
  if(!can())return null;const family=data.cueBanks[name],row=banks.get(family);if(row?.howl.state()!=='loaded'){misses++;log('missed-deadline',{name});return null}
  if(voices.size>=limit){const victim=[...voices].find(([,v])=>v.priority<priority);if(!victim){log('voice-budget',{name});return null}stop(victim[0])}
  const h=row.howl,id=h.play(name),key=family+':'+id;h.volume(clamp(volume*settings.level),id);h.stereo(clamp(pan,-1,1),id);h.rate(clamp(rate,.8,1.2),id);
  voices.set(key,{howl:h,id,family,name,group,priority,tail,epoch});maxVoices=Math.max(maxVoices,voices.size);log('play',{name,group,key});return key;
 }
 function ecologyTail(){if([...voices.values()].some(v=>v.group==='ecology'))return;const key=sample('bird_tail',{volume:.17,pan:-.5,priority:0,group:'ecology'});const v=voices.get(key);if(!v)return;v.howl.fade(.17*settings.level,0,1200,v.id);for(const [ms,p]of [[200,-.2],[400,.15],[700,.5],[1000,.8]]){const t=setTimeout(()=>{tailTimers.delete(t);if(voices.has(key))v.howl.stereo(p,v.id)},ms);tailTimers.add(t)}}
 function cancelCharge(index){inFlight.delete(index);const changed=charges.delete(index);stopGroup('charge:'+index);if(changed)refreshDuck()}
 function charge(e){if(!active||e.hp<=0)return;const key=keyOf(e);if(charges.has(key))return;charges.set(key,e);refreshDuck();const p=profile(e);sample(p.family+'_charge',{volume:.32,group:'charge:'+key,priority:0,pan:pan(e)});log('charge',{kind:p.kind,ratio:1,attackMs:0})}
 function monster(type,e,action){if(!active)return;const p=profile(e);if(type==='death'){cancelCharge(keyOf(e));sample(p.family+'_death',{volume:.45,priority:2,pan:pan(e)});return}
  if(type!=='action-start')return;
  if(['charge','chargeHold','charge_hold'].includes(action)){charge(e);return}
  if(action==='awaken'){charge(e);if(e.kind==='guardian')sample('guardian_awaken',{volume:.55,priority:2,pan:pan(e)});return}
  if(['attack','skill','release','call','hatch','summon'].includes(action)){// Keep charge ducking through the contact callback.
   if(charges.has(keyOf(e)))inFlight.add(keyOf(e));stopGroup('charge:'+keyOf(e));sample(p.family+'_windup',{volume:.3,priority:1,pan:pan(e),group:'windup:'+keyOf(e)});
  }
 }
 function impactCue(e,action){const p=profile(e);if(['hatch','summon'].includes(action)&&p.kind==='mother')return 'mother_hatch';if(/觸腕/.test(p.name)&&action==='skill')return 'tentacle_slam';
  if(['skill','release','call'].includes(action))return p.skill||p.family+'_skill';const v=variants.get(p.family)||0;variants.set(p.family,(v+1)%3);return p.family+'_attack_'+v;
 }
 function contact(e,action,name){log('contact',{kind:profile(e).kind,action,cue:name,hitStopSeconds:3/60,outputLatency:ctx?.outputLatency||ctx?.baseLatency||null});window.dispatchEvent(new CustomEvent('erion:audio-contact',{detail:{kind:profile(e).kind,action,cue:name,audioTime:ctx?.currentTime,hitStopSeconds:3/60}}))}
 function enemyImpact(e,action,guard=false){if(!active)return;cancelCharge(keyOf(e));stopGroup('windup:'+keyOf(e));const p=profile(e),name=impactCue(e,action);duck();
  if(guard==='dodge')sample('dodge',{volume:.4,priority:3});else{sample(name,{volume:guard?.28:.58*(p.scale||1),priority:4,pan:pan(e),tail:action!=='attack'});if(guard)sample('guard',{volume:.5,priority:4})}contact(e,action,name);
 }
 function groupImpact(enemies,heavy=false,guard=false){const living=enemies.filter(e=>e.hp>0&&!e.object);living.forEach(e=>cancelCharge(keyOf(e)));duck();
  // Three material voices maximum. Only one large cue includes the sub layer.
  const chosen=living.slice().sort((a,b)=>(b.atk||0)-(a.atk||0)).slice(0,3),gain=.64/Math.sqrt(Math.max(1,chosen.length));
  chosen.forEach((e,i)=>{const action=heavy&&i===0?'skill':'attack',name=impactCue(e,action);sample(name,{volume:gain*(guard?.48:1),priority:4,pan:pan(e),tail:heavy&&i===0});contact(e,action,name)});
  if(guard)sample(guard==='dodge'?'dodge':'guard',{volume:.48,priority:4});log('group-impact',{alive:living.length,mixed:chosen.length,heavy,guard});
 }
 function syncIntent(enemies,heavy){enemies.forEach(e=>{if(heavy&&!e.object&&e.hp>0)charge(e);else cancelCharge(keyOf(e))})}
 function armorBreak(e){if(!active)return;duck();sample('armor_break',{volume:.62,priority:4,pan:pan(e)});contact(e,'armor-break','armor_break')}
 function counter(e,kind){cancelCharge(keyOf(e));stopGroup('windup:'+keyOf(e));sample(profile(e).family+'_interrupt',{volume:.35,priority:2,pan:pan(e)});if(kind==='water')sample('counter_water',{volume:.45,priority:3});duck();log('counter',{kind:profile(e).kind,playerSkill:kind})}
 function crystalBurst(e){if(!active)return;duck();sample('crystal_box',{volume:.62,priority:5,pan:pan(e)});contact(e,'crystal-burst','crystal_box')}
 function playerStart(kind){mainAction={kind,swing:false};if(kind==='guard'||kind==='dodge')sample(kind,{volume:.24,priority:1});log('player-start',{kind})}
 function playerTick(kind,time,impact){if(!mainAction||mainAction.kind!==kind||mainAction.swing||time<Math.max(0,impact-.2))return;mainAction.swing=true;if(['hammer','earth'].includes(kind))sample('mechanism_windup',{volume:.3,group:'player',priority:1})}
 function playerHit(kind,e,hit=true){if(!active||!hit)return;const p=profile(e);duck();sample(kind==='water'?'counter_water':kind==='earth'?'armor_break':'mechanism_attack_0',{volume:.5,priority:4,pan:pan(e)});sample(p.family+'_hit',{volume:.27,priority:2,pan:pan(e)});contact(e,'player-'+kind,kind);}
 function playerEnd(){mainAction=null}function playerCancel(){mainAction=null;stopGroup('player')}
 function silence(){charges.clear();inFlight.clear();for(const t of tailTimers)clearTimeout(t);tailTimers.clear();for(const key of [...voices.keys()])stop(key);duckUntil=0;voiceUntil=0;mainAction=null;refreshDuck()}
 function updatePressure(enemies){lastEnemies=enemies;pressure=clamp(enemies.filter(e=>e.hp>0).length/6)}
 function prepare(enemies,soundEnabled=true){epoch++;active=true;sound=!!soundEnabled;prefs();init();silence();window.GameAudio?.trim();updatePressure(enemies);log('battle-start',{kinds:enemies.map(e=>profile(e).kind)});return preload()}
 function reinforce(enemies){updatePressure(enemies);return preload()}
 function finish(){epoch++;active=false;silence();lastEnemies=[];unload();window.GameAudio?.trim();log('battle-stop')}
 function world(){if(active)lastEnemies.forEach(e=>{if(e.hp>0&&(e.charge||e.primed&&!e.disrupted))charge(e);else if(!inFlight.has(keyOf(e))||e.hp<=0||e.disrupted)cancelCharge(keyOf(e))})}
 function unlock(e){if(!e.isTrusted||document.hidden||window.GameAudio?.blocked)return;prefs();init();unlocked=true;ctx.resume().catch(()=>{});if(active)preload()}
 function routeMedia(el,channel='music'){init();if(media.has(el))return media.get(el);const source=ctx.createMediaElementSource(el),gain=ctx.createGain();source.connect(gain);gain.connect(channel==='ambience'?bedBus:musicBus);const route={gain:level=>{gain.gain.value=clamp(level)}};media.set(el,route);return route}
 for(const type of ['pointerup','touchend','click','keydown'])document.addEventListener(type,unlock,{capture:true,passive:true});
 for(const type of ['input','change'])document.addEventListener(type,()=>queueMicrotask(()=>{prefs();if(!settings.enabled||!clamp(settings.level))silence()}),{capture:true});
 window.addEventListener('chaptervoice:progress',e=>{if(!e.detail?.paused){voiceUntil=performance.now()+250;refreshDuck()}});
 window.addEventListener('gameaudio:suspend',()=>{silence();unload();log('suspend')});window.addEventListener('gameaudio:resume',()=>{unlocked=true;if(active)preload()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){silence();unload()}else if(active)preload()});window.addEventListener('pagehide',finish);
 prefs();return {profiles,profile,prepare,reinforce,finish,world,monster,enemyImpact,groupImpact,syncIntent,crystalBurst,armorBreak,counter,charge,cancelCharge,playerStart,playerTick,playerHit,playerEnd,playerCancel,preload,updatePressure,routeMedia,
  setSound(on){const next=!!on;if(next===sound)return;sound=next;if(!sound)silence()},handlesPlayer:kind=>['hammer','earth','water','guard','dodge'].includes(kind),musicInput(){init();return musicBus},ambienceInput(){init();return bedBus},ownsBed:()=>false,
  get diagnostics(){return {revision:'action-foley-r17',active,epoch,unlocked,enabled:settings.enabled,voices:voices.size,maxVoices,voiceLimit:limit,chargeCount:charges.size,pressure,context:ctx?.state||'idle',banks:Object.fromEntries([...banks].map(([f,r])=>[f,r.howl.state()])),misses,failed:[...failed],pcmBytes:[...banks.keys()].reduce((n,f)=>n+Math.ceil(data.banks[f].decodedBytes*(ctx?.sampleRate||32000)/32000),0),pcmLimit:budget,musicDuck:musicBus?.gain.value??1,ambienceDuck:bedBus?.gain.value??1,events:trace.slice()}},
  measure(){if(!meter)return null;const a=new Float32Array(meter.fftSize);meter.getFloatTimeDomainData(a);return {peak:Math.max(...a.map(Math.abs)),rms:Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length)}}
 };
})();
