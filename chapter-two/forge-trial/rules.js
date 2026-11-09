(() => {
  'use strict';
  const ranks=['white','green','blue','purple','orange'];
  const colors=['#f0eeeb','#89e59b','#7ec8ff','#dbabff','#ffbb71'];
  const chances=[.95,.80,.60,.40,.20];
  // Each grade uses absolute tenths for the stat, independent of slot or item color.
  const bounds={crit:[4,10,19,29,50],skill:[9,20,39,65,110],
    attack:[7,18,32,52,82],defense:[4,10,20,32,50],hp:[30,70,130,220,350],mp:[5,14,26,43,70]};
  const weights={green:[54,28,12,5,1],blue:[45,32,16,5,2],purple:[39,31,19,8,3],orange:[34,30,21,10,5]};
  const seal='forgeSeal';
  const signatures={'reef-mantis':'命中蓄力中的敵人，下一回合普攻該目標忽略 2 防禦。','core-nautilus':'主動防禦擋住攻擊後，下次漩流迴擊少耗 2 精神；不疊加。',boar:'主動防禦擋住蓄力攻擊，額外減少 3 傷害。'};
  function grade(a){
    const cut=bounds[a.key];if(!cut)return 0;
    const t=Math.round(a.value*10),i=cut.findIndex(v=>t<=v);return i<0?4:i;
  }
  function outcomeKind(result){
    if(!result.ok)return 'failure';
    return grade(result.a)>=ranks.indexOf('purple')?'critical':'success';
  }
  function interval(key,i){return [(i?bounds[key][i-1]+1:1)/10,bounds[key][i]/10];}
  function roll(key,rarity,rng=Math.random){
    const table=weights[rarity];let v=rng()*100,i=0;
    while(i<4&&v>=table[i]){v-=table[i];i++;}
    const [min,max]=interval(key,i),n=Math.round((max-min)*10)+1;
    return {key,value:(Math.round(min*10)+Math.min(n-1,Math.floor(rng()*n)))/10,min,max};
  }
  const pick=(arr,rng)=>arr[Math.min(arr.length-1,Math.floor(rng()*arr.length))];
  function plan(state,mainId,donorId,lock){
    const list=state.loot.items,main=list.find(i=>i.id===mainId),donor=list.find(i=>i.id===donorId);
    const error=t=>({error:t,options:[]});
    if(!main||!donor||main===donor)return error('請選兩件不同的裝備。');
    if(main.locked||donor.locked)return error('故事裝備不可合成。');
    if(main.reference||donor.reference)return error('試打對照品不參與合成。');
    if(!!main.sample!==!!donor.sample)return error('試材只能和試材合成。');
    if(!['weapon','head','body','hands','feet','neck','ring','belt','cloak'].includes(main.slot)||main.slot!==donor.slot)return error('只有同部位的裝備可以合成。');
    if(Object.values(state.loot.equipped).includes(donor.id))return error('已穿戴的裝備不能作為副裝備。');
    const cap=ranks.indexOf(main.rarity);
    if(cap<=0||ranks.indexOf(donor.rarity)<=0)return error('白色裝備沒有可合成的詞條。');
    if(lock&&(!(state.items[seal]>0)||!main.affixes.some(a=>a.key===lock)))return error('請選擇有效的保留詞條並持有守紋印。');
    const options=[];
    for(const a of donor.affixes){
      if(!bounds[a.key]||a.key===lock)continue;
      const same=main.affixes.findIndex(v=>v.key===a.key);
      if(same!==-1 && main.affixes[same].value===a.value)continue;
      const replace=same!==-1?[same]:main.affixes.length<cap?[-1]:
        main.affixes.map((x,i)=>x.key!==lock?i:-1).filter(i=>i>=0);
      if(replace.length)options.push({a,replace,chance:chances[grade(a)]});
    }
    if(!options.length)return error('沒有可轉移的詞條。請更換副裝備或調整保留選擇。');
    return {main,donor,options,rate:options.reduce((v,o)=>v+o.chance,0)/options.length};
  }
  function fuse(state,mainId,donorId,lock,rng=Math.random){
    const p=plan(state,mainId,donorId,lock);if(p.error)return p;
    const choice=pick(p.options,rng),ok=rng()<choice.chance;
    let removed=null;
    if(ok){
      const i=pick(choice.replace,rng),added={...choice.a};
      if(i<0)p.main.affixes.push(added);else {removed=p.main.affixes[i];p.main.affixes[i]=added;}
      if(lock)state.items[seal]--;
    }
    state.loot.items.splice(state.loot.items.indexOf(p.donor),1);
    return {ok,name:p.main.name,donor:p.donor.name,a:{...choice.a},removed,sealUsed:!!(ok&&lock)};
  }
  function sealChance(foe){if(foe.summoned)return 0;if(foe.boss)return .40;return foe.rare ? .25 : 0;}
  const charged=turn=>(turn-1)%3===0;
  function stateOf(b){return b.forgeEffects??={marks:new Map(),discount:false};}
  function hit(b,foe,type,raw,weapon,deal,record){
    const e=stateOf(b);let armor=foe.armor||0;
    if(weapon==='reef-mantis'&&type==='attack'&&e.marks.get(foe)===b.turn){
      const less=Math.min(2,armor);armor-=less;e.marks.delete(foe);
      record('虹拳破殼鎚','破口追擊 · 本擊忽略 '+less+' 防禦');
    }
    const n=deal(raw,{...foe,armor},type==='rune');
    record(type==='attack'?'普通攻擊':'刻印命中',foe.name+' −'+Math.min(foe.hp,n)+' 生命');
    if(weapon==='reef-mantis'&&charged(b.turn)&&foe.hp>n&&e.marks.get(foe)!==b.turn+1){
      e.marks.set(foe,b.turn+1);record('虹拳破殼鎚','已打開破口 · 下回合普攻同一目標');
    }
    return n;
  }
  function cost(b,rune,base,weapon){return Math.max(0,base-(b&&rune==='water'&&weapon==='core-nautilus'&&stateOf(b).discount?2:0));}
  function cast(b,rune,base,weapon,record){
    const mp=cost(b,rune,base,weapon);
    if(mp<base){stateOf(b).discount=false;record('逆紋螺鎚','守後漩流 · 精神 '+base+' → '+mp);}
    return mp;
  }
  function defend(b,damage,weapon,body,record){
    if(b.forgeAction!=='guard'||damage<=0)return damage;
    if(weapon==='core-nautilus'&&!stateOf(b).discount){stateOf(b).discount=true;record('逆紋螺鎚','已守住攻擊 · 下次漩流少耗 2 精神');}
    if(body==='boar'&&charged(b.turn)){
      const n=Math.max(0,damage-3);record('荊冠韌根護衣','韌根卸力 · 承傷 '+damage+' → '+n);return n;
    }
    return damage;
  }
  const api={ranks,colors,chances,bounds,seal,signatures,grade,outcomeKind,interval,roll,plan,fuse,sealChance,charged,hit,cost,cast,defend};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.ForgeRules=api;
})();
