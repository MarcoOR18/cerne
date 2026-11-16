/* Cerne — área de indicadores: exemplo interativo, busca, progresso,
 * decomposição DuPont e busca do glossário.
 * As contas vêm de site/indicadores-calc.js (o mesmo arquivo usado pelo gerador).
 * A marcação de "estudado" fica só neste navegador (localStorage). Nada é enviado. */
(function () {
  'use strict';
  var CHAVE = 'cerne:indicadores';
  var C = window.CERNE_CALC;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function lerLidos() {
    try {
      var v = JSON.parse(localStorage.getItem(CHAVE) || '[]');
      return Array.isArray(v) ? v.filter(function (s) { return typeof s === 'string' && /^[a-z0-9-]{1,60}$/.test(s); }) : [];
    } catch (e) { return []; }
  }
  function gravarLidos(l) { try { localStorage.setItem(CHAVE, JSON.stringify(l)); } catch (e) { /* sem armazenamento */ } }
  function semAcento(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  /* aceita 12.000 · 1,5 · 0.7 · -3 · −3; devolve null se não for número */
  function lerNumero(txt) {
    var t = String(txt == null ? '' : txt).replace(/R\$|%|×|\s/g, '').replace(/−/g, '-');
    if (!/^-?[0-9.,]+$/.test(t) || (t.match(/,/g) || []).length > 1) return null;
    if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    else if ((t.match(/\./g) || []).length > 1) return null;
    var n = Number(t);
    return isFinite(n) && Math.abs(n) < 1e12 ? n : null;
  }
  function formatarCampo(v) {
    var dec = Math.round(v) === v ? 0 : (Math.abs(v * 10 - Math.round(v * 10)) < 1e-9 ? 1 : 2);
    return C.n(v, dec);
  }

  /* ------------------------------------------------- exemplo interativo -- */
  var lab = $('.lab[data-lab]');
  if (lab && C) {
    var slug = lab.getAttribute('data-lab'), def = C.DEFS[slug];
    var presets = {};
    try { presets = JSON.parse(lab.getAttribute('data-presets')); } catch (e) { presets = {}; }
    var campos = $$('input[data-id]', lab), botoes = $$('[data-preset]', lab);
    var elValor = $('[data-lab-valor]', lab), elLeitura = $('[data-lab-leitura]', lab), elPassos = $('[data-lab-passos]', lab);
    var elMed = $('.medidor i', lab);
    var atualizar = function () {
      var v = {}, ok = true;
      campos.forEach(function (c) {
        var n = lerNumero(c.value);
        c.parentNode.classList.toggle('invalida', n === null);
        c.setAttribute('aria-invalid', String(n === null));
        if (n === null) ok = false; else v[c.getAttribute('data-id')] = n;
      });
      while (elPassos.firstChild) elPassos.removeChild(elPassos.firstChild);
      if (!ok) {
        elValor.textContent = '—';
        elLeitura.textContent = 'Preencha todos os campos com números. Use vírgula para decimais, por exemplo 1,5.';
        if (elMed) elMed.hidden = true;
        return;
      }
      var res = def.calc(v);
      elValor.textContent = C.mostrar(def.un, res.valor);
      elLeitura.textContent = C.leitura(slug, res);
      res.passos.forEach(function (p) { var li = document.createElement('li'); li.textContent = p; elPassos.appendChild(li); });
      if (elMed) {
        var pos = C.posicao(slug, res);
        elMed.hidden = pos === null;
        if (pos !== null) elMed.style.left = (pos * 100).toFixed(1) + '%';
      }
    };
    lab.addEventListener('input', function (ev) {
      if (!ev.target.matches('input[data-id]')) return;
      botoes.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      atualizar();
    });
    botoes.forEach(function (b) {
      b.addEventListener('click', function () {
        var p = presets[b.getAttribute('data-preset')];
        if (!p) return;
        campos.forEach(function (c) { var id = c.getAttribute('data-id'); if (typeof p[id] === 'number') c.value = formatarCampo(p[id]); });
        botoes.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        atualizar();
      });
    });
    $('form', lab).addEventListener('submit', function (ev) { ev.preventDefault(); });
  }

  /* ------------------------------------------------------ marcar estudado -- */
  var artigo = $('[data-indicador].secao'), btLido = document.getElementById('marcar-lido'), selo = document.getElementById('selo-lido');
  if (artigo && btLido) {
    var meu = artigo.getAttribute('data-indicador');
    var pintar = function () {
      var lido = lerLidos().indexOf(meu) >= 0;
      btLido.setAttribute('aria-pressed', String(lido));
      btLido.textContent = lido ? 'Estudado. Desmarcar' : 'Marcar como estudado';
      if (selo) selo.hidden = !lido;
    };
    btLido.addEventListener('click', function () {
      var l = lerLidos(), i = l.indexOf(meu);
      if (i >= 0) l.splice(i, 1); else l.push(meu);
      gravarLidos(l); pintar();
    });
    pintar();
  }

  /* ------------------------------------------------------ índice e busca -- */
  var filtro = document.getElementById('filtro');
  if (filtro) {
    var busca = document.getElementById('busca-ind'), chips = $$('[data-filtro]', filtro), vazio = document.getElementById('filtro-vazio');
    var cats = $$('.cat'), cat = '';
    var lidos = lerLidos(), cartoes = $$('.ind-cartao[data-indicador]'), nLidos = 0;
    cartoes.forEach(function (a) {
      if (lidos.indexOf(a.getAttribute('data-indicador')) < 0) return;
      nLidos++;
      var s = document.createElement('span'); s.className = 'tag tag-lida'; s.textContent = 'Estudado';
      $('.ind-cartao-pe', a).appendChild(s);
    });
    var prog = document.getElementById('ind-progresso');
    if (prog) prog.textContent = nLidos ? nLidos + ' de ' + cartoes.length + ' indicadores marcados como estudados neste navegador.' : cartoes.length + ' indicadores. Ao terminar um, marque como estudado para acompanhar o seu progresso.';
    var aplicar = function () {
      var q = semAcento(busca.value.trim()), total = 0;
      cats.forEach(function (c) {
        var visiveis = 0, daCat = !cat || c.getAttribute('data-cat') === cat;
        $$('li[data-busca]', c).forEach(function (li) {
          var mostra = daCat && (!q || semAcento(li.getAttribute('data-busca')).indexOf(q) >= 0);
          li.hidden = !mostra; if (mostra) visiveis++;
        });
        c.hidden = visiveis === 0; total += visiveis;
      });
      vazio.hidden = total > 0;
    };
    busca.addEventListener('input', aplicar);
    chips.forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-filtro');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        aplicar();
      });
    });
  }

  /* ------------------------------------------------------------ glossário -- */
  var buscaG = document.getElementById('busca-gloss');
  if (buscaG) {
    var vazioG = document.getElementById('gloss-vazio');
    buscaG.addEventListener('input', function () {
      var q = semAcento(buscaG.value.trim()), total = 0;
      $$('section[data-letra]').forEach(function (sec) {
        var n = 0;
        $$('[data-busca]', sec).forEach(function (d) { var m = !q || d.getAttribute('data-busca').indexOf(q) >= 0; d.hidden = !m; if (m) n++; });
        sec.hidden = n === 0; total += n;
      });
      vazioG.hidden = total > 0;
    });
  }

  /* --------------------------------------------------------------- DuPont -- */
  var dp = document.getElementById('dupont-lab');
  if (dp) {
    var fmt = function (v, c) { return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c }); };
    var m = document.getElementById('dp-margem'), g = document.getElementById('dp-giro'), a = document.getElementById('dp-alav');
    var bts = $$('[data-dupont]', dp);
    var calc = function () {
      var vm = Number(m.value), vg = Number(g.value), va = Number(a.value), roa = vm * vg, roe = roa * va;
      document.getElementById('dp-margem-o').textContent = fmt(vm, 1) + '%';
      document.getElementById('dp-giro-o').textContent = fmt(vg, 2) + '×';
      document.getElementById('dp-alav-o').textContent = fmt(va, 1) + '×';
      document.getElementById('dp-roe').textContent = fmt(roe, 1) + '%';
      document.getElementById('dp-conta').textContent = fmt(vm, 1) + '% × ' + fmt(vg, 2) + ' × ' + fmt(va, 1);
      document.getElementById('dp-roa').textContent = fmt(roa, 1) + '%';
      var parte = roe > 0 ? (1 - 1 / va) * 100 : 0, txt;
      if (va <= 1.3) txt = 'Quase sem alavancagem: o ROE é praticamente igual ao ROA. O retorno vem da operação, por margem e giro.';
      else if (va <= 3) txt = 'Alavancagem moderada: ' + fmt(parte, 0) + '% do ROE vem de usar recursos de terceiros. Sem eles, o retorno seria de ' + fmt(roa, 1) + '%.';
      else txt = 'Alavancagem alta: ' + fmt(parte, 0) + '% do ROE vem de recursos de terceiros. A operação, sozinha, rende ' + fmt(roa, 1) + '% sobre os ativos. Se a margem cair pela metade, o ROE cai para ' + fmt(roe / 2, 1) + '%, e os juros continuam vencendo.';
      document.getElementById('dp-leitura').textContent = txt;
    };
    [m, g, a].forEach(function (el) { el.addEventListener('input', function () { bts.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); calc(); }); });
    bts.forEach(function (b) {
      b.addEventListener('click', function () {
        var p = b.getAttribute('data-dupont').split('|');
        m.value = p[0]; g.value = p[1]; a.value = p[2];
        bts.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        calc();
      });
    });
    $('form', dp).addEventListener('submit', function (ev) { ev.preventDefault(); });
    calc();
  }
})();
