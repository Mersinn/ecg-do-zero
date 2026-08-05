# ECG do Zero — Contrato de trabalho
### Conteúdo, inteligência pedagógica e interface

---

## 0. Como usar este documento

Este arquivo mora na **raiz do repositório** e é lido automaticamente a cada sessão: como `CLAUDE.md` pelo Claude Code, como `AGENTS.md` pelo Codex. Se os dois nomes existirem com o mesmo conteúdo, qualquer uma das duas ferramentas abre a sessão já sabendo de tudo. **Você não precisa colar nada.**

Este documento é **auto-suficiente**. Onde um fato foi verificado por leitura direta de arquivo, ele vem com caminho e linha. Onde é inferência ou relato não confirmado, vem marcado. **Não invente o que não está aqui — leia o repositório.**

> **Documento de interface.** Se existir um arquivo `INTERFACE.md` na raiz deste repositório, ele foi escrito por outra IA e trata de front-end, layout, tipografia e aparência. **Leia-o antes de trabalhar de chapéu B.** Onde ele contrariar a seção 2 (a raiz) ou a seção 9 (regras invioláveis) deste arquivo, este arquivo ganha.

O autor trabalha com duas frentes ao mesmo tempo: **conteúdo/inteligência** e **front-end/interface**. Uma parte do material de interface pode vir escrita por outra IA, em documento separado. A seção 8 diz como as duas frentes convivem dentro de uma mesma sessão sem se atropelarem.

---

## 0.1 Setup operacional — faça isto ANTES de qualquer outra coisa

**Onde você está.** Você está dentro do clone local do repositório `ecg-do-zero`, na máquina do autor. O trabalho acontece numa **branch de conteúdo separada da linha principal**, para que ele possa ver as mudanças sem afetar `master`. No momento em que este documento foi escrito, o remoto tinha **apenas `master`** — qualquer branch de trabalho é local e ainda não foi empurrada.

**Primeiros comandos, nesta ordem:**

```bash
git status                  # confirme que a árvore está limpa
git branch -a               # veja quais branches existem, local e remoto
git log --oneline -8        # veja o que já foi feito
```

**Decida a branch assim, sem perguntar:**

- Se você **já está** numa branch que não é `master` e a árvore está limpa → **trabalhe nela**. Diga ao autor em qual branch está e siga.
- Se você está em `master` → **crie a branch de trabalho antes de escrever qualquer linha**:
  ```bash
  git switch -c reforma/quarto-verbo
  ```
- Se a árvore estiver suja → **pare e pergunte.** Nunca commite trabalho que você não fez.

**Uma branch só.** Como a mesma sessão faz as duas frentes, não há motivo para duas branches — a separação vive no commit, não no branch (seção 8). Se um dia o autor quiser separar, os commits já estão etiquetados por prefixo e o corte é trivial.

**Ritmo de commit.** Um commit por bloco de conteúdo coerente, com mensagem em português que o autor entenda sem ler o diff. Ele não programa — a mensagem é o resumo executivo dele. Exemplos:

```
conteudo: acrescenta operacao reconhecer_insuficiencia e 9 questoes que a treinam
conteudo: campo oQueEstaTiraNaoResponde nos 27 padroes
conteudo: caso de AESP — o ECG mostra ritmo e nao faz o diagnostico
conteudo: reescreve os 18 titulos de caso para nao entregarem o diagnostico
tools: verificar.py passa a exigir proporcao minima por operacao e movimento
interface: carrega as tres fontes e corrige o tracking do h1
interface: aba ativa passa a rolar para dentro da faixa visivel no celular
```

**O prefixo é obrigatório** e é o que mantém as duas frentes legíveis num histórico só: `conteudo:`, `interface:`, `tools:`.

**Nunca commite** sem antes rodar `python tools/verificar.py` e ele sair com código 0.

**Não empurre e não abra PR** sem o autor pedir. Ele revisa localmente primeiro.

**Para ver o resultado no navegador** (módulos ES não abrem por `file://`):

```bash
python -m http.server 8000
# depois abra http://localhost:8000
```

**Se você tiver dúvida sobre em que branch ou em que escopo está: pergunte antes de escrever.** Um arquivo de conteúdo escrito na branch errada custa cinco minutos para desfazer; um arquivo de CSS tocado por engano custa um conflito de merge com a outra trilha.

---

## 1. Quem você é nesta sessão

Você é responsável pelo projeto inteiro, mas **usa dois chapéus e nunca os dois ao mesmo tempo**. Antes de qualquer bloco de trabalho, declare em uma linha qual chapéu está usando. Isso não é formalidade: é o que impede uma decisão de aparência de contaminar uma decisão clínica, e vice-versa.

### Chapéu A — CONTEÚDO E INTELIGÊNCIA  (o padrão; comece sempre por aqui)

**É seu:**
- os 27 padrões da biblioteca — critérios, pivôs, distratores, pegadinhas, condutas
- as 46 questões — enunciado, alternativas, gabarito, comentários, fontes
- os 18 casos clínicos — cenário, decisões, movimentos de erro, fechamento
- os 9 módulos e os 27 roteiros de leitura guiada
- o modelo cognitivo: quais operações mentais o material treina e em que proporção
- a taxonomia de erro diagnóstico
- a rastreabilidade das fontes
- o validador `tools/verificar.py` — estendê-lo para cobrir o que você criar

**Arquivos deste chapéu:** `src/js/data/**`, os campos clínicos de `src/js/ecg/library.js`, `tools/verificar.py`.

**Enquanto usa este chapéu, você NÃO abre** `src/css/**` nem `index.html`. Se aparecer a vontade de "só ajeitar um espacinho", anote e siga — isso vira item da lista de interface.

### Chapéu B — FRONT-END E INTERFACE  (só depois que o conteúdo do bloco estiver fechado)

**É seu:** `src/css/**`, `index.html`, tokens, tipografia, layout, responsividade, e a ligação em `src/js/app.js` e `src/js/screens/**` que faz o dado novo aparecer na tela.

**Enquanto usa este chapéu, você NÃO reescreve texto clínico.** Se o texto não couber no layout, o layout cede — ou você tira o chapéu, volta ao A, e reescreve o texto como decisão de conteúdo, declarando isso.

### Zona compartilhada, mexer só com cuidado explícito

`src/js/ecg/engine.js` — só se um padrão novo exigir uma forma de onda que o motor não sabe sintetizar, e aí a mudança é **aditiva, nunca destrutiva**. `src/js/ecg/library.js` é dado clínico (chapéu A), mas o motor lê dele: mudar a *forma* de um campo é decisão dos dois chapéus juntos.

### A ordem, que não se inverte

**Conteúdo primeiro, interface depois — sempre, em cada bloco.** O conteúdo não depende da interface para existir; a interface depende do conteúdo para saber o que mostrar. Fazer o inverso é desenhar uma caixa e depois espremer a medicina dentro dela, que é exatamente como o projeto chegou onde chegou.

---

## 2. A raiz — autoridade máxima sobre tudo

O autor do projeto definiu a essência em uma frase, dita na voz do aluno que terminou o curso:

> **"Eu sei por onde começar. Sei o que procurar. Consigo mostrar no traçado por que cheguei a essa conclusão — e sei reconhecer quando ainda não tenho certeza."**

Isto não é inspiração. **É a especificação.** Toda decisão de conteúdo se submete a ela, e a pergunta de aceitação de qualquer coisa que você escrever é: *qual dos quatro verbos isto serve, e como?*

Três raízes conectadas, também definidas pelo autor:

1. **A transformação interna** — a frase acima.
2. **A relação pedagógica** — *"um preceptor calmo diante de uma bancada clínica. Ele coloca o papel sob a luz, não toma o lápis da mão do estudante, e pergunta: o que você vê primeiro? Onde está a evidência? O que isso permite concluir?"*
3. **A imagem simbólica** — *"uma bancada de trabalho clínico que cabe no bolso."*

**O preceptor nunca toma o lápis** significa, em conteúdo:
- não revelar antes da tentativa;
- não transformar pista em resposta disfarçada;
- não concluir pelo estudante;
- não premiar apenas o acerto;
- não tratar erro como resultado vermelho;
- não usar confiança visual para esconder incerteza clínica.

**Quando há erro, o material responde em três movimentos, nesta ordem:**
> **Você observou isto** → **o raciocínio desviou aqui** → **esta evidência muda a conclusão.**

O primeiro movimento nomeia o que o aluno acertou, mesmo quando o resultado foi erro. O segundo localiza o desvio **no traçado**, não no gabarito. O terceiro mostra a consequência clínica. Sem o terceiro, a correção é aritmética; com ele, vira memória.

**Uma regra de tempo, decidida nesta sessão e validada pelo autor:**
> **Durante a tarefa o sistema REGISTRA. Depois da tarefa o sistema JULGA.**

Nada que classifique o aluno (`frágil`, calibração de confiança, percentual de acerto) aparece no meio do exercício. Durante, só o que é factual e cumulativo: a evidência que ele já sustentou. O julgamento vive no fechamento e na tela de desempenho. O autor rejeitou explicitamente uma proposta que mostrava "acerto frágil" durante a tarefa, com a palavra: *"essa parte eu acho que é too much."*

**Voz da interface** — o autor deu os três exemplos calibradores:
- ❌ *"Excelente! Você arrasou!"* — artificial
- ❌ *"Resposta incorreta"* — frio e insuficiente
- ✅ *"Volte ao início da onda P. Seu marcador passou do começo do QRS."* — pertence ao produto

---

## 3. O produto

**Repositório:** `github.com/Mersinn/ecg-do-zero` · licença MIT · publicado em GitHub Pages.
**O que é:** curso interativo de eletrocardiograma para estudantes de medicina do ciclo clínico, feito para quem nunca leu um ECG e precisa chegar ao nível de decisão clínica.
**Autor:** Emerson, estudante de medicina no P6 (6º semestre), Brasil. **Ele não programa** — constrói dirigindo ferramentas de IA. Força dele: escrita, direção de arte e ideias. Escreve e pensa em **português do Brasil**, e espera respostas diretas, sem bajulação, ancoradas em evidência, com separação clara entre o que foi verificado e o que é inferência. Ele é o primeiro usuário do produto: o site resolve uma necessidade que ele mesmo tem.

**Stack:** HTML + CSS + JS puro, módulos ES, **sem build, sem backend, sem cadastro**. Progresso em `localStorage`.

**Como rodar:** precisa ser servido por HTTP (módulos ES). `python -m http.server 8000`.

**Honestidade declarada do projeto, que não se negocia:** os traçados são **sintéticos**, gerados por equações a partir de parâmetros clínicos, para ensinar a morfologia de cada padrão. Não são registros de pacientes. Todo material novo mantém esse aviso e essa postura.

**As nove telas:** Método (a sequência de 9 passos), O papel (calibração), Anatomia, Localizar (parede do infarto e bloqueios AV), Módulos (os 27 padrões), Bancada (gerador, eixo elétrico, paquímetro), Plantão (18 casos), Questões (46), Desempenho (progresso e repetição espaçada).

> ⚠️ A arquitetura de informação pode mudar no track de interface — há uma proposta de reorganizar em **Hoje / Trilha / Atlas / Bancada / Plantão / Desempenho**. Isso não altera o conteúdo, só onde ele mora. Escreva conteúdo agnóstico de tela.

---

## 4. Mapa de dados — VERIFICADO por leitura direta

```
src/js/data/lessons.js         MODULOS[9], ROTEIROS{27}, moduloDaFamilia, ordemDidatica, roteiroDe
src/js/data/lessons-patch.js   PATCH_MODULOS{9}, PATCH_ROTEIROS, aplicarPatchModulos, aplicarPatchRoteiros
src/js/data/questions.js       QUESTOES[46], acharQuestao, questoesComTracado, questoesPorFamilia
src/js/data/cases.js           CASOS[18], MOVIMENTOS{6}, TOTAL_DECISOES=67, casoPorId, casosComTracado, casosPorFamilia
src/js/ecg/library.js          FAMILIAS{9}, PADROES{27}, PASSOS[9], chavesPorFamilia, listarPadroes, montarRitmo
src/js/ecg/engine.js           síntese de forma de onda + renderização SVG
src/js/store.js                progresso e repetição espaçada
tools/verificar.py             validador estrutural, sai com código 1 em erro
```

### Campos de cada estrutura (exatos)

**`PADROES[chave]`**
`nome, familia, nivel, derivacao, ritmo, leitura, dx, pivo, conduta, distrator, pegadinha, alternativas`

**`QUESTOES[i]`**
`id, familia, padrao, nivel, operacao, comandoInvertido, enunciado, alternativas, correta, porQue, porQueErradas, variavelDecisiva, pegadinha, fonte`
→ **5 alternativas** em todas as 46. `correta` é índice. `porQueErradas` está completo nas 46.

**`CASOS[i]`**
`id, titulo, familia, nivel, cenario, queixa, dados, padrao, notaTracado, decisoes, fechamento, card`

**`CASOS[i].decisoes[j]`**
`pergunta, alternativas, correta, variavelDecisiva, porQue, porQueSeduz, movimento`

**`ROTEIROS[chave][k]`** (paradas da leitura guiada)
`foco, tMs, titulo, texto` — 4 ou 5 paradas por padrão, nos 27.

**`MODULOS[i]`**
`familia, titulo, promessa, porQueImporta, fisiopatologia, comoLer, ancoras, errosComuns, ordemSugerida`

### As 9 famílias e os 27 padrões

| Família | n | chaves |
|---|---|---|
| Fundamentos | 3 | `normal, bradicardia, taquiSinusal` |
| Sobrecargas | 3 | `sobrecargaAD, sobrecargaAE, sve` |
| Bloqueios AV | 4 | `bav1, mobitz1, mobitz2, bavt` |
| Bloqueios de ramo | 2 | `brd, bre` |
| Taquiarritmias | 5 | `tsv, fa, flutter, tv, torsades` |
| Ritmos de parada | 2 | `fv, assistolia` |
| Isquemia e infarto | 3 | `stemi, infraST, pericardite` |
| Eletrólitos e drogas | 2 | `hipercalemia, hipocalemia` |
| Outros padrões | 3 | `wpw, qtLongo, juncional` |

### Os 6 movimentos de erro (`cases.js → MOVIMENTOS`)

`fechamento_precoce` · `erro_de_criterio` · `inversao_de_criterio` · `erro_de_prioridade` · `erro_de_conduta` · `ancoragem`

Cada um tem texto explicativo próprio no objeto. **Esta taxonomia é o ativo intelectual mais raro do projeto** — não existe equivalente nos concorrentes (LITFL, ECGwaves, Aprenda ECG, Practical Clinical Skills). Preserve-a e estenda-a com cuidado.

### As 8 operações cognitivas (`questions.js → operacao`)

`aplicar_criterio` · `reconhecer_dx` · `conduta_inicial` · `diferenciar` · `reconhecer_contraindicacao` · `conduta_definitiva` · `interpretar_tracado` · `priorizar_emergencia`

### Mecânica de progresso (`store.js` — VERIFICADO)

- `store.js:66` → `const DEGRAUS = [1, 3, 7, 16, 35]` (dias de repetição espaçada)
- `store.js:81` → estado inicial `'nao_visto'`
- `store.js:97` → `p.estado = acertou ? (confiante ? 'solido' : 'fragil') : 'fragil'`
  **Isto é o coração da inteligência:** acertar sem confiança **não** vira sólido. O modelo já distingue acerto real de acerto frágil.
- `store.js:136` → `fragilidades()` devolve a fila do que está frágil
- `app.js:1284-1285` → o aluno declara se estava confiante; alimenta o `registrarPadrao`
- `app.js:1473-1474` → **o Freio**: antes de abrir o gabarito, o aluno escreve em uma linha o que a questão está pedindo

O Freio e a declaração de confiança são **dificuldades desejáveis** implementadas com precisão e são os dois melhores ativos pedagógicos do projeto. Qualquer proposta de "simplificar o fluxo" que os remova por parecerem fricção deve ser recusada — **a fricção é o ponto.**

---

## 5. Estado do conteúdo — números VERIFICADOS

### Cobertura

- **0** dos 27 padrões estão sem questão.
- **9** dos 27 estão **sem caso clínico**: `normal, sobrecargaAD, sobrecargaAE, bav1, mobitz1, torsades, assistolia, hipocalemia, juncional`.
- Decisões por caso: 3–4. Total **67**.

### Distribuição de nível

| | básico | intermediário | avançado |
|---|---|---|---|
| padrões (27) | 4 | 9 | 14 |
| questões (46) | 9 | 14 | 23 |

→ Metade do material é avançado, para um produto que promete servir **"quem nunca leu um ECG"**.

### Operações cognitivas nas 46 questões

| operação | n | % |
|---|---|---|
| `aplicar_criterio` | 9 | 20% |
| `reconhecer_dx` | 8 | 17% |
| `conduta_inicial` | 7 | 15% |
| `diferenciar` | 7 | 15% |
| `reconhecer_contraindicacao` | 5 | 11% |
| `conduta_definitiva` | 4 | 9% |
| **`interpretar_tracado`** | **3** | **7%** |
| `priorizar_emergencia` | 3 | 7% |

→ `comandoInvertido` em 6 de 46. **A operação central do produto — interpretar traçado — é a segunda menos treinada.**

### Movimentos de erro nas 67 decisões

| movimento | decisões |
|---|---|
| `erro_de_criterio` | **25 (37%)** |
| `erro_de_conduta` | 15 |
| `erro_de_prioridade` | 13 |
| `fechamento_precoce` | 6 |
| `inversao_de_criterio` | 5 |
| **`ancoragem`** | **3 (4,5%)** |

→ Ancoragem é o erro diagnóstico mais estudado na literatura e o mais letal na prática. É o menos treinado aqui.

### Derivações renderizadas pelos 27 padrões

`DII` → 19 · `V5` → 2 · `V1` → 2 · `V3` → 2 · `V4` → 2. **Nunca duas derivações simultâneas.**

Consequência clínica direta, e é o teto de todo o resto:
- o `pivo` do `stemi` diz *"supra de ST em duas derivações contíguas, com morfologia convexa e recíproca"* — e o traçado mostra **uma**;
- Sokolow-Lyon é citado em questão (*"S em V1 + R em V5 ou V6 ≥ 35 mm"*) e exige **V1 mais V5/V6** no mesmo traçado;
- a **recíproca** é o que separa STEMI de pericardite — que é o `distrator` declarado do próprio `stemi` — e não é mostrável em DII isolado;
- eixo elétrico exige DI **e** aVF.

### Rastreabilidade das fontes

| tipo de fonte | questões |
|---|---|
| auto-referência (`library.js`, "padrão X") | **41 / 46** |
| material do curso (Guia OSCE P6, resumos, roteiro de estágio) | 31 / 46 |
| **diretriz ou fonte externa** (SBC, AHA/ACC, ESC, tratado) | **3 / 46** |

→ O README promete: *"onde as fontes divergem entre si ou das diretrizes nacionais, o site mostra a divergência"*. O dado não sustenta essa promessa hoje.

### O quarto verbo — o achado que define a prioridade

Contagem por varredura das alternativas corretas (regex sobre *"não dá para / insuficiente / não é possível / indeterminado / repetir o exame / outra derivação / 12 derivações"*):

- **1 questão em 46** tem como resposta certa reconhecer insuficiência
- **2 decisões em 67** idem
- **4 alternativas em 230** (1,7%) sequer mencionam a possibilidade
- **0 das 8 operações** cognitivas é essa

A única questão que faz isso faz **perfeitamente**:
> *"BAV 2:1 — não é possível classificar em Mobitz I ou Mobitz II com esse traçado."*

E a frase certa **já está escrita no projeto**, uma vez: `app.js:601` → `rotuloDesvios: 'O que esta tira não responde'`.

### As 18 entidades citadas e nunca mostradas

Varredura dos campos `distrator`, `pegadinha`, `leitura`, `conduta`, `porQue`, `porQueErradas` e alternativas, cruzada contra as 27 chaves de `PADROES`. Ocorrências no corpus:

`marcapasso` 48 · `sgarbossa` 20 · `digoxina` 14 · `aberrância` 8 · `repolarização precoce` 7 · `De Winter` 7 · `tamponamento / microvoltagem` 6 · `V4R` 6 · `extrassístole` 5 · `hemibloqueio` 5 · `V3R` 5 · `ritmo de escape` 5 · `idioventricular / RIVA` 2 · `taquicardia atrial multifocal` 2 · `embolia pulmonar` 1 · `Brugada` 1 · `infarto de ventrículo direito` 1

**O material já escreveu a lista do próximo conteúdo.** A pegadinha do `bre` diz literalmente *"os critérios de Sgarbossa existem exatamente por isso"* — e não existe traçado de Sgarbossa.

Faltam ainda, por análise de currículo canônico e não por citação interna: **AESP** (a família `parada` só tem FV e assistolia), **hemibloqueios BDAS/BDPI**, **troca de eletrodos / dextrocardia**, **hipocalcemia/hipercalcemia**, **Wellens**.

---

## 6. O diagnóstico e a prioridade decidida

**Diagnóstico em uma frase:** o conteúdo é excelente e a camada de inteligência é rara — o que falta é que **três dos quatro verbos da raiz têm suporte e o quarto tem quase zero**, o que transforma o método numa máquina de produzir conclusões confiantes.

| verbo | suporte no conteúdo hoje |
|---|---|
| "Sei por onde começar" | **forte** — 9 PASSOS + 27 roteiros com 4–5 paradas |
| "Sei o que procurar" | **forte** — campo `pivo` nos 27, uma linha cada |
| "Consigo mostrar no traçado" | **parcial** — as palavras existem (`leitura`, `variavelDecisiva`); o objeto demonstrável não, por causa da derivação única |
| **"Sei reconhecer quando não tenho certeza"** | **quase zero** — 1/46, 2/67, 4/230, 0/8 |

**Por que o quarto verbo é o gargalo real:** sem ele, os três primeiros produzem um aluno que percorre o método, acha um pivô e conclui — sempre. É a máquina de produzir sensação de domínio sem domínio. **O quarto verbo é o que torna os outros três honestos.**

E ele é o mais barato: **não exige mudança no motor, nem traçado novo, nem nada do front-end.** É texto.

---

## 7. O trabalho, em ordem

### FASE 1 — O quarto verbo (prioridade máxima)

**1.1 — Estender a taxonomia.**
- Nova operação em `questions.js`: **`reconhecer_insuficiencia`**.
- Novo movimento em `cases.js → MOVIMENTOS`: **`conclusao_sem_evidencia`** — concluir além do que a tira sustenta. É o espelho de `fechamento_precoce`: aquele fecha cedo demais, este afirma forte demais.
- Escreva o texto explicativo do novo movimento no mesmo registro dos outros seis.

**1.2 — Novo campo em `library.js`, nos 27 padrões:**
```js
oQueEstaTiraNaoResponde: '…'
```
Uma a três frases, dizendo o que **este traçado, nesta derivação, não permite concluir** — e o que seria preciso para concluir. Use a frase que o projeto já cunhou (`app.js:601`). Exemplos do nível de concretude exigido:
- `bav1`: *"Esta tira mostra o PR, mas não mostra se o bloqueio é nodal ou infranodal. Isso muda a conduta e exige a resposta à atropina ou o eletrofisiológico."*
- `stemi`: *"Uma derivação não mostra contiguidade nem recíproca. Sem as 12, não dá para afirmar parede nem excluir pericardite."*
- `normal`: *"Um ECG normal não exclui síndrome coronariana aguda. Ele exclui, no máximo, o que estava acontecendo nos dez segundos do registro."*

**1.3 — De 8 a 12 questões novas**, todas com `operacao: 'reconhecer_insuficiencia'`, onde **a alternativa correta é reconhecer o limite** e os quatro distratores são diagnósticos clinicamente plausíveis. Alvos de alto rendimento:
- BAV 2:1 (já existe — use como modelo de qualidade)
- taquicardia de QRS largo regular: TV vs TSV com aberrância — sem critérios de Brugada/Vereckei aplicáveis na tira
- microvoltagem: obesidade, DPOC, derrame — a tira não decide
- FA vs flutter com condução variável em tira curta
- supra em V1–V2 isolado: repolarização precoce, Brugada, BRD, ou artefato de posicionamento
- T invertida em precordiais: Wellens, sobrecarga de VD, isquemia, ou variante normal
- bradicardia sinusal em atleta: fisiológico ou patológico — a tira não diz

**1.4 — De 4 a 6 casos novos, ou decisões novas em casos existentes, onde o acerto é PEDIR, não responder.** O ativo aqui é que a decisão certa é um pedido:
- pedir as **12 derivações**
- pedir **V3R/V4R** (infarto de VD — muda a conduta: nitrato contraindicado)
- pedir **V7–V9** (infarto dorsal)
- pedir o **ECG anterior** para comparação
- **repetir em 15 minutos** (evolução dinâmica do ST)
- **checar o pulso** — o caso de **AESP**, onde o ECG mostra ritmo organizado e **não faz o diagnóstico**. Este é o caso mais importante desta fase inteira: ensina a limitação do próprio método.
- **refazer o exame** — troca de eletrodos, tremor, artefato

**1.5 — O caso do `normal`.** Dor torácica típica, ECG normal. A decisão certa é *"normal não exclui SCA — seriar troponina e repetir o ECG"*. Movimento treinado: `conclusao_sem_evidencia` invertido — o aluno inventa patologia porque a tela pediu um diagnóstico. Hoje o Plantão só treina achar coisa; nenhum caso tem "normal" como resposta.

### FASE 2 — Escrever os padrões que o material já cita

Ordem por (rendimento clínico ÷ esforço), usando a contagem da seção 5:

1. **Repolarização precoce** — distrator declarado de `stemi` **e** de `hipercalemia`. Sintetizável com o motor atual.
2. **Extrassístoles (ESV e ESSV)** — as mais comuns de todas, base de bigeminismo/trigeminismo. Exige que o motor aceite batimento prematuro → **pedido ao track de interface** (seção 8) ou mudança aditiva em `engine.js`.
3. **Ritmo de marca-passo** — espícula e captura. Alta frequência no PS.
4. **Sgarbossa (BRE + IAM)** — citado 20 vezes. É o problema difícil, e o material promete.
5. **Hemibloqueios BDAS / BDPI** — o projeto já os usa como preset de eixo na Bancada.
6. **AESP** — família `parada` incompleta; entra junto com o caso da fase 1.4.
7. **Digitálico** — "colher de pedreiro", clássico de prova, citado 14 vezes.
8. **Baixa voltagem e alternância elétrica (tamponamento)** — citado 6 vezes.
9. **S1Q3T3 / TEP**, **Brugada**, **Wellens**, **De Winter**, **RIVA**, **TAM** — segunda onda.

Cada padrão novo precisa de: entrada completa em `PADROES` (todos os 13 campos, incluindo o novo), roteiro de leitura guiada em `ROTEIROS` com 4–5 paradas, ao menos 1 questão e, quando for de decisão, 1 caso.

### FASE 3 — Rebalancear

- **Ancoragem de 3 para ~10 decisões.** O padrão: dar ao aluno um dado que ancora (idade, comorbidade, o que o SAMU falou, o ECG anterior) e fazer o traçado dizer outra coisa.
- **`interpretar_tracado` de 3 para ~10 questões.**
- **Nível: engrossar a base.** Hoje 4 padrões básicos e 9 questões básicas para um produto que promete servir quem nunca leu um ECG. Alvo: dobrar a camada básica.
- **Preencher os 9 padrões sem caso**, começando por `normal` (fase 1.5) e `mobitz1` (Wenckebach é o padrão de raciocínio mais bonito do ECG e não tem caso).

### FASE 4 — Rastreabilidade

Substituir a auto-referência por fonte real nas 41 questões que hoje citam `library.js`. Hierarquia de fonte a adotar, em ordem:
1. Diretriz brasileira (SBC) — é o contexto de prova do autor
2. Diretriz internacional (AHA/ACC, ESC)
3. Tratado de referência
4. Material do curso — **e quando divergir de 1 ou 2, mostrar a divergência**, que é a promessa explícita do README

Exemplo que o próprio README dá: QTc normal é 450 ms (H) / 470 ms (M) pela Diretriz da SBC de 2022, e 450/460 no guia de OSCE que circula no curso. **As duas convenções existem e o aluno precisa saber disso.**

### FASE 5 — Estender o validador

`tools/verificar.py` hoje confere sintaxe, chaves órfãs, índices de gabarito, alternativas duplicadas, roteiros faltando, módulos sem família, e a regra de que a primeira parada de um roteiro guiado não entrega o diagnóstico. **Ele não valida medicina** — e continua não validando.

Acrescente checagens **estruturais** do que você criou:
- todo padrão tem `oQueEstaTiraNaoResponde` não vazio
- toda `operacao` e todo `movimento` usados existem na taxonomia declarada
- proporção mínima por operação e por movimento (falha se `ancoragem` < 8% ou `reconhecer_insuficiencia` < 10%)
- nenhum título de caso contém o nome de um padrão de `library.js` (ver seção 9)
- toda questão tem `fonte` e ao menos N% têm fonte externa

---

## 8. Como os dois chapéus convivem

**A fronteira é o dado.** O chapéu A produz e altera dado clínico; o chapéu B consome e desenha. Numa sessão só, a separação não é de branch — é de **momento e de commit**.

**Regras da convivência:**
- **Um commit nunca mistura os dois chapéus.** `conteudo: …` e `interface: …` são commits separados, mesmo que feitos no mesmo dia, na mesma branch.
- **Todo campo novo é aditivo e opcional.** A tela atual continua funcionando se ignorá-lo. Isso permite escrever conteúdo hoje e desenhar amanhã sem quebrar nada no meio.
- **Toda estrutura nova segue o formato das existentes.** Nada de campo com forma nova sem necessidade declarada.
- **Todo texto novo respeita os limites que a interface já assume:** rótulo curto é curto, `pivo` é uma frase, `pegadinha` cabe em um parágrafo.
- **Se o conteúdo exigir algo da interface, anote antes de fazer.** Não corra para o CSS no meio de um bloco de conteúdo — termine o bloco, feche o commit, troque de chapéu, e aí implemente a lista inteira de uma vez. Trocar de chapéu no meio de um raciocínio é como a interface acaba dirigindo a medicina.

**Formato da anotação** (mantenha uma lista viva em `NOTAS-INTERFACE.md` na raiz, ou no relatório final):

```
PEDIDO DE INTERFACE
o quê:        renderizar 2 derivações simultâneas empilhadas (DII + V1)
por quê:      o pivô do stemi exige contiguidade e recíproca; Sokolow-Lyon exige V1+V5
o que muda:   PADROES[k].derivacao passa a aceitar array de strings
sem isso:     3 padrões e 6 questões ficam clinicamente incompletos
prioridade:   alta
```

**Pedidos já identificados, para você detalhar e executar quando estiver de chapéu B:**

1. **Múltiplas derivações simultâneas** — desbloqueia contiguidade, recíproca, eixo, Sokolow-Lyon, localização de parede. É o teto do verbo 3. `PADROES[k].derivacao` viraria array.
2. **Batimento prematuro no motor** — desbloqueia extrassístoles, bigeminismo, RIVA, TAM.
3. **Questões que desenham o traçado** — 35 das 46 questões apontam para um padrão que existe em `library.js` e nenhuma renderiza a tira; `app.js:9-10` já importa `montarRitmo` e `renderizarTira`, então é ligação, não construção.
4. **Um lugar na tela para `oQueEstaTiraNaoResponde`** — deve aparecer **depois** da tentativa, junto do fechamento, nunca antes.
5. **Espícula de marca-passo** no motor.

**Se existir um documento de interface escrito por outra IA**, ele traz decisões que afetam **onde** o conteúdo aparece — a arquitetura Hoje/Trilha/Atlas/Bancada/Plantão/Desempenho, a coluna persistente do preceptor, a regra "instrumento antes / professor depois". Leia-o antes de escrever texto que dependa de posição na tela, e **escreva conteúdo que sobreviva a qualquer uma das arquiteturas**. Onde ele contrariar a seção 2 ou a seção 9 deste documento, **este documento ganha** — ele carrega a raiz dita pelo autor.

---

## 9. Regras invioláveis

1. **O conteúdo clínico é sagrado.** Em conflito entre uma solução elegante e a correção clínica, a correção ganha, sempre, sem discussão.
2. **Nada acima do traçado entrega o traçado.** Hoje **18 de 18 títulos de caso nomeiam o achado antes de o aluno ver a tira** — e `plantao.js:270` renderiza esse título como `<h1>`. O caso `c01` tem o campo `variavelDecisiva` dizendo que o que importa *"não é o número 138 no monitor"*, e o título é *"Taquicardia de 138 bpm em paciente séptico"*. **Reescreva os 18 títulos** para sintagma nominal sem diagnóstico (idade, queixa, contexto), e mova o nome do padrão para o `fechamento`.
3. **O mesmo vale para os 27 cards de Módulos**, que hoje trazem o critério diagnóstico no subtítulo.
4. **Traçado sintético é declarado como sintético.** Todo material novo mantém o aviso.
5. **Erro nunca é vermelho** no vocabulário do material. O vermelho já significa duas coisas neste produto: a grade do papel de ECG e o limiar do normal. Se precisar de cor para erro, peça ao track de interface — não invente no texto.
6. **Sem pontos, medalhas, ranking, sequência ou confete.** A recompensa é a fila vencida e o estado de domínio. Decisão do autor.
7. **Não remova fricção pedagógica.** O Freio e a declaração de confiança ficam.
8. **`--mm` é a escala física única** do projeto, declarada em CSS e lida pelo JS em `app.js:71`, `tools.js:305/868/1123` e `papel.js:38`. Nunca duplique nem hardcode milímetro.
9. **Pintura do SVG por classe, nunca por atributo de apresentação.** `var()` dentro de atributo SVG não é confiável no Chromium, e o alvo inclui Chrome no Android. Se mexer em `engine.js`, mantenha a disciplina.
10. **A síntese amostra no domínio do tempo, com passo de 1 ms** — nunca por pixel. Amostrar por pixel faz o passo saltar o pico do R e renderiza batimentos com metade da voltagem, imitando alternância elétrica. Um artefato ensinando um padrão errado.

---

## 10. Critérios de aceite

Cada um se responde com sim ou não, rodando um script ou lendo o dado.

1. **Verbo 4 existe.** Ao menos **12% das questões** e **12% das decisões de caso** têm como resposta certa reconhecer insuficiência ou pedir mais informação. *(Hoje: 2,2% e 3%.)*
2. **Os 27 padrões respondem o que não respondem.** `oQueEstaTiraNaoResponde` não vazio em 27/27.
3. **Nenhum título entrega o diagnóstico.** Cruzar os 18 títulos de caso e os 27 subtítulos de card contra os nomes de `PADROES`: **interseção zero**.
4. **Ancoragem treinada.** `ancoragem` ≥ 8% das decisões. *(Hoje: 4,5%.)*
5. **A operação central é treinada.** `interpretar_tracado` + `reconhecer_insuficiencia` ≥ 25% das questões. *(Hoje: 7%.)*
6. **A base aguenta um iniciante.** Ao menos 8 padrões e 18 questões de nível `basico`. *(Hoje: 4 e 9.)*
7. **Todo padrão tem caso.** 0 dos 27 sem caso clínico. *(Hoje: 9 sem.)*
8. **Fonte é fonte.** Nenhuma questão cita `library.js` como fonte; ao menos 60% citam diretriz ou tratado, com edição e ano.
9. **O validador cobre o novo.** `python tools/verificar.py` sai com 1 se qualquer critério estrutural acima for violado.
10. **A raiz é rastreável.** Cada bloco novo de conteúdo declara, em comentário ou campo, **qual dos quatro verbos ele serve**.

---

## 11. Como trabalhar

**Comece lendo, não escrevendo.** Nesta ordem:
1. `README.md` — a postura do projeto está lá
2. `src/js/ecg/library.js` — os 27 padrões inteiros
3. `src/js/data/cases.js` — comece pelo objeto `MOVIMENTOS`, depois 3 casos completos
4. `src/js/data/questions.js` — 5 questões completas, incluindo a de BAV 2:1
5. `src/js/data/lessons.js` — 2 módulos e 2 roteiros
6. `src/js/store.js` — inteiro, é curto e é o modelo cognitivo

**Rode o validador antes e depois de cada bloco:** `python tools/verificar.py`

**Trabalhe em blocos pequenos e verificáveis.** O autor não programa: entregue mudanças que ele consiga entender lendo o diff em português. Comente decisões clínicas no próprio dado, como o projeto já faz.

**Não peça permissão para escrever conteúdo dentro do escopo das fases 1 a 5.** Peça, sim, antes de: mudar a forma de uma estrutura existente, mexer em `engine.js`, remover qualquer coisa, ou tomar decisão clínica em que as fontes divirjam e você não tenha como resolver.

**Ao terminar, entregue um relatório com:** o que mudou por arquivo, os números dos critérios de aceite antes e depois, as decisões clínicas tomadas com fonte, as divergências de fonte encontradas e como foram apresentadas, e a lista de **PEDIDOS AO TRACK DE INTERFACE** no formato da seção 8.

---

## 12. Taxonomia de evidência deste documento

**Verificado por leitura direta de arquivo nesta sessão** (confie, mas confirme se for reescrever): toda a seção 4; todos os números da seção 5; `store.js:66/81/97/136`; `app.js:601`, `app.js:9-10`, `app.js:1284-1285`, `app.js:1473-1474`; `plantao.js:270`; a distribuição de derivações, operações, movimentos, níveis e cobertura; a contagem de fontes; a contagem do quarto verbo; a varredura das 18 entidades citadas.

**Relatado por agentes de auditoria e NÃO reconfirmado por mim** — trate como pista, verifique antes de agir: as 35 de 46 questões que apontam para padrão sem desenhar o traçado; `app.js:1443` sorteando questão com `Math.random()` puro sem consultar histórico; `app.js:1451-1465` montando enunciado sem chamar o motor; as métricas de CSS e de layout (não são do seu escopo de qualquer forma).

**Decisões do autor, ditas por ele** — não são inferência, são instrução: a raiz de quatro verbos; o preceptor que não toma o lápis; os três movimentos do erro; a bancada que cabe no bolso; mobile-first nunca mobile-only com equivalência de competência; sem pontos/medalhas/ranking; "acerto frágil durante a tarefa é too much"; front-end fica com a outra trilha, conteúdo e inteligência ficam com você.

**Inferência minha, aberta a contestação:** que o quarto verbo é a prioridade máxima; a ordem das fases; a ordem de rendimento dos padrões novos; os números específicos dos critérios de aceite. Se você discordar com argumento e evidência, **discorde** — o autor prefere isso a concordância.

---

## 13. O que não decidir sozinho

Leve ao autor, com as opções e o custo de cada uma:
- qualquer mudança na taxonomia dos 6 movimentos além do acréscimo do sétimo
- remover ou reescrever conteúdo clínico existente que esteja correto (o material já tem muita coisa bem feita — o autor pediu explicitamente que isso fosse reconhecido, e não tratado como se estivesse tudo errado)
- adotar uma convenção clínica quando SBC e AHA/ESC divergirem e a divergência mudar conduta
- qualquer coisa que aumente o tempo até o aluno ver o primeiro traçado

---

*Documento gerado a partir de auditoria direta do repositório em 05/08/2026. Contexto de origem: sessão que auditou o front-end, os 27 padrões, as 46 questões, os 18 casos e os 67 pontos de decisão, e que definiu com o autor a raiz de quatro verbos como especificação.*
