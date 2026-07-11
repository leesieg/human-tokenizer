import { initI18n, t, toggleLang, currentLang } from './i18n.js';
import { countBaseTokens } from './tokenizer.js';
import { loadData, apiBill, planUsage, humanRate, outputUsdPerMtok, vendorTopModel, fx, dataDate } from './pricing.js';
import { drawCard } from './card.js';
import { loadThemes, themeEntries, themeName, themeIcon, currentIdentity, identityVendor, setIdentity } from './theme.js';

const $ = id => document.getElementById(id);
let lastResult = null;

// 文本类文件白名单（扩展名）
const TEXT_EXT = /\.(txt|md|markdown|csv|tsv|json|yaml|yml|xml|html|css|js|mjs|ts|tsx|jsx|py|java|go|rs|rb|php|c|h|cpp|hpp|cs|swift|kt|sql|sh|bash|zsh|toml|ini|cfg|conf|log|tex|vue|svelte)$/i;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

init();

async function init() {
  await Promise.all([initI18n(), loadData(), loadThemes()]);
  $('data-date').textContent = `data: ${dataDate()}`;
  renderChips();

  $('lang-toggle').addEventListener('click', () => {
    toggleLang();
    renderChips();
    if (lastResult) render(lastResult);
  });
  $('calc-btn').addEventListener('click', calculate);
  $('share-btn').addEventListener('click', share);
  $('card-close').addEventListener('click', closeCardModal);
  $('card-modal').addEventListener('click', e => {
    if (e.target === $('card-modal')) closeCardModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCardModal();
  });
  $('card-save').addEventListener('click', saveCard);

  // Tabs
  $('tab-api').addEventListener('click', () => switchTab('api'));
  $('tab-plans').addEventListener('click', () => switchTab('plans'));

  // 文件上传
  $('upload-btn').addEventListener('click', () => $('file-input').click());
  $('file-input').addEventListener('change', e => addFiles(e.target.files));
  const ta = $('work-input');
  ta.addEventListener('dragover', e => { e.preventDefault(); ta.classList.add('dragover'); });
  ta.addEventListener('dragleave', () => ta.classList.remove('dragover'));
  ta.addEventListener('drop', e => {
    e.preventDefault();
    ta.classList.remove('dragover');
    addFiles(e.dataTransfer.files);
  });

  let timer;
  ['work-input', 'salary-input', 'hours-input', 'salary-currency'].forEach(id => {
    $(id).addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (lastResult) calculate(); }, 400);
    });
  });
}

// —— 身份选择 ——

function renderChips() {
  $('identity-chips').innerHTML = themeEntries().map(([key]) => {
    const ic = themeIcon(key);
    const iconHtml = ic
      ? `<img src="vendor/icons/${ic.file}" class="${ic.mono ? 'mono' : ''}" alt="">`
      : '<span class="emoji-icon">🧑‍💻</span>';
    return `<button class="chip ${key === currentIdentity() ? 'active' : ''}" data-key="${key}">${iconHtml}${themeName(key)}</button>`;
  }).join('');
  $('identity-chips').querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      setIdentity(btn.dataset.key);
      renderChips();
      if (lastResult) render(lastResult);
    });
  });
}

// —— 文件读取 ——

async function addFiles(fileList) {
  const files = [...fileList];
  let added = 0, chars = 0;
  const skipped = [];
  for (const f of files) {
    const isText = TEXT_EXT.test(f.name) || (f.type && f.type.startsWith('text/'));
    if (!isText || f.size > MAX_FILE_BYTES) { skipped.push(f.name); continue; }
    const content = await f.text();
    const ta = $('work-input');
    ta.value += (ta.value ? '\n\n' : '') + `--- ${f.name} ---\n` + content;
    added++;
    chars += content.length;
  }
  const parts = [];
  if (added) parts.push(t('files_added', { n: added, c: chars.toLocaleString() }));
  skipped.forEach(name => parts.push(t('file_skipped', { name })));
  $('upload-status').textContent = parts.join(' · ');
  $('file-input').value = '';
  if (added) calculate();
}

// —— Tabs ——

function switchTab(which) {
  $('tab-api').classList.toggle('active', which === 'api');
  $('tab-plans').classList.toggle('active', which === 'plans');
  $('panel-api').classList.toggle('hidden', which !== 'api');
  $('panel-plans').classList.toggle('hidden', which !== 'plans');
}

// —— 计算与渲染 ——

function calculate() {
  const text = $('work-input').value;
  if (!text.trim()) {
    $('results').classList.add('hidden');
    $('empty-hint').classList.remove('hidden');
    return;
  }
  $('empty-hint').classList.add('hidden');

  const baseTokens = countBaseTokens(text);
  const bill = apiBill(baseTokens);
  const usage = planUsage(baseTokens);

  const salary = parseFloat($('salary-input').value) || 0;
  const hours = parseFloat($('hours-input').value) || 0;
  const currency = $('salary-currency').value;
  const human = salary > 0 ? humanRate(salary, currency, hours, baseTokens) : null;

  lastResult = { text, baseTokens, bill, usage, human, salary, hours, currency };
  render(lastResult);
}

function render(r) {
  $('results').classList.remove('hidden');

  // 吉祥物咀嚼 + 数字滚动
  const mascot = $('mascot');
  mascot.classList.remove('crunch');
  void mascot.offsetWidth; // 重置动画
  mascot.classList.add('crunch');
  countUp($('token-count'), r.baseTokens, n => t('result_tokens', { n }));
  $('char-count').textContent = t('result_chars', { c: r.text.length.toLocaleString() });

  renderBill(r);
  renderPlans(r);
  renderDuel(r);
}

function countUp(el, target, fmt) {
  const dur = 450;
  const start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(Math.round(target * eased).toLocaleString());
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderBill(r) {
  const maxUsd = r.bill[r.bill.length - 1].usd || 1e-9;
  $('api-table').innerHTML = r.bill.map(row => `
    <div class="model-row">
      <div class="model-name" title="${row.model.name}">${row.model.name}${row.model.estimate ? '<span class="est">*</span>' : ''}</div>
      <div class="model-bar-wrap"><div class="model-bar" style="width:${Math.max(2, row.usd / maxUsd * 100)}%"></div></div>
      <div class="model-cost">${fmtMoney(row.usd)}</div>
    </div>`).join('');
}

function renderPlans(r) {
  $('plans-list').innerHTML = r.usage.map(u => {
    const name = u.plan.name;
    if (u.kind === 'unlimited') {
      return `<li><div class="plan-head"><span>${name}</span><span class="pct">∞</span></div>
        <p class="sub-note plan-note">${t('plan_unlimited')}</p></li>`;
    }
    const pctText = fmtPct(u.pct);
    const width = Math.max(0.5, Math.min(100, u.pct * 100));
    const key = u.kind === 'msgs' ? 'plan_line_msgs' : 'plan_line';
    return `<li>
      <div class="plan-head"><span>${name}</span><span class="pct">${pctText}</span></div>
      <div class="plan-bar-wrap"><div class="plan-bar" style="width:${width}%"></div></div>
      <p class="sub-note plan-note">${t(key, { window: u.window, pct: pctText, avg: u.avg || '' })}</p>
    </li>`;
  }).join('');
}

function renderDuel(r) {
  const box = $('duel-box');
  if (!r.human) {
    box.innerHTML = `<p class="sub-note">${t('duel_hint')}</p>`;
    lastResult.duel = null;
    return;
  }
  // 对手：选了身份 → 该厂最贵模型；否则全场最贵
  const vendor = identityVendor();
  const opponent = (vendor && vendorTopModel(vendor)) || r.bill[r.bill.length - 1].model;
  const modelRate = outputUsdPerMtok(opponent);
  const ratio = r.human.usdPerMtok / modelRate;
  const punch = pickPunchline(ratio, opponent.name);

  let html = `
    <div class="duel-numbers">
      <div class="duel-cell">
        <div class="val">${fmtMoney(r.human.usdPerMtok)}</div>
        <div class="lbl">${t('duel_your_price')} ${t('per_mtok')}</div>
      </div>
      <div class="duel-cell">
        <div class="val">${fmtMoney(modelRate)}</div>
        <div class="lbl">${opponent.name} ${t('per_mtok')}</div>
      </div>
    </div>
    <p class="punchline">${punch}</p>`;
  if (r.hours > 0) {
    html += `<p class="sub-note">${t('hours_cost_line', { cost: fmtMoney(r.human.costUsd) })}</p>`;
  }
  box.innerHTML = html;
  lastResult.duel = { ratio, opponent: opponent.name, punch };
}

function pickPunchline(ratio, model) {
  const x = fmtRatio(ratio);
  if (ratio < 1) return t('duel_cheaper', { model, x });
  if (ratio < 30) return t('duel_close', { model, x });
  if (ratio < 500) return t('duel_mid', { model, x });
  return t('duel_expensive', { model, x });
}

function share() {
  if (!lastResult) return;
  const r = lastResult;
  const cheapest = r.bill[0];
  const priciest = r.bill[r.bill.length - 1];
  const vendor = identityVendor();
  const canvas = $('share-card');
  drawCard(canvas, {
    tokens: r.baseTokens,
    identityName: vendor ? themeName(currentIdentity()) : null,
    cheapest: { name: cheapest.model.name, cost: fmtMoney(cheapest.usd) },
    priciest: { name: priciest.model.name, cost: fmtMoney(priciest.usd) },
    ratio: r.duel ? { model: r.duel.opponent, x: fmtRatio(r.duel.ratio) } : null,
    punchline: r.duel ? r.duel.punch : null,
  });
  // canvas → <img>：手机长按才能唤起系统保存
  $('card-img').src = canvas.toDataURL('image/png');
  $('card-modal').classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeCardModal() {
  $('card-modal').classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function saveCard() {
  const a = document.createElement('a');
  a.href = $('card-img').src;
  a.download = 'human-tokenizer.png';
  a.click();
}

// —— 格式化 ——

function fmtMoney(usd) {
  const zh = currentLang() === 'zh';
  const cny = usd * fx();
  const p = v => {
    if (v === 0) return '0';
    if (v < 0.01) return v.toPrecision(2);
    if (v < 100) return v.toFixed(2);
    return Math.round(v).toLocaleString();
  };
  return zh ? `¥${p(cny)}` : `$${p(usd)}`;
}

function fmtPct(frac) {
  const pct = frac * 100;
  if (pct < 0.01) return '<0.01%';
  if (pct < 1) return pct.toFixed(2) + '%';
  if (pct < 100) return pct.toFixed(1) + '%';
  return Math.round(pct).toLocaleString() + '%';
}

function fmtRatio(x) {
  if (x >= 100) return Math.round(x).toLocaleString();
  if (x >= 10) return x.toFixed(0);
  return x.toFixed(1);
}
