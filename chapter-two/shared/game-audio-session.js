/* Short effects use bounded decoded buffers; long music streams through a gain node. */
window.GameAudio = (() => {
 'use strict';
 let ctx, blocked=false, dialog, cacheBytes=0, effectsBus;
 let effectsPrefs={volume:1,muted:false};
 try{Object.assign(effectsPrefs,JSON.parse(localStorage.getItem('erion-effects-output-v1')||'{}'));}catch(_){}
 effectsPrefs.volume=Math.max(0,Math.min(1,Number(effectsPrefs.volume)||0));
 function effectsInput(){const c=context();if(!effectsBus){effectsBus=c.createGain();effectsBus.gain.value=effectsPrefs.muted?0:effectsPrefs.volume;effectsBus.connect(c.destination);}return effectsBus;}
 function setEffects(next){effectsPrefs={...effectsPrefs,...next};effectsPrefs.volume=Math.max(0,Math.min(1,Number(effectsPrefs.volume)||0));effectsPrefs.muted=!!effectsPrefs.muted;try{localStorage.setItem('erion-effects-output-v1',JSON.stringify(effectsPrefs));}catch(_){}if(effectsBus)effectsBus.gain.setTargetAtTime(effectsPrefs.muted?0:effectsPrefs.volume,ctx.currentTime,.015);window.dispatchEvent(new CustomEvent('audiooptions:updated'));}
 const cache=new Map(),pending=new Map(),playing=new Set(),contexts=new Set();
 const streams=new Set(),cacheLimit=((navigator.maxTouchPoints||0)>0?16:64)*1024*1024;
 function context(){
  if(!ctx){
   if(!window.Howler)throw Error('Howler.js was not loaded');
   // One context and one visibility lifecycle, including native speech clocks.
   // Our trusted-input resume owns unlocking. Avoid Howler's mobile sample-rate
   // workaround replacing a context already used by narration/media nodes.
   Howler.autoSuspend=false;Howler.autoUnlock=false;Howler.volume(Howler.volume());ctx=Howler.ctx;
   if(!ctx)throw Error('Web Audio unavailable');contexts.add(ctx);
  }
  return ctx;
 }
 async function decode(src){
  if(cache.has(src)){const b=cache.get(src);cache.delete(src);cache.set(src,b);return b;}
  if(pending.has(src))return pending.get(src);
  const task=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
   try{const response=await fetch(src,{signal:controller.signal});if(!response.ok)throw Error('Sound '+response.status);const b=await context().decodeAudioData(await response.arrayBuffer());cache.set(src,b);cacheBytes+=b.length*b.numberOfChannels*4;
    while(cacheBytes>cacheLimit&&cache.size){const [key,old]=cache.entries().next().value;cache.delete(key);cacheBytes-=old.length*old.numberOfChannels*4;}return b;
   }finally{clearTimeout(timer);pending.delete(src);}
  })();pending.set(src,task);return task;
 }
 // Do not decode minutes of stereo music into a permanent AudioBuffer. Keep
 // narration's native media path separate; only music uses this gain-controlled stream.
 class StreamPlayer extends EventTarget {
  constructor(src){super();this.media=new Audio();this.media.preload='metadata';this.media.src=src;this._volume=1;this._version=0;this.isGameStream=true;streams.add(this);
   for(const type of ['playing','ended','error','loadedmetadata','timeupdate'])this.media.addEventListener(type,()=>{if(type==='ended'||type==='error')playing.delete(this);this['on'+type]?.({type,target:this});this.dispatchEvent(new Event(type));});
  }
  get src(){return this.media.src;}set src(v){this.media.src=v;}
  get paused(){return this.media.paused;}get ended(){return this.media.ended;}get error(){return this.media.error;}get duration(){return this.media.duration;}
  get currentTime(){return this.media.currentTime;}set currentTime(v){this.media.currentTime=v;}
  get loop(){return this.media.loop;}set loop(v){this.media.loop=v;}
  get preload(){return this.media.preload;}set preload(v){this.media.preload=v;}
  get playbackRate(){return this.media.playbackRate;}set playbackRate(v){this.media.playbackRate=v;}
  get volume(){return this._volume;}set volume(v){this._volume=Math.max(0,Math.min(1,Number(v)||0));if(this._gain)this._gain.gain.setTargetAtTime(this._volume,context().currentTime,.01);}
  async play(){
   if(blocked||document.hidden||this.disposed)throw new DOMException('Game paused','AbortError');
   const version=++this._version,c=context();
   if(!this._source){this._source=c.createMediaElementSource(this.media);this._gain=c.createGain();this._gain.gain.value=this._volume;this._source.connect(this._gain);this._gain.connect(window.AudioMatrix?.musicInput()||c.destination);}
   playing.add(this);
   try{await Promise.all([c.resume(),this.media.play()]);if(version!==this._version||blocked||document.hidden||this.disposed)throw new DOMException('Music cancelled','AbortError');}
   catch(e){if(version===this._version){this.media.pause();playing.delete(this);}throw e;}
  }
  pause(){this._version++;this.media.pause();playing.delete(this);}
  removeAttribute(name){this.media.removeAttribute(name);}
  load(){this.pause();this.media.load();if(!this.media.getAttribute('src'))this.dispose();}
  dispose(){if(this.disposed)return;this.pause();this.disposed=true;this._source?.disconnect();this._gain?.disconnect();this._source=this._gain=null;this.media.removeAttribute('src');this.media.load();streams.delete(this);}
 }
 class BufferPlayer extends EventTarget {
  constructor(src=''){super();this.src=src;this.paused=true;this.ended=false;this.error=null;this.duration=NaN;this._offset=0;this._rate=1;this._volume=1;this._version=0;this.loop=false;this.isGameBuffer=true;}
  emit(type){this['on'+type]?.({type,target:this});this.dispatchEvent(new Event(type));}
  get currentTime(){if(!this._source)return this._offset;const t=this._offset+(context().currentTime-this._start)*this._rate;return this.loop&&this.duration?t%this.duration:Math.min(this.duration,t);}
  set currentTime(t){const active=!!this._source;this._offset=Math.max(0,Number(t)||0);if(active){this.halt();this.start();}}
  get playbackRate(){return this._rate;} set playbackRate(v){const t=this.currentTime;this._rate=Number(v)||1;if(this._source){this._offset=t;this.halt();this.start();}}
  get volume(){return this._volume;} set volume(v){this._volume=Math.max(0,Math.min(1,Number(v)||0));if(this._gain)this._gain.gain.setTargetAtTime(this._volume,context().currentTime,.01);}
  connect(destination){this._destination=destination;if(this._gain){this._gain.disconnect();this._gain.connect(destination);}}
  halt(){if(this._source){this._source.onended=null;try{this._source.stop();}catch(_){}this._source.disconnect();this._source=null;}clearInterval(this._timer);this._gain?.disconnect();this._gain=null;}
  start(){
   if(blocked||document.hidden||this.paused||!this._buffer)return;
   const c=context(),source=c.createBufferSource(),gain=c.createGain();this._source=source;this._gain=gain;source.buffer=this._buffer;source.loop=this.loop;source.playbackRate.value=this._rate;gain.gain.value=this._volume;source.connect(gain);gain.connect(this._destination||effectsInput());this._start=c.currentTime;
   source.onended=()=>{if(this._source!==source)return;this._offset=this.duration;this.paused=true;this.ended=true;this.halt();playing.delete(this);this.emit('ended');};
   source.start(0,Math.min(this._offset,Math.max(0,this.duration-.001)));this._timer=setInterval(()=>this.emit('timeupdate'),80);this.emit('playing');
  }
  async play(){
   if(blocked||document.hidden)throw new DOMException('Game paused','AbortError');if(!this.paused&&this._source)return;
   const version=++this._version,src=this.src;this.paused=false;this.ended=false;playing.add(this);
   try{const c=context();await c.resume();const b=await decode(src);if(version!==this._version||blocked||document.hidden||this.paused)throw new DOMException('Sound cancelled','AbortError');
    this._buffer=b;this.duration=b.duration;this.emit('loadedmetadata');if(version!==this._version||this.paused)return;this.start();
   }catch(e){if(version===this._version){this.paused=true;playing.delete(this);if(e.name!=='AbortError'){this.error=e;this.emit('error');}}throw e;}
  }
  pause(){this._version++;this._offset=this.currentTime;this.paused=true;this.halt();playing.delete(this);}
  removeAttribute(name){if(name==='src')this.src='';}
  load(){this.pause();this._offset=0;this._buffer=null;this.error=null;this.ended=false;}
 }
 function suspend(){
  if(blocked)return;blocked=true;
  for(const a of [...playing])a.pause();for(const c of contexts)c.suspend().catch(()=>{});
  window.dispatchEvent(new CustomEvent('gameaudio:suspend'));
  document.querySelectorAll('audio,video').forEach(a=>a.pause());
  if(!dialog){dialog=document.createElement('dialog');dialog.id='game-resume-overlay';dialog.setAttribute('aria-labelledby','pause-title');dialog.innerHTML='<section class="obsidian-slab"><div class="pause-copy"><h2 id="pause-title">遊戲已暫停</h2></div><button type="button" autofocus><span class="pause-crystal" aria-hidden="true"></span><span class="continue-label">繼續遊戲</span></button></section>';document.body.append(dialog);dialog.addEventListener('cancel',e=>e.preventDefault());
   dialog.querySelector('button').onclick=()=>{if(document.hidden||!blocked)return;blocked=false;dialog.close();for(const c of contexts)c.resume().catch(()=>{});window.dispatchEvent(new CustomEvent('gameaudio:resume'));};
  }if(!dialog.open)dialog.showModal();
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});
 for(const type of ['pagehide','blur','freeze'])window.addEventListener(type,suspend);
 // A delayed media play promise must not bring speech back after screen lock.
 document.addEventListener('play',e=>{if(blocked||document.hidden)e.target.pause?.();},true);
 function trim(){cache.clear();cacheBytes=0;}
 return {effectsInput,setEffects,get effectsPreferences(){return {...effectsPrefs}},create:src=>new BufferPlayer(src),stream:src=>new StreamPlayer(src),context,registerContext:c=>{contexts.add(c);return c;},trim,peek:src=>cache.get(src)||null,preload:src=>decode(src).catch(()=>null),suspend,get blocked(){return blocked;},get diagnostics(){return {blocked,active:playing.size,streams:streams.size,cacheBytes,cacheLimit,loading:pending.size,contexts:contexts.size,howlerShared:!!ctx&&ctx===window.Howler?.ctx,context:ctx?.state||'idle'};}};
})();
