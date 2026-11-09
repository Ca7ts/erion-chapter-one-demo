/* Approved Foley only. Action progress is not narration; voiced captions use SeaVoice timings. */
(()=>{'use strict';
const clamp=n=>Math.max(0,Math.min(1,n));
const assets={
 'core-metal':'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/sea-core-20261027/metal-contact.wav',
 'core-carve':'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/sea-core-20261027/chisel-contact.wav'
};
Object.assign(window.SEA_CHAPTER?.sounds||{},assets);
const actions={
 crystal:[[.12,'core-metal',.88,.38],[.70,'core-metal',.48,.24]],
 groove:[[.12,'core-carve',.88,.33],[.43,'core-carve',.92,.33],[.75,'core-carve',.98,.33]],
 wedge:[[.12,'core-metal',.88,.38],[.43,'core-metal',.92,.38],[.75,'core-metal',.98,.38]],
 link:[[.04,'flow',.58,2.2]],
 imprint:[[.04,'splash',.40,.55],[.35,'cloth',.82,1.05]],
 inspect:[],
 'inspect-marks':[[.20,'core-carve',.40,.33]],
 'inspect-seam':[[.25,'core-metal',.45,.38]]
};
// Seconds on the 2.5-second silent shot. Preparation shots deliberately have no result cues.
const shots={
 'R2-13:2':[[.35,'cloth',.42,1.1]],
 'R2-13:3':[[.15,'flow',.43,2.15]],
 'R2-13:4':[[.20,'rumble',.68,2.2]],
 'R2-14:4':[[.65,'core-carve',.45,.33]],
 'R2-14:12':[],
 'R2-14:13':[[.15,'rumble',.58,1.4],[.65,'wood',.83,1.6]],
 'R2-14:16':[],
 'R2-14:17':[[.15,'core-metal',.80,.38],[.50,'fall',.90,1.9]],
 'R2-14:18':[],
 'R2-14:23':[[.12,'flow',.68,2.25]],
 'R2-14:25':[[.12,'flow',.65,2.25],[1.20,'splash',.45,.8]],
 'R2-14:26':[[.50,'cloth',.50,1.4]],
 'R2-14:28':[[.15,'splash',.40,.55],[.85,'cloth',.80,1.4]],
 'R2-14:30':[[.18,'core-metal',.58,.38],[.55,'pack',.72,1.6]]
};
const cache=new WeakMap();
function paint(el,text,progress=0){
 if(!el)return;let record=cache.get(el);
 if(!record||record.text!==text||el.textContent!==text){
  const chars=Array.from(text),nodes=chars.map(ch=>{const node=document.createElement('span');node.className='core-gold-glyph';node.textContent=ch;node.dataset.glyph=ch;return node;});
  el.replaceChildren(...nodes);record={text,nodes,fills:[]};cache.set(el,record);
 }
 const n=record.nodes.length,position=clamp(progress)*n;
 record.nodes.forEach((node,i)=>{const fill=Math.round(clamp(position-i)*100);if(record.fills[i]!==fill){node.style.setProperty('--gold-fill',fill+'%');record.fills[i]=fill;}});
}
function sequence(type,site,duration){const key=type==='inspect'?'inspect-'+site.id:type;return(actions[key]||actions[type]||[]).map(([at,key,volume,limit])=>({at:at*duration,key,volume,limit,fired:false}));}
function tick(action,elapsed,play){for(const cue of action.cues||[])if(!cue.fired&&elapsed>=cue.at){cue.fired=true;const a=play(cue.key,cue.volume,cue.limit);if(a)(action.sounds||(action.sounds=[])).push(a);}}
function stop(action){for(const a of action?.sounds||[]){a.coreCancelled=true;a.pause();}}
function resolveShot(key){return Object.hasOwn(shots,key)?shots[key].map(([at,key,volume,limit])=>({at,key,volume,limit,fired:false})):null;}
window.SeaCoreMedia={assets,actions,shots,paint,sequence,tick,stop,resolveShot};
})();
