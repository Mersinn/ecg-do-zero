/**
 * ECG Ultimate Learning — motor de síntese e renderização de traçados
 * ---------------------------------------------------------------------------
 * Os traçados deste app são SINTÉTICOS: gerados por equações, não capturados de
 * um paciente. Servem para ensinar o padrão. Não são laudo nem substituem a
 * leitura de um ECG real, de 12 derivações e calibrado.
 *
 * Decisões de engenharia que não podem ser desfeitas sem quebrar o app:
 *
 * 1. AMOSTRAGEM NO DOMÍNIO DO TEMPO, passo fixo de 1 ms.
 *    A versão anterior amostrava a cada 2 px (= 16 ms) e pulava o pico do R.
 *    Batimentos alternados saíam com metade da voltagem — o que imita
 *    alternância elétrica (sinal de tamponamento). Um artefato ensinando um
 *    padrão errado. Nunca voltar a amostrar no domínio do pixel.
 *
 * 2. NENHUMA PINTURA EM ATRIBUTO DE APRESENTAÇÃO DO SVG.
 *    `var()` dentro de atributo (fill=, stroke=, stroke-width=) não é suportado
 *    de forma confiável no Chromium (SVG WG, issue 987, nov/2025). No atributo
 *    fica só geometria; cor e espessura vêm de classe CSS.
 *
 * 3. AMPLITUDE SEMPRE EM mV, TEMPO SEMPRE EM ms.
 *    A conversão para mm/px acontece só na renderização, a partir do ganho e da
 *    velocidade declarados. É isso que torna a calibração verdadeira em vez de
 *    decorativa.
 */

/* ==========================================================================
   1. CONSTANTES DE PAPEL E CALIBRAÇÃO
   ========================================================================== */

export const PAPEL = {
  velocidade: 25, // mm/s — padrão
  ganho: 10, // mm/mV — padrão ("N")
  msPorMmH: 40, // 1 mm horizontal = 0,04 s a 25 mm/s
  msPorQuadradao: 200, // 1 quadradão (5 mm) = 0,20 s
  mvPorMmV: 0.1, // 1 mm vertical = 0,1 mV a 10 mm/mV
};

/** Converte duração (ms) em milímetros horizontais, dada a velocidade do papel. */
export const msParaMm = (ms, velocidade = PAPEL.velocidade) => (ms / 1000) * velocidade;

/** Converte milímetros horizontais em duração (ms). */
export const mmParaMs = (mm, velocidade = PAPEL.velocidade) => (mm / velocidade) * 1000;

/** Converte amplitude (mV) em milímetros verticais, dado o ganho. */
export const mvParaMm = (mv, ganho = PAPEL.ganho) => mv * ganho;

/** Converte milímetros verticais em amplitude (mV). */
export const mmParaMv = (mm, ganho = PAPEL.ganho) => mm / ganho;

/* ==========================================================================
   2. PRIMITIVAS DE ONDA
   ========================================================================== */

/**
 * Gaussiana assimétrica — usada nas ondas P, T e U.
 *
 * A onda T real NÃO é simétrica: sobe devagar e desce mais rápido. Modelar com
 * gaussiana simétrica é um erro morfológico que importa, porque T simétrica e
 * apiculada é justamente o sinal de hipercalemia. Se o traçado normal já vem
 * simétrico, o aluno perde o contraste que dá o diagnóstico.
 *
 * @param {number} t      tempo local, em ms, a partir do início da onda
 * @param {number} amp    amplitude de pico, em mV (pode ser negativa)
 * @param {number} dur    duração total aproximada, em ms
 * @param {number} assim  0 = simétrica; >0 = sobe devagar e desce rápido
 */
function ondaGaussiana(t, amp, dur, assim = 0.25) {
  if (dur <= 0 || amp === 0) return 0;

  // Pico deslocado para depois do meio quando assimétrica.
  const pico = dur * (0.5 + assim * 0.5);
  const sigmaSubida = pico / 2.4;
  const sigmaDescida = (dur - pico) / 2.4;
  const sigma = t < pico ? sigmaSubida : sigmaDescida;
  if (sigma <= 0) return 0;

  const z = (t - pico) / sigma;
  const v = amp * Math.exp(-0.5 * z * z);

  // Corta a cauda para a onda retornar de fato à linha de base.
  return Math.abs(v) < Math.abs(amp) * 0.004 ? 0 : v;
}

/**
 * Deflexão poligonal — usada no QRS.
 *
 * O QRS é anguloso por natureza (despolarização rápida por Purkinje), então
 * interpolação linear entre vértices é a representação certa. O que estava
 * errado antes não era o modelo, era a amostragem.
 *
 * @param {Array<[number, number]>} pontos  vértices [ms, mV], relativos ao início
 */
function poligonal(t, pontos) {
  if (!pontos.length) return 0;
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  if (t < primeiro[0] || t > ultimo[0]) return 0;

  for (let i = 0; i < pontos.length - 1; i++) {
    const [t0, v0] = pontos[i];
    const [t1, v1] = pontos[i + 1];
    if (t >= t0 && t <= t1) {
      const span = t1 - t0;
      if (span <= 0) return v1;
      return v0 + (v1 - v0) * ((t - t0) / span);
    }
  }
  return 0;
}

/**
 * Segmento ST — deslocamento com forma.
 *
 * `forma` importa clinicamente e é a diferença entre diagnósticos:
 *   'reto'      — infra horizontal (isquemia subendocárdica)
 *   'descendente'— infra descendente (isquemia; também padrão strain)
 *   'convexo'   — supra convexo, "em abóbada" (oclusão aguda)
 *   'concavo'   — supra côncavo (pericardite, repolarização precoce)
 */
function segmentoST(t, dur, nivel, forma = 'reto') {
  if (dur <= 0) return 0;
  const f = Math.max(0, Math.min(1, t / dur));
  switch (forma) {
    case 'convexo':
      // sobe rápido, mantém alto, funde com a T
      return nivel * (0.55 + 0.45 * Math.sin(Math.PI * (0.25 + f * 0.5)));
    case 'concavo':
      return nivel * (1 - 0.45 * Math.sin(Math.PI * f));
    case 'descendente':
      return nivel * (1 - 0.35 * f) - nivel * 0.25 * f;
    case 'reto':
    default:
      return nivel;
  }
}

/* ==========================================================================
   3. MORFOLOGIAS DE QRS
   Vértices em [ms, mV], relativos ao início do complexo. Derivação II salvo
   nota em contrário. Valores dentro das faixas de referência do adulto.
   ========================================================================== */

export const QRS = {
  /** Normal: q septal pequeno, R dominante, s pequeno. ~90 ms. */
  normal: [[0, 0], [8, -0.08], [22, 0.35], [34, 1.15], [50, -0.22], [66, -0.04], [90, 0]],

  /** Baixa voltagem — usada em derrame pericárdico e obesidade. */
  baixaVoltagem: [[0, 0], [10, -0.03], [26, 0.12], [36, 0.38], [52, -0.08], [88, 0]],

  /** R alto de sobrecarga ventricular esquerda. */
  rAlto: [[0, 0], [8, -0.10], [22, 0.55], [36, 2.30], [54, -0.35], [72, -0.05], [100, 0]],

  /** rSR' em V1 — "orelha de coelho" do bloqueio de ramo direito. ~140 ms. */
  rsr: [[0, 0], [14, 0.30], [30, -0.38], [48, 0.12], [70, 0.42], [92, 0.95], [112, -0.18], [140, 0]],

  /** QRS largo e negativo em V1 — bloqueio de ramo esquerdo. ~150 ms. */
  bre: [[0, 0], [18, -0.14], [44, -0.62], [74, -1.05], [104, -0.55], [128, -0.16], [150, 0]],

  /** Complexo largo e bizarro de origem ventricular. ~160 ms. */
  ventricular: [[0, 0], [20, 0.42], [56, 1.35], [96, -0.55], [128, -0.12], [160, 0]],

  /** Complexo de escape juncional — estreito, sem P precedente. */
  juncional: [[0, 0], [10, -0.06], [24, 0.30], [34, 0.95], [50, -0.18], [86, 0]],

  /** Onda delta + QRS largo — pré-excitação (WPW). O empastamento inicial é a delta. */
  delta: [[0, 0], [12, 0.08], [30, 0.24], [46, 0.46], [60, 1.05], [78, -0.20], [96, -0.04], [120, 0]],

  /** Onda Q patológica — necrose estabelecida. */
  qPatologica: [[0, 0], [10, -0.42], [30, -0.55], [42, 0.55], [56, -0.10], [88, 0]],
};

/** Duração real de uma morfologia de QRS, em ms. */
export const duracaoQRS = (forma) => forma[forma.length - 1][0];

/* ==========================================================================
   4. O BATIMENTO
   ========================================================================== */

/**
 * Parâmetros de um batimento. Tudo o que o "Gerador de traçado" manipula passa
 * por aqui, e é também a estrutura que a biblioteca de padrões preenche.
 */
export const BATIMENTO_PADRAO = {
  pAmp: 0.15, // mV  — onda P (normal < 0,25 mV = 2,5 mm)
  pDur: 100, // ms  — onda P (normal < 120 ms)
  pAssim: 0.1,
  pBifida: false, // entalhe de sobrecarga atrial esquerda
  pr: 160, // ms  — início da P ao início do QRS (normal 120–200)
  qrs: 'normal', // chave de QRS
  qrsEscala: 1, // multiplicador de amplitude
  qrsLargura: 1, // multiplicador de duração
  st: 0, // mV  — desvio do segmento ST (0,1 mV = 1 mm)
  stForma: 'reto',
  stDur: 90, // ms
  tAmp: 0.3, // mV
  tDur: 180, // ms
  tAssim: 0.3, // >0 = sobe devagar, desce rápido (normal)
  uAmp: 0, // mV — onda U (proeminente na hipocalemia)
};

/**
 * Constrói a função de onda de um batimento isolado.
 * Retorna { onda(t) -> mV, duracao, marcos } com t em ms a partir do início da P
 * (ou do início do QRS, quando não há P).
 */
export function construirBatimento(cfg = {}) {
  const p = { ...BATIMENTO_PADRAO, ...cfg };

  const temP = p.pAmp !== 0 && p.pDur > 0;
  const inicioP = 0;
  const fimP = temP ? p.pDur : 0;

  // Sem P, o batimento começa no QRS.
  const inicioQRS = temP ? p.pr : 0;

  const formaBase = QRS[p.qrs] || QRS.normal;
  const forma = escalarQRS(formaBase, p.qrsEscala, p.qrsLargura);
  const durQRS = duracaoQRS(forma);
  const fimQRS = inicioQRS + durQRS;

  const inicioST = fimQRS; // ponto J
  const fimST = inicioST + p.stDur;

  const inicioT = fimST;
  const fimT = inicioT + p.tDur;

  const inicioU = fimT + 40;
  const fimU = p.uAmp !== 0 ? inicioU + 160 : fimT;

  const duracao = Math.max(fimT, fimU);

  function onda(t) {
    let v = 0;

    if (temP && t >= inicioP && t <= fimP) {
      if (p.pBifida) {
        // Dois componentes atriais separados — P mitrale.
        v += ondaGaussiana(t, p.pAmp * 0.85, p.pDur * 0.6, 0);
        v += ondaGaussiana(t - p.pDur * 0.4, p.pAmp * 0.95, p.pDur * 0.6, 0);
      } else {
        v += ondaGaussiana(t, p.pAmp, p.pDur, p.pAssim);
      }
    }

    // Segmento PR: isoelétrico por definição. Nada a somar.

    if (t >= inicioQRS && t <= fimQRS) {
      v += poligonal(t - inicioQRS, forma);
    }

    if (t > inicioST && t <= fimST) {
      v += segmentoST(t - inicioST, p.stDur, p.st, p.stForma);
    }

    if (t > inicioT && t <= fimT) {
      // A T parte do nível em que o ST a deixou, não da linha de base.
      v += p.st * Math.max(0, 1 - (t - inicioT) / (p.tDur * 0.5));
      v += ondaGaussiana(t - inicioT, p.tAmp, p.tDur, p.tAssim);
    }

    if (p.uAmp !== 0 && t > inicioU && t <= fimU) {
      v += ondaGaussiana(t - inicioU, p.uAmp, 160, 0.1);
    }

    return v;
  }

  return {
    onda,
    duracao,
    cfg: p,
    marcos: {
      inicioP: temP ? inicioP : null,
      fimP: temP ? fimP : null,
      inicioQRS,
      fimQRS,
      pontoJ: inicioST,
      fimST,
      inicioT,
      fimT,
      durQRS,
      // QT: do início do QRS ao fim da T.
      qt: fimT - inicioQRS,
    },
  };
}

function escalarQRS(forma, escalaAmp = 1, escalaDur = 1) {
  if (escalaAmp === 1 && escalaDur === 1) return forma;
  return forma.map(([t, v]) => [t * escalaDur, v * escalaAmp]);
}

/* ==========================================================================
   5. RITMOS — composição de batimentos ao longo do tempo
   ========================================================================== */

/**
 * Um "ritmo" é uma lista de eventos { t0, batimento } mais uma eventual
 * atividade atrial contínua (fibrilação, flutter) e a duração total.
 */

/** Ritmo regular: mesmo batimento repetido a cada intervalo RR. */
export function ritmoRegular({ fc = 70, duracao = 6000, batimento = {} } = {}) {
  const rr = 60000 / fc;
  const modelo = construirBatimento(batimento);
  const eventos = [];
  // Começa com um RR de folga para a primeira P não colar na borda.
  for (let t = 120; t + modelo.marcos.inicioQRS < duracao; t += rr) {
    eventos.push({ t0: t, modelo });
  }
  return { eventos, duracao, rr, tipo: 'regular' };
}

/**
 * Ritmo irregular a partir de uma sequência de intervalos RR (ms).
 * Usado na fibrilação atrial, onde a irregularidade É o diagnóstico.
 */
export function ritmoIrregular({ intervalos, duracao, batimento = {}, atrial = null } = {}) {
  const modelo = construirBatimento(batimento);
  const eventos = [];
  let t = 120;
  let i = 0;
  while (t < duracao) {
    eventos.push({ t0: t, modelo });
    t += intervalos[i % intervalos.length];
    i++;
  }
  return { eventos, duracao, atrial, tipo: 'irregular' };
}

/**
 * Bloqueio AV de 2º grau Mobitz I (Wenckebach): o PR alonga progressivamente
 * até um QRS falhar. A P do batimento bloqueado aparece sozinha.
 */
export function ritmoWenckebach({ fc = 75, duracao = 7000, prs = [180, 260, 340], batimento = {} } = {}) {
  const pp = 60000 / fc;
  const eventos = [];
  const ciclo = prs.length + 1;
  let i = 0;
  for (let t = 120; t < duracao; t += pp) {
    const posicao = i % ciclo;
    if (posicao < prs.length) {
      eventos.push({ t0: t, modelo: construirBatimento({ ...batimento, pr: prs[posicao] }) });
    } else {
      // P bloqueada: só onda P, sem QRS nem T.
      eventos.push({
        t0: t,
        modelo: construirBatimento({ ...batimento, qrsEscala: 0, tAmp: 0, st: 0, pr: 0 }),
        bloqueada: true,
      });
    }
    i++;
  }
  return { eventos, duracao, tipo: 'wenckebach' };
}

/**
 * Mobitz II: PR fixo, e de repente um P não conduz. Sem alongamento prévio —
 * é exatamente essa ausência que separa do Wenckebach.
 */
export function ritmoMobitz2({ fc = 75, duracao = 7000, pr = 180, razao = 3, batimento = {} } = {}) {
  const pp = 60000 / fc;
  const eventos = [];
  let i = 0;
  for (let t = 120; t < duracao; t += pp) {
    const conduz = (i + 1) % razao !== 0;
    eventos.push({
      t0: t,
      modelo: conduz
        ? construirBatimento({ ...batimento, pr })
        : construirBatimento({ ...batimento, qrsEscala: 0, tAmp: 0, st: 0, pr: 0 }),
      bloqueada: !conduz,
    });
    i++;
  }
  return { eventos, duracao, tipo: 'mobitz2' };
}

/**
 * Bloqueio AV total: átrio e ventrículo em ritmos independentes. As P "caminham"
 * através dos QRS porque não há relação nenhuma entre eles.
 */
export function ritmoDissociado({ fcAtrial = 85, fcVentricular = 38, duracao = 7000, qrsEscape = 'ventricular' } = {}) {
  const ppA = 60000 / fcAtrial;
  const ppV = 60000 / fcVentricular;
  const eventos = [];

  const soP = construirBatimento({ pAmp: 0.15, pDur: 100, qrsEscape: 0, qrsEscala: 0, tAmp: 0, pr: 0 });
  const escape = construirBatimento({ pAmp: 0, qrs: qrsEscape, tAmp: -0.35, tDur: 220, stDur: 60 });

  for (let t = 120; t < duracao; t += ppA) eventos.push({ t0: t, modelo: soP, atrial: true });
  for (let t = 340; t < duracao; t += ppV) eventos.push({ t0: t, modelo: escape, ventricular: true });

  eventos.sort((a, b) => a.t0 - b.t0);
  return { eventos, duracao, tipo: 'dissociado' };
}

/** Atividade atrial contínua da fibrilação — ondulação fina e irregular. */
export const ondulacaoFibrilatoria = (t) =>
  0.035 * Math.sin(t * 0.055) +
  0.028 * Math.sin(t * 0.117 + 0.9) +
  0.022 * Math.sin(t * 0.191 + 2.1) +
  0.014 * Math.sin(t * 0.263 + 3.4);

/** Atividade atrial do flutter — dente de serra regular a ~300/min. */
export const denteDeSerra = (t) => {
  const periodo = 200; // 300 bpm
  const f = (t % periodo) / periodo;
  return -0.22 + 0.34 * (f < 0.75 ? f / 0.75 : (1 - f) / 0.25);
};

/* ==========================================================================
   6. AMOSTRAGEM
   ========================================================================== */

const PASSO_MS = 1; // não aumentar: é o que impede o aliasing do pico do R

/**
 * Amostra um ritmo em passo fixo de tempo e devolve um array de amplitudes (mV).
 * Índice i corresponde a t = i * PASSO_MS.
 */
export function amostrar(ritmo) {
  const n = Math.ceil(ritmo.duracao / PASSO_MS) + 1;
  const amostras = new Float32Array(n);

  for (const ev of ritmo.eventos) {
    const { t0, modelo } = ev;
    const iIni = Math.max(0, Math.floor(t0 / PASSO_MS));
    const iFim = Math.min(n - 1, Math.ceil((t0 + modelo.duracao) / PASSO_MS));
    for (let i = iIni; i <= iFim; i++) {
      amostras[i] += modelo.onda(i * PASSO_MS - t0);
    }
  }

  if (ritmo.atrial) {
    for (let i = 0; i < n; i++) amostras[i] += ritmo.atrial(i * PASSO_MS);
  }

  return amostras;
}

/**
 * Simplificação de Douglas–Peucker.
 * Reduz o número de pontos do path sem perder picos — ao contrário de
 * subamostragem uniforme, que é justamente o que causava o bug de aliasing.
 */
function simplificar(pontos, tolerancia = 0.12) {
  if (pontos.length < 3) return pontos;

  const manter = new Uint8Array(pontos.length);
  manter[0] = 1;
  manter[pontos.length - 1] = 1;

  const pilha = [[0, pontos.length - 1]];
  while (pilha.length) {
    const [ini, fim] = pilha.pop();
    if (fim - ini < 2) continue;

    const [x1, y1] = pontos[ini];
    const [x2, y2] = pontos[fim];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const norma = Math.hypot(dx, dy) || 1;

    let maxDist = 0;
    let maxIdx = -1;
    for (let i = ini + 1; i < fim; i++) {
      const [x, y] = pontos[i];
      const dist = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / norma;
      if (dist > maxDist) {
        maxDist = dist;
        maxIdx = i;
      }
    }

    if (maxDist > tolerancia && maxIdx > 0) {
      manter[maxIdx] = 1;
      pilha.push([ini, maxIdx], [maxIdx, fim]);
    }
  }

  return pontos.filter((_, i) => manter[i]);
}

/* ==========================================================================
   7. RENDERIZAÇÃO
   ========================================================================== */

/**
 * Gera o atributo `d` de um path a partir das amostras.
 *
 * @param {Float32Array} amostras
 * @param {object} opts
 *   mmPx        — pixels por milímetro (escala da tela)
 *   velocidade  — mm/s
 *   ganho       — mm/mV
 *   linhaBase   — posição vertical da linha isoelétrica, em px
 *   offsetX     — deslocamento horizontal inicial, em px
 */
export function caminho(amostras, opts) {
  const { mmPx, velocidade, ganho, linhaBase, offsetX = 0 } = opts;
  const pxPorMs = (velocidade / 1000) * mmPx;
  const pxPorMv = ganho * mmPx;

  const pontos = [];
  for (let i = 0; i < amostras.length; i++) {
    const x = offsetX + i * PASSO_MS * pxPorMs;
    const y = linhaBase - amostras[i] * pxPorMv;
    pontos.push([x, y]);
  }

  const reduzidos = simplificar(pontos, 0.12);
  let d = `M${reduzidos[0][0].toFixed(2)} ${reduzidos[0][1].toFixed(2)}`;
  for (let i = 1; i < reduzidos.length; i++) {
    d += ` L${reduzidos[i][0].toFixed(2)} ${reduzidos[i][1].toFixed(2)}`;
  }
  return d;
}

/**
 * Pulso de calibração de 1 mV.
 * Presente em todo ECG impresso de verdade: é ele que prova que 10 mm = 1 mV.
 * Deixar de fora seria ensinar a ignorar a única evidência de calibração do exame.
 */
function pulsoCalibracao({ mmPx, ganho, linhaBase, largura = 5 }) {
  const alturaPx = ganho * mmPx; // 1 mV
  const lPx = largura * mmPx;
  const x0 = mmPx * 2;
  const yTopo = linhaBase - alturaPx;
  return `M${x0.toFixed(2)} ${linhaBase.toFixed(2)} L${x0.toFixed(2)} ${yTopo.toFixed(2)} ` +
    `L${(x0 + lPx).toFixed(2)} ${yTopo.toFixed(2)} L${(x0 + lPx).toFixed(2)} ${linhaBase.toFixed(2)}`;
}

/**
 * Renderiza uma tira de ECG como SVG.
 *
 * IMPORTANTE: nenhum atributo de pintura é emitido aqui. Cor, espessura e fundo
 * vêm de CSS através das classes (.ecg-grade-1, .ecg-grade-5, .ecg-traco, etc).
 * Ver a nota 2 no topo do arquivo.
 *
 * @param {object} ritmo    saída de um dos geradores de ritmo
 * @param {object} opts
 *   estilo      — 'papel' | 'monitor'
 *   mmPx        — px por mm (default 3)
 *   alturaMm    — altura da tira em mm (default 40)
 *   derivacao   — rótulo no canto (ex.: 'DII')
 *   calibracao  — mostrar o pulso de 1 mV (default true no papel)
 *   velocidade, ganho
 */
export function renderizarTira(ritmo, opts = {}) {
  const {
    estilo = 'papel',
    mmPx = 3,
    alturaMm = 40,
    derivacao = 'DII',
    velocidade = PAPEL.velocidade,
    ganho = PAPEL.ganho,
    calibracao = estilo === 'papel',
    id = '',
  } = opts;

  const amostras = amostrar(ritmo);

  const larguraTracadoMm = msParaMm(ritmo.duracao, velocidade);
  const margemCalibracaoMm = calibracao ? 10 : 2;
  const larguraMm = larguraTracadoMm + margemCalibracaoMm + 2;

  const w = larguraMm * mmPx;
  const h = alturaMm * mmPx;
  const linhaBase = h * 0.62; // deixa mais espaço acima, onde vive o R

  const offsetX = margemCalibracaoMm * mmPx;
  const d = caminho(amostras, { mmPx, velocidade, ganho, linhaBase, offsetX });

  const gradeId = `grade-${id || Math.random().toString(36).slice(2, 8)}`;

  // Grade em <pattern>: 1 mm fina, 5 mm grossa.
  const p1 = mmPx;
  const p5 = mmPx * 5;

  const cal = calibracao
    ? `<path class="ecg-calibracao" d="${pulsoCalibracao({ mmPx, ganho, linhaBase })}"/>`
    : '';

  const rotulo = derivacao
    ? `<text class="ecg-derivacao" x="${(mmPx * 1.5).toFixed(1)}" y="${(mmPx * 4).toFixed(1)}">${derivacao}</text>`
    : '';

  return `<svg class="ecg-svg ecg-${estilo}" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" role="img" aria-label="Traçado esquemático de eletrocardiograma, derivação ${derivacao}, ${(ritmo.duracao / 1000).toFixed(1)} segundos, ${velocidade} milímetros por segundo, ganho ${ganho} milímetros por milivolt">
  <defs>
    <pattern id="${gradeId}" width="${p5}" height="${p5}" patternUnits="userSpaceOnUse">
      <path class="ecg-grade-1" d="M0 0 H${p5} M0 ${p1} H${p5} M0 ${p1 * 2} H${p5} M0 ${p1 * 3} H${p5} M0 ${p1 * 4} H${p5} M0 0 V${p5} M${p1} 0 V${p5} M${p1 * 2} 0 V${p5} M${p1 * 3} 0 V${p5} M${p1 * 4} 0 V${p5}"/>
      <path class="ecg-grade-5" d="M0 0 H${p5} M0 0 V${p5}"/>
    </pattern>
  </defs>
  <rect class="ecg-fundo" width="${w.toFixed(0)}" height="${h.toFixed(0)}"/>
  <rect class="ecg-grade" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="url(#${gradeId})"/>
  ${cal}
  <path class="ecg-traco" d="${d}"/>
  ${rotulo}
</svg>`;
}

/* ==========================================================================
   8. MEDIDAS DERIVADAS — usadas pelo laudo automático e pelo paquímetro
   ========================================================================== */

/** Frequência cardíaca a partir do intervalo RR, em ms. */
export const fcDeRR = (rrMs) => Math.round(60000 / rrMs);

/** QT corrigido pela fórmula de Bazett. RR em ms. */
export const qtcBazett = (qtMs, rrMs) => Math.round(qtMs / Math.sqrt(rrMs / 1000));

/** QT corrigido pela fórmula de Fridericia — mais confiável fora de 60–100 bpm. */
export const qtcFridericia = (qtMs, rrMs) => Math.round(qtMs / Math.cbrt(rrMs / 1000));

/**
 * Eixo elétrico a partir das amplitudes líquidas de DI e aVF.
 *
 * DI está a 0° e aVF a +90° no sistema hexaxial, então as duas derivações formam
 * um par ortogonal e o ângulo sai direto do arco-tangente. É por isso que DI e
 * aVF sozinhos bastam para o quadrante.
 *
 * @returns {{angulo:number, quadrante:string, rotulo:string}}
 */
export function eixoEletrico(di, avf) {
  if (di === 0 && avf === 0) return { angulo: null, quadrante: 'indefinido', rotulo: 'Indeterminado' };

  const angulo = Math.round((Math.atan2(avf, di) * 180) / Math.PI);

  // Faixas conforme convenção adulta mais usada: normal de −30° a +90°.
  let quadrante;
  let rotulo;
  if (angulo >= -30 && angulo <= 90) {
    quadrante = 'normal';
    rotulo = 'Eixo normal';
  } else if (angulo > -90 && angulo < -30) {
    quadrante = 'esquerda';
    rotulo = 'Desvio do eixo para a esquerda';
  } else if (angulo > 90 && angulo <= 180) {
    quadrante = 'direita';
    rotulo = 'Desvio do eixo para a direita';
  } else {
    quadrante = 'extremo';
    rotulo = 'Desvio extremo do eixo (noroeste)';
  }

  return { angulo, quadrante, rotulo };
}
