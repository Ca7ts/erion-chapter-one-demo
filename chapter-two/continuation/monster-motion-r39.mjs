// Rotations are added at the authored joint pivots; skin weights and setup geometry stay intact.
// Different anatomy drives different idle rhythms. No independent floating attachment offsets.
export function animatePresence(sk,meta,state,t,index=0){
 const phase=t+(index*.37),winged=['cliff-petrel','harbor-float','temple-lamp'].includes(meta.id);
 const root=sk.findBone('root'),torso=sk.findBone('torso');
 if(state==='idle'||state==='charge'){
  const charged=state==='charge',weight=charged?.22:1;
  if(meta.float&&root)root.y+=Math.sin(phase*(winged?2.8:1.7))*meta.H*.012*weight;
  for(const [i,p]of meta.parts.entries()){
   const bone=sk.findBone(p.name);if(!bone)continue;
   const name=p.name,side=/_R$/.test(name)?-1:1;
   if(/Wing/.test(name))bone.rotation+=Math.sin(phase*(winged?3.6:2)+i*.24)*side*(winged?5:2.3)*weight;
   else if(/Tentacle|Ribbon|Chain_Tail|Stinger_Tail|^Tail$|Mantle|Water_/.test(name))bone.rotation+=Math.sin(phase*1.9-i*.65)*3.4*weight;
   else if(/Claw|Forearm/.test(name))bone.rotation+=Math.sin(phase*1.6+i*1.1)*2.2*weight;
   else if(/Head|Neck|Mask|Siphon|Radula/.test(name))bone.rotation+=Math.sin(phase*1.55+i*.55)*1.6*weight;
   else if(/Armor|Shell|Ceramic|Jade|Spine|Thorn|Crystal/.test(name))bone.rotation+=Math.sin(phase*1.3+i*.3)*.65*weight;
  }
  if(charged&&torso)torso.rotation+=Math.sin(phase*24)*.18;
 }
 if(state==='attack'){
  // Deliberate wind-up, fast committed strike, 3-frame contact, weighted recovery.
  const q=t<.18?-Math.sin(t/.18*Math.PI/2):t<.3?-1+2*(t-.18)/.12:t<.35?1:Math.max(0,1-(t-.35)/.45);
  if(root){root.y-=q*meta.H*.026;root.rotation+=q*(meta.float?-1.6:-.8);}
  // Enlarge the existing per-part attack motion, while keeping each root attached.
  for(const p of meta.parts){const bone=sk.findBone(p.name);if(bone)bone.rotation=bone.data.rotation+(bone.rotation-bone.data.rotation)*1.75;}
 }
}
