(()=>{'use strict';
const key='erion-character-v1',one='erion-region-adventure-v1',two='erion-sea-chapter-v1';
const read=k=>JSON.parse(localStorage.getItem(k)||'null');
const names={herb:'止血藥草',ether:'清泉水囊',ore:'礦石',shell:'岩殼碎片',wood:'月桂木',flax:'長纖麻',thread:'麻線',seaMaterial:'修船材料'};
const supports=[['none','不裝備','無額外效果'],['swift','迅擊','傷害 −20%，冷卻減少'],['heavy','重擊','傷害 +40%，冷卻增加'],['split','分擊','目標 +1，傷害 −20%'],['guard','護身','施放刻印時減傷，傷害 −15%'],['focused','凝力','傷害 +22%，精神消耗提高'],['steady','節制','精神消耗降低']];
function init(ch,s){if(read(key))return;const a=read(one),b=read(two);for(const k of [one,two]){const raw=localStorage.getItem(k);if(raw&&!localStorage.getItem(k+'-before-shared-character'))localStorage.setItem(k+'-before-shared-character',raw);}
const base=a|| (ch===1?s:null),sea=b||(ch===2?s:null),items={herb:3,ether:2,ore:0,shell:0,wood:0,flax:0,thread:0,...base?.items};
// Old chapter supplies overlapped; retain the larger count, never add two starter kits.
if(!base)items.herb=sea?.herbs??3;
items.seaMaterial=b?.materials||0;
const f=base?.flags||{},unlocks={earth:!!f.earth,water:!!f.water,none:true,swift:!!f.tools,heavy:!!f.tools,split:!!f.split,guard:!!f.guard,focused:!!f.focused,steady:!!f.steady};
localStorage.setItem(key,JSON.stringify({version:1,defense:base?.defense||0,hp:base?.hp??sea?.hp??240,maxHp:base?.maxHp??240,mp:base?.mp??sea?.mp??30,maxMp:base?.maxMp??30,active:base?.active||sea?.rune||'earth',support:base?.support||sea?.support||'none',items,unlocks}));}
function bind(s,ch,isolated=false){if(isolated)return;init(ch,s);const get=()=>read(key),set=(k,v)=>{const p=get();p[k]=v;localStorage.setItem(key,JSON.stringify(p));};
const field=(target,k,shared)=>Object.defineProperty(target,k,{enumerable:true,configurable:true,get:()=>get()[shared]??(shared==='defense'?0:undefined),set:v=>set(shared,v)});
for(const k of ['hp','mp','maxHp','maxMp','support','defense'])field(s,k,k);field(s,ch===1?'active':'rune','active');
const items=new Proxy({}, {get:(_,k)=>k==='toJSON'?()=>get().items:get().items[k]??0,set:(_,k,v)=>{const p=get();p.items[k]=v;localStorage.setItem(key,JSON.stringify(p));return true;},ownKeys:()=>Object.keys(get().items),getOwnPropertyDescriptor:()=>({enumerable:true,configurable:true})});
if(ch===1)Object.defineProperty(s,'items',{configurable:true,enumerable:true,get:()=>items});else for(const [k,i]of [['herbs','herb'],['materials','seaMaterial']])Object.defineProperty(s,k,{configurable:true,enumerable:true,get:()=>items[i],set:v=>items[i]=v});
}
function unlock(s,ch){const p=read(key);if(!p)return;const f=s.flags||{};for(const [k,v]of Object.entries(ch===1?{earth:f.earth,water:f.water,swift:f.tools,heavy:f.tools,split:f.split,guard:f.guard}:{earth:true,water:true,focused:true,steady:true}))if(v)p.unlocks[k]=true;localStorage.setItem(key,JSON.stringify(p));}
const storyItems=()=>{const b=read(two),a=read(one);return [a?.flags?.tools?'達蒙的鑿子':'',b?(b.flags?.kraken==='calm'?'母親的陶瓶（油已用於救治）':b.step>=11?'母親的橄欖油（半瓶）':'母親的橄欖油'):'',b?.flags?.tideRune?'海潮拓印 · 斷裂的逆刻環 · 熄滅的粗晶':''].filter(Boolean).join(' · ');};
window.SharedCharacter={storyItems,bind,unlock,has:k=>!!read(key)?.unlocks[k],names,supports,bag:()=>Object.entries(read(key)?.items||{}).map(([k,v])=>(names[k]||k)+' '+v).join(' · ')};
})();
