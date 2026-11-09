/* One transparent image drives painting, hit testing and silhouette highlighting. */
window.SeaLayeredProps=(()=>{
 const root='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-layered-props-v1/';
 const defs={
  jars:{name:'盛海水的陶缸',x:480,y:388,w:40,foot:437},
  rope:{name:'救援繩索',x:805,y:286,w:58,foot:325},
  pool:{name:'崖上的舊鹽池',x:955,y:358,w:416,foot:615}
 };
 const loaded=new Map();
 const sources=['cliff-clean.webp','cliff-clean-restored.webp',...Object.keys(defs).map(id=>id+'.webp')].map(n=>root+n);if(window.CHAPTER_TWO_MAP_HD)sources.push(CHAPTER_TWO_MAP_HD.cliff,CHAPTER_TWO_MAP_HD['cliff-restored']);
 function prepare(images){
  for(const [id,d] of Object.entries(defs)){
   const im=images[root+id+'.webp'];if(!im)continue;
   const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const q=c.getContext('2d',{willReadFrequently:true});q.drawImage(im,0,0);
   const data=q.getImageData(0,0,c.width,c.height).data;let l=c.width,t=c.height,r=0,b=0;
   for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>32){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
   if(r<=l||b<=t)throw Error('獨立物件沒有有效透明輪廓：'+id);
   const crop=[l,t,r-l+1,b-t+1],h=d.w*crop[3]/crop[2];
   loaded.set(id,{...d,id,im,data,crop,h,edge:new Map()});
  }
 }
 function get(area,id){return area==='cliff'?loaded.get(id):null;}
 function drawOne(ctx,p){ctx.drawImage(p.im,...p.crop,p.x,p.y,p.w,p.h);}
 function draw(ctx,area){if(area!=='cliff')return;for(const p of loaded.values())drawOne(ctx,p);}
 function geometry(area,id){const p=get(area,id);return p?{x:p.x+p.w/2,y:p.y+p.h/2,rx:p.w/2,ry:p.h/2}:null;}
 function hit(area,id,x,y){const p=get(area,id);if(!p)return null;
  if(x<p.x||y<p.y||x>=p.x+p.w||y>=p.y+p.h)return false;
  const px=Math.min(p.im.width-1,Math.floor(p.crop[0]+(x-p.x)/p.w*p.crop[2])),py=Math.min(p.im.height-1,Math.floor(p.crop[1]+(y-p.y)/p.h*p.crop[3]));
  return p.data[(py*p.im.width+px)*4+3]>40;
 }
 function highlight(ctx,area,id,color,alpha=1){const p=get(area,id);if(!p)return false;
  let edge=p.edge.get(color);
  if(!edge){const pad=7,res=2,c=document.createElement('canvas');c.width=Math.ceil((p.w+pad*2)*res);c.height=Math.ceil((p.h+pad*2)*res);const q=c.getContext('2d');
   q.scale(res,res);q.translate(pad-p.x,pad-p.y);drawActorSilhouette(q,{x:p.x,y:p.y,w:p.w,h:p.h},g=>drawOne(g,p),color,1);edge={im:c,pad};p.edge.set(color,edge);}
  ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(edge.im,p.x-edge.pad,p.y-edge.pad,edge.im.width/2,edge.im.height/2);ctx.restore();return true;
 }
 function background(area,flags,images){if(area!=='cliff')return null;const hd=window.CHAPTER_TWO_MAP_HD?.[flags.repaired?'cliff-restored':'cliff'];return images[hd]||images[root+(flags.repaired?'cliff-clean-restored.webp':'cliff-clean.webp')];}
 return {sources,prepare,get,draw,drawOne,geometry,hit,highlight,background,defs};
})();
