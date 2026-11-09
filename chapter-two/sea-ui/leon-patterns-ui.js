(() => {
 'use strict';
 const R=window.LeonPatterns;
 const el=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
 const button=(label,fn,intent)=>{const b=el('button',label);b.type='button';b.onclick=fn;if(intent)b.dataset.uiIntent=intent;return b;};
 function open({state,sea=false,save,back,allowed}){
  if(!allowed())return;
  const old=document.querySelector('dialog[open]');old?.close();
  let d=document.getElementById('leon-patterns');
  if(!d){d=el('dialog','');d.id='leon-patterns';d.setAttribute('aria-label','利昂的專屬圖樣');document.body.append(d);}
  const name=k=>Bestiary.materials[k]?.name||REGION_ADVENTURE.itemNames[k]||k;
  const known=()=>Object.values(R.plans).filter(p=>p.sea===sea&&(state.leonPatterns?.[p.kind]||state.items[p.proof]>0));
  function render(p,receipt){
   const title=el('h2',p?p.name:'利昂的專屬圖樣'),body=el('div',''),foot=el('footer','');d.replaceChildren(title,body,foot);
   body.className='leon-pattern-list';
   if(receipt){body.append(el('p','製作完成'));EquipmentView.appendProperties(body,receipt);}
   else if(p){
    const unlocked=!!state.leonPatterns?.[p.kind],tag=el('strong',p.part);tag.style.color=Loot.quality(p.tier).color;
    body.append(tag);
    for(const id of p.fixed)body.append(el('p',R.effects[id].join(' · ')));
    if(unlocked){
     for(const [k,n] of Object.entries(p.cost))body.append(el('span',name(k)+'　'+(state.items[k]||0)+' / '+n));
     const make=button('確認製作',()=>{if(!allowed())return;const it=R.craft(state,p,Loot);if(it)save();render(p,it);},'confirm');
     make.disabled=!R.funded(state,p);foot.append(make);
    }else{
     foot.append(button('交給利昂',()=>{if(!allowed()||!R.turnIn(state,p))return;save();render(p);},'confirm'));
    }
   }else{
    const list=known();if(!list.length)body.append(el('p','取得特殊部位後，帶回給利昂。'));
    for(const p of list){const ready=!state.leonPatterns?.[p.kind],b=button(ready?'交付 '+p.part:p.name,()=>render(p));
     b.prepend(ItemIcons.node(ready?p.proof:'pattern_'+p.kind));GameNameColors.markItem(b,{rarity:ready?p.tier:p.rarity});body.append(b);}
   }
   foot.append(button(p?'返回圖樣':'返回工坊',()=>{if(p)render();else{d.close();back();}},'back'));
  }
  render();if(!d.open)d.showModal();
 }
 window.LeonPatternUI={open};
 const css=document.createElement('style');
 css.textContent='#leon-patterns{box-sizing:border-box;width:min(33rem,94vw);max-height:90dvh;overflow:auto;text-align:center;color:#efdfbd;background-color:#171719}#leon-patterns .leon-pattern-list{display:grid;gap:.4rem;justify-items:center;padding:.6rem}#leon-patterns button img{width:2rem;height:2rem;object-fit:contain;vertical-align:middle;margin-inline-end:.5rem}#leon-patterns footer{display:flex;justify-content:center;flex-wrap:wrap;gap:.5rem;margin:.65rem}#leon-patterns p{margin:.25em}#leon-patterns button{min-height:44px}';
 css.textContent+=`@media(max-width:950px),(max-height:600px){
 #leon-patterns[open]{display:grid!important;grid-template-rows:auto minmax(0,1fr) auto!important;inset:0!important;margin:auto!important;width:min(34rem,calc(100vw - 24px))!important;max-width:calc(100vw - 24px)!important;max-height:calc(100dvh - 24px)!important;min-height:0!important;transform:none!important;overflow:hidden!important;padding:12px clamp(12px,3vw,26px)!important}
 #leon-patterns .leon-pattern-list{min-height:0;overflow:auto;align-content:start}#leon-patterns footer{position:static!important;min-height:44px;flex-shrink:0;margin:4px 0!important}#leon-patterns h2{font-size:1.2rem;margin:4px 0}#leon-patterns footer button{min-width:44px;min-height:44px}
 }`;
 document.head.append(css);
})();
