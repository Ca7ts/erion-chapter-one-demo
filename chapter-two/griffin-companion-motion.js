'use strict';
window.createGriffinCompanionMotion=function(options={}){
 const actorHeight=options.height||((id,y)=>SceneActorScale.height(id,y));
 let pos=null,last=null,trail=[],area='',phase=0,walking=0,idle=0,facing=1,clock=0;
 const source='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/characters/griffin-companion-cartoon-v2.webp';
 function reset(id,p){area=id;pos={x:p.x-actorHeight(id,p.y)*.3,y:p.y+actorHeight(id,p.y)*.12};last={x:p.x,y:p.y};trail=[];walking=0;idle=0;}
 function update(dt,id,p,active,paused){
  if(!active){pos=null;return;}if(!pos||id!==area||Math.hypot(p.x-last.x,p.y-last.y)>actorHeight(id,p.y)*2.5)reset(id,p);if(paused)return;
  dt=Math.min(.06,dt);clock+=dt;
  if(Math.hypot(p.x-last.x,p.y-last.y)>2){trail.push({x:p.x,y:p.y});last={x:p.x,y:p.y};}
  let remaining=0,prev=pos;for(const q of trail){remaining+=Math.hypot(q.x-prev.x,q.y-prev.y);prev=q;}
  const gap=actorHeight(id,p.y)*.43;let budget=Math.min(Math.max(0,remaining-gap),actorHeight(id,pos.y)*1.8*dt),travel=0;
  while(trail.length&&budget>.001){const q=trail[0],dx=q.x-pos.x,dy=q.y-pos.y,d=Math.hypot(dx,dy);if(d<.01){trail.shift();continue;}const step=Math.min(d,budget);pos.x+=dx/d*step;pos.y+=dy/d*step;if(Math.abs(dx)>1)facing=dx>0?1:-1;budget-=step;travel+=step;if(step>=d-.01)trail.shift();}
  if(trail.length>1200)trail=trail.slice(-1200);
  const h=actorHeight(id,pos.y)*.31;phase+=travel/Math.max(8,h*.65)*Math.PI*2;walking+=(Number(travel>.04)-walking)*Math.min(1,dt*12);idle=travel>.04?0:idle+dt;
 }
 function warp(x,y){
  let u=x,v=y;const gait=Math.sin(phase),flap=Math.sin(phase*.5),rest=Math.sin(clock*2.1),peek=idle>2?Math.sin(Math.min(1,(idle%7)/2)*Math.PI)*.025:0;
  function rotate(cx,cy,rx,ry,angle){const r=((x-cx)/rx)**2+((y-cy)/ry)**2;if(r>=1)return;const w=(1-r)**2,a=angle*w,dx=x-cx,dy=y-cy;u+=dx*(Math.cos(a)-1)-dy*Math.sin(a);v+=dx*Math.sin(a)+dy*(Math.cos(a)-1);}
  // Independent, feathered influence regions keep chest and wing roots connected.
  rotate(.39,.46,.35,.37,.17*(walking*flap+(1-walking)*rest*.35));
  rotate(.89,.49,.15,.22,-.13*(walking*flap+(1-walking)*rest*.35));
  rotate(.20,.60,.23,.29,.21*Math.sin(clock*3.3+phase*.25));
  rotate(.74,.28,.24,.27,peek);
  for(const [cx,cy,rx,ry,sign]of [[.39,.84,.17,.16,1],[.58,.84,.14,.16,-1],[.73,.84,.13,.16,-1],[.87,.82,.13,.18,1]]){
   const r=((x-cx)/rx)**2+((y-cy)/ry)**2;if(r<1){const w=(1-r)**1.25;u+=gait*sign*.042*w*walking;v-=Math.max(0,gait*sign)*.025*w*walking;}
  }
  return [u,v];
 }
 function triangle(g,im,a,b,c,A,B,C){const d=a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]);if(Math.abs(d)<1e-9)return;
  const coeff=(i)=>[(A[i]*(b[1]-c[1])+B[i]*(c[1]-a[1])+C[i]*(a[1]-b[1]))/d,(A[i]*(c[0]-b[0])+B[i]*(a[0]-c[0])+C[i]*(b[0]-a[0]))/d,(A[i]*(b[0]*c[1]-c[0]*b[1])+B[i]*(c[0]*a[1]-a[0]*c[1])+C[i]*(a[0]*b[1]-b[0]*a[1]))/d];
  const X=coeff(0),Y=coeff(1);g.save();g.beginPath();g.moveTo(...A);g.lineTo(...B);g.lineTo(...C);g.closePath();g.clip();g.transform(X[0],Y[0],X[1],Y[1],X[2],Y[2]);g.drawImage(im,0,0,1,1);g.restore();
 }
 function draw(g,images){const im=images[source];if(!pos||!im)return;const h=actorHeight(area,pos.y)*.31,w=h*im.width/im.height,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  g.save();g.translate(pos.x,pos.y);g.scale(facing,1);g.translate(-w*.64,-h*.96);g.scale(w,h);
  if(reduced){g.drawImage(im,0,0,1,1);g.restore();return;}
  const n=18,m=16;for(let y=0;y<m;y++)for(let x=0;x<n;x++){const a=[x/n,y/m],b=[(x+1)/n,y/m],c=[(x+1)/n,(y+1)/m],d=[x/n,(y+1)/m],A=warp(...a),B=warp(...b),C=warp(...c),D=warp(...d);triangle(g,im,a,b,c,A,B,C);triangle(g,im,a,c,d,A,C,D);}g.restore();
 }
 return {update,reset,draw,get y(){return pos?.y||0;},get active(){return !!pos;}};
};
