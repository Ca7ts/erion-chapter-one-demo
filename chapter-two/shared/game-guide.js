(()=>{'use strict';
 const html=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rule=window.CombatStatusRules.effects;
 const tag=(text,tone='gold')=>`<strong class="guide-key guide-${tone}">${html(text)}</strong>`;
 const cards=()=>[
 ['start','探索與任務','先看任務指引，再走近目標。',`
  <ol><li>查看上方${tag('任務指引')}，確認當前主線與可接支線。</li><li>滑鼠點地、長按移動，或使用方向鍵／WASD；手機可使用虛擬搖桿。黃色腳印表示預覽路徑。</li><li>走近人物或任務物件，再點選互動。水面、懸崖及實體障礙不能直接穿越；橋面與樓梯沿入口通行。</li><li>完成現場目標後，再與相關人物交談或前往下一處地區。</li></ol>
  <p>${tag('金色：主線')}　${tag('水藍：支線','blue')}　${tag('灰色：進行中','muted')}。圖示與文字一起提示狀態；任務有先後條件，不能只靠換地圖跳過。</p>
  <p>遊戲會自動保存進度。使用同一裝置、同一瀏覽器與同一試玩網址繼續；本地與 GitHub 是不同存檔位置。清除網站資料會清除該站存檔。</p>`],
 ['combat','戰鬥與反制','讀取敵人的蓄力提示，選擇下一步。',`
  <dl><dt>攻擊</dt><dd>選定存活敵人，以目前攻擊力進行普通攻擊；點擊敵人可直接選擇攻擊。</dd><dt>技能</dt><dd>消耗精神並進入冷卻。技能未解鎖、精神不足或仍在冷卻時不能施放。</dd><dt>防禦</dt><dd>${tag('所受傷害減半','blue')}，${tag('精神 +4','blue')}；適合應對蓄力攻擊。主動防禦可阻止守像與母蟲這次攻擊附加的異常。</dd><dt>道具</dt><dd>止血藥草恢復 85 生命，並清除全部流血與裂傷。道具會消耗數量與本次行動。</dd><dt>撤退／撤回整備</dt><dd>撤退不領取勝利獎勵。主線敵人仍需擊敗；落敗不會當作通關。</dd></dl>
  <p>看到${tag('蓄力','red')}時，依怪物的戰況敘述與技能選擇反制。水流適合沖散特定霧塵與能量；重擊適合破壞特定護甲與接點。成功條件依敵人而異，可在怪物圖鑑查看。</p>
  <p>頭目擊敗後以地圖上的倒數計時為準，${tag('2 小時')}後可再次挑戰。</p>`],
 ['skills','技能與輔助符文','傷害以目前攻擊力、裝備與輔助符文計算。',`
  <div class="guide-pair"><section><h3 class="guide-blue">漩流迴擊</h3><p>基礎消耗 ${tag('7 精神','blue')}；基礎冷卻 ${tag('2 次行動','blue')}。傷害基準為攻擊力的 120%，可對多個目標造成傷害，基礎目標數為 3。</p></section><section><h3 class="guide-red">裂岩重擊</h3><p>基礎消耗 ${tag('5 精神','blue')}；基礎冷卻 ${tag('1 次行動','blue')}。單體傷害基準為攻擊力的 210%，計算傷害時僅計入目標一半護甲。</p></section></div>
  <p>技能傷害加成、輔助符文與武器特技會再改變結果。${tag('戰鬥技能按鈕')}會顯示目前實際傷害、精神消耗與剩餘冷卻。</p>
  <dl><dt>迅擊</dt><dd>技能倍率 ×0.85，冷卻減少 1 次行動，最低為 0。</dd><dt>重擊</dt><dd>技能倍率 ×1.25，冷卻增加 1 次行動。</dd><dt>分擊</dt><dd>技能倍率 ×0.85，目標數增加 1。</dd><dt>護身</dt><dd>技能倍率 ×0.9，搭配技能的防護機制。</dd></dl><p>符文需先取得；以目前已解鎖的選項為準。</p>`],
 ['status','異常狀態與流血','裂甲影響命中傷害；流血增減益影響每回合扣血。',`
  <div class="guide-rule"><h3 class="guide-red">裂甲 → 命中傷害提高 → 新流血加重</h3><p>${tag('裂甲','red')}降低 ${tag(Math.round(rule.fracture.defenseReduction*100)+'% 防禦','red')}，持續 ${rule.fracture.rounds} 回合。再次附加只刷新時間，不把防禦反覆乘低。</p></div>
  <p>${tag('流血','red')}每層記錄觸發當次「扣除防禦與實際減傷後」命中傷害的 ${tag(rule.bleed.hitRate*100+'%','red')}，最多 ${tag(rule.bleed.maxStacks+' 層','red')}。每層獨立持續 ${rule.bleed.rounds} 回合，從下一回合結束開始扣血；新增第四層替換最早到期的一層。</p>
  <p>每次流血結算會套用當時有效的${tag('流血傷害加成','red')}與${tag('受到流血傷害增減','blue')}。同類百分比先相加，來源端與承受端再相乘。只套用一次，不再扣除防禦，也不因最大生命改變而變動。</p>
  <div class="guide-example"><h3>算例 · 攻擊 100，防禦 40</h3><p>一般命中：100 − 40 = 60 → 每層流血 15。</p><p>裂甲生效後：防禦變成 28 → 後續命中 72 → 新流血每層 18。</p><p>若來源「流血傷害 +20%」，承受方「流血傷害 −25%」：18 × 1.2 × 0.75 = 16.2。各有效層合計後四捨五入扣血。增減益結束後恢復原值。</p></div>
  <p>既有流血保留原本命中基數；裂甲不會把舊傷害再次放大。止血藥草可一次清除全部流血層數。</p>
  <dl><dt>裂傷</dt><dd>普通攻擊或施放攻擊刻印時失去 4 生命，持續 2 回合；止血藥草可清除。</dd><dt>中毒</dt><dd>每回合失去 3 生命，持續 3 回合。</dd></dl>`],
 ['equipment','裝備、品質與詞條','品質決定詞條數，數值與特性決定是否適合你。',`
  <div class="guide-rarities">${(window.Loot?.qualities||[]).map(q=>`<span style="--quality:${q.color}"><b>${html(q.name)}</b><small>${q.count} 條隨機詞條</small></span>`).join('')}</div>
  <p>共有 ${tag('武器、頭盔、衣裝、護手、鞋靴、項鍊、戒指、腰帶、披風')}九個部位。裝備等級不能高於人物等級；已穿戴物品會在介面中標示。</p>
  <p>裝備屬性包含基礎能力、隨機詞條與怪物專屬特性。比較時一起看攻擊、防禦、生命、精神、暴擊及技能傷害；${tag('同品質也可能有不同數值')}。</p>
  <p>切換裝備會維持目前生命與精神的比例，不會藉換裝補滿。連點人物面板的裝備欄可卸下，單點後可查看與更換。</p>
  <p>武器與裝備依品質分組，同品質依數值排序。怪物圖鑑從普通到較高稀有度排列；掉落來源與取得條件在物品圖鑑查詢。</p>`],
 ['forge','工坊製作與強化','製作、合成、升階、分解是不同機制。',`
  <dl><dt>修整礦工重鎚</dt><dd>主線交付礦石 6 個與蟲殼 2 個，依任務流程領回修整重鎚。</dd><dt>怪物素材製作</dt><dd>擊敗對應怪物後查看利昂工坊配方。先確認部位、用料與成品；只有符合條件並確認時才扣除材料。</dd><dt>專屬圖樣</dt><dd>部分怪物掉落特殊憑證，交給利昂解鎖對應裝備圖樣。圖樣、怪物掉落裝備與一般合成不是同一種來源。</dd><dt>合成</dt><dd>依工坊當前配方選擇裝備，核對成功率、消耗與失敗結果後再確認。隨機詞條不等於怪物固有特性，不要只憑顏色判斷成品。</dd><dt>武器升階</dt><dd>目前適用虹拳破殼鎚與逆紋螺鎚。白色不能升階；綠／藍／紫／橙品質的上限依序為 Ⅱ／Ⅲ／Ⅳ／Ⅴ 階。每一階需對應章節通關與指定材料；符合條件後確認升階，增加該武器固定基礎能力。</dd><dt>分解</dt><dd>先卸下裝備，再查看能取回的材料。劇情鎖定裝備與參考物不能分解；分解消耗原裝備，不會退回完整製作成本。</dd></dl>
  <p class="guide-warning">確認前請看清${tag('會消耗的物品','red')}與${tag('實際取得的成品','green')}；配方面板會顯示你目前持有的數量與不足條件。</p>`],
 ['growth','經驗、掉落與補給','人物能力、物品與貨幣共同構成旅程成長。',`
  <p>完成主線、支線及戰鬥取得經驗；已領取的同一事件獎勵不會因重播劇情重複發放。人物面板顯示累積經驗與下一級需求。</p>
  <p>升級提高基礎生命、精神與攻擊。裝備能力另行加算；到達目前章節等級上限後，累積經驗仍會保存。</p>
  <p>每隻敵人的掉落各自判定，勝利結算顯示實際經驗、${tag(window.Economy?.currency||'德拉克馬')}、材料與裝備。召喚出的單位不等同一般野外怪物的掉落。</p>
  <p>多莉的藥草鋪可購買補給、以藥草製作止血藥草。回程道具與旅程通行功能依物品條件使用；先看物品說明與數量。</p>`],
 ['audio','聲音與顯示設定','背景音樂與特效分開調整。',`
  <p>在${tag('旅程工具 → 聲音設定')}調整探索配樂、戰鬥配樂、環境聲與特效音量；百分比會即時顯示，設定自動保存。</p>
  <p>${tag('特效音量','blue')}控制攻擊、技能、受擊、劇情與工坊的效果聲。調低或關閉特效，不會連帶改變背景音樂。</p>
  <p>戰鬥配樂隨進入戰鬥自動播放。手機瀏覽器需先有一次點擊互動才能播放聲音；切到背景時暫停，回來可選擇繼續遊戲。</p>
  <p>劇情配音保留獨立開關與音量。降低動態可減少晃動與部分裝飾動畫，操作及戰鬥判定不變。</p>`]
 ];
 function mount(){
  if(document.getElementById('game-guide'))return;
  const dialog=document.createElement('dialog');dialog.id='game-guide';dialog.className='game-reference-dialog';dialog.setAttribute('aria-labelledby','game-guide-title');
  dialog.innerHTML='<header class="reference-head"><div><span class="reference-eyebrow">ERION · 旅人手冊</span><h2 id="game-guide-title">遊戲說明</h2></div><button class="reference-close" aria-label="關閉遊戲說明">×</button></header><div class="reference-search"><label for="guide-search">搜尋機制</label><input id="guide-search" type="search" placeholder="例如：流血、強化、精神" autocomplete="off"></div><div class="reference-layout"><nav class="reference-topics" aria-label="說明分類"></nav><div class="reference-content" tabindex="0"><p class="guide-empty" hidden role="status">找不到符合的說明，請換個關鍵字。</p></div></div>';
  const close=dialog.querySelector('.reference-close');close.classList.add('panel-close-x');dialog.prepend(close);
  const nav=dialog.querySelector('nav'),body=dialog.querySelector('.reference-content');let selected='all';const sections=[];
  const all=document.createElement('button');all.textContent='全部說明';all.dataset.topic='all';nav.append(all);
  for(const [id,title,lead,copy]of cards()){
   const b=document.createElement('button');b.textContent=title;b.dataset.topic=id;nav.append(b);
   const section=document.createElement('section');section.className='guide-section';section.dataset.topic=id;section.innerHTML=`<h2>${html(title)}</h2><p class="guide-lead">${html(lead)}</p>${copy}`;body.append(section);sections.push(section);
  }
  const filter=()=>{const q=dialog.querySelector('input').value.trim().toLocaleLowerCase();let count=0;for(const s of sections){s.hidden=!(q?s.textContent.toLocaleLowerCase().includes(q):selected==='all'||s.dataset.topic===selected);if(!s.hidden)count++;}body.querySelector('.guide-empty').hidden=!!count;for(const b of nav.children)b.setAttribute('aria-pressed',String(!q&&b.dataset.topic===selected));};
  nav.onclick=e=>{const b=e.target.closest('[data-topic]');if(!b)return;selected=b.dataset.topic;dialog.querySelector('input').value='';filter();body.scrollTop=0;};dialog.querySelector('input').oninput=filter;filter();
  let opener;
  dialog.querySelector('.reference-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener?.isConnected&&opener.focus({preventScroll:true}));document.body.append(dialog);
  const open=e=>{opener=e?.currentTarget;const g=(window.PrivateTest||window.ChapterRuntime)?.game;g?.hooks?.stop?.();dialog.showModal();dialog.querySelector('input').focus();};
  const launch=document.createElement('button');launch.id='game-guide-open';launch.textContent='遊戲說明';launch.setAttribute('aria-haspopup','dialog');launch.setAttribute('aria-controls',dialog.id);launch.onclick=open;
  (document.getElementById('journey-group-journey')||document.querySelector('.top nav')||document.body).append(launch);
  window.GameGuide={open};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
