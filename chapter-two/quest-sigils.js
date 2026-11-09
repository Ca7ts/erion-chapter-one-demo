/* Local chapter maps share image-backed quest markers; visibility and hit tests belong to the map. */
(()=>{
 const images=new Map(),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const root=new URL('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/media/quest-sigils/',document.currentScript?.src||document.baseURI);
 const discharge=new ChapterImage();discharge.src=new URL('../forge/rite-inflow-rifts.webp',root).href;
 function get(type){
  const id=type.endsWith('-pending')?'pending':type;
  if(!images.has(id)){const image=new ChapterImage();image.src=new URL(id+'.webp',root).href;images.set(id,image);}
  return images.get(id);
 }
 function draw(ctx,type,t,animate=true,mobile=false,height=42){
  const image=get(type);if(!image.complete||!image.naturalWidth)return false;
  const pending=type.endsWith('-pending'),ready=type.endsWith('-ready'),side=type.startsWith('side');
  const width=height*image.naturalWidth/image.naturalHeight;
  const moving=animate&&!reduced.matches&&!pending,phase=t%3.8,charge=moving&&!ready&&phase<.28?Math.sin(Math.PI*phase/.28):0;
  ctx.save();if(mobile)ctx.scale(.5,1);
  if(charge){for(let i=0;i<4;i++){
    const sy=Math.floor(i*image.naturalHeight/4),end=Math.floor((i+1)*image.naturalHeight/4),dy=sy*height/image.naturalHeight;
    ctx.drawImage(image,0,sy,image.naturalWidth,end-sy,-width/2+(i%2?1:-1)*height*.033*charge,dy-height/2,width,(end-sy)*height/image.naturalHeight);
  }}else ctx.drawImage(image,-width/2,-height/2,width,height);
  if(moving){
   if(ready){
    for(let i=0;i<7;i++){const a=t*(.59+i*.027)+i*2.4,x=Math.cos(a)*width*(.47+i%3*.02),y=Math.sin(a)*height*.39;
     ctx.globalAlpha=.20+.59*Math.sin(a+.7)**2;ctx.fillStyle=side?'#adf5ff':'#ffe39c';const r=Math.max(.38,height*(i%3===0?.008:.004));
     ctx.beginPath();ctx.ellipse(x,y,r,r*1.7,.35,0,Math.PI*2);ctx.fill();}
   }else{
    const tick=Math.floor(t*8),flash=Math.sin(t*7.8+.2)*Math.cos(t*4.1);
    if((charge>.1||flash>.4)&&discharge.complete&&discharge.naturalWidth){
      ctx.globalAlpha=Math.min(.84,.23+Math.max(charge,flash)*.52);
      for(let i=0;i<2;i++){ctx.save();ctx.translate((i?1:-1)*width*.15,(i?.09:-.23)*height);
       ctx.rotate(i?-.73+.13*(tick%3):2.64+.12*(tick%2));const row=(tick+i)%3,rh=discharge.naturalHeight/3;
       ctx.drawImage(discharge,0,row*rh,discharge.naturalWidth,rh,-width*.1,-height*.045,width*.55,height*.09);ctx.restore();}
    }
   }
  }
  ctx.restore();return true;
 }
 window.QuestSigils={draw};
})();
