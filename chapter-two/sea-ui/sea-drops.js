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
