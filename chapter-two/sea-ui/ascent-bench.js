(() => {
 'use strict';
 const node=(tag,cls)=>Object.assign(document.createElement(tag),{className:cls});
 function create(){
  MythicRites.warmSmith();
  const stage=node('div','ascent-bench'),weapon=node('div','bench-original'),grade=node('b','bench-grade'),
   caption=node('div','bench-caption'),name=node('strong',''),phase=node('span',''),pile=node('div','bench-feed');
  caption.append(name,phase);stage.append(weapon,grade,pile,caption);
  let selected=null,currentArt='',stopAnimation=null;
  function stop(){stopAnimation?.();stopAnimation=null;}
  function show(item,materials=[],message=''){
   if(selected!==item?.id){stop();selected=item?.id||null;}
   if(stopAnimation)return;
   stage.dataset.family=item?.template||'';stage.classList.toggle('smith-empty',!item);
   weapon.hidden=grade.hidden=!item;pile.replaceChildren();
   if(!item){weapon.replaceChildren();currentArt='';name.textContent='天鎚重塑';phase.textContent='選擇要升階的武器';return;}
   const source=MythicRites.awakened(item)||ItemIcons.node(item).src;
   if(source!==currentArt){const img=weapon.firstElementChild||ItemIcons.node(item);img.src=source;img.alt=item.name;if(!img.isConnected)weapon.replaceChildren(img);currentArt=source;}
   grade.textContent=WeaponAscent.numeral(item.forgeTier||1)+' 階';name.textContent=item.name;
   name.style.color=Loot.quality(item.rarity).color;
   phase.textContent=message||'置入符文槽';
   for(const m of materials){const tray=node('span','bench-charge');tray.title=m.name+' ×'+m.cost;
    const n=node('small','');n.textContent='×'+m.cost;tray.append(ItemIcons.node(m.key),n);pile.append(tray);}
  }
  function temper(item,snapshot,onStamp){
   stop();show({...item,forgeTier:snapshot.from},snapshot.materials,'天鎚降臨');
   stage.dataset.tempering='';let finished=false;
   const release=()=>{grade.textContent=WeaponAscent.numeral(item.forgeTier)+' 階';phase.textContent='銘紋覺醒';onStamp?.();};
   const close=()=>{finished=true;stopAnimation=null;delete stage.dataset.tempering;delete stage.dataset.impact;show(item,[],'銘紋覺醒');};
   const cancel=MythicRites.temper(stage,item,snapshot,release,close);if(!finished)stopAnimation=cancel;
  }
  return {stage,show,temper,stop};
 }
 window.LeonTemper={create};
})();
