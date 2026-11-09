/* Chapter II continuity: each row inherits an explicit place and present cast.
 * These are staging directions, not a replacement for the authored story. */
(()=>{'use strict';
const E='erion',N='niko',K='kleon',O='oreia',P='pela',D='demeter',H='dori',T='tolle',S='poseidon';
const ranges={
 'R2-00':[[0,6,'cliff',[E,N]],[7,12,'cliff',[E,N,D]]],
 'R2-01':[[0,1,'harbor',[E,N]],[2,10,'harbor',[E,N,K]],[11,16,'harbor',[E,N,K,'fisherwoman']]],
 'R2-02':[[0,1,'reef',[E,N]],[2,13,'reef',[E,N,O]],[14,19,'reef',[E,N,O,D]]],
 'R2-03':[[0,3,'harbor',[E,N,K,O]],[4,13,'cliff',[E,N,K,O,D,'youngFisher']],[14,16,'cliff',[E,N,K,O,D]],[17,21,'cliff',[E,N,K,O]]],
 'R2-04':[[0,11,'reef',[E,N,K]],[12,25,'reef',[E,N,K,D]]],
 'R2-05':[[0,9,'reef',[E,N,K,O]],[10,13,'reef',[E,N,K,O,D]],[14,20,'reef',[E,N,K,O,D,P]]],
 'R2-06':[[0,0,'reef',[]],[1,6,'cliff',[E,N,K,O]],[7,8,'harbor',[E,N,K,P]],[9,11,'reef',[E,N,K,D]],[12,18,'reef',[E,N,K,'philon']],[19,20,'reef',[E,N,K,'philon',P]],[21,22,'reef',[E,N,K,'philon',P,O]],[23,23,'cliff',[E,N,K,'philon',O]],[24,28,'cliff',[E,N,K,'philon',O,'fisherwoman']]],
 'R2-07':[[0,0,'cliff',[E,N]],[1,8,'cliff',[E,N,H]],[9,11,'cliff',[E,N,H,'merfolk']],[12,13,'cliff',[E,N,H,O]],[14,18,'cliff',[E,N,H,O,D]]],
 'R2-08':[[0,6,'cliff',[E,N,K,O,P]],[7,7,'cliff',[E,N,K,O,P,H]],[8,16,'cliff',[E,N,K,O,P,H,D]],[17,19,'cliff',[E,N,K,O,P,H,D,'youngFisher']]],
 'R2-09':[[0,7,'seabed',[E,N,H,'fisher1','fisher2']],[8,15,'seabed',[E,'escort']],[16,18,'seabed',[E,'escort','lantern','crowbar']],[19,20,'seabed',[E,T,'fisher1','fisher2']],[21,21,'seabed',[E,T]]],
 'R2-10':[[0,0,'seabed',[E,T,'fisher1','fisher2']],[1,14,'seabed',[E,T,H]],[15,22,'seabed',[E,T,H,N]],[23,24,'seabed',[E,H,N]]],
 'R2-11':[[0,7,'gate',[E,N,H]],[8,9,'gate',[E,N,H,D]]],
 'R2-11A':[[0,13,'gate',[E,N,H,D]]],
 'R2-11B':[[0,3,'gate',[E,N,H,D]],[4,5,'gate',[E,D]],[6,9,'gate',[E,H,N,D]]],
 'R2-12':[[0,9,'gate',[E,N,H,D]],[10,18,'temple',[E,H,D]],[19,19,'temple',[E]]],
 'R2-13':[[0,4,'core',[E,D]],[5,17,'core',[E,D,S]]],
 'R2-14':[[0,30,'core',[E,D,S]]],
 'R2-15':[[0,1,'temple',[E,H]],[2,6,'gate',[E,H,N]],[7,7,'harbor',[]],[8,8,'cliff',[E,N,K,O,H]],[9,25,'cliff',[E,N,K,O,H]],[26,26,'cliff',[N]],[27,33,'cliff',[E,N]]],
 'R2-16':[[0,1,'harbor',[E,S]],[2,6,'harbor',[E,S,K,O]],[7,10,'harbor',[E,S,K,O,D]],[11,14,'harbor',[E,S,K,O,D,H]],[15,16,'cliff',[E,N,H,'courier']],[17,20,'cliff',[E,N,H,K,'courier']],[21,24,'cliff',[E,N,H,K,D,S]],[25,25,'cliff',[E,D,S]]]
};
const speaker={厄里昂:E,尼科:N,克雷翁:K,歐蕾雅:O,沛拉:P,得墨忒耳:D,多莉:H,托勒:T,波賽頓:S,護送頭目:'escort',菲隆:'philon',漁婦:'fisherwoman',年輕漁人:'youngFisher',信差:'courier'};
const details={};
const add=(e,a,b,v)=>{for(let i=a;i<=b;i++)details[e+':'+i]={...(details[e+':'+i]||{}),...v};};
add('R2-00',0,12,{light:'dusk'});add('R2-00',5,6,{action:'wrist',focus:N});add('R2-00',7,8,{action:'goddess',focus:D,minHold:8});add('R2-00',11,11,{action:'griffin',focus:E});
add('R2-01',0,1,{wide:true});add('R2-01',7,8,{action:'trench'});add('R2-01',11,11,{enter:'fisherwoman',focus:'fisherwoman'});add('R2-01',15,15,{action:'tremor',wide:true,minHold:8});
add('R2-02',0,1,{action:'nursery',wide:true});add('R2-02',2,3,{enter:O,focus:O});add('R2-02',8,8,{action:'wrist',focus:N});add('R2-02',9,10,{action:'nursery',focus:O});add('R2-02',14,15,{action:'goddess',focus:D});
add('R2-03',4,4,{art:['evacuation.webp',0],minHold:8});add('R2-03',5,8,{art:['evacuation.webp',3],action:'roots',minHold:8});add('R2-03',10,12,{focus:'youngFisher',action:'jar'});add('R2-03',13,13,{art:['evacuation.webp',1],minHold:9});add('R2-03',14,16,{art:['evacuation.webp',2],action:'ripples',minHold:8});add('R2-03',17,21,{light:'night',action:'fire',wide:true,caption:'當晚 · 高崖避難營地'});
add('R2-04',0,6,{action:'buoy'});add('R2-04',7,15,{action:'trench'});add('R2-04',16,18,{action:'uphillWater',wide:true});add('R2-04',19,20,{action:'wrist',focus:N,minHold:8});add('R2-04',21,25,{action:'uphillWater'});
add('R2-05',0,13,{action:'barrier'});add('R2-05',14,15,{enter:P,focus:P});add('R2-05',16,16,{action:'sandMap',focus:O});
add('R2-06',0,0,{wide:true,action:'channel'});add('R2-06',7,8,{art:['boat-rescue.webp',0],minHold:8});add('R2-06',9,11,{art:['boat-rescue.webp',1],action:'boatWater',minHold:8});add('R2-06',12,16,{art:['boat-rescue.webp',2],minHold:9});add('R2-06',17,18,{art:['boat-rescue.webp',2],action:'wrist',minHold:7});add('R2-06',19,22,{art:['boat-return.webp',0],action:'surge',minHold:8});add('R2-06',23,23,{art:['boat-return.webp',1],minHold:10});add('R2-06',24,25,{art:['boat-return.webp',2],action:'ebb',minHold:9});add('R2-06',26,27,{art:['boat-return.webp',3],minHold:8});
add('R2-07',0,18,{light:'dusk'});add('R2-07',0,0,{wide:true,action:'arrival'});add('R2-07',1,2,{enter:H,focus:H});add('R2-07',12,14,{enter:O,focus:O});add('R2-07',15,18,{art:['healing.webp',0],minHold:8});
add('R2-08',0,18,{light:'night',action:'fire'});add('R2-08',0,1,{enter:P,focus:P,caption:'當夜 · 海床上的燈火'});add('R2-08',18,18,{art:['healing.webp',1],minHold:8});
add('R2-09',0,2,{action:'wrist',focus:N});add('R2-09',3,7,{wide:true,action:'tracks'});add('R2-09',8,15,{focus:'escort'});add('R2-09',12,12,{action:'crystalWeapon'});add('R2-09',16,18,{wide:true,action:'crystalWeapon'});add('R2-09',19,21,{art:['healing.webp',2],minHold:9});
add('R2-10',0,0,{art:['healing.webp',2],minHold:9});add('R2-10',1,14,{art:['healing.webp',3]});add('R2-10',15,21,{focus:N});add('R2-10',22,22,{action:'departure',wide:true,minHold:9});
add('R2-11',0,9,{wide:true,action:'kraken'});add('R2-11',2,2,{action:'krakenStrike',minHold:8});add('R2-11',7,7,{action:'krakenStrike',minHold:8});
add('R2-11A',0,10,{wide:true,action:'kraken'});add('R2-11A',3,3,{art:['kraken-aid.webp',0],minHold:8});add('R2-11A',4,4,{art:['kraken-aid.webp',1],minHold:8});add('R2-11A',5,6,{art:['kraken-aid.webp',2],minHold:9});add('R2-11A',7,8,{art:['kraken-aid.webp',3],minHold:9});add('R2-11A',9,10,{action:'krakenRetreat',minHold:9});
add('R2-11B',0,9,{wide:true,action:'kraken'});add('R2-11B',3,5,{action:'krakenRetreat',minHold:9});
add('R2-12',0,4,{wide:true,action:'basin'});add('R2-12',5,9,{art:['thresholds.webp',0],minHold:8});add('R2-12',10,12,{wide:true,action:'carts'});add('R2-12',14,18,{art:['thresholds.webp',1],minHold:8});add('R2-12',19,19,{art:['thresholds.webp',2],minHold:9});
add('R2-13',0,2,{art:['thresholds.webp',2]});add('R2-13',3,4,{action:'crystals12',wide:true,minHold:8});add('R2-13',5,17,{action:'waterFace'});
add('R2-14',0,3,{art:['core-detail.webp',0],minHold:8});add('R2-14',4,6,{art:['core-detail.webp',1],minHold:8});add('R2-14',7,10,{art:['core-detail.webp',2],minHold:8});add('R2-14',11,12,{action:'crystals12',wide:true,minHold:10});add('R2-14',13,15,{art:['core-detail.webp',3],minHold:9});add('R2-14',16,16,{action:'rings',minHold:9});add('R2-14',17,17,{action:'ringFall',minHold:9});add('R2-14',18,22,{action:'coreStill'});add('R2-14',23,25,{oldArt:['climax.webp',2],action:'link',minHold:10});add('R2-14',26,27,{art:['core-release.webp',0],minHold:9});add('R2-14',28,28,{art:['core-release.webp',1],minHold:9});add('R2-14',29,30,{art:['core-release.webp',2],minHold:8});
add('R2-15',0,1,{art:['core-release.webp',3],minHold:8});add('R2-15',2,6,{action:'restoring',wide:true,minHold:8});add('R2-15',7,8,{action:'restoring',wide:true,minHold:12,caption:'海水逐漸歸來 · 清晨至黃昏'});add('R2-15',9,25,{art:['shore-ending.webp',0],minHold:8,caption:'三天後 · 高崖營火旁'});add('R2-15',26,33,{art:['shore-ending.webp',1],minHold:8,caption:'當夜 · 崖邊'});
add('R2-16',0,11,{action:'seaGodArrival',focus:S});add('R2-16',0,0,{minHold:10});add('R2-16',12,12,{oldArt:['climax.webp',3],action:'contract',minHold:12});add('R2-16',13,14,{action:'smallAvatar',focus:S});add('R2-16',15,20,{art:['shore-ending.webp',2],caption:'中午 · 崖後山道',minHold:8});add('R2-16',21,24,{action:'smallAvatar'});add('R2-16',25,25,{art:['shore-ending.webp',3],minHold:12});
function resolve(event,index,row){const span=(ranges[event]||[]).find(x=>index>=x[0]&&index<=x[1]);if(!span)return null;const d={map:span[2],cast:span[3].slice(),focus:speaker[row.speaker]||null,light:'day',minHold:row.kind==='stage'?7:5,...details[event+':'+index]};d.restored=event==='R2-16'||event==='R2-15'&&index>=7;d.ringOff=event==='R2-15'||event==='R2-16'||event==='R2-14'&&index>=18;d.waterFace=d.map==='core'&&(event==='R2-14'||index>=5);return d;}
// Divine manifestations stay visible between their lines; the escort leader's
// final warning comes from the receding convoy rather than a stationary ally.
for(let i=6;i<=21;i++)details['R2-09:'+i]={...(details['R2-09:'+i]||{}),additionalCast:[D]};
details['R2-09:20'].additionalCast=[D,'escort'];
for(let i=6;i<=24;i++)details['R2-10:'+i]={...(details['R2-10:'+i]||{}),additionalCast:[D]};
for(let i=4;i<=9;i++)details['R2-11:'+i]={...(details['R2-11:'+i]||{}),additionalCast:[D]};
const baseResolve=resolve;
window.SeaDirector={ranges,details,speaker,resolve(event,index,row){const d=baseResolve(event,index,row);if(d?.additionalCast)d.cast=[...new Set([...d.cast,...d.additionalCast])];return d;}};
})();
