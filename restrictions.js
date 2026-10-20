(() => {
  'use strict';
  const followHash = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    const record = target.closest('.restriction-record');
    if (record) record.open = true;
    requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  };
  window.addEventListener('hashchange',followHash);
  window.addEventListener('pageshow',()=>{if(location.hash)followHash();});
})();
