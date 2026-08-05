# Notas de interface — o que ficou fora do escopo

Lista viva. Cada item foi **encontrado e verificado** durante o trabalho de
interface, e deixado de fora de propósito: ou porque pertence ao outro chapéu,
ou porque depende de decisão do autor, ou porque não cabe no bloco em curso.

O formato dos pedidos é o da seção 8 do `CLAUDE.md`.

Última atualização: 05/08/2026, durante o Bloco 0 (branch `reforma/ecg-v2`).

---

## 1. CSS que mora dentro do JavaScript — ~350 linhas

**Verificado.** A consolidação de tokens do Bloco 0 alcança `src/css/app.css` e
`src/css/refino.css`. Mas o projeto tem **quatro** fontes de CSS, não duas:

| onde | como | tamanho |
|---|---|---|
| `src/css/app.css` | folha | ~1060 linhas |
| `src/css/refino.css` | folha | ~1430 linhas |
| `src/js/screens/papel.js:56-170` | `<style>` numa constante `ESTILO` | ~114 linhas |
| `src/js/anatomy.js` | `document.createElement('style')` em `anatomy.js:725` | ~220 linhas |

Consequência prática: `--ecg-destaque`, definido em `app.css:198`, é consumido
**só** dentro do `anatomy.js`. Quem for procurar onde o token é usado não acha
por busca no `src/css/`.

Os tokens continuam funcionando porque vivem em `:root` e as folhas embutidas
leem de lá. O que não funciona é a *auditoria*: não dá para dizer "a paleta está
em um lugar só" enquanto duas telas trouxerem a própria folha.

**Proposta, para um bloco futuro:** mover os dois blocos para
`src/css/`, mantendo o comportamento. Nenhum dos dois usa valor calculado em JS
— são strings estáticas. É um recorta-e-cola verificável, mas mexe em dois
arquivos da zona compartilhada e não pertence ao Bloco 0.

---

## 2. Oito caracteres caem no fallback de sistema

**Verificado glifo a glifo com fontTools, contra as quatro fontes de
`assets/fonts/`.** O subset latin não traz oito caracteres que o material usa.
Contagem no código:

| caractere | ocorrências | onde |
|---|---|---|
| `≥` U+2265 | 31 | `cases.js`, `questions.js`, `library.js`, `localizar.js` |
| `→` U+2192 | 25 | `app.css`, `cases.js`, `lessons.js`, `library.js`, `papel.js`, `anatomy.js`, `app.js` |
| `₂` U+2082 | 24 | `cases.js`, `questions.js`, `library.js` |
| `≤` U+2264 | 5 | `cases.js`, `questions.js`, `library.js` |
| `←` U+2190 | 4 | `app.js` |
| `′` U+2032 | 3 | `cases.js` |
| `≈` U+2248 | 2 | `library.js`, `papel.js` |
| `²` U+00B2 | 1 | `cases.js` |

O fallback é automático e caractere a caractere: **o texto continua correto**,
e a acentuação pt-BR está completa nas quatro fontes. O que muda é o desenho de
oito símbolos, que vêm da fonte de sistema no meio da frase.

Onde isso mais aparece é em limiar clínico — `PR ≥ 200 ms`, `S em V1 + R em V5
≥ 35 mm` — que é justamente onde a troca de desenho no meio de uma medida é
visível.

```text
PEDIDO AO AUTOR
o quê:        subset das fontes incluindo U+2190 U+2192 U+2032 U+2082
              U+00B2 U+2248 U+2264 U+2265
por quê:      95 ocorrências de notação clínica caem hoje na fonte de sistema
o que muda:   os quatro .woff2 são regerados com o range estendido; o custo é
              de poucas centenas de bytes por arquivo
sem isso:     oito símbolos, quase todos em limiar clínico, mudam de desenho no
              meio da frase
prioridade:   baixa — é acabamento, não correção
```

---

## 3. A paleta existe em triplicata

**Verificado.** As mesmas cores estão declaradas três vezes:

1. `app.css` `:root` — a paleta **clara**, dentro de `@layer tokens`;
2. `refino.css:1355` `:root` — a paleta **escura**, na mesma camada, no fim do
   arquivo, e por isso é ela que vence e é a que o site usa;
3. `refino.css:1401` `:root[data-tema="claro"]` — a paleta clara **de novo**,
   quase idêntica à primeira.

Ou seja: os ~40 tokens de cor do `app.css` estão mortos hoje. O site nasce
escuro (`index.html` declara `color-scheme: dark`), e quem quiser o tema claro
recebe a cópia número 3, não a número 1.

Além disso o bloco `.monitor` está declarado **duas vezes dentro do próprio
`app.css`** (linhas ~935-985 e ~1003-1039), com dois `@keyframes bater`
conflitantes; vence o segundo.

Isto é exatamente o alvo do item 3 do Bloco 0 e vai ser resolvido lá. Fica
registrado porque a consolidação precisa decidir **se o tema claro continua
existindo** — hoje ele é código que ninguém executa.

---

## 4. Nove abas contra cinco destinos

**Pendente de decisão do autor** (INTERFACE.md §8 já registra como pendente).

O código tem nove abas (`app.js:545-555`): Método, O papel, Anatomia, Localizar,
Módulos, Bancada, Plantão, Questões, Desempenho.

As imagens V3 aprovadas mostram **cinco** destinos, numa barra inferior no
celular e numa trilha lateral com ícones no iPad e no desktop: Hoje, Trilha,
Bancada, Plantão, Desempenho.

Medido em Chrome headless, com as nove abas atuais e a fonte nova:

| viewport | transbordo da faixa | abas cuja aba ativa fica fora da faixa visível |
|---|---|---|
| 390 | 419 px | **5 de 9** — Módulos, Bancada, Plantão, Questões, Desempenho |
| 834 | 77 px | 1 de 9 — Desempenho |
| 1440 | 0 px | nenhuma (a trilha é vertical) |

O item 6 do Bloco 0 resolve o sintoma com `scrollIntoView`. Não resolve a
pergunta de arquitetura, que é do autor: **cinco ou seis destinos, e onde moram
Atlas e Questões.**

---

## 5. O botão Voltar do navegador não navega entre telas

**Verificado.** `app.js` usa `history.replaceState` (`app.js:1646`) e **não
registra nenhum ouvinte de `hashchange` nem de `popstate`** — confirmado por
busca no arquivo inteiro.

Consequências:

- o aluno que aperta Voltar sai do site em vez de voltar uma tela;
- um link compartilhado com `#plantao` funciona na carga, mas trocar o hash
  depois não faz nada;
- foi o que quebrou a primeira versão do meu próprio script de medição, que
  trocava telas mexendo em `location.hash`. Só funciona clicando na aba.

Não é do Bloco 0 e não é bug de aparência — é comportamento de navegação, e
mexe em `app.js`, que é zona compartilhada.

```text
PEDIDO AO TRACK DE INTELIGÊNCIA / AO AUTOR
o quê:        decidir se a navegação entre telas entra no histórico
por quê:      o Voltar do celular é o gesto mais usado que existe, e hoje ele
              tira o aluno do site no meio de um caso
o que muda:   replaceState vira pushState e app.js passa a ouvir popstate
sem isso:     Voltar abandona a tarefa em vez de desfazer o último passo
prioridade:   média — mas alta no celular
```

---

## 6. `--p-preto: 800` não existe na fonte nova

**Verificado.** `app.css` declara `--p-preto: 800`, e a Instrument Sans variável
vai só até `wght 700`. Um pedido de 800 é limitado a 700 pelo navegador.

Sem efeito visível hoje, porque **nenhum seletor usa `--p-preto`**. O token cai
na consolidação do item 3.

Na mesma linha: `refino.css` pede pesos 640, 650 e 660 em cinco lugares. Com a
fonte de sistema esses valores eram arredondados para o mesmo desenho — era o
defeito que o próprio comentário do arquivo descreve. Com a Instrument Sans
variável eles agora **rendem peso real e intermediário**, o que é uma melhora
acidental, mas deixa a escada de pesos com oito degraus em vez dos cinco que o
`app.css` documenta. Alinhar isso é item 3.

---

## 7. Nenhuma das fontes tem itálico

**Verificado.** As quatro faces são `font-style: normal`. O `app.css:298`
declara `em { font-style: italic }` e o rodapé do `index.html` usa
`<em>issue</em>`.

O navegador sintetiza uma oblíqua inclinando a face reta. É aceitável e é o
comportamento padrão, mas não é itálico desenhado. Se o itálico virar recurso
tipográfico de verdade em alguma superfície, precisa de arquivo próprio.

---

## 8. `line-height: 1.03` no `h1`

**Observado no espécime, não corrigido.** Medido na Instrument Sans peso 700:
o til do `ã` sobe até 0,742 em acima da linha de base, praticamente a altura de
maiúscula. Num `h1` de duas ou três linhas com `line-height: 1.03`
(`refino.css:158`), o til da linha de baixo passa perto do descendente da linha
de cima — em "Ler ECG é seguir uma / ordem, **não** ter um dom." o til do "não"
corre sob o `g` de "seguir".

Não colide, mas é apertado. O item 2 do Bloco 0 mexe só em `letter-spacing`;
`line-height` fica para quem for reencaixar a escala tipográfica no item 3.

---

## 9. Achados do INTERFACE.md §10 ainda não reproduzidos

O INTERFACE.md §10 lista seis achados marcados **RELATADOS — REVERIFICAR**.
Destes, só um foi tocado até aqui:

| achado | estado |
|---|---|
| P1 rolagem horizontal do documento | **não reproduzido** — medido 0 px de transbordo nos três viewports, antes e depois do item 1 |
| P0 conteúdo invisível por `opacity: 0` | não verificado ainda |
| P0 Freio aceita vazio | não verificado ainda |
| P1 `salvar()` engole erro | não verificado ainda |
| P1 questões sem traçado | não verificado ainda |
| P2 Desempenho em estado zero | não verificado ainda |

O overflow horizontal, que era P1, parece já ter sido resolvido pelas guardas
de `min-width: 0` do `refino.css`. Os outros cinco continuam de pé e não
pertencem ao Bloco 0.
