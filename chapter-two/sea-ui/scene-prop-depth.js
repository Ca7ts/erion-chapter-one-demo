// All coordinates in this compositor are world coordinates, independent of camera zoom.
window.PropDepth=(()=>{
 function at(line,x){
  for(let i=1;i<line.length;i++){
   const [ax,ay]=line[i-1],[bx,by]=line[i];
   if(x<=bx)return ay+(by-ay)*Math.max(0,(x-ax)/(bx-ax));
  }
  return line.at(-1)[1];
 }
 // Split only where a character actually crosses the projected front of a sloping object.
 // This works for several actors on different sides of the same long railing.
 function append(cast,levels,g,box,line,draw){
  const [left,top,right,bottom]=box,cuts=[left,right];
  for(let i=1;i<line.length;i++){
   const [ax,ay]=line[i-1],[bx,by]=line[i];
   for(const y of levels)if((y>ay&&y<by)||(y>by&&y<ay)){
    const x=ax+(bx-ax)*(y-ay)/(by-ay);
    if(x>left&&x<right)cuts.push(x);
   }
   if(i<line.length-1&&ax<right&&bx>left&&levels.includes(by)&&bx>left&&bx<right)cuts.push(bx);
  }
  cuts.sort((a,b)=>a-b);
  for(let i=1;i<cuts.length;i++){
   const x=cuts[i-1],end=cuts[i];if(end<=x)continue;
   cast.push({y:at(line,(x+end)/2),draw:cuts.length===2?draw:()=>{
    g.save();g.beginPath();g.rect(x,top,end-x,bottom-top);g.clip();draw();g.restore();
   }});
  }
 }
 // Native coordinates on the 400 x 372 proof of the split mine-bench sprite.
 const benchFront=[[0,338],[33,348],[77,350],[136,327],[288,306],[369,293],[399,280]];
 const benchBack=[[390,254],[348,251],[288,258],[144,293],[68,288],[12,309]];
 const rubble=[[0,329],[12,329],[35,343],[82,351],[98,347],[110,328],[139,326],[147,312],[146,302],[156,296],[167,300],[177,317],[181,334],[288,334],[297,351],[283,360],[181,368],[94,372],[42,359],[0,348]];
 const bench={size:[400,372],front:benchFront,back:benchBack,trim:rubble,feet:[[.17,.91,.16],[.85,.80,.13]]};
 const project=(p,[x,y])=>[p.x+x*p.w/p.profile.size[0],p.y+y*p.h/p.profile.size[1]];
 const footprint=p=>[...p.profile.front,...p.profile.back].map(q=>project(p,q));
 function assignLayers(props){
  for(const p of props){
   if(!p.parent)continue;
   const host=props.find(o=>o.id===p.parent);
   if(!host?.profile)throw Error('Missing parent footprint for '+p.id);
   const line=host.profile.front.map(q=>project(host,q));
   p.layer=p.y+p.h>=at(line,p.x+p.w/2)?'foreground':'body';
  }
 }
 function partsOf(p){
  const parts=p.im,body=document.createElement('canvas'),front=document.createElement('canvas');
  body.width=front.width=parts.width;body.height=front.height=parts.height;
  const a=body.getContext('2d'),b=front.getContext('2d');a.drawImage(parts,0,0);
  const [w,h]=p.profile.size;
  b.save();b.scale(front.width/w,front.height/h);b.beginPath();p.profile.trim.forEach(([x,y],i)=>i?b.lineTo(x,y):b.moveTo(x,y));b.closePath();b.clip();b.drawImage(parts,0,0,w,h);b.restore();
  a.globalCompositeOperation='destination-out';a.drawImage(front,0,0);
  return {body,front};
 }
 const splitCache=new WeakMap();
 function sprites(cast,levels,g,props){
  for(const p of props){
   if(p.flat||p.hitOnly)continue;
   if(p.layer==='foreground'){cast.push({y:1e6+p.foot,draw:()=>WorldProps.drawOne(g,p)});continue;}
   if(p.profile?.trim){
    let parts=splitCache.get(p);if(!parts){parts=partsOf(p);splitCache.set(p,parts);}
    append(cast,levels,g,[p.x,p.y,p.x+p.w,p.y+p.h],p.profile.front.map(q=>project(p,q)),()=>g.drawImage(parts.body,p.x,p.y,p.w,p.h));
    cast.push({y:1e6+p.foot,draw:()=>g.drawImage(parts.front,p.x,p.y,p.w,p.h)});
   }else if(p.contact){
    let line=contactLines.get(p);
    if(!line){
     const [cx,cy,rx,ry]=contact(p);
     line=Array.from({length:13},(_,i)=>{const a=Math.PI*(1-i/12);return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)];});
     contactLines.set(p,line);
    }
    append(cast,levels,g,[p.x,p.y,p.x+p.w,p.y+p.h],line,()=>WorldProps.drawOne(g,p));
   }else cast.push({y:p.foot,draw:()=>WorldProps.drawOne(g,p)});
  }
 }
 // Fractions of the visible sprite bounds: centre and radii of the contact section.
 const contactLines=new WeakMap();
 function contact(p){
  const [x,y,rx,ry]=p.contact;
  return [p.x+x*p.w,p.y+y*p.h,rx*p.w,ry*p.h];
 }
 const sunlight=Object.freeze({shadowX:.18,shadowY:-.24});
 function bakeShadow(p,planeAt,light=sunlight){
   const height=p.h,dx=height*light.shadowX,dy=height*light.shadowY;
   const left=Math.floor(p.x+Math.min(0,dx)-2),top=Math.floor(p.foot+Math.min(0,dy)-8);
   const right=Math.ceil(p.x+p.w+Math.max(0,dx)+4),bottom=Math.ceil(p.foot+Math.max(0,dy)+6);
   const can=document.createElement('canvas');can.width=right-left;can.height=bottom-top;
   const q=can.getContext('2d',{willReadFrequently:true}),cx=p.x+p.w*.5;
   q.save();q.translate(p.x-left,p.foot-top);q.transform(1,0,-light.shadowX,-light.shadowY,0,0);
   if(p.crop)q.drawImage(p.im,...p.crop,0,-height,p.w,height);else q.drawImage(p.visual||p.im,0,-height,p.w,height);q.restore();
   q.globalCompositeOperation='source-in';q.fillStyle='rgba(32,24,29,.25)';q.fillRect(0,0,can.width,can.height);
   q.globalCompositeOperation='source-over';
   const feet=p.profile?.feet?.map(([x,y,r])=>[p.x+x*p.w,p.y+y*p.h,p.w*r]) || (p.contact?[PropDepth.contact(p)]:[[cx,Math.min(p.foot,p.y+p.h),p.w*.38]]);
   for(const [x,y,r] of feet){q.save();q.translate(x-left,y-top);q.scale(r,Math.max(2,r*.23));const grad=q.createRadialGradient(0,0,0,0,0,1);grad.addColorStop(0,'#22191573');grad.addColorStop(.45,'#22191546');grad.addColorStop(1,'#22191500');q.fillStyle=grad;q.fillRect(-1,-1,2,2);q.restore();}
   // The contact itself can be inside its solid base. Find its neighbouring
   // receiving floor before masking the shadow against the final surface IDs.
   let receiver=0;const fy=Math.min(p.foot,p.y+p.h);
   for(let r=0;r<=Math.max(12,p.w*.55)&&!receiver;r+=2){
    for(const [dx,dy] of [[0,r],[r,0],[-r,0],[0,-r]]){const k=planeAt(cx+dx,fy+dy);if(k){receiver=k;break;}}
   }
   const pixels=q.getImageData(0,0,can.width,can.height);
   for(let y=0;y<can.height;y++)for(let x=0;x<can.width;x++){
    const k=planeAt(left+x+.5,top+y+.5);
    if(!receiver||k!==receiver)pixels.data[(y*can.width+x)*4+3]=0;
   }
   q.putImageData(pixels,0,0);return {can,left,top};
 }
 return {at,append,sprites,bench,footprint,assignLayers,contact,bakeShadow,sunlight};
})();
