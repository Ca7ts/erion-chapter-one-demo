(()=>{
 const single=src=>({src,cols:1,rows:1,panel:0});
 const sheet=(chapter,panel)=>({src:'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/dialogue-interaction-v1/'+chapter+'.webp',cols:2,rows:2,panel});
 const first={mother:single('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-scenes-v1/oilmill-family.webp'),dolly:single('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-director-v4/molly-herbs-fixed.webp'),leon:sheet('chapter-one',0),damon:sheet('chapter-one',1),meli:sheet('chapter-one',2),foreman:single('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-director-v3/foreman-close.webp'),young:single('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-director-v3/miner-close.webp'),isocron:single('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-director-v4/isocron-measure.webp'),niko:single('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-director-v4/niko-oilmill.webp'),demeter:{...single('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/characters/demeter.webp'),opacity:.5}};
 const second={niko:4,kleon:0,oreia:1,pela:2,demeter:3,philon:5,tolle:6,dori:7,poseidon:10};
 function node(shot,label){
   if(!shot)return null;
   const mount=document.createElement('div');
   mount.className='dialogue-illustration'+(shot.portrait?' spirit-portrait':'');
   mount.setAttribute('role','img');
   mount.setAttribute('aria-label',label);
   const aperture=document.createElement('div');
   aperture.className='portrait-aperture';
   const recess=document.createElement('div');
   recess.className='portrait-recess';
   const canvas=document.createElement('canvas');
   recess.append(canvas);
   aperture.append(recess);
   mount.append(aperture);

   const source=new ChapterImage();
   source.onload=async()=>{
     const artwork=shot.portrait&&window.PactPortrait?await PactPortrait.prepare(source,shot.src):source;
     const cols=shot.cols||1, rows=shot.rows||1, panel=shot.panel||0;
     const cellWidth=source.width/cols, cellHeight=source.height/rows;
     const width=cellWidth-4, height=cellHeight-4;
     const scale=Math.min(1,1024/width,768/height);
     canvas.width=Math.max(1,Math.round(width*scale));
     canvas.height=Math.max(1,Math.round(height*scale));
     const context=canvas.getContext('2d');
     context.globalAlpha=shot.opacity??1;
     context.drawImage(artwork,(panel%cols)*cellWidth+2,Math.floor(panel/cols)*cellHeight+2,
       width,height,0,0,canvas.width,canvas.height);
     recess.style.setProperty('--art-ratio',String(canvas.width/canvas.height));
     mount.classList.add('portrait-ready');
   };
   source.onerror=()=>mount.remove();
   source.src=shot.src;
   return mount;
 }
 function c1(person,tab){return tab==='side'&&person==='foreman'?sheet('chapter-one',3):first[person];}
 function c2(person,step){if(person==='poseidon')return {...single(window.PactPortrait?.source||'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-approved-20261025/poseidon-red-faint-sprite.webp'),opacity:.5,portrait:true};if(person==='escort')return window.SeaCinema?.plans['R2-09:8'];let i=second[person];if(person==='kleon'&&step>=16)i=12;if(person==='oreia'&&step>=16)i=11;return window.SeaCinema?.plans['chat-'+i+':0'];}
 window.DialogueIllustration={first,c1,c2,node};
})();
