"use strict";
const translations = [...document.querySelectorAll('[data-zh]')];
translations.forEach(element => { element.dataset.en = element.innerHTML; });
let language = 'en';
const languageSwitch = document.getElementById('language-switch');
const themeSwitch = document.getElementById('theme-switch');
function applyLanguage() {
 translations.forEach(element => { element.innerHTML = element.dataset[language]; });
 document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
 languageSwitch.textContent = language === 'en' ? '中文' : 'EN';
 languageSwitch.setAttribute('aria-label', language === 'en' ? '切换为中文' : 'Switch to English');
 document.querySelector('.profile img').alt = language === 'en' ? 'Xinchang Wang at graduation' : '王心畅的毕业照';
 document.querySelector('nav').setAttribute('aria-label', language === 'en' ? 'Main navigation' : '主导航');
 updateThemeLabel();
}
languageSwitch.addEventListener('click', () => { language = language === 'en' ? 'zh' : 'en'; applyLanguage(); });
function updateThemeLabel() {
 const dark = document.documentElement.dataset.theme === 'dark';
 themeSwitch.textContent = dark ? '☀' : '☾';
 themeSwitch.setAttribute('aria-label', language === 'en' ? (dark ? 'Switch to light theme' : 'Switch to dark theme') : (dark ? '切换浅色主题' : '切换深色主题'));
}
themeSwitch.addEventListener('click', () => { document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; updateThemeLabel(); });
const citations = {
  radet: `@misc{wang2026radetuniversaldetectionaigenerated,
  title = {RA-Det: Towards Universal Detection of AI-Generated Images via Robustness Asymmetry},
  author = {Xinchang Wang and Yunhao Chen and Yuechen Zhang and Congcong Bian and Zihao Guo and Xingjun Ma and Hui Li},
  year = {2026},
  eprint = {2603.01544},
  archivePrefix = {arXiv},
  primaryClass = {cs.CV},
  url = {https://arxiv.org/abs/2603.01544}
}`,
  mamba: `@inproceedings{wang2026mambaguard,
  author = {Wang, Xinchang and Zhang, Yuechen and Guo, Zihao and Qiu, Wenyao and Cheng, Chunyang and Li, Hui},
  title = {MambaGuard: A CLIP-Mamba Approach for OOD Generated Image Detection},
  booktitle = {Pattern Recognition and Computer Vision (PRCV 2025)},
  year = {2026},
  series = {Lecture Notes in Computer Science},
  volume = {16275},
  pages = {362--375},
  publisher = {Springer},
  doi = {10.1007/978-981-95-5699-1_25}
}`
};
let toastTimer;
function notify(message) {
 const toast = document.getElementById('toast'); toast.textContent = message; toast.hidden = false;
 clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 2500);
}
document.querySelectorAll('[data-citation]').forEach(button => {
 const panel = document.getElementById('bib-' + button.dataset.citation);
 panel.querySelector('pre').textContent = citations[button.dataset.citation];
 button.addEventListener('click', () => { panel.hidden = !panel.hidden; button.setAttribute('aria-expanded', String(!panel.hidden)); });
});
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
 const value = citations[button.dataset.copy];
 try {
  if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
  else {
   const input = document.createElement('textarea'); input.value = value; input.style.position = 'fixed'; input.style.opacity = '0'; document.body.append(input); input.select();
   const copied = document.execCommand('copy'); input.remove(); if (!copied) throw new Error('copy unavailable');
  }
  notify(language === 'en' ? 'Citation copied.' : '已复制引用。');
 } catch {
  const pre = button.parentElement.querySelector('pre'); const selection = window.getSelection(); const range = document.createRange(); range.selectNodeContents(pre); selection.removeAllRanges(); selection.addRange(range);
  notify(language === 'en' ? 'Citation selected. Press Ctrl/Cmd+C to copy.' : '已选中引用，请按 Ctrl/Cmd+C 复制。');
 }
}));
applyLanguage();
