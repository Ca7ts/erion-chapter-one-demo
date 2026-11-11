import {decodeBoundedImage,fetchTextureBlobs} from './skill-assets.js';
import{MotherCrimsonFX}from'./mother-crimson-fx.js';
const clamp=x=>Math.max(0,Math.min(1,x)),rand=n=>{const x=Math.sin(n*134.3+11)*43758;return x-Math.floor(x)};
function triangle(ctx,image,src,dst){const[x0,y0,x1,y1,x2,y2]=src,[u0,v0,u1,v1,u2,v2]=dst,den=x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);if(Math.abs(den)<1e-8)return;const a=(u0*(y1-y2)+u1*(y2-y0)+u2*(y0-y1))/den,b=(v0*(y1-y2)+v1*(y2-y0)+v2*(y0-y1))/den,c=(u0*(x2-x1)+u1*(x0-x2)+u2*(x1-x0))/den,d=(v0*(x2-x1)+v1*(x0-x2)+v2*(x1-x0))/den,e=u0-a*x0-c*y0,f=v0-b*x0-d*y0;ctx.save();ctx.beginPath();ctx.moveTo(u0,v0);ctx.lineTo(u1,v1);ctx.lineTo(u2,v2);ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,e,f);const sx=Math.max(0,Math.floor(Math.min(x0,x1,x2)-2)),sy=Math.max(0,Math.floor(Math.min(y0,y1,y2)-2)),sw=Math.min(image.width,Math.ceil(Math.max(x0,x1,x2)+2))-sx,sh=Math.min(image.height,Math.ceil(Math.max(y0,y1,y2)+2))-sy;ctx.drawImage(image,sx,sy,sw,sh,sx,sy,sw,sh);ctx.restore()}
export class PlayerFX extends MotherCrimsonFX{
 static async load(base,rig,signal){const fx=new this(rig),names=['fault','cinders','water','grit'],blobs=fetchTextureBlobs(names.map(n=>'fx/'+n+'.webp'),base,signal);try{for(const n of names){const p='fx/'+n+'.webp',blob=await blobs.get(p);blobs.delete(p);fx.images[n]=await decodeBoundedImage(blob,768,signal);}return fx}catch(e){fx.dispose();throw e}}
 phase(){const r=this.rig,t=r.time;if(r.state==='water')return t<.64?'迴擊蓄勢':t<1.35?'漩流迴擊':'水勢散去';if(r.state==='earth')return t<.77?'掄鎚蓄力':t<.82?'重砸':'裂岩重擊';return null}
 shake(){const r=this.rig,t=r.time-.77;if(this.reduced.matches||r.state!=='earth'||t<0||t>.28)return[0,0];return[Math.sin(t*180)*4*(1-t/.28),Math.cos(t*200)*2*(1-t/.28)]}
 trail(ctx,alpha){const r=this.rig,m=r.matrices[r.boneLookup.hammer],v=r.view,im=r.images.get(r.meta.slots.Weapon_Hammer.image),rect=r.meta.slots.Weapon_Hammer.rect,p=r.data.bones.find(b=>b.name==='hammer');ctx.save();ctx.globalAlpha=alpha;ctx.transform(m[0]*v.scale,-m[1]*v.scale,-m[2]*v.scale,m[3]*v.scale,v.centerX+m[4]*v.scale,v.footY-m[5]*v.scale);ctx.drawImage(im,rect.x-150,-(rect.y-650),rect.w,rect.h);ctx.restore()}
 draw(ctx,w,h){const r=this.rig,t=r.time,v=r.view,s=v.scale;if(r.state==='water'){r.meta.emissionColor=[.25,.72,1];const phase=clamp((t-.64)/.71),life=clamp((2.1-t)/.65);if(t>.64&&t<2.1){const cx=v.centerX,cy=v.footY-260*s,rad=(320+Math.max(0,t-.64)*520)*s,theta=phase*6.283,im=this.images.water;
   // Native water texture is divided into a moving curved ribbon, not a rigid rotating panel.
   const edge=(u,vv)=>{const a=theta-u*4.8,d=(vv-.5)*380*s;return[cx+Math.cos(a)*(rad+d),cy+Math.sin(a)*(rad+d)*.28-d*.24]};
   ctx.save();ctx.globalAlpha=life*.82;for(let i=0;i<32;i++){const u=i/32,uu=(i+1)/32,p=edge(u,0),q=edge(uu,0),z=edge(u,1),k=edge(uu,1),x=u*im.width,xx=uu*im.width;triangle(ctx,im,[x,0,xx,0,x,im.height],[...p,...q,...z]);triangle(ctx,im,[xx,0,xx,im.height,x,im.height],[...q,...k,...z]);}ctx.restore();
   ctx.save();for(let i=0;i<55;i++){const a=rand(i)*6.283,d=rad*(.6+rand(i+2)*.5),age=t-.64,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d*.28-(10+rand(i+6)*60)*s*Math.sin(age*Math.PI);ctx.strokeStyle=i%3?'#afd8e9':'#ffe5a6';ctx.globalAlpha=life*.65;ctx.lineWidth=(1+rand(i+3))*s;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*8*s,y+Math.sin(a)*3*s);ctx.stroke()}ctx.restore();
   for(const side of [-1,1]){ctx.save();ctx.filter='grayscale(1) brightness(2)';this.sprite(ctx,this.images.cinders,cx+side*rad*.75,cy+60*s,190*s,85*s,side*.1,life*.2);ctx.restore();}
  }
 }else if(r.state==='earth'){r.meta.emissionColor=[1,.14,.035];const age=t-.77;if(t>.58&&t<.82&&!this.reduced.matches){for(let i=3;i>=1;i--){ctx.save();ctx.translate(-i*5*s,-i*24*s);this.trail(ctx,.07*(4-i));ctx.restore();}}
  if(age>=0&&age<1.3){const life=1-age/1.3,x=v.centerX+225*s,y=v.footY,rad=(70+age*510)*s;this.sprite(ctx,this.images.fault,x,y,rad*2,rad*.35,0,life);this.cracks(ctx,x,y,rad,life*.8,age);
   for(const side of [-1,1]){this.sprite(ctx,this.images.grit,x+side*age*250*s,y-55*s,240*s,150*s,side*.2,life*.75);ctx.save();ctx.filter='grayscale(1) brightness(1.8)';this.sprite(ctx,this.images.cinders,x+side*(60+age*250)*s,y-50*s,230*s,100*s,side*.2,life*.4);ctx.restore();}
   for(let i=0;i<30;i++){const a=rand(i)*6.283,vel=(130+rand(i+4)*430)*s,xx=x+Math.cos(a)*vel*age,yy=y-Math.abs(Math.sin(a))*vel*age+230*s*age*age,size=(8+rand(i+8)*20)*s;ctx.save();ctx.globalAlpha=life;ctx.translate(xx,yy);ctx.rotate(age*(i%2?4:-4));ctx.drawImage(this.images.grit,5,24,86,99,-size/2,-size/2,size,size);ctx.restore();}
  }
 }
 }
}
