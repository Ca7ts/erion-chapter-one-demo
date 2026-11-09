/* One shared, screen-readable destination plaque for both chapters. */
window.MythicWayfinding=(()=>{'use strict';
 const plate=new ChapterImage();plate.decoding='async';plate.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/ui/mythic-road-sign-r27.webp';
 let occupied=[];const audit=[];
 const begin=ctx=>{occupied=[];audit.length=0;if(!ctx)return;const stage=ctx.canvas.getBoundingClientRect();for(const id of ['region-minimap','minimap','place-name','mobile-joystick']){const el=document.getElementById(id);if(!el||!el.getClientRects().length)continue;const r=(id==='mobile-joystick'?el:el.parentElement||el).getBoundingClientRect();if(r.width>stage.width*.6)continue;occupied.push({x:r.x-stage.x-6,y:r.y-stage.y-6,w:r.width+12,h:r.height+12});}};
 function draw(ctx,{text,x,y,active=false,direction=0}){
  const t=ctx.getTransform(),rect=ctx.canvas.getBoundingClientRect(),ratio=ctx.canvas.width/Math.max(1,rect.width),vw=rect.width,vh=rect.height;
  if(!vw||!vh)return {x,y,w:0,h:0};
  const det=t.a*t.d-t.b*t.c;if(!det)return {x,y,w:0,h:0};
  const toWorld=(sx,sy)=>{const px=sx*ratio-t.e,py=sy*ratio-t.f;return {x:(t.d*px-t.c*py)/det,y:(-t.b*px+t.a*py)/det};};
  let cx=(t.a*x+t.c*y+t.e)/ratio,cy=(t.b*x+t.d*y+t.f)/ratio-22;
  ctx.save();ctx.setTransform(ratio,0,0,ratio,0,0);
  const font=vw<600?16:17;ctx.font='700 '+font+'px "Microsoft JhengHei", "PingFang TC", sans-serif';
  const w=Math.min(vw-16,Math.max(202,ctx.measureText(text).width+100)),h=Math.max(60,w/3);
  cx=Math.max(w/2+8,Math.min(vw-w/2-8,cx));cy=Math.max(h/2+8,Math.min(vh-h/2-8,cy));
  // Clamp labels in screen space so zooming never makes exits unreadable/offscreen.
  let box={x:cx-w/2,y:cy-h/2,w,h};
  const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const candidates=[box,...occupied.flatMap(other=>[{...box,y:other.y+other.h+4},{...box,y:other.y-h-4}])];
  const free=candidates.filter(b=>b.y>=8&&b.y+b.h<=vh-8&&!occupied.some(o=>overlaps(b,o))).sort((a,b)=>Math.abs(a.y-box.y)-Math.abs(b.y-box.y));
  if(free.length)box=free[0];
  cx=box.x+w/2;cy=box.y+h/2;
  if(plate.complete&&plate.naturalWidth)ctx.drawImage(plate,box.x,box.y,w,h);
  else{ctx.fillStyle='#10191f';ctx.strokeStyle='#d7ae5c';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(box.x+3,box.y+8,w-6,h-16,5);ctx.fill();ctx.stroke();}
  if(active){ctx.strokeStyle='#fff1bb';ctx.lineWidth=1.4;ctx.beginPath();ctx.roundRect(box.x+14,box.y+h*.24,w-28,h*.48,5);ctx.stroke();}
  // Engraved direction marker plus live Chinese text; no baked lettering.
  const arrowX=box.x+w*.17,baseline=box.y+h*.49;
  ctx.save();ctx.translate(arrowX,baseline);ctx.rotate(direction);ctx.fillStyle=active?'#fff2bd':'#d8bd80';ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-5,-4);ctx.lineTo(-2,0);ctx.lineTo(-5,4);ctx.closePath();ctx.fill();ctx.restore();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle='#090c10';ctx.strokeText(text,cx+9,baseline,w*.60);ctx.fillStyle=active?'#fff5cf':'#fff0c1';ctx.fillText(text,cx+9,baseline,w*.60);
  ctx.restore();occupied.push(box);audit.push({text,...box,active});
  const a=toWorld(box.x,box.y),b=toWorld(box.x+w,box.y+h);
  return {x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(b.x-a.x),h:Math.abs(b.y-a.y)};
 }
 return {begin,draw,get diagnostics(){return audit.map(v=>({...v}));}};
})();
