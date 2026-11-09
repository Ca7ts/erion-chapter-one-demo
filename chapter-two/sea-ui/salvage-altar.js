(() => {
 'use strict';
 const el=(tag,cls='',text='')=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
 const image=(value)=>ItemIcons.node(value);
 function mount(host,{state:s,save,isBusy=()=>false,back,guide,keepId='',initial=''}){
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)window.LeonRift?.warm();
  host.replaceChildren();
  const root=el('section','salvage-altar leon-salvage'),header=el('header','altar-title'),title=el('h2','','分解祭壇');
  header.append(title);
  const body=el('div','altar-body'),scene=el('div','salvage-view'),plate=el('div','altar-environment'),
   object=el('div','altar-offering'),caption=el('div','altar-caption');
  scene.append(plate,object,caption);
  const panel=el('section','altar-panel'),label=el('label','altar-field'),sel=el('select');
  label.append(el('span','','選擇備用裝備'),sel);sel.setAttribute('aria-label','要拆解的裝備');
  const terms=el('details','altar-terms'),summary=el('summary','','裝備屬性'),lines=el('div');terms.append(summary,lines);
  const returns=el('div','altar-gain'),warning=el('p','altar-warning'),receipt=el('p','leon-receipt altar-receipt');
  receipt.setAttribute('role','status');const button=el('button','altar-confirm','確認分解');button.type='button';
  panel.append(label,terms,returns,warning,button,receipt);
  const foot=el('footer','altar-foot');foot.append(LeonAscent.materialBook(s));
  if(guide){const a=el('a','','完整分解對照表');a.href=guide;a.target='_blank';a.rel='noopener';foot.append(a);}
  if(back){const leave=el('button','altar-back','返回工坊');leave.type='button';leave.onclick=back;foot.append(leave);}
  body.append(scene,panel);root.append(header,body,foot);host.append(root);
  const dialog=host.closest('dialog');let current=null,last=null;
  function selectOptions(){
   const gears=Loot.init(s).items.filter(i=>i.id!==keepId&&Loot.salvageYield(s,i));sel.replaceChildren(new Option(gears.length?'請選擇裝備':'沒有可分解的備用裝備',''));
   const options=gears.map(i=>{const label=[i.name,Loot.slots[i.slot].label,'Lv.'+i.level,...Loot.describe(i)].join('　');
    const o=new Option(label,i.id);o.style.color=Loot.quality(i.rarity).color;return o;});sel.append(...options);sel.disabled=!gears.length;
  }
  function preview(){
   current=s.loot.items.find(i=>i.id===sel.value);const p=current&&Loot.salvageYield(s,current);
   const mat=p&&LeonAscent.partName(p.key);if(dialog)dialog.dataset.pendingAction=String(!!p);
   button.disabled=!p;terms.hidden=!p;returns.hidden=!p&&!last;returns.replaceChildren();object.replaceChildren();lines.replaceChildren();
   if(p){
    object.append(image(current));object.style.setProperty('--gear-color',Loot.quality(current.rarity).color);caption.textContent=current.name;
    for(const t of [...Loot.describe(current),Loot.describeTrait(current)].filter(Boolean))lines.append(el('p','',t));if(!lines.childElementCount)terms.hidden=true;
    returns.append(image(p.key),el('div','',mat+' ×'+p.count),el('small','','預計取回'));
    warning.textContent='分解會消耗這件裝備及其詞條。';
   }else{
    if(last){object.append(image(last.key));caption.textContent=LeonAscent.partName(last.key)+' ×'+last.count;}
    else caption.textContent='';
    if(last)returns.append(image(last.key),el('div','',LeonAscent.partName(last.key)+' ×'+last.count),el('small','','已收入行囊'));
    warning.textContent=last?'':'已穿戴與劇情專屬裝備無法分解。';
   }
  }
  sel.onchange=()=>{last=null;receipt.textContent='';window.LeonSalvageFX.stop();preview();};
  button.onclick=()=>{
   if(!root.isConnected||!current||isBusy()||button.disabled)return;
   const gear=current,gain=Loot.salvage(s,gear.id);
   if(!gain){last=null;selectOptions();preview();receipt.textContent='這件裝備目前無法分解。';return;}
   button.disabled=true;save();last=gain;selectOptions();preview();
   receipt.textContent='已分解'+gear.name+'，取得'+LeonAscent.partName(gain.key)+' ×'+gain.count+'。';
   LeonSalvageFX.play(scene,gear,gain);
  };
  selectOptions();if(initial)sel.value=initial;preview();
 }
 function fromAscent(opts,onReturn){
  const d=el('dialog');d.id='ascent-salvage';d.setAttribute('aria-label','利昂的分解祭壇');document.body.append(d);
  d.addEventListener('close',()=>{d.remove();onReturn();},{once:true});
  mount(d,{...opts,back:()=>d.close()});d.showModal();
 }
 window.LeonAltar={mount,fromAscent};
})();
