(function(root){'use strict';
 const colors={red:'#ff676f',white:'#eeece6',green:'#8fe0a8',blue:'#87ceff',purple:'#d4a1ff',orange:'#ffba68'};
 const questColors={main:'#ffd05a',side:'#76e5ff',craft:'#c9a4f4'};
 const monsterTier=e=>['mother','guardian'].includes(typeof e==='string'?e:e?.kind)?'orange':(typeof e==='string'?e==='copperShell'||root.Bestiary?.enemies[e]?.rare:e?.kind==='copperShell'||e?.rare||root.Bestiary?.enemies[e?.kind]?.rare)?'blue':e?.rank==='special'?'green':'white';
 const itemTier=item=>typeof item==='object'?(item.rarity||item.tier||'white'):(item==='repairedHammer'?'green':root.Bestiary?.materials[item]?.tier||'white');
 const itemColor=item=>colors[itemTier(item)]||colors.white,monsterColor=e=>colors[monsterTier(e)];
 // Equipment quality belongs to the individual drop, never to its monster/template name.
 function markItem(node,item){node.dataset.itemRarity=itemTier(item);node.style.color=itemColor(item);return node;}
 function markCraft(node){node.dataset.questCategory='craft';node.style.color=questColors.craft;return node;}
 function markMonster(node,monster){node.dataset.monsterTier=monsterTier(monster);node.style.color=monsterColor(monster);return node;}
 function dictionary(){
  const entries=new Map();
  for(const [key,name]of Object.entries(root.REGION_ADVENTURE?.itemNames||{}))entries.set(name,{kind:'item',key,color:itemColor(key)});
  for(const [key,item]of Object.entries(root.Bestiary?.materials||{}))entries.set(item.name,{kind:'item',key,color:itemColor(key)});
  for(const c of root.JourneyCatalog||[])entries.set(c.name,{kind:root.Loot?.slotKeys.includes(c.category)&&!['starterHammer','repairedHammer','workwear','flaxArmor','liningArmor'].includes(c.key)?'gear':'item',key:c.key,color:itemColor(c.key)});
  for(const [key,e]of Object.entries({...root.REGION_ADVENTURE?.enemies,...root.Bestiary?.enemies}))entries.set(e.name,{kind:'monster',key,color:monsterColor({...e,kind:key})});
  for(const q of root.REGION_ADVENTURE?.steps||[])entries.set(q[2],{kind:'quest',key:'main',color:questColors.main});
  const quests={main:['主線','別忘了崖巢的獅鷲','回應崖巢的約定','與多莉談談獅鷲的傷勢','回月桂崖巢探望獅鷲，回應同行的約定','請利昂修整礦工重鎚'],side:['支線','委託','尋找小羊','詢問小羊的線索','林地石槽旁尋回藥草','把藥草交給多莉','支坑升降井旁收繩','將繩索交給礦工頭','石槽旁的藥草','升降井旁的繩索','辨認嵌銅甲片'],craft:['請利昂製作韌麻護衣','委託製作韌麻護衣','查看護衣進度','領取韌麻護衣','利昂的材料工坊','材料工坊與銅甲調查','怪物素材工藝','素材工藝','製作完成']};
  for(const [type,names]of Object.entries(quests))for(const name of names)entries.set(name,{kind:'quest',key:type,color:questColors[type]});
  // Match complete, longest names first: 嵌銅岩殼蟲 / 岩殼蟲, 幽燈繭心墜飾 / 幽燈繭心.
  return [...entries].filter(([name])=>name?.length>1).sort((a,b)=>b[0].length-a[0].length);
 }
 function parts(text,entries=dictionary()){
  const result=[];let plain='',i=0;
  while(i<text.length){const entry=entries.find(([name])=>text.startsWith(name,i));if(!entry){plain+=text[i++];continue;}
   if(plain){result.push({text:plain});plain='';}result.push({text:entry[0],...entry[1]});i+=entry[0].length;
  }if(plain)result.push({text:plain});return result;
 }
 const api={colors,questColors,itemTier,itemColor,monsterTier,monsterColor,markItem,markMonster,markCraft,parts};
 if(typeof module!=='undefined')module.exports=api;else root.GameNameColors=api;
 if(!root.document)return;
 const skip='script,style,textarea,input,option,svg,[contenteditable],.undiscovered,[data-game-name],#object-access';
 let entries=dictionary();
 function decorate(container){
  if(!container?.isConnected||container.nodeType!==1||container.closest(skip))return;
  const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT),nodes=[];let n;
  while(n=walker.nextNode())if(n.parentElement&&!n.parentElement.closest(skip)&&n.data.trim())nodes.push(n);
  for(const text of nodes){const rows=parts(text.data,entries);if(!rows.some(r=>r.kind))continue;
   const fragment=document.createDocumentFragment();for(const row of rows){if(!row.kind){fragment.append(document.createTextNode(row.text));continue;}
    const span=document.createElement('span');span.dataset.gameName=row.key;span.dataset.nameKind=row.kind;span.textContent=row.text;
    // Parent renderers set the exact instance's color. In prose, a template has no rolled rarity.
    const context=text.parentElement.closest('[data-item-rarity]');span.style.color=row.kind==='gear'?(context?colors[context.dataset.itemRarity]:'inherit'):row.color;
    if(row.kind==='quest'){span.textContent='';for(const sub of parts(row.text,entries.filter(([,e])=>e.kind!=='quest'))){if(!sub.kind)span.append(document.createTextNode(sub.text));else{const child=document.createElement('span');child.textContent=sub.text;child.dataset.gameName=sub.key;child.style.color=sub.kind==='gear'?'inherit':sub.color;span.append(child);}}}
    fragment.append(span);
   }text.replaceWith(fragment);
  }
 }
 // Incremental legacy-text coverage: no frame loop, no whole-page re-scan on every update.
 const pending=new Set();let scheduled=false;
 const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')pending.add(r.target.parentElement);else for(const n of r.addedNodes)pending.add(n.nodeType===1?n:n.parentElement);}if(!scheduled&&pending.size){scheduled=true;queueMicrotask(flush);}});
 const observe=()=>observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 function flush(){scheduled=false;observer.disconnect();const roots=[...pending];pending.clear();for(const n of roots)if(!roots.some(p=>p!==n&&p?.contains(n)))decorate(n);observe();}
 function start(){entries=dictionary();decorate(document.body);observe();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(typeof window!=='undefined'?window:globalThis);
