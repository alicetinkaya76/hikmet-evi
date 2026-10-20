(() => {
  'use strict';
  const books = [...document.querySelectorAll('.library-book')];
  const filters = [...document.querySelectorAll('[data-work-filter]')];
  const count = document.getElementById('work-count');
  if (!books.length || !count) return;
  const setFilter = value => {
    books.forEach(book => { book.hidden = value === 'gerard' && book.dataset.translator !== 'gerard'; });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.workFilter === value)));
    const number = books.filter(book => !book.hidden).length;
    count.textContent = `${number} eser`;
  };
  const revealLinkedBook = () => {
    const linked = books.find(book => '#' + book.id === location.hash);
    if (!linked) return;
    if (linked.hidden) setFilter('all');
    linked.scrollIntoView({block:'start'});
  };
  filters.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.workFilter)));
  document.body.classList.add('library-enhanced');
  window.addEventListener('hashchange', revealLinkedBook);
  setFilter('all');
  revealLinkedBook();
})();
