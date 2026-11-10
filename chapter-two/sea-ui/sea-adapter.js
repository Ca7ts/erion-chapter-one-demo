(() => {
  'use strict';
  const originalBestiary=window.Bestiary;const game=SeaGame,S=game.S,D=game.D,M=SeaDrops,byId=id=>document.getElementById(id);
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
  const old=game.isolated?null:read('erion-region-adventure-v1');
  const s=ChapterContinuity.enter(S,game.isolated);
  const itemStore=s.inventory??={};
  Object.defineProperty(s,'forgeClears',{configurable:true,get:()=>{
    const first=!game.isolated&&WeaponAscent.firstCleared(read('erion-region-adventure-v1'));
    return WeaponAscent.clears(first,S.step>=17&&!window.SeaNewMaps?.enabled);
  }});
  for(const [k,initial]of [['herb',S.herbs],['seaMaterial',S.materials]])Object.defineProperty(itemStore,k,{enumerable:true,configurable:true,get:()=>k==='herb'?S.herbs:S.materials,set:n=>{if(k==='herb')S.herbs=n;else S.materials=n}});
  Object.defineProperty(s,'items',{configurable:true,enumerable:true,get:()=>itemStore});
  for(const k of ['hp','maxHp','mp','maxMp','defense','support','area'])Object.defineProperty(s,k,{configurable:true,get:()=>S[k]??0,set:n=>S[k]=n});
  window.REGION_MAPS={order:Object.keys(M.levels),areas:D.maps};
  const itemNames={...SharedCharacter.names,...Object.fromEntries(M.catalog.map(c=>[c.key,c.name]))};
  window.REGION_ADVENTURE={enemies:M.enemies,itemNames};
  window.Bestiary={...window.Bestiary,gear:{...window.Bestiary?.gear,...M.gear},recipes:window.LeonCarry?.recipes,enemies:M.enemies,regional:M.regional,regionLevels:M.levels,field:M.field,skills:M.skills,materials:M.materials,materialTable:M.drops,supplies:{}};
  Object.assign(originalBestiary,window.Bestiary);window.Bestiary=originalBestiary;
  // Carry only actual previous-chapter belongings into the second chapter catalogue.
  window.JourneyCatalog=[...JourneyCatalog];
  JourneyCatalog.push({key:'seaMaterial',name:'修船材料',category:'material',description:'漁港修繕船身與船具的物資。',source:'潮岸劇情戰鬥與任務',chance:'依劇情取得'},...M.catalog);
  const canonical=window.Growth;
  function recompute(){canonical.init(s);}
  window.Growth={...canonical,recompute:(state=s)=>canonical.recompute(state),spell:(state,k)=>canonical.spell(state,k)};
  const hasSupport=k=>k==='none'||k===S.support||(!game.isolated&&SharedCharacter.has(k));
  const save=()=>{game.save();window.RpgHUD?.updateHud()};
  window.PrivateTest={game:{state:s,blocked:game.blocked,hooks:{area:()=>S.area,stop:game.stop,toast:game.toast},canVisit:k=>game.allowedArea(k)&&S.seen.includes(k),save,combat:{get active(){return !!game.battle}},suspendInfo:()=>byId('talk').close()},openCraft:()=>SeaControls.craft()};
  const nav=document.querySelector('header.top nav');
  function navButton(id,label,fn){const n=document.createElement('button');n.id=id;n.textContent=label;n.onclick=fn;nav.append(n);return n}
  for(const [id,label,fn]of [
    ['travel-bag','行囊',()=>JourneyPanels.openBag()],['travel-runes','符文',()=>JourneyPanels.openRunes()],['armory','裝備庫',()=>PrivateTest.openEquipment()],['overview','旅程路線',()=>SeaControls.routes()],['trip','成長與獎勵',()=>PrivateTest.summary()],['wildlife','棲地與素材',()=>PrivateTest.openWildlife()],['codex','物品與掉落表',()=>JourneyPanels.openCatalog()],['travel-tips','旅途提示',()=>SeaControls.tips()],['sea-forge','素材工藝',()=>SeaControls.craft()],['sea-hunt','調查附近怪物',()=>SeaRPG.start()],['camp-rest','在營地休整',()=>{if(['cliff','harbor'].includes(S.area))byId('rest').click();else game.toast('海岸高崖與漁港可安全休整。');}]
  ])navButton(id,label,fn);
  byId('runes-open').hidden=true;
  for(const key of ['task-reset-open','task-reset-restore'])nav.append(byId(key));
  const route=document.createElement('dialog');route.id='atlas';route.innerHTML='<h2>旅程路線</h2>';document.body.append(route);
  const imageCache=new Map();let distance=0,threshold=1100;
  const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
  function fieldFoe(id){
    const e=M.enemies[id],level=M.rollLevel(e),scale=e.rare?1.5:1,max=Math.round((52+level*7)*e.hp*scale);
    return {id,name:e.name,level,hp:max,max,armor:e.armor,atk:Math.round((7+level*.9)*e.attack*scale),move:e.move,rare:e.rare};
  }
  function harborTargets(){if(window.SeaNewMaps?.enabled)return [];
    if(S.area!=='harbor'||S.step<16)return [];
    const workshopEnemies=Object.values(WeaponAscent.ingredients).flat().map(m=>m.enemy);
    return [...new Set(workshopEnemies)].filter(id=>S.seen.includes(M.enemies[id].region));
  }
  function harborHunt(id){
    if(!game.safe||!game.ready||!harborTargets().includes(id))return false;
    const foe=fieldFoe(id);foe.huntRegion=M.enemies[id].region;
    game.beginBattle('field',[foe]);byId('battle-title').textContent=M.enemies[id].area+' · 取材委託';
    return true;
  }
  function start(){
    if(!game.ready||!game.safe){game.toast('請先完成眼前的互動，再調查附近。');return false}
    const zone=M.region(S.area);if(!zone)return false;if(window.SeaNewMaps?.enabled&&!zone.monsters.some(id=>!M.enemies[id].rare&&window.SeaApprovedMonsters?.includes(id))){game.toast('此區怪物技能尚待確認。');return false;}
    const roll=Math.random(),count=roll<.2?1:roll<.65?2:roll<.95?3:4;
    const group=Array.from({length:count},()=>pick(zone.monsters.filter(id=>!M.enemies[id].rare&&(!window.SeaNewMaps?.enabled||window.SeaApprovedMonsters?.includes(id)))));
    const rare=zone.monsters.find(id=>M.enemies[id].rare&&(!window.SeaNewMaps?.enabled||window.SeaApprovedMonsters?.includes(id)));if(rare&&Math.random()<.08)group[0]=rare;
    game.beginBattle('field',group.map(fieldFoe));return true;
  }
  function opening(b){
    window.SeaControls?.resetBattle();const zone=b.kind==='escort'?'seabed':b.kind==='kraken'?'gate':b.enemies[0]?.huntRegion||S.area;
    b.arena=new ChapterImage();b.arena.src="https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/429b930ba6730bb5a7c0032c3cc9f7603a9635bf/arenas/"+zone+'.webp';if(b.kind!=='field')return;
    ExplorationLedger.encounter(s,b.enemies.map(e=>e.id));imageCache.clear();
    for(const e of (window.SeaNewMaps?.enabled?[]:b.enemies)){if(!imageCache.has(e.id)){const im=new ChapterImage();im.onerror=()=>{im.onerror=null;im.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/sea-ui/creatures/'+e.id+'.webp'};im.src='sea-ui/battle-portraits/'+e.id+'.webp';imageCache.set(e.id,im)}}
    b.busy=true;b.loading=true;import('../continuation/approved-monsters-r34.mjs?v=34b').then(()=>SeaActors.start(b)).then(ok=>{if(game.battle!==b)return;if(!ok)throw Error('模型未載入');b.loading=false;b.busy=false;SeaControls.battleUI(b);}).catch(err=>{if(game.battle!==b)return;b.loading=false;game.toast('怪物載入失敗，已安全退出戰鬥。');game.finishBattle(false);console.error(err);});
    save();
  }
  function draw(ctx,b,w,h,visualH,visual){
    const rendered=window.SeaActors?.draw(ctx,b,w,visualH,visual),mode=rendered?'model':'portrait';
    if(ctx.canvas.dataset.enemies!==mode)ctx.canvas.dataset.enemies=mode;
    if(rendered)return;if(window.SeaNewMaps?.enabled){ctx.save();ctx.fillStyle='#ead8b0';ctx.font='16px serif';ctx.textAlign='center';ctx.fillText('潮岸異獸正在現身…',w/2,visualH/2);ctx.restore();return;}
    for(const [i,e]of b.enemies.entries()){if(e.hp<=0)continue;const im=imageCache.get(e.id);if(!im?.naturalWidth)continue;
      const recoil=visual?.recoil(i)||{x:0,y:0},x=w*(.2+(i+1)*.6/(b.enemies.length+1))+recoil.x*w,foot=visualH*.86+recoil.y*visualH;
      const scale=Math.min(visualH*(e.rare?.70:.58)/im.naturalHeight,w*(b.enemies.length===1?.52:.80/b.enemies.length)/im.naturalWidth);
      const iw=im.naturalWidth*scale,ih=im.naturalHeight*scale;
      ctx.save();ctx.fillStyle='#07111666';ctx.beginPath();ctx.ellipse(x,foot,iw*.38,Math.max(3,ih*.045),0,0,Math.PI*2);ctx.fill();
      const t=b.time-(e.attackAt??-10),step=S.motion&&t>=0&&t<.44?Math.sin(Math.PI*t/.44)*visualH*.045:0;
      if(b.time-(e.hit??-9)<.13)ctx.filter='brightness(1.5)';ctx.drawImage(im,x-iw/2,foot-ih+step+(S.motion?Math.sin(b.time*2+i)*1.2:0),iw,ih);ctx.restore();
    }
  }
  function reward(b){
    if(b.rewardSettled)return;b.rewardSettled=true;
    const rows=[];let xp=0,coins=0;
    for(const foe of b.enemies){if(foe.hp>0)continue;const e=M.enemies[foe.id];s.bestiary.kills[e.id]=(s.bestiary.kills[e.id]||0)+1;
      xp+=foe.level*(e.rare?8:4);coins+=foe.level+(e.rare?10:1);
      for(const [k,n,p]of e.drops)if((!LeonPatterns.byProof[k]||(!foe.summoned&&LeonPatterns.available(s,LeonPatterns.byProof[k])))&&Math.random()<p){s.items[k]=(s.items[k]||0)+n;rows.push({key:k,name:itemNames[k],count:n,color:Loot.quality(M.materials[k].tier).color});}
      if(Math.random()<e.chance){const v=Math.random(),rarity=e.rare?(v<.6?'blue':v<.97?'purple':'orange'):(v<.45?'white':v<.88?'green':'blue');
        const it=Loot.roll(s,{template:e.id,slot:e.slot,rarity,level:foe.level,source:e.name});rows.push({key:it,name:it.name,count:1,color:Loot.quality(rarity).color});}
    }
    const receipt='c2-field-'+crypto.randomUUID();canonical.award(s,receipt,xp);s.economy.balance+=coins;recompute();save();SeaControls.victory(xp,coins,rows);
  }
  function capture(){if(!window.ExplorationLedger||!window.Loot)return;ExplorationLedger.capture(s);return ChapterContinuity.capture(S,s,game.isolated);}
  if(game.isolated&&new URLSearchParams(location.search).get('audit')==='new-map-review'){
    const panel=document.createElement('div');panel.id='skill-audit-controls';panel.style='position:fixed;bottom:28px;left:8px;z-index:4000;background:#17222b;padding:6px;border:1px solid #bc9a62;display:flex;gap:4px';
    const select=document.createElement('select');select.id='skill-audit-species';select.setAttribute('aria-label','檢查怪物');
    for(const id of window.SeaApprovedMonsters||[])select.append(new Option(M.enemies[id].name,id));
    const count=document.createElement('select');count.id='skill-audit-count';count.setAttribute('aria-label','檢查數量');for(const n of [1,2,3])count.append(new Option(n+' 隻',n));
    const launch=document.createElement('button');launch.textContent='檢查技能戰鬥';launch.onclick=()=>{if(game.battle||!game.ready)return;game.beginBattle('field',Array.from({length:+count.value},()=>fieldFoe(select.value)));};
    panel.append(select,count,launch);document.body.append(panel);
  }
  window.SeaRPG={state:s,hasSupport,save,start,harborTargets,harborHunt,opening,draw,reward,capture,enter:area=>{distance=0;ExplorationLedger.enter(s,area)},walk:(n,locked)=>{if(locked||S.active||S.checkpoint||S.step<1||S.step>=16||['cliff','harbor'].includes(S.area))return;distance+=n;if(distance>=threshold){distance=0;threshold=800+Math.random()*650;start();}},damage:(raw,e,skill)=>canonical.damage((skill?raw:s.attack)*(Math.random()*100<s.critChance?1.5:1),e.armor||0,skill?S.rune:'attack')};
})();
