(() => {
 'use strict';
 const mobile=matchMedia('(max-width:1050px), (hover:none) and (max-width:1366px)');const sync=()=>{document.body.classList.toggle('mobile-game',mobile.matches);document.documentElement.style.setProperty('--game-vh',(window.visualViewport?.height||innerHeight)+'px');};sync();mobile.addEventListener('change',sync);window.addEventListener('resize',sync);window.visualViewport?.addEventListener('resize',sync);

 // Variables containing relative URLs resolve against the consuming stylesheet.
 // Resolve against the document once, so shared UI skins cannot duplicate sea-ui/.
 function icons(){for(const node of document.querySelectorAll('[data-menu-icon]')){
  const value=node.style.getPropertyValue('--menu-art'),match=value.match(/^url\(["']?([^"')]+)["']?\)$/);
  if(match&&!/^(https?:|data:)/.test(match[1]))node.style.setProperty('--menu-art',`url("${new URL(match[1],document.baseURI).href}")`);
 }}
 icons();const observer=new MutationObserver(icons);observer.observe(document.querySelector('.top'),{subtree:true,childList:true});
})();
