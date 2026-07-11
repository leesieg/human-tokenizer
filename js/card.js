import { t, currentLang } from './i18n.js';
import { themeColors } from './theme.js';

// 分享卡片：1080×1350 (4:5)，canvas 绘制，配色跟随当前主题
export function drawCard(canvas, data) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const th = themeColors();

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, th.bg);
  g.addColorStop(1, th.panel);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = th.line;
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, W, H);

  const zh = currentLang() === 'zh';
  const serif = th.serif ? 'Georgia, "Songti SC", serif' : '-apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
  const font = (w, s) => `${w} ${s}px ${serif}`;

  ctx.fillStyle = th.muted;
  ctx.font = font(500, 40);
  ctx.fillText('HUMAN TOKENIZER', 80, 120);

  ctx.fillStyle = th.text;
  ctx.font = font(700, 56);
  ctx.fillText(t('card_headline'), 80, 280);
  if (data.identityName) {
    ctx.fillStyle = th.muted;
    ctx.font = font(500, 40);
    ctx.fillText(t('card_identity', { name: data.identityName }), 80, 340);
  }

  // 大数字
  ctx.fillStyle = th.accent;
  ctx.font = font(800, 150);
  ctx.fillText(data.tokens.toLocaleString(), 80, 500);
  ctx.fillStyle = th.muted;
  ctx.font = font(600, 52);
  ctx.fillText('tokens', 80, 575);

  // 最便宜 / 最贵
  ctx.fillStyle = th.accent2;
  ctx.font = font(600, 44);
  ctx.fillText(t('card_cheapest', { model: data.cheapest.name, cost: data.cheapest.cost }), 80, 720);
  ctx.fillStyle = th.text;
  ctx.fillText(t('card_priciest', { model: data.priciest.name, cost: data.priciest.cost }), 80, 795);

  if (data.ratio) {
    ctx.fillStyle = th.accent;
    ctx.font = font(800, 60);
    wrapText(ctx, t('card_ratio', { model: data.ratio.model, x: data.ratio.x }), 80, 930, W - 160, 76);
  }

  if (data.punchline) {
    ctx.fillStyle = th.text;
    ctx.font = font(500, 44);
    wrapText(ctx, data.punchline, 80, data.ratio ? 1090 : 950, W - 160, 62);
  }

  ctx.fillStyle = th.muted;
  ctx.font = font(500, 36);
  ctx.fillText(t('card_footer'), 80, H - 80);

  function wrapText(c, text, x, y, maxW, lineH) {
    const units = zh ? [...text] : text.split(' ');
    const joiner = zh ? '' : ' ';
    let line = '';
    for (const u of units) {
      const test = line ? line + joiner + u : u;
      if (c.measureText(test).width > maxW && line) {
        c.fillText(line, x, y);
        line = u;
        y += lineH;
      } else {
        line = test;
      }
    }
    if (line) c.fillText(line, x, y);
  }
}
