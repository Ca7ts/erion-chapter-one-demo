(()=>{'use strict';
 const host=document.createElement('section');host.id='download-gate';host.setAttribute('aria-label','準備第一章遊戲');
 host.innerHTML=`<div class="download-card"><small>ERION · CHAPTER I</small><h1>地脈初醒</h1><p>先備妥旅途，再踏入故事。</p><p id="download-description">正在核對遊戲資源…</p><progress id="download-progress" max="1" value="0"></progress><strong id="download-status" role="status" aria-live="polite">連接中</strong><p id="download-detail"></p><button id="download-action" disabled>準備中</button><p class="download-note">下載完成後才會開啟遊戲。已下載的素材會留在這個瀏覽器，關閉後可繼續下載；清除網站資料可能會移除快取及存檔。</p></div>`;
 document.body.append(host);
 const style=document.createElement('style');style.textContent=`#download-gate{position:fixed;inset:0;z-index:2147483646;background:radial-gradient(ellipse at 50% 20%,#203f39,#0b1416 70%);display:grid;place-items:center;color:#eee7d3;padding:24px;box-sizing:border-box;font:17px/1.7 system-ui}#download-gate .download-card{max-width:620px;width:100%;text-align:center}#download-gate h1{font-size:44px;letter-spacing:.12em;margin:12px 0;color:#f0cc85}#download-gate small{letter-spacing:.2em;color:#c2a771}#download-gate progress{width:100%;height:14px;accent-color:#d8b36d;margin:20px 0}#download-gate strong{display:block;font-size:22px}#download-gate button{background:#cba766;color:#15201e;border:0;border-radius:8px;padding:14px 36px;font-size:18px;cursor:pointer}#download-gate button:disabled{opacity:.5;cursor:wait}#download-gate .download-note,#download-detail{color:#b7c2b9;font-size:14px}#download-gate[hidden]{display:none}`;document.head.append(style);
 const $=id=>document.getElementById(id),action=$('download-action');let manifest,cache,reg,busy=false,ready=false,finished=0,total=0,done=0,queue=[],started=0,networkBytes=0;
 const fmt=n=>(n/1048576).toFixed(1)+' MB';
 function status(text){$('download-status').textContent=text;}
 function progress(extra=0){const bytes=finished+extra;$('download-progress').value=Math.min(.999,bytes/total);status(`${Math.floor(bytes/total*100)}% · ${fmt(bytes)} / ${fmt(total)}`);const secs=(performance.now()-started)/1000;const speed=secs>2?networkBytes/secs:0;$('download-detail').textContent=`已備妥 ${done} / ${manifest.files.length} 個檔案`+(speed>0?` · ${fmt(speed)}/秒`:'');}
 async function check(){
  if(!('serviceWorker'in navigator)||!window.caches||!isSecureContext)throw Error('此瀏覽器無法保存離線資源。請使用新版 Chrome、Edge、Firefox 或 Safari。');
  const response=await fetch('download-manifest.json',{cache:'no-store'});if(!response.ok)throw Error('下載清單暫時無法讀取');manifest=await response.json();total=manifest.files.reduce((s,f)=>s+f.bytes,0);
  reg=await navigator.serviceWorker.register('preload-sw.js');await navigator.serviceWorker.ready;
  if(!navigator.serviceWorker.controller)await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('快取服務尚未啟用，請重新整理頁面')),15000);navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(timer);resolve();},{once:true});});
  cache=await caches.open('erion-demo-resources-'+manifest.version);finished=0;done=0;queue=[];
  const existing=new Map((await cache.keys()).map(r=>[r.url,r]));
  for(const f of manifest.files){const url=new URL(f.path,location.href).href;if(existing.has(url)){finished+=f.bytes;done++;}else queue.push(f);}
  $('download-description').textContent=`第一章包含高清場景與配音，共約 ${Math.ceil(total/1048576)} MB。首次下載需要時間，之後會使用本機快取。`;
  if(!queue.length){complete();return;}
  progress();action.disabled=false;action.textContent=done?'繼續下載':'下載第一章';
 }
 function complete(){ready=true;$('download-progress').value=1;status('遊戲資源已備妥');$('download-detail').textContent=`${manifest.files.length} 個檔案已完整下載`;action.disabled=false;action.textContent='進入第一章';navigator.serviceWorker.controller?.postMessage({type:'activate-cache',name:'erion-demo-resources-'+manifest.version});}
 async function download(){if(busy)return;busy=true;action.disabled=true;action.textContent='下載中…';started=performance.now();networkBytes=0;let failure=null,index=0;const active=new Map();
  const update=()=>progress([...active.values()].reduce((a,b)=>a+b,0));
  async function worker(){while(index<queue.length&&!failure){const file=queue[index++];let last;
   for(let attempt=0;attempt<3;attempt++){const ctl=new AbortController();let timer;const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>ctl.abort(),45000);};try{
    active.set(file.path,0);arm();const response=await fetch(file.path,{cache:'no-store',headers:{'X-Erion-Download':'1'},signal:ctl.signal});if(!response.ok)throw Error('HTTP '+response.status);const reader=response.body.getReader(),parts=[];let bytes=0;
    while(true){const r=await reader.read();if(r.done)break;arm();parts.push(r.value);bytes+=r.value.byteLength;networkBytes+=r.value.byteLength;active.set(file.path,bytes);update();}
    if(bytes!==file.bytes)throw Error('檔案長度不完整');const blob=new Blob(parts,{type:response.headers.get('Content-Type')||'application/octet-stream'});
    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(n=>n.toString(16).padStart(2,'0')).join('');if(hash!==file.sha256)throw Error('檔案驗證未通過');
    await cache.put(new URL(file.path,location.href).href,new Response(blob,{headers:{'Content-Type':blob.type,'Content-Length':String(bytes),'X-Erion-SHA256':hash}}));finished+=file.bytes;done++;last=null;break;
   }catch(e){last=e;if(e.name==='QuotaExceededError')break;}finally{clearTimeout(timer);active.delete(file.path);update();}}
   if(last)failure=last;
  }}
  await Promise.all(Array.from({length:4},worker));busy=false;
  if(failure){status(failure.name==='QuotaExceededError'?'瀏覽器儲存空間不足':'下載暫停，已完成的檔案仍保留');$('download-detail').textContent=failure.name==='QuotaExceededError'?'請騰出至少 1.2 GB 空間，或改用非無痕視窗後再試。':'請確認網路連線，再按繼續下載。';action.disabled=false;action.textContent='重新檢查並續傳';return;}
  complete();
 }
 async function launch(){document.querySelector('link[href^="app.min.css"]').href='app.min.css?v='+manifest.version;action.disabled=true;action.textContent='正在開啟遊戲…';const script=document.createElement('script');script.src='app.min.js?v=entrance-prefix-1';script.onload=()=>host.remove();script.onerror=()=>{status('遊戲程式未能啟動');action.disabled=false;action.textContent='重試開啟';};document.body.append(script);}
 action.onclick=async()=>{try{if(ready)await launch();else{await check();if(!ready)await download();}}catch(e){fail(e);}};
 function fail(e){console.error('Resource preparation',e);status(e.message);action.disabled=false;action.textContent='重試';}
 check().catch(fail);
})();
