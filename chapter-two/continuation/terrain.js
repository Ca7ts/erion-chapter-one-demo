/* Ground coordinates match the approved chapter II crops. Collision outlines are
   ground data, never interaction highlight contours. Story props retain alpha picking. */
window.SeaTerrain=(()=>{
 'use strict';
 const inside=(x,y,p)=>{let v=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;};
 const terrace=[[126,245],[252,236],[324,216],[467,218],[516,266],[703,292],[862,335],[1055,411],[1285,484],[1404,547],[1448,632],[1316,674],[1260,685],[1323,735],[1391,774],[1470,805],[1465,861],[1355,861],[1300,810],[1210,744],[1144,724],[965,650],[771,581],[611,532],[525,482],[450,458],[419,443],[401,414],[427,384],[473,365],[412,317],[345,291],[252,276],[182,275]];
 const flight=(id,lines,low,high)=>({id,lines,low,high,shape:[...lines.map(l=>l.slice(0,2)),...[...lines].reverse().map(l=>l.slice(2))]});
 const stairs=[
  flight('cliff-lower',[[308,861,444,861],[321,841,452,841],[333,824,462,824],[344,807,473,807],[355,789,479,789],[365,772,488,772],[378,755,493,755],[390,738,499,738]],0,35),
  flight('cliff-middle',[[407,695,493,695],[414,680,502,680],[421,665,508,665],[429,650,514,650],[435,636,518,636],[441,622,523,622],[446,608,527,608],[450,595,528,595],[450,581,524,581]],35,75),
  flight('cliff-upper',[[440,564,514,564],[433,551,507,551],[427,538,502,538],[421,525,496,525],[414,513,490,513],[410,501,486,501],[406,489,482,489],[401,477,478,477],[398,465,475,465],[397,453,474,453],[399,442,475,442]],75,125)
 ];
 const regions={
  cliff:{floor:[terrace,[[390,740],[499,740],[505,713],[493,690],[407,690],[396,719]],[[440,586],[524,586],[519,560],[440,558]]],solids:[
   {id:'camp-fire',p:[[574,336],[637,328],[708,343],[742,372],[714,388],[639,397],[586,378]]},
   {id:'tree-seat',p:[[522,248],[578,237],[653,240],[699,263],[690,285],[609,285],[551,276]]}
  ],stairs},
  harbor:{floor:[[[235,479],[292,442],[383,416],[435,413],[458,423],[487,436],[540,461],[641,508],[733,516],[818,527],[893,541],[1094,568],[1210,608],[1360,671],[1480,813],[1500,966],[1380,1018],[678,1018],[518,948],[465,894],[479,833],[494,787],[460,749],[393,713],[352,658],[301,592],[240,545]]],solids:[
   {id:'net-rack',p:[[181,582],[258,562],[378,587],[426,650],[424,711],[355,724],[249,697],[191,665]]},
   {id:'small-boat',p:[[857,550],[1017,535],[1043,567],[1020,598],[941,616],[871,601]]},
   {id:'blue-boat',p:[[947,602],[1185,599],[1203,629],[1174,671],[1093,694],[991,674],[960,645]]},
   {id:'east-boat',p:[[1158,714],[1252,727],[1366,765],[1412,779],[1391,823],[1327,841],[1226,807],[1181,769]]},
   {id:'fallen-keel',p:[[773,759],[858,776],[1008,835],[1090,879],[1084,923],[1004,945],[908,912],[816,860],[786,816]]},
   {id:'quay-wall',p:[[670,575],[741,539],[856,489],[1045,467],[1133,478],[1128,505],[1044,498],[861,518],[753,572],[705,609]]},
   {id:'west-quay',p:[[650,658],[696,691],[734,763],[723,813],[685,821],[673,760],[640,714]]}
  ],stairs:[flight('harbor-quay',[[640,647,716,621],[629,636,704,610],[617,627,692,601],[605,616,679,590],[594,606,667,579],[583,596,655,568]],0,20)]},
  reef:{floor:[[[60,360],[190,327],[260,326],[309,349],[514,340],[650,351],[779,358],[893,387],[966,430],[1114,454],[1240,503],[1246,575],[1216,651],[1270,713],[1341,787],[1320,902],[1210,961],[995,931],[836,915],[699,899],[565,868],[425,815],[306,773],[210,695],[173,630],[105,579],[53,540],[35,441]]],solids:[
   {id:'nursery-west',p:[[150,394],[240,356],[409,355],[527,374],[643,410],[711,435],[687,470],[605,491],[435,486],[263,469],[175,441]]},
   {id:'nursery-north',p:[[494,288],[650,260],[814,260],[927,278],[956,305],[897,337],[771,358],[621,345],[542,323]]},
   {id:'nursery-east',p:[[822,421],[930,397],[1090,411],[1153,442],[1167,477],[1120,502],[1012,504],[922,489],[844,458]]},
   {id:'tidal-channel',p:[[1281,511],[1390,502],[1536,529],[1536,1024],[1390,1009],[1364,941],[1350,865],[1340,807],[1327,743],[1263,692],[1248,622]]},
   {id:'reef-boulder',p:[[478,521],[525,509],[579,525],[595,557],[563,580],[496,568]]}
  ],stairs:[]}
 };
 function section(area,flags){return flags.repaired&&area==='harbor'?null:regions[area];}
 function meta(area,flags,x,y){const d=section(area,flags);if(!d)return null;
  for(const s of d.stairs){if(!inside(x,y,s.shape))continue;let index=0;
   for(let i=0;i<s.lines.length-1;i++){const a=s.lines[i],b=s.lines[i+1];if(inside(x,y,[a.slice(0,2),a.slice(2),b.slice(2),b.slice(0,2)])){index=i;break;}}
   return {id:s.id,stair:true,step:index,z:s.low+(s.high-s.low)*(index+.5)/(s.lines.length-1)};
  }
  if(!d.floor.some(p=>inside(x,y,p))||d.solids.some(o=>inside(x,y,o.p)))return null;
  const z=area==='cliff'?(inside(x,y,d.floor[1])?35:inside(x,y,d.floor[2])?75:125):area==='harbor'&&(x<625+(y-600)*.19)?20:0;
  return {id:area+'-floor-'+z,stair:false,z};
 }
 function floor(area,flags,x,y){return !!meta(area,flags,x,y);}
 // Any transition involving a staircase must use its matched ends. This also
 // prevents smoothing or a long pointer frame from entering through a side wall.
 function cross(area,flags,a,b){const ma=meta(area,flags,...a),mb=meta(area,flags,...b);if(!ma||!mb)return false;
  if(ma.id===mb.id)return true;if(!ma.stair&&!mb.stair)return Math.abs(ma.z-mb.z)<1;
  const d=section(area,flags),s=d.stairs.find(v=>v.id===(ma.stair?ma.id:mb.id));
  const p=ma.stair?a:b,other=ma.stair?mb:ma;
  const distance=line=>{const dx=line[2]-line[0],dy=line[3]-line[1],t=Math.max(0,Math.min(1,((p[0]-line[0])*dx+(p[1]-line[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-line[0]-t*dx,p[1]-line[1]-t*dy);};
  return [s.lines[0],s.lines.at(-1)].some((line,i)=>Math.abs(other.z-(i?s.high:s.low))<1&&distance(line)<3);
 }
 function speed(area,flags,x,y){return meta(area,flags,x,y)?.stair?1.5:1;}
 return {regions,inside,section,meta,floor,cross,speed};
})();
