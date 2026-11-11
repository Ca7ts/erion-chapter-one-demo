import {PlayerFX} from '../player-fx.js';
const clamp=n=>Math.max(0,Math.min(1,n));

// Reuse the new skill plates and curved-water renderer, without loading the
// unapproved player body or adding another WebGL context. The original weapon
// presentation owns the animation clock and the combat model owns every hit.
export class BattleSkillFX {
 static async load(base,signal){
  const model={state:'idle',time:0,meta:{},view:{centerX:0,footY:0,scale:1}};
  const art=await PlayerFX.load(base,model,signal);
  art.trail=()=>{}; // The approved first-person hammer already supplies its motion.
  return new BattleSkillFX(model,art);
 }
 constructor(model,art){this.model=model;this.art=art;this.reset();}
 reset(){this.kind=null;this.targets=[];this.contacts=[];this.elapsed=0;this.active=false;this.model.state='idle';this.model.time=0;}
 begin(kind,targets){this.reset();this.kind=kind;this.targets=targets.map(p=>({...p}));this.active=true;}
 sync(motion){
  if(!this.kind)return;
  this.active=motion.active&&motion.kind===this.kind;
  this.elapsed=motion.time;
  const nativeImpact=this.kind==='water'?1.02:.77;
  this.model.state=this.active?this.kind:'idle';
  this.model.time=motion.time<=motion.impact?motion.time/Math.max(.001,motion.impact)*nativeImpact:nativeImpact+(motion.time-motion.impact);
 }
 hit(target){if(this.active&&!this.contacts.some(x=>x.id===target))this.contacts.push({id:target,time:this.elapsed});}
 cooling(id){const c=this.contacts.find(c=>c.id===id);return this.active&&this.kind==='water'&&c?clamp(1-(this.elapsed-c.time)/.8):0;}
 draw(ctx,w,h){
  if(!this.active||!this.targets.length)return;
  const p=this.targets[0],v=this.model.view;
  v.scale=Math.min(w*.86/1500,h*.65/700);
  if(this.kind==='earth'){
   v.centerX=p.x*w-225*v.scale;v.footY=p.y*h;
  }else{
   const x=this.targets.reduce((n,p)=>n+p.x,0)/this.targets.length;
   const y=this.targets.reduce((n,p)=>n+p.y-p.h*.20,0)/this.targets.length;
   const travel=clamp(this.model.time/1.02);
   v.centerX=w*(.70+(x-.70)*travel);v.footY=h*(.90+(y-.90)*travel)+260*v.scale;
  }
  this.art.draw(ctx,w,h);
  // Contact mist follows the actual targets, including separately selected larvae.
  for(const c of this.contacts){
   const p=this.targets.find(p=>p.id===c.id),age=this.elapsed-c.time,life=clamp(1-age/.8);
   if(!p||!life||age<0)continue;
   const x=p.x*w,y=(p.y-p.h*.27)*h,s=Math.min(w*.28,h*.40);
   if(this.kind==='water'){
    this.art.sprite(ctx,this.art.images.water,x,y+age*25,s*(1+age*.5),s*.25,0,life*.65);
    ctx.save();ctx.filter='grayscale(1) brightness(1.8)';this.art.sprite(ctx,this.art.images.cinders,x,y,s*.85,s*.32,0,life*.25);ctx.restore();
   }
  }
 }
 dispose(){this.reset();this.art.dispose();}
 get diagnostics(){return{kind:this.kind,active:this.active,phase:this.model.time,contacts:this.contacts.map(c=>c.id),images:Object.keys(this.art.images).length};}
}
