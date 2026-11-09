/* Approved aquatic merfolk / cinematic-only story frames, 2026-10-24.
   Does not modify voice, story text, saves, or exploration movement. */
(()=>{
'use strict';
const plans={}, used=new Set();
const pic=(name,panel=0,old=false,cols=2,rows=2)=>({src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/'+(old?'chapter-two-v2/':'chapter-two-cinema-v3/')+name+'.webp',panel,cols,rows});
function set(event,a,b,name,panel=0,old=false,cols=2,rows=2){
 const frame=pic(name,panel,old,cols,rows); used.add(frame.src);
 for(let i=a;i<=b;i++)plans[event+':'+i]={...frame};
}
function ranges(e,list){for(const r of list)set(e,...r);}
ranges('R2-00',[[0,2,'arrival',0],[3,4,'harbor',3],[5,6,'arrival',1],[7,10,'arrival',2],[11,11,'arrival',3],[12,12,'arrival',0]]);
ranges('R2-01',[[0,2,'harbor',0],[3,10,'harbor',1],[11,12,'harbor',2],[13,14,'harbor',1],[15,16,'harbor',3]]);
ranges('R2-02',[[0,1,'reef',1],[2,8,'reef',0],[9,10,'reef',1],[11,14,'reef',0],[15,16,'reef',2],[17,19,'reef',0]]);
ranges('R2-03',[[0,3,'logistics',0],[4,4,'evacuation',0],[5,8,'evacuation',3],[9,9,'logistics',1],[10,12,'bridge',1,false,3,2],[13,13,'evacuation',1],[14,16,'evacuation',2],[17,21,'bridge',0,false,3,2]]);
ranges('R2-04',[[0,6,'investigation',1,false,3,2],[7,15,'investigation',2,false,3,2],[16,18,'investigation',4,false,3,2],[19,20,'arrival',1],[21,25,'investigation',4,false,3,2]]);
ranges('R2-05',[[0,13,'investigation',3,false,3,2],[14,15,'reef',3],[16,20,'investigation',5,false,3,2]]);
ranges('R2-06',[[0,0,'investigation',4,false,3,2],[1,6,'logistics',2],[7,8,'boat',0],[9,11,'boat',1],[12,16,'boat',2],[17,18,'boat',3],[19,20,'bridge',3,false,3,2],[21,22,'return',0],[23,23,'return',1],[24,25,'return',2],[26,28,'return',3]]);
ranges('R2-07',[[0,7,'bridge',2,false,3,2],[8,8,'details',0],[9,11,'care',0],[12,12,'care',1],[13,14,'details',1],[15,18,'healing',0,true]]);
ranges('R2-08',[[0,6,'night',0],[7,7,'night',2],[8,17,'night',3],[18,18,'care',2],[19,19,'night',1]]);
ranges('R2-09',[[0,1,'convoy',0],[2,4,'arrival',1],[5,5,'continuity-objects',2,true],[6,7,'night',3],[8,15,'convoy',1],[16,17,'convoy',2],[18,18,'convoy',3],[19,21,'continuity-objects',3,true]]);
ranges('R2-10',[[0,0,'continuity-extra',3,true],[1,21,'healing',3,true],[22,22,'care',3],[23,24,'night',3]]);
ranges('R2-11',[[0,6,'kraken',0],[7,7,'kraken',1],[8,9,'kraken',0]]);
ranges('R2-11A',[[0,2,'kraken',0],[3,3,'kraken-aid',0,true],[4,4,'kraken-aid',1,true],[5,6,'kraken-aid',2,true],[7,8,'kraken-aid',3,true],[9,9,'kraken',3],[10,13,'quiet-return',1,true]]);
ranges('R2-11B',[[0,0,'kraken',1],[1,2,'kraken',2],[3,3,'kraken',3],[4,9,'quiet-return',0,true]]);
ranges('R2-12',[[0,2,'outcomes',0,true],[3,3,'quiet-return',1,true],[4,4,'outcomes',0,true],[5,9,'thresholds',0,true],[10,12,'thresholds',3,true],[13,13,'thresholds',1,true],[14,18,'thresholds',1,true],[19,19,'thresholds',2,true]]);
ranges('R2-13',[[0,1,'thresholds',2,true],[2,2,'core-final',0,true],[3,17,'core-dialogue',0,true,1,1]]);
ranges('R2-14',[[0,3,'core-twelve',0,true,1,1],[4,6,'core-detail',1,true],[7,10,'core-detail',2,true],[11,12,'core-twelve',0,true,1,1],[13,15,'core-detail',3,true],[16,16,'core-final',2,true],[17,17,'core-final',3,true],[18,22,'outcomes',1,true],[23,25,'core-release',0,true],[26,27,'core-release',1,true],[28,28,'core-release',2,true],[29,30,'details',2]]);
ranges('R2-15',[[0,1,'continuity-extra',0,true],[2,4,'logistics',3],[5,5,'quiet-return',1,true],[6,6,'quiet-return',0,true],[7,8,'logistics',3],[9,22,'ending',0],[23,25,'details',3],[26,26,'quiet-return',2,true],[27,33,'ending',1]]);
ranges('R2-16',[[0,1,'divine',0],[2,3,'divine',1],[4,11,'divine',2],[12,12,'continuity-extra',1,true],[13,14,'divine',3],[15,20,'ending',2],[21,24,'divine',3],[25,25,'ending',3]]);
const chats=[['harbor',1],['reef',0],['reef',3],['arrival',2],['arrival',1],['return',3],['details',3],['thresholds',1,true],['quiet-return',1,true],['quiet-return',0,true],['divine',3],['ending',0],['ending',0]];
chats.forEach((p,i)=>set('chat-'+i,0,20,...p));
set('R2-12',5,9,'continuity',0);
set('R2-12',10,13,'continuity',1);
set('R2-16',12,12,'continuity',2);
set('R2-09',2,4,'continuity',3);
// Only replace edited panels, leaving unrelated artwork byte-for-byte unchanged.
const divinePanels={arrival:[2],reef:[2],evacuation:[3],night:[3],details:[1],divine:[0,1,2,3],continuity:[1,2],ending:[3],thresholds:[1,3],'core-dialogue':[0],'core-release':[0]};
for(const shot of Object.values(plans)){
 const name=shot.src.split('/').pop().replace('.webp','');
 if(divinePanels[name]?.includes(shot.panel)){shot.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-divinity-v4/'+name+'.webp';used.add(shot.src);}
}
for(const shot of Object.values(plans)){
 const name=shot.src.split('/').pop().replace('.webp','');
 if(name==='divine'||name==='ending'&&shot.panel===3||name==='continuity'&&shot.panel===2){shot.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-poseidon-scale-v5/'+name+'.webp';used.add(shot.src);}
}
// Approved chapter-one Erion likeness, arrival storyboard only (2026-10-24).
// Run after divine overrides so the translucent apparition panel uses the approved edit too.
for(const shot of Object.values(plans)){
 if(shot.src.endsWith('/arrival.webp')){
  shot.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v6/arrival.webp';used.add(shot.src);
 }
}
// Chapter-one approved likeness across all remaining chapter-two story appearances.
const erionContinuityPanels={"harbor":[0,1,2,3],"reef":[0,1,2,3],"logistics":[0,1,2],"evacuation":[0,1,2,3],"bridge":[0,1,2,3],"boat":[0,1,2,3],"return":[0,1,2,3],"care":[0,1,2,3],"night":[0,2,3],"details":[1,3],"convoy":[0,1,2,3],"healing":[0,3],"kraken":[0,1,2,3],"kraken-aid":[0,2,3],"quiet-return":[0,1],"thresholds":[1,2],"core-dialogue":[0],"core-detail":[1,3],"core-final":[0,2,3],"core-release":[0,1,2],"divine":[0,1,2,3],"ending":[0,1,2,3],"continuity":[0,1,2,3],"continuity-extra":[0,3],"continuity-objects":[2,3]};
for(const shot of Object.values(plans)){
 const name=shot.src.split('/').pop().replace('.webp','');
 if(erionContinuityPanels[name]?.includes(shot.panel)){
  shot.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/'+name+'.webp';
  used.add(shot.src);
 }
}
for(const shot of Object.values(plans)){
 if(shot.src==='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/kraken.webp' && shot.panel===0){
  shot.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/kraken-shoulder.webp';used.add(shot.src);
 }
}
// Dialogue-only corrections: never reuse rescue/council action stills for quiet conversation.
const dialogueSheet='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/dialogue-interaction-v1/chapter-two.webp';
for(const [index,panel] of [[5,1],[8,0],[11,2],[12,3]]){
 for(let i=0;i<=20;i++)plans['chat-'+index+':'+i]={src:dialogueSheet,panel,cols:2,rows:2};
}
// The wary kraken branch is recollected in conversation, not a fresh encounter.
for(let i=0;i<=20;i++)plans['chat-9:'+i]={src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/ending.webp',panel:1,cols:2,rows:2};
used.add(dialogueSheet);
const reefTalk='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/dialogue-interaction-v1/oreia-reef-v2.webp';
for(const [key,shot]of Object.entries(plans))if((shot.src==='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/reef.webp'&&shot.panel===0)||key.startsWith('chat-1:'))plans[key]={src:reefTalk,panel:0,cols:1,rows:1};
used.add(reefTalk);
// Approved Oreia / Erion continuity: story action shots are separate from quiet chats.
const oreiaMain='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/dialogue-interaction-v1/oreia-main-v3.webp',oreiaJar='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/dialogue-interaction-v1/oreia-jar-v3.webp';
const oreiaRows=[0,0,1,1,1,-1,-1,-1,2,2,2,-1,-1,3,4,4,4,-1,5,5];
oreiaRows.forEach((panel,row)=>{plans['R2-02:'+row]=panel<0?{src:reefTalk,panel:0,cols:1,rows:1}:{src:oreiaMain,panel,cols:2,rows:3};});
for(let i=0;i<=20;i++)plans['chat-11:'+i]={src:oreiaJar,panel:0,cols:1,rows:1};
used.add(oreiaMain);used.add(oreiaJar);
// User approved Erion revisions; retain original Poseidon design and pact translucency.
const approvedAppearance20261025=[{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v6/arrival.webp","panels":[0,1,2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/0.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/harbor.webp","panels":[3,0,1,2],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/1.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/dialogue-interaction-v1/oreia-main-v3.webp","panels":[0,1,2,3,4,5],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/2.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/logistics.webp","panels":[0,1,2],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/4.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/evacuation.webp","panels":[0,3,1,2],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/5.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/bridge.webp","panels":[1,0,3,2],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/6.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/boat.webp","panels":[0,1,2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/9.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/return.webp","panels":[0,1,2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/10.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/care.webp","panels":[0,1,2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/12.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/details.webp","panels":[1,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/13.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/healing.webp","panels":[0,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/14.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/night.webp","panels":[0,2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/15.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/convoy.webp","panels":[0,1,2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/17.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/continuity.webp","panels":[3,0,1,2],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-original-18.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/continuity-objects.webp","panels":[2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/19.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/continuity-extra.webp","panels":[3,0],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/20.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/kraken.webp","panels":[1,3,2],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/22.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/kraken-aid.webp","panels":[0,2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/23.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/quiet-return.webp","panels":[1,0],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/25.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/thresholds.webp","panels":[1,2],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/27.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/core-final.webp","panels":[0,2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/28.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/core-dialogue.webp","panels":[0],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-original-29.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/core-detail.webp","panels":[1,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/31.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/core-release.webp","panels":[0,1,2],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-original-33.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/ending.webp","panels":[0,1,2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-original-35.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-erion-continuity-v7/divine.webp","panels":[0,1,2,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-original-37.webp"},{"src":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/dialogue-interaction-v1/chapter-two.webp","panels":[1,0,3],"target":"https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-appearance-preview-20261025/38.webp"}];
for(const shot of Object.values(plans)){
 const match=approvedAppearance20261025.find(x=>x.src===shot.src&&x.panels.includes(shot.panel));
 if(match){shot.src=match.target;used.add(shot.src);}
}
// Correct full-body pact opacity and final-scene crown; unrelated panels stay approved.
for(const shot of Object.values(plans)){
 const match=shot.src.match(/poseidon-original-(18|35|37)\.png$/);
 if(match && (match[1]==='37'||match[1]==='18'&&shot.panel===2||match[1]==='35'&&shot.panel===3)){
  shot.src=shot.src.replace('poseidon-original-','poseidon-uniform-');used.add(shot.src);
 }
}
// Final farewell uses a separately reviewed single frame; fade eye trails in active Poseidon shots.
for(const shot of Object.values(plans)){
 if(shot.src.endsWith('/poseidon-uniform-35.webp')&&shot.panel===3){
  Object.assign(shot,{src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-trident-final.webp',panel:0,cols:1,rows:1});used.add(shot.src);
 }else{
  const match=shot.src.match(/poseidon-(?:uniform|original)-(18|29|33|37)\.png$/);
  if(match && (match[1]==='29'||match[1]==='37'||match[1]==='18'&&shot.panel===2||match[1]==='33'&&shot.panel===0)){
   shot.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-red-faint-'+match[1]+'.webp';used.add(shot.src);
  }
 }
}
// Only the mismatched carving shot is replaced; approved faces and deity shots remain intact.
plans['R2-13:3']={src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/core-twelve.webp',panel:0,cols:1,rows:1};
plans['R2-14:16']={src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/sea-core-interaction-20261026/groove-connections.webp',panel:0,cols:1,rows:1};
used.add(plans['R2-14:16'].src);
window.DivineManifestation=Object.freeze({pactOpacity:0.5,mode:'pact-avatar'});
window.SEA_DIRECTOR_ASSETS=[...new Set([...(window.SEA_DIRECTOR_ASSETS||[]),...used])];
const originalResolve=SeaDirector.resolve;
SeaDirector.resolve=function(e,i,row){const d=originalResolve(e,i,row)||{cast:[],map:'cliff'};window.CinemaHD?.warm([plans[e+':'+i],plans[e+':'+(i+1)],plans[e+':'+(i+2)]]);return {...d,cinema:plans[e+':'+i]||null};};
const oldDraw=SeaDirectorRender.draw;
SeaDirectorRender.draw=function(api){
 const {ctx:c,w,h,plan,story,images}=api, shot=plan.cinema;
 if(!shot)return oldDraw(api);
 const hd=window.CinemaHD?.lookup(shot.src,shot.panel,shot.cols,shot.rows),im=hd?.image||images[shot.src];if(!im)return oldDraw(api);
 const inset=hd?0:4,cols=hd?1:shot.cols,rows=hd?1:shot.rows,panel=hd?0:shot.panel,crop=hd?.crop||[0,0,1,1],sw=hd?im.width*crop[2]:im.width/cols-2*inset,sh=hd?im.height*crop[3]:im.height/rows-2*inset;
 const sx=hd?im.width*crop[0]:(panel%cols)*im.width/cols+inset,sy=hd?im.height*crop[1]:Math.floor(panel/cols)*im.height/rows+inset;
 c.clearRect(0,0,w,h);c.fillStyle='#07181f';c.fillRect(0,0,w,h);
 // Contain the entire composition: never crop away a hand, prop, or companion.
 const s=Math.min(w/sw,h/sh),dw=sw*s,dh=sh*s;
 c.drawImage(im,sx,sy,sw,sh,(w-dw)/2,(h-dh)/2,dw,dh);
};
if(window.SEA_CHAPTER){
 Object.assign(SEA_CHAPTER.actors.poseidon,{src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-red-faint-sprite.webp',crop:null,manifestation:'pact-avatar',visualScale:1.2});
 SEA_CHAPTER.actors.demeter.manifestation='pact-avatar';
 const src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-cinema-v3/merfolk-sprites.webp';
 Object.assign(SEA_CHAPTER.actors.pela,{src,crop:[200,8,480,1008]});
 Object.assign(SEA_CHAPTER.actors.oreia,{src,crop:[885,0,550,1024]});
}
window.SeaCinema={plans,version:'poseidon-trident-final-20261025',sources:[...used]};
})();

