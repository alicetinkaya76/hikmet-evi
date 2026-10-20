(() => {
  'use strict';
  const books = [...document.querySelectorAll('.library-book')];
  const translator = document.getElementById('translator-filter');
  const content = document.getElementById('content-filter');
  const count = document.getElementById('work-count');
  const empty = document.getElementById('library-empty');
  const reset = document.getElementById('library-reset');
  if (!books.length || !translator || !content || !count) return;

  const applyFilters = () => {
    books.forEach(book => {
      const translators = (book.dataset.translators || '').split(/\s+/);
      const matchesTranslator = translator.value === 'all' || translators.includes(translator.value);
      const matchesContent = content.value === 'all' || book.dataset.content === content.value;
      book.hidden = !matchesTranslator || !matchesContent;
    });
    const visible = books.filter(book => !book.hidden).length;
    count.textContent = `${visible} / ${books.length} eser`;
    if (empty) empty.hidden = visible > 0;
    if (reset) reset.hidden = translator.value === 'all' && content.value === 'all';
  };

  const resetFilters = () => {
    translator.value = 'all';
    content.value = 'all';
    applyFilters();
  };

  const revealLinkedBook = () => {
    let linkedId;
    try { linkedId = decodeURIComponent(location.hash.slice(1)); }
    catch { return; }
    const linked = books.find(book => book.id === linkedId);
    if (!linked) return;
    if (linked.hidden) resetFilters();
    linked.scrollIntoView({block: 'start'});
  };

  translator.addEventListener('change', applyFilters);
  content.addEventListener('change', applyFilters);
  if (reset) reset.addEventListener('click', resetFilters);
  window.addEventListener('hashchange', revealLinkedBook);
  window.addEventListener('pageshow', revealLinkedBook);
  document.body.classList.add('library-enhanced');
  resetFilters();
  revealLinkedBook();
})();
