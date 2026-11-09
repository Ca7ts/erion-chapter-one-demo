'use strict';
// Residents reuse the approved Erion skeleton animation, rendered with work boots.
// No procedural replacement legs, and no changes to Erion's own renderer or assets.
window.NPCErionWalk=(()=>{
 const base='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/npc-erion-gait-20261026/',TAU=Math.PI*2,frames=Array.from({length:8},()=>[]),idle=[];
 const originalDraw=GroundedWalk.draw,originalVillagers=GroundedWalk.villagers;
 const LEG_SCALE=1.32,DEPTH=.35/Math.hypot(3,.35),PIXELS_PER_UNIT=384/1.2;
 let manifest=null,ready=false,error=null;const shoulderCaps=new WeakMap();
 const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
 function initialHeading(p,dx=1,dy=0){
  const next=p?.route?.[p.next??p.index??1];
  if(next&&Number.isFinite(p.x)&&Number.isFinite(p.y)){
   const rx=next[0]-p.x,ry=next[1]-p.y;
   if(Math.hypot(rx,ry)>.01)return Math.atan2(-rx,ry/DEPTH);
  }
  return Math.atan2(-(p?.dx??dx),(p?.dy??dy)/DEPTH);
 }
 // Torso art is three-quarter view. In a pure side idle the original 3D feet
 // coincide exactly, so use the neighbouring three-quarter stance at rest.
 const idleDirection=(d,back)=>d===6?(back?5:7):d===2?(back?3:1):d;
 const direction=(dx,dy)=>(Math.round(Math.atan2(-dx,dy/DEPTH)/(Math.PI/4))+8)%8;
 const projected=(dx,dy)=>{const m=Math.hypot(dx,dy)||1;return 1/Math.hypot(dx/m,dy/m/DEPTH);};
 const bodyHeights=[504,492,506,480,468,483];
 const cycle=(dx,dy,kind=0)=>{const d=direction(dx,dy),a=d*Math.PI/4,stride=d===0||d===4?.48:.24,back=Math.cos(a)<-.15;return stride*PIXELS_PER_UNIT*LEG_SCALE/bodyHeights[kind%3+(back?3:0)]/.62*Math.hypot(Math.sin(a),Math.cos(a)*DEPTH);};
 const image=src=>new Promise((resolve,reject)=>{const im=new ChapterImage;im.onload=()=>resolve(im);im.onerror=()=>reject(new Error(src));im.src=src;});
 const jobs=[fetch(base+'manifest.json').then(r=>{if(!r.ok)throw Error('NPC gait manifest');return r.json();}).then(v=>{
  manifest=v;for(const m of Object.values(v.directions))m.meanHip=m.walk.reduce((n,p)=>n+p.Hips[1]-m.idle.Hips[1],0)/24;
 })];
 for(let d=0;d<8;d++){
  jobs.push(image(base+`idle-${d}.webp`).then(im=>idle[d]=im));
  for(let f=0;f<24;f++)jobs.push(image(base+`d${d}-${String(f).padStart(2,'0')}.webp`).then(im=>frames[d][f]=im));
 }
 const loaded=Promise.all(jobs).then(()=>{ready=true;return true;}).catch(e=>{error=e.message;console.error('NPC approved gait could not load:',e);return false;});
 function refineFreeArm(r){
  if(r.kind===1||r.kind===4)return;
  // Trace the actual skin boundary: the old broad arm cutout contained a ribbon
  // of red tunic that became visible when the free arm swung further out.
  const back=r.kind>=3;
  const skin=r.kind%3===0?[back?[[358,145],[397,145],[430,280],[395,280],[393,274],[396,259],[396,242],[387,229],[378,212],[370,199],[366,181],[360,164]]:
   [[376,146],[394,146],[418,298],[389,298],[384,292],[382,283],[385,268],[385,251],[381,238],[377,222],[369,202],[373,185],[375,167]]]:back?[
   [[138,165],[160,174],[160,195],[164,211],[162,238],[159,255],[158,272],[153,278],[148,273],[145,258],[148,240],[140,220],[137,196]],
   [[251,169],[286,150],[290,183],[298,204],[304,240],[312,273],[309,281],[298,286],[281,281],[277,272],[281,262],[279,245],[270,230],[260,214],[255,190]]
  ]:[
   [[137,159],[170,174],[166,184],[160,196],[160,226],[158,258],[171,282],[176,300],[171,307],[153,307],[143,293],[139,262],[132,224],[132,201],[135,182]],
   [[266,175],[280,168],[284,189],[290,208],[294,240],[302,267],[305,281],[299,293],[286,299],[280,295],[280,285],[282,276],[278,264],[273,244],[265,222],[261,204]]
  ];
  if(r.kind%3===0)r.arms[0].e=back?[383,190]:[381,199];
  const make=()=>{const c=document.createElement('canvas');c.width=c.height=512;return c;};
  const body=r.body.getContext('2d');body.clearRect(0,0,512,512);body.drawImage(r.base,0,0,512,r.hem,0,0,512,r.hem);
  r.arms.forEach((a,index)=>{const points=skin[index];
  const mask=make(),q=mask.getContext('2d');q.beginPath();points.forEach((p,i)=>i?q.lineTo(...p):q.moveTo(...p));q.closePath();q.fill();
  const cut=make(),z=cut.getContext('2d');z.drawImage(mask,0,0);z.globalCompositeOperation='source-in';z.drawImage(r.base,0,0);
  body.save();body.globalCompositeOperation='destination-out';body.drawImage(mask,0,0);body.restore();
  a.upper=make();a.lower=make();a.upper.getContext('2d').drawImage(cut,0,0,512,a.e[1]+8,0,0,512,a.e[1]+8);
  a.lower.getContext('2d').drawImage(cut,0,a.e[1]-8,512,512-a.e[1]+8,0,a.e[1]-8,512,512-a.e[1]+8);
  });
 }
 GroundedWalk.villagers=function(im){const rigs=originalVillagers(im);for(const r of rigs){r.family=rigs;refineFreeArm(r);}return rigs;};
 GroundedWalk.projectedSpeed=(dx,dy)=>ready?projected(dx,dy):0;
 GroundedWalk.advance=function(p,height,dt){
  const s=p.erionGait||(p.erionGait={phase:0,last:p.distance||0,heading:initialHeading(p),rest:1,wasMoving:false});
  const travel=Math.max(0,(p.distance||0)-s.last);s.last=p.distance||0;
  const active=ready&&p.moving&&travel>.00001;
  if(active){
   const target=Math.atan2(-p.dx,(p.dy||0)/DEPTH),delta=wrap(target-s.heading),turn=dt*7;
   s.heading=wrap(s.heading+Math.max(-turn,Math.min(turn,delta)));
   // Match cadence to this resident's fixed sprite scale and projected stance distance.
   if(travel<height*.5)s.phase=(s.phase+travel/(height*cycle(p.dx,p.dy||0,p.kind||0))*(p.gaitRate??1))%1;
   s.rest=Math.max(0,s.rest-dt/.12);
  }else{
   if(s.wasMoving)s.stopPhase=s.phase;
   s.rest=Math.min(1,s.rest+dt/.18);
   const start=s.stopPhase??s.phase,end=Math.ceil(start*2)/2;
   s.phase=(start+(end-start)*s.rest)%1;
  }
  s.wasMoving=active;
 };
 function pose(actor,dx,dy,moving,distance,height){
  if(actor?.erionGait)return actor.erionGait;
  return {phase:actor?.gait?.phase??distance/(height*cycle(dx,dy)),rest:moving?0:1,heading:initialHeading(actor,dx,dy)};
 }
 function upperBodyPose(r,s,height){
  const d=(Math.round(s.heading/(Math.PI/4))+8)%8,m=manifest.directions[d];
  const phase=((s.phase%1)+1)%1,frame=phase*24,f=Math.floor(frame),mix=frame-f,amount=1-s.rest;
  const rawHip=m.walk[f].Hips[1]*(1-mix)+m.walk[(f+1)%24].Hips[1]*mix-m.idle.Hips[1];
  const scale=height/(r.bottom-r.top),ls=scale*LEG_SCALE,t=phase*TAU,kind=r.kind%3;
  // Halve the oscillation around the same walking posture, not the resident's height.
  // Grounded foot frames remain untouched; only the torso's vertical travel is reduced.
  const bob=(m.meanHip+(rawHip-m.meanHip)*.5)*ls*amount;
  const roll=Math.sin(t+.18)*[.018,.011,.022][kind]*amount;
  // Project a forward/back arm arc into the scene, instead of rotating it in
  // the image plane. Front/rear views foreshorten; side views show the full arc.
  // Local X is already mirrored later by the resident's facing transform.
  const forward=[Math.abs(Math.sin(s.heading)),Math.cos(s.heading)*DEPTH];
  const segment=(from,to,start,angle)=>{
   const vx=to[0]-from[0],vy=to[1]-from[1],length=Math.hypot(vx,vy);
   return [start[0]+vx+forward[0]*length*Math.sin(angle),
    start[1]+vy*Math.cos(angle)+forward[1]*length*Math.sin(angle)];
  };
  const arms=r.arms.map(a=>{
   const p=t+(a.side<0?Math.PI:0);
   const shoulder=(Math.sin(p)*.32+Math.sin(2*p)*.018)*amount,
    elbow=(.045+Math.sin(p-.55)*.075)*amount;
   const e=segment(a.s,a.e,a.s,shoulder),w=segment(a.e,a.w,e,shoulder+elbow);
   const near=Math.cos(s.heading)*Math.sin(shoulder)+Math.abs(Math.sin(s.heading))*a.side*.25;
   return {shoulder,elbow,e,w,front:near>=0};
  });
  return {bob,rawBob:rawHip*ls*amount,meanBob:m.meanHip*ls*amount,roll,arms,pivot:[r.center,r.hem-18]};
 }
 function shoulderCap(r,a){
  if(shoulderCaps.has(a))return shoulderCaps.get(a);
  const c=document.createElement('canvas');c.width=c.height=64;const q=c.getContext('2d');
  // Retain the original small sleeve/shoulder overlap at the joint. Feather only the
  // overlap boundary, so the turning upper arm cannot open a triangular cut seam.
  const fade=q.createRadialGradient(32,26,10,32,26,23);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#fff0');
  q.fillStyle=fade;q.fillRect(0,0,64,64);q.globalCompositeOperation='source-in';q.drawImage(r.base,32-a.s[0],32-a.s[1]);
  shoulderCaps.set(a,c);return c;
 }
 function drawSegment(g,image,from,to,start,end){
  const vx=to[0]-from[0],vy=to[1]-from[1],tx=end[0]-start[0],ty=end[1]-start[1];
  g.save();g.translate(...start);g.rotate(Math.atan2(ty,tx));
  g.scale(Math.hypot(tx,ty)/Math.hypot(vx,vy),1);g.rotate(-Math.atan2(vy,vx));
  g.drawImage(image,-from[0],-from[1]);g.restore();
 }
 GroundedWalk.draw=function(g,r,x,y,height,distance,moving,dx,dy,actor){
  if(!r?.resident)return originalDraw.apply(this,arguments);
  if(!ready)return originalDraw.call(this,g,r,x,y,height,distance,false,dx,dy);
  const s=pose(actor,dx,dy,moving,distance,height),d=(Math.round(s.heading/(Math.PI/4))+8)%8;
  const back=Math.cos(s.heading)<-.15,flip=Math.sin(s.heading)>.05;
  if(r.family)r=r.family[r.kind%3+(back?3:0)];
  const f=Math.floor(((s.phase%1)+1)%1*24)%24,m=manifest.directions[d],scale=height/(r.bottom-r.top),ls=scale*LEG_SCALE;
  const upper=upperBodyPose(r,s,height),hipY=upper.bob;
  g.save();if(!actor?.suppressGroundShadow){g.fillStyle='#1c201b45';g.beginPath();g.ellipse(x,y-1,height*.16,height*.042,0,0,TAU);g.fill();}
  const paint=(im,alpha,metadata=m)=>{if(alpha<=0)return;g.save();g.globalAlpha*=alpha;g.drawImage(im,x-metadata.ground[0]*ls,y-metadata.ground[1]*ls,256*ls,384*ls);g.restore();};
  // Long skirts cover the whole thigh volume, including its moving side silhouette.
  // Do not let the borrowed thigh emerge through the side of the dress.
  g.save();g.beginPath();g.rect(x-height,y+hipY+(r.hem-r.bottom-3)*scale,height*2,height);g.clip();
  const idleD=idleDirection(d,back);
  paint(frames[d][f],1-s.rest);paint(idle[idleD],s.rest,manifest.directions[idleD]);g.restore();
  g.translate(x,y+hipY);g.scale(flip?-scale:scale,scale);g.translate(-r.center,-r.bottom);
  // Rigid, small weight-transfer rotation: never squeeze or shear the painted torso.
  // The sack/basket and ALL holding fingers belong to this same transform.
  g.translate(...upper.pivot);g.rotate(upper.roll);g.translate(-upper.pivot[0],-upper.pivot[1]);
  const drawArm=i=>{const a=r.arms[i],motion=upper.arms[i];
   drawSegment(g,a.upper,a.s,a.e,a.s,motion.e);
   drawSegment(g,a.lower,a.e,a.w,motion.e,motion.w);
  };
  // Empty hands pass in front of/behind the torso; bags and holding hands stay
  // rigidly together in r.body. No lateral shoulder spreading is introduced.
  upper.arms.forEach((a,i)=>{if(!a.front)drawArm(i);});
  g.drawImage(r.body,0,0);
  upper.arms.forEach((a,i)=>{if(a.front)drawArm(i);});
  for(const a of r.arms)g.drawImage(shoulderCap(r,a),a.s[0]-32,a.s[1]-32);
  g.restore();return true;
 };
 return {loaded,get ready(){return ready;},get error(){return error;},get manifest(){return manifest;},cycle,projected,direction,initialHeading,idleDirection,upperBodyPose,legScale:LEG_SCALE};
})();
