(()=>{'use strict';
 const P=PrivateTest;let receipt=null,page=0,box=null;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const pageSize=()=>innerHeight<540?3:innerWidth<620?2:6;
 const entries=r=>[...(r.gear||[]).map(item=>({item})),...Object.entries(r.items||{}).filter(([,n])=>n>0).map(([key,n])=>({key,n}))];
 function drawPage(){
  if(!box||box.hidden||!receipt)return;
  const grid=box.querySelector('.victory-loot'),rows=entries(receipt),size=pageSize(),pages=Math.max(1,Math.ceil(rows.length/size));page=Math.min(page,pages-1);grid.replaceChildren();
  for(const row of rows.slice(page*size,(page+1)*size)){
   const card=el('article',undefined,'victory-item'),head=el('div',undefined,'victory-item-head');card.append(head);
   if(row.item){
    const i=row.item,q=Loot.quality(i.rarity);card.style.setProperty('--quality',q.color);head.append(ItemIcons.node(i));const words=el('div');words.append(el('h3',i.name),el('small','裝備等級 '+i.level));head.append(words);
    const base=Object.entries(i.base||{}).filter(([,n])=>n).map(([k,n])=>(Loot.affixes[k]?.label||k)+' +'+Math.round(n)).join(' · ');if(base)card.append(el('p',base,'victory-base'));
    if(i.affixes?.length){const list=el('ul',undefined,'victory-affixes');for(const line of Loot.describe(i))list.append(el('li',line));card.append(list);}
    if(i.trait)card.append(el('p',Loot.describeTrait(i),'gear-miniboss-trait'));
   }else{
    const meta=Bestiary.materials[row.key]||{},fallback=P.itemInfo[row.key];card.style.setProperty('--quality',Loot.quality(meta.tier||'white').color);head.append(ItemIcons.node(row.key));const words=el('div');words.append(el('h3',meta.name||fallback?.[0]||row.key),el('b','× '+row.n));head.append(words);
    card.append(el('small',row.key==='copperShard'?'調查線索':Bestiary.supplies?.[row.key]||['herb','ether'].includes(row.key)?'補給道具':'製作材料'));
   }
   grid.append(card);
  }
  if(!rows.length)grid.append(el('p','本次沒有掉落物品','victory-empty'));
  const pager=box.querySelector('.victory-pages');pager.replaceChildren();pager.hidden=pages<=1;
  for(const [label,offset]of [['上一頁',-1],['下一頁',1]]){const b=el('button',label);b.type='button';b.disabled=page+offset<0||page+offset>=pages;b.onclick=()=>{page+=offset;drawPage();};pager.append(b);if(offset===-1)pager.append(el('span',(page+1)+' / '+pages));}
 }
 P.hideBattleRewards=function(){if(box){box.hidden=true;box.removeAttribute('aria-modal');}receipt=null;document.getElementById('battle')?.classList.remove('victory-settled');};
 P.showBattleRewards=function(r){
  if(!r)return;receipt=r;page=0;
  box=document.getElementById('battle-rewards');if(!box){box=el('section');box.id='battle-rewards';document.getElementById('battle').append(box);}box.replaceChildren();box.hidden=false;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','victory-heading');document.getElementById('battle').classList.add('victory-settled');
  const panel=el('div',undefined,'victory-panel'),header=el('header',undefined,'victory-heading'),mascot=el('div',undefined,'victory-mascot');mascot.setAttribute('aria-hidden','true');const title=el('div');const h=el('h2','戰鬥勝利');h.id='victory-heading';title.append(h);header.append(mascot,title);panel.append(header);
  const xp=el('div',undefined,'victory-xp');xp.append(el('span','獲得經驗'),el('strong','+'+Math.round(r.xp||0)));if(r.level>r.levelBefore)xp.append(el('b','Lv.'+r.levelBefore+' → Lv.'+r.level,'victory-level'));else if(r.level)xp.append(el('span','Lv.'+r.level));panel.append(xp);
  const economy=el('div',undefined,'victory-economy');if(r.coins){const money=el('strong',Economy.currency+' +'+r.coins,'currency-reward');money.prepend(ItemIcons.node('drachma'));economy.append(money);}if(r.recovery&&(r.recovery.hp||r.recovery.mp))economy.append(el('span','戰後整息 · 生命 +'+r.recovery.hp+' / 精神 +'+r.recovery.mp));panel.append(economy);
  panel.append(el('div',undefined,'victory-loot'));
  const footer=el('footer',undefined,'victory-footer');footer.append(el('div',undefined,'victory-pages'));const buttons=el('div',undefined,'victory-actions');const close=el('button','繼續探索');close.type='button';close.className='victory-continue';close.onclick=()=>P.game.combat.closeToMap();buttons.append(close);footer.append(buttons);panel.append(footer);box.append(panel);drawPage();close.focus();
 };
 window.addEventListener('resize',drawPage);
 // Keep keyboard focus inside the result; Escape uses the shared close handler.
 document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!box||box.hidden)return;const buttons=[...box.querySelectorAll('button:not(:disabled)')].filter(n=>n.getClientRects().length);if(!buttons.length)return;const a=buttons[0],z=buttons.at(-1);if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}});
})();

