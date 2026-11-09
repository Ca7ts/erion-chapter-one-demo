(()=>{
 const old=GroundedWalk.drawHero,frames=Array.from({length:8},()=>[]),idle=[];
 const cycle=.24/.62/.998,cadence=2.5875;
 const st={ready:false,useA:true,heading:0,phase:0,distance:null,last:performance.now(),wasMoving:false,rest:1};
 window.A2D_WALK_SPEED=cycle*cadence;
 window.A2D_resetWalk=()=>{st.distance=null;st.phase=0;st.rest=1;st.wasMoving=false;st.stopPhase=0;st.last=performance.now();};
 if(window.REGION_ADVENTURE&&location.pathname.includes('erion-A-')) REGION_ADVENTURE.key='erion-A-2d-appearance-preview-20261024';
 const panel=document.createElement('div');panel.style.cssText='position:fixed;bottom:12px;left:12px;z-index:100;background:#142127ed;color:white;border:1px solid #bba065;padding:10px 14px;max-width:330px;font:14px/1.5 system-ui';
 panel.innerHTML='<strong>A 版加大步幅 · 八方向步行</strong><div id="a-walk-load">載入步行素材…</div><button>切換原本 2D 角色</button>';if(!location.pathname.endsWith('/chapter-two.html'))document.body.append(panel);
 panel.querySelector('button').onclick=e=>{st.useA=!st.useA;st.distance=null;window.A2D_WALK_SPEED=st.useA?cycle*cadence:1.08;e.target.textContent=st.useA?'切換原本 2D 角色':'切換 A 版步行';};
 const load=src=>new Promise((resolve,reject)=>{const im=new ChapterImage;im.onload=()=>{const c=document.createElement('canvas'),factor=matchMedia('(pointer:coarse)').matches?.5:1;c.width=Math.round(im.width*factor);c.height=Math.round(im.height*factor);const g=c.getContext('2d');g.drawImage(im,0,0,c.width,c.height);const d=g.getImageData(0,0,c.width,c.height).data;let top=c.height,bottom=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>50){top=Math.min(top,y);bottom=y;}im.src='';resolve({im:c,top,bottom});};im.onerror=reject;im.src=src;});
 const jobs=[];for(let d=0;d<8;d++){jobs.push(()=>load('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/erion-A-2d/walk-map-wide/idle-'+d+'.webp').then(v=>idle[d]=v));for(let f=0;f<24;f++)jobs.push(()=>load('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/erion-A-2d/'+(d===0||d===4?'walk-map-frontback-smooth':'walk-map-wide')+'/d'+d+'-'+String(f).padStart(2,'0')+'.webp').then(v=>frames[d][f]=v));}
 let cursor=0;async function worker(){while(cursor<jobs.length)await jobs[cursor++]();}Promise.all([worker(),worker()]).then(()=>{st.ready=true;window.SeaWalkFrames={count:200,bytes:[...idle,...frames.flat()].reduce((n,v)=>n+v.im.width*v.im.height*4,0)};}).catch(()=>{st.ready=false;});
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
