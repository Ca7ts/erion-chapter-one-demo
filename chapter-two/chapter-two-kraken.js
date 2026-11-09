/* Approved Kraken art, reworked into transparent body + four arm textures.
   The eight arms are independently deformed. All coordinates are presentation-only. */
(() => {
 'use strict';
 const ROOT='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v1/kraken/',TAU=Math.PI*2;
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 let textures=null,pending=null;
 function load(){
  if(textures)return Promise.resolve();
  if(!pending)pending=Promise.all(['kraken-body-v13.webp',...Array.from({length:4},(_,i)=>`kraken-arm-${i}-v13.webp`),'kraken-body-front-v13.webp'].map(name=>new Promise((resolve,reject)=>{
   const image=new ChapterImage();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Kraken asset: '+name));image.src=ROOT+name;
  }))).then(images=>{textures=images;}).catch(error=>{pending=null;throw error;});
  return pending;
 }
 const arms=[
  {tex:3,x:-52,y:43,h:366,root:.50,rootY:.956,phase:1.7,angle:-.22,shade:.76,back:true},
  {tex:1,x:74,y:50,h:320,root:.522,rootY:.979,phase:3.5,angle:.18,shade:.74,back:true},
  {tex:2,x:-92,y:66,h:210,root:.816,rootY:.952,phase:5.2,angle:-.09,shade:.83,back:true},
  {tex:2,x:97,y:64,h:205,root:.816,rootY:.952,phase:2.1,angle:.10,mirror:true,shade:.81,back:true},
  {tex:0,x:-111,y:65,h:380,root:.566,rootY:.972,phase:.4,angle:-.12,shade:1},
  {tex:1,x:118,y:63,h:369,root:.522,rootY:.979,phase:2.9,angle:.08,shade:.96},
  {tex:2,x:-34,y:100,h:224,root:.816,rootY:.952,phase:4.1,angle:-.03,shade:1},
  {tex:2,x:39,y:102,h:208,root:.816,rootY:.952,phase:6.2,angle:.04,mirror:true,shade:.96}
 ];
 window.createTribalKrakenRig=function(){
  const plate=document.createElement('canvas');plate.width=1700;plate.height=650;
  const p=plate.getContext('2d');let cached='';
  // Map the painted skin along a spine. Suckers keep their cross-section as the curl opens.
  const spines=[
   [[.566,.98,.27],[.48,.87,.24],[.36,.71,.20],[.29,.52,.18],[.30,.34,.17],[.40,.22,.15],[.55,.15,.125],[.72,.14,.10],[.85,.20,.08],[.86,.29,.065],[.82,.34,.047],[.77,.33,.03],[.76,.30,.006]],
   [[.522,.98,.29],[.53,.84,.26],[.66,.69,.23],[.72,.54,.20],[.68,.39,.18],[.59,.24,.15],[.44,.13,.13],[.28,.08,.11],[.16,.10,.095],[.125,.17,.07],[.16,.205,.037],[.18,.18,.005]]
  ];
  const meshCache=new Map(),SEGMENTS=48;
  function sourceSpine(tex,w,h){
   const key=tex+':'+w+':'+h;if(meshCache.has(key))return meshCache.get(key);
   const a=spines[tex],dense=[];
   const cat=(a,b,c,d,t)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
   for(let i=0;i<a.length-1;i++)for(let j=0;j<12;j++){
    const t=j/12,A=a[Math.max(0,i-1)],B=a[i],C=a[i+1],D=a[Math.min(a.length-1,i+2)];
    dense.push({x:cat(A[0],B[0],C[0],D[0],t)*w,y:cat(A[1],B[1],C[1],D[1],t)*h,r:(B[2]+(C[2]-B[2])*t)*w});
   }
   const last=a.at(-1);dense.push({x:last[0]*w,y:last[1]*h,r:last[2]*w});
   let total=0;dense.forEach((q,i)=>{if(i)total+=Math.hypot(q.x-dense[i-1].x,q.y-dense[i-1].y);q.s=total;});
   const samples=[];let k=0;
   for(let i=0;i<=SEGMENTS;i++){const s=total*i/SEGMENTS;while(k<dense.length-2&&dense[k+1].s<s)k++;const A=dense[k],B=dense[k+1],f=(s-A.s)/(B.s-A.s||1);samples.push({x:A.x+(B.x-A.x)*f,y:A.y+(B.y-A.y)*f,r:A.r+(B.r-A.r)*f});}
   meshCache.set(key,samples);return samples;
  }
  function triangle(im,s,d){
   const [s0,s1,s2]=s,[d0,d1,d2]=d,det=(s1.x-s0.x)*(s2.y-s0.y)-(s2.x-s0.x)*(s1.y-s0.y);if(Math.abs(det)<.001)return;
   const a=((d1.x-d0.x)*(s2.y-s0.y)-(d2.x-d0.x)*(s1.y-s0.y))/det,b=((d1.y-d0.y)*(s2.y-s0.y)-(d2.y-d0.y)*(s1.y-s0.y))/det;
   const c=((s1.x-s0.x)*(d2.x-d0.x)-(s2.x-s0.x)*(d1.x-d0.x))/det,dd=((s1.x-s0.x)*(d2.y-d0.y)-(s2.x-s0.x)*(d1.y-d0.y))/det;
   p.save();p.beginPath();const cx=(d0.x+d1.x+d2.x)/3,cy=(d0.y+d1.y+d2.y)/3;
   d.forEach((q,i)=>{const l=Math.hypot(q.x-cx,q.y-cy)||1,x=q.x+(q.x-cx)*.35/l,y=q.y+(q.y-cy)*.35/l;i?p.lineTo(x,y):p.moveTo(x,y);});p.closePath();p.clip();p.transform(a,b,c,dd,d0.x-a*s0.x-c*s0.y,d0.y-b*s0.x-dd*s0.y);p.drawImage(im,0,0);p.restore();
  }
  function strikingArm(a,t,attack,index,angle){
   if(!attack||![4,5].includes(index)||!Array.isArray(attack.targets)||!attack.targets.length||(!attack.skill&&index===5))return false;
   const phase=attack.phase,weight=smooth((phase-.10)/.22)*(1-smooth((phase-.68)/.30));if(weight<=0)return false;
   const im=textures[a.tex+1],h=a.h,w=h*im.width/im.height,src=sourceSpine(a.tex,w,h),sn=Math.sin(angle),cs=Math.cos(angle);
   const rest=q=>({x:a.x+(q.x-w*a.root)*cs-(q.y-h*a.rootY)*sn,y:a.y+(q.x-w*a.root)*sn+(q.y-h*a.rootY)*cs});
   const root=rest(src[0]),tip=rest(src.at(-1));
   const ordered=[...attack.targets].sort((a,b)=>a.y-b.y),q=ordered[index===4?0:ordered.length-1];
   const reach=smooth((phase-.20)/.28),slam=smooth((phase-.45)/.13),recover=smooth((phase-.68)/.30);
   const end={x:tip.x+(q.x-tip.x)*reach,y:tip.y+(q.y-tip.y)*reach-95*reach*(1-slam)};
   end.x+=(tip.x-end.x)*recover;end.y+=(tip.y-end.y)*recover;
   const dx=end.x-root.x,dy=end.y-root.y;
   const C1={x:root.x+dx*.08,y:root.y-150-(1-slam)*55},C2={x:end.x-dx*.21,y:end.y-80*(1-slam)-24};
   const curve=u=>{const v=1-u;return {x:v*v*v*root.x+3*v*v*u*C1.x+3*v*u*u*C2.x+u*u*u*end.x,y:v*v*v*root.y+3*v*v*u*C1.y+3*v*u*u*C2.y+u*u*u*end.y};};
   const dst=src.map((v,i)=>{const r=rest(v),q=curve(i/SEGMENTS);return {x:r.x+(q.x-r.x)*weight,y:r.y+(q.y-r.y)*weight};});
   const vertices=[];
   for(let i=0;i<=SEGMENTS;i++){
    const A=src[Math.max(0,i-1)],B=src[Math.min(SEGMENTS,i+1)],a0=dst[Math.max(0,i-1)],b0=dst[Math.min(SEGMENTS,i+1)],sl=Math.hypot(B.x-A.x,B.y-A.y)||1,dl=Math.hypot(b0.x-a0.x,b0.y-a0.y)||1;
    for(let j=0;j<=2;j++){const side=j-1,r=src[i].r*side,dr=r*(1-.12*weight);vertices.push({s:{x:(src[i].x-(B.y-A.y)/sl*r)*im.width/w,y:(src[i].y+(B.x-A.x)/sl*r)*im.height/h},d:{x:dst[i].x-(b0.y-a0.y)/dl*dr,y:dst[i].y+(b0.x-a0.x)/dl*dr}});}
   }
   p.save();p.globalAlpha=a.shade;
   for(let i=0;i<SEGMENTS;i++)for(let j=0;j<2;j++){const a0=vertices[i*3+j],b=vertices[i*3+j+1],c=vertices[(i+1)*3+j],d=vertices[(i+1)*3+j+1];triangle(im,[a0.s,b.s,c.s],[a0.d,b.d,c.d]);triangle(im,[b.s,d.s,c.s],[b.d,d.d,c.d]);}
   p.restore();return true;
  }
  function arm(a,t,seed,attack,index){
   const im=textures[a.tex+1],h=a.h,w=h*im.width/im.height;
   const reach=a.h>300?1:.72;
   const phase=a.phase+seed;
   const charge=attack?.skill?smooth(attack.phase/.27)*(1-smooth((attack.phase-.31)/.18)):0;
   let angle=a.angle+Math.sin(t*.62+phase)*.108*reach+charge*(index%2?.12:-.12);
   if(strikingArm(a,t,attack,index,angle))return;
   p.save();p.translate(a.x,a.y);p.rotate(angle);
   if(a.mirror)p.scale(-1,1);
   p.translate(-w*a.root,-h*a.rootY);p.globalAlpha=a.shade;
   // Sheared strips are contiguous at their shared edges; the root is anchored.
   function bend(v){const u=1-v,e=u*u;return {x:(Math.sin(t*.87+u*3.4+phase)*27+Math.sin(t*.41+u*5+phase)*10)*reach*e,y:Math.sin(t*.73+u*3+phase)*11*reach*e};}
   const strips=44;
   for(let j=0;j<strips;j++){
    const v0=j/strips,v1=(j+1)/strips,b0=bend(v0),b1=bend(v1),y0=v0*h,dy=h/strips;
    const sx=(b1.x-b0.x)/dy,sy=(b1.y-b0.y)/dy;
    const sourceY=im.height*v0,sourceH=Math.min(im.height-sourceY,im.height/strips+.45);
    p.save();p.transform(1,0,sx,1+sy,b0.x-sx*y0,b0.y-sy*y0);
    p.drawImage(im,0,sourceY,im.width,sourceH,0,y0,w,sourceH*h/im.height);p.restore();
   }
   p.restore();
  }
  function render(t,rise,seed,attack,view){
   const frame=[Math.floor(t*30),rise,seed,view,attack?.phase,attack?.skill,...(attack?.targets||[]).flatMap(q=>[q.x,q.y])].join(':');
   if(frame===cached)return;cached=frame;
   p.clearRect(0,0,1700,650);p.save();
   p.translate(1000,475+(1-rise)*390+Math.sin(t*.54+seed)*3.5);
   arms.forEach((a,i)=>{if(a.back)arm(a,t,seed,attack,i);});
   p.save();p.translate(0,30);p.rotate(Math.sin(t*.29+seed)*.008);
   const breath=Math.sin(t*TAU/6.4+seed);p.scale(1+breath*.009,1+breath*.006);
   if(view==='left')p.scale(-1,1);
   p.drawImage(textures[view==='front'?5:0],-148,-364,296,444);p.restore();
   arms.forEach((a,i)=>{if(!a.back)arm(a,t,seed,attack,i);});
   // Water drains from raised arms under gravity, with staggered release times.
   p.lineCap='round';
   const points=[[-210,-235],[196,-246],[-245,-65],[223,-78],[-74,-174],[88,-158]];
   points.forEach(([x,y],j)=>{for(let k=0;k<7;k++){
    const age=((t*.65+j*.31+k*.23)%1.55),dx=x+Math.sin(t*.7+j)*15+Math.sin(j*3+k)*age*13,dy=y+age*age*150;
    if(dy>0)continue;
    p.globalAlpha=(1-age/1.55)*.60;p.strokeStyle='#c1dde2';p.lineWidth=.85+(j%2)*.45;
    p.beginPath();p.moveTo(dx,dy);p.lineTo(dx-1,dy-5-age*8);p.stroke();
   }});
   p.restore();
   // Clip under the actual water line, then softly submerge the root joins.
   p.save();p.globalCompositeOperation='destination-in';
   const mask=p.createLinearGradient(0,463,0,497);mask.addColorStop(0,'#fff');mask.addColorStop(.38,'#ffffffdc');mask.addColorStop(1,'#fff0');
   p.fillStyle=mask;p.fillRect(0,0,1700,650);p.restore();
  }
  function draw(c,t,{x=0,y=0,scale=1,rise=1,opacity=1,seed=0,distant=false,attack=null,view='left'}={}){
   if(!textures||rise<=0)return false;
   render(t,rise,seed,attack,view);
   c.save();c.translate(x,y);c.scale(scale,scale);c.globalAlpha=opacity;
   if(distant)c.filter='saturate(.68) contrast(.90)';
   // A shallow tidal pool connects the submerged joins to the shoreline.
   const water=c.createRadialGradient(0,12,18,0,12,360);water.addColorStop(0,'#0b343de8');water.addColorStop(.65,'#165365c2');water.addColorStop(1,'#345d6500');
   c.save();c.scale(1,.19);c.fillStyle=water;c.beginPath();c.arc(0,63,360,0,TAU);c.fill();c.restore();
   c.drawImage(plate,-1000,-475);c.filter='none';
   // Broader broken wakes follow the heavier arm sweeps, with staggered spray fans.
   for(let j=0;j<12;j++){
    const a=t*.37+j*.63,r=170+(j*19+t*29)%175;
    c.strokeStyle=`rgba(199,224,225,${rise*(.15+(j%3)*.035)})`;c.lineWidth=1.6+j%2;
    c.beginPath();c.ellipse(Math.sin(a)*8,6+j*2.6,r,r*.057,0,.08+j*.21,2.6+j*.21);c.stroke();
   }
   for(let j=0;j<56;j++){
    const age=(t*.72+j*.381)%1.7,side=j%2?-1:1,px=side*(85+j%9*22)+Math.sin(j*15)*age*55;
    const py=7-(45+j%5*12)*age+58*age*age;
    if(py>31)continue;
    c.globalAlpha=opacity*rise*(1-age/1.7)*.60;c.fillStyle='#c7e0e3';c.beginPath();c.ellipse(px,py,1.35+j%3*.3,2.9+j%3*.6,side*.3,0,TAU);c.fill();
   }
   for(let side=-1;side<=1;side+=2){
    const age=(t+seed*.35+(side<0?1.5:4.2))%5.8;
    if(age>1.65)continue;
    const fade=smooth(age/.15)*(1-smooth((age-.6)/1.05)),origin=side*245;
    c.lineCap='round';
    for(let j=0;j<24;j++){
     const n=j/23,vx=side*(15+n*60)+Math.sin(j*4.1)*22,vy=-(75+Math.sin(j*2.7)**2*83);
     const px=origin+vx*age,py=12+vy*age+103*age*age;
     if(py>30)continue;
     const old=Math.max(0,age-.07),tailX=origin+vx*old,tailY=12+vy*old+103*old*old;
     c.globalAlpha=opacity*rise*fade*(.31+n*.24);c.strokeStyle='#d1e8eb';c.lineWidth=1.2+(j%4)*.48;
     c.beginPath();c.moveTo(tailX,tailY);c.quadraticCurveTo((px+tailX)*.5,Math.min(py,tailY)-2,px,py);c.stroke();
    }
    // A translucent spray plume dissolves into droplets instead of a solid shape.
    c.globalAlpha=opacity*rise*fade*.18;
    const mist=c.createRadialGradient(origin+side*age*26,9-age*26,2,origin+side*age*26,9-age*26,35+age*30);
    mist.addColorStop(0,'#d3e8eb');mist.addColorStop(.4,'#a7cbd480');mist.addColorStop(1,'#9ec6d000');
    c.fillStyle=mist;c.beginPath();c.ellipse(origin+side*age*26,9-age*26,42+age*29,25+age*20,side*.3,0,TAU);c.fill();
   }
   c.restore();return true;
  }
  function impact(c,t,targets,phase,skill,origin,scale){
   if(phase<.56||phase>.98)return;
   const travel=smooth((phase-.58)/.16),power=smooth((phase-.56)/.02)*(1-smooth((phase-.72)/.24));
   c.save();c.lineCap='round';
   if(power>0)for(let i=0;i<targets.length;i++){
    const q=targets[i],ordered=[...targets].sort((a,b)=>a.y-b.y),base=i<targets.length/2?ordered[0]:ordered.at(-1),sx=base.x+18,sy=base.y+12,dx=q.x-sx,dy=q.y-sy,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    const point=f=>({x:sx+dx*f+nx*Math.sin(f*Math.PI)*18,y:sy+dy*f+ny*Math.sin(f*Math.PI)*18});
    const head=point(travel),grad=c.createLinearGradient(sx,sy,head.x,head.y);grad.addColorStop(0,'#174e6700');grad.addColorStop(.45,'#347e96b0');grad.addColorStop(1,'#c9f0e9');
    c.globalAlpha=power*.44;c.fillStyle=grad;c.beginPath();
    for(const side of [1,-1])for(let j=0;j<=24;j++){
     const f=(side===1?j/24:1-j/24)*travel,p=point(f),width=(8+f*27)*(1+.16*Math.sin(f*21-t*11+i));
     const x=p.x+nx*width*side,y=p.y+ny*width*side;if(side===1&&j===0)c.moveTo(x,y);else c.lineTo(x,y);
    }c.closePath();c.fill();
    c.globalAlpha=power*.8;c.strokeStyle='#d3eeea';c.lineWidth=2.3;c.beginPath();
    for(let j=0;j<=22;j++){const r=(j/22-.5)*2,spread=8+travel*27,x=head.x+nx*r*spread-dx/len*(1-r*r)*12,y=head.y+ny*r*spread-dy/len*(1-r*r)*12+Math.sin(j*1.7+t*9)*2;j?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
   }
   c.restore();
   if(phase<.50)return;
   const progress=clamp((phase-.58)/.40),flash=smooth((phase-.50)/.08)*(1-smooth((phase-.68)/.30));
   c.save();c.lineCap='round';
   for(let i=0;i<targets.length;i++){
    const q=targets[i],radius=18+progress*(skill?110:65);
    c.strokeStyle='rgba(186,235,238,'+(flash*.65)+')';c.lineWidth=3*(1-progress)+.5;
    c.beginPath();c.ellipse(q.x,q.y+25,radius,radius*.24,-.25,0,TAU);c.stroke();
    for(let j=0;j<(skill?22:12);j++){
     const a=j*2.399+i*.7,speed=35+j%6*12,age=progress*.9,px=q.x+Math.cos(a)*speed*age,py=q.y+12-Math.sin(a)**2*150*age+175*age*age;
     c.globalAlpha=flash*(1-progress)*.8;c.fillStyle=j%3?'#9cd7df':'#edf7ee';c.beginPath();c.ellipse(px,py,1.6+j%3,3.5+j%3,a,0,TAU);c.fill();
    }
   }
   c.restore();
  }
  return {load,draw,impact};
 };
})();
