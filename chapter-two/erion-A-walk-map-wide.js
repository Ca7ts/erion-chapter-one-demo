(()=>{
 const old=GroundedWalk.drawHero,frames=Array.from({length:8},()=>[]),idle=[];
 const cycle=.24/.62/.998,cadence=2.5875;
 const st={ready:false,useA:true,heading:0,phase:0,distance:null,last:performance.now(),wasMoving:false,rest:1};
 window.A2D_WALK_SPEED=cycle*cadence;
 window.A2D_resetWalk=()=>{st.distance=null;st.phase=0;st.rest=1;st.wasMoving=false;st.stopPhase=0;st.last=performance.now();};
 if(window.REGION_ADVENTURE&&location.pathname.includes('erion-A-')) REGION_ADVENTURE.key='erion-A-2d-appearance-preview-20261024';
 const panel=document.createElement('div');panel.style.cssText='position:fixed;bottom:12px;left:12px;z-index:100;background:#142127ed;color:white;border:1px solid #bba065;padding:10px 14px;max-width:330px;font:14px/1.5 system-ui';
 panel.innerHTML='<strong>A 版加大步幅 · 八方向步行</strong><div id="a-walk-load">載入步行素材…</div><button>切換原本 2D 角色</button>';
 panel.querySelector('button').onclick=e=>{st.useA=!st.useA;st.distance=null;window.A2D_WALK_SPEED=st.useA?cycle*cadence:1.08;e.target.textContent=st.useA?'切換原本 2D 角色':'切換 A 版步行';};
 const idleBounds=[{"top":33,"bottom":354,"width":256,"height":384},{"top":34,"bottom":356,"width":256,"height":384},{"top":34,"bottom":356,"width":256,"height":384},{"top":33,"bottom":354,"width":256,"height":384},{"top":33,"bottom":352,"width":256,"height":384},{"top":33,"bottom":353,"width":256,"height":384},{"top":33,"bottom":356,"width":256,"height":384},{"top":34,"bottom":356,"width":256,"height":384}];
 const load=src=>new Promise((resolve,reject)=>{const im=new ChapterImage;im.onload=()=>{const match=/idle-(\d)\.lossless\.webp$/.exec(src),bounds=match?idleBounds[Number(match[1])]:null;if(bounds&&(bounds.width!==im.width||bounds.height!==im.height)){reject(Error('Idle sprite dimensions changed'));return;}resolve({im,top:bounds?.top??0,bottom:bounds?.bottom??im.height-1});};im.onerror=reject;im.src=src;});
 const jobs=[];for(let d=0;d<8;d++){jobs.push(()=>load('../media/a544ae8dba21/walk-map-wide/idle-'+d+'.lossless.webp').then(v=>idle[d]=v));for(let f=0;f<24;f++)jobs.push(()=>load('../media/a544ae8dba21/'+(d===0||d===4?'walk-map-frontback-smooth':'walk-map-wide')+'/d'+d+'-'+String(f).padStart(2,'0')+'.lossless.webp').then(v=>frames[d][f]=v));}
 let cursor=0;async function worker(){while(cursor<jobs.length)await jobs[cursor++]();}
 window.ChapterHeroReady=Promise.all([worker(),worker(),worker(),worker()]).then(()=>{st.ready=true;document.documentElement.dataset.heroSource='chapter-one-approved';});
 ChapterHeroReady.catch(()=>{document.documentElement.dataset.heroSource='load-error';});
  const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
 GroundedWalk.drawHero=function(g,im,x,y,h,distance,moving,dx,dy){
  const now=performance.now(),dt=Math.min(.05,(now-st.last)/1000);st.last=now;
  if(!st.useA||!st.ready)return old(g,im,x,y,h,distance,moving,dx,dy);
  if(st.distance!==null&&distance<st.distance)window.A2D_resetWalk();
  const moved=st.distance===null?0:Math.max(0,distance-st.distance);st.distance=distance;
  if(moving&&Math.hypot(dx,dy)>.01){
   const target=Math.atan2(-dx,dy),delta=wrap(target-st.heading),max=dt*7;
   if(Math.abs(delta)>.08)st.heading=wrap(st.heading+Math.max(-max,Math.min(max,delta)));
   if(moved<h*.5)st.phase=(st.phase+moved/(h*cycle))%1;
   st.rest=Math.max(0,st.rest-dt/0.12);
  }else{
   if(st.wasMoving)st.stopPhase=st.phase;
   st.rest=Math.min(1,st.rest+dt/.18);
   const start=st.stopPhase??st.phase,end=Math.ceil(start*2)/2;
   st.phase=(start+(end-start)*st.rest)%1;
  }
  window.ChapterOneAudio?.step(st.phase,!!moving&&moved>.01&&moved<h*.5);
  st.wasMoving=moving;
  const d=(Math.round(st.heading/(Math.PI/4))+8)%8,f=Math.floor(st.phase*24)%24;
  // Same scale for every frame. No frame-by-frame limb or body resizing.
  const scale=h/(idle[0].bottom-idle[0].top+1);
  g.save();g.fillStyle='#17201d66';g.beginPath();g.ellipse(x,y,h*.17,h*.045,0,0,Math.PI*2);g.fill();
  function paint(v,alpha){if(alpha<=0)return;g.globalAlpha=alpha;g.drawImage(v.im,x-v.im.width*scale/2,y-idle[d].bottom*scale,v.im.width*scale,v.im.height*scale);}
  paint(frames[d][f],1-st.rest);paint(idle[d],st.rest);g.restore();return true;
 };
})();
