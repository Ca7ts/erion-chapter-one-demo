(function(root){'use strict';
 const snap=s=>({items:{...s.items},gear:Object.fromEntries((s.loot?.items||[]).map(i=>[i.id,{name:i.name,rarity:i.rarity,slot:i.slot,template:i.template||null}])),kills:{...s.bestiary?.kills},xp:s.growth?.xp||0});
 function init(s,area=s.area||'village'){
  if(!s.exploration){s.exploration={version:1,serial:1,current:{id:1,area,startedAt:Date.now(),kills:{},items:{},gear:{},xp:0},previous:null,discovered:{items:{},gear:{},monsters:{}},baseline:snap(s)};}
  const e=s.exploration;e.discovered??={items:{},gear:{},monsters:{}};e.discovered.items??={};e.discovered.gear??={};e.discovered.monsters??={};
  for(const [k,n]of Object.entries(s.items||{}))if(n>0)e.discovered.items[k]=true;
  for(const i of s.loot?.items||[])e.discovered.gear[i.name]=true;
  for(const [k,n]of Object.entries(s.bestiary?.seen||{}))if(n)e.discovered.monsters[k]=true;
  for(const [k,n]of Object.entries(s.bestiary?.kills||{}))if(n>0)e.discovered.monsters[k]=true;
  return e;
 }
 function capture(s){
  const e=init(s),before=e.baseline,now=snap(s),trip=e.current;if(!before){e.baseline=now;return;}
  if(trip){
   for(const [k,n]of Object.entries(now.items)){const gain=n-(before.items[k]||0);if(gain>0)trip.items[k]=(trip.items[k]||0)+gain;}
   for(const [id,i]of Object.entries(now.gear))if(!before.gear[id]||before.gear[id].name!==i.name){const key=i.name+'|'+i.rarity;trip.gear[key]??={...i,count:0};trip.gear[key].count++;}
   for(const [k,n]of Object.entries(now.kills)){const gain=n-(before.kills[k]||0);if(gain>0)trip.kills[k]=(trip.kills[k]||0)+gain;}
   trip.xp+=Math.max(0,now.xp-before.xp);
  }e.baseline=now;
 }
 function enter(s,area){const e=init(s,area);capture(s);if(e.current?.area===area)return e.current;
  if(e.current)e.previous={...e.current,endedAt:Date.now()};
  e.current={id:++e.serial,area,startedAt:Date.now(),kills:{},items:{},gear:{},xp:0};e.baseline=snap(s);return e.current;
 }
 function encounter(s,kinds){const e=init(s);s.bestiary??={};s.bestiary.seen??={};for(const k of kinds){e.discovered.monsters[k]=true;s.bestiary.seen[k]=true;}}
 const api={init,capture,enter,encounter};if(typeof module!=='undefined')module.exports=api;else root.ExplorationLedger=api;
})(typeof window!=='undefined'?window:globalThis);
