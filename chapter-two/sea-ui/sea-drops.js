(() => {
  'use strict';
  // In portrait order. Each row is common material, finer material, equipment, slot, temperament, move.
  const rows = [
    ['裂風飛羽','藍光羽軸','裂風飛羽披風','cloak','swift','剪風掠擊'],
    ['鹽角片','角心鹽晶','鹽角岩盔','head','heavy','抵角衝撞'],
    ['笠螺殼','銀紋齒帶','伏崖疊殼甲','body','guard','掀殼刮擊'],
    ['鳴角斷節','共鳴風石','背風雙角戒','ring','heavy','雙角共鳴'],
    ['寄螯甕片','珠光藤壺','甕甲護手','hands','guard','橫螯重擊'],
    ['焦油鰻皮','琥珀鰻筋','索鰻編靴','feet','swift','纜索絞纏'],
    ['軟木浮子','碧眼翎','浮標串鍊','neck','swift','俯身連啄'],
    ['彩眼船木','折槳銅箍','護航眼腰帶','belt','heavy','艏柱破浪'],
    ['虹殼拳節','虹彩甲片','虹拳破殼鎚','weapon','heavy','折肢寸擊'],
    ['礁膽白刺','紫膽珠','藏針腕甲','hands','guard','展刺穿潮'],
    ['花觸細鬚','琥珀花腺','伏沙花披風','cloak','balanced','花冠收束'],
    ['紫螺棘片','紫螺旋珠','鳴后螺紋戒','ring','guard','螺音震潮'],
    ['沙魟背皮','金尖尾刺','車轍軟靴','feet','swift','貼沙掃尾'],
    ['黑蚌殼片','黑礁暗珠','黑礁蚌甲','body','guard','雙殼鉗擊'],
    ['硬鰭骨','貯水小陶罐','負陶骨墜','neck','balanced','骨鰭突進'],
    ['沉舟腹甲','送渡銅幣','負誓渡幣帶','belt','guard','沉舟重踏'],
    ['鏽紅背鰭','玄岩額鱗','裂隙鰭盔','head','balanced','逆流撞礁'],
    ['扣門甲片','翠石鉸節','扣門甲手','hands','guard','鎖甲翻身'],
    ['海鞘囊膜','透潮汲管','雙汲管鍊','neck','balanced','汲流噴湧'],
    ['潮駒銀鬣','扣潮尾鱗','雙鬣扣潮戒','ring','swift','踏浪截流'],
    ['金斑蛾翼','祭焰金鱗粉','啜焰金斑披風','cloak','swift','飛灰振翅'],
    ['祭面碎片','凝鹽淚珠','鹽淚面盔','head','guard','鹽淚飛濺'],
    ['銹金趾爪','祭鷺紅線','銹趾祭靴','feet','swift','長喙穿刺'],
    ['供盂銅耳','祭酒壺嘴','行祭三耳帶','belt','balanced','傾盂迴澆'],
    ['逆紋殼片','珠母旋室','逆紋螺鎚','weapon','balanced','逆旋推擊'],
    ['楔蛇銅鱗','咬楔銅牙','噬楔鱗衣','body','swift','纏楔反咬'],
    ['赤祭晶片','祭髓晶核','裂晶護手','hands','heavy','晶足裂擊'],
    ['潮玦斷玉','靛潮凝珠','失律潮玦戒','ring','balanced','逆潮合環']
  ];
  const profiles={swift:[.82,1.14,1],guard:[1.22,.87,5],heavy:[1.06,1.19,2],balanced:[1,1,3]};
  const slotBase={weapon:{attack:14},head:{hp:12,defense:2},body:{hp:35,defense:4},hands:{attack:3,defense:1},feet:{hp:12,defense:1},neck:{mp:4},cloak:{hp:18},ring:{crit:1.5},belt:{hp:22,defense:1}};
  const levels={cliff:6,harbor:6,reef:7,seabed:8,gate:9,temple:10,core:11};
  const enemies={},gear={},materials={},skills={},regional={},field={},catalog=[],regions={};
  const forgeParts=Object.entries(window.WeaponAscent?.ingredients||{}).flatMap(([template,list])=>list.map(m=>({...m,weapon:WeaponAscent.plans[template].name})));
  function drops(id){return enemies[id]?.drops||[];}
  function region(area){return regions[area];}
  for(const [i,m] of SeaMonsterArt.entries()){
    const [common,fine,equipment,slot,role,move]=rows[i];
    const level=levels[m.region],pair=[[m.id+'-mat',common,.70,'white'],[m.id+'-rare',fine,(m.rare?.16:[.24,.21,.18][i%4]),m.rare?'blue':'green']];
    for(const part of forgeParts.filter(part=>part.enemy===m.id&&part.dropChance))pair.push([part.key,part.name,part.dropChance,part.tier]);
    const pattern=LeonPatterns.plans[m.id];if(pattern)pair.push([pattern.proof,pattern.part,pattern.chance,pattern.tier]);
    const chance=m.rare?[.13,.15,.16,.14,.17,.15,.12][Math.floor(i/4)]:[.10,.12,.14][i%4];
    const [hp,attack,armor]=profiles[role],e=enemies[m.id]={...m,level,habitat:m.note,move,hp,attack,armor,drops:pair.map(([k,,p])=>[k,1,p]),chance,slot};
    skills[m.id]={name:move};field[m.id]={rate:chance}; if(m.rare)regional[m.id]={warning:m.note};
    const profile={name:equipment,base:{...slotBase[slot]},chance};
    if(m.rare)profile.trait={name:['迎風','守泊','迴音','負誓','扼潮','奉盂','逆律'][Math.floor(i/4)],stat:['attackPct','hpPct','mpPct','defensePct','attackPct','hpPct','mpPct'][Math.floor(i/4)],value:1.5};
    gear[m.id]={[slot]:profile};
    const r=regions[m.region]??={area:m.region,monsters:[],wild:new Set(),items:new Map()};r.monsters.push(m.id);r.wild.add(m.id);
    for(const [key,name,p,tier]of pair){
      materials[key]={name,tier,use:m.rare?'可在素材工藝中與同種素材配製兩份清泉水囊。':'可在素材工藝中製作「'+equipment+'」。'};
      if(pattern?.proof===key)materials[key].use=LeonPatterns.catalog(pattern,m.name)[0].description;
      const part=forgeParts.find(part=>part.key===key);
      if(part)materials[key].use=(part.dropChance?'':materials[key].use+' ')+'利昂用於「'+part.weapon+'」升階。';
      catalog.push({key,name,category:'material',source:m.name,chance:p*100+'%',description:materials[key].use});
      r.items.set(key,[{text:Math.round(p*100)+'%',monster:m.id}]);
    }
    if(pattern)catalog.push(LeonPatterns.catalog(pattern,m.name)[1]);
    const k=m.id+'-'+slot;catalog.push({key:k,name:equipment,category:slot,description:'取材自'+m.name+'。',source:m.area+' · '+m.name,chance:Math.round(chance*100)+'%'});
    r.items.set(k,[{text:Math.round(chance*100)+'%',monster:m.id}]);
  }
  window.SeaDrops={enemies,materials,gear,skills,regional,field,catalog,region,levels,drops,rollLevel:e=>Math.max(1,e.level+(Math.random()<.35?1:0))};
})();

;(function(root){'use strict';
 // Stable species/material/slot keys are the save contract. Only new equipment
 // rolls read these profiles; owned instances are never renamed or re-rolled.
 const revision=38;
 const zones={cliff:['海岸高崖',6],harbor:['退潮漁港／復潮漁港',6],reef:['育幼礁',7],seabed:['外海床',8],gate:['潮門',9],temple:['海潮神殿外廊',10],core:['潮心內殿',11]};
 // id, name, slot, common, fine, gear, base, trait name/stat/value,
 // common/fine/equipment chance, physical identity of the approved new model.
 const rows=[
 ['cliff-petrel','裂風鸌','cloak','剪風刃羽','亂流翼髓','剪風裂羽披風',{hp:12,crit:1},'不規則風切','crit',1.4,.74,.26,.20,'雙翼射出多段不規則風切刀鋒，輕羽保留銳利翼緣。'],
 ['cliff-ram','鹽角岩羱','head','鹽晶角片','撞脈角髓','抵角鹽晶戰盔',{hp:14,defense:2},'抵角衝勢','attack',3,.78,.24,.20,'開裂鹽晶巨角與抓地前蹄共同支撐蓄勢突撞。'],
 ['cliff-limpet','伏崖笠螺','body','鋸緣笠甲','刮岩齒帶','伏崖刮岩殼鎧',{hp:26,defense:4},'附崖固守','defense',2,.80,.24,.18,'巨殼後掀，露出沿岩面刮擊的齒舌與附著足。'],
 ['cliff-windhorn','背風鳴角','ring','共鳴角環','雙音角心','雙角迴鳴戒',{mp:3,skill:1},'雙角複響','skill',2.4,.88,.40,.34,'雙角以不同頻率震鳴，交疊聲波向外推進。'],
 ['harbor-crab','甕居寄螯','hands','甕釉螯甲','橫擊螯樞','橫螯甕甲護手',{attack:2,defense:2},'橫螯重勢','attack',2.5,.78,.26,.20,'古陶甕壓住重心，巨大單螯橫向蓄力重擊。'],
 ['harbor-eel','焦油索鰻','feet','焦油鐵索節','瀝黑纜索心','纜索絞纏戰靴',{hp:10,defense:1,attack:1},'鐵索絞勁','attackPct',1.8,.76,.28,.22,'身體由多條裹滿焦油的鐵索盤繞而成，收束時鎖死獵物。'],
 ['harbor-float','浮標啄客','neck','航標喙片','定潮鳴芯','定潮連啄墜',{mp:2,crit:1},'定標連啄','crit',1.5,.72,.28,.22,'航標結構融入骨質鳥身，長喙以多段俯衝連啄鎖定目標。'],
 ['harbor-keel','失泊之艏','belt','幻艏龍骨片','破浪艏心','失泊破浪腰帶',{hp:22,defense:1},'艏柱破浪','hpPct',2.5,.88,.40,.34,'巨型奇幻艏柱與沉舟機關相連，以船首撞開層層海浪。'],
 ['reef-mantis','虹殼拳蝦','weapon','虹殼拳節','液壓虹晶腔','虹拳空泡重鎚',{attack:13,crit:.5},'折肢寸勁','attack',3,.76,.28,.22,'折疊拳螯釋放液壓空泡，多段短距離爆擊留下虹光。'],
 ['reef-urchin','藏針礁膽','hands','反彈礁針','穿潮棘核','展刺穿潮腕甲',{defense:2,crit:.5},'棘陣鋒芒','crit',1.6,.78,.26,.20,'核心內縮後讓銳刺由中心向外展開，穿透倒灌海潮。'],
 ['reef-anemone','伏沙花觸','cloak','絞冠觸纖','收束花腺','伏沙絞冠披風',{hp:14,mp:2},'花冠束流','skill',2,.74,.30,.22,'肉質花冠張開後多段迴旋收束，根部緊抓泥沙。'],
 ['reef-murex','紫螺鳴后','ring','紫螺喉片','震潮聲珠','鳴后震潮聲戒',{mp:4,skill:1},'螺音震潮','skill',2.6,.88,.42,.36,'從口部發出強烈聲波，推起層層海潮向外擴散。'],
 ['seabed-skate','車轍沙魟','feet','伏沙翼膜','掃轍尾刺','掃轍刺尾戰靴',{hp:12,defense:1,crit:.5},'貼沙銳勢','crit',1.7,.76,.28,.22,'扁平翼體貼沙伏行，長尾橫掃時揚起弧形沙塵。'],
 ['seabed-shard','黑礁裂蚌','body','黑礁層殼','壓潮黑珍珠','黑珍珠礁鎧',{hp:28,defense:4},'藏珠蓄壓','skill',2,.80,.28,.20,'厚殼張開，軟體核心蓄壓後噴吐珍珠彈丸。'],
 ['seabed-bone','負陶骨匍','neck','碎鰭骨刺','噴骨陶髓','散骨陶髓墜',{mp:3,attack:1},'不規則骨雨','crit',1.8,.76,.30,.22,'背負古陶的骨體噴發大量不規則魚骨刺。'],
 ['seabed-oath','沉舟負誓者','belt','負誓龜甲','鎮舟潮心','沉舟鎮潮腰帶',{hp:26,defense:2},'龜甲鎮潮','defensePct',3,.90,.42,.36,'巨龜重壓落地，強烈海浪從腹底中心向外擴散並消散。'],
 ['gate-gunnel','裂隙石鳚','head','撞礁額甲','逆流角芯','逆流撞礁盔',{hp:14,defense:2,attack:1},'逆流突勢','attack',3.5,.78,.28,.22,'撞角引導流線型魚身迎著逆流突進。'],
 ['gate-chiton','扣門石鱉','hands','翻鎖甲片','鎖甲鉸核','扣門翻甲護手',{defense:3,hp:6},'層甲固扣','defense',2.5,.82,.28,.20,'層疊甲片逐層翻轉咬合，再以整副重甲砸落。'],
 ['gate-siphon','汲流海鞘','neck','汲流囊膜','多口壓流管','多口汲流墜',{mp:4,skill:2,hp:8},'汲流蓄能','mp',3,.76,.32,.22,'多個口部各自收縮蓄壓，分別噴出強烈水柱。'],
 ['gate-horse','扼潮雙鬣駒','ring','雙首潮鬣','截流雙首髓','雙首截流戒',{attack:2,mp:2},'雙首踏浪','attackPct',2.4,.90,.44,.38,'雙頭神獸抬起前蹄，雙首引流後踏浪截斷水勢。'],
 ['temple-lamp','啜焰礁蛾','cloak','燼紋岩翅','啜焰鱗粉','飛灰啜焰披風',{hp:16,skill:1},'飛灰餘焰','skill',2.4,.78,.30,.22,'岩質雙翼振起層層飛灰，翼脈餘焰在粉塵中流動。'],
 ['temple-mask','鹽淚面靈','head','泣鹽面片','淚隙晶核','泣鹽裂光面盔',{hp:12,defense:2,mp:2},'凝淚晶芒','skill',2.4,.76,.32,.24,'眼眶與面具裂隙蓄光，結晶鹽淚多向爆散。'],
 ['temple-egret','銹趾祭鷺','feet','銹喙刃片','穿祭喙髓','穿祭銹趾戰靴',{attack:2,defense:1,crit:.5},'長喙穿刺','crit',2,.76,.30,.24,'銹翅後收，尖長金屬喙循窄線高速穿刺。'],
 ['temple-ewer','曳盂行祭者','belt','祭袍銅線','迴澆盂心','曳盂祭袍腰封',{hp:20,mp:4},'承盂祭流','mpPct',3,.90,.44,.38,'穿袍祭司操持青銅盂，沿用傾盂迴澆的祭流技能。'],
 ['core-nautilus','逆紋鸚鵡螺','weapon','逆旋殼片','逆潮旋室','逆旋鎮潮重鎚',{attack:13,mp:3},'逆旋蓄潮','skill',2.6,.78,.32,.24,'螺殼反向旋轉，觸手先收束再推動逆流潮汐。'],
 ['core-ring','噬楔銅蛇','body','絞楔銅鱗','反咬楔牙','噬楔絞鱗鎧',{hp:24,defense:4,attack:1},'絞楔反咬','attackPct',2,.80,.30,.22,'青銅節甲繞緊銅楔，昂起金屬毒牙反向噬咬。'],
 ['core-votive','裂晶祭髓','hands','赤髓晶足','裂祭晶核','裂髓踏晶護手',{attack:2,defense:2,skill:1},'晶足裂擊','skill',2.8,.78,.32,.24,'多條赤晶尖足輪番抬起重踏，核心縮合引發晶裂。'],
 ['core-seal','失律潮玦','ring','錯位玦片','逆律潮珠','失律合環戒',{mp:3,skill:2},'逆潮合環','skill',3,.90,.46,.40,'錯位半環咬合輪轉，潮汐先迴旋收束再向外爆發。']
 ];
 const qualityWeights={normal:[['white',.25],['green',.50],['blue',.23],['purple',.02]],rare:[['green',.10],['blue',.60],['purple',.28],['orange',.02]]};
 const labels={attack:'攻擊',hp:'生命上限',mp:'精神上限',defense:'防禦',crit:'暴擊率',skill:'技能傷害',attackPct:'攻擊加成',defensePct:'防禦加成',hpPct:'生命上限加成',mpPct:'精神上限加成'};
 const percent=n=>Number((n*100).toFixed(2))+'%';
 const stats=b=>Object.entries(b).map(([k,n])=>labels[k]+' +'+n+(/Pct$|^(crit|skill)$/.test(k)?'%':'')).join(' · ');
 const definitions=Object.fromEntries(rows.map((r,i)=>{
  const [id,name,slot,common,fine,gear,base,traitName,stat,value,commonChance,fineChance,chance,identity]=r,region=id.split('-')[0],rare=i%4===3;
  return [id,{id,number:i+27,name,region,area:zones[region][0],level:zones[region][1],rare,slot,common,fine,gear,base,trait:{id:'sea-r38-'+id,name:traitName,stat,value},commonChance,fineChance,chance,identity,balanceRevision:revision}];
 }));
 const profile=d=>({name:d.gear,base:{...d.base},trait:{...d.trait},chance:d.chance,balanceRevision:revision});
 function materials(d){const supply=['ring','belt'].includes(d.slot),use=supply?'素材工藝：本種普通素材 ×3、精製素材 ×1，可製作清泉水囊 ×2。':'素材工藝：本種普通素材 ×3、精製素材 ×1，可製作精良「'+d.gear+'」。';return {[d.id+'-mat']:{name:d.common,tier:'white',use},[d.id+'-rare']:{name:d.fine,tier:d.rare?'blue':'green',use}};}
 function catalog(d){return [
  ...Object.entries(materials(d)).map(([key,m])=>({key,name:m.name,category:'material',description:m.use,source:d.area+' · '+d.name,chance:percent(key.endsWith('-mat')?d.commonChance:d.fineChance)})),
  {key:d.id+'-'+d.slot,name:d.gear,category:d.slot,source:d.area+' · '+d.name,chance:percent(d.chance),stats:stats(d.base)+'；'+(d.slot==='weapon'?'另依等級增加攻擊。':d.slot==='body'?'另依等級增加生命。':'依第一章規則附加隨機屬性。'),description:d.identity+' 固定屬性：'+d.trait.name+' · '+stats({[d.trait.stat]:d.trait.value})+'。每隻擊敗的怪物獨立判定；裝備掉落率 '+percent(d.chance)+'。掉落後品質分布：'+qualityWeights[d.rare?'rare':'normal'].map(([k,p])=>({white:'普通',green:'精良',blue:'稀有',purple:'史詩',orange:'傳奇'}[k])+percent(p)).join('、')+'。'}
 ];}
 function rarity(d,rng=Math.random){let v=rng();const weights=qualityWeights[d.rare?'rare':'normal'];for(const [key,p]of weights){v-=p;if(v<0)return key;}return weights.at(-1)[0];}
 function syncCraft(root){
  for(const [id,d]of Object.entries(definitions)){
   const plan=root.WeaponAscent?.plans[id];if(plan)plan.name=d.gear;
   const pattern=root.LeonPatterns?.plans[id];if(pattern)pattern.chance=d.level<8?.10:.12;
  }
  for(const list of Object.values(root.WeaponAscent?.ingredients||{}))for(const part of list){const d=definitions[part.enemy];if(!d)continue;if(part.key===d.id+'-mat')part.name=d.common;if(part.key===d.id+'-rare')part.name=d.fine;if(part.dropChance)part.dropChance=part.tier==='orange'?.08:.16;}
 }
 function applySea(M,root){
  const renamed=Object.entries(root.WeaponAscent?.plans||{}).map(([id,p])=>[p.name,definitions[id]?.gear||p.name]);
  syncCraft(root);
  for(const d of Object.values(definitions)){
   const e=M.enemies[d.id];if(!e)throw Error('Missing Chapter II species '+d.id);
   Object.assign(e,{chance:d.chance,habitat:d.identity,balanceRevision:revision});
   if(M.regional[d.id])M.regional[d.id].warning=d.identity;
   M.gear[d.id][d.slot]=profile(d);M.field[d.id].rate=d.chance;Object.assign(M.materials,materials(d));
   const parts=Object.values(root.WeaponAscent?.ingredients||{}).flat();
   e.drops=e.drops.map(([key,count,p])=>[key,count,key===d.id+'-mat'?d.commonChance:key===d.id+'-rare'?d.fineChance:root.LeonPatterns?.byProof[key]?.chance??parts.find(x=>x.key===key&&x.dropChance)?.dropChance??p]);
   const entries=catalog(d);
   M.catalog=M.catalog.filter(c=>!entries.some(n=>n.key===c.key));M.catalog.push(...entries);
   for(const [key,count,p]of e.drops){const c=M.catalog.find(c=>c.key===key);if(c)c.chance=percent(p);M.region(d.region).items.set(key,[{text:'×'+count+' · '+percent(p),monster:d.id}]);}
   M.region(d.region).items.set(d.id+'-'+d.slot,[{text:percent(d.chance),monster:d.id}]);
  }
  // Ingredient descriptions refer to the same stock keys as the crafting UI.
  for(const [weapon,parts]of Object.entries(root.WeaponAscent?.ingredients||{}))for(const p of parts){if(M.materials[p.key]){let use=M.materials[p.key].use;for(const [oldName,newName]of renamed)use=use.replaceAll(oldName,newName);const note='利昂用於「'+root.WeaponAscent.plans[weapon].name+'」升階。';M.materials[p.key].use=use.includes(note)?use:use+' '+note;const c=M.catalog.find(c=>c.key===p.key);if(c)c.description=M.materials[p.key].use;}}
  M.rollRarity=(e,rng)=>rarity(definitions[e.id],rng);M.balanceRevision=revision;
  return M;
 }
 function attachFirst(book){
  // Registers carried items only; does not put sea monsters into C1 encounters.
  for(const d of Object.values(definitions)){book.gear[d.id]={[d.slot]:profile(d)};Object.assign(book.materials,materials(d));book.enemies[d.id]??={...d};}
  return book;
 }
 function appendCarried(root){
  syncCraft(root);bindIcons(root);const s=root.ChapterRuntime?.game?.state||root.PrivateTest?.game?.state;
  if(!s||!root.JourneyCatalog)return;
  const held=d=>(s.items?.[d.id+'-mat']||0)>0||(s.items?.[d.id+'-rare']||0)>0||s.loot?.items?.some(i=>i.template===d.id)||s.bestiary?.kills?.[d.id];
  for(const d of Object.values(definitions).filter(held))for(const c of catalog(d)){const old=root.JourneyCatalog.find(x=>x.key===c.key);if(old)Object.assign(old,c);else root.JourneyCatalog.push(c);root.REGION_ADVENTURE.itemNames[c.key]=c.name;}
  const extras=[];
  for(const p of Object.values(root.LeonPatterns?.plans||{}).filter(p=>p.sea))if(s.items?.[p.proof]>0||s.leonPatterns?.[p.kind]||s.loot?.items?.some(i=>i.relic===p.kind)){
   const entries=root.LeonPatterns.catalog(p,definitions[p.kind].area+' · '+definitions[p.kind].name);extras.push(...entries);
   root.Bestiary.materials[p.proof]={name:p.part,tier:p.tier,use:entries[0].description};
  }
  for(const [weapon,parts]of Object.entries(root.WeaponAscent?.ingredients||{}))for(const p of parts)if(p.dropChance&&s.items?.[p.key]>0){const description='利昂用於「'+root.WeaponAscent.plans[weapon].name+'」升階。';root.Bestiary.materials[p.key]={name:p.name,tier:p.tier,use:description};extras.push({key:p.key,name:p.name,category:'material',source:p.area+' · '+p.monster,chance:percent(p.dropChance),description});}
  for(const c of extras){const old=root.JourneyCatalog.find(x=>x.key===c.key);if(old)Object.assign(old,c);else root.JourneyCatalog.push(c);root.REGION_ADVENTURE.itemNames[c.key]=c.name;}
 }
 function bindIcons(root){const icons=root.ItemIcons;if(!icons||icons.seaRevision===revision)return;const original=icons.node;icons.node=function(item){const image=original.call(this,item),key=this.key(item),sea=Object.values(definitions).some(d=>[d.id+'-mat',d.id+'-rare',d.id+'-'+d.slot].includes(key))||/^forge-(ballast-heart|storm-eye|tide-mane|votive-seal)$/.test(key);if(sea&&!root.MythicRites?.awakened(item))image.src=(root.SeaDrops?'':'chapter-two/')+'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/sea-ui/items-painted-20261101/'+key+'.webp';return image;};icons.seaRevision=revision;}
 const api={revision,definitions,zones,qualityWeights,profile,materials,catalog,rarity,stats,applySea,attachFirst,appendCarried,syncCraft,bindIcons};
 if(typeof module!=='undefined')module.exports=api;else root.ChapterTwoLoot=api;
})(typeof window!=='undefined'?window:globalThis);

;ChapterTwoLoot.applySea(SeaDrops,window);