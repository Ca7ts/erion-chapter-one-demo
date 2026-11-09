(() => {
 'use strict';
 const clamp=v=>Math.max(0,Math.min(1,v)),TAU=Math.PI*2;
 let atlas;
 function warm(){
  if(atlas)return;
  atlas=new ChapterImage();atlas.src=new URL('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/media/forge/salvage-debris.webp',document.baseURI).href;
 }
 const path=(ctx,pts)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));};
 function animate(stage){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return ()=>{};
  warm();const canvas=document.createElement('canvas');canvas.className='altar-rift';stage.append(canvas);
  const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return ()=>{};}
  const bounds=stage.getBoundingClientRect(),w=Math.max(1,bounds.width),h=Math.max(1,bounds.height),dpr=Math.min(1.6,window.devicePixelRatio||1);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.scale(canvas.width/w,canvas.height/h);
  const cx=w*.5,cy=h*.45,reach=Math.hypot(w,h)*.61;
  let seed=7919;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const chips=Array.from({length:34},(_,i)=>({a:i*2.4+(random()-.5)*.42,dy:.56+random()*.47,
   delay:random()*.085,speed:i<6?.44+random()*.36:.58+random()*.67,spin:(random()-.5)*4,size:i<6?26+random()*18:7+random()*13,frame:i%4}));
  const veins=Array.from({length:9},(_,n)=>{
   const a=n*TAU/9+(random()-.5)*.4,points=[[0,0]],len=reach*(.30+random()*.57);
   for(let j=1;j<=7;j++){const r=len*j/7,bend=(random()-.5)*len*.18;points.push([Math.cos(a)*r-Math.sin(a)*bend,(Math.sin(a)*r+Math.cos(a)*bend)*.72]);}
   const b=points[3],branch=[b,[b[0]+len*.09*Math.cos(a+.9),b[1]+len*.09*Math.sin(a+.9)],[b[0]+len*.31*Math.cos(a+.75),b[1]+len*.27*Math.sin(a+.75)]];
   return {points,branch,lag:random()*.05};});
  const dust=Array.from({length:58},()=>({a:random()*TAU,d:.3+random()*.85,t:random()*.10,r:random()*1.4+.45}));
  const started=performance.now();let frame;
  function draw(now){
   const t=(now-started)/1000;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(cx,cy);
   if(t<.34){
    const charge=clamp(t/.24);ctx.save();ctx.globalAlpha=charge*(1-clamp((t-.24)/.09));
    let g=ctx.createRadialGradient(0,2,0,0,2,Math.max(20,h*.31));g.addColorStop(0,'#ffe797');g.addColorStop(.16,'#ff542dc4');g.addColorStop(.55,'#be162a44');g.addColorStop(1,'#9d0b1700');
    ctx.fillStyle=g;ctx.fillRect(-w,-h,w*2,h*2);ctx.restore();
   }
   if(t>.24&&t<.77){
    const v=clamp((t-.24)/.53),r=h*(.23+.7*v);
    const ember=ctx.createRadialGradient(0,0,0,0,0,r);
    ember.addColorStop(0,'#fff5ce');ember.addColorStop(.13,'#ffab54c7');ember.addColorStop(.41,'#da45276e');ember.addColorStop(1,'#4c0c2700');
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.sin(Math.PI*Math.sqrt(v))*(1-v)*.9;
    ctx.fillStyle=ember;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore();
   }
   for(const v of veins){
    const q=(t-.14-v.lag)/.37;if(q<=0||q>=1.55)continue;ctx.globalAlpha=clamp(q*7)*(1-clamp((q-.6)/.95));
    const pts=v.points.slice(0,Math.max(2,Math.ceil(clamp(q*1.7)*8)));
    for(const line of [pts,...(q>.36?[v.branch]:[])]){
     path(ctx,line);ctx.lineJoin='bevel';ctx.shadowBlur=9;ctx.shadowColor='#ff622c';ctx.lineWidth=4;ctx.strokeStyle='#ff8f47';ctx.stroke();ctx.shadowBlur=0;
     ctx.lineWidth=2.7;ctx.strokeStyle='#160e20';ctx.stroke();
    }
   }
   ctx.globalAlpha=1;
   for(let n=0;n<3;n++){const q=(t-.26-.080*n)/.49;if(q<=0||q>=1)continue;
    const radius=6+reach*(1-(1-q)**2);
    for(let k=0;k<7;k++){
     const start=k*TAU/7+.17*n,end=start+.61+.11*Math.sin(3*k+n),wave=[];
     for(let j=0;j<=15;j++){const a=start+(end-start)*j/15,r=radius*(1+.024*Math.sin(a*7+n)+.011*Math.sin(a*15+q*4));
      wave.push([r*Math.cos(a),r*Math.sin(a)*(.54+n*.06)-r*Math.cos(a)*.065]);}
     path(ctx,wave);ctx.globalAlpha=(1-q)**2*(.28+.25*Math.cos(k*3)**2);
     ctx.lineWidth=3.3*(1-q)+.5;ctx.strokeStyle=n===1?'#ffe5b0':'#ff9661';ctx.shadowBlur=5;ctx.shadowColor='#ff562a';ctx.stroke();ctx.shadowBlur=0;
    }
   }
   for(const p of dust){const q=(t-.25-p.t)/.64;if(q<=0||q>=1)continue;
    const dist=reach*p.d*(1-(1-q)**2),x=Math.cos(p.a)*dist,y=Math.sin(p.a)*dist*.73;
    ctx.globalAlpha=(1-q)*.96;path(ctx,[[x*.86,y*.86],[x,y]]);ctx.strokeStyle='#ffd580';ctx.lineWidth=p.r;ctx.stroke();}
   for(const p of chips){const q=(t-.26-p.delay)/.71;if(q<=0||q>=1)continue;
    const z=q*(.40+1.36*q),r=reach*p.speed*z,x=Math.cos(p.a)*r,y=Math.sin(p.a)*r*p.dy+q*q*h*.08,sz=p.size*(.27+2.8*q);
    ctx.save();ctx.translate(x,y);ctx.globalAlpha=clamp(q*11)*(1-clamp((q-.69)/.31));
    const tail=ctx.createLinearGradient(-x*.31,-y*.31,0,0);tail.addColorStop(0,'#ff613000');tail.addColorStop(1,p.frame===2?'#ffe39abd':'#ff754bb8');
    ctx.strokeStyle=tail;ctx.lineWidth=sz*.16;path(ctx,[[-x*.31,-y*.31],[0,0]]);ctx.stroke();ctx.rotate(p.a+p.spin*q);
    if(atlas?.naturalWidth){const aw=atlas.naturalWidth/2,ah=atlas.naturalHeight/2;
     ctx.drawImage(atlas,(p.frame%2)*aw,(p.frame>>1)*ah,aw,ah,-sz/2,-sz/2,sz,sz);}
    else{ctx.fillStyle=p.frame%2?'#ffae59':'#d87870';path(ctx,[[-sz*.48,0],[0,-sz*.2],[sz*.48,0],[0,sz*.28]]);ctx.fill();}
    ctx.restore();}
   ctx.restore();if(t<1.08)frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);return ()=>{cancelAnimationFrame(frame);canvas.remove();};
 }
 window.LeonRift={warm,animate};
})();
