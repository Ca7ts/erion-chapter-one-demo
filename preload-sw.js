/* Public runtime cache only. Save data stays in localStorage. */
const CACHE_PREFIX='erion-demo-resources-';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',e=>{if(e.data?.type==='activate-cache')e.waitUntil((async()=>{const name=e.data.name;if(!name?.startsWith(CACHE_PREFIX))return;const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==name).map(k=>caches.delete(k)));})());});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url),scope=new URL(self.registration.scope);
 if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||request.mode==='navigate'||request.headers.has('X-Erion-Download')||url.pathname.endsWith('/download-manifest.json'))return;
 event.respondWith((async()=>{
  url.search='';const keys=(await caches.keys()).filter(k=>k.startsWith(CACHE_PREFIX)).reverse();let hit;
  for(const key of keys){hit=await(await caches.open(key)).match(url.href);if(hit)break;}
  if(!hit)return fetch(request);
  const range=request.headers.get('range');if(!range)return hit;
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match)return hit;
  const data=await hit.arrayBuffer(),size=data.byteLength;
  const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  const end=match[1]?(match[2]?Math.min(size-1,Number(match[2])):size-1):size-1;
  if(start>=size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  return new Response(data.slice(start,end+1),{status:206,headers:{'Content-Type':hit.headers.get('Content-Type')||'application/octet-stream','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
 })());
});
