(()=>{'use strict';
 const definitions={
  journey:{name:'探索配樂',note:'行走與探索地圖時的背景音樂',key:'erion-region-soundscape-v1',field:'music',value:.30},
  battle:{name:'戰鬥配樂',note:'進入戰鬥自動播放的音樂',key:'erion-r1-battle-music-v1',field:'volume',value:.28},
  ambience:{name:'環境聲',note:'流水、風聲與場景中的工作聲',key:'erion-region-soundscape-v1',field:'ambience',value:.55},
  effects:{name:'特效聲',note:'攻擊、技能、受擊、劇情及工坊效果聲',key:'erion-effects-output-v1',field:'volume',value:1}
 };
 const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch{return {}}};
 function preferences(id){const d=definitions[id],p=id==='battle'?window.BattleMusic?.preferences:id==='effects'?window.GameAudio?.effectsPreferences:window.RegionSoundscapeControls?.preferences;
  return {volume:d.value,...read(d.key),...p};}
 function level(id){const d=definitions[id],p=preferences(id);return p.muted||p.enabled===false?0:clamp(p[d.field]??d.value);}
 function set(id,value){const d=definitions[id],p={...read(d.key),[d.field]:clamp(value)};if(id==='effects'||id==='battle')p.muted=false;else p.enabled=true;
  try{localStorage.setItem(d.key,JSON.stringify(p));}catch{}
  if(id==='battle')window.BattleMusic?.setPreferences?.(p);
  else if(id==='effects')window.GameAudio?.setEffects(p);
  else window.RegionSoundscapeControls?.setPreferences(p);
  window.dispatchEvent(new CustomEvent('audiooptions:updated'));
 }
 const remembered=read('erion-audio-last-nonzero-v1');
 function mount(){if(document.getElementById('audio-options'))return;
  const dialog=document.createElement('dialog');dialog.id='audio-options';dialog.className='game-reference-dialog';dialog.setAttribute('aria-labelledby','audio-options-title');
  dialog.innerHTML='<header class="reference-head"><div><span class="reference-eyebrow">ERION · 聲音與氛圍</span><h2 id="audio-options-title">聲音設定</h2></div><button class="reference-close" aria-label="關閉聲音設定">×</button></header><p class="audio-intro">分別調整音樂與效果聲。設定即時生效，並自動保存。</p><div class="audio-channel-list"></div><p class="audio-footer">特效音量不會改變背景音樂。劇情配音保留過場介面的獨立音量控制。</p>';
  const close=dialog.querySelector('.reference-close');close.classList.add('panel-close-x');dialog.prepend(close);
  const list=dialog.querySelector('.audio-channel-list');
  for(const [id,d]of Object.entries(definitions)){
   const row=document.createElement('section');row.className='audio-channel';row.dataset.channel=id;
   row.innerHTML=`<div class="audio-channel-heading"><label for="audio-range-${id}">${d.name}</label><output for="audio-range-${id}"></output></div><p id="audio-note-${id}">${d.note}</p><div class="audio-range-row"><button type="button" class="audio-mute" aria-label="${d.name}靜音">開啟</button><input id="audio-range-${id}" type="range" min="0" max="100" step="1" aria-label="${d.name}音量" aria-describedby="audio-note-${id}"></div>`;
   row.querySelector('input').oninput=e=>{const v=+e.target.value/100;if(v>0){remembered[id]=v;try{localStorage.setItem('erion-audio-last-nonzero-v1',JSON.stringify(remembered));}catch{}}set(id,v);};
   row.querySelector('button').onclick=()=>{const v=level(id);if(v>0)remembered[id]=v;set(id,v>0?0:remembered[id]||d.value);try{localStorage.setItem('erion-audio-last-nonzero-v1',JSON.stringify(remembered));}catch{}};
   list.append(row);
  }
  function refresh(){for(const row of list.children){const value=Math.round(level(row.dataset.channel)*100),range=row.querySelector('input'),mute=row.querySelector('button');range.value=value;range.style.setProperty('--range-fill',value+'%');range.setAttribute('aria-valuetext',value+'%');row.querySelector('output').textContent=value+'%';mute.textContent=value?'開啟':'靜音';mute.setAttribute('aria-pressed',String(value===0));}}
  window.addEventListener('audiooptions:updated',refresh);window.addEventListener('storage',refresh);refresh();
  let opener;dialog.querySelector('.reference-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener?.isConnected&&opener.focus({preventScroll:true}));document.body.append(dialog);
  const launch=document.createElement('button');launch.id='audio-options-open';launch.textContent='聲音設定';launch.setAttribute('aria-haspopup','dialog');launch.setAttribute('aria-controls',dialog.id);launch.onclick=()=>{opener=launch;refresh();dialog.showModal();dialog.querySelector('input').focus();};
  (document.getElementById('journey-group-settings')||document.querySelector('.top nav')||document.body).append(launch);
  document.documentElement.classList.add('unified-audio-options');
 }
 window.SoundOptions={level,set,preferences};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
