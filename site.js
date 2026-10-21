(() => {
  'use strict';

  const file = location.pathname.split('/').pop() || 'index.html';
  const isHome = file === 'index.html';
  const work = file === 'harizmi.html' ? 'harizmi' : file === 'adelard.html' ? 'adelard' : file.startsWith('idrisi') ? 'idrisi' : file === 'fibonacci.html' ? 'fibonacci' : '';
  const section = isHome ? 'home' : file === 'gutas.html' ? 'reading' : file === 'gorseller.html' ? 'gallery' : file === 'kaynaklar.html' ? 'sources' : file === 'gerard.html' || file === 'eserler.html' || file === 'ceviriler.html' ? 'works' : work === 'idrisi' ? 'maps' : work ? 'works' : '';
  const mark = '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="21" stroke="currentColor" stroke-width="1"/><path d="M12 15.5c4.7-1 8.6.2 12 3.3 3.4-3.1 7.3-4.3 12-3.3v17c-4.7-1-8.6.2-12 3.3-3.4-3.1-7.3-4.3-12-3.3v-17Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M24 19v16.5M16 21.5c1.7.1 3.1.7 4.5 1.6M16 26.5c1.7.1 3.1.7 4.5 1.6M27.5 23.1c1.4-.9 2.8-1.5 4.5-1.6M27.5 28.1c1.4-.9 2.8-1.5 4.5-1.6" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><circle cx="39" cy="9" r="2.4" fill="currentColor"/></svg>';
  const current = (value, page = true) => section === value ? ` aria-current="${page ? 'page' : 'location'}"` : '';

  if (!document.querySelector('.site-header')) {
    const oldHeader = document.querySelector('.reader-header');
    const oldSwitcher = document.querySelector('.work-switcher');
    const tools = oldHeader ? [...oldHeader.children].filter(node => !node.classList.contains('brand')) : [];
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="site-header-inner">
        <a class="site-brand" href="./" aria-label="Hikmet Evi · Anasayfa"><span class="site-symbol">${mark}</span><span class="site-wordmark">Hikmet Evi<span class="site-tagline">Diller · Düşünceler · Yolculuklar</span></span></a>
        <button class="site-menu-toggle" type="button" aria-controls="site-navigation" aria-expanded="false"><span>Menü</span><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>
        <nav id="site-navigation" class="site-navigation" aria-label="Ana menü">
          <a href="./"${current('home')}>Anasayfa</a><a href="eserler.html"${current('works', file === 'eserler.html')}>Eserler</a><a href="gutas.html"${current('reading')}>Derin okuma</a><a href="idrisi.html"${current('maps', file === 'idrisi.html')}>Haritalar</a><a href="gorseller.html"${current('gallery')}>Görseller</a><a href="kaynaklar.html"${current('sources')}>Kaynaklar</a>
        </nav>
      </div>
      <div class="site-collection"><div class="site-collection-inner"><nav class="site-worknav" aria-label="Eserler arasında gezin"><span class="site-worknav-label">OKUMA MASASI</span>${[
        ['harizmi', 'harizmi.html', 'Hârizmî', 'Cebir ve Mukabele'],
        ['adelard', 'adelard.html', 'Adelard', 'Doğa Soruları'],
        ['idrisi', 'idrisi.html', 'İdrisi', 'Haritalar'],
        ['fibonacci', 'fibonacci.html', 'Fibonacci', 'Hesap Kitabı']
      ].map(([key, href, name, label]) => `<a href="${href}"${work === key ? ` aria-current="${file === href ? 'page' : 'location'}"` : ''}><span>${name}</span><span class="site-worknav-note">${label}</span></a>`).join('')}</nav></div></div>`;
    if (tools.length) {
      const context = document.createElement('div');
      context.className = 'site-context-tools';
      tools.forEach(node => context.appendChild(node));
      header.querySelector('.site-collection-inner').appendChild(context);
    }
    if (oldHeader) oldHeader.replaceWith(header);
    else {
      const skip = document.querySelector('body > .skip');
      if (skip) skip.after(header);
      else document.body.prepend(header);
    }
    if (oldSwitcher) oldSwitcher.remove();
  }

  const header = document.querySelector('.site-header');
  const toggle = header.querySelector('.site-menu-toggle');
  const navigation = header.querySelector('.site-navigation');
  if (toggle && navigation) {
    const closeMenu = (restoreFocus = false) => {
      toggle.setAttribute('aria-expanded', 'false');
      header.classList.remove('site-menu-open');
      if (restoreFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(expanded));
      header.classList.toggle('site-menu-open', expanded);
    });
    navigation.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(header.contains(document.activeElement));
    });
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) closeMenu();
    });
    const mobile = matchMedia('(max-width: 900px)');
    const changed = () => closeMenu(navigation.contains(document.activeElement) && mobile.matches);
    if (mobile.addEventListener) mobile.addEventListener('change', changed);
    else mobile.addListener(changed);
  }

  if (!document.querySelector('.site-footer')) {
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `<div class="site-footer-inner"><div class="site-footer-heading"><a class="site-footer-brand" href="./">Hikmet Evi<span>Bilginin diller ve yüzyıllar arasındaki yolculuğu.</span></a><a class="site-footer-source" href="kaynaklar.html">Kaynaklar ve çalışma yöntemi <span aria-hidden="true">↗</span></a></div><nav class="site-footer-works" aria-label="Eserlere hızlı erişim"><a href="harizmi.html">Hârizmî<span>92 metin sayfası</span></a><a href="adelard.html">Adelard<span>6 doğa sorusu</span></a><a href="idrisi.html">İdrisi<span>Haritalar ve karşılaştırmalar</span></a><a href="fibonacci.html">Fibonacci<span>2 kısa okuma</span></a><a href="gerard.html#el-mecisti">Batlamyus<span>El-Mecistî’den seçki</span></a><a href="gerard.html#tip-kanunu">İbn Sînâ<span>Tıp Kanunu’ndan seçki</span></a></nav><div class="site-footer-bottom"><p>Jonathan Lyons’un <em>Hikmet Evi</em> ve Dimitri Gutas’ın <em>Yunanca Düşünce, Arapça Kültür</em> kitaplarıyla birlikte yürüyen bağımsız bir okuma çalışması.</p><p>Türkçe çalışma çevirileri ve modern açıklamalar kaynak metinden ayrıdır. Tarihî canlandırmalar yapay zekâyla üretilmiştir.</p></div></div>`;
    document.body.appendChild(footer);
  }
})();
