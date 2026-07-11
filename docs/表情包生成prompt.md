# 举牌娘表情包生成 Prompt · 2026-07

> 用途：为其余 10 家模型生成与 Claude 版同风格的举牌表情包。
> 生成后命名为 `<vendor>.png` 交回，我压缩后挂到 themes.json 的 `mascotImg` 字段即可上线。

## 使用要点（比 prompt 本身更重要）

1. **必须附上参考图**（assets/mascots/claude-taunt.png）作为风格参照——纯文字描述复现不了原图笔触
2. **必须附上该厂官方 logo 图**（项目 vendor/icons/ 里的 SVG 截图即可）——否则模型会瞎编 logo
3. 每次只生成一家，中文字如果乱码，就在 prompt 末尾加「画面中不要出现任何文字」，字我来后期加
4. 规格：1:1、1000×1000 以上、纯白背景、PNG

## 通用 Prompt 模板（中文）

```
参考附图一的画风，生成一张同系列表情包。

画风要求（严格保持与附图一一致）：
- 手绘黑色线稿，粗细不均的马克笔质感，日系 chibi 风格
- 白色短发少女，齐刘海，超大椭圆黑眼睛带高光，张嘴开心笑
- 白色水手服，蓝白条纹水手领，黄色领结
- 纯白背景，无阴影无上色，仅少量局部色块

画面内容：
- 少女单手高举一块圆角方形牌子，牌子略微倾斜
- 牌子底色为{品牌色}，牌面中央画着附图二的 logo（手绘线稿风格临摹，保持辨识度）
- 图片底部用手写风格黑色毛笔字写：「你还能有{模型名}聪明？」

规格：1:1 比例，1000×1000，纯白背景，PNG
```

## 各家变量表

| vendor 文件名    | 模型名（写进台词） | 品牌色         | logo 描述（附图二用 vendor/icons/ 对应文件） |
| ------------- | --------- | ----------- | -------------------------------- |
| openai.png    | ChatGPT   | 黑白（牌子白底黑边）  | 黑色六边形花环结（openai.svg）             |
| xai.png       | Grok      | 黑白（牌子白底黑边）  | 极简斜杠圆形标（grok.svg）                |
| deepseek.png  | DeepSeek  | 蓝色 #4D6BFE  | 蓝色鲸鱼（deepseek-color.svg）         |
| moonshot.png  | Kimi      | 深蓝黑         | Kimi 字标（kimi-color.svg）          |
| zhipu.png     | GLM       | 蓝色 #3859FF  | 智谱抽象 Z 标（zhipu-color.svg）        |
| minimax.png   | MiniMax   | 珊瑚红 #F23F5D | MiniMax 波浪标（minimax-color.svg）   |
| xiaomi.png    | MiMo      | 小米橙 #FF6900 | 橙色圆角方块 M（自绘，无官方图标）               |
| bytedance.png | 豆包        | 浅蓝 #3C7BFF  | 豆包圆脸娃娃头像（doubao-color.svg）       |
| alibaba.png   | 千问        | 紫色 #615CED  | 千问渐变漩涡标（qwen-color.svg）          |
| tencent.png   | 混元        | 腾讯蓝 #0052D9 | 混元圆环标（hunyuan-color.svg）         |

## 台词一览（直接复制）

- 你还能有ChatGPT聪明？
- 你还能有Grok聪明？
- 你还能有DeepSeek聪明？
- 你还能有Kimi聪明？
- 你还能有GLM聪明？
- 你还能有MiniMax聪明？
- 你还能有MiMo聪明？
- 你还能有豆包聪明？
- 你还能有千问聪明？
- 你还能有混元聪明？

## 英文版模板（如用英文模型效果更好）

```
Generate a meme in the exact same art style as attached image 1.

Style (match attachment 1 strictly):
- Hand-drawn black line art, uneven marker-pen strokes, Japanese chibi style
- Girl with white bob hair and straight bangs, huge oval black eyes with highlights, open happy smile
- White sailor uniform with blue-striped collar and yellow neckerchief
- Pure white background, no shading, minimal spot colors only

Content:
- The girl holds up a rounded-square sign, slightly tilted
- Sign background color: {BRAND_COLOR}; in its center, a hand-sketched rendition of the logo in attachment 2 (keep it recognizable)
- At the bottom, handwritten Chinese brush-style caption: 「你还能有{MODEL_NAME}聪明？」

Specs: 1:1, 1000×1000+, pure white background, PNG
```

## 验收清单（交回前自查）

- [ ] 画风与 Claude 版放在一起不违和（线稿粗细、眼睛画法、背景纯白）
- [ ] logo 认得出来是哪家（这是唯一硬指标，脸可以崩 logo 不能崩）
- [ ] 台词文字没乱码（乱码就重生成无字版）
- [ ] 白底、1:1、≥1000px

## 接入方式（我来做）

1. 图片放入 `assets/mascots/`，sips 压到 480px
2. themes.json 对应厂商加 `"mascotImg": "<vendor>.png"`
3. 有 mascotImg 的厂商自动用梗图，没有的继续用自绘 SVG 举牌娘——两套机制共存，可逐家替换
