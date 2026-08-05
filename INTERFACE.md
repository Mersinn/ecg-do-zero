# ECG do Zero — Contrato de trabalho: FRONTEND e INTERFACE
### Prompt de ativação para uma nova sessão de implementação na branch de interface

---

## 0. Como usar este documento

Use este arquivo como primeira mensagem de uma nova sessão de Claude Code ou de outra ferramenta que vá **implementar o frontend** do repositório `ecg-do-zero`.

Ele deve ser usado junto de três anexos:

1. `HANDOFF-conteudo-inteligencia.md` — contrato da trilha de conteúdo clínico e inteligência pedagógica;
2. `ref-bancada-desktop-canonica-completa.jpeg` — referência visual positiva com navegação e composição integral;
3. `ref-bancada-desktop-canonica-detalhe.jpeg` — referência visual positiva com foco na bancada e no fechamento.

Na conversa em que este documento foi produzido, os dois arquivos visuais correspondem originalmente a:

- `5701CADB-B06F-4E03-910E-A5DF3CB88763.jpeg`;
- `5F624761-DFC3-45F7-B1AC-640842837CC9.jpeg`.

As faixas pretas externas vistas nessas capturas pertencem ao visualizador usado para compartilhá-las. **Não fazem parte da interface.**

Este documento é auto-suficiente quanto à direção de frontend, mas não substitui a leitura do repositório. Fatos vindos de inspeção direta ou do handoff de inteligência são marcados. Achados de auditorias anteriores que precisam ser reconfirmados antes de alteração estão marcados como **RELATADOS — REVERIFICAR**.

### Regra de branch

O trabalho acontece exclusivamente em uma **branch experimental de frontend**.

- A branch `main`/raiz canônica é intocável.
- Se a sessão estiver em `main`, ela deve parar antes de qualquer escrita.
- Não fazer merge, rebase, push, publicação ou alteração de GitHub Pages sem autorização explícita do autor.
- Não usar a branch experimental como justificativa para reescrever o produto inteiro.
- Mudanças devem ser pequenas, reversíveis, verificáveis e agrupadas por responsabilidade.

### Relação entre as duas trilhas

O ChatGPT atua como **maestro do frontend**: define direção visual, hierarquia, comportamento responsivo e critérios de qualidade da interface.

O track de conteúdo/inteligência atua como **maestro clínico e pedagógico**: define o que é treinado, o que é evidência, o que é limite do traçado, quais erros cognitivos existem e quando uma conclusão é clinicamente legítima.

O track de inteligência pode e deve contestar uma escolha visual quando ela comprometer a aprendizagem, a honestidade clínica ou a interpretação do traçado. Ele não escolhe sozinho a aparência. O track de interface não reescreve medicina para fazer o layout caber.

---

## 1. Quem você é nesta sessão

Você é a sessão de **implementação do frontend e da experiência de uso** do ECG do Zero.

### É seu

- `src/css/**`;
- `index.html`, dentro dos limites de estrutura, acessibilidade, metadados e carregamento de fontes;
- arquitetura de layout e navegação;
- responsividade para iPhone, iPad e desktop;
- hierarquia tipográfica e visual;
- tokens de cor, espaçamento, borda, elevação e movimento;
- acessibilidade de teclado, toque, foco, contraste e leitores de tela;
- estados de carregamento, vazio, erro técnico e recuperação;
- apresentação das evidências sobre o traçado;
- apresentação do preceptor, do Freio, da confiança, do fechamento e do desempenho;
- comportamento de componentes visuais e controladores de interação;
- integração visual dos dados clínicos já existentes ou fornecidos pelo track de inteligência;
- correção de bugs de frontend confirmados na branch;
- documentação dos contratos que o conteúdo precisa cumprir para poder ser renderizado.

### Não é seu

- escrever ou corrigir critérios clínicos;
- alterar gabaritos, alternativas, fontes, condutas ou distratores;
- editar livremente `src/js/data/**`;
- redefinir os 27 padrões, 46 questões, 18 casos, 67 decisões ou os roteiros;
- mudar a taxonomia de operações cognitivas ou movimentos de erro;
- transformar um limite clínico em diagnóstico para simplificar a tela;
- remover o Freio ou a declaração de confiança por parecerem fricção;
- alterar a lógica de domínio de `store.js` sem pedido explícito e contrato do track de inteligência;
- tocar na branch `main`.

### Zona compartilhada — tocar somente com contrato explícito

- `src/js/app.js` — mistura fluxo, renderização e integração;
- `src/js/plantao.js` — fluxo de casos e apresentação;
- `src/js/tools.js` — Bancada e instrumentos;
- `src/js/papel.js` — papel e escala clínica;
- `src/js/store.js` — estado pedagógico e persistência;
- `src/js/ecg/library.js` — dado clínico consumido pela interface;
- `src/js/ecg/engine.js` — síntese e renderização clínica do traçado.

Nessa zona, a regra é: **a interface integra; a inteligência define a semântica; o motor preserva a verdade física.**

---

## 2. A raiz — autoridade máxima

O aluno que concluiu o produto deve poder dizer:

> **“Eu sei por onde começar. Sei o que procurar. Consigo mostrar no traçado por que cheguei a essa conclusão — e sei reconhecer quando ainda não tenho certeza.”**

Os quatro verbos são a especificação do frontend:

1. **Começar** — a interface deixa claro qual é o primeiro movimento, sem entregar o diagnóstico.
2. **Procurar** — o instrumento e a hierarquia conduzem a atenção para uma variável observável.
3. **Mostrar** — toda conclusão relevante pode ser ancorada visualmente no traçado.
4. **Reconhecer o limite** — a interface abre espaço para dizer “esta tira não responde”, pedir outra derivação, repetir o exame ou admitir incerteza.

### Relação pedagógica

O produto se comporta como **um preceptor calmo diante de uma bancada clínica**.

Ele coloca o papel sob a luz, não toma o lápis da mão do estudante e pergunta:

> “O que você vê primeiro? Onde está a evidência? O que isso permite concluir?”

“Colocar o papel sob a luz” é uma metáfora de hierarquia e atenção. **Não é autorização para desenhar madeira, luminária, papel rasgado, textura vintage ou uma bancada fotográfica.** Essa tradução literal já foi testada e rejeitada pelo autor.

### Imagem simbólica

> **“Uma bancada de trabalho clínico que cabe no bolso.”**

> **“O próprio celular vira a bancada.”**

Isto implica equivalência de competência:

- no celular, a bancada acompanha o estudante;
- no iPad, vira uma superfície tátil de estudo;
- no desktop, abre espaço para concentração, comparação e prática aprofundada;
- nenhuma versão é uma edição inferior da outra.

### Regra do erro

O feedback segue sempre esta ordem:

> **Você observou isto** → **o raciocínio desviou aqui** → **esta evidência muda a conclusão**

O erro não é uma tela vermelha, um badge “incorreto” ou um julgamento moral. É uma marca precisa sobre o ponto em que a leitura se afastou da evidência.

### Regra do tempo

> **Durante a tarefa o sistema REGISTRA. Depois da tarefa o sistema JULGA.**

Durante a interação podem aparecer somente fatos sustentados e cumulativos: marcador colocado, intervalo medido, onda localizada, evidência já demonstrada.

Durante a tarefa não mostrar:

- “acerto frágil”;
- classificação de domínio;
- diagnóstico de excesso de confiança;
- percentual de desempenho;
- selo de acerto/erro que encerre o raciocínio antes do fechamento.

O julgamento aparece no fechamento da tarefa, do caso ou na tela de Desempenho.

### Voz da interface

- Rejeitado: “Excelente! Você arrasou!”
- Rejeitado: “Resposta incorreta.”
- Correto: “Volte ao início da onda P. Seu marcador passou do começo do QRS.”

A voz é concreta, curta, clínica, respeitosa e sempre aponta para algo demonstrável.

---

## 3. O produto e o baseline técnico

**VERIFICADO NO HANDOFF DE INTELIGÊNCIA — reconfirmar no repositório antes de editar.**

- Repositório: `github.com/Mersinn/ecg-do-zero`;
- publicação atual: GitHub Pages;
- licença: MIT;
- stack: HTML, CSS e JavaScript puro com módulos ES;
- sem build, backend ou cadastro;
- progresso em `localStorage`;
- os traçados são sintéticos e essa honestidade deve permanecer visível;
- o site precisa ser servido por HTTP: `python -m http.server 8000`.

As superfícies atuais são: Método, O papel, Anatomia, Localizar, Módulos, Bancada, Plantão, Questões e Desempenho.

Existe uma hipótese de reorganização em Hoje / Trilha / Atlas / Bancada / Plantão / Desempenho. Ela **não está aprovada automaticamente**. As referências visuais positivas usam Hoje / Trilha / Bancada / Plantão / Desempenho. A posição de Atlas e Questões ainda é decisão do autor.

### Ativos que a interface não pode diluir

- os nove passos de leitura;
- os instrumentos da Bancada;
- as anotações diretamente no traçado;
- o Freio antes do gabarito;
- a declaração de confiança;
- os movimentos de erro dos casos;
- a fila de fragilidades e repetição espaçada;
- a distinção entre traçado sintético educativo e registro real de paciente.

---

## 4. Direção visual canônica

As duas capturas anexas são **referências positivas da mesma direção**, não duas alternativas concorrentes.

### O que está aprovado nelas

- casca noturna profunda, com caráter clínico e sem aparência de dashboard corporativo;
- navegação lateral discreta no desktop;
- Bancada ativa sem dominar o conteúdo;
- cabeçalho curto: nome da superfície, estágio e modo Explorar/Desafio;
- papel clínico grande e protagonista;
- ECG com escala técnica legível;
- réguas e paquímetro em ciano, diretamente sobre o papel;
- evidência correta em verde restrito;
- desvio localizado em cobre/terracota restrito;
- feedback abaixo do instrumento, não bloqueando o traçado;
- fechamento em duas colunas no desktop: leitura factual de um lado, preceptor e ação do outro;
- separação por alinhamento, espaço e filetes, não por pilhas de cards;
- ação primária clara, sem gamificação;
- densidade adequada para estudo: não é vazia, nem abarrotada.

### O que foi explicitamente rejeitado

- metáfora transformada em cenário;
- madeira, luminária, papel rasgado ou envelhecido;
- fotografia ou falsa fotografia de bancada;
- serifas dramáticas dentro do instrumento;
- skeuomorfismo temático;
- “vida” criada por decoração;
- interface genérica de curso, quiz, hospital ou dashboard;
- cartões dentro de cartões;
- vermelho de reprovação;
- brilho, neon, glow, glassmorphism ou cyberpunk;
- medalhas, sequência, pontos, ranking, confete ou troféus.

### Onde a vida do produto realmente mora

A interface ganha vida por:

- manipulação direta do traçado;
- réguas que respondem ao toque e ao teclado;
- anotações que nascem do ponto medido;
- transições entre observar, medir, sustentar e decidir;
- movimento do ECG apenas quando a superfície representa um monitor ligado;
- papel estável quando a superfície representa onde se mede;
- microtexto do preceptor reagindo ao gesto real do estudante;
- continuidade entre Bancada, Plantão, Questões e Desempenho;
- respostas táteis e visuais discretas, nunca por cenografia.

### Três materiais — como superfícies digitais

1. **Casca noturna:** concentração e navegação.
2. **Papel clínico:** medida, anotação e evidência.
3. **Instrumento ligado:** traçado vivo quando o contexto exigir monitorização.

Esses materiais são definidos por cor, comportamento e função. Não por texturas fotográficas.

---

## 5. Sistema visual de referência

Os valores abaixo são tokens de direção para a branch experimental. Devem ser testados em contraste, daltonismo, telas OLED e papel de baixa luminosidade.

### Paleta semântica

- `--shell: #080B10` — casca principal;
- `--surface: #111820` — superfície escura secundária;
- `--text: #F4F7F6` — texto principal;
- `--muted: #AEB7C0` — texto secundário;
- `--action: #7277F4` — ação e navegação, ultramarino sólido ou praticamente sólido;
- `--measure: #56C7EA` — instrumentos e medidas;
- `--support: #42BE8A` — evidência sustentada;
- `--correction-paper: #C97963` — correção em papel;
- `--correction-dark: #D99178` — correção em superfície escura;
- `--paper: #F5F0E7` — papel clínico;
- `--grid-minor` e `--grid-major` — malva/rosa de baixa cromaticidade, distintos da cor de correção.

### Regra do cobre

O cobre/terracota cria um contraste sutil, mas inequívoco. Ele funciona como marca de lápis do preceptor.

- ocupa área mínima;
- aparece em âncora, conector ou detalhe curto;
- nunca preenche um painel;
- nunca colore toda a resposta;
- nunca classifica a pessoa;
- não pode se confundir com a grade do ECG.

### Regra do teal

Teal não é o acento global. Ação, acerto e traçado vivo não podem ser três verdes vizinhos disputando significado.

### Tipografia

- **Instrument Sans** — interface, navegação, títulos, ações e microtexto;
- **IBM Plex Mono** — milissegundos, milímetros, derivações, velocidade, ganho e valores técnicos;
- **Source Serif 4** — no máximo candidata para narrativa longa de caso sobre papel claro; não usar em Bancada, controles, casca escura ou feedback instrumental sem nova aprovação do autor.

As fontes devem ser auto-hospedadas, com acentuação completa e estratégia de fallback. Não usar mais de duas famílias simultaneamente na mesma tela instrumental.

### Hierarquia

> **Instrumento antes. Professor depois.**

O primeiro fold precisa entregar o traçado e uma ação cognitiva clara. O preceptor aparece para orientar, responder e fechar — não para ocupar o espaço que deveria pertencer à tentativa.

---

## 6. Contrato responsivo

### iPhone — prioridade operacional

- viewport de referência: `390 × 844`;
- navegação persistente inferior;
- papel ocupa a maior parte da largura e do primeiro movimento de rolagem;
- controles com alvo mínimo de 44 × 44 px;
- manipulação de réguas sem depender de hover;
- feedback empilhado abaixo do papel;
- ações primárias alcançáveis com o polegar;
- nenhuma ferramenta importante removida por falta de espaço;
- rolagem horizontal somente dentro do papel quando clinicamente necessária, nunca no documento inteiro.

### iPad — superfície tátil

- viewport de referência: `834 × 1194`;
- navegação lateral estreita ou adaptação coerente da navegação persistente;
- papel maior, com alças de toque e comparação;
- fechamento pode usar duas colunas quando houver largura real;
- não esticar a composição do telefone;
- não converter o iPad em mini-desktop com alvos pequenos.

### Desktop — bancada completa

- viewport de referência: `1440 × 1024`;
- navegação lateral persistente;
- papel clínico domina o centro;
- na Bancada aprovada, feedback e preceptor vivem abaixo do papel em duas colunas;
- comparação e instrumentos avançados podem ocupar trilha própria sem virar dashboard;
- evitar grandes zonas vazias e cards de métricas;
- teclado, mouse e trackpad têm paridade com toque.

### Equivalência de competência

Responsividade muda composição, não capacidade. Se uma tarefa existe no desktop, deve existir no celular e no iPad com interação adequada ao dispositivo.

---

## 7. Máquina de estados pedagógica da interface

### Estado A — antes da tentativa

Mostrar:

- contexto necessário;
- pergunta do preceptor;
- instrumento;
- papel/traçado;
- ação disponível.

Não mostrar:

- diagnóstico;
- critério que resolva a questão;
- resposta correta disfarçada;
- título que nomeie o padrão;
- `oQueEstaTiraNaoResponde`;
- classificação de domínio.

### Estado B — durante a tentativa

Registrar fatos:

- posição do marcador;
- intervalo medido;
- onda selecionada;
- evidência já sustentada;
- texto do Freio quando aplicável.

Não classificar a pessoa.

### Estado C — submissão e Freio

Nas questões, o Freio permanece uma dificuldade desejável. O campo precisa de rótulo acessível e não pode aceitar vazio silenciosamente. Se existir uma ação explícita de pular, ela deve ser deliberada e registrada; não mascarada como submissão válida.

### Estado D — feedback da tentativa

Seguir os três movimentos:

1. nomear o que foi observado corretamente;
2. localizar o desvio no traçado;
3. mostrar como a evidência muda a conclusão.

O feedback visual usa âncoras diretamente no traçado. O texto sozinho não basta quando a evidência é gráfica.

### Estado E — limite da tira

Depois da tentativa, pode aparecer:

> **O que esta tira não responde**

Esse bloco consome o futuro campo opcional `oQueEstaTiraNaoResponde`. Nunca aparece antes da tentativa.

### Estado F — fechamento e julgamento

Somente no fechamento da tarefa ou caso:

- coletar/confirmar confiança;
- comparar decisão e evidência;
- registrar estado sólido/frágil;
- sugerir repetição;
- encaminhar para Desempenho.

Não exibir “confiança alta demais” no meio da investigação.

---

## 8. Arquitetura de informação — direção e pendências

### Núcleo visual já sustentado pelas referências

- Hoje;
- Trilha;
- Bancada;
- Plantão;
- Desempenho.

### Mapeamento funcional proposto, ainda sujeito ao autor

- **Hoje:** próxima ação, retomada e fila útil; em estado zero, onboarding e CTA — nunca quatro cartões com zeros.
- **Trilha:** Método, Papel, Anatomia, Localizar e Módulos organizados como aprendizado progressivo.
- **Bancada:** gerador, eixo, paquímetro, comparação e desafios de manipulação.
- **Plantão:** casos e decisões clínicas, com evidência antes da decisão.
- **Desempenho:** diagnóstico acionável por etapa, operação e movimento de erro; repetição espaçada e fragilidades.

### Pendências que o autor decide

- Atlas entra na navegação principal ou dentro de Trilha?
- Questões têm superfície própria, entram em Hoje ou são distribuídas pela Trilha?
- A navegação final terá cinco ou seis destinos?
- Qual é a primeira tela após retorno do aluno: Hoje ou continuidade direta da tarefa?

Até decisão, não consolidar rotas de forma irreversível.

---

## 9. Componentes conceituais — contrato, não biblioteca obrigatória

Os nomes abaixo descrevem responsabilidades. Não exigem framework ou arquitetura nova.

### `ClinicalPaperSurface`

- preserva escala física;
- contém SVG e grade;
- permite rolagem local;
- recebe uma ou várias derivações;
- nunca estica o traçado para preencher espaço;
- mantém aviso de traçado sintético onde aplicável.

### `EvidenceAnchor`

- liga texto a um ponto ou intervalo demonstrável;
- tem semântica: medida, sustentação ou correção;
- não cobre o traçado crítico;
- funciona com teclado e leitor de tela.

### `CaliperTool`

- alças táteis;
- valores em mono;
- escala derivada de `--mm`;
- interação por toque, mouse e teclado;
- feedback sem julgamento durante a medição.

### `PreceptorResponse`

- vem depois da tentativa;
- usa os três movimentos do erro;
- não vira mascote, avatar ou chat genérico;
- aponta para o traçado.

### `DecisionMirror`

- mostra decisão do estudante e conclusão sustentada;
- usa cor somente em ícones/âncoras pequenos;
- não cria dois grandes cartões vermelho/verde.

### `ConfidenceCapture`

- coleta confiança sem sugerir resposta;
- não classifica durante a tarefa;
- envia o dado ao modelo cognitivo existente.

### `Freio`

- exige que o aluno diga o que a questão pede;
- tem `label`, instrução e estado de validação;
- não aceita vazio como resposta normal.

### `StripLimit`

- consome `oQueEstaTiraNaoResponde`;
- aparece somente depois da tentativa;
- pode sugerir pedir 12 derivações, V3R/V4R, V7–V9, ECG anterior, repetição ou checagem de pulso.

---

## 10. Achados de frontend a reverificar

Os itens abaixo foram relatados por auditoria anterior e imagens do produto. **Não editar com base apenas neste parágrafo; reproduzir e confirmar primeiro.**

### P0 — conteúdo essencial temporariamente invisível

RELATADO: uma animação de entrada define `opacity: 0` em blocos essenciais e só libera por fallback em aproximadamente 1,4 s. Conteúdo clínico nunca pode começar invisível. Movimento deve durar cerca de 200–250 ms e partir de opacidade legível, ou animar somente posição.

### P0 — Freio vazio

RELATADO: a correção aceita `trim()` vazio antes de repreender o usuário. Isso contradiz o contrato pedagógico. Confirmar fluxo, adicionar rótulo e impedir submissão vazia ou oferecer “pular” explícito.

### P1 — rolagem horizontal do documento

RELATADO: há scrollbar horizontal no desktop, possivelmente pela interação entre `overflow-y: auto` e o eixo x. Medir o elemento exato. A rolagem horizontal só pode existir dentro da superfície do papel.

### P1 — papel ocupa parte do contêiner

VERIFICADO CONCEITUALMENTE: o SVG preserva largura clínica intrínseca baseada em duração × 25 mm/s × `--mm`. **Não esticar.** Resolver com mais duração, alinhamento ou contêiner limitado ao SVG.

### P1 — persistência falha em silêncio

RELATADO: `salvar()` absorve erros sem avisar. A interface precisa de estado recuperável e comunicação discreta quando o progresso não puder ser salvo.

### P1 — questões sem traçado

RELATADO no handoff de inteligência: questões referenciam padrões renderizáveis, mas não mostram a tira. Reconfirmar imports existentes e integrar o motor quando o dado permitir.

### P2 — Desempenho em estado zero

OBSERVADO visualmente: a tela inicial pode ser dominada por cartões `0 / 1 / 0% / 0`. Substituir por onboarding, explicação do que será medido e uma próxima ação concreta.

---

## 11. Ordem de trabalho do track de interface

### FASE 0 — Segurança e baseline

1. Ler `README.md`.
2. Confirmar raiz Git, branch, HEAD, upstream e `git status`.
3. Parar se estiver em `main`.
4. Identificar instruções locais (`AGENTS.md`, se existir) sem alterar nada.
5. Rodar `python tools/verificar.py` antes de qualquer mudança.
6. Servir o site por HTTP.
7. Capturar baseline nas três larguras: 390 × 844, 834 × 1194 e 1440 × 1024.
8. Registrar quais achados da seção 10 foram reproduzidos.

### FASE 1 — P0 técnico e acessibilidade

- eliminar invisibilidade de conteúdo essencial;
- corrigir Freio vazio e rotulagem;
- corrigir overflow global;
- tornar falhas de persistência comunicáveis;
- garantir foco visível, ordem de tabulação e alvos táteis;
- não redesenhar ainda.

### FASE 2 — Fundação visual

- consolidar tokens;
- auto-hospedar fontes aprovadas;
- separar casca, papel e instrumento por função;
- construir navegação responsiva sem fechar pendências de IA;
- remover inconsistências de espaçamento e contraste;
- manter a UI atual funcionando enquanto a nova branch evolui.

### FASE 3 — Bancada como vertical slice

A Bancada é a primeira tela de verdade porque concentra:

- papel;
- escala física;
- manipulação direta;
- evidência;
- correção;
- preceptor;
- equivalência entre dispositivos.

Implementar primeiro o estado mostrado nas referências: desafio de medição do PR com início sustentado, final ultrapassado, medida 188 ms, alvo 162 ms, correção em cobre, feedback abaixo e ação de tentar novamente.

Só depois de a Bancada funcionar e ser comparada às referências, avançar.

### FASE 4 — Plantão

- caso sem diagnóstico no título;
- paciente/contexto acima do traçado;
- traçado protagonista;
- evidência anotada diretamente;
- “Sua decisão” compacta, nunca maior que o objeto clínico;
- confiança coletada/interpretada no fechamento;
- acesso aos nove passos como apoio, não fuga.

### FASE 5 — Questões

- renderizar traçado quando houver padrão;
- preservar Freio;
- separar resposta, confiança, feedback e julgamento;
- distinguir escolhido/correto sem vermelho dominante;
- destacar a evidência no próprio traçado;
- suportar `reconhecer_insuficiencia`.

### FASE 6 — Hoje, Trilha e Desempenho

- Hoje orienta próximo passo;
- Trilha mostra progressão sem virar catálogo vazio;
- Módulos ganham preview, tempo, estado e relação com os quatro verbos;
- Desempenho transforma dados em diagnóstico acionável;
- estado zero conduz em vez de exibir zeros.

### FASE 7 — Capacidades solicitadas pela inteligência

- múltiplas derivações;
- batimentos prematuros;
- espícula de marca-passo;
- traçado nas questões;
- `oQueEstaTiraNaoResponde` no fechamento.

As capacidades clínicas só entram quando o contrato de dados estiver acordado.

---

## 12. A fronteira com o track de conteúdo e inteligência

Esta seção espelha a seção 8 de `HANDOFF-conteudo-inteligencia.md`.

As duas trilhas trabalham no mesmo repositório, em branches separadas. **A fronteira é o dado e a semântica.** A inteligência produz o significado clínico; a interface o transforma em experiência observável sem adulterá-lo.

### O track de interface garante

- não editar `src/js/data/**`;
- não reescrever critérios, gabaritos, fontes, condutas ou taxonomias;
- não alterar campos clínicos de `library.js` sem contrato;
- consumir campos novos de forma aditiva e tolerante à ausência;
- preservar `--mm` como escala física única;
- nunca esticar SVG clínico para preencher layout;
- nunca colocar diagnóstico acima do traçado;
- renderizar `oQueEstaTiraNaoResponde` somente depois da tentativa;
- preservar Freio e confiança;
- não mostrar julgamento durante a tarefa;
- não usar vermelho como vocabulário de erro;
- manter equivalência de competência entre celular, iPad e desktop;
- declarar traçados sintéticos;
- não tocar em `main`.

### O track de interface pede, não inventa

Quando uma experiência exigir dado clínico ausente, registrar no relatório final:

```text
PEDIDO AO TRACK DE INTELIGÊNCIA
o quê:
por quê:
o que muda:
sem isso:
prioridade:
```

### Pedidos recebidos do track de inteligência

```text
PEDIDO AO TRACK DE INTERFACE
o quê:        renderizar múltiplas derivações simultâneas e empilhadas
por quê:      contiguidade, recíproca, eixo e Sokolow-Lyon não cabem em uma derivação isolada
o que muda:   a superfície de papel e o motor passam a aceitar uma coleção ordenada de derivações
sem isso:     padrões e questões permanecem clinicamente incompletos
prioridade:   alta
```

```text
PEDIDO AO TRACK DE INTERFACE
o quê:        suportar batimentos prematuros no motor
por quê:      desbloqueia extrassístoles, bigeminismo, trigeminismo, RIVA e TAM
o que muda:   engine aceita eventos de batimento fora da periodicidade basal
sem isso:     a interface pode citar, mas não demonstrar esses padrões
prioridade:   alta
```

```text
PEDIDO AO TRACK DE INTERFACE
o quê:        desenhar o traçado dentro das questões quando houver padrão renderizável
por quê:      interpretar traçado é operação central e hoje pode estar sendo treinada apenas por texto
o que muda:   fluxo de Questões consome padrão/derivação e chama o motor
sem isso:     o aluno responde por memória verbal, não por evidência visual
prioridade:   alta
```

```text
PEDIDO AO TRACK DE INTERFACE
o quê:        criar um lugar pós-tentativa para o campo oQueEstaTiraNaoResponde
por quê:      o quarto verbo exige reconhecer limites da tira sem entregar a resposta antes da tentativa
o que muda:   feedback/fechamento ganha uma seção opcional de limite e próximo exame
sem isso:     o novo conteúdo existe nos dados, mas não participa da aprendizagem
prioridade:   máxima
```

```text
PEDIDO AO TRACK DE INTERFACE
o quê:        suportar espícula e captura de marca-passo
por quê:      ritmo de marca-passo é frequente, citado pelo material e depende de morfologia própria
o que muda:   engine e papel renderizam evento de espícula preservando escala
sem isso:     o padrão continua textual e não demonstrável
prioridade:   média-alta
```

### Pedidos deste track ao track de inteligência

```text
PEDIDO AO TRACK DE INTELIGÊNCIA
o quê:        fornecer oQueEstaTiraNaoResponde nos 27 padrões como texto curto e opcional
por quê:      a interface precisa ensinar o limite sem inferir medicina
o que muda:   library.js recebe um campo aditivo de uma a três frases
sem isso:     o frontend só consegue mostrar um bloco genérico e clinicamente pobre
prioridade:   máxima
```

```text
PEDIDO AO TRACK DE INTELIGÊNCIA
o quê:        reescrever títulos de casos e subtítulos de cards para não entregar o diagnóstico
por quê:      nada acima do traçado pode nomear o achado antes da tentativa
o que muda:   títulos passam a usar idade, queixa e contexto; diagnóstico vai para o fechamento
sem isso:     qualquer redesign continuará ensinando reconhecimento por título
prioridade:   máxima
```

```text
PEDIDO AO TRACK DE INTELIGÊNCIA
o quê:        definir o contrato clínico de múltiplas derivações
por quê:      a interface não pode escolher sozinha quais derivações, ordem, simultaneidade ou escala representam cada padrão
o que muda:   derivacao pode evoluir de string para estrutura aditiva acordada
sem isso:     o frontend pode construir o componente, mas não povoá-lo com segurança
prioridade:   alta
```

```text
PEDIDO AO TRACK DE INTELIGÊNCIA
o quê:        fornecer âncoras estruturadas de evidência quando o texto precisar apontar para o traçado
por quê:      variavelDecisiva em prosa não informa de modo confiável o ponto, intervalo ou derivação a destacar
o que muda:   cada questão/caso/padrão pode receber uma lista opcional de evidências com tipo, derivação, início/fim e rótulo curto
sem isso:     a interface dependerá de coordenadas hardcoded ou anotações genéricas
prioridade:   alta
```

```text
PEDIDO AO TRACK DE INTELIGÊNCIA
o quê:        definir rótulos humanos das operações e movimentos novos
por quê:      Desempenho precisa explicar padrões de raciocínio sem expor chaves internas como conclusao_sem_evidencia
o que muda:   taxonomias oferecem nome curto, explicação e próximo treino
sem isso:     o diagnóstico de aprendizagem vira jargão técnico
prioridade:   média-alta
```

```text
PEDIDO AO TRACK DE INTELIGÊNCIA
o quê:        publicar limites de comprimento para pivo, pegadinha, fechamento, preceptor e limite da tira
por quê:      responsividade precisa de contratos, não truncamento arbitrário
o que muda:   validador passa a sinalizar textos acima do orçamento acordado
sem isso:     a interface terá overflow, corte ou tamanhos inconsistentes
prioridade:   média
```

---

## 13. Matriz de encontro — onde o autor decide

| Tema | Inteligência garante/pede | Interface garante/pede | Situação |
|---|---|---|---|
| `oQueEstaTiraNaoResponde` | escreve e valida o campo | mostra somente após tentativa | contrato convergente; implementar quando o campo existir |
| títulos neutros | reescreve dados | não revela diagnóstico no layout | contrato convergente |
| múltiplas derivações | define conteúdo e forma | desenha papel/engine responsivo | autor aprova a estrutura de dados antes da zona compartilhada |
| batimento prematuro | define parâmetros clínicos | implementa síntese e interação | exige contrato conjunto e testes clínicos |
| questões com traçado | fornece padrão/derivação | conecta fluxo ao motor | alta prioridade e baixo conflito |
| âncoras de evidência | fornece semântica/tempo/derivação | posiciona e torna acessível | precisa de novo campo opcional acordado |
| confiança | preserva significado cognitivo | coleta e apresenta no tempo correto | julgamento somente no fechamento |
| Freio | preserva a dificuldade desejável | corrige validação e acessibilidade | não remover |
| navegação Atlas/Questões | conteúdo permanece agnóstico | precisa consolidar IA | decisão do autor pendente |
| estilo visual | pode contestar dano pedagógico | decisão final de frontend | maestro de frontend decide após ouvir inteligência |

Quando um pedido de uma trilha coincide com a garantia da outra, a síntese é direta. Quando ambos alteram a zona compartilhada ou a forma do dado, levar ao autor antes de implementar.

---

## 14. Regras invioláveis

1. `main` é intocável.
2. Conteúdo clínico correto vence elegância visual.
3. Nada acima do traçado entrega o diagnóstico.
4. Durante a tarefa, registrar; depois, julgar.
5. O preceptor não toma o lápis.
6. O erro aponta para a evidência e não vira vermelho.
7. Sem gamificação extrínseca.
8. Freio e confiança permanecem.
9. Traçado sintético é declarado.
10. `--mm` é a escala física única.
11. SVG não é esticado para preencher card.
12. Conteúdo essencial nunca inicia invisível.
13. Animação não bloqueia leitura nem interação.
14. Mobile-first não significa mobile-only.
15. Nenhum dispositivo recebe versão incompetente.
16. Metáfora não vira cenografia.
17. Instrumento antes; professor depois.
18. Toda anotação clínica precisa apontar para algo demonstrável.
19. A interface não inventa medicina ausente.
20. Toda mudança compartilhada tem contrato, teste e relatório.

---

## 15. Critérios de aceite do frontend

Cada item precisa de evidência visual, teste ou inspeção reproduzível.

1. **Branch segura:** nenhuma alteração em `main`; branch e diff declarados.
2. **Bancada canônica:** o estado PR 188 ms → alvo 162 ms reproduz a hierarquia das duas referências aprovadas sem cenografia literal.
3. **Três viewports:** 390 × 844, 834 × 1194 e 1440 × 1024 funcionam sem perda de capacidade.
4. **Sem overflow global:** documento não rola horizontalmente; papel pode rolar localmente quando necessário.
5. **Escala preservada:** 25 mm/s e 10 mm/mV permanecem coerentes; SVG não é esticado.
6. **Conteúdo visível:** nenhum bloco essencial passa por `opacity: 0` prolongada.
7. **Toque:** alvos interativos têm pelo menos 44 × 44 px.
8. **Teclado:** réguas, abas, navegação, Freio e ações principais funcionam sem mouse.
9. **Foco:** foco é visível e segue ordem lógica.
10. **Contraste:** textos e controles atendem WCAG AA; cor não é o único sinal.
11. **Erro calmo:** cobre restrito; nenhuma tela ou resposta vira vermelho/verde em bloco.
12. **Freio real:** vazio não abre gabarito; campo tem rótulo acessível.
13. **Julgamento no tempo certo:** fragilidade, excesso de confiança e desempenho só aparecem no fechamento/Desempenho.
14. **Evidência visual:** feedback clínico destaca o ponto/intervalo no traçado.
15. **Limite pós-tentativa:** `oQueEstaTiraNaoResponde`, quando presente, nunca aparece antes.
16. **Caso não entregue:** título e conteúdo acima do traçado não nomeiam o padrão.
17. **Estado zero útil:** Hoje e Desempenho oferecem próximo passo, não painel de zeros.
18. **Persistência honesta:** falha ao salvar não é engolida silenciosamente.
19. **Traçado nas questões:** questões renderizáveis mostram a tira após integração aprovada.
20. **Honestidade clínica:** aviso de traçado sintético permanece acessível.
21. **Regressão:** `python tools/verificar.py` continua aprovado.
22. **Comparação visual:** screenshots implementados são comparados lado a lado com as referências nas mesmas dimensões antes de aprovação.

---

## 16. Como trabalhar

### Antes de escrever

1. Confirmar branch e estado do Git.
2. Ler `README.md` e instruções locais.
3. Ler integralmente o handoff de inteligência.
4. Inspecionar as duas referências positivas.
5. Identificar tokens, classes e fluxos existentes antes de criar novos.
6. Rodar o validador.
7. Reproduzir os bugs relatados.

### Durante

- uma responsabilidade por commit;
- nenhuma reescrita mecânica ampla sem necessidade;
- preservar alterações não relacionadas do autor;
- evitar dependências e frameworks novos;
- preferir CSS/JS existentes e componentes pequenos;
- comparar nas três larguras após cada vertical slice;
- não esconder conteúdo para “animar entrada”;
- registrar qualquer divergência entre referência visual e verdade clínica.

### Antes de concluir

- rodar validador;
- inspecionar `git diff`;
- capturar três viewports;
- testar teclado e toque;
- comparar com referências;
- listar pedidos ao track de inteligência;
- listar pedidos recebidos e o estado de cada um;
- declarar o que permanece pendente por decisão do autor;
- não fazer merge ou publicar.

### Relatório final obrigatório

- branch, HEAD inicial e HEAD final;
- arquivos alterados e motivo;
- critérios de aceite aprovados/reprovados;
- screenshots por viewport;
- bugs reproduzidos e corrigidos;
- regressões conhecidas;
- decisões visuais tomadas;
- objeções recebidas do track de inteligência;
- `PEDIDO AO TRACK DE INTELIGÊNCIA` no formato da seção 12;
- mudanças na zona compartilhada, se houver;
- confirmação de que `main` não foi alterada.

---

## 17. Taxonomia de evidência deste documento

### Decisões explícitas do autor

- a frase dos quatro verbos;
- o preceptor calmo que não toma o lápis;
- a bancada que cabe no bolso;
- o celular como bancada;
- mobile, iPad e desktop com igual competência;
- ausência de pontos, medalhas, ranking e confete;
- rejeição de julgamento durante a tarefa;
- menos vermelho e correção com contraste sutil;
- Bancada como prioridade;
- duas capturas anexas como direção positiva;
- rejeição da versão literal com luminária, madeira, papel rasgado e serifa;
- frontend em branch separada, sem tocar `main`;
- ChatGPT como maestro do frontend e track de inteligência como maestro clínico/pedagógico.

### Verificado no handoff de inteligência

- stack e superfícies atuais;
- estruturas de dados e campos;
- existência de Freio, confiança e repetição espaçada;
- pedidos de múltiplas derivações, batimento prematuro, traçado nas questões, limite da tira e espícula;
- regras físicas de `--mm`, SVG e amostragem temporal;
- limites de conteúdo e títulos que entregam diagnóstico;
- regra de que campos novos devem ser aditivos e opcionais.

### Observado nas referências visuais aprovadas

- navegação lateral desktop;
- Bancada com papel dominante;
- medição de 188 ms e alvo de 162 ms;
- correção em verde/ciano/cobre restrito;
- feedback abaixo do papel;
- fechamento em duas colunas;
- ação primária no bloco do preceptor;
- baixa dependência de cards.

### Relatado por auditoria anterior — reconfirmar

- conteúdo temporariamente invisível por animação;
- overflow horizontal;
- Freio vazio;
- persistência silenciosa;
- questões sem traçado apesar de imports disponíveis;
- estado zero fraco em Desempenho.

### Inferências abertas à contestação

- ordem das fases de frontend;
- tokens exatos de cor;
- mapeamento Hoje/Trilha;
- nomes conceituais dos componentes;
- pedido de âncoras estruturadas de evidência;
- orçamentos de texto;
- Source Serif restrita a narrativa sobre papel.

O autor prefere contestação com evidência a concordância automática.

---

## 18. Primeira resposta esperada da nova sessão

A sessão que receber este documento não começa codando. Ela responde primeiro, de forma curta, com:

1. raiz Git, branch e HEAD encontrados;
2. confirmação de que não está em `main`;
3. arquivos de instrução aplicáveis;
4. status do worktree;
5. status do validador;
6. quais referências visuais foram realmente abertas;
7. quais achados P0 foram reproduzidos;
8. qual será o primeiro bloco pequeno e verificável.

Se estiver em `main`, se as referências não estiverem disponíveis ou se o worktree tiver alterações conflitantes, a sessão para e pede direção. Ela não improvisa uma saída.

---

*Documento sintetizado em 05/08/2026 para espelhar o contrato de conteúdo e inteligência. Ele orienta exclusivamente a branch experimental de frontend e não autoriza alterações na branch `main`.*
