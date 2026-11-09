/* Chapter tasks only: shared character and other chapter storage are never written here. */
(()=>{'use strict';
 const clone=value=>JSON.parse(JSON.stringify(value));
 const keep=['rpg','hp','maxHp','mp','maxMp','herbs','materials','rune','support','audio','audioChosen','motion','items','active','defense'];
 function retain(target,current){for(const k of keep)if(current[k]!==undefined)target[k]=clone(current[k]);return target;}
 function readBackup(storage,key){try{const b=JSON.parse(storage.getItem(key+'-task-reset-backup')||'null');return b?.version===1&&b.state?.version===1?b:null;}catch{return null;}}
 function reset(storage,key,defaults,current,{preserveFlags=['griffin']}={}){
  const previous=clone(current),next=retain(clone(defaults),previous);
  for(const flag of preserveFlags)if(typeof previous.flags?.[flag]==='boolean')next.flags[flag]=previous.flags[flag];
  // Persist the backup first; a full storage quota must never erase the live save.
  storage.setItem(key+'-task-reset-backup',JSON.stringify({version:1,savedAt:new Date().toISOString(),state:previous}));
  storage.setItem(key,JSON.stringify(next));return next;
 }
 function restore(storage,key,current){
  const backup=readBackup(storage,key);if(!backup)throw Error('找不到可復原的任務進度。');
  const next=retain(clone(backup.state),current);
  storage.setItem(key,JSON.stringify(next));return next;
 }
 window.ChapterTaskReset={reset,restore,readBackup};
})();
