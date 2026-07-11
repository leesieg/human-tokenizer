import { currentLang } from './i18n.js';

let themes = {};
let identity = localStorage.getItem('ht_identity') || 'default';

export async function loadThemes() {
  themes = await (await fetch('data/themes.json')).json();
  if (!themes[identity]) identity = 'default';
  applyTheme();
}

export function themeEntries() {
  return Object.entries(themes);
}

export function currentIdentity() { return identity; }

// 身份 = 厂商 key；default 表示无身份（人类原味）
export function identityVendor() {
  return identity === 'default' ? null : identity;
}

export function setIdentity(key) {
  identity = themes[key] ? key : 'default';
  localStorage.setItem('ht_identity', identity);
  applyTheme();
}

export function themeName(key) {
  const th = themes[key];
  if (!th) return key;
  return currentLang() === 'zh' ? th.name_zh : th.name_en;
}

export function themeIcon(key) {
  const th = themes[key];
  if (!th || !th.icon) return null;
  return { file: th.icon, mono: !!th.iconMono };
}

// 当前身份的举牌吐槽役图片（没有则 null）
export function themeMascot() {
  const th = themes[identity];
  return th && th.mascotImg ? `assets/mascots/${th.mascotImg}` : null;
}

// 供 canvas 卡片读取当前主题色
export function themeColors() {
  return themes[identity] || themes.default;
}

function applyTheme() {
  const th = themes[identity] || themes.default;
  const r = document.documentElement.style;
  r.setProperty('--bg', th.bg);
  r.setProperty('--panel', th.panel);
  r.setProperty('--text', th.text);
  r.setProperty('--muted', th.muted);
  r.setProperty('--accent', th.accent);
  r.setProperty('--accent2', th.accent2);
  r.setProperty('--line', th.line);
  r.setProperty('--btn-text', th.btnText);
  document.body.dataset.mode = th.mode;
  document.body.classList.toggle('serif', !!th.serif);
}
