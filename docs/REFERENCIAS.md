# Referências e material de apoio — ECG do Zero

Este arquivo mora em `docs/`. Serve para o Claude Code e o Codex saberem **contra o que estamos competindo, o que roubar de cada referência e o que não roubar**. Todas as referências abaixo foram abertas e lidas durante a auditoria — não são citação de memória.

---

## 1. Como usar as imagens de referência

Na pasta `docs/referencia/` existem capturas e protótipos. **Abra-as com o leitor de imagem antes de desenhar qualquer tela.**

| arquivo | o que é |
|---|---|
| `V2-iphone.png` · `V2-ipad.png` · `V2-desktop.png` | a mesma tela da Bancada nos três aparelhos, na direção aprovada. É o alvo visual. |
| `MODELO-1.png` … `MODELO-5.png` | as cinco pranchas de sistema: a transformação, equivalência entre aparelhos, o preceptor, a bancada como metáfora, e o sistema tipográfico/cromático em uma página |
| `ESPECIME-fontes.png` | espécime tipográfico real: acentuação pt-BR, siglas clínicas, números tabulares, narrativa em serifa |
| `v2.build.html` | protótipo funcional, arquivo único, offline. Abra no navegador e redimensione a janela para ver as três formas. |
| `ANTES-*.png` | como o site estava antes da reforma, para comparação |

Regra: quando o protótipo e o texto discordarem, **o texto do `CLAUDE.md` ganha** — o protótipo é ilustração, não especificação.

---

## 2. Ferramenta de precisão

**[Linear](https://linear.app/)**
Roubar: a disciplina do quase-nada. Fundo como token único muito escuro. Seções separadas por espaço, não por régua. Raio de canto moderado e absolutamente constante.
Não roubar: o glow e o gradiente atrás dos blocos. Perto de traçado isso é veneno técnico — falso desnível faz ler supra onde não há.

**[Raycast](https://www.raycast.com/)**
Roubar: o "key chip" — retângulo pequeno, borda de 1px, rótulo monoespaçado. Transposto vira o chip de calibração: `25 mm/s`, `10 mm/mV`, `0,04 s`, `5 mm`.
Não roubar: o glassmorphism. Fundo translúcido e desfocado destrói a leitura de amplitude.

**[Stripe Docs — Quickstart](https://docs.stripe.com/payments/quickstart)**
Roubar: as três colunas (navegação · prosa · painel que acompanha a rolagem) e os passos numerados explícitos. **É a resposta direta para a faixa morta à direita em 1440px.**
Não roubar: a densidade de documentação de referência. Um P6 na véspera não quer árvore de opções.

**[Geist Design System — Colors](https://vercel.com/geist/colors)**
Roubar: escala de 10 degraus com **papel fixo por degrau** — 100–300 fundo de componente, 400–600 borda, 700+ texto. É o remédio exato para a guerra entre `app.css` e `refino.css`.
Não roubar: as dez famílias cromáticas. Num site de ECG, **cor é diagnóstico**; o vermelho já pertence à grade.

**[Observable Framework — Themes](https://observablehq.com/framework/themes)**
Roubar: nomes de token por função **e** por força — `foreground`, `-alt`, `-muted`, `-faint`, `-fainter`. Permite dizer "esse texto é fraquíssimo" sem inventar nome.

---

## 3. Editorial científico

**[Distill — Curve Detectors](https://distill.pub/2020/circuits/curve-detectors/)**
Roubar: o sistema de transbordo — coluna de texto estreita (60–80 caracteres) com a figura autorizada a sair dela em três níveis: figura de margem, figura larga, sangria total. Legenda sempre embaixo.
Não roubar: o aparato acadêmico (citação em hover, bibliografia, LaTeX). Cria distância.

**[Bartosz Ciechanowski — Moon](https://ciechanow.ski/moon/)**
Roubar: o compasso — prosa curta → demonstração interativa → prosa, sempre no mesmo ritmo. E a regra dos controles: **abaixo** da figura, rótulo humano em minúscula.
Não roubar: o comprimento e o silêncio. É ensaio de fim de semana; não tem progresso nem retorno.

**[Our World in Data](https://ourworldindata.org/)**
Roubar: o rodapé de proveniência do gráfico — título acima, fonte e nota abaixo, sempre no mesmo lugar, sempre menor e mais fraco. É onde mora o aviso "traçado sintético, não é registro de paciente".
Não roubar: a densidade de portal.

**[Datawrapper — fontes para dados](https://www.datawrapper.de/blog/fonts-for-data-visualization)**
Regras duras e testáveis: algarismos **lining e tabulares** obrigatórios; nada abaixo de 12px; pesos finos são ilegíveis; negrito só para ênfase.
Não roubar: a lista de fontes recomendada (Roboto, Lato, Open Sans) — é o default de dashboard corporativo.

---

## 4. Educação que faz voltar

**[Exercism](https://exercism.org/)**
Roubar: motivação por **número concreto e verificável** em vez de badge. Sensação de território a percorrer.
Não roubar: a ausência total de ritual de retorno. O ECG do Zero já tem repetição espaçada — não copie essa lacuna.

**[Brilliant — análise da Rive](https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations)**
Roubar: o princípio — a animação existe **no momento do resultado**, disparada por evento, alinhada ao número que mudou.
Não roubar: o pacote "playful and colorful". Incompatível com instrumento clínico. E runtime pesado está fora pelas restrições.

---

## 5. Objeto médico

**[Kenhub](https://www.kenhub.com/en/library/anatomy)**
Roubar: ilustração como protagonista absoluta, sem competição ao redor. Cor de tema única, escura e dessaturada, que nunca disputa com a ilustração. **Crédito nominal ao ilustrador** — é o que separa "material caro" de "banco de imagens".
Não roubar: marca d'água sobre a imagem, e miniatura pequena. ECG reduzido ensina errado.

**[AMBOSS](https://www.amboss.com/us)**
Roubar: biblioteca de conhecimento e banco de questões apresentados como **duas metades da mesma coisa**, com ferramentas ao lado. O ECG do Zero já tem esse par.
Não roubar: prova social institucional e claims de desempenho em prova.

---

## 6. Contra quem competimos — leia como checklist, não como referência visual

**[LITFL — ECG Library](https://litfl.com/ecg-library/)**
Mais de 100 tópicos com nome canônico, incluindo epônimos e toxicologia. **Use como checklist de completude dos 27 padrões.** Visualmente: não roubar nada.

**[ECGwaves](https://ecgwaves.com/)**
O currículo em 11 módulos ordenados: anatomia e fisiologia → introdução à interpretação → arritmias → isquemia → defeitos de condução → hipertrofia → marca-passo e TRC → ECG pediátrico. Compare com a nossa sequência de 9 famílias.
Não roubar: navegação dupla e fricção comercial.

**[Practical Clinical Skills — EKG Interpretation](https://www.practicalclinicalskills.com/ekg-interpretation)**
**O melhor achado funcional da busca:** correção pontuada **por passo** — *"cada resposta de análise vale um ponto; há cinco por traçado"*. É exatamente o pente de nove.
Não roubar: traçado como imagem estática. O diferencial estrutural do ECG do Zero é sintetizar em SVG no navegador.

**[Aprenda ECG (BR)](https://aprendaecg.com.br/)**
Arquitetura de quatro pilares em português: Artigos, Biblioteca de ECGs com busca avançada, Curso, Livros. **Roubar sobretudo a biblioteca com busca avançada.**
Não roubar: métricas de curso como argumento de venda ("2035+ minutos") — minuto de vídeo é métrica de vendedor.

**[Cardiopapers / Afya](https://portal.afya.com.br/cardiologia/curso-ecg)**
A prova de que existe demanda sustentada em português por curso de ECG, e de que a autoridade se constrói por **nome próprio**, não por instituição. Mesmo caminho disponível aqui.
Não roubar: breadcrumb corporativo e banner comercial dentro da aula.

---

## 7. Tipografia — decidido e verificado

| Família | Papel | Arquivo | Peso |
|---|---|---|---|
| **Instrument Sans** Variable | chassi, interface, títulos, navegação | `instrument-sans-latin-wght.woff2` | **32 KB** |
| **Source Serif 4** Variable | só a voz do professor: narrativa de caso, explicação depois da tentativa | `source-serif-4-latin-wght.woff2` — eixo `wght`, **nunca** o `opsz` (salta para 120 KB) | **52 KB** |
| **IBM Plex Mono** 400/600 | toda medida, sigla clínica, calibração | `ibm-plex-mono-latin-{400,600}.woff2` | **32 KB** |

**116 KB no total**, todas SIL OFL, auto-hospedáveis em `assets/fonts/`. Subset latin basta — o português inteiro cabe em U+0000–00FF.

Fonte dos arquivos: [Fontsource](https://fontsource.org) (`@fontsource-variable/instrument-sans`, `@fontsource-variable/source-serif-4`, `@fontsource/ibm-plex-mono`).

**Verificado por espécime renderizado:**
- acentuação pt-BR completa nas três (`ãõáéíóúâêôàç`)
- IBM Plex Mono tem **zero pontilhado** — a Geist Mono corta o zero e acima de 16px ele vira quase `Ø`, defeito hoje visível na tela Desempenho
- Source Serif 4 **perde peso de traço sobre fundo escuro**: tem autoridade sobre o papel, fica anêmica sobre a casca. Por isso mora no papel e nos blocos de explicação, nunca na interface.

**Carregamento:** `@font-face` com `font-display: swap` + `<link rel="preload">` das três. O site tem que continuar legível se o woff2 falhar.

---

## 8. Cor — decidido e com contraste calculado

Um só material de chassi. **Maior degrau entre superfícies da interface: 1,15:1.** A única transição real da tela é chassi → papel: **18,9:1**.

```css
--c0:#07090A;  --c1:#0D0F11;  --c2:#131619;  --c3:#1A1E22;  --sulco:#050607;
--f1:#1E2328;  --f2:#2C343B;  --f3:#5A636B;
--t1:#E9EDEF;  /* 16,3:1 */   --t2:#A8B1B7;  /* 8,8:1 */
--t3:#838C93;  /* 5,6:1 */    --t4:#565E64;  /* 3,0:1 — proibido como texto */

--med:#5FB8E6;      /* acento único: foco, medida, ação — 8,3:1 sobre --c1 */
--med-p:#0B5E90;    /* a MESMA matiz, sobre o papel — 6,8:1 */
--med-bg:#0C2A3A;   /* preenchimento do botão-chave */

--ok:#7FD1A8;       /* acerto, sempre com glifo ✓ */
--desvio:#C7A2E8;   /* erro — VIOLETA, nunca vermelho */
--fragil:#E0B15C;   /* frágil, valor no limite */

/* PAPEL — fora de qualquer troca de tema */
--papel:#FFFDFB;  --grade:#F7D9D4;  --grade5:#E8A9A1;  --traco:#14100E;
```

**Por que o acento é `#5FB8E6` e não um indigo:** 199° de matiz — oposto à grade do papel (6°), longe do jade do monitor (161°), e não é o `indigo-500` do Tailwind, que é a cor de acento mais usada em interface gerada por IA.

**Por que erro é violeta:** o vermelho já significa **duas** coisas aqui — a grade do papel e o limiar do normal. Um vermelho de erro a 353° fica a treze graus da grade, e sobre o papel dá 2,55:1, que reprova WCAG.

---

## 9. Regras de imagem e traçado

1. **Mantenha puro-SVG.** Nada de foto, nada de raster. O traçado sintetizado por equação é o diferencial estrutural contra todos os concorrentes.
2. **`--mm` cresce no celular, encolhe no desktop.** 6,6px em 390 · 5,4px em 834 · 5,0px em 1440. Espremer o milímetro é erro clínico, não decisão de layout.
3. **Faixa de anotação** de ~7mm na base do papel, onde a grade não é desenhada. É onde mora o pente de nove.
4. **A grade nunca é textura.** Nunca atrás de texto, nunca em opacidade baixa como ambiência, nunca em cartão sem traçado.
5. **Dentro do papel só entram numerais e linha-guia.** As palavras moram na margem — nenhuma etiqueta tapa o traçado.
6. **Zero gradiente, blur, glow, `backdrop-filter` ou sombra colorida** perto de qualquer coisa mensurável.
7. **Estado nunca é só cor.** Domínio se lê por forma antes de por cor: vazio (contorno) · hachurado 45° · cheio.
8. **O logotipo precisa ser refeito** — a regra de rede de segurança destrói os três paths, é ilegível a 30px, e a grade cinza-azulada contraria a convenção vermelho/preto.
