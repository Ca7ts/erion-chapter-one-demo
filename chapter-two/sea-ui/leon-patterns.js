(function(root){
 'use strict';
 // The proof buys the pattern once. These are separate from ordinary monster drops.
 const designs={
  copperShell:['蓄震螯樞','回震扣甲','body','braced'],
  ochreStele:['背碑肩骨','負碑震脈護手','hands','quaking'],
  drownedNewt:['盲螈霜腮','寒息踏晶靴','feet','frost'],
  chainLamplighter:['鎖燈腕骨','引魂鎖燈墜','neck','rekindle'],
  whiteThornStag:['白枝角髓','回春荊衣','cloak','sap'],
  galeBronzeWing:['逆羽翼骨','斷風翼披','cloak','first'],
  brokenCenser:['祭盞火爪','餘燼祭腕','hands','cinder'],
  reefTideBearer:['潮冠足節','迴潮汐靴','feet','tide'],
  mother:['母蟲巢髓','黑水巢母胸甲','body','brood','feed'],
  guardian:['守像鎚心','裂庭銅根神鎚','weapon','fracture','bastion'],
  'cliff-windhorn':['風鳴額角','雙角鳴風戒','ring','echo'],
  'harbor-keel':['艏眼龍骨','泊魂繫纜帶','belt','mooring'],
  'reef-murex':['鳴后聲腔','迴鳴螺室戒','ring','resound'],
  'seabed-oath':['渡誓胸骨','沉舟鎮誓帶','belt','keel'],
  'gate-horse':['雙鬣潮筋','截流雙鬣戒','ring','cutwater'],
  'temple-ewer':['祭盂心瓣','還祭承露帶','belt','offering'],
  'core-seal':['逆律內玦','逆律輪潮戒','ring','alternate']
 };
 const effects={
  braced:['銅環蓄震','防禦受擊後，下一次普通攻擊額外造成 7 傷害。'],
  quaking:['負碑震地','裂岩重擊命中帶護甲的敵人時，額外造成 8 傷害。'],
  frost:['沉晶寒息','漩流命中生命過半的敵人時，額外造成 7 傷害。'],
  rekindle:['鎖燈續芯','刻印擊倒敵人時回復 3 精神。'],
  sap:['白荊回生','生命不足一半時成功防禦，回復 5 生命，每回合一次。'],
  first:['逆風先羽','每場戰鬥第一次普通攻擊命中時，額外造成 10 傷害。'],
  cinder:['盞底餘燼','裂岩重擊後，下次普通攻擊額外造成 8 傷害。'],
  tide:['潮退潮生','防禦受擊後，下一次漩流命中時回復 4 精神。'],
  brood:['巢脈裂傷','每對同一敵人命中兩次，第二擊引爆裂傷，額外造成 14 傷害。'],
  feed:['巢血回流','擊倒非召喚敵人時回復生命上限的 5%。'],
  fracture:['銅根碎甲','裂岩重擊命中時削減目標 4 護甲，單一目標每場最多削減 8。'],
  bastion:['鎮庭銅身','主動防禦時，結算後的承傷再降低 30%。'],
  echo:['鳴角複響','連續兩次普通攻擊命中同一敵人，第二擊額外造成 8 傷害。'],
  mooring:['下錨','每場第一次受到攻擊時，傷害降低 25%。'],
  resound:['螺室共鳴','漩流命中後，下一次裂岩重擊額外造成 10 傷害。'],
  keel:['沉舟守誓','生命不足一半時，所受攻擊傷害降低 12%。'],
  cutwater:['雙鬣截流','普通攻擊滿生命的敵人時，額外造成 9 傷害。'],
  offering:['祭露回贈','主動防禦受擊時回復 2 精神，每回合一次。'],
  alternate:['逆律雙潮','交替使用兩種刻印時，新刻印的首次命中額外造成 9 傷害。']
 };
 const plans={},byProof={};
 for(const [kind,[part,name,slot,...fixed]] of Object.entries(designs)){
  const boss=fixed.length===2,proof='proof_'+kind,sea=kind.includes('-');
  const icon=boss?(kind==='mother'?'copperShell-body':'copperShell-weapon'):kind+'-'+slot;
  const partIcon=boss?(kind==='mother'?'copperCoil':'veinCore'):sea?kind+'-rare':kind==='copperShell'?'copperShard':kind+'Material3';
  const cost=boss?(kind==='mother'?{shell:10,boarHide:3,copperCoil:1}:{ore:10,wood:5,thornCrown:1}):
   sea?{[kind+'-mat']:5,[kind+'-rare']:2}:kind==='copperShell'?{ore:6,shell:3,copperCoil:1}:{[kind+'Material1']:5,[kind+'Material2']:2};
  const plan={kind,part,name,slot,fixed,proof,boss,sea,icon,partIcon,cost,chance:boss?.05:.1,tier:boss?'red':'blue',rarity:boss?'orange':'blue'};
  plans[kind]=byProof[proof]=plan;
 }
 function pending(s,sea=false){return Object.keys(s.items).some(k=>byProof[k]?.sea===sea&&s.items[k]>0&&!s.leonPatterns?.[byProof[k].kind]);}
 function available(s,p){return !s.leonPatterns?.[p.kind]&&!(s.items[p.proof]>0);}
 function turnIn(s,p){
  if(!p||s.leonPatterns?.[p.kind]||!(s.items[p.proof]>=1))return false;
  (s.leonPatterns??={})[p.kind]=true;s.items[p.proof]--;return true;
 }
 const funded=(s,p)=>Object.entries(p.cost).every(([key,n])=>s.items[key]>=n);
 function craft(s,p,loot,rng=Math.random){
  if(!p||!s.leonPatterns?.[p.kind]||!funded(s,p))return null;
  const it=loot.roll(s,{template:p.boss?null:p.kind,slot:p.slot,rarity:p.rarity,source:'利昂工坊',rng});
  it.relic=p.kind;it.name=p.name;delete it.trait;
  if(p.boss){it.droppedBy=p.kind;it.base=p.kind==='mother'?{hp:38,defense:4}:{attack:12+it.level,defense:2};}
  for(const [k,n] of Object.entries(p.cost))s.items[k]-=n;
  return it;
 }
 function catalog(p,source){
  return [{key:p.proof,name:p.part,category:'material',source,chance:Math.round(p.chance*100)+'%',description:'交給利昂，解鎖「'+p.name+'」。'},
   {key:'pattern_'+p.kind,name:p.name,category:p.slot,source:'利昂工坊',chance:'製作',description:p.fixed.map(id=>effects[id].join(' · ')).join('／')}];
 }
 function book(b){
  const table=b.materialTable,materials=b.materialsFor;
  for(const p of Object.values(plans).filter(p=>!p.sea)){
   b.materials[p.proof]={name:p.part,tier:p.tier,use:catalog(p,'')[0].description};
  }
  b.materialTable=kind=>{
   const rows=table(kind),p=plans[kind];return p&&!p.sea?[...rows,[p.proof,1,p.chance]]:rows;
  };
  b.materialsFor=(s,spec,rng=Math.random)=>{
   const items=materials(s,spec,rng);
   for(const {kind,summoned} of b.defeatedFor(spec)){
    const p=plans[kind];
    if(p&&!summoned&&!items[p.proof]&&available(s,p)&&rng()<p.chance)items[p.proof]=1;
   }
   return items;
  };
  return b;
 }
 function icon(key){
  if(typeof key==='object')return plans[key?.relic]?.icon;
  return byProof[key]?.partIcon||(key?.startsWith('pattern_')?plans[key.slice(8)]?.icon:null);
 }
 function worn(s){const l=s.loot;if(!l)return [];
  const ids=new Set(Object.values(l.equipped));return l.items.filter(i=>i.relic&&ids.has(i.id)).map(i=>plans[i.relic]).filter(Boolean);
 }
 function strike(s,b,foe,type,damage,log){
  const cast=type==='earth'||type==='water',basic=type==='strike',state=b.relicState??={};
  for(const p of worn(s))for(const id of p.fixed){
   const previous=state[id];let bonus=0,spirit=0,proc=false;
   switch(id){
    case 'braced': if(basic&&previous){bonus=7;state[id]=false;}break;
    case 'quaking': if(type==='earth'&&foe.armor>0)bonus=8;break;
    case 'frost': if(type==='water'&&foe.hp>foe.max*.5)bonus=7;break;
    case 'first': if(basic&&!previous){bonus=10;state[id]=true;}break;
    case 'cinder': if(type==='earth')state[id]=true;else if(basic&&previous){bonus=8;state[id]=false;}break;
    case 'tide': if(type==='water'&&previous){spirit=4;state[id]=false;}break;
    case 'brood': foe.relicBrood=!foe.relicBrood;if(!foe.relicBrood)bonus=14;break;
    case 'fracture': if(type==='earth'){const n=Math.min(4,foe.armor||0,8-(foe.relicFracture||0));if(n>0){foe.armor-=n;foe.relicFracture=(foe.relicFracture||0)+n;proc=true;}}break;
    case 'echo': if(basic&&previous===foe){bonus=8;state[id]=null;}else state[id]=basic?foe:null;break;
    case 'resound': if(type==='water')state[id]=true;else if(type==='earth'&&previous){bonus=10;state[id]=false;}break;
    case 'cutwater': if(basic&&foe.hp===foe.max)bonus=9;break;
    case 'alternate': if(cast){if(previous&&type!==previous)bonus=9;state[id]=type;}break;
   }
   damage+=bonus;
   if(bonus||proc)log(p.name+' · '+effects[id][0]+(bonus?' +'+bonus:''));
   if(spirit&&s.mp<s.maxMp){s.mp=Math.min(s.maxMp,s.mp+spirit);log(p.name+' · '+effects[id][0]);}
  }
  if(damage>=foe.hp&&!foe.object)for(const p of worn(s))for(const id of p.fixed){
   if(id==='feed'&&!foe.summoned&&s.hp<s.maxHp){s.hp=Math.min(s.maxHp,s.hp+Math.max(1,Math.round(s.maxHp*.05)));log(p.name+' · '+effects[id][0]);}
   if(id==='rekindle'&&cast&&s.mp<s.maxMp){s.mp=Math.min(s.maxMp,s.mp+3);log(p.name+' · '+effects[id][0]);}
  }
  return damage;
 }
 function receive(s,b,guard,n,log){
  if(!(n>0))return n;
  const state=b.relicState??={},round=b.round??b.turn;
  for(const p of worn(s))for(const id of p.fixed){
   let fired=false;
   if(guard&&(id==='braced'||id==='tide'))state[id]=true;
   if(guard&&id==='sap'&&s.hp<s.maxHp*.5&&state[id]!==round){state[id]=round;s.hp=Math.min(s.maxHp,s.hp+5);fired=true;}
   if(guard&&id==='offering'&&s.mp<s.maxMp&&state[id]!==round){state[id]=round;s.mp=Math.min(s.maxMp,s.mp+2);fired=true;}
   if(id==='mooring'&&!state[id]){n=Math.max(1,Math.round(n*.75));state[id]=true;fired=true;}
   if(id==='keel'&&s.hp<s.maxHp*.5){n=Math.max(1,Math.round(n*.88));fired=true;}
   if(id==='bastion'&&guard){n=Math.max(1,Math.round(n*.70));fired=true;}
   if(fired)log(p.name+' · '+effects[id][0]);
  }
  return n;
 }
 const api={plans,byProof,effects,available,pending,turnIn,funded,craft,catalog,icon,strike,receive,book};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LeonPatterns=api;
})(typeof window==='undefined'?globalThis:window);
