(()=>{'use strict';
 const top=document.querySelector('.top'),nav=top?.querySelector('nav');if(!nav)return;
 const P=window.PrivateTest,compact=matchMedia('(max-width:1050px)');
 const definitions={
  'travel-bag':{key:'bag',label:'行囊',full:'行囊',primary:true},
  'travel-runes':{key:'runes',art:'growth',label:'符文',full:'符文',primary:true},
  'quest-guide-open':{key:'quest',label:'任務指引',full:'任務指引',primary:true},
  overview:{key:'map',label:'旅程路線',full:'旅程路線',primary:true},
  'travel-tips':{key:'tips',label:'旅途提示',full:'旅途提示'},
  '裝備庫':{key:'equipment',label:'裝備庫',full:'裝備庫',primary:true},
  '成長與獎勵':{key:'growth',label:'本趟收穫',full:'本趟收穫'},
  '棲地與素材':{key:'bestiary',label:'怪物圖鑑',full:'怪物圖鑑'},
  '物品與掉落表':{key:'items',label:'物品圖鑑',full:'物品圖鑑'},
  '繼續未完成選擇':{key:'tips',label:'繼續選擇',full:'繼續未完成選擇',primary:true,pending:true}
 };
 const main=[],secondary=[],owned=new WeakSet();
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const tools=el('dialog');tools.id='journey-tools';tools.setAttribute('aria-labelledby','journey-tools-title');
 const h=el('h2','旅程工具');h.id='journey-tools-title';tools.append(h);
 const tabs=el('div',undefined,'journey-tool-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','工具分類');tools.append(tabs);
 const groups={};let selected='journey';
 for(const [key,name]of [['journey','旅程紀錄'],['settings','顯示與設定']]){
  const tab=el('button',name);tab.type='button';tab.id='journey-tab-'+key;tab.dataset.tab=key;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','journey-group-'+key);tabs.append(tab);
  const section=el('section',undefined,'journey-tool-group');section.id='journey-group-'+key;section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',tab.id);section.hidden=true;tools.append(section);groups[key]=section;
  tab.onclick=()=>select(key);tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const list=[...tabs.children].filter(x=>!x.hidden),i=list.indexOf(tab);const target=e.key==='Home'?list[0]:e.key==='End'?list.at(-1):list[(i+(e.key==='ArrowRight'?1:-1)+list.length)%list.length];select(target.dataset.tab);target.focus();});
 }
 window.ChapterBossTrials?.addEntrances(groups.journey);
 function select(key){selected=key;for(const t of tabs.children){const on=t.dataset.tab===key;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;}for(const [k,s]of Object.entries(groups))s.hidden=k!==key;}
 const launch=el('button','旅程工具');launch.id='journey-tools-open';launch.type='button';launch.setAttribute('aria-haspopup','dialog');launch.setAttribute('aria-controls',tools.id);
 function decorate(node,d){node.classList.add('journey-icon-button');node.dataset.menuIcon=d.key;node.dataset.menuLabel=d.label;node.style.setProperty('--menu-art',`url("${new URL('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/sea-ui/journey-icons-20261101/'+(d.art||d.key)+'.webp',document.baseURI).href}")`);node.setAttribute('aria-label',d.full);node.title=d.full;if(d.pending)node.classList.add('journey-pending');}
 decorate(launch,{key:'settings',label:'旅程工具',full:'旅程工具與顯示設定'});
 launch.onclick=()=>{if(P?.game?.blocked())return;P?.game?.hooks.stop();select('journey');tools.showModal();launch.setAttribute('aria-expanded','true');tabs.querySelector('[aria-selected="true"]').focus();};
 tools.addEventListener('close',()=>{launch.setAttribute('aria-expanded','false');if(!document.querySelector('dialog[open]'))launch.focus({preventScroll:true});});
 // Close the tools layer before invoking the EXISTING button or link handler.
 // This preserves all save, reset confirmation, toggle and gameplay behavior.
 tools.addEventListener('click',e=>{const target=e.target.closest('.journey-tool-group button,.journey-tool-group a');if(target&&!target.disabled)tools.close();},true);
 document.body.append(tools);
 function classify(node){
  if(owned.has(node)||node===launch||!['BUTTON','A'].includes(node.tagName))return;owned.add(node);
  const name=node.textContent.trim(),d=definitions[node.id]||definitions[name];
  if(d){decorate(node,d);(d.primary?main:secondary).push(node);return;}
  const testing=['開始打寶測試戰','試場恢復','測試起點','怪物試場','遭遇警示測試'].includes(name);
  groups.settings.append(node);
 }
 for(const n of [...nav.children])classify(n);
 const menuItems=el('div',undefined,'journey-main-items');menuItems.id='journey-main-items';
 const fold=el('button');fold.id='journey-menu-fold';fold.type='button';fold.setAttribute('aria-controls',menuItems.id);owned.add(fold);owned.add(menuItems);
 let collapsed=false;try{collapsed=localStorage.getItem('erion-main-menu-collapsed-v1')==='1';}catch(_){}
 fold.innerHTML='<svg viewBox="0 0 24 44" aria-hidden="true" focusable="false"><defs><linearGradient id="journey-chevron-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0bb"/><stop offset=".35" stop-color="#d8af62"/><stop offset=".62" stop-color="#866038"/><stop offset="1" stop-color="#f0cb80"/></linearGradient></defs><path class="chevron-engraving" d="M4 4H10V2H14V4H20M4 40H10V42H14V40H20"/><path class="chevron-shadow" d="M7 8L17 23L7 38"/><path class="chevron-metal" d="M7 7L17 22L7 37"/><path class="chevron-light" d="M6 8L15.5 22L6 36"/></svg>';
 function renderFold(){fold.title=collapsed?'展開主選單':'收起主選單';fold.setAttribute('aria-label',fold.title);fold.setAttribute('aria-expanded',String(!collapsed));menuItems.hidden=collapsed;menuItems.inert=collapsed;document.body.dataset.menuCollapsed=String(collapsed);}
 fold.onclick=()=>{collapsed=!collapsed;renderFold();try{localStorage.setItem('erion-main-menu-collapsed-v1',collapsed?'1':'0');}catch(_){}};
 nav.append(fold,menuItems);renderFold();
 const rank={bag:0,runes:1,equipment:2,map:3,tips:4,growth:5,bestiary:6,items:7,quest:9};
 function arrange(){
  for(const n of secondary.filter(n=>n.id==='travel-tips'))groups.journey.append(n);
  const common=[...main,...secondary].filter(n=>n.id!=='travel-tips').sort((a,b)=>(rank[a.dataset.menuIcon]??9)-(rank[b.dataset.menuIcon]??9));
  for(const n of common.filter(n=>n.dataset.menuIcon!=='quest'))menuItems.append(n);menuItems.append(launch);for(const n of common.filter(n=>n.dataset.menuIcon==='quest'))menuItems.append(n);
  tabs.querySelector('[data-tab="journey"]').hidden=false;
 }
 arrange();compact.addEventListener('change',arrange);
 new MutationObserver(records=>{let changed=false;for(const record of records)for(const n of record.addedNodes)if(n.nodeType===1&&n.parentElement===nav&&!owned.has(n)&&n!==launch){classify(n);changed=true;}if(changed)arrange();}).observe(nav,{childList:true});
 top.classList.add('journey-icon-header');nav.setAttribute('aria-label','旅程選單');
 // Only the standalone marker legend belongs in the quest panel. Published
 // builds omit it, making the next sibling the entire game layout instead.
 const legend=top.nextElementSibling;if(legend?.matches('div[style*="position:fixed"]')&&!legend.querySelector('main,#stage,#regions')&&legend.textContent.includes('主線'))legend.classList.add('journey-quest-legend');
 document.documentElement.classList.add('journey-icon-layout');
})();
