/* Action color describes the control's meaning, never its position in a list.
   New controls can set data-ui-intent="confirm", "back" or "plain" at creation. */
(()=>{
 'use strict';
 const controls='button,input[type="submit"],input[type="button"],a[href],[role="button"]';
 const labelControls=controls+',summary,[role="tab"]';
 const nonLettering='svg,canvas,script,style,select,option,textarea,[aria-hidden="true"],[contenteditable],.sr-only,[role="progressbar"],.journey-icon-button';
 // Keep the actual text node, its accessible name and the layout of its control.
 // A coloured item/quest name can be inserted later by the game's text renderer.
 function engrave(control){
  if(control.closest(nonLettering)||control.matches('input'))return;
  const letters=document.createTreeWalker(control,NodeFilter.SHOW_TEXT);
  const pending=[];
  for(let node=letters.nextNode();node;node=letters.nextNode()){
   const parent=node.parentElement;
   if(parent.localName==='ui-ink'||parent.closest(nonLettering)||!/[\p{L}\p{N}]/u.test(node.data))continue;
   pending.push(node);
  }
  for(const node of pending){
   const ink=document.createElement('ui-ink');
   node.before(ink);
   ink.append(node);
  }
  // If a name was subsequently split into coloured spans, each run owns its
  // colour. Discard the old outer paint layer rather than painting it twice.
  for(const outer of control.querySelectorAll('ui-ink:has(ui-ink)')){
   for(const child of [...outer.childNodes]){
    if(child.nodeType!==Node.TEXT_NODE||!child.data.trim())continue;
    const ink=document.createElement('ui-ink');
    child.before(ink);ink.append(child);
   }
   outer.replaceWith(...outer.childNodes);
  }
 }
 const menuScope='dialog,[role="dialog"],#battle .command-deck,#battle #commands,#battle #battle-actions,#workbench,.mythic-panel';
 const illustrated='.journal-slot,.character-slot,.enemy-button,.sea-target,.rpg-portrait,.region-card,.journey-icon-button,.minimap-toggle,[data-item],[data-monster],.forge-species,.forge-recipe,.icon-button';
 function textMenu(b){
  if(!b.matches('button')||!b.closest(menuScope)||b.closest('#game-resume-overlay,#cinematic,#story,.sr-only')||b.matches(illustrated)||b.querySelector('svg,canvas,input,select'))return false;
  if(b.querySelector('img')&&!b.closest('.leon-stations,#commands,.shop-actions'))return false;
  return /[\p{L}\p{N}]/u.test(b.textContent.trim());
 }
 function isCloseKey(b){
  if(b.matches('button.close,.panel-close-x')||/^[×✕✖✗╳ＸX]$/u.test((b.textContent||b.value||'').trim()))return true;
  return b.matches('button[data-close]')&&Boolean(b.querySelector('svg,img'))&&/關閉|返回|跳過/.test(b.getAttribute('aria-label')||'');
 }
 function intent(b){
  if(b.dataset.uiIntent)return b.dataset.uiIntent;
  if(b.matches('#commit-fusion,#game-resume-overlay button,.mythic-primary'))return 'confirm';
  if(b.closest('.rite-previews')||b.matches('[role="tab"],[aria-expanded],[aria-pressed],.journal-slot,.character-slot,.enemy-button,.sea-target'))return 'plain';
  // A label may be followed by an item description or a price in a child node.
  const own=[...b.childNodes].filter(n=>n.nodeType===3||n.localName==='ui-ink').map(n=>n.textContent).join('').trim();
  const label=(b.getAttribute('aria-label')||own||b.value||b.textContent||'').trim();
  if(/^(跳過過場|SKIP|下一幕)/i.test(label))return 'plain';
  if(/^(確[認定]|同意|接受委託|記下委託|我明白了|答應幫忙|交給利昂製作|回應牠的心意|檢視(?:並確認)?合成|檢視(?:升階|分解)|購買|穿上這件|裝備這件)/.test(label)||/^(是|好)[，。！、\s]|^(是|好|繼續遊戲)$/.test(label))return 'confirm';
  if(/^(返回|取消|否定|拒絕|上一步|回上頁|暫別|暫不|先不|稍後再說|讓牠繼續休養|繼續目前操作|收起手記|回到探索|回到工坊|繼續探索)/.test(label)||/^關閉(?:目前面板|視窗|面板)?$|^(否|不)[，。！、\s]|^(否|不|不用|離開|撤退)$/.test(label))return 'back';
  return 'plain';
 }
 function mark(b){
  if(!b.matches(controls)){engrave(b);return;}
  const close=Boolean(isCloseKey(b));
  b.toggleAttribute('data-ui-close',close);
  const role=close?'plain':intent(b);
  if(role==='plain'){if(b.hasAttribute('data-ui-gem'))b.removeAttribute('data-ui-gem');}
  else if(b.dataset.uiGem!==role)b.dataset.uiGem=role;
  const stone=!close&&role==='plain'&&textMenu(b);
  b.toggleAttribute('data-ui-stone',stone);
  const face=b.querySelector(':scope > [data-stone-face]');
  const base=b.querySelector(':scope > [data-stone-base]');
  if(stone&&!base){
   const foot=document.createElement('i');
   foot.setAttribute('data-stone-base','');
   foot.setAttribute('aria-hidden','true');
   b.append(foot);
  }else if(!stone&&base)base.remove();
  if(stone&&!face){
   const art=document.createElement('i');art.setAttribute('data-stone-face','');art.setAttribute('aria-hidden','true');
   for(let i=0;i<3;i++)art.append(document.createElement('i'));
   b.append(art);
  }else if(!stone&&face)face.remove();
  engrave(b);
 }
 function scan(node){
  if(node.nodeType!==1)return;
  if(node.matches(labelControls))mark(node);
  if(node.childElementCount)node.querySelectorAll(labelControls).forEach(mark);
 }
 function start(){
  scan(document.body);
  let heldButton=null,heldPointer=null;
  function release(){
   heldButton?.removeAttribute('data-stone-held');
   heldButton=null;
   heldPointer=null;
  }
  function strike(event){
   if(event.type==='keydown'&&(event.repeat||!['Enter',' '].includes(event.key)))return;
   if(event.type==='pointerdown'&&(!event.isPrimary||event.button!==0))return;
   const b=event.target.closest?.('[data-ui-stone]:not(:disabled)');
   if(!b)return;
   release();
   heldButton=b;
   heldPointer=event.pointerId??null;
   b.setAttribute('data-stone-held','');
   if(!matchMedia('(prefers-reduced-motion:reduce)').matches)b.setAttribute('data-stone-strike','');
  }
  document.addEventListener('pointerdown',strike,true);
  document.addEventListener('keydown',strike,true);
  function endPointer(event){if(event.pointerId===heldPointer)release();}
  window.addEventListener('pointerup',endPointer,true);
  window.addEventListener('pointercancel',endPointer,true);
  document.addEventListener('keyup',event=>{if(heldPointer===null&&['Enter',' '].includes(event.key))release();},true);
  document.addEventListener('focusout',event=>{if(event.target===heldButton)release();},true);
  window.addEventListener('blur',release);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
  document.addEventListener('animationend',e=>{if(e.animationName==='menu-rift')e.target.removeAttribute('data-stone-strike');});
  new MutationObserver(records=>{
   const changed=new Set();
   for(const r of records){
    const el=r.target.nodeType===1?r.target:r.target.parentElement;
    const owner=el?.closest(labelControls);if(owner?.isConnected)changed.add(owner);
    if(r.type==='childList')for(const n of r.addedNodes)scan(n);
   }
   changed.forEach(mark);
  }).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','data-ui-intent','value','data-close']});
 }
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
