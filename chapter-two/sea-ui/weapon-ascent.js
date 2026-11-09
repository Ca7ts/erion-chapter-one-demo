(function(root){
 'use strict';
 const plans={
  'reef-mantis':{name:'虹拳破殼鎚',area:'育幼礁',monster:'虹殼拳蝦',gains:{attack:4},technique:'命中正在蓄力的敵人，下回合普攻同一目標時忽略 2 點防禦。'},
  'core-nautilus':{name:'逆紋螺鎚',area:'潮心內殿',monster:'逆紋鸚鵡螺',gains:{attack:2,mp:3},technique:'主動防禦擋住攻擊後，下次漩流迴擊少耗 2 精神。'}
 };
 // In ascending order, each step uses all the preceding parts and one new grade.
 const ingredients={
  'reef-mantis':[
   ['reef-mantis-mat','虹殼拳節','white','reef-mantis','育幼礁','虹殼拳蝦'],
   ['reef-mantis-rare','虹彩甲片','green','reef-mantis','育幼礁','虹殼拳蝦'],
   ['reef-murex-rare','紫螺旋珠','blue','reef-murex','育幼礁','紫螺鳴后'],
   ['forge-ballast-heart','沉誓壓艙石心','purple','seabed-oath','外海床','沉舟負誓者',.12],
   ['forge-storm-eye','驚濤艏心','orange','harbor-keel','復潮漁港','失泊之艏',.06]
  ],
  'core-nautilus':[
   ['core-nautilus-mat','逆紋殼片','white','core-nautilus','潮心內殿','逆紋鸚鵡螺'],
   ['core-nautilus-rare','珠母旋室','green','core-nautilus','潮心內殿','逆紋鸚鵡螺'],
   ['core-seal-rare','靛潮凝珠','blue','core-seal','潮心內殿','失律潮玦'],
   ['forge-tide-mane','雙鬣凝潮髓','purple','gate-horse','潮門','扼潮雙鬣駒',.12],
   ['forge-votive-seal','迴潮祭印','orange','temple-ewer','海潮神殿外廊','曳盂行祭者',.06]
  ]
 };
 for(const plan of Object.keys(ingredients))ingredients[plan]=ingredients[plan].map(
  ([key,name,tier,enemy,area,monster,dropChance])=>({key,name,tier,enemy,area,monster,dropChance}));
 const caps={white:1,green:2,blue:3,purple:4,orange:5};
 const costs={
  green:[[3,1]],
  blue:[[4,1],[5,2,1]],
  purple:[[5,2],[6,3,2],[7,4,2,1]],
  orange:[[6,3],[7,4,2],[8,5,3,2],[10,6,4,2,1]]
 };
 function requirements(template,quality,current){
  const amounts=costs[quality]?.[current-1];
  return amounts&&amounts.map((cost,index)=>({...ingredients[template][index],cost}));
 }
 const numeral=n=>['','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ'][n]||String(n);
 const chapter=n=>'第'+['','一','二','三','四'][n]+'章';
 // Step 23 is the old chapter-one save's coast finale, not the guardian fight or departure.
 const firstCleared=(s,length=23)=>Number.isInteger(s?.step)&&s.step>=length;
 const clears=(one,two)=>one?(two?2:1):0;
 const progress=s=>Number.isInteger(s.forgeClears)?Math.max(0,Math.min(4,s.forgeClears)):0;
 const supported=item=>item?.slot==='weapon'&&caps[item.rarity]>1&&Object.hasOwn(plans,item.template)&&!item.locked&&!item.reference&&!item.sample;
 function preview(state,id){
  const item=state.loot.items.find(i=>i.id===id);
  if(!supported(item))return {error:'請選擇背包裡的虹拳破殼鎚或逆紋螺鎚。'};
  const current=item.forgeTier??1,cap=caps[item.rarity],next=current+1;
  if(!Number.isInteger(current)||current<1||!cap)return {error:'無法讀取這把鎚的品階。'};
  if(current>cap)return {error:'這把鎚保留舊版已鍛成的數值；依目前品質規則不能再升階。'};
  if(current===cap)return {error:cap===1?'白色武器不能升階。':'已達這把武器的品質上限（'+numeral(cap)+'階）。'};
  const recipe=plans[item.template],needed=requirements(item.template,item.rarity,current);
  if(!needed||!Number.isFinite(item.base?.attack))return {error:'無法讀取這把鎚的品質或攻擊。'};
  const materials=needed.map(m=>({...m,held:state.items[m.key]||0}));
  const after={...item.base};
  for(const [key,value] of Object.entries(recipe.gains))after[key]=(after[key]||0)+value;
  const unlocked=progress(state)>=current;
  const token=JSON.stringify([item.id,item.template,current,item.level,item.rarity,item.base,item.affixes,item.trait,materials.map(m=>[m.key,m.cost]),unlocked]);
  return {item,recipe,after,materials,next,unlocked,requirement:'須完成'+chapter(current)+'主線，才能升至'+numeral(next)+'階。',ready:unlocked&&materials.every(m=>m.held>=m.cost),token};
 }
 function commit(state,id,token){
  const p=preview(state,id);
  if(p.error)return p;
  if(!p.unlocked)return {error:p.requirement};
  if(p.token!==token)return {error:'武器或用料已變更，請重新核對。'};
  if(!p.ready)return {error:'材料不足，尚未升階。'};
  for(const m of p.materials)if(m.cost)state.items[m.key]-=m.cost;
  Object.assign(p.item.base,p.after);p.item.forgeTier=p.next;
  return {item:p.item};
 }
 const api={plans,caps,ingredients,requirements,numeral,chapter,firstCleared,clears,progress,supported,preview,commit};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WeaponAscent=api;
})(typeof window==='undefined'?globalThis:window);
