/* Decorative only. The native click, keyboard activation and game action run first. */
(()=>{
 'use strict';
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('button,summary,[role="button"],a[href]');
  if(!event.isTrusted||!button?.matches('[data-ui-gem]:not([data-ui-close])')||button.matches(':disabled,[aria-disabled="true"]')||
     button.closest('.sr-only,[inert],[data-shop-entry],#sea-stick,#mobile-joystick,#game-resume-overlay'))return;
  const box=button.getBoundingClientRect();
  if(box.width<8||box.height<8)return;
  const inside=event.detail>0&&event.clientX>=box.left&&event.clientX<=box.right&&event.clientY>=box.top&&event.clientY<=box.bottom;
  const x=inside?event.clientX:box.left+box.width/2,y=inside?event.clientY:box.top+box.height/2;
  const quick=!!button.closest('#battle,#story,#cinematic,.rite-performance');
  queueMicrotask(()=>window.ShopEntryFX?.pulse(box,x,y,quick));
 },true);
})();
