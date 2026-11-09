/* Independent object placements use original map coordinates, not hit polygons. */
window.WORLD_PROP_CATALOG=(()=>{
 const root='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/interactive-props-v2/';
 const p=(id,asset,x,y,w,h,options={})=>({id,asset:root+asset+'.webp',x,y,w,h,foot:y+h,...options});
 const c=(base,clean,props,extra={})=>({base,clean:clean?root+clean+'.webp':null,props,width:1536,height:1024,...extra});
 const r='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/region-maps-v1/',s='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v1/';
 return {
 'c1:village':c(r+'village.webp','village-clean',[
 p('mill','village-mill',285,330,119,84,{flat:true,patch:[239,312,177,110]}),
 p('mill','village-press-fixed',493,349,91,75,{flat:true,patch:[429,331,193,107]}),
 p('squareN','village-well-empty',719,437,116,99,{flat:true}),
 p('herbs','village-herbs',634,111,198,125),
 p('forge','village-anvil',1076,394,48,57,{flat:true,patch:[1025,360,100,92]}),
 p('forge','village-furnace',1184,324,66,72,{flat:true})
 ]),
 'c1:forest':c(r+'forest.webp','forest-clean',[p('dry','forest-dry',550,98,240,180),p('trough','forest-trough',1098,720,91,58)]),
 'c1:cliff':c(r+'cliff.webp','cliff-clean-final',[p('spring','cliff-spring',222,266,185,64,{flat:true}),p('nest','cliff-nest',934,94,270,151,{flat:true}),p('nestRim','cliff-rim',1246,157,146,89)]),
 'c1:court':c(r+'court.webp','court-clean-final',[p('door','court-door',851,130,70,116),p('altar','court-altar',315,294,146,86),p('water','court-water',718,380,204,109),p('water','court-stream',1397,504,139,146,{flat:true}),p('guardian','court-guardian',1260,249,195,244)]),
 'c1:sanctum':c(r+'sanctum.webp','sanctum-clean-final',[p('core','sanctum-core',654,236,204,243,{foot:548,visualAsset:root+'sanctum-core-story-color.webp'}),p('east','sanctum-copperwall',1123,217,67,151),p('east','sanctum-copperfront',735,475,46,120),p('east','sanctum-copperright',844,435,82,84,{flipX:true,patch:[832,435,94,92]}),p('east','sanctum-copperleft',601,443,65,84),p('niche','sanctum-niche',148,202,91,120)],{unlit:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/region-maps-v1/sanctum-unlit-v1.webp',unlitPatches:[[525,166,53,65],[970,167,53,65],[75,380,65,80],[1385,389,65,82],[525,675,80,90],[915,675,80,92]]}),
 'c1:mine':c('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/mine-dungeon-v1/mine-map.webp','mine-clean',[p('red','mine-red',120,74,54,60),p('camp','mine-camp',216,300,194,113),p('ledge2','mine-wall',1480,564,56,137,{patch:false})]),
 'c1:annex':c('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/mine-dungeon-v1/annex-map.webp','annex-clean',[p('hoist','annex-hoist',667,700,60,103),p('cart','annex-cart',581,413,142,65),p('ore','annex-ore',1330,642,89,87),p('ore','annex-orepile',1299,745,131,74)]),
 'c1:coast':c(r+'coast.webp','coast-clean',[p('lookout','coast-lookout',1084,563,194,108)]),
 'c2:harbor':c(s+'harbor.webp','harbor-clean',[p('timber','harbor-timber',1005,889,127,67,{flat:true})]),
 'c2:harbor-restored':c(s+'temple.webp',null,[p('timber','harbor-timber',425,852,180,55,{flat:true,patch:false})],{rect:[1,1,2,2]}),
 'c2:reef':c(s+'reef.webp','reef-clean',[p('buoy','reef-buoy',88,458,192,92,{flat:true}),p('trench','reef-trench',350,619,315,81,{flat:true}),p('ridge','reef-ridge',1210,730,196,103,{flat:true,patch:false}),p('barrier','reef-barrier-dam-v1',1020,451,365,126,{retainingDam:true,patch:[1035,451,340,115]})]),
 'c2:seabed':c(s+'routes.webp','seabed-clean',[p('cart','seabed-cart',421,182,497,214)],{height:434,rect:[0,1,1,2]}),
 'c2:temple':c(s+'temple.webp','temple-door-clean',[p('door','temple-door',1070,120,90,270)],{rect:[0,0,2,2]}),
 'c2:core':c(s+'temple.webp','core-clean',[p('core','core-core',754,310,82,112,{foot:425}),p('marks','core-marks',698,706,102,318,{flat:true}),p('seam','core-seam',397,630,312,86,{patch:false,flat:true}),p('wedges','core-wedges',1160,500,190,135,{patch:[1064,478,220,156]}),p('imprint','core-imprint',924,605,110,65,{patch:false,flat:true})],{rect:[1,0,2,2]}),
 'c2:core-restored':c(s+'temple.webp',null,[p('core','core-core',754,310,82,112,{patch:false}),p('imprint','core-imprint',924,605,110,65,{patch:false,flat:true})],{rect:[0,1,2,2]}),
 'c2:gate':c(s+'climax.webp','gate-clean',[p('water','gate-water',120,659,830,365,{flat:true,patch:false}),p('rock','gate-rock',1064,758,120,95)],{rect:[0,0,2,2]})
 };
})();
