(() => {
  'use strict';

  const script = document.currentScript;
  const measurementId = (script?.dataset.measurementId || '').trim();
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;

  const production = location.origin === 'https://alicetinkaya76.github.io'
    && (location.pathname === '/hikmet-evi' || location.pathname.startsWith('/hikmet-evi/'));
  const preview = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(location.hostname);
  if (!production && !preview) return;
  if (window.__hikmetAnalyticsInstalled) return;
  window.__hikmetAnalyticsInstalled = true;

  const consentKey = 'hikmet-analytics-consent-v1';
  const disableKey = 'ga-disable-' + measurementId;
  const tagId = 'hikmet-google-analytics';
  const advertisingDenied = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  };
  let consent = null;
  let configured = false;
  let tagRequested = false;
  let pageViewSent = false;
  let panel;
  let settingsButton;
  let acceptButton;
  let rejectButton;
  let status;
  let opener = null;

  const validConsent = value => value === 'granted' || value === 'denied' ? value : null;
  try { consent = validConsent(localStorage.getItem(consentKey)); } catch (_) { /* Stay unconsented. */ }
  window[disableKey] = !production || consent !== 'granted';

  const cleanPageLocation = () => location.origin + location.pathname;
  const cleanReferrer = () => {
    if (!document.referrer) return '';
    try {
      const url = new URL(document.referrer);
      if (!['http:', 'https:'].includes(url.protocol)) return '';
      return url.origin + url.pathname;
    } catch (_) {
      return '';
    }
  };

  const updateState = () => {
    document.documentElement.dataset.analyticsConsent = consent || 'unset';
    document.documentElement.dataset.analyticsMode = production ? 'production' : 'preview';
    if (!panel) return;
    acceptButton.setAttribute('aria-pressed', String(consent === 'granted'));
    rejectButton.setAttribute('aria-pressed', String(consent === 'denied'));
    status.textContent = preview
      ? 'Önizleme: tercihler denenebilir; Google’a veri gönderilmez.'
      : consent === 'granted'
        ? 'Şu an ziyaret ölçümüne izin veriyorsun.'
        : consent === 'denied'
          ? 'Şu an ziyaret ölçümünü reddettin.'
          : 'Tercihini sayfanın altındaki “Ziyaret ölçümü” düğmesinden değiştirebilirsin.';
  };

  const clearAnalyticsCookies = () => {
    const names = document.cookie.split(';')
      .map(cookie => cookie.split('=')[0].trim())
      .filter(name => /^_ga(?:_[A-Za-z0-9_]+)?$/.test(name));
    if (!names.length) return;
    const paths = new Set(['/', '/hikmet-evi', '/hikmet-evi/']);
    const segments = location.pathname.split('/').filter(Boolean);
    let path = '';
    segments.forEach(segment => {
      path += '/' + segment;
      paths.add(path);
      paths.add(path + '/');
    });
    const domains = ['', location.hostname, '.' + location.hostname];
    names.forEach(name => paths.forEach(cookiePath => domains.forEach(domain => {
      document.cookie = name + '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path='
        + cookiePath + (domain ? '; Domain=' + domain : '') + '; SameSite=Lax';
    })));
  };

  const stopMeasurement = () => {
    window[disableKey] = true;
    if (production && configured && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ...advertisingDenied,
        analytics_storage: 'denied'
      });
    }
    clearAnalyticsCookies();
  };

  const startMeasurement = () => {
    if (!production || consent !== 'granted') return;
    window[disableKey] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    if (!configured) {
      // Basic consent mode: no Google resource is requested before this grant.
      window.gtag('consent', 'default', {
        ...advertisingDenied,
        analytics_storage: 'granted'
      });
      window.gtag('set', {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: cleanPageLocation(),
        page_referrer: cleanReferrer(),
        send_page_view: false
      });
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: cleanPageLocation(),
        page_referrer: cleanReferrer(),
        send_page_view: false,
        cookie_domain: location.hostname,
        cookie_path: '/hikmet-evi/',
        cookie_flags: 'SameSite=Lax;Secure'
      });
      configured = true;
    } else {
      window.gtag('consent', 'update', {
        ...advertisingDenied,
        analytics_storage: 'granted'
      });
    }

    if (!pageViewSent) {
      // Keep Enhanced Measurement off in the GA4 stream: only this page view is sent.
      window.gtag('event', 'page_view', {
        send_to: measurementId,
        page_location: cleanPageLocation(),
        page_referrer: cleanReferrer(),
        page_title: document.title
      });
      pageViewSent = true;
    }

    if (!tagRequested) {
      tagRequested = true;
      if (document.getElementById(tagId)) return;
      const tag = document.createElement('script');
      tag.id = tagId;
      tag.async = true;
      tag.referrerPolicy = 'origin';
      if (script.nonce) tag.nonce = script.nonce;
      tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
      document.head.appendChild(tag);
    }
  };

  const closePanel = () => {
    if (!panel) return;
    panel.hidden = true;
    settingsButton.setAttribute('aria-expanded', 'false');
    if (opener && document.contains(opener)) opener.focus({preventScroll: true});
    opener = null;
  };

  const openPanel = (focus = false) => {
    if (!panel) return;
    updateState();
    opener = focus ? document.activeElement : null;
    panel.hidden = false;
    settingsButton.setAttribute('aria-expanded', 'true');
    if (focus) (consent === 'denied' ? rejectButton : acceptButton).focus({preventScroll: true});
  };

  const choose = value => {
    consent = value;
    try { localStorage.setItem(consentKey, value); } catch (_) { /* The current choice still applies. */ }
    updateState();
    if (consent === 'granted') startMeasurement();
    else stopMeasurement();
    closePanel();
  };

  const initialise = () => {
    panel = document.createElement('section');
    panel.id = 'analytics-consent';
    panel.className = 'analytics-consent';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'analytics-consent-title');
    panel.setAttribute('aria-describedby', 'analytics-consent-description');
    panel.innerHTML = '<div class="analytics-consent-copy">'
      + '<h2 id="analytics-consent-title">Ziyaret ölçümü</h2>'
      + '<p id="analytics-consent-description">Hangi sayfaların okunduğunu görmek için, izninle Google Analytics kullanıyoruz. Ölçüm çerezleri yalnız izin verirsen açılır. Kişisel okuma notların gönderilmez.</p>'
      + '<p class="analytics-consent-status" id="analytics-consent-status"></p></div>'
      + '<div class="analytics-consent-actions" role="group" aria-label="Ziyaret ölçümü tercihi">'
      + '<button type="button" id="analytics-accept">İzin ver</button>'
      + '<button type="button" id="analytics-reject">Reddet</button></div>'
      + '<button type="button" class="analytics-consent-close" aria-label="Ziyaret ölçümü bildirimini kapat">×</button>';
    acceptButton = panel.querySelector('#analytics-accept');
    rejectButton = panel.querySelector('#analytics-reject');
    status = panel.querySelector('#analytics-consent-status');
    acceptButton.addEventListener('click', () => choose('granted'));
    rejectButton.addEventListener('click', () => choose('denied'));
    panel.querySelector('.analytics-consent-close').addEventListener('click', closePanel);
    panel.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePanel();
      }
    });
    document.body.appendChild(panel);

    const settings = document.createElement('div');
    settings.className = 'analytics-settings';
    settingsButton = document.createElement('button');
    settingsButton.id = 'analytics-settings';
    settingsButton.type = 'button';
    settingsButton.textContent = 'Ziyaret ölçümü';
    settingsButton.setAttribute('aria-controls', panel.id);
    settingsButton.setAttribute('aria-haspopup', 'dialog');
    settingsButton.setAttribute('aria-expanded', 'false');
    settingsButton.addEventListener('click', () => openPanel(true));
    settings.appendChild(settingsButton);
    const footer = document.querySelector('.site-footer-inner') || document.querySelector('footer');
    (footer || document.body).appendChild(settings);

    updateState();
    if (consent === 'granted') startMeasurement();
    else {
      stopMeasurement();
      if (!consent) openPanel();
    }
  };

  window.addEventListener('storage', event => {
    if (event.key !== consentKey && event.key !== null) return;
    consent = validConsent(event.newValue);
    updateState();
    if (consent === 'granted') startMeasurement();
    else stopMeasurement();
    if (!consent) openPanel();
    else closePanel();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, {once: true});
  else initialise();
})();
