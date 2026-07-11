# Human Tokenizer

把你的工作换算成大模型的 token 账单。黑色幽默向传播型小工具，**核心指标是分享率，不是准确性**。

## 已定决策（不要重开讨论）

- **量化口径**：产出物口径——用户粘贴文本 → 浏览器端 tokenize → 按各模型价格计价。MVP 无后端、无任何 LLM API 调用
- **模型覆盖**：Claude / GPT / Grok / DeepSeek / Kimi / GLM / MiniMax / MiMo / 豆包 / 千问 / Hunyuan
- **双语**：中英文切换，默认跟随浏览器语言
- **技术栈**：纯 HTML + CSS + JS，无框架、无 npm、无构建步骤

## 目录结构

```
index.html          # 唯一页面入口
css/style.css
js/
  app.js            # 主逻辑
  tokenizer.js      # token 计数（封装 vendor 库 + 系数换算）
  pricing.js        # 计价逻辑
  card.js           # 分享卡片生成（canvas）
  i18n.js           # 语言切换逻辑
  theme.js          # 模型身份选择 + 换肤
data/
  pricing.json      # 模型 API 价格（唯一价格来源）
  plans.json        # 订阅套餐额度估算
  i18n.json         # 全部 UI 文案（zh/en）
  themes.json       # 各厂商主题皮肤（CSS 变量值）
vendor/             # 第三方库，锁定版本，文件头注明来源和版本号
docs/               # 方案、调研等文档
```

## 数据约定（最重要的规则）

**价格和额度数据只存在于 data/*.json，禁止硬编码进 JS/HTML。**

### pricing.json 每条模型必须包含：

```json
{
  "id": "claude-opus-4-8",
  "vendor": "anthropic",
  "name": "Claude Opus 4.8",
  "tier": "flagship",
  "input_usd_per_mtok": 5.0,
  "output_usd_per_mtok": 25.0,
  "token_ratio": 1.15,
  "source": "https://官方定价页",
  "source_date": "2026-07-11"
}
```

- `tier`: `flagship` / `mid` / `light`，用于 UI 分组
- `token_ratio`: 该模型 token 数相对基准 tokenizer 的近似系数（基准 = 1.0）
- `source` 和 `source_date` 必填——没有来源的价格不许入库
- 顶层字段：`updated`（数据整体更新日期）、`fx_usd_cny`（手动维护的汇率）
- 人民币计价的模型（豆包/千问等）直接存 `input_cny_per_mtok`，展示时统一换算

### plans.json（订阅套餐）：

- 官方不公开额度，全部是社区估算。每条必须有 `"estimate": true` + `source` 链接
- UI 上凡是估算值必须带「娱乐向估算」标注，不许省略

### Tokenizer 约定

- 基准：gpt-tokenizer 的 o200k_base（vendored 进 /vendor）
- 其他模型 token 数 = 基准数 × `token_ratio`，UI 标注为估算
- 不为每家模型引入各自的 tokenizer——精度收益撑不起体积成本

## 主题皮肤约定（themes.json）

- 每个厂商一套主题，key 与 pricing.json 的 `vendor` 字段一致，另有 `default`（人类原味）
- 主题包含 CSS 变量值（bg/panel/text/muted/accent/line/mode/serif）+ 图标字段（icon/iconMono）
- 厂商图标使用开源 lobehub 图标集（vendor/icons/，来源见 SOURCES.txt），属指示性使用；页脚保留「与厂商无关」声明。图标集缺失的厂商用自绘占位图标，不得盗用官方素材
- 单色图标（openai/grok）标 `iconMono: true`，暗色主题下 CSS 反色处理
- 选择「我是什么模型」同时决定：页面配色、人机对决的对手（该厂旗舰）、分享卡片配色
- 身份选择存 localStorage

## 页面信息架构（第一性原理：投喂 → 看账单 → 晒战报）

- 三步叙事：① 投喂（输入区）→ ② 账单（Tab：API/套餐）→ ③ 对决 → ④ 战报卡片
- **渐进展示**：月薪/耗时输入放在对决区内（只服务于对决，不许挤在第一步）；提示文案能短则短
- 吉祥物动画只用 emoji + CSS，不引图片资源

## 文件上传边界

- 只支持文本类文件（.txt/.md/.csv/代码等），FileReader 直读，多文件合并计数
- .docx / .pdf / 图片不做：解析库太重（pdf.js >1MB），图片 token 各家规则不同——列入 V2，UI 上写明「暂只支持文本类文件」

## i18n 约定

- 所有用户可见文案进 `data/i18n.json`，key 双语齐全，禁止在 HTML/JS 里散落硬编码文案
- 语言选择存 localStorage，默认跟随 `navigator.language`
- **梗文案中英文分开创作，不逐字互译**——梗不可翻译，各写各的

## 文案风格

- 黑色幽默、自嘲，讽刺的是「用 token 度量人」这件事本身，不冒犯具体个人或公司
- 结果展示遵循渐进式：先给一个最扎心的数字，细节按需展开
- 所有估算数据带标注，被挑刺时标注就是免责声明

## 开发约定

- 运行方式：`python3 -m http.server`（必须走本地服务器——页面用 ES modules + fetch 加载 data/*.json，file:// 协议会被浏览器拦截）。改完必须在浏览器实测（含手机宽度）
- 移动端优先——分享出去的人大多在手机上点开
- 分享卡片用 canvas 生成图片，这是传播核心，梗密度投入优先级高于任何功能

## 不做清单（防过度工程，同样是规则）

- ❌ 用户系统 / 登录 / 历史记录
- ❌ 后端 / 数据库 / 任何服务器
- ❌ MVP 阶段调用任何 LLM API（等效任务估算是 V2 的事）
- ❌ 框架、构建工具、npm 依赖
- ❌ 古董浏览器兼容（只支持现代 evergreen 浏览器）

## 部署

- GitHub Pages，main 分支静态托管
- git push 由我手动执行，不要自动 push
