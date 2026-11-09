'use strict';
// Small articulated map sprites: fixed bone lengths and alternating stance/swing.
// All drawing is runtime animation; the original painted assets stay untouched.
window.GroundedWalk=(()=>{
 const PI=Math.PI,TAU=PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const heroCache=new WeakMap(),heroDirections=new WeakMap();
 const sideImage=new ChapterImage();let sideRig=null;
 sideImage.onload=()=>{sideRig=makeSideHero(sideImage);};
 sideImage.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/erion-gait-v4/side-cycle-reference.webp';
 function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 function strip(im,a,b,r){const c=canvas(im.width,im.height),g=c.getContext('2d');g.beginPath();g.lineWidth=r*2;g.lineCap='round';g.strokeStyle='#fff';g.moveTo(...a);g.lineTo(...b);g.stroke();g.globalCompositeOperation='source-in';g.drawImage(im,0,0);return c;}
 function make(im,rect,d){
  const base=canvas(rect[2],rect[3]),g=base.getContext('2d');g.drawImage(im,...rect,0,0,base.width,base.height);
  const body=canvas(base.width,base.height);body.getContext('2d').drawImage(base,0,0,base.width,d.hem,0,0,base.width,d.hem);
  const legs=d.legs.map(l=>{const [hip,knee,ankle,toe]=l;return {hip,knee,ankle,toe,thigh:strip(base,hip,knee,d.wide||23),shin:strip(base,knee,ankle,d.boot?25:20),foot:strip(base,ankle,toe,d.boot?24:21),l1:Math.hypot(knee[0]-hip[0],knee[1]-hip[1]),l2:Math.hypot(ankle[0]-knee[0],ankle[1]-knee[1])};});
  return {...d,base,body,legs};
 }
 function transformed(g,image,from,to,originalAngle,angle){g.save();g.translate(...to);g.rotate(angle-originalAngle);g.drawImage(image,-from[0],-from[1]);g.restore();}
 function leg(g,l,phase,rig,amount,axis){
  const stance=.60,u=((phase%1)+1)%1,v=(u-stance)/(1-stance),smooth=v*v*(3-2*v);
  const step=u<stance?1-2*u/stance:-1+2*smooth;
  const lift=u<stance?0:Math.sin(v*PI)*(rig.lift||12);
  const hip=[l.hip[0],l.hip[1]],span=(rig.span||43)*amount;
  let ankle=[l.ankle[0]+step*span*axis[0],l.ankle[1]+step*span*axis[1]-lift*amount];
  let dx=ankle[0]-hip[0],dy=ankle[1]-hip[1],dist=Math.hypot(dx,dy),reach=l.l1+l.l2-.6;
  if(dist>reach){dx*=reach/dist;dy*=reach/dist;ankle=[hip[0]+dx,hip[1]+dy];dist=reach;}
  const a=(l.l1*l.l1-l.l2*l.l2+dist*dist)/(2*Math.max(1,dist)),h=Math.sqrt(Math.max(0,l.l1*l.l1-a*a));
  // The bend side comes from the painted anatomy, not travel direction or sprite mirroring.
  const bend=Math.sign((l.knee[0]-l.hip[0])*(l.ankle[1]-l.hip[1])-(l.knee[1]-l.hip[1])*(l.ankle[0]-l.hip[0]))||1;
  const knee=[hip[0]+dx/dist*a+dy/dist*h*bend,hip[1]+dy/dist*a-dx/dist*h*bend];
  transformed(g,l.thigh,l.hip,hip,Math.atan2(l.knee[1]-l.hip[1],l.knee[0]-l.hip[0]),Math.atan2(knee[1]-hip[1],knee[0]-hip[0]));
  transformed(g,l.shin,l.knee,knee,Math.atan2(l.ankle[1]-l.knee[1],l.ankle[0]-l.knee[0]),Math.atan2(ankle[1]-knee[1],ankle[0]-knee[0]));
  // Feet stay level during support; only the swing foot lifts slightly.
  transformed(g,l.foot,l.ankle,ankle,0,u<stance?0:-Math.sin(v*PI)*.10*(rig.facing||1)*amount);
 }
 function draw(g,rig,x,y,height,distance,moving,dx,dy){
  if(rig?.resident)return drawResident(g,rig,x,y,height,distance,moving,dx,dy,arguments[9]);
  if(!rig)return false;
  const scale=height/(rig.bottom-rig.top),flip=(rig.facing||1)>0?dx<0:dx>0,mag=Math.hypot(dx,dy)||1;
  const phase=distance/(height*.72),axis=rig.isHero?[(rig.facing||1)*.30,dy/mag*.22]:[(rig.facing||1)*(.45+.55*Math.abs(dx)/mag),dy/mag*.20];
  g.save();g.translate(x,y);g.fillStyle='#1c201b50';g.beginPath();g.ellipse(0,-1,height*.16,height*.045,0,0,TAU);g.fill();g.scale(flip?-scale:scale,scale);g.translate(-rig.center,-rig.bottom);
  if(!moving){g.drawImage(rig.base,0,0);g.restore();return true;}
  // Two legs are half a cycle apart; body and clothes keep their painted shape.
  leg(g,rig.legs[1],phase+.5,rig,1,axis);leg(g,rig.legs[0],phase,rig,1,axis);
  g.drawImage(rig.body,0,0);g.restore();return true;
 }
 function hero(im){
  if(heroCache.has(im))return heroCache.get(im);
  const front=make(im,[384,0,384,512],{top:10,bottom:477,center:220,hem:314,boot:true,span:25,isHero:true,legs:[[[190,304],[194,351],[189,435],[181,466]],[[237,307],[247,353],[253,435],[252,466]]]});
  const back=make(im,[384,512,384,512],{top:10,bottom:458,center:220,hem:303,boot:true,span:25,isHero:true,facing:-1,legs:[[[192,296],[199,340],[197,418],[187,441]],[[237,296],[249,340],[257,422],[256,447]]]});
  const pair=[front,back];heroCache.set(im,pair);return pair;
 }
 function polygonLayer(im,points){
  const c=canvas(im.width,im.height),g=c.getContext('2d');g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.clip();g.drawImage(im,0,0);return c;
 }
 function makeSideHero(im){
  // Use one side-facing anatomy base. Do not loop AI frames that repeat the same leading leg.
  const base=canvas(384,512);base.getContext('2d').drawImage(im,0,0,im.width/4,im.height/2,0,0,384,512);
  const body=polygonLayer(base,[[0,0],[384,0],[384,302],[270,302],[252,308],[237,312],[217,322],[189,317],[177,307],[165,300],[153,307],[150,342],[0,342]]);
  const definitions=[
   {hip:[208,265],knee:[257,359],ankle:[292,452],toe:[348,471],rest:[213,470],
    polygon:[[195,275],[244,300],[272,342],[283,380],[317,396],[324,449],[376,454],[376,500],[275,500],[252,446],[243,388],[220,355],[194,332]]},
   {hip:[196,265],knee:[155,366],ankle:[108,434],toe:[145,465],rest:[199,435],
    polygon:[[174,276],[216,300],[217,327],[191,361],[171,388],[148,426],[163,449],[174,474],[151,489],[111,482],[65,453],[72,421],[103,383],[123,341],[143,313]]}
  ];
  const legs=definitions.map(d=>{const im=polygonLayer(base,d.polygon);return{...d,thigh:strip(im,d.hip,d.knee,29),shin:strip(im,d.knee,d.ankle,33),foot:strip(im,d.ankle,d.toe,31),l1:Math.hypot(d.knee[0]-d.hip[0],d.knee[1]-d.hip[1]),l2:Math.hypot(d.ankle[0]-d.knee[0],d.ankle[1]-d.knee[1])};});
  // Both boots use the level sole. The original far boot is a raised toe-off pose.
  legs[1]={...legs[0],rest:[201,470]};
  return{body,legs,top:20,bottom:505,center:208,span:64,stance:.60};
 }
 function sideLeg(g,l,phase,moving,rig,bodyY){
  const u=((phase%1)+1)%1,stance=rig.stance,v=clamp((u-stance)/(1-stance),0,1);
  const smooth=v*v*(3-2*v),step=moving?(u<stance?1-2*u/stance:-1+2*smooth):0;
  const lift=moving&&u>=stance?Math.sin(v*PI)*27:0;
  let ankle=[l.rest[0]+rig.span*step,l.rest[1]-lift];
  const hip=[l.hip[0],l.hip[1]+bodyY];
  let dx=ankle[0]-hip[0],dy=ankle[1]-hip[1],d=Math.hypot(dx,dy);
  const reach=l.l1+l.l2-.5;if(d>reach){dx*=reach/d;dy*=reach/d;d=reach;ankle=[hip[0]+dx,hip[1]+dy];}
  const a=(l.l1*l.l1-l.l2*l.l2+d*d)/(2*Math.max(1,d)),h=Math.sqrt(Math.max(0,l.l1*l.l1-a*a));
  // In the right-facing side view knees bend forward; mirroring the whole pose handles left travel.
  const knee=[hip[0]+dx/d*a+dy/d*h,hip[1]+dy/d*a-dx/d*h];
  transformed(g,l.thigh,l.hip,hip,Math.atan2(l.knee[1]-l.hip[1],l.knee[0]-l.hip[0]),Math.atan2(knee[1]-hip[1],knee[0]-hip[0]));
  transformed(g,l.shin,l.knee,knee,Math.atan2(l.ankle[1]-l.knee[1],l.ankle[0]-l.knee[0]),Math.atan2(ankle[1]-knee[1],ankle[0]-knee[0]));
  const roll=!moving?0:u<.08?-.08*(1-u/.08):u>stance-.08&&u<stance?.08*(u-(stance-.08))/.08:u>=stance?-.08*Math.sin(v*PI):0;
  transformed(g,l.foot,l.footOrigin||l.ankle,ankle,0,roll);
 }
 function drawSideHero(g,x,y,height,phase,moving,left){
  const r=sideRig,scale=height/(r.bottom-r.top);
  const nearPhase=((phase%1)+1)%1,farPhase=(nearPhase+.5)%1;
  const support=nearPhase<r.stance&&Math.abs(nearPhase-.3)<=Math.abs(farPhase-.3)?nearPhase:farPhase;
  const l=r.legs[0],supportX=l.rest[0]+r.span*(1-2*support/r.stance)-l.hip[0],reach=l.l1+l.l2-1;
  // The planted leg lifts the pelvis at mid-stance, then lowers it into the next step.
  const bodyY=moving?clamp(l.rest[1]-Math.sqrt(Math.max(1,reach*reach-supportX*supportX))-l.hip[1],0,14):0;
  g.save();g.translate(x,y);g.fillStyle='#1c201b50';g.beginPath();g.ellipse(0,-1,height*.17,height*.045,0,0,TAU);g.fill();g.scale(left?-scale:scale,scale);g.translate(-r.center,-r.bottom);
  g.save();g.translate(-8,-7);sideLeg(g,r.legs[1],phase+.5,moving,r,bodyY);g.restore();sideLeg(g,r.legs[0],phase,moving,r,bodyY);
  // Body and weapon stay intact; only a tiny weight transfer moves the torso.
  g.drawImage(r.body,0,bodyY);g.restore();return true;
 }
 function drawHero(g,im,x,y,height,distance,moving,dx,dy){
  let direction=heroDirections.get(im);if(!direction){direction={side:false,back:false,left:false,phase:0,lastDistance:distance};heroDirections.set(im,direction);}
  const travelled=distance-direction.lastDistance;direction.lastDistance=distance;
  if(moving&&travelled>0&&travelled<height)direction.phase+=travelled/(height*(2*64/.60/485));
  const mag=Math.hypot(dx,dy);
  if(moving&&mag>.001){
   const horizontal=Math.abs(dx)/mag;
   // Hysteresis stops tiny bends in a road from flipping front/back every frame.
   if(horizontal>.85)direction.side=true;else if(horizontal<.65)direction.side=false;
   if(horizontal>.18)direction.left=dx<0;
   if(dy/mag<-.45)direction.back=true;else if(dy/mag>.45)direction.back=false;
  }
  if(direction.side&&sideRig)return drawSideHero(g,x,y,height,direction.phase,moving,direction.left);
  const rig=hero(im)[direction.back?1:0],sign=direction.left?-1:1;
  return draw(g,rig,x,y,height,distance,moving,sign*Math.abs(dx||1),dy);
 }
 function villagers(im){
  const defs=[
   {top:2,bottom:506,center:319,hem:344,legs:[[[280,337],[270,393],[269,449],[269,491]],[[351,337],[354,393],[355,450],[376,480]]]},
   {top:13,bottom:505,center:261,hem:412,span:26,lift:9,legs:[[[217,379],[220,414],[219,460],[228,490]],[[281,379],[282,416],[285,457],[309,482]]]},
   {top:3,bottom:509,center:217,hem:353,legs:[[[174,345],[163,396],[164,450],[172,494]],[[246,345],[246,396],[254,450],[283,480]]]},
   {top:1,bottom:481,center:319,hem:324,legs:[[[284,318],[270,373],[274,432],[267,466]],[[351,318],[349,376],[352,437],[377,471]]]},
   {top:10,bottom:478,center:261,hem:397,span:25,lift:9,legs:[[[218,367],[219,402],[218,449],[214,466]],[[284,368],[286,404],[288,452],[309,468]]]},
   {top:1,bottom:484,center:216,hem:325,legs:[[[173,318],[165,372],[160,435],[169,464]],[[238,318],[246,376],[246,440],[274,473]]]}
  ];return defs.map((d,i)=>prepareResident(make(im,[i%3*512,Math.floor(i/3)*512,512,512],d),i));
 }
 // Resident gait is kept separate from the approved, rendered Erion animation.
 const RESIDENT_CYCLE=.32,STANCE=.56;
 function cycle(dx,dy){const m=Math.hypot(dx,dy)||1;return RESIDENT_CYCLE*Math.hypot(dx/m,dy/m*.60);}
 function advance(p,height,dt){
  const s=p.gait||(p.gait={phase:0,last:p.distance||0,weight:0,dx:1,dy:0,time:0});
  const travelled=Math.max(0,(p.distance||0)-s.last);s.last=p.distance||0;s.time+=dt;
  if(p.moving&&travelled>0){s.phase+=travelled/(height*cycle(p.dx,p.dy||0));const m=Math.hypot(p.dx,p.dy||0)||1;const t=1-Math.exp(-dt*12);s.dx+=(Math.abs(p.dx)/m-s.dx)*t;s.dy+=((p.dy||0)/m-s.dy)*t;}
  s.weight+=((p.moving?1:0)-s.weight)*(1-Math.exp(-dt*16));
 }
 function prepareResident(r,i){
  r.resident=true;r.kind=i;r.arms=[];
  // Hip pivots belong under the clothing, not at the visible hem / thigh cut edge.
  r.legs=r.legs.map(l=>{const hip=[l.hip[0],l.hip[1]-(i%3===1?76:54)],thigh=strip(r.base,hip,l.knee,23);thigh.getContext('2d').clearRect(0,0,thigh.width,r.hem-2);return {...l,hip,thigh,l1:Math.hypot(l.knee[0]-hip[0],l.knee[1]-hip[1])};});
  // Only free arms are segmented. Sack / basket and their supporting hands remain a unit.
  const arms=[
   [{s:[376,148],e:[387,212],w:[397,272],poly:[[369,146],[394,146],[418,306],[387,306],[378,235],[374,184]],side:1}],
   [],
   [{s:[151,165],e:[147,225],w:[159,284],poly:[[128,155],[166,155],[164,210],[169,312],[143,312],[126,215]],side:-1},
    {s:[271,160],e:[282,219],w:[288,276],poly:[[265,154],[296,154],[315,309],[280,309],[269,237]],side:1}],
   [{s:[377,151],e:[394,212],w:[406,258],poly:[[362,145],[397,145],[430,290],[392,290],[379,225]],side:1}],
   [],
   [{s:[156,164],e:[152,215],w:[159,266],poly:[[135,159],[168,159],[170,291],[144,291],[130,222]],side:-1},
    {s:[266,154],e:[278,212],w:[290,267],poly:[[258,150],[286,150],[311,291],[279,291],[266,224]],side:1}]
  ][i];
  for(const a of arms){
   const layer=polygonLayer(r.base,a.poly),upper=canvas(512,512),lower=canvas(512,512);
   upper.getContext('2d').drawImage(layer,0,0,512,a.e[1]+8,0,0,512,a.e[1]+8);
   lower.getContext('2d').drawImage(layer,0,a.e[1]-8,512,512-a.e[1]+8,0,a.e[1]-8,512,512-a.e[1]+8);
   const q=r.body.getContext('2d');q.save();q.globalCompositeOperation='destination-out';q.beginPath();a.poly.forEach((p,j)=>j?q.lineTo(...p):q.moveTo(...p));q.closePath();q.fill();q.restore();
   r.arms.push({...a,upper,lower});
  }
  return r;
 }
 function residentPose(r,phase,amount,dx,dy){
  const m=Math.hypot(dx,dy)||1,span=(r.bottom-r.top)*cycle(dx,dy)*STANCE/2;
  const ax=Math.abs(dx)/m,ay=dy/m;
  return r.legs.map((l,i)=>{
   const u=((phase+i*.5)%1+1)%1,v=clamp((u-STANCE)/(1-STANCE),0,1);
   const step=u<STANCE?1-2*u/STANCE:-1+2*(v*v*(3-2*v));
   const lift=u<STANCE?0:Math.sin(v*PI)*(r.kind%3===1?8:12);
   return {u,v,stance:u<STANCE,ankle:[l.ankle[0]+step*span*ax*amount,l.ankle[1]+step*span*ay*amount-lift*amount]};
  });
 }
 function residentLeg(g,l,p,bodyY){
  const hip=[l.hip[0],l.hip[1]+bodyY],a=p.ankle,dx=a[0]-hip[0],dy=a[1]-hip[1],dist=Math.hypot(dx,dy)||1;
  // A front/back view foreshortens the limb; never clamp the planted foot back towards the hip.
  const factor=Math.max(.96,Math.min(1,dist/(l.l1+l.l2-.5))),l1=l.l1*factor,l2=l.l2*factor;
  const along=(l1*l1-l2*l2+dist*dist)/(2*dist),bend=Math.sqrt(Math.max(0,l1*l1-along*along));
  // Both knees flex towards the painted three-quarter facing, not out to opposite sides.
  const side=1;
  const knee=[hip[0]+dx/dist*along+dy/dist*bend*side,hip[1]+dy/dist*along-dx/dist*bend*side];
  const segment=(im,from,end,to,next)=>{g.save();g.translate(...to);g.rotate(Math.atan2(next[1]-to[1],next[0]-to[0]));g.scale(Math.hypot(next[0]-to[0],next[1]-to[1])/Math.hypot(end[0]-from[0],end[1]-from[1]),1);g.rotate(-Math.atan2(end[1]-from[1],end[0]-from[0]));g.drawImage(im,-from[0],-from[1]);g.restore();};
  segment(l.thigh,l.hip,l.knee,hip,knee);segment(l.shin,l.knee,l.ankle,knee,a);
  // Keep the sole fixed throughout contact. Toe lift belongs only to the airborne foot.
  transformed(g,l.foot,l.ankle,a,0,p.stance?0:-Math.sin(p.v*PI)*.10);
 }
 function drawResident(g,r,x,y,height,distance,moving,dx,dy,actor){
  const s=actor?.gait,amount=s?s.weight:(moving?1:0),phase=s?s.phase:distance/(height*cycle(dx,dy));
  const scale=height/(r.bottom-r.top),axisX=s?s.dx:dx,axisY=s?s.dy:dy,poses=residentPose(r,phase,amount,axisX,axisY);
  // Pelvis yields a little to the support leg; chest and clothes do not squash or stretch.
  let bodyY=0;poses.forEach((p,i)=>{const l=r.legs[i],reach=l.l1+l.l2-.5,horizontal=p.ankle[0]-l.hip[0];bodyY=Math.max(bodyY,p.ankle[1]-l.hip[1]-Math.sqrt(Math.max(1,reach*reach-horizontal*horizontal)));});
  g.save();g.translate(x,y);g.fillStyle='#1c201b45';g.beginPath();g.ellipse(0,-1,height*.16,height*.042,0,0,TAU);g.fill();g.scale(dx<0?-scale:scale,scale);g.translate(-r.center,-r.bottom);
  if(amount<.002){g.drawImage(r.base,0,0);g.restore();return true;}
  residentLeg(g,r.legs[1],poses[1],bodyY);residentLeg(g,r.legs[0],poses[0],bodyY);
  g.drawImage(r.body,0,bodyY);
  for(const a of r.arms){const t=phase*TAU+(a.side<0?PI:0),swing=Math.sin(t)*.13*amount,follow=(Math.sin(t-.42)*.10+.035)*amount;
   g.save();g.translate(a.s[0],a.s[1]+bodyY);g.rotate(swing);g.drawImage(a.upper,-a.s[0],-a.s[1]);g.translate(a.e[0]-a.s[0],a.e[1]-a.s[1]);g.rotate(follow);g.drawImage(a.lower,-a.e[0],-a.e[1]);g.restore();
  }
  g.restore();return true;
 }
 return {draw,drawHero,hero,villagers,advance,residentPose,residentCycle:cycle,projectedSpeed:(dx,dy)=>cycle(dx,dy)/RESIDENT_CYCLE};
})();
