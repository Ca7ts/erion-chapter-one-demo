(function(root){'use strict';
 const enemies={
  lizard:{name:'礦脈蜥',art:'lizard-mythic-v2.webp',palette:'板岩藍、鈷藍、冷青晶縫',family:'礦層共生獸',habitat:'濕礦層長進鱗甲，扁爪抓住坑壁；崖下裸露的礦脈也能見到牠。',hp:92,attack:13,armor:9,scale:.88,trait:'stone',xp:12,area:'沉水礦坑、廢棄支坑、月桂崖巢',description:'背部覆著礦層，普通攻擊容易被石甲擋住。每第3回合噴射碎晶，傷害增加4；裂岩重擊能打碎石甲，並阻止後續碎晶噴射。',drops:[['ore',1,.7],['shell',1,.2],['veinCore',1,.05]]},
  moth:{name:'幽燈繭靈',art:'moth-mythic-v2.webp',palette:'紫羅蘭、珍珠白、靛色幽光',family:'礦絲凝成的空心靈體',habitat:'礦絲包裹著空洞面具，沿潮濕礦縫與枯根間的地脈漂移；並非亡者或神祇的化身。',hp:48,attack:10,armor:0,scale:.9,trait:'dust',xp:9,area:'沉水礦坑、廢棄支坑、林地陰濕根縫、崖下礦縫',description:'偶數回合散出幽塵，使下一次行動的攻擊傷害降低20%。當回合先用水刀沖散幽塵，或防禦擋住。',drops:[['mothSilk',1,.7],['lumenDust',1,.2],['cocoonHeart',1,.05]]},
  boar:{name:'荊冠空骸',art:'boar-mythic-v2.webp',palette:'深苔綠、骨白木質、暗紅荊刺',family:'枯根塑成的異形',habitat:'月桂根纏成空心軀殼，木質面具與枝冠偏向一側；長根臂攀住林間坡地與崖石。沒有動物或人的血肉。',hp:138,attack:17,armor:4,scale:1.05,trait:'charge',chargeBonus:18,xp:18,area:'月桂林地、月桂崖巢',description:'第1、4、7…回合紮根蓄力，下一回合以根臂撞擊。成功防禦後，它會失去平衡，下一次受到的攻擊增加25%。',drops:[['boarHide',1,.7],['wood',1,.2],['thornCrown',1,.05]]},
  copperShell:{name:'嵌銅岩殼蟲',art:'copperShell-mythic-v2.webp',palette:'炭黑酒紅礦殼、銅綠扣件、暗紅裂光',family:'人工銅件干預的異變體',habitat:'礦殼上的銅箍緊扣關節，鉚孔是人工加工的痕跡；這份異常能帶回村莊追查。',hp:230,attack:20,armor:14,scale:1.25,trait:'copper',chargeBonus:20,xp:40,area:'救出達蒙後，返回沉水礦坑或廢棄支坑的特殊遭遇',description:'加工過的銅片緊扣甲殼。裂岩重擊可將護甲從14降至4，並將蓄震傷害加成由20降至8；每三回合蓄力一次，下一回合釋放震擊。首次擊敗會取得可交給利昂辨認的甲片。',drops:[['ore',2,.7],['shell',2,.2],['copperCoil',1,.05]],rare:true}
 };
 Object.assign(enemies.lizard,{hp:108,attack:15,armor:10});
 Object.assign(enemies.moth,{hp:56,attack:12,armor:1});
 Object.assign(enemies.boar,{hp:160,attack:20,armor:5});
 Object.assign(enemies.copperShell,{hp:270,attack:24,armor:16});
 enemies.copperShell.description=enemies.copperShell.description.replace('從14降至4','從16降至6');
 enemies.boar.drops.push(['medicinalLeaf',1,.7]);
 // Stable IDs preserve all previously earned materials, kills and quest progress.
 const materials={mothSilk:{name:'幽繭絲',use:'礦絲可混入麻線；3份可在利昂工坊整理成麻線1份，亦可製作加固工作服'},boarHide:{name:'韌根皮',use:'空骸外層柔韌的根皮，可交疊製成工作服內襯，需要2份'},copperShard:{name:'嵌銅甲片',use:'首次擊敗特殊岩殼蟲保證取得；交給利昂辨認，開啟加固工作服配方'}};
 const gear={
  lizard:{weapon:{name:'礦脈蜥鱗重鎚',base:{attack:7}},head:{name:'礦脈蜥鱗戰盔',base:{hp:4,defense:1}},body:{name:'礦脈蜥鱗護衣',base:{hp:6,defense:1}},hands:{name:'礦脈蜥鱗護手',base:{attack:1,hp:4}},feet:{name:'礦脈蜥鱗戰靴',base:{hp:6}}},
  moth:{weapon:{name:'幽燈繭紋鎚',base:{attack:6,mp:1}},head:{name:'幽燈繭絲兜帽',base:{mp:1}},body:{name:'幽燈繭絲法衣',base:{hp:3,mp:2}},neck:{name:'幽燈繭心墜飾',base:{mp:1,skill:1}},cloak:{name:'幽燈繭絲披風',base:{hp:6,mp:1}}},
  boar:{weapon:{name:'荊冠纏根重鎚',base:{attack:8}},body:{name:'荊冠韌根護衣',base:{hp:12}},hands:{name:'荊冠纏根護手',base:{attack:1,hp:4}},feet:{name:'荊冠韌根長靴',base:{hp:10}},cloak:{name:'荊冠根織披風',base:{hp:12}}},
  copperShell:{weapon:{name:'嵌銅殼脊重鎚',base:{attack:7,defense:1}},head:{name:'嵌銅岩殼戰盔',base:{hp:8,defense:1}},body:{name:'嵌銅岩殼護甲',base:{hp:9,defense:2}},hands:{name:'嵌銅殼節護手',base:{attack:1,defense:1}},ring:{name:'嵌銅蓄震戒',base:{crit:1,skill:1}},belt:{name:'嵌銅鎖環腰帶',base:{hp:12,defense:1}}}
 };
 // A minor fixed property of this miniboss's materials, separate from random affixes.
 for(const [slot,profile]of Object.entries(gear.copperShell)){const offense=['weapon','hands','ring'].includes(slot);profile.trait=offense?{id:'copperResonance',name:'蓄震餘力',stat:'attackPct',value:1}:{id:'shellVitality',name:'岩殼韌性',stat:'hpPct',value:1};}
 const gearWeights={lizard:{weapon:.25,head:.2,body:.25,hands:.15,feet:.15},moth:{weapon:.2,head:.15,body:.25,neck:.2,cloak:.2},boar:{weapon:.25,body:.25,hands:.2,feet:.15,cloak:.15},copperShell:{weapon:.2,head:.15,body:.2,hands:.15,ring:.15,belt:.15}};
 const skills={
  lizard:{name:'碎晶噴射',timing:'每第3回合，石甲尚未破除時',effect:'這次攻擊傷害 +4',counter:'裂岩重擊打碎石甲後，整場不再噴射；也可提前防禦。'},
  moth:{name:'幽塵蔽目',timing:'每偶數回合',effect:'攻擊後使玩家下一次行動的攻擊傷害降低20%',counter:'當回合先用漩流迴擊沖散幽塵，或以防禦擋住。'},
  boar:{name:'紮根撞擊',timing:'第1、4、7…回合蓄力，下一回合撞擊',effect:'撞擊傷害 +18',counter:'防禦擋住撞擊可使它失衡，下次受擊增加25%。'},
  copperShell:{name:'銅環蓄震',timing:'第3、6、9…回合蓄力，下一回合震擊',effect:'震擊傷害 +20；銅甲破除後降至 +8',counter:'裂岩重擊破壞銅甲接點，再防禦蓄震攻擊。'}
 };
 Object.assign(materials,{
  medicinalLeaf:{name:'療傷藥葉',tier:'white',use:'2份可在行囊配製止血藥草1份；可向多莉購買，亦可從荊冠空骸纏根間取得。'},
  veinCore:{name:'完整礦脈晶核',tier:'blue',use:'製作蜥鱗裝備時加入，可提升成品品質'},
  lumenDust:{name:'幽燈靈塵',tier:'green',use:'搭配幽繭絲，製作幽燈繭紋鎚或幽燈繭絲法衣'},
  cocoonHeart:{name:'幽燈繭心',tier:'blue',use:'製作幽燈裝備時加入，可提升成品品質'},
  thornCrown:{name:'完整荊冠',tier:'blue',use:'製作荊冠裝備時加入，可提升成品品質'},
  copperCoil:{name:'完好蓄震銅環',tier:'blue',use:'製作嵌銅裝備時加入，可提升成品品質'}
 });
 materials.mothSilk.use='可用3份向利昂交換麻線1份；亦用於繭絲裝備與加固工作服';
 materials.boarHide.use='空骸外層的韌根皮，可製作荊冠裝備與加固工作服';
 const recipes={
  lizard:{level:2,cost:{ore:3,shell:1},core:'veinCore'},
  moth:{level:2,cost:{mothSilk:3,lumenDust:1},core:'cocoonHeart'},
  boar:{level:3,cost:{boarHide:3,wood:1},core:'thornCrown'},
  copperShell:{level:4,cost:{ore:5,shell:2},core:'copperCoil'}
 };
 // Temporary habitat roster: replace individual map entries when new creatures are approved.
 const pools={entrance:[['shell'],['lizard'],['shell','larva']],court:[['root'],['moth'],['root','moth']],coast:[['shell'],['lizard'],['shell','lizard']],mine:[['lizard'],['moth'],['lizard','moth'],['moth','moth']],annex:[['lizard'],['moth','moth'],['lizard','moth']],forest:[['boar'],['moth'],['boar','moth']],cliff:[['lizard'],['boar'],['lizard','moth']]};
 const regionLevels={"entrance":1,"mine":2,"annex":3,"forest":3,"cliff":4,"court":5,"coast":6};
 const regionNames={"entrance":"坍方礦口","mine":"沉水礦坑","annex":"廢棄支坑","forest":"月桂林地","cliff":"月桂崖巢","court":"古祠前庭","coast":"沿海道"};
 const regional={
  ochreStele:{"area":"entrance","name":"赭脊負碑獸","base":{"hp":283,"attack":15,"armor":8,"dodgeChance":2,"critChance":6},"habitat":"長年被礦工搬到路旁的古老獻碑，在地脈失序後與礦口碎岩黏合成獸形。背上仍留有鑿痕與繩索磨出的凹槽；牠會拖著沉重石軀封住狹窄道路。","skill":"負碑震地","warning":"前足離地，背上的古碑朝前傾","attackText":"拖著石角撞向前方","response":"用裂岩重擊打斷震踏，或提前防禦。","period":4,"first":1,"bonus":16,"counter":"earth","mode":"stop","xp":38,"materials":{"ochreSteleMaterial1":{"name":"赭岩硬片","tier":"white","use":"可用於赭脊護手的製作。","chance":0.7},"ochreSteleMaterial2":{"name":"古碑銅釘","tier":"green","use":"可用於赭脊護手的製作。","chance":0.2},"ochreSteleMaterial3":{"name":"沉脈石核","tier":"blue","use":"在利昂工坊加入這枚核心，可提高對應裝備的製作品質。","chance":0.05}},"gear":{"belt":{"name":"負碑束帶","base":{"hp":14,"defense":1},"trait":{"id":"steleVitality","name":"負碑堅韌","stat":"hpPct","value":2},"chance":0.1},"hands":{"name":"赭脊護手","base":{"attack":1,"defense":1},"trait":{"id":"steleVitality","name":"負碑堅韌","stat":"hpPct","value":2},"chance":0.25}},"recipe":{"cost":{"ochreSteleMaterial1":4,"ochreSteleMaterial2":1},"core":"ochreSteleMaterial3","level":3},"role":"defense"},
  drownedNewt:{"area":"mine","name":"沉晶盲螈","base":{"hp":261,"attack":17,"armor":5,"dodgeChance":9,"critChance":4},"habitat":"牠藏在礦坑積水的深處，靠下顎與腹側感受水中的震動。長年接觸溢出的靈脈，使背部長出半透明晶鰭；出水時，晶鰭會短暫映亮黑暗的礦壁。","skill":"沉晶寒息","warning":"背鰭一片接一片結霜","attackText":"貼地撲咬","response":"用漩流迴擊沖散冰晶，寒息的額外傷害減半。","period":3,"first":1,"bonus":10,"counter":"water","mode":"dampen","xp":44,"materials":{"drownedNewtMaterial1":{"name":"濕晶鱗片","tier":"white","use":"可用於濕晶長靴的製作。","chance":0.7},"drownedNewtMaterial2":{"name":"盲螈感鬚","tier":"green","use":"可用於濕晶長靴的製作。","chance":0.2},"drownedNewtMaterial3":{"name":"澄脈晶髓","tier":"blue","use":"在利昂工坊加入這枚核心，可提高對應裝備的製作品質。","chance":0.05}},"gear":{"ring":{"name":"沉晶指環","base":{"mp":2,"skill":1},"trait":{"id":"newtSpirit","name":"澄晶蓄息","stat":"mpPct","value":2},"chance":0.1},"feet":{"name":"濕晶長靴","base":{"hp":8,"defense":1},"trait":{"id":"newtSpirit","name":"澄晶蓄息","stat":"mpPct","value":2},"chance":0.25}},"recipe":{"cost":{"drownedNewtMaterial1":4,"drownedNewtMaterial2":1},"core":"drownedNewtMaterial3","level":3},"role":"balanced"},
  chainLamplighter:{"area":"annex","name":"鏈井執燈者","base":{"hp":261,"attack":22,"armor":4,"dodgeChance":5,"critChance":8},"habitat":"廢井的斷鏈與祭燈在靈脈中纏成空殼。牠拖行時會把舊銅環掛在岩壁上，再用鏈索封住退路；胸前燈火正是維持這副軀體的核心。","skill":"井燈鎖魂","warning":"兩道鎖鏈扯直，胸燈露出鏈圈","attackText":"甩出燈鏈","response":"胸燈亮起時用普通攻擊打斷收鏈，下一擊傷害提高25%。","period":4,"first":2,"bonus":17,"counter":"strike","mode":"expose","xp":50,"materials":{"chainLamplighterMaterial1":{"name":"井鏈銅節","tier":"white","use":"可用於執燈墜飾的製作。","chance":0.7},"chainLamplighterMaterial2":{"name":"不熄燈灰","tier":"green","use":"可用於執燈墜飾的製作。","chance":0.2},"chainLamplighterMaterial3":{"name":"鎖靈燈芯","tier":"blue","use":"在利昂工坊加入這枚核心，可提高對應裝備的製作品質。","chance":0.05}},"gear":{"belt":{"name":"井鏈腰封","base":{"hp":12,"defense":1},"trait":{"id":"chainGuard","name":"鎖井固守","stat":"defensePct","value":2},"chance":0.1},"neck":{"name":"執燈墜飾","base":{"mp":2,"skill":1},"trait":{"id":"chainGuard","name":"鎖井固守","stat":"defensePct","value":2},"chance":0.25}},"recipe":{"cost":{"chainLamplighterMaterial1":4,"chainLamplighterMaterial2":1},"core":"chainLamplighterMaterial3","level":3},"role":"attack"},
  whiteThornStag:{"area":"forest","name":"白枝荊鹿","base":{"hp":289,"attack":19,"armor":6,"dodgeChance":8,"critChance":6},"habitat":"這隻鹿形異物由月桂枯根與受損的白色樹皮聚成，胸腔中沒有血肉。牠會把折斷的荊枝帶回林地深處，編進自己的枝角；枝冠越重，周圍的枯根越容易隨牠移動。","skill":"白荊封徑","warning":"鹿角壓低，荊根從兩側合攏","attackText":"側身以枝角挑擊","response":"用漩流迴擊清開荊根，便能阻止這次合圍。","period":3,"first":1,"bonus":14,"counter":"water","mode":"stop","xp":50,"materials":{"whiteThornStagMaterial1":{"name":"白枝韌皮","tier":"white","use":"可用於荊冕披風的製作。","chance":0.7},"whiteThornStagMaterial2":{"name":"荊冠枝節","tier":"green","use":"可用於荊冕披風的製作。","chance":0.2},"whiteThornStagMaterial3":{"name":"月桂根心","tier":"blue","use":"在利昂工坊加入這枚核心，可提高對應裝備的製作品質。","chance":0.05}},"gear":{"ring":{"name":"白枝指環","base":{"hp":10,"defense":1},"trait":{"id":"whiteRootLife","name":"白枝生息","stat":"hpPct","value":2},"chance":0.1},"cloak":{"name":"荊冕披風","base":{"hp":14},"trait":{"id":"whiteRootLife","name":"白枝生息","stat":"hpPct","value":2},"chance":0.25}},"recipe":{"cost":{"whiteThornStagMaterial1":4,"whiteThornStagMaterial2":1},"core":"whiteThornStagMaterial3","level":3},"role":"balanced"},
  galeBronzeWing:{"area":"cliff","name":"逆風銅翼","base":{"hp":250,"attack":25,"armor":4,"dodgeChance":13,"critChance":8},"habitat":"長年棲在崖頂逆風處的巨大怪鳥，羽骨因啄食礦砂而逐漸硬化。牠以完整的猛禽鷹首與弓形羽冠辨識同類，振翅時會讓銅緣飛羽交錯，發出低沉的金屬鳴響。","skill":"逆風刃羽","warning":"銅翼迎風展開，翼尖齊齊轉向你","attackText":"掠過肩頭，以翼刃斜切","response":"防禦接下刃羽，趁牠落地收翼時反擊，下一擊傷害提高25%。","period":3,"first":2,"bonus":17,"counter":"guard","mode":"guardExpose","xp":56,"materials":{"galeBronzeWingMaterial1":{"name":"銅骨長羽","tier":"white","use":"可用於銅翼披肩的製作。","chance":0.7},"galeBronzeWingMaterial2":{"name":"逆風羽軸","tier":"green","use":"可用於銅翼披肩的製作。","chance":0.2},"galeBronzeWingMaterial3":{"name":"風紋羽髓","tier":"blue","use":"在利昂工坊加入這枚核心，可提高對應裝備的製作品質。","chance":0.05}},"gear":{"belt":{"name":"逆風腰帶","base":{"attack":1,"hp":8},"trait":{"id":"galeMomentum","name":"逆風銳勢","stat":"attackPct","value":1.5},"chance":0.1},"cloak":{"name":"銅翼披肩","base":{"hp":8,"crit":1},"trait":{"id":"galeMomentum","name":"逆風銳勢","stat":"attackPct","value":1.5},"chance":0.25}},"recipe":{"cost":{"galeBronzeWingMaterial1":4,"galeBronzeWingMaterial2":1},"core":"galeBronzeWingMaterial3","level":3},"role":"attack"},
  brokenCenser:{"area":"court","name":"裂盞祭衛","base":{"hp":287,"attack":27,"armor":5,"dodgeChance":3,"critChance":8},"habitat":"前庭受損的祭盞在殘存靈脈牽引下重新站起。三隻銅足依舊保留古祠的獸爪紋飾，碎裂盞腹中的灰燼卻發出異常紫光；牠把任何靠近的人都當成闖入者。","skill":"裂盞祭火","warning":"盞腹的餘燼重新燒紅","attackText":"甩出左側吊盆，右盆緊接著橫掃","response":"用漩流迴擊澆熄火星，阻止這次祭火噴發。","period":4,"first":1,"bonus":22,"counter":"water","mode":"stop","xp":62,"materials":{"brokenCenserMaterial1":{"name":"祭盞陶片","tier":"white","use":"可用於祭盞護手的製作。","chance":0.7},"brokenCenserMaterial2":{"name":"守祭銅爪","tier":"green","use":"可用於祭盞護手的製作。","chance":0.2},"brokenCenserMaterial3":{"name":"凝燼祭珠","tier":"blue","use":"在利昂工坊加入這枚核心，可提高對應裝備的製作品質。","chance":0.05}},"gear":{"ring":{"name":"守祭指環","base":{"defense":1,"mp":1},"trait":{"id":"censerGuard","name":"守祭餘護","stat":"defensePct","value":2},"chance":0.1},"hands":{"name":"祭盞護手","base":{"attack":1,"defense":1},"trait":{"id":"censerGuard","name":"守祭餘護","stat":"defensePct","value":2},"chance":0.25}},"recipe":{"cost":{"brokenCenserMaterial1":4,"brokenCenserMaterial2":1},"core":"brokenCenserMaterial3","level":3},"role":"attack"},
  reefTideBearer:{"area":"coast","name":"礁冠負潮者","base":{"hp":383,"attack":20,"armor":11,"dodgeChance":2,"critChance":5},"habitat":"牠背負巨大的暗紫螺殼，長年附著的鹽礁在殼頂形成尖銳冠脊。浪退後，殼內積水會沿礁縫流下；牠就利用這份重量，把獵物逼進岸邊狹窄的石隙。","skill":"負潮回湧","warning":"螺殼向側面傾斜，潮水灌入鹽礁","attackText":"揚起重螯向前夾擊","response":"用裂岩重擊敲鬆鹽礁，回湧的額外傷害減半。","period":3,"first":1,"bonus":18,"counter":"earth","mode":"dampen","xp":68,"materials":{"reefTideBearerMaterial1":{"name":"鹽礁厚甲","tier":"white","use":"可用於負潮護靴的製作。","chance":0.7},"reefTideBearerMaterial2":{"name":"潮紋螺片","tier":"green","use":"可用於負潮護靴的製作。","chance":0.2},"reefTideBearerMaterial3":{"name":"回潮珍珠","tier":"blue","use":"在利昂工坊加入這枚核心，可提高對應裝備的製作品質。","chance":0.05}},"gear":{"belt":{"name":"礁冠腰帶","base":{"hp":16,"defense":1},"trait":{"id":"reefVitality","name":"礁冠厚生","stat":"hpPct","value":2},"chance":0.1},"feet":{"name":"負潮護靴","base":{"hp":10,"defense":1},"trait":{"id":"reefVitality","name":"礁冠厚生","stat":"hpPct","value":2},"chance":0.25}},"recipe":{"cost":{"reefTideBearerMaterial1":4,"reefTideBearerMaterial2":1},"core":"reefTideBearerMaterial3","level":3},"role":"defense"}
 };
 const regionalFor={};
 const boostRare=base=>Object.fromEntries(Object.entries(base).map(([key,n])=>[key,Math.round(n*1.5)]));
 Object.assign(enemies.copperShell,boostRare({hp:270,attack:24,armor:16}));
 enemies.copperShell.description=enemies.copperShell.description.replace('從16降至6','降至6')+' 空位足夠時，牠會敲響銅甲呼喚同類。';
 for(const [id,r] of Object.entries(regional)){
  regionalFor[r.area]=id;const drops=Object.entries(r.materials).map(([k,m])=>[k,1,m.chance]);
  enemies[id]={name:r.name,art:id+'.webp',rare:true,level:regionLevels[r.area],...boostRare(r.base),scale:1.65,sprite:0,area:regionNames[r.area],habitat:r.habitat,description:r.warning+'。',xp:r.xp,drops};
  Object.assign(materials,r.materials);gear[id]=r.gear;recipes[id]=r.recipe;
  skills[id]={name:r.skill,timing:'第'+r.first+'回合預警，此後每'+r.period+'回合一次，下一回合施放',effect:'命中時額外造成 '+r.bonus+' 點基礎傷害',counter:r.response};
 }
 const roleNames={defense:'防禦型',attack:'攻擊型',balanced:'均衡型'};
 const roles={shell:'defense',larva:'attack',mother:'balanced',guardian:'defense',root:'balanced',lizard:'defense',moth:'attack',boar:'attack',copperShell:'defense'};
 for(const [id,r] of Object.entries(regional))roles[id]=r.role;
 const field={"screeMask":{"base":[67,9,5],"role":"defense","xp":8,"coins":7,"slots":["head","hands"],"gear":[{"hp":6,"defense":1},{"attack":1,"hp":3}],"rate":0.12,"warning":"壓低石面，肩上的赤砂沿裂縫滑落","basic":"抬起石腕往前拍落","counter":"strike","mode":"blind","bonus":2,"period":4,"first":1,"supply":["赭土敷布",28,0],"color":"#d9a261","height":0.78,"name":"封塵石面","area":"entrance","habitat":"震落的礦岩夾住一塊古老石面，殘留的靈脈讓碎岩聚成低伏的軀殼。不是外來生物，也不是礦工的亡魂。","skill":"碎屑遮目","lore":"抖落礦塵短暫妨礙視線，碎裂的石面是弱點。","materials":["封塵石片","赭砂結核"],"equipment":["石面護額","赭砂護手"],"effect":"礦塵使下一擊傷害降低15%。"},"chainShade":{"base":[85,17,3],"role":"attack","xp":15,"coins":12,"slots":["hands","neck"],"gear":[{"attack":2},{"mp":2,"skill":1}],"rate":0.16,"warning":"兩束鉤鏈拉開，鎖環之間露出一線銀光","basic":"甩出右側鏈鉤","counter":"strike","mode":"bind","bonus":4,"period":3,"first":1,"supply":["沉井涼露",0,7],"color":"#74b7a9","height":0.91,"name":"銅鏈噤靈","area":"annex","habitat":"廢井的銅鏈長年浸在靈脈滲水裡，纏成沒有肉身的鐘形空殼。移動時鏈環互相摩擦，卻幾乎聽不見聲音。","skill":"封鏈纏握","lore":"兩束鏈臂夾住武器；命中鏈結可使束縛鬆開。","materials":["鏽銅鏈節","噤聲環芯"],"equipment":["銅鏈護腕","沉井垂飾"],"effect":"鏈鉤纏住武器，使下一擊傷害降低20%。"},"laurelMaw":{"base":[105,16,4],"role":"balanced","xp":16,"coins":13,"slots":["cloak","feet"],"gear":[{"hp":9,"mp":1},{"defense":1,"hp":6}],"rate":0.16,"warning":"根足扎進土裡，赭色苞片內浮起花粉","basic":"探出花萼，咬向厄里昂","counter":"water","mode":"pollen","bonus":6,"period":3,"first":1,"supply":["凝香花膏",36,0],"color":"#e7a06d","height":0.76,"name":"赭蕊噬根","area":"forest","habitat":"失序靈脈使月桂老根生出反常花蕊，垂下的赤褐苞片掩住硬化根齒。它只在陰濕土層扎根，會被足步震動驚動。","skill":"閉蕊噬咬","lore":"先將根足壓入土中，再猛然收攏苞片；水勢能沖散致昏花粉。","materials":["赭蕊厚瓣","凝香根脂"],"equipment":["赭蕊披肩","韌瓣短靴"],"effect":"合攏苞片時釋放花粉，使下一擊傷害降低15%。"},"bronzeHarpy":{"base":[91,23,3],"role":"attack","xp":20,"coins":15,"slots":["cloak","hands"],"gear":[{"hp":6,"crit":1},{"attack":2,"crit":1}],"rate":0.17,"warning":"雙翼攏起，銅羽邊緣迎風顫鳴","basic":"收攏一翼，斜掠過來","mode":"overreach","bonus":9,"period":3,"first":1,"supply":["銅羽行軍露",12,5],"color":"#eab17c","height":0.93,"name":"銅羽哀鳥","area":"cliff","habitat":"棲在崖壁裂穴的怪鳥，琥珀色銳眼藏在層疊的煙藍面羽之間；頭冠向後揚起，羽軸因吞食礦砂而帶銅色硬邊。牠並非獅鷲的變種。","skill":"逆風削羽","lore":"振翼捲起碎羽，攻擊後短暫失去平衡。","materials":["銅緣飛羽","哀鳥喉骨"],"equipment":["銅羽披風","逆風護手"],"effect":"削羽命中後，哀鳥失衡，下一次受擊增加25%。"},"riftRam":{"base":[145,26,6],"role":"attack","xp":22,"coins":17,"slots":["head","feet"],"gear":[{"hp":10,"defense":1},{"attack":1,"hp":8}],"rate":0.18,"warning":"低下裂角，前蹄刨開崖面碎石","basic":"側過額角，挑擊身前","mode":"brace","bonus":13,"period":4,"first":1,"supply":["紫鹽補給包",38,0],"color":"#c4a0ea","height":0.91,"name":"裂角山魈","area":"cliff","habitat":"攀崖的異獸以礦鹽為食，盤角長成層疊岩環。額前岩片裂開時會露出暗紫色礦核，像一張沉默的面具。","skill":"裂角突撞","lore":"低頭蓄勢後直線衝撞；閃避後可趁它轉身緩慢反擊。","materials":["岩環角片","紫鹽髓晶"],"equipment":["裂角戰盔","攀崖長靴"],"effect":"攔住衝撞可使牠失衡，下一次受擊增加25%。"},"ashAmphora":{"base":[123,18,9],"role":"defense","xp":23,"coins":17,"slots":["body","hands"],"gear":[{"hp":11,"defense":2},{"defense":2,"mp":1}],"rate":0.17,"warning":"壺腹發出一聲悶響，肩口裂縫溢出灰煙","basic":"傾斜陶身，以壺肩撞過來","counter":"earth","mode":"stop","bonus":10,"period":4,"first":1,"supply":["灰陶藥膏",42,0],"color":"#d7a791","height":0.8,"name":"灰燼祭壺","area":"court","habitat":"被遺棄的祭壺吞進失序靈脈，灰燼沿破口凝成筋絡，讓陶柄能像手臂般活動。它是失控祭器，並非神祇化身。","skill":"倒灌灰潮","lore":"壺腹先傳出悶響，接著噴出貼地灰霧；擊中裂口可打斷。","materials":["祭壺陶片","凝灰靈砂"],"equipment":["祭陶護胸","灰紋護手"],"effect":"蓄勢被打斷便無法施放這次技能。"},"oathStatue":{"base":[147,20,11],"role":"defense","xp":25,"coins":19,"slots":["head","hands"],"gear":[{"hp":11,"defense":2},{"attack":1,"defense":2}],"rate":0.18,"warning":"三張石面開始輪轉，胸前裂開的銅扣露了出來","basic":"用石掌橫掃前方","counter":"strike","mode":"ward","bonus":4,"period":4,"first":1,"supply":["三印清心油",0,9],"color":"#daca8f","height":0.97,"name":"三面殘誓像","area":"court","habitat":"守廊殘像受錯亂靈脈驅動，三張刻在同一石首上的面孔依序朝向聲響。它保存的是舊誓詞的形貌，沒有神祇意識。","skill":"三誓輪守","lore":"輪轉石首改換守勢；換面時露出胸前破損接點。","materials":["殘誓石屑","古銅誓扣"],"equipment":["殘誓石盔","古誓護腕"],"effect":"石首換面後，下次受擊傷害降低30%。"},"tidalCrab":{"base":[165,23,12],"role":"defense","xp":28,"coins":20,"slots":["hands","body"],"gear":[{"attack":2,"defense":1},{"hp":14,"defense":2}],"rate":0.19,"warning":"張開雙鉗，側起背碑，露出腹下柔軟的甲節","basic":"橫移半步，以鉗背猛擊","counter":"strike","mode":"weakspot","bonus":11,"period":3,"first":1,"supply":["潮甲繫帶",45,0],"color":"#72bfcc","height":0.75,"name":"負碑潮螯","area":"coast","habitat":"沿岸潮螯把海底殘碑當作背甲，長年鹽蝕使碑面與甲殼黏合。它常把碎石拖回潮穴，留下彷彿祭道的痕跡。","skill":"負碑側撞","lore":"側身借背甲撞擊；前鉗張開後露出薄弱腹節。","materials":["潮螯硬甲","海蝕碑片"],"equipment":["潮螯護手","負碑護衣"],"effect":"在雙鉗張開時命中腹節，這一擊傷害增加25%，側撞威力降低。"},"saltSerpent":{"base":[110,28,4],"role":"attack","xp":25,"coins":18,"slots":["cloak","feet"],"gear":[{"mp":2,"crit":1},{"attack":2,"hp":6}],"rate":0.18,"warning":"張開半透明頸褶，細鹽從頸側飄起","basic":"探頭疾咬，再沿原路縮回","counter":"strike","mode":"salt","bonus":7,"period":3,"first":1,"supply":["鹽紗水鹽包",18,6],"color":"#a3dfca","height":0.8,"name":"鹽紗伏蛇","area":"coast","habitat":"淺潮鹽結附在巨蛇鱗間，形成薄紗般的礦片；牠伏在退潮石縫時，幾乎與白色海沫混為一體。","skill":"鹽紗絞纏","lore":"張開頸褶揚起鹽霧，再以尾段纏擊；頸褶展開時較脆弱。","materials":["鹽紗鱗膜","凝潮蛇牙"],"equipment":["鹽紗披風","伏蛇短靴"],"effect":"尾段纏住手臂，使下一擊傷害降低15%。"},"shellLament":{"base":[130,24,6],"role":"balanced","xp":26,"coins":19,"slots":["neck","head"],"gear":[{"mp":3,"skill":1},{"hp":7,"mp":2}],"rate":0.17,"warning":"殼口泛起銀光，珊瑚架隨低鳴輕顫","basic":"擺動珊瑚架，掃向近身","counter":"strike","mode":"stop","bonus":12,"period":3,"first":1,"supply":["鳴殼凝露",0,10],"color":"#a8caec","height":0.9,"name":"鳴殼悼靈","area":"coast","habitat":"被靈脈浸染的螺殼將風聲放大成哀鳴，珊瑚與藻根沿裂口長成豎琴般的空架。它沒有亡者靈魂，只會追逐持續的聲響。","skill":"空殼回鳴","lore":"殼內先亮起淡光，再釋放近距離聲浪；在共鳴前擊中珊瑚架可中斷。","materials":["悼鳴螺片","銀潮藻絲"],"equipment":["鳴殼墜飾","銀潮兜帽"],"effect":"蓄勢被打斷便無法施放這次技能。"}},supplies={};
 for(const [id,f] of Object.entries(field)){
  roles[id]=f.role;const [hp,attack,armor]=f.base,lv=regionLevels[f.area],chip=id+'Chip',core=id+'Heart',pack=id+'Supply',labels={strike:'普通攻擊',water:'漩流迴擊',earth:'裂岩重擊'};
  enemies[id]={name:f.name,art:id+'.webp',hp,attack,armor,sprite:0,scale:f.height+.12,level:lv,area:regionNames[f.area],habitat:f.habitat,description:f.lore,xp:f.xp,drops:[[chip,1,.70],[core,1,.20],[pack,1,.09]]};
  gear[id]={};gearWeights[id]={};f.slots.forEach((slot,i)=>{gear[id][slot]={name:f.equipment[i],base:f.gear[i]};gearWeights[id][slot]=i===0?.6:.4});recipes[id]={level:lv,cost:{[chip]:3},core};
  materials[chip]={name:f.materials[0],tier:'white',use:'在利昂工坊可用三份製作'+f.equipment.join('或')+'。'};materials[core]={name:f.materials[1],tier:'green',use:'製作'+f.equipment.join('或')+'時加入一份，可提高成品品質。'};
  const [name,life,spirit]=f.supply;supplies[pack]={name,hp:life,mp:spirit};materials[pack]={name,tier:'green',use:'恢復'+[life?'生命 '+life:'',spirit?'精神 '+spirit:''].filter(Boolean).join('、')+'。可在探索或戰鬥時使用。'};
  skills[id]={name:f.skill,timing:'第'+f.first+'回合開始蓄勢，下一回合施放；之後每'+f.period+'回合重複。',effect:f.effect,counter:f.counter?'觀察蓄勢，用'+labels[f.counter]+'抓住破綻。':f.mode==='brace'?'提前防禦，趁轉身時反擊。':'收翼落地後再反擊。'};
 }
 Object.assign(pools,{"entrance":[["shell"],["lizard"],["screeMask"],["shell","larva"]],"annex":[["lizard"],["moth"],["chainShade"],["moth","chainShade"]],"forest":[["root"],["boar"],["laurelMaw"],["root","laurelMaw"]],"cliff":[["lizard"],["bronzeHarpy"],["riftRam"]],"court":[["root"],["ashAmphora"],["oathStatue"]],"coast":[["tidalCrab"],["saltSerpent"],["shellLament"],["tidalCrab","saltSerpent"]]});
function canUseSupply(s,k){const p=supplies[k];return !!p&&(s.items[k]||0)>0&&((p.hp>0&&s.hp<s.maxHp)||(p.mp>0&&s.mp<s.maxMp))}
function useSupply(s,k){if(!canUseSupply(s,k))return false;const p=supplies[k],hp=s.hp,mp=s.mp;s.hp=Math.min(s.maxHp,s.hp+p.hp);s.mp=Math.min(s.maxMp,s.mp+p.mp);s.items[k]--;return {hp:s.hp-hp,mp:s.mp-mp}}
function fieldTurn(e,n,f){e.usedFieldSkill=false;if(e.primed){e.primed=false;const broken=e.disrupted;e.disrupted=false;
 if(broken&&!['weakspot','salt'].includes(f.mode))return {skip:true,text:e.name+'沒能使出「'+f.skill+'」。'};
 e.usedFieldSkill=true;e.softCast=!!broken;if(f.mode==='ward')e.fieldWard=true;
 return {action:'skill',noDamage:f.mode==='ward',bonus:broken?Math.floor(f.bonus/2):f.bonus,text:e.name+'施放「'+f.skill+'」！'};}
 if(n>=f.first&&(n-f.first)%f.period===0){e.primed=true;e.disrupted=false;return {skip:true,text:e.name+f.warning+'。'}}
 return {action:'attack',text:e.name+f.basic+'！'}}
function fieldStrike(e,type,f){let multiplier=e.exposed?1.25:1,text='';e.exposed=false;if(e.fieldWard){e.fieldWard=false;multiplier*=.7;text='守勢卸力'}if(e.primed&&f.counter===type){e.disrupted=true;if(['weakspot','salt'].includes(f.mode)){multiplier*=1.25;text='擊中薄弱處'}else text='打斷蓄勢'}return {multiplier,text}}
function fieldAfter(e,b,guard,f){if(!e.usedFieldSkill)return;if(f.mode==='overreach'||f.mode==='brace'&&guard==='guard')e.exposed=true;if(!guard&&!e.softCast&&['blind','pollen','bind','salt'].includes(f.mode)){const n=f.mode==='bind'?.20:.15;if(n>=(b.weaken||0)){b.weaken=n;b.weakenSource=f.skill}}e.usedFieldSkill=false}
 // Existing species keep the scale of their story encounters; their role changes the distribution.
 const ordinaryModifiers={shell:[1.08,.93,1.35],larva:[.9,1.13,1],mother:[1,1,1],guardian:[1.06,.94,1.32],root:[1,1,1],lizard:[1.09,.94,1.15],moth:[.91,1.18,1],boar:[.94,1.14,.78]};
 const nativeLevels={shell:1,larva:2,lizard:2,moth:2,boar:3,root:3,mother:2,guardian:5,copperShell:3};
 const chapterLevelCap=Math.max(...Object.values(regionLevels));
 const validLevel=n=>Number.isInteger(n)&&n>=1&&n<=chapterLevelCap;
 function withFieldLevels(spec,area,rng=Math.random){
  const local=regionLevels[area];
  if(!local||spec.levels?.length===spec.enemies.length&&spec.levels.every(validLevel))return spec;
  const levels=spec.enemies.map(()=>{const roll=rng(),offset=roll<.15?-1:roll>=.85?1:0;return Math.min(chapterLevelCap,Math.max(1,local+offset));});
  return {...spec,area,levels};
 }
 function battleStats(kind,base,area,individualLevel){
  const native=enemies[kind]?.level||nativeLevels[kind]||1,level=validLevel(individualLevel)?individualLevel:regionLevels[area]||native,delta=level-native;
  const [health,power,plating]=base.hatchling?[1,1,1]:ordinaryModifiers[kind]||[1,1,1];
  const attack=base.attack*power,armor=(base.armor||0)*plating;
  return {...base,level,role:roles[kind],roleName:roleNames[roles[kind]],hp:Math.max(1,Math.round(base.hp*health*(1+.12*delta))),attack:Math.max(1,Math.round(attack+Math.max(1,attack*.085)*delta)),armor:armor?Math.max(0,Math.round(armor+Math.max(1,armor*.1)*delta)):0};
 }
 function poolFor(s,area){if(area==='entrance'&&!s.flags.water)return [['shell']];return ['mine','annex'].includes(area)&&!s.flags.earth?[['lizard'],['moth']]:(pools[area]||[]);}
 function init(s){s.bestiary??={version:2,sinceRare:0,seen:{},kills:{},found:false,identified:false};s.bestiary.version=2;s.bestiary.seen??={};s.bestiary.kills??={};return s.bestiary;}
 function packSize(roll){return roll<.20?1:roll<.65?2:roll<.95?3:4;}
 function shellAlly(rng=Math.random){if(rng()>=.10)return null;return rng()<.05?'copperShell':'shell';}
 function encounter(s,area,rng=Math.random){const book=init(s);let kinds;const regionalId=regionalFor[area],eligible=!!regionalId&&(area!=='entrance'||s.flags.water);book.regionalMisses??={};const misses=book.regionalMisses[area]||0;
  if(['mine','annex'].includes(area)&&s.flags.rescued){book.sinceRare++;if(book.sinceRare>=5||rng()<.2){if(misses<4||(!book.found&&misses===4)){book.sinceRare=0;kinds=['copperShell'];}}}
  if(eligible){if(!kinds&&(misses>=4||rng()<.18)){kinds=[regionalId];book.regionalMisses[area]=0;}else book.regionalMisses[area]=Math.min(5,misses+1);}
  const pool=poolFor(s,area);if(!kinds&&pool?.length)kinds=pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];if(!kinds)return null;
  const count=packSize(rng()),leader=kinds[0],pack=kinds.slice(0,count);
  if(pack.length<count){
   const companions=kinds.length>1?kinds:enemies[leader]?.rare?pool.flat():[leader,...pool.flat()];
   const companion=companions[Math.floor(rng()*companions.length)];
   while(pack.length<count)pack.push(companion);
  }
  kinds=pack;
  return withFieldLevels({area,title:kinds.includes('copperShell')?'礦道異響 · 嵌銅岩殼蟲':[...new Set(kinds)].map(k=>enemies[k]?.name||({shell:'岩殼蟲',larva:'岩殼幼蟲',root:'荊根獸'}[k])).join('、'),enemies:kinds},area,rng);
 }
 const defeatedFor=spec=>spec.defeated??spec.enemies.map(kind=>({kind,summoned:false}));
 materials.forgeSeal={name:'守紋印',tier:'blue',use:'鎚子或裝備合成時，可保留主件的一條詞條。成功時消耗。'};
 for(const e of Object.values(enemies))if(e.rare&&e.drops&&!e.drops.some(d=>d[0]==='forgeSeal'))e.drops.push(['forgeSeal',1,.25]);
 const materialTable=kind=>{const boss=kind==='mother'||kind==='guardian',rows=enemies[kind]?.drops||({root:[['wood',1,.7]],mother:[['shell',2,.7],['ore',1,.2]],guardian:[['ore',2,.7],['wood',1,.2]]}[kind])||[['shell',1,.7]];
  return boss?[...rows.filter(([k])=>k!=='forgeSeal'),['forgeSeal',1,.4]]:rows;};
 function materialsFor(s,spec,rng=Math.random){const out={...(spec.reward||{})};
  for(const {kind,summoned} of defeatedFor(spec)){if(summoned)continue;for(const [item,n,chance]of materialTable(kind))if(chance===1||rng()<chance)out[item]=(out[item]||0)+n;}
  if(spec.enemies.includes('copperShell')&&!init(s).found)out.copperShard=1;return out;
 }
 function victory(s,spec){const b=init(s);for(const {kind:k} of defeatedFor(spec)){b.seen[k]=true;b.kills[k]=(b.kills[k]||0)+1;}if(spec.enemies.includes('copperShell'))b.found=true;}
 function identify(s,growth){const b=init(s);if(!b.found||b.identified)return false;b.identified=true;growth.award(s,'copper-evidence',40);return true;}
 const threadSilkCost=3;
 function craft(s,key,loot){const b=init(s);if(key==='thread'){if((s.items.mothSilk||0)<threadSilkCost)return false;s.items.mothSilk-=threadSilkCost;s.items.thread=(s.items.thread||0)+1;return true;}
  if(key==='lining'&&b.identified&&s.level>=3&&(s.items.boarHide||0)>=2&&(s.items.mothSilk||0)>=2){const l=loot.init(s);if(l.items.some(i=>i.id==='quest-lining'))return false;s.items.boarHide-=2;s.items.mothSilk-=2;l.items.push({id:'quest-lining',name:'加固礦工工作服',slot:'body',rarity:'white',level:3,base:{hp:24,defense:2},affixes:[],source:'利昂工坊 · 甲片調查配方',locked:true});return true;}return false;
 }
 function craftGear(s,kind,slot,enhanced,loot,rng=Math.random){
  const recipe=recipes[kind];if(['ring','belt'].includes(slot)||!recipe||!gear[kind]?.[slot]||s.level<recipe.level||!init(s).kills[kind]||!s.flags.rescued)return null;
  const cost={...recipe.cost};if(enhanced)cost[recipe.core]=1;
  if(Object.entries(cost).some(([k,n])=>(s.items[k]||0)<n))return null;
  const item=loot.roll(s,{template:kind,slot,rarity:enhanced?'blue':'green',source:'利昂工坊 · '+enemies[kind].name,rng});
  for(const [k,n] of Object.entries(cost))s.items[k]-=n;return item;
 }
 function guardianTurn(foe, round){
  if(foe.charge){
   foe.nextSweep = round + (foe.awakened ? 2 : 3);
   return {action:'skill',bonus:foe.awakened ? 8 : 0,text:'銅根裂庭！守像轉腰橫掃，地脈沿鎚痕迸開！'};
  }
  const awakens = !foe.awakened && foe.hp <= foe.max * .5;
  if(!awakens && round < (foe.nextSweep ?? 3))return null;
  foe.awakened ||= awakens;
  foe.charge = true;
  return {skip:true,text:awakens ? '胸甲裂開，銅根一束束纏上鎚柄。前庭的石板開始震動。' : '守像將重鎚拖向身側，散落的銅屑正往鎚頭聚攏。'};
 }
 function intent(e,round){if(e.kind==='guardian'){if(e.charge)return '鎚頭聚氣 · 即將橫掃';if(e.exposed)return '胸甲張開';return e.awakened?'銅根熾亮':'守在殿門前';}if(!enemies[e.kind])return'';if(e.exposed)return'失衡：下次受擊 +25%';const f=field[e.kind];if(f)return e.primed?f.warning:e.fieldWard?'石首守勢':f.basic;const r=regional[e.kind];if(r)return e.primed?r.warning:r.attackText;if(e.charge)return e.kind==='copperShell'?'銅環蓄震即將釋放：建議防禦':'紮根撞擊即將發動：建議防禦';if(e.kind==='lizard')return e.armor?(round%3===0?'碎晶噴射：重擊破甲或防禦':'石甲：裂岩重擊可破甲'):'石甲已碎，無法噴射碎晶';if(e.kind==='moth')return round%2===0?'聚集幽塵：水刀或防禦':'絲束揮擊';if(e.kind==='boar')return round%3===1?'紮根蓄力':'根臂揮擊';return round%3===0?'銅環蓄震：下回合震擊':e.armor>6?'銅甲：重擊可削弱蓄震':'銅甲已破，蓄震減弱';}
 function strike(e,type,round){if(e.kind==='guardian'&&e.exposed){e.exposed=false;return {text:'擊中裸露的銅根',multiplier:1.5};}if(field[e.kind])return fieldStrike(e,type,field[e.kind]);let text='';const r=regional[e.kind];if(r&&e.primed&&type===r.counter){e.disrupted=true;text=r.mode==='dampen'?'蓄力減弱':'蓄力中斷';}if(type==='earth'&&['lizard','copperShell'].includes(e.kind)&&!e.plateBroken){e.plateBroken=true;e.armor=e.kind==='lizard'?0:6;if(e.kind==='copperShell')e.chargeBonus=8;text=e.kind==='lizard'?'石甲碎裂':'銅甲接點崩開';}if(type==='water'&&e.kind==='moth'){e.disruptedRound=round;text='水流沖散幽塵';}const multiplier=e.exposed?1.25:1;e.exposed=false;return {text,multiplier};}
 function turn(e,round){if(e.kind==='guardian')return guardianTurn(e,round);if((e.kind==='root'||e.kind==='shell')&&round%3===0)return {action:'skill',bonus:0,text:e.name+(e.kind==='root'?'前足震踏，荊根沿著地面穿出！':'使出岩殼震擊，兩螯把石屑鏟向前方！')};if(!enemies[e.kind])return null;e.dusting=false;if(field[e.kind])return fieldTurn(e,round,field[e.kind]);
  const r=regional[e.kind];if(r){e.usedRegionalSkill=false;
   if(e.primed){e.primed=false;const disrupted=e.disrupted;e.disrupted=false;
    if(disrupted&&r.mode!=='dampen'){if(r.mode==='expose')e.exposed=true;return {skip:true,text:e.name+'的「'+r.skill+'」被打斷了！'};}
    e.usedRegionalSkill=true;return {action:'skill',bonus:disrupted?Math.floor(r.bonus/2):r.bonus,text:e.name+'施放「'+r.skill+'」！'};}
   if(round>=r.first&&(round-r.first)%r.period===0){e.primed=true;return {skip:true,text:e.name+r.warning+'。'};}
   return {action:'attack',text:e.name+r.attackText+'！'};
  }
  if((e.kind==='boar'&&round%3===1||e.kind==='copperShell'&&round%3===0)&&!e.charge){e.charge=true;return{skip:true,text:e.name+(e.kind==='boar'?'將根臂扎入地面蓄力！下一回合將撞向前方。':'壓低身軀蓄力！下一回合將發動衝撞。')};}
  e.dusting=e.kind==='moth'&&round%2===0&&e.disruptedRound!==round;
  return{skip:false,bonus:e.kind==='lizard'&&!e.plateBroken&&round%3===0?4:0,text:e.name+(e.kind==='lizard'&&!e.plateBroken&&round%3===0?'抖落背甲，噴出一陣碎晶！':e.charge?(e.kind==='copperShell'?'釋放銅環蓄震，猛然撞擊！':'根臂猛然撞來！'):e.dusting?'張開繭殼，散出一團幽塵！':e.kind==='moth'?'甩動礦絲，抽向前方！':e.kind==='lizard'?'揮動前爪，向前撲咬！':e.kind==='boar'?'掄起根臂，掃向厄里昂！':'向前猛撲！')};
 }
 function afterAttack(e,b,guard,charged){if(field[e.kind])return fieldAfter(e,b,guard,field[e.kind]);if(e.usedRegionalSkill&&regional[e.kind]?.mode==='guardExpose'&&guard==='guard')e.exposed=true;if(e.dusting&&!guard){b.weaken=.2;b.weakenSource='幽塵'}if((e.kind==='boar'||e.kind==='guardian')&&charged&&guard==='guard')e.exposed=true;}
 const api={field,supplies,canUseSupply,useSupply,roleNames,roles,regionLevels,regional,regionalFor,withFieldLevels,battleStats,enemies,materials,gear,gearWeights,skills,recipes,craftGear,pools,poolFor,init,encounter,shellAlly,defeatedFor,materialTable,materialsFor,victory,identify,craft,threadSilkCost,intent,strike,turn,afterAttack};const rules=root.LeonPatterns||(typeof module!=='undefined'?require('./leon-patterns'):null);if(rules)rules.book(api);if(typeof module!=='undefined')module.exports=api;else root.Bestiary=api;
})(typeof window!=='undefined'?window:globalThis);
