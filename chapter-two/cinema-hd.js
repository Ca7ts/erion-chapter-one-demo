/* HD frames are independent from quest saves and loaded only near playback. */
(()=>{'use strict';
 const key=(src,panel=0,cols=1,rows=1)=>[src,panel,cols,rows].join('|');
 const catalog=new Map((window.CINEMA_HD_FRAMES||[]).map(f=>[key(f.src,f.panel,f.cols,f.rows),f]));
 const cache=new Map();let tick=0;
 // A registered clean plate lets the entire apparition (including wheat and
 // jewellery) share one opacity, while the original painted identity is kept.
 function composePact(original,plate,entry){
  const canvas=document.createElement('canvas'),mask=document.createElement('canvas'),layer=document.createElement('canvas');
  const w=original.naturalWidth||original.width,h=original.naturalHeight||original.height;
  for(const c of [canvas,mask,layer]){c.width=w;c.height=h;}
  const g=canvas.getContext('2d'),m=mask.getContext('2d'),l=layer.getContext('2d');
  const path=(c,points)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x*w,y*h):c.moveTo(x*w,y*h));c.closePath();};
  m.fillStyle='#fff';m.filter='blur('+Math.max(2,w*.004)+'px)';path(m,entry.pactRegion);m.fill();m.filter='none';
  // Foreground people and physical story props are never made transparent.
  if(entry.pactProtect){m.globalCompositeOperation='destination-out';for(const points of entry.pactProtect){path(m,points);m.fill();}}
  l.drawImage(plate,0,0,w,h);l.globalCompositeOperation='destination-in';l.drawImage(mask,0,0);
  g.drawImage(original,0,0,w,h);g.globalAlpha=1-entry.pactOpacity;g.drawImage(layer,0,0);g.globalAlpha=1;
  return canvas;
 }
 function loadImage(src){return new Promise((resolve,reject)=>{const im=new ChapterImage();im.decoding='async';im.onload=()=>resolve(im);im.onerror=()=>reject(new Error(src));im.src=src;});}
 function lookup(src,panel=0,cols=1,rows=1){
  const entry=catalog.get(key(src,panel,cols,rows));if(!entry)return null;
  const id=entry.dst+'|'+(entry.pactPlate||'');let rec=cache.get(id);
  if(!rec){rec={image:null,pending:true,used:++tick};cache.set(id,rec);
   rec.promise=Promise.all([loadImage(entry.dst),entry.pactPlate?loadImage(entry.pactPlate):null]).then(([im,plate])=>{rec.image=plate?composePact(im,plate,entry):im;rec.pending=false;trim();}).catch(()=>{rec.pending=false;rec.error=true;console.warn('高清過場載入失敗',entry.dst,entry.pactPlate||'');});
  }else rec.used=++tick;
  return rec.image?{image:rec.image,src:entry.dst,crop:entry.crop}:null;
 }
 function trim(){const ready=[...cache].filter(([,v])=>v.image).sort((a,b)=>b[1].used-a[1].used);for(const [id] of ready.slice(4))cache.delete(id);}
 function warm(shots){for(const s of shots.slice(0,3))if(s)lookup(s.src,s.panel,s.cols,s.rows);}
 const requiresPact=(src,panel=0,cols=1,rows=1)=>!!catalog.get(key(src,panel,cols,rows))?.pactPlate;
 async function prepare(s){const entry=catalog.get(key(s.src,s.panel,s.cols,s.rows));if(!entry)return false;lookup(s.src,s.panel,s.cols,s.rows);const r=cache.get(entry.dst+'|'+(entry.pactPlate||''));await r.promise;if(r.error)throw Error('過場素材未載入：'+entry.dst);return true;}window.CinemaHD={lookup,warm,key,requiresPact,prepare,count:catalog.size};
})();
