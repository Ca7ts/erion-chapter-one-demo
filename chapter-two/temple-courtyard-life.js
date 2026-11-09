/* Uses the approved Chapter I soft flame; scenery itself stays still. */
window.TempleCourtyardLife=(()=>{const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function ellipse(g,x,y,rx,ry,fill){g.fillStyle=fill;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();}
function glow(g,x,y,r,color,alpha){g.save();g.globalCompositeOperation='screen';const grad=g.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color+Math.round(clamp(alpha,0,1)*255).toString(16).padStart(2,'0'));grad.addColorStop(1,color+'00');g.fillStyle=grad;g.fillRect(x-r,y-r,r*2,r*2);g.restore();}
 function courtFlame(g,x,y,size,seed,time){
  const t=time+seed*2.731,base=y-2,w=size*.62,h=size*1.65;
  glow(g,x,base-h*.28,size*3.2,'#ff862f',.18);
  glow(g,x,base-h*.38,size*1.15,'#ff9d36',.16);
  g.save();g.beginPath();g.rect(x-w*1.4,base-h*1.8,w*2.8,h*1.8+2);g.clip();
  // Ember bed stays within the bowl, below the rising tongues.
  ellipse(g,x,base,w*.85,size*.12,'#bd3d1390');
  for(let layer=0;layer<2;layer++){
   g.save();g.globalAlpha=layer?.65:.78;g.filter='blur('+Math.max(1.1,size*(layer?.055:.10))+'px)';
   for(let i=0;i<6;i++){
    const bx=x+(i-2.5)*w*.30,ww=w*(layer?.23:.35),hh=h*(.44+.17*Math.sin(t*5.3+i*1.7)+.12*Math.sin(t*9.1+i*2.3)+.30*(1-Math.abs(i-2.5)/3)),lean=w*(.18*Math.sin(t*4.2+i)+.12*Math.sin(t*7.1+i*2));
    const grad=g.createLinearGradient(0,base-hh,0,base);grad.addColorStop(0,'#ed4c0900');grad.addColorStop(.18,'#f65b1980');grad.addColorStop(.55,layer?'#ffdc64d0':'#ff8a25d0');grad.addColorStop(1,layer?'#ffeb98ee':'#f36c16e0');g.fillStyle=grad;
    g.beginPath();g.moveTo(bx-ww,base);g.bezierCurveTo(bx-ww*1.4,base-hh*.3,bx+lean-ww,base-hh*.6,bx+lean,base-hh);g.bezierCurveTo(bx+lean+ww*.5,base-hh*.7,bx+ww*1.5,base-hh*.25,bx+ww,base);g.closePath();g.fill();
   }g.restore();
  }
  g.restore();
 }

const bowls=[[65,236,18],[230,428,24],[360,294,15],[443,269,22],[677,310,15]];
// Only the small pool contains moving water. Keep full HD scenery out of its scratch buffer.
const WATER_BOX={x:1115,y:480,w:370,h:160};let mask=null,water=null,waterSource=null;
function prepare(im){const b=WATER_BOX,c=document.createElement('canvas');c.width=b.w;c.height=b.h;const q=c.getContext('2d',{willReadFrequently:true});q.drawImage(im,-b.x,-b.y,1536,1024);const d=q.getImageData(0,0,b.w,b.h);for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){const i=(y*b.w+x)*4,r=d.data[i],g=d.data[i+1],blue=d.data[i+2],wx=x+b.x,wy=y+b.y;d.data[i+3]=(wx>1125&&wx<1480&&wy>492&&wy<625&&blue>r*1.13&&g>r*1.07)?210:0;}q.putImageData(d,0,0);mask=c;water=document.createElement('canvas');water.width=b.w;water.height=b.h;waterSource=im;}
function drawWater(g,t,im){if(!im)return;if(!mask||waterSource!==im)prepare(im);const b=WATER_BOX,q=water.getContext('2d');q.clearRect(0,0,b.w,b.h);q.globalCompositeOperation='source-over';q.globalAlpha=.42;q.drawImage(mask,Math.sin(t*.18)*2.2,Math.cos(t*.15)*.9);q.globalAlpha=1;for(let i=0;i<9;i++){const x=1160+i*31+Math.sin(t*.17+i)*6-b.x,y=535+(i%3)*19-b.y;glow(q,x,y,10,'#b4e7ec',.025+.025*Math.sin(t*.32+i));}q.globalCompositeOperation='destination-in';q.drawImage(mask,0,0);q.globalCompositeOperation='source-over';g.save();g.globalAlpha=.45;g.drawImage(water,b.x,b.y);g.restore();}
function actors(t,restored){return restored?bowls.map(([x,y,size],i)=>({y:y*2+12,draw:ctx=>courtFlame(ctx,x*2,y*2,size*1.3,i,t)})):[];}
return {drawWater,actors,bowls};})();
