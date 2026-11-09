(()=>{'use strict';
 const P=PrivateTest,g=P.game,s=g.state,el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;},button=(text,fn,cls)=>{const n=el('button',text,cls);n.type='button';n.onclick=fn;return n;};
 const portrait='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/erion-tryon-v1/base.webp',top=document.querySelector('.top'),nav=top.querySelector('nav');
 document.body.classList.add('rpg-clean-layout');
 const hud=el('section',undefined,'rpg-hero-hud');hud.setAttribute('aria-label','厄里昂狀態');
 const face=button('',()=>openCharacter(),'rpg-portrait');face.setAttribute('aria-label','開啟厄里昂人物面板');const portraitImage=el('img');portraitImage.src=portrait;portraitImage.alt='厄里昂';face.append(portraitImage);
 const vitals=el('div',undefined,'rpg-vitals'),name=el('strong','厄里昂'),level=el('small');name.append(level);vitals.append(name);
 const bars={};for(const [key,title]of [['hp','生命'],['mp','精神']]){const track=el('div',undefined,'rpg-meter '+key);track.setAttribute('role','progressbar');track.setAttribute('aria-label',title);const fill=el('i'),text=el('span');track.append(fill,text);vitals.append(track);bars[key]={track,fill,text};}hud.append(face,vitals);top.prepend(hud);
 const quest=el('dialog');quest.id='quest-guide-panel';quest.setAttribute('aria-label','任務指引');quest.append(el('h2','任務指引'));document.body.append(quest);
 const ledger=document.getElementById('quest-ledger');quest.append(ledger);
 const side=document.getElementById('side-progress');if(side&&!ledger.contains(side))quest.append(side);
 const legend=document.querySelector('.journey-quest-legend');if(legend&&!legend.matches('.layout')&&!legend.querySelector('main,#stage,#regions')){legend.classList.add('quest-panel-legend');quest.append(legend);}
 const guide=document.getElementById('guide'),oldGuide=guide.onclick;guide.onclick=e=>{quest.close();oldGuide?.call(guide,e);};
 const questButton=button('任務指引',()=>{if(g.blocked())return;g.hooks.stop();quest.showModal();},'journey-icon-button');questButton.id='quest-guide-open';questButton.setAttribute('aria-label','任務指引');questButton.setAttribute('aria-haspopup','dialog');questButton.dataset.menuLabel='任務指引';questButton.dataset.menuIcon='quest';questButton.style.setProperty('--menu-art','url("https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/journey-icons-20261101/quest.webp")');nav.append(questButton);
 const tools=document.getElementById('journey-group-settings'),sound=document.querySelector('#regions details');if(sound)tools.append(sound);
 document.getElementById('regions-toggle')?.remove();
 const map=document.getElementById('minimap'),dock=el('section',undefined,'rpg-minimap-dock');dock.setAttribute('aria-label','小地圖');
 const toggle=button('',()=>{s.ui??={};s.ui.minimapCollapsed=!s.ui.minimapCollapsed;showMini();g.save();},'minimap-toggle');toggle.setAttribute('aria-controls','minimap');dock.append(toggle,map);document.getElementById('world').append(dock);
 function showMini(){const collapsed=!!s.ui?.minimapCollapsed;dock.classList.toggle('collapsed',collapsed);map.hidden=collapsed;toggle.textContent=collapsed?'＋':'−';toggle.setAttribute('aria-label',collapsed?'展開小地圖':'收合小地圖');toggle.setAttribute('aria-expanded',String(!collapsed));}
 showMini();
 let sheet=null,slotChoice=null,slotTap={key:null,at:0};
 function statRows(item){
  const rows=Object.entries(EquipmentView.attributes(item)).filter(([,n])=>n).map(([k,n])=>(Loot.attributeMeta[k]?.label||k)+' +'+(Number.isInteger(n)?n:n.toFixed(1))+(Loot.attributeMeta[k]?.unit||''));
  if(item.forgeTier>1)rows.unshift('利昂工坊 · '+WeaponAscent.numeral(item.forgeTier)+' 階');
  return rows;
 }
 function openCharacter(){
  if(!sheet?.open&&g.blocked())return;if(document.getElementById('talk').open)g.suspendInfo();g.hooks.stop();
  s.ui??={};s.ui.characterFolds??={};
  for(const [selector,key]of [['.character-stat-fold','advanced'],['.character-item-fold','equipment']]){const previous=sheet?.querySelector(selector);if(previous)s.ui.characterFolds[key]=previous.open;}
  const rememberFold=(fold,key)=>{fold.open=!!s.ui.characterFolds[key];fold.addEventListener('toggle',()=>{if(!fold.isConnected)return;s.ui.characterFolds[key]=fold.open;g.save();});};
  sheet??=document.body.appendChild(el('dialog'));sheet.id='character-sheet';sheet.setAttribute('aria-label','厄里昂人物資訊');sheet.dataset.pendingAction=String(!!slotChoice);sheet.replaceChildren();
  const header=el('header');header.append(el('h2','厄里昂'),el('span','Lv.'+s.level));sheet.append(header);
  const xp=el('section',undefined,'character-xp'),lower=Growth.levels[s.level-1]||0,upper=Growth.levels[s.level],progress=upper?s.growth.xp-lower:1,total=upper?upper-lower:1;
  xp.append(el('span',upper?'升級經驗 '+progress+' / '+total:'本章等級已滿'),el('small',upper?'累積 '+s.growth.xp+' · 下一級 '+upper:'累積經驗 '+s.growth.xp));
  const xpTrack=el('div',undefined,'character-xp-track'),xpFill=el('i');xpTrack.setAttribute('role','progressbar');xpTrack.setAttribute('aria-label','升級經驗');xpTrack.setAttribute('aria-valuemin','0');xpTrack.setAttribute('aria-valuemax',String(total));xpTrack.setAttribute('aria-valuenow',String(progress));xpFill.style.width=Math.min(100,progress/total*100)+'%';xpTrack.append(xpFill);xp.append(xpTrack);sheet.append(xp);
  const layout=el('div',undefined,'character-layout paperdoll-layout'),equipment=el('section',undefined,'character-equipment paperdoll-board'),figure=el('div',undefined,'character-figure character-silhouette'),stats=el('section',undefined,'character-stats');layout.append(equipment,stats);sheet.append(layout);
  const full=el('img');full.src=portrait;full.alt='厄里昂全身剪影';figure.append(full);equipment.append(figure);
  const loot=Loot.init(s);equipment.append(el('h3','已穿戴裝備'));const slotGrid=el('div',undefined,'character-slot-grid paperdoll-slots');equipment.append(slotGrid);
  for(const slot of Loot.slotKeys){const title=Loot.slots[slot].label;
   const item=loot.items.find(i=>i.id===loot.equipped[slot]),b=button('',event=>{const now=performance.now(),double=event?.detail!==0&&slotTap.key===slot&&now-slotTap.at<400;slotTap=double?{key:null,at:0}:{key:slot,at:now};slotChoice=slot;if(double&&item&&!g.combat.active&&Loot.unequip(s,slot,Growth.recompute))g.save();openCharacter();},'character-slot'+(item?'':' empty-slot'));b.dataset.slot=slot;b.setAttribute('aria-label',title+'欄位：'+(item?.name||'未裝備'));b.setAttribute('aria-pressed',String(slotChoice===slot));b.style.setProperty('--quality',item?Loot.quality(item.rarity).color:'#77818b');b.append(el('small',title),ItemIcons.node(item||Loot.slots[slot].icon),el('strong',item?.name||'未裝備'));
   const tooltip=el('span',undefined,'equipment-tooltip');tooltip.setAttribute('role','tooltip');tooltip.append(el('strong',item?.name||title+' · 未裝備'));if(item){tooltip.append(el('small','裝備等級 '+item.level));for(const line of statRows(item))tooltip.append(el('span',line));}else tooltip.append(el('span','點選後查看此部位的可用裝備'));b.append(tooltip);slotGrid.append(b);
  }
  stats.append(el('h3','人物能力'));for(const [title,value]of [['生命',s.hp+' / '+s.maxHp],['精神',s.mp+' / '+s.maxMp],['攻擊',s.attack],['防禦',s.defense]]){const row=el('div',undefined,'character-stat-row');row.append(el('span',title),el('b',String(value)));if(title==='生命')VitalColors.apply(row.querySelector('b'),s.hp,s.maxHp);if(title==='精神')VitalColors.apply(row.querySelector('b'),s.mp,s.maxMp,'mp');stats.append(row);}
  const advanced=el('details',undefined,'character-stat-fold');rememberFold(advanced,'advanced');advanced.append(el('summary','進階能力'));
  for(const [title,value]of [['暴擊率',s.critChance+'%'],['技能傷害','+'+s.skillPower+'%']]){const row=el('div',undefined,'character-stat-row');row.append(el('span',title),el('b',String(value)));advanced.append(row);}stats.append(advanced);
  if(slotChoice){const item=loot.items.find(i=>i.id===loot.equipped[slotChoice]),fold=el('details',undefined,'character-item-fold');rememberFold(fold,'equipment');fold.append(el('summary','查看'+Loot.slots[slotChoice].label+'屬性'),el('strong',item?.name||'尚未裝備'));if(item){GameNameColors.markItem(fold.querySelector('strong'),item);EquipmentView.appendProperties(fold,item);}stats.append(fold);}
  const actions=el('footer',undefined,'character-actions');if(slotChoice){const current=loot.items.find(i=>i.id===loot.equipped[slotChoice]);actions.classList.add('has-selection');actions.append(el('span',Loot.slots[slotChoice].label+' · '+(current?.name||'未裝備')),button('更換裝備',()=>{const slot=slotChoice;sheet.close();JourneyPanels.openEquipmentSlot(slot,()=>{slotChoice=null;openCharacter();});},'character-replace'),button('取消',()=>{slotChoice=null;openCharacter();}));}else actions.append(el('span','連點兩下可卸下裝備'));
  if(slotChoice){const current=loot.items.find(i=>i.id===loot.equipped[slotChoice]);if(current)GameNameColors.markItem(actions.querySelector('span'),current);}actions.append(button('返回探索',()=>{slotChoice=null;sheet.close();},'character-close'));sheet.append(actions);if(!sheet.open)sheet.showModal();
 }
 function updateHud(){level.textContent='Lv.'+s.level;for(const [key,max]of [['hp','maxHp'],['mp','maxMp']]){const b=bars[key],value=Math.round(s[key]),limit=Math.round(s[max]);b.fill.style.width=Math.max(0,Math.min(100,value/limit*100))+'%';b.text.textContent=value+' / '+limit;b.track.setAttribute('aria-valuemin','0');b.track.setAttribute('aria-valuemax',String(limit));b.track.setAttribute('aria-valuenow',String(value));VitalColors.apply(b.track,value,limit,key);}}
 updateHud();new MutationObserver(updateHud).observe(document.getElementById('party'),{childList:true,subtree:true,characterData:true});
 window.RpgHUD={openCharacter,updateHud};
})();
