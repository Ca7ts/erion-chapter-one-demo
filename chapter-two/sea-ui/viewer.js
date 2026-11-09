import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const $=id=>document.getElementById(id),host=$('stage'),list=await(await fetch('models.json')).json();
const bake=new URLSearchParams(location.search).has('bake');if(bake)document.body.dataset.bake='1';const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:bake});renderer.setPixelRatio(bake?1:Math.min(devicePixelRatio,2));host.append(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.01,150),controls=new OrbitControls(camera,renderer.domElement);
const render=()=>renderer.render(scene,camera);controls.addEventListener('change',render);
scene.add(new T.HemisphereLight(0xfff8e9,0x999ca6,1.65));
for(const [x,y,z,w] of [[-3,4,4,2],[3,2,-3,1]]){const light=new T.DirectionalLight(0xffffff,w);light.position.set(x,y,z);scene.add(light);}
let object,request,sequence=0;
function dispose(obj){const resources=new Set();obj?.traverse(n=>{if(n.isMesh){resources.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material]){resources.add(m);for(const t of Object.values(m))if(t?.isTexture)resources.add(t);}}});for(const v of resources){if(v.isTexture)v.source?.data?.close?.();v.dispose();}}
function frame(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;
 if(!object){render();return;}
 const bounds=new T.Box3().setFromObject(object),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 const distance=(Math.max(size.y+size.z*.05,(size.x+size.z*.07)/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(16)))+size.z*.5)*1.06;
 controls.target.copy(center);camera.position.copy(center).addScaledVector(new T.Vector3(.07,.05,1).normalize(),distance);camera.near=distance/1000;camera.far=distance*20;camera.updateProjectionMatrix();controls.update();render();}
const selector=$('species');for(const m of list){const o=document.createElement('option');o.value=m.id;o.textContent=m.areaName+'　·　'+m.name;selector.append(o);}
async function select(id){const m=list.find(x=>x.id===id)||list[0],token=++sequence;request?.abort();request=new AbortController();
 if(object){scene.remove(object);dispose(object);object=null;render();}
 selector.value=m.id;$('title').textContent=m.name;$('area').textContent=m.areaName;$('reference').src='creatures/'+m.id+'.webp';const enemy=SeaDrops.enemies[m.id];$('note').textContent=(m.rare?'地區稀有 · ':'')+(enemy.note||'');const grid=$('drops');grid.replaceChildren();for(const [key,name,chance] of [...enemy.drops.map(([k,,p])=>[k,SeaDrops.materials[k].name,p]),[m.id+'-'+enemy.slot,SeaDrops.gear[m.id][enemy.slot].name,enemy.chance]]){const cell=document.createElement('div'),im=new ChapterImage();im.src='items-painted-20261101/'+key+'.webp';im.alt='';cell.append(im,name+'　'+Math.round(chance*100)+'%');grid.append(cell)}$('studio').href=m.providerURL;$('status').textContent='讀取本機 模型預覽…';history.replaceState(null,'','?monster='+m.id+(bake?'&bake=1':''));
 try{const r=await fetch('models/'+m.id+'.glb',{signal:request.signal});if(!r.ok)throw Error(r.status);const gltf=await new GLTFLoader().parseAsync(await r.arrayBuffer(),'');if(token!==sequence){dispose(gltf.scene);return;}object=gltf.scene;scene.add(object);frame();host.dataset.loaded=m.id;$('status').textContent='模型預覽　·　拖曳旋轉，捲動或雙指縮放';}
 catch(e){if(token===sequence)$('status').textContent='模型載入失敗，可重新選擇或開啟 Tripo。';}}
new ResizeObserver(frame).observe(host);$('reset').onclick=frame;selector.onchange=()=>select(selector.value);select(new URLSearchParams(location.search).get('monster'));
