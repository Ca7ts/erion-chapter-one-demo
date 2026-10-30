(() => {
 'use strict';
 const host = document.createElement('section');
 host.id = 'download-gate'; host.setAttribute('aria-label', '準備第一章遊戲');
 host.innerHTML = `<div class="download-card"><small>ERION · CHAPTER I</small><h1>地脈初醒</h1><p>先備妥旅途，再踏入故事。</p><p id="download-description">正在核對遊戲資源…</p><progress id="download-progress" max="1" value="0"></progress><strong id="download-status" role="status" aria-live="polite">連接中</strong><p id="download-detail"></p><p id="download-eta">預估剩餘時間：下載開始後計算</p><button id="download-action" disabled>準備中</button><p class="download-note">已完成的檔案會保留，連線恢復後自動續傳。可暫停或關閉頁面，下次接續下載。清除網站資料會移除下載快取及存檔。</p><details id="download-errors" hidden><summary>查看未完成原因</summary><p id="download-error-detail"></p></details></div>`;
 document.body.append(host);
 const style = document.createElement('style');
 style.textContent = `#download-gate{position:fixed;inset:0;z-index:2147483646;background:radial-gradient(ellipse at 50% 20%,#203f39,#0b1416 70%);display:grid;place-items:center;color:#eee7d3;padding:24px;box-sizing:border-box;font:17px/1.7 system-ui,"Microsoft JhengHei",sans-serif;overflow:auto}#download-gate .download-card{max-width:620px;width:100%;text-align:center}#download-gate h1{font-size:44px;letter-spacing:.12em;margin:12px 0;color:#f0cc85}#download-gate small{letter-spacing:.2em;color:#c2a771}#download-gate progress{width:100%;height:14px;accent-color:#d8b36d;margin:20px 0}#download-gate strong{display:block;font-size:22px;font-variant-numeric:tabular-nums}#download-gate #download-action{appearance:none;background:#dfbd7c!important;color:#14221f!important;border:1px solid #f1d69f;border-radius:8px;padding:14px 36px;min-width:210px;min-height:56px;font:700 18px/1.5 system-ui,"Microsoft JhengHei",sans-serif;letter-spacing:.04em;text-shadow:none!important;filter:none!important;backdrop-filter:none!important;opacity:1!important;box-shadow:none!important;transform:none!important;animation:none!important;cursor:pointer;transition:background-color .15s}#download-gate #download-action:hover:not(:disabled){background:#f2d49a!important}#download-gate #download-action:focus-visible{outline:3px solid #fff0cd;outline-offset:4px}#download-gate #download-action:disabled{background:#9da99f!important;color:#14221f!important;cursor:wait}#download-gate #download-action::before,#download-gate #download-action::after{content:none!important;display:none!important}#download-gate .download-note,#download-detail{color:#b7c2b9;font-size:14px}#download-eta{color:#f0d59f;font-size:18px;font-variant-numeric:tabular-nums;min-height:31px;margin:10px 0 20px}#download-errors{font-size:13px;text-align:left;overflow-wrap:anywhere;white-space:pre-line}#download-gate[hidden],#download-errors[hidden]{display:none}@media(max-height:650px){#download-gate{padding:16px}#download-gate h1{font-size:32px;margin:4px 0}#download-gate p{margin:8px 0}#download-gate progress{margin:10px 0}}`;
 style.textContent += '@media(orientation:landscape) and (max-height:500px){#download-gate{padding:12px;font-size:14px;line-height:1.4;overflow:hidden}#download-gate .download-card{display:grid;grid-template-columns:1fr 1fr;gap:6px 22px;max-width:900px;align-items:center}#download-gate .download-card>*{grid-column:2;margin:0}#download-gate small{grid-column:1;grid-row:1}#download-gate h1{grid-column:1;grid-row:2;font-size:28px}#download-gate .download-card>p:first-of-type{grid-column:1;grid-row:3}#download-description{grid-column:1!important;grid-row:4}#download-gate .download-note{grid-column:1;grid-row:5;font-size:12px}#download-gate progress{grid-row:1;height:10px}#download-status{grid-row:2;font-size:18px!important}#download-detail{grid-row:3;font-size:12px}#download-eta{grid-row:4;font-size:14px;min-height:0}#download-gate #download-action{grid-row:5;min-height:44px;padding:8px;font-size:16px}#download-errors{grid-column:1/-1!important;grid-row:6;max-height:50px;overflow:auto}}';
 document.head.append(style);
 const $ = id => document.getElementById(id), action = $('download-action');
 const fmt = n => (n / 1048576).toFixed(1) + ' MB';
 const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
 let manifest, cache, busy = false, ready = false, paused = false, fatal = null;
 let finished = 0, total = 0, done = 0, queue = [], blocked = [], samples = [], transferred = 0, lastData = 0, ticker;
 const connections = 4;
 let connectionSpeed = 0, requestOverhead = 0, measuredRequests = 0;
 const active = new Map(), controllers = new Set(), wakes = new Set();
 const status = text => { $('download-status').textContent = text; };
 function wake() { for (const fn of [...wakes]) fn(); }
 function wait(ms) {
  return new Promise(resolve => {
   const finish = () => { clearTimeout(timer); wakes.delete(finish); resolve(); };
   const timer = setTimeout(finish, Math.max(1, ms)); wakes.add(finish);
  });
 }
 function duration(seconds) {
  seconds = Math.max(1, Math.ceil(seconds));
  if (seconds < 60) return `約 ${Math.ceil(seconds / 5) * 5} 秒`;
  const minutes = Math.ceil(seconds / 60);
  return minutes < 60 ? `約 ${minutes} 分鐘` : `約 ${Math.floor(minutes / 60)} 小時 ${minutes % 60} 分鐘`;
 }
 function update() {
  if (!manifest || ready) return;
  const now = performance.now();
  const bytes = Math.min(total, finished + [...active.values()].reduce((sum, entry) => sum + entry.bytes, 0));
  $('download-progress').value = Math.min(.999, bytes / total);
  status(`${Math.min(99, Math.floor(bytes / total * 100))}% · ${fmt(bytes)} / ${fmt(total)}`);
  let detail = `已備妥 ${done} / ${manifest.files.length} 個檔案`;
  let eta = '預估剩餘時間：下載開始後計算';
  if (busy) {
   samples.push({ time: now, bytes: transferred });
   while (samples.length > 1 && samples[1].time < now - 15000) samples.shift();
   const elapsed = (now - samples[0].time) / 1000;
   const speed = elapsed >= 2 ? (transferred - samples[0].bytes) / elapsed : 0;
   const retries = queue.filter(entry => entry.attempt > 0).length;
   const settling = active.size > 0 && [...active.values()].every(entry => entry.verifying);
   if (paused) eta = '正在暫停，已完成的檔案會保留';
   else if (navigator.onLine === false) eta = '連線已中斷，恢復後自動續傳';
   else if (!active.size && queue.length && queue.every(entry => entry.nextAt > Date.now())) {
    const seconds = Math.max(1, Math.ceil((Math.min(...queue.map(entry => entry.nextAt)) - Date.now()) / 1000));
    eta = `等待連線恢復 · ${seconds} 秒後自動重試`;
   } else if (settling && bytes === total) eta = '正在驗證並儲存最後的檔案…';
   else if (now - lastData > 12000) eta = '連線回應較慢，下載器會自動重試';
   else if (speed > 0) {
    // Voice clips are much smaller than scene art. Their request latency must
    // not be mistaken for the link's large-file bandwidth when predicting the
    // remaining artwork. Estimate both transfer time and per-file overhead.
    const remaining = manifest.files.length - done;
    const seconds = connectionSpeed > 0
     ? ((total - bytes) / connectionSpeed + remaining * requestOverhead) / Math.max(1, Math.min(connections, remaining))
     : (total - bytes) / speed;
    eta = `預估剩餘時間：${duration(seconds)}（依目前網速）`;
   }
   else eta = '預估剩餘時間：正在測量下載速度…';
   if (speed > 0) detail += ` · ${fmt(speed)}/秒`;
   if (retries) detail += ` · ${retries} 個檔案等待自動重試`;
   if (blocked.length) detail += ` · ${blocked.length} 個檔案尚無法取得`;
  } else if (paused) eta = '下載已暫停；按「繼續下載」接續';
  $('download-detail').textContent = detail; $('download-eta').textContent = eta;
 }
 async function check() {
  if (!('serviceWorker' in navigator) || !window.caches || !isSecureContext) throw Error('此瀏覽器無法保存遊戲資源。請使用新版 Chrome、Edge、Firefox 或 Safari。');
  for (let attempt = 0; attempt < 3; attempt++) {
   const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 20000);
   try {
    const response = await fetch('download-manifest.json', { cache: 'no-store', signal: ctl.signal });
    if (!response.ok) throw Error('下載清單暫時無法讀取');
    manifest = await response.json(); break;
   } catch (error) {
    if (attempt === 2) throw Error('下載清單暫時無法讀取，請確認連線後重試。');
    status('正在重新連接下載服務…'); await sleep(1000 * (attempt + 1));
   } finally { clearTimeout(timer); }
  }
  total = manifest.files.reduce((sum, file) => sum + file.bytes, 0);
  await navigator.serviceWorker.register('preload-sw.js'); await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise((resolve, reject) => {
   const changed = () => { clearTimeout(timer); resolve(); };
   const timer = setTimeout(() => { navigator.serviceWorker.removeEventListener('controllerchange', changed); reject(Error('快取服務尚未啟用，請重新整理頁面')); }, 15000);
   navigator.serviceWorker.addEventListener('controllerchange', changed, { once: true });
  });
  cache = await caches.open('erion-demo-resources-' + (manifest.cacheVersion || manifest.version));
  finished = 0; done = 0; queue = []; blocked = [];
  const existing = new Set((await cache.keys()).map(request => request.url));
  for (const file of manifest.files) {
   const url=new URL(file.path,location.href).href;
   let valid=existing.has(url);
   // Recheck narration and code, including updates within a compatible media
   // cache. Merely finding a URL does not establish that its version is right.
   if(valid && /\.(?:js|css|mp3|wav|ogg|m4a)$/i.test(file.path)){
    const saved=await cache.match(url);
    valid=!!saved&&saved.headers.get('X-Erion-SHA256')===file.sha256;
   }
   if (valid) { finished += file.bytes; done++; }
   else queue.push({ file, attempt: 0, nextAt: 0 });
  }
  $('download-description').textContent = `第一章包含高清場景與配音，共約 ${Math.ceil(total / 1048576)} MB。首次下載需要時間，之後會使用本機快取。`;
  if (!queue.length) { complete(); return; }
  update(); action.disabled = false; action.textContent = done ? '繼續下載' : '下載第一章';
 }
 function complete() {
  ready = true; $('download-progress').value = 1; status('遊戲資源已備妥');
  $('download-detail').textContent = `${manifest.files.length} 個檔案已完整下載 · 橫式介面更新 10/30-8`;
  $('download-eta').textContent = '下載完成，可開始遊玩'; action.disabled = false; action.textContent = '進入第一章';
  navigator.serviceWorker.controller?.postMessage({ type: 'activate-cache', name: 'erion-demo-resources-' + (manifest.cacheVersion || manifest.version) });
 }
 function retryAfter(response) {
  const value = response.headers.get('Retry-After'); if (!value) return 0;
  const delay = /^\d+$/.test(value) ? Number(value) * 1000 : Date.parse(value) - Date.now();
  return Number.isFinite(delay) ? Math.max(0, delay) : 0;
 }
 async function transfer(entry) {
  const { file } = entry, ctl = new AbortController(), activity = { bytes: 0, verifying: false };
  let timer, firstByte = 0, firstChunkBytes = 0;
  const began = performance.now();
  const arm = () => { clearTimeout(timer); timer = setTimeout(() => ctl.abort(), 60000); };
  active.set(file.path, activity); controllers.add(ctl);
  try {
   arm();
   const url = new URL(file.path, location.href);
   if (entry.integrityRetry) url.searchParams.set('verify', String(entry.attempt));
   const response = await fetch(url.href, { cache: 'no-store', headers: { 'X-Erion-Download': '1' }, signal: ctl.signal });
   if (!response.ok) {
    const error = Error(`伺服器回應 HTTP ${response.status}`);
    error.permanent = response.status >= 400 && response.status < 500 && ![408, 429].includes(response.status);
    error.retryAfter = retryAfter(response); throw error;
   }
   const reader = response.body.getReader(), parts = [];
   while (true) {
    const chunk = await reader.read(); if (chunk.done) break;
    if (!firstByte) { firstByte = performance.now(); firstChunkBytes = chunk.value.byteLength; }
    arm(); parts.push(chunk.value); activity.bytes += chunk.value.byteLength;
    transferred += chunk.value.byteLength; lastData = performance.now();
   }
   clearTimeout(timer);
   const bodyFinished = performance.now();
   if (activity.bytes !== file.bytes) { const error = Error('傳回的檔案長度不完整'); error.integrity = true; throw error; }
   activity.verifying = true;
   const blob = new Blob(parts, { type: response.headers.get('Content-Type') || 'application/octet-stream' });
   const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()))].map(n => n.toString(16).padStart(2, '0')).join('');
   if (hash !== file.sha256) { const error = Error('傳回的檔案版本未通過驗證'); error.integrity = true; throw error; }
   // Keep the asset cache version unchanged across loader-only updates.
   // Only complete, verified resources count as saved progress.
   await cache.put(new URL(file.path, location.href).href, new Response(blob, { headers: { 'Content-Type': blob.type, 'Content-Length': String(file.bytes), 'X-Erion-SHA256': hash } }));
   const ended = performance.now();
   const overhead = ((firstByte || bodyFinished) - began + ended - bodyFinished) / 1000;
   requestOverhead = measuredRequests++ ? requestOverhead * .85 + overhead * .15 : overhead;
   const bodySeconds = (bodyFinished - firstByte) / 1000;
   if (file.bytes >= 262144 && bodySeconds >= .02 && firstChunkBytes < file.bytes) {
    const rate = (file.bytes - firstChunkBytes) / bodySeconds;
    connectionSpeed = connectionSpeed ? connectionSpeed * .75 + rate * .25 : rate;
   }
   finished += file.bytes; done++;
  } finally { clearTimeout(timer); active.delete(file.path); controllers.delete(ctl); wake(); }
 }
 async function worker() {
  while (!paused && !fatal) {
   if (!queue.length) return;
   if (navigator.onLine === false) { await wait(1000); continue; }
   const index = queue.findIndex(entry => entry.nextAt <= Date.now());
   if (index < 0) { await wait(Math.min(1000, Math.max(1, Math.min(...queue.map(entry => entry.nextAt)) - Date.now()))); continue; }
   const entry = queue.splice(index, 1)[0];
   try { await transfer(entry); }
   catch (error) {
    if (paused || fatal || navigator.onLine === false) { entry.nextAt = 0; queue.push(entry); continue; }
    entry.attempt++; entry.error = error.name === 'AbortError' ? '連線超過一分鐘未回應' : error.message;
    if (error.name === 'QuotaExceededError') {
     fatal = error; queue.push(entry); for (const ctl of controllers) ctl.abort(); wake();
    } else if ((error.permanent && entry.attempt >= 2) || (error.integrity && entry.attempt >= 4)) blocked.push(entry);
    else {
     // Retry the failed file later, without stopping healthy downloads.
     const delay = Math.max(error.retryAfter || 0, Math.min(60000, 2000 * 2 ** Math.min(entry.attempt - 1, 5)));
     entry.nextAt = Date.now() + delay + Math.floor(Math.random() * 500);
     entry.integrityRetry = Boolean(error.integrity); queue.push(entry);
    }
    console.warn('Download retry', entry.file.path, entry.error, entry.attempt);
   }
  }
 }
 async function download() {
  if (busy) return;
  busy = true; paused = false; fatal = null;
  if (blocked.length) { queue.push(...blocked.map(entry => ({ file: entry.file, attempt: 0, nextAt: 0 }))); blocked = []; }
  $('download-errors').hidden = true; action.disabled = false; action.textContent = '暫停下載';
  transferred = 0; lastData = performance.now(); samples = [{ time: lastData, bytes: 0 }];
  ticker = setInterval(update, 250); update();
  try { await Promise.all(Array.from({ length: connections }, worker)); }
  finally { busy = false; clearInterval(ticker); }
  if (done === manifest.files.length) { complete(); return; }
  update(); action.disabled = false; action.textContent = '繼續下載';
  if (fatal) {
   status('瀏覽器儲存空間不足，下載已保留'); $('download-eta').textContent = '騰出儲存空間後可繼續下載';
   $('download-detail').textContent = `已備妥 ${done} / ${manifest.files.length} 個檔案。請使用一般視窗，並確認裝置有足夠空間。`;
  } else if (blocked.length && !paused) {
   status(`尚有 ${blocked.length} 個檔案無法取得，其餘已保存`); $('download-eta').textContent = '伺服器檔案或版本異常，請稍後重試';
   $('download-errors').hidden = false; $('download-error-detail').textContent = blocked.map(entry => `${entry.file.path}：${entry.error}`).join('\n');
  }
 }
 async function launch() {
  document.querySelector('link[href^="app.min.css"]').href = 'app.min.css?v=' + manifest.version;
  action.disabled = true; action.textContent = '正在開啟遊戲…';
  const script = document.createElement('script'); script.src = 'app.min.js?v=' + manifest.version;
  script.onload = () => {host.remove();window.dispatchEvent(new Event('erion:ready'));}; script.onerror = () => { status('遊戲程式未能啟動'); action.disabled = false; action.textContent = '重試開啟'; };
  document.body.append(script);
 }
 action.onclick = async () => {
  try {
   if (busy) { paused = true; action.disabled = true; action.textContent = '正在暫停…'; for (const ctl of controllers) ctl.abort(); wake(); update(); return; }
   action.disabled = true;
   if (ready) await launch(); else { if (!cache) await check(); if (ready) await launch(); else await download(); }
  } catch (error) { fail(error); }
 };
 window.addEventListener('offline', () => { if (busy) { for (const ctl of controllers) ctl.abort(); wake(); update(); } });
 window.addEventListener('online', () => { samples = [{ time: performance.now(), bytes: transferred }]; lastData = performance.now(); wake(); if (busy) update(); });
 function fail(error) { console.error('Resource preparation', error); status(error.message); action.disabled = false; action.textContent = '重試'; }
 check().catch(fail);
})();
