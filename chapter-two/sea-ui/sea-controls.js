(() => {
  'use strict';
  const g=SeaGame,S=g.S,s=SeaRPG.state,by=id=>document.getElementById(id);
  const elem=(t,text,cls)=>{const n=document.createElement(t);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n};
  const btn=(text,fn)=>{const b=elem('button',text);b.type='button';b.onclick=fn;return b};
  const dlg=(id,title)=>{let n=by(id);if(!n){n=elem('dialog');n.id=id;document.body.append(n)}n.replaceChildren(elem('h2',title));n.setAttribute('aria-label',title);return n};
  const closeX=d=>{if(d.querySelector('.panel-close-x,.close')||['story','game-resume-overlay'].includes(d.id))return;const b=btn('×',()=>{if(d.dataset.pendingAction==='true'){confirmAction('關閉目前的裝備選擇？',()=>d.close());}else d.close()});b.className='panel-close-x';b.setAttribute('aria-label','關閉');d.prepend(b)};
  function confirmAction(title,yes){const n=dlg('sea-confirm',title);n.append(btn('取消',()=>n.close()),btn('確認',()=>{n.close();yes()}));n.showModal();}
  const monitor=new MutationObserver(records=>{for(const r of records){const d=r.target.closest?.('dialog[open]');if(d)closeX(d);for(const n of r.addedNodes)if(n.matches?.('dialog[open]'))closeX(n)}});
  monitor.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  Growth.recompute();RpgHUD.updateHud();
  by('journey-group-journey').append(by('sea-hunt'),by('sea-forge'),by('camp-rest'));
  const returnLink=document.querySelector('a.return');if(returnLink)by('journey-group-journey').append(returnLink);
  function viewModel(id){if(window.SeaNewMaps?.enabled){g.toast("第二章怪物與戰鬥待後續製作，目前先開放劇情探索。");return;}
    if(!s.bestiary.seen[id])return;
    const d=dlg('sea-model-view',SeaDrops.enemies[id].name),frame=elem('iframe');
    frame.title='立繪與立體模型';frame.src='sea-ui/models.html?embed=1&monster='+encodeURIComponent(id);d.append(frame);
    d.addEventListener('close',()=>frame.remove(),{once:true});d.showModal();
  }
  function routes(fromBag=false){if(g.blocked())return;const d=by('atlas');d.replaceChildren(elem('h2','旅程路線'),elem('p','經由路口步行免費。快速通行會使用一張區域快速通行券。'));const list=elem('div',null,'sea-route-list');
    for(const [id,m]of Object.entries(g.D.maps)){const known=S.seen.includes(id),b=btn(known?m.name:'尚未探索',()=>{confirmAction('使用區域快速通行券 ×1，前往'+m.name+'？',()=>{if(!(s.items.travelPass>0)){g.toast('缺少區域快速通行券');return;}if(!g.allowedArea(id)||id===S.area)return;d.close();s.items.travelPass--;g.changeArea(id);SeaRPG.save();});});b.disabled=!known||!g.allowedArea(id)||id===S.area||!(s.items.travelPass>0);if(!known)b.className='unexplored-route';list.append(b)}d.append(list,elem('p','持有通行券 ×'+(s.items.travelPass||0)));d.showModal();}
  const homePort=()=>S.seen.includes('harbor')&&g.allowedArea('harbor')?'harbor':'cliff';
  window.TravelItems={names:{returnFeather:'回城羽毛',travelPass:'區域快速通行券'},homePort,useFromBag:k=>{if(k==='travelPass'){routes(true);return}const dest=homePort(),name=g.D.maps[dest].name;if(S.area===dest){g.toast('已在'+name);return}confirmAction('使用回城羽毛 ×1，返回'+name+'？',()=>{if(s.items[k]>0&&g.safe){s.items[k]--;g.changeArea(dest);SeaRPG.save()}})}};
  function tips(){const d=dlg('sea-tips','旅途提示');d.append(elem('p','點道路或使用方向鍵移動。手機可拖曳左下搖桿。點人物或場景物件走近互動。'),elem('p','點頭像查看人物與九個裝備部位。打開任務指引，可以標出目前目標。'));d.showModal();}
  function salvage(){
    if(g.battle)return;
    const d=dlg('sea-salvage','分解祭壇');
    LeonAltar.mount(d,{state:s,save:()=>SeaRPG.save(),isBusy:()=>!!g.battle,back:()=>{d.close();craft();}});
    if(!d.open)d.showModal();
  }
  function craft(){
    if(g.blocked())return;
    const d=dlg('sea-craft','素材工藝'),form=elem('div',null,'sea-craft-grid'),detail=elem('section'),known=Object.values(SeaDrops.enemies).filter(e=>s.bestiary.kills[e.id]);
    function show(e){
      const item=SeaDrops.gear[e.id][e.slot],a=e.id+'-mat',b=e.id+'-rare',supply=['ring','belt'].includes(e.slot);
      const product=supply?'清泉水囊 ×2':item.name;
      const make=btn('製作',()=>{
        if((s.items[a]||0)<3||(s.items[b]||0)<1)return;
        if(supply)s.items.ether=(s.items.ether||0)+2;
        else Loot.roll(s,{template:e.id,slot:e.slot,rarity:'green',level:e.level,source:'素材工藝 · '+e.name});
        s.items[a]-=3;s.items[b]--;SeaRPG.save();show(e);detail.append(elem('p','製作完成 · '+product));
      });
      make.disabled=(s.items[a]||0)<3||(s.items[b]||0)<1;
      detail.replaceChildren(ItemIcons.node(supply?'ether':e.id+'-'+e.slot),elem('h3',product),elem('p',SeaDrops.materials[a].name+' '+(s.items[a]||0)+'/3　'+SeaDrops.materials[b].name+' '+(s.items[b]||0)+'/1'),make);
      if(supply)detail.append(elem('p',item.name+'僅由'+e.name+'掉落。'));
    }
    const ascent=btn('利昂工坊 · 武器升階',()=>{d.close();g.stop();LeonAscent.open({state:s,save:()=>{Growth.recompute();SeaRPG.save();},isBusy:()=>!!g.battle,back:craft});});
    const patterns=btn('利昂的專屬圖樣',()=>{d.close();LeonPatternUI.open({state:s,sea:true,save:SeaRPG.save,allowed:()=>!g.battle&&['harbor','cliff'].includes(S.area),back:craft});});
    if(['harbor','cliff'].includes(S.area))d.append(patterns);
    d.append(ascent,btn('裝備分解',()=>{d.close();g.stop();salvage();}));
    const hunts=SeaRPG.harborTargets();
    if(hunts.length){
      const section=elem('section');section.append(elem('h3','漁港取材委託'),elem('p','潮水已淹過舊路。漁船能載你到曾探訪的水域取材。'));
      for(const id of hunts)section.append(btn('出船尋找'+SeaDrops.enemies[id].name,()=>{d.close();if(!SeaRPG.harborHunt(id))g.toast('請先完成眼前的任務。');}));
      d.append(section);
    }
    for(const e of known){const b=btn(e.name,()=>show(e));const im=elem('img');im.src='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/sea-ui/creatures/'+e.id+'.webp';im.alt='';b.prepend(im);form.append(b)}d.append(form,detail);
    if(known.length)show(known[0]);else d.append(elem('p','擊敗當地的怪物後，便能查看與牠有關的材料和裝備。'));d.showModal();
  }
  function victory(xp,coins,items){
    const d=dlg('sea-victory','戰鬥勝利');d.prepend(elem('small','VICTORY'));if(xp||coins)d.append(elem('p','獲得經驗　+'+xp+'　　 德拉克馬　+'+coins));
    const grid=elem('div',null,'sea-receipts');for(const item of items){const row=elem('div');row.append(ItemIcons.node(item.key),elem('span',item.name+' ×'+item.count));row.style.color=item.color;grid.append(row)}if(!items.length)grid.append(elem('p','這次沒有拾獲物品。'));
    d.append(grid,btn('繼續探索',()=>d.close()));d.showModal();
  }
  let deck='main',active=null;
  function resetBattle(){deck='main';active=null}
  function battleUI(b){
    const d=by('commands'),tg=by('targets');by('round').textContent='第 '+b.turn+' 回合';
    const mark=b.kind==='field'&&b.turn%3===0?b.enemies.find(e=>e.hp>0)?.move:'';
    by('battle-warning').textContent=mark?'敵方蓄力 · '+mark:b.turn%3===0?(b.kind==='kraken'?'觸腕縮起，深池翻湧。':b.kind==='escort'?'頭目舉起短棍。':''):'';
    by('battle-hint').textContent='';const msg=by('battle-stats');msg.replaceChildren();
    for(const [title,value,max,kind] of [['生命',S.hp,S.maxHp,'hp'],['精神',S.mp,S.maxMp,'mp']]){const t=elem('span',null,'rpg-meter '+kind),f=elem('i'),v=elem('span',title+' '+value+' / '+max);f.style.width=Math.min(100,value/max*100)+'%';t.append(f,v);VitalColors.apply(t,value,max,kind);msg.append(t)}
    const fire=(type,rune)=>{if(b.busy)return;if(rune)S.rune=rune;deck='main';active=null;g.battleAction(type)};
    const target=(i)=>{if(b.busy||b.enemies[i].hp<=0)return;b.target=i;fire(active?'rune':'attack',active)};
    tg.replaceChildren(...b.enemies.map((e,i)=>{const t=btn('',()=>target(i));t.className='sea-target';const n=elem('strong',(e.rare?'稀有 · ':'')+e.name+(e.level?'　Lv.'+e.level:''));if(e.rare)n.style.color='#87ceff';const bar=elem('span',null,'rpg-meter hp'),f=elem('i');f.style.width=Math.max(0,100*e.hp/e.max)+'%';bar.append(f,elem('span',Math.max(0,e.hp)+' / '+e.max));VitalColors.apply(bar,e.hp,e.max);t.append(n,bar);t.disabled=b.busy||e.hp<=0;return t}));
    d.replaceChildren();function action(t,fn,disabled=false){const button=btn(t,fn);button.disabled=b.busy||disabled;d.append(button)}
    const back=()=>{deck='main';active=null;battleUI(b)};
    if(deck==='main'){action('普通攻擊',()=>{if(b.enemies.filter(e=>e.hp>0).length===1){target(b.enemies.findIndex(e=>e.hp>0));return}deck='target';battleUI(b)});action('技能',()=>{deck='skill';battleUI(b)});action(b.kind==='kraken'?'閃避':'防禦',()=>fire('guard'));action('道具',()=>{deck='item';battleUI(b)});action('撤退',()=>confirmAction('要退出這場戰鬥？',()=>{if(g.battle===b&&!b.busy)g.finishBattle(false)}));}
    else if(deck==='target'){d.append(elem('strong','選擇攻擊目標'));action('返回',back)}
    else if(deck==='skill'){for(const k of ['earth','water']){const a=Growth.spell(s,k),cd=Math.max(0,(b.runeCD?.[k]||0)-b.turn);action(a.name+' · '+(cd?'冷卻 '+cd:a.cost+' 精神'),()=>{active=k;deck='target';if(b.enemies.filter(e=>e.hp>0).length===1)target(b.enemies.findIndex(e=>e.hp>0));else battleUI(b)},S.mp<a.cost||cd>0)}action('穗光護佑',()=>fire('heal'),b.turn<b.healReadyTurn);action('返回',back)}
    else {action('止血藥草 ×'+S.herbs,()=>fire('herb'),!S.herbs||S.hp>=S.maxHp);action('清泉水囊 ×'+(s.items.ether||0),()=>fire('ether'),!s.items.ether||S.mp>=S.maxMp);action('返回',back)}
  }
  // Game renders targets and effects in the same horizontal coordinate system.
  by('battle-canvas').addEventListener('click',ev=>{const b=g.battle;if(!b||b.busy||!['main','target'].includes(deck))return;const rect=ev.target.getBoundingClientRect(),w=rect.width,h=by('targets').getBoundingClientRect().top-rect.top,y=ev.clientY-rect.top;if(y<h*.22||y>h)return;const x=(ev.clientX-rect.left)/w,i=window.SeaNewMaps?.enabled?Math.floor((x-.12)*b.enemies.length/.76):Math.round((x-.2)*(b.enemies.length+1)/.6)-1;if(i>=0&&i<b.enemies.length&&Math.abs(x-(window.SeaNewMaps?.enabled?(.12+(i+.5)*.76/b.enemies.length):(.2+(i+1)*.6/(b.enemies.length+1))))<Math.min(.12,.31/b.enemies.length))by('targets').children[i]?.click();});
  const stick=btn('',()=>{});stick.id='sea-stick';stick.setAttribute('aria-label','移動搖桿');const knob=elem('i');stick.append(knob);by('world').append(stick);let pointer=null;
  function move(e){if(e.pointerId!==pointer)return;const r=stick.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.38),y=(e.clientY-r.top-r.height/2)/(r.width*.38),len=Math.max(1,Math.hypot(x,y));knob.style.transform='translate('+x/len*24+'px,'+y/len*24+'px)';g.input(x/len,y/len)}
  function release(){pointer=null;knob.style.transform='';g.input(0,0)}
  stick.onpointerdown=e=>{if(pointer!==null||g.blocked())return;pointer=e.pointerId;stick.setPointerCapture(pointer);move(e)};stick.onpointermove=move;stick.onpointerup=stick.onpointercancel=stick.onlostpointercapture=release;window.addEventListener('blur',release);
  window.SeaControls={battleUI,resetBattle,craft,routes,tips,victory,viewModel};
})();
