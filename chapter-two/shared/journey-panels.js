(()=>{'use strict';
 const P=PrivateTest,g=P.game,B=Bestiary,C=JourneyCatalog,L=ExplorationLedger,s=g.state;
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const button=(text,fn,cls)=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;};
 const label={all:'全部',...Object.fromEntries(Loot.slotKeys.map(k=>[k,Loot.slots[k].label])),material:'材料',consumable:'補給',evidence:'證物',runes:'符文',active:'主動技能',support:'輔助刻印',monsters:'怪物',items:'物品',current:'本趟',previous:'上一趟'};
 const book=()=>L.init(s),meta=k=>C.find(c=>c.key===k),itemName=k=>meta(k)?.name||REGION_ADVENTURE.itemNames[k]||k;
 const areaName=k=>REGION_MAPS.areas[k]?.name||k;
 const color=(key,item)=>item?Loot.quality(item.rarity).color:Loot.quality(B.materials[key]?.tier||'white').color;
 const gearKey=i=>ItemIcons.key(i);
 const known=c=>Loot.slotKeys.includes(c.category)?!!s.exploration.discovered.gear[c.name]:!!s.exploration.discovered.items[c.key];
 const gearColor=c=>{const owned=(s.loot?.items||[]).filter(i=>i.name===c.name).sort((a,b)=>Loot.quality(b.rarity).count-Loot.quality(a.rarity).count);return color(c.key,owned[0]);};
 let d,mode='',filter='all',query='',page=0,selected=null,body,grid,detail,tabs,footer,list=[],search,returnAction=null,equipmentDetail='compare',comparisonPage=0;
 const compactEquipment=()=>matchMedia('(max-width:1050px), (max-height:500px)').matches;
 let regionFilter='all',gearTap={id:null,at:0};
 function selectGear(item,event){const now=performance.now(),double=event?.detail!==0&&gearTap.id===item.id&&now-gearTap.at<400;gearTap=double?{id:null,at:0}:{id:item.id,at:now};selected=item.id;comparisonPage=0;if(double&&!g.combat.active&&Loot.toggle(s,item.id,Growth.recompute))g.save();render();}
 const pageSize=()=>mode==='equipment'&&compactEquipment()?6:matchMedia('(max-width:780px), (max-height:500px)').matches?8:12;
 function open(kind,initial='all'){
  if(!d?.open&&g.blocked())return false;
  if(document.getElementById('talk').open)g.suspendInfo();
  g.hooks.stop();d??=document.body.appendChild(el('dialog'));d.id='journey-panel';d.className='journey-panel';d.setAttribute('aria-labelledby','journey-panel-title');
  book();mode=kind;filter=initial;regionFilter='all';query='';page=0;selected=null;returnAction=null;equipmentDetail='compare';comparisonPage=0;render();if(!d.open)d.showModal();return true;
 }
 function heading(text){const h=el('h2',text);h.id='journey-panel-title';d.append(h);}
 function filters(keys){tabs=el('div',undefined,'journal-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','內容分類');
  if(keys.length>6){const select=el('select');select.setAttribute('aria-label','裝備與物品分類');for(const key of keys){const option=el('option',label[key]||key);option.value=key;select.append(option);}select.value=filter;select.onchange=()=>{filter=select.value;page=0;selected=null;render();};tabs.append(select);d.append(tabs);return;}
  for(const key of keys){const b=button(label[key]||key,()=>{filter=key;page=0;selected=null;render();});b.setAttribute('aria-pressed',String(filter===key));tabs.append(b);}d.append(tabs);
 }
 function shell(title,keys,searchable=false){
  const focusSearch=document.activeElement===search,pos=focusSearch?search.selectionStart:null;
  d.dataset.mode=mode;d.replaceChildren();heading(title);
  if(searchable){
   const bar=el('div',undefined,'codex-toolbar');bar.setAttribute('role','group');bar.setAttribute('aria-label','圖鑑篩選');
   const addSelect=(caption,entries,value,change)=>{const field=el('label'),select=el('select');field.append(el('span',caption),select);for(const [id,text] of entries){const opt=el('option',text);opt.value=id;select.append(opt);}select.value=value;select.onchange=()=>{change(select.value);page=0;selected=null;render();d.querySelector('[aria-label="'+caption+'"]').focus();};select.setAttribute('aria-label',caption);bar.append(field);};
   addSelect('地區',[['all','全部地區'],...REGION_MAPS.order.map(k=>[k,areaName(k)])],regionFilter,k=>regionFilter=k);
   if(keys.length)addSelect('物品分類',keys.map(k=>[k,k==='all'?'全部分類':label[k]]),filter,k=>filter=k);
   const field=el('label');search=el('input');search.type='search';search.placeholder='搜尋已發現的名稱';search.setAttribute('aria-label',mode==='catalog'?'搜尋物品':'搜尋怪物');search.value=query;search.oninput=()=>{query=search.value;page=0;selected=null;render();};field.append(el('span','搜尋'),search);bar.append(field);d.append(bar);
  }else filters(keys);
  body=el('div',undefined,'journal-workspace');grid=el('div',undefined,'journal-grid');detail=el('section',undefined,'journal-detail');detail.setAttribute('aria-label','選取項目詳細資料');body.append(grid,detail);d.append(body);footer=el('footer',undefined,'journal-footer');d.append(footer);
  if(focusSearch&&searchable){search.focus();search.setSelectionRange?.(pos,pos);}
 }
 function footerControls(total,empty='目前沒有物品'){
  if(!total)grid.append(el('p',empty,'journal-empty'));const pages=Math.max(1,Math.ceil(total/pageSize()));page=Math.min(page,pages-1);
  const previous=button('‹',()=>{page--;selected=null;render();});previous.setAttribute('aria-label','上一頁');previous.disabled=page<=0;
  const next=button('›',()=>{page++;selected=null;render();});next.setAttribute('aria-label','下一頁');next.disabled=page>=pages-1;
  footer.append(el('span',total+' 項'),previous,el('span',(page+1)+' / '+pages),next,button(returnAction?'取消':'返回探索',()=>{d.close();returnAction?.();},'journal-return'));
 }
 function tile({key,name,icon,quantity,quality,hidden=false,badge},onclick){
  const b=button('',onclick,'journal-slot'+(hidden?' undiscovered':''));b.dataset.entry=key;b.style.setProperty('--item-color',hidden?'#657078':quality||'#eee7d7');
  b.setAttribute('aria-label',hidden?'尚未發現':name+(quantity!==undefined?'，數量 '+quantity:''));b.setAttribute('aria-pressed',String(selected===key));
  const art=el('span',undefined,'journal-slot-art');if(icon)art.append(icon);b.append(art,el('span',hidden?'？？？':name,'journal-slot-name'));
  if(!hidden&&quantity!==undefined)b.append(el('b','×'+quantity,'journal-slot-count'));
  if(!hidden&&badge)b.append(el('small',badge,'journal-slot-badge'));return b;
 }
 function itemArt(c){return ItemIcons.node(c.key);}
 function lines(title,text){if(!text)return;detail.append(el('h4',title),el('p',text));}
 function hiddenDetail(noun){detail.append(el('h3','尚未發現'),el('p',noun==='怪物'?'遭遇後解鎖':'取得後解鎖')); }
 function itemDetail(c,inventory=false,areas=null){
  detail.replaceChildren();if(!known(c)){hiddenDetail('物品');return;}
  const art=itemArt(c);art.classList.add('journal-detail-art');detail.append(art);const h=el('h3',c.name);h.style.color=gearColor(c);detail.append(h);
  lines('分類',label[c.category]);lines('用途',B.materials[c.key]?.use||c.description);if(c.stats)lines('基礎能力',c.stats);
  if(areas)catalogSources(c,areas);
  else{lines('取得方式',c.source);lines('掉落與取得機率',c.chance);}
  if(inventory)lines('目前持有',String(s.items[c.key]||0)+' 件');
  if(inventory&&['returnFeather','travelPass'].includes(c.key)){
   const use=button(c.key==='returnFeather'?'使用 · 返回村莊':'選擇快速通行目的地',()=>{d.close();TravelItems.useFromBag(c.key);},'journal-primary');use.disabled=!(s.items[c.key]>0)||c.key==='returnFeather'&&g.hooks.area()==='village';footer.append(use);
  }
  if(inventory&&B.supplies[c.key]){const use=button('使用 · '+c.name,()=>{if(!g.combat.active&&B.useSupply(s,c.key)){g.save();render();}},'journal-primary');use.disabled=!B.canUseSupply(s,c.key);footer.append(use);}
  if(inventory&&['herb','ether'].includes(c.key)){
   const herb=c.key==='herb',full=herb?s.hp>=s.maxHp:s.mp>=s.maxMp;
   const use=button(herb?'使用 · 恢復85生命':'使用 · 恢復14精神',()=>{if(g.combat.active||!(s.items[c.key]>0))return;s.items[c.key]--;if(herb)s.hp=Math.min(s.maxHp,s.hp+85);else s.mp=Math.min(s.maxMp,s.mp+14);g.save();render();},'journal-primary');use.disabled=full||!(s.items[c.key]>0);footer.append(use);
  }
 }
 function walletNode(){const n=el('span',Economy.currency+' '+Economy.init(s).balance,'journal-wallet');n.prepend(ItemIcons.node('drachma'));return n;}
 function renderBag(){
  shell('行囊',['all','consumable','material','evidence']);
  list=C.filter(c=>!Loot.slotKeys.includes(c.category)&&(s.items[c.key]||0)>0&&(filter==='all'||filter===c.category));
  const slice=list.slice(page*pageSize(),(page+1)*pageSize());if(!slice.some(c=>c.key===selected))selected=slice[0]?.key;
  for(const c of slice)grid.append(tile({key:c.key,name:c.name,icon:itemArt(c),quantity:s.items[c.key],quality:color(c.key)},()=>{selected=c.key;render();}));
  if(selected)itemDetail(meta(selected),true);
  footerControls(list.length,'這個分類還沒有物品');footer.prepend(walletNode(),button('配製傷藥',()=>{d.close();PrivateTest.openMedicine();}),button('裝備庫',()=>open('equipment')));
 }
 function renderRunes(){
  shell('符文',['all','active','support']);
  const has=k=>k==='none'||!!({swift:s.flags.tools,heavy:s.flags.tools,split:s.flags.split,guard:s.flags.guard}[k]);
  const rows=[...['water','earth'].filter(k=>s.flags[k]).map(k=>({key:k,name:Growth.spell(s,k).name,active:true})),...SharedCharacter.supports.filter(([k])=>has(k)).map(([key,name,hint])=>({key,name,hint}))].filter(r=>filter==='all'||(filter==='active'?r.active:!r.active));
  selected=rows.some(r=>r.key===selected)?selected:rows[0]?.key;
  for(const r of rows){const icon=el('img');icon.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/journey-icons-20261101/'+'growth'+'.webp';icon.alt='';
   grid.append(tile({key:r.key,name:r.name,icon,quality:'#a9dce8',badge:r.active?'主動':s.support===r.key?'已裝備':'輔助'},()=>{selected=r.key;render();}));}
  const r=rows.find(r=>r.key===selected);if(r){detail.append(el('h3',r.name));if(r.active){const a=Growth.spell(s,r.key);lines('技能效果','傷害 '+a.damage+' · 精神 '+a.cost+' · 冷卻 '+a.cd+' 次自身行動 · '+a.count+' 個目標');lines('冷卻','兩種刻印獨立計算');}else{lines('刻印效果',r.hint);const b=button(s.support===r.key?'已裝備':'裝備此刻印',()=>{s.support=r.key;g.save();render();},'journal-primary');b.disabled=s.support===r.key;detail.append(b);}}
  footer.append(el('span','輔助刻印 · 一個欄位'),button('返回探索',()=>d.close(),'journal-return'));
 }
 function renderEquipment(){
  shell('裝備庫',returnAction?[filter]:['all',...Loot.slotKeys]);const loot=Loot.init(s);
  list=EquipmentView.sort(loot.items.filter(i=>filter==='all'||i.slot===filter),s.level);
  const slice=list.slice(page*pageSize(),(page+1)*pageSize());if(!slice.some(i=>i.id===selected))selected=slice[0]?.id;
  for(const i of slice)grid.append(tile({key:i.id,name:i.name,icon:ItemIcons.node(i),quality:color(null,i),badge:loot.equipped[i.slot]===i.id?'已裝備':'Lv.'+i.level},event=>selectGear(i,event)));
  const item=list.find(i=>i.id===selected);if(item){
   const art=ItemIcons.node(item);art.classList.add('journal-detail-art');detail.append(art);const h=el('h3',item.name);GameNameColors.markItem(h,item);detail.append(h);
   lines('裝備條件',label[item.slot]+' · 等級 '+item.level);
   const properties=el('section',undefined,'gear-properties');properties.setAttribute('aria-label','詳細屬性與來源');
   EquipmentView.appendProperties(properties,item);
   if(item.source)properties.append(el('p',item.source));
   if(loot.equipped[item.slot]!==item.id){
    const current=loot.items.find(i=>i.id===loot.equipped[item.slot]);
    const viewButtons=el('div',undefined,'equipment-detail-tabs');viewButtons.setAttribute('role','group');viewButtons.setAttribute('aria-label','裝備內容');for(const [key,title]of [['compare','裝備比較'],['details','屬性與來源']]){const b=button(title,()=>{equipmentDetail=key;render();});b.setAttribute('aria-pressed',String(equipmentDetail===key));viewButtons.append(b);}detail.append(viewButtons);
    if(equipmentDetail==='compare'){
     const changes=EquipmentView.compare(current,item),size=compactEquipment()?(innerHeight<350?1:innerHeight<500?2:4):8,pages=Math.max(1,Math.ceil(changes.length/size));comparisonPage=Math.min(comparisonPage,pages-1);
     const currentName=el('p','目前穿戴：'+(current?.name||'未裝備'),'comparison-current');if(current)GameNameColors.markItem(currentName,current);detail.append(currentName);
     const table=el('table',undefined,'gear-comparison'),head=el('tr');for(const text of ['屬性','目前','選取','變化'])head.append(el('th',text));const thead=el('thead');thead.append(head);table.append(thead);
     const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(1),tb=el('tbody');for(const row of changes.slice(comparisonPage*size,(comparisonPage+1)*size)){const unit=Loot.attributeMeta[row.key]?.unit||'',tr=el('tr');tr.append(el('th',Loot.attributeMeta[row.key]?.label||row.key),el('td',fmt(row.old)+unit),el('td',fmt(row.next)+unit));const change=el('td',(row.delta>0?'+':'')+fmt(row.delta)+unit);if(row.delta)change.className=row.delta>0?'stat-up':'stat-down';tr.append(change);tb.append(tr);}table.append(tb);detail.append(table);
     if(!changes.length)detail.append(el('p','此裝備沒有額外數值差異。'));
     if(pages>1){const pager=el('div',undefined,'equipment-comparison-pager'),prev=button('‹',()=>{comparisonPage--;render();}),next=button('›',()=>{comparisonPage++;render();});prev.setAttribute('aria-label','上一頁比較屬性');next.setAttribute('aria-label','下一頁比較屬性');prev.disabled=comparisonPage===0;next.disabled=comparisonPage===pages-1;pager.append(prev,el('span','屬性 '+(comparisonPage+1)+' / '+pages),next);(compactEquipment()&&innerHeight<500?footer:detail).append(pager);}
    }else detail.append(properties);
    const equip=button(item.level>s.level?'等級不足':'確認更換',()=>{if(g.combat.active)return;if(Loot.equip(s,item.id,Growth.recompute))g.save();if(returnAction){d.close();returnAction();}else render();},'journal-primary');equip.disabled=item.level>s.level;footer.append(equip);
   }else{detail.append(el('p','目前已裝備','journal-equipped'));detail.append(properties);footer.append(button('卸下裝備',()=>{if(!g.combat.active&&Loot.unequip(s,item.slot,Growth.recompute)){g.save();render();}},'journal-primary'));}
  }
  footerControls(list.length,'尚未取得此部位的裝備');footer.prepend(el('span','排序：稀有度高 → 低 · 同色依綜合能力','journal-character-stats'));
 }
 const storyEnemies={entrance:['shell'],mine:['shell'],depths:['shell','larva','mother'],annex:['shell'],forest:['root'],cliff:['root'],court:['guardian','root']};
 const regionIndex=new Map();
 function regional(area=g.hooks.area()){if(window.SeaDrops?.region(area))return SeaDrops.region(area);
  if(regionIndex.has(area))return regionIndex.get(area);
  const habitat=area==='depths'?'mine':area;
  const wild=new Set((B.pools[habitat]||[]).flat());
  if(B.regionalFor[habitat])wild.add(B.regionalFor[habitat]);
  if(['mine','depths','annex'].includes(area))wild.add('copperShell');
  const monsters=[...new Set([...wild,...(storyEnemies[area]||[])])],items=new Map();
  const add=(key,text,monster)=>{if(!meta(key))return;if(!items.has(key))items.set(key,[]);items.get(key).push({text,monster});};
  for(const id of monsters){
   for(const [key,n,chance]of B.materialTable(id))add(key,'×'+n+' · '+percent(chance),id);
   if(B.gear[id]){
    for(const [slot,gear] of Object.entries(B.gear[id]))add(id+'-'+slot,percent(gear.chance??B.gearWeights[id][slot]*Loot.gearChance(id)),id);
   }else for(const key of ['mother','guardian'].includes(id)?[id+'-weapon',id+'-body']:['recoveredHammer','mineArmor'])add(key,percent(Loot.gearChance(id)*.5),id);
   if(id==='copperShell')add('copperShard','首次擊敗取得',id);
  }
  for(const event of REGION_ADVENTURE.zones[area]?.events||[]){
   const item={cart:'ore',roots:'wood',herbs:'herb',cloth:'flax'}[event];
   if(item)add(item,'沿途事件 · '+({cart:'翻覆礦車',roots:'倒木荊根',herbs:'採集藥草',cloth:'遺落纖麻'}[event]));
  }
  const rewards={entrance:['ore','ether'],mine:['ore','shell','herb'],forest:['wood'],cliff:['wood'],court:['flax','thread'],village:['herb','repairedHammer','flaxArmor']};
  for(const key of rewards[area]||[])add(key,'任務報酬');
  if(area==='village'){
   for(const key of Object.keys(Economy.prices))add(key,'多莉的藥棚 · '+Economy.prices[key]+' '+Economy.currency);
   for(const key of ['starterHammer','workwear','herb','ether'])add(key,'啟程裝備與補給');
   for(const key of ['thread','liningArmor'])add(key,'利昂工坊');
   for(const kind of Object.keys(B.recipes))for(const slot of Object.keys(B.gear[kind]||{}))if(!['ring','belt'].includes(slot))add(kind+'-'+slot,'利昂工坊 · 素材工藝');
  }
  const region={area,monsters,wild,items};regionIndex.set(area,region);return region;
 }
 const percent=chance=>Number((chance*100).toFixed(2))+'%';
 const regions=()=>REGION_MAPS.order.map(k=>regional(k));
 const includedRegions=()=>regionFilter==='all'?regions():[regional(regionFilter)];
 function renderCatalog(){
  shell('物品圖鑑',['all',...Loot.slotKeys,'material','consumable','evidence'],true);
  const areas=includedRegions(),inRegion=regionFilter==='all'?C:C.filter(c=>areas[0].items.has(c.key));
  list=inRegion.filter(c=>(filter==='all'||filter===c.category)&&(!query.trim()||known(c)&&c.name.includes(query.trim())));
  const slice=list.slice(page*pageSize(),(page+1)*pageSize());if(!slice.some(c=>c.key===selected))selected=slice[0]?.key;
  for(const c of slice)grid.append(tile({key:c.key,name:c.name,icon:itemArt(c),hidden:!known(c),quality:gearColor(c),badge:label[c.category]},()=>{selected=c.key;render();}));
  if(selected){
   const c=meta(selected);itemDetail(c,false,areas);
  }
  footerControls(list.length,'此篩選沒有符合的物品');footer.prepend(el('span','已發現 '+inRegion.filter(known).length+' / '+inRegion.length,'journal-discovery'));
 }
 function catalogSources(c,areas){
  const locations=areas.filter(r=>r.items.has(c.key));
  lines('取得地區',locations.map(r=>areaName(r.area)).join('、'));
  const sources=new Set();
  for(const r of locations)for(const row of r.items.get(c.key)){
   const e=row.monster&&(s.exploration.discovered.monsters[row.monster]?REGION_ADVENTURE.enemies[row.monster].name:'未辨識的怪物');
   sources.add(e?e+' · '+row.text:row.text);
  }
  lines('取得方式與機率',[...sources].join('\n')||c.source);
 }
 function monsterArt(id){if(window.SeaDrops?.enemies[id]){const im=el('img');im.src='continuation/loot-portraits-r38/'+id+'.webp';im.alt='';im.decoding='async';return im;}
  if(['shell','larva','mother','guardian','lizard','moth','root','boar','copperShell','ochreStele','drownedNewt','chainLamplighter','whiteThornStag','galeBronzeWing','brokenCenser','reefTideBearer','screeMask','chainShade','laurelMaw','bronzeHarpy','riftRam','ashAmphora','oathStatue','tidalCrab','saltSerpent','shellLament'].includes(id)){const im=el('img');im.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/media/monster-portraits/'+id+'-r10.webp';im.alt='';im.decoding='async';return im;}
  if(id==='mother'){const im=el('img');im.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/mother-continuity-20261102/map.webp';im.alt='';return im;}
  const e=B.enemies[id];if(e){const im=el('img');im.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/private-monsters/'+e.art;im.alt='';return im;}
  const r=id==='root'?[635,160,595,665]:id==='guardian'?[1230,0,649,822]:[0,350,635,475],svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),im=document.createElementNS('http://www.w3.org/2000/svg','image');
  svg.setAttribute('viewBox',r.join(' '));svg.setAttribute('aria-hidden','true');im.setAttribute('href','https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/characters/enemies.lossless.webp');im.setAttribute('width','1879');im.setAttribute('height','825');svg.append(im);return svg;
 }
 function renderHabitat(){
  shell('怪物圖鑑',[],true);
  const areas=includedRegions(),roster=regionFilter==='all'?Object.keys(REGION_ADVENTURE.enemies):areas[0].monsters;
  const seen=id=>!!s.exploration.discovered.monsters[id],enemy=id=>REGION_ADVENTURE.enemies[id];
  const ranks={white:0,green:1,blue:2,purple:3,orange:4,red:5};
  list=roster.filter(id=>!query.trim()||seen(id)&&enemy(id).name.includes(query.trim())).sort((a,b)=>(ranks[GameNameColors.monsterTier(a)]||0)-(ranks[GameNameColors.monsterTier(b)]||0)||(enemy(a).level||0)-(enemy(b).level||0)||enemy(a).name.localeCompare(enemy(b).name));
  const slice=list.slice(page*pageSize(),(page+1)*pageSize());if(!slice.includes(selected))selected=slice[0];
  for(const id of slice){
   const e=enemy(id),tier=GameNameColors.monsterTier(id);
   const badge=id==='guardian'?'第一章最終頭目':tier==='orange'?'頭目':tier==='blue'?'稀有':areas.some(r=>r.wild.has(id))?'野外遭遇':'劇情遭遇';
   grid.append(tile({key:id,name:e.name,icon:monsterArt(id),hidden:!seen(id),quality:GameNameColors.monsterColor(id),badge},()=>{selected=id;render();}));
  }
  
  if(selected&&!seen(selected))hiddenDetail('怪物');
  else if(selected){
   const e=enemy(selected),art=monsterArt(selected),name=el('h3',e.name);GameNameColors.markMonster(name,selected);
   art.classList.add('journal-detail-art');detail.append(art,name);
   lines('活動地區',regions().filter(r=>r.monsters.includes(selected)).map(r=>areaName(r.area)).join('、'));
   if(regionFilter!=='all')lines('區域等級','Lv.'+B.regionLevels[regionFilter]);
   lines('棲地與特徵',e.habitat);lines('觀察紀錄',B.regional[selected]?.warning||e.description);if(B.field[selected])lines('招式',B.skills[selected].name);
   lines('擊敗紀錄',(s.bestiary?.kills[selected]||0)+' 隻');lines('裝備掉落機率',percent(Loot.gearChance(selected)));
   detail.append(el('h4',B.field[selected]?'材料與補給':'材料掉落'));
   for(const [key,n,p]of B.materialTable(selected)){
    const found=!!s.exploration.discovered.items[key],row=el('p',found?itemName(key)+' ×'+n+' · '+percent(p):'？？？ · 尚未取得');row.style.color=found?color(key):'#849097';detail.append(row);
   }
   if(selected==='larva')lines('孵化幼蟲','戰鬥中由母蟲孵化的幼蟲沒有物品掉落。');
  }
  footerControls(list.length,roster.length?'沒有符合的已發現怪物':'本區沒有怪物');footer.prepend(el('span','已遇見 '+roster.filter(seen).length+' / '+roster.length,'journal-discovery'));
 }
 function renderTrip(){
  shell('探索收穫',['current','previous']);const trip=book()[filter];body.classList.add('trip-workspace');body.replaceChildren();footer.append(button('返回探索',()=>d.close(),'journal-return'));
  if(!trip){body.append(el('p','尚無這趟紀錄','journal-empty'));return;}
  const title=el('div',undefined,'trip-summary');title.append(el('h3',areaName(trip.area)),el('strong','累積經驗 +'+trip.xp));body.append(title);
  const sections=el('div',undefined,'trip-columns');body.append(sections);
  for(const [title,rows]of [['擊敗怪物',Object.entries(trip.kills).map(([k,n])=>({name:B.enemies[k]?.name||REGION_ADVENTURE.enemies[k]?.name||k,n,art:monsterArt(k),color:GameNameColors.monsterColor(k)}))],['取得物品',[...Object.entries(trip.items).map(([k,n])=>({name:itemName(k),n,art:ItemIcons.node(k),color:color(k)})),...Object.values(trip.gear).map(i=>({name:i.name,n:i.count,art:ItemIcons.node(i),color:color(null,i)}))]]]){
   const section=el('section');section.append(el('h3',title));for(const r of rows){const row=el('div',undefined,'trip-row');row.style.color=r.color;row.append(r.art,el('span',r.name),el('b','×'+r.n));section.append(row);}if(!rows.length)section.append(el('p',title==='擊敗怪物'?'尚未擊敗怪物':'尚未取得物品','journal-empty'));sections.append(section);
  }
 }
 function render(){d.className='journey-panel mode-'+mode;d.dataset.pendingAction=String(mode==='equipment'&&!!returnAction);if(mode==='bag')renderBag();else if(mode==='runes')renderRunes();else if(mode==='equipment')renderEquipment();else if(mode==='catalog')renderCatalog();else if(mode==='habitat')renderHabitat();else renderTrip();}
 function refreshRoutes(){
  const atlas=document.getElementById('atlas');atlas.classList.add('discovery-atlas');atlas.querySelector('h2').textContent='旅程路線';let note=atlas.querySelector('.travel-cost-note');if(!note){note=el('p',undefined,'travel-cost-note');atlas.querySelector('h2').after(note);}note.textContent=window.TravelItems?.routeHint?.()||'快速換區消耗區域快速通行券 ×1；沿道路步行不消耗。';
  for(const b of atlas.querySelectorAll('[data-journey-area]')){const key=b.dataset.journeyArea,unlocked=g.canVisit(key);b.classList.toggle('unexplored-route',!unlocked);b.disabled=!unlocked;b.setAttribute('aria-label',areaName(key)+(unlocked?'':'，尚未解鎖'));b.querySelector('img').alt='';}
 }
 P.openEquipment=()=>open('equipment');P.summary=()=>open('trip','current');P.openWildlife=()=>open('habitat','monsters');
 window.JourneyPanels={openBag:()=>open('bag'),openRunes:()=>open('runes'),openCatalog:()=>open('catalog'),openEquipmentSlot:(slot,back)=>{if(open('equipment',slot)){returnAction=back;render();}},refreshRoutes,regional};
 let equipmentResize;window.addEventListener('resize',()=>{clearTimeout(equipmentResize);equipmentResize=setTimeout(()=>{if(d?.open&&mode==='equipment'){page=Math.max(0,Math.floor(list.findIndex(i=>i.id===selected)/pageSize()));comparisonPage=0;render();}},100);});
 document.getElementById('travel-runes').onclick=()=>open('runes');
 book();g.save();refreshRoutes();
})();

