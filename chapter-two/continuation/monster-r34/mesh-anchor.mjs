// Cache UV triangle lookup once; thereafter evaluate only the three deformed vertices.
export function createMeshAnchor(skeleton){
 const cache=new Map(),scratch=new Float32Array(6);
 return(u,v,name='@mesh')=>{
  const key=name+':'+u+':'+v;
  if(!cache.has(key)){
   let found=null;
   for(const slot of [...skeleton.drawOrder].reverse()){
    if(name!=='@mesh'&&slot.data.name!==name.slice(1))continue;
    const a=slot.getAttachment();if(!a?.triangles||!a.uvs)continue;
    for(let i=0;i<a.triangles.length;i+=3){
     const ids=Array.from(a.triangles.slice(i,i+3)),uv=ids.map(k=>[a.uvs[k*2],a.uvs[k*2+1]]);
     const [[ax,ay],[bx,by],[cx,cy]]=uv,den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);
     if(Math.abs(den)<1e-10)continue;
     const x=((by-cy)*(u-cx)+(cx-bx)*(v-cy))/den,y=((cy-ay)*(u-cx)+(ax-cx)*(v-cy))/den,z=1-x-y;
     if(Math.min(x,y,z)<-1e-6)continue;
     found={slot,a,ids,weights:[x,y,z]};break;
    }if(found)break;
   }cache.set(key,found);
  }
  const hit=cache.get(key);if(!hit)return null;
  let x=0,y=0;for(let i=0;i<3;i++){hit.a.computeWorldVertices(hit.slot,hit.ids[i]*2,2,scratch,i*2,2);x+=scratch[i*2]*hit.weights[i];y+=scratch[i*2+1]*hit.weights[i];}return{x,y};
 };
}
