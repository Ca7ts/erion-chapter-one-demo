// Resolves in both the source preview and the shipping ESM bundle.
export function mobileRuntime(){return navigator.maxTouchPoints>0||matchMedia('(pointer:coarse)').matches;}
// Pre-sized files avoid Safari first decoding the full authoring PNG in RAM.
// Paths are immutable within a build; never fall back to legacy monster art.
export function runtimeAsset(value){const url=new URL(value,location.href);if(mobileRuntime()&&/\.(png|webp)$/.test(url.pathname)&&/\/(?:monster-rigs|assets)\//.test(url.pathname)&&!url.pathname.includes('/mobile/'))url.pathname=url.pathname.replace(/\/(monster-rigs|assets)\//,'/$1/mobile/').replace(/\.(png|webp)$/,'.webp');return url;}
export function skillAsset(path){return runtimeAsset(new URL((/\/monsters(?:\.[a-f0-9]+)?\.min\.js$/.test(new URL(import.meta.url).pathname)?'./media/monster-rigs/':'./assets/')+path,import.meta.url));}

// Overlap network latency only. Decoding/upload remains serial so Safari never
// expands several authoring textures at once. Rejections are consumed even if
// an encounter is cancelled before the decoder reaches that queued file.
export function fetchTextureBlobs(paths,base,signal,mapAsset=true){
 const tasks=new Map(),lanes=Array.from({length:3},()=>Promise.resolve());let i=0;
 for(const path of new Set(paths.filter(Boolean))){const lane=i++%lanes.length;
  const task=lanes[lane].catch(()=>{}).then(async()=>{if(signal?.aborted)throw new DOMException('Cancelled','AbortError');const url=new URL(path,base),r=await fetch(mapAsset?runtimeAsset(url):url,{signal});if(!r.ok)throw Error('Texture '+r.status);return r.blob();});
  task.catch(()=>{});lanes[lane]=task;tasks.set(path,task);
 }return tasks;
}

export async function decodeBoundedImage(blob,maxEdge=768,signal){
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 const h=new DataView(await blob.slice(0,32).arrayBuffer());let w=0,t=0;
 if(h.byteLength>=24&&h.getUint32(0)===0x89504e47){w=h.getUint32(16);t=h.getUint32(20);}
 else if(h.byteLength>=30&&h.getUint32(0)===0x52494646){
  const tag=h.getUint32(12);
  if(tag===0x56503858){w=1+h.getUint8(24)+(h.getUint8(25)<<8)+(h.getUint8(26)<<16);t=1+h.getUint8(27)+(h.getUint8(28)<<8)+(h.getUint8(29)<<16);}
  else if(tag===0x5650384c){const bits=h.getUint32(21,true);w=(bits&16383)+1;t=((bits>>>14)&16383)+1;}
  else if(tag===0x56503820){w=h.getUint16(26,true)&16383;t=h.getUint16(28,true)&16383;}
 }
 const k=w&&t?Math.min(1,maxEdge/Math.max(w,t)):1;
 let image=await createImageBitmap(blob,{premultiplyAlpha:'none',...(k<1?{resizeWidth:Math.max(1,Math.round(w*k)),resizeHeight:Math.max(1,Math.round(t*k)),resizeQuality:'high'}:{})});
 // Some browsers ignore decode resize options. Bound the retained bitmap too.
 if(Math.max(image.width,image.height)>maxEdge){const scale=maxEdge/Math.max(image.width,image.height),c=document.createElement('canvas');c.width=Math.max(1,Math.round(image.width*scale));c.height=Math.max(1,Math.round(image.height*scale));c.getContext('2d').drawImage(image,0,0,c.width,c.height);image.close();image=await createImageBitmap(c);c.width=c.height=1;}
 if(signal?.aborted){image.close();throw new DOMException('Cancelled','AbortError');}return image;
}
