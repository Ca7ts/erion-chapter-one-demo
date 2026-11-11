import {animatePresence} from './monster-motion-r39.mjs';
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
// One local, single-contact action per species. No skill projectile/area effect.
export const basics={
 'cliff-petrel':['翼爪掠擊','Blade_Wings_L',-9,5,-1],
 'cliff-ram':['抵角短撞','Head',-6,0,-1],
 'cliff-limpet':['齒舌刮擊','Radula_Mouth',-7,0,-1],
 'cliff-windhorn':['角根頂擊','Head',-6,0,-1],
 'harbor-crab':['單螯敲擊','Giant_Attack_Claw',-12,1,-1],
 'harbor-eel':['索首抽擊','Head',-9,6,-1],
 'harbor-float':['單次啄擊','Neck',7,5,1],
 'harbor-keel':['艏柱短撞','Ship_Prow_Stem',-5,1,-1],
 'reef-mantis':['單螯直擊','Hydraulic_Claws_L',-10,1,-1],
 'reef-urchin':['近身刺擊','Expanding_Thorns_4',-5,2,-1],
 'reef-anemone':['單觸鞭擊','Tentacle_Corolla_L',-10,13,-1],
 'reef-murex':['肉足推擊','Mantle',-6,8,-1],
 'seabed-skate':['短尾抽擊','Stinger_Tail',-9,13,-1],
 'seabed-shard':['殼緣夾擊','Upper_Shell',7,2,-1],
 'seabed-bone':['骨鰭劃擊','Bone_Fins_L',-10,4,-1],
 'seabed-oath':['前鰭拍擊','Flipper_L',-9,8,-1],
 'gate-gunnel':['撞角短擊','Obsidian_Ram',-6,0,-1],
 'gate-chiton':['前甲叩擊','Layered_Scale_Armor_0',-6,0,-1],
 'gate-siphon':['單口水彈','Siphon_Front_L',-6,8,-1],
 'gate-horse':['前蹄踢擊','Hooves_L',-9,8,-1],
 'temple-lamp':['單翼拍擊','Rock_Wings_L',-9,10,-1],
 'temple-mask':['綢帶抽擊','Ritual_Ribbons_L',-9,2,-1],
 'temple-egret':['短喙啄擊','Neck',7,1,1],
 'temple-ewer':['盂沿敲擊','Forearm_L',-8,1,-1],
 'core-nautilus':['單觸抽擊','Tentacles_L',-9,8,-1],
 'core-ring':['短牙咬擊','Head',-8,1,-1],
 'core-votive':['單晶足點刺','Crystal_Legs_Front',-8,3,-1],
 'core-seal':['半玦叩擊','Jade_Halves_L',-7,2,-1]
};
export const basicDuration=.92,basicContact=.32;
export function basicEnvelope(t){
 if(t<.22)return -.32*smooth(t/.22);
 if(t<basicContact)return -.32+1.32*smooth((t-.22)/.10);
 if(t<basicContact+.05)return 1;
 return 1-smooth((t-basicContact-.05)/(basicDuration-basicContact-.05));
}
export function applyBasic(sk,m,t){
 const [,lead,angle,,dir]=basics[m.id],q=basicEnvelope(t),root=sk.findBone('root'),bone=sk.findBone(lead);
 // Movement is inherited through the spine; secondary limbs keep their grip.
 root.x+=q*m.W*.035*dir;
 if(m.float)root.y-=Math.max(0,q)*m.H*.022;
 if(bone)bone.rotation+=q*angle;
}
// Continuous source pose between authored contacts; hold only the impact 50 ms.
// The previous mapping jumped backwards at every new burst and after recovery.
export function skillClock(meta,plan,t,native=false){
 if(native)return Math.min(t,meta.durations.skill);
 const hits=plan.contacts,first=hits[0];
 if(t<first)return 1.2*t/first;
 const i=hits.findLastIndex(x=>x<=t),age=t-hits[i];
 if(age<=.05)return 1.2;
 if(hits[i+1]){
  const q=clamp((age-.05)/(hits[i+1]-hits[i]-.05));
  // Release then cock back, with a fast but continuous strike into the next hold.
  if(q<.72)return 1.2-.04*smooth(q/.72);
  return 1.16+.04*smooth((q-.72)/.28);
 }
 // Recovery blends this contact pose into live idle below. Advancing the
 // source clock here would replay its extra impacts after the final VFX hit.
 return 1.2;
}
export function actorState(enemy,b,action){
 if(action?.enemy===enemy)return action.skill?'skill':'attack';
 if(b.time-(enemy.hit??-99)<.4)return 'hit';
 if(b.turn%3===0&&!b.enemyActed?.includes(enemy.index))return 'charge';
 return 'idle';
}
export function applyPose(sk,m,parsed,state,t,wall,index,plan,native,S){
 sk.setToSetupPose();
 parsed.findAnimation('idle')?.apply(sk,0,wall,true,[],1,S.MixBlend.replace,S.MixDirection.mixIn);
 animatePresence(sk,m,'idle',wall,index);
 if(state==='idle')return;
 const idle=sk.bones.map(b=>[b.x,b.y,b.rotation,b.scaleX,b.scaleY]);
 sk.setToSetupPose();
 const time=state==='skill'?skillClock(m,plan,t,native):Math.min(t,m.durations[state]||0);
 if(state==='attack')applyBasic(sk,m,t);
 else parsed.findAnimation(state)?.apply(sk,0,time,false,[],1,S.MixBlend.replace,S.MixDirection.mixIn);
 const fadeIn=smooth(t/.14),fadeOut=state==='attack'?smooth((basicDuration-t)/.15):state==='skill'?smooth((plan.duration-t)/.4):state==='hit'?smooth((.4-t)/.12):1;
 const recover=state==='skill'?1-smooth((t-plan.contacts.at(-1)-.05)/.65):1;
 const strength=fadeIn*fadeOut*recover;
 // Crossfade whole poses; never reset a charged actor every global 3.2 seconds.
 sk.bones.forEach((b,i)=>{const v=idle[i];b.x=v[0]+(b.x-v[0])*strength;b.y=v[1]+(b.y-v[1])*strength;b.rotation=v[2]+(b.rotation-v[2])*strength;b.scaleX=v[3]+(b.scaleX-v[3])*strength;b.scaleY=v[4]+(b.scaleY-v[4])*strength;});
 if(state==='charge')animatePresence(sk,m,'charge',wall,index);
}
export function frameFor(meta){
 // Same origin for the camera, composed sprite and VFX emitter projections.
 // Reserve space above the original head and around the complete action envelope.
 return {size:Math.max(meta.W*1.5,meta.H*1.4),y:meta.foot-meta.H/2};
}
export function transitionPose(actor,state,time){
 const bones=actor.skeleton.bones,keys=['x','y','rotation','scaleX','scaleY'];
 if(actor.state!==state){actor.state=state;actor.stateAt=time;actor.from=actor.lastPose;}
 return ()=>{
  const q=smooth((time-actor.stateAt)/.14);
  if(q<1&&actor.from)bones.forEach((b,i)=>keys.forEach((k,j)=>{b[k]=actor.from[i][j]+(b[k]-actor.from[i][j])*q;}));
  actor.lastPose=bones.map(b=>keys.map(k=>b[k]));
 };
}
export function basicEffect(ctx,atlas,meta,t,project,size){
 const age=t-basicContact;if(age<0||age>.27)return;
 const [,lead,,cell,dir]=basics[meta.id],part=meta.parts.find(p=>p.name===lead),uv=part?.region?[part.region[0],part.region[1]]:meta.contact;
 const at=project(...uv,'@mesh'),u=age/.27,fade=(1-u)**2,sw=atlas.width/4,sh=atlas.height/4;
 ctx.save();
 for(let i=0;i<7;i++){
  const angle=(i/6-.5)*1.8+(dir<0?Math.PI:0),v=size*(.08+i*.009),r=size*(.013+(i%3)*.005),x=at.x+Math.cos(angle)*v*u,y=at.y+Math.sin(angle)*v*u+size*.035*u*u;
  ctx.globalAlpha=fade*.8;ctx.drawImage(atlas,cell%4*sw,Math.floor(cell/4)*sh,sw,sh,x-r,y-r,r*2,r*2);
 }
 ctx.restore();
}
