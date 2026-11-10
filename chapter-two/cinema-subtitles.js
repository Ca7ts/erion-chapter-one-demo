(()=>{'use strict';
 const dialog=document.querySelector('dialog#cinematic,dialog#story');
 const canvas=dialog?.querySelector('#scene-screen,#cinema')||document.getElementById('scene-review');
 const root=dialog||canvas?.closest('.screen'),host=document.getElementById(dialog?.id==='story'?'line':'story-text'),speaker=document.getElementById('speaker');
 if(!root||!canvas||!host)return;
 const isSea=host.id==='line',originalPanel=host.closest('.dialogue,.subtitle,.caption');
 root.classList.add(dialog?'film-dialog':'film-preview');host.classList.add('film-original-caption');
 (speaker?.parentElement)?.classList.add('film-original-meta');
 originalPanel?.querySelector('.voice-reading-notice')?.classList.add('film-original-notice');
 const overlay=document.createElement('div');overlay.className='film-caption';overlay.setAttribute('aria-hidden','true');
 const who=document.createElement('span'),lines=document.createElement('div');who.className='film-caption-speaker';lines.className='film-caption-lines';overlay.append(who,lines);root.append(overlay);
 const transcript=document.createElement('details'),summary=document.createElement('summary'),fullText=document.createElement('p');transcript.className='film-transcript';summary.textContent='查看完整台詞';transcript.append(summary,fullText);originalPanel?.append(transcript);
 if(dialog&&(isSea||window.PrivateTest)){
  root.classList.add('film-simple-controls');const top=root.querySelector('.story-top');if(top){top.inert=true;top.setAttribute('aria-hidden','true');}if(originalPanel){originalPanel.inert=true;originalPanel.setAttribute('aria-hidden','true');}
  const controls=document.createElement('nav');controls.className='film-story-actions';controls.setAttribute('aria-label','劇情操作');
  const next=document.createElement('button');next.type='button';next.textContent='下一幕';next.setAttribute('aria-label','下一幕，跳至下一段劇情');next.onclick=()=>isSea?window.SeaGame?.nextRow():document.getElementById('next-line')?.click();
  const skip=document.createElement('button');skip.type='button';skip.textContent='SKIP';skip.setAttribute('aria-label','SKIP，跳過本次劇情');skip.onclick=()=>isSea?window.SeaGame?.skip():window.PrivateTest?.game?.skipStory();
  controls.append(next,skip);root.append(controls);
 }else if(dialog){
  const toggle=document.createElement('button');toggle.type='button';toggle.className='film-controls-toggle';toggle.textContent='播放控制';toggle.setAttribute('aria-expanded','false');toggle.autofocus=true;
  const show=v=>{root.classList.toggle('film-controls-open',v);toggle.setAttribute('aria-expanded',String(v));toggle.textContent=v?'收起控制':'播放控制';};
  toggle.onclick=()=>show(!root.classList.contains('film-controls-open'));
  // A paused film must expose its resume control instead of looking frozen.
  if(!isSea)window.addEventListener('chaptervoice:paused',()=>{if(dialog.open&&!document.hidden)show(true);});
  root.addEventListener('focusin',e=>{if(e.target!==toggle&&(originalPanel?.contains(e.target)||e.target.closest('.cinematic-top,.story-top,.collection-toolbar')))show(true);});root.append(toggle);
 }
 const measure=document.createElement('canvas').getContext('2d');
 let text='',pages=[],glyphs=[],page=-1,offset=0,gold=false,font=26,captionWidth=800,sizeKey='',lineKey='',frame=0,stageOffset=0;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function sourceText(){return host.classList.contains('stage-caption')?host.textContent:(!isSea&&host.getAttribute('aria-label'))||host.textContent||'';}
 function layout(){
  const r=root.getBoundingClientRect(),c=canvas.getBoundingClientRect(),ratio=Math.min(c.width/canvas.width,c.height/canvas.height),w=canvas.width*ratio,h=canvas.height*ratio;
  const x=c.left-r.left+(c.width-w)/2,y=c.top-r.top+(c.height-h)/2;
  captionWidth=Math.min(1060,w*.84);font=clamp(w*.020,17,29);
  const bottom=y+h-Math.max(root.classList.contains('film-simple-controls')&&r.width>r.height?62:24,h*.065);
  overlay.style.setProperty('--film-left',(x+(w-captionWidth)/2)+'px');overlay.style.setProperty('--film-width',captionWidth+'px');overlay.style.setProperty('--film-bottom',bottom+'px');overlay.style.setProperty('--film-font',font+'px');
  const key=Math.round(captionWidth)+':'+font.toFixed(2);if(key!==sizeKey){sizeKey=key;pages=[];page=-1;}
 }
 function paginate(value){
  measure.font='600 '+font+'px "Noto Sans TC","Microsoft JhengHei",sans-serif';
  let position=0;const chars=Array.from(value,ch=>{const item={ch,from:position,to:position+ch.length,w:measure.measureText(ch).width};position=item.to;return item;}),rows=[];
  const limit=Math.max(font*8,captionWidth-font*2);let start=0;
  while(start<chars.length){let end=start,width=0,breakAt=-1;
   while(end<chars.length){const c=chars[end];if(c.ch==='\n'){end++;break;}if(width+c.w>limit&&end>start)break;width+=c.w;end++;if(/[，。！？；：、\s]/u.test(c.ch)&&width>limit*.56)breakAt=end;}
   if(end<chars.length&&chars[end-1]?.ch!=='\n'&&breakAt>start)end=breakAt;
   while(end<chars.length&&/[，。！？；：、」』）】〉》]/u.test(chars[end].ch))end++;
   if(end<=start)end=start+1;const row=chars.slice(start,end);rows.push(row);start=end;
  }
  pages=[];for(let i=0;i<rows.length;i+=2){const group=rows.slice(i,i+2);pages.push({rows:group,from:group[0][0].from,to:group.at(-1).at(-1).to});}
  page=-1;
 }
 function drawPage(index){
  page=index;glyphs=[];lines.replaceChildren();
  for(const row of pages[index].rows){const line=document.createElement('span');line.className='film-caption-line';for(const char of row){const node=document.createElement('span');node.className='film-glyph';node.textContent=char.ch==='\n'?'':char.ch;node.dataset.glyph=node.textContent;line.append(node);glyphs.push({...char,node,fill:-1});}lines.append(line);}
  overlay.dataset.page=String(index+1);overlay.dataset.pages=String(pages.length);
 }
 function update(){
  const value=sourceText(),meta=(speaker?.textContent||'')+'|'+(document.getElementById(isSea?'row-count':'line-number')?.textContent||document.getElementById('line-position')?.textContent||'');
  if(value!==text||meta!==lineKey){text=value;lineKey=meta;pages=[];page=-1;offset=0;gold=false;stageOffset=0;fullText.textContent=value;transcript.open=false;}
  overlay.hidden=!text.trim();if(overlay.hidden)return;
  const silent=host.classList.contains('stage-caption')||host.classList.contains('stage');
  overlay.classList.toggle('is-silent',silent);
  who.textContent=silent?'場景演出 · 無旁白':speaker?.textContent||'';
  if(isSea){const p=window.SeaVoice?.progress();gold=!silent&&p?.mode==='aligned';if(gold)offset=p.characters+(p.currentEnd!==undefined?(p.currentEnd-p.characters)*(p.fraction||0):0);else{const width=parseFloat(document.querySelector('#line-progress i')?.style.width)||0;offset=text.length*width/100;}}
  else if(silent){offset=stageOffset;gold=false;}
  else if(!gold){let n=0,found=0;for(const el of host.querySelectorAll('.voice-glyph')){const count=el.textContent.length,fill=parseFloat(el.style.getPropertyValue('--gold-fill'))||0;if(fill>0)found=n+count*fill/100;n+=count;}if(found>0&&!host.querySelector('.unvoiced-glyph')){offset=found;gold=true;}}
  if(!pages.length)paginate(text);if(!pages.length)return;
  const index=Math.max(0,pages.findIndex(p=>offset<p.to));const next=offset>=text.length?pages.length-1:index;
  if(page!==next)drawPage(next);
  for(const c of glyphs){const fill=gold?Math.round(clamp((offset-c.from)/(c.to-c.from),0,1)*100):0;if(fill!==c.fill){c.node.style.setProperty('--gold-fill',fill+'%');c.fill=fill;}}
 }
 window.addEventListener('chaptervoice:progress',e=>{if(isSea)return;const value=sourceText();if(value!==text){text=value;pages=[];page=-1;fullText.textContent=value;lineKey=(speaker?.textContent||'')+'|'+(document.getElementById('line-number')?.textContent||document.getElementById('line-position')?.textContent||'');}offset=e.detail.offset;gold=!e.detail.unvoiced;});
 window.addEventListener('chapterstage:progress',e=>{stageOffset=e.detail.offset;});
 const active=()=>!document.hidden&&(!dialog||dialog.open);
 function tick(){frame=0;if(!active())return;update();frame=requestAnimationFrame(tick);}
 function wake(){cancelAnimationFrame(frame);frame=0;if(active()){layout();update();frame=requestAnimationFrame(tick);}}
 const observer=new ResizeObserver(()=>{if(active()){layout();update();}});observer.observe(root);observer.observe(canvas);
 if(dialog)new MutationObserver(wake).observe(dialog,{attributes:true,attributeFilter:['open']});
 document.addEventListener('visibilitychange',wake);window.addEventListener('pageshow',wake);window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
 document.fonts?.ready.then(()=>{pages=[];sizeKey='';wake();});wake();
})();
