(function(root){'use strict';
 const Bestiary=root.Bestiary||(typeof module!=='undefined'?require('./bestiary-system'):null);
 const slots={weapon:{label:'武器',scale:1,icon:'lizard-weapon'},head:{label:'頭盔',scale:.35,icon:'lizard-head'},body:{label:'衣裝',scale:1,icon:'lizard-body'},hands:{label:'護手',scale:.3,icon:'lizard-hands'},feet:{label:'鞋靴',scale:.3,icon:'lizard-feet'},neck:{label:'項鍊',scale:.3,icon:'moth-neck'},ring:{label:'戒指',scale:.4,icon:'copperShell-ring'},belt:{label:'腰帶',scale:.35,icon:'copperShell-belt'},cloak:{label:'披風',scale:.3,icon:'moth-cloak'}};
 const slotKeys=Object.keys(slots);
 const bossNames={mother:{weapon:'赤晶巢主重鎚',body:'赤晶巢血甲'},guardian:{weapon:'銅根裂庭重鎚',body:'銅根守誓鎧'}};
 function nameBossItem(item,s){
  if(item.locked||item.relic||!item.trait)return;
  const kind=item.droppedBy||item.template||(item.trait.name==='巢血'?'mother':item.trait.name==='銅根震擊'?'guardian':null);
  const name=bossNames[kind]?.[item.slot];if(!name)return;
  if(s?.exploration?.discovered?.gear?.[item.name])s.exploration.discovered.gear[name]=true;
  item.name=name;
 }
 const qualities=[{id:'white',name:'普通',count:0,color:'#eeece6'},{id:'green',name:'精良',count:1,color:'#8fe0a8'},{id:'blue',name:'稀有',count:2,color:'#87ceff'},{id:'purple',name:'史詩',count:3,color:'#d4a1ff'},{id:'orange',name:'傳奇',count:4,color:'#ffba68'}];
 const affixes={attack:{name:'力量',label:'攻擊',ranges:[[1,3],[4,6],[7,9],[10,12]]},hp:{name:'強健',label:'生命上限',ranges:[[8,14],[18,25],[30,39],[44,55]]},mp:{name:'凝神',label:'精神上限',ranges:[[1,2],[3,4],[5,6],[7,8]]},defense:{name:'堅固',label:'防禦',ranges:[[1,1],[2,2],[3,3],[4,5]]},crit:{name:'精準',label:'暴擊率',unit:'%',ranges:[[1,3],[4,6],[7,9],[10,12]]},skill:{name:'通脈',label:'技能傷害',unit:'%',ranges:[[3,5],[6,9],[10,14],[15,20]]}};
 const fixed=(id,name,slot,base)=>({id,name,slot,rarity:'white',level:1,base,affixes:[],source:'劇情裝備',locked:true});
 const attributeMeta={...affixes,attackPct:{label:'攻擊加成',unit:'%'},mpPct:{label:'精神上限加成',unit:'%'},defensePct:{label:'防禦加成',unit:'%'},hpPct:{label:'生命上限加成',unit:'%'}};
 // One inherited trait per monster item. Rolls and fusion only modify affixes.
 const inherited={
  shell:['石殼','defense',1],larva:['蛻生','hp',4],root:['盤根','hp',8],mother:['巢血','hpPct',2],guardian:['銅根震擊','attackPct',2],
  lizard:['礦鱗','defense',2],moth:['幽燈','mp',2],boar:['荊冠蓄勢','attack',2],
  screeMask:['碎石面甲','defense',1],chainShade:['鎖井回聲','mp',2],laurelMaw:['噬枝','attack',2],bronzeHarpy:['刃羽','crit',1.2],
  riftRam:['裂角','attack',3],ashAmphora:['灰燼祭火','skill',1.6],oathStatue:['守誓','defense',2],
  tidalCrab:['潮甲','defense',2],saltSerpent:['鹽牙','crit',1.4],shellLament:['螺鳴','skill',1.8],
  'cliff-petrel':['剪風','crit',1.2],'cliff-ram':['鹽角衝勢','attack',3],'cliff-limpet':['伏崖','defense',2],
  'harbor-crab':['甕甲','defense',2],'harbor-eel':['纜索絞勁','attack',2],'harbor-float':['浮標定睛','crit',1.3],
  'reef-mantis':['虹拳寸勁','attack',3],'reef-urchin':['棘刺','crit',1.4],'reef-anemone':['花冠藏息','mp',2],
  'seabed-skate':['掠沙','crit',1.5],'seabed-shard':['黑礁疊甲','defense',3],'seabed-bone':['骨罐蓄泉','mp',3],
  'gate-gunnel':['逆流','attack',3],'gate-chiton':['扣門甲','defense',3],'gate-siphon':['虹吸','mp',3],
  'temple-lamp':['啜焰','skill',2],'temple-mask':['凝鹽','hp',11],'temple-egret':['祭鷺銳喙','crit',1.6],
  'core-nautilus':['逆紋蓄潮','mp',3],'core-ring':['噬楔','attack',3],'core-votive':['祭髓','skill',2.2]
 };
 function imprint(item){
  if(item.trait||item.relic)return;
  const kind=item.template||item.droppedBy;
  const source=Bestiary?.gear?.[kind]?.[item.slot];
  // A new balance table must never imprint new attributes onto a saved item.
  if(source?.balanceRevision&&!item.balanceRevision)return;
  const existing=source?.trait;
  if(existing){item.trait={...existing};return;}
  if(inherited[kind]){const [name,stat,value]=inherited[kind];item.trait={name,stat,value};}
 }
 const describeTrait=item=>item?.trait?item.trait.name+' · '+attributeMeta[item.trait.stat].label+' +'+item.trait.value+(attributeMeta[item.trait.stat].unit||''):'';
 const proofQuality={id:'red',name:'傳說憑證',count:0,color:'#ff676f'};
 const quality=id=>id==='red'?proofQuality:qualities.find(q=>q.id===id)||qualities[0];
 function init(s){s.loot??={version:1,serial:0,items:[],equipped:{weapon:'starter-hammer',body:'starter-workwear'},pity:0};const l=s.loot;
  l.equipped??={weapon:'starter-hammer',body:'starter-workwear'};l.pity??=0;l.version=2;l.items??=[];l.serial=Math.max(l.serial||0,...l.items.map(i=>/^loot-\d+$/.test(i.id)?Number(i.id.slice(5)):0));
  if(!l.items.some(i=>i.id==='starter-hammer'))l.items.unshift(fixed('starter-hammer','礦工重鎚','weapon',{attack:6}));
  if(!l.items.some(i=>i.id==='starter-workwear'))l.items.push(fixed('starter-workwear','礦工工作服','body',{}));
  const hammer=l.items.find(i=>i.id==='starter-hammer');hammer.base.attack=s.flags.hammer?14:6;hammer.name=s.flags.hammer?'修整的礦工重鎚':'礦工重鎚';hammer.rarity=s.flags.hammer?'green':'white';
  if(s.flags.tunic&&!l.items.some(i=>i.id==='quest-flax'))l.items.push(fixed('quest-flax','韌麻護衣','body',{hp:55,defense:3}));
  if(s.equipment?.body==='flax'&&l.equipped.body==='starter-workwear'&&s.flags.tunic)l.equipped.body='quest-flax';
  for(const item of l.items){imprint(item);nameBossItem(item,s);}
  for(const slot of slotKeys)if(l.equipped[slot]!==null&&!l.items.some(i=>i.id===l.equipped[slot]&&i.slot===slot))l.equipped[slot]=slot==='weapon'?'starter-hammer':slot==='body'?'starter-workwear':null;
  return l;
 }
 const range=(key,rarity,level,slot='weapon')=>{const tier=quality(rarity).count;if(!tier)return null;const r=affixes[key].ranges[tier-1],bonus=['attack','hp'].includes(key)?Math.floor((level-1)/2):0;return r.map(n=>round1((n+bonus)*(slots[slot]?.scale||1)));};
 const round1=n=>Math.round((n+Number.EPSILON)*10)/10;
 const format1=n=>round1(n).toFixed(1);
 const int=(min,max,rng)=>min+Math.min(max-min,Math.floor(rng()*(max-min+1)));
 function roll(s,{rarity='white',slot='weapon',level=s.level||1,source='戰場拾獲',template=null,droppedBy=null,rng=Math.random}={}){const profile=Bestiary?.gear[template]?.[slot];if(!slots[slot]||(!profile&&!['weapon','body'].includes(slot))||(['ring','belt'].includes(slot)&&!Bestiary?.enemies[template]?.rare))throw new Error('Invalid equipment source/slot: '+template+'/'+slot);const l=init(s);level=Math.max(1,Math.min(12,Math.floor(level)));const q=quality(rarity),pool=slot==='weapon'?['attack','hp','mp','crit','skill']:['neck','ring'].includes(slot)?['attack','hp','mp','crit','skill']:['defense','hp','mp','crit','skill'];
  const a=[];while(a.length<q.count){const key=pool.splice(int(0,pool.length-1,rng),1)[0],[min,max]=range(key,q.id,level,slot);a.push({key,value:int(Math.round(min*10),Math.round(max*10),rng)/10,min,max});}
  const base=profile?{...profile.base}:slot==='weapon'?{attack:6}:{hp:0};if(slot==='weapon')base.attack+=level-1;else if(slot==='body')base.hp=(base.hp||0)+(level-1)*3;
  const item={id:'loot-'+(++l.serial),name:profile?.name||(slot==='weapon'?'回收礦鎚':'礦道護衣'),template:profile?template:null,slot,rarity:q.id,level,base,affixes:a,...(profile?.balanceRevision?{balanceRevision:profile.balanceRevision}:{}),...(droppedBy?{droppedBy}:{}),source,locked:false};imprint(item);nameBossItem(item,s);l.items.push(item);return item;
 }
 function stats(s){const l=init(s),total={attack:0,hp:0,mp:0,defense:0,crit:0,skill:0,attackPct:0,hpPct:0,mpPct:0,defensePct:0};for(const slot of slotKeys){const item=l.items.find(i=>i.id===l.equipped[slot]);if(!item)continue;for(const [k,n]of Object.entries(item.base||{}))total[k]=(total[k]||0)+n;for(const a of item.affixes||[])total[a.key]=(total[a.key]||0)+a.value;if(item.trait)total[item.trait.stat]+=item.trait.value;}total.crit=Math.min(50,total.crit);for(const k of Object.keys(total))total[k]=round1(total[k]);return total;}
 function equip(s,id,recompute){const l=init(s),item=l.items.find(i=>i.id===id);if(!item||!slots[item.slot]||l.equipped[item.slot]===id||item.level>(s.level||1))return false;const hp=s.hp/s.maxHp,mp=s.mp/s.maxMp,alive=s.hp>0;l.equipped[item.slot]=id;
  s.equipment??={};s.equipment.body=l.equipped.body==='quest-flax'?'flax':'workwear';recompute(s);s.hp=Math.max(alive?1:0,Math.floor(s.maxHp*hp+1e-9));s.mp=Math.floor(s.maxMp*mp+1e-9);return true;
 }
 function pickSlot(template,rng=Math.random){const entries=Object.entries(Bestiary?.gearWeights[template]||{weapon:.5,body:.5});let value=rng();for(const [slot,weight]of entries){value-=weight;if(value<0)return slot;}return entries[entries.length-1][0];}
 function unequip(s,slot,recompute){const l=init(s);if(!slots[slot]||!l.equipped[slot])return false;const hp=s.hp/s.maxHp,mp=s.mp/s.maxMp,alive=s.hp>0;l.equipped[slot]=null;s.equipment??={};s.equipment.body=l.equipped.body==='quest-flax'?'flax':'workwear';recompute(s);s.hp=Math.max(alive?1:0,Math.floor(s.maxHp*hp+1e-9));s.mp=Math.floor(s.maxMp*mp+1e-9);return true;}
 function toggle(s,id,recompute){const l=init(s),item=l.items.find(i=>i.id===id);return !!item&&(l.equipped[item.slot]===id?unequip(s,item.slot,recompute):equip(s,id,recompute));}
 const gearChances={shell:.12,larva:.05,root:.15,lizard:.15,moth:.12,boar:.20,copperShell:1,mother:1,guardian:1};
 const gearChance=(kind,summoned=false)=>summoned?0:(Bestiary.regional[kind]?1-Object.values(Bestiary.gear[kind]).reduce((miss,g)=>miss*(1-g.chance),1):Bestiary.field?.[kind]?.rate??gearChances[kind]??.12);
 function drop(s,spec,rng=Math.random){init(s);const out=[];
  // Every defeated creature owns its roll. Party size and another creature's
  // rank never change this roll or select its equipment template.
  for(const {kind,summoned} of Bestiary.defeatedFor(spec)){
   if(Bestiary.regional[kind]){
    if(summoned)continue;
    for(const [slot,g] of Object.entries(Bestiary.gear[kind])){
     if(rng()>=g.chance)continue;
     const v=rng(),rarity=v<.55?'green':v<.9?'blue':v<.99?'purple':'orange';
     const item=roll(s,{rarity,slot,template:kind,level:Bestiary.enemies[kind].level,source:Bestiary.enemies[kind].name,rng});item.droppedBy=kind;out.push(item);
    }
    continue;
   }
   const chance=gearChance(kind,summoned);if(chance===0)continue;if(chance<1&&rng()>=chance)continue;
   const boss=['mother','guardian','copperShell'].includes(kind)&&!summoned;
   const value=rng(),weights=summoned?[.8,1,1,1,1]:boss?[0,.55,.9,.99,1]:[.4,.82,.97,.999,1];const rarity=qualities[weights.findIndex(w=>value<w)]?.id||'orange';
   const template=Bestiary.gear[kind]?kind:null,slot=pickSlot(template,rng),name=summoned?'孵化幼蟲':Bestiary.enemies[kind]?.name||({shell:'岩殼蟲',larva:'岩殼幼蟲',root:'荊根獸',mother:'岩殼母蟲',guardian:'銅根守像'}[kind])||kind;
   const item=roll(s,{rarity,slot,template,droppedBy:kind,source:spec.title+' · '+name,rng});item.droppedBy=kind;out.push(item);
  }
  return out;
 }
 const repeatXp=spec=>Bestiary.defeatedFor(spec).reduce((n,e)=>n+(e.summoned?1:spec.flag?0:Bestiary.enemies[e.kind]?.xp||{shell:6,larva:4,root:8,mother:25,guardian:35}[e.kind]||4),0);
 const describe=item=>item.affixes.map(a=>`${affixes[a.key].label} +${format1(a.value)}${affixes[a.key].unit||''}`);
 function salvageResult(item,book=Bestiary){
  if(!item||item.locked||item.sample||item.reference||!slots[item.slot])return null;
  // Coastal gear returns its own species material, using the same stock as battle drops.
  const seaKey=item.template+'-mat';
  if(root.WeaponAscent?.plans[item.template]||book.materials?.[seaKey]){
   return {key:seaKey,count:quality(item.rarity).count>=2?2:1};
  }
  const cost=book.recipes?.[item.template]?.cost;
  // Return the common material used in bulk, never a core or the full crafting cost.
  if(cost){
   const [key,quantity]=Object.entries(cost).reduce((largest,row)=>row[1]>largest[1]?row:largest);
   const byQuality=[1,1,2,2,3][quality(item.rarity).count];
   return {key,count:Math.min(byQuality,quantity-1)};
  }
  const fieldMaterials={shell:'shell',larva:'shell',root:'wood',guardian:'wood',mother:'shell'};
  return {key:fieldMaterials[item.droppedBy]||(item.slot==='weapon'?'ore':'shell'),count:1};
 }
 function salvageYield(s,item){return item&& !Object.values(s.loot.equipped).includes(item.id)?salvageResult(item):null;}
 function salvage(s,id){
  const inventory=init(s).items,index=inventory.findIndex(item=>item.id===id);
  const result=salvageYield(s,inventory[index]);
  if(!result||result.count<1)return null;
  inventory.splice(index,1);
  s.items[result.key]=(s.items[result.key]||0)+result.count;
  return result;
 }
 const api={slots,slotKeys,pickSlot,round1,format1,qualities,quality,affixes,attributeMeta,describeTrait,init,range,roll,stats,equip,unequip,toggle,gearChances,gearChance,drop,repeatXp,describe,salvageResult,salvageYield,salvage};if(typeof module!=='undefined')module.exports=api;else root.Loot=api;
})(typeof window!=='undefined'?window:globalThis);
