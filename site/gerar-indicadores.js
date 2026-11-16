/* Cerne — gera a área de indicadores da seção Aprender.
 * Chamado por site/gerar-paginas.js. Produz:
 *   indicadores.html                 índice por categoria, com busca e progresso
 *   indicador-<slug>.html            uma página por indicador (33)
 *   indicadores-em-conjunto.html     por que não analisar um indicador sozinho
 *   glossario.html                   termos usados nas explicações
 *
 * Conteúdo: site/indicadores/<categoria>.js. Cada indicador é um objeto com
 *   slug, nome, curto, tipo ('mercado' | 'contabil' | 'mista'), resumo,
 *   oque, mede (HTML), formula [linha, linha opcional], vars [[nome, explicação]],
 *   interp [[rótulo, texto] x3], bom (HTML), conceito, uso (HTML), erro,
 *   limites [HTML], setores [[setor, texto]], compara { a: [nome, descrição, valores], b: [...], leitura },
 *   junto [[slug, nome, por quê]], termos [ids do glossário].
 * As contas (exemplo, medidor, leitura) vêm de site/indicadores-calc.js, o mesmo
 * arquivo que o navegador usa no exemplo interativo. Não escreva resultado de
 * conta à mão no exemplo: mude os valores em indicadores-calc.js. */
'use strict';
const CALC = require('./indicadores-calc.js');
const GLOSS = require('./indicadores/glossario.js');

const CATS = [
  { id: 'valuation', nome: 'Valuation', cena: 'valuation', pergunta: 'Quanto custa?',
    resumo: 'Relacionam o preço da ação, ou o valor da empresa, com o que ela lucra, possui ou gera de caixa. Dizem quanto se paga. Não dizem se vale a pena.' },
  { id: 'rentabilidade', nome: 'Rentabilidade e eficiência', cena: 'rentabilidade', pergunta: 'O negócio é bom?',
    resumo: 'Medem quanto a empresa ganha em relação ao que vende e ao capital que usa. São contábeis: não dependem do preço da ação.' },
  { id: 'endividamento', nome: 'Endividamento e saúde financeira', cena: 'endividamento', pergunta: 'Aguenta um ano ruim?',
    resumo: 'Avaliam o tamanho e o custo da dívida, a folga de curto prazo e o caixa que sobra. Mostram a resistência da empresa a um período difícil.' },
  { id: 'crescimento', nome: 'Crescimento', cena: 'crescimento', pergunta: 'Está crescendo de verdade?',
    resumo: 'Medem o ritmo de expansão de receita, resultado e caixa. Descrevem o passado, e por isso pedem cuidado redobrado antes de qualquer projeção.' },
  { id: 'mercado', nome: 'Indicadores de mercado e ações', cena: 'mercado_acoes', pergunta: 'Como é este papel?',
    resumo: 'Descrevem a ação e a sua negociação: tamanho, lucro por ação, distribuição, sensibilidade ao mercado, liquidez e dispersão do capital.' }
];
const TIPOS = { mercado: ['Métrica de mercado', 'tag', 'Depende só de preços de mercado. Muda a cada negócio.'], contabil: ['Métrica contábil', 'tag tag-contabil', 'Calculada com dados das demonstrações financeiras. Só muda a cada balanço.'], mista: ['Mercado + contábil', 'tag tag-mista', 'Combina preço de mercado com dado contábil.'] };

const INDICADORES = [];
CATS.forEach((c, ci) => require(`./indicadores/${c.id}.js`).forEach((d) => { d.cat = c; d.arquivo = `indicador-${d.slug}.html`; d.num = `${ci + 1}.${INDICADORES.filter((x) => x.cat === c).length + 1}`; INDICADORES.push(d); }));

/* ---------------------------------------------------------- verificações -- */
const porSlug = {};
INDICADORES.forEach((d) => {
  if (porSlug[d.slug]) throw new Error('slug repetido: ' + d.slug);
  if (!CALC.DEFS[d.slug]) throw new Error('falta a conta de: ' + d.slug);
  porSlug[d.slug] = d;
});
INDICADORES.forEach((d) => {
  d.termos.forEach((t) => { if (!GLOSS[t]) throw new Error(`${d.slug}: termo fora do glossário: ${t}`); });
  d.junto.forEach(([s]) => { if (s && !porSlug[s]) throw new Error(`${d.slug}: indicador complementar inexistente: ${s}`); });
  ['a', 'b'].forEach((k) => Object.keys(d.compara[k][2]).forEach((id) => { if (!CALC.DEFS[d.slug].entradas.some((e) => e[0] === id)) throw new Error(`${d.slug}: entrada desconhecida na comparação: ${id}`); }));
  if (d.interp.length !== 3) throw new Error(`${d.slug}: interp precisa de 3 faixas`);
});
if (INDICADORES.length !== Object.keys(CALC.DEFS).length) throw new Error('indicadores e contas não batem');

/* --------------------------------------------------------------- formatos -- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const semTags = (s) => String(s).replace(/<[^>]+>/g, '');
const campo = (v) => { const dec = Number.isInteger(v) ? 0 : (Math.abs(v * 10 - Math.round(v * 10)) < 1e-9 ? 1 : 2); return CALC.n(v, dec); };
function comUnidade(v, un) {
  if (un === 'R$') return 'R$ ' + CALC.n(v, 2);
  if (un === 'R$ mi') return 'R$ ' + campo(v) + ' mi';
  if (un === '%') return campo(v) + '%';
  if (un === 'mi') return campo(v) + ' mi';
  if (un === 'anos') return campo(v) + ' anos';
  return campo(v);
}
const SUFIXO = { 'R$': null, 'R$ mi': 'milhões', '%': '%', 'mi': 'milhões', 'anos': 'anos', 'dias': 'pregões', '': null };
const PREFIXO = { 'R$': 'R$', 'R$ mi': 'R$' };

/* ------------------------------------------------------------ componentes -- */
function medidor(slug, res) {
  const pos = CALC.posicao(slug, res), ext = CALC.extremos(slug), def = CALC.DEFS[slug];
  if (!ext) return '';
  return `${def.rotuloMedidor ? `<p class="lab-rotulo" style="margin-top:1rem">${def.rotuloMedidor}</p>` : ''}<div class="medidor" aria-hidden="true"${def.rotuloMedidor ? ' style="margin-top:.9rem"' : ''}><i style="left:${pos === null ? 0 : (pos * 100).toFixed(1)}%"${pos === null ? ' hidden' : ''}></i></div><div class="medidor-escala" aria-hidden="true"><span>${ext[0]}</span><span>${ext[1]}</span></div>`;
}

function laboratorio(d) {
  const def = CALC.DEFS[d.slug], v = CALC.valoresPadrao(d.slug), res = def.calc(v);
  const presets = { padrao: v, a: CALC.valoresPadrao(d.slug, d.compara.a[2]), b: CALC.valoresPadrao(d.slug, d.compara.b[2]) };
  const campos = def.entradas.map(([id, rotulo, un]) => `
        <div class="campo"><label for="lab-${id}">${rotulo}</label><div class="entrada">${PREFIXO[un] ? `<span>${PREFIXO[un]}</span>` : ''}<input id="lab-${id}" data-id="${id}" type="text" inputmode="decimal" autocomplete="off" value="${campo(v[id])}">${SUFIXO[un] ? `<span>${SUFIXO[un]}</span>` : ''}</div></div>`).join('');
  return `<div class="lab" id="laboratorio" data-lab="${d.slug}" data-presets="${esc(JSON.stringify(presets))}">
      <div class="lab-topo"><b>Experimente: mude os valores</b>
        <ul class="chips" aria-label="Carregar valores de exemplo"><li><button type="button" class="chip" data-preset="padrao" aria-pressed="true">Companhia Alfa</button></li><li><button type="button" class="chip" data-preset="a" aria-pressed="false">${d.compara.a[0]}</button></li><li><button type="button" class="chip" data-preset="b" aria-pressed="false">${d.compara.b[0]}</button></li></ul>
      </div>
      <div class="lab-grade">
        <form class="lab-entradas" novalidate>${campos}
        </form>
        <div class="lab-saida" aria-live="polite">
          <p class="lab-rotulo">${d.curto}</p>
          <p class="lab-valor" data-lab-valor>${CALC.mostrar(def.un, res.valor)}</p>
          <div data-lab-medidor>${medidor(d.slug, res)}</div>
          <p class="lab-leitura" data-lab-leitura>${CALC.leitura(d.slug, res)}</p>
          <ol class="lab-passos" data-lab-passos>${res.passos.map((p) => `<li>${p}</li>`).join('')}</ol>
        </div>
      </div>
      <p class="lab-nota">Empresas e números fictícios. A leitura automática é uma pista para estudo, baseada em faixas genéricas; ela não conhece o setor, o ciclo nem a qualidade dos dados. Não é recomendação.</p>
    </div>`;
}

function duelo(d) {
  const def = CALC.DEFS[d.slug];
  const lado = (k) => {
    const [nome, desc, troca] = d.compara[k], v = CALC.valoresPadrao(d.slug, troca), res = def.calc(v);
    const linhas = def.entradas.filter(([id]) => id in troca).map(([id, rot, un]) => `<div><dt>${rot}</dt><dd>${comUnidade(v[id], un)}</dd></div>`).join('');
    return `<div class="duelo-lado"><h3>${nome}</h3><p>${desc}</p><dl>${linhas}</dl><p class="duelo-res"><span>${d.curto}</span><b>${CALC.mostrar(def.un, res.valor)}</b></p></div>`;
  };
  return `<div class="duelo">${lado('a')}${lado('b')}</div>${d.compara.leitura}`;
}

const termosHtml = (ids) => `<ul class="termos">${ids.map((t) => `<li><a class="chip" href="glossario.html#${t}">${GLOSS[t][0]}</a></li>`).join('')}</ul>`;

/* --------------------------------------------------- página do indicador -- */
function paginaIndicador(d, i, o) {
  const ant = INDICADORES[i - 1], prox = INDICADORES[i + 1], def = CALC.DEFS[d.slug];
  const ex = def.calc(CALC.valoresPadrao(d.slug)), tipo = TIPOS[d.tipo];
  const SEC = [['o-que-e', 'O que é'], ['o-que-mede', 'O que mede'], ['como-calcular', 'Como calcular'], ['exemplo', 'Exemplo prático'], ['interpretar', 'Como interpretar'], ['bom-resultado', 'O que é um bom resultado'], ['aplicacao', 'Aplicação prática'], ['limitacoes', 'Limitações e ressalvas'], ['complementares', 'Indicadores complementares']];
  return { arquivo: d.arquivo, id: 'aprender', titulo: `${d.nome} — Indicadores — ${o.MARCA}`,
    descricao: `${semTags(d.nome)}: ${d.resumo} O que é, como calcular, exemplo interativo, como interpretar, limitações e indicadores complementares.`,
    scripts: ['site/indicadores-calc.js', 'site/indicadores.js'],
    corpo: `<article class="secao" data-indicador="${d.slug}"><div class="dentro">
  <div class="ind-cab">
    <div>
      <p class="olho"><a href="aprender.html">Aprender</a> · <a href="indicadores.html">Indicadores</a> · <a href="indicadores.html#${d.cat.id}">${d.cat.nome}</a> · ${d.num}</p>
      <h1 class="titulo">${d.nome}</h1>
      <p class="lead">${d.resumo}</p>
      <p class="ind-tags"><span class="${tipo[1]}" title="${tipo[2]}">${tipo[0]}</span><span class="tag tag-lida" id="selo-lido" hidden>Estudado</span></p>
    </div>
    ${o.cena(d.cat.cena)}
  </div>
  <div class="aula-grade">
  <nav class="aula-indice" aria-label="Nesta página">
    <p>Nesta página</p>
    <ol>${SEC.map(([id, n]) => `<li><a href="#${id}">${n}</a></li>`).join('')}</ol>
  </nav>
  <div class="ind-corpo">
    <section class="num" id="o-que-e"><h2>O que é</h2>${d.oque}</section>
    <section class="num" id="o-que-mede"><h2>O que mede</h2>${d.mede}
      <div class="destaque destaque-ressalva"><b>${tipo[0]}</b><p>${tipo[2]} ${d.tipo === 'contabil' ? 'O número depende das escolhas contábeis da empresa e fica parado entre uma divulgação e outra.' : d.tipo === 'mercado' ? 'Reflete o comportamento dos preços, e não os fundamentos do negócio.' : 'Por isso varia todos os dias, mesmo que nada mude na empresa.'}</p></div>
    </section>
    <section class="num" id="como-calcular"><h2>Como calcular</h2>
      <div class="quadro-formula">${d.formula.map((f) => `<p>${f}</p>`).join('')}</div>
      <dl class="variaveis">${d.vars.map(([n, t]) => `<div><dt>${n}</dt><dd>${t}</dd></div>`).join('')}</dl>
    </section>
    <section class="num" id="exemplo"><h2>Exemplo prático</h2>
      <p>A <b>Companhia Alfa</b> é uma empresa fictícia, com números realistas, usada em todas as páginas desta área. A conta, passo a passo:</p>
      <ol class="passos-ex">${ex.passos.map((p) => `<li>${p}</li>`).join('')}</ol>
      ${laboratorio(d)}
    </section>
    <section class="num" id="interpretar"><h2>Como interpretar</h2>
      <dl class="faixas">${d.interp.map(([r, t]) => `<div><dt>${r}</dt><dd>${t}</dd></div>`).join('')}</dl>
      <div class="destaque"><b>Conceito importante</b><p>${d.conceito}</p></div>
    </section>
    <section class="num" id="bom-resultado"><h2>O que é considerado um bom resultado</h2>${d.bom}</section>
    <section class="num" id="aplicacao"><h2>Aplicação prática</h2>${d.uso}
      <h3>Duas empresas fictícias, lado a lado</h3>
      ${duelo(d)}
      <h3>O mesmo indicador em setores diferentes</h3>
      <ul class="setores">${d.setores.map(([s, t]) => `<li><b>${s}</b><span>${t}</span></li>`).join('')}</ul>
    </section>
    <section class="num" id="limitacoes"><h2>Limitações e ressalvas</h2>
      <div class="destaque destaque-erro"><b>Erro comum</b><p>${d.erro}</p></div>
      <ul class="ressalvas">${d.limites.map((l) => `<li>${l}</li>`).join('')}</ul>
      <p class="nota">Todo indicador calculado com dados passados descreve o que já aconteceu. Usá-lo para projetar o futuro supõe que as condições vão se repetir, o que nem sempre ocorre.</p>
    </section>
    <section class="num" id="complementares"><h2>Indicadores complementares</h2>
      <p>Nenhum indicador responde sozinho. Para uma leitura mais confiável, analise junto:</p>
      <ul class="junto">${d.junto.map(([s, n, t]) => `<li><a href="indicador-${s}.html"><b>${n}</b><span>${t}</span></a></li>`).join('')}</ul>
      <p>Veja casos em que um indicador isolado engana em <a href="indicadores-em-conjunto.html">Indicadores em conjunto</a>.</p>
      <h3>Termos usados nesta página</h3>
      ${termosHtml(d.termos)}
    </section>
    <div class="marcar"><p><b>Terminou de estudar este indicador?</b> A marcação fica guardada só neste navegador.</p><button type="button" class="btn btn-secundario btn-pequeno" id="marcar-lido" aria-pressed="false">Marcar como estudado</button></div>
    <nav class="aula-passos" aria-label="Indicadores vizinhos">
      ${ant ? `<a href="${ant.arquivo}"><span>Anterior · ${ant.num}</span><b>${ant.curto}</b></a>` : `<a href="indicadores.html"><span>Voltar</span><b>Todos os indicadores</b></a>`}
      ${prox ? `<a href="${prox.arquivo}"><span>Próximo · ${prox.num}</span><b>${prox.curto}</b></a>` : `<a href="indicadores-em-conjunto.html"><span>Depois dos indicadores</span><b>Indicadores em conjunto</b></a>`}
    </nav>
    <div style="margin-top:2rem">${o.AVISO}</div>
  </div>
  </div>
</div></article>` };
}

/* ------------------------------------------------------------------ índice -- */
function paginaIndice(o) {
  const cats = CATS.map((c, ci) => `
  <section class="cat" id="${c.id}" data-cat="${c.id}">
    <div class="cat-cab">
      ${o.cena(c.cena)}
      <span class="cat-num">Categoria ${ci + 1} · ${c.pergunta}</span>
      <h2>${c.nome}</h2>
      <p>${c.resumo}</p>
    </div>
    <ul class="ind-lista">${INDICADORES.filter((d) => d.cat === c).map((d) => `
      <li data-busca="${esc((semTags(d.nome) + ' ' + d.curto + ' ' + d.resumo).toLowerCase())}"><a class="ind-cartao" href="${d.arquivo}" data-indicador="${d.slug}"><span class="ind-cartao-formula">${d.num}</span><span class="ind-cartao-nome">${d.nome}</span><span class="ind-cartao-desc">${d.resumo}</span><span class="ind-cartao-pe"><span class="${TIPOS[d.tipo][1]}">${TIPOS[d.tipo][0]}</span></span></a></li>`).join('')}
    </ul>
  </section>`).join('');
  return { arquivo: 'indicadores.html', id: 'aprender', titulo: `Indicadores de empresas — Aprender — ${o.MARCA}`,
    descricao: `${INDICADORES.length} indicadores financeiros explicados do zero: valuation, rentabilidade, endividamento, crescimento e mercado. Fórmula, exemplo interativo, interpretação e limitações de cada um.`,
    scripts: ['site/indicadores.js'],
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca-cena"><div class="cabeca">
    <p class="olho"><a href="aprender.html">Aprender</a> · Indicadores de empresas</p>
    <h1 class="manchete">Indicador é pista.<br><em>Não é veredito.</em></h1>
    <p class="lead">${INDICADORES.length} indicadores usados para analisar empresas, explicados para quem nunca viu um balanço. Cada página traz a definição, a fórmula, um exemplo que você pode alterar, a interpretação, as armadilhas e os indicadores que devem ser lidos junto.</p>
  </div>${o.cena('indicadores')}</div>
  <div class="orientacao">
    <div><h2><span class="marca-ponto" aria-hidden="true"></span>Contábil ou de mercado</h2><p>Métricas contábeis vêm do balanço e só mudam a cada trimestre. Métricas de mercado dependem do preço e mudam a cada negócio. Muitos múltiplos misturam as duas. Cada página indica o tipo.</p></div>
    <div><h2><span class="marca-ponto" aria-hidden="true"></span>O setor muda a leitura</h2><p>Um número bom para um banco pode ser péssimo para uma indústria. Alguns indicadores nem se aplicam a certos setores. Compare empresas parecidas.</p></div>
    <div><h2><span class="marca-ponto" aria-hidden="true"></span>Nunca um só</h2><p>Todo indicador tem um ponto cego. Lidos em conjunto, um cobre a falha do outro. Veja exemplos em <a href="indicadores-em-conjunto.html">Indicadores em conjunto</a>.</p></div>
  </div>
  <div class="filtro" id="filtro">
    <div><label for="busca-ind">Procurar um indicador</label><div class="entrada"><input id="busca-ind" type="search" autocomplete="off" placeholder="P/L, margem, dívida…"></div></div>
    <div><ul class="chips" aria-label="Filtrar por categoria"><li><button type="button" class="chip" data-filtro="" aria-pressed="true">Todos</button></li>${CATS.map((c) => `<li><button type="button" class="chip" data-filtro="${c.id}" aria-pressed="false">${c.nome}</button></li>`).join('')}</ul>
    <p class="nota" id="ind-progresso" role="status" style="margin:.7rem 0 0"></p></div>
  </div>
  <p class="filtro-vazio" id="filtro-vazio" hidden>Nenhum indicador encontrado. Tente outra palavra ou veja o <a href="glossario.html">glossário</a>.</p>
  ${cats}
</div></section>

<section class="secao secao-areia"><div class="dentro">
  <div class="cabeca"><p class="olho">Para continuar</p><h2 class="titulo-2">Depois de conhecer cada um, <em>junte as peças.</em></h2></div>
  <ul class="mapa">
    <li><h3>Indicadores em conjunto</h3><p>Cinco casos em que um número isolado engana, e uma decomposição interativa do ROE.</p><p><a class="btn btn-primario btn-pequeno" href="indicadores-em-conjunto.html">Ver os casos</a></p></li>
    <li><h3>Glossário</h3><p>${Object.keys(GLOSS).length} termos usados nas explicações, de ágio a WACC, em linguagem direta.</p><p><a class="btn btn-secundario btn-pequeno" href="glossario.html">Abrir o glossário</a></p></li>
    <li><h3>Método de estudo</h3><p>Oito etapas para estudar uma empresa. Os indicadores entram na quinta, depois de entender o negócio.</p><p><a class="btn btn-secundario btn-pequeno" href="metodo.html">Abrir o método</a></p></li>
  </ul>
  <div class="estreito" style="margin-top:2rem">${o.AVISO}</div>
</div></section>` };
}

/* ---------------------------------------------------------------- conjunto -- */
function tabela(cab, linhas) {
  return `<div class="tabela-rolagem"><table class="tabela-duelo"><thead><tr><th scope="col">${cab[0]}</th><th scope="col">${cab[1]}</th><th scope="col">${cab[2]}</th></tr></thead><tbody>${linhas.map(([r, a, b, forte]) => `<tr${forte ? ' class="forte"' : ''}><th scope="row">${r}</th><td>${a}</td><td>${b}</td></tr>`).join('')}</tbody></table></div>`;
}
const li = (slug) => `<a href="indicador-${slug}.html">${porSlug[slug].curto}</a>`;
function paginaConjunto(o) {
  const PRESETS = [['Supermercado', 2, 2.5, 3.2], ['Software', 20, 0.6, 1.3], ['Banco', 15, 0.1, 10], ['Indústria endividada', 4, 0.8, 5]];
  const p0 = PRESETS[0];
  const casos = [
    ['P/L baixo não é sinônimo de barato', 'Um ganho que não se repete infla o lucro e derruba o múltiplo.',
      tabela(['R$ milhões', 'Siderúrgica Alto Forno', 'Embalagens Prisma'], [['Valor de mercado', '6.000', '6.000'], ['Lucro líquido divulgado', '1.500', '600'], ['Ganho com venda de subsidiária', '900', '0'], ['Lucro recorrente', '600', '600'], ['P/L pelo lucro divulgado', '4,0×', '10,0×', 1], ['P/L pelo lucro recorrente', '10,0×', '10,0×', 1]]),
      `<p>Em uma lista ordenada por P/L, a Alto Forno aparece como a pechincha. O lucro dela inclui R$ 900 milhões da venda de uma subsidiária, que não acontecerá de novo. Retirado o ganho, as duas custam o mesmo. Antes de confiar em um ${li('pl')}, confira nas notas explicativas se o lucro é recorrente e compare com o ${li('fcf-yield')} e o ${li('ev-ebitda')}.</p>`],
    ['Dividend yield alto pode ser despedida', 'O provento só dura se couber no lucro e, principalmente, no caixa.',
      tabela(['R$ milhões', 'Varejo Cometa', 'Elétrica Planalto'], [['Dividend yield', '12,0%', '6,0%', 1], ['Proventos pagos', '800', '800'], ['Lucro líquido', '700', '1.000'], ['Payout', '114%', '80%'], ['Fluxo de caixa livre', '250', '1.100'], ['FCF ÷ proventos', '0,3×', '1,4×', 1], ['Dívida líquida/EBITDA', '3,8×', '2,1×']]),
      `<p>O yield da Cometa é o dobro. Ela pagou mais do que lucrou e mais que o triplo do caixa livre que gerou, com a dívida já alta. A diferença foi coberta com empréstimos. A Planalto paga menos em relação ao preço, e o pagamento cabe com folga no caixa. Leia o ${li('dividend-yield')} sempre com ${li('payout')}, ${li('fluxo-de-caixa-livre')} e ${li('divida-liquida-ebitda')}.</p>`],
    ['Crescer não é o mesmo que criar valor', 'Receita em alta pode esconder retorno abaixo do custo do dinheiro.',
      tabela(['Cinco anos', 'Rede Expressa', 'Padaria Trigal'], [['CAGR da receita', '28%', '10%', 1], ['ROIC médio', '7%', '19%'], ['Custo de capital estimado', '13%', '13%'], ['Fluxo de caixa livre acumulado', '−R$ 2.400 mi', '+R$ 900 mi'], ['Aumento do número de ações', '+60%', '0%'], ['CAGR do lucro por ação', '2%', '10%', 1]]),
      `<p>A Rede Expressa mais que triplicou a receita. Cada real investido nessa expansão rendeu 7%, abaixo dos 13% que o capital custa, e o crescimento foi pago com caixa negativo e emissão de ações. Para o acionista, o lucro por ação quase não saiu do lugar. A Trigal cresceu menos e multiplicou o lucro de cada ação. Junto do ${li('cagr-receita')}, olhe ${li('roic')}, ${li('fluxo-de-caixa-livre')} e ${li('crescimento-lpa')}.</p>`],
    ['O mesmo negócio, dois preços aparentes', 'Múltiplos do acionista ignoram a dívida; múltiplos da firma, não.',
      tabela(['R$ milhões', 'Papel Araucária', 'Papel Cerrado'], [['EBITDA', '1.400', '1.400'], ['Dívida líquida', '200', '3.800'], ['Valor de mercado', '8.000', '4.400'], ['Enterprise Value', '8.200', '8.200'], ['Lucro líquido', '647', '459'], ['P/L', '12,4×', '9,6×', 1], ['EV/EBITDA', '5,9×', '5,9×', 1], ['Dívida líquida/EBITDA', '0,1×', '2,7×']]),
      `<p>Pelo P/L, a Cerrado é mais barata. Pelo EV/EBITDA, as duas custam exatamente o mesmo, porque são o mesmo negócio. A diferença é quem financia: na Cerrado, quase metade do valor pertence a credores. O P/L menor é a compensação pelo risco maior. Para comparar empresas com dívidas diferentes, use ${li('ev-ebitda')} e ${li('ev-ebit')}; para medir o risco, ${li('divida-liquida-ebitda')} e ${li('cobertura-de-juros')}.</p>`]
  ];
  const MAPA = [
    ['Quanto custa?', 'Preço em relação a lucro, patrimônio, vendas e caixa.', ['pl', 'pvp', 'ev-ebitda', 'ev-ebit', 'ps', 'peg', 'fcf-yield']],
    ['O negócio é bom?', 'Retorno sobre o capital e o que sobra de cada venda.', ['roic', 'roe', 'roa', 'margem-bruta', 'margem-ebit', 'margem-liquida']],
    ['Aguenta um ano ruim?', 'Tamanho, custo e prazo das obrigações.', ['divida-liquida-ebitda', 'cobertura-de-juros', 'divida-bruta-pl', 'liquidez-corrente', 'liquidez-seca']],
    ['O lucro vira dinheiro?', 'A distância entre o resultado contábil e o caixa.', ['fluxo-de-caixa-livre', 'fcf-yield', 'crescimento-fcf', 'margem-ebitda']],
    ['Está crescendo de verdade?', 'Ritmo, origem e o que chega a cada ação.', ['cagr-receita', 'cagr-lucro', 'crescimento-ebitda', 'crescimento-lpa']],
    ['O que chega ao acionista?', 'Lucro por ação e a política de distribuição.', ['lpa', 'payout', 'dividend-yield']],
    ['Como se comporta o papel?', 'Tamanho, oscilação, liquidez e dispersão do capital.', ['valor-de-mercado', 'enterprise-value', 'beta', 'volume-medio', 'free-float']]
  ];
  return { arquivo: 'indicadores-em-conjunto.html', id: 'aprender', titulo: `Indicadores em conjunto — Aprender — ${o.MARCA}`,
    descricao: 'Por que analisar um único indicador leva a conclusões erradas: decomposição interativa do ROE e quatro casos com empresas fictícias, lado a lado.',
    scripts: ['site/indicadores.js'],
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca-cena"><div class="cabeca">
    <p class="olho"><a href="aprender.html">Aprender</a> · <a href="indicadores.html">Indicadores</a> · Em conjunto</p>
    <h1 class="manchete">Um número sozinho<br><em>conta meia história.</em></h1>
    <p class="lead">Cada indicador ilumina um lado da empresa e deixa outro no escuro. Cinco casos, com empresas fictícias, mostram como um indicador isolado leva à conclusão errada e qual outro corrige a leitura.</p>
  </div>${o.cena('conjunto')}</div>

  <section class="caso" id="dupont">
    <div class="caso-cab"><p class="olho">Caso 1 · interativo</p><h2>O mesmo ROE, por três caminhos</h2><p>A decomposição DuPont mostra de onde vem o retorno sobre o patrimônio: margem, giro ou dívida.</p></div>
    <div class="caso-corpo">
      <p>O ${li('roe')} é o produto de três fatores. Mexa em cada um e veja que retornos idênticos podem vir de negócios opostos. O terceiro fator, a alavancagem, aumenta o retorno e o risco ao mesmo tempo.</p>
      <div class="lab" id="dupont-lab">
        <div class="lab-topo"><b>Decomposição DuPont</b><ul class="chips" aria-label="Carregar um tipo de negócio">${PRESETS.map((p, i) => `<li><button type="button" class="chip" data-dupont="${p[1]}|${p[2]}|${p[3]}" aria-pressed="${i === 0}">${p[0]}</button></li>`).join('')}</ul></div>
        <div class="lab-grade">
          <form class="lab-entradas" novalidate>
            <div class="deslizante"><label for="dp-margem">Margem líquida <output id="dp-margem-o" for="dp-margem">${CALC.n(p0[1], 1)}%</output></label><input id="dp-margem" type="range" min="0.5" max="30" step="0.5" value="${p0[1]}"><span class="nota">Lucro ÷ receita: quanto sobra de cada venda.</span></div>
            <div class="deslizante"><label for="dp-giro">Giro do ativo <output id="dp-giro-o" for="dp-giro">${CALC.n(p0[2], 2)}×</output></label><input id="dp-giro" type="range" min="0.05" max="3" step="0.05" value="${p0[2]}"><span class="nota">Receita ÷ ativo: quanto se vende com os ativos.</span></div>
            <div class="deslizante"><label for="dp-alav">Alavancagem <output id="dp-alav-o" for="dp-alav">${CALC.n(p0[3], 1)}×</output></label><input id="dp-alav" type="range" min="1" max="12" step="0.1" value="${p0[3]}"><span class="nota">Ativo ÷ patrimônio: 1 significa nenhuma dívida ou obrigação com terceiros.</span></div>
          </form>
          <div class="lab-saida" aria-live="polite">
            <p class="lab-rotulo">ROE</p>
            <p class="lab-valor" id="dp-roe">${CALC.n(p0[1] * p0[2] * p0[3], 1)}%</p>
            <p class="dupont-conta" id="dp-conta">${CALC.n(p0[1], 1)}% × ${CALC.n(p0[2], 2)} × ${CALC.n(p0[3], 1)}</p>
            <p class="lab-rotulo" style="margin-top:1rem">ROA (sem a alavancagem)</p>
            <p class="dupont-conta" id="dp-roa">${CALC.n(p0[1] * p0[2], 1)}%</p>
            <p class="lab-leitura" id="dp-leitura"></p>
          </div>
        </div>
        <p class="lab-nota">Valores ilustrativos de cada tipo de negócio, e não médias de mercado. Em bancos, a alavancagem alta é regulada e faz parte do modelo; não é comparável à de uma indústria.</p>
      </div>
    </div>
  </section>
  ${casos.map(([tit, sub, tab, txt], i) => `
  <section class="caso" id="caso-${i + 2}">
    <div class="caso-cab"><p class="olho">Caso ${i + 2}</p><h2>${tit}</h2><p>${sub}</p></div>
    <div class="caso-corpo">${tab}<div style="margin-top:1.2rem">${txt}</div></div>
  </section>`).join('')}
</div></section>

<section class="secao secao-areia"><div class="dentro">
  <div class="cabeca"><p class="olho">Mapa de relações</p><h2 class="titulo-2">Comece pela pergunta, <em>e não pelo indicador.</em></h2><p class="lead">Uma análise equilibrada usa pelo menos um indicador de cada pergunta. Se todos os que você olhou estão na mesma caixa, há um lado da empresa que você ainda não viu.</p></div>
  <ul class="mapa">${MAPA.map(([q, t, ids]) => `<li><h3>${q}</h3><p>${t}</p><ul class="termos">${ids.map((s) => `<li><a class="chip" href="indicador-${s}.html">${porSlug[s].curto}</a></li>`).join('')}</ul></li>`).join('')}</ul>
  <div class="destaque destaque-ressalva" style="max-width:46rem;margin-top:2rem"><b>Limite de qualquer conjunto de indicadores</b><p>Mesmo lidos em conjunto, indicadores descrevem o passado e dependem da qualidade das demonstrações. Eles apontam onde olhar. A explicação está nos documentos da empresa: notas explicativas, Formulário de Referência e relatório da administração.</p></div>
  <p style="margin-top:1.6rem"><a class="btn btn-primario" href="indicadores.html">Todos os indicadores</a></p>
  <div class="estreito" style="margin-top:2rem">${o.AVISO}</div>
</div></section>` };
}

/* --------------------------------------------------------------- glossário -- */
function paginaGlossario(o) {
  const chave = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const itens = Object.keys(GLOSS).map((id) => ({ id, termo: GLOSS[id][0], def: GLOSS[id][1], onde: INDICADORES.filter((d) => d.termos.includes(id)) })).sort((a, b) => chave(a.termo).localeCompare(chave(b.termo), 'pt'));
  const letras = [...new Set(itens.map((t) => chave(t.termo)[0].toUpperCase()))];
  return { arquivo: 'glossario.html', id: 'aprender', titulo: `Glossário — Aprender — ${o.MARCA}`,
    descricao: `Glossário da ${o.MARCA}: ${itens.length} termos financeiros usados nas explicações dos indicadores, em linguagem direta.`,
    scripts: ['site/indicadores.js'],
    corpo: `<section class="secao"><div class="dentro">
  <div class="cabeca-cena"><div class="cabeca">
    <p class="olho"><a href="aprender.html">Aprender</a> · <a href="indicadores.html">Indicadores</a> · Glossário</p>
    <h1 class="manchete">Glossário<br><em>sem enrolação.</em></h1>
    <p class="lead">${itens.length} termos que aparecem nas explicações dos indicadores. Cada definição cabe em poucas linhas e aponta os indicadores em que o termo é usado.</p>
  </div>${o.cena('glossario')}</div>
  <div class="filtro" id="filtro-gloss">
    <div><label for="busca-gloss">Procurar um termo</label><div class="entrada"><input id="busca-gloss" type="search" autocomplete="off" placeholder="EBITDA, capex, diluição…"></div></div>
    <div><ul class="chips" aria-label="Ir para a letra">${letras.map((l) => `<li><a class="chip" href="#letra-${l}">${l}</a></li>`).join('')}</ul></div>
  </div>
  <p class="filtro-vazio" id="gloss-vazio" hidden>Nenhum termo encontrado.</p>
  <div class="estreito" style="max-width:54rem">
  ${letras.map((l) => `<section data-letra="${l}"><h2 class="gloss-letra" id="letra-${l}">${l}</h2><dl class="glossario">${itens.filter((t) => chave(t.termo)[0].toUpperCase() === l).map((t) => `<div id="${t.id}" data-busca="${esc(chave(t.termo + ' ' + t.def))}"><dt>${t.termo}</dt><dd>${t.def}${t.onde.length ? ` <span class="nota">Aparece em: ${t.onde.slice(0, 6).map((d) => `<a href="${d.arquivo}">${d.curto}</a>`).join(', ')}.</span>` : ''}</dd></div>`).join('')}</dl></section>`).join('')}
  </div>
  <p style="margin-top:2rem"><a class="btn btn-primario" href="indicadores.html">Voltar aos indicadores</a></p>
</div></section>` };
}

module.exports = function (o) {
  const PORTAL = `<section class="portal" aria-labelledby="portal-titulo">
    <div>
      <p class="olho">Novo na área de aprendizagem</p>
      <h2 id="portal-titulo">Indicadores de empresas, <em>um por um.</em></h2>
      <ul class="portal-nums"><li><b>${INDICADORES.length}</b>indicadores</li><li><b>${CATS.length}</b>categorias</li><li><b>${Object.keys(GLOSS).length}</b>termos no glossário</li></ul>
      <p>P/L, ROE, EV/EBITDA, dívida líquida, margens, CAGR, beta. Cada um com fórmula, exemplo que você pode alterar, comparação entre duas empresas, limitações e os indicadores que devem ser lidos junto.</p>
      <div class="portal-acoes"><a class="btn btn-primario" href="indicadores.html">Abrir os indicadores</a><a class="btn btn-secundario" href="indicadores-em-conjunto.html">Indicadores em conjunto</a><a class="btn btn-secundario" href="glossario.html">Glossário</a></div>
    </div>
    ${o.cena('indicadores')}
  </section>`;
  const paginas = [paginaIndice(o), paginaConjunto(o), paginaGlossario(o)].concat(INDICADORES.map((d, i) => paginaIndicador(d, i, o)));
  return { INDICADORES, PAGINAS_INDICADORES: paginas, PORTAL, CATS };
};
