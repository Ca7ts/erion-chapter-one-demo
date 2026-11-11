import {decodeBoundedImage,runtimeAsset} from './skill-assets.js';
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},rand=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
export class MotherCrimsonFX{
 static async load(base,rig,signal){const fx=new this(rig);try{for(const n of ['fault','cinders','ruby','quartz']){const r=await fetch(runtimeAsset(new URL('fx/'+n+'.webp',base)),{signal});const b=await decodeBoundedImage(await r.blob(),768,signal);if(signal?.aborted){b.close();throw new DOMException('Cancelled','AbortError')}fx.images[n]=b;}return fx}catch(e){fx.dispose();throw e}}
 constructor(rig){this.rig=rig;this.images={};this.reduced=matchMedia('(prefers-reduced-motion: reduce)');}
 phase(){const r=this.rig,t=r.time;if(r.state==='charge'||r.state==='charge_hold')return'赤晶蓄力';if(r.state==='release')return t<.25?'雙螯重砸':t<1.25?'赤晶崩裂':'餘震';if(r.state==='skill')return t<2.12?'赤晶蓄力':t<2.30?'雙螯重砸':t<3.3?'赤晶崩裂':'餘震';return null}
 time(){const r=this.rig;return r.state==='skill'?r.time:r.state==='release'?r.time+2.05:-1}
 shake(){const t=this.time()-2.3;if(this.reduced.matches||t<0||t>.42)return[0,0];const a=(1-t/.42)**2*5;return[Math.sin(t*173)*a,Math.cos(t*137)*a*.65]}
 point(bone,x=0,y=0){const r=this.rig,m=r.matrices[r.boneLookup[bone]],v=r.view;return[v.centerX+(m[0]*x+m[2]*y+m[4])*v.scale,v.footY-(m[1]*x+m[3]*y+m[5])*v.scale]}
 sprite(ctx,im,x,y,w,h,angle=0,alpha=1,composite='source-over'){if(!im||alpha<=0)return;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=clamp(alpha);ctx.globalCompositeOperation=composite;ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore()}
 cracks(ctx,x,y,size,power,phase){if(power<=0)return;ctx.save();ctx.globalAlpha=clamp(power);for(let b=0;b<5;b++){const ang=b*1.256+phase*.08;ctx.beginPath();for(let j=0;j<9;j++){const rr=size*(.25+j*.085),a=ang+(rand(b*99+j+Math.floor(phase*10))-.5)*.22,X=x+Math.cos(a)*rr,Y=y+Math.sin(a)*rr*.65;j?ctx.lineTo(X,Y):ctx.moveTo(X,Y)}ctx.strokeStyle='#ff6234';ctx.lineWidth=2.6;ctx.shadowColor='#ff3417';ctx.shadowBlur=5;ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='#100b10';ctx.lineWidth=1.3;ctx.stroke()}ctx.restore()}
 draw(ctx,w,h){const r=this.rig,t=this.time(),impact=t-2.3,v=r.view,s=v.scale,charge=['charge','charge_hold'].includes(r.state)||(t>=0&&t<2.3),e=charge?clamp((r.emission-.3)/2):0;const[crx,cry]=this.point('crystal',0,190);
  // Pre-impact energy stays around the detached crystal, never over the face.
  this.cracks(ctx,crx,cry,190*s,e*.76,r.clock);
  if(charge){ctx.save();for(let i=0;i<46;i++){const p=(r.clock*(.12+rand(i)*.1)+rand(i+9))%1,a=rand(i+70)*6.283,rad=(280-p*130)*s;const x=crx+Math.cos(a)*rad,y=cry+Math.sin(a)*rad*.65;ctx.fillStyle=i%4?'#f4c575':'#e6654b';ctx.globalAlpha=Math.sin(p*Math.PI)*e*.8;ctx.beginPath();ctx.ellipse(x,y,(.7+rand(i+44))*s,2*s,a,0,6.283);ctx.fill()}ctx.restore()}
  // Only the two actual moving claw attachments form the velocity trail.
  if(t>2.12&&t<2.34&&!this.reduced.matches){for(const c of r.meta.clawTips){const row=r.drawn.find(x=>x.slot.name===c.bone),im=r.images.get(r.meta.slots[c.bone].image);if(!row||!im)continue;const corners=[0,14,26,40].map(i=>[v.centerX+row.verts[i*2]*s,v.footY-row.verts[i*2+1]*s]);const p=corners[0],q=corners[1],z=corners[3];for(let j=3;j>=1;j--){ctx.save();ctx.globalAlpha=.07*(4-j);ctx.transform((q[0]-p[0])/im.width,(q[1]-p[1])/im.width,(z[0]-p[0])/im.height,(z[1]-p[1])/im.height,p[0],p[1]-j*12*s);ctx.drawImage(im,0,0);ctx.restore()}}}
  if(impact>=0&&impact<2.1){const life=1-clamp(impact/2.1),expand=ease(impact/.24),contacts=r.meta.impactContacts.map(c=>[v.centerX+c.x*s,v.footY-c.y*s]);
   for(let k=0;k<contacts.length;k++){const[x,y]=contacts[k];
    for(let j=0;j<3;j++){const angle=(j-1)*.65+(k?-.1:.1);this.sprite(ctx,this.images.fault,x+(j-1)*50*s,y+18*s,(170+230*expand)*s,(32+32*expand)*s,angle,life*.8)}
    this.cracks(ctx,x,y,(110+impact*250)*s,life*.75,impact+k*11);
    // Low, separated dust lobes retain the body and face silhouette.
    for(let side of [-1,1]){ctx.save();ctx.filter='grayscale(.85) brightness(1.6)';this.sprite(ctx,this.images.cinders,x+side*(80+impact*220)*s,y-(15+Math.sin(Math.min(1,impact)*Math.PI)*38)*s,(130+impact*165)*s,(65+impact*75)*s,side*.22,life*.42);ctx.restore()}
    for(let i=0;i<16;i++){const a=rand(i+70+k*50)*Math.PI,vel=(110+rand(i+13)*310)*s,xx=x+Math.cos(a)*vel*impact,yy=y-Math.sin(a)*vel*impact+190*s*impact*impact;this.sprite(ctx,i%3?this.images.quartz:this.images.ruby,xx,yy,(7+rand(i)*15)*s,(5+rand(i)*11)*s,impact*(i%2?4:-3),life*.85)}
   }
   // Three translucent disturbed butterflies, bounded to the impact's outer edge.
   if(!this.reduced.matches)for(let i=0;i<3;i++){const side=i%2?1:-1,x=v.centerX+side*(250+impact*(130+i*30))*s,y=v.footY-(80+impact*(100+i*40))*s,flap=.25+.75*Math.abs(Math.sin(impact*22+i));ctx.save();ctx.translate(x,y);ctx.rotate(side*.35);ctx.globalAlpha=life*.5;ctx.fillStyle='#d9a38a';for(const d of [-1,1]){ctx.beginPath();ctx.ellipse(d*5*s*flap,-3*s,6*s*flap,9*s,d*.4,0,6.283);ctx.fill()}ctx.fillStyle='#34222b';ctx.fillRect(-.6*s,-7*s,1.2*s,12*s);ctx.restore()}
   ctx.save();for(let i=0;i<50;i++){const a=rand(i)*6.283,rad=(80+impact*(70+rand(i+10)*260))*s;ctx.globalAlpha=life*.7;ctx.fillStyle=i%3?'#ffdf9a':'#e86236';ctx.beginPath();ctx.ellipse(v.centerX+Math.cos(a)*rad,v.footY-100*s+Math.sin(a)*rad*.38-impact*32*s,1.2*s,2.1*s,a,0,6.283);ctx.fill()}ctx.restore();
  }
 }
 dispose(){for(const i of Object.values(this.images))i.close();this.images={}}
}
