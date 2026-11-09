/* Precise raster masks must be registered in ORIGINAL MAP coordinates after alignment review.
   Hit areas are never allowed to stand in for object silhouettes. No approved background masks yet. */
window.ObjectSilhouetteMasks=(()=>{
 const entries=new Map();
 return {
  register(key,{image,x,y,width,height,approved=false}){
   if(!approved||!image||!width||!height)throw new Error('Only reviewed, aligned alpha masks may be registered');
   entries.set(key,{image,x,y,width,height});
  },
  draw(ctx,key,hotspot,color,alpha){
   const m=entries.get(key);if(!m)return false;
   const b={x:m.x,y:m.y,w:m.width,h:m.height};
   drawActorSilhouette(ctx,b,g=>g.drawImage(m.image,m.x,m.y,m.width,m.height),color,alpha);return true;
  }
 };
})();
