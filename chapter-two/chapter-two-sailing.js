/* Three navigable reaches traced against the approved 1536 x 1024 reef painting. */
window.ReefBoat=(()=>{
 'use strict';
 const asset='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/interactive-props-v2/small-boat.webp';
 const newLegs=[
 {direction:'右上',hint:'沿右上水道繞過礁岸，勿把船划上沙灘。',points:[[1183/1536,429/660],[1235/1536,421/660],[1240/1536,401/660],[1190/1536,377/660],[1180/1536,367/660]],seconds:5},
 {direction:'左上',hint:'礁角擋在前方；沿左上方深色潮溝繞過礁角。',points:[[1180/1536,367/660],[1110/1536,347/660],[1045/1536,335/660],[1001/1536,315/660],[995/1536,296/660],[1010/1536,278/660]],seconds:5},
 {direction:'右上',hint:'繞過最後的彎，循右上方潮溝抵達外沙洲。',points:[[1010/1536,278/660],[1070/1536,259/660],[1170/1536,235/660],[1270/1536,214/660],[1332/1536,191/660],[1347/1536,170/660]],seconds:6}
 ];for(const l of newLegs)l.points=l.points.map(([x,y])=>[x*1536,y*660]);
 const legs=SeaNewMaps.enabled?newLegs:[
  {direction:'左上',hint:'水道先向左上彎。沿著右側礁島的左緣，繞過突出的石角。',points:[[1440,846],[1410,792],[1387,744],[1380,700],[1345,655],[1313,614],[1309,584]],seconds:5.4},
  {direction:'右上',hint:'前方礁岸擋住直路；水道轉向右上，從兩側礁石之間穿過。',points:[[1309,584],[1346,576],[1387,551],[1406,520],[1420,484],[1443,449],[1454,418]],seconds:4.8},
  {direction:'左上',hint:'過了右側礁角，沿左上方的深色水道收進窄口，勿切進左邊淺灘。',points:[[1454,418],[1444,396],[1400,378],[1361,359],[1351,340],[1368,318],[1392,299],[1395,275]],seconds:4.7}
 ];
 const lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 // Smooth geometry is sampled by arc length, so turning does not cause speed jumps.
 function sample(points,previous,next){const out=[{x:points[0][0],y:points[0][1],d:0}];
  for(let i=0;i<points.length-1;i++)for(let j=1;j<=24;j++){
   const t=j/24,a=i===0&&previous?previous:points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=i===points.length-2&&next?next:points[Math.min(points.length-1,i+2)];
   const cr=k=>.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t);
   const x=cr(0),y=cr(1),last=out.at(-1);out.push({x,y,d:last.d+Math.hypot(x-last.x,y-last.y)});
  }return out;
 }
 legs.forEach((leg,i)=>{leg.samples=sample(leg.points,legs[i-1]?.points.at(-2),legs[i+1]?.points[1]);});
 function point(index,progress){const samples=legs[clamp(index,0,2)].samples,length=samples.at(-1).d,target=clamp(progress,0,1)*length;
  let i=1;while(i<samples.length-1&&samples[i].d<target)i++;
  const a=samples[i-1],b=samples[i],t=(target-a.d)/Math.max(.001,b.d-a.d);
  return {x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),angle:Math.atan2(b.y-a.y,b.x-a.x)+Math.PI/2};
 }
 const visible=s=>s.area==='reef'&&s.step===6&&!s.flags.rescued;
 let picture=null,pixels=null,flight=null,settled=null,boarding=false;
 function prepare(im){const scan=document.createElement('canvas');scan.width=im.width;scan.height=im.height;const g=scan.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);const a=g.getImageData(0,0,scan.width,scan.height).data;
  let l=scan.width,t=scan.height,r=0,b=0;for(let y=0;y<scan.height;y++)for(let x=0;x<scan.width;x++)if(a[(y*scan.width+x)*4+3]>40){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  picture=document.createElement('canvas');picture.width=108;picture.height=168;const q=picture.getContext('2d',{willReadFrequently:true});q.drawImage(im,l,t,r-l+1,b-t+1,0,0,108,168);pixels=q.getImageData(0,0,108,168).data;
 }
 function count(s){return clamp(s.checkpoint?.game==='sail'?s.checkpoint.count||0:s.flags['cp:R2-06:8']?3:0,0,3);}
 function pose(s){const n=count(s);if(flight)return flight.pose;if(settled&&n===settled.count)return settled.pose;return n?point(n-1,1):point(0,0);}
 function scale(p){return .55+.45*clamp((p.y-240)/606,0,1);}
 function geometry(s){const p=pose(s),k=scale(p),a=p.angle-.20;return {x:p.x,y:p.y,rx:k*(Math.abs(Math.cos(a))*27+Math.abs(Math.sin(a))*42),ry:k*(Math.abs(Math.sin(a))*27+Math.abs(Math.cos(a))*42)};}
 // Use the same transformed sprite alpha for selection and highlighting.
 function hit(s,x,y){if(!visible(s)||!pixels||flight)return false;const p=pose(s),angle=p.angle-.20,k=scale(p),dx=(x-p.x)/k,dy=(y-p.y)/k;
  const u=Math.floor((dx*Math.cos(angle)+dy*Math.sin(angle)+27)*2),v=Math.floor((-dx*Math.sin(angle)+dy*Math.cos(angle)+42)*2);
  return u>=0&&u<108&&v>=0&&v<168&&pixels[(v*108+u)*4+3]>40;
 }
 function paint(ctx,s){if(!picture||!visible(s))return;const p=pose(s);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle-.20);ctx.scale(scale(p),scale(p));ctx.drawImage(picture,-27,-42,54,84);ctx.restore();}
 function highlight(ctx,s,color,alpha){if(!picture||!visible(s)||flight)return;const p=pose(s);drawActorSilhouette(ctx,{x:p.x-52,y:p.y-52,w:104,h:104},g=>paint(g,s),color,alpha);}
 function begin(s,onArrive){if(flight||!visible(s))return false;const index=count(s);if(index>=3)return false;boarding=true;flight={index,elapsed:0,pose:point(index,0),onArrive};return true;}
 function update(dt,s,motion){if(!visible(s)){flight=null;settled=null;boarding=false;return;}if(!flight)return;const f=flight;f.elapsed+=Math.max(0,dt);const duration=motion?legs[f.index].seconds:2.5,u=clamp(f.elapsed/duration,0,1),eased=u*u*(3-2*u);f.pose=point(f.index,eased);
  if(f.elapsed>=duration+.4){settled={count:f.index+1,pose:point(f.index,1)};flight=null;f.onArrive();}
 }
 function draw(ctx,s,time){if(!visible(s)||!picture)return;const p=pose(s);
  if(s.checkpoint?.game==='sail'){
   legs.forEach((leg,i)=>{const end=point(i,1),active=i===count(s);ctx.save();ctx.translate(end.x,end.y);ctx.fillStyle='#0a4c6477';ctx.beginPath();ctx.ellipse(0,5,10,3,0,0,7);ctx.fill();ctx.strokeStyle='#73543c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(0,-15);ctx.stroke();ctx.fillStyle=i===2?'#f5e6c7':'#b84432';ctx.beginPath();ctx.moveTo(1,-15);ctx.lineTo(13,-12);ctx.lineTo(1,-7);ctx.fill();if(active){ctx.shadowColor='#ffe0a0';ctx.shadowBlur=9;ctx.fillStyle='#ffe6ab';ctx.beginPath();ctx.arc(0,-17,2,0,7);ctx.fill();}ctx.restore();});
  }
  if(flight){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.lineCap='round';ctx.filter='blur(1.3px)';for(let i=0;i<5;i++){const q=(time*.7+i/5)%1;ctx.strokeStyle='rgba(199,244,236,'+(.25*(1-q))+')';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-15-q*9,25+q*25);ctx.quadraticCurveTo(0,33+q*25,15+q*9,25+q*25);ctx.stroke();}ctx.restore();}
  paint(ctx,s);
 }
 function leave(){boarding=false;}
 return {asset,legs,point,visible,prepare,pose,geometry,hit,highlight,begin,update,draw,leave,get moving(){return !!flight;},get aboard(){return boarding;},get leg(){return flight?.index??-1;}};
})();
