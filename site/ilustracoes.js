/* Cerne — ilustrações vetoriais (Vector Surrealism).
 * Lido por site/gerar-paginas.js. Tudo é SVG embutido, sem arquivo externo.
 * As cores vêm de classes (.i-*) definidas em site/vetor.css, então as cenas
 * acompanham o tema claro e o escuro. As cenas são decorativas (aria-hidden).
 * Vocabulário: arco (passagem), anéis do tronco (o cerne), nuvem (o humor do
 * mercado), piso xadrez em perspectiva, escada, sol, lua e sombra dura. */
'use strict';

const f = (n) => Number(n.toFixed(1));
const svg = (w, h, corpo) => `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${corpo}</svg>`;

/* nuvem: caixa de 100 x 44, origem no canto superior esquerdo */
const nuvem = (x, y, s = 1, cls = 'i-bg', extra = '') => `<path class="${cls} i-tr${extra}" transform="translate(${x} ${y}) scale(${s})" d="M12 44 Q-4 44 -2 30 Q0 18 14 18 Q18 2 36 4 Q52 -6 64 10 Q84 6 88 24 Q102 26 100 38 Q98 44 88 44 Z"/>`;

/* piso xadrez em perspectiva: trapézio de (xa0..xb0, y0) até (xa1..xb1, y1) */
function piso(xa0, xb0, y0, xa1, xb1, y1, cols = 8, lins = 4) {
  const ty = (r) => Math.pow(r / lins, 1.55);
  const pt = (c, r) => { const t = ty(r); const xa = xa0 + (xa1 - xa0) * t, xb = xb0 + (xb1 - xb0) * t; return `${f(xa + (xb - xa) * c / cols)},${f(y0 + (y1 - y0) * t)}`; };
  let o = `<polygon class="i-bg" points="${xa0},${y0} ${xb0},${y0} ${xb1},${y1} ${xa1},${y1}"/>`;
  for (let r = 0; r < lins; r++) for (let c = 0; c < cols; c++) if ((r + c) % 2 === 0) o += `<polygon class="i-ink" points="${pt(c, r)} ${pt(c + 1, r)} ${pt(c + 1, r + 1)} ${pt(c, r + 1)}"/>`;
  return o + `<polygon class="i-ln" points="${xa0},${y0} ${xb0},${y0} ${xb1},${y1} ${xa1},${y1}"/>`;
}

/* corte do tronco: casca, anéis fora de centro e o miolo */
function tronco(cx, cy, r, cor = 'i-ac') {
  const k = r / 88;
  return `<circle class="i-ink" cx="${cx}" cy="${cy}" r="${r}"/><circle class="${cor}" cx="${cx}" cy="${cy}" r="${f(r - 8 * k)}"/>`
    + [[-4, 3, 64], [-8, 6, 48], [-12, 9, 33], [-15, 11, 20]].map(([dx, dy, rr]) => `<circle class="i-ln-f" cx="${f(cx + dx * k)}" cy="${f(cy + dy * k)}" r="${f(rr * k)}"/>`).join('')
    + `<circle class="i-sol i-tr" cx="${f(cx - 17 * k)}" cy="${f(cy + 13 * k)}" r="${f(9 * k)}"/>`;
}

const arco = (x, y, w, h, cls) => `<path class="${cls} i-tr" d="M${x} ${y + h} V${y + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V${y + h} Z"/>`;

/* escada de perfil, subindo para a direita */
function escada(x, y, n, dw, dh, cls = 'i-bg') {
  let d = `M${x} ${y}`;
  for (let i = 0; i < n; i++) d += ` v${-dh} h${dw}`;
  return `<path class="${cls} i-tr" d="${d} V${y} Z"/>`;
}

const cubo = (x, y, s, a = 'i-bg', b = 'i-s2', c = 'i-ink') => `<g transform="translate(${x} ${y}) scale(${s})"><polygon class="${a} i-tr" points="0,14 30,0 60,14 30,28"/><polygon class="${b} i-tr" points="0,14 30,28 30,62 0,48"/><polygon class="${c} i-tr" points="60,14 30,28 30,62 60,48"/></g>`;

const balanca = (cx, y, s = 1) => `<g transform="translate(${cx} ${y}) scale(${s})">
  <polygon class="i-ink" points="-16,96 16,96 0,22"/><rect class="i-ink" x="-34" y="94" width="68" height="8" rx="2"/>
  <path class="i-ln" d="M-78 34 L78 6"/><circle class="i-sol i-tr" cx="0" cy="20" r="8"/>
  <path class="i-ln-f" d="M-78 34 L-98 78 M-78 34 L-58 78 M78 6 L58 44 M78 6 L98 44"/>
  <path class="i-bg i-tr" d="M-104 78 h52 a26 14 0 0 1 -52 0 Z"/><path class="i-bg i-tr" d="M52 44 h52 a26 14 0 0 1 -52 0 Z"/>
</g>`;

const CENAS = {
  /* início: o cerne flutua como um astro; o preço é só a etiqueta pendurada na nuvem */
  inicio: svg(480, 520, `
  <defs><clipPath id="cl-inicio"><path d="M96 392 V202 a102 102 0 0 1 204 0 V392 Z"/></clipPath></defs>
  <circle class="i-sol i-tr" cx="392" cy="96" r="62"/>
  ${arco(96, 100, 204, 292, 'i-ceu')}
  <g clip-path="url(#cl-inicio)">
    <path class="i-lua" d="M236 150 a26 26 0 1 0 22 40 a22 22 0 0 1 -22 -40 Z"/>
    ${nuvem(108, 236, .8, 'i-bg', ' i-flutua-2')}
    ${escada(96, 392, 7, 26, 22, 'i-s1')}
  </g>
  ${arco(96, 100, 204, 292, 'i-ln')}
  ${piso(104, 376, 392, 6, 474, 508, 8, 4)}
  <ellipse class="i-som" cx="352" cy="458" rx="84" ry="13"/>
  <g class="i-flutua">
    <path class="i-ln-f" d="M222 318 A138 34 -16 0 1 478 250"/>
    ${tronco(350, 284, 88)}
    <path class="i-ln" style="stroke-width:9" d="M432 214 A108 108 0 0 1 452 318"/>
    <path class="i-ln" style="stroke-width:9" d="M452 318 q10 22 -12 26"/>
    <path class="i-ln-f" d="M222 318 A138 34 -16 0 0 478 250"/>
    <circle class="i-bg i-tr" cx="238" cy="334" r="10"/>
  </g>
  <g class="i-flutua-2">
    ${nuvem(8, 150, 1.12)}
    <path class="i-ln-f" d="M62 199 V262"/>
    <g transform="translate(62 262) rotate(8)"><path class="i-bg i-tr" d="M0 0 L22 16 V62 H-22 V16 Z"/><circle class="i-ink" cx="0" cy="15" r="3.5"/><path class="i-ln-f" d="M-11 34 H11 M-11 44 H11 M-11 54 H4"/></g>
  </g>
  ${cubo(402, 398, .62, 'i-bg', 'i-lil', 'i-ink')}`),

  /* aprender: do livro sai uma escada; no alto, a porta em forma de fechadura */
  aprender: svg(360, 380, `
  <circle class="i-sol i-tr" cx="252" cy="92" r="74"/>
  <path class="i-ink" d="M228 150 a26 26 0 1 1 48 0 l12 62 h-72 Z"/>
  <path class="i-ceu" d="M240 146 a14 14 0 1 1 24 0 l8 56 h-40 Z"/>
  ${escada(84, 300, 6, 30, 26, 'i-bg')}
  <path class="i-ac i-tr" d="M30 300 Q104 274 180 300 Q256 274 330 300 V332 Q256 306 180 332 Q104 306 30 332 Z"/>
  <path class="i-bg i-tr" d="M44 292 Q110 268 180 294 Q250 268 316 292 V318 Q250 294 180 320 Q110 294 44 318 Z"/>
  <path class="i-ln" d="M180 294 V320"/>
  <ellipse class="i-som" cx="180" cy="354" rx="140" ry="10"/>
  ${nuvem(18, 64, .9, 'i-bg', ' i-flutua')}
  ${cubo(300, 190, .5, 'i-bg', 'i-lil', 'i-ink')}
  <circle class="i-pet i-tr" cx="52" cy="210" r="13"/>`),

  /* análise: o dado sorteia a ação; o arco é a única lente por onde se olha o cerne */
  analise: svg(360, 380, `
  <circle class="i-sol i-tr" cx="70" cy="86" r="46"/>
  ${piso(52, 330, 300, 8, 352, 352, 8, 3)}
  ${arco(140, 44, 176, 258, 'i-ceu')}
  ${tronco(228, 176, 62)}
  <path class="i-ln" d="M140 302 V132 a88 88 0 0 1 176 0 V302"/>
  <ellipse class="i-som" cx="92" cy="318" rx="56" ry="8"/>
  <g transform="translate(40 222) scale(1.5)">
    <polygon class="i-bg i-tr" points="0,14 30,0 60,14 30,28"/><polygon class="i-sol i-tr" points="0,14 30,28 30,62 0,48"/><polygon class="i-ink i-tr" points="60,14 30,28 30,62 60,48"/>
    <ellipse class="i-ink" cx="30" cy="14" rx="4.6" ry="2.4"/>
    <circle class="i-ink" cx="9" cy="30" r="2.8"/><circle class="i-ink" cx="21" cy="50" r="2.8"/>
    <circle class="i-bg" cx="38" cy="36" r="2.6"/><circle class="i-bg" cx="45" cy="42" r="2.6"/><circle class="i-bg" cx="52" cy="26" r="2.6"/>
  </g>
  ${nuvem(232, 18, .78, 'i-bg', ' i-flutua')}`),

  /* indicadores: um olho cuja íris é o tronco; abaixo, uma nuvem pesa mais que um cubo */
  indicadores: svg(360, 400, `
  <circle class="i-ceu i-tr" cx="180" cy="128" r="112"/>
  <path class="i-bg i-tr" d="M34 128 Q180 14 326 128 Q180 242 34 128 Z"/>
  ${tronco(180, 128, 56)}
  <path class="i-ln-f" d="M70 84 l-12 -18 M108 60 l-8 -20 M152 46 l-3 -21 M208 46 l3 -21 M252 60 l8 -20 M290 84 l12 -18"/>
  <g transform="translate(180 268)">
    <polygon class="i-ink" points="-16,96 16,96 0,22"/><rect class="i-ink" x="-40" y="94" width="80" height="8" rx="2"/>
    <path class="i-ln" d="M-96 6 L96 40"/><circle class="i-sol i-tr" cx="0" cy="22" r="9"/>
    <path class="i-ln-f" d="M-96 6 L-118 46 M-96 6 L-74 46 M96 40 L74 82 M96 40 L118 82"/>
    <path class="i-bg i-tr" d="M-124 46 h56 a28 14 0 0 1 -56 0 Z"/><path class="i-bg i-tr" d="M68 82 h56 a28 14 0 0 1 -56 0 Z"/>
  </g>
  ${cubo(66, 266, .6, 'i-bg', 'i-ac', 'i-ink')}
  ${nuvem(238, 308, .72, 'i-bg')}
  <ellipse class="i-som" cx="180" cy="384" rx="120" ry="8"/>`),

  /* ferramentas: na ampulheta, o tempo que cai vira uma árvore */
  ferramentas: svg(360, 380, `
  <circle class="i-ceu i-tr" cx="118" cy="110" r="76"/>
  <ellipse class="i-som" cx="196" cy="356" rx="118" ry="10"/>
  <rect class="i-ink" x="104" y="36" width="184" height="16" rx="4"/><rect class="i-ink" x="104" y="326" width="184" height="16" rx="4"/>
  <path class="i-bg i-tr" d="M120 52 H272 Q272 150 208 188 Q272 226 272 326 H120 Q120 226 184 188 Q120 150 120 52 Z"/>
  <path class="i-sol" d="M140 96 H252 Q240 150 196 174 Q152 150 140 96 Z"/>
  <path class="i-ln-ac" d="M196 176 V250"/>
  <path class="i-sol" d="M128 324 Q134 276 196 276 Q258 276 264 324 Z"/>
  <path class="i-ln" d="M196 278 V240"/>
  <circle class="i-pet i-tr" cx="196" cy="226" r="24"/><circle class="i-men i-tr" cx="176" cy="240" r="13"/><circle class="i-men i-tr" cx="216" cy="242" r="12"/>
  <path class="i-ln" d="M120 52 H272 Q272 150 208 188 Q272 226 272 326 H120 Q120 226 184 188 Q120 150 120 52 Z"/>
  <g class="i-flutua"><path class="i-ln-f" d="M40 214 A160 36 -12 0 1 352 150"/><circle class="i-ac i-tr" cx="318" cy="152" r="16"/><circle class="i-ln-f" cx="318" cy="152" r="8"/></g>
  <polygon class="i-lil i-tr" points="22,342 22,262 84,342"/>`),

  /* método: papéis empilhados, uma escada e uma lupa que vê o cerne */
  metodo: svg(360, 380, `
  <path class="i-sol i-tr" d="M66 96 a54 54 0 1 0 60 84 a46 46 0 0 1 -60 -84 Z"/>
  <ellipse class="i-som" cx="170" cy="354" rx="140" ry="10"/>
  ${[0, 1, 2, 3].map((i) => `<polygon class="${['i-bg', 'i-s2', 'i-bg', 'i-ceu'][i]} i-tr" points="${36},${322 - i * 20} ${150},${288 - i * 20} ${286},${322 - i * 20} ${172},${356 - i * 20}"/>`).join('')}
  <path class="i-ln-f" d="M112 276 l60 18 M132 268 l60 18"/>
  <path class="i-ln" d="M150 290 L214 118 M186 300 L250 128"/>
  <path class="i-ln" d="M162 258 l36 10 M175 224 l36 10 M188 190 l36 10 M201 156 l36 10"/>
  <g class="i-flutua">
    <path class="i-ln" style="stroke-width:11" d="M300 142 L338 190"/>
    ${tronco(262, 92, 62)}
    <circle class="i-ln" style="stroke-width:7" cx="262" cy="92" r="62"/>
  </g>
  ${nuvem(8, 196, .7, 'i-bg', ' i-flutua-2')}`),

  /* mercado: uma janela solta no ar; dentro, o gráfico é o mar */
  mercado: svg(360, 380, `
  <defs><clipPath id="cl-mercado"><rect x="60" y="40" width="240" height="250"/></clipPath></defs>
  <ellipse class="i-som" cx="180" cy="358" rx="130" ry="9"/>
  <rect class="i-ceu" x="60" y="40" width="240" height="250"/>
  <g clip-path="url(#cl-mercado)">
    <circle class="i-sol i-tr" cx="236" cy="112" r="40"/>
    <path class="i-ln-ac" d="M60 190 L96 150 L126 176 L162 118 L196 158 L228 104 L262 140 L300 86"/>
    <path class="i-pet i-tr" d="M50 222 q20 -18 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V300 H50 Z"/>
    <path class="i-ln-bg" d="M70 252 q14 -10 28 0 t28 0 M170 264 q14 -10 28 0 t28 0"/>
    <g transform="translate(132 196)"><polygon class="i-bg i-tr" points="0,26 60,26 46,44 14,44"/><polygon class="i-bg i-tr" points="30,-14 30,22 6,22"/><polygon class="i-ac i-tr" points="30,-6 30,22 52,22"/></g>
  </g>
  <rect class="i-ln" style="stroke-width:7" x="60" y="40" width="240" height="250"/>
  <path class="i-ln" d="M180 40 V290 M60 165 H300"/>
  <rect class="i-ink" x="46" y="288" width="268" height="14" rx="3"/>
  <path class="i-pet i-tr" d="M210 302 q18 20 8 40 q-6 14 14 16 h-56 q20 -4 14 -24 q-4 -16 6 -32 Z"/>
  ${nuvem(246, 14, .78, 'i-bg', ' i-flutua')}
  ${cubo(20, 300, .5, 'i-bg', 'i-lil', 'i-ink')}`),

  /* empresa: a árvore nasce de um cubo; a copa é uma nuvem */
  empresa: svg(360, 400, `
  <circle class="i-sol i-tr" cx="268" cy="96" r="58"/>
  <ellipse class="i-som" cx="186" cy="378" rx="120" ry="10"/>
  ${cubo(120, 280, 2.1, 'i-bg', 'i-s2', 'i-ink')}
  <path class="i-ac i-tr" d="M166 306 Q176 230 170 150 H206 Q200 230 212 306 Q190 320 166 306 Z"/>
  <path class="i-ln-f" d="M180 290 Q186 230 182 160 M196 290 Q192 240 196 170"/>
  <path class="i-ac i-tr" d="M204 214 Q240 204 262 176 l18 12 Q252 228 206 240 Z"/>
  <g transform="translate(272 180) rotate(34)">${tronco(0, 0, 15)}</g>
  <g class="i-flutua">${nuvem(46, 46, 2.7, 'i-men')}</g>
  <path class="i-ln-f" d="M96 134 q16 -12 32 0 M226 120 q14 -10 28 0"/>`),

  /* faixa "decida por você": uma porta entreaberta na noite */
  decida: svg(176, 210, `
  <path class="i-sol" d="M120 22 a22 22 0 1 0 22 36 a18 18 0 0 1 -22 -36 Z"/>
  <circle class="i-lua" cx="34" cy="40" r="2"/><circle class="i-lua" cx="70" cy="18" r="1.6"/><circle class="i-lua" cx="150" cy="96" r="1.8"/><circle class="i-lua" cx="20" cy="110" r="1.4"/>
  <path class="i-ln-lua" d="M52 210 V124 a36 36 0 0 1 72 0 V210"/>
  <path class="i-sol" d="M58 210 V125 a30 30 0 0 1 60 0 V210 Z"/>
  <polygon class="i-ac" points="58,210 58,112 92,128 92,210"/>
  <circle class="i-lua" cx="86" cy="172" r="2.6"/>
  <polygon class="i-sol" opacity=".28" points="92,210 118,210 176,236 110,236"/>`),

  /* categorias de indicadores */
  valuation: svg(160, 160, `<circle class="i-ceu i-tr" cx="80" cy="74" r="62"/>${balanca(80, 40, .62)}<circle class="i-sol i-tr" cx="32" cy="72" r="13"/><text x="32" y="77" text-anchor="middle" class="i-ink" style="font:700 13px sans-serif">$</text>${cubo(112, 34, .42, 'i-bg', 'i-ac', 'i-ink')}`),
  rentabilidade: svg(160, 160, `<circle class="i-sol i-tr" cx="80" cy="118" r="34"/><circle class="i-ln-f" cx="80" cy="118" r="22"/><path class="i-ln" d="M80 84 V36"/><path class="i-men i-tr" d="M80 62 Q44 60 38 28 Q74 26 80 62 Z"/><path class="i-pet i-tr" d="M80 48 Q112 44 122 14 Q88 14 80 48 Z"/>${nuvem(96, 60, .5)}`),
  endividamento: svg(160, 160, `<path class="i-ac i-tr" d="M80 12 a36 40 0 0 1 0 80 a36 40 0 0 1 0 -80 Z"/><polygon class="i-ac i-tr" points="74,92 86,92 80,100"/><path class="i-ln-f" d="M80 100 q-10 12 0 22 q8 8 0 14"/><circle class="i-ink" cx="80" cy="140" r="16"/><path class="i-ln-bg" d="M72 138 h16"/><path class="i-ln-f" d="M62 34 q-8 18 2 34"/><ellipse class="i-som" cx="80" cy="157" rx="34" ry="3"/>`),
  crescimento: svg(160, 160, `<circle class="i-lil i-tr" cx="112" cy="50" r="38"/>${escada(18, 146, 5, 22, 20, 'i-bg')}<path class="i-ln-ac" d="M22 108 L128 26 M128 26 h-26 M128 26 v26"/>${nuvem(4, 20, .56)}`),
  mercado_acoes: svg(160, 160, `<circle class="i-ceu i-tr" cx="74" cy="88" r="56"/><path class="i-ac i-tr" d="M86 70 V14 a56 56 0 0 1 48.5 28 Z"/><path class="i-ln-f" d="M74 88 V32 M74 88 L122.5 116 M74 88 L25.5 116"/><circle class="i-bg i-tr" cx="74" cy="88" r="14"/><circle class="i-ink" cx="74" cy="88" r="5"/>`),
  glossario: svg(160, 160, `${cubo(20, 78, 1.25, 'i-bg', 'i-sol', 'i-ink')}${cubo(72, 28, 1.05, 'i-bg', 'i-ceu', 'i-ac')}${nuvem(86, 108, .6)}`),
  conjunto: svg(160, 160, `<circle class="i-ac i-tr" cx="58" cy="62" r="42"/><circle class="i-sol i-tr" cx="102" cy="62" r="42" fill-opacity=".86"/><circle class="i-ceu i-tr" cx="80" cy="100" r="42" fill-opacity=".86"/><circle class="i-ln" cx="58" cy="62" r="42"/><circle class="i-ln" cx="102" cy="62" r="42"/><circle class="i-ink" cx="80" cy="76" r="6"/>`)
};

module.exports = { CENAS, tronco, svg };
