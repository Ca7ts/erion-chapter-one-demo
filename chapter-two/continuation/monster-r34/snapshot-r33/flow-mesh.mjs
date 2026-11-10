// Pre-filter each atlas row at approximately its screen resolution before warp.
// Extreme affine minification of a full atlas causes triangle-shaped sampling bands.
const filteredRows=new WeakMap();
function filteredRow(image,row,length,width){
 if(typeof OffscreenCanvas==='undefined')return {image,base:row*image.height/4,height:image.height/4};
 const pow=x=>2**Math.round(Math.log2(Math.max(32,Math.min(1024,x)))),w=pow(length),h=pow(width),key=`${row}:${w}:${h}`;
 let cache=filteredRows.get(image);if(!cache){cache=new Map();filteredRows.set(image,cache);}let surface=cache.get(key);
 if(!surface){surface=new OffscreenCanvas(w,h);const c=surface.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(image,0,row*image.height/4,image.width,image.height/4,0,0,w,h);cache.set(key,surface);}
 return {image:surface,base:0,height:h};
}
// Shared quad edges and a 0.4 px clip overlap avoid raster hairlines.
export function drawFlowMesh(ctx,image,row,path,width,alpha,segments=18){
 if(!image||alpha<=.002)return 0;
 let length=0,prev=path(0);for(let i=1;i<=segments;i++){const p=path(i/segments);length+=Math.hypot(p.x-prev.x,p.y-prev.y);prev=p;}
 const filtered=filteredRow(image,row,length,typeof width==='function'?width(.5):width);image=filtered.image;
 const iw=image.width,ih=filtered.height,base=filtered.base,points=[];
 for(let i=0;i<=segments;i++){const t=i/segments,p=path(t),pa=path(Math.max(0,t-.001)),pb=path(Math.min(1,t+.001)),dx=pb.x-pa.x,dy=pb.y-pa.y,len=Math.hypot(dx,dy)||1,half=(typeof width==='function'?width(t):width)/2;points.push([{x:p.x-dy/len*half,y:p.y+dx/len*half},{x:p.x+dy/len*half,y:p.y-dx/len*half}]);}
 let count=0;ctx.save();ctx.globalAlpha=alpha;
 const tri=(p0,p1,p2,u0,v0,u1,v1,u2,v2)=>{const den=u0*(v1-v2)+u1*(v2-v0)+u2*(v0-v1);if(Math.abs(den)<1e-9)return;
  const calc=(k)=>[(p0[k]*(v1-v2)+p1[k]*(v2-v0)+p2[k]*(v0-v1))/den,(p0[k]*(u2-u1)+p1[k]*(u0-u2)+p2[k]*(u1-u0))/den,(p0[k]*(u1*v2-u2*v1)+p1[k]*(u2*v0-u0*v2)+p2[k]*(u0*v1-u1*v0))/den];
  const[xu,xv,xc]=calc('x'),[yu,yv,yc]=calc('y'),cx=(p0.x+p1.x+p2.x)/3,cy=(p0.y+p1.y+p2.y)/3;
  ctx.save();ctx.beginPath();[p0,p1,p2].forEach((p,i)=>{const dx=p.x-cx,dy=p.y-cy,scale=1+.4/(Math.hypot(dx,dy)||1);i?ctx.lineTo(cx+dx*scale,cy+dy*scale):ctx.moveTo(cx+dx*scale,cy+dy*scale);});ctx.closePath();ctx.clip();ctx.transform(xu,yu,xv,yv,xc,yc);const lo=Math.max(0,Math.min(u0,u1,u2)-2),hi=Math.min(iw,Math.max(u0,u1,u2)+2);ctx.drawImage(image,lo,base,hi-lo,ih,lo,base,hi-lo,ih);ctx.restore();count++;
 };
 for(let i=0;i<segments;i++){const x=i/segments*iw,x1=(i+1)/segments*iw,[a,b]=points[i],[c,d]=points[i+1];tri(a,c,b,x,base,x1,base,x,base+ih);tri(c,d,b,x1,base,x1,base+ih,x,base+ih);}
 ctx.restore();return count;
}
