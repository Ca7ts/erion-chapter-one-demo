(()=>{'use strict';const P=PrivateTest,g=P.game,s=g.state,E=Economy,el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 E.init(s);const names={herb:'止血藥草',ether:'清泉水囊',medicinalLeaf:'療傷藥葉',...TravelItems.names},uses={herb:'恢復90生命',ether:'恢復14精神',medicinalLeaf:'2份可在行囊配製止血藥草 ×1',returnFeather:'返回漁港。尚未到過漁港時，返回高崖營地。',travelPass:'快速前往已解鎖區域，消耗1張。沿道路步行不消耗。'};
 let d;const close=()=>d.close();
 function open(shop,category=shop?'supplies':'craft'){if(g.blocked())return;if(shop&&!['harbor','cliff'].includes(g.hooks.area())){g.hooks.toast('可在高崖或漁港向多莉購買補給。旅途中可在行囊配製傷藥。');return;}g.hooks.stop();
  d??=document.body.appendChild(el('dialog'));d.id='dolly-supplies';d.setAttribute('aria-label',shop?'多莉的藥草鋪':'配製傷藥');d.replaceChildren();d.append(el('h2',shop?'多莉的藥草鋪':'配製傷藥'));const wallet=el('p',E.currency+'　'+E.init(s).balance);wallet.className='shop-wallet';wallet.prepend(ItemIcons.node('drachma'));d.append(wallet);
  if(shop){const nav=el('nav');nav.className='shop-tabs';nav.setAttribute('aria-label','商店分類');for(const [key,name]of [['supplies','療傷補給'],['travel','旅行物資'],['craft','配製傷藥']]){const b=el('button',name);b.setAttribute('aria-pressed',String(category===key));b.onclick=()=>{close();open(shop,key);};nav.append(b);}d.append(nav);}
  const body=el('div');body.className='shop-grid';body.dataset.category=category;d.append(body);
  const keys=category==='travel'?['returnFeather','travelPass']:category==='supplies'?['herb','ether','medicinalLeaf']:[];
  for(const key of keys){const card=el('section');card.append(ItemIcons.node(key),el('h3',names[key]),el('p',uses[key]),el('small','持有 '+(s.items[key]||0)+' · 單價 '+E.prices[key]));const actions=el('div');actions.className='shop-actions';for(const count of [1,3]){const b=el('button','購買 ×'+count+' · '+E.prices[key]*count);b.setAttribute('aria-label','購買'+names[key]+' ×'+count);b.disabled=E.init(s).balance<E.prices[key]*count;b.onclick=()=>{if(g.combat.active)return;if(E.buy(s,key,count)){g.save();close();open(shop,category);}};actions.append(b);}card.append(actions);body.append(card);}
  if(category==='craft'){const recipe=el('section');recipe.append(ItemIcons.node('herb'),el('h3','配製止血藥草'),el('p','療傷藥葉 ×2 → 止血藥草 ×1'),el('small','持有藥葉 '+(s.items.medicinalLeaf||0)+' · 傷藥 '+(s.items.herb||0)));const craft=el('button','配製 ×1');craft.disabled=(s.items.medicinalLeaf||0)<2;craft.onclick=()=>{if(g.combat.active)return;if(E.craftMedicine(s)){g.save();close();open(shop,category);}};recipe.append(craft);body.append(recipe);}
  const footer=el('footer'),back=el('button','返回探索');back.onclick=close;footer.append(back);d.append(footer);d.showModal();
 }
 P.openDollyShop=()=>open(true);P.openMedicine=()=>open(false);
})();

