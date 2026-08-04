/**
 * Anatomia do batimento.
 *
 * A ideia é a mesma da versão anterior e continua sendo a melhor coisa desta
 * tela: tocar num componente da onda acende ao mesmo tempo o trecho do traçado
 * e a estrutura do coração que o gera. Enquanto o aluno não liga a onda P ao
 * nó sinusal e o intervalo PR ao atraso do nó AV, o resto é memorização, e
 * memorização desmonta na primeira pegadinha.
 *
 * O que mudou nesta versão:
 *
 *  1. MOBILE PRIMEIRO. Em 375 px o traçado ocupa a largura inteira e o coração
 *     vem abaixo, com filete separando. As duas colunas só existem a partir de
 *     60rem, onde sobra largura de verdade.
 *  2. Os componentes viraram um tablist real: setas, Home e End navegam, o
 *     estado ativo é sólido e cada alvo tem 44 px.
 *  3. Também se toca no PRÓPRIO traçado. Cada peça tem uma área de toque
 *     invisível e generosa; o dedo não precisa acertar um traço de 2 px.
 *  4. O texto foi reestruturado: uma frase de mecanismo em destaque, o resto em
 *     prosa curta e os números numa lista de medidas em mono tabular. Acabaram
 *     as caixas coloridas com parágrafo dentro.
 *  5. Entraram três coisas que faltavam e são honestas: a diferença entre
 *     intervalo PR e segmento PR, o ponto J como régua de supra e infra, e a
 *     onda U, que existe e desaparece quando é normal.
 *
 * Toda a pintura do SVG está em classe, nunca em atributo. `var()` dentro de
 * atributo de apresentação não é confiável no Chromium, e o alvo inclui Chrome
 * no Android. Como esta tela precisa de regras que não existem em app.css e a
 * ordem foi para não tocar naquele arquivo, o CSS específico é injetado uma
 * única vez, dentro da camada `ecg` já declarada lá, para não bagunçar a
 * cascata.
 *
 * Valores normais: library.js e Diretriz SBC 2022, já citada no app. Onde as
 * fontes do curso divergem (QTc), as duas aparecem lado a lado.
 */

/* ==========================================================================
   CONTEÚDO
   ========================================================================== */

const PECAS = [
  {
    rotulo: 'P',
    titulo: 'Onda P',
    sub: 'despolarização atrial',
    onda: ['w-p'],
    coracao: ['c-sa', 'c-atrios'],
    estrutura: 'nó sinusal e átrios',
    mecanismo: `O <strong>nó sinusal</strong> dispara e a despolarização atravessa os dois átrios.
      Esse trajeto é a onda P.`,
    prosa: [
      `O nó sinusal fica no alto do átrio direito e é o marca-passo natural do coração: ele dispara
       sozinho, sem precisar de comando.`,
      `Onda P positiva em DII antes de cada QRS, com PR constante, é a definição de
       <strong>ritmo sinusal</strong>. É o primeiro passo da leitura, e quem pula esse passo erra
       todos os seguintes.`,
    ],
    medidas: [
      ['Duração', 'menor que 120 ms'],
      ['Amplitude em DII', 'menor que 2,5 mm'],
    ],
    muda: `Alta e pontuda acima de 2,5 mm: sobrecarga atrial direita. Larga e entalhada acima de
      120 ms: sobrecarga atrial esquerda. Ausente, com RR irregularmente irregular: fibrilação
      atrial.`,
  },
  {
    rotulo: 'PR',
    titulo: 'Intervalo PR',
    sub: 'a passagem pelo nó AV',
    onda: ['w-pr'],
    coracao: ['c-av', 'c-his'],
    estrutura: 'nó atrioventricular e feixe de His',
    mecanismo: `O impulso chega ao <strong>nó AV</strong> e fica retido ali cerca de um décimo de
      segundo antes de descer pelo His.`,
    prosa: [
      `O nó AV é o único caminho elétrico entre átrios e ventrículos. O atraso não é defeito, é
       função: dá tempo de os átrios terminarem de encher os ventrículos antes da contração. É aqui
       que se decidem todos os bloqueios AV.`,
      `<strong>Intervalo e segmento não são a mesma coisa.</strong> O intervalo PR vai do início da
       onda P ao início do QRS, e é ele que se mede para bloqueio. O segmento PR é só o trecho plano
       entre o fim da P e o início do QRS, e é ele que a pericardite deprime.`,
    ],
    medidas: [
      ['Intervalo PR', '120 a 200 ms'],
      ['Em quadradinhos', '3 a 5'],
      ['Segmento PR', 'isoelétrico'],
    ],
    muda: `Longo e fixo: BAV de 1º grau. Longo e crescente até um QRS falhar: Mobitz I. Fixo com
      falha súbita: Mobitz II. Curto com onda delta: pré-excitação. Segmento PR deprimido de forma
      difusa: pericardite.`,
  },
  {
    rotulo: 'QRS',
    titulo: 'Complexo QRS',
    sub: 'despolarização ventricular',
    onda: ['w-qrs'],
    coracao: ['c-ramos', 'c-purkinje', 'c-ventriculos'],
    estrutura: 'ramos, fibras de Purkinje e ventrículos',
    mecanismo: `Do His o impulso desce pelos <strong>ramos</strong> e pela rede de
      <strong>Purkinje</strong>, que ativa os dois ventrículos quase juntos.`,
    prosa: [
      `São dois ramos, o direito e o esquerdo, e uma rede de fibras muito rápida. Por isso o complexo
       é estreito e alto: muita massa muscular ativada em pouquíssimo tempo.
       <strong>Q</strong> é a primeira deflexão negativa, <strong>R</strong> a primeira positiva,
       <strong>S</strong> a negativa que vem depois do R.`,
      `QRS largo quer dizer que o impulso andou fora do sistema de condução: ramo bloqueado, foco
       nascendo no próprio ventrículo ou via acessória.`,
    ],
    medidas: [
      ['Duração', 'menor que 120 ms'],
      ['Em quadradinhos', 'menos de 3'],
    ],
    muda: `Largo com V1 positivo em rsR: bloqueio de ramo direito. Largo com V1 negativo: bloqueio
      de ramo esquerdo. Largo, rápido e sem P relacionada: taquicardia ventricular até prova em
      contrário.`,
  },
  {
    rotulo: 'J',
    titulo: 'Ponto J',
    sub: 'o fim da despolarização',
    onda: ['w-j'],
    coracao: ['c-ventriculos'],
    estrutura: 'ventrículos',
    mecanismo: `Junção exata entre o fim do QRS e o começo do ST: o ventrículo acabou de
      despolarizar e ainda não repolarizou.`,
    prosa: [
      `O ponto J é a <strong>régua da isquemia</strong>. Supra e infra de ST se medem nele,
       comparados com a linha de base, e não no meio do segmento, onde a inclinação já enganou muita
       gente.`,
      `Os limiares de supra que definem conduta são por derivação e por sexo: 1 mm ou mais na maioria
       das derivações; em V2 e V3, 2 mm ou mais em homens de 40 anos ou mais, 2,5 mm ou mais em
       homens abaixo de 40 e 1,5 mm ou mais em mulheres de qualquer idade.`,
    ],
    medidas: [
      ['Referência', 'coincide com a linha de base'],
      ['Linha de base', 'segmento TP ou PR'],
    ],
    muda: `Acima da linha de base: supradesnivelamento. Abaixo: infradesnivelamento. Elevado com
      entalhe em jovem assintomático: repolarização precoce.`,
  },
  {
    rotulo: 'ST',
    titulo: 'Segmento ST',
    sub: 'o platô elétrico',
    onda: ['w-st'],
    coracao: ['c-ventriculos'],
    estrutura: 'ventrículos',
    mecanismo: `Sem diferença de potencial entre regiões do ventrículo não há vetor, e o traçado
      fica na linha de base.`,
    prosa: [
      `É o platô: os ventrículos estão inteiramente despolarizados e o traço fica plano. Justamente
       por dever ser plano, qualquer desvio conta. O que decide conduta não é ter subido
       ou descido, e sim <strong>localizado contra difuso</strong> e <strong>convexo contra
       côncavo</strong>.`,
    ],
    medidas: [
      ['Referência', 'isoelétrico'],
      ['Onde medir o desvio', 'no ponto J'],
    ],
    muda: `Supra convexo, localizado e com imagem em espelho: oclusão coronária aguda. Infra
      horizontal ou descendente: isquemia subendocárdica. Supra difuso e côncavo com infra de PR:
      pericardite.`,
  },
  {
    rotulo: 'T',
    titulo: 'Onda T',
    sub: 'repolarização ventricular',
    onda: ['w-t'],
    coracao: ['c-ventriculos'],
    estrutura: 'ventrículos',
    mecanismo: `A <strong>repolarização</strong> caminha em sentido oposto ao da despolarização, e
      por isso a T acompanha o QRS.`,
    prosa: [
      `Repolarizar é recarregar para o próximo batimento, e é por isso que a onda T normal é
       <strong>concordante</strong> com o QRS: quando o QRS é positivo, a T também é.`,
      `A forma importa tanto quanto a direção. A T normal é <strong>assimétrica</strong>: sobe
       devagar e desce mais rápido. Quando fica simétrica, alta e de base estreita, pense em
       potássio.`,
    ],
    medidas: [
      ['Forma', 'arredondada e assimétrica'],
      ['Direção', 'concordante com o QRS'],
    ],
    muda: `Apiculada, simétrica e de base estreita: hipercalemia. Larga e assimétrica: T hiperaguda
      de isquemia. Invertida: isquemia, strain de sobrecarga ou discordância esperada do bloqueio de
      ramo. Achatada com onda U: hipocalemia.`,
  },
  {
    rotulo: 'QT',
    titulo: 'Intervalo QT',
    sub: 'a sístole elétrica inteira',
    onda: ['w-qt'],
    coracao: ['c-ventriculos'],
    estrutura: 'ventrículos',
    divergencia: true,
    mecanismo: `Do início do QRS ao fim da onda T: o ciclo elétrico ventricular completo,
      despolarização mais repolarização.`,
    prosa: [
      `Como o QT encurta quando o coração acelera, ele precisa ser corrigido pela frequência antes de
       ser julgado. Bazett, que é a fórmula mais usada, superestima na taquicardia e subestima na
       bradicardia: fora da faixa de 60 a 100 bpm, prefira Fridericia.`,
      `<strong>QT longo é risco de torsades de pointes.</strong> As causas mais frequentes são
       corrigíveis: drogas que prolongam o QT, hipocalemia e hipomagnesemia.`,
    ],
    medidas: [
      ['QTc normal, SBC 2022', 'até 450 ms (H) e 470 ms (M)'],
      ['QTc normal, guia do curso', 'até 450 ms (H) e 460 ms (M)'],
      ['Risco alto em qualquer fonte', 'acima de 500 ms'],
    ],
    muda: `As duas convenções existem e circulam juntas no curso. Confirme qual delas o seu professor
      cobra. Acima de 500 ms o risco é alto pelas duas.`,
  },
  {
    rotulo: 'U',
    titulo: 'Onda U',
    sub: 'a que some quando é normal',
    onda: ['w-u'],
    coracao: ['c-ventriculos'],
    estrutura: 'ventrículos',
    mecanismo: `Deflexão pequena que às vezes aparece depois da T. Sendo normal, é baixa e some na
      maioria dos traçados.`,
    prosa: [
      `A origem exata da onda U ainda é discutida, e por isso o app não oferece um mecanismo fechado.
       O que importa na prática é reconhecer quando ela fica <strong>proeminente</strong>.`,
      `Com T achatada e U proeminente, pense em hipocalemia. Aí o que se alonga é o
       <strong>QU</strong>, não o QT: medir o QT incluindo a onda U é um erro clássico de prova.`,
    ],
    medidas: [
      ['Quando visível', 'bem menor que a T anterior'],
      ['Direção habitual', 'a mesma da onda T'],
    ],
    muda: `Proeminente com T achatada e infra discreto de ST: hipocalemia, que também predispõe a
      torsades. Repor potássio sem corrigir o magnésio não sustenta.`,
  },
];

/* ==========================================================================
   TRAÇADO
   Um batimento normal, ampliado, com cada componente separável e com área de
   toque própria. A grade é ilustrativa: o desenho está fora de escala e o
   cabeçalho da tira diz isso.
   ========================================================================== */

function batimentoSVG() {
  return `<svg class="an-svg ecg-svg ecg-papel" viewBox="0 0 440 250" role="img"
       aria-label="Batimento normal ampliado, com onda P, intervalo PR, complexo QRS, ponto J, segmento ST, onda T, intervalo QT e onda U identificados">
    <defs>
      <pattern id="an-grade" width="20" height="20" patternUnits="userSpaceOnUse">
        <path class="ecg-grade-1" d="M0 0H20M0 4H20M0 8H20M0 12H20M0 16H20M0 0V20M4 0V20M8 0V20M12 0V20M16 0V20"/>
        <path class="ecg-grade-5" d="M0 0H20M0 0V20"/>
      </pattern>
    </defs>
    <rect class="ecg-fundo" width="440" height="250"/>
    <rect width="440" height="250" fill="url(#an-grade)"/>

    <path class="an-linha-base" d="M16 150 L424 150"/>
    <path class="ecg-traco an-fantasma" d="M16 150 L40 150 M292 150 L300 150 M332 150 L424 150"/>

    <g id="w-p" class="peca" data-peca="0">
      <path class="ecg-traco" d="M40 150 C55 150 58 114 70 114 C82 114 85 150 100 150"/>
      <text class="an-rotulo" x="70" y="104" text-anchor="middle">P</text>
      <rect class="an-alvo" x="32" y="98" width="76" height="58"/>
    </g>

    <g id="w-pr" class="peca" data-peca="1">
      <path class="an-colchete" d="M40 90 L40 80 L120 80 L120 90"/>
      <text class="an-rotulo" x="80" y="72" text-anchor="middle">PR</text>
      <path class="ecg-traco" d="M100 150 L120 150"/>
      <path class="an-colchete" d="M100 160 L100 166 L120 166 L120 160"/>
      <text class="an-rotulo an-rotulo--min" x="110" y="180" text-anchor="middle">segmento</text>
      <rect class="an-alvo" x="34" y="62" width="92" height="34"/>
      <rect class="an-alvo" x="94" y="152" width="24" height="32"/>
    </g>

    <g id="w-qrs" class="peca" data-peca="2">
      <path class="ecg-traco" d="M120 150 L128 162 L142 46 L156 180 L168 150"/>
      <text class="an-rotulo" x="142" y="38" text-anchor="middle">QRS</text>
      <rect class="an-alvo" x="114" y="34" width="48" height="156"/>
    </g>

    <g id="w-st" class="peca" data-peca="4">
      <path class="ecg-traco" d="M168 150 L206 150"/>
      <text class="an-rotulo" x="190" y="138" text-anchor="middle">ST</text>
      <rect class="an-alvo" x="170" y="122" width="44" height="28"/>
    </g>

    <g id="w-j" class="peca" data-peca="3">
      <circle class="an-ponto" cx="168" cy="150" r="5.5"/>
      <path class="an-colchete" d="M171 156 L179 168"/>
      <text class="an-rotulo" x="184" y="176" text-anchor="middle">J</text>
      <rect class="an-alvo" x="164" y="152" width="36" height="30"/>
    </g>

    <g id="w-t" class="peca" data-peca="5">
      <path class="ecg-traco" d="M206 150 C228 150 236 100 250 100 C266 100 272 150 292 150"/>
      <text class="an-rotulo" x="250" y="90" text-anchor="middle">T</text>
      <rect class="an-alvo" x="214" y="86" width="84" height="64"/>
    </g>

    <g id="w-u" class="peca" data-peca="7">
      <path class="ecg-traco" d="M300 150 C308 150 310 136 316 136 C322 136 324 150 332 150"/>
      <text class="an-rotulo" x="316" y="128" text-anchor="middle">U</text>
      <rect class="an-alvo" x="296" y="118" width="44" height="36"/>
    </g>

    <g id="w-qt" class="peca" data-peca="6">
      <path class="an-colchete" d="M120 194 L120 208 L292 208 L292 194"/>
      <text class="an-rotulo" x="206" y="226" text-anchor="middle">QT</text>
      <rect class="an-alvo" x="116" y="190" width="180" height="42"/>
    </g>
  </svg>`;
}

/* ==========================================================================
   CORAÇÃO
   O sistema de condução, esquemático. Cada estrutura carrega o próprio rótulo,
   para acender junto com ela.
   ========================================================================== */

function coracaoSVG() {
  return `<svg class="an-svg an-coracao" viewBox="0 0 220 264" role="img"
       aria-label="Esquema do sistema de condução: nó sinusal, átrios, nó atrioventricular, feixe de His, ramos, fibras de Purkinje e ventrículos">
    <path class="anat-coracao"
          d="M110 34 C142 8 194 18 198 76 C202 138 158 200 108 236 C58 200 22 146 24 88 C26 38 82 26 110 34 Z"/>

    <g id="c-atrios" class="peca">
      <ellipse class="an-f-p" cx="110" cy="78" rx="70" ry="28"/>
      <text class="an-legenda" x="48" y="66">átrios</text>
    </g>

    <g id="c-ventriculos" class="peca">
      <ellipse class="an-f-qrs" cx="106" cy="168" rx="72" ry="52"/>
      <text class="an-legenda" x="100" y="256" text-anchor="middle">ventrículos</text>
    </g>

    <g id="c-sa" class="peca">
      <circle class="an-d-p" cx="158" cy="62" r="8"/>
      <path class="an-guia" d="M150 46 L157 54"/>
      <text class="an-legenda" x="148" y="42" text-anchor="end">nó sinusal</text>
    </g>

    <g id="c-av" class="peca">
      <circle class="an-d-av" cx="108" cy="110" r="7"/>
      <text class="an-legenda" x="120" y="113">nó AV</text>
    </g>

    <g id="c-his" class="peca">
      <path class="an-l-av" d="M108 118 L104 146"/>
      <text class="an-legenda" x="116" y="142">His</text>
    </g>

    <g id="c-ramos" class="peca">
      <path class="an-l-qrs" d="M104 146 L74 202 M104 146 L136 198"/>
      <text class="an-legenda" x="34" y="172">ramos</text>
    </g>

    <g id="c-purkinje" class="peca">
      <path class="an-l-purk" d="M74 202 q-10 10 -20 4 M74 202 q-4 14 -14 16 M136 198 q10 10 20 4 M136 198 q4 14 14 16"/>
      <path class="an-guia" d="M150 232 L142 220"/>
      <text class="an-legenda" x="152" y="238">Purkinje</text>
    </g>
  </svg>`;
}

const TODAS_ONDAS = ['w-p', 'w-pr', 'w-qrs', 'w-j', 'w-st', 'w-t', 'w-qt', 'w-u'];
const TODAS_ESTRUTURAS = ['c-sa', 'c-atrios', 'c-av', 'c-his', 'c-ramos', 'c-purkinje', 'c-ventriculos'];

/* ==========================================================================
   ESTILO
   Injetado uma única vez, dentro da camada `ecg` declarada em app.css, para
   que a ordem da cascata continue previsível.
   ========================================================================== */

const ESTILO_ID = 'an-estilo';

const ESTILO = `
@layer ecg {
  /* --- traçado --- */
  .an-tira { background: var(--ecg-bg); }
  .an-tira .an-svg { width: 100%; height: auto; }
  @media (min-width: 48rem) { .an-tira .an-svg { max-height: 22rem; } }

  .an-linha-base {
    fill: none; stroke: var(--ecg-tinta); stroke-width: 1px;
    opacity: 0.16; vector-effect: non-scaling-stroke;
  }
  .an-fantasma { opacity: 0.22; }

  .an-svg .peca {
    opacity: 0.3;
    transition: opacity 220ms cubic-bezier(0.2, 0.7, 0.3, 1),
                stroke 220ms cubic-bezier(0.2, 0.7, 0.3, 1),
                fill 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  .an-svg .peca.ativa { opacity: 1; --ecg-tinta: var(--acento); --ecg-traco-l: 2.6px; }
  .an-svg [data-peca] { cursor: pointer; }
  .an-alvo { fill: none; pointer-events: all; }

  .an-colchete {
    fill: none; stroke: var(--ecg-tinta); stroke-width: 1.3px;
    stroke-linecap: round; stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  .an-ponto { fill: var(--ecg-tinta); }
  .an-rotulo {
    fill: var(--ecg-tinta);
    font-family: var(--ff-mono); font-size: 13px; font-weight: 600;
    paint-order: stroke; stroke: var(--ecg-bg); stroke-width: 3.5px; stroke-linejoin: round;
  }
  .an-rotulo--min { font-size: 10px; font-weight: 500; }

  /* --- coração --- */
  .an-coracao { width: 100%; max-width: 15rem; margin-inline: auto; height: auto; }
  .an-f-p   { fill: var(--pap-p);   fill-opacity: 0.18; }
  .an-f-qrs { fill: var(--pap-qrs); fill-opacity: 0.16; }
  .an-d-p   { fill: var(--pap-p); }
  .an-d-av  { fill: var(--pap-t); }
  .an-l-av  { fill: none; stroke: var(--pap-t);   stroke-width: 4;   stroke-linecap: round; }
  .an-l-qrs { fill: none; stroke: var(--pap-qrs); stroke-width: 3.4; stroke-linecap: round; }
  .an-l-purk{ fill: none; stroke: var(--pap-qrs); stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 2 3; }
  .an-guia  { fill: none; stroke: var(--linha-forte); stroke-width: 1; }
  .an-legenda {
    fill: var(--tinta-3); font-family: var(--ff-mono); font-size: 11px;
  }
  .peca.ativa .an-legenda { fill: var(--tinta); font-weight: 600; }

  /* --- navegação por componente --- */
  .an-tabs {
    display: flex; flex-wrap: wrap; gap: var(--e-2);
  }
  .an-tab {
    flex: 0 0 auto;
    min-height: var(--toque); min-width: var(--toque);
    padding: var(--e-2) var(--e-4);
    border: 1px solid var(--linha-2); border-radius: var(--r-pill);
    background: var(--superficie); color: var(--tinta-2);
    font-family: var(--ff-mono); font-size: var(--t--1); font-weight: 600;
    font-variant-numeric: tabular-nums;
    transition: background var(--transicao), color var(--transicao), border-color var(--transicao);
  }
  .an-tab:hover { color: var(--tinta); border-color: var(--linha-forte); }
  .an-tab[aria-selected="true"] {
    background: var(--tinta); color: var(--papel); border-color: var(--tinta);
  }

  /* --- painel --- */
  .an-baixo { display: grid; gap: var(--e-5); }
  @media (min-width: 60rem) {
    .an-baixo {
      grid-template-columns: minmax(0, 1fr) minmax(0, 17rem);
      gap: var(--e-6); align-items: start;
    }
  }
  .an-painel:focus-visible { outline: 2px solid var(--acento); outline-offset: 6px; }

  .an-titulo {
    font-family: var(--ff-titulo); font-size: var(--t-2); font-weight: 640;
    letter-spacing: -0.015em; line-height: var(--lh-titulo);
  }
  .an-titulo span {
    display: block; font-size: var(--t--1); font-weight: 400;
    letter-spacing: 0; color: var(--tinta-3); margin-top: 2px;
  }

  .an-mecanismo {
    font-size: var(--t-1); line-height: 1.46; color: var(--tinta);
    border-left: 2px solid var(--acento);
    padding-left: var(--e-4);
    max-width: 48ch;
    margin-top: var(--e-4);
  }
  .an-prosa { margin-top: var(--e-4); max-width: var(--medida); }
  .an-prosa p + p { margin-top: var(--e-3); }

  .an-medidas { margin-top: var(--e-5); border-top: 1px solid var(--linha); }
  .an-medida {
    display: flex; flex-wrap: wrap; gap: var(--e-1) var(--e-4);
    justify-content: space-between; align-items: baseline;
    padding-block: var(--e-2);
    border-bottom: 1px solid var(--linha);
    font-size: var(--t--1);
  }
  .an-medida dt { color: var(--tinta-3); }
  .an-medida dd {
    margin: 0; color: var(--tinta);
    font-family: var(--ff-mono); font-variant-numeric: tabular-nums;
    font-feature-settings: 'zero' 1;
  }

  .an-muda { margin-top: var(--e-5); max-width: var(--medida); }
  .an-muda-rotulo {
    display: block; font-size: var(--t--1); font-weight: 650;
    color: var(--tinta-2); margin-bottom: var(--e-1);
  }
  .an-muda p { color: var(--tinta-2); font-size: var(--t--1); }

  .an-coluna-coracao { border-top: 1px solid var(--linha); padding-top: var(--e-5); }
  @media (min-width: 60rem) {
    .an-coluna-coracao {
      border-top: none; border-left: 1px solid var(--linha);
      padding-top: 0; padding-left: var(--e-6);
    }
  }
  .an-estrutura {
    font-family: var(--ff-mono); font-size: var(--t--2);
    color: var(--tinta-3); text-align: center; margin-top: var(--e-3);
  }
  .an-estrutura b { color: var(--tinta); font-weight: 600; }
}
`;

function garantirEstilo() {
  if (document.getElementById(ESTILO_ID)) return;
  const s = document.createElement('style');
  s.id = ESTILO_ID;
  s.textContent = ESTILO;
  document.head.appendChild(s);
}

/* ==========================================================================
   MONTAGEM
   ========================================================================== */

const idTab = (i) => `an-tab-${i}`;

export function criarAnatomia(container) {
  garantirEstilo();

  container.innerHTML = `
    <div class="empilha-g an-raiz">
      <section class="prosa empilha">
        <span class="etiqueta">Fundamento</span>
        <h1>Anatomia do batimento</h1>
        <p>Toque numa parte da onda, no traçado ou nos botões. Ela acende no traçado e acende
        também a estrutura do coração que a produziu. Enquanto a onda P não estiver ligada ao nó
        sinusal e o intervalo PR ao atraso do nó AV, ler ECG continua sendo decorar desenho.</p>
      </section>

      <div class="ecg-tira an-tira">
        <div class="ecg-cabeca">
          <span>Batimento normal · DII</span>
          <span class="ecg-calib-texto">esquema ampliado, grade ilustrativa</span>
        </div>
        ${batimentoSVG()}
      </div>

      <div class="an-tabs" role="tablist" aria-label="Componentes do batimento">
        ${PECAS.map((p, i) => `<button class="an-tab" type="button" role="tab"
            id="${idTab(i)}" data-peca="${i}" aria-controls="an-painel"
            aria-selected="${i === 0}" tabindex="${i === 0 ? '0' : '-1'}">${p.rotulo}</button>`).join('')}
      </div>

      <div class="an-baixo">
        <div class="an-painel" id="an-painel" role="tabpanel" tabindex="0"
             aria-labelledby="${idTab(0)}"></div>

        <div class="an-coluna-coracao">
          ${coracaoSVG()}
          <p class="an-estrutura" data-estrutura></p>
        </div>
      </div>
    </div>`;

  // Os ouvintes vão na raiz INTERNA, não no contêiner. O contêiner é o #vista da
  // casca e sobrevive à troca de aba: pendurar nele faria os manipuladores se
  // acumularem a cada visita à Anatomia. A raiz interna é recriada a cada
  // montagem, então os ouvintes antigos morrem com ela.
  const raiz = container.querySelector('.an-raiz');
  const painel = container.querySelector('#an-painel');
  const estrutura = container.querySelector('[data-estrutura]');
  const tabs = [...container.querySelectorAll('.an-tab')];
  let atual = 0;

  function selecionar(i, focar = false) {
    if (!PECAS[i]) return;
    atual = i;
    const p = PECAS[i];

    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    if (focar) tabs[i].focus();

    for (const id of TODAS_ONDAS) {
      container.querySelector(`#${id}`)?.classList.toggle('ativa', p.onda.includes(id));
    }
    for (const id of TODAS_ESTRUTURAS) {
      container.querySelector(`#${id}`)?.classList.toggle('ativa', p.coracao.includes(id));
    }

    painel.setAttribute('aria-labelledby', idTab(i));
    painel.innerHTML = `
      <h2 class="an-titulo">${p.titulo}<span>${p.sub}</span></h2>
      <p class="an-mecanismo">${p.mecanismo}</p>
      <div class="an-prosa">${p.prosa.map((t) => `<p>${t}</p>`).join('')}</div>
      <dl class="an-medidas">
        ${p.medidas.map(([chave, valor]) =>
          `<div class="an-medida"><dt>${chave}</dt><dd>${valor}</dd></div>`).join('')}
      </dl>
      <div class="an-muda">
        <span class="an-muda-rotulo">Quando muda${p.divergencia
          ? ' <span class="divergencia">fontes divergem</span>' : ''}</span>
        <p>${p.muda}</p>
      </div>`;

    estrutura.innerHTML = `acende: <b>${p.estrutura}</b>`;
  }

  raiz.addEventListener('click', (ev) => {
    const alvo = ev.target.closest?.('[data-peca]');
    if (alvo) selecionar(Number(alvo.dataset.peca));
  });

  raiz.addEventListener('keydown', (ev) => {
    if (!ev.target.classList?.contains('an-tab')) return;
    const ultimo = PECAS.length - 1;
    let destino = null;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') destino = atual === ultimo ? 0 : atual + 1;
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') destino = atual === 0 ? ultimo : atual - 1;
    else if (ev.key === 'Home') destino = 0;
    else if (ev.key === 'End') destino = ultimo;
    if (destino === null) return;
    ev.preventDefault();
    selecionar(destino, true);
  });

  selecionar(0);
  return { selecionar };
}
