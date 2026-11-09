(() => {
  'use strict';
  const dialog = document.querySelector('dialog#cinematic,dialog#story');
  const source = dialog?.querySelector('#scene-screen,#cinema');
  if (!dialog || !source) return;
  const backdrop = document.createElement('canvas');
  backdrop.className = 'story-soft-backdrop';
  backdrop.width = 320; backdrop.height = 180;
  backdrop.setAttribute('aria-hidden','true');
  dialog.prepend(backdrop);
  const ctx = backdrop.getContext('2d');
  let timer;
  const update = () => {
    clearInterval(timer);
    document.body.classList.toggle('story-viewport-active',dialog.open);
    if (dialog.open) {
      const paint = () => { if (ctx) ctx.drawImage(source,0,0,320,180); };
      paint(); timer = setInterval(paint,250);
    }
  };
  new MutationObserver(update).observe(dialog,{attributes:true,attributeFilter:['open']});
  window.addEventListener('pagehide',() => clearInterval(timer));
  window.addEventListener('pageshow',update);
  update();
})();
