(() => {
  'use strict';
  const controls = document.querySelector('.gutas-network-tools');
  const cards = [...document.querySelectorAll('.gutas-actor')];
  if (!controls || !cards.length) return;
  const buttons = [...controls.querySelectorAll('button[data-need]')];
  const result = document.querySelector('#gutas-filter-result');
  const applyFilter = value => {
    let count = 0;
    cards.forEach(card => {
      const visible = value === 'all' || card.dataset.needs.split(' ').includes(value);
      card.hidden = !visible;
      if (visible) count += 1;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.need === value)));
    const label = buttons.find(button => button.dataset.need === value)?.textContent.trim() || 'Tümü';
    result.textContent = value === 'all' ? `${count} kişi ve çalışma çevresi gösteriliyor.` : `${label}: ${count} kişi ve çalışma çevresi.`;
  };
  buttons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.need)));
  const revealTarget = () => {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (target?.tagName === 'DETAILS') target.open = true;
    if (target?.classList.contains('gutas-actor') && target.hidden) {
      applyFilter('all');
      requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
    }
  };
  window.addEventListener('hashchange', revealTarget);
  document.documentElement.classList.add('gutas-enhanced');
  applyFilter('all');
  revealTarget();
})();
