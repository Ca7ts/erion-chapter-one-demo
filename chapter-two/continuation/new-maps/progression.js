(function(root){'use strict';
 const rewards={'R2-00':20,'R2-01':25,'R2-02':25,'R2-03':40,'R2-04':45,'R2-05':30,'R2-06':80,'R2-07':35,'R2-08':35,'R2-10':55,'R2-11A':60,'R2-11B':60,'R2-12':35,'R2-13':45,'R2-14':100,'R2-15':60,'R2-16':80};
 const grants={'R2-00':{motherOilJar:1},'R2-08':{pearlWhistle:1},'R2-14':{tideRubbing:1,removedRing:1,spentCrystals:12},'R2-16':{leonLetter:1}};
 function award(S,state,Growth,id,title){
  const receipt='c2-story-'+(id.startsWith('R2-11')?'R2-11-route':id),xp=rewards[id]||0;
  if(xp&&Growth.award(state,receipt,xp)){state.growth.history.at(-1).title='第二章 · '+title;S.lastStoryReward={id,xp};}
  // Separate item receipts allow interrupted saves to resume without granting twice.
  S.itemReceipts??={};if(grants[id]&&!S.itemReceipts[id]){for(const [key,n]of Object.entries(grants[id]))state.items[key]=Math.max(state.items[key]||0,n);S.itemReceipts[id]=true;}
 }
 function collectTimber(S,state,Growth,index){S.side.woodPicked??=[];if(S.side.timber!==1||![0,1,2].includes(index)||S.side.woodPicked.includes(index))return false;S.side.woodPicked.push(index);S.side.wood=S.side.woodPicked.length;if(S.side.wood===3){S.side.timber=2;S.herbs+=2;Growth.award(state,'c2-timber',60);}return true;}
 const api={rewards,grants,award,collectTimber};if(typeof module!=='undefined')module.exports=api;else root.SeaNewProgression=api;
})(typeof window!=='undefined'?window:globalThis);
