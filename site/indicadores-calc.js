/* Cerne — contas dos indicadores.
 * O MESMO arquivo é lido pelo gerador (node) e pelo navegador, para que o
 * exemplo escrito na página e o exemplo interativo nunca discordem.
 *
 * Cada indicador tem:
 *   un        como mostrar o resultado: 'x' (vezes), '%', 'R$' (por ação), 'mi' (R$ milhões), 'n' (número puro)
 *   entradas  [id, rótulo, unidade, valor do exemplo]; unidade: 'R$', 'R$ mi', '%', 'mi' (milhões de ações), 'anos', 'dias', ''
 *   calc(v)   devolve { valor, passos }, com a conta escrita passo a passo
 *   escala    [mínimo, máximo] do medidor visual
 *   faixas    [limite superior, leitura]; a primeira faixa cujo limite for maior que o valor é usada.
 *             As leituras são pistas de estudo, nunca veredito: o texto de cada página explica por quê.
 *   invalido  texto mostrado quando a conta não faz sentido (denominador zero ou negativo)
 * Números da "Companhia Alfa" (fictícia) são coerentes entre as páginas:
 * preço R$ 24, 500 mi de ações, receita 20.000, EBITDA 3.000, EBIT 2.200,
 * lucro 1.500, patrimônio 8.000, dívida bruta 5.000, caixa 2.000 (R$ milhões). */
(function (raiz) {
  'use strict';
  var n = function (v, c) { return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c }); };
  var mi = function (v) { return 'R$ ' + n(v, Math.abs(v) < 100 && v % 1 !== 0 ? 1 : 0) + ' mi'; };
  var rs = function (v) { return 'R$ ' + n(v, 2); };
  var pc = function (v, c) { return n(v, c === undefined ? 1 : c) + '%'; };
  var vz = function (v, c) { return n(v, c === undefined ? 1 : c) + '×'; };
  function mostrar(un, v) {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    if (un === 'x') return vz(v, Math.abs(v) < 10 ? 2 : 1);
    if (un === '%') return pc(v, 1);
    if (un === 'R$') return rs(v);
    if (un === 'mi') return mi(v);
    return n(v, 2);
  }
  var razao = function (num, den, r) { return den > 0 ? r(num / den) : { valor: null, passos: [] }; };

  var DEFS = {
    /* ------------------------------------------------------------ valuation -- */
    'pl': { un: 'x', entradas: [['preco', 'Preço da ação', 'R$', 24], ['lpa', 'Lucro por ação (12 meses)', 'R$', 3]],
      calc: function (v) { return v.lpa > 0 ? { valor: v.preco / v.lpa, passos: ['Preço da ação: ' + rs(v.preco) + '.', 'Lucro por ação dos últimos 12 meses: ' + rs(v.lpa) + '.', 'P/L = ' + n(v.preco, 2) + ' ÷ ' + n(v.lpa, 2) + ' = ' + vz(v.preco / v.lpa) + '.', 'Leitura: paga-se ' + rs(v.preco / v.lpa) + ' por cada R$ 1,00 de lucro anual. O inverso, ' + pc(v.lpa / v.preco * 100) + ' ao ano, é o "earnings yield".'] } : { valor: null, passos: [] }; },
      escala: [0, 40], faixas: [[8, 'Múltiplo baixo. Pode ser preço descontado, mas também lucro inflado por ganho que não se repete, pico de ciclo ou risco que o mercado enxerga. Confira a qualidade do lucro.'], [18, 'Faixa intermediária, comum em empresas maduras. O número só ganha sentido ao lado do crescimento esperado e do P/L de empresas do mesmo setor.'], [Infinity, 'Múltiplo alto. O preço embute crescimento forte do lucro, ou o lucro atual está deprimido. Verifique se o crescimento esperado é plausível.']],
      invalido: 'Com lucro zero ou negativo o P/L não tem significado. Use P/S, EV/EBITDA ou P/VP e investigue a causa do prejuízo.' },

    'pvp': { un: 'x', entradas: [['preco', 'Preço da ação', 'R$', 24], ['vpa', 'Valor patrimonial por ação', 'R$', 16]],
      calc: function (v) { return v.vpa > 0 ? { valor: v.preco / v.vpa, passos: ['Preço da ação: ' + rs(v.preco) + '.', 'Valor patrimonial por ação (patrimônio líquido ÷ número de ações): ' + rs(v.vpa) + '.', 'P/VP = ' + n(v.preco, 2) + ' ÷ ' + n(v.vpa, 2) + ' = ' + vz(v.preco / v.vpa) + '.', 'Leitura: o mercado paga ' + rs(v.preco / v.vpa) + ' por cada R$ 1,00 de patrimônio contábil.'] } : { valor: null, passos: [] }; },
      escala: [0, 6], faixas: [[1, 'Abaixo de 1: o mercado avalia a empresa por menos do que o patrimônio contábil. Pode ser desconto, ou ativos que valem menos do que o balanço diz e retorno abaixo do custo de capital.'], [3, 'Entre 1 e 3: faixa frequente em bancos rentáveis e empresas de ativos pesados. Compare sempre com o ROE: P/VP alto só se sustenta com retorno alto.'], [Infinity, 'Acima de 3: típico de negócios leves em ativos (software, marcas, serviços), em que o patrimônio contábil diz pouco. Nesses casos o P/VP perde utilidade.']],
      invalido: 'Com patrimônio líquido zero ou negativo o P/VP não tem significado. Patrimônio negativo é, por si, um alerta que pede leitura do balanço.' },

    'ev-ebitda': { un: 'x', entradas: [['vm', 'Valor de mercado', 'R$ mi', 12000], ['divida', 'Dívida bruta', 'R$ mi', 5000], ['caixa', 'Caixa e aplicações', 'R$ mi', 2000], ['ebitda', 'EBITDA (12 meses)', 'R$ mi', 3000]],
      calc: function (v) { var ev = v.vm + v.divida - v.caixa; return v.ebitda > 0 ? { valor: ev / v.ebitda, passos: ['Dívida líquida = ' + n(v.divida, 0) + ' − ' + n(v.caixa, 0) + ' = ' + mi(v.divida - v.caixa) + '.', 'EV = valor de mercado + dívida líquida = ' + n(v.vm, 0) + ' + ' + n(v.divida - v.caixa, 0) + ' = ' + mi(ev) + '.', 'EV/EBITDA = ' + n(ev, 0) + ' ÷ ' + n(v.ebitda, 0) + ' = ' + vz(ev / v.ebitda) + '.', 'Leitura: o valor da empresa inteira (ações mais dívida líquida) equivale a ' + n(ev / v.ebitda, 1) + ' anos do EBITDA atual.'] } : { valor: null, passos: [] }; },
      escala: [0, 20], faixas: [[5, 'Múltiplo baixo. Comum em setores cíclicos no pico do ciclo e em empresas com geração de caixa contestada. Verifique quanto do EBITDA vira caixa depois dos investimentos.'], [10, 'Faixa intermediária para muitas empresas maduras. Compare com pares do mesmo setor e com a necessidade de investimento (capex) do negócio.'], [Infinity, 'Múltiplo alto. Aparece em negócios de crescimento ou de receita muito previsível. Exige confiança de que o EBITDA vai crescer.']],
      invalido: 'Com EBITDA zero ou negativo o múltiplo não tem significado. Para bancos e seguradoras o EV/EBITDA não se aplica.' },

    'ev-ebit': { un: 'x', entradas: [['vm', 'Valor de mercado', 'R$ mi', 12000], ['divida', 'Dívida bruta', 'R$ mi', 5000], ['caixa', 'Caixa e aplicações', 'R$ mi', 2000], ['ebit', 'EBIT (12 meses)', 'R$ mi', 2200]],
      calc: function (v) { var ev = v.vm + v.divida - v.caixa; return v.ebit > 0 ? { valor: ev / v.ebit, passos: ['EV = ' + n(v.vm, 0) + ' + ' + n(v.divida, 0) + ' − ' + n(v.caixa, 0) + ' = ' + mi(ev) + '.', 'EBIT (lucro operacional, já depois da depreciação): ' + mi(v.ebit) + '.', 'EV/EBIT = ' + n(ev, 0) + ' ÷ ' + n(v.ebit, 0) + ' = ' + vz(ev / v.ebit) + '.', 'O inverso, ' + pc(v.ebit / ev * 100) + ', é o retorno operacional antes de impostos sobre o valor da firma.'] } : { valor: null, passos: [] }; },
      escala: [0, 25], faixas: [[7, 'Múltiplo baixo. Pode indicar desconto ou lucro operacional em pico de ciclo. Veja a série de vários anos antes de concluir.'], [13, 'Faixa intermediária. Por incluir a depreciação, o EV/EBIT compara melhor empresas com intensidades de capital diferentes do que o EV/EBITDA.'], [Infinity, 'Múltiplo alto. O preço supõe expansão do lucro operacional. Confira se margem e crescimento sustentam a expectativa.']],
      invalido: 'Com EBIT zero ou negativo o múltiplo não tem significado.' },

    'ps': { un: 'x', entradas: [['vm', 'Valor de mercado', 'R$ mi', 12000], ['receita', 'Receita líquida (12 meses)', 'R$ mi', 20000]],
      calc: function (v) { return razao(v.vm, v.receita, function (r) { return { valor: r, passos: ['Valor de mercado: ' + mi(v.vm) + '.', 'Receita líquida dos últimos 12 meses: ' + mi(v.receita) + '.', 'P/S = ' + n(v.vm, 0) + ' ÷ ' + n(v.receita, 0) + ' = ' + vz(r, 2) + '.', 'Leitura: paga-se ' + rs(r) + ' por cada R$ 1,00 de receita anual. Quanto dessa receita vira lucro depende da margem.'] }; }); },
      escala: [0, 10], faixas: [[1, 'Abaixo de 1: comum em varejo e distribuição, que giram muito e ficam com pouco de cada venda. Não é, por si, sinal de barato.'], [4, 'Faixa intermediária. Para comparar, coloque ao lado a margem líquida: P/S alto com margem alta pode ser mais barato que P/S baixo com margem mínima.'], [Infinity, 'P/S alto. Típico de empresas de software e crescimento. O preço supõe que a receita vai crescer e que, um dia, a margem será alta.']],
      invalido: 'Sem receita não há como calcular o P/S.' },

    'peg': { un: 'n', entradas: [['pl', 'P/L da empresa', '', 15], ['g', 'Crescimento anual esperado do lucro', '%', 12]],
      calc: function (v) { return v.g > 0 && v.pl > 0 ? { valor: v.pl / v.g, passos: ['P/L atual: ' + vz(v.pl) + '.', 'Crescimento anual esperado do lucro por ação: ' + pc(v.g) + ' (usa-se o número, sem o sinal de %).', 'PEG = ' + n(v.pl, 1) + ' ÷ ' + n(v.g, 1) + ' = ' + n(v.pl / v.g, 2) + '.', 'Atenção: o resultado é tão confiável quanto a taxa de crescimento usada, que é uma projeção.'] } : { valor: null, passos: [] }; },
      escala: [0, 4], faixas: [[1, 'Abaixo de 1: o P/L é menor que a taxa de crescimento esperada. A regra prática lê isso como "crescimento barato", desde que a projeção se confirme.'], [2, 'Entre 1 e 2: faixa em que o preço parece acompanhar o crescimento esperado. A regra de 1 é uma convenção, e não um resultado teórico.'], [Infinity, 'Acima de 2: paga-se caro pelo crescimento projetado, ou o crescimento esperado é baixo. Em empresas maduras e boas pagadoras, o PEG tende a parecer alto.']],
      invalido: 'O PEG só faz sentido com lucro positivo e crescimento esperado positivo.' },

    'dividend-yield': { un: '%', entradas: [['div', 'Proventos por ação (12 meses)', 'R$', 1.8], ['preco', 'Preço da ação', 'R$', 24]],
      calc: function (v) { return razao(v.div, v.preco, function (r) { return { valor: r * 100, passos: ['Proventos pagos por ação nos últimos 12 meses (dividendos e juros sobre capital próprio): ' + rs(v.div) + '.', 'Preço da ação: ' + rs(v.preco) + '.', 'Dividend yield = ' + n(v.div, 2) + ' ÷ ' + n(v.preco, 2) + ' = ' + pc(r * 100) + '.', 'Leitura: quem comprasse hoje e recebesse o mesmo valor por ação teria ' + pc(r * 100) + ' ao ano em proventos. O pagamento futuro não é garantido.'] }; }); },
      escala: [0, 16], faixas: [[3, 'Yield baixo. Comum em empresas que reinvestem o lucro para crescer. Não é defeito: o retorno pode vir pela valorização.'], [8, 'Faixa intermediária. Verifique o payout e o fluxo de caixa livre para saber se o pagamento cabe no que a empresa gera.'], [Infinity, 'Yield alto. Confira antes de comemorar: pode ser provento extraordinário, pico de ciclo ou preço que caiu porque o mercado espera corte.']],
      invalido: 'Informe um preço maior que zero.' },

    'fcf-yield': { un: '%', entradas: [['fco', 'Caixa gerado pelas operações', 'R$ mi', 2600], ['capex', 'Investimentos (capex)', 'R$ mi', 1400], ['vm', 'Valor de mercado', 'R$ mi', 12000]],
      calc: function (v) { var fcf = v.fco - v.capex; return v.vm > 0 ? { valor: fcf / v.vm * 100, passos: ['Fluxo de caixa livre = caixa das operações − capex = ' + n(v.fco, 0) + ' − ' + n(v.capex, 0) + ' = ' + mi(fcf) + '.', 'Valor de mercado: ' + mi(v.vm) + '.', 'FCF yield = ' + n(fcf, 0) + ' ÷ ' + n(v.vm, 0) + ' = ' + pc(fcf / v.vm * 100) + '.', 'Leitura: a cada R$ 100 de valor de mercado, o negócio gerou ' + rs(fcf / v.vm * 100) + ' de caixa livre para o acionista no ano.'] } : { valor: null, passos: [] }; },
      escala: [-5, 20], faixas: [[0, 'FCF negativo: a empresa consumiu caixa. Em fase de expansão pode ser escolha; se for recorrente, alguém precisa financiar (dívida ou novas ações).'], [4, 'Yield baixo. O preço supõe que o caixa livre vai crescer. Comum em empresas em fase de investimento.'], [9, 'Faixa intermediária. Compare com o juro real de longo prazo: o caixa de uma empresa tem risco e deveria render mais do que um título público.'], [Infinity, 'Yield alto. Pode ser desconto, mas confira se o capex do ano foi anormalmente baixo ou se o capital de giro ajudou de forma pontual.']],
      invalido: 'Informe um valor de mercado maior que zero.' },

    /* -------------------------------------------------------- rentabilidade -- */
    'roe': { un: '%', entradas: [['lucro', 'Lucro líquido (12 meses)', 'R$ mi', 1500], ['pl', 'Patrimônio líquido médio', 'R$ mi', 8000]],
      calc: function (v) { return razao(v.lucro, v.pl, function (r) { return { valor: r * 100, passos: ['Lucro líquido dos últimos 12 meses: ' + mi(v.lucro) + '.', 'Patrimônio líquido médio do período (média entre o início e o fim): ' + mi(v.pl) + '.', 'ROE = ' + n(v.lucro, 0) + ' ÷ ' + n(v.pl, 0) + ' = ' + pc(r * 100) + '.', 'Leitura: cada R$ 100 de capital dos sócios gerou ' + rs(r * 100) + ' de lucro no ano.'] }; }); },
      escala: [-10, 40], faixas: [[0, 'ROE negativo: houve prejuízo, e o patrimônio dos sócios encolheu.'], [10, 'ROE baixo. Em um país de juro alto, tende a ficar abaixo do custo do capital próprio. Veja se é fase ruim do ciclo ou característica do negócio.'], [20, 'Faixa intermediária a boa. Confira de onde vem: margem, giro ou alavancagem (decomposição DuPont).'], [Infinity, 'ROE alto. Ótimo quando vem de margem e giro. Desconfie quando vem de muita dívida, de patrimônio reduzido por prejuízos passados ou de lucro não recorrente.']],
      invalido: 'Com patrimônio líquido zero ou negativo o ROE perde o significado.' },

    'roic': { un: '%', entradas: [['ebit', 'EBIT (12 meses)', 'R$ mi', 2200], ['aliq', 'Alíquota de imposto', '%', 34], ['pl', 'Patrimônio líquido', 'R$ mi', 8000], ['divliq', 'Dívida líquida', 'R$ mi', 3000]],
      calc: function (v) { var nopat = v.ebit * (1 - v.aliq / 100), cap = v.pl + v.divliq; return cap > 0 ? { valor: nopat / cap * 100, passos: ['NOPAT (lucro operacional depois de impostos) = EBIT × (1 − alíquota) = ' + n(v.ebit, 0) + ' × (1 − ' + n(v.aliq / 100, 2) + ') = ' + mi(nopat) + '.', 'Capital investido = patrimônio líquido + dívida líquida = ' + n(v.pl, 0) + ' + ' + n(v.divliq, 0) + ' = ' + mi(cap) + '.', 'ROIC = ' + n(nopat, 0) + ' ÷ ' + n(cap, 0) + ' = ' + pc(nopat / cap * 100) + '.', 'Leitura: cada R$ 100 aplicados no negócio, por sócios e credores, renderam ' + rs(nopat / cap * 100) + ' de lucro operacional líquido de impostos.'] } : { valor: null, passos: [] }; },
      escala: [-5, 35], faixas: [[0, 'ROIC negativo: a operação não cobre nem os impostos sobre si mesma.'], [8, 'ROIC baixo. Provavelmente abaixo do custo de capital (WACC): nesse caso, crescer destrói valor em vez de criar.'], [15, 'Faixa intermediária. A pergunta decisiva é se o ROIC supera o custo de capital da empresa, e por quanto.'], [Infinity, 'ROIC alto. Sugere vantagem competitiva, se durar vários anos. Confira se não é efeito de capital investido subestimado (ativos já depreciados, ágio baixado).']],
      invalido: 'Com capital investido zero ou negativo o ROIC não se aplica. Para bancos use o ROE.' },

    'roa': { un: '%', entradas: [['lucro', 'Lucro líquido (12 meses)', 'R$ mi', 1500], ['ativo', 'Ativo total médio', 'R$ mi', 25000]],
      calc: function (v) { return razao(v.lucro, v.ativo, function (r) { return { valor: r * 100, passos: ['Lucro líquido dos últimos 12 meses: ' + mi(v.lucro) + '.', 'Ativo total médio do período: ' + mi(v.ativo) + '.', 'ROA = ' + n(v.lucro, 0) + ' ÷ ' + n(v.ativo, 0) + ' = ' + pc(r * 100) + '.', 'Leitura: cada R$ 100 em ativos (de qualquer origem) geraram ' + rs(r * 100) + ' de lucro.'] }; }); },
      escala: [-3, 20], faixas: [[0, 'ROA negativo: prejuízo no período.'], [2, 'ROA baixo. É o normal em bancos, cujo ativo é muitas vezes o patrimônio; em uma indústria, indicaria ativos pouco produtivos.'], [8, 'Faixa intermediária para empresas não financeiras de ativos pesados.'], [Infinity, 'ROA alto. Comum em negócios leves em ativos. Compare apenas com empresas do mesmo setor.']],
      invalido: 'Informe um ativo total maior que zero.' },

    'margem-bruta': { un: '%', entradas: [['receita', 'Receita líquida', 'R$ mi', 20000], ['custo', 'Custo dos produtos ou serviços vendidos', 'R$ mi', 13000]],
      calc: function (v) { var lb = v.receita - v.custo; return v.receita > 0 ? { valor: lb / v.receita * 100, passos: ['Lucro bruto = receita líquida − custo do que foi vendido = ' + n(v.receita, 0) + ' − ' + n(v.custo, 0) + ' = ' + mi(lb) + '.', 'Margem bruta = ' + n(lb, 0) + ' ÷ ' + n(v.receita, 0) + ' = ' + pc(lb / v.receita * 100) + '.', 'Leitura: de cada R$ 100 vendidos, sobram ' + rs(lb / v.receita * 100) + ' depois do custo direto, para pagar despesas, juros, impostos e remunerar os sócios.'] } : { valor: null, passos: [] }; },
      escala: [0, 90], faixas: [[25, 'Margem bruta baixa. Típica de varejo alimentar, distribuição e commodities: o negócio depende de volume e de eficiência.'], [50, 'Faixa intermediária, comum na indústria de bens de consumo e em serviços.'], [Infinity, 'Margem bruta alta. Comum em software, marcas fortes e farmacêuticas. Sugere poder de preço, mas as despesas abaixo dela podem ser grandes.']],
      invalido: 'Informe uma receita maior que zero.' },

    'margem-ebitda': { un: '%', entradas: [['ebit', 'EBIT (lucro operacional)', 'R$ mi', 2200], ['da', 'Depreciação e amortização', 'R$ mi', 800], ['receita', 'Receita líquida', 'R$ mi', 20000]],
      calc: function (v) { var e = v.ebit + v.da; return v.receita > 0 ? { valor: e / v.receita * 100, passos: ['EBITDA = EBIT + depreciação e amortização = ' + n(v.ebit, 0) + ' + ' + n(v.da, 0) + ' = ' + mi(e) + '.', 'Margem EBITDA = ' + n(e, 0) + ' ÷ ' + n(v.receita, 0) + ' = ' + pc(e / v.receita * 100) + '.', 'Leitura: de cada R$ 100 vendidos, ' + rs(e / v.receita * 100) + ' ficam como resultado operacional antes de depreciação, juros e impostos.'] } : { valor: null, passos: [] }; },
      escala: [-10, 70], faixas: [[0, 'EBITDA negativo: a operação não paga nem os próprios custos e despesas correntes.'], [10, 'Margem baixa. Normal em varejo e distribuição; em setores de capital intensivo seria sinal de aperto.'], [30, 'Faixa intermediária para indústria e serviços.'], [Infinity, 'Margem alta. Comum em concessões, energia e software. Em negócios de capital intensivo, boa parte dela é consumida depois por depreciação e reinvestimento.']],
      invalido: 'Informe uma receita maior que zero.' },

    'margem-ebit': { un: '%', entradas: [['ebit', 'EBIT (lucro operacional)', 'R$ mi', 2200], ['receita', 'Receita líquida', 'R$ mi', 20000]],
      calc: function (v) { return v.receita > 0 ? { valor: v.ebit / v.receita * 100, passos: ['EBIT (lucro antes de juros e impostos): ' + mi(v.ebit) + '.', 'Receita líquida: ' + mi(v.receita) + '.', 'Margem EBIT = ' + n(v.ebit, 0) + ' ÷ ' + n(v.receita, 0) + ' = ' + pc(v.ebit / v.receita * 100) + '.', 'Leitura: de cada R$ 100 vendidos, ' + rs(v.ebit / v.receita * 100) + ' sobram depois de todos os custos e despesas operacionais, incluída a depreciação.'] } : { valor: null, passos: [] }; },
      escala: [-10, 50], faixas: [[0, 'Margem operacional negativa: o negócio principal dá prejuízo antes mesmo dos juros.'], [8, 'Margem baixa. Pouco espaço para absorver alta de custos ou queda de preços.'], [20, 'Faixa intermediária, comum em indústria e serviços.'], [Infinity, 'Margem alta. Verifique se é sustentada por vantagem competitiva ou por um momento favorável do ciclo.']],
      invalido: 'Informe uma receita maior que zero.' },

    'margem-liquida': { un: '%', entradas: [['lucro', 'Lucro líquido', 'R$ mi', 1500], ['receita', 'Receita líquida', 'R$ mi', 20000]],
      calc: function (v) { return v.receita > 0 ? { valor: v.lucro / v.receita * 100, passos: ['Lucro líquido: ' + mi(v.lucro) + '.', 'Receita líquida: ' + mi(v.receita) + '.', 'Margem líquida = ' + n(v.lucro, 0) + ' ÷ ' + n(v.receita, 0) + ' = ' + pc(v.lucro / v.receita * 100) + '.', 'Leitura: de cada R$ 100 vendidos, ' + rs(v.lucro / v.receita * 100) + ' chegam à última linha, depois de custos, despesas, juros e impostos.'] } : { valor: null, passos: [] }; },
      escala: [-10, 40], faixas: [[0, 'Margem líquida negativa: prejuízo no período.'], [5, 'Margem baixa. Normal em varejo e distribuição, que compensam com giro alto.'], [15, 'Faixa intermediária.'], [Infinity, 'Margem alta. Confira se não há ganho não recorrente (venda de ativo, crédito tributário) inflando o lucro.']],
      invalido: 'Informe uma receita maior que zero.' },

    /* -------------------------------------------------------- endividamento -- */
    'divida-liquida-ebitda': { un: 'x', entradas: [['divida', 'Dívida bruta', 'R$ mi', 5000], ['caixa', 'Caixa e aplicações', 'R$ mi', 2000], ['ebitda', 'EBITDA (12 meses)', 'R$ mi', 3000]],
      calc: function (v) { var dl = v.divida - v.caixa; return v.ebitda > 0 ? { valor: dl / v.ebitda, passos: ['Dívida líquida = dívida bruta − caixa = ' + n(v.divida, 0) + ' − ' + n(v.caixa, 0) + ' = ' + mi(dl) + '.', 'EBITDA dos últimos 12 meses: ' + mi(v.ebitda) + '.', 'Dívida líquida/EBITDA = ' + n(dl, 0) + ' ÷ ' + n(v.ebitda, 0) + ' = ' + vz(dl / v.ebitda) + '.', dl >= 0 ? 'Leitura: mantido o EBITDA atual, e se todo ele fosse usado para pagar dívida, seriam ' + n(dl / v.ebitda, 1) + ' anos. Na prática o EBITDA também paga juros, impostos e investimentos.' : 'Resultado negativo: a empresa tem mais caixa do que dívida (caixa líquido).'] } : { valor: null, passos: [] }; },
      escala: [-1, 6], faixas: [[0, 'Caixa líquido: há mais caixa do que dívida. Posição confortável; resta saber se o caixa parado é bem usado.'], [2, 'Alavancagem baixa a moderada para a maioria dos setores.'], [3.5, 'Alavancagem relevante. Aceitável em negócios de receita previsível (energia, concessões); arriscada em negócios cíclicos. Muitos contratos de dívida têm cláusulas (covenants) nessa faixa.'], [Infinity, 'Alavancagem alta. O resultado fica sensível a juros e a qualquer queda do EBITDA. Leia o cronograma de vencimentos e os covenants.']],
      invalido: 'Com EBITDA zero ou negativo o indicador não tem significado, e a dívida, qualquer que seja, é um problema. Não se aplica a bancos.' },

    'divida-bruta-pl': { un: 'x', entradas: [['divida', 'Dívida bruta', 'R$ mi', 5000], ['pl', 'Patrimônio líquido', 'R$ mi', 8000]],
      calc: function (v) { return razao(v.divida, v.pl, function (r) { return { valor: r, passos: ['Dívida bruta (empréstimos, financiamentos e debêntures, curto e longo prazo): ' + mi(v.divida) + '.', 'Patrimônio líquido: ' + mi(v.pl) + '.', 'Dívida bruta/PL = ' + n(v.divida, 0) + ' ÷ ' + n(v.pl, 0) + ' = ' + vz(r, 2) + '.', 'Leitura: para cada R$ 1,00 de capital dos sócios, há ' + rs(r) + ' de dívida com credores financeiros.'] }; }); },
      escala: [0, 4], faixas: [[0.5, 'Pouca dívida em relação ao capital próprio.'], [1.5, 'Faixa intermediária. A capacidade de pagamento depende da geração de caixa: veja dívida líquida/EBITDA e cobertura de juros.'], [Infinity, 'Mais dívida do que capital próprio em proporção elevada. Comum em concessões e infraestrutura; em outros setores, pede atenção ao prazo e ao custo.']],
      invalido: 'Com patrimônio líquido zero ou negativo o indicador perde o significado. Patrimônio negativo (passivo a descoberto) é um alerta sério.' },

    'cobertura-de-juros': { un: 'x', entradas: [['ebit', 'EBIT (12 meses)', 'R$ mi', 2200], ['juros', 'Despesa com juros (12 meses)', 'R$ mi', 550]],
      calc: function (v) { return razao(v.ebit, v.juros, function (r) { return { valor: r, passos: ['EBIT dos últimos 12 meses: ' + mi(v.ebit) + '.', 'Despesa com juros da dívida no mesmo período: ' + mi(v.juros) + '.', 'Cobertura = ' + n(v.ebit, 0) + ' ÷ ' + n(v.juros, 0) + ' = ' + vz(r) + '.', 'Leitura: o lucro operacional paga os juros ' + n(r, 1) + ' vezes. O EBIT poderia cair ' + pc(Math.max(0, (1 - 1 / r) * 100), 0) + ' antes de faltar para os juros.'] }; }); },
      escala: [0, 12], faixas: [[1, 'Abaixo de 1: o lucro operacional não paga os juros. A empresa depende de rolar dívida, vender ativos ou receber capital novo.'], [3, 'Cobertura apertada. Uma queda moderada do resultado, ou alta de juros, já compromete o pagamento.'], [6, 'Cobertura intermediária a confortável.'], [Infinity, 'Cobertura folgada: os juros pesam pouco no resultado operacional.']],
      invalido: 'Sem despesa com juros não há o que cobrir: a empresa não tem dívida onerosa relevante.' },

    'liquidez-corrente': { un: 'n', entradas: [['ac', 'Ativo circulante', 'R$ mi', 6000], ['pc', 'Passivo circulante', 'R$ mi', 4000]],
      calc: function (v) { return razao(v.ac, v.pc, function (r) { return { valor: r, passos: ['Ativo circulante (caixa, contas a receber, estoques e outros bens que viram dinheiro em até 12 meses): ' + mi(v.ac) + '.', 'Passivo circulante (obrigações que vencem em até 12 meses): ' + mi(v.pc) + '.', 'Liquidez corrente = ' + n(v.ac, 0) + ' ÷ ' + n(v.pc, 0) + ' = ' + n(r, 2) + '.', 'Leitura: para cada R$ 1,00 que vence em um ano, há ' + rs(r) + ' em ativos de curto prazo.'] }; }); },
      escala: [0, 4], faixas: [[1, 'Abaixo de 1: as obrigações de curto prazo superam os ativos de curto prazo. Pode ser normal em negócios que recebem à vista e pagam a prazo (supermercados), e perigoso nos demais.'], [2, 'Faixa intermediária. A qualidade importa: estoque encalhado e contas a receber duvidosas também entram na conta.'], [Infinity, 'Folga ampla no curto prazo. Em excesso, pode indicar capital parado em estoque ou em caixa pouco rentável.']],
      invalido: 'Informe um passivo circulante maior que zero.' },

    'liquidez-seca': { un: 'n', entradas: [['ac', 'Ativo circulante', 'R$ mi', 6000], ['est', 'Estoques', 'R$ mi', 2200], ['pc', 'Passivo circulante', 'R$ mi', 4000]],
      calc: function (v) { return v.pc > 0 ? { valor: (v.ac - v.est) / v.pc, passos: ['Ativo circulante sem os estoques = ' + n(v.ac, 0) + ' − ' + n(v.est, 0) + ' = ' + mi(v.ac - v.est) + '.', 'Passivo circulante: ' + mi(v.pc) + '.', 'Liquidez seca = ' + n(v.ac - v.est, 0) + ' ÷ ' + n(v.pc, 0) + ' = ' + n((v.ac - v.est) / v.pc, 2) + '.', 'Para comparar: a liquidez corrente, com os estoques, seria ' + n(v.ac / v.pc, 2) + '. A diferença mostra o quanto a folga depende de vender o estoque.'] } : { valor: null, passos: [] }; },
      escala: [0, 3], faixas: [[0.7, 'Baixa. Sem vender estoque, os ativos de curto prazo não cobrem as obrigações. Comum no varejo; em outros setores, pede atenção ao caixa.'], [1.2, 'Faixa intermediária: perto de 1, os ativos mais líquidos cobrem as obrigações de curto prazo.'], [Infinity, 'Folga ampla mesmo sem contar o estoque.']],
      invalido: 'Informe um passivo circulante maior que zero.' },

    'fluxo-de-caixa-livre': { un: 'mi', entradas: [['fco', 'Caixa gerado pelas operações', 'R$ mi', 2600], ['capex', 'Investimentos (capex)', 'R$ mi', 1400], ['lucro', 'Lucro líquido, para comparar', 'R$ mi', 1500]],
      calc: function (v) { var fcf = v.fco - v.capex; return { valor: fcf, medidor: v.lucro > 0 ? fcf / v.lucro * 100 : null, passos: ['Caixa gerado pelas operações (da demonstração do fluxo de caixa): ' + mi(v.fco) + '.', 'Investimentos em imobilizado e intangível (capex): ' + mi(v.capex) + '.', 'FCF = ' + n(v.fco, 0) + ' − ' + n(v.capex, 0) + ' = ' + mi(fcf) + '.', v.lucro > 0 ? 'Conversão: o caixa livre equivale a ' + pc(fcf / v.lucro * 100, 0) + ' do lucro líquido de ' + mi(v.lucro) + '.' : 'Sem lucro positivo, não há conversão de lucro em caixa a calcular.'] }; },
      escala: [-50, 150], faixas: [[0, 'Caixa livre negativo: os investimentos superaram o caixa das operações. Em expansão pode ser deliberado; recorrente, exige financiamento externo.'], [60, 'O caixa livre é bem menor que o lucro. Veja se a diferença vem de investimento em crescimento ou de lucro que não vira caixa (clientes que não pagam, estoques crescendo).'], [110, 'Caixa livre próximo do lucro: boa conversão, sinal de lucro de qualidade.'], [Infinity, 'Caixa livre acima do lucro. Pode ser eficiência, ou investimento abaixo do necessário para manter os ativos.']],
      rotuloMedidor: 'FCF como % do lucro', invalido: '' },

    /* ---------------------------------------------------------- crescimento -- */
    'cagr-receita': { un: '%', entradas: [['ini', 'Receita no ano inicial', 'R$ mi', 12000], ['fim', 'Receita no ano final', 'R$ mi', 20000], ['anos', 'Número de anos entre os dois', 'anos', 5]],
      calc: function (v) { return cagr(v, 'Receita'); },
      escala: [-10, 40], faixas: [[0, 'Receita encolhendo. Verifique se é o setor inteiro, perda de participação ou venda de uma divisão.'], [6, 'Crescimento baixo: perto ou abaixo da inflação brasileira do período, a receita não cresceu em termos reais.'], [15, 'Crescimento moderado a bom. Confira quanto veio de volume, de preço e de aquisições.'], [Infinity, 'Crescimento alto. Difícil de manter por muitos anos: quanto maior a empresa, menor tende a ser a taxa.']],
      invalido: 'O CAGR precisa de valor inicial e final positivos e de pelo menos um ano de intervalo.' },

    'cagr-lucro': { un: '%', entradas: [['ini', 'Lucro líquido no ano inicial', 'R$ mi', 800], ['fim', 'Lucro líquido no ano final', 'R$ mi', 1500], ['anos', 'Número de anos entre os dois', 'anos', 5]],
      calc: function (v) { return cagr(v, 'Lucro'); },
      escala: [-10, 40], faixas: [[0, 'Lucro encolhendo no período.'], [6, 'Crescimento baixo, perto da inflação.'], [15, 'Crescimento moderado a bom. Compare com o CAGR da receita: lucro que cresce mais que a receita indica ganho de margem, que tem limite.'], [Infinity, 'Crescimento alto. Verifique se o ano inicial não era anormalmente fraco, o que infla a taxa.']],
      invalido: 'O CAGR não pode ser calculado quando o lucro inicial ou o final é zero ou negativo. Nesse caso, olhe a série ano a ano.' },

    'crescimento-ebitda': { un: '%', entradas: [['ant', 'EBITDA do período anterior', 'R$ mi', 2600], ['atu', 'EBITDA do período atual', 'R$ mi', 3000]],
      calc: function (v) { return variacao(v, 'EBITDA'); },
      escala: [-30, 50], faixas: [[0, 'EBITDA em queda. Separe o que é volume, preço, custo e efeito não recorrente.'], [8, 'Crescimento baixo, próximo da inflação.'], [20, 'Crescimento moderado a bom. Veja se a receita acompanhou ou se foi só corte de custos.'], [Infinity, 'Crescimento alto. Confira se houve aquisição, mudança contábil ou base de comparação fraca.']],
      invalido: 'Com EBITDA anterior zero ou negativo a variação percentual não tem significado. Compare os valores em reais.' },

    'crescimento-fcf': { un: '%', entradas: [['ant', 'FCF do período anterior', 'R$ mi', 900], ['atu', 'FCF do período atual', 'R$ mi', 1200]],
      calc: function (v) { return variacao(v, 'FCF'); },
      escala: [-60, 100], faixas: [[0, 'Caixa livre em queda. Pode ser investimento maior (bom ou ruim, depende do retorno) ou piora operacional.'], [10, 'Crescimento baixo.'], [30, 'Crescimento moderado a bom.'], [Infinity, 'Crescimento alto. O FCF é muito volátil ano a ano: um capex adiado ou um ganho de capital de giro produz saltos que não se repetem.']],
      invalido: 'Com FCF anterior zero ou negativo a variação percentual não tem significado. Olhe a série em reais.' },

    'crescimento-lpa': { un: '%', entradas: [['la', 'Lucro líquido anterior', 'R$ mi', 1300], ['aa', 'Ações no período anterior', 'mi', 500], ['lb', 'Lucro líquido atual', 'R$ mi', 1500], ['ab', 'Ações no período atual', 'mi', 500]],
      calc: function (v) { if (!(v.aa > 0 && v.ab > 0 && v.la > 0)) return { valor: null, passos: [] }; var a = v.la / v.aa, b = v.lb / v.ab, g = (b / a - 1) * 100, gl = (v.lb / v.la - 1) * 100; return { valor: g, passos: ['LPA anterior = ' + n(v.la, 0) + ' ÷ ' + n(v.aa, 0) + ' = ' + rs(a) + '.', 'LPA atual = ' + n(v.lb, 0) + ' ÷ ' + n(v.ab, 0) + ' = ' + rs(b) + '.', 'Crescimento do LPA = (' + n(b, 2) + ' ÷ ' + n(a, 2) + ') − 1 = ' + pc(g) + '.', 'Para comparar: o lucro total variou ' + pc(gl) + '. ' + (Math.abs(g - gl) < 0.05 ? 'Como o número de ações não mudou, as duas taxas coincidem.' : (g > gl ? 'O LPA cresceu mais porque há menos ações (recompra).' : 'O LPA cresceu menos porque há mais ações (diluição).'))] }; },
      escala: [-30, 50], faixas: [[0, 'Lucro por ação em queda. Veja se o lucro caiu ou se houve emissão de ações que diluiu os sócios.'], [8, 'Crescimento baixo, próximo da inflação.'], [20, 'Crescimento moderado a bom.'], [Infinity, 'Crescimento alto. Confira se vem do negócio, de recompras financiadas por dívida ou de base de comparação fraca.']],
      invalido: 'É preciso lucro anterior positivo e número de ações maior que zero nos dois períodos.' },

    /* -------------------------------------------------- mercado e ações -- */
    'lpa': { un: 'R$', entradas: [['lucro', 'Lucro líquido (12 meses)', 'R$ mi', 1500], ['acoes', 'Número de ações', 'mi', 500]],
      calc: function (v) { return razao(v.lucro, v.acoes, function (r) { return { valor: r, passos: ['Lucro líquido atribuído aos acionistas, últimos 12 meses: ' + mi(v.lucro) + '.', 'Número médio de ações no período, sem as que estão em tesouraria: ' + n(v.acoes, 0) + ' milhões.', 'LPA = ' + n(v.lucro, 0) + ' ÷ ' + n(v.acoes, 0) + ' = ' + rs(r) + ' por ação.', 'O valor em reais não diz nada sozinho: depende de em quantas ações a empresa foi dividida.'] }; }); },
      escala: null, faixas: [[0, 'LPA negativo: prejuízo por ação.'], [Infinity, 'Não existe LPA "alto" ou "baixo" em reais. O que se analisa é a evolução ao longo dos anos e a relação com o preço (P/L).']],
      invalido: 'Informe um número de ações maior que zero.' },

    'payout': { un: '%', entradas: [['prov', 'Proventos distribuídos (12 meses)', 'R$ mi', 900], ['lucro', 'Lucro líquido (12 meses)', 'R$ mi', 1500]],
      calc: function (v) { return razao(v.prov, v.lucro, function (r) { return { valor: r * 100, passos: ['Proventos distribuídos no período (dividendos e juros sobre capital próprio): ' + mi(v.prov) + '.', 'Lucro líquido do mesmo período: ' + mi(v.lucro) + '.', 'Payout = ' + n(v.prov, 0) + ' ÷ ' + n(v.lucro, 0) + ' = ' + pc(r * 100) + '.', 'O que não foi distribuído, ' + pc(Math.max(0, 100 - r * 100)) + ' do lucro, ficou na empresa (taxa de retenção).'] }; }); },
      escala: [0, 150], faixas: [[30, 'Payout baixo: a empresa retém a maior parte do lucro. Faz sentido se ela reinveste com retorno alto (veja o ROIC).'], [70, 'Faixa intermediária: parte vai para o acionista, parte fica para reinvestir.'], [100, 'Payout alto: quase todo o lucro é distribuído. Típico de negócios maduros com pouca necessidade de investimento.'], [Infinity, 'Acima de 100%: a empresa distribuiu mais do que lucrou, usando reservas, caixa ou dívida. Não se sustenta por muito tempo.']],
      invalido: 'Com lucro zero ou negativo o payout não tem significado. Proventos pagos em ano de prejuízo saem de reservas.' },

    'beta': { un: 'n', entradas: [['corr', 'Correlação entre a ação e o índice', '', 0.7], ['va', 'Volatilidade anual da ação', '%', 32], ['vm', 'Volatilidade anual do índice', '%', 22]],
      calc: function (v) { return v.vm > 0 && Math.abs(v.corr) <= 1 ? { valor: v.corr * v.va / v.vm, passos: ['Correlação dos retornos da ação com os do índice de mercado: ' + n(v.corr, 2) + '.', 'Volatilidade (desvio-padrão dos retornos) da ação: ' + pc(v.va, 0) + '. Do índice: ' + pc(v.vm, 0) + '.', 'Beta = correlação × (volatilidade da ação ÷ volatilidade do índice) = ' + n(v.corr, 2) + ' × (' + n(v.va, 0) + ' ÷ ' + n(v.vm, 0) + ') = ' + n(v.corr * v.va / v.vm, 2) + '.', 'É a mesma coisa que covariância(ação, índice) ÷ variância(índice), a definição formal.'] } : { valor: null, passos: [] }; },
      escala: [-0.5, 2.5], faixas: [[0, 'Beta negativo: historicamente a ação andou no sentido contrário ao do mercado. É raro e costuma ser instável.'], [0.8, 'Beta abaixo de 1: a ação oscilou menos do que o mercado, em média. Comum em energia elétrica, saneamento e consumo básico.'], [1.2, 'Beta próximo de 1: a ação acompanhou o mercado.'], [Infinity, 'Beta acima de 1: a ação amplificou os movimentos do mercado, para cima e para baixo. Comum em empresas cíclicas, alavancadas ou de crescimento.']],
      invalido: 'A correlação precisa estar entre −1 e 1, e a volatilidade do índice precisa ser maior que zero.' },

    'valor-de-mercado': { un: 'mi', entradas: [['preco', 'Preço da ação', 'R$', 24], ['acoes', 'Número total de ações', 'mi', 500]],
      calc: function (v) { return v.acoes > 0 && v.preco >= 0 ? { valor: v.preco * v.acoes, passos: ['Preço da ação: ' + rs(v.preco) + '.', 'Número total de ações emitidas (todas as classes, sem as de tesouraria): ' + n(v.acoes, 0) + ' milhões.', 'Valor de mercado = ' + n(v.preco, 2) + ' × ' + n(v.acoes, 0) + ' milhões = ' + mi(v.preco * v.acoes) + ', ou R$ ' + n(v.preco * v.acoes / 1000, 1) + ' bilhões.', 'É o preço de todas as ações juntas na cotação de hoje. Não inclui a dívida.'] } : { valor: null, passos: [] }; },
      escala: null, faixas: [[2000, 'Na convenção mais usada no Brasil, uma empresa pequena (small cap). Costuma ter menos liquidez e menos cobertura de analistas.'], [10000, 'Porte intermediário (mid cap), na convenção usual. Os limites entre as faixas variam conforme a fonte.'], [Infinity, 'Empresa grande (large cap), na convenção usual. Tamanho não é qualidade nem segurança: mede apenas quanto o mercado paga hoje.']],
      invalido: 'Informe preço e número de ações maiores que zero.' },

    'enterprise-value': { un: 'mi', entradas: [['vm', 'Valor de mercado', 'R$ mi', 12000], ['divida', 'Dívida bruta', 'R$ mi', 5000], ['caixa', 'Caixa e aplicações', 'R$ mi', 2000], ['min', 'Participação de minoritários', 'R$ mi', 0]],
      calc: function (v) { var ev = v.vm + v.divida - v.caixa + v.min; return { valor: ev, medidor: ev > 0 ? (v.divida - v.caixa) / ev * 100 : null, passos: ['Valor de mercado (o que valem todas as ações): ' + mi(v.vm) + '.', 'Dívida líquida = ' + n(v.divida, 0) + ' − ' + n(v.caixa, 0) + ' = ' + mi(v.divida - v.caixa) + '.', 'EV = ' + n(v.vm, 0) + ' + ' + n(v.divida - v.caixa, 0) + (v.min ? ' + ' + n(v.min, 0) : '') + ' = ' + mi(ev) + '.', ev > 0 ? 'Do valor da firma, ' + pc((v.divida - v.caixa) / ev * 100, 0) + ' corresponde à dívida líquida e o restante aos acionistas.' : 'EV negativo ou nulo: o caixa supera a soma de ações e dívida. É raro e pede investigação.'] }; },
      escala: [-20, 100], faixas: [[0, 'Caixa líquido: o EV é menor que o valor de mercado, porque a empresa tem mais caixa do que dívida.'], [30, 'A dívida líquida é parte pequena do valor da firma: a maior parte do EV pertence aos acionistas.'], [60, 'A dívida líquida é parte relevante do valor da firma. Variações no valor do negócio pesam mais sobre as ações.'], [Infinity, 'A maior parte do valor da firma é dívida. As ações se comportam como uma fatia fina e muito sensível: pequenas mudanças no EV mexem muito no valor de mercado.']],
      rotuloMedidor: 'Dívida líquida como % do EV', invalido: '' },

    'volume-medio': { un: 'mi', entradas: [['total', 'Volume financeiro somado no período', 'R$ mi', 420], ['dias', 'Número de pregões no período', 'dias', 21], ['ordem', 'Tamanho da sua ordem', 'R$ mi', 0.5]],
      calc: function (v) { if (!(v.dias > 0)) return { valor: null, passos: [] }; var m = v.total / v.dias; return { valor: m, medidor: m > 0 ? v.ordem / m * 100 : null, passos: ['Volume financeiro negociado, somando todos os pregões do período: ' + mi(v.total) + '.', 'Número de pregões: ' + n(v.dias, 0) + ' (um mês tem cerca de 21).', 'Volume médio diário = ' + n(v.total, 0) + ' ÷ ' + n(v.dias, 0) + ' = ' + mi(m) + ' por dia.', m > 0 ? 'Uma ordem de ' + mi(v.ordem) + ' equivale a ' + pc(v.ordem / m * 100) + ' do que se negocia em um dia típico.' : 'Sem negócios no período, não há como entrar ou sair pelo preço de tela.'] }; },
      escala: [0, 30], faixas: [[1, 'Sua ordem é fração mínima do volume diário: tende a ser executada sem mexer no preço.'], [10, 'Sua ordem já é parte visível do volume do dia. Pode ser preciso dividir a execução ou aceitar algum deslocamento de preço.'], [Infinity, 'Sua ordem é grande para a liquidez do papel. Entrar e, sobretudo, sair pode levar dias e custar caro em preço.']],
      rotuloMedidor: 'Sua ordem como % do volume diário', invalido: 'Informe o número de pregões do período.' },

    'free-float': { un: '%', entradas: [['total', 'Total de ações emitidas', 'mi', 500], ['presas', 'Ações com controladores, administradores e tesouraria', 'mi', 300]],
      calc: function (v) { return v.total > 0 && v.presas >= 0 && v.presas <= v.total ? { valor: (v.total - v.presas) / v.total * 100, passos: ['Total de ações emitidas: ' + n(v.total, 0) + ' milhões.', 'Ações fora de circulação (controladores, pessoas ligadas a eles, administradores e tesouraria): ' + n(v.presas, 0) + ' milhões.', 'Ações em circulação = ' + n(v.total, 0) + ' − ' + n(v.presas, 0) + ' = ' + n(v.total - v.presas, 0) + ' milhões.', 'Free float = ' + n(v.total - v.presas, 0) + ' ÷ ' + n(v.total, 0) + ' = ' + pc((v.total - v.presas) / v.total * 100) + '.'] } : { valor: null, passos: [] }; },
      escala: [0, 100], faixas: [[20, 'Free float baixo. Pode significar menos liquidez e pouca influência dos minoritários. O Novo Mercado da B3 exige um mínimo de ações em circulação, com regras que mudaram ao longo do tempo.'], [50, 'Faixa intermediária, com controlador definido: a situação mais comum no Brasil.'], [Infinity, 'Free float alto. Acima de 50% não há acionista com maioria sozinho; perto de 100%, a empresa tem capital pulverizado (sem controlador).']],
      invalido: 'As ações fora de circulação não podem superar o total de ações.' }
  };

  function cagr(v, nome) {
    if (!(v.ini > 0 && v.fim > 0 && v.anos >= 1)) return { valor: null, passos: [] };
    var r = v.fim / v.ini, g = (Math.pow(r, 1 / v.anos) - 1) * 100, simples = (r - 1) * 100;
    return { valor: g, passos: [nome + ' final ÷ ' + nome.toLowerCase() + ' inicial = ' + n(v.fim, 0) + ' ÷ ' + n(v.ini, 0) + ' = ' + n(r, 4) + ' (alta total de ' + pc(simples) + ').', 'Tira-se a raiz de índice ' + n(v.anos, 0) + ', que é o número de anos: ' + n(r, 4) + ' ^ (1 ÷ ' + n(v.anos, 0) + ') = ' + n(Math.pow(r, 1 / v.anos), 4) + '.', 'Subtrai-se 1: CAGR = ' + pc(g) + ' ao ano.', 'Conferência: ' + n(v.ini, 0) + ' crescendo ' + pc(g) + ' ao ano por ' + n(v.anos, 0) + ' anos chega a ' + n(v.ini * Math.pow(1 + g / 100, v.anos), 0) + '. Dividir a alta total pelos anos (' + pc(simples / v.anos) + ') estaria errado, porque ignora o efeito composto.'] };
  }
  function variacao(v, nome) {
    if (!(v.ant > 0)) return { valor: null, passos: [] };
    var g = (v.atu / v.ant - 1) * 100;
    return { valor: g, passos: [nome + ' do período anterior: ' + mi(v.ant) + '. Do período atual: ' + mi(v.atu) + '.', 'Variação = (' + n(v.atu, 0) + ' ÷ ' + n(v.ant, 0) + ') − 1 = ' + pc(g) + '.', 'Em reais, a diferença é de ' + mi(v.atu - v.ant) + '.', 'Compare sempre períodos equivalentes (o mesmo trimestre do ano anterior, ou 12 meses contra 12 meses) para não confundir crescimento com sazonalidade.'] };
  }

  function valoresPadrao(slug, troca) {
    var v = {};
    DEFS[slug].entradas.forEach(function (e) { v[e[0]] = e[3]; });
    for (var k in troca || {}) v[k] = troca[k];
    return v;
  }
  function leitura(slug, res) {
    var d = DEFS[slug];
    if (res.valor === null || !isFinite(res.valor)) return d.invalido;
    var ref = res.medidor !== undefined ? res.medidor : res.valor;
    if (ref === null) return '';
    for (var i = 0; i < d.faixas.length; i++) if (ref < d.faixas[i][0]) return d.faixas[i][1];
    return d.faixas[d.faixas.length - 1][1];
  }
  function posicao(slug, res) {
    var d = DEFS[slug];
    if (!d.escala || res.valor === null) return null;
    var ref = res.medidor !== undefined ? res.medidor : res.valor;
    if (ref === null || !isFinite(ref)) return null;
    return Math.max(0, Math.min(1, (ref - d.escala[0]) / (d.escala[1] - d.escala[0])));
  }
  var UN = { 'x': '×', '%': '%', 'n': '', 'R$': 'R$', 'mi': 'R$ mi' };
  function extremos(slug) {
    var d = DEFS[slug]; if (!d.escala) return null;
    var u = d.rotuloMedidor ? '%' : (d.un === 'x' ? '×' : d.un === '%' ? '%' : '');
    return [n(d.escala[0], 0) + u, n(d.escala[1], 0) + u + ' ou mais'];
  }

  var api = { DEFS: DEFS, mostrar: mostrar, valoresPadrao: valoresPadrao, leitura: leitura, posicao: posicao, extremos: extremos, n: n, UN: UN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else raiz.CERNE_CALC = api;
})(typeof window !== 'undefined' ? window : this);
