/* Chapter II voice playback. Only an exact-text, locally reviewed recording can play. */
(()=>{'use strict';
const base='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-voice/owlai-ch2-20261021/';
let rows=new Map(),audio=null,active=null,enabled=false,paused=false,hidden=document.hidden,serial=0,observer=()=>{},state='missing',done=true;
const ready=fetch(base+'manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(m=>{for(const r of m?.rows||[])rows.set(r.event+':'+r.row,r);}).catch(()=>{});
function notify(){observer({state,enabled,done});}
function discard(){serial++;if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}done=true;}
function start(){if(!active||!enabled||paused||hidden||!audio||audio.ended)return;audio.playbackRate=1.75;const token=serial;state='loading';done=false;notify();audio.play().then(()=>{if(token!==serial)return;state='playing';notify();}).catch(()=>{if(token!==serial)return;state='blocked';done=true;notify();});}
function begin(key,text,fn){discard();observer=fn||(()=>{});paused=false;active=rows.get(key);state='missing';
 if(!active||active.text!==text||active.status!=='downloaded'){active=null;notify();return false;}
 if(!['approved','machine_verified','reviewed_with_asr'].includes(active.review)){active=null;state='review';notify();return false;}
 const token=serial;audio=new Audio(base+active.filename);audio.preload='auto';audio.defaultPlaybackRate=1.75;audio.playbackRate=1.75;audio.preservesPitch=true;audio.volume=.95;
 audio.onloadedmetadata=()=>{if(token===serial)notify();};audio.onended=()=>{if(token!==serial)return;done=true;state='ended';notify();};audio.onerror=()=>{if(token!==serial)return;done=true;state='error';notify();};state=enabled?'loading':'muted';done=!enabled;notify();start();return true;
}
function setEnabled(v){enabled=!!v;if(!audio)return;if(!enabled){audio.pause();done=true;state='muted';notify();}else{done=audio.ended;start();}}
function setPaused(v){paused=!!v;if(!audio)return;if(paused)audio.pause();else start();notify();}
function setHidden(v){hidden=!!v;if(!audio)return;if(hidden)audio.pause();else if(!done)start();}
function stop(){discard();active=null;state='missing';notify();}
function progress(){if(!audio||!enabled||!active)return null;const t=audio.currentTime,marks=active.characterTimings;
 if(Array.isArray(marks)&&marks.length){
  if(audio.ended)return {characters:active.text.length,mode:'aligned',time:t};
  let n=0;
  for(const x of marks){
   if(t<x.start)break;
   if(t>=x.end){n=x.endIndex;continue;}
   const start=x.startIndex??Math.max(n,x.endIndex-1);
   return {characters:start,currentEnd:x.endIndex,fraction:Math.max(0,Math.min(1,(t-x.start)/Math.max(.025,x.end-x.start))),mode:'aligned',time:t};
  }
  return {characters:n,mode:'aligned',time:t};
 }
 // No fabricated word timing: unaligned clips retain plain text until alignment is reviewed.
 return {characters:0,mode:'unaligned',time:t};
}
window.SeaVoice={ready,begin,setEnabled,setPaused,setHidden,stop,progress,get blocking(){return !!audio&&enabled&&!done&&state!=='blocked';},get duration(){return audio&&Number.isFinite(audio.duration)?audio.duration/audio.playbackRate:0;},get state(){return state;}};
})();
