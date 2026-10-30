/* Public runtime cache only. Save data stays in localStorage. */
const CACHE_PREFIX='erion-demo-resources-';
// Reuse cache handles across sprite/audio requests. No need to enumerate all
// browser caches for every frame asset. Refresh only when a release activates.
let resourceCaches;
function getResourceCaches(){return resourceCaches??=(async()=>{const keys=(await caches.keys()).filter(k=>k.startsWith(CACHE_PREFIX)).reverse();return Promise.all(keys.map(k=>caches.open(k)));})().catch(error=>{resourceCaches=null;throw error;});}
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',e=>{if(e.data?.type==='activate-cache')e.waitUntil((async()=>{const name=e.data.name;if(!name?.startsWith(CACHE_PREFIX))return;const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==name).map(k=>caches.delete(k)));resourceCaches=Promise.resolve([await caches.open(name)]);})());});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url),scope=new URL(self.registration.scope);
 if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||request.mode==='navigate'||request.headers.has('X-Erion-Download')||url.pathname.endsWith('/download-manifest.json'))return;
 event.respondWith((async()=>{
  url.search='';let hit;
  for(const cache of await getResourceCaches()){hit=await cache.match(url.href);if(hit)break;}
  if(!hit)return fetch(request);
  const range=request.headers.get('range');if(!range)return hit;
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match)return hit;
  // Blob slicing avoids making another full-sized JS buffer for every seek.
  const data=await hit.blob(),size=data.size;
  const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  const end=match[1]?(match[2]?Math.min(size-1,Number(match[2])):size-1):size-1;
  if(start>=size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
  return new Response(data.slice(start,end+1),{status:206,headers:{'Content-Type':hit.headers.get('Content-Type')||'application/octet-stream','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
 })());
});
