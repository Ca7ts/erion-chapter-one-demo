(() => {
 'use strict';
 // The isolated combat lab has its own action recorder and charge schedule.
 if(document.getElementById('workbench'))return;
 const state=SeaRPG.state,weapon=()=>state.loot.items.find(i=>i.id===state.loot.equipped.weapon)?.template;
 const ready=()=>SeaGame.battle?.spiralReady&&weapon()==='core-nautilus';
 const cost=(base,kind)=>ready()&&kind==='water'?Math.max(0,base-2):base;
 const originalSpell=Growth.spell;
 Growth.spell=(s,kind)=>{const spell=originalSpell(s,kind);spell.cost=cost(spell.cost,kind);return spell;};
 const originalDamage=SeaRPG.damage;
 SeaRPG.damage=(raw,foe,skill)=>{
  const battle=SeaGame.battle;
  if(!battle||weapon()!=='reef-mantis')return originalDamage(raw,foe,skill);
  let target=foe;
  if(!skill&&foe.openingTurn===battle.turn){
   target={...foe,armor:Math.max(0,(foe.armor||0)-2)};delete foe.openingTurn;SeaGame.toast('虹拳破殼鎚 · 破口追擊');
  }
  const amount=originalDamage(raw,target,skill);
  if(battle.turn%3===0&&foe.hp>amount&&foe.openingTurn!==battle.turn+1){
   foe.openingTurn=battle.turn+1;SeaGame.toast('虹拳破殼鎚 · 下回合可追擊');
  }
  return amount;
 };
 window.SeaAscentForms={cost,
  cast(kind){if(ready()&&kind==='water'){SeaGame.battle.spiralReady=false;SeaGame.toast('逆紋螺鎚 · 漩流精神消耗 −2');}},
  guard(b,damage){if(damage>0&&b.playerAction==='guard'&&weapon()==='core-nautilus'&&!b.spiralReady){b.spiralReady=true;SeaGame.toast('逆紋螺鎚 · 守後漩流已就緒');}}
 };
})();
