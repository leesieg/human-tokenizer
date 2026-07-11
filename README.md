# Human Tokenizer

**把你的工作，换算成大模型的 token 账单。**
*Convert your work into an LLM token bill.*

🔗 **在线体验 / Live**: https://leesieg.github.io/human-tokenizer/

---

## 这是什么

一个黑色幽默向的小工具。把你写的日报、周报、PRD、代码、道歉信粘贴进来，它会告诉你：

1. **① 投喂** — 你的产出值多少个 token（基准 tokenizer: o200k_base）
2. **② 账单** — 如果这活儿让 AI 干，11 家大模型各自收多少钱；换成订阅套餐，烧掉额度的百分之几
3. **③ 对决** — 填上月薪，算出你的「每百万 token 单价」，和大模型正面对线
4. **④ 战报** — 生成一张可以发到群里的战报卡片

> 你比 Opus 贵 1800 倍——但你不能并发，还要交社保。

## What is this

A satirical toy: paste your work output (reports, PRDs, code, apology letters) and see —

- how many tokens it's worth, and what 11 LLM vendors would charge for it
- what fraction of a Claude Pro / ChatGPT Plus quota it would burn
- your own price per million tokens vs. the models', once you enter your salary
- a shareable battle card for the group chat

## 特性 / Features

- 🏷️ **11 家厂商价格对比** — Claude / GPT / Grok / DeepSeek / Kimi / GLM / MiniMax / MiMo / 豆包 / 千问 / 混元
- 🎨 **模型身份换肤** — 选择「你是哪个模型的人类版」，页面配色与对决对手随之切换
- 🌐 **中英双语** — 梗文案分别创作，不是机翻
- 📁 **文本文件投喂** — 支持代码 / md / csv 等，多选或拖拽
- 🖼️ **战报卡片** — canvas 生成，长按即存
- ⚡ **零构建、零后端、零依赖框架** — 纯 HTML + CSS + JS

## 本地运行 / Run locally

```bash
git clone git@github.com:leesieg/human-tokenizer.git
cd human-tokenizer
python3 -m http.server 8000
# open http://localhost:8000
```

需要本地服务器（页面用 ES modules + fetch，`file://` 会被浏览器拦截）。

## 数据说明 / About the data

- 模型价格在 [`data/pricing.json`](data/pricing.json)，**每条都带来源链接和日期**；官方页面无法核实的条目标注 `"estimate": true`
- 订阅套餐额度官方从不公开，[`data/plans.json`](data/plans.json) 全部为社区估算，UI 上均有「娱乐向估算」标注
- 非 OpenAI 模型的 token 数按系数近似（各家 tokenizer 不同），误差不影响幽默效果
- 价格会过时。欢迎提 PR 更新 `data/pricing.json`（按现有 schema，必须带 `source` 和 `source_date`）

## 免责声明 / Disclaimer

本工具为讽刺作品。token 度量不了你的价值——但你老板可能也度量不了。

页面配色与厂商图标（来自开源 [lobehub/lobe-icons](https://github.com/lobehub/lobe-icons) 图标集）仅用于指示对应模型，与各厂商无关，不构成任何关联或背书。所有商标归其所有者。

This is satire. Color themes and vendor icons (from the open-source lobe-icons set) are used nominatively to identify models; no affiliation or endorsement implied.

## License

见 [LICENSE](LICENSE)。
