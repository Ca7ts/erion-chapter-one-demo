/* Nursery outlet: quiet retained water behind the masonry, small leaks below it. */
window.ReefRetainingWater=(()=>{
 const tau=Math.PI*2;
 function time(){return document.getElementById('motion-toggle')?.getAttribute('aria-pressed')==='false'||matchMedia('(prefers-reduced-motion: reduce)').matches?0:performance.now()/1000*.09;}
 let seep=null;
 function unlock(){if(!seep){seep=new Audio('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/world-loops-v1/W01.wav');seep.loop=true;seep.volume=0;}seep.play().catch(()=>{});}
 function audio(dt,area,player,enabled,speaking){
  if(!seep)return;
  const distance=Math.hypot(Math.max(1020-player.x,0,player.x-1385),Math.max(451-player.y,0,player.y-577));
  const proximity=Math.max(0,1-distance/230)**2,t=time();
  const pulse=[0,1,2].reduce((sum,i)=>sum+.52+.48*Math.sin(t*1.25+i*2.3)**2,0)/3;
  const target=enabled&&!document.hidden&&area==='reef'?proximity*.62*pulse*(speaking?.07:1):0;
  seep.volume+=(target-seep.volume)*Math.min(1,dt*(speaking?14:4));
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&seep){seep.volume=0;seep.pause();}else if(seep)seep.play().catch(()=>{});});
 window.addEventListener('pagehide',()=>seep?.pause());
 let riverMask=null,riverLayer=null,riverInk=null,seaPixels=null,sampleSource=null,sampledBackground=null;
 function waterBackground(){
  const source=window.WorldProps?.background('c2:reef');if(!source)return null;
  if(source!==sampleSource){
   // HD backgrounds may be Images, not canvases. Read pixels from a separate
   // world-coordinate copy so shoreline masks still match the 1536 x 1024 map.
   const copy=document.createElement('canvas');copy.width=1536;copy.height=1024;
   copy.getContext('2d',{willReadFrequently:true}).drawImage(source,0,0,1536,1024);
   sampledBackground=copy;sampleSource=source;riverMask=null;seaPixels=null;
  }
  return sampledBackground;
 }
 let riverTick=-1;function river(c){
  const bg=waterBackground();if(!bg)return;
  if(!riverMask){
   riverMask=document.createElement('canvas');riverMask.width=306;riverMask.height=610;
   riverLayer=document.createElement('canvas');riverLayer.width=306;riverLayer.height=610;riverInk=document.createElement('canvas');riverInk.width=306;riverInk.height=610;
   const q=riverMask.getContext('2d',{willReadFrequently:true});q.drawImage(bg,1230,390,306,610,0,0,306,610);
   const data=q.getImageData(0,0,306,610);
   // Water-colour mask preserves the actual irregular rock edges and submerged stones.
   for(let i=0;i<data.data.length;i+=4){const r=data.data[i],g=data.data[i+1],b=data.data[i+2];data.data[i]=data.data[i+1]=data.data[i+2]=255;data.data[i+3]=Math.round(255*Math.max(0,Math.min(1,(Math.min(g,b)-r-7)/26)));}q.putImageData(data,0,0);
  }
  const tick=Math.floor(time()/.0045);if(riverTick===tick){c.drawImage(riverLayer,1230,390);return;}riverTick=tick;const t=time(),q=riverInk.getContext('2d',{willReadFrequently:true});q.clearRect(0,0,306,610);q.globalCompositeOperation='source-over';q.lineCap='round';
  // Centreline follows the winding channel; smooth lane offsets bend round its reefs.
  const route=[[190,0],[165,95],[120,180],[108,245],[172,340],[180,410],[236,500],[292,610]];
  function point(y,lane){let j=0;while(j<route.length-2&&y>route[j+1][1])j++;const a=route[j],b=route[j+1],u=Math.max(0,Math.min(1,(y-a[1])/(b[1]-a[1]))),s=u*u*(3-2*u);return a[0]+(b[0]-a[0])*s+lane*(.75+.25*Math.sin(y*.019));}
  for(let i=0;i<54;i++){
   const phase=(t*.045+i*.137)%1,y=phase*610,lane=(i%5-2)*17,alpha=.5*Math.sin(phase*Math.PI)*(.22+.15*Math.sin(t+i)**2);
   q.strokeStyle=`rgba(177,239,228,${alpha})`;q.lineWidth=3.5+i%3;q.beginPath();q.moveTo(point(y,lane),y);q.bezierCurveTo(point(y+9,lane),y+9,point(y+23,lane),y+23,point(y+33,lane),y+33);q.stroke();
  }
  // Blur the composed ripple layer once, then apply the shoreline mask.
  const soft=riverLayer.getContext('2d',{willReadFrequently:true});soft.clearRect(0,0,306,610);soft.filter='blur(2.55px)';soft.drawImage(riverInk,0,0);soft.filter='none';soft.globalCompositeOperation='destination-in';soft.drawImage(riverMask,0,0);soft.globalCompositeOperation='source-over';c.drawImage(riverLayer,1230,390);
 }
 const fishSprites=new Map();
 function nurseryFish(c){
  const t=time();c.save();
  // Confined to clear interior lanes, well behind the dam and away from coral beds.
  const fish=[[1000,416,33,5,5.5],[1048,423,30,5,6],[1080,415,26,4,5],[1112,431,25,6,6.5],[980,433,22,4,5]];
  for(let i=0;i<fish.length;i++){
   const [cx,cy,rx,ry,size]=fish[i],a=t*.55+i*1.7,x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry;
   const heading=Math.atan2(Math.cos(a)*ry,-Math.sin(a)*rx);
   c.save();c.translate(x,y);c.rotate(heading);c.globalAlpha=.46;
   const key=i+':'+Math.floor((t*7+i)%(Math.PI*2)/(Math.PI*2)*16);let sprite=fishSprites.get(key);
   if(!sprite){sprite=document.createElement('canvas');sprite.width=32;sprite.height=24;const output=c;c=sprite.getContext('2d',{willReadFrequently:true});c.translate(18,12);c.filter='blur(.5px)';
   c.fillStyle='#285b60';c.beginPath();c.ellipse(0,0,size,size*.31,0,0,tau);c.fill();
   const wag=Math.sin(t*7+i)*size*.13;c.beginPath();c.moveTo(-size*.8,0);c.lineTo(-size*1.45,-size*.42+wag);c.quadraticCurveTo(-size*1.2,wag,-size*1.45,size*.42+wag);c.closePath();c.fill();
   c.fillStyle='rgba(125,191,176,.4)';c.beginPath();c.ellipse(size*.15,-size*.1,size*.55,size*.11,0,0,tau);c.fill();c=output;fishSprites.set(key,sprite);}c.drawImage(sprite,-18,-12);c.restore();
  }
  c.restore();
 }
 function seaGlints(c){
  const bg=waterBackground();if(!bg)return;
  if(!seaPixels)seaPixels=bg.getContext('2d',{willReadFrequently:true}).getImageData(1230,120,306,100).data;
  const t=time();c.save();c.globalCompositeOperation='screen';
  // Distant open sea only; no highlights on sky, shoreline or foreground rocks.
  for(let i=0;i<16;i++){
   const phase=(t*.18+i*.381)%1;if(phase>.24)continue;
   const glow=Math.sin(phase/.24*Math.PI)**2,x=1265+(i*43%265),y=151+(i*7%16);
   const pixel=((y-120)*306+x-1230)*4;if(seaPixels[pixel+2]<seaPixels[pixel]+12)continue;
   c.filter='blur(1.6px)';c.strokeStyle=`rgba(255,238,184,${glow*.45})`;c.lineWidth=2;
   c.beginPath();c.moveTo(x-4,y);c.quadraticCurveTo(x,y-1,x+5+i%4,y);c.stroke();
  }c.restore();
 }
 const poolInk=document.createElement('canvas');poolInk.width=360;poolInk.height=145;const poolSoft=poolInk.cloneNode();
 function before(c,p){
  // Fish and channel have their own tightly bounded cached layers.
  const t=time();c.save();
  // This contour follows only the existing nursery water, not the reef banks.
  c.beginPath();c.moveTo(905,416);c.bezierCurveTo(975,386,1120,400,1184,441);c.lineTo(1234,492);c.lineTo(1180,525);c.bezierCurveTo(1100,501,984,473,905,447);c.closePath();c.clip();
  const wash=c.createRadialGradient(1090,460,12,1090,460,155);wash.addColorStop(0,'rgba(49,179,175,.19)');wash.addColorStop(1,'rgba(29,134,145,0)');c.fillStyle=wash;c.fillRect(890,390,360,145);
  const q=poolInk.getContext('2d',{willReadFrequently:true});q.clearRect(0,0,360,145);q.save();q.translate(-890,-390);
  q.lineCap='round';

  for(let i=0;i<20;i++){const phase=(t*.16+i*.173)%1,x=920+(i*67%270)+Math.sin(t*.7+i)*5,y=410+(i*19%85)+phase*16,pulse=Math.sin(phase*Math.PI);q.strokeStyle=`rgba(192,242,224,${.04+.14*pulse})`;q.lineWidth=2.3;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x+20,y-4-Math.sin(t+i)*2,x+43,y+1);q.stroke();}
  q.restore();const soft=poolSoft.getContext('2d',{willReadFrequently:true});soft.clearRect(0,0,360,145);soft.filter='blur(1.8px)';soft.drawImage(poolInk,0,0);c.drawImage(poolSoft,890,390);
  c.filter='none';
  c.restore();
 }
 const leakPatches=Array.from({length:3},()=>{const c=document.createElement('canvas');c.width=96;c.height=100;return c;});
 function after(c,p){
  const t=time();c.save();
  // Wet foundation is clipped to the stone silhouette, never a floating oval.
  if(!p.wetFoundation){const mask=document.createElement('canvas');mask.width=p.im.width;mask.height=p.im.height;const q=mask.getContext('2d',{willReadFrequently:true});q.drawImage(p.im,0,0);q.globalCompositeOperation='source-atop';const g=q.createLinearGradient(0,mask.height*.7,0,mask.height);g.addColorStop(0,'rgba(13,68,63,0)');g.addColorStop(1,'rgba(13,68,63,.6)');q.fillStyle=g;q.fillRect(0,mask.height*.7,mask.width,mask.height*.3);p.wetFoundation=mask;}
  c.drawImage(p.wetFoundation,p.x,p.y,p.w,p.h);
  c.globalAlpha=.5;
  // Three low-volume fissures emerge at the downstream foot; no waterfall.
  const output=c;const leaks=[[.43,.93,9,24],[.63,.92,12,29],[.78,.87,9,25]];
  for(let i=0;i<leaks.length;i++){
   const [u,v,dx,dy]=leaks[i],x=p.x+p.w*u,y=p.y+p.h*v,flow=.52+.48*Math.sin(t*1.25+i*2.3)**2;
   c=leakPatches[i].getContext('2d',{willReadFrequently:true});c.clearRect(0,0,96,100);c.save();c.translate(24-x,12-y);c.globalAlpha=.5;c.lineCap='round';const sway=Math.sin(t*2.1+i)*1.8;
   c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+1+sway,y+8,x+dx-4+sway,y+dy,x+dx,y+dy);
   c.filter='blur(3px)';c.strokeStyle=`rgba(98,196,194,${.45*flow})`;c.lineWidth=9;c.stroke();
   c.filter='blur(1.3px)';c.strokeStyle=`rgba(216,249,243,${.73*flow})`;c.lineWidth=3.2;c.stroke();
   // Small travelling glints carry motion down each seam, with no hard white core.
   for(let k=0;k<2;k++){const f=(t*1.4+k*.5+i*.23)%1;c.fillStyle=`rgba(232,255,246,${Math.sin(f*Math.PI)*.65})`;c.beginPath();c.ellipse(x+dx*f+sway*Math.sin(f*Math.PI),y+dy*f,2,3,0,0,tau);c.fill();}
   c.filter='blur(2px)';
   for(let k=0;k<3;k++){const phase=(t*.65+k/3+i*.17)%1;c.globalAlpha=(1-phase)*.24*flow;c.strokeStyle='#caf3e7';c.lineWidth=2.8;c.beginPath();c.ellipse(x+dx+phase*6,y+dy+phase*6,4+phase*17,2+phase*4,.12,.3+i,Math.PI*1.45+i);c.stroke();}c.globalAlpha=.5;
   const bloom=c.createRadialGradient(x+dx,y+dy,1,x+dx,y+dy,16);bloom.addColorStop(0,`rgba(174,230,218,${.22*flow})`);bloom.addColorStop(1,'rgba(174,230,218,0)');c.fillStyle=bloom;c.fillRect(x+dx-16,y+dy-16,32,32);c.filter='none';c.restore();output.drawImage(leakPatches[i],x-24,y-12);
  }
  c=output;c.restore();
 }
 // These approved currents run at 9% real-time speed. Refresh only their small
 // transparent layers at 20 Hz; hero movement and input keep the full frame clock.
 const layers=new Map();
 function cachedWater(c,p,kind,paint){
  const b=kind==='fish'?{x:940,y:400,w:245,h:58}:kind==='before'?{x:890,y:390,w:360,h:145}:{x:Math.floor(p.x)-8,y:Math.floor(p.y)-8,w:Math.ceil(p.w)+70,h:Math.ceil(p.h)+70};
  const tick=Math.floor(time()/ .0045),signature=[p.x,p.y,p.w,p.h].join(':'),source=window.WorldProps?.background('c2:reef');let layer=layers.get(kind);
  if(!layer||layer.signature!==signature||layer.source!==source){const canvas=document.createElement('canvas');canvas.width=b.w;canvas.height=b.h;layer={canvas,signature,source,tick:-1};layers.set(kind,layer);}
  if(layer.tick!==tick){const q=layer.canvas.getContext('2d',{willReadFrequently:true});q.clearRect(0,0,b.w,b.h);q.save();q.translate(-b.x,-b.y);paint(q,p);q.restore();layer.tick=tick;}
  c.drawImage(layer.canvas,b.x,b.y);
 }
 const glints=document.createElement('canvas');glints.width=306;glints.height=100;let glintTick=-1;
 function smallGlints(c){const tick=Math.floor(time()/.0045);if(glintTick!==tick){const q=glints.getContext('2d',{willReadFrequently:true});q.clearRect(0,0,306,100);q.save();q.translate(-1230,-120);seaGlints(q);q.restore();glintTick=tick;}c.drawImage(glints,1230,120);}
 return {before:(c,p)=>{smallGlints(c);river(c);cachedWater(c,p,'fish',nurseryFish);cachedWater(c,p,'before',before);},after:(c,p)=>cachedWater(c,p,'after',after),unlock,audio};
})();

