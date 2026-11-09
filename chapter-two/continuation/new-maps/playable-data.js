/* Normalized coordinates are shared by painting, navigation, sites and arrivals. */
window.SeaNewMaps=(()=>{
 const enabled=new URLSearchParams(location.search).get('newMaps')!=='0',W=1536,H=660;
 const maps={
 cliff:{spawn:[.13,.45],actors:[['niko',.69,.54],['demeter',.65,.52],['dori',.335,.581],['kleon',.50,.58],['oreia',.56,.60],['poseidon',.61,.61]],props:[['jars','盛海水的陶缸',.298,.529],['rope','救援繩索',.261,.435],['pool','崖上的舊鹽池',.381,.432],['letter','利昂轉交的信',.46,.57]],exits:[['chapter-one',.061,.385,'沿海道'],['harbor',.496,.953,'退潮漁港']]},
 harbor:{spawn:[.60,.23],actors:[['kleon',.408,.367],['niko',.43,.44],['philon',.32,.52],['tolle',.28,.59],['poseidon',.383,.49]],props:[['timber','散落的好木料',.534,.784]],exits:[['cliff',.605,.075,'海岸高崖'],['reef',.726,.344,'育幼礁']]},
 reef:{spawn:[.17,.69],actors:[['oreia',.465,.421],['pela',.553,.57],['niko',.33,.60]],props:[['buoy','被挪動的紅浮標',.285,.639],['trench','漁民挖出的淺溝',.435,.708],['ridge','逆坡而行的水痕',.543,.746],['barrier','礁口的堆石',.444,.32],['boat','古潮溝的小船',.770,.650]],exits:[['harbor',.166,.698,'退潮漁港'],['seabed',.568,.171,'沿外沙洲乾岸往外海床']]},
 seabed:{spawn:[.07,.43],actors:[['niko',.243,.53],['dori',.421,.661],['escort',.542,.563],['tolle',.453,.689]],props:[['cart','陷在泥裡的晶箱車',.577,.631]],exits:[['reef',.041,.414,'育幼礁'],['gate',.865,.225,'潮門']]},
 gate:{spawn:[.479,.88],actors:[['niko',.354,.695],['dori',.637,.686],['demeter',.44,.77]],props:[['kraken','受困的巨大身影',.515,.506],['water','狹口積水',.604,.57],['horn','尼科的巡標潮號',.354,.70],['wound','受傷觸腕',.61,.63],['rock','卡住觸腕的礁岩',.663,.574]],exits:[['seabed',.479,.94,'外海床'],['temple',.164,.284,'神殿外廊']]},
 temple:{spawn:[.046,.42],actors:[['dori',.806,.462]],props:[['door','內殿門檻',.862,.335]],exits:[['gate',.046,.411,'潮門'],['core',.862,.335,'潮心內殿']]},
 core:{spawn:[.77,.86],actors:[],props:[['core','懸浮的潮心',.41,.388],['crystals','外加的粗晶槽',.529,.534],['marks','人工鑿下的刻痕',.386,.656],['seam','銅環與基座的接縫',.591,.579],['wedges','固定銅環的楔子',.571,.654],['imprint','基座的海潮刻印',.384,.693]],exits:[['temple',.893,.839,'安全外廊']]}
 };
 const point=p=>[p[0]*W,p[1]*H];
 function install(){if(!enabled)return;SEA_CHAPTER.actors.niko={name:'尼科',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/continuation/new-maps/actors/niko.webp'};SEA_CHAPTER.actors.dori={name:'多莉',src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/continuation/new-maps/actors/dori.webp'};maps.temple.exits.find(e=>e[0]==='core')[2]=.36;maps.temple.props.find(e=>e[0]==='door')[3]=.36;for(const [id,m]of Object.entries(maps))Object.assign(SEA_CHAPTER.maps[id],structuredClone(m),{height:H,obstacles:[]});
  const arrivals={cliff:{'chapter-one':[.13,.45],harbor:[.49,.91]},harbor:{cliff:[.60,.23],reef:[.71,.36]},reef:{harbor:[.17,.69],seabed:[.57,.23]},seabed:{reef:[.07,.43],gate:[.85,.29]},gate:{seabed:[.479,.88],temple:[.17,.31]},temple:{gate:[.046,.42],core:[.84,.37]},core:{temple:[.77,.86]}};
  window.SeaArrivals={};for(const [id,m]of Object.entries(arrivals)){SeaArrivals[id]={};for(const [from,p]of Object.entries(m))SeaArrivals[id][from]=point(p);}
 }
 const approaches={cliff:{pool:[.39,.59],rope:[.27,.46]},reef:{barrier:[.46,.43],boat:[.735,.638]},gate:{kraken:[.51,.66],water:[.60,.65],rock:[.655,.66]},core:{core:[.42,.77],crystals:[.54,.75],marks:[.39,.77],seam:[.63,.60],wedges:[.63,.68],imprint:[.40,.77]}};
 function migrate(S){if(!enabled||S.mapRevision==='new-maps-r28')return;S.previousMapPosition={area:S.area,player:[...S.player]};S.player=[...maps[S.area].spawn];S.mapRevision='new-maps-r28';}
 function config(id,S){const m=SEA_CHAPTER.maps[id];if(id==='harbor'&&S.flags.repaired)return {...m,name:'復潮漁港',sub:'海潮歸來 · 重建的港街',props:[['timber','重建用的木料',.29,.65]],exits:m.exits.filter(e=>e[0]==='cliff')};return m;}
 return {enabled,maps,W,H,point,install,migrate,approaches,config};
})();SeaNewMaps.install();
