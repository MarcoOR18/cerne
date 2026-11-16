/* Cerne — gera a página "Análise na prática" da seção Aprender.
 * Chamado por site/gerar-paginas.js. Produz analise-na-pratica.html e o bloco
 * de chamada que aparece em aprender.html.
 *
 * A página pega uma ação (ALFA3, da Companhia Alfa, fictícia) e a estuda por
 * UMA estratégia só, a de dividendos, em duas partes: a empresa e a ação.
 * Nenhum resultado de conta é escrito à mão: tudo sai de site/indicadores-calc.js,
 * com os mesmos números da Companhia Alfa usados nas páginas dos indicadores.
 * O gerador falha se um indicador ou termo citado não existir, ou se os números
 * da Alfa deixarem de bater entre si. */
'use strict';

module.exports = function (o) {
  const { CALC, GLOSS, porSlug, laboratorio, termosHtml } = o.IND;
  const n = CALC.n;
  const rs = (v) => 'R$ ' + n(v, 2);
  const mi = (v) => 'R$ ' + n(v, 0) + ' milhões';
  const V = (slug) => { if (!CALC.DEFS[slug]) throw new Error('análise: falta a conta de ' + slug); return CALC.valoresPadrao(slug); };
  /* resultado do indicador com os números da Alfa: texto, valor, leitura automática e passos */
  const R = (slug) => {
    const def = CALC.DEFS[slug], res = def.calc(V(slug));
    if (res.valor === null || !isFinite(res.valor)) throw new Error('análise: conta inválida em ' + slug);
    return { txt: CALC.mostrar(def.un, res.valor), valor: res.valor, passos: res.passos, leitura: CALC.leitura(slug, res) };
  };
  const L = (slug, rotulo) => { if (!porSlug[slug]) throw new Error('análise: indicador inexistente: ' + slug); return `<a href="indicador-${slug}.html">${rotulo || porSlug[slug].curto}</a>`; };

  /* ---------------------------------------------------- números da Alfa -- */
  const dy = V('dividend-yield'), pay = V('payout'), pl = V('pl'), acoes = V('lpa').acoes;
  const fcl = V('fluxo-de-caixa-livre'), vol = V('volume-medio'), ff = V('free-float'), cg = V('cagr-lucro');
  const perto = (a, b) => Math.abs(a - b) < 1e-9;
  if (!perto(pay.prov / acoes, dy.div)) throw new Error('análise: provento por ação não bate com o payout');
  if (!perto(pl.preco, dy.preco) || !perto(pl.lpa, pay.lucro / acoes) || !perto(fcl.lucro, pay.lucro)) throw new Error('análise: números da Alfa não batem entre as contas');

  const rDY = R('dividend-yield'), rPay = R('payout'), rFCF = R('fluxo-de-caixa-livre'), rDiv = R('divida-liquida-ebitda'), rCob = R('cobertura-de-juros');
  const rCagr = R('cagr-lucro'), rPL = R('pl'), rVol = R('volume-medio'), rFF = R('free-float'), rBeta = R('beta'), rVM = R('valor-de-mercado'), rROIC = R('roic');
  const fcf = rFCF.valor, cobertura = fcf / pay.prov, retido = 100 - rPay.valor, presas = ff.presas / ff.total * 100;
  if (!(cobertura > 0)) throw new Error('análise: cobertura do provento inválida');
  const YIELDS = [6, dy.div / dy.preco * 100, 9];
  const precoPara = (y) => dy.div / (y / 100);

  /* --------------------------------------------------------- componentes -- */
  const exame = ([num, rotulo, titulo, texto, conta]) => `
      <li><p class="exame-num">${num}<small>${rotulo}</small></p><div><h3>${titulo}</h3>${texto}${conta ? `<p class="nota">Conta: ${conta}</p>` : ''}</div></li>`;
  const exames = (lista) => `<ul class="exames">${lista.map(exame).join('')}
    </ul>`;

  const ESTRATEGIAS = [
    ['Valor', 'Estou pagando menos do que o negócio vale?', 'Preço contra lucro, patrimônio e caixa, e a folga entre o valor estimado e a cotação.', 'A empresa barata que merece ser barata.'],
    ['Dividendos', 'Quanto recebo em dinheiro, e esse pagamento dura?', 'Proventos, a fatia do lucro que eles consomem, o caixa que os paga e a dívida que os ameaça.', 'O valor do negócio e o crescimento. Um yield alto pode anteceder um corte.', true],
    ['Crescimento', 'O lucro será muito maior daqui a alguns anos?', 'Ritmo de receita, de lucro e de lucro por ação, e de onde vem a expansão.', 'O preço pago pela promessa. Crescer sem retorno não cria valor.'],
    ['Qualidade', 'O negócio rende bem sobre o capital, ano após ano?', 'Retorno sobre o capital, margens e a vantagem que protege as duas coisas.', 'O preço. Um negócio ótimo também pode custar caro demais.']
  ];

  const empresa = [
    [rPay.txt, 'Payout', 'Que fatia do lucro vira provento?',
      `<p>A Alfa distribuiu ${mi(pay.prov)} de um lucro de ${mi(pay.lucro)}. Os outros ${n(retido, 0)}% ficaram na empresa. Há folga: o lucro pode cair e o provento ainda cabe nele. Um ${L('payout', 'payout')} acima de 100% indicaria pagamento maior que o lucro, o que não se sustenta por muito tempo.</p>`, rPay.passos[2]],
    [n(cobertura, 2) + '×', 'Caixa livre ÷ proventos', 'Há dinheiro de verdade para pagar?',
      `<p>Lucro é registro contábil. Provento se paga com dinheiro. O ${L('fluxo-de-caixa-livre', 'fluxo de caixa livre')} de ${mi(fcf)} cobre os ${mi(pay.prov)} distribuídos, e sobram ${mi(fcf - pay.prov)}. Abaixo de 1, a diferença sairia do caixa guardado ou de dívida nova.</p>`, rFCF.passos[2] + ` Depois, ${n(fcf, 0)} ÷ ${n(pay.prov, 0)} = ${n(cobertura, 2)}×.`],
    [rDiv.txt, 'Dívida líquida/EBITDA', 'A dívida ameaça o pagamento?',
      `<p>Credor recebe antes de acionista. Em um aperto, a empresa corta o provento antes de atrasar os juros. A ${L('divida-liquida-ebitda', 'dívida líquida')} da Alfa equivale a ${n(rDiv.valor, 1)} ano de EBITDA, e o lucro operacional paga os juros ${n(rCob.valor, 1)} vezes (${L('cobertura-de-juros', 'cobertura de juros')}). Nesse nível, a dívida não disputa o caixa com o acionista.</p>`, rDiv.passos[2] + ' ' + rCob.passos[2]],
    [rCagr.txt, `CAGR do lucro, ${n(cg.anos, 0)} anos`, 'O lucro que paga o provento cresce?',
      `<p>O provento só cresce de forma durável se o lucro crescer. O da Alfa saiu de ${mi(cg.ini)} para ${mi(cg.fim)} em ${n(cg.anos, 0)} anos (${L('cagr-lucro')}). O número descreve o passado. Antes de confiar, confira se o ano inicial não foi anormalmente fraco e se houve ganho que não se repete.</p>`, rCagr.passos[2]]
  ];

  const acao = [
    [rDY.txt, 'Dividend yield', 'Quanto os proventos representam do preço?',
      `<p>A ${rs(dy.preco)}, os ${rs(dy.div)} por ação pagos em 12 meses equivalem a ${rDY.txt} (${L('dividend-yield')}). É o que foi pago, e não uma promessa. Compare com o juro real de um título público longo, lembrando a diferença: o cupom do título não é cortado, e o provento pode ser.</p>`, rDY.passos[2]],
    [rPL.txt, 'P/L', 'O lucro por ação sustenta o provento por ação?',
      `<p>Nesta estratégia, o ${L('pl')} entra para uma checagem: cada ação teve ${rs(pl.lpa)} de lucro e pagou ${rs(dy.div)}. O múltiplo baixo pode ser preço descontado. Pode ser também lucro em pico de ciclo, que cairia e levaria o provento junto.</p>`, rPL.passos[2]],
    [rVol.txt, 'Volume médio por dia', 'Dá para entrar e sair?',
      `<p>Quem investe por renda pretende ficar anos, mas precisa conseguir sair. Com esse ${L('volume-medio', 'volume')}, uma ordem de R$ ${n(vol.ordem * 1000, 0)} mil seria ${n(vol.ordem / rVol.valor * 100, 1)}% do que se negocia em um dia típico.</p>`, rVol.passos[2]],
    [rFF.txt, 'Free float', 'Quem decide o provento?',
      `<p>${n(presas, 0)}% das ações estão com controladores, administradores e tesouraria (${L('free-float')}). A política de proventos é decidida por quem tem a maioria. Leia no estatuto o dividendo mínimo obrigatório, que protege o acionista minoritário.</p>`, rFF.passos[3]],
    [rBeta.txt, 'Beta', 'Quanto a cotação balança?',
      `<p>Com ${L('beta')} perto de 1, a ação oscilou como o mercado. Receber ${rDY.txt} em proventos não impede o preço de cair 20% no mesmo ano. O provento é só uma das duas partes do retorno.</p>`, rBeta.passos[2]]
  ];

  const TERMOS = ['proventos', 'jcp', 'data-ex', 'dividendo-minimo', 'taxa-de-retencao', 'fluxo-de-caixa-livre', 'capex', 'divida-liquida', 'ebitda', 'nao-recorrente', 'ciclo', 'controlador', 'free-float', 'liquidez', 'volatilidade', 'valor-intrinseco'];
  TERMOS.forEach((t) => { if (!GLOSS[t]) throw new Error('análise: termo fora do glossário: ' + t); });

  const SEC = [['estrategias', 'Quatro estratégias'], ['sorteio', 'A ação sorteada'], ['empresa', 'Parte 1: a empresa'], ['acao', 'Parte 2: a ação'], ['preco', 'Preço e yield'], ['pontos-cegos', 'O que ficou de fora'], ['sintese', 'O que dá para dizer'], ['continuar', 'Para continuar']];

  const pagina = { arquivo: 'analise-na-pratica.html', id: 'aprender', titulo: `Análise na prática — Aprender — ${o.MARCA}`,
    descricao: `Uma ação fictícia estudada por uma estratégia só, a de dividendos: primeiro a empresa, depois a ação, com as contas feitas e o que essa lente deixa de fora.`,
    scripts: ['site/indicadores-calc.js', 'site/indicadores.js'],
    corpo: `<article class="secao"><div class="dentro">
  <div class="cabeca-cena"><div class="cabeca">
    <p class="olho"><a href="aprender.html">Aprender</a> · Análise na prática</p>
    <h1 class="manchete">Uma ação sorteada.<br><em>Uma estratégia só.</em></h1>
    <p class="lead">Você vai ver uma análise inteira, do começo ao fim, seguindo uma única estratégia. Primeiro a empresa, depois a ação. No final, o que essa lente mostrou e o que ela deixou no escuro.</p>
  </div>${o.cena('analise', 'O dado sorteia a ação. O arco é a única lente por onde vamos olhar o cerne.')}</div>
  <div class="aula-grade">
  <nav class="aula-indice" aria-label="Nesta página">
    <p>Nesta página</p>
    <ol>${SEC.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ol>
  </nav>
  <div class="ind-corpo">
    <section class="num" id="estrategias"><h2>Quatro estratégias, quatro perguntas</h2>
      <p>Uma estratégia é a pergunta que você faz primeiro. Ela decide quais números você abre e quais ignora. As quatro abaixo são rótulos de uso comum, e não categorias oficiais. Na prática elas se misturam, e nenhuma é melhor que a outra.</p>
      <ul class="mapa estrategias">${ESTRATEGIAS.map(([nome, pergunta, olha, cego, seguida]) => `
        <li${seguida ? ' class="seguida"' : ''}>${seguida ? '<span class="tag tag-lida">Seguida nesta página</span>' : ''}<h3>${nome}</h3><p><b>Pergunta:</b> ${pergunta}</p><p><b>Olha primeiro:</b> ${olha}</p><p><b>Ponto cego:</b> ${cego}</p></li>`).join('')}
      </ul>
      <div class="destaque"><b>Por que só uma</b><p>Seguir uma estratégia sozinha, de propósito, mostra com clareza o que ela enxerga e o que não enxerga. Aqui a escolhida é a de <b>dividendos</b>, porque a pergunta dela é concreta: o dinheiro chega, e continua chegando?</p></div>
    </section>

    <section class="num" id="sorteio"><h2>A ação sorteada</h2>
      <div class="sorteio">
        <p class="olho">Saiu no dado</p>
        <p class="sorteio-nome">ALFA3 <em>Companhia Alfa</em></p>
        <p>Empresa e código <b>fictícios</b>. A Alfa fabrica produtos de limpeza e higiene, vendidos em supermercados de todo o país. É a mesma empresa dos exemplos de todos os indicadores desta área, com os mesmos números.</p>
        <div class="metodo-resumo">
          <p><b>${rs(dy.preco)}</b><span>preço da ação</span></p>
          <p><b>${n(acoes, 0)} milhões</b><span>de ações emitidas</span></p>
          <p><b>R$ ${n(rVM.valor / 1000, 0)} bilhões</b><span>de ${L('valor-de-mercado', 'valor de mercado')}</span></p>
        </div>
      </div>
      <div class="destaque destaque-ressalva"><b>Por que uma empresa fictícia</b><p>Com números inventados e coerentes, você confere cada conta na página do indicador e ninguém sai daqui com uma dica de compra. O caminho é o mesmo para uma empresa real: troque os números pelos das demonstrações dela.</p></div>
    </section>

    <section class="num" id="empresa"><h2>Parte 1: a empresa. O provento cabe, e dura?</h2>
      <p>A estratégia de dividendos começa pelo negócio, e não pela cotação. Quem paga o provento é a empresa. Então a primeira parte ignora o preço da ação.</p>
      <h3>Antes dos números, o negócio</h3>
      <p>Três perguntas, respondidas com os documentos da empresa. A demanda cai muito em uma crise? Sabão e papel higiênico são comprados em qualquer cenário, o que ajuda a manter o lucro estável. O negócio exige investimento pesado só para continuar funcionando? Quanto mais ${L('fluxo-de-caixa-livre', 'capex')} obrigatório, menos sobra para distribuir. A empresa tem onde reinvestir com retorno alto? Se tiver, distribuir muito pode ser a escolha errada.</p>
      <h3>Quatro exames</h3>
      ${exames(empresa)}
      <p><b>Leitura da parte 1.</b> Com os números de hoje, o provento da Alfa cabe no lucro, cabe no caixa e não disputa espaço com a dívida. Falta o que o retrato de 12 meses não mostra: o histórico. Em uma empresa real, o passo seguinte seria abrir dez anos de proventos no site de Relações com Investidores e ver se o pagamento é estável ou feito de picos.</p>
    </section>

    <section class="num" id="acao"><h2>Parte 2: a ação. Quanto recebo pelo preço de hoje?</h2>
      <p>Empresa e ação são coisas diferentes. A empresa pode ser a mesma e a ação mudar de preço todos os dias. Só agora a cotação entra, junto com as características do papel.</p>
      ${exames(acao)}
      <p><b>Leitura da parte 2.</b> Ao preço de hoje, o papel entrega um yield intermediário, tem negociação suficiente para uma pessoa física e tem controlador definido. Nada disso diz se o preço é justo. A estratégia de dividendos não calcula valor: ela mede renda.</p>
    </section>

    <section class="num" id="preco"><h2>Preço e yield andam em sentidos opostos</h2>
      <p>O provento por ação é o mesmo para todo mundo. O yield depende do preço que cada um paga. Algumas pessoas definem o yield mínimo que aceitam e calculam o preço que o entrega. É uma convenção pessoal, e não uma medida de valor: supõe que o provento de ${rs(dy.div)} vai se repetir.</p>
      <div class="tabela-rolagem"><table class="tabela-duelo"><thead><tr><th scope="col">Yield exigido</th><th scope="col">Conta</th><th scope="col">Preço que o entrega</th></tr></thead><tbody>${YIELDS.map((y) => `<tr${perto(y, rDY.valor) ? ' class="forte"' : ''}><th scope="row">${n(y, 1)}%${perto(y, rDY.valor) ? ' (preço de hoje)' : ''}</th><td>${n(dy.div, 2)} ÷ ${n(y / 100, 3)}</td><td>${rs(precoPara(y))}</td></tr>`).join('')}</tbody></table></div>
      <p style="margin-top:1.2rem">Mude o preço ou o provento no exemplo abaixo. Os outros dois botões carregam as empresas da página do ${L('dividend-yield')}: uma paga quase o mesmo valor há oito anos, a outra teve um provento excepcional no pico do ciclo.</p>
      ${laboratorio(porSlug['dividend-yield'])}
    </section>

    <section class="num" id="pontos-cegos"><h2>O que esta estratégia deixou de fora</h2>
      <div class="destaque destaque-erro"><b>Erro comum</b><p>${porSlug['dividend-yield'].erro}</p></div>
      <ul class="ressalvas">
        <li><b>O valor do negócio.</b> Em nenhum momento estimamos quanto a Alfa vale. Yield não é valuation. Uma ação pode pagar bem e estar cara. A estratégia de valor começaria por aí, como na etapa 6 do <a href="metodo.html#etapa-6">método</a>.</li>
        <li><b>O destino do lucro retido.</b> ${n(retido, 0)}% do lucro ficou na empresa. Rende bem? O ${L('roic')} da Alfa é de ${rROIC.txt}. A estratégia de qualidade perguntaria se isso supera o custo de capital.</li>
        <li><b>O crescimento à frente.</b> Usamos o crescimento passado do lucro. A estratégia de crescimento olharia mercado, concorrência e investimento, e aceitaria um yield menor em troca.</li>
        <li><b>Proventos extraordinários e ciclo.</b> O yield de 12 meses não separa o pagamento recorrente do excepcional. Essa leitura está no histórico e nas notas explicativas.</li>
        <li><b>Tributação.</b> Dividendos e juros sobre capital próprio têm tratamentos fiscais diferentes, que mudam com a lei. Confira a regra vigente antes de comparar rendimentos líquidos.</li>
        <li><b>Concentração.</b> Uma ação não é uma carteira. Um corte de provento em uma empresa só pesa muito para quem depende dela. Veja o módulo sobre <a href="aula-diversificacao.html">diversificação</a>.</li>
      </ul>
      <div class="destaque"><b>Conceito importante</b><p>${porSlug['dividend-yield'].conceito}</p></div>
    </section>

    <section class="num" id="sintese"><h2>O que dá para dizer, e o que não dá</h2>
      <div class="tabela-rolagem"><table class="pares">
        <thead><tr><th scope="col">Pergunta da estratégia</th><th scope="col">O que os números mostram</th><th scope="col">O que falta conferir</th></tr></thead>
        <tbody>
          <tr><th scope="row">O provento cabe no lucro?</th><td>Payout de ${rPay.txt}</td><td>Se o lucro é recorrente</td></tr>
          <tr><th scope="row">Cabe no caixa?</th><td>Caixa livre cobre ${n(cobertura, 2)} vez o provento</td><td>Se o capex do ano foi normal</td></tr>
          <tr><th scope="row">A dívida ameaça?</th><td>Dívida líquida de ${rDiv.txt} o EBITDA; juros cobertos ${n(rCob.valor, 1)} vezes</td><td>Prazos de vencimento e covenants</td></tr>
          <tr><th scope="row">Quanto rende ao preço de hoje?</th><td>Yield de ${rDY.txt} a ${rs(dy.preco)}</td><td>Dez anos de histórico de proventos</td></tr>
          <tr><th scope="row">Consigo entrar e sair?</th><td>${rVol.txt} negociados por dia</td><td>O tamanho da sua ordem</td></tr>
        </tbody>
      </table></div>
      <p style="margin-top:1.2rem"><b>Dá para dizer:</b> pelos números de hoje, o provento da Alfa parece sustentável. <b>Não dá para dizer:</b> se a ação está cara ou barata, se o provento vai crescer, nem se alguém deve comprar. Para isso, a análise precisaria das outras lentes.</p>
    </section>

    <section class="num" id="continuar"><h2>Para continuar</h2>
      <p>Uma estratégia sozinha é um bom exercício e uma análise incompleta. Os próximos passos juntam as lentes:</p>
      <ul class="junto">
        <li><a href="metodo.html"><b>Como estudar uma empresa</b><span>Oito etapas que passam por negócio, setor, gestão, contas, valor e preço.</span></a></li>
        <li><a href="indicadores-em-conjunto.html#caso-3"><b>Dividend yield alto pode ser despedida</b><span>Duas empresas fictícias em que o yield maior é o provento mais frágil.</span></a></li>
        <li><a href="indicadores.html"><b>Os ${o.IND.INDICADORES.length} indicadores, um por um</b><span>Fórmula, exemplo que você altera e limitações de cada número usado aqui.</span></a></li>
        <li><a href="roteiro.html"><b>Checagem do estudo</b><span>Vinte pontos para ver onde a sua análise está firme e onde falta olhar.</span></a></li>
      </ul>
      <h3>Termos usados nesta página</h3>
      ${termosHtml(TERMOS)}
    </section>
    <div style="margin-top:2rem">${o.AVISO}</div>
  </div>
  </div>
</div></article>` };

  const CHAMADA = `<section class="portal portal-analise" aria-labelledby="analise-titulo">
    <div>
      <p class="olho">Análise na prática</p>
      <h2 id="analise-titulo">Uma ação sorteada, <em>uma estratégia só.</em></h2>
      <p>Uma análise inteira da ALFA3, ação fictícia, seguindo apenas a estratégia de dividendos. Primeiro a empresa: o provento cabe no lucro, no caixa e na dívida? Depois a ação: quanto se recebe pelo preço de hoje. No fim, o que essa lente deixou de fora.</p>
      <div class="portal-acoes"><a class="btn btn-primario" href="analise-na-pratica.html">Ver a análise</a></div>
    </div>
    ${o.cena('analise')}
  </section>`;

  return { pagina, CHAMADA };
};
