/* Pixel-alpha layers shared by both chapters. Background patches never act as selection geometry. */
window.WorldProps=(()=>{
 const catalog=window.WORLD_PROP_CATALOG, cache=new Map(),pending=new Map(),imageCache=new Map();
 const image=src=>{if(imageCache.has(src))return imageCache.get(src);const p=new Promise((ok,no)=>{const im=new ChapterImage();im.onload=()=>ok(im);im.onerror=()=>no(Error('物件素材載入失敗：'+src));im.src=src;});imageCache.set(src,p);return p;};
 const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);return c;};
 function source(im,r){return r?[im.width*r[0]/r[2],im.height*r[1]/r[3],im.width/r[2],im.height/r[3]]:[0,0,im.width,im.height];}
 const cropCache=new WeakMap(),rasterCache=new WeakMap(),atlasCache=new WeakMap();
 function sprite(im,d){
  if(d.sourceRect){
   let frames=atlasCache.get(im);if(!frames){frames=new Map();atlasCache.set(im,frames);}
   const key=d.sourceRect.join(',');let frame=frames.get(key);
   if(!frame){const [x,y,w,h]=d.sourceRect;frame=canvas(w,h);frame.getContext('2d').drawImage(im,x,y,w,h,0,0,w,h);frames.set(key,frame);}
   im=frame;
  }
  let rasters=rasterCache.get(im);if(!rasters){rasters=new Map();rasterCache.set(im,rasters);}const rasterKey=[Math.ceil(d.w*2),Math.ceil(d.h*2),!!d.flipX,d.asset==='small-crystal'].join(':');
  const saved=rasters.get(rasterKey);if(saved)return {...d,...saved,edges:new Map()};
  // Atlas frames retain their authored aspect and padding, just as in combat.
  let bounds=d.sourceRect?[0,0,im.width,im.height]:cropCache.get(im);
  if(!bounds){
  const scan=canvas(im.width,im.height),q=scan.getContext('2d',{willReadFrequently:true});q.drawImage(im,0,0);
  const a=q.getImageData(0,0,scan.width,scan.height).data;let l=scan.width,t=scan.height,r=-1,b=-1;
  for(let y=0;y<scan.height;y++)for(let x=0;x<scan.width;x++)if(a[(y*scan.width+x)*4+3]>40){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}
  if(r<l)throw Error('物件缺少可見像素：'+d.asset);
  bounds=[l,t,r-l+1,b-t+1];cropCache.set(im,bounds);
  }
  const c=canvas(d.w*2,d.h*2),g=c.getContext('2d',{willReadFrequently:true});if(d.flipX){g.translate(c.width,0);g.scale(-1,1);}g.drawImage(im,...bounds,0,0,c.width,c.height);
  const alpha=g.getImageData(0,0,c.width,c.height).data;
  // Visual treatment only; retain the original alpha for picking and outlines.
  let crystalVisual=null;
  if(d.asset==='small-crystal'){
   crystalVisual=canvas(c.width,c.height);const v=crystalVisual.getContext('2d'),pixels=g.getImageData(0,0,c.width,c.height),a=pixels.data,w=c.width,h=c.height;
   const radius=Math.min(6,Math.max(2,Math.round(w*.055)));
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4,r=alpha[i],green=alpha[i+1],blue=alpha[i+2];
    // Red crystal facets only: bronze cradle and pale specular highlights stay intact.
    const red=Math.max(0,Math.min(1,(r-green-22)/50))*Math.max(0,Math.min(1,(r-blue-12)/45));
    if(!red||!alpha[i+3]||y>h*.55||x<w*.23||x>w*.77||green>blue*1.25+10)continue;
    let edge=radius;
    for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
     const distance=Math.hypot(dx,dy);if(distance>=edge)continue;const xx=x+dx,yy=y+dy;
     if(xx<0||yy<0||xx>=w||yy>=h||alpha[(yy*w+xx)*4+3]<40)edge=distance;
    }
    a[i+3]=alpha[i+3]*(1-red*.55*(1-edge/radius));
    a[i]=r+(255-r)*red*.58;a[i+1]=green+(38-green)*red*.30;a[i+2]=blue+(52-blue)*red*.30;
   }
   v.putImageData(pixels,0,0);
  }
  const raster={im:c,crystalVisual,alpha};rasters.set(rasterKey,raster);
  return {...d,...raster,edges:new Map()};
 }
 async function load(key){
  if(cache.has(key))return cache.get(key);if(pending.has(key))return pending.get(key);const d=catalog[key];if(!d)return null;
  const task=(async()=>{
   if(window.TidePoolChapter&&["c2:core","c2:core-restored"].includes(key)){const value=await TidePoolChapter.build(key.endsWith("restored"));cache.set(key,value);return value;}
   const [base,clean,...ims]=await Promise.all([image(d.base),d.clean?image(d.clean):null,...d.props.map(p=>image(p.asset))]);
   const bg=canvas(d.width,d.height),g=bg.getContext('2d');g.drawImage(base,...source(base,d.rect),0,0,d.width,d.height);
   if(clean){
    const full=canvas(d.width,d.height),f=full.getContext('2d');f.drawImage(clean,...source(clean,d.rect),0,0,d.width,d.height);
    for(const p of d.props){if(p.patch===false)continue;const r=p.patch||[p.x,p.y,p.w,p.h],pad=6,x=Math.max(0,r[0]-pad),y=Math.max(0,r[1]-pad),w=Math.min(d.width-x,r[2]+pad*2),h=Math.min(d.height-y,r[3]+pad*2);
     const patch=canvas(w,h),z=patch.getContext('2d');z.drawImage(full,x,y,w,h,0,0,w,h);
     // Feather only the inpainting join, unrelated to the prop silhouette.
     z.globalCompositeOperation='destination-in';const mask=canvas(w,h),m=mask.getContext('2d');m.filter='blur(3px)';m.fillStyle='#fff';m.fillRect(3,3,w-6,h-6);z.drawImage(mask,0,0);g.drawImage(patch,x,y);
    }
   }
   if(d.unlit){const im=await image(d.unlit);for(const [x,y,w,h] of d.unlitPatches){const patch=canvas(w,h),q=patch.getContext('2d');q.drawImage(im,x*im.width/d.width,y*im.height/d.height,w*im.width/d.width,h*im.height/d.height,0,0,w,h);q.globalCompositeOperation='destination-in';q.filter='blur(2px)';q.fillStyle='#fff';q.fillRect(3,3,w-6,h-6);g.drawImage(patch,x,y);}}
   let finalBackground=bg;if(d.hd){const hd=await image(d.hd);if(d.hdCrop){const [x,y,w,h]=d.hdCrop;finalBackground=canvas(w,h);finalBackground.getContext('2d').drawImage(hd,x,y,w,h,0,0,w,h);}else finalBackground=hd;}
   if(d.hdPatches?.length){const original=finalBackground;finalBackground=canvas(original.width,original.height);const q=finalBackground.getContext('2d');q.drawImage(original,0,0);
    for(const p of d.hdPatches){const im=await image(p.src),[x,y,w,h]=p.rect,sx=original.width/d.width,sy=original.height/d.height,patch=canvas(w*sx,h*sy),z=patch.getContext('2d');z.drawImage(im,x*im.width/d.width,y*im.height/d.height,w*im.width/d.width,h*im.height/d.height,0,0,patch.width,patch.height);
     const mask=canvas(patch.width,patch.height),m=mask.getContext('2d');m.filter='blur('+4*sx+'px)';m.fillStyle='#fff';m.fillRect(4*sx,4*sy,patch.width-8*sx,patch.height-8*sy);z.globalCompositeOperation='destination-in';z.drawImage(mask,0,0);q.drawImage(patch,x*sx,y*sy);
    }
   }
   let dryBackground=null;
   if(d.dryBackground){
    const im=await image(d.dryBackground.src),sx=finalBackground.width/d.width,sy=finalBackground.height/d.height;
    dryBackground=canvas(finalBackground.width,finalBackground.height);const q=dryBackground.getContext('2d');q.drawImage(finalBackground,0,0);
    for(const [x,y,w,h] of d.dryBackground.rects){
     const patch=canvas(w*sx,h*sy),z=patch.getContext('2d');
     z.drawImage(im,x*im.width/d.width,y*im.height/d.height,w*im.width/d.width,h*im.height/d.height,0,0,patch.width,patch.height);
     // Preserve every pixel outside the local creek patch, with a soft inpainting join.
     const mask=canvas(patch.width,patch.height),m=mask.getContext('2d');
     m.filter='blur('+4*sx+'px)';m.fillStyle='#fff';m.fillRect(4*sx,4*sy,patch.width,patch.height-8*sy);
     z.globalCompositeOperation='destination-in';z.drawImage(mask,0,0);q.drawImage(patch,x*sx,y*sy);
    }
   }
   const props=d.props.map((p,i)=>sprite(ims[i],p));
   // Appearance overrides never replace the approved pick/outline alpha or placement.
   const visuals=await Promise.all(d.props.map(p=>p.visualAsset?image(p.visualAsset):null));
   visuals.forEach((im,i)=>{if(im)props[i].visual=sprite(im,d.props[i]).im;});
   const dryImages=await Promise.all(d.props.map(p=>p.dryAsset?image(p.dryAsset):null));
   dryImages.forEach((im,i)=>{if(im)props[i].dryVariant=sprite(im,{...d.props[i],stateVariant:'dry'});});
   const value={...d,bg:finalBackground,dryBackground,props};cache.set(key,value);return value;
  })();pending.set(key,task);task.catch(()=>pending.delete(key));return task;
 }
 const small=new Map(),live=new Map();
 async function loadSmall(){for(const name of ['small-crystal','small-letter','small-horn','small-boat']){const im=await image('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/interactive-props-v2/'+name+'.webp');small.set(name,im);}}
 function syncSmall(key,items){const old=live.get(key)||[];live.set(key,items.map((d,i)=>{const previous=old[i];if(previous&&previous.asset===d.asset&&previous.id===d.id){previous.instance=d.instance;previous.x=d.x;previous.y=d.y;previous.w=d.w;previous.h=d.h;previous.foot=d.y+d.h;return previous;}return sprite(small.get(d.asset),{...d,flat:true,foot:d.y+d.h});}));}
 const all=key=>[...(cache.get(key)?.props||[]),...(live.get(key)||[])].filter(p=>(!p.available||p.available())&&(!p.missionBlocker||!window.MineSequenceMap?.cleared())).map(p=>p.dryVariant&&p.isDry?.()?p.dryVariant:p);
 const group=(key,id)=>all(key).filter(p=>p.id===id);
 function drawStoneVeins(ctx,p){
  if(!p.veinMask){const mask=canvas(p.im.width,p.im.height),q=mask.getContext('2d'),data=q.createImageData(mask.width,mask.height);for(let i=0;i<p.alpha.length;i+=4){const r=p.alpha[i],gg=p.alpha[i+1],b=p.alpha[i+2];const amount=Math.max(0,Math.min(1,(r-b-75)/65))*Math.max(0,Math.min(1,(r-gg-18)/32));data.data[i]=223;data.data[i+1]=248;data.data[i+2]=104;data.data[i+3]=r>175&&gg>85?Math.round(p.alpha[i+3]*amount):0;}q.putImageData(data,0,0);p.veinMask=mask;p.veinLight=canvas(mask.width,mask.height);}
  const c=p.veinLight,q=c.getContext('2d'),animate=!matchMedia('(prefers-reduced-motion: reduce)').matches&&document.getElementById('motion-toggle')?.getAttribute('aria-pressed')!=='false',t=animate?performance.now()/1000:0;
  q.clearRect(0,0,c.width,c.height);q.globalCompositeOperation='source-over';q.globalAlpha=.48;q.drawImage(p.veinMask,0,0);q.globalAlpha=1;
  const span=c.height*.55,offset=animate?((t*.22)%1)*span:span*.5;
  for(let y=-span;y<c.height+span;y+=span){const cy=y-offset,grad=q.createLinearGradient(0,cy-span*.35,0,cy+span*.35);grad.addColorStop(0,'#dff86800');grad.addColorStop(.5,'#f4ffd0');grad.addColorStop(1,'#dff86800');q.fillStyle=grad;q.fillRect(0,cy-span*.35,c.width,span*.7);}
  q.globalCompositeOperation='destination-in';q.drawImage(p.veinMask,0,0);q.globalCompositeOperation='source-over';
  ctx.save();ctx.globalCompositeOperation='screen';ctx.shadowColor='#d6ee72';ctx.shadowBlur=8;ctx.drawImage(c,p.x,p.y,p.w,p.h);ctx.restore();
 }
 function drawOne(ctx,p,forOutline=false,staticView=false){if(p.missionBlocker&&window.MineSequenceMap?.cracked()&&!forOutline){MineSequenceMap.drawCracked(ctx,p);return;}if(p.grooveIndex!==undefined&&!forOutline&&window.TidePoolChapter?.isCut(p.grooveIndex)){ctx.save();ctx.filter='saturate(0) brightness(.25)';ctx.drawImage(p.im,p.x,p.y,p.w,p.h);ctx.restore();return;}if(p.hitOnly&&!forOutline)return;if(p.blueGlow&&!forOutline&&!staticView){ctx.save();ctx.globalAlpha=.65+.35*Math.sin(performance.now()/1000*2.8);ctx.shadowColor="#21bfff";ctx.shadowBlur=12;ctx.drawImage(p.im,p.x,p.y,p.w,p.h);ctx.restore();return;}if(p.asset==='small-crystal'||p.id==='wedges'&&p.asset?.includes('core-wedges')){ctx.save();ctx.fillStyle='rgba(20,16,12,.32)';ctx.beginPath();ctx.ellipse(p.x+p.w*.5,p.y+p.h*.96,p.w*.43,p.h*.075,0,0,Math.PI*2);ctx.fill();ctx.restore();}if(p.retainingDam&&!forOutline&&!staticView)window.ReefRetainingWater?.before(ctx,p);ctx.drawImage(!forOutline?(p.visual||p.crystalVisual||p.im):p.im,p.x,p.y,p.w,p.h);if(p.retainingDam&&!forOutline&&!staticView)window.ReefRetainingWater?.after(ctx,p);if(!forOutline&&!staticView&&p.asset?.endsWith('/sanctum-core.webp'))drawStoneVeins(ctx,p);}
 function draw(ctx,key,mode='all'){for(const p of all(key))if(mode==='all'||mode==='flat'&&p.flat||mode==='raised'&&!p.flat)drawOne(ctx,p);}
 // Minimap needs silhouettes and state, not a second simulation of every water/fire effect.
 function drawStatic(ctx,key){for(const p of all(key))drawOne(ctx,p,false,true);}
 function signature(key){return key+'|'+all(key).map(p=>[p.asset,p.instance,p.id,p.stateVariant||'',p.x,p.y,p.w,p.h,p.grooveIndex===undefined?'':!!window.TidePoolChapter?.isCut(p.grooveIndex)].join(',')).join(';');}
 function hit(key,id,x,y,asset=null){const ps=group(key,id).filter(p=>!asset||p.asset===asset||p.instance===asset);if(!ps.length)return null;return ps.some(p=>{const u=Math.floor((x-p.x)/p.w*p.im.width),v=Math.floor((y-p.y)/p.h*p.im.height);const opaque=(a,b)=>a>=0&&b>=0&&a<p.im.width&&b<p.im.height&&p.alpha[(b*p.im.width+a)*4+3]>40;if(opaque(u,v))return true;if(p.asset==='approved-pool-imprint'){const radius=14;for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)if(dx*dx+dy*dy<=radius*radius&&opaque(u+dx,v+dy))return true;}return false;});}
 function geometry(key,id){const ps=group(key,id);if(!ps.length)return null;const x=Math.min(...ps.map(p=>p.x)),y=Math.min(...ps.map(p=>p.y)),r=Math.max(...ps.map(p=>p.x+p.w)),b=Math.max(...ps.map(p=>p.y+p.h));return {x:(x+r)/2,y:(y+b)/2,rx:(r-x)/2,ry:(b-y)/2};}
 function highlight(ctx,key,id,color,alpha=1,asset=null){const ps=group(key,id).filter(p=>!asset||p.asset===asset||p.instance===asset);if(!ps.length)return false;
  for(const p of ps){let edge=p.edges.get(color);if(!edge){const pad=8,c=canvas((p.w+16)*2,(p.h+16)*2),q=c.getContext('2d');q.scale(2,2);q.translate(pad-p.x,pad-p.y);drawActorSilhouette(q,{x:p.x,y:p.y,w:p.w,h:p.h},g=>drawOne(g,p,true),color,1);edge=c;p.edges.set(color,c);}ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(edge,p.x-8,p.y-8,edge.width/2,edge.height/2);ctx.restore();}return true;
 }
 function append(key,actors,ctx){for(const p of all(key))if(!p.flat)actors.push({y:p.foot,draw:()=>drawOne(ctx,p)});}
 const key2=(area,flags={})=>'c2:'+area+((area==='harbor'&&flags.repaired||area==='core'&&flags.ringOff)?'-restored':'');
 const background=key=>{const d=cache.get(key);return d?.isDry?.()&&d.dryBackground?d.dryBackground:d?.bg||null;};
 return {catalog,load,loadSmall,syncSmall,all,group,draw,drawOne,drawStatic,signature,hit,geometry,highlight,append,key2,background,source};
})();
