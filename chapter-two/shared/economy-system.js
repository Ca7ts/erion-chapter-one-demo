(function(root){'use strict';
 const currency='德拉克馬',prices={herb:18,ether:16,medicinalLeaf:6,returnFeather:12,travelPass:18};
 const bounties={...{"screeMask":7,"chainShade":12,"laurelMaw":13,"bronzeHarpy":15,"riftRam":17,"ashAmphora":17,"oathStatue":19,"tidalCrab":20,"saltSerpent":18,"shellLament":19},shell:7,larva:4,root:11,mother:45,guardian:70,lizard:10,moth:8,boar:14,copperShell:36,ochreStele:27,drownedNewt:31,chainLamplighter:35,whiteThornStag:35,galeBronzeWing:39,brokenCenser:43,reefTideBearer:47};
 function init(s){s.economy??={version:1,balance:60,earned:0,spent:0,receipts:{},starterGranted:true};const w=s.economy;w.receipts??={};for(const key of ['balance','earned','spent'])w[key]=Math.max(0,Math.floor(w[key]||0));return w;}
 function settle(s,spec,id){const w=init(s);if(w.receipts[id])return {...w.receipts[id]};const coins=(spec.defeated||spec.enemies.map(kind=>({kind}))).reduce((n,e)=>n+(e.summoned?0:bounties[e.kind]||0),0);w.balance+=coins;w.earned+=coins;
  const hp=s.hp>0?Math.min(s.maxHp-s.hp,Math.round(s.maxHp*.06)):0,mp=s.hp>0?Math.min(s.maxMp-s.mp,2):0;s.hp+=hp;s.mp+=mp;
  const receipt={coins,recovery:{hp,mp}};w.receipts[id]=receipt;return {...receipt};
 }
 function buy(s,key,count=1){const w=init(s),price=prices[key];if(!price||!Number.isInteger(count)||count<1||count>20||w.balance<price*count)return false;w.balance-=price*count;w.spent+=price*count;s.items[key]=(s.items[key]||0)+count;return true;}
 function craftMedicine(s,count=1){if(!Number.isInteger(count)||count<1||count>20||(s.items.medicinalLeaf||0)<count*2)return false;s.items.medicinalLeaf-=count*2;s.items.herb=(s.items.herb||0)+count;return true;}
 const api={currency,prices,bounties,init,settle,buy,craftMedicine};if(typeof module!=='undefined')module.exports=api;else root.Economy=api;
})(typeof window!=='undefined'?window:globalThis);
