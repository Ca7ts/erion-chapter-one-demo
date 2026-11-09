/* Chapter II: independent save, authored story, physical interactions. */
(()=>{'use strict';
const D=SEA_CHAPTER,$=id=>document.getElementById(id),cv=$('map'),g=cv.getContext('2d'),cin=$('cinema'),cg=cin.getContext('2d');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const AUDIT=new URLSearchParams(location.search).get('audit'); if(AUDIT)D.key+='-audit-'+AUDIT;
let S,book,images={},clock=0,prev=0,story=null,battle=null,hover=null,path=[],pending=null,guideUntil=0,fx=[],taskSaveTransition=false;
let vw=1000,vh=650,camera={s:1,x:0,y:0},zoom=1,keys={},moveDist=0,lastDir=[1,0],moving=false;
const defaults={version:1,step:0,area:'cliff',player:[.40,.49],seen:['cliff'],read:[],evidence:[],flags:{},side:{},rune:'earth',support:'none',hp:340,maxHp:340,mp:44,maxMp:44,herbs:4,materials:0,active:null,checkpoint:null,audio:true,audioChosen:false,motion:!matchMedia('(prefers-reduced-motion: reduce)').matches};
// A whole-game restart preserves presentation preferences without retaining a chapter save.
try{const prefs=JSON.parse(localStorage.getItem('erion-c2-preferences-v1')||'{}');for(const k of ['audio','audioChosen','motion'])if(typeof prefs?.[k]==='boolean')defaults[k]=prefs[k];}catch{}
// Explicit chapter restart; keep a recoverable snapshot and user preferences.
if(new URLSearchParams(location.search).get('restart')==='chapter-two'){
 const previous=localStorage.getItem(D.key);
 if(previous){localStorage.setItem(D.key+'-before-restart',previous);let old={};try{old=JSON.parse(previous)||{};}catch{}const fresh=structuredClone(defaults);for(const k of ['audio','audioChosen','motion'])if(k in old)fresh[k]=old[k];localStorage.setItem(D.key,JSON.stringify(fresh));}
 const clean=new URL(location.href);clean.searchParams.delete('restart');history.replaceState(null,'',clean);
}
try{const raw=JSON.parse(localStorage.getItem(D.key)||'null');S=raw&&raw.version===1?{...structuredClone(defaults),...raw}:structuredClone(defaults);}catch{S=structuredClone(defaults);}
SharedCharacter.bind(S,2,!!AUDIT);
if(!S.audioChosen)S.audio=true;
if(!D.maps[S.area])S.area='cliff';
if(S.flags.griffin===undefined||new URLSearchParams(location.search).get('from')==='chapter-one'){try{const old=JSON.parse(localStorage.getItem('erion-region-adventure-v1')||'{}');S.flags.griffin=!!(old.flags?.spirit&&old.flags?.griffin);}catch{S.flags.griffin=false;}}
if(SeaNewMaps.enabled&&AUDIT==='new-map-review'){const params=new URLSearchParams(location.search),a=params.get('area')||'cliff',seed=a+':'+(params.get('step')||'initial');if(D.maps[a]&&S.reviewSeed!==seed){S.reviewSeed=seed;S.area=a;S.step=params.has('step')?Math.max(0,Math.min(17,Number(params.get('step'))||0)):{cliff:0,harbor:1,reef:2,seabed:9,gate:11,temple:12,core:13}[a];S.player=[...SeaNewMaps.maps[a].spawn];S.active=null;S.checkpoint=null;S.flags=S.step>=15?{repaired:true,ringOff:true}:{};S.seen=[a];}}if(AUDIT==='core-interaction-fix'){S.area='core';S.step=14;S.player=[.76,.84];S.active={event:'R2-14',row:0};S.checkpoint={...structuredClone(D.checkpoints['R2-14:0']),key:'R2-14:0',event:'R2-14',row:0,done:[],count:0};S.flags={};S.seen=['temple','core'];}
if(['core-link-left','core-link-right'].includes(AUDIT)){S.area='core';S.step=14;S.player=AUDIT==='core-link-left'?[.16,.56]:[.86,.56];S.active={event:'R2-14',row:23};S.checkpoint={...structuredClone(D.checkpoints['R2-14:23']),key:'R2-14:23',event:'R2-14',row:23,done:[],count:0};S.flags={ringOff:true};S.seen=['temple','core'];}
if(AUDIT==='imprint-bank-fix'){S.area='core';S.step=14;S.player=[.16,.56];S.active={event:'R2-14',row:28};S.checkpoint={...structuredClone(D.checkpoints['R2-14:28']),key:'R2-14:28',event:'R2-14',row:28,done:[],count:0};S.flags={ringOff:true,linked:true};S.seen=['temple','core'];}
if(AUDIT==='temple-before'||AUDIT==='temple-after'){S.area='temple';S.step=15;S.player=[.2,.84];S.active=null;S.checkpoint=null;S.flags={repaired:AUDIT==='temple-after'};S.seen=['temple','core'];}
if(AUDIT==='pool-approved'){S.area='core';S.step=13;S.player=[.48,.86];S.active=null;S.checkpoint=null;S.seen=['temple','core'];}
SeaNewMaps.migrate(S);const player={x:S.player[0]*1536,y:S.player[1]*D.maps[S.area].height};
const rig=createTribalKrakenRig();
const cliffCamp=createCliffCampLife();
const griffinFollower=createGriffinCompanionMotion({height:(id,y)=>66+y/D.maps[id].height*25});
function heroSpeed(dx,dy){return (66+player.y/D.maps[S.area].height*25)*(window.A2D_WALK_SPEED||1.08)*(window.heroDirectionSpeed?.(dx,dy)??1);}
const sceneInteraction=(SeaNewMaps.enabled?SeaNewWorld.createInteraction:createSeaInteraction)({state:()=>S,time:()=>clock,player:()=>player,height:()=>D.maps[S.area].height,actor:id=>D.actors[id],image:d=>images[d.src||D.root+d.image],motion:()=>S.motion,scale:()=>camera.s,boat:()=>0,highlightBeast:(ctx,color,alpha)=>drawActorSilhouette(ctx,{x:400,y:140,w:1000,h:650},q=>rig.draw(q,S.motion?clock:0,{x:S.step>=12?980:850,y:515,scale:S.step>=12?.35:.86,rise:1,opacity:1,seed:4,view:'left',attack:0}),color,alpha),questMarker,questMarkers,allowed:allowedArea,mist,sound,soundStart,fx:addFx,toast,save,complete:checkpointComplete,canReach:s=>siteReach(s)(player),stopWalk:()=>{path=[];pending=null;}});
function save(){if(taskSaveTransition)return;window.SeaRPG?.capture();S.player=[player.x/1536,player.y/D.maps[S.area].height];try{localStorage.setItem(D.key,JSON.stringify(S));$('save-status').textContent='旅程已保存';}catch{$('save-status').textContent='儲存空間不足，請保留此頁';}}
function img(src){return new Promise((resolve,reject)=>{const im=new ChapterImage();im.onload=async()=>{try{const pic=window.PactPortrait?await PactPortrait.prepare(im,src):im;images[src]=pic;resolve(pic);}catch(e){reject(e);}};im.onerror=()=>reject(Error('圖片未載入：'+src));im.src=src;});}
function art(name){return images[D.root+name];}
const tipKey='erion-c2-travel-tips-v1',recentNotices=new Map();
let travelSeen={};try{travelSeen=JSON.parse(localStorage.getItem(tipKey)||'null')||Object.fromEntries((S.seen||[]).map(id=>[id,true]));}catch{}
function travelTip(){if(travelSeen[S.area])return;travelSeen[S.area]=true;try{localStorage.setItem(tipKey,JSON.stringify(travelSeen));}catch{}toast(mapConfig().name+'：點人物或物件走近互動；需要引導時可按「迷路時提示位置」。');}
function toast(text){
 if(/^正在靠近/.test(text))return;
 const scope=S.area+':'+S.step+':'+(S.checkpoint?.key||'')+':'+text,now=Date.now();
 if(now-(recentNotices.get(scope)||0)<8000)return;
 recentNotices.set(scope,now);
 $('toast').classList.remove('show');showQuestScroll($('world'),text);
}
function button(label,fn,sub){const b=document.createElement('button');b.innerHTML=(label.startsWith('閒聊 · ')?'<span class="chat-label">閒聊</span>'+esc(label.slice(2)):esc(label))+(sub?'<small>'+esc(sub)+'</small>':'');b.onclick=()=>{soundStart();sound('select',.3);fn();};return b;}
function modal(title,body,options=[],kind='互動'){$('talk').querySelectorAll('.dialogue-illustration').forEach(n=>n.remove());$('talk-title').textContent=title;$('talk-body').textContent=body;$('talk-kind').textContent=kind;$('talk').toggleAttribute('data-conversation',['人物交談','支線委託'].includes(kind));$('talk-options').replaceChildren(...options);if(!$('talk').open)$('talk').showModal();path=[];}
function closeTalk(){$('talk').close();}
$('talk').addEventListener('close',()=>{$('talk').classList.remove('sailing-choice');if(!ReefBoat.moving)ReefBoat.leave();});
function blocked(){return (SeaNewMaps.enabled&&SeaNewWorld.loading)||!!battle||ReefBoat.moving||sceneInteraction.busy||[...document.querySelectorAll('dialog')].some(x=>x.open);}
function condition(c){if(!c)return true;if(c==='griffinCompanion')return S.flags.griffin;if(c==='krakenSoothed')return S.flags.kraken==='calm';if(c==='krakenRepelled')return ['repel','preview-repel'].includes(S.flags.kraken);if(c.includes('R2-16'))return S.step>=17;if(c.includes('R2-15'))return S.step>=16;if(c.includes('R2-06'))return S.step>=7;return false;}
function activeQuest(){return D.quests[Math.min(S.step,16)];}
function mapConfig(id=S.area,restored=S.flags.repaired){if(SeaNewMaps.enabled&&id!=='chapter-one')return SeaNewMaps.config(id,{...S,flags:{...S.flags,repaired:restored}});if(id==='chapter-one')return {name:'沿海道'};const m=D.maps[id];if(id==='harbor'&&restored)return {...m,name:'復潮漁港',sub:'海已歸來 · 尚待重建的家園',spawn:[.29,.92],walk:[[.10,.33],[.25,.32],[.31,.42],[.28,.66],[.38,.83],[.62,.90],[.78,.97],[.14,.98],[.11,.77],[.16,.67]],actors:[['kleon',.23,.58],['niko',.26,.85],['philon',.34,.92],['tolle',.17,.66],['poseidon',.57,.91]],props:[['timber','散落的好木料',.40,.89]],exits:[['cliff',.20,.43,'回到高崖營地']]};return m;}
function point(p){return [p[0]*1536,p[1]*D.maps[S.area].height];}
function allowedArea(a){if(a==='chapter-one')return true;if((S.step>=16||S.flags.repaired&&!['temple','core'].includes(a))&&!['cliff','harbor'].includes(a))return false;return {cliff:0,harbor:1,reef:2,seabed:9,gate:11,temple:12,core:13}[a]<=S.step;}
function actorAllowed(id){if(S.area==='cliff'&&['kleon','oreia'].includes(id)&&S.step<3)return false;if(id==='pela'&&!S.read.includes('R2-05')&&S.step<6)return false;if(id==='demeter')return S.step>0||!!S.read.length;if(id==='dori')return S.step>=7&&(S.area!=='seabed'||S.step<=11)&&(S.area!=='gate'||S.step<=12);if(id==='philon')return S.step>=7;if(id==='tolle')return S.area==='harbor'?S.step>=16:S.step===10;if(id==='poseidon')return S.step>=17||S.step===16&&S.area==='harbor';if(id==='escort')return S.step===9;if(id==='niko')return S.area==='gate'?S.step>=11&&S.step<=15:S.step<13||['cliff','harbor'].includes(S.area);return true;}
function sites(){const m=mapConfig(),q=activeQuest(),out=[];
for(const [id,x,y] of m.actors||[])if(actorAllowed(id))out.push({id,name:displayName(id),x:x*1536,y:y*m.height,actor:id,r:40});
for(const [id,name,x,y] of m.props||[]){if(id==='wound')continue;if(id==='boat'&&!ReefBoat.visible(S))continue;if(S.area==='core'&&S.flags.ringOff&&['crystals','marks','seam','wedges'].includes(id))continue;if(id==='letter'&&S.step<17)continue;if(['water','horn','wound','rock'].includes(id)&&S.flags.kraken!=='calm'&&!S.checkpoint?.event?.includes('11A'))continue;out.push({id,name,x:x*1536,y:y*m.height,r:['core','kraken'].includes(id)?85:43});}
for(const [area,x,y,name] of m.exits||[])out.push({id:'exit-'+area,name:mapConfig(area).name,x:x*1536,y:y*m.height,exit:area,r:48});
if(SeaNewMaps.enabled){for(const s of out)if(s.id==="boat")Object.assign(s,ReefBoat.pose(S));return out;}for(const site of out){if(site.id==='boat'){const p=ReefBoat.pose(S);site.x=p.x;site.y=p.y;continue;}if(site.actor||site.exit||["boat","crystals"].includes(site.id))continue;const b=WorldProps.geometry(WorldProps.key2(S.area,S.flags),site.id);if(b){site.x=b.x;site.y=b.y+b.ry*.65;}}return out;}
function currentTargets(){if(S.area==='gate'&&S.checkpoint?.game==='calm-wound')return ['dori'];if(S.checkpoint)return S.checkpoint.map===S.area?S.checkpoint.items.filter(id=>!S.checkpoint.done.includes(id)):[];return S.step<17&&activeQuest()[0]===S.area?[activeQuest()[1]]:[];}
function questMarkers(s){const marks=[];if(s.exit)return marks;if(currentTargets().includes(s.id))marks.push(S.checkpoint?'main-ready':S.active?'main-pending':'main');if(S.step>=7&&(S.side.timber||0)<2&&(s.id==='kleon'||s.id==='timber'&&S.side.timber===1))marks.push(s.id==='timber'?'side-ready':S.side.timber===1?'side-pending':'side');return marks;}
function questMarker(s){return questMarkers(s)[0]||null;}
function hud(){const q=activeQuest(),cp=S.checkpoint;let title=q[3],body=q[4];if(cp){title=cp.title;body=(cp.key==='R2-11A:8'||cp.game==='rock-release')?'點卡石進入近景：推力退去時，按住礁岩往下方空地拖開；推力逼近時鬆手。已鬆動的進度會保留。':cp.game==='calm-wound'?'點多莉回到上藥近景：觸腕放鬆時按住傷口塗油，繃緊時鬆手；已塗好的部分會保留。':window.SeaCoreGuide?.get(cp)?.hint||cp.hint||'在場景中點選對應物件，完成後接續故事。';}else if(S.active){title='接續 · '+book.events[S.active.event].title;body='這段故事已暫停。點選主線目標可以從剛才的位置繼續。';}else if(S.step>=17){title='海潮的回聲';body='第二章主線已完成。可回訪高崖與漁港，或在手記重看故事。下一站：鑄谷。';}
if(SeaNewMaps.enabled&&cp&&['calm-wound','rock-release'].includes(cp.game))body='走近目標，在推力退去的間隙按住操作。亮起時放手；中斷與重開會保留進度。';$('quest-title').textContent=title;$('quest-body').textContent=body;$('quest-kind').textContent=cp?'正在進行的互動':S.step>=17?'章節完成':'當前主線';
$('checklist').innerHTML=cp?cp.items.map(id=>'<div class="'+(cp.done.includes(id)?'done':'')+'">'+(cp.done.includes(id)?'✓':'○')+' '+esc(findName(id))+'</div>').join(''):'';
$('party').innerHTML='<small>旅途中的你</small><span>厄里昂 · 生命 '+S.hp+' / '+S.maxHp+'</span><span>精神 '+S.mp+' / '+S.maxMp+' · 藥草 '+S.herbs+'</span><span>得墨忒耳 · 通契化身</span>'+(S.flags.poseidon?'<span>波賽頓 · 通契化身</span>':'')+(S.flags.griffin?'<span>獅鷲靈影 · 原體留守崖巢</span>':'');
$('destinations').replaceChildren(...S.seen.map(a=>{const b=button(D.maps[a].name,()=>changeArea(a));b.className=a===S.area?'active':'';b.disabled=!allowedArea(a);if(b.disabled)b.title='海水已回，這條步行路線不再開放';return b;}));
$('place-title').textContent=mapConfig().name;$('place-kind').textContent=mapConfig().sub;
$('access').replaceChildren(...sites().map(s=>button(s.name,()=>walkToSite(s))));$('motion-toggle').textContent='動態：'+(S.motion?'開':'關');$('motion-toggle').setAttribute('aria-pressed',S.motion);$('audio-toggle').textContent=S.audio?'聲音：開':'開啟聲音';$('audio-toggle').setAttribute('aria-pressed',String(S.audio));}
function displayName(id){if(id==='poseidon'&&S.step===16)return '漲潮線的海沫';if(S.flags['known:'+id]||!['kleon','oreia','pela','tolle','poseidon'].includes(id))return D.actors[id]?.name||id;return {kleon:'漁民船首',oreia:'鰭人潮守長',pela:'鰭人潛者',tolle:'受傷的搬晶人',poseidon:'海潮之神'}[id];}
function findName(id){for(const m of Object.values(D.maps)){const p=m.props?.find(x=>x[0]===id);if(p)return p[1];}return D.actors[id]?.name||id;}
function polygon(x,y,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function walkable(x,y){if(SeaNewMaps.enabled)return SeaNewTerrain.walk(S.area,S.flags,x,y);return [[0,0],[-3,0],[3,0],[0,-2],[0,2]].every(([dx,dy])=>terrainFloor(x+dx,y+dy)&&!SeaPropDepth.blocked(SeaPropDepth.records(S.area,S.flags),x+dx,y+dy,polygon));}
function terrainFloor(x,y){if(SeaTerrain.section(S.area,S.flags))return SeaTerrain.floor(S.area,S.flags,x,y);const m=mapConfig(),nx=x/1536,ny=y/m.height;if(!polygon(nx,ny,m.walk))return false;if(S.area==='core')return ((x-770)/500)**2+((y-555)/200)**2>1;return !(m.obstacles||[]).some(([a,b,w,h])=>nx>a&&nx<a+w&&ny>b&&ny<b+h);}
// Skip only nodes with a fully traversable connecting segment. Keep reef/pool barriers.
function routeSegmentClear(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2));let last=a;for(let i=0;i<=n;i++){const p=[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n];if(!walkable(...p)||i&&SeaTerrain.section(S.area,S.flags)&&!SeaTerrain.cross(S.area,S.flags,last,p))return false;last=p;}return true;}
let navCache=null,navStamp='';
function route(tx,ty,accept=null){const stamp=S.area+':'+!!S.flags.repaired+':'+!!S.flags.ringOff+':'+WorldProps.signature(WorldProps.key2(S.area,S.flags));if(!navCache||navStamp!==stamp){navStamp=stamp;navCache=createSeaNavigation({walk:walkable,clear:routeSegmentClear,size:[1536,mapConfig().height]});}return navCache.route([player.x,player.y],[tx,ty],accept);}
function siteReach(s){if(SeaNewMaps.enabled){if(s.id==="boat"&&S.checkpoint?.game==="sail"&&S.checkpoint.count>0)return ()=>true;const p=SeaNewMaps.approaches[S.area]?.[s.id]||[s.x/1536,s.y/660],q=SeaNewMaps.point(p);return a=>walkable(a.x,a.y)&&Math.hypot(a.x-q[0],a.y-q[1])<(s.actor?48:34); }
 if(s.id==='boat')return p=>ReefBoat.visible(S)&&((S.checkpoint?.game==='sail'&&S.checkpoint.count>0)||S.flags['cp:R2-06:8']||walkable(p.x,p.y)&&Math.hypot(p.x-s.x,p.y-s.y)<210);
 // Pool-wide interactions share a bank reach rule, independent of sprite anchors.
 // Pointer picking still uses the actual object's alpha, never this reach region.
 if(S.area==='core'&&(['core','imprint','crystals'].includes(s.id)||s.poolApproach))return p=>walkable(p.x,p.y)&&((p.x-770)/630)**2+((p.y-555)/320)**2<=1;

 if(S.area==='core'&&s.id==='marks'&&S.checkpoint?.game==='grooves'&&s.grooveIndex!==undefined)return p=>walkable(p.x,p.y)&&Math.hypot(p.x-s.x,p.y-s.y)<=135;
 if(S.area==='core'&&['wedges','marks','seam'].includes(s.id)){const pieces=WorldProps.group(WorldProps.key2(S.area,S.flags),s.id).filter(c=>!s.propAsset||c.asset===s.propAsset);return p=>walkable(p.x,p.y)&&pieces.some(c=>Math.hypot(Math.max(c.x-p.x,0,p.x-c.x-c.w),Math.max(c.y-p.y,0,p.y-c.y-c.h))<=85);}

 // A stranded sea guardian is approached from the shoreline, not its submerged body pivot.
 if(S.area==='gate'&&s.id==='kraken')return p=>walkable(p.x,p.y)&&p.x>=690&&p.x<=1100&&p.y>=590&&p.y<=720;
 const b=WorldProps.geometry(WorldProps.key2(S.area,S.flags),s.id)||SeaLayeredProps.geometry(S.area,s.id);
 if(!b||s.actor)return p=>Math.hypot(p.x-s.x,p.y-s.y)<=75;
 const left=b.x-b.rx,right=b.x+b.rx,bottom=b.y+b.ry,top=bottom-Math.min(45,b.ry*.7);
 return p=>Math.hypot(Math.max(left-p.x,0,p.x-right),Math.max(top-p.y,0,p.y-bottom))<=75;
}
function walkToSite(s){if(blocked())return;
 if(sceneInteraction.handle(s))return;
 if(s.exit?Math.hypot(player.x-s.x,player.y-s.y)<24:siteReach(s)(player)){pending=null;path=[];interact(s);return;}
 if(s.exit){path=route(s.x,s.y);pending=path.length?s:null;if(!path.length)toast('這一側無法靠近，請從旁邊道路繞過去。');return;}
 path=route(s.x,s.y,siteReach(s));pending=s;
 if(!path.length){pending=null;toast('這一側無法靠近，請從旁邊道路繞過去。');}else{toast('正在靠近「'+s.name+'」；抵達後互動。');}}

function changeArea(area){if(area==='chapter-one'){if(blocked()||sceneInteraction.active)return;save();location.href='../?area=coast&arrival=chapter-two';return;}if(blocked()||sceneInteraction.active)return;if(!allowedArea(area)){toast(S.step>=16?'海水已回，原本露出的海床不能再步行進入。':'先完成眼前的任務，再往那裡走。');return;}const fromArea=S.area;mouseHold=null;navCache=null;window.SeaRPG?.enter(area);S.area=area;if(SeaNewMaps.enabled)newPrepare(area,S.flags).then(()=>hud()).catch(e=>toast(e.message));if(!S.seen.includes(area))S.seen.push(area);[player.x,player.y]=window.SeaArrivals?.[area]?.[fromArea]||point(mapConfig(area).spawn);if(SeaNewMaps.enabled)SeaNewTerrain.settle(S.area,S.flags,player);else SeaPropDepth.settle(player,mapConfig().height,walkable);path=[];pending=null;hover=null;zoom=1;save();hud();$('transition').classList.add('on');setTimeout(()=>$('transition').classList.remove('on'),700);travelTip();}
function questOption(kind,label,action){
 const b=button(label,action);b.dataset.questKind=kind;b.setAttribute('aria-label',(kind==='main'?'主線任務，':kind==='side'?'支線任務，':'閒聊，')+label);return b;
}
function interact(s){if(sceneInteraction.handle(s))return;if(s.exit){changeArea(s.exit);return;}if(!SeaNewMaps.enabled&&S.area==='cliff'&&S.motion)cliffCamp.react(s.id);const q=activeQuest(),cp=S.checkpoint;
if(SeaNewMaps.enabled&&cp?.game==='calm-wound'&&s.id==='dori'){newCheckpoint({...s,id:'wound'});return;}if(cp?.game==='calm-wound'&&s.id==='dori'){sceneInteraction.pulse(s,cp);return;}
if(cp&&s.id==='niko'&&cp.items.includes('horn')){checkpointInteraction({...s,id:'horn'});return;}
if(cp&&cp.map===S.area&&cp.items.includes(s.id)){checkpointInteraction(s);return;}
const primary=S.step<17&&q[0]===S.area&&q[1]===s.id;
if(s.actor){const opts=[];if(primary)opts.push(questOption('main',S.active?'接續故事':q[3],()=>{closeTalk();if(S.active)playEvent(S.active.event,S.active.row);else playEvent(q[2]);}));
for(const side of book.sideDialogues.filter(x=>x.person===D.actors[s.actor].name.replace('的化身','')&&condition(x.condition)&&(!(x.topic==='礁口的老傢伙')||S.step>=16)&&(!(x.topic==='庇護印')||S.step>=7)&&(!(x.topic==='為什麼不能控海')||S.step>=4)))opts.push(questOption('chat',side.topic,()=>{closeTalk();playSide(side);}));
if(s.id==='kleon'&&S.step>=7&&(S.side.timber||0)<2)opts.push(questOption('side','重建用的木料',()=>{S.side.timber=S.side.timber||1;save();modal('重建用的木料','漁港的殘船旁仍有可用的木料。拾回三捆，可以幫上修船的忙。',[button('記下委託',closeTalk)],'支線委託');}));
if(s.id==='dori')opts.push(button(['cliff','harbor'].includes(S.area)?'多莉的藥草鋪':'配製傷藥',()=>{closeTalk();if(['cliff','harbor'].includes(S.area))PrivateTest.openDollyShop();else PrivateTest.openMedicine();}));
if(!opts.length)opts.push(button('繼續探索',closeTalk));modal(s.name,'',opts,'人物交談');const art=window.DialogueIllustration?.node(DialogueIllustration.c2(s.actor,S.step),D.actors[s.actor].name+' · 人物交談');if(art)$('talk-body').before(art);return;}
if(primary){if(S.active)playEvent(S.active.event,S.active.row);else playEvent(q[2]);return;}
if(SeaNewMaps.enabled&&s.id==='timber'){newTimber(s);return;}if(s.id==='timber'){if(S.side.timber===1){S.side.wood=(S.side.wood||0)+1;S.materials++;sound('wood',.5);addFx('dust',s.x,s.y);if(S.side.wood>=3){S.side.timber=2;S.herbs+=2;toast('三捆木料已交給修船人。獲得兩份補給藥草。');}else toast('已收好 '+S.side.wood+' / 3 捆木料。');save();hud();}else toast(S.side.timber===2?'木料已經送去修船。':'這些木料還能用。可向克雷翁詢問重建的需要。');return;}
if(S.area==='cliff'&&['jars','rope','pool'].includes(s.id)){const message=cliffCamp.caption(s.id,S.flags.repaired);toast(message);if(s.id==='rope')sound('cloth',.24,1.5);return;}
if(S.evidence.includes(s.id)){modal(D.evidence[s.id][0],D.evidence[s.id][1],[button('收起手記',closeTalk)],'已記錄線索');return;}
if(D.evidence[s.id]){const entry=D.evidence[s.id];modal(s.name,'觀察眼前的物件。相關調查會在主線抵達這一步時進行。',[button('繼續探索',closeTalk)],'場景觀察');addFx('blue',s.x,s.y);return;}
toast(s.id==='kraken'&&S.step>=12?'守獸已退入深水；牠仍留在海神的領地。':'先依目前的線索前進，之後還可以回來查看。');}
function playSide(side){const e={id:'chat-'+book.sideDialogues.indexOf(side),title:side.topic,area:D.maps[S.area].name,rows:side.rows.map(([speaker,text])=>({speaker,text,kind:'speech',seconds:5}))};startStory(e,0,true);}
function playEvent(id,index=0,replay=false){if(!$('story').open&&blocked())return;const e=book.events[id];if(!e)return;startStory(e,index,replay);}
function startStory(e,index,replay){soundStart();path=[];pending=null;story={event:e,index,elapsed:0,paused:false,replay,ready:false};if(!replay){S.active={event:e.id,row:index};save();}showRow();$('story').showModal();}
function revealNames(st,r){const reveal={'克雷翁':'kleon','歐蕾雅':'oreia','沛拉':'pela','托勒':'tolle','波賽頓':'poseidon'};for(const [name,key] of Object.entries(reveal)){if(r.text.includes(name)&&!st.replay)S.flags['known:'+key]=true;}}
async function showRow(){if(!story)return;SeaVoice.stop();stopRowSounds();const st=story,e=st.event;while(e.rows[st.index]&&!condition(e.rows[st.index].condition))st.index++;if(st.index>=e.rows.length){endStory();return;}const r=e.rows[st.index];st.plan=SeaDirector.resolve(e.id,st.index,r);const prep=e.id==='R2-14'&&!st.replay&&!S.flags['cp:'+e.id+':'+st.index]?window.SeaCoreGuide?.preparations[st.index]:null;if(prep)st.plan={...st.plan,cinema:prep.shot};st.preparation=prep;if(SeaNewMaps.enabled){st.loading=true;st.paused=true;const row=st.index;try{await prepareNewShot(st);}catch(err){toast(err.message);}if(story!==st||st.index!==row)return;st.loading=false;}st.elapsed=0;st.paused=false;revealNames(st,r);st.ready=false;st.finishedHold=0;st.goldHTML=null;st.duration=Math.max(r.kind==='stage'?6:4.8,Number(r.seconds)||0,Array.from(r.text).length/(r.kind==='stage'?6:5.2)+2.2);st.duration=Math.max(st.duration,st.plan?.minHold||0);if(!S.motion)st.duration=Math.max(st.duration,7,Array.from(r.text).length/5.2+2.2);st.originalDuration=st.duration;if(r.kind==='stage')st.duration=2.5;
const knownNames={'克雷翁':['R2-01',3,'漁民船首'],'歐蕾雅':['R2-02',4,'鰭人潮守長'],'沛拉':['R2-06',7,'鰭人潛者'],'托勒':['R2-10',3,'受傷的搬晶人'],'波賽頓':['R2-13',8,'海潮之神']};let label=r.speaker;const kn=knownNames[label];if(kn&&(e.id<kn[0]||e.id===kn[0]&&st.index<kn[1]))label=kn[2];$('speaker').textContent=r.kind==='stage'?'場景演出':label;let displayText=r.text.replace(/（R2-[^)）]+）/g,'').replace(/R2-\d+(?:A|B)?/g,'');if(st.preparation)displayText=st.preparation.text;$('line').textContent=r.kind==='stage'?'（'+displayText+'）':displayText;$('line').className=r.kind==='stage'?'stage':'';$('story-place').textContent=e.title+' · '+(st.plan?.caption||D.maps[st.plan?.map]?.name||e.area);$('row-count').textContent=(st.index+1)+' / '+e.rows.length;$('line-next').textContent=e.rows.slice(st.index+1).some(x=>condition(x.condition))?'繼續 →':'結束這段故事';$('line-pause').textContent='暫停演出';
if(!st.replay){S.active={event:e.id,row:st.index};save();}if(r.kind==='speech'&&!r.noVoice)SeaVoice.begin(e.id+':'+st.index,r.text,v=>{const label=$('story-mode');if(label)label.textContent=({missing:e.id==='R2-14'&&st.index===11?'新版拆除說明 · 配音待補錄':'文字對話 · 配音待錄',review:'文字對話 · 錄音咬字待複核',loading:'配音載入中',playing:'角色配音 · 1.75 倍速',ended:'配音播放完畢',muted:'配音已關閉',blocked:'點「重播本句」啟動配音',error:'配音讀取失敗 · 可繼續閱讀'})[v.state]||'文字對話';});else if($('story-mode'))$('story-mode').textContent=(r.noVoice?'修訂台詞 · 配音待補':'場景演出 · 無旁白朗讀');if(!st.preparation)rowSound(e.id,st.index);}
function nextRow(){if(!story)return;SeaVoice.stop();stopRowSounds();const st=story,key=st.event.id+':'+st.index,cp=D.checkpoints[key];if(cp&&!st.replay&&!S.flags['cp:'+key]){S.checkpoint={...structuredClone(cp),key,event:st.event.id,row:st.index,done:[],count:0};S.active={event:st.event.id,row:st.index};$('story').close();story=null;save();hud();toast('現在輪到你行動：'+cp.title);sceneInteraction.setupCore();if(cp.game==='calm-wound')sceneInteraction.pulse(sites().find(s=>s.id==='dori'),S.checkpoint);else if(key==='R2-11A:8'||cp.game==='rock-release')sceneInteraction.pulse(sites().find(s=>s.id==='rock'),S.checkpoint);return;}st.index++;showRow();}
function endStory(){if(!story)return;SeaVoice.stop();stopRowSounds();const st=story,id=st.event.id;story=null;$('story').close();if(st.replay){hud();return;}if(SeaNewMaps.enabled)newReward(id);if(!S.read.includes(id))S.read.push(id);S.active=null;S.checkpoint=null;
if(id==='R2-11A'||id==='R2-11B'){S.flags.kraken=id.endsWith('A')?'calm':S.flags.deferredBattles?.['R2-11B']?'preview-repel':'repel';S.step=12;}else if(id===activeQuest()[2])S.step++;
if(id==='R2-03')S.flags.evacuated=true;if(id==='R2-06'){S.flags.rescued=true;S.hp=S.maxHp;S.mp=S.maxMp;}if(id==='R2-10'){if(!S.evidence.includes('crystals'))S.evidence.push('crystals');S.flags.prisoner=true;}if(id==='R2-14'){S.flags.repaired=true;if(SeaNewMaps.enabled)SeaNewWorld.prepare('harbor',S.flags).catch(console.error);S.flags.tideRune=true;S.hp=Math.min(S.maxHp,Math.max(S.hp,140));}if(id==='R2-15'){S.flags.agreement=true;S.hp=S.maxHp;S.mp=S.maxMp;}if(id==='R2-16'){S.flags.poseidon=true;changeArea('cliff');}if(id==='R2-06'||id==='R2-15'){changeArea('cliff');}
save();hud();toast(S.step>=17?'第二章完成。海潮已復，下一站是鑄谷。':'任務更新：'+activeQuest()[3]);}
function checkpointComplete(id){const cp=S.checkpoint;if(!cp)return;if(!cp.done.includes(id))cp.done.push(id);if(D.evidence[id]&&!S.evidence.includes(id))S.evidence.push(id);if(cp.done.length<cp.items.length){save();hud();toast(findName(id)+' · 已完成');return;}const e=cp.event,row=cp.row,coreStep=window.SeaCoreGuide?.get(cp),resume=coreStep&&SeaCoreGuide.resultRows.includes(row)?row:row+1;S.flags['cp:'+cp.key]=true;S.checkpoint=null;S.active={event:e,row:resume};save();hud();if(coreStep){toast(coreStep.result);playEvent(e,resume);return;}modal(e==='R2-11A'&&id==='wound'?'傷口已經塗好油':e==='R2-11A'&&id==='rock'?'卡石鬆開了':'這一步已完成',e==='R2-11A'&&id==='wound'?'多莉收回手，觸腕慢慢安定下來。接著還要鬆開卡住牠的礁岩。':e==='R2-11A'&&id==='rock'?'地刻印沿著裂口鬆開礁岩，讓出了觸腕抽回的空間。退開一些，讓牠自己脫困。':'線索或準備已記入旅程，可以接續現場的故事。',[button('接續故事',()=>{closeTalk();playEvent(e,row+1);})],'任務進展');}
function checkpointInteraction(s){if(SeaNewMaps.enabled)return newCheckpoint(s);const cp=S.checkpoint;if(cp.done.includes(s.id)){toast('這一項已完成。');return;}
if(window.SeaCoreGuide?.get(cp)){sceneInteraction.setupCore();sceneInteraction.handle(s);return;}
if(cp.game==='branch'){modal('擱淺的克拉肯','牠被推力困住，正在痛苦中掙扎。兩條路都能通過潮門，選擇會留下不同的回訪對話。',[button('安撫 · 引水、上藥、鬆石',()=>chooseKraken('calm'),'協力互動，牠會記住這次幫助。'),button('擊退 · 逼開觸腕',()=>chooseKraken('repel'),'以戰鬥打開通路，不取牠的性命。')],'你的選擇');return;}
if(cp.game==='battle'||cp.game==='kraken-battle'){beginBattle(cp.game==='battle'?'escort':'kraken');return;}
if(cp.game==='sail'){sailGame();return;}
if(['pulse','crystal-nine','crystal-last','calm-wound','rock-release'].includes(cp.game)){sceneInteraction.pulse(s,cp);return;}
if(cp.game==='rings'||cp.game==='grooves'){sceneInteraction.rings(s,cp);return;}
const act={jars:['捆好海水缸','把海水留在完整的陶缸裡，再檢查繩結。','cloth'],rope:['固定撤離繩索','將繩索繫在穩固的石柱上，讓傷者能借力上階。','pack'],pool:['清理舊鹽池','移開堵塞的碎石，確認崖上鹽池能留住搬來的海水。','wood'],buoy:['查看繩結與刮痕','比對舊浮標位置和繩結留下的痕跡。','cloth'],trench:['探量淺溝','沿溝找到盡頭，記下溝深與出水方向。','wood'],ridge:['沿水痕追蹤','留意水越過沙脊、向外海移動的方向。','pack'],barrier:['查驗堆石外緣','比對石塊傾斜與海藻附著的方向。','wood'],horn:['請尼科吹響巡標潮號','等觸腕的動作慢下來，讓熟悉的訊號傳向深池。',null],water:['以水刻印引來淺水','只引導身旁的水，濕潤乾裂的觸腕。','flow'],crystals:['查看晶槽','粗晶正持續燃燒。先記錄裝置，等待拆除的指示。','metal'],marks:['以鑿刃比對補刻','比對不規則的刀痕，辨認後來加上的刻紋。','carve'],seam:['沿接縫查看','原本的石紋留在裡面，青銅環是套在外面的。','metal'],wedges:['敲出固定銅楔','粗晶與刻紋的力量已散去，現在可以卸下銅環。','fall'],core:['以右手按穩潮心','等脈動平穩，再讓海神透過通契回應核心。','pack'],imprint:['以浸濕的布拓印','帶走的是能學習的刻印；維持海潮的核心留在這裡。','cloth']}[s.id]||['繼續操作',cp.title,'pack'];
sceneInteraction.begin(s,act[0],act[2],()=>{addFx(s.id==='core'?'blue':'gold',s.x,s.y);if(cp.game==='wedges')S.flags.ringOff=true;if(cp.game==='link')S.flags.linked=true;checkpointComplete(s.id);});}
function chooseKraken(which){if(AUDIT&&!localStorage.getItem(D.key+'-branch'))localStorage.setItem(D.key+'-branch',JSON.stringify(S));closeTalk();S.flags.kraken=which;S.flags['cp:R2-11:9']=true;S.read.push('R2-11');S.checkpoint=null;S.active=null;save();playEvent(which==='calm'?'R2-11A':'R2-11B');}
function pulseGame(s){const cp=S.checkpoint,isCrystal=cp.game.startsWith('crystal'),goal=cp.game==='crystal-nine'?9:cp.game==='crystal-last'?3:1;let start=clock;
const b=button(isCrystal?'等脈動暗下時，取出一顆':'等推力暗下，再靠近',()=>{const phase=(clock-start)%3;if(phase<1.5){toast('推力仍然很強，先退開，等下一個間隙。');sound('wood',.3);return;}cp.count++;sound(isCrystal?'metal':'cloth',.65);addFx('blue',s.x,s.y);save();if(cp.count>=goal){closeTalk();checkpointComplete(s.id);}else{start=clock;label.textContent='已取出 '+cp.count+' / '+goal+' 顆。等下一次間隙。';}});
modal(cp.title,'亮起時不要碰；光芒暗下、提示「可以動手」時再操作。失誤只需等下一次間隙。',[b]);const label=document.createElement('p');label.className='pulse-label';$('talk-body').after(label);const clean=()=>{label.remove();clearInterval(timer);};const timer=setInterval(()=>{if(!$('talk').open){clean();return;}const safe=(clock-start)%3>=1.5;label.textContent=(safe?'可以動手 · 推力已低落':'等待 · 推力正在增強')+(isCrystal?'　已取 '+(cp.count||0)+' / '+goal+' 顆':'');label.style.color=safe?'#9ae0c7':'#f0aa87';b.classList.toggle('gold',safe);},100);$('talk').addEventListener('close',clean,{once:true});}
function sailGame(){
 const cp=S.checkpoint;if(cp?.game!=='sail'||ReefBoat.moving)return;
 cp.count=Math.max(0,Math.min(3,Number(cp.count)||0));
 if(cp.count>=3){checkpointComplete('boat');return;}
 const index=cp.count,leg=ReefBoat.legs[index];
 const options=['左上','正上','右上'].map(direction=>button('往'+direction+'方行船',()=>{
  if(ReefBoat.moving||S.checkpoint!==cp||cp.count!==index)return;
  if(direction!==leg.direction){$('sail-feedback').textContent='那邊是露出的礁石或淺灘。船仍停在這個彎口，請看右側水道的轉向再選。';sound('wood',.28);return;}
  keys={};path=[];pending=null;hover=null;
  if(!ReefBoat.begin(S,()=>{
   cp.count=index+1;save();hud();$('sailing-status').hidden=true;
   if(cp.count===3){ReefBoat.leave();checkpointComplete('boat');}else sailGame();
  }))return;
  $('sailing-status').hidden=false;$('sailing-status').textContent='第 '+(index+1)+' 段 · 沿'+leg.direction+'水道行船';
  closeTalk();
 }));
 modal('古潮溝 · 第 '+(index+1)+' 道彎','以畫面方向判斷。'+leg.hint,options,'沛拉指路 · '+(index+1)+' / 3');
 $('talk').classList.add('sailing-choice');
 const feedback=document.createElement('p');feedback.id='sail-feedback';feedback.setAttribute('role','status');$('talk-body').after(feedback);
}
$('talk').addEventListener('close',()=>{$('sail-feedback')?.remove();});
function openJournal(){$('evidence-list').innerHTML=S.evidence.length?S.evidence.map(id=>'<section class="entry"><strong>'+esc(D.evidence[id][0])+'</strong><p>'+esc(D.evidence[id][1])+'</p></section>').join(''):'<p>親自查驗後，線索會記在這裡。</p>';
$('story-list').replaceChildren(...S.read.map(id=>button(book.events[id]?.title||id,()=>{$('journal').close();playEvent(id,0,true);},'重看，不會重複取得獎勵')));if(S.step>=17){$('evidence-list').insertAdjacentHTML('beforeend','<section class="entry"><strong>海神之約 · 未來</strong><p>日後在潮淵接受考驗。目前尚未開放試煉。</p></section>');}$('journal').showModal();path=[];}
function openRunes(){$('rune-options').replaceChildren(...[['earth','裂岩重擊','單體傷害較高，可削弱敵方攻勢。'],['water','漩流迴擊','打擊最多三個目標；對單體傷害較低。']].map(([id,name,desc])=>{const b=button(name,()=>{S.rune=id;save();$('runes').close();openRunes();},desc);b.className=S.rune===id?'selected':'';return b;}),...SharedCharacter.supports.filter(([id])=>SharedCharacter.has(id)).map(([id,name,desc])=>{const b=button('輔助 · '+name,()=>{S.support=id;save();$('runes').close();openRunes();},desc);b.className=S.support===id?'selected':'';return b;}));$('bag').textContent=SharedCharacter.bag()+'\n'+SharedCharacter.storyItems();$('rest').disabled=!['cliff','harbor'].includes(S.area);$('runes').showModal();path=[];}
// Sound playback uses previously approved assets. Dialogue is explicitly text-only until recorded.
let music=null,ambience=null,musicRoute,ambienceRoute,musicLevel=0,ambienceLevel=0,soundUnlocked=false;const playing=new Set(),soundAudit=[];
function sound(key,volume=.6,limit=0){if(!S.audio||!soundUnlocked||!D.sounds[key])return;if(key==='wade'||/^steps(?:-|$)/.test(key))volume*=.7;const a=GameAudio.create(D.sounds[key]);a.baseVolume=volume;a.limit=limit;a.cueKey=key;a.volume=volume*(SeaVoice.blocking?.38:1);playing.add(a);a.onplaying=()=>{if(AUDIT){soundAudit.push({key,time:+a.currentTime.toFixed(2),volume:+a.volume.toFixed(2)});if(soundAudit.length>12)soundAudit.shift();}};a.onended=()=>playing.delete(a);a.play().catch(()=>playing.delete(a));return a;}
function stopRowSounds(){for(const a of playing)a.pause();playing.clear();}
function pauseRowSounds(v){for(const a of playing){if(v){a.rowPaused=true;a.pause();}else if(a.rowPaused&&S.audio){a.rowPaused=false;a.play().catch(()=>{});}}}
function soundStart(){soundUnlocked=true;window.ReefRetainingWater?.unlock();SeaVoice.setEnabled(S.audio);if(!music){music=new Audio('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/world-audition-v1/page_campaign.mp3');music.loop=true;music.volume=0;ambience=new Audio('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/audio/world-loops-v1/W04.wav');ambience.loop=true;ambience.volume=0;musicRoute=AudioMatrix.routeMedia(music,'music');ambienceRoute=AudioMatrix.routeMedia(ambience,'ambience');music.volume=ambience.volume=1;musicRoute.gain(0);ambienceRoute.gain(0);}if(S.audio){music.play().catch(()=>{});if(S.area!=='reef')ambience.play().catch(()=>{});}}
function updateSound(dt){window.AudioMatrix?.setSound(S.audio);window.ReefRetainingWater?.audio(dt,S.area,player,S.audio&&soundUnlocked,!!SeaVoice.blocking||!!story);for(const a of playing){if(a.coreCancelled||a.limit&&a.currentTime>=a.limit){a.pause();playing.delete(a);continue;}a.volume=S.audio?(a.baseVolume??.6)*(SeaVoice.blocking?.38:1)*(a.limit?Math.min(1,Math.max(0,(a.limit-a.currentTime)/.09)):1):0;}if(!music)return;const on=S.audio&&!document.hidden,duck=story?.event.rows[story.index]?.kind==='speech'?.45:1;musicLevel=lerp(musicLevel,on?(battle?.12:.10)*duck:0,Math.min(1,dt*4));musicRoute?.gain(musicLevel*(window.SoundOptions?.level(battle?"battle":"journey")??.3)/.3);if(S.area==='reef'){ambienceLevel=0;ambienceRoute?.gain(0);ambience.pause();}else if(on&&soundUnlocked&&ambience.paused)ambience.play().catch(()=>{});ambienceLevel=lerp(ambienceLevel,on&&S.area!=='reef'?(S.area==='core'?.08:.25)*duck:0,Math.min(1,dt*4));ambienceRoute?.gain(ambienceLevel*(window.SoundOptions?.level("ambience")??.55)/.55);}
const ROW_SOUND_CUES={"R2-01:15": [[0.5, "rumble", 0.65, 4]], "R2-03:4": [[0.3, "wood", 0.65, 3]], "R2-03:5": [[0.5, "roots", 0.75, 5]], "R2-06:7": [[0.2, "wood", 0.5, 3], [1, "splash", 0.65, 4]], "R2-06:9": [[0.4, "flow", 0.65, 5]], "R2-06:19": [[0.2, "surge", 0.7, 6]], "R2-06:23": [[0.3, "wade", 0.65, 4]], "R2-09:12": [[0.4, "metal", 0.65, 3]], "R2-09:19": [[0.4, "wood", 0.65, 3]], "R2-10:5": [[0.2, "cloth", 0.7, 3]], "R2-11:2": [[0.6, "splash", 0.8, 5]], "R2-11:7": [[0.8, "splash", 0.8, 5]], "R2-11A:3": [[0.5, "flow", 0.65, 6]], "R2-11A:6": [[0.7, "cloth", 0.65, 4]], "R2-11A:8": [[0.6, "rubble", 0.65, 4]], "R2-11A:9": [[0.5, "surge", 0.65, 6]], "R2-11A:10": [[1, "splash", 0.4, 3]], "R2-11B:3": [[0.6, "surge", 0.65, 5]], "R2-13:4": [[0.5, "rumble", 0.65, 4]], "R2-14:13": [[0.7, "wood", 0.75, 3]], "R2-14:18": [[0.2, "fall", 0.7, 4]], "R2-14:23": [[1, "flow", 0.65, 7]], "R2-14:28": [[0.5, "cloth", 0.65, 4]], "R2-15:7": [[0.8, "surge", 0.65, 8]], "R2-16:0": [[1, "flow", 0.5, 7]]};
function rowSound(id,row){const core=window.SeaCoreMedia?.resolveShot(id+':'+row);if(story&&core){story.soundCues=core;return;}if(story)story.soundCues=(ROW_SOUND_CUES[id+':'+row]||[]).map(x=>({at:story.event.rows[story.index].kind==='stage'?x[0]*2.5/story.originalDuration:x[0],key:x[1],volume:x[2],limit:x[3],fired:false}));}
function tickRowSounds(){if(!story||story.paused)return;for(const c of story.soundCues||[])if(!c.fired&&story.elapsed>=c.at){c.fired=true;sound(c.key,c.volume,c.limit);}}
function addFx(type,x,y){fx.push({type,x,y,t:0});}

// Rendering and command combat are below; all motion clocks pause while the tab is hidden.
function sourceRect(im,rect){if(!rect)return [0,0,im.width,im.height];const [x,y,cols,rows]=rect;return [x*im.width/cols+3,y*im.height/rows+3,im.width/cols-6,im.height/rows-6];}
function mapImage(id,flags=S.flags){if(SeaNewMaps.enabled)return {im:SeaNewWorld.background(id,flags)};const layered=WorldProps.background(WorldProps.key2(id,flags));if(layered)return {im:layered};const clean=SeaLayeredProps.background(id,flags,images);if(clean)return {im:clean};if(id==='cliff'&&flags.repaired)return {im:art('cliff-restored.webp')};if(id==='harbor'&&flags.repaired)return {im:art('temple.webp'),rect:[1,1,2,2]};if(id==='core'&&flags.ringOff)return{im:art('temple.webp'),rect:[0,1,2,2]};if(id==='gate')return{im:art('climax.webp'),rect:[0,0,2,2]};const m=D.maps[id];return {im:art(m.image),rect:m.rect};}
function paintMap(ctx,id,w,h,flags=S.flags,props=true){if(SeaNewMaps.enabled){ctx.save();ctx.scale(w/1536,h/660);SeaNewWorld.paint(ctx,id,flags);ctx.restore();return;}const a=mapImage(id,flags);ctx.drawImage(a.im,...sourceRect(a.im,a.rect),0,0,w,h);if(props){ctx.save();ctx.scale(w/1536,h/D.maps[id].height);WorldProps.draw(ctx,WorldProps.key2(id,flags));ctx.restore();}if(props&&id==='cliff'){ctx.save();ctx.scale(w/1536,h/D.maps[id].height);SeaLayeredProps.draw(ctx,id);ctx.restore();}}
function sprite(ctx,id,x,y,h,alpha=1,mapView=false){const d=D.actors[id];if(!d)return;h*=d.visualScale||1;const im=images[d.src||D.root+d.image];if(!im)return;const r=d.crop||[0,0,im.width,im.height],w=h*r[2]/r[3];ctx.save();ctx.globalAlpha=mapView&&(id==='poseidon'||id==='demeter'&&S.area==='cliff')?1:d.manifestation==='pact-avatar'?Math.min(alpha,window.DivineManifestation?.pactOpacity??.5):alpha;ctx.fillStyle=d.manifestation==='pact-avatar'?'transparent':'#14282b50';ctx.beginPath();ctx.ellipse(x,y,w*.27,h*.04,0,0,7);ctx.fill();ctx.drawImage(im,...r,x-w/2,y-h,w,h);ctx.restore();}
function mist(ctx,x,y,r,color,alpha){ctx.save();ctx.globalAlpha=alpha;const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,'transparent');ctx.fillStyle=grad;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
function drawWater(ctx,x,y,w,h,t,intensity=.35){ctx.save();ctx.beginPath();ctx.ellipse(x,y,w/2,h/2,0,0,7);ctx.clip();for(let i=0;i<12;i++){const v=(i/12+t*.025)%1;ctx.strokeStyle='rgba(205,239,231,'+intensity*(1-Math.abs(v-.5)*2)+')';ctx.lineWidth=1.6;ctx.beginPath();for(let j=0;j<30;j++){const px=x-w/2+j*w/29,py=y-h/2+v*h+Math.sin(j*.6+t*.8+i)*2;j?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}ctx.restore();}
function propsDraw(ctx,t){const m=mapConfig();

if(S.area==='reef'){drawWater(ctx,700,465,240,120,t,.25);if(S.evidence.includes('ridge')){ctx.strokeStyle='#b5e6eb88';ctx.lineWidth=2;for(let i=0;i<5;i++){let q=(t*.1+i*.2)%1;ctx.beginPath();ctx.moveTo(980+q*70,905-q*100);ctx.lineTo(985+q*70,893-q*100);ctx.stroke();}}}
if(S.area==='gate'){drawWater(ctx,850,490,430,150,t,.5);rig.draw(ctx,t,{x:S.step>=12?980:850,y:515,scale:S.step>=12?.35:.86,rise:1,opacity:S.step>=12?.55:1,seed:4,view:'left',attack:0});}
if(S.area==='core'){mist(ctx,790,460,170,S.flags.linked?'#5edbff':'#ed6b43',.17+.06*Math.sin(t*2));}
}
// A failed frame must not silently abandon the only movement/interaction loop.
let frameFailures=0,stickMoving=false,exitLatch=false,mouseHold=null;
function frame(ts){
 try{
  if(document.hidden&&!AUDIT){prev=ts;keys={};return;}frameStep(ts);frameFailures=0;
 }catch(error){
  frameFailures++;
  const detail={time:new Date().toISOString(),area:S.area,step:S.step,checkpoint:S.checkpoint?.key||'',event:story?.event.id||'',row:story?.index??-1,message:String(error?.message||error),stack:String(error?.stack||''),consecutive:frameFailures};
  console.error('[Chapter II frame]',detail);
  try{localStorage.setItem(D.key+'-last-frame-error',JSON.stringify(detail));}catch{}
  if(frameFailures===3){
   keys={};path=[];pending=null;SeaVoice.setPaused(true);
   const box=document.createElement('section');box.id='frame-recovery';box.setAttribute('role','alert');
   box.style.cssText='position:fixed;z-index:10000;left:50%;top:50%;transform:translate(-50%,-50%);max-width:440px;padding:24px;background:#15292df5;border:1px solid #d9ba78;color:#fff0cb';
   const message=document.createElement('p');message.textContent='畫面更新中斷，請重新載入接續目前進度。';
   const retry=document.createElement('button');retry.className='gold';retry.textContent='保留進度，重新載入';retry.onclick=()=>{try{save();}catch{}location.reload();};
   box.append(message,retry);document.body.append(box);
  }
 }finally{
  if(frameFailures<3){if(AUDIT)setTimeout(()=>frame(performance.now()),16);else requestAnimationFrame(frame);}
 }
}
function frameStep(ts){const dt=document.hidden&&!AUDIT?0:Math.min(battle ? .2 : .045,Math.max(0,(ts-prev)/1000)||0);prev=ts;clock+=dt;if(mouseHold&&performance.now()-mouseHold.at>=180){if(blocked()||sceneInteraction.active){mouseHold=null;}else if(clock-mouseHold.last>.13){mouseHold.last=clock;mouseHold.tracking=true;const [mx,my]=screenPoint({clientX:mouseHold.x,clientY:mouseHold.y}),lastTarget=mouseHold.target;if(!lastTarget||Math.hypot(lastTarget[0]-mx,lastTarget[1]-my)>14){mouseHold.target=[mx,my];path=route(mx,my);pending=null;}}}if(!blocked()&&(!sceneInteraction.active||sceneInteraction.allowsMovement||pending)&&dt){let dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),dy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);const old=[player.x,player.y];if(dx||dy){path=[];pending=null;let len=Math.hypot(dx,dy);dx/=len;dy/=len;const v=heroSpeed(dx,dy)*SeaTerrain.speed(S.area,S.flags,player.x,player.y)*dt;if(routeSegmentClear([player.x,player.y],[player.x+dx*v,player.y]))player.x+=dx*v;if(routeSegmentClear([player.x,player.y],[player.x,player.y+dy*v]))player.y+=dy*v;}else if(path.length){let timeLeft=dt;while(path.length&&timeLeft>.000001){const p=path[0],dx=p[0]-player.x,dy=p[1]-player.y,len=Math.hypot(dx,dy);if(len<.001){path.shift();continue;}const speed=heroSpeed(dx,dy)*SeaTerrain.speed(S.area,S.flags,player.x,player.y),step=Math.min(len,speed*timeLeft);if(!routeSegmentClear([player.x,player.y],[player.x+dx/len*step,player.y+dy/len*step])){path=[];pending=null;break;}player.x+=dx/len*step;player.y+=dy/len*step;timeLeft-=step/speed;if(step>=len-.001){player.x=p[0];player.y=p[1];path.shift();}}}
if(stickMoving&&!sceneInteraction.active&&!S.checkpoint&&!S.active){
 const near=sites().find(s=>s.exit&&Math.hypot(player.x-s.x,player.y-s.y)<=Math.max(50,s.r||0));
 if(!near)exitLatch=false;
 else if(!exitLatch&&(near.x-old[0])*dx+(near.y-old[1])*dy>0){exitLatch=true;interact(near);return;}
}
const dist=Math.hypot(player.x-old[0],player.y-old[1]);moving=dist>.01;if(moving){!SeaNewMaps.enabled&&window.SeaRPG?.walk(dist,!!pending||!!sceneInteraction.active||!!sceneInteraction.busy||ReefBoat.aboard);moveDist+=dist;lastDir=[player.x-old[0],player.y-old[1]];}if(!path.length&&pending){const s=pending;pending=null;if((s.exit?Math.hypot(player.x-s.x,player.y-s.y)<24:siteReach(s)(player)))interact(s);else toast('找不到靠近這個位置的道路。');}}
else moving=false;
ReefBoat.update(document.hidden?0:dt,S,S.motion);
griffinFollower.update(dt,S.area,player,S.flags.griffin,blocked()||!S.motion||document.hidden);!SeaNewMaps.enabled&&cliffCamp.update(dt,S.area,S.motion,!!story||!!battle||document.hidden,player);if(!sceneInteraction.treatmentOpen&&!battle&&!story)drawWorld();if(story&&$('story').open){if(!story.paused)story.elapsed+=dt;tickRowSounds();const voicedRow=story.event.rows[story.index].kind==='speech'&&!story.event.rows[story.index].noVoice;if(voicedRow&&SeaVoice.duration>0&&['loading','playing','ended'].includes(SeaVoice.state))story.duration=SeaVoice.duration;drawCinema();const p=clamp(story.elapsed/story.duration,0,1);$('line-progress').firstElementChild.style.width=p*100+'%';const voiced=SeaVoice.progress();if(voiced?.mode==='aligned'){const txt=story.event.rows[story.index].text;const split=Math.min(txt.length,voiced.characters);const end=Math.min(txt.length,voiced.currentEnd??split),percent=Math.round((voiced.fraction||0)*100);const html='<span class=spoken-gold>'+esc(txt.slice(0,split))+'</span>'+(end>split?'<span class=speaking-gold style="--spoken:'+percent+'%">'+esc(txt.slice(split,end))+'</span>':'')+esc(txt.slice(end));if(story.goldHTML!==html){$('line').innerHTML=html;story.goldHTML=html;}}const rowFinished=voicedRow?(SeaVoice.state==='ended'||(['missing','review','error','muted'].includes(SeaVoice.state)&&p>=1)):p>=1;if(rowFinished&&!SeaVoice.blocking){story.ready=true;const isLast=!story.event.rows.slice(story.index+1).some(x=>condition(x.condition));$('line-next').textContent=isLast?'結束這段故事':'繼續 →';if(!story.paused)story.finishedHold+=dt;const gap=voicedRow&&SeaVoice.state==='ended'?.35:0;if($('auto').checked&&!story.paused&&story.finishedHold>=gap)nextRow();}}if(battle)drawBattle(dt);updateSound(dt);auditStatus();}
function syncSmallProps(){
 TidePoolChapter.setCuts(S.flags.groovesCut||(S.flags['cp:R2-14:16']?[0,1,2]:[]));
 const items=[],add=(id,asset,x,y,w,h)=>items.push({id,asset,x,y,w,h});
 if(S.area==='cliff'&&S.step>=17)add('letter','small-letter',.43*1536-18,.54*864-15,36,30);
 if(S.area==='gate'&&sites().some(s=>s.id==='horn'))add('horn','small-horn',.40*1536-20,.79*1024-32,40,45);
 // Boat presentation, visibility and alpha picking share ReefBoat.
 if(S.area==='core'&&!S.flags.ringOff){
 const cp=S.checkpoint,removed=Math.min(12,(S.flags['cp:R2-14:12']?9:0)+(S.flags['cp:R2-14:15']?3:0)+(['crystal-nine','crystal-last'].includes(cp?.game)?cp.count||0:0));
 if(!Array.isArray(S.flags.crystalsRemoved))S.flags.crystalsRemoved=Array.from({length:removed},(_,i)=>i);
 // Twelve fitted bronze crystal sockets on the stone coping, with depth-scaled dimensions.
 for(let i=0;i<12;i++){if(S.flags.crystalsRemoved.includes(i)||(sceneInteraction.coreStatus?.action==='crystal'&&sceneInteraction.coreStatus.target==='crystal-'+i))continue;const a=(i<6?[35,57,79,101,123,145][i]:(i+.5)*30)*Math.PI/180,depth=(Math.sin(a)+1)/2,k=.8+depth*.24,w=24*k*1.6,h=30*k*1.6,x=290+960*(.5+Math.cos(a)*.436)+(Math.sin(a)<-.9?Math.sign(Math.cos(a))*7:0)+(i===2?1:i===3?-1:0)*w/2,y=350+405*(.382+Math.sin(a)*.318)-(Math.sin(a)<-.9?8:0);add('crystals','small-crystal',x-w/2,y-h,w,h);items[items.length-1].instance='crystal-'+i;}
 }
 WorldProps.syncSmall(WorldProps.key2(S.area,S.flags),items);
}
function drawWorld(){if(SeaNewMaps.enabled){drawNewWorld();return;}syncSmallProps();const m=mapConfig(),W=1536,H=m.height,fit=Math.min(vw/W,vh/H);camera.s=matchMedia('(pointer:coarse),(max-width:760px)').matches?Math.max(vw/W,vh/H,.78)*(ReefBoat.aboard?1.15:zoom):fit*(ReefBoat.aboard?1.7:zoom);camera.x=W*camera.s<=vw?(vw-W*camera.s)/2:clamp(vw/2-(ReefBoat.aboard?ReefBoat.pose(S).x:player.x)*camera.s,vw-W*camera.s,0);camera.y=H*camera.s<=vh?(vh-H*camera.s)/2:clamp(vh/2-(ReefBoat.aboard?ReefBoat.pose(S).y:player.y)*camera.s,vh-H*camera.s,0);g.setTransform(cv.width/vw,0,0,cv.height/vh,0,0);g.fillStyle='#0d1e24';g.fillRect(0,0,vw,vh);g.save();g.translate(camera.x,camera.y);g.scale(camera.s,camera.s);paintMap(g,S.area,W,H,S.flags,false);if(S.step===8&&S.area==='cliff'){g.fillStyle='#071a2b88';g.fillRect(0,0,W,H);}const t=S.motion?clock:0;if(S.area==='cliff')cliffCamp.background(g,mapImage(S.area).im);const depthProps=SeaPropDepth.records(S.area,S.flags);SeaPropDepth.shadows(g,depthProps,terrainFloor);for(const p of WorldProps.all(WorldProps.key2(S.area,S.flags)))if(p.flat&&!SeaPropDepth.manages(p))WorldProps.drawOne(g,p);propsDraw(g,t);ReefBoat.draw(g,S,t);if(S.area==='temple')TempleCourtyardLife.drawWater(g,t,WorldProps.background('c2:temple'));
const list=sites();const height=66+(player.y/H)*25;
const actors=list.filter(s=>s.actor&&!(ReefBoat.aboard&&s.id==='niko')).map(s=>({...s,hero:false}));if(!ReefBoat.aboard)actors.push({id:'erion',x:player.x,y:player.y,hero:true});if(griffinFollower.active&&!ReefBoat.aboard)actors.push({id:'griffin-companion',y:griffinFollower.y,companion:true});const actorLevels=actors.map(a=>a.y);for(const p of WorldProps.all(WorldProps.key2(S.area,S.flags)))if(!p.flat&&!SeaPropDepth.manages(p))actors.push({y:p.foot,worldProp:p});if(S.area==='cliff')for(const a of cliffCamp.actors())actors.push({...a,campLife:true});if(S.area==='temple')for(const a of TempleCourtyardLife.actors(t,!!S.flags.repaired))actors.push({...a,templeFire:true});SeaPropDepth.append(actors,[...actorLevels,...actors.filter(a=>a.campLife).map(a=>a.y)],g,depthProps,(ctx,p)=>cliffCamp.afterProp(ctx,p));actors.sort((a,b)=>a.y-b.y);for(const a of actors){if(a.draw&&!a.campLife&&!a.templeFire){a.draw();continue;}if(a.campLife){a.draw(g);continue;}if(a.templeFire){a.draw(g);continue;}if(a.worldProp){WorldProps.drawOne(g,a.worldProp);continue;}if(a.companion){griffinFollower.draw(g,images);continue;}const hh=60+a.y/H*25;if(a.hero){GroundedWalk.drawHero(g,images[D.actors.erion.src],a.x,a.y-(moving&&S.motion&&SeaTerrain.meta(S.area,S.flags,a.x,a.y)?.stair?Math.abs(Math.sin(moveDist/8))*1.8:0),height,moveDist,moving&&S.motion,...lastDir);}else if(a.id==='poseidon'&&S.step===16){mist(g,a.x,a.y-14,36,'#9bdce8',.55);drawWater(g,a.x,a.y,90,30,t,.5);}else sprite(g,a.id,a.x,a.y,hh,a.id==='demeter'?(S.area==='cliff'?1:.72):1,true);}
if(path.length&&S.motion){g.strokeStyle='#fff0c15c';g.lineWidth=2;g.setLineDash([4,9]);g.beginPath();g.moveTo(player.x,player.y);for(const p of path)g.lineTo(...p);g.stroke();g.setLineDash([]);}
if(S.area==='cliff')cliffCamp.foreground(g);
if(!ReefBoat.moving)sceneInteraction.draw(g,list,hover,currentTargets(),pending,guideUntil>clock);
for(const f of fx){f.t+=.016;if(f.t>2)continue;const a=1-f.t/2;mist(g,f.x,f.y-10,35+f.t*45,f.type==='blue'?'#8cdeff':'#e7ce82',a*.7);}fx=fx.filter(f=>f.t<2);g.restore();$('minimap').hidden=ReefBoat.visible(S);drawMini(list);}
const miniBase={canvas:Object.assign(document.createElement('canvas'),{width:220,height:140}),stamp:'',source:null};
function drawMini(list){const c=$('minimap');if(c.hidden)return;const ctx=c.getContext('2d'),m=mapConfig();ctx.clearRect(0,0,220,140);const sc=Math.min(220/1536,140/m.height),w=1536*sc,h=m.height*sc,ox=(220-w)/2,oy=(140-h)/2;ctx.save();ctx.translate(ox,oy);const key=WorldProps.key2(S.area,S.flags),source=mapImage(S.area),stamp=WorldProps.signature(key);if(miniBase.stamp!==stamp||miniBase.source!==source.im){const q=miniBase.canvas.getContext('2d');q.clearRect(0,0,220,140);q.drawImage(source.im,...sourceRect(source.im,source.rect),0,0,w,h);q.save();q.scale(sc,sc);WorldProps.drawStatic(q,key);if(S.area==='cliff')SeaLayeredProps.draw(q,S.area);q.restore();miniBase.stamp=stamp;miniBase.source=source.im;}ctx.drawImage(miniBase.canvas,0,0);ctx.fillStyle='#03191a55';ctx.fillRect(0,0,w,h);for(const s of list){const marks=questMarkers(s);marks.forEach((type,i)=>{ctx.fillStyle=type.endsWith('-pending')?'#b4b8bd':type==='main'||type==='main-ready'?'#f4d389':'#76e5ff';ctx.beginPath();ctx.arc(s.x*sc+(i-(marks.length-1)/2)*6,s.y*sc,3,0,7);ctx.fill();});}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(player.x*sc,player.y*sc,3,0,7);ctx.fill();ctx.restore();}
function cover(ctx,im,r,w,h,scale=1){const [x,y,sw,sh]=sourceRect(im,r),s=Math.max(w/sw,h/sh)*scale,dw=sw*s,dh=sh*s;ctx.drawImage(im,x,y,sw,sh,(w-dw)/2,(h-dh)/2,dw,dh);}
function drawCinema(){
 if(!story)return;if(SeaNewMaps.enabled&&story.loading){cg.fillStyle="#101a21";cg.fillRect(0,0,cin.width,cin.height);return;}
 const row=story.event.rows[story.index],plan=SeaDirector.resolve(story.event.id,story.index,row);
 if(!plan){cg.clearRect(0,0,cin.width,cin.height);paintMap(cg,S.area,cin.width,cin.height);const id=SeaDirector.speaker[row.speaker];sprite(cg,'erion',cin.width*.36,cin.height*.88,cin.height*.48);if(id&&id!=='erion')sprite(cg,id,cin.width*.66,cin.height*.88,cin.height*.49);return;}
 SeaDirectorRender.draw({ctx:cg,w:cin.width,h:cin.height,story,plan,images,root:D.root,paintMap,sprite,cover,mist,rig,motion:S.motion,flags:S.flags,maps:D.maps});
}

function beginBattle(kind,pack){if(SeaNewMaps.enabled){toast("本次為劇情與探索試玩，怪物與戰鬥尚未開放。");return;}if(battle)return;closeTalk();path=[];window.BattlePresentation?.open(()=>S.audio);battle={kind,turn:1,target:0,busy:false,guard:false,healReadyTurn:1,time:0,flash:0,enemies:pack|| (kind==='escort'?[{name:'護送頭目',hp:235,max:235,atk:24},{name:'晶燈手',hp:145,max:145,atk:18},{name:'撬棍護衛',hp:155,max:155,atk:17},{name:'粗晶箱',hp:70,max:70,atk:0,object:true}]:[{name:'左側觸腕',hp:140,max:140,atk:18},{name:'前側觸腕',hp:140,max:140,atk:18},{name:'右側觸腕',hp:140,max:140,atk:18},{name:'後側觸腕',hp:140,max:140,atk:18}])};$('battle').hidden=false;$('battle-title').textContent=kind==='escort'?'外海床的護送隊':'潮門 · 逼退觸腕';$('battle-kind').textContent='第一人稱 · 指令戰鬥';$('battle-message').textContent=kind==='escort'?'對方已經動手。擊退護衛，保住退路。':'只攻擊觸腕，逼牠退回深池。';if(pack){$('battle-title').textContent=mapConfig().name+' · 野外遭遇';$('battle-message').textContent=pack.map(e=>e.name).join('、')+'出現了！';}window.SeaRPG?.opening(battle);battle.enemies.forEach((e,i)=>{e.index=i;e.x=.2+(i+1)*.6/(battle.enemies.length+1)});window.AudioMatrix?.prepare(battle.enemies,S.audio);battleUI();}
function seaRuneCost(){const base=Growth.spell(SeaRPG.state,S.rune).cost;return window.SeaAscentForms?.cost(base,S.rune)??base;}
function battleUI(){if(!battle)return;const b=battle;window.AudioMatrix?.syncIntent(b.enemies,b.turn%3===0&&b.phase!=='responding');if(window.SeaControls)return SeaControls.battleUI(b);$('round').textContent='第 '+b.turn+' 回合';$('battle-warning').textContent=b.turn%3===0?(b.kind==='escort'?'頭目舉起粗晶短棍，正在蓄力。下一擊應該防禦。':'觸腕縮起、深池翻湧。下一擊應該閃避。'):(b.kind==='escort'?'軟泥讓近身攻擊較慢；晶箱炸裂會波及敵我。防禦可減傷、恢復精神。':'四條觸腕各有耐久；只逼退觸腕，不攻擊頭與眼睛。閃避可減傷、恢復精神。');$('battle-stats').textContent='厄里昂　生命 '+S.hp+' / '+S.maxHp+'　精神 '+S.mp+' / '+S.maxMp+'　藥草 '+S.herbs;$('battle-hint').textContent='得墨忒耳的化身只能有限援助；尼科與多莉在安全處等候。';
$('targets').replaceChildren(...b.enemies.map((e,i)=>{const bt=button(e.name,()=>{b.target=i;battleUI();});bt.style.left=(20+(i+1)*60/(b.enemies.length+1))+'%';bt.style.top='55%';bt.style.borderColor=b.target===i?'#ffe1a4':'';bt.disabled=e.hp<=0||b.busy;bt.insertAdjacentHTML('beforeend','<span>'+Math.max(0,e.hp)+' / '+e.max+'</span><span class="hp-track"><i style="width:'+Math.max(0,e.hp/e.max*100)+'%"></i></span>');return bt;}));
const cost=seaRuneCost(),healWait=Math.max(0,(b.healReadyTurn||1)-b.turn);const cmds=[['普通攻擊','不耗精神',()=>battleAction('attack')],[(S.rune==='earth'?'裂岩重擊':'漩流迴擊'),cost+' 精神',()=>battleAction('rune')],[b.kind==='kraken'?'閃避':'防禦','減傷，恢復 6 精神',()=>battleAction('guard')],['使用藥草','恢復 85 生命',()=>battleAction('herb')],['呼喚女神',healWait?'冷卻中 · 尚需 '+healWait+' 回合':'恢復 100 生命 · 每兩回合一次',()=>battleAction('heal')],['撤回安全處','保留線索，可以重試',()=>finishBattle(false)]];
$('commands').replaceChildren(...cmds.map(([n,d,fn],i)=>{const bt=button(n,fn,d);bt.disabled=b.busy||(i===1&&(S.mp<cost||b.turn<(b.runeCD?.[S.rune]||0)))||(i===3&&S.herbs<1)||(i===4&&healWait>0);return bt;}));}

function battleVisualHeight(){return Math.max(220,document.querySelector('.battle-bottom').getBoundingClientRect().top);}
function battleVisualTargets(foes){
 const b=battle,h=battleVisualHeight();
 return foes.map(e=>{const i=b.enemies.indexOf(e);return{id:i,x:.2+(i+1)*.6/(b.enemies.length+1),y:innerHeight*(b.kind==='kraken'?.68:.58)/h,h:innerHeight*(b.kind==='kraken'?.22:.43)/h};});
}
async function presentBattle(skill,foes,onHit){
 const current=battle,visual=await window.BattlePresentationReady;if(!current||battle!==current)return false;
 if(visual){if(!visual.diagnostics.opened)visual.open(()=>S.audio);return visual.play(skill,{targets:battleVisualTargets(foes),onHit,sound:()=>S.audio});}
 foes.length?foes.forEach((_,i)=>onHit?.(i)):onHit?.(0);return true;
}
function battleCrystalBurst(b){
 const box=b.enemies.find(x=>x.object);
 if(box&&box.hp<=0&&!box.burst){box.burst=true;window.AudioMatrix?.crystalBurst(box);S.hp=Math.max(1,S.hp-25);b.enemies.filter(x=>!x.object&&x.hp>0).forEach(x=>x.hp-=55);b.fire=1.8;return ' 晶箱炸裂，灼火波及敵我！你受到 25 傷害，敵方各受到 55 傷害。';}return '';
}
async function battleAction(type){
 const b=battle;if(!b||b.busy)return;
 if(type==='rune'&&(S.mp<seaRuneCost()||b.turn<(b.runeCD?.[S.rune]||0)))return;
 if(type==='ether'&&!(window.SeaRPG?.state.items.ether>0))return;if(type==='herb'&&S.herbs<1||type==='heal'&&b.turn<(b.healReadyTurn||1))return;
 b.playerAction=type;b.busy=true;b.guard=type==='guard'||(type==='rune'&&S.support==='guard');
 let e=b.enemies[b.target];if(e.hp<=0){b.target=b.enemies.findIndex(x=>x.hp>0);e=b.enemies[b.target];}
 let message='';
 const hit=(foe,amount)=>{if(foe.hp<=0)return;const damage=LeonPatterns.strike(SeaRPG.state,b,foe,type==='rune'?S.rune:'strike',amount,t=>{message+=' '+t;});window.AudioMatrix?.playerHit(type==='rune'?S.rune:'hammer',foe);foe.hp-=damage;if(foe.hp<=0)window.AudioMatrix?.monster('death',foe);foe.hit=b.time;message+=battleCrystalBurst(b);$('battle-message').textContent=message;battleUI();save();};
 battleUI();
 if(type==='attack'){
  message='你抓住破綻，擊中'+e.name+'。';$('battle-message').textContent='厄里昂揮動重鎚！';
  await presentBattle('hammer',[e],()=>hit(e,window.SeaRPG?.damage(47,e,false)??47));
 }
 if(type==='rune'){
  const spell=Growth.spell(SeaRPG.state,S.rune);S.mp-=seaRuneCost();window.SeaAscentForms?.cast(S.rune);
  b.runeCD??={};b.runeCD[S.rune]=b.turn+spell.cd+1;
  const earth=S.rune==='earth',targets=b.enemies.filter(x=>x.hp>0).sort((a,c)=>a===e?-1:c===e?1:0).slice(0,spell.count);
  message=earth?'地刻印震開防線，也削弱了對方的攻勢。':'水流掠過面前的目標。';
  $('battle-message').textContent=earth?'裂岩重擊！':'漩流迴擊！';battleUI();
  await presentBattle(earth?'earth':'water',targets,i=>{const foe=targets[i];hit(foe,SeaRPG.damage(spell.damage,foe,true));if(earth)foe.atk=Math.max(12,foe.atk-4);});
 }
 if(type==='guard'){S.mp=Math.min(S.maxMp,S.mp+6);message=b.kind==='kraken'?'注意觸腕的方向，準備閃避。':'架穩重鎚，等待對方攻來。';if(b.kind!=='kraken')window.BattlePresentation?.setGuard(true);}
 if(type==='ether'){SeaRPG.state.items.ether--;S.mp=Math.min(S.maxMp,S.mp+14);message='飲下清泉，恢復 14 精神。';}if(type==='herb'){S.herbs--;message='敷上藥草，恢復 85 生命。';$('battle-message').textContent='取出止血藥草。';battleUI();await presentBattle('herb',[],()=>{S.hp=Math.min(S.maxHp,S.hp+85);$('battle-message').textContent=message;battleUI();save();});}
 if(type==='heal'){b.healReadyTurn=b.turn+2;message='女神透過通契扶持你，恢復 100 生命。';$('battle-message').textContent='金色稻穗在身前亮起。';battleUI();await presentBattle('heal',[],()=>{S.hp=Math.min(S.maxHp,S.hp+100);$('battle-message').textContent=message;battleUI();save();});}
 if(battle!==b)return;
 if(b.kind==='escort'&&type==='attack'){message+=' 軟泥拖住腳步，退回原位較慢。';b.slow=true;}
 $('battle-message').textContent=message;battleUI();b.wait=b.slow?.7:type==='guard'?.55:.25;b.slow=false;b.phase='answer';save();
}
async function battleAnswer(){
 const b=battle;if(!b||b.phase!=='answer')return;b.phase='responding';
 if(b.enemies.filter(e=>!e.object).every(e=>e.hp<=0)){finishBattle(true);return;}
 const power=b.turn%3===0?(b.kind==='field'?1.45:1.8):1,raw=b.enemies.filter(e=>e.hp>0&&!e.object).reduce((n,e)=>n+e.atk,0);
 const shard=b.kind==='escort'&&b.enemies.some(x=>x.name==='晶燈手'&&x.hp>0)?8:0;
 const relicNotes=[],damage=LeonPatterns.receive(SeaRPG.state,b,b.playerAction==='guard',Growth.received(raw*power+shard,S.defense||0,b.guard?(b.playerAction==='guard'?'guard':'rune'):null),t=>relicNotes.push(t));
 const receive=()=>{window.AudioMatrix?.groupImpact(b.enemies,b.turn%3===0,b.guard?(b.kind==='kraken'?'dodge':'guard'):false);if(b.kind==="field")for(const foe of b.enemies)if(foe.hp>0)foe.attackAt=b.time;b.shards=shard?1.3:0;S.hp=Math.max(0,S.hp-damage);window.SeaAscentForms?.guard(b,damage);b.flash=.8;$('battle-message').textContent=(b.kind==='field'&&b.turn%3===0?b.enemies.filter(e=>e.hp>0).map(e=>e.move).join('、'):b.kind==='kraken'?'觸腕掃過礁面':'敵人反擊')+'，受到 '+damage+' 傷害。'+(b.guard?' 你避開了大部分攻勢。':'')+(shard?' 晶燈手擲出灼熱碎晶。':'')+' '+relicNotes.join(' ');if(!b.guard&&!window.AudioMatrix)sound('wood',.6);battleUI();save();};
 if(b.guard){$('battle-message').textContent=b.kind==='kraken'?'觸腕掃來，側身閃避！':'敵人攻來，用重鎚擋下！';await presentBattle(b.kind==='kraken'?'dodge':'guard',[],receive);}else receive();
 if(battle!==b)return;window.BattlePresentation?.setGuard(false);
 b.turn++;b.busy=false;b.phase=null;save();if(S.hp===0){finishBattle(false);return;}battleUI();
}
function finishBattle(won){const b=battle;if(!b)return;window.AudioMatrix?.finish();window.SeaActors?.end();window.BattlePresentation?.close();battle=null;$('battle').hidden=true;if(b.kind==='field'){if(won){sound('confirm',.6);SeaRPG.reward(b);}else{if(S.hp===0){S.hp=Math.max(1,Math.round(S.maxHp*.35));}toast('已脫離戰鬥');}save();hud();return;}if(won){sound('confirm',.6);const amount=b.kind==='escort'?2:1;S.materials+=amount;checkpointComplete(b.kind==='escort'?'escort':'kraken');SeaControls.victory(0,0,[{key:'seaMaterial',name:'修船材料',count:amount,color:'#eee5d1'}]);}else{S.hp=S.maxHp;S.mp=S.maxMp;save();hud();modal('退回安全處','你在退路上重新整頓。必要人物不會因此死亡，已調查的線索仍在。',[button('我明白了',closeTalk)],'可再次嘗試');}save();hud();}
function drawBattle(dt){const b=battle,c=$('battle-canvas'),ctx=c.getContext('2d');if(c.width!==innerWidth||c.height!==innerHeight){c.width=innerWidth;c.height=innerHeight;}const w=c.width,h=c.height;if(b.arena?.naturalWidth)cover(ctx,b.arena,null,w,h);else{ctx.fillStyle='#15202a';ctx.fillRect(0,0,w,h);}ctx.fillStyle='#06192466';ctx.fillRect(0,0,w,h);const visual=window.BattlePresentation;if(visual&&!visual.diagnostics.opened)visual.open(()=>S.audio);const visualH=battleVisualHeight();visual?.drawGround(ctx,w,visualH);b.time+=dt;b.flash=Math.max(0,b.flash-dt);if(b.kind==='kraken')rig.draw(ctx,S.motion?b.time:0,{x:w*.52,y:h*.47,scale:w/1100,rise:1,opacity:1,seed:4,view:'left',attack:0});else if(b.kind==='field'){SeaRPG.draw(ctx,b,w,h,visualH,visual);}else b.enemies.forEach((e,i)=>{if(e.hp<=0)return;const x=w*(.2+(i+1)*.6/(b.enemies.length+1));if(e.object){ctx.fillStyle='#53402b';ctx.fillRect(x-40,h*.53,80,55);for(let j=0;j<4;j++)mist(ctx,x-25+j*17,h*.55,12,'#e96541',.55);}else {const recoil=visual?.recoil(i)||{x:0,y:0};ctx.save();if(b.time-(e.hit??-9)<.12)ctx.filter='brightness(1.6)';sprite(ctx,['escort','lantern','crowbar'][i],x+recoil.x*w,h*.58+recoil.y*visualH,h*.43);ctx.restore();}});if(b.kind==='kraken'&&b.turn%3===0){ctx.strokeStyle='#ffc07a';ctx.lineWidth=4;for(let j=0;j<4;j++){ctx.beginPath();ctx.ellipse(w*(.32+j*.12),h*.68,50,14,0,0,7);ctx.stroke();}}if(b.fire>0){b.fire-=dt;for(let j=0;j<15;j++)mist(ctx,w*(.25+j*.035),h*.58,45,'#f38b46',Math.min(.6,b.fire*.3));}if(b.shards>0){b.shards-=dt;ctx.fillStyle='#ff9b60';for(let j=0;j<12;j++){const q=(1.3-b.shards)/1.3;ctx.fillRect(w*(.48+Math.sin(j)*q*.2),h*(.45+q*.25),4+q*4,8+q*8);}}visual?.draw(ctx,w,visualH);if(b.flash>0){ctx.fillStyle='rgba(166,210,220,'+b.flash*.16+')';ctx.fillRect(0,0,w,h);}visual?.tick(dt);if(b.phase==='answer'){b.wait-=dt;if(b.wait<=0)battleAnswer();}}

function resize(){const r=cv.getBoundingClientRect();vw=r.width;vh=r.height;const ratio=Math.min(devicePixelRatio,matchMedia('(pointer:coarse)').matches?1.5:2);cv.width=Math.round(vw*ratio);cv.height=Math.round(vh*ratio);}
function screenPoint(e){const r=cv.getBoundingClientRect();return [(e.clientX-r.left-camera.x)/camera.s,(e.clientY-r.top-camera.y)/camera.s];}
cv.addEventListener('pointermove',e=>{if(mouseHold?.id===e.pointerId){mouseHold.x=e.clientX;mouseHold.y=e.clientY;}if(blocked()){hover=null;return;}const [x,y]=screenPoint(e);hover=sceneInteraction.pick(x,y,sites());cv.style.cursor=hover?'pointer':'default';});
cv.addEventListener('pointerleave',()=>hover=null);
cv.addEventListener('pointerdown',e=>{if(e.button!==0)return;soundStart();if(blocked())return;const [x,y]=screenPoint(e),s=sceneInteraction.pick(x,y,sites());hover=s;
 if(sceneInteraction.active){if(s&&!sceneInteraction.handle(s))walkToSite(s);else if(!s&&sceneInteraction.allowsMovement){path=route(x,y);pending=null;cv.focus();}return;}if(s){walkToSite(s);return;}path=route(x,y);pending=null;cv.focus();if(e.pointerType==='mouse'){mouseHold={id:e.pointerId,x:e.clientX,y:e.clientY,at:performance.now(),last:clock,tracking:false};cv.setPointerCapture(e.pointerId);}});
function releaseWalk(e){if(mouseHold&&(!e||e.pointerId===undefined||e.pointerId===mouseHold.id)){if(mouseHold.tracking){path=[];pending=null;}mouseHold=null;}}for(const type of ['pointerup','pointercancel','lostpointercapture'])cv.addEventListener(type,releaseWalk);window.addEventListener('blur',releaseWalk);document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseWalk();keys={};}});
for(const type of ['pointerdown','pointerup','click','dblclick','wheel'])$('minimap').addEventListener(type,e=>{e.preventDefault();e.stopPropagation();},{passive:false});
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName))return;if(e.key==='Escape'&&(sceneInteraction.active||sceneInteraction.busy)){sceneInteraction.cancel();return;}if(blocked()){if($('story').open&&e.key===' '){e.preventDefault();nextRow();}return;}if(sceneInteraction.active&&!sceneInteraction.allowsMovement){if(e.key.toLowerCase()==='e'){const s=sites().find(x=>currentTargets().includes(x.id));if(s)sceneInteraction.handle(s);}return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();keys[e.key]=true;}if(e.key.toLowerCase()==='e'){const s=sites().sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];if(s&&(s.exit?Math.hypot(s.x-player.x,s.y-player.y)<24:siteReach(s)(player)))interact(s);else toast('先走近人物或物件，再按 E。');}});document.addEventListener('keyup',e=>delete keys[e.key]);window.addEventListener('blur',()=>keys={});
$('guide').onclick=()=>{guideUntil=clock+6;const targetArea=S.checkpoint?.map||activeQuest()[0];toast(S.area===targetArea?'金色微光標出了眼前的目標；直接點人物或物件即可。':'目標在「'+D.maps[targetArea].name+'」，請點場景中的出口前往。');};
$('journal-open').onclick=openJournal;$('runes-open').onclick=openRunes;$('rest').onclick=()=>{if(!['cliff','harbor'].includes(S.area))return;S.hp=S.maxHp;S.mp=S.maxMp;save();hud();toast('已在安全處恢復生命與精神。');};
let taskResetMode='reset';
function showTaskReset(mode){
 if(blocked()){toast('請先結束目前的交談或操作，再管理任務進度。');return;}
 taskResetMode=mode;path=[];pending=null;
 $('task-reset-title').textContent=mode==='restore'?'復原重置前的任務進度？':'重置第二章任務？';
 $('task-reset-description').textContent=mode==='restore'
  ?'將第二章任務恢復到上次重置前的狀態與所在地點。共用角色資料及第一章進度維持目前狀態。'
  :'第二章主線、支線、線索與場景互動將從頭開始，返回海岸高崖。生命、精神、行囊、符文、獅鷲同行狀態與第一章進度保留。';
 $('task-reset-note').textContent=mode==='restore'?'確認後會重新載入第二章。':'會先備份目前的任務進度；若誤按，可用左側「復原重置前進度」取回。';
 $('task-reset-confirm').textContent=mode==='restore'?'確認復原任務':'確認重置本章任務';
 $('task-reset-error').hidden=true;$('task-reset-dialog').showModal();$('task-reset-cancel').focus();
}
$('task-reset-open').onclick=()=>showTaskReset('reset');
$('task-reset-restore').hidden=!ChapterTaskReset.readBackup(localStorage,D.key);
$('task-reset-restore').onclick=()=>showTaskReset('restore');
$('task-reset-cancel').onclick=()=>$('task-reset-dialog').close();
$('task-reset-confirm').onclick=()=>{
 const confirm=$('task-reset-confirm');confirm.disabled=true;
 try{
  const snapshot=JSON.parse(JSON.stringify(S));snapshot.player=[player.x/1536,player.y/D.maps[S.area].height];
  if(taskResetMode==='restore')ChapterTaskReset.restore(localStorage,D.key,snapshot);
  else ChapterTaskReset.reset(localStorage,D.key,defaults,snapshot);
  // pagehide/visibility autosave must not write the previous in-memory tasks back.
  taskSaveTransition=true;SeaVoice.stop();stopRowSounds();music?.pause();ambience?.pause();
  const target=new URL(location.href);for(const k of ['review','row','restart'])target.searchParams.delete(k);
  target.searchParams.set('v','task-reset-20261026');location.replace(target.href);
 }catch(error){taskSaveTransition=false;confirm.disabled=false;$('task-reset-error').textContent='無法儲存重置資料，請保留此頁。'+error.message;$('task-reset-error').hidden=false;}
};
$('audio-toggle').onclick=()=>{S.audio=!S.audio;S.audioChosen=true;soundStart();save();hud();};$('motion-toggle').onclick=()=>{S.motion=!S.motion;save();hud();};$('zoom-in').onclick=()=>zoom=Math.min(2.4,zoom+.3);$('zoom-out').onclick=()=>zoom=Math.max(1,zoom-.3);$('fit').onclick=()=>zoom=1;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());$('line-next').onclick=nextRow;$('line-replay').onclick=()=>{soundStart();showRow();};$('line-pause').onclick=()=>{if(!story)return;story.paused=!story.paused;if(!story.paused)soundStart();SeaVoice.setPaused(story.paused);pauseRowSounds(story.paused);$('line-pause').textContent=story.paused?'繼續演出':'暫停演出';};
function suspendStory(){if(!story)return;SeaVoice.stop();stopRowSounds();if(!story.replay){S.active={event:story.event.id,row:story.index};save();}story=null;$('story').close();hud();toast('已暫停。點主線目標可以從這句繼續。');}
$('story-exit').onclick=suspendStory;$('story').addEventListener('cancel',e=>{e.preventDefault();suspendStory();});
document.addEventListener('visibilitychange',()=>{SeaVoice.setHidden(document.hidden);pauseRowSounds(document.hidden||!!story?.paused);if(document.hidden){keys={};music?.pause();ambience?.pause();for(const a of playing)a.pause();save();}else if(S.audio&&soundUnlocked){music?.play().catch(()=>{});if(S.area!=='reef')ambience?.play().catch(()=>{});}});window.addEventListener('pagehide',save);new ResizeObserver(resize).observe(cv);
function auditStatus(){if(!AUDIT)return;if(!$('audit-branch')&&localStorage.getItem(D.key+'-branch')){const b=button('檢查：重跑守獸分歧',()=>{if(blocked())return;const snap=JSON.parse(localStorage.getItem(D.key+'-branch'));S=snap;player.x=S.player[0]*1536;player.y=S.player[1]*D.maps[S.area].height;save();location.reload();});b.id='audit-branch';$('destinations').after(b);}let el=$('audit-status');if(!el){document.body.classList.add('audit-mode');el=document.createElement('section');el.id='audit-status';document.body.append(el);}const e=story?.event.id||'',row=story?.index??-1;const info={clock:Math.floor(clock),hidden:document.hidden,moving,path:path.length,player:[Math.round(player.x),Math.round(player.y)],blocked:blocked(),step:S.step,area:S.area,event:e,row,paused:story?.paused||false,checkpoint:S.checkpoint?.key||'',items:S.checkpoint?.items.filter(x=>!S.checkpoint.done.includes(x))||[],battle:battle?.kind||'',turn:battle?.turn||0,hp:S.hp,mp:S.mp,ready:story?.ready||false,completed:S.step>=17,duration:story?.duration||0,elapsed:story?.elapsed||0,cast:story?.plan?.cast||[],art:story?.plan?.art||null,cinema:story?.plan?.cinema||null,soundAudit,voice:{state:SeaVoice.state,progress:SeaVoice.progress()},sounds:[...playing].map(a=>({key:a.cueKey,time:+a.currentTime.toFixed(2),paused:a.paused,volume:+a.volume.toFixed(2)})),core:sceneInteraction.coreStatus,coreCount:S.checkpoint?.count||0,coreTargets:S.area==='core'?WorldProps.all(WorldProps.key2(S.area,S.flags)).filter(p=>['crystals','marks','wedges','core','imprint','seam'].includes(p.id)).map(p=>({id:p.id,asset:p.instance||p.asset,screen:[Math.round(cv.getBoundingClientRect().left+camera.x+(p.x+p.w/2)*camera.s),Math.round(cv.getBoundingClientRect().top+camera.y+(p.y+p.h/2)*camera.s)]})):[],boatScreen:ReefBoat.visible(S)?[cv.getBoundingClientRect().left+camera.x+ReefBoat.pose(S).x*camera.s,cv.getBoundingClientRect().top+camera.y+ReefBoat.pose(S).y*camera.s]:null,sailing:ReefBoat.moving,sailGame:S.checkpoint?.game,boatReach:sites().some(s=>s.id==='boat'&&siteReach(s)(player)),boatHit:ReefBoat.hit(S,ReefBoat.pose(S).x,ReefBoat.pose(S).y),boat:ReefBoat.visible(S)?ReefBoat.pose(S):null,sailCount:S.checkpoint?.game==='sail'?S.checkpoint.count||0:null};el.textContent='檢查存檔 '+AUDIT+' · '+JSON.stringify(info);}

function auditGalleryUI(){
 if(!AUDIT)return;
 const flat=Object.entries(book.events).flatMap(([id,e])=>e.rows.map((r,i)=>({id,e,r,i})));
 const host=document.createElement('section');host.id='audit-gallery';host.hidden=true;
 host.style.cssText='padding:16px;background:#102027;min-height:100vh';
 const head=document.createElement('header');head.style.cssText='position:sticky;top:0;z-index:100;padding:8px;background:#09171c;display:flex;gap:12px';
 const page=document.createElement('input');page.type='number';page.min=1;page.max=Math.ceil(flat.length/8);page.value=1;page.id='audit-page';page.setAttribute('aria-label','分鏡檢查頁');page.style.width='75px';
 const title=document.createElement('span');title.id='audit-gallery-title';
 const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px';
 function paint(){const old=story;grid.replaceChildren();const n=Number(page.value)-1;
  title.textContent='第二章逐幕檢查 '+(n+1)+' / '+Math.ceil(flat.length/8);
  for(const q of flat.slice(n*8,n*8+8)){const plan=SeaDirector.resolve(q.id,q.i,q.r);const d=Math.max(q.r.kind==='stage'?7:5,Number(q.r.seconds)||0,Array.from(q.r.text).length/(q.r.kind==='stage'?6:5.2)+2.2,plan?.minHold||0);
   const el=document.createElement('article');el.style.cssText='padding:10px;border:1px solid #a4b5a855;background:#182f36';
   const h=document.createElement('h3');h.style.cssText='font-size:15px;margin:0 0 5px;color:#f2dca5';h.textContent=q.id+':'+q.i+' · '+q.r.speaker+' · '+d.toFixed(1)+'秒';
   const c=document.createElement('canvas');c.width=800;c.height=450;c.style.width='100%';c.style.display='block';
   SeaDirectorRender.draw({ctx:c.getContext('2d'),w:c.width,h:c.height,story:{event:q.e,index:q.i,duration:d,elapsed:d*.45,plan,replay:true,paused:true},plan,images,root:D.root,paintMap,sprite,cover,mist,rig,motion:S.motion,flags:S.flags,maps:D.maps});
   const tx=document.createElement('p');tx.textContent=(q.r.kind==='stage'?'（演出）':'')+q.r.text;tx.style.cssText='margin:7px 0;font-size:15px;line-height:1.65;white-space:pre-wrap';
   el.append(h,c,tx);grid.append(el);
  }story=old;
 }
 const go=button('顯示檢查頁',paint);go.id='audit-gallery-go';
 const next=button('下一檢查頁',()=>{page.value=Math.min(Number(page.max),Number(page.value)+1);paint();window.scrollTo(0,0);});next.id='audit-gallery-next';
 const close=button('返回遊戲檢查',()=>{host.hidden=true;document.querySelector('.layout').hidden=false;document.querySelector('body>header').hidden=false;});
 head.append(title,page,go,next,close);host.append(head,grid);document.body.append(host);
 const open=button('開啟分鏡總覽',()=>{for(const d of document.querySelectorAll('dialog[open]'))d.close();story=null;host.hidden=false;document.querySelector('.layout').hidden=true;document.querySelector('body>header').hidden=true;paint();});open.id='audit-gallery-open';$('journal-open').after(open);
}


function auditReviewUI(){
 if(!AUDIT)return;
 const box=document.createElement('div');box.id='audit-review';box.style.cssText='padding:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:#10262d';
 const sel=document.createElement('select');sel.id='audit-event';sel.setAttribute('aria-label','檢查事件');
 for(const [id,e] of Object.entries(book.events)){const o=document.createElement('option');o.value=id;o.textContent=id+' '+e.title;sel.append(o);}
 const row=document.createElement('input');row.id='audit-row';row.type='number';row.min='0';row.value='0';row.style.width='70px';row.setAttribute('aria-label','檢查列號');
 const jump=button('檢查這一幕',()=>{if(story){story=null;$('story').close();}if($('talk').open)$('talk').close();const e=book.events[sel.value];const n=clamp(Number(row.value)||0,0,e.rows.length-1);if(e.id==='R2-11A')S.flags.kraken='calm';if(e.id==='R2-11B')S.flags.kraken='repel';S.flags.griffin=true;startStory(e,n,true);story.paused=true;SeaVoice.setPaused(true);pauseRowSounds(true);story.elapsed=story.duration*.45;$('line-pause').textContent='繼續演出';$('auto').checked=false;drawCinema();});
 jump.id='audit-jump';const next=button('檢查下一幕',()=>{let n=Number(row.value)+1;if(n>=book.events[sel.value].rows.length){sel.selectedIndex=(sel.selectedIndex+1)%sel.options.length;n=0;}row.value=n;jump.click();});next.id='audit-next';
 box.append('逐幕校對',sel,row,jump,next);$('story').prepend(box);
 const launch=button('開啟逐幕校對',()=>{startStory(book.events[sel.value],Number(row.value)||0,true);story.paused=true;});launch.id='audit-launch';$('journal-open').after(launch);
}


function battleIntegrationQA(){
 if(!AUDIT?.startsWith('battle-integration'))return;
 const panel=document.createElement('div');panel.id='battle-integration-qa';panel.style.cssText='position:fixed;right:8px;top:8px;z-index:12000;display:flex;gap:4px;background:#112629;padding:6px';
 for(const [kind,rune]of [['escort','water'],['escort','earth'],['kraken','water']]){
  panel.append(button('測試：'+kind+' / '+rune,()=>{if(battle)return;S.rune=rune;S.support='none';S.hp=180;S.mp=44;S.herbs=4;beginBattle(kind);panel.hidden=true;}));
 }document.body.append(panel);
}

async function init(){try{if(SeaNewMaps.enabled)return await initNewMaps();await SeaVoice.ready;const response=await fetch('chapter-two-story.json?v=core-steps-20261026');if(!response.ok)throw Error('章節文字未載入');book=await response.json();auditReviewUI();auditGalleryUI();const names=['cliff.webp','cliff-restored.webp','harbor.webp','reef.webp','routes.webp','temple.webp','rescue.webp','climax.webp','cast-reference.webp','cast-support.webp'];const all=[...names.map(n=>D.root+n),ReefBoat.asset,...(window.SEA_DIRECTOR_ASSETS||[]),...SeaLayeredProps.sources,...cliffCamp.sources,...Object.values(D.actors).map(a=>a.src).filter(Boolean),'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/characters/griffin.webp','https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/characters/griffin-companion-cartoon-v2.webp'];await Promise.all([...new Set(all)].map(img));ReefBoat.prepare(images[ReefBoat.asset]);SeaLayeredProps.prepare(images);cliffCamp.prepare(images);await Promise.all(Object.keys(WorldProps.catalog).filter(k=>k.startsWith('c2:')).map(k=>WorldProps.load(k)));await WorldProps.loadSmall();SeaPropDepth.clear();await rig.load();if(SeaNewMaps.enabled)SeaNewTerrain.settle(S.area,S.flags,player);else SeaPropDepth.settle(player,mapConfig().height,walkable);resize();$('loading').hidden=true;hud();const review=new URLSearchParams(location.search).get('review');if(review&&book.events[review]){playEvent(review,Math.max(0,Math.min(book.events[review].rows.length-1,Number(new URLSearchParams(location.search).get('row'))||0)),true);story.paused=true;story.elapsed=story.duration*.45;SeaVoice.setPaused(true);pauseRowSounds(true);$('line-pause').textContent='繼續演出';}requestAnimationFrame(frame);battleIntegrationQA();travelTip();if(!review)sceneInteraction.setupCore();if(S.area==='gate'&&!review){if(S.checkpoint?.game==='calm-wound')sceneInteraction.pulse(sites().find(s=>s.id==='dori'),S.checkpoint);else if(S.checkpoint?.key==='R2-11A:8'||S.checkpoint?.game==='rock-release')sceneInteraction.pulse(sites().find(s=>s.id==='rock'),S.checkpoint);}}catch(err){$('loading').className='error';$('loading').textContent=err.message+'。請重新整理；第一章存檔不受影響。';console.error(err);}}
window.SeaWalk={route:(x,y,accept)=>route(x,y,accept),walkable,segment:routeSegmentClear,sites,reach:siteReach,player:()=>({...player}),camera:()=>({...camera}),pending:()=>pending?.id,path:()=>path.map(p=>[...p]),go:walkToSite,story:()=>story&&({event:story.event.id,row:story.index}),terrain:()=>SeaTerrain.meta(S.area,S.flags,player.x,player.y)};
// This file is inserted into the existing story engine closure by runtime.cjs.
const newShotCache=[];
async function prepareNewShot(st){const p=st.plan,src=p.cinema?.src||(p.art?'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/'+p.art[0]:null);if(src&&!(p.cinema&&await window.CinemaHD?.prepare(p.cinema))&&!images[src]){await img(src);newShotCache.push(src);while(newShotCache.length>4){const key=newShotCache.shift();delete images[key];}}await SeaNewWorld.load(p.map||S.area,{...S.flags,...(p.restored===undefined?{}:{repaired:p.restored})});if((p.map||S.area)==='gate')await rig.load();}
function newReward(id){const state=window.SeaRPG?.state;if(state)SeaNewProgression.award(S,state,Growth,id,book.events[id].title);}
function newTimber(s){if(S.side.timber!==1){toast(S.side.timber===2?'重建木料已經交付。':'先與克雷翁談談重建所需的木料。');return;}const i=s.instance?Number(s.instance.split('-')[1]):[0,1,2].find(n=>!(S.side.woodPicked||[]).includes(n));if(!SeaNewProgression.collectTimber(S,SeaRPG.state,Growth,i))return;toast(S.side.timber===2?'已交付三捆木料。獲得兩份止血藥草與 60 經驗。':'已拾回 '+S.side.wood+' / 3 捆木料。');save();hud();}
async function newPrepare(area,flags){await Promise.all([SeaNewWorld.prepare(area,flags),area==='gate'?rig.load():Promise.resolve()]);}
function newHoldAction(cp,s,done){
 const rock=cp.game==='rock-release',key='action:'+cp.key;S.flags[key]??=0;
 modal(rock?'順著裂口鬆開卡石':'趁觸腕放鬆塗油',rock?'推力退去時按住操作，推力增強時放手。已鬆動的部分會保留。':'多莉在岸上等候。觸腕放鬆時按住塗油，繃緊時放手。已塗好的部分會保留。',[button('暫停操作',closeTalk)],'現場互動');
 const panel=document.createElement('div');panel.className='hold-operation';const label=document.createElement('p'),bar=document.createElement('progress'),hold=button('按住操作',()=>{});bar.max=1;hold.style.touchAction='none';panel.append(label,bar,hold);$('talk-options').prepend(panel);let held=false,last=performance.now(),timer;
 const release=()=>held=false;hold.onpointerdown=e=>{e.preventDefault();held=true;hold.setPointerCapture(e.pointerId);};hold.onpointerup=hold.onpointercancel=release;hold.onkeydown=e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();held=true;}};hold.onkeyup=release;
 const clean=()=>{release();clearInterval(timer);panel.remove();save();window.removeEventListener('blur',release);};window.addEventListener('blur',release);$('talk').addEventListener('close',clean,{once:true});
 timer=setInterval(()=>{const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;const safe=clock%3>=1.2;label.textContent=(safe?'可以操作 · 推力低落':'請放手 · 推力正在增強')+'　'+Math.round(S.flags[key]*100)+'%';label.style.color=safe?'#a9e5cc':'#f2b28a';bar.value=S.flags[key];if(held&&safe&&!document.hidden){S.flags[key]=Math.min(1,S.flags[key]+dt/2.4);if(S.flags[key]===1){if(rock)S.flags.rockReleased=true;else S.flags.woundTreated=true;done();}}},50);
}
function newCheckpoint(s){const cp=S.checkpoint;if(!cp||cp.done.includes(s.id))return;
 if(cp.game==='branch'){modal('擱淺的克拉肯','牠被推力困住。可親自引水、上藥與鬆石；擊退路線的戰鬥尚未開放。',[button('安撫 · 引水、上藥、鬆石',()=>chooseKraken('calm')),button('預覽擊退路線的後續劇情',()=>chooseKraken('repel'),'本次略過交戰，不計擊殺、不領戰鬥獎勵。')],'選擇通過潮門的方法');return;}
 if(['battle','kraken-battle'].includes(cp.game)){modal('此段戰鬥暫緩','本次先測試第二章探索與劇情。繼續後可查看後續事件；這筆紀錄與正式戰鬥完成分開保存，不產生戰鬥經驗、裝備或擊殺紀錄。',[button('繼續劇情試玩',()=>{S.flags.deferredBattles??={};S.flags.deferredBattles[cp.event]=true;closeTalk();checkpointComplete(s.id);}),button('返回場景',closeTalk)],'戰鬥尚未開放');return;}
 if(cp.game==='sail'){sailGame();return;}
 const done=()=>{closeTalk();save();checkpointComplete(s.id);};if(['calm-wound','rock-release'].includes(cp.game)){newHoldAction(cp,s,done);return;}
 if(['crystal-nine','crystal-last'].includes(cp.game)){
  const first=cp.game==='crystal-nine'?0:9,last=cp.game==='crystal-nine'?9:12;S.flags.crystalsRemoved??=[];
  const show=()=>{const available=Array.from({length:last-first},(_,i)=>i+first).filter(i=>!S.flags.crystalsRemoved.includes(i));
   if(!available.length){done();return;}const options=available.map(i=>button('取出第 '+(i+1)+' 顆粗晶',()=>{if((clock%3)<1.2){toast('脈動仍亮著，等光暗下再取出。');return;}if(!S.flags.crystalsRemoved.includes(i))S.flags.crystalsRemoved.push(i);cp.count=S.flags.crystalsRemoved.filter(n=>n>=first&&n<last).length;save();show();}));
   options.push(button('暫停操作',closeTalk));modal(cp.game==='crystal-nine'?'逐一卸下外加的九顆粗晶':'卸下最後三顆粗晶','等紅光脈動暗下再取出。每顆獨立記錄，離開後可從進度繼續。已完成 '+S.flags.crystalsRemoved.length+' / 12。',options,'潮心拆除');};show();return;
 }
 if(cp.game==='grooves'||cp.game==='wedges'){
  const wedge=cp.game==='wedges',key=wedge?'wedgesRemoved':'groovesCut';S.flags[key]??=[];
  if(wedge&&(S.flags.crystalsRemoved||[]).length!==12){toast('先依指示取出十二顆粗晶。');return;}
  const show=()=>{const remaining=[0,1,2].filter(i=>!S.flags[key].includes(i));if(!remaining.length){if(wedge)S.flags.ringOff=true;done();return;}modal(wedge?'鬆開三枚固定銅楔':'截斷三道外加刻槽',wedge?'沿著已失去推力的接點逐一卸楔，最後移開外加銅環。':'只處理後來鑿入的三條刻槽，保留原來的海潮紋。',remaining.map(i=>button((wedge?'卸下第 ':'處理第 ')+(i+1)+(wedge?' 枚銅楔':' 道刻槽'),()=>{S.flags[key].push(i);save();show();})).concat(button('暫停操作',closeTalk)),'潮心拆除');};show();return;
 }
 const actions={jars:['捆好海水缸','將海水留在完整陶缸，檢查搬運用的繩結。'],rope:['固定撤離繩索','將繩索繫在穩固石柱，讓撤離的人能借力。'],pool:['清理舊鹽池','清理碎石並確認池壁能留住搬來的海水。'],buoy:['查看浮標與繩結','比對浮標原位與刮痕，記錄人為挪動的痕跡。'],trench:['探量淺溝','沿著淺溝檢查深度與盡頭。'],ridge:['追蹤逆坡水痕','沿岸觀察越過沙脊的水痕方向。'],barrier:['查驗堆石外緣','觀察傾斜石塊與附著海草的方向。'],water:['引來淺水','從岸上引導身旁的水，濕潤乾裂的觸腕。'],horn:['請尼科吹巡標潮號','以牠熟悉的訊號讓觸腕慢下來。'],wound:['協助多莉上藥','趁觸腕放鬆，讓多莉把橄欖油塗在傷口上。'],rock:['鬆開卡住的礁岩','順著裂口逐步鬆石，讓出觸腕抽回的空間。'],crystals:['查看十二個晶槽','先辨認外加的九顆與原先的三顆粗晶，等待拆除順序。'],marks:['比對補刻紋路','確認三道後來加上的刻槽。'],seam:['檢查銅環接縫','比對原石紋與外加銅環的接合面。'],core:['穩住潮心的脈動','讓海神透過通契回應，維持潮汐的核心留在原位。'],imprint:['拓下海潮刻印','以濕布完成拓印，不帶走維持海潮的核心。']}[s.id]||['完成這項操作',cp.hint||cp.title];
 modal(actions[0],actions[1],[button('開始操作',()=>{if(cp.game==='link'&&!S.flags.ringOff){toast('先卸下外加的銅環。');return;}if(cp.game==='link')S.flags.linked=true;if(cp.game==='calm-wound')S.flags.woundTreated=true;if(cp.game==='rock-release')S.flags.rockReleased=true;done();}),button('返回場景',closeTalk)],'現場互動');
}
function drawNewWorld(){const W=1536,H=660,fit=Math.min(vw/W,vh/H),mobile=matchMedia('(pointer:coarse),(max-width:760px)').matches;camera.s=mobile?Math.max(vw/W,vh/H,.72)*zoom:fit*zoom;const focus=ReefBoat.aboard?ReefBoat.pose(S):player;camera.x=W*camera.s<=vw?(vw-W*camera.s)/2:clamp(vw/2-focus.x*camera.s,vw-W*camera.s,0);camera.y=H*camera.s<=vh?(vh-H*camera.s)/2:clamp(vh/2-focus.y*camera.s,vh-H*camera.s,0);g.setTransform(cv.width/vw,0,0,cv.height/vh,0,0);g.fillStyle='#10191e';g.fillRect(0,0,vw,vh);g.save();g.translate(camera.x,camera.y);g.scale(camera.s,camera.s);SeaNewWorld.paint(g,S.area,S.flags);if(S.step===8&&S.area==='cliff'){g.fillStyle='#071a2b88';g.fillRect(0,0,W,H);}const list=sites(),im=SeaNewWorld.background(S.area,S.flags),records=SeaNewWorld.records(S);for(const r of records.filter(r=>r.flat))SeaNewWorld.drawProp(g,r);if(path.length)SeaNewWorld.footprints(g,player,path);
 const layers=SeaNewWorld.staticLayers(S,im);if(S.area==='gate'&&S.step<12)layers.push({foot:355,draw:ctx=>rig.draw(ctx,S.motion?clock:0,{x:790,y:300,scale:.46,rise:1,view:'left'})});if(griffinFollower.active&&!ReefBoat.aboard)layers.push({foot:griffinFollower.y,draw:ctx=>griffinFollower.draw(ctx,images)});for(const r of records.filter(r=>!r.flat))layers.push({foot:r.foot,draw:ctx=>{ctx.save();if(r.id==='crystals'&&(S.checkpoint?.game||'').startsWith('crystal'))ctx.globalAlpha=clock%3<1.2?1:.48;SeaNewWorld.drawProp(ctx,r);ctx.restore();}});
 for(const s of list.filter(s=>s.actor))if(!(ReefBoat.aboard&&s.id==='niko'))layers.push({foot:s.y,draw:ctx=>{if(s.id==='poseidon'&&S.step===16){mist(ctx,s.x,s.y-10,28,'#9bdce8',.48);return;}sprite(ctx,s.actor,s.x,s.y,58+s.y/H*7,s.id==='demeter'?.72:1,true);}});
 if(!ReefBoat.aboard)layers.push({foot:player.y,draw:ctx=>GroundedWalk.drawHero(ctx,images[D.actors.erion.src],player.x,player.y,58+player.y/H*7,moveDist,moving&&S.motion,...lastDir)});
 layers.sort((a,b)=>a.foot-b.foot).forEach(r=>r.draw(g));ReefBoat.draw(g,S,S.motion?clock:0);sceneInteraction.draw(g,list,hover,currentTargets(),pending,guideUntil>clock);g.restore();
 const c=$('minimap'),q=c.getContext('2d');c.hidden=ReefBoat.aboard;q.clearRect(0,0,c.width,c.height);if(im)q.drawImage(im,0,20,220,95);q.fillStyle='#ffe5a0';q.beginPath();q.arc(player.x/W*220,20+player.y/H*95,3,0,7);q.fill();
}
async function initNewMaps(){await SeaVoice.ready;const response=await fetch('chapter-two-story.json?v=new-maps-r28');if(!response.ok)throw Error('章節文字未載入');book=await response.json();
 const all=[ReefBoat.asset,...Object.values(D.actors).map(a=>a.src||D.root+a.image).filter(Boolean),'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/characters/griffin-companion-cartoon-v2.webp'];let index=0;const work=async()=>{while(index<all.length)await img(all[index++]);};await Promise.all([work(),work(),newPrepare(S.area,S.flags)]);ReefBoat.prepare(images[ReefBoat.asset]);SeaNewTerrain.settle(S.area,S.flags,player);resize();$('loading').hidden=true;save();hud();requestAnimationFrame(frame);travelTip();
 const badge=document.createElement('div');badge.className='chapter-preview-note';badge.textContent='第二章新地圖 · 劇情探索試玩／戰鬥暫緩';$('world').append(badge);
 // Authored cinema art is loaded on demand, rather than decoding every shot up front.
 if(AUDIT==='new-map-review'){const panel=document.createElement('details');panel.className='map-audit';panel.innerHTML='<summary>隔離審查 · 地圖與主線節點</summary>';for(const [a,m]of Object.entries(D.maps)){const b=button(m.name,()=>{const u=new URL(location.href);u.searchParams.set('area',a);location.href=u;});panel.append(b);}const skip=button('前往本段下一個操作點',()=>{if(story)SeaGame.skip();else{const q=activeQuest();playEvent(S.active?.event||q[2],S.active?.row||0);}});panel.append(skip);document.body.append(panel);}
}

window.SeaGame={S,D,isolated:!!AUDIT,blocked,save,hud,toast,allowedArea,changeArea,stop:()=>{path=[];pending=null;keys={}},get battle(){return battle},get ready(){return !!book&&$('loading').hidden},get safe(){return !blocked()&&!sceneInteraction.active&&!sceneInteraction.busy&&!S.active&&!S.checkpoint&&!pending&&!ReefBoat.aboard},input:(x,y)=>{stickMoving=Math.hypot(x,y)>.28;if(!stickMoving)exitLatch=false;keys={ArrowLeft:x<-.28,ArrowRight:x>.28,ArrowUp:y<-.28,ArrowDown:y>.28}},beginBattle,battleAction,finishBattle,nextRow,skip:()=>{if(!story)return;while(story&&!story.replay&&story.index<story.event.rows.length){const key=story.event.id+':'+story.index;if(condition(story.event.rows[story.index].condition)&&D.checkpoints[key]&&!S.flags['cp:'+key]){nextRow();return;}if(condition(story.event.rows[story.index].condition))revealNames(story,story.event.rows[story.index]);story.index++;}endStory();}};
init();
})();

