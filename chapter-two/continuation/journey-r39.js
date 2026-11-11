(()=>{'use strict';
 const g=SeaGame,S=g.S,s=SeaRPG.state,P=PrivateTest,$=id=>document.getElementById(id);
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 function routeHint(){return '快速通行：區域快速通行券 ×1 · 持有 '+(s.items.travelPass||0)+'　沿道路步行不消耗';}
 let traveling=false;
 async function request(to,key='travelPass'){
  if(traveling||g.battle||!g.ready)return;
  to=key==='returnFeather'?(S.seen.includes('harbor')&&g.allowedArea('harbor')?'harbor':'cliff'):to;
  if(to===S.area){g.toast('你已經在這個區域，不會消耗道具。');return;}
  if(!g.allowedArea(to)||!S.seen.includes(to)){g.toast('這個區域尚未開放，請先推進劇情。');return;}
  if(!(s.items[key]>0)){g.toast('行囊沒有'+TravelItems.names[key]+'。沿道路步行不消耗道具。');return;}
  if(S.active||S.checkpoint){g.toast('請先完成眼前的互動，再使用旅行道具。');return;}
  traveling=true;const from=S.area,d=el('dialog');d.id='travel-consent';
  d.append(el('h2','前往'+SeaNewMaps.config(to,S).name+'？'),el('p','這趟旅程將消耗「'+TravelItems.names[key]+'」×1，你目前持有 '+s.items[key]+'。'));
  const actions=el('div');actions.className='close-confirm-actions';const cancel=el('button','取消'),use=el('button','使用'+TravelItems.names[key]);cancel.dataset.uiIntent='back';use.dataset.uiIntent='confirm';cancel.onclick=()=>d.close();use.onclick=()=>d.close('use');actions.append(cancel,use);d.append(actions);document.body.append(d);d.showModal();cancel.focus();
  await new Promise(resolve=>d.addEventListener('close',resolve,{once:true}));const accepted=d.returnValue==='use';d.remove();
  try{if(!accepted||S.area!==from||!g.allowedArea(to)||!(s.items[key]>0))return;
   $('atlas').close();if(g.blocked())return;g.stop();
   // Decode the destination before spending a ticket. Failed loads leave inventory intact.
   await SeaNewWorld.prepare(to,S.flags);
   if(S.area!==from||g.blocked()||!g.allowedArea(to)||!(s.items[key]>0))return;
   s.items[key]--;g.changeArea(to);if(S.area!==to)s.items[key]++;SeaRPG.save();
  }catch(error){g.toast('未能前往目的地，旅行道具未消耗。'+error.message);}
  finally{traveling=false;JourneyPanels.refreshRoutes();}
 }
 function routes(){if(g.blocked())return;g.stop();const d=$('atlas');d.replaceChildren(el('h2','旅程路線'));const list=el('div');list.id='journey-route';
  for(const [id,m]of Object.entries(g.D.maps)){const card=el('button'),im=el('img');im.loading='lazy';im.alt='';im.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/continuation/new-maps/images/'+(id==='harbor'&&S.flags.repaired?'harbor-restored':id)+'.webp';card.append(im,el('strong',SeaNewMaps.config(id,S).name));card.dataset.journeyArea=id;card.onclick=()=>request(id);list.append(card);}
  d.append(list);JourneyPanels.refreshRoutes();d.showModal();
 }
 Object.assign(TravelItems,{request,routeHint,useFromBag:key=>key==='returnFeather'?request(null,key):routes()});SeaControls.routes=routes;
 const refreshRoutes=JourneyPanels.refreshRoutes.bind(JourneyPanels);
 JourneyPanels.refreshRoutes=()=>{refreshRoutes();for(const card of document.querySelectorAll('[data-journey-area]'))card.setAttribute('aria-label',card.querySelector('strong').textContent+(card.disabled?'，尚未解鎖':''));};
 new ResizeObserver(()=>{const height=document.querySelector('#battle .command-deck').getBoundingClientRect().height;document.getElementById('battle').style.setProperty('--command-deck-height',height+'px');}).observe(document.querySelector('#battle .command-deck'));
 const journey=$('journey-group-journey'),settings=$('journey-group-settings');
 // Same menu renderer, classification, and close affordance as Chapter I.
 if($('journal-open'))journey.prepend($('journal-open'));if($('game-guide-open'))journey.prepend($('game-guide-open'));
 // Bag and runes already use the canonical top-menu panels.
 $('runes-open')?.remove();
 const returnLink=journey.querySelector('a.return');if(returnLink){const back=el('button','返回第一章');back.dataset.uiIntent='back';back.onclick=()=>g.changeArea('chapter-one');returnLink.replaceWith(back);}
 for(const d of document.querySelectorAll('dialog')){const close=d.querySelector('.panel-close-x');if(close)close.setAttribute('aria-label','關閉目前面板');}
 document.documentElement.dataset.chapterInterface='shared-r39';
})();
