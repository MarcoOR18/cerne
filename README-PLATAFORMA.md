# Cerne — plataforma

Site estático da Cerne, com o app "Monte sua carteira" em `carteira/`.

```
index.html, empresa.html, metodo.html, aprender.html, ferramentas.html   páginas institucionais (geradas)
liberdade.html, roteiro.html, mercado.html                                 ferramentas (geradas)
site/gerar-paginas.js     gera todas as páginas acima: node site/gerar-paginas.js
aula-*.html               módulos da área de aprendizagem (gerados)
site/aulas.js             referências e contas dos módulos
site/aulas-conteudo.js    textos das trilhas e dos módulos (formato explicado no topo do arquivo)
site/quiz.js              mini-testes e progresso (fica só no navegador)
indicadores.html, indicador-*.html, indicadores-em-conjunto.html, glossario.html   área de indicadores (geradas)
site/gerar-indicadores.js   monta a área de indicadores (formato dos dados explicado no topo do arquivo)
site/indicadores/*.js       textos dos 33 indicadores, por categoria, e o glossário
site/indicadores-calc.js    contas dos indicadores; lido pelo gerador e pelo navegador (exemplo interativo)
site/indicadores.js         exemplo interativo, busca, progresso e decomposição DuPont
site/ilustracoes.js         ilustrações vetoriais (SVG embutido), usadas pelo gerador
site/fontes/              Bricolage Grotesque e Instrument Serif (licença OFL), servidas pelo próprio site
site/site.css, site.js    estilo-base e comportamento comuns
site/vetor.css            identidade visual (Vector Surrealism) e componentes da área de indicadores
site/liberdade.js, checklist.js, mercado.js   lógica das ferramentas
carteira/                 app Monte sua carteira (veja README.md)
```

- Para trocar o nome da empresa, o lema ou o endereço do site: edite `MARCA`, `LEMA` e `URL_SITE` no topo de `site/gerar-paginas.js` e rode o gerador.
- Para atualizar taxas do Tesouro e índices da B3: `node carteira/tools/atualizar-ativos.js`.
- Para editar um módulo de aprendizagem: mude `site/aulas-conteudo.js` e rode o gerador. Todo dado novo precisa de fonte em `REFS` e de citação no texto.
- Imagens de prévia e ícones: `python site/gerar-og.py` e `python carteira/tools/gerar-imagens.py` (Pillow). Ao mudar arquivos do app, suba o número de `VERSAO` em `carteira/sw.js`.
- Para editar um indicador: mude o texto em `site/indicadores/<categoria>.js` e os números do exemplo em `site/indicadores-calc.js`, depois rode o gerador. Ele falha se um indicador citar termo fora do glossário ou indicador inexistente. Não escreva resultado de conta à mão no exemplo: ele é calculado.
- Identidade visual (nov/2026): Vector Surrealism. Papel-osso `#F5EEDF`, tinta-índigo `#1B1633`, terracota `#E4572E`, ocre `#E8A93B`, petróleo `#155E63`, céu `#BCD9DC` e lilás `#8E7CC3`; no escuro, fundo `#15112B`. Formas planas, contorno de tinta, sombra dura e deslocada. `--acento` (terracota) é superfície e chama a ação, sempre com texto `--acento-ink`; `--menta` marca o que está certo ou concluído; `--primary` e `--numeral` são cores que servem para texto. Títulos em Bricolage Grotesque; ênfases e números grandes em Instrument Serif.
- Ilustrações: cenas em `site/ilustracoes.js`, coloridas por classes `.i-*` de `site/vetor.css` (acompanham o tema). Movimento só com `prefers-reduced-motion: no-preference`.
- Testes da lógica da carteira: `node carteira/tests/engine.test.js`.
- "Cerne" é um nome provisório. Antes de usar publicamente como marca, verifique se já existe empresa ou marca registrada com esse nome no seu ramo.
