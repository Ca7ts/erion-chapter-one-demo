/* R2-11A:8. Earth-rune grip + directional pull; the approved HD painting stays intact. */
(() => {
 'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 function createModel(progress=0,reduced=false){
  const m={elapsed:0,progress:clamp(Number(progress)||0),target:clamp(Number(progress)||0),grip:0,held:false,settling:false,blocked:false,finished:Number(progress)>=1,retreat:0};
  function phase(){const t=m.elapsed%7.4;return reduced?'slack':t<1.8?'surge':t<2.4?'easing':t<6.2?'slack':'warning';}
  function release(followThrough=false){m.settling=followThrough&&m.held&&phase()==='slack'&&m.target>m.progress+.01;m.held=false;m.blocked=false;if(m.settling){m.grip=1;m.target=Math.min(m.target,m.progress+.24);}else{m.grip=0;m.target=m.progress;}}
  return Object.assign(m,{phase,release,
   press(){if(m.finished||m.blocked)return false;if(phase()!=='slack'){m.blocked=true;m.retreat=.65;return false;}m.held=true;m.settling=false;m.grip=0;m.target=m.progress;return true;},
   pull(target){if(m.held)m.target=clamp(target,m.progress,1);},
   update(dt){if(m.finished)return;let remaining=clamp(dt,0,.1);while(remaining>0){const d=Math.min(remaining,1/120);remaining-=d;m.elapsed+=d;m.retreat=Math.max(0,m.retreat-d);
    if(phase()!=='slack'&&(m.held||m.settling)){m.held=false;m.settling=false;m.blocked=true;m.grip=0;m.target=m.progress;m.retreat=.65;}
    if(m.held||m.settling){m.grip=clamp(m.grip+d/.18);if(m.grip>=1)m.progress=Math.min(m.target,m.progress+d*(m.settling?.65:.26));if(m.progress>=1-1e-7){m.progress=1;m.finished=true;m.held=false;m.settling=false;break;}if(m.settling&&m.progress>=m.target){m.settling=false;m.grip=0;}}
   }}
  });
 }
 window.KrakenRockModel={create:createModel};
 window.createKrakenRockRelease=function(A){
  const audit=new URLSearchParams(location.search).has('audit'),schedule=fn=>audit?setTimeout(()=>fn(performance.now()),16):requestAnimationFrame(fn),unschedule=id=>audit?clearTimeout(id):cancelAnimationFrame(id);
  const dialog=document.createElement('dialog');dialog.id='kraken-rock';dialog.setAttribute('aria-labelledby','rock-title');
  dialog.innerHTML=`<div class="rock-top"><div><small>潮門 · 地刻印</small><h2 id="rock-title">順著裂口，鬆開卡住觸腕的礁岩</h2></div><button id="rock-close">暫停，返回潮門</button></div>
   <div class="rock-view"><canvas id="rock-canvas" width="1536" height="1024" tabindex="0" role="img" aria-label="鬆石近景。推力退去時，按住金色裂口的卡石往下拖；推力回來時鬆手。鍵盤可按住向下鍵。"></canvas><p id="rock-load" role="status">正在查看卡石的裂口…</p><div id="rock-state" role="status" aria-live="polite"></div></div>
   <div class="rock-instructions"><p id="rock-instruction"></p><div class="rock-progress"><span>礁岩鬆脫</span><div role="progressbar" aria-label="礁岩鬆脫進度" aria-valuemin="0" aria-valuemax="100"><i></i></div><b id="rock-percent">0%</b></div><small>按住卡石 → 往下拖開 · 推力逼近時鬆手 · 已鬆動的部分保留<br>鍵盤：聚焦畫面後按住 ↓；Esc 暫停</small></div>`;
  document.body.append(dialog);
  const el=id=>dialog.querySelector('#'+id),canvas=el('rock-canvas'),ctx=canvas.getContext('2d'),bar=dialog.querySelector('[role="progressbar"]');
  let model=null,cp=null,open=false,frame=0,last=0,drawAt=0,finishedAt=null,saved=0,previousProgress=0,heldId=null,origin=null,keyboard=false,hover=false,priorFocus=null,loadToken=0,statusText='',audio=null;
  let im=null,pieces=null;
  // Traced edges of the three actual fractured rocks, excluding the hands, leg and tentacle.
  const shapes=[
   [[576,458],[626,442],[656,425],[714,406],[739,420],[760,452],[781,472],[792,503],[770,519],[756,545],[714,558],[691,577],[662,578],[646,557],[601,568],[565,557],[544,533],[551,493]],
   [[768,518],[797,509],[827,527],[847,557],[861,590],[867,615],[845,641],[820,653],[794,639],[776,633],[754,609],[723,600],[718,578],[729,553]],
   [[595,579],[626,572],[657,570],[686,575],[714,602],[720,647],[740,672],[774,683],[800,709],[814,742],[813,780],[795,816],[768,836],[724,842],[686,828],[653,806],[626,780],[596,771],[580,749],[565,719],[558,684],[552,654],[549,625],[565,602]]
  ];
  function path(points){const p=new Path2D();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();return p;}
  const paths=shapes.map(path);
  function prep(){pieces=shapes.map((points,i)=>{const minX=Math.floor(Math.min(...points.map(p=>p[0])))-2,minY=Math.floor(Math.min(...points.map(p=>p[1])))-2,maxX=Math.ceil(Math.max(...points.map(p=>p[0])))+2,maxY=Math.ceil(Math.max(...points.map(p=>p[1])))+2;
   const pic=document.createElement('canvas');pic.width=maxX-minX;pic.height=maxY-minY;const c=pic.getContext('2d');c.translate(-minX,-minY);c.clip(paths[i]);c.drawImage(im,0,0,1536,1024);return {pic,x:minX,y:minY,cx:(minX+maxX)/2,cy:(minY+maxY)/2};});}
  const image=new ChapterImage();image.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/cinema-hd-complete-20261026/frame-212.webp';const ready=image.decode().then(()=>{im=image;prep();});ready.catch(()=>{});
  function transform(i){const p=model?.progress||0;return i===0?{x:-p*9,y:p*4,a:-p*.012}:i===1?{x:p*9,y:p*23,a:p*.04}:{x:p*16,y:p*73,a:-p*.075};}
  function inverse(x,y,i){const tr=transform(i),b=pieces[i],dx=x-tr.x-b.cx,dy=y-tr.y-b.cy,c=Math.cos(tr.a),s=Math.sin(tr.a);return [b.cx+dx*c+dy*s,b.cy-dx*s+dy*c];}
  function hit(x,y){if(!pieces)return false;return paths.some((p,i)=>ctx.isPointInPath(p,...inverse(x,y,i)));}
  function position(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*1536/r.width,(e.clientY-r.top)*1024/r.height];}
  function save(){if(!cp||!model)return;cp.rockRelease=model.progress;saved=model.progress;A.save();}
  function stopAudio(){if(audio){audio.pause();audio=null;}}
  function release(followThrough=false){if(!model)return;model.release(followThrough);keyboard=false;origin=null;const id=heldId;heldId=null;if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);if(!model.settling&&!model.finished)stopAudio();save();}
  function press(){if(!open||!im||!model)return false;A.soundStart?.();return model.press();}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0||heldId!==null)return;e.preventDefault();canvas.focus();const p=position(e);if(!hit(...p))return;heldId=e.pointerId;canvas.setPointerCapture(e.pointerId);origin={x:p[0],y:p[1],progress:model.progress};press();});
  canvas.addEventListener('pointermove',e=>{const p=position(e);hover=hit(...p);canvas.style.cursor=model?.held?'grabbing':hover?'grab':'default';if(heldId===e.pointerId&&origin&&model?.held){
   // Only forward movement within a generous downward lane advances. Sideways/negative drags do not.
   const dy=p[1]-origin.y,dx=Math.abs(p[0]-origin.x);model.pull(origin.progress+(dy>12&&dx<Math.max(85,dy*.8)?(dy-12)/280:0));
  }});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{if(heldId!==null)release(event==='pointerup');});
  canvas.addEventListener('pointerleave',()=>{hover=false;});
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();return;}if(e.key==='ArrowDown'&&e.target===canvas){e.preventDefault();e.stopPropagation();if(!e.repeat&&press()){keyboard=true;model.pull(1);}}});
  dialog.addEventListener('keyup',e=>{if(e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();release();}});
  window.addEventListener('blur',()=>{if(open)release();});document.addEventListener('visibilitychange',()=>{last=0;if(open&&document.hidden)release();});
  function close(complete=false){if(!open)return;release();open=false;loadToken++;unschedule(frame);dialog.close();const checkpoint=cp;cp=null;model=null;finishedAt=null;if(complete){checkpoint.count=1;A.complete('rock');}else{A.toast('已退到安全處，礁岩鬆動的進度保留。');priorFocus?.focus?.();}}
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});el('rock-close').onclick=()=>close();
  const dust=[];
  function emitDust(){for(let i=0;i<3;i++)dust.push({x:660+Math.random()*210,y:640+model.progress*100+Math.random()*70,vx:(Math.random()-.5)*35,vy:-20-Math.random()*30,age:0,size:1+Math.random()*3});}
  function draw(){if(!im||!model)return;ctx.clearRect(0,0,1536,1024);ctx.drawImage(im,0,0,1536,1024);const p=model.progress,t=model.elapsed,phase=model.phase(),active=(model.held||model.settling)&&model.grip>=1,move=A.motion();
   // A dark fracture bed remains beneath each displaced piece, not a duplicate bright rock.
   paths.forEach((shape,i)=>{ctx.save();ctx.clip(shape);ctx.fillStyle=`rgba(24,23,18,${Math.min(.82,p*10)})`;ctx.fillRect(520,395,370,470);ctx.restore();});
   pieces.forEach((piece,i)=>{const tr=transform(i),vibrate=move&&phase==='surge'?Math.sin(t*25+i)*1.5:0;ctx.save();ctx.translate(piece.cx+tr.x+vibrate,piece.cy+tr.y);ctx.rotate(tr.a);ctx.drawImage(piece.pic,piece.x-piece.cx,piece.y-piece.cy);ctx.restore();});
   // Gold follows the painted cracks, showing the earth rune conducting into the anchor.
   if(model.grip>0&&!model.finished){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=`rgba(255,219,132,${model.grip*.75})`;ctx.shadowColor='#ffbc49';ctx.shadowBlur=18;ctx.lineWidth=3;
    const tr=transform(2),piece=pieces[2];ctx.translate(piece.cx+tr.x,piece.cy+tr.y);ctx.rotate(tr.a);ctx.translate(-piece.cx,-piece.cy);ctx.beginPath();[[651,579],[670,603],[683,637],[717,654],[685,674],[701,711],[687,751],[722,795]].forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q));ctx.stroke();ctx.restore();}
   if(move){ctx.save();for(const d of dust){const alpha=Math.max(0,1-d.age/1.2);ctx.globalAlpha=alpha*.65;ctx.fillStyle='#c8b184';ctx.beginPath();ctx.ellipse(d.x,d.y,d.size,d.size*.6,.4,0,7);ctx.fill();}ctx.restore();
    // The force builds along the water beside the actual tentacle. It is not a clickable ring.
    if(phase==='surge'||phase==='warning'){ctx.save();ctx.lineCap='round';ctx.strokeStyle='#a3dce34a';ctx.shadowColor='#9dd5e5';ctx.shadowBlur=11;ctx.lineWidth=5;for(let i=0;i<6;i++){const q=(t*.42+i/6)%1;ctx.beginPath();ctx.moveTo(1380-q*220,690+q*240);ctx.bezierCurveTo(1300-q*170,700+q*230,1230-q*170,730+q*160,1170-q*90,750+q*120);ctx.stroke();}ctx.restore();}}
   const tr=transform(2),x=700+tr.x,y=695+tr.y;
   ctx.save();ctx.textAlign='center';ctx.font='bold 35px "Microsoft JhengHei"';ctx.strokeStyle='#0c161a';ctx.lineWidth=5;
   const caption=model.finished?'礁岩鬆開了':phase==='slack'?(active?'沿裂口慢慢拖開':model.held?'地刻印正在接通…':'按住卡石 · 往下拖'):'推力未退 · 先放手';ctx.strokeText(caption,x,530);ctx.fillStyle=phase==='slack'?'#ffe7ae':'#e0eeef';ctx.fillText(caption,x,530);
   if(phase==='slack'&&!model.finished){const sway=move?Math.sin(t*3)*5:0;ctx.beginPath();ctx.strokeStyle='#ffe2a3c9';ctx.lineWidth=5;ctx.setLineDash([7,11]);ctx.moveTo(x+8,y+12);ctx.lineTo(x+8,y+99+sway);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(x-6,y+84+sway);ctx.lineTo(x+8,y+101+sway);ctx.lineTo(x+22,y+84+sway);ctx.stroke();}
   ctx.restore();
  }
  function status(){const phase=model.phase(),text=model.finished?'卡石已鬆開 · 觸腕可以抽回':phase==='slack'?(model.held?model.grip<1?'雙手按穩 · 地刻印正在接通':'向下拖開 · 礁岩正在鬆動':'推力退去 · 現在可以鬆石'):phase==='warning'?'推力逼近 · 放手退開':phase==='easing'?'水勢開始回落 · 再等一下':'觸腕受力繃緊 · 先別碰礁岩';
   if(text!==statusText){statusText=text;el('rock-state').textContent=text;el('rock-state').dataset.phase=model.finished?'done':phase;el('rock-instruction').textContent=model.finished?'卡住的那一角已移開，讓牠自己收回觸腕。':phase==='slack'?'按住卡石，沿箭頭往下方空地拖；地刻印會隨你的動作鬆開岩縫。':phase==='warning'?'鬆開滑鼠或方向鍵，先退開；已移開的部分不會復原。':'看水勢與碎石的震動，等推力退去再出手。';}
   const value=Math.round(model.progress*100);bar.firstElementChild.style.width=value+'%';bar.setAttribute('aria-valuenow',value);el('rock-percent').textContent=value+'%';
  }
  function tick(now){if(!open)return;frame=schedule(tick);if(document.hidden){last=0;return;}const dt=last?Math.min(.05,(now-last)/1000):0;last=now;if(!im||!model)return;model.update(dt);const advanced=model.progress-previousProgress;previousProgress=model.progress;
   if(advanced>0){if(A.motion()&&dust.length<90)emitDust();if(!audio||audio.paused)audio=A.sound('rubble',.42,1.3);}else if(!model.finished)stopAudio();
   for(const d of dust){d.age+=dt;d.x+=d.vx*dt;d.vy+=170*dt;d.y+=d.vy*dt;}while(dust.length&&dust[0].age>1.2)dust.shift();if(model.progress-saved>=.04)save();status();if(now-drawAt>=1000/30){drawAt=now;const before=performance.now();draw();if(audit)canvas.dataset.renderMs=(performance.now()-before).toFixed(2);}
   if(model.finished){if(finishedAt===null){finishedAt=now;save();stopAudio();audio=A.sound('rubble',.60,1.5);}else if(now-finishedAt>=1800)close(true);}
  }
  async function start(checkpoint){if(open)return;cp=checkpoint;model=createModel(cp.rockRelease,!A.motion());saved=model.progress;previousProgress=model.progress;open=true;last=0;drawAt=0;finishedAt=null;statusText='';priorFocus=document.activeElement;const token=++loadToken;A.stopWalk();dialog.showModal();canvas.focus();el('rock-load').hidden=!!im;el('rock-load').textContent='正在查看卡石的裂口…';status();
   try{await ready;}catch{if(token===loadToken){el('rock-load').hidden=false;el('rock-load').textContent='礁岩近景尚未載入。請返回潮門後重新整理；鬆石進度會保留。';}return;}if(!open||token!==loadToken)return;el('rock-load').hidden=true;draw();frame=schedule(tick);
  }
  return {start,cancel:()=>close(),get active(){return open;}};
 };
})();
