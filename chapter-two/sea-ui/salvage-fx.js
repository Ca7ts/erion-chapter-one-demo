(() => {
 'use strict';
 // Presentation only: callers have already saved the actual salvage result.
 let active;
 const masks=[
  ['0 0,57% 0,44% 49%,0 33%',-1,-.66,-19],['57% 0,100% 0,100% 34%,44% 49%',.85,-.94,23],
  ['0 33%,44% 49%,32% 68%,0 80%',-1,.08,-29],['44% 49%,100% 34%,100% 75%,68% 64%',1,.22,24],
  ['0 80%,32% 68%,44% 49%,56% 100%,0 100%',-.68,.9,-18],['44% 49%,68% 64%,100% 75%,100% 100%,56% 100%',.66,.93,27]
 ];
 const el=(tag,cls,txt)=>{const e=document.createElement(tag);e.className=cls;if(txt)e.textContent=txt;return e};
 function play(host,gear,gain){
  active?.();if(!host?.isConnected||!gain||document.hidden)return;
  const name=window.LeonAscent.partName(gain.key);
  const fx=el('div','salvage-flare');fx.setAttribute('aria-hidden','true');
  const stage=el('div','salvage-glyph'),halo=el('div','salvage-orbit'),light=el('div','salvage-seam');
  const copper=el('div','salvage-engraving');
  copper.innerHTML='<svg viewBox="0 0 144 144" fill="none" stroke="currentColor" stroke-width="1"><circle cx="72" cy="72" r="54" stroke-dasharray="58 8 8 10"/><circle cx="72" cy="72" r="59" stroke-dasharray="2 7"/><path d="M72 7l5 8-5 5-5-5zM137 72l-8 5-5-5 5-5zM72 137l-5-8 5-5 5 5zM7 72l8-5 5 5-5 5z"/></svg>';
  const recoil=el('div','salvage-pieces');
  const icon=ItemIcons.node(gear);
  const fissures=el('div','salvage-melt');
  fissures.style.setProperty('--form','url("'+icon.src+'")');
  fissures.innerHTML='<svg viewBox="0 0 100 100" fill="none"><g stroke="#ff4826" stroke-width="3.4"><path d="M17 18L36 35 33 42 51 49 47 54 66 67 63 73 82 86M49 50L58 37 58 29 72 17M47 54L32 60 28 70 12 76"/></g><path stroke="#ffe7a0" stroke-width=".95" d="M17 18L36 35 33 42 51 49 47 54 66 67 63 73 82 86M49 50L58 37 58 29 72 17M47 54L32 60 28 70 12 76"/></svg>';
  for(const [mask,x,y,angle] of masks){
   const piece=el('div','salvage-shard');
   piece.style.clipPath='polygon('+mask+')';piece.style.setProperty('--sx',x*43+'px');piece.style.setProperty('--sy',y*31+'px');piece.style.setProperty('--rot',angle+'deg');
   piece.append(icon.cloneNode());recoil.append(piece);
  }
  for(let i=0;i<12;i++){
   const spark=el('i','salvage-filing'),a=i*Math.PI/6+.17,d=37+8*(i%3);
   spark.style.setProperty('--sx',Math.cos(a)*d+'px');spark.style.setProperty('--sy',Math.sin(a)*d*.71+'px');
   spark.style.setProperty('--rot',a+'rad');spark.style.setProperty('--lag',(i%3)*19+'ms');stage.append(spark);
  }
  const material=ItemIcons.node(gain.key);material.classList.add('salvage-return');
  stage.append(halo,copper,recoil,fissures,light,material);
  const legend=el('div','salvage-legend');legend.append(el('small','','分解回收'),el('strong','',name+' ×'+gain.count));
  fx.append(stage,legend);host.append(fx);
  const panoramic=host.classList.contains('salvage-view');
  if(panoramic)host.dataset.bursting='';
  const stopRift=panoramic?window.LeonRift?.animate(host):null;
  let cue,timer;const owner=host.closest('dialog');
  const dismiss=()=>{if(active===dismiss)active=null;clearTimeout(timer);fx.remove();stopRift?.();if(panoramic)delete host.dataset.bursting;if(cue){cue.pause();cue.removeAttribute('src');cue.load();cue=null;}
   document.removeEventListener('visibilitychange',hidden);owner?.removeEventListener('close',closed);window.removeEventListener('pagehide',dismiss);};
  function closed(){if(!owner.open)dismiss();}
  function hidden(){if(document.hidden)dismiss();}
  active=dismiss;owner?.addEventListener('close',closed);window.addEventListener('pagehide',dismiss);document.addEventListener('visibilitychange',hidden);
  timer=setTimeout(dismiss,panoramic?1400:1200);
  if(window.SeaGame?SeaGame.S.audio:(document.querySelector('[data-world-enabled]')?.checked??true)){
   cue=new Audio(new URL('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/media/forge/audio/salvage.wav',document.baseURI));cue.volume=.48;cue.play().catch(()=>{});
  }
 }
 window.LeonSalvageFX={play,stop:()=>active?.()};
})();
