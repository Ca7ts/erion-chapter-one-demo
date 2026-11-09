/* Both chapters use the first chapter's character inventory and progression.
   Story flags, checkpoint positions and reward receipts remain chapter-owned. */
(function(root){'use strict';
 const key='erion-region-adventure-v1', shared='erion-character-v1';
 const fields=['growth','loot','economy','equipment','bestiary','exploration','ui'];
 const copy=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
 function create(storage){
  const read=k=>{try{return JSON.parse(storage.getItem(k)||'null')}catch{return null}};
  function enter(sea,isolated=false){
   if(isolated)return sea.rpg??={flags:{},growth:{version:1,xp:0,receipts:{},history:[],battles:[]},economy:{balance:0},bestiary:{seen:{},kills:{}},ui:{},inventory:{}};
   const first=read(key), previous=sea.rpg;
   if(first){
    const backupKey='erion-chapter-continuity-backup-v1';
    if(!storage.getItem(backupKey))storage.setItem(backupKey,JSON.stringify({first,sea:copy(sea),shared:read(shared)}));
    // A subsequent visit always imports the latest first-chapter save. No max(),
    // inventory addition, starter grant, or equipment re-roll is permitted.
    const r={flags:copy(first.flags||{}),inventory:copy(first.items||{})};
    for(const f of fields)if(first[f]!==undefined)r[f]=copy(first[f]);
    // Retain second chapter's discovery records without replacing C1 discoveries.
    for(const group of ['seen','kills'])r.bestiary={...r.bestiary,[group]:{...previous?.bestiary?.[group],...r.bestiary?.[group]}};
    for(const f of ['audio','audioChosen','motion'])if(typeof first[f]==='boolean')sea[f]=first[f];
    sea.rpg=r;
   }
   sea.rpg??={flags:{},growth:{version:1,xp:0,receipts:{},history:[],battles:[]},economy:{balance:0},bestiary:{seen:{},kills:{}},ui:{},inventory:{}};
   sea.rpg.growth??={xp:0};sea.rpg.growth.receipts??={};sea.rpg.growth.history??=[];sea.rpg.growth.battles??=[];
   sea.rpg.bestiary??={seen:{},kills:{}};sea.rpg.bestiary.seen??={};sea.rpg.bestiary.kills??={};
   return sea.rpg;
  }
  function capture(sea,character,isolated=false){
   if(isolated)return;
   const first=read(key);if(!first)return; // A standalone preview must never invent a completed C1.
   for(const f of fields)if(character[f]!==undefined)first[f]=copy(character[f]);
   for(const f of ['hp','mp','maxHp','maxMp','attack','power','defense','level','critChance','skillPower','support'])if(character[f]!==undefined)first[f]=character[f];
   first.items=copy(character.items);first.active=sea.rune;
   for(const f of ['audio','audioChosen','motion'])if(typeof sea[f]==='boolean')first[f]=sea[f];
   // Never write C2 step/flags/won/side/area over first-chapter story state.
   storage.setItem(key,JSON.stringify(first));
  }
  return {enter,capture};
 }
 if(typeof module!=='undefined')module.exports={create,fields};else root.ChapterContinuity=create(localStorage);
})(typeof window!=='undefined'?window:globalThis);
