(() => {
  let current, closeTimer, removeTimer;
  window.showQuestScroll = (host, text, heading) => {
    clearTimeout(closeTimer); clearTimeout(removeTimer); current?.remove();
    const scroll = document.createElement('div');
    scroll.className = 'quest-scroll';
    scroll.setAttribute('role', 'status'); scroll.setAttribute('aria-live', 'polite');
    for (const name of ['paper', 'roller left', 'roller right']) {
      const part = document.createElement('span'); part.className = name;
      part.setAttribute('aria-hidden', 'true'); scroll.append(part);
    }
    const message = document.createElement('div'); message.className = 'message';
    const title = document.createElement('strong'); title.textContent = heading || (/^委託完成/.test(text) ? '委託完成' : /恢復|回復/.test(text) ? '休整補給' : /^新目標|支線已開放/.test(text) ? '旅程指引' : '旅途提示');
    const detail = document.createElement('span'); detail.textContent = text.replace(/^委託完成[，。\s]*/, '');
    message.append(title, detail); scroll.append(message); host.append(scroll); current = scroll;
    requestAnimationFrame(() => requestAnimationFrame(() => { if (current === scroll) {scroll.classList.add('open');window.ChapterOneAudio?.play('U01',.65,'ui');} }));
    closeTimer = setTimeout(() => {
      if(current===scroll)window.ChapterOneAudio?.play('U02',.6,'ui');
      scroll.classList.add('closing'); scroll.classList.remove('open');
      removeTimer = setTimeout(() => { scroll.remove(); if (current === scroll) current = null; }, 650);
    }, 2500);
  };
})();

