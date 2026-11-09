/* Shared touch artwork. Only the two shop entrances own a timed transition. */
(()=>{'use strict';
 const assetBase=document.currentScript?.src||document.baseURI;
 const images=new Map(),clamp=v=>Math.min(1,Math.max(0,v)),ease=v=>1-(1-clamp(v))**3;
 const styles={
  leon:{target:'private-dialog',light:'#ff823e',shade:'#db451c',lane:1},
  dolly:{target:'dolly-supplies',light:'#96ffc0',shade:'#228c62',lane:0}
 };
 const contact=60,burst=contact+100,enter=365,end=870;
 const gold={light:'#ffdc91',shade:'#ae722c',lane:4,compact:true};
 let active=null,clearPulse=null;
 function image(name){
  if(!images.has(name)){const i=new ChapterImage();i.src=new URL('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/media/forge/'+name+'.webp',assetBase).href;images.set(name,i);}
  return images.get(name);
 }
 const ready=i=>i.complete&&i.naturalWidth>0;
 function sprite(c,i,x,y,w,h,alpha,angle=0,row=0,rows=1,col=0,cols=1){
  if(alpha<=0||w<=0||h<=0||!ready(i))return;
  const sw=i.naturalWidth/cols,sh=i.naturalHeight/rows;
  c.save();c.globalAlpha*=clamp(alpha);c.translate(x,y);c.rotate(angle);
  c.drawImage(i,col*sw,row*sh,sw,sh,-w/2,-h/2,w,h);c.restore();
 }
 function paint(c,box,point,t,style){
  const time=t>=contact&&t<burst?contact:t,age=Math.max(0,time-burst),p=ease(time/contact);
  const power=1-clamp(age/560),x=point.x,y=point.y,w=box.width,h=box.height;
  const sigils=image('shop-sigils'),silk=image('rite-inflow-silk'),rifts=image('rite-inflow-rifts');
  const hand=image('shop-hand'),wave=image('rite-wave'),dust=image('rite-branch-motes');
  const k=.95+.05*(1-p),cx=box.left+w/2,cy=box.top+h/2;
  if(time<enter+100){
   c.save();c.translate(cx,cy);c.scale(k,k);c.translate(-cx,-cy);
   c.save();c.beginPath();c.arc(x,y,Math.max(3,Math.hypot(w,h)*(age?ease(age/190):.085*p)),0,Math.PI*2);c.clip();
   for(const edge of [-1,1]){
    const railY=cy+edge*(h*.5-4);
    sprite(c,silk,cx,railY,w,10,power,0,style.lane,5);
    sprite(c,sigils,cx,railY,w*.96,8,power*.95);
   }
   for(const edge of [-1,1])sprite(c,silk,cx+edge*(w*.5-3),cy,h,6,power*.85,Math.PI/2,style.lane,5);
   c.restore();c.restore();
   const glowSize=age?13+36*ease(age/200):17-10*p;
   const g=c.createRadialGradient(x,y,0,x,y,glowSize);
   g.addColorStop(0,'#ffffe4');g.addColorStop(.19,style.light);g.addColorStop(.55,style.shade+'85');g.addColorStop(1,'transparent');
   c.save();c.globalAlpha=power;c.fillStyle=g;c.fillRect(x-glowSize,y-glowSize,glowSize*2,glowSize*2);c.restore();
   if(ready(hand)&&!style.quick){
    const size=style.compact?Math.min(55,h*1.25):Math.min(115,Math.max(72,h*1.65)),height=size*hand.naturalHeight/hand.naturalWidth;
    const approach=(1-p)*9;
    sprite(c,hand,x+size*(.5-.108)+approach,y+height*(.5-.175)+approach,size,height,.79*(.45+.55*p)*(1-ease(age/170)));
   }
  }
  if(time<burst)return;
  const spread=ease(age/355),reach=Math.min(style.compact?78:210,w*.58+30);
  sprite(c,wave,x,y,reach*2*spread,reach*.92*spread,(1-spread)*.95);
  for(let i=0;i<6;i++){
   const angle=(i%2?Math.PI:0)+(i%3-1)*.32;
   const length=reach*(i%3===0?.96:.70)*ease(age/165);
   sprite(c,rifts,x+Math.cos(angle)*length*.49,y+Math.sin(angle)*length*.49,length,length*.20,(1-ease(age/315))*.94,angle,i%3,3);
  }
  for(let i=0;i<(style.compact?18:54);i++){
   const delay=(i%9)*9,u=clamp((age-delay)/(390+i%5*50));if(!u||u===1)continue;
   const side=i%2?1:-1,dx=side*reach*(.40+(i*47%101)/100)*ease(u);
   const dy=Math.sin(i*2.39996)*h*.9*Math.sin(u*Math.PI*.80)-Math.sin(u*Math.PI)*h*.26+h*.28*u*u;
   const size=(i%8===0?23:6)+(i%5)*2,alpha=Math.sin(Math.PI*u)**.65;
   sprite(c,dust,x+dx,y+dy,size,size,alpha,i*.67+side*u,0,2,2,3);
  }
 }
 function bind(button,kind){
  const style=styles[kind],open=button.onclick;button.dataset.shopEntry=kind;
  for(const name of ['shop-hand','shop-sigils','rite-inflow-rifts','rite-branch-motes','rite-inflow-silk','rite-wave'])image(name);
  button.onclick=event=>{
   if(active||button.disabled)return;
   if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.getElementById('motion-toggle')?.getAttribute('aria-pressed')==='false'){open.call(button,event);return;}
   const source=button.closest('dialog'),box=button.getBoundingClientRect();
   const x=event.detail?Math.max(box.left,Math.min(box.right,event.clientX)):box.left+box.width/2;
   const y=event.detail?Math.max(box.top,Math.min(box.bottom,event.clientY)):box.top+box.height/2;
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
   if(!ctx||!source?.open||box.width===0){open.call(button,event);return;}
   const ratio=Math.min(devicePixelRatio||1,1.6);
   const left=Math.max(0,box.left-290),top=Math.max(0,box.top-155);
   const width=Math.min(innerWidth,box.right+290)-left,height=Math.min(innerHeight,box.bottom+155)-top;
   canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
   canvas.setAttribute('aria-hidden','true');canvas.className='shop-entry-light';
   canvas.style.cssText='position:fixed;inset:auto;margin:0;border:0;padding:0;background:transparent;pointer-events:none;z-index:2147483647;overflow:visible';
   Object.assign(canvas.style,{left:left+'px',top:top+'px',width:width+'px',height:height+'px'});
   document.body.append(canvas);const topLayer=typeof canvas.showPopover==='function';
   if(topLayer){canvas.popover='manual';canvas.showPopover();}
   const start=performance.now(),wasInert=source.inert;let raf,opened=false,target,reveal,targetInert;
   const press=button.animate([{transform:'scale(1)',opacity:1,offset:0},{transform:'scale(.95)',opacity:1,offset:contact/enter},
    {transform:'scale(.95)',opacity:1,offset:burst/enter},{transform:'scale(.99)',opacity:.06,offset:1}],
    {duration:enter,fill:'forwards'});
   active=canvas;source.inert=true;
   function finish(){
    cancelAnimationFrame(raf);press.cancel();reveal?.cancel();
    if(!opened)source.inert=wasInert;
    if(target)target.inert=targetInert;
    document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',finish);
    canvas.remove();if(active===canvas)active=null;
   }
   function transfer(){
    if(opened)return;
    if(!source.open||!button.isConnected){finish();return;}
    source.inert=wasInert;opened=true;open.call(button,event);
    target=document.getElementById(style.target);
    if(!target?.open){target=null;finish();return;}
    targetInert=target.inert;target.inert=true;
    reveal=target.animate([{clipPath:'inset(0 49.5% 0 49.5%)'},{clipPath:'inset(0 0% 0 0%)'}],
     {duration:330,easing:'cubic-bezier(.18,.75,.25,1)'});
    if(topLayer){canvas.hidePopover();canvas.showPopover();}else target.append(canvas);
   }
   function hidden(){if(document.hidden)finish();}
   function tick(now){
    try{
     const elapsed=Math.max(0,now-start);
     if(!opened&&(!source.open||!button.isConnected)){finish();return;}
     if(elapsed>=enter)transfer();
     if(active!==canvas)return;
     if(elapsed>=end||opened&&!target?.open){finish();return;}
     ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(ratio,0,0,ratio,-left*ratio,-top*ratio);
     canvas.dataset.phase=elapsed<contact?'touch':elapsed<burst?'hold':elapsed<enter?'burst':'unfold';
     paint(ctx,box,{x,y},elapsed,style);raf=requestAnimationFrame(tick);
    }catch(err){try{if(!opened)transfer();}finally{finish();}console.error(err);}
   }
   document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',finish,{once:true});tick(start);
  };return button;
 }
 // Other UI controls execute their own handlers synchronously. Draw at the
 // original touch point even when that handler replaces an entire menu.
 function pulse(box,x,y,quick){
  clearPulse?.();
  if(active||document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches||
    document.getElementById('motion-toggle')?.getAttribute('aria-pressed')==='false')return;
  const canvas=document.createElement('canvas'),c=canvas.getContext('2d');
  if(!c)return;
  const left=Math.max(0,x-116),top=Math.max(0,y-84),width=Math.min(innerWidth-left,232),height=Math.min(innerHeight-top,168);
  if(width<=0||height<=0)return;
  const ratio=Math.min(devicePixelRatio||1,1.6);
  canvas.width=Math.ceil(width*ratio);canvas.height=Math.ceil(height*ratio);
  canvas.className='mythic-touch';canvas.setAttribute('aria-hidden','true');
  canvas.style.cssText='position:fixed;inset:auto;border:0;padding:0;margin:0;pointer-events:none;background:transparent;z-index:2147483647';
  Object.assign(canvas.style,{left:left+'px',top:top+'px',width:width+'px',height:height+'px'});
  if(canvas.showPopover){canvas.popover='manual';document.body.append(canvas);canvas.showPopover();}
  else (Array.from(document.querySelectorAll('dialog[open]')).pop()||document.body).append(canvas);
  let raf;const start=performance.now(),style=quick?{...gold,quick:true}:gold;
  function finish(){cancelAnimationFrame(raf);canvas.remove();clearPulse=null;document.removeEventListener('visibilitychange',finish);}
  function draw(now){
   const t=now-start,elapsed=quick?burst+t*3:t<burst?t:burst+(t-burst)*3;
   if(elapsed>=end||document.hidden){finish();return;}
   c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);
   c.setTransform(ratio,0,0,ratio,-left*ratio,-top*ratio);
   paint(c,box,{x,y},elapsed,style);raf=requestAnimationFrame(draw);
  }
  clearPulse=finish;document.addEventListener('visibilitychange',finish);draw(start);
 }
 window.ShopEntryFX={bind,pulse};
})();
