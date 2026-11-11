// A shared promise per encounter. Exploration never allocates the weapon renderer.
(()=>{
 let pending=null,generation=0,controller=null;
 window.LoadBattlePresentation=()=>{
  if(pending)return pending;const token=generation;controller=new AbortController();const signal=controller.signal;
  pending=import('../../battle.min.js').then(m=>m.createBattlePresentation({signal})).then(v=>{
   if(token!==generation){v.dispose();return null;}return window.BattlePresentation=v;
  }).catch(e=>{if(e.name!=='AbortError')console.error('Battle presentation',e);if(token===generation)pending=null;return null;});
  return pending;
 };
 window.ReleaseBattlePresentation=()=>{generation++;controller?.abort();controller=null;window.BattlePresentation?.dispose();window.BattlePresentation=null;pending=null;};
 window.BattlePresentationReady={then(resolve,reject){return window.LoadBattlePresentation().then(resolve,reject);}};
})();
