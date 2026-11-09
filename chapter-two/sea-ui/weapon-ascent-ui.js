(() => {
 'use strict';
 const A=WeaponAscent;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
 const btn=(name,fn)=>{const b=el('button',name);b.type='button';b.onclick=fn;return b;};
 const tier=item=>A.numeral(item.forgeTier??1);
 const colors={green:'綠',blue:'藍',purple:'紫',orange:'橘'};
 const weaponLabel=item=>[item.name,colors[item.rarity]+' · '+tier(item)+'階','攻擊 '+item.base.attack,...Loot.describe(item)].join('　');
 function mount(host,{state,save,isBusy=()=>false,back,tryGear,toolsBar}){
  let selected='',reviewToken='',receipt='',last=null;
  const shell=el('section',null,'ascent-page'),bench=LeonTemper.create(),head=el('header',null,'ascent-heading');
  head.append(el('h2','武器升階'));
  head.append(btn('預覽天鎚',MythicRites.smithPreview));
  const grid=el('div',null,'ascent-layout'),column=el('div',null,'ascent-inspector'),foot=el('footer',null,'ascent-foot');
  grid.append(bench.stage,column);shell.append(head,grid,foot);host.replaceChildren(shell);
  function details(title,...children){const d=el('details');d.append(el('summary',title),...children);return d;}
  function compare(before,after){
   const list=el('dl',null,'ascent-stats');
   for(const [key,to] of Object.entries(after)){const from=before[key]||0;
    list.append(el('dt',Loot.attributeMeta[key]?.label||key),el('dd',from!==to?from+' → '+to+'（+'+(to-from)+'）':String(to),from<to?'better':''));}
   return list;
  }
  function spareParts(page,item){
   const spares=state.loot.items.filter(i=>i.template===item.template&&A.supported(i)&&i.id!==item.id&&Loot.salvageYield(state,i));
   if(!spares.length)return;
   const details=el('details',null,'ascent-recycle');details.append(el('summary','回收同系列的備用鎚'));
   const label=el('label','選擇要分解的備用鎚','ascent-select'),choices=el('select');
   choices.add(new Option('請選擇',''));
   for(const spare of spares)choices.add(new Option(weaponLabel(spare),spare.id));
   label.append(choices);const result=el('p'),accept=btn('確認分解備用鎚',()=>{
    const spare=spares.find(i=>i.id===choices.value);
    if(isBusy()||!spare||!details.isConnected)return;
    const yielded=Loot.salvage(state,spare.id);
    if(yielded){save();last=null;receipt='已分解'+spare.name+'（'+colors[spare.rarity]+' · '+tier(spare)+'階），取回'+A.ingredients[item.template][0].name+' ×'+yielded.count+'。';}
    else receipt='這件裝備已無法分解。';
    render();
    if(yielded)LeonSalvageFX.play(host,spare,yielded);
   });
   choices.onchange=()=>{const spare=spares.find(i=>i.id===choices.value),parts=spare&&Loot.salvageYield(state,spare);
    accept.disabled=!parts;result.textContent=parts?'將消耗這把備用鎚和它的詞條（'+(Loot.describe(spare).join('、')||'無隨機詞條')+'），取回'+A.ingredients[item.template][0].name+' ×'+parts.count+'。':'';
   };
   accept.disabled=true;details.append(label,result,accept);page.append(details);
  }
  function render(){
   const page=el('section',null,'ascent-controls');column.replaceChildren(page);foot.replaceChildren();
   const dialog=host.closest('dialog');if(dialog)dialog.dataset.pendingAction=String(!!reviewToken);
   const gear=Loot.init(state).items.filter(A.supported);
   const label=el('label','選擇原鎚','ascent-select'),select=el('select');
   select.add(new Option('請選擇自己的武器',''));
   const optionLabel=i=>weaponLabel(i)+(state.loot.equipped.weapon===i.id?' · 已穿戴':'');
   for(const i of gear){const visible=i.id===selected&&last&&!last.stamped?{...i,forgeTier:last.from,base:last.before}:i;
    const o=new Option(optionLabel(visible),i.id);o.style.color=Loot.quality(i.rarity).color;select.add(o);}
   select.value=selected;select.disabled=!!reviewToken||!gear.length;
   select.onchange=()=>{bench.stop();selected=select.value;reviewToken='';last=null;receipt='';render();};label.append(select);page.append(label);
   const item=gear.find(i=>i.id===selected),p=item&&A.preview(state,item.id),recipe=item&&A.plans[item.template];
   bench.show(item,last?[]:p?.materials,reviewToken?'待天鎚落下':last?'銘紋覺醒':p?.error?'已達上限':'置入符文槽');
   if(!item){
    if(!gear.length)page.append(el('p','目前沒有可升階的鎚。','ascent-source'));
    for(const r of Object.values(A.plans))page.append(el('small',r.name+'　·　'+r.area+'／'+r.monster,'ascent-source'));
    if(!gear.length&&tryGear)page.append(btn('試用兩把鎚（獨立試玩）',tryGear));
   }else{
    const from=last?last.from:(item.forgeTier||1),to=last?last.to:p.next;
    page.append(el('strong',(last?(last.stamped?'已鍛成　':'鍛壓中　'):'')+A.numeral(from)+' 階'+(to?' → '+A.numeral(to)+' 階':''),'ascent-tier'));
    page.append(compare(last?last.before:item.base,last?last.after:p.after||item.base));
    const note=last?'已保留詞條':'保留的詞條';
    const terms=Loot.describe(item),line=el('div',null,'ascent-affixes');
    for(const t of terms)line.append(el('span',t));if(!terms.length)line.append(el('span','無隨機詞條'));
    page.append(el('small',note,'ascent-label'),line);
    if(last||!p.error){
     const costs=last?last.materials:p.materials,list=el('div',null,'ascent-costs');
     page.append(el('small',last?'本次用料':'升階用料','ascent-label'),list);
     for(const m of costs){const row=el('div',null,'ascent-cost'),n=el('strong',m.name);n.style.color=Loot.quality(m.tier).color;
      row.append(ItemIcons.node(m.key),n,el('span',last?'−'+m.cost:'持有 '+m.held+' ／ 需 '+m.cost,!last&&m.held<m.cost?'short':''));list.append(row);}
    }
    if(!last&&p.error)page.append(el('p',p.error,'ascent-lock'));
    else if(!p.error&&!p.unlocked&&!last)page.append(el('p',p.requirement,'ascent-lock'));
    if(reviewToken)page.append(el('small','確認後消耗上列材料。原鎚與穿戴狀態保留。'));
    if(!p.error){
     const actions=el('div',null,'ascent-actions');
     if(reviewToken)actions.append(btn('返回調整',()=>{reviewToken='';render();}));
     if(last&&!p.ready)actions.append(btn('查看下一階',()=>{bench.stop();last=null;receipt='';render();}));
     else{
      const next=btn(reviewToken?'確認升階':'檢視升階',()=>{
       if(isBusy()||!page.isConnected||!host.contains(page))return;
       if(!reviewToken){if(p.ready){bench.stop();last=null;receipt='';reviewToken=p.token;render();}return;}
       const snapshot={from:item.forgeTier||1,to:p.next,before:{...item.base},after:{...p.after},materials:p.materials};
       const result=A.commit(state,selected,reviewToken);reviewToken='';
       if(result.error){last=null;receipt=result.error;render();return;}
       save();last=snapshot;receipt=result.item.name+'已升至'+tier(result.item)+'階，原有詞條全數保留。';
       render();bench.temper(result.item,snapshot,()=>{
        snapshot.stamped=true;if(last!==snapshot||!shell.isConnected)return;
        column.querySelector('.ascent-tier').textContent='已鍛成　'+A.numeral(snapshot.from)+' 階 → '+A.numeral(snapshot.to)+' 階';
        const option=column.querySelector('.ascent-select select')?.selectedOptions[0];if(option)option.textContent=optionLabel(result.item);
        const msg=column.querySelector('.ascent-receipt');if(msg)msg.textContent=receipt;
       });
      });next.disabled=!p.ready;actions.append(next);
     }
     page.append(actions);
    }
    const traits=el('div',null,'ascent-lore');traits.append(el('p',recipe.technique));if(item.trait)traits.append(el('p',Loot.describeTrait(item)));
    for(const m of A.ingredients[item.template])traits.append(el('small',m.name+'　·　'+m.area+'／'+m.monster));
    foot.append(details('武器工法與素材來源',traits));
    const future=details('各階配方');
    for(let step=1;step<A.caps[item.rarity];step++){const row=el('p');row.append(el('b',A.numeral(step)+' → '+A.numeral(step+1)+'　'));
     for(const m of A.requirements(item.template,item.rarity,step)){const txt=el('span',m.name+' ×'+m.cost+'　');txt.style.color=Loot.quality(m.tier).color;row.append(txt);}future.append(row);}
    foot.append(future);
    if(!reviewToken&&!p.error)spareParts(foot,item);
   }
   if(receipt){const msg=el('p',last&&!last.stamped?'':receipt,'ascent-receipt');msg.setAttribute('role','status');page.append(msg);}
   const cleared=A.progress(state),limits=details('章節與品質上限',el('p',cleared?'已完成'+A.chapter(cleared)+' · 目前可鍛至'+A.numeral(1+cleared)+'階':'尚未完成第一章。'));
   for(const [key,color] of Object.entries(colors)){const cap=A.caps[key],row=el('p',color+'色　最多升 '+(cap-1)+' 次，最高'+A.numeral(cap)+'階（完成'+A.chapter(cap-1)+'）');row.style.color=Loot.quality(key).color;limits.append(row);}
   foot.append(limits);if(toolsBar)foot.append(toolsBar);
   if(!reviewToken){
    const nav=el('div',null,'ascent-nav');
    nav.append(btn('前往分解祭壇',()=>{if(isBusy())return;LeonAltar.fromAscent({state,save,isBusy,keepId:selected,initial:foot.querySelector('.ascent-recycle select')?.value||''},render);}));
    if(back)nav.append(btn('返回工坊',back));foot.append(nav);
   }
  }
  render();
 }
 const partName=k=>window.Bestiary?.materials?.[k]?.name||window.LeonCarry?.names?.[k]||window.REGION_ADVENTURE?.itemNames?.[k]||k;
 function materialBook(s){
  const d=el('details',null,'leon-material-book');d.append(el('summary','分解對照'));
  const seen=new Map(),add=i=>{const p=Loot.salvageResult(i);if(p)seen.set(JSON.stringify([i.name,p.key]),i);};
  for(const i of Loot.init(s).items)add(i);
  for(const [k,n] of Object.entries(s.bestiary?.kills||{}))if(n>0)
   for(const [slot,g] of Object.entries(Bestiary.gear[k]||{}))add({name:g.name,template:k,slot,rarity:'green'});
  for(const i of seen.values()){
   const row=el('div',null,'leon-material-line');row.append(el('b',i.name),el('span','→ '+partName(Loot.salvageResult(i).key)));
   const counts=el('small');
   for(const q of Loot.qualities){const txt=el('span',({white:'白',green:'綠',blue:'藍',purple:'紫',orange:'橘'})[q.id]+' ×'+Loot.salvageResult({...i,rarity:q.id}).count+'　');txt.style.color=q.color;counts.append(txt);}
   row.append(counts);d.append(row);
  }
  if(!seen.size)d.append(el('p','取得可分解裝備或擊敗對應怪物後，就會在這裡留下記錄。'));
  d.append(el('small','穿戴中的裝備須先卸下。劇情專屬裝備不能分解；分解不退還升階投入的工料。'));
  return d;
 }
 window.LeonAscent={mount,materialBook,partName,open(options){
  let d=document.getElementById('leon-ascent');
  if(!d){d=el('dialog');d.id='leon-ascent';d.setAttribute('aria-label','利昂的武器升階');document.body.append(d);}
  mount(d,{...options,back:()=>{d.close();options.back?.();}});if(!d.open)d.showModal();
 }};
})();
