(function(root){'use strict';
 const effects={
  fracture:{label:'裂甲',rounds:2,defenseReduction:.30,hint:'防禦力降低 30%，不疊加；再次命中刷新持續時間'},
  bleed:{label:'流血',rounds:2,hitRate:.25,maxStacks:3,hint:'每層每回合造成觸發該層之實際命中傷害的 25%；最多 3 層，各持續 2 回合。增減益會影響每次流血傷害；止血藥草清除全部層數'},
  wound:{label:'裂傷',rounds:2,damage:4,hint:'普通攻擊或施放攻擊刻印時失去 4 生命，止血藥草可包紮'},
  venom:{label:'中毒',rounds:3,damage:3,hint:'每回合失去 3 生命'}
 };
 const finite=n=>Number.isFinite(Number(n))?Number(n):0;
 const active=(s,round)=>!!s&&round>=s.from&&round<=s.until;
 const defense=(value,fracture,round)=>Math.floor(Math.max(0,finite(value))*(active(fracture,round)?1-effects.fracture.defenseReduction:1));
 function inflict(statuses,id,round,hitDamage=0,source=null){
  const rule=effects[id];if(!rule)return false;
  const old=statuses[id];
  if(id==='bleed'){
   if(!(hitDamage>0))return false;
   const layers=(old?.layers||[]).filter(l=>l.until>=round);
   // At the cap replace the earliest-expiring wound; never extend other wounds.
   if(layers.length>=rule.maxStacks)layers.splice(layers.reduce((a,l,i)=>l.until<layers[a].until?i:a,0),1);
   layers.push({from:round+1,until:round+rule.rounds,base:hitDamage*rule.hitRate,hitDamage,source});
   statuses[id]={layers,from:Math.min(...layers.map(l=>l.from)),until:Math.max(...layers.map(l=>l.until))};
  }else statuses[id]={from:old?.until>=round?old.from:round+1,until:round+rule.rounds};
  return true;
 }
 // Modifiers are additive within each side and multiplicative across sides.
 // They are evaluated at the tick, applied once, and cannot create healing.
 function modifierPct(actor,stat,round){return finite(actor?.[stat])+(actor?.combatModifiers||[]).filter(m=>m.stat===stat&&(m.from==null||round>=m.from)&&(m.until==null||round<=m.until)).reduce((n,m)=>n+finite(m.value),0);}
 function damage(status,id,round,target,sourceFor=()=>null){
  if(!active(status,round))return 0;
  if(id!=='bleed')return effects[id]?.damage||0;
  const taken=Math.max(0,1+modifierPct(target,'bleedTakenPct',round)/100);
  const raw=(status.layers||[]).filter(l=>active(l,round)).reduce((n,l)=>n+l.base*Math.max(0,1+modifierPct(sourceFor(l.source),'bleedDamagePct',round)/100)*taken,0);
  return raw>0?Math.max(1,Math.round(raw)):0;
 }
 function expire(statuses,round){for(const [id,s]of Object.entries(statuses)){if(id==='bleed'){
  s.layers=(s.layers||[]).filter(l=>l.until>round);if(!s.layers.length){delete statuses[id];continue;}
  s.from=Math.min(...s.layers.map(l=>l.from));s.until=Math.max(...s.layers.map(l=>l.until));
 }else if(s.until<=round)delete statuses[id];}}
 function modifier(actor,{id,stat,value,rounds=2},round){
  if(!actor||!id||!['bleedDamagePct','bleedTakenPct'].includes(stat)||!Number.isFinite(value)||!Number.isInteger(rounds)||rounds<1)return false;
  actor.combatModifiers??=[];actor.combatModifiers=actor.combatModifiers.filter(m=>m.id!==id);
  actor.combatModifiers.push({id,stat,value,from:round,until:round+rounds-1});return true;
 }
 const api={effects,active,defense,inflict,damage,expire,modifier,modifierPct};
 if(typeof module!=='undefined')module.exports=api;else root.CombatStatusRules=api;
})(typeof window==='undefined'?globalThis:window);
