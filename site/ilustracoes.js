/* Cerne — ilustrações vetoriais (Vector Surrealism, fase psicodélica, nov/2026).
 * Lido por site/gerar-paginas.js. Tudo é SVG embutido, sem arquivo externo.
 * As cores vêm de classes (.i-*) definidas em site/vetor.css, então as cenas
 * acompanham o tema claro e o escuro. As cenas são decorativas (aria-hidden).
 * Vocabulário: portal em arco com céu noturno, faixas concêntricas de cor viva,
 * olhos (o mercado observa), anéis do tronco (o cerne), nuvens fofas (o humor),
 * gramado em perspectiva, moitas em escamas, escada, coluna, cogumelo e brilhos.
 * Regra: elemento que anima (.i-flutua) fica num <g> sem atributo transform,
 * porque a animação CSS substituiria o transform do SVG. */
'use strict';

const f = (n) => Number(n.toFixed(1));
const svg = (w, h, corpo) => `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${corpo}</svg>`;

/* ------------------------------------------------------------- peças -- */

/* nuvem simples: caixa de 100 x 44, origem no canto superior esquerdo */
const nuvem = (x, y, s = 1, cls = 'i-branco') => `<path class="${cls} i-tr" transform="translate(${x} ${y}) scale(${s})" d="M12 44 Q-4 44 -2 30 Q0 18 14 18 Q18 2 36 4 Q52 -6 64 10 Q84 6 88 24 Q102 26 100 38 Q98 44 88 44 Z"/>`;

/* nuvem fofa, feita de bolhas: caixa de ~112 x 62. Primeiro as bolhas com
   contorno, depois as mesmas sem contorno por cima, para apagar as linhas internas. */
const BOLHAS = [[18, 34, 16], [40, 22, 21], [66, 20, 22], [88, 32, 17], [102, 42, 11], [8, 44, 10], [26, 48, 13], [54, 48, 14], [82, 48, 13]];
function nuvemFofa(x, y, s = 1, cls = 'i-branco') {
  const c = (fill) => BOLHAS.map(([cx, cy, r]) => `<circle class="${fill}" cx="${cx}" cy="${cy}" r="${fill.includes('i-tr') ? r : f(r - 1.3)}"/>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${s})">${c(cls + ' i-tr')}${c(cls)}<path class="i-ln-f" d="M30 30 q8 -8 18 -4 M70 28 q8 -6 16 0"/></g>`;
}

/* gramado em perspectiva: faixa de x0..x1 entre o horizonte y0 e a borda y1,
   com sulcos que convergem para (vx, y0) */
function gramado(x0, x1, y0, y1, vx, n = 12, cls = 'i-grama') {
  let o = `<rect class="${cls} i-tr" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/>`;
  const larg = x1 - x0;
  for (let i = 0; i <= n; i++) {
    const xb = x0 - larg * .5 + i * larg * 2 / n, xt = vx + (xb - vx) * .14;
    let ex = xb, ey = y1;
    if (xb < x0) { const t = (x0 - xt) / (xb - xt); ex = x0; ey = y0 + t * (y1 - y0); }
    if (xb > x1) { const t = (x1 - xt) / (xb - xt); ex = x1; ey = y0 + t * (y1 - y0); }
    if (xt < x0 || xt > x1) continue;
    o += `<path class="i-ln-f" d="M${f(xt)} ${y0} L${f(ex)} ${f(ey)}"/>`;
  }
  return o;
}

/* faixas concêntricas em arco, apoiadas numa linha de base (o "nascer" psicodélico) */
const arcos = (cx, by, raios, cores) => raios.map((r, i) => `<path class="${cores[i]} i-tr" d="M${cx - r} ${by} A${r} ${r} 0 0 1 ${cx + r} ${by} Z"/>`).join('');

/* faixa ondulada horizontal, do topo y até a base yb */
function onda(x0, x1, y, amp, comp, yb, cls) {
  let d = `M${x0} ${y} q${comp / 2} ${-amp} ${comp} 0`;
  for (let x = x0 + comp; x < x1; x += comp) d += ` t${comp} 0`;
  return `<path class="${cls} i-tr" d="${d} V${yb} H${x0} Z"/>`;
}

/* moitas em escamas, como colinas de pôster: n cúpulas lado a lado */
function moitas(x0, y, n, r, cls = 'i-grama', cls2 = 'i-lima') {
  let o = '';
  for (let i = 0; i < n; i++) {
    const cx = f(x0 + r + i * r * 1.55);
    o += `<path class="${cls} i-tr" d="M${f(cx - r)} ${y} A${r} ${r} 0 0 1 ${f(cx + r)} ${y} Z"/>`
      + `<path class="i-ln-f" d="M${f(cx - r * .64)} ${y} A${f(r * .64)} ${f(r * .64)} 0 0 1 ${f(cx + r * .64)} ${y}"/>`
      + `<path class="${cls2}" d="M${f(cx - r * .34)} ${y} A${f(r * .34)} ${f(r * .34)} 0 0 1 ${f(cx + r * .34)} ${y} Z"/>`;
  }
  return o;
}

/* olho arregalado: o mercado observa */
function olho(cx, cy, r, dx = 0, dy = 0) {
  const ix = f(cx + dx * r * .32), iy = f(cy + dy * r * .32);
  return `<circle class="i-branco i-tr" cx="${cx}" cy="${cy}" r="${r}"/><circle class="i-preto" cx="${ix}" cy="${iy}" r="${f(r * .56)}"/><circle class="i-branco" cx="${f(ix + r * .2)}" cy="${f(iy - r * .2)}" r="${f(r * .17)}"/>`;
}

/* brilho de quatro pontas */
const brilho = (x, y, s = 1, cls = 'i-ink') => `<path class="${cls}" transform="translate(${x} ${y}) scale(${s})" d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z"/>`;
/* estrelas: lista de [x, y, raio] */
const estrelas = (lista, cls = 'i-lua') => lista.map(([x, y, r]) => `<circle class="${cls}" cx="${x}" cy="${y}" r="${r || 1.8}"/>`).join('');

/* corte do tronco: casca, anéis coloridos fora de centro e o miolo */
function tronco(cx, cy, r, cor = 'i-rosa') {
  const k = r / 88;
  const aneis = [[-4, 3, 64, 'i-lar'], [-8, 6, 48, 'i-lima'], [-12, 9, 33, 'i-vio'], [-15, 11, 20, 'i-rosa']];
  return `<circle class="i-ink" cx="${cx}" cy="${cy}" r="${r}"/><circle class="${cor}" cx="${cx}" cy="${cy}" r="${f(r - 8 * k)}"/>`
    + aneis.map(([dx, dy, rr, c]) => `<circle class="${c}" cx="${f(cx + dx * k)}" cy="${f(cy + dy * k)}" r="${f(rr * k)}"/><circle class="i-ln-f" cx="${f(cx + dx * k)}" cy="${f(cy + dy * k)}" r="${f(rr * k)}"/>`).join('')
    + `<circle class="i-sol i-tr" cx="${f(cx - 17 * k)}" cy="${f(cy + 13 * k)}" r="${f(9 * k)}"/>`;
}

const arco = (x, y, w, h, cls) => `<path class="${cls} i-tr" d="M${x} ${y + h} V${y + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V${y + h} Z"/>`;
const arcoD = (x, y, w, h) => `M${x} ${y + h} V${y + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V${y + h} Z`;

/* escada de perfil, subindo para a direita, com a quina de cada degrau marcada */
function escada(x, y, n, dw, dh, cls = 'i-branco') {
  let d = `M${x} ${y}`, quinas = '';
  for (let i = 0; i < n; i++) { d += ` v${-dh} h${dw}`; quinas += `M${x + i * dw + 4} ${y - (i + 1) * dh + 5} h${dw - 8}`; }
  return `<path class="${cls} i-tr" d="${d} V${y} Z"/><path class="i-ln-f" d="${quinas}"/>`;
}

const cubo = (x, y, s, a = 'i-branco', b = 'i-rosa', c = 'i-vio') => `<g transform="translate(${x} ${y}) scale(${s})"><polygon class="${a} i-tr" points="0,14 30,0 60,14 30,28"/><polygon class="${b} i-tr" points="0,14 30,28 30,62 0,48"/><polygon class="${c} i-tr" points="60,14 30,28 30,62 60,48"/></g>`;

/* coluna clássica de pedestal: x central, y da base, altura */
function coluna(x, y, h, w = 44) {
  const t = y - h;
  const caneluras = [-.25, 0, .25].map((k) => `M${f(x + k * w)} ${t + 16} V${y - 22}`).join(' ');
  return `<rect class="i-branco i-tr" x="${f(x - w * .75)}" y="${y - 22}" width="${f(w * 1.5)}" height="22"/>`
    + `<rect class="i-branco i-tr" x="${f(x - w / 2)}" y="${t + 14}" width="${w}" height="${h - 36}"/>`
    + `<path class="i-ln-f" d="${caneluras}"/>`
    + `<path class="i-branco i-tr" d="M${f(x - w * .78)} ${t} H${f(x + w * .78)} L${f(x + w * .56)} ${t + 14} H${f(x - w * .56)} Z"/>`;
}

/* cogumelo de chapéu pintado: lucro que brota */
const cogumelo = (x, y, s = 1, cap = 'i-rosa') => `<g transform="translate(${x} ${y}) scale(${s})">
  <path class="i-branco i-tr" d="M-9 0 Q-12 -22 -7 -34 H7 Q12 -22 9 0 Z"/><path class="i-ln-f" d="M-3 -6 Q-5 -20 -2 -30"/>
  <path class="${cap} i-tr" d="M-31 -32 Q-30 -64 0 -66 Q30 -64 31 -32 Q0 -42 -31 -32 Z"/>
  <circle class="i-branco i-tr" cx="-14" cy="-48" r="5"/><circle class="i-branco i-tr" cx="5" cy="-56" r="6"/><circle class="i-branco i-tr" cx="20" cy="-43" r="4"/><circle class="i-branco" cx="-2" cy="-41" r="2.6"/></g>`;

/* balança: o lado mais baixo é o mais pesado */
const balanca = (cx, y, s = 1) => `<g transform="translate(${cx} ${y}) scale(${s})">
  <polygon class="i-vio i-tr" points="-16,96 16,96 0,22"/><rect class="i-ink" x="-34" y="94" width="68" height="8" rx="2"/>
  <path class="i-ln" d="M-78 34 L78 6"/><circle class="i-lar i-tr" cx="0" cy="20" r="8"/>
  <path class="i-ln-m" d="M-78 34 L-98 78 M-78 34 L-58 78 M78 6 L58 44 M78 6 L98 44"/>
  <path class="i-rosa i-tr" d="M-104 78 h52 a26 14 0 0 1 -52 0 Z"/><path class="i-lima i-tr" d="M52 44 h52 a26 14 0 0 1 -52 0 Z"/>
</g>`;

/* ------------------------------------------------------------- cenas -- */
const CENAS = {
  /* início: o cerne é um astro pousado numa coluna, diante de um portal noturno de
     faixas vivas; o preço é só a etiqueta pendurada numa nuvem, e os olhos do mercado observam */
  inicio: svg(480, 520, `
  <defs><clipPath id="cl-inicio"><path d="${arcoD(56, 60, 268, 340)}"/></clipPath></defs>
  ${gramado(0, 480, 400, 520, 190, 16)}
  <circle class="i-lima i-tr" cx="424" cy="72" r="34"/><circle class="i-ln-f" cx="424" cy="72" r="22"/>
  ${estrelas([[24, 52, 2.2], [150, 22, 1.8], [356, 30, 2], [466, 148, 1.8], [22, 300, 1.6], [470, 330, 2]], 'i-ink')}
  ${brilho(372, 132, .9)}${brilho(460, 236, .6)}${brilho(30, 360, .7)}
  <path class="i-noite" d="${arcoD(56, 60, 268, 340)}"/>
  <g clip-path="url(#cl-inicio)">
    ${arcos(190, 400, [292, 246, 204, 166, 130], ['i-rosa', 'i-lar', 'i-lima', 'i-vio', 'i-noite'])}
    ${estrelas([[104, 108, 2], [150, 84, 1.6], [228, 80, 2.2], [272, 112, 1.6], [190, 98, 1.4], [122, 136, 1.4]])}
    ${brilho(190, 128, 1.1, 'i-lua')}
    ${olho(92, 252, 17, .5, .3)}${olho(288, 238, 15, -.6, .2)}${olho(132, 196, 12, .3, .6)}
    ${estrelas([[150, 312, 1.8], [236, 300, 1.4], [196, 340, 1.6]])}
    ${escada(70, 400, 6, 24, 20, 'i-branco')}
    <path class="i-lua" d="M232 300 a20 20 0 1 0 16 30 a16 16 0 0 1 -16 -30 Z"/>
  </g>
  <path class="i-ln" style="stroke-width:3.5" d="M56 400 V194 a134 134 0 0 1 268 0 V400"/>
  <ellipse class="i-som" cx="372" cy="486" rx="76" ry="10"/>
  ${coluna(372, 486, 116, 48)}
  <g class="i-flutua">
    <path class="i-ln" style="stroke-width:12" d="M246 308 A132 30 -14 0 1 480 250"/><path class="i-ln-lar" d="M246 308 A132 30 -14 0 1 480 250"/>
    ${tronco(366, 278, 76)}
    <path class="i-ln" style="stroke-width:12" d="M246 308 A132 30 -14 0 0 480 250"/><path class="i-ln-lar" d="M246 308 A132 30 -14 0 0 480 250"/>
    <circle class="i-rosa i-tr" cx="258" cy="326" r="9"/>
  </g>
  <g class="i-flutua-2">
    ${nuvemFofa(4, 122, 1.05)}
    <path class="i-ln-m" d="M64 186 V250"/>
    <g transform="translate(64 250) rotate(8)"><path class="i-lar i-tr" d="M0 0 L22 16 V64 H-22 V16 Z"/><circle class="i-branco i-tr" cx="0" cy="15" r="4"/><path class="i-ln-f" d="M-11 34 H11 M-11 44 H11 M-11 54 H4"/></g>
  </g>
  ${cubo(424, 430, .62, 'i-branco', 'i-vio', 'i-rosa')}`),

  /* aprender: do livro aberto sai uma escada até a fechadura acesa no meio do sol;
     lá dentro já é noite estrelada, o que ainda não se sabe */
  aprender: svg(360, 380, `
  ${gramado(0, 360, 300, 380, 180, 12)}
  ${moitas(-8, 300, 3, 24, 'i-grama', 'i-lima')}${moitas(266, 300, 3, 22, 'i-grama', 'i-lima')}
  <circle class="i-rosa i-tr" cx="252" cy="150" r="96"/><circle class="i-lar i-tr" cx="252" cy="150" r="78"/><circle class="i-lima i-tr" cx="252" cy="150" r="60"/>
  <path class="i-preto i-tr" d="M228 150 a26 26 0 1 1 48 0 l12 62 h-72 Z"/>
  <path class="i-vio" d="M240 146 a14 14 0 1 1 24 0 l8 56 h-40 Z"/>
  ${estrelas([[252, 136, 1.6], [246, 170, 1.3], [260, 188, 1.5]])}${brilho(254, 156, .5, 'i-lua')}
  ${escada(84, 300, 6, 30, 26)}
  <ellipse class="i-som" cx="180" cy="354" rx="140" ry="10"/>
  <path class="i-rosa i-tr" d="M30 300 Q104 274 180 300 Q256 274 330 300 V334 Q256 308 180 334 Q104 308 30 334 Z"/>
  <path class="i-branco i-tr" d="M44 292 Q110 268 180 294 Q250 268 316 292 V320 Q250 296 180 322 Q110 296 44 320 Z"/>
  <path class="i-ln-f" d="M70 290 q40 -12 90 4 M70 300 q40 -12 90 4 M200 294 q50 -16 96 -4 M200 304 q50 -16 96 -4"/>
  <path class="i-ln" d="M180 294 V322"/>
  <g class="i-flutua">${nuvemFofa(8, 50, .9)}</g>
  ${cubo(306, 214, .5, 'i-branco', 'i-lar', 'i-vio')}
  <circle class="i-vio i-tr" cx="58" cy="196" r="14"/><path class="i-ln-m" d="M36 202 Q58 182 80 190"/>
  ${brilho(150, 40, 1)}${brilho(118, 150, .6)}${estrelas([[188, 26, 2], [24, 150, 1.8], [346, 60, 2]], 'i-ink')}`),

  /* análise: o dado sorteia a ação; o arco é a única lente, e dentro dela a noite mostra o cerne */
  analise: svg(360, 380, `
  <defs><clipPath id="cl-analise"><path d="${arcoD(140, 44, 176, 258)}"/></clipPath></defs>
  ${gramado(0, 360, 302, 380, 228, 12)}
  <circle class="i-lima i-tr" cx="66" cy="84" r="40"/><circle class="i-ln-f" cx="66" cy="84" r="26"/>
  ${estrelas([[26, 168, 2], [120, 30, 1.8], [340, 120, 2], [338, 250, 1.6]], 'i-ink')}${brilho(118, 176, .8)}
  <path class="i-noite" d="${arcoD(140, 44, 176, 258)}"/>
  <g clip-path="url(#cl-analise)">
    ${arcos(228, 302, [176, 146, 118, 92], ['i-rosa', 'i-lar', 'i-lima', 'i-vio'])}
    ${estrelas([[172, 92, 1.6], [204, 70, 2], [266, 82, 1.6], [288, 112, 1.4], [184, 120, 1.2]])}${brilho(242, 104, .8, 'i-lua')}
    ${tronco(228, 236, 54)}
  </g>
  <path class="i-ln" style="stroke-width:3.5" d="M140 302 V132 a88 88 0 0 1 176 0 V302"/>
  <ellipse class="i-som" cx="92" cy="318" rx="56" ry="8"/>
  <g transform="translate(40 222) scale(1.5)">
    <polygon class="i-branco i-tr" points="0,14 30,0 60,14 30,28"/><polygon class="i-rosa i-tr" points="0,14 30,28 30,62 0,48"/><polygon class="i-lar i-tr" points="60,14 30,28 30,62 60,48"/>
    <ellipse class="i-preto" cx="30" cy="14" rx="4.6" ry="2.4"/>
    <circle class="i-preto" cx="9" cy="30" r="2.8"/><circle class="i-preto" cx="21" cy="50" r="2.8"/>
    <circle class="i-preto" cx="38" cy="36" r="2.6"/><circle class="i-preto" cx="45" cy="42" r="2.6"/><circle class="i-preto" cx="52" cy="26" r="2.6"/>
  </g>
  <g class="i-flutua">${nuvemFofa(236, 8, .8)}</g>`),

  /* indicadores: um olho cuja íris é o tronco, cercado de faixas vivas;
     abaixo, uma nuvem pesa mais que um cubo */
  indicadores: svg(360, 400, `
  ${estrelas([[24, 30, 2], [336, 34, 1.8], [18, 230, 1.6], [344, 222, 2]], 'i-ink')}${brilho(326, 262, .8)}${brilho(34, 276, .7)}
  <circle class="i-rosa i-tr" cx="180" cy="128" r="118"/><circle class="i-lar i-tr" cx="180" cy="128" r="100"/><circle class="i-lima i-tr" cx="180" cy="128" r="84"/>
  <path class="i-ln" style="stroke-width:3.5" d="M62 70 l-16 -22 M98 44 l-10 -24 M140 30 l-4 -24 M220 30 l4 -24 M262 44 l10 -24 M298 70 l16 -22"/>
  <path class="i-branco i-tr" d="M34 128 Q180 14 326 128 Q180 242 34 128 Z"/>
  ${tronco(180, 128, 56)}
  <circle class="i-branco" cx="202" cy="104" r="9"/><circle class="i-branco" cx="190" cy="98" r="4"/>
  <path class="i-ln" style="stroke-width:3.5" d="M34 128 Q180 14 326 128"/>
  ${gramado(30, 330, 358, 400, 180, 10)}
  <g transform="translate(180 268)">
    <polygon class="i-vio i-tr" points="-16,96 16,96 0,22"/><rect class="i-ink" x="-40" y="94" width="80" height="8" rx="2"/>
    <path class="i-ln" d="M-96 6 L96 40"/><circle class="i-lar i-tr" cx="0" cy="22" r="9"/>
    <path class="i-ln-m" d="M-96 6 L-118 46 M-96 6 L-74 46 M96 40 L74 82 M96 40 L118 82"/>
    <path class="i-rosa i-tr" d="M-124 46 h56 a28 14 0 0 1 -56 0 Z"/><path class="i-lima i-tr" d="M68 82 h56 a28 14 0 0 1 -56 0 Z"/>
  </g>
  ${cubo(66, 266, .6, 'i-branco', 'i-rosa', 'i-vio')}
  ${nuvemFofa(234, 304, .7)}`),

  /* ferramentas: na ampulheta, o tempo que cai vira uma árvore; em volta, a noite gira */
  ferramentas: svg(360, 380, `
  <circle class="i-noite i-tr" cx="196" cy="182" r="156"/>
  ${estrelas([[96, 86, 2], [130, 50, 1.6], [298, 70, 2], [318, 120, 1.4], [76, 160, 1.4], [320, 230, 1.8], [86, 250, 1.6]])}
  ${brilho(276, 104, .9, 'i-lua')}${brilho(108, 214, .6, 'i-lua')}
  <circle class="i-lima i-tr" cx="104" cy="112" r="30"/><circle class="i-ln-f" cx="104" cy="112" r="19"/>
  ${gramado(0, 360, 326, 380, 196, 12)}
  ${moitas(-6, 342, 2, 22, 'i-grama', 'i-lima')}${moitas(296, 342, 2, 20, 'i-grama', 'i-lima')}
  <ellipse class="i-som" cx="196" cy="354" rx="118" ry="9"/>
  <rect class="i-rosa i-tr" x="104" y="34" width="184" height="18" rx="5"/><rect class="i-rosa i-tr" x="104" y="326" width="184" height="18" rx="5"/>
  <path class="i-branco i-tr" d="M120 52 H272 Q272 150 208 188 Q272 226 272 326 H120 Q120 226 184 188 Q120 150 120 52 Z"/>
  <path class="i-lar" d="M140 96 H252 Q240 150 196 174 Q152 150 140 96 Z"/><path class="i-ln-f" d="M150 112 H242 M160 130 H232"/>
  <path class="i-ln-rosa" style="stroke-width:3.5" d="M196 176 V250"/>
  <path class="i-lar" d="M128 324 Q134 276 196 276 Q258 276 264 324 Z"/>
  <path class="i-ln" d="M196 278 V236"/><path class="i-ln-f" d="M196 256 l-14 -10 M196 248 l14 -12"/>
  <circle class="i-grama i-tr" cx="196" cy="222" r="24"/><circle class="i-lima i-tr" cx="176" cy="238" r="13"/><circle class="i-lima i-tr" cx="216" cy="240" r="12"/>
  <circle class="i-rosa" cx="190" cy="214" r="3"/><circle class="i-rosa" cx="206" cy="228" r="3"/>
  ${cogumelo(150, 318, .32, 'i-rosa')}${cogumelo(240, 320, .26, 'i-vio')}
  <path class="i-ln" d="M120 52 H272 Q272 150 208 188 Q272 226 272 326 H120 Q120 226 184 188 Q120 150 120 52 Z"/>
  <g class="i-flutua"><path class="i-ln-m" d="M40 214 A160 36 -12 0 1 352 150"/><circle class="i-rosa i-tr" cx="318" cy="152" r="16"/><path class="i-ln-f" d="M298 158 Q318 142 338 146"/></g>`),

  /* método: papéis empilhados, uma escada e uma lupa que encontra o cerne no meio da noite */
  metodo: svg(360, 380, `
  ${gramado(0, 360, 330, 380, 170, 12)}
  <path class="i-lar i-tr" d="M66 96 a54 54 0 1 0 60 84 a46 46 0 0 1 -60 -84 Z"/>
  ${estrelas([[150, 40, 2], [120, 150, 1.6], [24, 220, 1.8], [340, 230, 2], [190, 200, 1.4]], 'i-ink')}${brilho(170, 86, 1)}${brilho(332, 280, .7)}
  <ellipse class="i-som" cx="170" cy="356" rx="140" ry="9"/>
  ${[0, 1, 2, 3].map((i) => `<polygon class="${['i-branco', 'i-rosa', 'i-branco', 'i-lima'][i]} i-tr" points="36,${322 - i * 20} 150,${288 - i * 20} 286,${322 - i * 20} 172,${356 - i * 20}"/>`).join('')}
  <path class="i-ln-f" d="M112 276 l60 18 M132 268 l60 18 M152 260 l60 18 M100 284 l30 9"/>
  <path class="i-ln" d="M150 290 L214 118 M186 300 L250 128"/>
  <path class="i-ln" d="M162 258 l36 10 M175 224 l36 10 M188 190 l36 10 M201 156 l36 10"/>
  <g class="i-flutua">
    <path class="i-ln" style="stroke-width:14" d="M304 146 L340 192"/><path class="i-ln-rosa" style="stroke-width:8" d="M310 154 L336 187"/>
    <circle class="i-noite" cx="262" cy="92" r="62"/>
    ${estrelas([[226, 56, 1.4], [298, 60, 1.6], [300, 124, 1.2]])}
    ${tronco(262, 96, 44)}
    <path class="i-ln-bg" style="stroke-width:4" d="M222 70 A48 48 0 0 1 246 46"/>
    <circle class="i-ln" style="stroke-width:7" cx="262" cy="92" r="62"/>
  </g>
  <g class="i-flutua-2">${nuvemFofa(0, 186, .72)}</g>`),

  /* mercado: uma janela solta no ar; dentro, a noite tem um olho no lugar da lua,
     o gráfico corta o céu e o mar de faixas vivas escorre pelo parapeito */
  mercado: svg(360, 380, `
  <defs><clipPath id="cl-mercado"><rect x="60" y="40" width="240" height="250"/></clipPath></defs>
  ${estrelas([[24, 40, 2], [330, 120, 1.8], [22, 200, 1.6], [340, 330, 2]], 'i-ink')}${brilho(36, 120, .9)}${brilho(326, 250, .7)}
  <ellipse class="i-som" cx="180" cy="358" rx="130" ry="9"/>
  <rect class="i-noite" x="60" y="40" width="240" height="250"/>
  <g clip-path="url(#cl-mercado)">
    ${estrelas([[84, 60, 1.6], [126, 76, 2], [150, 52, 1.4], [276, 156, 1.4], [92, 120, 1.4], [196, 66, 1.6]])}${brilho(110, 100, .7, 'i-lua')}
    <circle class="i-lar i-tr" cx="236" cy="100" r="38"/>${olho(236, 100, 26, -.5, .5)}
    <path class="i-ln-rosa" style="stroke-width:4.5" d="M60 196 L96 156 L126 182 L162 124 L196 164 L228 110 L262 146 L300 92"/>
    ${[[96, 156], [162, 124], [228, 110]].map(([x, y]) => `<circle class="i-lima i-tr" cx="${x}" cy="${y}" r="4.5"/>`).join('')}
    ${onda(40, 320, 214, 9, 40, 300, 'i-vio')}${onda(20, 320, 238, 8, 40, 300, 'i-rosa')}${onda(40, 320, 262, 8, 40, 300, 'i-lar')}
    <path class="i-ln-f" d="M80 226 q12 -8 24 0 M190 250 q12 -8 24 0 M120 276 q12 -8 24 0"/>
    <g transform="translate(132 192)"><polygon class="i-branco i-tr" points="0,26 60,26 46,44 14,44"/><polygon class="i-branco i-tr" points="30,-14 30,22 6,22"/><polygon class="i-lima i-tr" points="30,-6 30,22 52,22"/></g>
  </g>
  <rect class="i-ln" style="stroke-width:7" x="60" y="40" width="240" height="250"/>
  <path class="i-ln" d="M180 40 V290 M60 165 H300"/>
  <rect class="i-rosa i-tr" x="46" y="286" width="268" height="16" rx="3"/>
  <path class="i-lar i-tr" d="M206 302 q18 20 8 40 q-6 14 14 16 h-56 q20 -4 14 -24 q-4 -16 6 -32 Z"/>
  <path class="i-vio i-tr" d="M110 302 q6 14 0 22 a7 7 0 1 0 10 0 q-6 -8 0 -22 Z"/>
  <g class="i-flutua">${nuvemFofa(242, 4, .78)}</g>
  <g class="i-flutua-2">${nuvemFofa(-8, 236, .6, 'i-lima')}</g>
  ${cubo(22, 300, .5, 'i-branco', 'i-lar', 'i-vio')}`),

  /* empresa: a árvore nasce de um cubo; a copa é uma nuvem que dá frutos */
  empresa: svg(360, 400, `
  ${gramado(0, 360, 340, 400, 186, 12)}
  ${moitas(-6, 340, 2, 24, 'i-grama', 'i-lima')}${moitas(282, 340, 2, 24, 'i-grama', 'i-lima')}
  <path class="i-ln" style="stroke-width:3" d="${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `M${f(276 + Math.cos(a) * 70)} ${f(96 + Math.sin(a) * 70)} L${f(276 + Math.cos(a) * 84)} ${f(96 + Math.sin(a) * 84)}`; }).join(' ')}"/>
  <circle class="i-lar i-tr" cx="276" cy="96" r="60"/><circle class="i-rosa i-tr" cx="276" cy="96" r="42"/><circle class="i-lima i-tr" cx="276" cy="96" r="24"/>
  ${estrelas([[26, 30, 2], [180, 16, 1.6], [340, 196, 2], [20, 250, 1.8]], 'i-ink')}${brilho(346, 30, .8)}${brilho(28, 300, .7)}
  <ellipse class="i-som" cx="186" cy="380" rx="120" ry="9"/>
  ${cubo(120, 276, 2.1, 'i-branco', 'i-vio', 'i-rosa')}
  <path class="i-ln-f" d="M138 318 v22 M150 324 v22 M162 330 v22 M200 330 v22 M214 324 v22 M228 318 v22"/>
  <path class="i-lar i-tr" d="M166 302 Q176 230 170 150 H206 Q200 230 212 302 Q190 316 166 302 Z"/>
  <path class="i-ln-f" d="M180 290 Q186 230 182 160 M196 290 Q192 240 196 170"/>
  <path class="i-lar i-tr" d="M204 214 Q240 204 262 176 l18 12 Q252 228 206 240 Z"/>
  <g transform="translate(272 180) rotate(34)">${tronco(0, 0, 15)}</g>
  <g class="i-flutua">
    ${nuvemFofa(40, 28, 2.4, 'i-lima')}
    <path class="i-ln-f" d="M86 120 a24 24 0 0 1 48 0 M150 102 a26 26 0 0 1 52 0 M218 116 a24 24 0 0 1 48 0 M120 82 a20 20 0 0 1 40 0 M180 74 a20 20 0 0 1 40 0"/>
    ${[[96, 96], [146, 132], [176, 92], [226, 130], [254, 96], [126, 70], [208, 60]].map(([x, y], i) => `<circle class="${i % 2 ? 'i-rosa' : 'i-lar'} i-tr" cx="${x}" cy="${y}" r="7"/>`).join('')}
  </g>
  <path class="i-ln-m" d="M40 196 q10 -8 20 0 q10 -8 20 0 M300 210 q8 -6 16 0 q8 -6 16 0"/>`),

  /* faixa "decida por você": uma porta entreaberta na noite, e a luz que sai dela */
  decida: svg(176, 210, `
  <path class="i-lar" d="M124 18 a24 24 0 1 0 24 38 a19 19 0 0 1 -24 -38 Z"/>
  ${estrelas([[34, 40, 2], [70, 16, 1.6], [150, 96, 1.8], [20, 110, 1.4], [100, 60, 1.3], [160, 150, 1.4]])}
  ${brilho(40, 76, .7, 'i-lima')}${brilho(156, 124, .5, 'i-rosa')}
  <circle class="i-lima" cx="22" cy="168" r="9"/>
  <path class="i-ln-lua" d="M52 210 V124 a36 36 0 0 1 72 0 V210"/>
  <path class="i-lar" d="M58 210 V125 a30 30 0 0 1 60 0 V210 Z"/>
  <path class="i-rosa" d="M76 210 V132 a12 12 0 0 1 24 0 V210 Z" opacity=".55"/>
  <polygon class="i-vio" points="58,210 58,112 92,128 92,210"/>
  <circle class="i-lua" cx="86" cy="172" r="2.6"/>
  <polygon class="i-lar" opacity=".3" points="92,210 118,210 176,236 110,236"/>`),

  /* categorias de indicadores */
  valuation: svg(160, 160, `<circle class="i-lima i-tr" cx="80" cy="74" r="62"/><circle class="i-ln-f" cx="80" cy="74" r="50"/>${estrelas([[44, 30, 1.8], [118, 34, 1.6], [138, 96, 1.4]], 'i-ink')}${balanca(80, 40, .62)}<circle class="i-lar i-tr" cx="32" cy="72" r="13"/><text x="32" y="77" text-anchor="middle" class="i-txt" style="font-size:13px">$</text>${cubo(112, 34, .42, 'i-branco', 'i-rosa', 'i-vio')}${brilho(146, 18, .6)}`),
  rentabilidade: svg(160, 160, `<circle class="i-lar i-tr" cx="80" cy="118" r="34"/><circle class="i-ln-f" cx="80" cy="118" r="24"/><text x="80" y="124" text-anchor="middle" class="i-txt" style="font-size:16px">$</text><path class="i-ln" d="M80 84 V36"/><path class="i-lima i-tr" d="M80 62 Q44 60 38 28 Q74 26 80 62 Z"/><path class="i-grama i-tr" d="M80 48 Q112 44 122 14 Q88 14 80 48 Z"/>${cogumelo(132, 150, .36, 'i-rosa')}${brilho(28, 90, .7)}${estrelas([[22, 128, 1.6], [138, 70, 1.6]], 'i-ink')}`),
  endividamento: svg(160, 160, `<path class="i-rosa i-tr" d="M80 12 a36 40 0 0 1 0 80 a36 40 0 0 1 0 -80 Z"/><path class="i-ln-bg" style="stroke-width:4" d="M62 32 q-8 18 2 34"/><polygon class="i-rosa i-tr" points="74,92 86,92 80,100"/><path class="i-ln-m" d="M80 100 q-10 12 0 22 q8 8 0 14"/><path class="i-preto i-tr" d="M62 156 L68 128 H92 L98 156 Z"/><path class="i-ln-lima" d="M72 142 h16"/>${nuvemFofa(104, 50, .4)}${brilho(30, 40, .7)}${estrelas([[24, 110, 1.6], [140, 120, 1.8]], 'i-ink')}`),
  crescimento: svg(160, 160, `<circle class="i-vio i-tr" cx="112" cy="50" r="38"/><circle class="i-rosa i-tr" cx="112" cy="50" r="24"/>${escada(18, 146, 5, 22, 20)}${cogumelo(119, 47, .3, 'i-lar')}<path class="i-ln-rosa" style="stroke-width:5" d="M22 108 L94 52"/><path class="i-ln" d="M22 108 L98 48 M98 48 h-22 M98 48 v22"/><g>${nuvemFofa(0, 14, .46)}</g>${brilho(146, 110, .6)}`),
  mercado_acoes: svg(160, 160, `<circle class="i-lima i-tr" cx="74" cy="88" r="56"/><path class="i-rosa i-tr" d="M86 70 V14 a56 56 0 0 1 48.5 28 Z"/><path class="i-lar i-tr" d="M74 88 L122.5 116 A56 56 0 0 1 25.5 116 Z"/><path class="i-ln-f" d="M74 88 V32 M74 88 L122.5 116 M74 88 L25.5 116"/>${olho(74, 88, 15, .4, -.3)}${brilho(146, 92, .7)}${estrelas([[22, 26, 1.8], [146, 140, 1.6]], 'i-ink')}`),
  glossario: svg(160, 160, `${cubo(20, 78, 1.25, 'i-branco', 'i-lar', 'i-rosa')}${cubo(72, 28, 1.05, 'i-branco', 'i-lima', 'i-vio')}<text x="40" y="128" class="i-txt" style="font-size:20px">A</text><text x="84" y="66" class="i-txt" style="font-size:17px">Z</text>${nuvemFofa(84, 110, .56)}${brilho(30, 40, .7)}${estrelas([[150, 30, 1.6], [14, 70, 1.6]], 'i-ink')}`),
  conjunto: svg(160, 160, `<circle class="i-rosa i-tr" cx="58" cy="62" r="42"/><circle class="i-lar i-tr" cx="102" cy="62" r="42" fill-opacity=".86"/><circle class="i-lima i-tr" cx="80" cy="100" r="42" fill-opacity=".86"/><circle class="i-ln" cx="58" cy="62" r="42"/><circle class="i-ln" cx="102" cy="62" r="42"/>${olho(80, 76, 11, 0, .4)}${brilho(148, 140, .6)}${estrelas([[14, 140, 1.6], [150, 14, 1.6]], 'i-ink')}`)
};

module.exports = { CENAS, tronco, svg };
