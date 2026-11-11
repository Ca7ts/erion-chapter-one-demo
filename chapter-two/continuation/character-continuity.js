/* Both chapters use the first chapter's character inventory and progression.
   Story flags, checkpoint positions and reward receipts remain chapter-owned. */
(function(root){'use strict';
 const key='erion-region-adventure-v1', shared='erion-character-v1';
 const fields=['growth','loot','economy','equipment','bestiary','exploration','ui','leonPatterns'];
 const copy=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
 function create(storage){
  const read=k=>{try{return JSON.parse(storage.getItem(k)||'null')}catch{return null}};
  let expected;
  const raw=()=>storage.getItem(key);
  const archive=label=>{const value=JSON.stringify({at:new Date().toISOString(),label,first:read(key),sea:read('erion-sea-chapter-v1'),shared:read(shared)});storage.setItem('erion-continuity-r30-'+label,value);};
  // r29 imported C1 into rpg.inventory, then incorrectly read the old shared
  // proxy for s.items. Only repair that demonstrable replacement, once.
  function repairLegacy(){
   const receiptKey='erion-continuity-r30-repair';
   const equal=(a,b)=>JSON.stringify(Object.entries(a||{}).sort())===JSON.stringify(Object.entries(b||{}).sort());
   const countsEqual=(a,b)=>equal(Object.fromEntries(Object.entries(a||{}).filter(([,v])=>v!==0)),Object.fromEntries(Object.entries(b||{}).filter(([,v])=>v!==0)));
   const receipt=read(receiptKey);
   if(receipt){
    // Journal first: interruption or storage failure can never apply a delta twice.
    if(receipt.pending){const first=read(key);if(first&&equal(first.items,receipt.beforeItems)){first.items=receipt.afterItems;storage.setItem(key,JSON.stringify(first));}if(first&&equal(first.items,receipt.afterItems)){receipt.pending=false;storage.setItem(receiptKey,JSON.stringify(receipt));}}
    return;
   }
   const first=read(key),sea=read('erion-sea-chapter-v1'),old=read('erion-chapter-continuity-backup-v1'),legacy=read(shared);
   if(!first||!old?.first||!old.shared||!sea?.rpg||sea.rpg.continuityVersion===2)return;
   // The old adapter serialized herb/material getters from the shared proxy.
   // After a second entry its imported inventory can itself be the stale baseline.
   const withoutSupplies=v=>({...v,herb:0,seaMaterial:0});
   const originalImport=countsEqual(withoutSupplies(sea.rpg.inventory),withoutSupplies(old.first.items));
   const repeatedEntry=countsEqual(sea.rpg.inventory,old.shared.items)&&equal(first.loot,old.first.loot)&&equal(first.flags,old.first.flags);
   if(!countsEqual(first.items,legacy?.items)||(!originalImport&&!repeatedEntry)||!equal(first.loot,sea.rpg.loot)||first.growth?.xp!==sea.rpg.growth?.xp)return;
   const repaired=[];const items={...first.items};
   for(const k of new Set([...Object.keys(old.first.items||{}),...Object.keys(old.shared.items||{})])){
    const before=old.first.items?.[k]||0,wrong=old.shared.items?.[k]||0,current=items[k]||0;
    if(![before,wrong,current].every(Number.isFinite)||before===wrong)continue;
    // Preserve net gains/consumption since entry; never add two inventories.
    const corrected=Math.max(0,current+before-wrong);
    if(corrected!==current){items[k]=corrected;repaired.push({key:k,from:current,to:corrected});}
   }
   if(!repaired.length)return;
   archive('before-repair');const journal={at:new Date().toISOString(),pending:true,beforeItems:first.items,afterItems:items,items:repaired};
   storage.setItem(receiptKey,JSON.stringify(journal));first.items=items;storage.setItem(key,JSON.stringify(first));
   journal.pending=false;storage.setItem(receiptKey,JSON.stringify(journal));
   console.info('[ChapterContinuity] 已依進入第二章前的備份修復物品，保留期間增減與修復前備份。',JSON.stringify(repaired));
  }
  function readFirst(k=key){if(k===key)repairLegacy();const value=storage.getItem(k);if(k===key)expected=value;try{return JSON.parse(value||'null')}catch{return null}}
  function saveFirst(k,first){
   if(k!==key){storage.setItem(k,JSON.stringify(first));return;}
   if(expected!==undefined&&raw()!==expected){const e=Error('另一分頁已更新角色存檔，已阻止舊資料覆蓋。請重新整理此頁再繼續。');e.name='ChapterSaveConflict';throw e;}
   if(!storage.getItem('erion-continuity-r30-before-save'))archive('before-save');
   const next=JSON.stringify(first);storage.setItem(key,next);expected=next;
  }
  function enter(sea,isolated=false){
   if(isolated)return sea.rpg??={flags:{},growth:{version:1,xp:0,receipts:{},history:[],battles:[]},economy:{balance:0},bestiary:{seen:{},kills:{}},ui:{},inventory:{}};
   const first=readFirst(), previous=sea.rpg;
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
    for(const f of ['hp','mp','maxHp','maxMp','defense','support'])if(first[f]!==undefined)sea[f]=first[f];
    sea.rune=first.active||sea.rune;sea.herbs=first.items?.herb||0;sea.materials=first.items?.seaMaterial||0;
    sea.rpg=r;
   }
   sea.rpg??={flags:{},growth:{version:1,xp:0,receipts:{},history:[],battles:[]},economy:{balance:0},bestiary:{seen:{},kills:{}},ui:{},inventory:{}};
   sea.rpg.continuityVersion=2;
   sea.rpg.growth??={xp:0};sea.rpg.growth.receipts??={};sea.rpg.growth.history??=[];sea.rpg.growth.battles??=[];
   sea.rpg.bestiary??={seen:{},kills:{}};sea.rpg.bestiary.seen??={};sea.rpg.bestiary.kills??={};
   return sea.rpg;
  }
  function capture(sea,character,isolated=false){
   if(isolated)return true;
   if(expected!==undefined&&raw()!==expected)return false;
   const first=read(key);if(!first)return true; // A standalone preview must never invent a completed C1.
   for(const f of fields)if(character[f]!==undefined)first[f]=copy(character[f]);
   for(const f of ['hp','mp','maxHp','maxMp','attack','power','defense','level','critChance','skillPower','support'])if(character[f]!==undefined)first[f]=character[f];
   first.items=copy(character.items);first.active=sea.rune;
   for(const f of ['audio','audioChosen','motion'])if(typeof sea[f]==='boolean')first[f]=sea[f];
   // Never write C2 step/flags/won/side/area over first-chapter story state.
   saveFirst(key,first);return true;
  }
  return {enter,capture,readFirst,saveFirst,repairLegacy,recovery:()=>read('erion-continuity-r30-repair')};
 }
 if(typeof module!=='undefined')module.exports={create,fields};else root.ChapterContinuity=create(localStorage);
})(typeof window!=='undefined'?window:globalThis);
