(function(root){'use strict';
 const keys=['attack','defense','hp','mp','crit','skill','attackPct','hpPct','mpPct','defensePct'];
 const slotOrder=['weapon','head','body','hands','feet','neck','ring','belt','cloak'];
 const priorities=slot=>slot==='weapon'?['attack','skill','crit','hp','mp','defense']:['neck','ring'].includes(slot)?['skill','crit','mp','attack','hp','defense']:slot==='hands'?['attack','defense','hp','mp','skill','crit']:['defense','hp','mp','skill','crit','attack'];
 function attributes(i){const out=Object.fromEntries(keys.map(k=>[k,0]));for(const [k,n]of Object.entries(i?.base||{}))out[k]=(out[k]||0)+n;for(const a of i?.affixes||[])out[a.key]=(out[a.key]||0)+a.value;if(i?.trait)out[i.trait.stat]+=i.trait.value;for(const k of Object.keys(out))out[k]=Math.round(out[k]*10)/10;return out;}
 function compare(a,b){const old=attributes(a),next=attributes(b);const rows=keys.filter(k=>old[k]!==next[k]).map(k=>({key:k,old:old[k],next:next[k],delta:Math.round((next[k]-old[k])*10)/10}));const rules=root.LeonPatterns,oldEffects=rules?.plans[a?.relic]?.fixed||[],newEffects=rules?.plans[b?.relic]?.fixed||[];for(const id of new Set([...oldEffects,...newEffects])){const was=Number(oldEffects.includes(id)),now=Number(newEffects.includes(id));if(now!==was)rows.push({key:rules.effects[id][0],old:was,next:now,delta:now-was});}return rows.sort((a,b)=>Math.sign(b.delta)-Math.sign(a.delta));}
 const rarityRank={white:0,green:1,blue:2,purple:3,orange:4,red:5};
 // Compare the full rolled item, including fixed traits; a large HP number is
 // not worth more merely because it uses different units from attack/crit.
 function score(item){const a=attributes(item),weights={attack:1,defense:1.5,hp:.1,mp:.34,crit:2,skill:1.5,attackPct:2,defensePct:2,hpPct:1,mpPct:1};return Math.round(Object.entries(weights).reduce((n,[k,w])=>n+(a[k]||0)*w,0)*100)/100;}
 function sort(items,level){return [...items].sort((a,b)=>(rarityRank[b.rarity]??0)-(rarityRank[a.rarity]??0)||score(b)-score(a)||b.level-a.level||slotOrder.indexOf(a.slot)-slotOrder.indexOf(b.slot)||a.name.localeCompare(b.name)||String(a.id).localeCompare(String(b.id)));}
 function appendProperties(parent,item){
  const doc=parent.ownerDocument;
  function line(tag,text,into=parent){const node=doc.createElement(tag);node.textContent=text;into.append(node);return node;}
  const base=Object.entries(item.base||{}).filter(([,n])=>n).map(([k,n])=>(Loot.attributeMeta[k]?.label||k)+' +'+n+(Loot.attributeMeta[k]?.unit||''));
  if(base.length)line('p',base.join(' · '));
  function section(title){const block=doc.createElement('section');block.className='gear-affix-group';block.setAttribute('aria-label',title);parent.append(block);line('strong',title,block);return block;}
  if(item.relic&&root.LeonPatterns?.plans[item.relic]){const block=section('固定屬性');for(const id of root.LeonPatterns.plans[item.relic].fixed){const node=line('p',root.LeonPatterns.effects[id].join(' · '),block);node.style.color='#76dfd1';}}
  else if(item.trait){const node=line('p',Loot.describeTrait(item),section('固定屬性'));node.style.color='#76dfd1';}
  if(item.affixes?.length){const block=section('隨機屬性'),rules=root.ForgeRules,labels=Loot.describe(item);
   item.affixes.forEach((a,i)=>{const node=line('p',labels[i],block);if(rules)node.style.color=rules.colors[rules.grade(a)];});
  }
 }
 const api={appendProperties,attributes,compare,sort,priorities,score,rarityRank};if(typeof module!=='undefined')module.exports=api;else root.EquipmentView=api;
})(typeof window!=='undefined'?window:globalThis);
