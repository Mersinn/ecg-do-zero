/**
 * Tela "O papel".
 *
 * Quatro coisas, nesta ordem, porque é a ordem em que elas se sustentam:
 *
 *  1. o papel é um gráfico (largura é tempo, altura é voltagem);
 *  2. quadradinho e quadradão, com os quatro números cotados SOBRE a grade real
 *     ampliada, não numa tabela: número solto não vira medida, número em cima da
 *     coisa medida vira;
 *  3. o pulso de calibração, que é o degrau do começo da tira. O autor viu esse
 *     degrau e não soube o que era. Aqui ele é ampliado, apontado, e o aluno pode
 *     cortar o ganho pela metade para ver o traçado inteiro encolher junto;
 *  4. a régua da frequência, com as duas contas chegando ao mesmo número na tela.
 *
 * Todo desenho técnico (cotas, setas, grade ampliada) é SVG escrito aqui. Não é
 * ícone: é o instrumento de medida em si, e precisa estar na escala certa.
 *
 * Convenção herdada do motor e mantida aqui: NENHUMA pintura em atributo de
 * apresentação do SVG. `var()` dentro de atributo não é confiável no Chromium, e
 * o alvo inclui Chrome no Android. Cor e espessura vêm sempre de classe.
 */

import {
  renderizarTira,
  ritmoRegular,
  msParaMm,
  PAPEL,
  BATIMENTO_PADRAO,
  QRS,
} from '../ecg/engine.js';
import { PADROES, montarRitmo } from '../ecg/library.js';

/* ==========================================================================
   BASE
   ========================================================================== */

const mmPx = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mm')) || 3;

/** Número com vírgula decimal, como se escreve em laudo em português. */
const virg = (n, casas = 2) => Number(n).toFixed(casas).replace('.', ',');

const DERIVACAO = PADROES?.normal?.derivacao || 'DII';

/** Instante do pico do R dentro do QRS normal, em ms a partir do início dele. */
const PICO_R = QRS.normal.reduce((a, b) => (Math.abs(b[1]) > Math.abs(a[1]) ? b : a))[0];

const REGUA = { min: 2, max: 10, inicial: 4, duracao: 4000, alturaMm: 30 };
const CALIB = { duracao: 3200, alturaMm: 30 };

/* ==========================================================================
   ESTILO PRÓPRIO DA TELA
   Só o que é diagrama técnico. Tudo o mais usa os componentes da folha global.
   ========================================================================== */

const ESTILO = `<style>
  .pap { --pap-max-fig: 30rem; }

  .pap-titulo { font-weight: 380; }
  .pap-titulo b { font-weight: 760; }
  .pap-frase {
    font-family: var(--ff-titulo);
    font-size: var(--t-2); line-height: 1.3; font-weight: 420;
    color: var(--tinta-2); max-width: 26ch; letter-spacing: -0.01em;
  }
  .pap-frase b { font-weight: 700; color: var(--tinta); }

  .pap-fig { margin: 0; }
  .pap-fig svg { width: 100%; height: auto; max-width: var(--pap-max-fig); margin-inline: auto; }
  .pap-cap { font-size: var(--t--2); color: var(--tinta-3); margin-top: var(--e-2); }
  .pap-fig--larga { --pap-max-fig: 34rem; }

  /* grade ampliada: a hairline do papel real ficaria invisível neste aumento */
  .pap-zoom .ecg-grade-1 { stroke-width: 1.1; }
  .pap-zoom .ecg-grade-5 { stroke-width: 2; }
  .pap-pulso .ecg-grade-1 { stroke-width: 1; }
  .pap-pulso .ecg-grade-5 { stroke-width: 1.8; }

  .pap-tinta { fill: none; stroke: var(--ecg-tinta); stroke-width: 3; stroke-linejoin: miter; stroke-linecap: butt; }
  .pap-base { fill: none; stroke: var(--ecg-tinta); stroke-width: 1.4; stroke-dasharray: 5 5; opacity: 0.5; }

  .pap-qd { fill: color-mix(in srgb, var(--acento) 12%, transparent); stroke: var(--acento); stroke-width: 2; }
  .pap-qi { fill: color-mix(in srgb, var(--info) 20%, transparent); stroke: var(--info); stroke-width: 2; }

  .pap-cota { fill: none; stroke-width: 1.6; }
  .pap-cota--a { stroke: var(--acento); }
  .pap-cota--i { stroke: var(--info); }
  .pap-cota--n { stroke: var(--tinta-2); }
  .pap-ext { fill: none; stroke-width: 1; stroke-dasharray: 3 3; opacity: 0.75; }
  .pap-ext--a { stroke: var(--acento); }
  .pap-ext--i { stroke: var(--info); }
  .pap-ext--n { stroke: var(--tinta-3); }

  .pap-num { font-size: 13px; font-weight: 700; }
  .pap-num--a { fill: var(--acento); }
  .pap-num--i { fill: var(--info); }
  .pap-num--n { fill: var(--tinta); }
  .pap-nome { font-size: 10px; fill: var(--tinta-3); }
  .pap-nome, .pap-num {
    font-family: var(--ff-mono); font-variant-numeric: tabular-nums;
    paint-order: stroke; stroke: var(--ecg-bg); stroke-width: 4px; stroke-linejoin: round;
  }

  /* --- calibração --- */
  .pap-opcoes { display: flex; flex-wrap: wrap; gap: var(--e-2); }
  .pap-consequencia {
    font-size: var(--t-0); color: var(--tinta-2);
    border-left: 2px solid var(--linha-2); padding-left: var(--e-3);
    max-width: 52ch;
  }
  .pap-consequencia[data-alerta="true"] { border-left-color: var(--perigo); color: var(--tinta); }
  .pap-consequencia b { color: var(--perigo); }

  /* A tira é desenhada em escala real de milímetro, então a moldura acompanha a
     largura do papel em vez de esticar até a coluna. Esticar quebraria a escala. */
  .pap-papel { width: fit-content; max-width: 100%; }

  /* --- régua --- */
  .pap-cotas-camada { position: absolute; inset: 0; pointer-events: none; }
  .pap-faixa { fill: var(--acento); opacity: 0.07; }
  .pap-resultado {
    display: grid; gap: var(--e-3);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    align-items: end;
  }
  .pap-fc { display: flex; align-items: baseline; gap: var(--e-2); }
  .pap-fc-num {
    font-family: var(--ff-mono); font-variant-numeric: tabular-nums;
    font-size: var(--t-4); font-weight: 700; line-height: 1; letter-spacing: -0.03em;
  }
  .pap-fc-uni { font-family: var(--ff-mono); font-size: var(--t--1); color: var(--tinta-3); }
  .pap-fc[data-status="alterado"] .pap-fc-num { color: var(--perigo); }
  .pap-fc[data-status="normal"] .pap-fc-num { color: var(--tinta); }
  .pap-fc-nota { font-size: var(--t--1); color: var(--tinta-3); }

  .pap-contas { display: grid; gap: var(--e-2); }
  .pap-conta {
    display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--e-2);
    font-family: var(--ff-mono); font-variant-numeric: tabular-nums;
    font-size: var(--t-0);
    padding-block: var(--e-2); border-top: 1px solid var(--linha);
  }
  .pap-conta:first-child { border-top: none; }
  .pap-conta-rot { font-size: var(--t--2); color: var(--tinta-3); flex: 0 0 100%; }
  .pap-conta b { font-weight: 700; }

  .pap-multiplos {
    display: grid; grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 2px; list-style: none; padding: 0; margin: 0;
    max-width: 30rem;
  }
  .pap-multiplos li {
    display: grid; gap: 1px; justify-items: center;
    padding: var(--e-2) 2px; border-radius: var(--r-1);
    border: 1px solid var(--linha);
    font-family: var(--ff-mono); font-variant-numeric: tabular-nums;
  }
  .pap-multiplos li[data-ativo="true"] {
    background: var(--acento-fraco); border-color: var(--acento-borda);
  }
  .pap-mq { font-size: var(--t--2); color: var(--tinta-3); }
  .pap-mb { font-size: var(--t-0); font-weight: 700; }
  .pap-multiplos li[data-ativo="true"] .pap-mb { color: var(--acento); }

  .pap-limite {
    font-size: var(--t--1); color: var(--tinta-2);
    border-left: 2px solid var(--perigo); padding-left: var(--e-3);
    max-width: 56ch;
  }
</style>`;

/* ==========================================================================
   FIGURA 1 · grade ampliada com os quatro números cotados
   ========================================================================== */

/**
 * Cotas de desenho técnico: linha de medida com tique perpendicular nas pontas e
 * linha de chamada tracejada saindo da coisa medida. É a convenção de prancha,
 * e é o que faz o número pertencer ao desenho em vez de flutuar ao lado dele.
 */
function svgZoomGrade() {
  const U = 12;                       // unidades por milímetro (aumento de 4x)
  const gx = 76, gy = 16, gw = 240, gh = 180;   // 20 mm x 15 mm de papel
  const gxf = gx + gw, gyf = gy + gh;
  const qd = U * 5;                   // lado do quadradão

  const qiY = gyf - U;                // quadradinho destacado: canto inferior esquerdo
  const colCota = 64;                 // coluna das cotas verticais
  const nivel1 = gyf + 22;            // cota horizontal do quadradinho
  const nivel2 = gyf + 46;            // cota horizontal do quadradão
  const t = 5;                        // meio-comprimento do tique de ponta

  return `<svg class="pap-zoom" viewBox="0 0 332 252" role="img" aria-label="Grade de papel de ECG ampliada. Um quadradinho de 1 milímetro vale 0,04 segundo na horizontal e 0,1 milivolt na vertical. Um quadradão de 5 milímetros vale 0,20 segundo e 0,5 milivolt.">
  <defs>
    <pattern id="pap-zoom-grade" width="${qd}" height="${qd}" patternUnits="userSpaceOnUse">
      <path class="ecg-grade-1" d="M0 0H${qd}M0 ${U}H${qd}M0 ${U * 2}H${qd}M0 ${U * 3}H${qd}M0 ${U * 4}H${qd}M0 0V${qd}M${U} 0V${qd}M${U * 2} 0V${qd}M${U * 3} 0V${qd}M${U * 4} 0V${qd}"/>
      <path class="ecg-grade-5" d="M0 0H${qd}M0 0V${qd}"/>
    </pattern>
  </defs>

  <rect class="ecg-fundo" x="${gx}" y="${gy}" width="${gw}" height="${gh}"/>
  <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#pap-zoom-grade)"/>

  <rect class="pap-qd" x="${gx}" y="${gy}" width="${qd}" height="${qd}"/>
  <rect class="pap-qi" x="${gx}" y="${qiY}" width="${U}" height="${U}"/>

  <text class="pap-nome" x="${gx + qd + 10}" y="${gy + qd / 2 + 4}">1 quadradão · 5 mm</text>
  <text class="pap-nome" x="${gx + U + 10}" y="${qiY + U - 2}">1 quadradinho · 1 mm</text>

  <path class="pap-ext pap-ext--a" d="M${gx} ${gy} H${colCota - t} M${gx} ${gy + qd} H${colCota - t}"/>
  <path class="pap-cota pap-cota--a" d="M${colCota} ${gy} V${gy + qd} M${colCota - t} ${gy} H${colCota + t} M${colCota - t} ${gy + qd} H${colCota + t}"/>
  <text class="pap-num pap-num--a" x="${colCota - 10}" y="${gy + qd / 2 + 5}" text-anchor="end">0,5 mV</text>

  <path class="pap-ext pap-ext--i" d="M${gx} ${qiY} H${colCota - t} M${gx} ${gyf} H${colCota - t}"/>
  <path class="pap-cota pap-cota--i" d="M${colCota} ${qiY} V${gyf} M${colCota - t} ${qiY} H${colCota + t} M${colCota - t} ${gyf} H${colCota + t}"/>
  <text class="pap-num pap-num--i" x="${colCota - 10}" y="${gyf - 1}" text-anchor="end">0,1 mV</text>

  <path class="pap-ext pap-ext--i" d="M${gx} ${gyf} V${nivel1 + t} M${gx + U} ${gyf} V${nivel1 + t}"/>
  <path class="pap-cota pap-cota--i" d="M${gx} ${nivel1} H${gx + U} M${gx} ${nivel1 - t} V${nivel1 + t} M${gx + U} ${nivel1 - t} V${nivel1 + t}"/>
  <text class="pap-num pap-num--i" x="${gx + U + 12}" y="${nivel1 + 5}">0,04 s</text>

  <path class="pap-ext pap-ext--a" d="M${gx} ${gyf} V${nivel2 + t} M${gx + qd} ${gyf} V${nivel2 + t}"/>
  <path class="pap-cota pap-cota--a" d="M${gx} ${nivel2} H${gx + qd} M${gx} ${nivel2 - t} V${nivel2 + t} M${gx + qd} ${nivel2 - t} V${nivel2 + t}"/>
  <text class="pap-num pap-num--a" x="${gx + qd + 12}" y="${nivel2 + 5}">0,20 s</text>

  <text class="pap-nome" x="${gxf}" y="${nivel2 + 5}" text-anchor="end">tempo →</text>
  <text class="pap-nome" x="${gx - 4}" y="${gy - 4}" text-anchor="end">↑ voltagem</text>
</svg>`;
}

/* ==========================================================================
   FIGURA 2 · o pulso de calibração, ampliado e apontado
   ========================================================================== */

/**
 * O degrau do começo da tira desenhado em escala real de papel, ampliado 4x.
 * A altura sai do ganho: com 10 mm/mV ele mede 10 mm; com 5 mm/mV mede 5 mm e o
 * traçado inteiro encolhe junto. É esse par que o aluno precisa ver acontecer.
 */
function svgPulso(ganho) {
  const U = 10;                         // unidades por milímetro
  const gx = 56, gy = 16, gw = 200, gh = 160;
  const base = gy + gh - 20;            // linha de base, 2 mm acima da borda
  const x0 = 80, larg = 5 * U;          // o pulso tem 5 mm de largura
  const alt = ganho * U;                // 1 mV desenhado no ganho vigente
  const topo = base - alt;
  const meio = (topo + base) / 2;
  const colCota = x0 + larg + 22;
  const t = 5;

  return `<svg class="pap-pulso" viewBox="0 0 340 206" role="img" aria-label="Pulso de calibração de 1 milivolt desenhado com ganho de ${ganho} milímetros por milivolt: um degrau de ${ganho} milímetros de altura no início da tira.">
  <defs>
    <pattern id="pap-pulso-grade" width="${U * 5}" height="${U * 5}" patternUnits="userSpaceOnUse">
      <path class="ecg-grade-1" d="M0 0H${U * 5}M0 ${U}H${U * 5}M0 ${U * 2}H${U * 5}M0 ${U * 3}H${U * 5}M0 ${U * 4}H${U * 5}M0 0V${U * 5}M${U} 0V${U * 5}M${U * 2} 0V${U * 5}M${U * 3} 0V${U * 5}M${U * 4} 0V${U * 5}"/>
      <path class="ecg-grade-5" d="M0 0H${U * 5}M0 0V${U * 5}"/>
    </pattern>
  </defs>

  <rect class="ecg-fundo" x="${gx}" y="${gy}" width="${gw}" height="${gh}"/>
  <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#pap-pulso-grade)"/>

  <path class="pap-base" d="M${gx} ${base} H${gx + gw}"/>
  <path class="pap-tinta" d="M${gx} ${base} H${x0} V${topo} H${x0 + larg} V${base} H${gx + gw}"/>

  <path class="pap-ext pap-ext--n" d="M${x0 + larg} ${topo} H${colCota - t} M${x0 + larg} ${base} H${colCota - t}"/>
  <path class="pap-cota pap-cota--n" d="M${colCota} ${topo} V${base} M${colCota - t} ${topo} H${colCota + t} M${colCota - t} ${base} H${colCota + t}"/>
  <text class="pap-num pap-num--n" x="${colCota + 12}" y="${meio - 1}">${ganho} mm</text>
  <text class="pap-nome" x="${colCota + 12}" y="${meio + 15}">vale 1 mV</text>

  <path class="pap-cota pap-cota--a" d="M${x0 + larg / 2 + 34} ${base + 30} L${x0 + larg / 2 + 6} ${topo + 16} M${x0 + larg / 2 + 6} ${topo + 16} l14 2 M${x0 + larg / 2 + 6} ${topo + 16} l2 14"/>
  <text class="pap-num pap-num--a" x="${x0 + larg / 2 + 40}" y="${base + 36}">pulso de calibração</text>
</svg>`;
}

/* --------------------------------------------------------------------------
   Tira real, no ganho escolhido. É o mesmo motor do resto do app: o pulso que
   aparece aqui é o mesmo que aparece em toda tira de papel do site.
   -------------------------------------------------------------------------- */
function tiraCalibracao(ganho) {
  const mm = mmPx();
  const ritmo = montarRitmo('normal');
  ritmo.duracao = CALIB.duracao;   // recorta a tira para caber em 375 px sem rolar
  const svg = renderizarTira(ritmo, {
    estilo: 'papel',
    mmPx: mm,
    alturaMm: CALIB.alturaMm,
    derivacao: DERIVACAO,
    ganho,
    calibracao: true,
    id: 'pap-cal',
  });
  return `<div class="ecg-cabeca"><span>Ritmo sinusal, ${DERIVACAO}</span><span class="ecg-calib-texto mono">25 mm/s · ${ganho} mm/mV</span></div>
    <div class="ecg-scroller" tabindex="0" role="group" aria-label="Tira de papel com o pulso de calibração no início, ganho de ${ganho} milímetros por milivolt.">${svg}</div>`;
}

const CONSEQUENCIA = {
  10: {
    alerta: 'false',
    html: 'O degrau tem <b class="mono">10 mm</b>. Cada milímetro vale 0,1 mV e a amplitude pode ser lida direto do papel.',
  },
  5: {
    alerta: 'true',
    html: 'O degrau tem <b class="mono">5 mm</b>. Cada milímetro passa a valer 0,2 mV: a mesma onda desenha metade da altura, e <b>todo critério de amplitude lido direto do papel sai pela metade</b>. Um Sokolow-Lyon de 35 mm aparece como 17,5 mm.',
  },
};

/* ==========================================================================
   FIGURA 3 · a régua da frequência
   ========================================================================== */

/** Geometria da tira da régua, espelhando o que renderizarTira faz por dentro. */
function geoRegua(mm) {
  const margem = 2;                         // sem pulso de calibração nesta tira
  const larguraMm = msParaMm(REGUA.duracao, PAPEL.velocidade) + margem + 2;
  return {
    w: larguraMm * mm,
    h: REGUA.alturaMm * mm,
    offsetX: margem * mm,
    pxPorMs: (PAPEL.velocidade / 1000) * mm,
    linhaBase: REGUA.alturaMm * mm * 0.62,
  };
}

function tiraRegua(quadradoes, mm) {
  const fc = 300 / quadradoes;              // RR de N quadradões, exato
  const ritmo = ritmoRegular({ fc, duracao: REGUA.duracao });
  return renderizarTira(ritmo, {
    estilo: 'papel',
    mmPx: mm,
    alturaMm: REGUA.alturaMm,
    derivacao: DERIVACAO,
    calibracao: false,
    id: 'pap-regua',
  });
}

/**
 * Camada de cotas por cima da tira: faixas alternadas marcando cada quadradão
 * entre os dois R, linhas de chamada saindo dos picos e a cota R a R embaixo.
 * Contar quadradão em traçado é uma habilidade motora; ver o intervalo dividido
 * é o que torna a contagem possível antes de o aluno saber fazê-la sozinho.
 */
function svgCotasRegua(quadradoes, mm) {
  const g = geoRegua(mm);
  const rr = quadradoes * 200;
  const tPico = (n) => 120 + n * rr + BATIMENTO_PADRAO.pr + PICO_R;
  const x1 = g.offsetX + tPico(0) * g.pxPorMs;
  const passo = 5 * mm;
  const x2 = x1 + quadradoes * passo;

  const yCota = g.h - 8;
  const yTopo = g.linhaBase - 8 * mm;
  const t = 4;

  const faixas = Array.from({ length: quadradoes }, (_, i) =>
    i % 2 === 0
      ? `<rect class="pap-faixa" x="${(x1 + i * passo).toFixed(1)}" y="1" width="${passo.toFixed(1)}" height="${(g.h - 2).toFixed(1)}"/>`
      : '').join('');

  const tiques = Array.from({ length: quadradoes + 1 }, (_, i) => {
    const x = (x1 + i * passo).toFixed(1);
    return `M${x} ${yCota - t} V${yCota + t}`;
  }).join(' ');

  return `<svg class="pap-cotas-camada" viewBox="0 0 ${g.w.toFixed(0)} ${g.h.toFixed(0)}" width="${g.w.toFixed(0)}" height="${g.h.toFixed(0)}" aria-hidden="true" focusable="false">
    ${faixas}
    <path class="pap-ext pap-ext--a" d="M${x1.toFixed(1)} ${yTopo.toFixed(1)} V${yCota - t} M${x2.toFixed(1)} ${yTopo.toFixed(1)} V${yCota - t}"/>
    <path class="pap-cota pap-cota--a" d="M${x1.toFixed(1)} ${yCota} H${x2.toFixed(1)} ${tiques}"/>
    <text class="pap-num pap-num--a" x="${((x1 + x2) / 2).toFixed(1)}" y="${yCota - 9}" text-anchor="middle">R a R</text>
  </svg>`;
}

/* ==========================================================================
   HTML DA TELA
   ========================================================================== */

export function telaPapel() {
  const mm = mmPx();
  const q = REGUA.inicial;

  return `${ESTILO}
  <div class="pap">

    <section class="bloco empilha">
      <span class="etiqueta">Fundamento</span>
      <h1 class="pap-titulo">O papel é um <b>gráfico</b>.</h1>
      <p class="pap-frase">Largura é <b>tempo</b>, altura é <b>voltagem</b>.</p>
    </section>

    <section class="bloco empilha">
      <h2>Quadradinho e quadradão</h2>
      <p class="prosa">São só quatro números, e eles valem para o exame inteiro. Repare que cada um
      mede uma coisa diferente conforme a direção: na horizontal se lê tempo, na vertical se lê
      voltagem.</p>
      <figure class="pap-fig">
        ${svgZoomGrade()}
        <figcaption class="pap-cap">Grade ampliada quatro vezes. Os números valem na velocidade e no
        ganho padrão: 25 mm/s e 10 mm/mV.</figcaption>
      </figure>
      <p class="prosa">Cinco quadradões fazem 1 segundo. Trinta fazem 6 segundos, que é a janela usada
      para contar frequência quando o ritmo é irregular.</p>
    </section>

    <section class="bloco empilha">
      <h2>O degrau do começo da tira</h2>
      <p class="prosa">Aquele degrau retangular antes do primeiro batimento não é artefato nem
      batimento estranho. É o <strong>pulso de calibração</strong>: o aparelho injeta exatamente
      1 mV e desenha o resultado. Se ele sobe 10 quadradinhos, o ganho está no padrão e você pode
      confiar em toda altura da tira.</p>

      <figure class="pap-fig pap-fig--larga">
        <div data-pap-pulso>${svgPulso(PAPEL.ganho)}</div>
        <figcaption class="pap-cap">O pulso tem 5 mm de largura e a altura de 1 mV no ganho vigente.</figcaption>
      </figure>

      <div class="pap-opcoes" role="group" aria-label="Ganho do traçado">
        <button type="button" class="anat-botao" data-pap-ganho="10" aria-pressed="true">Ganho 10 mm/mV</button>
        <button type="button" class="anat-botao" data-pap-ganho="5" aria-pressed="false">Ganho 5 mm/mV</button>
      </div>

      <div class="ecg-tira pap-papel" data-pap-tira>${tiraCalibracao(PAPEL.ganho)}</div>

      <p class="pap-consequencia" data-pap-consequencia data-alerta="false" aria-live="polite">
        ${CONSEQUENCIA[10].html}
      </p>

      <p class="prosa">Meio ganho aparece quando o complexo é tão alto que sai do papel. Ganho dobrado,
      20 mm/mV, aparece em traçado de baixa voltagem. Nos dois casos o degrau denuncia a mudança antes
      de você medir qualquer coisa.</p>
    </section>

    <section class="bloco empilha">
      <h2>A régua da frequência</h2>
      <p class="prosa">Com o ritmo regular, a distância entre dois R já é a frequência. Mova o
      controle e veja o traçado se ajustar: o que muda é o número de quadradões entre um pico e o
      seguinte.</p>

      <div class="ecg-tira pap-papel">
        <div class="ecg-scroller" tabindex="0" role="group" aria-label="Traçado regular com o intervalo entre dois R cotado em quadradões.">
          <div class="ecg-palco" data-pap-regua-palco>
            ${tiraRegua(q, mm)}
            ${svgCotasRegua(q, mm)}
          </div>
        </div>
      </div>

      <div class="ctrl">
        <label class="ctrl-nome" for="pap-regua">Quadradões entre dois R</label>
        <div class="ctrl-trilho-area">
          <input id="pap-regua" class="trilho" type="range"
                 min="${REGUA.min}" max="${REGUA.max}" step="1" value="${q}"
                 aria-describedby="pap-fc-texto">
        </div>
        <output class="ctrl-valor" for="pap-regua" data-pap-regua-out>${q}</output>
      </div>

      <div class="pap-resultado" aria-live="polite">
        <div>
          <div class="pap-fc" data-pap-fc data-status="normal">
            <span class="pap-fc-num" data-pap-fc-num>75</span>
            <span class="pap-fc-uni">bpm</span>
          </div>
          <div class="pap-fc-nota" id="pap-fc-texto" data-pap-fc-texto>dentro da faixa normal</div>
        </div>
        <div class="pap-contas" data-pap-contas></div>
      </div>

      <p class="pap-cap">As duas contas chegam ao mesmo número porque um quadradão tem cinco
      quadradinhos.</p>

      <div class="empilha">
        <p class="prosa">Quando o segundo R cai bem sobre uma linha grossa, nem é preciso dividir:
        a frequência é uma destas seis, uma para cada quadradão contado.</p>
        <ol class="pap-multiplos" role="list" data-pap-multiplos>
          ${[300, 150, 100, 75, 60, 50].map((bpm, i) => `
          <li data-q="${i + 1}" data-ativo="false">
            <span class="pap-mq">${i + 1}</span>
            <span class="pap-mb">${bpm}</span>
          </li>`).join('')}
        </ol>
        <p class="pap-cap">Quadradões acima, frequência em bpm abaixo.</p>
      </div>

      <p class="prosa">As duas contas dependem de todos os RR serem iguais. Na fibrilação atrial cada
      um é diferente, então dividir um deles devolve um número que não descreve o paciente.</p>

      <p class="pap-limite">Em ritmo irregular, conte os QRS em 6 segundos e multiplique por 10.</p>
    </section>

  </div>`;
}

/* ==========================================================================
   COMPORTAMENTO
   ========================================================================== */

export function ligarPapel(raiz) {
  if (!raiz) return;
  ligarCalibracao(raiz);
  ligarRegua(raiz);
}

function ligarCalibracao(raiz) {
  const botoes = Array.from(raiz.querySelectorAll('[data-pap-ganho]'));
  const alvoPulso = raiz.querySelector('[data-pap-pulso]');
  const alvoTira = raiz.querySelector('[data-pap-tira]');
  const alvoTexto = raiz.querySelector('[data-pap-consequencia]');
  if (!botoes.length || !alvoPulso || !alvoTira) return;

  function aplicar(ganho) {
    alvoPulso.innerHTML = svgPulso(ganho);
    alvoTira.innerHTML = tiraCalibracao(ganho);
    const c = CONSEQUENCIA[ganho] || CONSEQUENCIA[10];
    if (alvoTexto) {
      alvoTexto.innerHTML = c.html;
      alvoTexto.dataset.alerta = c.alerta;
    }
    for (const b of botoes) {
      b.setAttribute('aria-pressed', String(Number(b.dataset.papGanho) === ganho));
    }
  }

  for (const b of botoes) {
    b.addEventListener('click', () => aplicar(Number(b.dataset.papGanho)));
  }
}

function ligarRegua(raiz) {
  const palco = raiz.querySelector('[data-pap-regua-palco]');
  const input = raiz.querySelector('#pap-regua');
  if (!palco || !input) return;

  const saida = raiz.querySelector('[data-pap-regua-out]');
  const fcBloco = raiz.querySelector('[data-pap-fc]');
  const fcNum = raiz.querySelector('[data-pap-fc-num]');
  const fcTexto = raiz.querySelector('[data-pap-fc-texto]');
  const contas = raiz.querySelector('[data-pap-contas]');
  const multiplos = Array.from(raiz.querySelectorAll('[data-pap-multiplos] li'));

  function aplicar() {
    const q = Number(input.value);
    const mm = mmPx();
    const quadradinhos = q * 5;
    const rrMs = q * 200;
    const exato = 300 % q === 0;
    const fc = Math.round(300 / q);
    const sinal = exato ? '=' : '≈';

    palco.innerHTML = tiraRegua(q, mm) + svgCotasRegua(q, mm);

    if (saida) saida.textContent = q;
    input.style.setProperty(
      '--preenchido',
      `${((q - REGUA.min) / (REGUA.max - REGUA.min)) * 100}%`
    );

    if (fcNum) fcNum.textContent = fc;
    if (fcBloco) fcBloco.dataset.status = fc < 60 || fc > 100 ? 'alterado' : 'normal';
    if (fcTexto) {
      fcTexto.textContent =
        fc < 60
          ? `bradicardia. RR de ${virg(rrMs / 1000)} s`
          : fc > 100
            ? `taquicardia. RR de ${virg(rrMs / 1000)} s`
            : `dentro da faixa normal. RR de ${virg(rrMs / 1000)} s`;
    }

    if (contas) {
      contas.innerHTML = `
        <div class="pap-conta">
          <span class="pap-conta-rot">pela contagem de quadradões</span>
          <span>300 ÷ ${q}</span><span>${sinal}</span><b>${fc} bpm</b>
        </div>
        <div class="pap-conta">
          <span class="pap-conta-rot">pela contagem de quadradinhos</span>
          <span>1500 ÷ ${quadradinhos}</span><span>${sinal}</span><b>${fc} bpm</b>
        </div>`;
    }

    for (const li of multiplos) {
      li.dataset.ativo = String(Number(li.dataset.q) === q);
    }
  }

  input.addEventListener('input', aplicar);
  aplicar();
}
