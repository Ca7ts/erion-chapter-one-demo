(function(root){'use strict';
 const names={returnFeather:'回城羽毛',travelPass:'區域快速通行券'};
 function create(h){
  const s=h.state;let busy=false;
  // A saved departure is either committed by map entry or refunded on reload.
  if(s.travelReservation){const r=s.travelReservation;if(s.area!==r.to)s.items[r.key]=(s.items[r.key]||0)+1;delete s.travelReservation;h.save();}
  function unavailable(key,to){
   if(h.blocked())return {ok:false,reason:'目前無法使用旅行道具。'};
   if(!names[key])return {ok:false,reason:'無效的旅行道具。'};
   if(to===h.area())return {ok:false,reason:'你已經在這個區域，不會消耗道具。'};
   if(!h.canVisit(to))return {ok:false,reason:'這個區域尚未開放，請先推進劇情。'};
   if(!(s.items[key]>0))return {ok:false,reason:'行囊沒有'+names[key]+'。可向多莉購買，或沿道路步行前往。'};
  }
  async function use(key,to){
   if(busy)return {ok:false,reason:'這次旅行正在處理中。'};
   if(key==='returnFeather')to=h.village();
   const issue=unavailable(key,to);if(issue)return issue;
   const from=h.area();busy=true;
   try {
   if(h.confirm){
    if(!await h.confirm(key,to,s.items[key]))return {ok:false,cancelled:true,reason:'已取消旅行。'};
    if(h.area()!==from)return {ok:false,reason:'所在區域已變更，請重新選擇目的地。'};
    const changed=unavailable(key,to);if(changed)return changed;
   }
   s.items[key]--;s.travelReservation={key,from,to};h.onDepart?.();h.save();
   let ok=false;
   try{ok=(await h.change(to))===true;}catch(e){h.onError?.(e);}
   if(!ok)s.items[key]=(s.items[key]||0)+1;
   delete s.travelReservation;h.save();
   if(ok)h.onArrival?.(to);
   return {ok,reason:ok?'已使用'+names[key]+'。':'區域讀取未完成，道具已退回行囊。'};
   } finally {busy=false;}
  }
  return{use,get busy(){return busy;}};
 }
 const api={names,create};if(typeof module!=='undefined')module.exports=api;else root.TravelItems=api;
})(typeof window!=='undefined'?window:globalThis);
