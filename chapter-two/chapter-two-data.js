'use strict';
// Story prose is loaded from the preserved Claude draft. This file describes play spaces only.
window.SEA_CHAPTER={
 version:1,key:'erion-sea-chapter-v1',root:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v1/',
 maps:{
  cliff:{name:'海岸高崖',sub:'崖頂步道 · 避難營地',image:'cliff.webp',height:864,spawn:[.40,.49],walk:[[.12,.25],[.30,.20],[.34,.29],[.48,.32],[.59,.42],[.58,.55],[.78,.68],[.95,.88],[.94,.96],[.72,.80],[.59,.71],[.41,.58],[.36,.56],[.35,.69],[.29,.94],[.19,.98],[.25,.79],[.27,.56],[.27,.49],[.32,.41],[.20,.36]],actors:[['niko',.46,.49],['demeter',.44,.43],['dori',.25,.32],['kleon',.52,.52],['oreia',.64,.67],['poseidon',.69,.70]],props:[['jars','盛海水的陶缸',.32,.48],['rope','救援繩索',.54,.36],['pool','崖上的舊鹽池',.72,.58],['letter','利昂轉交的信',.43,.54]],exits:[['harbor',.26,.91,'沿階梯下漁港'],['chapter-one',.23,.29,'沿海道']]},
  harbor:{name:'退潮漁港',sub:'倒伏的船 · 乾涸的泊地',image:'harbor.webp',height:1024,spawn:[.21,.65],walk:[[.09,.34],[.35,.32],[.51,.41],[.78,.28],[.95,.40],[.91,.88],[.46,.96],[.10,.87]],actors:[['kleon',.44,.60],['niko',.35,.66],['philon',.70,.73],['tolle',.39,.48],['poseidon',.63,.61]],props:[['timber','散落的好木料',.59,.79]],exits:[['cliff',.15,.40,'上崖頂步道'],['reef',.86,.65,'沿乾海床往育幼礁']]},
  reef:{name:'育幼礁',sub:'潮池 · 舊浮標界線',image:'reef.webp',height:1024,spawn:[.27,.79],walk:[[.04,.33],[.34,.31],[.47,.39],[.60,.31],[.83,.36],[.89,.56],[.84,.91],[.05,.90]],obstacles:[[.38,.34,.14,.16],[.57,.53,.13,.14]],actors:[['oreia',.56,.71],['pela',.76,.55],['niko',.33,.71]],props:[['buoy','被挪動的紅浮標',.10,.48],['trench','漁民挖出的淺溝',.35,.65],['ridge','逆坡而行的水痕',.67,.87],['barrier','礁口的堆石',.79,.56],['boat','古潮溝的小船',.84,.72]],exits:[['harbor',.09,.79,'返回漁港'],['seabed',.79,.89,'沿古潮溝往外海床']]},
  seabed:{name:'外海床',sub:'車轍 · 黑礁 · 無印者',image:'routes.webp',rect:[0,1,1,2],height:434,spawn:[.32,.81],walk:[[.22,.49],[.48,.29],[.90,.30],[.93,.82],[.45,.95],[.18,.85]],actors:[['niko',.31,.64],['dori',.35,.71],['escort',.50,.62],['tolle',.51,.75]],props:[['cart','陷在泥裡的晶箱車',.40,.72]],exits:[['reef',.24,.86,'回到古潮溝'],['gate',.86,.48,'追隨車轍往潮門']]},
  gate:{name:'潮門',sub:'狹口前的深池 · 神殿守獸',image:'reef.webp',height:1024,spawn:[.49,.82],walk:[[.34,.59],[.68,.57],[.84,.65],[.88,.93],[.31,.93]],actors:[['niko',.40,.80],['dori',.48,.85],['demeter',.55,.79]],props:[['kraken','擱淺的巨大身影',.71,.59],['water','狹口積水',.67,.75],['horn','尼科的巡標潮號',.40,.79],['wound','垂落的受傷觸腕',.58,.77],['rock','卡住觸腕的礁岩',.72,.84]],exits:[['seabed',.34,.85,'沿車轍返回'],['temple',.82,.82,'穿過潮門']]},
  temple:{name:'海潮神殿外廊',sub:'凡人可抵達的最後一道門',image:'temple.webp',rect:[0,0,2,2],height:1024,spawn:[.46,.79],walk:[[.17,.42],[.82,.42],[.86,.88],[.12,.88]],actors:[['dori',.38,.66]],props:[['door','內殿門檻',.52,.51]],exits:[['gate',.23,.82,'返回潮門'],['core',.64,.45,'獨自進入內殿']]},
  core:{name:'潮心內殿',sub:'逆刻環 · 原初海潮刻印',image:'temple.webp',rect:[1,0,2,2],height:1024,spawn:[.48,.86],walk:[[.12,.34],[.86,.34],[.90,.91],[.10,.91]],obstacles:[[.32,.40,.36,.26]],actors:[],props:[['core','懸浮的潮心',.51,.42],['crystals','外加的粗晶槽',.74,.62],['marks','人工鑿下的刻痕',.36,.71],['seam','銅環與基座的接縫',.61,.77],['wedges','固定銅環的楔子',.73,.75],['imprint','基座的海潮刻印',.47,.76]],exits:[['temple',.16,.84,'回到安全外廊']]}
 },
 actors:{
  niko:{name:'尼科',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/characters/niko.webp'},kleon:{name:'克雷翁',image:'cast-reference.webp',crop:[610,10,350,731]},oreia:{name:'歐蕾雅',image:'cast-reference.webp',crop:[16,740,505,790]},pela:{name:'沛拉',image:'cast-reference.webp',crop:[610,750,365,777]},
  dori:{name:'多莉',image:'cast-support.webp',crop:[70,5,390,700]},escort:{name:'護送頭目',image:'cast-support.webp',crop:[486,5,510,701]},tolle:{name:'托勒',image:'cast-support.webp',crop:[80,710,340,795]},poseidon:{name:'波賽頓的化身',image:'cast-support.webp',crop:[505,700,490,819]},
  demeter:{name:'得墨忒耳的化身',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/characters/demeter.webp'},philon:{name:'菲隆',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/village-life-v2/villagers-neutral.webp',crop:[1024,0,512,512]},
  erion:{name:'厄里昂',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/mine-interactive-v1/erion-walk.webp',crop:[384,0,384,512]}
 },
 quests:[
  ['cliff','niko','R2-00','循著尼科的指引','走近崖邊的尼科，看看海岸發生了什麼。'],
  ['harbor','kleon','R2-01','船首的指控','下到退潮漁港，向船首詢問失蹤的人與破碎的船。'],
  ['reef','oreia','R2-02','礁池中的幼體','前往育幼礁，聽潮守長說明封住礁口的原因。'],
  ['cliff','niko','R2-03','先把人帶到高處','回到高崖，準備水缸、繩索與可留住海水的舊鹽池。'],
  ['reef','buoy','R2-04','三道留下的痕跡','沿浮標、淺溝、沙脊查明：挪標與退潮，哪一件先發生？'],
  ['reef','oreia','R2-05','不是誰偷走了海','把漁港的線索帶回育幼礁，對照礁口堆石與回湧方向。'],
  ['reef','boat','R2-06','帶回外沙洲的人','在仍然有水的古潮溝航行，接回菲隆與三名同伴。'],
  ['cliff','dori','R2-07','遠道而來的藥箱','回到崖台，與沿內陸道路抵達的多莉會合。'],
  ['cliff','niko','R2-08','海床上的燈火','入夜後聽沛拉帶來的消息，準備沿車轍調查。'],
  ['seabed','escort','R2-09','外海床的護送隊','找出運往神殿的晶箱。先嘗試交談，留意頭目的舉動。'],
  ['seabed','tolle','R2-10','粗晶與灼傷','救出被丟下的搬晶人，了解換晶與回湧的關聯。'],
  ['gate','kraken','R2-11','潮門前的守獸','查看受困的克拉肯，選擇安撫或逼退牠的觸腕。'],
  ['temple','door','R2-12','每個人的界線','穿過潮門，確認尼科與多莉各自能走到哪裡。'],
  ['core','core','R2-13','海潮之神的聲音','獨自靠近潮心，透過通契尋求神祇的回應。'],
  ['core','crystals','R2-14','取晶、斷紋、敲楔','先辨認外加構件，再逐步拆除。原本的潮心必須留在原處。'],
  ['temple','dori','R2-15','海回來了','回到安全外廊，再與岸上的人一同面對修復後的生活。'],
  ['harbor','poseidon','R2-16','一具化身與一封信','走近漲潮線，聽波賽頓提出同行的請求。']
 ],
 checkpoints:{
  'R2-03:9':{map:'cliff',title:'準備撤離',items:['jars','rope','pool'],hint:'點陶缸、繩索與舊鹽池，完成各項準備後回到尼科身旁。'},
  'R2-04:1':{map:'reef',title:'辨認移動浮標的時間',items:['buoy']},'R2-04:7':{map:'reef',title:'查驗淺溝的深度與出口',items:['trench']},'R2-04:16':{map:'reef',title:'追蹤逆向水痕',items:['ridge']},
  'R2-05:5':{map:'reef',title:'對照堆石與海藻方向',items:['barrier']},
  'R2-06:8':{map:'reef',title:'循浮標帶船前進',items:['boat'],game:'sail'},
  'R2-09:18':{map:'seabed',title:'擊退護送隊',items:['escort'],game:'battle'},
  'R2-11:9':{map:'gate',title:'為守獸選擇一條路',items:['kraken'],game:'branch'},
  'R2-11A:3':{map:'gate',title:'引水濕潤乾裂的皮膚',items:['water'],game:'calm-water'},'R2-11A:4':{map:'gate',title:'讓尼科吹響潮號',items:['horn']},'R2-11A:6':{map:'gate',title:'等觸腕安定，再讓多莉上藥',items:['wound'],game:'calm-wound'},'R2-11A:8':{map:'gate',title:'在推力間隙鬆開卡石',items:['rock'],game:'rock-release'},
  'R2-11B:2':{map:'gate',title:'逼退觸腕，留出通路',items:['kraken'],game:'kraken-battle'},
  'R2-14:0':{map:'core',title:'觀察粗晶槽',items:['crystals']},'R2-14:4':{map:'core',title:'比對鑿刃與補刻痕跡',items:['marks']},'R2-14:7':{map:'core',title:'找出外加銅環的接縫',items:['seam']},
  'R2-14:12':{map:'core',title:'分批取出前九顆粗晶',items:['crystals'],game:'crystal-nine'},'R2-14:15':{map:'core',title:'取出最後三顆粗晶',items:['crystals'],game:'crystal-last'},'R2-14:16':{map:'core',title:'鑿斷三處逆刻槽接點',items:['marks'],game:'grooves'},'R2-14:17':{map:'core',title:'敲鬆楔子，卸下外環',items:['wedges'],game:'wedges'},'R2-14:23':{map:'core',title:'以右手回應潮心',items:['core'],game:'link'},'R2-14:28':{map:'core',title:'拓下刻印，將核心留在原處',items:['imprint']}
 },
 evidence:{buoy:['挪標在退潮之後','船首為挽救船隻才挪動浮標；兩件事的先後已分清。'],trench:['淺溝連不到外海','短而淺的人工溝無法解釋整片海床乾涸。'],ridge:['逆坡的水痕','水越過沙脊向神殿外移動，存在持續的外推力量。'],barrier:['堆石與外側海藻','鰭人為保住育幼池才封礁。堆石同樣承受向外的推力。'],crystals:['換晶的間隙','舊晶耗盡、新晶尚未裝入時，推力短暫消失，遠方水牆回湧。'],marks:['凡人的鑿痕','反覆補刻、銅楔與人工接縫，顯示這是一件後來裝上的構件。'],seam:['外環與原印','原初刻印仍在基座內。外環可以拆掉，潮心不必取走。']},
 sounds:{select:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/kenney-ch1-v2/ui-select.wav',confirm:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/kenney-ch1-v2/ui-confirm.wav',carve:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/kenney-ch1-v2/one-carve.wav',metal:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/kenney-ch1-v2/metal.wav',cloth:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/kenney-ch1-v2/cloth.wav',pack:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/kenney-ch1-v2/pack.wav',wood:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/kenney-story-v2/wood-thud.wav',fall:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/kenney-story-v2/bronze-fall.wav'}
};
// Walkable ground follows the paintings: ships, pools, walls and the trench remain solid.
Object.assign(SEA_CHAPTER.maps.harbor,{spawn:[.32,.67],walk:[[.16,.47],[.29,.40],[.34,.48],[.44,.51],[.57,.54],[.63,.62],[.83,.66],[.95,.85],[.88,.98],[.38,.98],[.29,.91],[.34,.78],[.26,.68],[.20,.59]],obstacles:[[.54,.50,.13,.09],[.62,.57,.16,.09],[.75,.67,.16,.11],[.50,.75,.20,.14]]});
SEA_CHAPTER.maps.harbor.exits[0]=['cliff',.30,.41,'上崖頂步道'];
SEA_CHAPTER.maps.reef.obstacles=[[.14,.34,.31,.14],[.37,.24,.25,.10],[.51,.38,.28,.13],[.28,.60,.15,.08]];
SEA_CHAPTER.maps.reef.props.find(x=>x[0]==='boat').splice(2,2,.88,.80);
SEA_CHAPTER.maps.core.obstacles=[[.26,.36,.55,.30]];
SEA_CHAPTER.maps.temple.obstacles=[[.16,.45,.30,.10],[.67,.46,.27,.15]];
SEA_CHAPTER.maps.gate.obstacles=[[.18,.70,.19,.14]];
SEA_CHAPTER.maps.gate.props.find(x=>x[0]==='kraken').splice(2,2,.55,.50);

// Follow the painted stairs, central terrace and doorway; planting beds and basins are excluded.
Object.assign(SEA_CHAPTER.maps.temple,{spawn:[.20,.84],obstacles:[],walk:[[0,0.94140625],[0.19140625,0.994140625],[0.234375,0.908203125],[0.2825520833333333,0.83203125],[0.3385416666666667,0.75390625],[0.3958333333333333,0.677734375],[0.4466145833333333,0.611328125],[0.5729166666666666,0.52734375],[0.6145833333333334,0.48046875],[0.6731770833333334,0.44140625],[0.7135416666666666,0.39453125],[0.7552083333333334,0.392578125],[0.75,0.3359375],[0.6861979166666666,0.328125],[0.6549479166666666,0.390625],[0.5950520833333334,0.44921875],[0.5234375,0.48046875],[0.3411458333333333,0.53515625],[0.25,0.599609375],[0.19140625,0.6796875],[0.125,0.76953125],[0.06640625,0.859375]]});
SEA_CHAPTER.maps.temple.exits=[['gate',.12,.89,'潮門'],['core',.715,.385,'潮心內殿']];
SEA_CHAPTER.maps.temple.actors=[['dori',.34,.65]];

// Locations follow painted roads; source story and checkpoint IDs stay unchanged.
SEA_CHAPTER.maps.cliff.exits=[['harbor',.257,.98,'退潮漁港'],['chapter-one',.91,.96,'沿海道']];
SEA_CHAPTER.maps.cliff.spawn=[.43,.50];
SEA_CHAPTER.maps.harbor.exits[0]=['cliff',.30,.42,'海岸高崖'];
SEA_CHAPTER.maps.harbor.exits[1]=['reef',.92,.93,'育幼礁'];
SEA_CHAPTER.maps.harbor.actors.find(a=>a[0]==='tolle').splice(1,2,.36,.56);
SEA_CHAPTER.maps.reef.actors.find(a=>a[0]==='pela').splice(1,2,.76,.58);
SEA_CHAPTER.maps.reef.spawn=[.24,.71];
SEA_CHAPTER.maps.reef.exits[0]=['harbor',.165,.685,'退潮漁港'];
window.SeaArrivals={cliff:{harbor:[395,827]},harbor:{cliff:[464,461],reef:[1325,916]},reef:{harbor:[300,713]}};
