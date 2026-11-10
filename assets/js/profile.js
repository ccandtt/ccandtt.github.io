(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const syncThemeButton = () => {
    const isDark = root.dataset.theme === 'dark';
    toggle?.setAttribute('aria-pressed', String(isDark));
    toggle?.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#1b1920' : '#faf7ff');
  };
  syncThemeButton();
  toggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('xinchang-theme', root.dataset.theme); } catch (error) { /* Theme works without storage. */ }
    syncThemeButton();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    try { if (localStorage.getItem('xinchang-theme')) return; } catch (error) { /* Follow the system preference. */ }
    root.dataset.theme = event.matches ? 'dark' : 'light';
    syncThemeButton();
  });

  const dialog = document.querySelector('.framework-dialog');
  const dialogImage = dialog?.querySelector('.framework-dialog-image');
  const dialogTitle = dialog?.querySelector('.framework-dialog-title');
  const imageStatus = dialog?.querySelector('.framework-image-status');
  dialogImage?.addEventListener('load', () => {
    dialogImage.hidden = false;
    if (imageStatus) imageStatus.hidden = true;
  });
  dialogImage?.addEventListener('error', () => {
    dialogImage.hidden = true;
    if (imageStatus) { imageStatus.hidden = false; imageStatus.textContent = 'Unable to load this image. Please close the preview and try again.'; }
  });
  document.querySelectorAll('[data-framework-src]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!dialog || !dialogImage || !dialogTitle) return;
      dialogImage.hidden = true;
      if (imageStatus) { imageStatus.hidden = false; imageStatus.textContent = 'Loading image…'; }
      const thumbnail = button.querySelector('img');
      dialogImage.width = thumbnail?.naturalWidth || 1200;
      dialogImage.height = thumbnail?.naturalHeight || 800;
      dialogImage.src = button.dataset.frameworkSrc;
      dialogImage.alt = button.dataset.frameworkAlt;
      dialogTitle.textContent = `${button.dataset.frameworkName} — Framework`;
      dialog.showModal();
      document.body.classList.add('framework-open');
    });
  });
  dialog?.querySelector('.framework-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => document.body.classList.remove('framework-open'));
  dialog?.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  const navigation = document.querySelector('.site-navigation');
  const links = [...document.querySelectorAll('.site-navigation a')];
  const positionIndicator = () => {
    const active = navigation?.querySelector('[aria-current]');
    if (!active) return;
    navigation.style.setProperty('--indicator-left', `${active.offsetLeft}px`);
    navigation.style.setProperty('--indicator-width', `${active.offsetWidth}px`);
    requestAnimationFrame(() => navigation.setAttribute('data-indicator-ready', ''));
  };
  const sections = [...document.querySelectorAll('.page__content > section[id]')];
  let scheduled = false;
  const updateNavigation = () => {
    const threshold = (document.querySelector('.masthead')?.getBoundingClientRect().height || 56) + 40;
    let active = sections[0];
    sections.forEach((section) => { if (section.getBoundingClientRect().top <= threshold) active = section; });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) active = sections[sections.length - 1];
    const destination = sections.find((section) => `#${section.id}` === window.location.hash);
    if (destination) {
      const bounds = destination.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > threshold) active = destination;
    }
    links.forEach((link) => {
      if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    positionIndicator();
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); }
  }, { passive: true });
  window.addEventListener('resize', updateNavigation);
  window.addEventListener('hashchange', updateNavigation);
  document.fonts?.ready.then(positionIndicator);
  updateNavigation();
})();
