(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const anchors={cliff:[720,455],harbor:[650,775],reef:[800,820],seabed:[790,325],gate:[395,610],temple:[690,610],core:[630,840]};
const slots=[[-110,0],[80,-5],[-230,-18],[200,-25],[-320,-45],[300,-45],[-400,-65],[390,-65]];
function draw(api){const {ctx:c,w,h,story:st,plan:d,images,root,paintMap,sprite,cover,mist,rig,motion,flags}=api;
const e=st.event.id,i=st.index,p=clamp(st.elapsed/st.duration,0,1),t=motion?st.elapsed:0,phase=motion?Math.sin(t*2):0;
c.clearRect(0,0,w,h);const selected=d.art&&images['https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/'+d.art[0]],old=d.oldArt&&images[root+d.oldArt[0]],pic=selected||old,q=e==='R2-14'&&i===17&&st.replay&&p>=.55?3:selected?d.art?.[1]:d.oldArt?.[1];
if(pic){const cols=selected?(d.art[2]||2):2,rows=selected?(d.art[3]||2):2;
 const crop=d.artCrop||[0,0,1,1],sw=(pic.width/cols-8)*crop[2],sh=(pic.height/rows-8)*crop[3],s=Math.min(w/sw,h/sh),dw=sw*s,dh=sh*s;
 c.fillStyle='#15272c';c.fillRect(0,0,w,h);c.save();c.filter='blur(24px) brightness(.35)';cover(c,pic,[q%cols,Math.floor(q/cols),cols,rows],w,h,1.1);c.restore();
 c.drawImage(pic,(q%cols)*pic.width/cols+4+(pic.width/cols-8)*crop[0],Math.floor(q/cols)*pic.height/rows+4+(pic.height/rows-8)*crop[1],sw,sh,(w-dw)/2,(h-dh)/2,dw,dh);
 if(e==='R2-06'&&i===17&&motion&&p<.35){const xx=(w-dw)/2+(.255-crop[0])/crop[2]*dw,yy=(h-dh)/2+(.65-crop[1])/crop[3]*dh;mist(c,xx,yy,23,'#78dcff',.5*(1-clamp((p-.22)/.1,0,1)));}
}
else{
 const a=d.map==='harbor'&&d.restored?[500,645]:anchors[d.map]||anchors.cliff,cast=d.cast.filter(id=>id!=='poseidon'||!d.waterFace),focus=cast.indexOf(d.focus),near=!!d.focus&&!d.wide;
 const shore=d.map==='harbor'&&d.restored,shorePositions={erion:[390,645],poseidon:[580,640],kleon:[320,610],oreia:[650,640],demeter:[400,560],dori:[325,670]};
 const gate=d.map==='gate',core=d.map==='core',vw=gate?1480:core?1350:shore?690:near?440:1080,scale=w/vw,vh=h/scale,ax=gate||core?765:shore?475:a[0]+(near&&focus>=0?slots[focus%8][0]:0),ay=gate?480:core?560:shore?565:a[1]-(near?58:100);
 c.save();c.translate(w/2-ax*scale,h/2-ay*scale);c.scale(scale,scale);
 if(d.light==='night'&&!d.restored&&images['https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/cliff-night.webp'])c.drawImage(images['https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-v2/cliff-night.webp'],0,0,1536,864);else paintMap(c,d.map,1536,api.maps[d.map].height,{repaired:d.restored,ringOff:d.ringOff});
 if(d.light==='night'&&d.restored){c.fillStyle='#07182da8';c.fillRect(0,0,1536,1024);}else if(d.light==='dusk'){c.fillStyle='#b16d2b14';c.fillRect(0,0,1536,1024);}
 if(d.map==='gate'){
  const gone=e==='R2-11B'&&i>=4||e==='R2-11A'&&i>=11;
  let retreat=gone?1:d.action==='krakenRetreat'?clamp(p*1.8,0,1):0,show=e==='R2-12'||e==='R2-15'?.35:1;
  if(e==='R2-11B'&&i>=5)show=0;
  if(e==='R2-12'&&i===4)show=0;if(e==='R2-15'&&i===6)show=.22;
  rig.draw(c,t,{x:970+retreat*75,y:530-retreat*45,scale:.85*(1-retreat*.15),rise:1-retreat*.96,opacity:show*(1-retreat*.3),seed:4,view:'left',attack:d.action==='krakenStrike'?{phase:clamp(p,0,1),skill:false,targets:[{x:-690,y:70}]}:null});
 }
 const ordered=cast.map((id,j)=>({id,x:shore&&shorePositions[id]?shorePositions[id][0]:a[0]+slots[j%8][0],y:shore&&shorePositions[id]?shorePositions[id][1]:a[1]+slots[j%8][1]})).sort((x,y)=>x.y-y.y);
 for(const x of ordered){let alpha=x.id==='demeter'?.65:1,hh=x.id==='poseidon'?123:105,xx=x.x;
  if(d.enter===x.id)xx+=(1-clamp(p*3,0,1))*80;
  if(d.action==='krakenStrike'&&['erion','dori'].includes(x.id))xx-=65*clamp((p-.24)/.2,0,1);
  if(d.action==='goddess'&&x.id==='demeter'){alpha*=clamp(p*3,0,1);for(let j=0;j<26;j++)mist(c,xx+Math.sin(j*7+t)*35,x.y-((j*13+t*20)%125),4,'#f6e2a6',.5);}
  if(x.id==='poseidon'&&e==='R2-16'){if(i===0)alpha=clamp((p-.2)*2,0,1);mist(c,xx,x.y-55,75,'#b0eff4',.15);}
  sprite(c,x.id,xx,x.y,hh,alpha);
  if(d.action==='wrist'&&x.id==='niko')mist(c,xx-16,x.y-58,15,'#95dcff',.5+.15*phase);
  if(x.id==='erion'&&['boatWater','link','smallAvatar'].includes(d.action))mist(c,xx-16,x.y-55,15,'#7bdcff',.38);
 }
 if(core){const x=790,y=420;mist(c,x,y,92,'#74d7f4',.28);const glow=c.createRadialGradient(x-12,y-15,3,x,y,52);glow.addColorStop(0,'#e3fbff');glow.addColorStop(.3,'#7dc6dcbd');glow.addColorStop(1,'#40809e20');c.fillStyle=glow;c.beginPath();c.arc(x,y,52,0,7);c.fill();c.strokeStyle='#a9e8f1b0';c.lineWidth=2;for(let j=0;j<4;j++){c.beginPath();c.ellipse(x,y,48,14+j*7,t*.17+j*.6,0,7);c.stroke();}}
 if(d.action==='griffin'&&flags.griffin){const im=images['https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/characters/griffin.webp'];c.drawImage(im,a[0]-138,a[1]-128,45,45*im.height/im.width);}
 if(d.action==='jar'){c.fillStyle='#986b46';c.beginPath();c.ellipse(a[0]+28,a[1]+1,27,39,0,0,7);c.fill();c.strokeStyle='#d9b17a';c.lineWidth=5;c.stroke();}
 if(d.action==='fire')mist(c,720,455,100,'#f4b259',.06+.02*Math.sin(t*2.7));
 if(['buoy','trench','barrier','uphillWater'].includes(d.action)){const x=a[0]+20,y=a[1]-120;
  if(d.action==='buoy'){c.strokeStyle='#9f8060';c.lineWidth=4;c.beginPath();c.moveTo(x-130,y);c.lineTo(x+140,y-30);c.stroke();for(let j=0;j<3;j++){c.fillStyle=j===1?'#ddd3b4':'#a64236';c.beginPath();c.ellipse(x-100+j*100,y-j*8,25,12,-.2,0,7);c.fill();}}
  if(d.action==='trench'){c.strokeStyle='#594a39';c.lineWidth=20;c.beginPath();c.moveTo(x-170,y+50);c.lineTo(x+170,y-35);c.stroke();c.strokeStyle='#c4ab82';c.lineWidth=2;for(let j=0;j<4;j++){c.beginPath();c.moveTo(x-165,y+20-j*6);c.lineTo(x+160,y-60-j*6);c.stroke();}}
  if(d.action==='uphillWater'){for(let j=0;j<30;j++){const z=(j/30+t*.14)%1;c.fillStyle='#bedee6a0';c.beginPath();c.ellipse(x-150+z*300,y+35-z*90+Math.sin(j)*9,5,1.8,-.25,0,7);c.fill();}}
 }
 if(['crystals12','rings','ringFall'].includes(d.action)){const x=790,y=625;
  c.save();c.translate(x,y);if(d.action==='ringFall')c.translate(0,clamp(p*2,0,1)*75);
  for(let j=0;j<3;j++){c.strokeStyle=d.action==='rings'&&p>j/3?'#625240':'#d39a63';c.lineWidth=7;c.beginPath();c.ellipse(0,0,170-j*23,54-j*8,0,0,7);c.stroke();}
  if(d.action==='crystals12')for(let j=0;j<12;j++){const r=j/12*Math.PI*2,xx=Math.cos(r)*174,yy=Math.sin(r)*57;c.fillStyle=j<9?'#f5a276':'#8b5740';c.beginPath();c.moveTo(xx,yy-20);c.lineTo(xx+7,yy);c.lineTo(xx,yy+9);c.lineTo(xx-7,yy);c.closePath();c.fill();if(j<9)mist(c,xx,yy-8,11,'#ee8a59',.24);}
  c.restore();
 }
 c.restore();
}
// Local light and water effects leave bodies and painted architecture rigid.
if(['ripples','boatWater','link','restoring'].includes(d.action)){for(let j=0;j<9;j++){const z=(t*.15+j/9)%1;c.strokeStyle='rgba(185,229,239,'+(.12*(1-z))+')';c.lineWidth=1.2;c.beginPath();c.ellipse(w*.52,h*.76,35+z*w*.3,5+z*26,0,0,7);c.stroke();}}
if(d.action==='tremor'&&motion){c.fillStyle='#d8cfb7';for(let j=0;j<22;j++){const z=(t*.4+j/22)%1;c.globalAlpha=.3*(1-z);c.fillRect((j*151)%w,z*h,2,4);}c.globalAlpha=1;}
if(d.action==='roots'&&pic){mist(c,w*.38,h*.62,100,'#d6e99e',.05+.04*phase);}
if(['seaGodArrival','contract'].includes(d.action)){for(let j=0;j<38;j++){const z=(j/38+t*.13)%1;mist(c,w*.58+Math.sin(j*9)*w*.15,h*(.9-z*.7),3+z*3,'#b3e5ee',.16*(1-z));}}
if(d.caption){c.font='19px "Microsoft JhengHei"';c.textAlign='left';c.fillStyle='#091c27b8';c.fillRect(24,23,Math.min(w-48,d.caption.length*21+40),40);c.fillStyle='#e9d9b1';c.fillText(d.caption,42,50);}
const grad=c.createLinearGradient(0,h*.75,0,h);grad.addColorStop(0,'#04111900');grad.addColorStop(1,'#04111940');c.fillStyle=grad;c.fillRect(0,0,w,h);
}
window.SeaDirectorRender={draw};
})();
