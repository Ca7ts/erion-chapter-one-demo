/* Approved center-gap-17 layout, shared chapter renderer. No save access. */
window.TidePoolChapter=(()=>{'use strict';
const cv=document.createElement('canvas');cv.width=1536;cv.height=1024;const g=cv.getContext('2d',{willReadFrequently:true}),assets={},opts={wedges:true};
const load=src=>new Promise((ok,no)=>{const i=new ChapterImage();i.onload=()=>ok(i);i.onerror=no;i.src=src;});
function trim(im){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const q=c.getContext('2d',{willReadFrequently:true});q.drawImage(im,0,0);const a=q.getImageData(0,0,c.width,c.height).data;let l=c.width,t=c.height,r=0,b=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(a[(y*c.width+x)*4+3]>50){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}const out=document.createElement('canvas');out.width=r-l+1;out.height=b-t+1;out.getContext('2d').drawImage(im,l,t,out.width,out.height,0,0,out.width,out.height);return out;}
const B={x:290,y:350,w:960,h:405};
// Registered to the original pool image, never independently scaled props.
function fittedLayers(raw){
 const c=document.createElement('canvas');c.width=1774;c.height=887;
 const q=c.getContext('2d',{willReadFrequently:true});q.drawImage(raw,0,0);
 const pixels=q.getImageData(0,0,1774,887);
 const ring=new Path2D('M 96 417 C 96 559 449 675 868 674 C 1270 683 1646 568 1681 430 L 1690 459 C 1657 600 1272 711 868 700 C 440 697 84 573 86 438 Z');
 const wedge=new Path2D('M 1428 584 L 1469 571 L 1491 584 L 1492 636 L 1452 654 L 1429 639 Z');
 for(const key of ['ring','imprint','wedges']){
  const layer=document.createElement('canvas');layer.width=1774;layer.height=887;const ctx=layer.getContext('2d');
  const data=ctx.createImageData(1774,887);
  for(let y=0;y<887;y++)for(let x=0;x<1774;x++){
   const i=(y*1774+x)*4,r=pixels.data[i],gg=pixels.data[i+1],b=pixels.data[i+2];
   const inWedge=q.isPointInPath(wedge,x,y);
   const keep=key==='ring'?q.isPointInPath(ring,x,y)&&!inWedge:key==='wedges'?inWedge:(x>1200&&x<1390&&y>510&&y<607&&gg>r*1.04&&b>r*.87);
   if(keep){data.data[i]=r;data.data[i+1]=gg;data.data[i+2]=b;data.data[i+3]=pixels.data[i+3];}
  }
  ctx.putImageData(data,0,0);
  // Same alpha bounds as pool.png; unchanged base and water remain underneath.
  const registered=document.createElement('canvas');registered.width=assets.pool.width;registered.height=assets.pool.height;
  registered.getContext('2d').drawImage(layer,79,119,assets.pool.width,assets.pool.height,0,0,assets.pool.width,assets.pool.height);
  assets[key]=registered;
 }
}
function waterPath(ctx){ctx.ellipse(B.x+B.w*.5,B.y+B.h*.371,B.w*.381,B.h*.255,0,0,Math.PI*2);}
function structuralDraw(ctx=g){const sx=B.w/assets.pool.width,sy=B.h/assets.pool.height;ctx.drawImage(assets.structural,B.x-79*sx,B.y-119*sy,1774*sx,887*sy);}
// Trace the two visible bronze band sections in the approved source image.
// The three clamps occlude the band; stone lip, water and floor are excluded.
function bronzeBand(q){
 const sx=B.w/assets.pool.width,sy=B.h/assets.pool.height;
 q.save();q.translate(B.x-79*sx,B.y-119*sy);q.scale(sx,sy);
 const band=new Path2D('M 181 493 C 319 576 547 638 757 658 L 719 746 L 706 771 C 493 754 322 705 206 641 L 209 612 L 184 596 Z M 1017 658 C 1233 642 1445 583 1594 499 L 1581 594 L 1559 613 L 1565 635 C 1445 706 1263 757 1070 772 L 1064 747 Z');
 q.clip(band);q.drawImage(assets.structural,0,0);q.restore();
}
function body(ctx=g){if(opts.wedges){structuralDraw(ctx);return;}ctx.save();ctx.beginPath();ctx.rect(0,0,1536,1024);waterPath(ctx);ctx.clip('evenodd');ctx.drawImage(assets.pool,B.x,B.y,B.w,B.h);ctx.restore();}
function floorGrooves(t,only=-1){
 // Three bronze feet feed the corresponding radial floor inlays.
 const routes=[[330,625,-80,820],[770,735,770,1100],[1215,625,1616,820]];
 for(const [routeIndex,[ax,ay,bx,by]] of routes.entries()){if(only>=0&&routeIndex!==only)continue;
  const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
  const widthScale=1.5*(ax===770?1.5:1);const ribbon=(w0,w1,color)=>{w0*=widthScale;w1*=widthScale;g.beginPath();g.moveTo(ax+nx*w0,ay+ny*w0);g.lineTo(bx+nx*w1,by+ny*w1);g.lineTo(bx-nx*w1,by-ny*w1);g.lineTo(ax-nx*w0,ay-ny*w0);g.closePath();g.fillStyle=color;g.fill();};
  g.save();ribbon(7,12,'rgba(38,18,12,.82)');ribbon(5,9,'#9d6735');ribbon(3.6,6.8,'#250b0b');
  const red=g.createLinearGradient(ax,ay,bx,by);red.addColorStop(0,'#ff123b');red.addColorStop(.55,'#ed0030');red.addColorStop(1,'#cc0028');g.shadowColor='#ff0038';g.shadowBlur=9;ribbon(2.1,4.1,red);g.shadowBlur=0;ribbon(.48,.85,'rgba(255,151,169,.9)');
  // Broken, faint hot seams, not a floating laser beam.
  g.strokeStyle='rgba(255,173,130,.85)';g.lineWidth=.8;g.beginPath();g.moveTo(ax+nx*2.6*widthScale,ay+ny*2.6*widthScale);g.lineTo(bx+nx*5*widthScale,by+ny*5*widthScale);g.stroke();
  for(let i=1;i<9;i++){const u=i/10,x=ax+dx*u,y=ay+dy*u;g.strokeStyle='rgba(255,102,53,'+(.18+.12*Math.sin(t*1.4-i))+')';g.lineWidth=1;g.beginPath();g.moveTo(x-nx*2,y-ny*2);g.lineTo(x+nx*2,y+ny*2);g.stroke();}
  g.restore();
 }
}

let ready;
function init(){return ready||(ready=(async()=>{for(const [key,path] of Object.entries({pool:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/tide-pool-layered-v1/pool.webp',background:window.CHAPTER_TWO_MAP_HD?.core||'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/tide-pool-layered-v1/temple-empty.webp',core:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/interactive-props-v2/core-core.webp'})){const im=await load(path);assets[key]=key==='background'?im:trim(im);}fittedLayers(await load('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/tide-pool-layered-v1/pool-fitted-three-v5.webp'));assets.structural=await load('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/tide-pool-layered-v1/pool-structural-original-v9.webp');})());}
function layer(draw){const c=document.createElement('canvas');c.width=1536;c.height=1024;draw(c.getContext('2d'));return c;}
function prop(id,im,{hidden=false,glow=false,region=null,predicate=null}={}){
 const q=im.getContext('2d',{willReadFrequently:true}),d=q.getImageData(0,0,1536,1024);let l=1536,t=1024,r=0,b=0;
 for(let y=0;y<1024;y++)for(let x=0;x<1536;x++){const k=(y*1536+x)*4;if(region&&(x<region[0]||y<region[1]||x>=region[2]||y>=region[3])||predicate&&!predicate(x,y,d.data[k],d.data[k+1],d.data[k+2]))d.data[k+3]=0;if(d.data[k+3]>40){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}}
 q.putImageData(d,0,0);if(r<l)return null;
 const c=document.createElement('canvas');c.width=r-l+1;c.height=b-t+1;const z=c.getContext('2d',{willReadFrequently:true});z.drawImage(im,l,t,c.width,c.height,0,0,c.width,c.height);
 return {id,asset:'approved-pool-'+id,im:c,x:l,y:t,w:c.width,h:c.height,foot:b,flat:true,hitOnly:hidden,blueGlow:glow,alpha:z.getImageData(0,0,c.width,c.height).data,edges:new Map()};
}
async function build(restored){await init();opts.wedges=!restored;
 const bg=document.createElement('canvas');bg.width=assets.background.width;bg.height=assets.background.height;const bq=bg.getContext('2d');bq.drawImage(assets.background,0,0);bq.save();bq.scale(bg.width/1536,bg.height/1024);body(bq);if(restored)bq.drawImage(assets.pool,B.x,B.y,B.w,B.h);bq.restore();const props=[];
 props.push(prop('core',layer(q=>q.drawImage(assets.core,735,345,64,90))));
 props.push(prop('imprint',layer(q=>{q.drawImage(assets.imprint,B.x+55,B.y-15,B.w,B.h);q.globalCompositeOperation='source-in';q.fillStyle='#62dcff';q.fillRect(0,0,1536,1024);}),{glow:true}));
 if(!restored){
  // Pixel colour masks retain the actual bronze/teal relief edges, not visible hit boxes.
  for(const region of [[255,480,405,745],[675,555,870,810],[1140,470,1310,745]])props.push(prop('wedges',layer(q=>{const sx=B.w/assets.pool.width,sy=B.h/assets.pool.height;q.drawImage(assets.structural,B.x-79*sx,B.y-119*sy,1774*sx,887*sy);}),{hidden:true,region,predicate:(x,y,r,gg,b)=>r<185&&(r>gg*1.10||b>r*.8&&gg>r*.85)}));
  for(let i=0;i<3;i++){g.clearRect(0,0,1536,1024);floorGrooves(0,i);const p=prop('marks',layer(q=>q.drawImage(cv,0,0)));p.asset+='-'+i;p.grooveIndex=i;props.push(p);}
  props.push(prop('seam',layer(bronzeBand),{hidden:true}));
 }
 props.filter(p=>p?.id==='wedges').forEach((p,i)=>{p.asset+='-'+i;});
 return {width:1536,height:1024,bg,props:props.filter(Boolean)};
}
let cuts=[];return {build,drawFrame(ctx,restored){if(restored)ctx.drawImage(assets.pool,B.x,B.y,B.w,B.h);else structuralDraw(ctx);},setCuts:v=>{cuts=v||[];},isCut:i=>cuts.includes(i)};})();
