/* Coastal refuge: local cloth/water motion and purposeful, depth-sorted residents.
   Original artwork, quest state and clickable silhouettes remain unchanged. */
window.createCliffCampLife=function(){
 'use strict';
 const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=v=>v*v*(3-2*v);
 const sources=['https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/village-life-v2/villagers-neutral.webp','https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/village-life-v2/winch-worker.webp'];
 const people=[
 {kind:0,height:64,speed:25,route:[[325,270],[394,292],[463,318],[537,340],[598,337]],wait:2},
 {kind:1,height:66,speed:23,route:[[439,272],[451,322],[493,357],[535,407],[534,431]],wait:6}
 ].map((p,i)=>({...p,x:p.route[0][0],y:p.route[0][1],index:1,dir:1,dx:1,dy:0,distance:0,moving:false,back:false,visits:0}));
 let time=0,active=false,rigs=null,workerImage=null,poolLayer=null;
 const reactions={pool:-99,jars:-99,rope:-99};
 const backgroundCache=new WeakMap();
 function canvas(w,h){const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);return c;}
 function ellipse(g,x,y,rx,ry,fill){g.fillStyle=fill;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();}
 function prepare(images){rigs=GroundedWalk.villagers(images[sources[0]]);workerImage=images[sources[1]];}
 function update(dt,area,enabled,held,player){
  active=area==='cliff';if(!active||!enabled||held){for(const p of people){p.moving=false;GroundedWalk.advance(p,p.height,dt);}return;}
  time+=dt;
  for(let i=0;i<people.length;i++){
   const p=people[i];p.moving=false;if(p.wait>0){p.wait=Math.max(0,p.wait-dt);continue;}
   const [tx,ty]=p.route[p.index],dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),step=Math.min(d,p.speed*GroundedWalk.projectedSpeed(dx,dy)*dt);
   const nx=p.x+(d?dx/d:0)*18,ny=p.y+(d?dy/d:0)*18;
   if(Math.hypot(nx-player.x,ny-player.y)<25||people.some((q,j)=>j<i&&Math.hypot(nx-q.x,ny-q.y)<23))continue;
   if(d>.01){p.x+=dx/d*step;p.y+=dy/d*step;p.dx=dx;p.dy=dy;p.back=dy< -2;p.distance+=step;p.moving=true;}
   if(d<=step+.01){p.index+=p.dir;if(p.index>=p.route.length||p.index<0){p.dir*=-1;p.index+=2*p.dir;p.wait=4+(++p.visits%3)*1.7+i;}}
  }
  for(const p of people)GroundedWalk.advance(p,p.height,dt);
 }
 function backgroundData(im){
  if(backgroundCache.has(im))return backgroundCache.get(im);
  const d={image:im,sx:im.width/1536,sy:im.height/864};backgroundCache.set(im,d);return d;
 }
 const cloth=[
 [[98,116],[161,96],[205,126],[275,132],[234,149],[166,143]],
 [[228,100],[252,88],[306,100],[335,113],[295,119],[255,111]],
 [[305,89],[350,74],[390,100],[455,106],[423,121],[368,114]]
 ];
 function background(g,im){
  if(!active||!im)return;const {image:source,sx,sy}=backgroundData(im);
  // Sub-pixel billows only inside the cloth. Posts and stone never shift.
  cloth.forEach((pts,k)=>{
   const minX=Math.min(...pts.map(p=>p[0])),maxX=Math.max(...pts.map(p=>p[0])),minY=Math.min(...pts.map(p=>p[1])),maxY=Math.max(...pts.map(p=>p[1]));
   g.save();g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();
   for(let x=minX;x<maxX;x+=6){const wave=Math.sin(time*1.65+(x-minX)*.037+k*2)*1.25+Math.sin(time*.73+x*.08)*.35;
    g.drawImage(source,(x-2)*sx,(minY-3)*sy,10*sx,(maxY-minY+6)*sy,x-2,minY-3+wave,10,maxY-minY+6);
   }
   g.restore();
  });
 }
 function waterData(p){
  if(poolLayer)return poolLayer;
  const c=canvas(p.w*2,p.h*2),q=c.getContext('2d',{willReadFrequently:true});
  q.drawImage(p.im,...p.crop,0,0,c.width,c.height);const data=q.getImageData(0,0,c.width,c.height);
  for(let i=0;i<data.data.length;i+=4){const r=data.data[i],gg=data.data[i+1],b=data.data[i+2];data.data[i+3]*=clamp((Math.min(gg,b)-r*1.08)/24,0,1);}
  q.putImageData(data,0,0);poolLayer={mask:c,work:canvas(c.width,c.height),glints:canvas(c.width,c.height),tick:-1};return poolLayer;
 }
 function poolWater(g,p){
  const layer=waterData(p),{mask,work,glints}=layer,tick=Math.floor(time*20);if(layer.tick===tick){g.drawImage(work,p.x,p.y,p.w,p.h);return;}layer.tick=tick;const q=work.getContext('2d',{willReadFrequently:true}),w=work.width,h=work.height;
  q.clearRect(0,0,w,h);q.globalCompositeOperation='source-over';q.globalAlpha=.5;
  q.drawImage(mask,Math.sin(time*.28)*2.2,Math.cos(time*.23)*1.1);
  q.globalAlpha=.2;q.drawImage(mask,-Math.cos(time*.19)*2,Math.sin(time*.21)*1.3);q.globalAlpha=1;
  const ink=glints.getContext('2d',{willReadFrequently:true});ink.clearRect(0,0,w,h);ink.save();
  for(let i=0;i<14;i++){const x=w*(.2+(i*.137)% .62),y=h*(.26+(i*.173)% .40),a=Math.max(0,Math.sin(time*.62+i*2.37))**6*.16;
   ellipse(ink,x+Math.sin(time*.26+i)*4,y,5+(i%3)*2,1.2,'rgba(222,246,221,'+a+')');
  }
  const age=time-reactions.pool;
  if(age<3.4)for(let i=0;i<3;i++){
   const v=(age-i*.27)/3.4;if(v<0||v>1)continue;ink.strokeStyle='rgba(198,238,225,'+(1-v)*.52+')';ink.lineWidth=1.8;
   ink.beginPath();ink.ellipse(w*.52,h*.52,16+v*190,5+v*57,.28,0,TAU);ink.stroke();
  }
  ink.restore();q.save();q.filter='blur(1.2px)';q.drawImage(glints,0,0);q.restore();q.globalCompositeOperation='destination-in';q.drawImage(mask,0,0);q.globalCompositeOperation='source-over';
  g.drawImage(work,p.x,p.y,p.w,p.h);
 }
 function jarWater(g,p){
  // The water sits below the neck, clipped within the mouth.
  const x=p.x+p.w*.5,y=p.y+p.h*.12,rx=p.w*.18,ry=p.h*.024;
  g.save();g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.clip();
  ellipse(g,x,y,rx,ry,'#235b6480');g.strokeStyle='#c4e4d6a0';g.lineWidth=.65;
  const age=time-reactions.jars,react=age<2.7;
  for(let i=0;i<2;i++){const u=(time*(react?.45:.08)+i*.5)%1;g.beginPath();g.ellipse(x,y,rx*u,ry*u,0,0,TAU);g.stroke();}
  g.restore();
 }
 const anchors=[[402,547],[384,557],[405,532],[379,530]],hands=[[281,64],[190,177],[264,250],[228,163]];
 function worker(g){
  if(!workerImage)return;const x=882,y=352,s=.119,phase=time%15,react=time-reactions.rope<3.5,working=phase<7||react;
  const f=working?[1,2,3,1][Math.floor(time/.68)%4]:1,[ax,ay]=anchors[f],[hx,hy]=hands[f],cw=workerImage.width/2,ch=workerImage.height/2;
  const handX=x+(hx-ax)*s,handY=y+(hy-ay)*s;
  // A loose end, not the whole heavy coil, responds to the worker's pull.
  g.save();g.strokeStyle='#493a2780';g.lineWidth=2.7;g.beginPath();g.moveTo(859,322);g.quadraticCurveTo(869,working?331:340+Math.sin(time*1.3)*1.5,handX,handY);g.stroke();
  g.strokeStyle='#b99a64';g.lineWidth=1.15;g.stroke();
  ellipse(g,x,y-1,9,2.6,'#25241e45');g.drawImage(workerImage,f%2*cw,Math.floor(f/2)*ch,cw,ch,x-ax*s,y-ay*s,cw*s,ch*s);g.restore();
 }
 function bird(g,x,y,size,flight,phase,dir=1){
  g.save();g.translate(x,y);g.scale(dir,1);
  if(!flight){g.strokeStyle='#655742';g.lineWidth=.7;g.beginPath();g.moveTo(-1,0);g.lineTo(-1,3);g.moveTo(2,0);g.lineTo(2,3);g.stroke();ellipse(g,0,-size*.3,size*1.05,size*.57,'#e2e7dd');ellipse(g,-size*.22,-size*.15,size*.7,size*.3,'#aab9b7');ellipse(g,size*.75,-size*.75,size*.41,size*.4,'#f1eedc');g.fillStyle='#caa666';g.beginPath();g.moveTo(size,-size*.75);g.lineTo(size*1.55,-size*.58);g.lineTo(size,-size*.43);g.fill();ellipse(g,size*.87,-size*.8,.45,.45,'#26302d');g.restore();return;}
  const flap=flight?Math.sin(phase*11)*size*.8:0;
  g.fillStyle='#d9e1dc';g.beginPath();g.moveTo(-size*.25,0);g.quadraticCurveTo(-size*1.1,-size*.3,-size*2.4,-flap);g.lineTo(-size*.85,size*.3);g.lineTo(0,size*.1);g.quadraticCurveTo(size,-size*.5,size*2.2,-flap*.9);g.lineTo(size*.7,size*.4);g.closePath();g.fill();
  ellipse(g,0,0,size*.85,size*.38,'#edf0df');ellipse(g,size*.65,-size*.24,size*.35,size*.34,'#f1eedc');
  g.fillStyle='#caa666';g.beginPath();g.moveTo(size*.85,-size*.24);g.lineTo(size*1.38,-size*.12);g.lineTo(size*.84,0);g.fill();ellipse(g,size*.78,-size*.3,.45,.45,'#26302d');g.restore();
 }
 function foreground(g){
  if(!active)return;
  for(let i=0;i<3;i++){const period=39+i*7,age=(time+i*13)%period,perches=[[1352,449],[1167,371],[906,278]],[sx,sy]=perches[i],size=3.2+i*.35;
   if(age<8||age>29){bird(g,sx,sy,size,false,time,i%2?-1:1);continue;}
   const u=(age-8)/21,x=sx+Math.sin(u*TAU)*140,y=sy-Math.sin(u*Math.PI)*160;
   bird(g,x,y,size,true,time+i,Math.cos(u*TAU)>=0?1:-1);
  }
 }
 function person(g,p){
  if(!rigs)return;GroundedWalk.draw(g,rigs[p.kind+(p.back?3:0)],p.x,p.y,p.height,p.distance,p.moving,p.dx,p.dy,p);
 }
 function actors(){
  if(!active)return [];return [...people.map(p=>({y:p.y,draw:g=>person(g,p)})),{y:352,draw:worker}];
 }
 function afterProp(g,p){if(!active)return;if(p.id==='pool')poolWater(g,p);if(p.id==='jars')jarWater(g,p);}
 function react(id){if(!(id in reactions))return false;reactions[id]=time;return true;}
 function caption(id,repaired){return {jars:'輕觸缸沿，水面泛起細小波紋。陶缸穩穩擱在石地上，營地仍留著這份海水。',rope:'繩工順著你的示意拉緊繩端，再鬆手檢查纖維；盤好的救援繩留在原處。',pool:repaired?'池面被海風吹出緩慢的波紋。潮水已歸來，這座舊鹽池仍由營地照看。':'池面泛開一層層細波，水依然留在石砌池壁之內。'}[id];}
 return {sources,prepare,update,background,foreground,actors,afterProp,react,caption};
};

