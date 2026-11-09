// Contact lines follow the artwork after cropping. All pairs are fractions of the
// visible sprite, so zooming, screen rotation and the restored map use the same data.
window.SeaPropDepth=(()=>{
 const profiles={
  cart:{front:[[.04,.82],[.12,.86],[.19,.81],[.49,.71],[.59,.68]],back:[[.55,.59],[.21,.64],[.05,.73]]},
  rock:{front:[[.02,.75],[.26,.87],[.59,.98],[.87,.97],[.96,.86]],back:[[.93,.68],[.50,.65],[.16,.63]]},
  barrier:{front:[[0,.88],[.15,.99],[.52,.95],[.82,.91],[1,.84]],back:[[.98,.69],[.75,.68],[.48,.73],[.16,.76],[.02,.77]]},
  door:{front:[[0,.97],[1,.995]],back:[[.99,.965],[.02,.932]]},
  jars:{front:[[.12,.81],[.23,.96],[.48,1],[.73,.96],[.88,.82]],back:[[.78,.77],[.45,.74],[.18,.77]]},
  pool:{front:[[.01,.49],[.68,1],[.99,.63]],back:[[.99,.43],[.32,.03],[.01,.32]]},
  timber:{foreground:true},rope:{foreground:true},buoy:{foreground:true}
 };
 const surfaces=new Map(),inks=new WeakMap();
 let loaded=false;
 function clear(){loaded=true;surfaces.clear();}
 function records(area,flags){
  const key=WorldProps.key2(area,flags);
  if(surfaces.has(key))return surfaces.get(key);
  const props=WorldProps.all(key);
  if(area==='cliff')for(const id of Object.keys(SeaLayeredProps.defs)){const p=SeaLayeredProps.get(area,id);if(p)props.push(p);}
  const rows=[];
  for(const p of props){
   const spec=profiles[p.id];if(!spec||p.hitOnly)continue;
   const points=arr=>arr.map(([x,y])=>[p.x+x*p.w,p.y+y*p.h]);
   const line=spec.front?points(spec.front):null,solid=line?[...line,...points(spec.back)]:null;
   rows.push({p,line,solid,foreground:!!spec.foreground});
  }
  if(area==='core'&&props.some(p=>p.id==='core')){
   // The basin is baked into the approved background. Repaint only overlapping
   // actor pixels with its original alpha, including its registered overlays.
   const line=Array.from({length:41},(_,i)=>{const a=Math.PI*(1-i/40);return [770+500*Math.cos(a),555+200*Math.sin(a)];});
   rows.push({p:{id:'tidal-basin',x:180,y:210,w:1180,h:610},line,basin:true,restored:!!flags.ringOff,
    overlays:props.filter(p=>!p.hitOnly&&['core','imprint'].includes(p.id))});
  }
  // Loading the second chapter can query walkability before the sprites finish decoding.
  if(loaded)surfaces.set(key,rows);
  return rows;
 }
 function blocked(rows,x,y,inside){
  for(const {p,solid} of rows)if(solid&&x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h&&inside(x,y,solid))return true;
  return false;
 }
 function append(cast,levels,g,rows,afterCliffProp){
  for(const {p,line,foreground,basin,restored,overlays} of rows){
   if(basin){
    const overlaps=cast.filter(a=>Number.isFinite(a.x)&&Number.isFinite(a.y)&&a.x+60>p.x&&a.x-60<p.x+p.w&&a.y>=p.y&&a.y-130<p.y+p.h);
    for(const a of overlaps){
     const slices=[];
     PropDepth.append(slices,[a.y],g,[a.x-60,a.y-130,a.x+60,a.y+10],line,()=>{
      g.save();g.beginPath();g.rect(a.x-60,a.y-130,120,140);g.clip();
      TidePoolChapter.drawFrame(g,restored);for(const o of overlays)WorldProps.drawOne(g,o);g.restore();
     });
     for(const slice of slices)if(slice.y>a.y)cast.push(slice);
    }
    continue;
   }
   const draw=p.crop?()=>{SeaLayeredProps.drawOne(g,p);afterCliffProp(g,p);}:()=>WorldProps.drawOne(g,p);
   if(foreground)cast.push({y:1e6+p.foot,draw});
   else PropDepth.append(cast,levels,g,[p.x,p.y,p.x+p.w,p.y+p.h],line,draw);
  }
 }
 function shadows(g,rows,receive){
  for(const {p,line,basin} of rows){if(basin)continue;let ink=inks.get(p);
   if(!ink){const foot=line?PropDepth.at(line,p.x+p.w/2):p.foot;ink=PropDepth.bakeShadow({...p,foot},receive);inks.set(p,ink);}
   g.drawImage(ink.can,ink.left,ink.top);
  }
 }
 function settle(player,height,walkable){
  if(walkable(player.x,player.y))return;
  const x=Math.min(1535,Math.max(0,player.x)),y=Math.min(height-1,Math.max(0,player.y));
  for(let r=0;r<Math.hypot(1536,height);r+=3){
   const probes=Math.max(8,Math.ceil(r*Math.PI/2));
   for(let i=0;i<probes;i++){
    const a=i*2*Math.PI/probes,xx=x+r*Math.cos(a),yy=y+r*Math.sin(a);
    if(xx>=0&&xx<1536&&yy>=0&&yy<height&&walkable(xx,yy)){player.x=xx;player.y=yy;return;}
   }
  }
 }
 return {records,clear,blocked,append,shadows,settle,manages:p=>!!profiles[p.id]&&!p.hitOnly};
})();
