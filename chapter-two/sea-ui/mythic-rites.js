(() => {
 'use strict';
 const base=new URL('https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/media/forge/',document.baseURI),cache=new Map();
 const clamp=v=>Math.max(0,Math.min(1,v)),tau=Math.PI*2;
 function ease(v){v=clamp(v);return v*v*(3-2*v);}
 function load(src){
  const url=new URL(src,base).href;
  if(!cache.has(url)){const img=new ChapterImage();img.src=url;cache.set(url,img);}
  return cache.get(url);
 }
 const asset=name=>load('rite-'+name+'.webp');
 const ready=image=>!!image?.naturalWidth;
 function sprite(c,image,x,y,width,height=width,opacity=1,angle=0){
  if(!ready(image)||opacity<=0||width<=0||height<=0)return;
  c.save();c.globalAlpha*=clamp(opacity);c.translate(x,y);c.rotate(angle);
  c.drawImage(image,-width/2,-height/2,width,height);c.restore();
 }
 function contain(c,image,x,y,size,opacity=1,angle=0){
  if(!ready(image))return;const ratio=image.naturalWidth/image.naturalHeight;
  sprite(c,image,x,y,size*Math.min(1,ratio),size*Math.min(1,1/ratio),opacity,angle);
 }
 function backdrop(c,image,w,h){
  if(!ready(image))return;const scale=Math.max((w+18)/image.width,(h+16)/image.height);
  sprite(c,image,w/2,h/2,image.width*scale,image.height*scale);
 }
 function sparkRain(c,x,y,t,reach,count,flatten=1){
  if(t<=0||t>=1)return;
  c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
  for(let i=0;i<count;i++){
   const a=i*2.39996,speed=.18+((i*71)%101)/110,dist=reach*speed*(1-(1-t)**2);
   const dx=Math.cos(a)*dist,dy=Math.sin(a)*dist*flatten;
   c.globalAlpha=(1-t)**1.6*(.5+.5*Math.sin(i+17*t)**2);
   c.strokeStyle=i%3?'#ffbe57':'#fff5ca';c.lineWidth=(i%4+1)*.43;
   c.beginPath();c.moveTo(x+dx*.91,y+dy*.91+reach*.10*t*t);c.lineTo(x+dx,y+dy+reach*.10*t*t);c.stroke();
  }c.restore();
 }
 function rifts(c,x,y,r,phase,alpha,tint='#ffba74'){
  if(alpha<=0)return;
  c.save();c.translate(x,y);c.lineJoin='bevel';
  for(let i=0;i<6;i++){
   const a=i*tau/6+.36*Math.sin(i*7.3)+.32,points=[[0,0]];
   for(let j=1;j<=7;j++){const d=r*(.55+.45*Math.abs(Math.sin(i*3.7+1)))*j/7;
    const b=(Math.sin(j*2.48+i*7+phase*.63)+.42*Math.sin(j*4.55-i*2+phase*.33))*r*.081;
    points.push([Math.cos(a)*d-Math.sin(a)*b,(Math.sin(a)*d+Math.cos(a)*b)*.77]);}
   c.beginPath();points.forEach(([px,py],j)=>j?c.lineTo(px,py):c.moveTo(px,py));
   const fork=points[4];c.moveTo(...fork);c.lineTo(fork[0]+r*.13*Math.cos(a+.8),fork[1]+r*.13*Math.sin(a+.8));c.lineTo(fork[0]+r*.21*Math.cos(a+1.2),fork[1]+r*.21*Math.sin(a+1.2));
   c.globalAlpha=alpha;c.lineWidth=3.1;c.strokeStyle=tint;c.shadowColor=tint;c.shadowBlur=6;c.stroke();
   c.shadowBlur=0;c.lineWidth=1.85;c.strokeStyle='#170d20';c.stroke();
  }c.restore();
 }
 function wave(c,x,y,age,reach){
  if(age<=0||age>=1)return;const radius=reach*(1-(1-age)**2);
  sprite(c,asset('wave'),x,y,radius*2,radius*.52,(1-age)**.8);
 }
 function run(canvas,{duration,paint,finish,update}){
  let raf=0,ended=false,start=performance.now(),paused=null;
  const ctx=canvas.getContext('2d'),modal=canvas.closest('dialog');
  function stop(){
   if(ended)return;ended=true;cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',visibility);
   window.removeEventListener('pagehide',stop);modal?.removeEventListener('close',closed);finish?.();
  }
  function closed(){if(!modal.open)stop();}
  function tick(now){
   if(ended)return;
   if(!canvas.isConnected||modal&&!modal.open||!ctx){stop();return;}
   if(document.hidden)return;
   const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.6);
   if(!rect.width||!rect.height){stop();return;}
   const w=Math.max(1,Math.round(rect.width*ratio)),h=Math.max(1,Math.round(rect.height*ratio));
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   const t=Math.max(0,Math.min(duration,now-start));
   ctx.setTransform(w/rect.width,0,0,h/rect.height,0,0);ctx.clearRect(0,0,rect.width,rect.height);
   paint(ctx,rect.width,rect.height,t);update?.(t);if(t>=duration)stop();else raf=requestAnimationFrame(tick);
  }
  function visibility(){if(document.hidden){paused??=performance.now();cancelAnimationFrame(raf);}else if(paused!==null){start+=performance.now()-paused;paused=null;raf=requestAnimationFrame(tick);}}
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',stop);modal?.addEventListener('close',closed);
  raf=requestAnimationFrame(tick);
  return {stop,clock:()=>((paused??performance.now())-start)/1000};
 }
 // Dye order matches the five rows of the painted ribbon sheet.
 const dyeArrival=[1020,955,1130,1180,1260];
 const inflowRoutes=[
  [0,1020,0.09,[[0,0.4],[0.09,0.44],[0.16,0.47],[0.215,0.43],[0.28,0.335],[0.335,0.329],[0.395,0.37],[0.45,0.415]]],
  [0,1020,0.155,[[0.02,1],[0.1,0.86],[0.22,0.79],[0.316,0.71],[0.352,0.6],[0.375,0.54],[0.422,0.51],[0.477,0.465]]],
  [1,955,0.15,[[0.94,0],[0.78,0.078],[0.705,0.083],[0.624,0.146],[0.57,0.225],[0.525,0.31],[0.493,0.377]]],
  [1,955,0.075,[[0.073,0],[0.17,0.115],[0.285,0.183],[0.352,0.204],[0.411,0.267],[0.452,0.365],[0.474,0.405]]],
  [1,955,0.105,[[0.265,1],[0.34,0.943],[0.397,0.865],[0.381,0.731],[0.379,0.627],[0.406,0.56],[0.458,0.51],[0.482,0.467]]],
  [2,1130,0.12,[[0.225,0],[0.255,0.09],[0.319,0.159],[0.382,0.218],[0.419,0.29],[0.45,0.38],[0.477,0.415]]],
  [2,1130,0.07,[[0.538,0],[0.528,0.112],[0.477,0.209],[0.458,0.3],[0.465,0.361],[0.483,0.399]]],
  [2,1130,0.082,[[0,0.638],[0.091,0.625],[0.16,0.589],[0.249,0.541],[0.325,0.5],[0.412,0.463],[0.473,0.45]]],
  [2,1130,0.09,[[1,0.505],[0.873,0.468],[0.795,0.441],[0.726,0.383],[0.64,0.326],[0.58,0.325],[0.536,0.353]]],
  [2,1130,0.091,[[0.61,1],[0.613,0.875],[0.592,0.783],[0.552,0.656],[0.52,0.538],[0.515,0.467]]],
  [3,1180,0.185,[[1,0.846],[0.937,0.724],[0.86,0.643],[0.771,0.603],[0.678,0.604],[0.608,0.574],[0.579,0.502],[0.558,0.46],[0.532,0.424]]],
  [3,1180,0.044,[[0,0.3],[0.115,0.32],[0.213,0.365],[0.291,0.324],[0.347,0.342],[0.413,0.385],[0.468,0.423]]],
  [4,1260,0.11,[[1,0.19],[0.9,0.208],[0.827,0.247],[0.765,0.264],[0.671,0.28],[0.597,0.315],[0.548,0.356]]],
  [4,1260,0.113,[[1,0.605],[0.915,0.55],[0.829,0.494],[0.745,0.448],[0.696,0.386],[0.63,0.337],[0.553,0.331],[0.515,0.365]]],
  [4,1260,0.084,[[0,0.795],[0.124,0.731],[0.257,0.665],[0.302,0.601],[0.369,0.551],[0.422,0.532],[0.469,0.486]]],
  [4,1260,0.067,[[0.444,0],[0.463,0.107],[0.481,0.17],[0.481,0.245],[0.475,0.31],[0.481,0.369]]]
 ];
 const joined=Math.max(...dyeArrival),compress=joined+110;
 const hold=compress+250,release=hold+100;
 const approachMs=650, fusion={joined,compress,hold,release,fireworks:release+350,rest:release+2150};
 const outcomes={
  success:{title:'合成成功',art:'branch-success',opening:880,duration:release+3850},
  critical:{title:'合成大成功',art:'branch-critical',opening:320,duration:release+4470},
  failure:{title:'合成失敗',art:'branch-failure',opening:255,duration:release+3350}
 };
 // Clockwise corrections from each painted grip's centreline, measured collar to pommel.
 const gripAngles={
  'boar-weapon':45.2,'copperShell-weapon':42.9,'core-nautilus-weapon':-30,'lizard-weapon':42.3,
  'moth-weapon':42.5,'reef-mantis-weapon':43.3,recoveredHammer:39.8,repairedHammer:42.5,starterHammer:40.9,
  'rite-hammer':180.5,'rite-core-nautilus':-30.1,'rite-core-nautilus-crown':-28,
  'rite-reef-mantis':39.4,'rite-reef-mantis-crown':39.4
 };
 function uprightOffering(image){
  const key=new URL(image.src).pathname.split('/').pop().replace(/\.(png|webp)$/i,'');
  const tile=document.createElement('canvas');tile.width=tile.height=384;
  const ctx=tile.getContext('2d',{willReadFrequently:true}),angle=(gripAngles[key]||0)*Math.PI/180;
  contain(ctx,image,192,192,266,1,angle);
  const pixels=ctx.getImageData(0,0,384,384).data;
  let left=384,right=-1,top=384,bottom=-1;
  for(let y=0;y<384;y++)for(let x=0;x<384;x++)if(pixels[(y*384+x)*4+3]>12){
   left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left)return tile;
  const cut=document.createElement('canvas');cut.width=right-left+1;cut.height=bottom-top+1;
  cut.getContext('2d').drawImage(tile,left,top,cut.width,cut.height,0,0,cut.width,cut.height);return cut;
 }
 function makeOffering(image,side){
  const weapon=uprightOffering(image),form=document.createElement('canvas');form.width=form.height=256;
  const ink=form.getContext('2d'),fit=250/Math.max(weapon.width,weapon.height);
  return (c,t,x,y,unit)=>{
   const p=ease(t/710);if(p>=1)return;
   ink.clearRect(0,0,256,256);ink.drawImage(weapon,(256-weapon.width*fit)/2,(256-weapon.height*fit)/2,weapon.width*fit,weapon.height*fit);
   if(p>0){
    ink.save();if(side>0){ink.translate(256,0);ink.scale(-1,1);}
    const front=1-p,mask=ink.createLinearGradient(0,0,256,0);
    mask.addColorStop(0,'#fff');mask.addColorStop(Math.max(0,front-.13),'#fff');mask.addColorStop(front,'transparent');mask.addColorStop(1,'transparent');
    ink.globalCompositeOperation='destination-in';ink.fillStyle=mask;ink.fillRect(0,0,256,256);ink.restore();
   }
   const size=unit*(.39-.19*p),float=Math.sin((t+approachMs)*.005+side)*3;
   const cx=x+side*unit*.43*(1-p),cy=y-unit*(.055+.085*Math.sin(p*Math.PI))*(1-p)+float;
   c.save();c.shadowColor=side<0?'#ff5436':'#72caff';c.shadowBlur=4+6*p;
   c.drawImage(form,cx-size/2,cy-size/2,size,size);c.restore();
  };
 }
 // Sample two moving copies of the painted filaments along their measured tangents.
 // Crossfade the phases to advect the internal folds continuously without a texture reset.
 function makePixelField(width){
  const canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=Math.round(width*9/16);
  const ink=canvas.getContext('2d',{willReadFrequently:true}),w=canvas.width,h=canvas.height;
  function read(name){ink.clearRect(0,0,w,h);ink.drawImage(asset(name),0,0,w,h);return ink.getImageData(0,0,w,h).data;}
  const source=read('inflow-paint'),field=read('inflow-field'),out=ink.createImageData(w,h);
  const indexes=[],distance=[],vx=[],vy=[];
  for(let i=0;i<w*h;i++){
   if(source[i*4+3]<4)continue;
   indexes.push(i);distance.push(field[i*4+2]/255);
   vx.push((field[i*4]/127.5-1)*w*.052);
   vy.push((field[i*4+1]/127.5-1)*w*.052);
  }
  const slots=Uint32Array.from(indexes),travel=Float32Array.from(distance),fx=Float32Array.from(vx),fy=Float32Array.from(vy);
  let previous=-1;
  function paint(t){
   if(t===previous)return;previous=t;
   const front=clamp(t/joined),tail=ease((t-joined+120)/(hold-joined+120));
   const phase=t*.0017+t*t*.00000042,data=out.data;
   for(let j=0;j<slots.length;j++){
    const i=slots[j],d=travel[j],idx=i*4;
    const gate=clamp((front*1.075-d)/.075)*clamp((d+.09-tail*1.11)/.09);
    if(!gate){data[idx+3]=0;continue;}
    const p=(phase+.32*d)%1,q=p<.5?p+.5:p-.5,blend=1-Math.abs(2*p-1);
    const sx=i%w,sy=(i/w)|0;
    const x1=Math.max(0,Math.min(w-1,Math.round(sx-fx[j]*(p-.5)))),y1=Math.max(0,Math.min(h-1,Math.round(sy-fy[j]*(p-.5))));
    const x2=Math.max(0,Math.min(w-1,Math.round(sx-fx[j]*(q-.5)))),y2=Math.max(0,Math.min(h-1,Math.round(sy-fy[j]*(q-.5))));
    const a=(y1*w+x1)*4,b=(y2*w+x2)*4;
    const k=blend*(source[a+3]/255)*.90,l=(1-blend)*(source[b+3]/255)*.90,base=1-k-l;
    for(let ch=0;ch<3;ch++)data[idx+ch]=k*source[a+ch]+l*source[b+ch]+base*source[idx+ch];
    data[idx+3]=source[idx+3]*gate;
   }
   ink.putImageData(out,0,0);
  }
  return {canvas,paint};
 }
 // One GPU pass for all colour families, with the same inward field on devices
 // without WebGL. Release the context when this short ritual ends.
 function makeField(width){
  const canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=Math.round(width*9/16);
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,depth:false,stencil:false});
  if(!gl)return makePixelField(Math.min(736,width));
  const dispose=()=>gl.getExtension('WEBGL_lose_context')?.loseContext();
  try{
   const program=gl.createProgram();
   function compile(type,code){
    const shader=gl.createShader(type);gl.shaderSource(shader,code);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));
    gl.attachShader(program,shader);gl.deleteShader(shader);
   }
   compile(gl.VERTEX_SHADER,'attribute vec2 point; varying vec2 uv;void main(){uv=vec2(point.x*.5+.5,.5-point.y*.5);gl_Position=vec4(point,0.,1.);}');
   compile(gl.FRAGMENT_SHADER,`precision highp float;
    varying vec2 uv;uniform sampler2D paintTex, directions;uniform vec3 clock;
    void main(){
     vec3 field=texture2D(directions,uv).rgb;
     float gate=smoothstep(0.,.075,clock.y*1.075-field.b)*(1.-smoothstep(field.b,field.b+.09,clock.z*1.11));
     if(gate<.002){gl_FragColor=vec4(0.);return;}
     vec2 vel=(field.rg*2.-1.)*vec2(.052,.09245);
     float p=fract(clock.x+.32*field.b),q=fract(p+.5),blend=1.-abs(p*2.-1.);
     vec4 base=texture2D(paintTex,uv),a=texture2D(paintTex,uv-vel*(p-.5)),b=texture2D(paintTex,uv-vel*(q-.5));
     float k=.90*a.a*blend,l=.90*b.a*(1.-blend);
     gl_FragColor=vec4(base.rgb*(1.-k-l)+a.rgb*k+b.rgb*l,base.a*gate);
    }`);
   gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   gl.useProgram(program);const verts=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,verts);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
   const loc=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
   for(const [unit,name,uniform] of [[0,'inflow-paint','paintTex'],[1,'inflow-field','directions']]){
    gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
    for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.LINEAR);
    for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,asset(name));gl.uniform1i(gl.getUniformLocation(program,uniform),unit);
   }
   gl.viewport(0,0,canvas.width,canvas.height);const clock=gl.getUniformLocation(program,'clock');let fallback;
   return {get canvas(){return fallback?.canvas||canvas;},dispose,paint(t){
    if(gl.isContextLost()){fallback??=makePixelField(Math.min(width,736));fallback.paint(t);return;}
    gl.uniform3f(clock,t*.0017+t*t*.00000042,clamp(t/joined),ease((t-joined+120)/(hold-joined+120)));
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
   }};
  }catch{dispose();return makePixelField(Math.min(736,width));}
 }
 function prepareRoute([dye,end,width,guide],index){
  const points=[...guide,[.5,.417]],lengths=[0];
  for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot((points[i][0]-points[i-1][0])*16/9,points[i][1]-points[i-1][1]));
  const total=lengths.at(-1);
  return {dye,end,width,index,sample(u){
   const d=clamp(u)*total;let i=1;while(i<points.length-1&&d>lengths[i])i++;
   const a=points[i-1],b=points[i],k=(d-lengths[i-1])/(lengths[i]-lengths[i-1]);
   return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];
  }};
 }
 const routes=inflowRoutes.map(prepareRoute);
 function makeInflow(weapons){
  const offerings=weapons.map((img,i)=>makeOffering(img,i===0?-1:1));
  let field;
  function prepare(w){
   const mobile=matchMedia('(pointer:coarse)').matches;
   const target=Math.min(mobile?744:1152,Math.max(480,Math.round(w*Math.min(devicePixelRatio||1,1.35))));
   if(!field||field.target!==target){field?.dispose?.();field=makeField(target);field.target=target;}
  }
  function draw(c,t,cx,cy,w,h,squeeze){
   if(t>0&&squeeze<1){
    prepare(w);
    field.paint(t);
    const size=w*1.12*(1-.955*squeeze),height=size*9/16;
    c.drawImage(field.canvas,cx-.5*size,cy-.417*height,size,height);
    const silk=asset('inflow-silk'),row=silk.naturalHeight/5,tail=ease((t-joined+120)/(hold-joined+120));
    for(const path of routes){
     // Each head and its trailing glints travel toward the throat, including the far, thin arms.
     for(let n=0;n<3;n++){
      const u=(t-(n*.22*path.end))/path.end;
      if(u<=tail||u>=1)continue;
      const v=Math.min(1,Math.pow(u,1.06)),pos=path.sample(v),past=path.sample(Math.max(0,v-.027));
      const px=cx+(pos[0]-.5)*size,py=cy+(pos[1]-.417)*height;
      const a=Math.atan2((pos[1]-past[1])*height,(pos[0]-past[0])*size);
      const gain=Math.min(1,u*12,(1-u)*9)*(.70-n*.14),length=size*(.115-.066*v)*(n===0?1:.64);
      c.save();c.translate(px,py);c.rotate(a);c.globalCompositeOperation='screen';c.globalAlpha=gain;
      c.drawImage(silk,0,path.dye*row,silk.width,row,-length*.89,-length*path.width*.55,length,length*path.width*1.1);c.restore();
     }
    }
   }
   for(const drawOffering of offerings)drawOffering(c,t,cx,cy,Math.min(w*.76,h*.96));
  }
  draw.prepare=prepare;draw.dispose=()=>{field?.dispose?.();field=null;};return draw;
 }
 // Borrow the light of the three painted crystal facets for the burst. Each streak
 // lands on its own colour in the final scene and fades into that crystal.
 let crystalStreaks;
 function paintCrystalStreaks(c,art,x,y,left,top,w,h,age){
  if(age<=0||age>=265)return;
  if(!crystalStreaks){
   crystalStreaks=[[.115,.401,.073,.120,.08,225],[.849,.339,.086,.120,.115,205],[.830,.219,.050,.088,-.105,250]].map(([u,v,pw,ph,bow,flight])=>{
    const tile=document.createElement('canvas');tile.width=96;tile.height=64;
    const ctx=tile.getContext('2d'),sw=pw*art.naturalWidth,sh=ph*art.naturalHeight;
    ctx.drawImage(art,u*art.naturalWidth-sw/2,v*art.naturalHeight-sh/2,sw,sh,0,0,96,64);
    ctx.scale(48,32);const soft=ctx.createRadialGradient(1,1,0,1,1,1);
    soft.addColorStop(0,'#fff');soft.addColorStop(.45,'#fff');soft.addColorStop(1,'transparent');
    ctx.globalCompositeOperation='destination-in';ctx.fillStyle=soft;ctx.fillRect(0,0,2,2);
    return {u,v,bow,flight,tile};
   });
  }
  c.save();c.globalCompositeOperation='screen';
  for(const {u,v,bow,flight,tile} of crystalStreaks){
   for(const lag of [21,0]){
    const t=clamp((age-lag)/flight);if(!t||t===1)continue;
    const p=1-(1-t)**2,dx=left+w*u-x,dy=top+h*v-y;
    const px=x+dx*p,py=y+dy*p+h*bow*Math.sin(p*Math.PI);
    const a=Math.atan2(dy+h*bow*Math.PI*Math.cos(p*Math.PI),dx);
    const peak=Math.sin(t*Math.PI);
    sprite(c,tile,px,py,w*(.023+.14*peak),h*(.012+.022*peak),peak*(lag?.30:.85),a);
   }
  }
  c.restore();
 }
 function mote(c,cell,x,y,size,opacity,angle=0){
  const atlas=asset('branch-motes');if(!ready(atlas)||size<=0||opacity<=0)return;
  const sw=atlas.naturalWidth/3,sh=atlas.naturalHeight/2;
  c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=clamp(opacity);
  c.drawImage(atlas,cell%3*sw,Math.floor(cell/3)*sh,sw,sh,-size/2,-size/2,size,size);
  c.restore();
 }
 function shatter(c,x,y,unit,age){
  for(let i=0;i<22;i++){
   const t=(age-(i%5)*19)/(560+(i*73)%440);if(t<=0||t>=1)continue;
   const a=i*2.39996+.3,depth=(i%6)/6,reach=unit*(.32+.8*depth),d=t*(.72+.67*t);
   mote(c,i%4===0?4:3,x+Math.cos(a)*reach*d,y+Math.sin(a)*reach*d*.64+unit*.13*t*t,
    unit*(.022+.17*t*t)*(1+.65*depth),Math.sin(Math.PI*Math.min(1,t*2))*.2+(1-ease((t-.52)/.48))*.8,a+t*(i%2?2.0:-1.6));
  }
  for(let i=0;i<8;i++){
   const t=(age-i*55)/(1100+i*53);if(t<=0||t>=1)continue;
   const side=i%2?1:-1;
   mote(c,5,x+side*unit*(.09+(i%3)*.10)*t,y-unit*(.09+.17*t)*t,unit*(.10+.39*t),Math.sin(Math.PI*t)*.68,side*t*.50);
  }
 }
 function coronation(c,x,y,unit,age){
  for(let i=0;i<12;i++){
   const t=(age-(i%4)*95)/(880+(i*59)%380);if(t<=0||t>=1)continue;
   const side=i%2?1:-1,fan=.21+(i%6)*.075,p=1-(1-t)**2;
   mote(c,0,x+side*unit*fan*p,y-unit*(.28+.20*Math.sin(i))*Math.sin(t*2.4),
    unit*(.095+.06*p),Math.min(1,t*8)*(1-ease((t-.48)/.52)),side*(.5+.7*p));
  }
  for(let i=0;i<2;i++){
   const side=i?1:-1,t=clamp((age-95)/1100);if(t>0&&t<1)
    mote(c,1,x+side*unit*(.10+.32*ease(t)),y-unit*(.12+.08*Math.sin(t*Math.PI)),unit*(.17+.21*ease(t)),Math.sin(t*Math.PI)*.88,side*(.53+t*.65));
  }
  for(let i=0;i<10;i++){
   const t=(age-260-i*67)/1080;if(t<=0||t>=1)continue;
   mote(c,2,x+Math.sin(i*2.4)*unit*(.15+.44*t),y-unit*.38+unit*.4*t,unit*.14,Math.sin(t*Math.PI)*.82,i*.65);
  }
 }
 // Reveal the outcome painting from the shared core. All three finish uncropped.
 function drawOutburst(c,w,h,age,kind,calm,plate){
  const branch=outcomes[kind],art=asset(branch.art),scale=Math.min(w/art.naturalWidth,h/art.naturalHeight);
  const fw=art.naturalWidth*scale,fh=art.naturalHeight*scale,left=(w-fw)/2,top=(h-fh)/2;
  const x=w*.5,y=h*.46,unit=Math.min(w,h),critical=kind==='critical',failed=kind==='failure';
  const q=calm?1:1-(1-clamp(age/branch.opening))**(failed?4:critical?3:1.65);
  if(q<1){
   backdrop(c,load('salvage-altar.webp'),w,h);
   const pw=c.canvas.width,ph=c.canvas.height;
   if(plate.width!==pw||plate.height!==ph){plate.width=pw;plate.height=ph;}
   const ink=plate.getContext('2d');ink.setTransform(pw/w,0,0,ph/h,0,0);ink.clearRect(0,0,w,h);
   const size=1+.035*(1-q);
   ink.drawImage(art,left-fw*(size-1)*.5,top-fh*(size-1)*.5,fw*size,fh*size);
   const reach=1+Math.hypot(w*.5,Math.max(y,h-y))*1.3*q;
   const front=ink.createRadialGradient(x,y,0,x,y,reach);
   front.addColorStop(0,'#fff');front.addColorStop(failed?.71:critical?.82:.40,'#fff');front.addColorStop(1,'transparent');
   ink.globalCompositeOperation='destination-in';ink.fillStyle=front;ink.fillRect(0,0,w,h);
   ink.globalCompositeOperation='source-over';c.drawImage(plate,0,0,w,h);
  }else{
   c.fillStyle='#171218';c.fillRect(0,0,w,h);c.drawImage(art,left,top,fw,fh);
  }
  if(calm||age>=fusion.rest-fusion.release)return;
  if(kind==='success'){
   c.save();c.globalAlpha=.29;wave(c,x,h*.66,age/1050,w*.63);c.restore();return;
  }
  if(age<320){
   const r=unit*(.055+.33*q),light=c.createRadialGradient(x,y,0,x,y,r);
   light.addColorStop(0,failed?'#470425':'#fff9dc');light.addColorStop(.16,failed?'#ff59c3':'#ffd483');light.addColorStop(.55,failed?'#a726f568':'#ef954955');light.addColorStop(1,'transparent');
   c.save();c.globalAlpha=Math.exp(-age/95);c.fillStyle=light;c.fillRect(x-r,y-r,2*r,2*r);c.restore();
  }
  if(failed){
   rifts(c,x,y,unit*(.16+.64*ease(age/250)),Math.floor(age/43),1-ease(age/590),'#f265ed');
   shatter(c,x,y,unit,age);return;
  }
  const height=h*1.35;sprite(c,asset('column'),x,y-height*.23,w*.49,height,(1-ease(age/660))*.83);
  paintCrystalStreaks(c,art,x,y,left,top,fw,fh,age);
  c.save();c.globalAlpha=.57;wave(c,x,y,age/550,w*.83);c.restore();
  coronation(c,x,y,unit,age);
  if(age>fusion.fireworks-fusion.release){
   const fade=1-ease((age-1400)/(fusion.rest-fusion.release-1400));
   if(plate.width!==c.canvas.width||plate.height!==c.canvas.height){plate.width=c.canvas.width;plate.height=c.canvas.height;}
   const ink=plate.getContext('2d');ink.setTransform(plate.width/w,0,0,plate.height/h,0,0);
   ink.clearRect(0,0,w,h);window.ForgeCinema?.weaponFinale?.(ink,w,h,(age-(fusion.fireworks-fusion.release))/1000,true);
   c.save();c.globalAlpha=.62*fade;c.drawImage(plate,0,0,w,h);c.restore();
  }
 }
 function refractCore(c,buffer,x,y,r,t,force){
  if(force<=0||r<6)return;
  const m=c.getTransform(),ry=r*.70;
  const width=Math.max(2,Math.ceil(2*r*m.a)),height=Math.max(2,Math.ceil(2*ry*m.d));
  if(buffer.width!==width||buffer.height!==height){buffer.width=width;buffer.height=height;}
  const copy=buffer.getContext('2d');
  copy.drawImage(c.canvas,(x-r)*m.a+m.e,(y-ry)*m.d+m.f,2*r*m.a,2*ry*m.d,0,0,width,height);
  // Refract the ribbons and the altar together, only inside the field of the core.
  for(let i=8;i>=1;i--){
   const k=i/9,bend=force*(1-k),stretch=1+.12*bend;
   c.save();c.beginPath();c.ellipse(x,y,r*k,ry*k,0,0,tau);c.clip();
   c.translate(x+Math.sin(t*.025+i*.8)*bend*4,y+Math.cos(t*.033+i*.6)*bend*3);
   c.drawImage(buffer,-r*stretch,-ry*stretch,2*r*stretch,2*ry*stretch);c.restore();
  }
 }
 function drawFusion(c,w,h,t,kind,calm,inflow,plate){
  const cx=w*.5,cy=h*.46,unit=Math.min(w*.76,h*.96);
  const release=t-fusion.release,held=t>=fusion.hold&&release<0;
  const at=held?fusion.hold:t;
  if(release>=0||calm){drawOutburst(c,w,h,Math.max(0,release),kind,calm,plate);return;}
  const pull=ease((at-150)/(fusion.joined-150)),squeeze=ease((at-fusion.compress)/(fusion.hold-fusion.compress));
  const force=pull*(1-squeeze),shake=held?0:(1.6*pull+4.4*ease((at-760)/670))*(1-ease((at-fusion.compress)/250));
  c.save();c.translate(cx+Math.sin(at*.081)*shake,cy+Math.cos(at*.103)*shake*.70);
  const zoom=1+.029*force;c.scale(zoom,zoom);c.translate(-cx,-cy);
  backdrop(c,load('salvage-altar.webp'),w,h);inflow(c,at,cx,cy,w,h,squeeze);
  if(!held){
   refractCore(c,plate,cx,cy,unit*.31,at,force);
   for(let i=0;i<8;i++){
    const a=at*(.0026+i*.00011)+i*2.4,orbit=unit*(.49-.44*pull)*(1-squeeze),depth=.73+.24*Math.sin(a);
    contain(c,asset('tablet'),cx+Math.cos(a)*orbit,cy+Math.sin(a)*orbit*.62,unit*.068*depth,Math.sin(pull*Math.PI)*.93,a*.43);
   }
   const fork=ease((at-390)/430)*(1-squeeze);
   const rift=asset('inflow-rifts'),row=rift.naturalHeight/3;
   for(let j=0;j<3&&fork>0;j++){
    const beat=at/118+j*.37,flash=Math.max(0,1-(beat%1)*1.5)**2;
    const len=unit*(.20+.19*pull)*(.70+.20*j)*(1-.65*squeeze);
    c.save();c.translate(cx,cy);c.rotate(j*2.12+Math.floor(beat)*.21);
    c.globalAlpha=fork*flash*.88;c.drawImage(rift,0,j*row,rift.width,row,-len*.03,-len*.13,len,len*.26);c.restore();
   }
  }
  if(pull>0){
   const diameter=unit*(.17+.05*pull)*(1-.82*squeeze);
   sprite(c,asset('inflow-core'),cx,cy,diameter,diameter,pull,at*.00019);
  }
  c.restore();
 }
 function warmFusion(kind){
  const names=['wave','tablet','inflow-paint','inflow-field','inflow-silk','inflow-core','inflow-rifts'];
  if(kind){names.push(outcomes[kind].art);if(kind!=='success')names.push('branch-motes');
   if(kind==='critical')names.push('column');}
  return [...names.map(asset),load('salvage-altar.webp')];
 }
 let fusionModal=null;
 function showWeapon(kind,main,donor,description,demo=false){
  if(fusionModal?.open||!Object.hasOwn(outcomes,kind))return;
  const weapons=[main?.src?load(main.src):asset('hammer'),donor?.src?load(donor.src):asset('core-nautilus')];
  const art=[...warmFusion(kind),...weapons];
  const modal=document.createElement('dialog');modal.id='fusion-performance';modal.className='rite-performance';modal.dataset.kind=kind;fusionModal=modal;
  modal.setAttribute('aria-label','神器合成祭壇');
  modal.innerHTML='<div class="fusion-stage"><canvas></canvas><div class="rite-result"><small></small><strong></strong><span></span></div></div><footer><span></span><button type="button">略過演出</button></footer>';
  const caption=modal.querySelector('.rite-result'),title=caption.querySelector('strong');
  caption.querySelector('small').textContent=demo?'祭壇演示':'武器合成';caption.querySelector('span').textContent=description;
  modal.querySelector('footer span').textContent=demo?outcomes[kind].title+' · 演出預覽':main.name+'　＋　'+donor.name;
  caption.querySelector('span').hidden=true;
  document.body.append(modal);modal.showModal();modal.querySelector('button').onclick=()=>modal.close();
  const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let playback,timeout;
  function cleanup(){
   clearTimeout(timeout);document.removeEventListener('visibilitychange',rearm);
   if(fusionModal===modal){window.ForgeSound?.timeline(kind,null);fusionModal=null;}
   modal.remove();
  }
  modal.addEventListener('close',()=>{playback?.stop();cleanup();},{once:true});
  function rearm(){if(!document.hidden&&modal.open&&playback)window.ForgeSound?.timeline(kind,()=>playback.clock()-(approachMs+fusion.release)/1000);}
  function showResult(){
   const footer=modal.querySelector('footer');
   if(caption.parentElement===footer)return;
   footer.querySelector('span').hidden=true;footer.prepend(caption);
   title.textContent=outcomes[kind].title;
   caption.querySelector('span').hidden=false;footer.querySelector('button').textContent='返回工坊';
  }
  function begin(){
   if(!modal.open||fusionModal!==modal)return;
   const inflow=calm?null:makeInflow(weapons),plate=document.createElement('canvas');
   inflow?.prepare(modal.querySelector('canvas').getBoundingClientRect().width);
   playback=run(modal.querySelector('canvas'),{
   duration:approachMs+outcomes[kind].duration,paint:(ctx,w,h,t)=>drawFusion(ctx,w,h,t-approachMs,kind,calm,inflow,plate),
   update:clock=>{const t=clock-approachMs,revealed=t>=fusion.release||calm;
    modal.dataset.arrived=String(dyeArrival.filter(end=>t>=end).length);
    modal.dataset.phase=calm||t>=fusion.rest?'tableau':t>=fusion.fireworks&&kind==='critical'?'fireworks':revealed?'revealed':t>=fusion.hold?'hold':t>=fusion.compress?'compress':t>=fusion.joined?'joined':t<0?'offerings':'gather';
    if(revealed)showResult();else title.textContent=t>=fusion.compress?'凝核':t<0?'雙鎚入陣':'靈流匯聚';},
   finish:()=>{inflow?.dispose();if(modal.open)modal.close();cleanup();}
  });
   document.addEventListener('visibilitychange',rearm);rearm();
  }
  if(art.every(ready)){begin();return;}
  title.textContent='祭壇甦醒';
  Promise.race([Promise.all(art.map(i=>i.decode())),new Promise((_,fail)=>{timeout=setTimeout(fail,6000);})])
   .then(begin).catch(()=>{if(!modal.open)return;showResult();modal.dataset.phase='tableau';
    const picture=asset(outcomes[kind].art).cloneNode();picture.alt=outcomes[kind].title+' · 武器合成祭壇';
    modal.querySelector('canvas').replaceWith(picture);
   }).finally(()=>clearTimeout(timeout));
 }
 function fusionCover(primary,donor){
  const box=document.createElement('section');box.className='rite-fusion-cover';
  box.innerHTML='<div><small>利昂工坊</small><strong>神器合成祭壇</strong></div><div class="rite-previews" role="group" aria-label="合成演出預覽"><small>演出預覽</small></div>';
  if(primary)box.querySelector('small').textContent=primary.name+(donor?' ＋ '+donor.name:'');
  for(const [kind,label] of [['success','成功'],['critical','大成功'],['failure','失敗']]){
   const b=document.createElement('button');b.type='button';b.dataset.previewKind=kind;b.textContent=label;
   b.setAttribute('aria-label','預覽合成'+label);
   const previewArt=item=>item?{name:item.name,src:ItemIcons.node(item).src}:null;
   b.onclick=()=>showWeapon(kind,previewArt(primary),previewArt(donor),kind==='failure'?'融合陣逆流':'厄里昂的神話鎚',true);
   box.querySelector('.rite-previews').append(b);
  }
  warmFusion();return box;
 }
 const strikes=[420,920,1500];
 const angles={'reef-mantis':-Math.PI/4,'core-nautilus':Math.PI*.30,laurel:-Math.PI/2};
 const detailNames=['reef-mantis','core-nautilus'];
 function warmSmith(){for(const n of ['hammer','wave','tablet','smith-stone','smith-cover',...detailNames])asset(n);}
 function awakened(item){return item?.slot==='weapon'&&detailNames.includes(item.template)&&(item.forgeTier||1)>1?new URL('rite-'+item.template+(item.forgeTier>=3?'-crown':'')+'.webp',base).href:null;}
 // Alpha-mask the glowing channels to the actual weapon silhouette, including at either edge.
 function glowingChannels(image){
  if(!ready(image))return null;
  const tile=document.createElement('canvas');tile.width=tile.height=256;
  const ctx=tile.getContext('2d');
  ctx.drawImage(image,0,0,tile.width,tile.height);
  const pixels=ctx.getImageData(0,0,tile.width,tile.height),v=pixels.data;
  for(let i=0;i<v.length;i+=4){
   const x=(i/4%256)/256,y=Math.floor(i/4/256)/256,light=(v[i]*.5+v[i+1]*.4+v[i+2]*.1)/255;
   const vein=Math.abs(Math.sin(19*x+11*y+3*Math.sin(8*x-12*y)+2.3*light));
   const hot=clamp((.35-vein)*3.8),arc=vein<.067;
   v[i]=arc?26:255;v[i+1]=arc?9:50+light*148;v[i+2]=arc?31:27+light*59;v[i+3]*=hot;
  }ctx.putImageData(pixels,0,0);return tile;
 }
 function smithFrame(c,w,h,t,scene){
  const cx=w*.50,cy=h*.50,unit=Math.min(w*.60,h*1.02),stone=asset('smith-stone');
  const index=strikes.filter(hit=>hit<=t).length,last=index?strikes[index-1]:-10000,elapsed=t-last;
  const lastBlow=index===3,change=ease((t-strikes[2])/360),family=scene.family;
  const strikeForce=scene.calm?0:Math.exp(-Math.max(0,elapsed)/115)*(lastBlow?6.8:4.1);
  c.save();c.translate(Math.sin(elapsed*.068)*strikeForce,Math.cos(elapsed*.072)*strikeForce*.6);
  backdrop(c,stone,w,h);
  for(let i=0;i<8;i++){const a=i*tau/8+t*.00049;contain(c,asset('tablet'),cx+Math.cos(a)*unit*.71,cy-h*.19+Math.sin(a)*h*.12,unit*(.06+.021*(1+Math.sin(a))),.31+.17*(1+Math.sin(a)),a*.23);}
  const before=scene.before,after=scene.after,rot=angles[family]||0;
  const dip=scene.calm?0:Math.max(0,1-elapsed/150)*Math.sin(Math.max(0,elapsed)*.047)*3;
  const hitX=cx+(family==='reef-mantis'?-.12:.12)*unit,hitY=cy;
  for(const [i,material] of (scene.materials||[]).entries()){
   const arrival=i%2===0?strikes[0]:strikes[1],start=arrival-375+i%3*30;
   const q=ease((t-start)/(arrival-start));if(q>=1)continue;
   const side=i%2?1:-1,x=hitX+side*(unit*.43+i*9)*(1-q);
   const y=hitY+(h*.105+7*Math.sin(i))*(1-q)-Math.sin(q*Math.PI)*h*.038;
   contain(c,material,x,y,unit*.12*(1-.64*q),1-q*q,side*q*.65);
  }
  // The whole weapon and its masked illumination share one transform.
  c.save();c.translate(cx,cy+dip);c.rotate(rot);
  contain(c,before,0,0,unit*.74,1-change);
  contain(c,after,0,0,unit*.74,change);
  if(index&&scene.channels&&ready(before)){
   const power=clamp(index*.20+Math.exp(-elapsed/250)*.76)*(1-ease((t-1600)/680));
   c.save();c.globalCompositeOperation='source-over';c.globalAlpha=power;
   const extent=unit*.74,ratio=before.width/before.height;
   const range=extent*(.16+.72*ease(elapsed/225));c.beginPath();c.rect(-range,-extent/2,2*range,extent);c.clip();
   c.drawImage(scene.channels,-extent*Math.min(1,ratio)/2,-extent*Math.min(1,1/ratio)/2,extent*Math.min(1,ratio),extent*Math.min(1,1/ratio));c.restore();
  }c.restore();
  for(let i=0;i<strikes.length;i++){const age=t-strikes[i];if(age<0||age>700)continue;
   wave(c,hitX,hitY,age/630,unit*(i===2?1.70:1.07));
   sparkRain(c,hitX,hitY,age/(i===2?750:590),unit*(i===2?1.02:.60),i===2?94:48,.79);}
  if(index&&elapsed<340){
   const decay=1-elapsed/340,r=unit*(lastBlow?.50:.31);
   const flash=c.createRadialGradient(hitX,hitY,0,hitX,hitY,r);
   flash.addColorStop(0,'#fff5cf');flash.addColorStop(.10,'#ffdc99dd');flash.addColorStop(.34,'#fc7e3e78');flash.addColorStop(1,'#a11d0c00');
   c.save();c.globalCompositeOperation='screen';c.globalAlpha=decay*decay;c.fillStyle=flash;c.fillRect(hitX-r,hitY-r,2*r,2*r);c.restore();
   if(lastBlow)wave(c,hitX,hitY,(elapsed-55)/480,unit*1.25);
  }
  if(index)rifts(c,hitX,hitY,unit*(lastBlow?.45:.33),Math.floor(t/43),.91*clamp(1-elapsed/290));
  // A brief refraction limited to the hot air directly above the point of contact.
  if(index&&ready(stone)&&elapsed<260){c.save();c.globalAlpha=.12*(1-elapsed/260);c.beginPath();c.ellipse(hitX,hitY-h*.075,unit*.23,h*.11,0,0,tau);c.clip();c.translate(Math.sin(t*.078)*4,-1.5);backdrop(c,stone,w,h);c.restore();}
  const next=strikes.find(v=>v>t),until=next===undefined?Infinity:next-t;
  const fall=until<255?1-ease(until/255):0,retreat=index&&elapsed<165?1-ease(elapsed/165):0;
  const descend=Math.max(fall,retreat),hammerHeight=unit*.97;
  if(descend>0||t<strikes[2]){const headY=hitY-(1-descend)*h*.54,centerY=headY-hammerHeight*.45;
   if(descend>.6){contain(c,asset('hammer'),hitX,centerY-h*.07,hammerHeight,.19);}
   contain(c,asset('hammer'),hitX,centerY,hammerHeight,.58+.42*descend);}
  if(scene.concept&&lastBlow){
   c.save();c.globalAlpha=ease((t-strikes[2])/220);backdrop(c,asset('smith-cover'),w,h);c.restore();
   sparkRain(c,cx,cy,elapsed/790,unit,76,.72);
  }
  c.restore();
 }
 function strikeSound(){
  if(!(window.SeaGame?SeaGame.S.audio:(document.querySelector('[data-world-enabled]')?.checked??true)))return null;
  const sound=new Audio(new URL('audio/rite-strikes.wav',base));sound.volume=.49;sound.play().catch(()=>{});return sound;
 }
 function smithPreview(){
  if(document.getElementById('smith-performance'))return;warmSmith();
  const d=document.createElement('dialog');d.id='smith-performance';d.className='rite-performance';
  d.setAttribute('aria-label','神話升階演示');d.innerHTML='<div class="smith-stage"><canvas></canvas></div><footer>天鎚重塑 · 神話鎚演示<button type="button">略過演出</button></footer>';
  document.body.append(d);d.showModal();d.querySelector('button').onclick=()=>d.close();
  const scene={family:'laurel',concept:true,before:asset('hammer'),after:asset('hammer'),calm:matchMedia('(prefers-reduced-motion: reduce)').matches};
  const sound=scene.calm?null:strikeSound(),canvas=d.querySelector('canvas');
  const playback=run(canvas,{duration:2450,paint:(ctx,w,h,t)=>{if(scene.calm){backdrop(ctx,asset('smith-cover'),w,h);return;}scene.channels??=glowingChannels(scene.before);smithFrame(ctx,w,h,t,scene);},
   finish:()=>{document.removeEventListener('visibilitychange',hide);sound?.pause();if(d.open)d.close();d.remove();}});
  function hide(){if(document.hidden)playback.stop();}document.addEventListener('visibilitychange',hide);
 }
 function temper(stage,item,snapshot,onReveal,onFinish){
  warmSmith();
  const before=load(ItemIcons.node({...item,forgeTier:snapshot.from}).src),after=load(awakened(item));
  const canvas=document.createElement('canvas');canvas.className='bench-flow';stage.append(canvas);
  const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let revealed=false,audio;const reveal=()=>{if(!revealed){revealed=true;onReveal();}};
  const settle=()=>{reveal();canvas.remove();if(audio){audio.pause();audio.removeAttribute('src');audio.load();}onFinish();};
  if(calm||document.hidden){settle();return ()=>{};}
  const scene={before,after,family:item.template,channels:null,calm,materials:snapshot.materials.map(m=>load(ItemIcons.node(m.key).src))};
  audio=strikeSound();
  const onVisibility=()=>{if(document.hidden)playback.stop();};document.addEventListener('visibilitychange',onVisibility);
  const playback=run(canvas,{duration:2350,
   paint:(ctx,w,h,t)=>{scene.channels??=glowingChannels(before);smithFrame(ctx,w,h,t,scene);},
   update:t=>{stage.dataset.impact=String(strikes.filter(hit=>t>=hit).length);if(t>=strikes[2])reveal();},
   finish:()=>{document.removeEventListener('visibilitychange',onVisibility);settle();}
  });return playback.stop;
 }
 window.MythicRites={showWeapon,fusionCover,warmFusion,warmSmith,temper,awakened,smithPreview};
})();
