import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const loader=new GLTFLoader();
let renderer,active=null;
const modelResources=(model)=>{
 const all=new Set();model.traverse(obj=>{if(!obj.isMesh)return;all.add(obj.geometry);for(const m of Array.isArray(obj.material)?obj.material:[obj.material]){all.add(m);for(const t of Object.values(m))if(t?.isTexture)all.add(t)}});
 for(const x of all){if(x.isTexture)x.source.data?.close?.();x.dispose();}
};
function end(){
 if(!active)return;active.abort.abort();
 for(const mesh of active.originals.values())modelResources(mesh);
 active=null;renderer?.renderLists.dispose();
}
async function start(battle){
 end();if(window.matchMedia('(pointer:coarse)').matches)return;
 try{renderer??=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return}
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,.1,8000);camera.position.z=3500;
 scene.add(new T.HemisphereLight(0xfff8e9,0x999ca6,1.65));
 for(const [x,y,z,power] of [[-3,4,4,2],[3,2,-3,1]]){const lamp=new T.DirectionalLight(0xffffff,power);lamp.position.set(x,y,z);scene.add(lamp);}
 const view=active={battle,scene,camera,abort:new AbortController(),originals:new Map(),actors:[],ready:false,frame:document.createElement('canvas')};
 try{
  for(const id of new Set(battle.enemies.map(e=>e.id))){
   const response=await fetch('sea-ui/models/'+id+'.glb',{signal:view.abort.signal});if(!response.ok)throw Error('Missing model '+id);
   const gltf=await loader.parseAsync(await response.arrayBuffer(),'');
   if(active!==view){modelResources(gltf.scene);return}view.originals.set(id,gltf.scene);
  }
  for(const foe of battle.enemies){
   const obj=view.originals.get(foe.id).clone(true),box=new T.Box3().setFromObject(obj),size=box.getSize(new T.Vector3()),ctr=box.getCenter(new T.Vector3()),pivot=new T.Group();
   obj.position.x-=ctr.x;obj.position.y-=box.min.y;obj.position.z-=ctr.z;pivot.add(obj);scene.add(pivot);view.actors.push({pivot,size});
  }view.ready=true;
 }catch{if(active===view)end();}
}
function draw(ctx,b,w,h,visual){
 const v=active;if(v?.battle!==b||!v.ready||!h||!w||renderer.getContext().isContextLost())return false;
 const width=Math.min(1680,Math.round(w)),height=Math.max(1,Math.round(width*h/w));
 if(renderer.domElement.width!==width||renderer.domElement.height!==height)renderer.setSize(width,height,false);
 const pose=[w,h];
 for(const [i,e]of b.enemies.entries()){
  const {pivot,size}=v.actors[i];pivot.visible=e.hp>0;pose.push(pivot.visible);if(!pivot.visible)continue;
  const j=visual?.recoil(i)||{x:0,y:0},scale=Math.min(h*(e.rare?.70:.58)/size.y,w*(b.enemies.length===1?.52:.80/b.enemies.length)/size.x);
  const elapsed=b.time-(e.attackAt??-10),swing=SeaGame.S.motion&&elapsed>=0&&elapsed<.44?Math.sin(Math.PI*elapsed/.44):0;
  pose.push(Math.round(j.x*w),Math.round(j.y*h),Math.round(swing*200));
  pivot.scale.setScalar(scale);pivot.position.set(w*(.2+(i+1)*.6/(b.enemies.length+1)-.5+j.x),h*(-.36-j.y)-swing*5,0);
  pivot.rotation.set(swing*.12,.07+swing*.10,0);
 }
 const stamp=pose.join(',');
 if(stamp!==v.stamp){
  Object.assign(v.camera,{left:-w/2,right:w/2,top:h/2,bottom:-h/2});v.camera.updateProjectionMatrix();
  if(v.frame.width!==width||v.frame.height!==height){v.frame.width=width;v.frame.height=height;}
  const buffer=v.frame.getContext('2d');buffer.clearRect(0,0,width,height);renderer.render(v.scene,v.camera);buffer.drawImage(renderer.domElement,0,0);v.stamp=stamp;
 }
 ctx.drawImage(v.frame,0,0,w,h);return true;
}
window.SeaActors={start,end,draw};
