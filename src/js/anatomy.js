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
 *  6. O IMPULSO ANDA. Ao escolher uma peça, o esquema de condução percorre a
 *     ordem fisiológica até a estrutura daquela peça, e o traçado se escreve
 *     junto, no mesmo relógio. A parada no nó AV é o centro da coisa: ela ocupa
 *     tempo real na linha do tempo, o traçado fica plano enquanto ela dura, e é
 *     exatamente isso que o intervalo PR mede.
 *  7. Na onda T o sentido se inverte. A despolarização ventricular caminha do
 *     endocárdio para o epicárdio e a repolarização volta do epicárdio para o
 *     endocárdio, que é a explicação clássica da concordância da T com o QRS.
 *     A frente verde cresce do centro para fora no QRS e encolhe de fora para
 *     dentro na T. É a mesma geometria, ao contrário.
 *
 * O que a animação NÃO faz, de propósito:
 *
 *  - o traçado sempre se escreve da esquerda para a direita, inclusive na onda
 *    T. O eixo horizontal do ECG é tempo, e tempo não anda para trás. Quem se
 *    inverte é a frente de ativação dentro do músculo, não a caneta;
 *  - na onda U nada acende no coração. A origem da onda U ainda é discutida, e
 *    animar uma estrutura ali seria inventar mecanismo. O traçado desenha, o
 *    esquema fica quieto, e a legenda diz por quê;
 *  - a repolarização atrial não é animada. Ela existe, mas fica escondida
 *    dentro do QRS, e mostrar uma frente para ela sugeriria algo visível no
 *    traçado que não está visível.
 *
 * Sob `prefers-reduced-motion: reduce` nada se move: o esquema aparece inteiro,
 * o botão de repetir some e uma linha explica por quê. A porta é a
 * `respeitaMovimento()` de motion.js, que é a regra do projeto, e que devolve
 * true quando animar é permitido. Ela também devolve false quando o vendor não
 * carregou; nesse caso o botão some sem explicação, porque a causa é técnica e
 * não interessa ao aluno. Nos dois casos a tela continua inteira: o esquema em
 * repouso já é o estado final da animação, então nada aqui é escondido para ser
 * revelado depois.
 *
 * A animação em si não usa `animate()` de propósito. Ela não é uma transição de
 * propriedade entre dois estados: é uma linha do tempo fisiológica com nove
 * marcos, em que o traçado, a frente de ativação e a legenda precisam ler o
 * MESMO relógio a cada quadro, senão a sincronia entre onda e mecanismo, que é
 * a coisa toda que a tela promete, escorrega. Isso é um `requestAnimationFrame`
 * com uma função pura de tempo, e ficou em vinte linhas.
 *
 * A linha do tempo é uma tabela de marcos em milissegundos fisiológicos,
 * multiplicada por uma escala única. A escala é única de propósito: esticar só
 * a pausa do nó AV para ficar mais bonita mentiria sobre a proporção entre a
 * pausa e o resto do ciclo, que é justamente o que se quer ensinar.
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

import { respeitaMovimento } from './motion.js';

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
    divergencia: true,
    medidas: [
      ['Duração, guia do curso', 'até 0,11 s'],
      ['Duração, critério de sobrecarga', 'acima de 0,12 s'],
      ['Amplitude em DII', 'menor que 2,5 mm'],
    ],
    muda: `Alta e pontuda acima de 2,5 mm: sobrecarga atrial direita. Larga e entalhada acima de
      120 ms: sobrecarga atrial esquerda. Ausente, com RR irregularmente irregular: fibrilação
      atrial. Entre 0,11 s e 0,12 s existe uma faixa em que nenhuma das duas convenções afirma
      nada: descreva a medida em vez de nomear diagnóstico.`,
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
      `No coração normal o nó AV é o único caminho elétrico entre átrios e ventrículos, e o atraso
       não é defeito, é função: dá tempo de os átrios terminarem de encher os ventrículos antes da
       contração. É aqui que se decidem todos os bloqueios AV. Quando existe uma via acessória esse
       monopólio se quebra, o impulso desce por fora do nó, não sofre o atraso, e é por isso que a
       pré-excitação encurta o PR.`,
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
       é estreito: muita massa muscular ativada em pouquíssimo tempo.
       <strong>Q</strong> é uma deflexão negativa que vem antes de qualquer positiva,
       <strong>R</strong> é qualquer deflexão positiva e <strong>S</strong> é a negativa que vem
       depois de um R. Complexo inteiramente negativo, sem nenhum R, chama-se <strong>QS</strong>.`,
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
      `Os limiares de supra que definem conduta valem em <strong>duas derivações contíguas</strong>,
       e são por derivação e por sexo: 1 mm ou mais na maioria das derivações; em V2 e V3, 2 mm ou
       mais em homens de 40 anos ou mais, 2,5 mm ou mais em homens abaixo de 40 e 1,5 mm ou mais em
       mulheres de qualquer idade. Supra em uma derivação isolada não fecha o critério.`,
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
       por dever ser plano, qualquer desvio conta. Ter subido ou descido já separa dois caminhos de
       conduta diferentes. O que separa as causas dentro de cada caminho é
       <strong>localizado contra difuso</strong> e <strong>convexo contra côncavo</strong>.`,
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
       <strong>concordante</strong> com o QRS: quando o QRS é positivo, a T também é. O sentido
       oposto é o do caminho: a despolarização vai do endocárdio para o epicárdio e a repolarização
       volta do epicárdio para o endocárdio. Duas inversões, corrente e direção, se cancelam, e o
       vetor da T sai apontando para o mesmo lado do vetor do QRS.`,
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
      ramo. Achatada com onda U: hipocalemia. Antes de chamar de isquemia, lembre que em aVR a T
      invertida é o normal, e que em V1 e em DIII ela é achado comum sem significado isolado.`,
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
      `Meça na derivação em que a onda T termina mais tarde, em geral DII ou V5. O fim da T é onde a
       tangente ao ramo descendente cruza a linha de base, e não onde a onda parece sumir.`,
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
    // Nenhuma estrutura, e isto é conteúdo, não esquecimento. A prosa desta peça
    // diz que a origem da onda U ainda é discutida; acender os ventrículos aqui
    // desmentiria a própria prosa e ensinaria uma origem que ninguém fechou.
    coracao: [],
    estrutura: 'nada acende aqui: a origem da onda U ainda é discutida',
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

      <!-- A janela que varre o traçado da esquerda para a direita durante a
           animação. Revelar por recorte, e não por stroke-dasharray, é
           deliberado: os traços usam vector-effect non-scaling-stroke, e sob
           non-scaling-stroke o tracejado é medido em pixels de tela em parte
           dos navegadores. A conta de comprimento daria resultado diferente em
           cada largura de janela, o que num app cujo alvo primário é o iPad em
           duas orientações é defeito garantido. O recorte é geometria pura, em
           unidades do viewBox, e não depende de zoom nem de largura. -->
      <clipPath id="an-cl-varre">
        <rect id="an-varre" x="0" y="0" width="440" height="250"/>
      </clipPath>
    </defs>
    <rect class="ecg-fundo" width="440" height="250"/>
    <rect width="440" height="250" fill="url(#an-grade)"/>

    <path class="an-linha-base" d="M16 150 L424 150"/>
    <path class="ecg-traco an-fantasma" d="M16 150 L40 150 M292 150 L300 150 M332 150 L424 150"/>
    <line class="an-caneta" x1="16" y1="14" x2="16" y2="236"/>

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
    <defs>
      <clipPath id="an-cl-atrios"><ellipse cx="110" cy="78" rx="70" ry="28"/></clipPath>
      <clipPath id="an-cl-vent"><ellipse cx="106" cy="168" rx="72" ry="52"/></clipPath>
    </defs>

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

    <!-- FRENTES DE ATIVAÇÃO.
         Ficam aqui, entre as câmaras e as vias de condução, para passarem por
         cima do preenchimento da câmara e por baixo dos fios e das legendas.
         Nos átrios a frente é um disco que cresce a partir do nó sinusal,
         recortado pela própria câmara: é a onda se espalhando pelo músculo.
         Nos ventrículos são dois discos concêntricos. O laranja é o tecido já
         repolarizado e fica parado no raio máximo; o verde é o tecido ainda
         despolarizado, e é ele que se mexe. No QRS o verde CRESCE do centro
         para fora, que é o endocárdio ativando o epicárdio. Na onda T o verde
         ENCOLHE de fora para dentro, descobrindo o laranja, que é o epicárdio
         repolarizando antes do endocárdio. O sentido se inverte de verdade, e
         é a mesma geometria em marcha à ré. -->
    <g class="an-fluxo" aria-hidden="true">
      <g clip-path="url(#an-cl-atrios)">
        <circle id="an-fr-a" class="an-front an-front--p" cx="158" cy="62" r="0"/>
      </g>
      <g clip-path="url(#an-cl-vent)">
        <circle id="an-fr-vr" class="an-front an-front--t" cx="106" cy="180" r="104"/>
        <circle id="an-fr-vd" class="an-front an-front--qrs" cx="106" cy="180" r="0"/>
      </g>
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

    <!-- O impulso propriamente dito, por cima de tudo. Um ponto só enquanto o
         caminho é único (nó sinusal, nó AV, His) e dois quando o feixe se
         divide, porque os ramos direito e esquerdo conduzem ao mesmo tempo e
         mostrar um ponto só ali ensinaria que existe uma fila. O anel é a
         espera no nó AV: ele pulsa no lugar, sem sair do sítio, que é
         exatamente o que o impulso está fazendo. -->
    <g class="an-fluxo" aria-hidden="true">
      <circle id="an-espera" class="an-espera" cx="108" cy="110" r="9"/>
      <circle id="an-imp" class="an-imp" cx="158" cy="62" r="5.5"/>
      <circle id="an-imp-e" class="an-imp" cx="104" cy="146" r="4.5"/>
      <circle id="an-imp-d" class="an-imp" cx="104" cy="146" r="4.5"/>
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
  /* iPad deitado tem 768 px de altura, e com o traçado em 22rem o esquema do
     coração terminava 81 px abaixo da dobra. Como a tela só ensina se os dois
     estiverem na mesma vista, em janela baixa o traçado cede altura. O corte é
     por ALTURA de janela e não por largura: quem decide aqui é o quanto de
     vertical existe, não o quanto de horizontal. */
  @media (min-width: 48rem) and (max-height: 50rem) {
    .an-tira .an-svg { max-height: 17rem; }
  }

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
  .an-svg .peca.ativa { opacity: 1; --ecg-tinta: var(--ecg-destaque); --ecg-traco-l: 2.6px; }
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
  /* O botão de repetir divide a linha com as abas em vez de ocupar uma faixa
     só dele. Cada faixa entre o traçado e o coração é altura que separa a onda
     do mecanismo, e separar os dois é justamente o que esta tela não pode
     fazer. Em 375 px ele desce para a linha de baixo, ainda com 44 px. */
  .an-linha-tabs {
    display: flex; flex-wrap: wrap; align-items: center;
    gap: var(--e-3) var(--e-4); justify-content: space-between;
  }
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
  /* DUAS COLUNAS JÁ NO iPAD, e não só a partir de 60rem.
     Empilhado em 834 px o coração caía 575 px abaixo da dobra: dava para ver a
     onda se desenhando ou o impulso andando, nunca os dois. Como a tela inteira
     existe para amarrar um ao outro, isso não era questão de conforto, era a
     promessa quebrada no aparelho que é o alvo principal. A partir de 48rem o
     coração sobe para o lado do painel, logo abaixo do traçado. */
  .an-baixo { display: grid; gap: var(--e-5); }
  @media (min-width: 48rem) {
    .an-baixo {
      grid-template-columns: minmax(0, 1fr) minmax(0, 15rem);
      align-items: start;
    }
  }
  @media (min-width: 60rem) {
    .an-baixo {
      grid-template-columns: minmax(0, 1fr) minmax(0, 17rem);
      gap: var(--e-6);
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

  /* Empilhado, o coração vem ANTES do painel de texto. Depois dele, o aluno
     teria de rolar seiscentos pixels de prosa entre a onda e a estrutura que a
     produz, e a animação estaria acontecendo fora da tela. A prosa é leitura
     demorada e pode esperar; o par onda e mecanismo, não. */
  .an-coluna-coracao {
    order: -1;
    border-bottom: 1px solid var(--linha); padding-bottom: var(--e-5);
  }
  @media (min-width: 48rem) {
    .an-coluna-coracao {
      order: 0;
      border-bottom: none; padding-bottom: 0;
      border-left: 1px solid var(--linha); padding-left: var(--e-5);
    }
  }
  @media (min-width: 60rem) {
    .an-coluna-coracao { padding-left: var(--e-6); }
  }
  .an-estrutura {
    font-family: var(--ff-mono); font-size: var(--t--2);
    color: var(--tinta-3); text-align: center; margin-top: var(--e-3);
    /* Altura reservada para a legenda mais longa da narração. Sem isto a
       coluna do coração pula de altura a cada etapa da animação, e no iPad em
       retrato o pulo empurra o painel de texto. */
    min-height: 4.2em;
  }
  @media (min-width: 60rem) { .an-estrutura { min-height: 5.6em; } }
  .an-estrutura b { color: var(--tinta); font-weight: 600; }
  .an-estrutura.narrando { color: var(--tinta-2); }

  /* --- animação do impulso --- */

  .an-nota { font-size: var(--t--2); color: var(--tinta-3); max-width: 62ch; }

  /* Durante a corrida tudo recua e só o que está acontecendo agora fica de pé.
     Estas regras vêm depois das de .peca.ativa de propósito: com a mesma
     especificidade, a ordem decide, e enquanto a animação roda quem manda é o
     relógio, não a seleção. */
  /* A transição de 220 ms serve para a seleção, onde o aluno é quem manda no
     ritmo. Na animação ela atrapalha: His, ramos e Purkinje duram de 60 a 110 ms
     na tela, menos do que a própria transição, e com 220 ms nenhum dos três
     chegaria a acender. Ficariam três borrões cinzentos justamente no trecho
     que precisa parecer rápido. Durante a corrida a transição encurta. */
  .an-svg.an-rodando .peca { opacity: 0.13; transition-duration: 70ms; }
  .an-svg.an-rodando .peca.viva {
    opacity: 1; --ecg-tinta: var(--ecg-destaque); --ecg-traco-l: 2.6px;
  }
  .an-svg.an-rodando .peca.viva .an-legenda { fill: var(--tinta); font-weight: 600; }

  /* O fantasma fica fora do recorte: é a linha de base do papel, não onda. Se
     ele também fosse varrido, a tira começaria vazia e pareceria quebrada. */
  .an-svg.an-rodando .ecg-traco:not(.an-fantasma) { clip-path: url(#an-cl-varre); }

  .an-caneta {
    stroke: var(--ecg-destaque); stroke-width: 1.2px; opacity: 0;
    vector-effect: non-scaling-stroke;
  }
  .an-svg.an-rodando .an-caneta { opacity: 0.45; }

  .an-fluxo { pointer-events: none; }
  .an-front { opacity: 0; fill-opacity: 0.32; }
  .an-front--p   { fill: var(--pap-p); }
  .an-front--qrs { fill: var(--pap-qrs); }
  .an-front--t   { fill: var(--pap-t); }

  .an-imp {
    fill: var(--ecg-destaque); stroke: var(--ecg-bg); stroke-width: 1.4; opacity: 0;
  }
  .an-espera {
    fill: none; stroke: var(--pap-t); stroke-width: 2.2; opacity: 0;
  }

  /* Sem movimento: o esquema já nasce no estado final. Nada é escondido para
     ser revelado, então não há o que degradar. */
  @media (prefers-reduced-motion: reduce) {
    .an-svg .peca { transition: none; }
    .an-svg.an-rodando .peca { opacity: 0.3; }
    .an-svg.an-rodando .peca.ativa { opacity: 1; }
    .an-svg.an-rodando .ecg-traco:not(.an-fantasma) { clip-path: none; }
    .an-fluxo, .an-caneta { display: none; }
  }
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
   LINHA DO TEMPO
   ==========================================================================

   Os marcos estão em milissegundos FISIOLÓGICOS, contados a partir da descarga
   do nó sinusal, e não em milissegundos de tela. A tela é obtida multiplicando
   tudo por uma escala única. Escala única é a regra que sustenta a honestidade
   da coisa: se a pausa do nó AV fosse esticada sozinha para ficar mais visível,
   o aluno guardaria uma proporção errada entre a pausa e o resto do ciclo, e a
   proporção é o ensinamento.

   Os números, e de onde saem:

     P: 100 ms de despolarização atrial, dentro do limite de 120 ms que a
        própria tela ensina.
     Atraso no nó AV: o impulso alcança o nó por volta de 35 ms depois do começo
        da P, portanto ainda DURANTE a onda P, e só sai por volta de 130 ms
        depois. Sobram cerca de 95 ms parado. É por isso que a pausa começa
        antes de o traçado ficar plano: o nó já está segurando enquanto os
        átrios terminam de despolarizar.
     His, ramos e Purkinje: cerca de 45 ms somados, sem nada visível na
        superfície, porque a massa envolvida é pequena demais para gerar
        deflexão detectável no eletrodo de pele.
     Resultado: PR de 172 ms, dentro de 120 a 200 ms.
     QRS de 90 ms, dentro do limite de 120 ms.
     ST de 100 ms e T de 200 ms, dando um QT de 390 ms, compatível com uma
        frequência em torno de 75 bpm.
     U: entra depois de um intervalo curto, e é a única peça sem contrapartida
        no esquema do coração.

   O desenho do traçado está fora de escala no eixo x, de propósito, para caber
   rótulo e colchete. Por isso a conversão tempo → posição é uma tabela de
   âncoras interpoladas, e não uma regra de três. Cada âncora amarra um marco da
   fisiologia ao ponto do desenho onde aquele marco de fato está. */

const ESCALA = 5;

const LT = {
  saIni: 0,    saFim: 60,
  pIni: 20,    pFim: 120,
  avIni: 55,   avFim: 150,
  hisIni: 150, hisFim: 172,
  ramIni: 170, ramFim: 186,
  purIni: 184, purFim: 196,
  qrsIni: 192, qrsFim: 282,
  stIni: 282,  stFim: 382,
  tIni: 382,   tFim: 582,
  uIni: 592,   uFim: 652,
};

/* Até onde cada peça toca. A ordem é a de PECAS. Todas partem do nó sinusal:
   ver a peça no lugar dela dentro do ciclo inteiro vale mais do que economizar
   dois segundos.

   Onde a fronteira é compartilhada, a corrida para dois milissegundos ANTES
   dela. O intervalo PR termina onde o QRS começa; parar em cima do marco
   deixaria PR e QRS acesos ao mesmo tempo no quadro que fica meio segundo na
   tela, e um quadro parado com duas peças acesas ensina que as duas são a mesma
   coisa, que é exatamente o erro que esta tela existe para desfazer. */
const FIM_DA_PECA = [
  LT.pFim,         // P
  LT.qrsIni - 2,   // PR: encosta no começo do QRS sem acendê-lo
  LT.qrsFim - 2,   // QRS
  LT.qrsFim + 26,  // J: depois do fim do QRS, antes de o ST assumir
  LT.stFim - 2,    // ST
  LT.tFim,         // T
  LT.tFim,         // QT
  LT.uFim,         // U
];

/* Janela de cada peça do traçado. As sobreposições são verdadeiras: o intervalo
   PR começa junto com a onda P e o QT cobre QRS, ST e T. */
const JANELA_ONDA = {
  'w-p':   [LT.pIni, LT.pFim],
  'w-pr':  [LT.pIni, LT.qrsIni],
  'w-qrs': [LT.qrsIni, LT.qrsFim],
  'w-j':   [LT.qrsFim - 16, LT.qrsFim + 30],
  // O ST só assume depois de o ponto J ter sido visto. Os dois ocupam o mesmo
  // instante na fisiologia, e sem esta folga o J nunca apareceria sozinho.
  'w-st':  [LT.stIni + 30, LT.stFim],
  'w-t':   [LT.tIni, LT.tFim],
  'w-qt':  [LT.qrsIni, LT.tFim],
  'w-u':   [LT.uIni, LT.uFim],
};

const JANELA_CORACAO = {
  'c-sa':          [LT.saIni, LT.saFim],
  'c-atrios':      [LT.pIni, LT.pFim + 12],
  'c-av':          [LT.avIni, LT.avFim],
  'c-his':         [LT.hisIni, LT.hisFim],
  'c-ramos':       [LT.ramIni, LT.ramFim],
  'c-purkinje':    [LT.purIni, LT.purFim],
  'c-ventriculos': [LT.qrsIni, LT.tFim],
};

/* Legenda viva embaixo do coração. É a mesma frase que o painel diria, dita no
   instante em que a coisa acontece, que é quando ela cola.

   Os marcos entram DOIS milissegundos depois da fronteira, e não em cima dela,
   porque a corrida de cada peça para exatamente no marco seguinte. Sem a folga,
   o último quadro da peça P mostraria a legenda do nó AV, o último da peça PR
   mostraria a do QRS, e assim por diante: cada peça terminaria contando a
   história da peça de depois. Dois milissegundos fisiológicos são dez de tela,
   invisíveis numa corrida inteira, e resolvem. */
const NARRACAO = [
  [LT.saIni,      'o nó sinusal dispara'],
  [LT.pIni,       'a despolarização atravessa os dois átrios: é a onda P'],
  [LT.pFim + 2,   'retida no nó AV. O traçado fica plano, e é este silêncio que o intervalo PR mede'],
  [LT.hisIni,     'desce pelo His, pelos ramos e pela rede de Purkinje'],
  [LT.qrsIni + 2, 'os dois ventrículos despolarizam quase juntos: é o QRS'],
  [LT.qrsFim + 2, 'fim do QRS: este é o ponto J, onde o supra e o infra se medem'],
  [LT.stIni + 30, 'tudo despolarizado ao mesmo tempo, sem vetor: o segmento ST'],
  [LT.tIni + 2,   'a repolarização volta no sentido inverso, do epicárdio para o endocárdio'],
  [LT.uIni,       'onda U. A origem ainda é discutida, então de propósito nada acende aqui'],
];

/* tempo fisiológico → posição x no desenho do traçado. */
const ANCORAS = [
  [LT.saIni,  16], [LT.pIni,  40], [LT.pFim,  100], [LT.qrsIni, 120],
  [LT.qrsFim, 168], [LT.stFim, 206], [LT.tFim, 292],
  [LT.uIni,   300], [LT.uFim,  332], [LT.uFim + 20, 424],
];

/* Trajetos do impulso, em coordenadas do viewBox do coração. */
const VIA_ATRIO = [[158, 62], [140, 88], [108, 110]];
const VIA_HIS   = [[108, 112], [104, 146]];
const VIA_ESQ   = [[104, 146], [74, 202], [57, 211]];
const VIA_DIR   = [[104, 146], [136, 198], [153, 208]];

const preso = (v, a, b) => (v < a ? a : v > b ? b : v);
const prog = (t, a, b) => preso((t - a) / (b - a), 0, 1);
const dentro = (t, [a, b]) => t >= a && t <= b;

/** Interpola um trajeto de vértices igualmente espaçados no tempo. */
function naVia(pontos, u) {
  const n = pontos.length - 1;
  const s = preso(u, 0, 1) * n;
  const i = Math.min(Math.floor(s), n - 1);
  const f = s - i;
  const a = pontos[i];
  const b = pontos[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

/** Converte tempo fisiológico na posição x do desenho, pelas âncoras. */
function xEm(t) {
  if (t <= ANCORAS[0][0]) return ANCORAS[0][1];
  for (let i = 1; i < ANCORAS.length; i += 1) {
    const [t0, x0] = ANCORAS[i - 1];
    const [t1, x1] = ANCORAS[i];
    if (t <= t1) return x0 + (x1 - x0) * (t1 === t0 ? 1 : (t - t0) / (t1 - t0));
  }
  return ANCORAS[ANCORAS.length - 1][1];
}

function frase(t) {
  let saida = NARRACAO[0][1];
  for (const [quando, texto] of NARRACAO) {
    if (t >= quando) saida = texto;
  }
  return saida;
}

/* ==========================================================================
   MONTAGEM
   ========================================================================== */

const idTab = (i) => `an-tab-${i}`;

/* A peça sem estrutura correspondente é a onda U, e o texto dela já é uma frase
   inteira. Prefixar "acende:" ali sairia como "acende: nada acende aqui". */
const textoEstrutura = (p) =>
  (p.coracao.length ? `acende: <b>${p.estrutura}</b>` : `<b>${p.estrutura}</b>`);

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

      <!-- Traçado, abas e esquema são UM bloco, e por isso andam no ritmo
           interno e não no ritmo de seção. Soltos no empilha-g, cada vão entre
           eles valia --ritmo-secao, que em 1440 px é 4rem: duas dessas faixas
           empurravam o coração 176 px para longe do traçado e tiravam o par da
           tela junto. O vão grande continua existindo onde ele serve, que é
           entre a abertura, este bloco e a nota. -->
      <div class="empilha an-bloco">
        <div class="ecg-tira an-tira">
          <div class="ecg-cabeca">
            <span>Batimento normal · DII</span>
            <span class="ecg-calib-texto">esquema ampliado, grade ilustrativa</span>
          </div>
          ${batimentoSVG()}
        </div>

        <div class="an-linha-tabs">
          <div class="an-tabs" role="tablist" aria-label="Componentes do batimento">
            ${PECAS.map((p, i) => `<button class="an-tab" type="button" role="tab"
                id="${idTab(i)}" data-peca="${i}" aria-controls="an-painel"
                aria-selected="${i === 0}" tabindex="${i === 0 ? '0' : '-1'}">${p.rotulo}</button>`).join('')}
          </div>
          <button class="btn btn--contorno" type="button" data-repetir hidden>Repetir a animação</button>
        </div>

        <div class="an-baixo">
          <div class="an-painel" id="an-painel" role="tabpanel" tabindex="0"
               aria-labelledby="${idTab(0)}"></div>

          <div class="an-coluna-coracao">
            ${coracaoSVG()}
            <p class="an-estrutura" data-estrutura></p>
          </div>
        </div>
      </div>

      <p class="an-nota" data-nota></p>
    </div>`;

  // Os ouvintes vão na raiz INTERNA, não no contêiner. O contêiner é o #vista da
  // casca e sobrevive à troca de aba: pendurar nele faria os manipuladores se
  // acumularem a cada visita à Anatomia. A raiz interna é recriada a cada
  // montagem, então os ouvintes antigos morrem com ela.
  const raiz = container.querySelector('.an-raiz');
  const painel = container.querySelector('#an-painel');
  const estrutura = container.querySelector('[data-estrutura]');
  const tabs = [...container.querySelectorAll('.an-tab')];
  const botaoRepetir = container.querySelector('[data-repetir]');
  const nota = container.querySelector('[data-nota]');
  let atual = 0;

  /* ---- referências da animação, buscadas uma vez ---------------------- */

  const svgTira = container.querySelector('.an-tira .an-svg');
  const svgCoracao = container.querySelector('.an-coracao');
  const nos = {
    varre:  container.querySelector('#an-varre'),
    caneta: container.querySelector('.an-caneta'),
    frA:    container.querySelector('#an-fr-a'),
    frVd:   container.querySelector('#an-fr-vd'),
    frVr:   container.querySelector('#an-fr-vr'),
    imp:    container.querySelector('#an-imp'),
    impE:   container.querySelector('#an-imp-e'),
    impD:   container.querySelector('#an-imp-d'),
    espera: container.querySelector('#an-espera'),
  };
  const grupos = [...TODAS_ONDAS, ...TODAS_ESTRUTURAS]
    .map((id) => [id, container.querySelector(`#${id}`)])
    .filter(([, el]) => el);

  // Duas casas bastam num viewBox de 440 unidades, e evitam encher o SVG de
  // atributos com dezessete decimais a sessenta quadros por segundo.
  const marca = (el, atr, valor) =>
    el && el.setAttribute(atr, String(Math.round(valor * 100) / 100));
  const opacidade = (el, v) => { if (el) el.style.opacity = String(preso(v, 0, 1)); };

  let quadro = null;
  let comecou = 0;
  let ate = 0;

  function parar() {
    if (quadro !== null) cancelAnimationFrame(quadro);
    quadro = null;
  }

  /** Estado de repouso: o batimento inteiro, com a peça escolhida acesa. */
  function assentar() {
    parar();
    svgTira?.classList.remove('an-rodando');
    svgCoracao?.classList.remove('an-rodando');
    for (const [, el] of grupos) el.classList.remove('viva');
    marca(nos.varre, 'width', 440);
    for (const el of [nos.frA, nos.frVd, nos.frVr, nos.imp, nos.impE, nos.impD, nos.espera]) {
      opacidade(el, 0);
    }
    estrutura.classList.remove('narrando');
    estrutura.innerHTML = textoEstrutura(PECAS[atual]);
  }

  /**
   * Pinta um instante da linha do tempo. Função pura de `t`: chamar duas vezes
   * com o mesmo `t` dá a mesma tela. É o que garante que traçado, frente de
   * ativação e legenda nunca saiam de sincronia, porque os três leem o mesmo
   * número no mesmo quadro.
   */
  function pintar(t) {
    for (const [id, el] of grupos) {
      const janela = JANELA_ONDA[id] || JANELA_CORACAO[id];
      el.classList.toggle('viva', janela ? dentro(t, janela) : false);
    }

    const x = xEm(t);
    marca(nos.varre, 'width', x);
    marca(nos.caneta, 'x1', x);
    marca(nos.caneta, 'x2', x);

    // Átrios: a frente cresce a partir do nó sinusal e se apaga sem direção
    // durante o QRS. A repolarização atrial existe, mas fica escondida dentro
    // do QRS, e dar direção a ela aqui sugeriria algo visível que não é.
    marca(nos.frA, 'r', 132 * prog(t, LT.pIni, LT.pFim));
    opacidade(nos.frA, t < LT.pIni ? 0 : 1 - prog(t, LT.qrsIni, LT.qrsFim));

    // Ventrículos: verde cresce do centro para fora no QRS, fica cheio no ST e
    // encolhe de fora para dentro na T, descobrindo o laranja por baixo.
    const rMax = 104;
    let rVerde = 0;
    if (t >= LT.tIni) rVerde = rMax * (1 - prog(t, LT.tIni, LT.tFim));
    else if (t >= LT.stIni) rVerde = rMax;
    else rVerde = rMax * prog(t, LT.qrsIni, LT.qrsFim);
    marca(nos.frVd, 'r', rVerde);
    const somemVentriculos = 1 - prog(t, LT.tFim, LT.tFim + 40);
    opacidade(nos.frVd, t < LT.qrsIni ? 0 : somemVentriculos);
    opacidade(nos.frVr, t < LT.tIni ? 0 : somemVentriculos);

    // Impulso: um ponto enquanto o caminho é único.
    let ponto;
    if (t < LT.pIni) ponto = VIA_ATRIO[0];
    else if (t < LT.avIni) ponto = naVia(VIA_ATRIO, prog(t, LT.pIni, LT.avIni));
    else if (t < LT.avFim) ponto = [108, 110];
    else ponto = naVia(VIA_HIS, prog(t, LT.hisIni, LT.hisFim));
    marca(nos.imp, 'cx', ponto[0]);
    marca(nos.imp, 'cy', ponto[1]);
    opacidade(nos.imp, 1 - prog(t, LT.hisFim, LT.hisFim + 16));

    // Dois pontos quando o feixe se divide: os ramos conduzem ao mesmo tempo.
    const uRamo = prog(t, LT.ramIni, LT.purFim);
    const pe = naVia(VIA_ESQ, uRamo);
    const pd = naVia(VIA_DIR, uRamo);
    marca(nos.impE, 'cx', pe[0]); marca(nos.impE, 'cy', pe[1]);
    marca(nos.impD, 'cx', pd[0]); marca(nos.impD, 'cy', pd[1]);
    const vivoRamo = t < LT.ramIni ? 0 : 1 - prog(t, LT.purFim, LT.purFim + 16);
    opacidade(nos.impE, vivoRamo);
    opacidade(nos.impD, vivoRamo);

    // A espera no nó AV: anel que pulsa no lugar, sem sair do sítio. O
    // movimento é do anel, não do impulso, justamente porque o impulso ali não
    // está indo a lugar nenhum.
    if (t >= LT.avIni && t <= LT.avFim) {
      const fase = ((t - LT.avIni) / 32) % 1;
      marca(nos.espera, 'r', 9 + 7 * fase);
      opacidade(nos.espera, 0.85 * (1 - fase));
    } else {
      opacidade(nos.espera, 0);
    }

    const texto = frase(t);
    if (estrutura.textContent !== texto) estrutura.textContent = texto;
  }

  /**
   * Roda até o marco da peça escolhida e segura o último quadro por meio
   * segundo antes de devolver a tela ao repouso. A pausa final existe para o
   * olho terminar de ler o que acabou de acontecer.
   */
  function passo(agora) {
    // A vista inteira é substituída ao trocar de aba no app. Sem esta guarda o
    // laço continuaria rodando contra nós desconectados, para sempre.
    if (!raiz.isConnected) { parar(); return; }
    const decorrido = agora - comecou;
    const t = decorrido / ESCALA;
    if (t < ate) {
      pintar(t);
      quadro = requestAnimationFrame(passo);
      return;
    }
    pintar(ate);
    if (decorrido < ate * ESCALA + 520) {
      quadro = requestAnimationFrame(passo);
      return;
    }
    assentar();
  }

  function tocar() {
    parar();
    // requestAnimationFrame não roda em aba de fundo. Animar ali deixaria o
    // traçado escondido atrás do recorte até o aluno voltar, e ele voltaria
    // para uma tira quase vazia. Em aba de fundo a tela já nasce pronta.
    if (!respeitaMovimento() || document.hidden) { assentar(); return; }
    estrutura.classList.add('narrando');
    svgTira?.classList.add('an-rodando');
    svgCoracao?.classList.add('an-rodando');
    ate = FIM_DA_PECA[atual] ?? LT.tFim;
    comecou = performance.now();
    pintar(0);
    quadro = requestAnimationFrame(passo);
  }

  function ajustarControles() {
    const podeAnimar = respeitaMovimento();
    botaoRepetir.hidden = !podeAnimar;
    // A causa "vendor não carregou" é técnica e não interessa ao aluno: ali o
    // botão apenas some. Já a preferência do sistema merece explicação, senão
    // parece que a tela está quebrada.
    const pediuMenos = !podeAnimar
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    nota.textContent = pediuMenos
      ? 'O seu sistema pede menos movimento, então a animação está desligada e o esquema aparece inteiro de uma vez.'
      : 'A animação é esquemática. Ela mostra a ordem dos eventos e a duração de um em relação ao outro, não a forma real da frente de ativação.';
  }

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

    estrutura.classList.remove('narrando');
    estrutura.innerHTML = textoEstrutura(p);
    tocar();
  }

  raiz.addEventListener('click', (ev) => {
    if (ev.target.closest?.('[data-repetir]')) { tocar(); return; }
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

  // iPadOS e iOS trocam a preferência de movimento sozinhos quando a bateria
  // entra em economia. Sem este ouvinte o botão ficaria mentindo até o aluno
  // recarregar a página.
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const aoMudarMovimento = () => {
    ajustarControles();
    if (!respeitaMovimento()) assentar();
  };
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', aoMudarMovimento);
  }

  ajustarControles();
  selecionar(0);
  return { selecionar, tocar, parar: assentar };
}
