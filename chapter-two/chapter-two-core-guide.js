/* Tide-heart interaction: one checkpoint = one visible operation and consequence. */
(()=>{'use strict';
const rows=[
 [0,'觀察十二個晶槽','點池緣任一顆結晶，先辨認九顆新晶與三顆燒黑的舊晶。','十二個晶槽已查明；接著比對人工補刻。'],
 [4,'比對人工補刻','點連向銅楔的紅色逆刻槽，比對鑿刃留下的痕跡。','補刻與搬晶人手中的工具相符；接著查看外環接縫。'],
 [7,'查看外環接縫','點池身的青銅環，辨認外加銅環與原本石紋的交界。','原有海潮紋路仍完整，外加銅環才是干擾來源。'],
 [12,'取出九顆新晶','點正在發亮的結晶；取出後，下一顆會隨機亮起。可從池邊各方向靠近。','九顆新晶已取出，晶槽留下空位；還有三顆燒黑的舊晶。'],
 [15,'取出三顆舊晶','點正在發亮的舊晶，逐顆解除剩餘力量。','十二顆粗晶都已取出，現在才能切斷三條逆刻槽。'],
 [16,'切斷三條逆刻槽','點三條紅槽靠近銅楔的接點；不限順序。斷開的槽會熄滅。','三條槽都已暗下，送進銅環的外來力量已切斷。'],
 [17,'逐一敲鬆三枚銅楔','分別點左、中、右三枚銅楔；全部鬆開後，外環才會脫落。','三枚銅楔全部鬆開，青銅外環脫落；潮心露出原本的脈動。'],
 [23,'以通契回應潮心','走近池邊，點池面上方懸浮的潮心。右手引出通契，讓海神回應。','通契已接通，海神的力量重新流回潮心。'],
 [28,'拓下海潮刻印','點池邊閃爍的藍色海潮刻印；拓下紋路，將潮心留在池內。','海潮刻印已拓下，潮心仍留在原處維持海潮。']
];
const steps=Object.fromEntries(rows.map((r,i)=>['R2-14:'+r[0],{row:r[0],number:i+1,title:r[1],hint:r[2],result:r[3]}]));
const frame=src=>({src,panel:0,cols:1,rows:1});
const preparations={
 17:{text:'三條逆刻槽都已暗下。厄里昂逐一查看左、中、右三枚銅楔，準備將它們敲鬆。',shot:frame('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/cinema-hd-complete-20261026/frame-226.webp')},
 23:{text:'潮心恢復了原本的脈動。厄里昂走近池邊，準備伸出右手，以通契引來海神的力量。',shot:frame('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/cinema-hd-complete-20261026/frame-230.webp')},
 28:{text:'厄里昂取出浸濕的布，準備拓下池邊的海潮刻印，將維持海潮的核心留在原處。',shot:frame('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/cinema-hd-complete-20261026/frame-232.webp')}
};
window.SeaCoreGuide={steps,preparations,resultRows:[17,23,28],get:cp=>steps[cp?.key]||null};
window.SEA_DIRECTOR_ASSETS=[...(window.SEA_DIRECTOR_ASSETS||[]),...Object.values(preparations).map(x=>x.shot.src)];

window.createSeaCoreInteraction=function(A){
 let enabled=false,key=null,target=null,action=null;
 const state=()=>A.state(),cp=()=>state().checkpoint,info=()=>steps[cp()?.key],key2=()=>WorldProps.key2(state().area,state().flags);
 const el=id=>document.getElementById(id),names=['左側','中央','右側'];
 const groups=id=>WorldProps.group(key2(),id),piece=s=>groups(s.id).find(p=>(p.instance||p.asset)===s.propAsset);
 function migrated(){
  const f=state().flags,c=cp();if(c?.key==='R2-14:16')c.game='grooves';
  if(!Array.isArray(f.crystalsRemoved)){const count=(f['cp:R2-14:12']?9:0)+(f['cp:R2-14:15']?3:0)+(['crystal-nine','crystal-last'].includes(c?.game)?c.count||0:0);f.crystalsRemoved=Array.from({length:Math.min(12,count)},(_,i)=>i);}
  if(!Array.isArray(f.oldCrystals)){const remaining=Array.from({length:12},(_,i)=>i).filter(i=>!f.crystalsRemoved.includes(i));f.oldCrystals=remaining.slice(-3);}
  if(!Array.isArray(f.groovesCut))f.groovesCut=Array.from({length:f['cp:R2-14:16']?3:c?.game==='grooves'?c.count||0:0},(_,i)=>i);
  if(!Array.isArray(f.wedgesLoosened))f.wedgesLoosened=f.ringOff?[0,1,2]:[];
 }
 function choose(){const f=state().flags,last=cp()?.game==='crystal-last',remaining=Array.from({length:12},(_,i)=>i).filter(i=>!f.crystalsRemoved.includes(i)&&(last?f.oldCrystals.includes(i):!f.oldCrystals.includes(i)));target=remaining.length?'crystal-'+remaining[Math.floor(Math.random()*remaining.length)]:null;}
 function setup(){if(!info()||state().area!=='core')return false;if(key!==cp().key){window.SeaCoreMedia?.stop(action);key=cp().key;action=null;target=null;}enabled=true;migrated();if(cp().game?.startsWith('crystal')&&!target)choose();A.save();return true;}
 function panel(title,detail,p,gold=0){const e=el('scene-action');e.hidden=!title;e.classList.toggle('core-guided',!!title);if(el('scene-action-title').textContent!==title)el('scene-action-title').textContent=title;if(window.SeaCoreMedia)SeaCoreMedia.paint(el('scene-action-detail'),detail,gold);else el('scene-action-detail').textContent=detail;el('scene-action-fill').style.width=Math.round(p*100)+'%';}
 function finish(id){enabled=false;action=null;target=null;panel('','',0);A.complete(id);}
 function begin(s,type,duration,sound){const p=piece(s);action={s,type,start:A.time(),duration,visual:p?{...p}:null,cues:window.SeaCoreMedia?.sequence(type,s,duration)||[]};A.stopWalk();A.soundStart?.();if(!window.SeaCoreMedia&&sound)A.sound(sound,.8);}
 function handle(s){
  if(!info()||state().area!=='core')return false;if(!enabled||key!==cp().key)setup();if(action)return true;
  const c=cp(),f=state().flags;if(!c.items.includes(s.id)){A.toast(info().hint);return true;}
  if(c.game?.startsWith('crystal')){if(s.propAsset!==target){A.toast('請點目前明顯發亮的那一顆；其餘結晶稍後處理。');return true;}}
  if(c.game==='grooves'){if(s.grooveIndex===undefined){A.toast('點紅槽與銅楔相接的位置。');return true;}if(f.groovesCut.includes(s.grooveIndex)){A.toast('這條已斷流，改點仍亮紅光的接點。');return true;}}
  if(c.game==='wedges'){const n=groups('wedges').findIndex(p=>p.asset===s.propAsset);if(n<0){A.toast('直接點左、中或右側的銅楔。');return true;}if(f.wedgesLoosened.includes(n)){A.toast(names[n]+'銅楔已鬆開，請處理其他銅楔。');return true;}s={...s,wedgeIndex:n};}
  if(A.canReach&&!A.canReach(s))return false;
  if(c.game?.startsWith('crystal'))begin(s,'crystal',.85,'metal');
  else if(c.game==='grooves')begin(s,'groove',1.2,'carve');
  else if(c.game==='wedges')begin(s,'wedge',1.2,'metal');
  else if(c.game==='link')begin(s,'link',2.4,'flow');
  else begin(s,s.id==='imprint'?'imprint':'inspect',1.8,s.id==='imprint'?'cloth':s.id==='marks'?'carve':'metal');
  return true;
 }
 function commit(){const a=action;if(!a)return;action=null;const c=cp(),f=state().flags;if(!c||c.key!==key)return;
  if(a.type==='crystal'){const n=Number(a.s.propAsset.slice(8));if(!f.crystalsRemoved.includes(n)){f.crystalsRemoved.push(n);c.count=(c.count||0)+1;}target=null;A.save();A.fx('red',a.s.x,a.s.y);if(c.count>=(c.game==='crystal-nine'?9:3))finish('crystals');else choose();}
  else if(a.type==='groove'){if(!f.groovesCut.includes(a.s.grooveIndex))f.groovesCut.push(a.s.grooveIndex);c.count=f.groovesCut.length;A.save();A.toast(names[a.s.grooveIndex]+'接點已斷，紅光熄滅。');if(c.count===3)finish('marks');}
  else if(a.type==='wedge'){if(!f.wedgesLoosened.includes(a.s.wedgeIndex))f.wedgesLoosened.push(a.s.wedgeIndex);c.count=f.wedgesLoosened.length;A.save();A.toast(names[a.s.wedgeIndex]+'銅楔已鬆開。');if(c.count===3){f.ringOff=true;finish('wedges');}}
  else {if(a.type==='link')f.linked=true;finish(a.s.id);}
 }
 function contour(ctx,s,color,alpha){WorldProps.highlight(ctx,key2(),s.id,color,alpha,s.propAsset||null);}
 function draw(ctx){
  if(!enabled||!info()||key!==cp().key||state().area!=='core')return;
  const c=cp(),f=state().flags,meta=info(),t=A.time(),count=c.game==='wedges'?f.wedgesLoosened.length:c.game==='grooves'?f.groovesCut.length:c.count||0,goal=c.game==='crystal-nine'?9:['crystal-last','grooves','wedges'].includes(c.game)?3:1;
  let detail=meta.hint,progress=count/goal,gold=0;
  if(c.game?.startsWith('crystal')){
   // The three burnt crystals remain recognizable before the last phase; existing positions never move.
   for(const p of groups('crystals')){const n=Number(p.instance?.slice(8));if(f.oldCrystals.includes(n)&&p.instance!==target){ctx.save();ctx.globalAlpha=.55;ctx.filter='brightness(.5) saturate(.55)';ctx.drawImage(p.crystalVisual||p.im,p.x,p.y,p.w,p.h);ctx.restore();}}
   const p=groups('crystals').find(p=>p.instance===target);if(p){ctx.save();ctx.shadowColor='#ff3856';ctx.shadowBlur=25;ctx.filter='brightness(2.3) saturate(1.5)';ctx.globalAlpha=.85+.15*Math.sin(t*3);ctx.drawImage(p.crystalVisual||p.im,p.x,p.y,p.w,p.h);ctx.restore();contour(ctx,{id:'crystals',propAsset:target},'#ffd4d8',.9);}
  }
  if(c.game==='wedges')for(const n of f.wedgesLoosened){const p=groups('wedges')[n];if(p){ctx.save();ctx.font='bold 15px "Microsoft JhengHei"';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#11201c';ctx.fillStyle='#b8edcd';ctx.strokeText('已鬆開',p.x+p.w/2,p.y-8);ctx.fillText('已鬆開',p.x+p.w/2,p.y-8);ctx.restore();}}
  if(action){const a=action,p=Math.min(1,(t-a.start)/a.duration),s=a.s;gold=p;window.SeaCoreMedia?.tick(a,t-a.start,A.sound);progress=(count+p)/goal;detail={crystal:'結晶正在脫離晶槽…',groove:'正在鑿斷接點；切斷後這條紅光會熄滅。',wedge:names[s.wedgeIndex]+'銅楔正在鬆動…',link:'右手的通契正將力量引回潮心…',imprint:'濕布正在拓下藍色浪紋，潮心留在原處。',inspect:'正在比對裝置上的痕跡…'}[a.type];
   ctx.save();contour(ctx,s,a.type==='link'||a.type==='imprint'?'#a3edff':'#ffe5a0',.6+.4*Math.sin(p*Math.PI));
   if(a.type==='crystal'){const q=a.visual;if(q){ctx.globalAlpha=1-p;ctx.drawImage(q.crystalVisual||q.im,q.x,q.y-45*p,q.w,q.h);}}
   if(a.type==='groove'||a.type==='wedge'){const elapsed=t-a.start,dist=Math.min(...[.20,.58,.96].map(hit=>Math.abs(elapsed-hit))),beat=Math.min(1,dist/.16);ctx.strokeStyle='#c6b899';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(s.x+18,s.y-28-Math.abs(beat)*12);ctx.lineTo(s.x,s.y);ctx.stroke();for(let j=0;j<10;j++)A.mist(ctx,s.x+Math.sin(j*5)*p*25,s.y-Math.abs(Math.cos(j*3))*p*20,2.5,'#cfb07a',(1-p)*.7);}
   if(a.type==='link'){const P=A.player(),g=WorldProps.geometry(key2(),'core');if(g){ctx.strokeStyle='#9ceaff';ctx.lineWidth=2.5;ctx.shadowBlur=14;ctx.shadowColor='#5db7ff';for(let j=0;j<5;j++){const q=(p*1.5+j/5)%1,x=P.x+(g.x-P.x)*q,y=P.y-48+(g.y-P.y+48)*q-Math.sin(q*Math.PI)*25;A.mist(ctx,x,y,6,'#8deaff',.7);}}}
   ctx.restore();if(p>=1){commit();if(!enabled)return;}
  }
  panel('潮心修復 '+meta.number+' / '+rows.length+' · '+meta.title,detail+(goal>1?'　'+count+' / '+goal:''),progress,gold);
 }
 function cancel(){if(!enabled)return false;enabled=false;window.SeaCoreMedia?.stop(action);action=null;panel('','',0);A.toast('已暫停；再點對應物件即可繼續，已完成的部分會保留。');return true;}
 return{setup,handle,draw,cancel,get active(){return enabled&&!!info()&&key===cp()?.key;},get busy(){return !!action;},get status(){return{key,target,action:action?.type||null};}};
};
})();
