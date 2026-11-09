/* Highlight the rendered alpha silhouette, never an enclosing ellipse. */
const actorOutlineScratch=new WeakMap();
window.drawActorSilhouette=function(ctx,b,paint,color,alpha=1,buffers){
 // Calls without an owner used to allocate two native surfaces every frame.
 // One scratch pair per destination is enough: the result is copied immediately.
 if(!buffers){buffers=actorOutlineScratch.get(ctx);if(!buffers){buffers={};actorOutlineScratch.set(ctx,buffers);}}
 const pad=10,m=ctx.getTransform(),requested=Math.min(2,Math.max(.5,Math.hypot(m.a,m.b))),res=Math.min(requested,1024/Math.max(b.w+pad*2,b.h+pad*2)),w=Math.ceil((b.w+pad*2)*res),h=Math.ceil((b.h+pad*2)*res);
 paint.prepare?.();
 const stamp=paint.frameVersion,key=stamp===undefined?null:[stamp,b.x,b.y,w,h,color].join(':');
 if(key!==null&&buffers.paint===paint&&buffers.key===key){ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(buffers.rim,b.x-pad,b.y-pad,w/res,h/res);ctx.restore();return;}
 const c=buffers.mask??=document.createElement('canvas');if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;const q=c.getContext('2d');q.setTransform(1,0,0,1,0,0);q.globalCompositeOperation='source-over';q.clearRect(0,0,w,h);
 q.scale(res,res);q.translate(pad-b.x,pad-b.y);paint(q);
 q.setTransform(1,0,0,1,0,0);q.globalCompositeOperation='source-in';q.fillStyle=color;q.fillRect(0,0,w,h);
 const r=buffers.rim??=document.createElement('canvas');if(r.width!==w)r.width=w;if(r.height!==h)r.height=h;const g=r.getContext('2d');g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
 g.filter='blur(3px)';g.globalAlpha=.6;g.drawImage(c,0,0);g.filter='none';g.globalAlpha=1;
 for(let i=0;i<12;i++){const a=i*Math.PI/6;g.drawImage(c,Math.cos(a)*3,Math.sin(a)*3);}
 g.globalCompositeOperation='destination-out';g.drawImage(c,0,0);
 buffers.paint=paint;buffers.key=key;
 ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(r,b.x-pad,b.y-pad,w/res,h/res);ctx.restore();
};
