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
  function viewModel(id){
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
 const entryInput=(function createBattleInputGate(clock,doc){
 let readyAt=0,epoch=0;
 const fingers=new Set();
 doc.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'){fingers.add(e.pointerId);if(fingers.size>1)epoch++;}
 },true);
 for(const kind of ['pointerup','pointercancel'])doc.addEventListener(kind,e=>fingers.delete(e.pointerId),true);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){fingers.clear();epoch++;}},true);
 return {
  open(){readyAt=clock()+450;epoch++;},
  bind(el,fn,canPress=()=>true){
   let press=null;
   el.addEventListener('pointerdown',e=>{
    press={id:e.pointerId,epoch,released:false,valid:e.button===0&&e.isPrimary!==false&&fingers.size<=1&&clock()>=readyAt&&canPress()};
   });
   el.addEventListener('pointerup',e=>{if(press?.id===e.pointerId)press.released=true;});
   el.addEventListener('pointercancel',()=>{press=null;});
   el.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&clock()<readyAt)e.preventDefault();});
   el.onclick=e=>{
    const pointer=!!e&&(e.detail>0||!!e.pointerType);
    if(el.disabled||clock()<readyAt||e?.detail>1||(pointer&&(!press?.valid||!press.released||press.epoch!==epoch))){
     press=null;e?.preventDefault();e?.stopPropagation();return;
    }
    press=null;fn(e);
   };
  }
 };
})(()=>performance.now(),document);
 function button(label,detail,fn,disabled=false){const el=document.createElement('button');const name=document.createElement('span');name.textContent=label;if(window.ItemIcons&&/^(止血藥草|清泉水囊)/.test(label))name.prepend(ItemIcons.node(label.startsWith('止血')?'herb':'ether'));el.append(name);if(detail){const s=document.createElement('small');s.textContent=detail;el.append(s);}el.disabled=disabled;entryInput.bind(el,fn);return el;}
  // Inserted inside SeaControls. Menus/button/input gate come from region-combat.js.
  const $=by,hooks={state:()=>s,divine:()=>s.flags.demeter&&s.flags.restored};let b=null;
  function say(text){by('battle-message').textContent=text;}
  function rune(kind=b.skill||'water'){return Growth.spell(s,kind);}
  function act(kind,e){if(!b||b.busy||b.loading||b.ended)return;if(e)b.target=e.index;if(kind==='rune')S.rune=b.skill||'water';g.battleAction(kind);}
  function resetBattle(){b=null;entryInput.open();}
  function canChooseTarget(){return b&&!b.busy&&!b.loading&&!b.ended;}
  function ui(){
   if(!b)return;
   by('commands').dataset.targeting=b.targeting||'';
   by('round').textContent='第 '+b.turn+' 回合';
   by('battle-hp').textContent='生命 '+S.hp+' / '+S.maxHp;
   by('battle-mp').textContent='精神 '+S.mp+' / '+S.maxMp;
   by('battle-hp').style.setProperty('--battle-health',100*S.hp/S.maxHp+'%');
   VitalColors.apply(by('battle-hp'),S.hp,S.maxHp);VitalColors.apply(by('battle-mp'),S.mp,S.maxMp,'mp');
   by('battle-cooldown').textContent=['water','earth'].filter(k=>s.flags[k]).map(k=>Growth.spell(s,k).name+'：'+(b.cooldowns[k]?'尚需 '+b.cooldowns[k]+' 次行動':'就緒')).join(' · ');
   if(hooks.divine())by('battle-cooldown').textContent+=' · 穗光護佑：'+(b.turn<(b.healReadyTurn||1)?'冷卻 '+(b.healReadyTurn-b.turn)+' 回合':'本回合結束時援助');
   const mark=b.turn%3===0&&b.phase!=='responding'?b.enemies.find(e=>e.hp>0)?.move:'';
   by('battle-alert').textContent=mark?'敵方蓄力 · '+mark:'';
   by('enemy-targets').replaceChildren();
   b.enemies.forEach(e=>{if(e.hp<=0)return;
    const el=button('Lv.'+(e.level||1)+' '+e.name+' '+(e.index+1),'生命 '+Math.max(0,e.hp)+' / '+e.max+(mark?' · '+e.move:''),()=>{if(canChooseTarget())act(b.targeting||'attack',e);},!canChooseTarget());
    el.className='enemy-button'+(b.targeting?' targeting':'');el.dataset.kind=e.id;
    el.style.left=100*(e.x??(.12+(e.index+.5)*.76/b.enemies.length))+'%';
    el.style.width=Math.min(210,innerWidth*.74/b.enemies.length)+'px';
    GameNameColors?.markMonster(el.querySelector('span'),{...e,kind:e.id});
    const bar=elem('span',null,'bar'),fill=elem('i');VitalColors.apply(bar,e.hp,e.max);fill.style.width=Math.max(0,e.hp/e.max*100)+'%';bar.append(fill);el.append(bar);by('enemy-targets').append(el);
   });
  }
   function spells(){const p=hooks.state();$('commands').replaceChildren();for(const kind of ['water','earth']){if(!p.flags[kind])continue;const r=rune(kind);$('commands').append(button(r.name,'傷害 '+r.damage+' · 精神 '+r.cost+' · '+(b.cooldowns[kind]?'冷卻 '+b.cooldowns[kind]+' 次行動':'就緒'),()=>{b.skill=kind;r.all?act('rune',null):target('rune');},p.mp<r.cost||b.cooldowns[kind]>0));}$('commands').append(button('返回','',menu));}
 function menu(){
  if(!b)return;b.busy=false;b.formation=null;b.targeting=null;window.BattlePresentation?.setGuard(false);ui();const p=hooks.state(),r=rune();const c=$('commands');c.replaceChildren();
  const attack=button('攻擊','礦工重鎚 · 傷害 '+p.attack,()=>target('attack'));attack.className='battle-basic-attack';
  c.append(attack,
   button('技能',p.flags.water||p.flags.earth?'':'尚未拓印',spells,!p.flags.water&&!p.flags.earth),
   button('防禦','傷害減半 · 精神 +4',()=>act('guard',null)),
   button('道具','',items),
   button(b.main?'撤回整備':'撤退',b.main?'本場進度保留待挑戰':'再次撤退必定成功',()=>act('flee',null)));
  $('command-hint').textContent='點敵人可直接攻擊';
 }
 function target(kind){b.targeting=kind;ui();$('commands').replaceChildren(button('取消選擇','',menu));$('command-hint').textContent='';say(kind==='attack'?'礦鎚指向哪一隻敵人？':rune().name+'：選擇目標');}
 function items(){const p=hooks.state();$('commands').replaceChildren(
  button('止血藥草 ×'+p.items.herb,'恢復 85 生命',()=>act('herb'),!p.items.herb||(p.hp>=(p.maxHp||240)&&!b.statuses.bleed&&!b.statuses.wound)),
  button('清泉水囊 ×'+p.items.ether,'恢復 14 精神',()=>act('ether'),!p.items.ether||p.mp>=p.maxMp),
  button('返回','',menu));const keys=Object.keys(window.Bestiary?.supplies||{}).filter(k=>p.items[k]>0);if(keys.length){$('commands').insertBefore(button('野外補給','持有 '+keys.length+' 種',()=>fieldPacks(0)), $('commands').lastChild);}
  $('command-hint').textContent='使用道具後，敵人仍會行動。';}
 function fieldPacks(page){const p=hooks.state(),keys=Object.keys(Bestiary.supplies).filter(k=>p.items[k]>0),c=$('commands');c.replaceChildren();for(const k of keys.slice(page*2,page*2+2)){const a=Bestiary.supplies[k],btn=button(a.name+' ×'+p.items[k],[a.hp?'生命 +'+a.hp:'',a.mp?'精神 +'+a.mp:''].filter(Boolean).join(' · '),()=>act(k),!Bestiary.canUseSupply(p,k));btn.querySelector('span').prepend(ItemIcons.node(k));c.append(btn);}if(page)c.append(button('上一頁','',()=>fieldPacks(page-1)));if((page+1)*2<keys.length)c.append(button('下一頁','',()=>fieldPacks(page+1)));c.append(button('返回','',items));}

  function battleUI(current){
   if(!current)return;
   if(b!==current)entryInput.open();b=current;b.statuses??={};b.cooldowns=Object.fromEntries(['water','earth'].map(k=>[k,Math.max(0,(b.runeCD?.[k]||0)-b.turn)]));
   if(b.ended)return;
   if(b.busy||b.loading){ui();by('commands').replaceChildren(button(b.loading?'怪物正在現身…':'行動中…','',()=>{},true));by('command-hint').textContent='';return;}
   menu();
  }
  function victory(xp,coins,rows,levelBefore=s.level){
   const gear=[],items={};for(const row of rows){if(typeof row.key==='object')gear.push(row.key);else items[row.key]=(items[row.key]||0)+row.count;}
   PrivateTest.itemInfo??={};PrivateTest.showBattleRewards({xp,coins,gear,items,levelBefore,level:s.level});
  }
  by('battle-field').addEventListener('click',ev=>{if(!canChooseTarget())return;const r=ev.target.getBoundingClientRect(),deck=document.querySelector('.command-deck').getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,y=ev.clientY-r.top;if(y<r.height*.17||ev.clientY>deck.top)return;const enemy=b.enemies.filter(e=>e.hp>0).find(e=>Math.abs(x-e.x)<Math.min(.18,.38/b.enemies.length));if(enemy)act(b.targeting||'attack',enemy);});
  const stick=btn('',()=>{});stick.id='sea-stick';stick.setAttribute('aria-label','移動搖桿');const knob=elem('i');stick.append(knob);by('world').append(stick);let pointer=null;
  function move(e){if(e.pointerId!==pointer)return;const r=stick.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.38),y=(e.clientY-r.top-r.height/2)/(r.width*.38),len=Math.max(1,Math.hypot(x,y));knob.style.transform='translate('+x/len*24+'px,'+y/len*24+'px)';g.input(x/len,y/len)}
  function release(){pointer=null;knob.style.transform='';g.input(0,0)}
  stick.onpointerdown=e=>{if(pointer!==null||g.blocked())return;pointer=e.pointerId;stick.setPointerCapture(pointer);move(e)};stick.onpointermove=move;stick.onpointerup=stick.onpointercancel=stick.onlostpointercapture=release;window.addEventListener('blur',release);
  window.SeaControls={battleUI,resetBattle,craft,routes,tips,victory,viewModel};
})();
