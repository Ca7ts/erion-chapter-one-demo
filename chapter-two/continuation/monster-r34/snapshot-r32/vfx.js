import{designs,clamp,burst,waveEnvelope,fishBoneParticles,pearlParticles}from'./effect-designs.mjs';
// One selected species texture in memory; deterministic playback for comparisons.
export class VFX{
 constructor(canvas,back){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.back=back?.getContext('2d');this.generation=0;this.drawCalls=0;}
 async load(meta){this.meta=meta;this.design=designs[meta.id];const gen=++this.generation,im=new Image();im.src='effects-r32/'+meta.id+'.webp';await im.decode();if(gen===this.generation)this.texture=im;}
 dispose(){this.generation++;this.texture=null;}
 draw(t,state,enabled,project){const c=this.ctx,w=this.canvas.width,h=this.canvas.height,S=Math.min(w,h),b=this.back;c.clearRect(0,0,w,h);b?.clearRect(0,0,w,h);this.drawCalls=0;
 if(!enabled||!this.texture||!['skill','charge','attack'].includes(state))return;
 const m=this.meta,d=this.design,im=this.texture,impacts=state==='attack'?[.3]:m.impacts,first=impacts[0],last=impacts.filter(x=>x<=t).at(-1),age=last==null?-1:t-last,total=t-first,q=clamp(t/(first-.035)),power=state==='attack'?.55:1;
 const emitter=m.emitters?.[0],at=project(...(emitter?.uv||d.uv),emitter?.slot||(m.id==='temple-ewer'?'Ritual_Urn_Weapon':'@mesh')),at2=d.uv2?project(...d.uv2,'@mesh'):at,ground=project(...m.contact,'root');
 const fade=a=>a<0?0:Math.pow(1-clamp(a/1.1),1.35),f=age<0?0:burst(Math.max(0,age-.05)/.32),life=fade(age),span=S*power;
 const sprite=(x,y,width,alpha=1,rotation=0,height=null,anchor=[.5,.5],context=c,crop=null)=>{if(alpha<=0||width<=0)return;const sh=crop?crop[3]:im.height,sw=crop?crop[2]:im.width,H=height??width*sh/sw;context.save();context.translate(x,y);context.rotate(rotation);context.globalAlpha=clamp(alpha);if(crop)context.drawImage(im,...crop,-width*anchor[0],-H*anchor[1],width,H);else context.drawImage(im,-width*anchor[0],-H*anchor[1],width,H);context.restore();this.drawCalls++;};
 const wash=(p,r,a)=>{if(a<=0)return;const rgb=d.color.map(x=>Math.round(x*255)).join(',');c.save();const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'rgba('+rgb+','+a+')');g.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=g;c.fillRect(0,0,w,h);c.restore();};
 if(age<0){wash(at,span*(.16+.10*q),q*q*.14);const a=Math.pow(q,5)*.38,z=span*(.19-.07*q);if(d.kind==='horns'||d.kind==='twin-hooves'){sprite(at.x,at.y,z,a);sprite(at2.x,at2.y,z,a,Math.PI);}else if(d.kind==='multi-jet'){for(const e of m.emitters){const p=project(...e.uv,e.slot);sprite(p.x,p.y,span*.075,a,e.direction,null,[.04,.52]);}}else if(!['pearls','fish-bones','ground-tide'].includes(d.kind))sprite(at.x,at.y,z,a);return;}
 wash(at,span*.65,Math.max(0,1-age/.035)*.32);
 const beam=(p,angle,a,length,width,alpha=1)=>{if(a<0)return;const expand=burst(a/.045);sprite(p.x,p.y,length*expand,fade(a)*alpha,angle,width*(.65+.35*expand),[.025,.52]);};
 switch(d.kind){
 case'mouth-tide':for(let i=0;i<3;i++){const a=total-i*.105;beam(at,emitter.direction,a,span*(1.05+i*.08),span*(.34+i*.05),1-i*.18);}break;
 case'multi-jet':m.emitters.forEach((e,i)=>{const p=project(...e.uv,e.slot);beam(p,e.direction,total-i*.009,span*(.46+(i%2)*.12),span*.22);});break;
 case'pearls':for(const p of pearlParticles(total)){if(!p.alpha)continue;const dist=span*.9*p.life,x=at.x+Math.cos(p.angle)*dist,y=at.y+Math.sin(p.angle)*dist+span*.06*p.life*p.life,r=span*.085*p.scale;for(let j=3;j>0;j--)sprite(x-Math.cos(p.angle)*j*r*.7,y-Math.sin(p.angle)*j*r*.7,r*(1-j*.1),p.alpha*.08);sprite(x,y,r,p.alpha,0,r);}break;
 case'fish-bones':for(const p of fishBoneParticles(total)){if(!p.alpha)continue;const dist=span*.95*p.life*p.speed,x=at.x+Math.cos(p.angle)*dist,y=at.y+Math.sin(p.angle)*dist+span*.045*p.life*p.life,crop=[p.cell%3*im.width/3,Math.floor(p.cell/3)*im.height/2,im.width/3,im.height/2];sprite(x,y,span*.2*p.scale,p.alpha,p.angle,null,[.5,.5],c,crop);}break;
 case'ground-tide':{const v=waveEnvelope(total),width=span*(.15+1.65*v.radius),height=width*.43;for(const[context,top]of[[b||c,true],[c,false]]){context.save();context.beginPath();context.rect(0,top?0:ground.y,w,top?ground.y:h-ground.y);context.clip();sprite(ground.x,ground.y,width,v.alpha,0,height,[.5,.5],context);context.restore();}break;}
 case'scissor':sprite(at.x-span*.30*f,at.y,span*(.36+.65*burst(age/.055)),life,-.3+f*.18);break;
 case'salt-ram':sprite(at.x-span*.40*f,at.y+span*.12*f,span*(.36+.5*burst(age/.045)),life,.12);break;
 case'scrape':sprite(ground.x-span*.2*f,ground.y-span*.055,span*(.35+.65*burst(age/.07)),life,-.22+f*.5,null,[.5,.8]);break;
 case'horns':for(const[p,i]of[[at,0],[at2,1]])sprite(p.x-span*.28*f,p.y,span*(.15+.7*burst((age-i*.025)/.1)),life*(1-i*.15),i?-.15:.15);break;
 case'ceramic-sweep':sprite(at.x-span*.3*f,at.y+span*.04,span*(.3+.7*burst(age/.045)),life,-.55+f*.8);break;
 case'tar-bind':{const close=burst(age/.12);sprite(at.x,at.y,span*(.95-.45*close),life,.18-f*.5);sprite(at.x+span*.04,at.y,span*(.85-.45*close),life*.45,Math.PI+f*.7);break;}
 case'three-pecks':sprite(at.x-span*.24*f,at.y+span*.18*f,span*(.2+.7*burst(age/.025)),fade(age*2),-.55);break;
 case'prow':sprite(at.x-span*.30*f,at.y+span*.12,span*(.25+1.05*burst(age/.06)),life,0);break;
 case'cavitation':{const p=last===impacts[0]?at:at2;sprite(p.x-span*.27*f,p.y,span*(.08+.84*burst(age/.025)),fade(age*1.6),last===impacts[0]?Math.PI:Math.PI+.12);break;}
 case'spines':sprite(at.x,at.y,span*(.12+1.15*burst(age/.06)),life,-.1+f*.12);break;
 case'corolla':sprite(at.x,at.y,span*(.75-.48*burst(age/.085)),life,age*.32);break;
 case'sand-whip':sprite(at.x-span*.23*f,at.y+span*.2*f,span*(.3+.7*burst(age/.05)),life,-.65+f*.85);break;
 case'reef-ram':sprite(at.x-span*.35*f,at.y+span*.08*f,span*(.24+.7*burst(age/.035)),life,.1);break;
 case'plate-roll':sprite(ground.x-span*.23*f,ground.y-span*.08,span*(.2+.75*burst(age/.07)),life,-f*.9);break;
 case'twin-hooves':for(const[p,i]of[[at,0],[at2,1]])sprite(p.x+(i?1:-1)*span*.25*f,p.y-span*.07,span*(.15+.62*burst((age-i*.025)/.05)),life,i?Math.PI:0);break;
 case'ash-wings':sprite(at.x,at.y-span*.08*f,span*(.24+1.1*burst(age/.12)),life*.88,-f*.12);break;
 case'salt-tears':for(const[p,i]of[[at,0],[at2,1]])sprite(p.x+(i?1:-1)*span*.14*f,p.y+span*.3*f,span*(.18+.53*burst(age/.05)),life,i?-.2:.2);break;
 case'rust-pierce':beam(at,.04,age,span*.95,span*.22);break;
 case'ritual-pour':sprite(at.x,at.y,span*(.2+.85*burst(age/.08)),life,0,null,[.83,.13]);break;
 case'reverse-spiral':sprite(at.x-span*.32*f,at.y,span*(.24+.72*burst(age/.075)),life,-age*4);break;
 case'wedge-bite':sprite(at.x-span*.27*f,at.y+span*.05*f,span*(.3+.45*burst(age/.04)),life,-.12+f*.22);break;
 case'crystal-feet':for(let i=0;i<4;i++){const a=age-i*.035;sprite(ground.x+(i-1.5)*span*.16,ground.y,span*(.08+.35*burst(a/.045)),fade(a),i*.12-.18,null,[.5,.88]);}break;
 case'jade-closure':sprite(at.x,at.y,span*(.23+.72*burst(age/.055)),life,-age*2.8);break;
 }
 }
}
