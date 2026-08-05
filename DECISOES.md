# Decisões tomadas — ECG do Zero, reforma visual

Registro das decisões que foram fechadas em conversa e **não estavam escritas no repositório**. Cada uma vem com o número que a sustenta, para que ninguém as reabra por intuição.

Onde este arquivo contrariar o `docs/REFERENCIAS.md`, **este arquivo ganha** — ele é mais recente. Onde contrariar o `CLAUDE.md` seção 2 ou 9, o `CLAUDE.md` ganha.

Branch: `reforma/ecg-v2`. Última atualização: 05/08/2026.

---

## 1. Paleta: o V3 vence o REFERENCIAS §8

As imagens `docs/referencia/V3-*.png` são o alvo aprovado e são mais recentes que a seção 8 do `REFERENCIAS.md`. Adotar:

```css
--bg:#0A0C10;   --s1:#10141A;  --s2:#161B22;  --line:#222831;
--t1:#F2F5F7;   --t2:#A7B0BA;  --t3:#78828D;  --t4:#525C67;
--acao:#5B5BF0;      /* ação: botão-chave, item ativo, foco */
--medida:#4FA9E8;    /* medida sobre o CHASSI */
--medida-p:#1E7BC4;  /* a MESMA função, sobre o PAPEL */
--ok:#2E9E6B;        /* evidência sustentada */
--desvio:#CE6A5C;    /* correção — ver regra abaixo */
--papel:#F7F1EA; --g1:#EBD6CE; --g5:#DCB2A6; --traco:#12100F;
```

Manter do §8 a disciplina de papel fixo por degrau e a regra **cor é diagnóstico**.

### A regra "erro nunca é vermelho", corrigida

A regra original vinha de colisão de matiz. Medido:

| | matiz | L | S | sobre o papel |
|---|---|---|---|---|
| grade de 5 mm `--g5` | 13° | 76% | 44% | — |
| **terracota `#CE6A5C`** | **7°** | **58%** | **54%** | **3,21:1** |
| rosa `#F36B7B` (rejeitado) | 353° | 69% | 85% | 2,55:1 |

A terracota está a 6° da grade, mas se separa por **valor**, não por matiz: 18 pontos de luminosidade abaixo. O rosa rejeitado não se separava por nada e ainda reprovava contraste.

**Regra em vigor:** a terracota entra **só como traço, borda e glifo**, nunca como texto corrido sobre o papel, e **nunca sozinha** — sempre com símbolo. 3,21:1 passa para elemento de interface e reprova para texto.

### Correção obrigatória de contraste

**`--medida` `#4FA9E8` reprova sobre o papel: 2,29:1.** Sobre papel, usar `--medida-p` `#1E7BC4` (4,00:1), e só em texto ≥ 14 px semibold. O azul claro fica restrito ao chassi.

---

## 2. `--mm`: 6,6 / 5,4 / 5,0 no geral, com `ZOOM_PAQ` de 2 → **1,64**

Havia divergência entre dois documentos. Resolvida por medição no motor real, contra os 27 padrões.

**Por que não 10,6 no geral.** A 10,6 px/mm num celular de 390 px sobra **0,9 batimento visível**. Treze dos 27 padrões dependem de ver vários batimentos ao mesmo tempo — Wenckebach precisa de um ciclo inteiro (7,5 s), FA precisa da irregularidade, flutter precisa das ondas F. Rolar não resolve: rolagem dá **sequência**, e o que falta é **simultaneidade**.

**Por que não 3,0 (o valor de hoje).** O quadradinho de 1 mm fica com 3 px. A regra central do método é contar quadradinho. Não dá para contar o que tem 3 px.

**Por que os dois documentos descreviam a mesma curva.** A razão entre eles é constante: 10,6/6,6 = 1,61 · 9/5,4 = 1,67 · 8,2/5,0 = 1,64. Dentro de ±2%. O valor maior não é a escala de leitura — é a escala do **instrumento de medida**. E o repositório já tinha o conceito implementado: `ZOOM_PAQ` em `tools.js:550`.

**Resultado:**

| | geral | × 1,64 = Bancada | alvo V3 |
|---|---|---|---|
| 390 | 6,6 | 10,8 | 10,6 |
| 834 | 5,4 | 8,9 | 9,0 |
| 1440 | 5,0 | 8,2 | 8,2 |

Reproduz as três imagens V3 dentro de 2%. E a 10,8 px/mm o PR de 162 ms ocupa **exatamente 44 px** entre os marcadores — o alvo mínimo de toque. Era isso que a maquete estava resolvendo sem dizer.

**Custo aceito:** no celular, uma tira de 6 s passa a ocupar 3,3 telas de rolagem em vez de 1,5. É o preço de o milímetro voltar a ser legível.

**Precondição já existente, não remover:** `refino.css:420` (`.ecg-scroller svg { max-width: none }`) e `refino.css:427` (`width: max-content`). Sem esses dois blocos, inverter o `--mm` não faz efeito — o traçado só encolhe mais.

---

## 3. `letter-spacing` do h1: **−0.020em**, uma declaração só

As três atuais (`app.css:290` −0.035, `refino.css:157` −0.032, `refino.css:467` −0.030) viram uma.

**O mecanismo do defeito não era o que se supunha.** Medido nos contornos: o `ã` tem exatamente a mesma largura de avanço e a mesma caixa de tinta que o `a` — na Instrument Sans, na Segoe UI, na Segoe UI Bold e na Segoe UI Variable. **O til não transborda em nenhuma face.** Colisão horizontal por tracking não existe.

A causa real: `letter-spacing` no CSS soma a **todo** caractere, inclusive ao espaço. A −0,032em num h1 de 46 px cada espaço perde 1,5 px, e a Instrument Sans já tem espaço estreito. Em "padrão não conclusivo" as duas palavras quase encostam — e é isso que põe o til de "padrão" colado no "n" de "não".

Confirmado por espécime renderizado na face real, peso 700, nos três tamanhos.

**Não encostar no `line-height` neste item.** O til sobe a 0,742 em, quase altura de maiúscula, e com `line-height: 1.03` passa perto do descendente da linha de cima. É aperto vertical e pertence a quem reencaixar a escala tipográfica.

---

## 4. Ordem de execução do Bloco 0: **2 → 6 → 5 → 4 → 3**

Invertida em relação à ordem original. O item 3 (consolidação de tokens) é o único capaz de quebrar em silêncio, então vai **por último**, quando todo o resto já estiver verificado funcionando. Se o site quebrar depois dele, você sabe exatamente o que foi.

| item | o quê | estado |
|---|---|---|
| 1 | carregar as três fontes | **feito** — commit `5c98b5b` |
| 2 | `letter-spacing` do h1 → −0.020em | próximo |
| 6 | `scrollIntoView` na aba ativa | |
| 5 | `--mm` + `ZOOM_PAQ` | |
| 4 | estado selecionado: recesso + filete (6 lugares) | |
| 3 | consolidação de tokens + escada de pesos | **por último** |

Um item por commit. `verificar.py` antes e depois. Capturar os três viewports. Parar e aguardar liberação entre itens.

---

## 5. Source Serif 4: hospedada, sem preload

Hospedar as três famílias, mas **preload só nas duas que algum seletor usa hoje**. A Source Serif está declarada e disponível; nenhuma regra a chama. Dar preload nela gastaria uma conexão do caminho crítico por 49,6 KB que ninguém desenha. Medido depois: aparece como `unloaded`, custo zero.

Entra no preload no dia em que existir a superfície de narrativa sobre papel.

---

## 6. Consequência nova, descoberta ao carregar a fonte variável

Os pesos **640, 650 e 660** pedidos em cinco lugares do `refino.css` agora rendem peso real intermediário. Com a fonte de sistema eram arredondados para o mesmo desenho — era o defeito que o próprio comentário do arquivo descrevia.

Resultado: a escada de pesos tem hoje **oito degraus** em vez dos cinco que o `app.css` documenta. **O item 3 tem que decidir quais cinco ficam**, e essa decisão muda hierarquia visual em todas as nove telas. Medir os degraus distintos antes de consolidar.

Na mesma linha: `--p-preto: 800` está acima do teto da Instrument Sans (`wght` vai até 700). Sem efeito hoje porque nenhum seletor usa o token; cai na consolidação.

---

## 7. Torsades corrigido

`library.js:531` chamava `ritmoRegular({ fc: 250, duracao: 100 })` e lia `.eventos[0]`. O laço de `ritmoRegular` começa em `t = 120 ms`: com duração de 100 ms nenhum evento era gerado, `eventos[0]` era `undefined`, e a leitura de `.modelo` derrubava a tela. **Torsades de Pointes não renderizava.**

`duracao: 100 → 600`. Nenhum parâmetro clínico mudou — `fc`, RR de 240 ms, amplitude e fase seguem iguais; aquela duração serve só para colher um batimento-modelo que é clonado 21 vezes. Commit `065befa`.

Depois: 21 eventos, 362 pontos de traçado, e os 27 padrões renderizam.

---

## 8. Ainda em aberto — não decidir sozinho

**Nove abas contra cinco destinos.** O código tem nove (`app.js:545-555`). As imagens V3 mostram cinco: Hoje, Trilha, Bancada, Plantão, Desempenho. O Bloco 0 trata como nove e só conserta o `scrollIntoView`. A reorganização é decisão do autor, e ela move Atlas e Questões.

**O tema claro continua existindo?** `:root[data-tema="claro"]` está completo em `refino.css:1401` e nenhuma linha de JS jamais escreve `data-tema`. São ~90 linhas inalcançáveis. O item 3 precisa de decisão binária: vira botão real ou é deletado.

**Botão Voltar do navegador.** `app.js` usa `replaceState` e não ouve `popstate`. O Voltar tira o aluno do site em vez de voltar uma tela. É comportamento de navegação, não aparência — decisão conjunta dos dois chapéus.
