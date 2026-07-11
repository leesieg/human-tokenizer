// 基准 tokenizer：o200k_base（vendored UMD，全局 GPTTokenizer_o200k_base）
// 其他模型 token 数 = 基准数 × pricing.json 中的 token_ratio（估算）

export function countBaseTokens(text) {
  const tk = globalThis.GPTTokenizer_o200k_base;
  if (tk && typeof tk.countTokens === 'function') return tk.countTokens(text);
  if (tk && typeof tk.encode === 'function') return tk.encode(text).length;
  // 兜底启发式：英文约 4 字符/token，CJK 约 1 字符/token
  const cjk = (text.match(/[一-鿿぀-ヿ가-힯]/g) || []).length;
  return Math.ceil(cjk + (text.length - cjk) / 4);
}

export function modelTokens(baseTokens, tokenRatio) {
  return Math.ceil(baseTokens * (tokenRatio || 1));
}
