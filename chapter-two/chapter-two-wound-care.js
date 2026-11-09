/* R2-11A:6 only. Uses the approved HD care shot; no character regeneration. */
(() => {
 'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
 // The treatment is persistent, but the timing and held input never survive a pause.
 function createModel(oil=0,reduced=false){
  const m={elapsed:0,oil:clamp(Number(oil)||0),held:false,needsRelease:false,finished:Number(oil)>=1};
  const phase=()=>reduced?'calm':m.elapsed%7.2<1.4?'recoil':m.elapsed%7.2<2.2?'settling':m.elapsed%7.2<6?'calm':'warning';
  return Object.assign(m,{phase,press(){if(m.finished||m.needsRelease)return false;if(phase()!=='calm'){m.needsRelease=true;return false;}m.held=true;return true;},
   release(){m.held=false;m.needsRelease=false;},
   update(dt){if(m.finished)return;let remain=clamp(dt,0,.1);while(remain>0){const d=Math.min(remain,1/120);remain-=d;m.elapsed+=d;if(phase()!=='calm'&&m.held){m.held=false;m.needsRelease=true;}if(m.held){m.oil=clamp(m.oil+d/6);if(m.oil>=1){m.finished=true;m.held=false;break;}}}}
  });
 }
 window.KrakenCareModel={create:createModel};
 window.createKrakenWoundCare=function(A){
  const audit=new URLSearchParams(location.search).has('audit');
  // Background IAB audit tabs throttle RAF; timing assertions use a local timer only in isolated audits.
  const schedule=fn=>audit?setTimeout(()=>fn(performance.now()),16):requestAnimationFrame(fn);
  const unschedule=id=>audit?clearTimeout(id):cancelAnimationFrame(id);
  const shot='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/cinema-hd-complete-20261026/frame-211.webp';
  const dialog=document.createElement('dialog');dialog.id='kraken-care';dialog.setAttribute('aria-labelledby','care-title');
  dialog.innerHTML=`<div class="care-top"><div><small>潮門 · 協力照護</small><h2 id="care-title">讓牠安心，把油慢慢塗開</h2></div><button id="care-close">暫停，返回潮門</button></div>
   <div class="care-view"><canvas id="care-canvas" width="1536" height="1024" tabindex="0" role="img" aria-label="受傷觸腕的上藥近景。放鬆時按住傷口，或按住 E 讓多莉塗油；繃緊時鬆手。"></canvas><p id="care-load" role="status">正在靠近受傷的觸腕…</p><div id="care-state" role="status" aria-live="polite"></div></div>
   <div class="care-instructions"><p id="care-instruction"></p><div class="care-progress"><span>已塗覆傷口</span><div role="progressbar" aria-label="上藥進度" aria-valuemin="0" aria-valuemax="100"><i></i></div><b id="care-percent">0%</b></div><small>放鬆時按住傷口上藥 · 繃緊時鬆手 · 已塗好的部分會保留<br>鍵盤：聚焦畫面後按住 E；Esc 暫停</small></div>`;
  document.body.append(dialog);
  const el=id=>dialog.querySelector('#'+id),canvas=el('care-canvas'),ctx=canvas.getContext('2d'),bar=dialog.querySelector('[role="progressbar"]'),fill=bar.firstElementChild;
  let cp=null,model=null,im=null,open=false,frame=0,previous=0,renderAt=0,savedOil=0,finishAt=null,pressedId=null,priorFocus=null,loadToken=0,stateText='';
  const image=new ChapterImage();image.src=shot;
  const ready=image.decode().then(()=>{im=image;return image;});ready.catch(()=>{});
  // A single split beneath Dolly's cloth. Input is generous; the visible oil follows skin.
  const points=[[785,508],[837,532],[892,567],[946,607],[1000,650],[1055,693],[1106,731],[1160,770]];
  function save(){if(!cp||!model)return;cp.careOil=model.oil;savedOil=model.oil;A.save();}
  function release(){if(!model)return;model.release();const id=pressedId;pressedId=null;if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);save();}
  function hit(x,y){return points.slice(1).some((b,i)=>{const a=points[i],dx=b[0]-a[0],dy=b[1]-a[1],u=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy));return Math.hypot(x-a[0]-dx*u,y-a[1]-dy*u)<55;});}
  function position(e){const b=canvas.getBoundingClientRect();return [(e.clientX-b.left)*1536/b.width,(e.clientY-b.top)*1024/b.height];}
  function press(){if(!im||!model||!open)return;A.soundStart?.();if(model.press())A.sound('cloth',.25,.8);else if(!model.finished){el('care-instruction').textContent='牠還在收縮。先鬆手，等觸腕放平後再按住傷口。';}}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();canvas.focus();if(!hit(...position(e)))return;pressedId=e.pointerId;canvas.setPointerCapture(e.pointerId);press();});
  canvas.addEventListener('pointermove',e=>{const inside=hit(...position(e));canvas.style.cursor=inside?'pointer':'default';if(pressedId!==null&&!inside)release();});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{if(pressedId!==null)release();});
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();return;}if(e.key.toLowerCase()==='e'&&e.target===canvas){e.preventDefault();e.stopPropagation();if(!e.repeat)press();}});
  dialog.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='e'){e.preventDefault();e.stopPropagation();release();}});
  window.addEventListener('blur',()=>{if(open)release();});
  document.addEventListener('visibilitychange',()=>{previous=0;if(document.hidden&&open)release();});
  function close(complete=false){if(!open)return;release();open=false;loadToken++;unschedule(frame);dialog.close();const old=cp;cp=null;model=null;finishAt=null;if(complete){old.count=1;A.complete('wound');}else{A.toast('多莉暫時收手，已塗好的油會保留。');priorFocus?.focus?.();}}
  el('care-close').onclick=()=>close();dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  // Local skin motion only. Neither face, body proportions nor the shore are displaced.
  function deform(x,y){
   if(!A.motion())return [x,y];const t=model.elapsed,p=model.phase(),cyc=t%7.2;
   const tension=p==='recoil'?Math.sin(Math.PI*cyc/1.4):p==='warning'?smooth((cyc-6)/1.2)*.35:0;
   const along=(y-445)/520,left=550+along*220,right=890+along*660;
   const edge=smooth((x-left)/95)*smooth((right-x)/100)*smooth((y-455)/130)*smooth((1024-y)/90);
   const move=edge*(tension*11+Math.sin(t*1.3)*.8);
   // The original hand and cloth make a small connected wiping motion.
   const cloth=model.held?Math.exp(-(((x-675)/165)**2+((y-460)/80)**2))*Math.sin(t*6)*6:0;
   return [x+move*.55+cloth,y-move+cloth*.45];
  }
  function triangle(a,b,c,da,db,dc){const det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);
   const ax=((db[0]-da[0])*(c[1]-a[1])-(dc[0]-da[0])*(b[1]-a[1]))/det,ay=((db[1]-da[1])*(c[1]-a[1])-(dc[1]-da[1])*(b[1]-a[1]))/det;
   const bx=((b[0]-a[0])*(dc[0]-da[0])-(c[0]-a[0])*(db[0]-da[0]))/det,by=((b[0]-a[0])*(dc[1]-da[1])-(c[0]-a[0])*(db[1]-da[1]))/det;
   ctx.save();ctx.beginPath();const mx=(da[0]+db[0]+dc[0])/3,my=(da[1]+db[1]+dc[1])/3;[da,db,dc].forEach((q,i)=>{const len=Math.hypot(q[0]-mx,q[1]-my)||1,x=q[0]+(q[0]-mx)/len*.55,y=q[1]+(q[1]-my)/len*.55;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.clip();ctx.transform(ax,ay,bx,by,da[0]-ax*a[0]-bx*a[1],da[1]-ay*a[0]-by*a[1]);ctx.drawImage(im,0,0,1536,1024);ctx.restore();
  }
  function paintSkin(){ctx.drawImage(im,0,0,1536,1024);if(!A.motion())return;
   // Only the lower-right arm and Dolly's forearm need mesh cells, never the whole screen.
   for(let y=352;y<1024;y+=56)for(let x=480;x<1536;x+=64){const a=[x,y],b=[Math.min(1536,x+64),y],c=[x,Math.min(1024,y+56)],d=[b[0],c[1]],aa=deform(...a),bb=deform(...b),cc=deform(...c),dd=deform(...d);triangle(a,b,c,aa,bb,cc);triangle(b,d,c,bb,dd,cc);}
  }
  function trace(progress=1){ctx.beginPath();const end=progress*(points.length-1);points.forEach((p,i)=>{if(i>end)return;const q=deform(...p);i?ctx.lineTo(...q):ctx.moveTo(...q);});const i=Math.floor(end);if(i<points.length-1){const a=points[i],b=points[i+1],u=end-i;ctx.lineTo(...deform(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u));}}
  function draw(){if(!im||!model)return;ctx.clearRect(0,0,1536,1024);paintSkin();ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
   // A dry, split crease becomes coated; it does not magically vanish or heal shut.
   trace();ctx.strokeStyle='#281a18b0';ctx.lineWidth=7;ctx.stroke();trace();ctx.strokeStyle='#996955b0';ctx.lineWidth=2;ctx.stroke();
   if(model.oil>0){trace(model.oil);ctx.shadowColor='#efbf64';ctx.shadowBlur=13;ctx.strokeStyle='#d9b15c80';ctx.lineWidth=17;ctx.stroke();ctx.shadowBlur=0;trace(model.oil);ctx.strokeStyle='#ffe4a3aa';ctx.lineWidth=2;ctx.stroke();}
   const phase=model.phase(),at=deform(...points[Math.min(points.length-1,Math.floor(model.oil*(points.length-1)))]);
   if(!model.finished){const good=phase==='calm';ctx.font='bold 38px "Microsoft JhengHei"';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#101418';const words=model.held?'正在輕輕塗開…':good?'按住傷口 · 塗油':'先鬆手 · 等觸腕放平';ctx.strokeText(words,at[0]+12,at[1]-40);ctx.fillStyle=good?'#fff0ba':'#ffccae';ctx.fillText(words,at[0]+12,at[1]-40);ctx.font='34px sans-serif';ctx.strokeText('↓',at[0],at[1]-12);ctx.fillText('↓',at[0],at[1]-12);}
   ctx.restore();
  }
  function status(){const phase=model.phase(),done=model.finished;
   const text=done?'上藥完成 · 觸腕慢慢安定':model.held?'正在上藥 · 保持輕柔':phase==='calm'?'觸腕放鬆 · 現在可以上藥':phase==='warning'?'觸腕開始繃緊 · 鬆手退開':phase==='settling'?'觸腕正在放平 · 再等一下':'觸腕收縮 · 先別碰傷口';
   if(text!==stateText){stateText=text;el('care-state').textContent=text;el('care-state').dataset.phase=done?'done':phase;
    el('care-instruction').textContent=done?'裂開的皮膚已覆上一層油。多莉收回手，讓牠歇一歇。':model.held?'多莉正沿著裂口塗油；觸腕繃緊時請鬆開。':phase==='calm'?'按住畫面中的裂口，讓多莉慢慢把油塗開。':phase==='warning'?'先放開滑鼠或 E，讓牠收回觸腕；等下一次放鬆再繼續。':'看觸腕的起伏，等它放平；已完成的上藥進度不會失去。';}
   const percent=Math.round(model.oil*100);fill.style.width=percent+'%';bar.setAttribute('aria-valuenow',percent);el('care-percent').textContent=percent+'%';
  }
  function tick(now){if(!open)return;frame=schedule(tick);if(document.hidden){previous=0;return;}const dt=previous?Math.min(.05,(now-previous)/1000):0;previous=now;if(!im||!model)return;model.update(dt);if(model.oil-savedOil>=.04)save();status();if(now-renderAt>=1000/30){renderAt=now;const before=performance.now();draw();if(audit)canvas.dataset.renderMs=(performance.now()-before).toFixed(2);}if(model.finished){if(finishAt===null){finishAt=now;save();A.sound('confirm',.45);}else if(now-finishAt>=1800)close(true);}}
  async function start(checkpoint){if(open)return;cp=checkpoint;model=createModel(cp.careOil,!A.motion());savedOil=model.oil;finishAt=null;previous=0;renderAt=0;stateText='';priorFocus=document.activeElement;open=true;A.stopWalk();dialog.showModal();canvas.focus();el('care-load').hidden=!!im;el('care-load').textContent='正在靠近受傷的觸腕…';status();const token=++loadToken;
   try{await ready;}catch{if(token===loadToken){el('care-load').hidden=false;el('care-load').textContent='近景圖片未載入。請返回潮門後重新整理；上藥進度已保留。';}return;}if(!open||token!==loadToken)return;el('care-load').hidden=true;draw();frame=schedule(tick);
  }
  return {start,cancel:()=>close(),get active(){return open;}};
 };
})();
