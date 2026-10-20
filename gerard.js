(() => {
  'use strict';
  const samples = [...document.querySelectorAll('.gerard-sample')];
  const byId = new Map(samples.map(section => [section.id, section]));
  const chooser = document.getElementById('example-select');
  const mobile = matchMedia('(max-width: 1000px)');
  const paneKeys = ['sources', 'ar', 'la', 'tr'];
  let current = samples[0];

  const setPane = (section, key) => {
    if (!paneKeys.includes(key)) key = 'tr';
    section.dataset.activePane = key;
    section.querySelectorAll('[data-pane-target]').forEach(tab => {
      const active = tab.dataset.paneTarget === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    section.querySelectorAll('[data-pane]').forEach(pane => {
      pane.hidden = mobile.matches && pane.dataset.pane !== key;
    });
  };
  const selectSample = (id, scroll = false) => {
    const section = byId.get(id) || samples[0];
    current = section;
    samples.forEach(sample => { sample.hidden = sample !== section; });
    chooser.value = section.id;
    document.querySelectorAll('.example-links a').forEach(link => {
      if (link.getAttribute('href') === '#' + section.id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    setPane(section, section.dataset.activePane || 'tr');
    document.title = section.dataset.shortTitle + ' · Karşılıklı okumalar | Hikmet Evi';
    if (scroll) section.scrollIntoView({block:'start'});
  };
  samples.forEach(section => {
    setPane(section, 'tr');
    const tabs = [...section.querySelectorAll('[data-pane-target]')];
    tabs.forEach(tab => {
      tab.addEventListener('click', () => setPane(section, tab.dataset.paneTarget));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const index = tabs.indexOf(tab);
        const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[tabs.length-1] : tabs[(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length];
        setPane(section, next.dataset.paneTarget);
        next.focus();
      });
    });
  });
  chooser.addEventListener('change', () => {
    if (location.hash === '#' + chooser.value) selectSample(chooser.value, true);
    else location.hash = chooser.value;
  });
  window.addEventListener('hashchange', () => { if (byId.has(location.hash.slice(1))) selectSample(location.hash.slice(1), true); });
  const resize = () => samples.forEach(section => setPane(section, section.dataset.activePane || 'tr'));
  if (mobile.addEventListener) mobile.addEventListener('change', resize);
  else mobile.addListener(resize);
  document.body.classList.add('gerard-enhanced');
  selectSample(location.hash.slice(1));

  const dialog = document.getElementById('gerard-scan-dialog');
  const image = document.getElementById('gerard-scan-image');
  const title = document.getElementById('gerard-scan-title');
  const original = document.getElementById('gerard-scan-original');
  let opener = null;
  document.querySelectorAll('.source-image-button').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      image.src = button.dataset.full;
      image.alt = button.dataset.title;
      title.textContent = button.dataset.title;
      original.href = button.dataset.full;
      dialog.showModal();
    });
  });
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (opener) opener.focus(); });
})();
