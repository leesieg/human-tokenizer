import { modelTokens } from './tokenizer.js';

let pricing = null;
let plans = null;

export async function loadData() {
  [pricing, plans] = await Promise.all([
    fetch('data/pricing.json').then(r => r.json()),
    fetch('data/plans.json').then(r => r.json()),
  ]);
  return { pricing, plans };
}

export function fx() { return pricing.fx_usd_cny; }
export function dataDate() { return pricing.updated; }

// 模型的输出单价，统一折成 USD/1M tok
export function outputUsdPerMtok(m) {
  if (m.output_usd_per_mtok != null) return m.output_usd_per_mtok;
  return m.output_cny_per_mtok / pricing.fx_usd_cny;
}

export function inputUsdPerMtok(m) {
  if (m.input_usd_per_mtok != null) return m.input_usd_per_mtok;
  return m.input_cny_per_mtok / pricing.fx_usd_cny;
}

// 这份工作在各模型下的账单：产出按输出价、投喂按输入价，合计从便宜到贵
export function apiBill(outBaseTokens, inBaseTokens = 0) {
  return pricing.models
    .map(m => {
      const outToks = modelTokens(outBaseTokens, m.token_ratio);
      const inToks = inBaseTokens ? modelTokens(inBaseTokens, m.token_ratio) : 0;
      const outUsd = outToks / 1e6 * outputUsdPerMtok(m);
      const inUsd = inToks / 1e6 * inputUsdPerMtok(m);
      const usd = outUsd + inUsd;
      return { model: m, outTokens: outToks, inTokens: inToks, outUsd, inUsd, usd, cny: usd * pricing.fx_usd_cny };
    })
    .sort((a, b) => a.usd - b.usd);
}

// 订阅额度占比
export function planUsage(baseTokens) {
  return plans.plans.map(p => {
    const q = p.quota;
    if (q.type === 'tokens_per_window') {
      return { plan: p, kind: 'tokens', pct: baseTokens / q.tokens_est, window: q.window_hours };
    }
    if (q.type === 'messages_per_window') {
      const est = q.messages_est * q.assumed_tokens_per_message;
      return { plan: p, kind: 'msgs', pct: baseTokens / est, window: q.window_hours, avg: q.assumed_tokens_per_message };
    }
    return { plan: p, kind: 'unlimited' };
  });
}

// 人的单价：月薪 → USD/1M tok（baseTokens 传产出+投喂总量——人读写一体计费，没有输入折扣）
// 月工作时长按 21.75 天 × 8 小时
export function humanRate(salary, currency, hours, baseTokens) {
  const salaryUsd = currency === 'USD' ? salary : salary / pricing.fx_usd_cny;
  const hourlyUsd = salaryUsd / (21.75 * 8);
  const h = hours > 0 ? hours : 21.75 * 8 / 30; // 未填耗时则按"日均工时的一次产出"粗算
  const costUsd = hourlyUsd * h;
  return {
    costUsd,
    usdPerMtok: costUsd / baseTokens * 1e6,
  };
}

export function findModel(id) {
  return pricing.models.find(m => m.id === id);
}

// 某厂商最贵的模型（作为该身份的对决对手）
export function vendorTopModel(vendor) {
  const list = pricing.models.filter(m => m.vendor === vendor);
  if (!list.length) return null;
  return list.sort((a, b) => outputUsdPerMtok(b) - outputUsdPerMtok(a))[0];
}
