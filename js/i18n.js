let dict = {};
let lang = localStorage.getItem('ht_lang')
  || (navigator.language && navigator.language.startsWith('zh') ? 'zh' : 'en');

export async function initI18n() {
  dict = await (await fetch('data/i18n.json')).json();
  applyLang();
}

export function t(key, vars = {}) {
  let s = (dict[lang] && dict[lang][key]) || key;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, v);
  }
  return s;
}

export function currentLang() { return lang; }

export function toggleLang() {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('ht_lang', lang);
  applyLang();
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
}
