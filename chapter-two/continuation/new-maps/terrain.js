/* New paintings: normalized ground geometry, separate elevations and stair ends.
   All four input methods call the same footprint and segment predicates. */
window.SeaNewTerrain=(()=>{
 const W=1536,H=660,inside=SeaTerrain.inside,disabled=new Set();
 const p=a=>a.map(([x,y])=>[x*W,y*H]);
 const poly=(id,z,shape)=>({id,z,shape:p(shape)});
 const solid=(id,shape)=>({id,shape:p(shape)});
 const ellipse=(id,x,y,rx,ry)=>solid(id,Array.from({length:40},(_,i)=>[x+rx*Math.cos(i*Math.PI/20),y+ry*Math.sin(i*Math.PI/20)]));
 function stair(id,low,high,a,b,n){const lines=Array.from({length:n+1},(_,i)=>a.map((v,k)=>(v+(b[k]-v)*i/n)*(k%2?H:W)));return {id,low,high,lines,shape:[lines[0].slice(0,2),lines[0].slice(2),lines.at(-1).slice(2),lines.at(-1).slice(0,2)]};}
 const regions={
 cliff:{floor:[poly('cliff-court',0,[[.025,.36],[.15,.28],[.31,.3],[.46,.31],[.55,.37],[.70,.36],[.89,.46],[.92,.53],[.84,.64],[.68,.81],[.59,.96],[.43,.99],[.22,.86],[.12,.70],[.035,.53]]),poly('cliff-upper',44,[[.45,.15],[.52,.095],[.65,.10],[.715,.18],[.68,.235],[.60,.22],[.52,.19]])],stairs:[stair('cliff-steps',0,44,[.584,.38,.695,.38],[.527,.18,.629,.18],12)],solids:[ellipse('salt-pool',.38,.454,.105,.088),solid('shelter',[[.105,.26],[.35,.26],[.401,.40],[.314,.43],[.185,.39],[.115,.36]]),ellipse('upper-tree',.54,.137,.024,.018)]},
 harbor:{floor:[poly('quay',24,[[.075,.68],[.16,.49],[.29,.39],[.50,.25],[.555,.18],[.65,.18],[.675,.235],[.65,.285],[.565,.351],[.45,.45],[.40,.52],[.373,.56],[.345,.64],[.31,.67],[.298,.94],[.09,.96]]),poly('dock',0,[[.325,.795],[.46,.735],[.51,.65],[.55,.47],[.65,.355],[.71,.312],[.84,.35],[.865,.438],[.797,.55],[.80,.625],[.755,.72],[.80,.88],[.80,.985],[.327,.985]])],stairs:[stair('quay-ramp',0,24,[.451,.724,.525,.696],[.353,.548,.415,.522],12),stair('harbor-cliff',24,60,[.558,.185,.635,.185],[.573,.08,.641,.08],14)],solids:[ellipse('boat-near',.677,.552,.083,.059),ellipse('boat-far',.821,.389,.068,.055)]},
 reef:{floor:[poly('reef-shore',0,[[.064,.50],[.14,.42],[.225,.38],[.435,.40],[.46,.36],[.53,.28],[.54,.17],[.575,.15],[.615,.23],[.61,.31],[.64,.40],[.69,.46],[.712,.53],[.71,.62],[.66,.70],[.64,.79],[.54,.84],[.35,.84],[.265,.75],[.16,.78],[.10,.68]])],stairs:[],solids:[ellipse('nursery-pool',.29,.298,.126,.097),solid('reef-center',[[.35,.52],[.41,.48],[.475,.52],[.506,.58],[.47,.64],[.38,.62]]),solid('reef-low',[[.13,.78],[.23,.75],[.29,.85],[.29,.99],[.12,.99]])]},
 seabed:{floor:[poly('seabed-dry-road',0,[[.022,.39],[.12,.36],[.20,.45],[.28,.50],[.40,.54],[.50,.50],[.64,.40],[.75,.34],[.85,.19],[.895,.20],[.90,.28],[.83,.42],[.75,.51],[.68,.62],[.63,.74],[.44,.77],[.28,.69],[.15,.60],[.02,.48]])],stairs:[],solids:[ellipse('fallen-relief',.324,.451,.075,.055),solid('seabed-wall',[[.38,.33],[.56,.31],[.61,.38],[.60,.43],[.43,.49]]),ellipse('crystal-cart',.578,.647,.07,.027)]},
 gate:{floor:[poly('gate-approach',0,[[.19,.62],[.29,.55],[.37,.57],[.43,.62],[.61,.62],[.70,.57],[.76,.65],[.72,.77],[.63,.91],[.51,.99],[.34,.95],[.25,.82],[.20,.70]]),poly('gate-west',32,[[.078,.47],[.107,.36],[.154,.24],[.22,.23],[.246,.33],[.22,.45],[.19,.50]])],stairs:[stair('gate-west-steps',0,32,[.124,.684,.254,.606],[.073,.516,.192,.454],10)],solids:[ellipse('deep-pool',.515,.421,.175,.173),ellipse('pinning-rock',.666,.58,.032,.027)]},
 temple:{floor:[poly('temple-entry',0,[[.029,.383],[.09,.38],[.096,.437],[.06,.462],[.029,.435]]),poly('temple-court',0,[[.175,.57],[.236,.45],[.30,.38],[.36,.38],[.40,.425],[.51,.48],[.56,.57],[.732,.73],[.83,.61],[.86,.65],[.82,.79],[.72,.92],[.47,.99],[.25,.91],[.16,.76]]),poly('temple-platform',46,[[.41,.235],[.68,.27],[.93,.38],[.94,.56],[.825,.64],[.78,.51],[.61,.39],[.48,.31]])],stairs:[stair('temple-stair',0,46,[.543,.599,.730,.729],[.622,.398,.808,.525],15)],bridges:[poly('temple-bridge',0,[[.035,.393],[.067,.393],[.094,.443],[.125,.482],[.177,.524],[.22,.534],[.244,.551],[.239,.586],[.19,.619],[.154,.619],[.121,.588],[.097,.538],[.07,.494],[.036,.455]])],solids:[ellipse('column-mid',.683,.383,.027,.025),ellipse('column-front',.759,.423,.025,.026),ellipse('column-right',.947,.52,.026,.035)]},
 core:{floor:[poly('core-hall',18,[[.115,.39],[.25,.275],[.39,.25],[.59,.29],[.68,.35],[.775,.47],[.81,.75],[.715,.912],[.55,.96],[.32,.90],[.12,.73]]),poly('core-back',34,[[.26,.19],[.35,.15],[.59,.165],[.68,.23],[.66,.29],[.58,.27],[.39,.225],[.29,.26]]),poly('core-door',0,[[.705,.92],[.79,.76],[.856,.70],[.932,.77],[.944,.91],[.88,.99],[.71,.995]])],stairs:[stair('core-threshold',0,18,[.708,.952,.82,.817],[.69,.884,.80,.749],3),stair('core-back-step',18,34,[.397,.262,.578,.293],[.417,.199,.579,.221],4)],solids:[ellipse('core-pool',.407,.51,.197,.215),ellipse('column-core-left',.288,.251,.032,.025),ellipse('column-core-right',.724,.355,.033,.036)]}
 };
 for(const [i,x,y]of [[1,.462,.24],[2,.503,.271],[3,.551,.298],[4,.607,.326]])regions.temple.solids.push(ellipse('column-extra-'+i,x,y,.018,.019));
 const dist=(q,l)=>{const dx=l[2]-l[0],dy=l[3]-l[1],t=Math.max(0,Math.min(1,((q[0]-l[0])*dx+(q[1]-l[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(q[0]-l[0]-dx*t,q[1]-l[1]-dy*t);};
 function section(area){return regions[area];}
 function meta(area,flags,x,y){const d=regions[area];if(!d)return null;
  if(area==='harbor'&&flags.repaired&&!inside(x,y,d.floor[0].shape)&&!inside(x,y,d.stairs[1].shape))return null;
  if(d.solids.some(s=>inside(x,y,s.shape))||[...d.stairs,...(d.bridges||[])].some(s=>disabled.has(s.id)&&inside(x,y,s.shape)))return null;
  for(const s of d.stairs)if(!disabled.has(s.id)&&inside(x,y,s.shape)){let index=s.lines.length-2;for(let i=0;i<s.lines.length-1;i++){const a=s.lines[i],b=s.lines[i+1];if(inside(x,y,[a.slice(0,2),a.slice(2),b.slice(2),b.slice(0,2)])){index=i;break;}}return {id:s.id,stair:true,step:index,z:s.low+(s.high-s.low)*(index+.5)/(s.lines.length-1)};}
  for(const f of [...(d.bridges||[]),...d.floor])if(!disabled.has(f.id)&&inside(x,y,f.shape))return {id:f.id,z:f.z,stair:false};return null;
 }
 function cross(area,flags,a,b){const ma=meta(area,flags,...a),mb=meta(area,flags,...b);if(!ma||!mb)return false;if(ma.id===mb.id)return true;
  if(!ma.stair&&!mb.stair)return ma.z===mb.z;
  if(ma.stair&&mb.stair)return false;
  const st=regions[area].stairs.find(s=>s.id===(ma.stair?ma.id:mb.id)),q=ma.stair?a:b,other=ma.stair?mb:ma;
  return [st.lines[0],st.lines.at(-1)].some((line,i)=>other.z===(i?st.high:st.low)&&dist(q,line)<=3);
 }
 function floor(a,f,x,y){return !!meta(a,f,x,y);}
 function walk(a,f,x,y){return [[0,0],[-4,0],[4,0],[0,-2],[0,2]].every(([dx,dy])=>floor(a,f,x+dx,y+dy));}
 function segment(a,f,from,to){let last=from;const n=Math.ceil(Math.hypot(to[0]-from[0],to[1]-from[1])/2);for(let i=0;i<=n;i++){const q=from.map((v,j)=>v+(to[j]-v)*i/Math.max(1,n));if(!walk(a,f,...q)||i&&!cross(a,f,last,q))return false;last=q;}return true;}
 function settle(a,f,q){if(walk(a,f,q.x,q.y))return;const start=SeaNewMaps.point(SeaNewMaps.maps[a].spawn);q.x=start[0];q.y=start[1];}
 return {regions,disabled,inside,section,meta,floor,cross,walk,segment,settle,speed:(a,f,x,y)=>meta(a,f,x,y)?.stair?.85:1};
})();if(SeaNewMaps.enabled)window.SeaTerrain=SeaNewTerrain;

