/* Use an AI-extracted matte with the approved, unmodified portrait pixels. */
(()=>{'use strict';
 const source='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-red-faint-sprite.webp';
 const mask='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-silhouette-matte.webp';
 let pending;
 function prepare(im,src){
  if(src!==source)return Promise.resolve(im);
  return pending??=(new Promise((resolve,reject)=>{
   const matte=new ChapterImage();matte.onload=()=>{
    const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
    const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(matte,0,0,c.width,c.height);
    const data=g.getImageData(0,0,c.width,c.height);
    for(let i=0;i<data.data.length;i+=4){const a=Math.max(0,Math.min(255,(data.data[i]-12)*255/231));data.data[i]=data.data[i+1]=data.data[i+2]=255;data.data[i+3]=a;}
    g.putImageData(data,0,0);g.globalCompositeOperation='source-in';g.drawImage(im,0,0);g.globalCompositeOperation='source-over';resolve(c);
   };matte.onerror=()=>reject(Error('海神輪廓遮罩未載入'));matte.src=mask;
  }));
 }
 window.PactPortrait={source,prepare};
})();
