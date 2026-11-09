window.SEA_DIRECTOR_ASSETS=["boat-rescue.webp", "boat-return.webp", "cliff-night.webp", "continuity-extra.webp", "continuity-objects.webp", "core-detail.webp", "core-release.webp", "escort-guards.webp", "evacuation.webp", "healing.webp", "kraken-aid.webp", "shore-ending.webp", "thresholds.webp"].map(x=>'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/'+x);
Object.assign(SEA_CHAPTER.actors,{
 lantern:{name:'晶燈手',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/escort-guards.webp',crop:[0,0,780,1024]},
 crowbar:{name:'撬棍護衛',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/escort-guards.webp',crop:[790,0,746,1024]},
 fisherwoman:{name:'漁婦',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/village-life-v2/villagers-neutral.webp',crop:[512,0,512,512]},
 youngFisher:{name:'年輕漁人',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/village-life-v2/villagers-neutral.webp',crop:[0,0,512,512]},
 fisher1:{name:'漁人',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/village-life-v2/villagers-neutral.webp',crop:[0,0,512,512]},
 fisher2:{name:'漁人',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/village-life-v2/villagers-neutral.webp',crop:[1024,0,512,512]},
 courier:{name:'信差',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/village-life-v2/villagers-neutral.webp',crop:[0,0,512,512]}
});
// These corrections keep completed actions from appearing before their cue.
Object.assign(SeaDirector.details,{
 'R2-06:17':{art:['boat-rescue.webp',3],minHold:8},'R2-06:18':{art:['boat-rescue.webp',3],minHold:8},
 'R2-06:19':{focus:'pela',action:'surge',minHold:8},'R2-06:20':{wide:true,action:'surge',minHold:9},'R2-06:21':{focus:'oreia',minHold:7},
 'R2-08:18':{light:'night',focus:'oreia'},'R2-08:19':{light:'night',wide:true,action:'lanterns',minHold:9},
 'R2-09:19':{wide:true,action:'cart',minHold:9},'R2-09:20':{wide:true,action:'cart'},'R2-09:21':{wide:true,action:'cart'},
 'R2-10:1':{focus:'dori'},'R2-10:2':{focus:'dori'},'R2-10:3':{focus:'tolle'},'R2-10:4':{focus:'dori'},
 'R2-10:11':{focus:'erion'},'R2-10:12':{focus:'tolle'},'R2-10:13':{focus:'erion'},'R2-10:14':{focus:'tolle'}
});
SeaDirector.details["R2-07:9"]={...(SeaDirector.details["R2-07:9"]||{}),art:["continuity-extra.webp", 2],minHold:10};
SeaDirector.details["R2-07:10"]={...(SeaDirector.details["R2-07:10"]||{}),art:["continuity-extra.webp", 2],minHold:10};
SeaDirector.details["R2-07:11"]={...(SeaDirector.details["R2-07:11"]||{}),art:["continuity-extra.webp", 2],minHold:10};
SeaDirector.details["R2-08:18"]={...(SeaDirector.details["R2-08:18"]||{}),art:["continuity-objects.webp", 0],minHold:10};
SeaDirector.details["R2-09:2"]={...(SeaDirector.details["R2-09:2"]||{}),art:["continuity-objects.webp", 1],minHold:10};
SeaDirector.details["R2-09:19"]={...(SeaDirector.details["R2-09:19"]||{}),art:["continuity-objects.webp", 3],minHold:10};
SeaDirector.details["R2-09:20"]={...(SeaDirector.details["R2-09:20"]||{}),art:["continuity-objects.webp", 3],minHold:10};
SeaDirector.details["R2-09:21"]={...(SeaDirector.details["R2-09:21"]||{}),art:["continuity-objects.webp", 3],minHold:10};
SeaDirector.details["R2-10:0"]={...(SeaDirector.details["R2-10:0"]||{}),art:["continuity-extra.webp", 3],minHold:10};
SeaDirector.details["R2-12:10"]={...(SeaDirector.details["R2-12:10"]||{}),art:["continuity-objects.webp", 2],minHold:10};
SeaDirector.details["R2-12:11"]={...(SeaDirector.details["R2-12:11"]||{}),art:["continuity-objects.webp", 2],minHold:10};
SeaDirector.details["R2-12:12"]={...(SeaDirector.details["R2-12:12"]||{}),art:["continuity-objects.webp", 2],minHold:10};
SeaDirector.details["R2-14:23"]={...(SeaDirector.details["R2-14:23"]||{}),art:["core-release.webp", 0],minHold:10};
SeaDirector.details["R2-14:24"]={...(SeaDirector.details["R2-14:24"]||{}),art:["core-release.webp", 0],minHold:10};
SeaDirector.details["R2-14:25"]={...(SeaDirector.details["R2-14:25"]||{}),art:["core-release.webp", 0],minHold:10};
SeaDirector.details["R2-14:26"]={...(SeaDirector.details["R2-14:26"]||{}),art:["core-release.webp", 1],minHold:10};
SeaDirector.details["R2-14:27"]={...(SeaDirector.details["R2-14:27"]||{}),art:["core-release.webp", 1],minHold:10};
SeaDirector.details["R2-14:28"]={...(SeaDirector.details["R2-14:28"]||{}),art:["core-release.webp", 2],minHold:10};
SeaDirector.details["R2-14:29"]={...(SeaDirector.details["R2-14:29"]||{}),art:["core-release.webp", 2],minHold:10};
SeaDirector.details["R2-15:0"]={...(SeaDirector.details["R2-15:0"]||{}),art:["continuity-extra.webp", 0],minHold:10};
SeaDirector.details["R2-15:1"]={...(SeaDirector.details["R2-15:1"]||{}),art:["continuity-extra.webp", 0],minHold:10};
SeaDirector.details["R2-16:12"]={...(SeaDirector.details["R2-16:12"]||{}),art:["continuity-extra.webp", 1],minHold:10};
SeaDirector.details['R2-09:20'].additionalCast=['demeter','escort'];
SeaDirector.details['R2-14:30']={action:'evidence',wide:true,minHold:10};
window.SEA_DIRECTOR_ASSETS.push('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/cast-extra.webp');
Object.assign(SEA_CHAPTER.actors,{
 fisherwoman:{name:'漁婦',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/cast-extra.webp',crop:[240,0,340,724]},
 philon:{name:'菲隆',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/cast-extra.webp',crop:[640,0,400,724]},
 merfolk:{name:'鰭人',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/cast-extra.webp',crop:[1120,0,390,724]},
 courier:{name:'信差',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/cast-extra.webp',crop:[1600,0,440,724]}
});
SeaDirector.speaker['鰭人']='merfolk';
window.SEA_DIRECTOR_ASSETS.push('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/niko-wrist.webp');
for(const [key,q] of Object.entries({'R2-00:5':0,'R2-00:6':0,'R2-02:8':0,'R2-04:19':2,'R2-04:20':2,'R2-06:17':1,'R2-06:18':1,'R2-09:2':2,'R2-12:5':3,'R2-12:6':3,'R2-12:7':3,'R2-12:8':3,'R2-12:9':3})){
 SeaDirector.details[key]={...(SeaDirector.details[key]||{}),art:['niko-wrist.webp',q],minHold:9};
}
// Dori has not arrived during the morning water investigation.
SeaDirector.details['R2-04:19']={focus:'niko',action:'wrist',minHold:9};
SeaDirector.details['R2-04:20']={focus:'niko',action:'wrist',minHold:9};
SeaDirector.details['R2-02:8']={focus:'niko',action:'wrist',minHold:9};
window.SEA_DIRECTOR_ASSETS.push('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/investigation.webp');
for(const [event,a,b,q] of [['R2-01',7,8,2],['R2-02',0,1,0],['R2-02',9,10,0],['R2-04',0,6,1],['R2-04',7,15,2],['R2-04',16,18,4],['R2-04',21,25,4],['R2-05',0,13,3],['R2-05',16,16,5]]){
 for(let i=a;i<=b;i++)SeaDirector.details[event+':'+i]={...(SeaDirector.details[event+':'+i]||{}),art:['investigation.webp',q,3,2],minHold:8};
}

window.SEA_DIRECTOR_ASSETS.push('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/continuity-bridge.webp');
for(const [event,a,b,q] of [['R2-03',17,21,0],['R2-03',10,12,1],['R2-07',0,8,2],['R2-06',19,20,3],['R2-06',26,27,4],['R2-02',8,8,5],['R2-04',19,20,5]]){
 for(let i=a;i<=b;i++)SeaDirector.details[event+':'+i]={...(SeaDirector.details[event+':'+i]||{}),art:['continuity-bridge.webp',q,3,2],minHold:9};
}
SeaDirector.details['R2-06:21']={cast:['oreia'],focus:'oreia',minHold:7};
SeaDirector.details['R2-16:12'].minHold=12;
window.SEA_DIRECTOR_ASSETS.push('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/core-final.webp','https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/outcomes.webp');
for(const [event,a,b,file,q] of [
 ['R2-12',0,2,'outcomes.webp',0],['R2-13',2,2,'core-final.webp',0],
 ['R2-13',5,17,'core-final.webp',1],['R2-14',16,16,'core-final.webp',2],
 ['R2-14',17,17,'core-final.webp',3],['R2-14',18,22,'outcomes.webp',1],
 ['R2-14',30,30,'outcomes.webp',2],['R2-16',2,2,'outcomes.webp',3]
])for(let i=a;i<=b;i++)SeaDirector.details[event+':'+i]={...(SeaDirector.details[event+':'+i]||{}),art:[file,q],minHold:10};
SeaDirector.details['R2-15:26']={cast:['niko'],focus:'niko',light:'night',minHold:10,caption:'當夜 · 崖邊'};
SeaDirector.details['R2-12:13']={wide:true,action:'approach',minHold:10};
SeaDirector.details['R2-16:15']={cast:['courier'],focus:'courier',enter:'courier',minHold:10,caption:'中午 · 崖後山道'};
window.SEA_DIRECTOR_ASSETS.push('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/quiet-return.webp');
window.SEA_DIRECTOR_ASSETS.push('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/core-twelve.webp');
window.SEA_DIRECTOR_ASSETS.push('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/core-dialogue.webp');
for(let i=5;i<=17;i++)SeaDirector.details['R2-13:'+i]={art:['core-dialogue.webp',0,1,1],artCrop:[0,0,.76,1],minHold:8,action:'waterFace'};
SeaDirector.details['R2-14:11']={art:['core-dialogue.webp',0,1,1],artCrop:[0,0,.76,1],minHold:12};
SeaDirector.details['R2-14:12']={art:['core-twelve.webp',0,1,1],minHold:12,action:'coreOrbit'};
// Keep speakers within the shot instead of locking every harbour line on Poseidon.
for(let i=2;i<=14;i++)delete SeaDirector.details['R2-16:'+i]?.focus;
for(let i=3;i<=4;i++)SeaDirector.details['R2-13:'+i]={art:['core-twelve.webp',0,1,1],minHold:11,action:i===3?'coreOrbit':'coreFreeze'};
SeaDirector.details['R2-14:11']={art:['core-dialogue.webp',0,1,1],artCrop:[0,0,.76,1],minHold:12};
SeaDirector.details['R2-14:12']={art:['core-twelve.webp',0,1,1],minHold:12,action:'coreOrbit'};
for(const [event,a,b,q] of [['R2-11A',9,9,0],['R2-11A',10,10,1],['R2-11A',11,13,0],['R2-11B',4,4,0],['R2-15',26,26,2],['R2-16',15,15,3]]){
 for(let i=a;i<=b;i++)SeaDirector.details[event+':'+i]={...(SeaDirector.details[event+':'+i]||{}),art:['quiet-return.webp',q],minHold:10};
}

Object.assign(SEA_CHAPTER.sounds,{flow:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/world-loops-v1/W02.wav',surge:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/world-loops-v1/W04.wav',splash:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/source-review-v3/water-splash.wav',wade:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/source-review-v3/water-wade.wav',rumble:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/source-review-v3/distant-rumble.wav',roots:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/source-review-v4/roots-emerge-bold.wav',rubble:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/source-review-v3/rubble.wav'});
SeaDirector.details['R2-14:17']={art:['core-final.webp',2],minHold:10,caption:'最後一步 · 敲鬆固定銅楔'};
// The wrist reaction is a close shot; the two rescue boats are established in the adjacent wide shots.
SeaDirector.details['R2-06:17'].artCrop=[.08,.50,.57,.40];
SeaDirector.details['R2-06:18'].artCrop=[.10,.10,.36,.55];
