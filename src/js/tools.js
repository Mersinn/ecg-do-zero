/**
 * A bancada: gerador de traçado, eixo elétrico e paquímetro.
 *
 * As três compartilham uma ideia: o aluno MANIPULA o traçado em vez de só
 * olhar. Produzir a anormalidade e medir de verdade fixam mais do que
 * reconhecer um padrão pronto.
 *
 * Todas funcionam com o dedo. O arrasto usa Pointer Events, que unificam
 * mouse, toque e caneta num único caminho de código — nada de touchstart
 * duplicado nem de hover como requisito.
 */

import {
  ritmoRegular, renderizarTira, eixoEletrico, msParaMm, mmParaMs,
  qtcBazett, qtcFridericia, fcDeRR, PAPEL,
} from './ecg/engine.js';

/* ==========================================================================
   CONTROLE DESLIZANTE
   Com marca do limiar na trilha: o aluno vê a fronteira antes de cruzá-la.
   ========================================================================== */

/**
 * @param {object} spec
 *   nome, unidade, min, max, passo, valor
 *   limites: { normalMin, normalMax }  faixa considerada normal
 *   limiares: [{ valor, rotulo }]      marcas visíveis na trilha
 *   formatar: (v) => string
 */
function criarControle(spec, aoMudar) {
  const el = document.createElement('div');
  el.className = 'ctrl';

  const nome = document.createElement('label');
  nome.className = 'ctrl-nome';
  nome.textContent = spec.nome;

  const area = document.createElement('div');
  area.className = 'ctrl-trilho-area';

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'trilho';
  input.min = spec.min;
  input.max = spec.max;
  input.step = spec.passo;
  input.value = spec.valor;
  input.setAttribute('aria-label', spec.nome);

  const id = `ctrl-${Math.random().toString(36).slice(2, 8)}`;
  input.id = id;
  nome.htmlFor = id;

  area.appendChild(input);

  // Marcas de limiar sobre a trilha.
  for (const lim of spec.limiares || []) {
    const marca = document.createElement('span');
    marca.className = 'ctrl-limiar';
    marca.dataset.rotulo = lim.rotulo;
    const pct = ((lim.valor - spec.min) / (spec.max - spec.min)) * 100;
    marca.style.left = `${pct}%`;
    area.appendChild(marca);
  }

  const valor = document.createElement('output');
  valor.className = 'ctrl-valor';
  valor.htmlFor = id;

  el.append(nome, area, valor);

  function atualizar() {
    const v = Number(input.value);
    valor.textContent = spec.formatar ? spec.formatar(v) : String(v);

    // Preenchimento da trilha (WebKit não tem ::-moz-range-progress).
    const pct = ((v - spec.min) / (spec.max - spec.min)) * 100;
    input.style.setProperty('--preenchido', `${pct}%`);

    const { normalMin, normalMax } = spec.limites || {};
    let fora = 'false';
    if (normalMin != null && v < normalMin) fora = 'true';
    if (normalMax != null && v > normalMax) fora = 'true';
    el.dataset.fora = fora;

    input.setAttribute('aria-valuetext', valor.textContent);
    return v;
  }

  input.addEventListener('input', () => aoMudar(atualizar()));
  atualizar();

  return { el, input, atualizar, ler: () => Number(input.value) };
}

/* ==========================================================================
   1. GERADOR DE TRAÇADO
   ========================================================================== */

/**
 * Desafios: o app pede um padrão e confere se os parâmetros o produzem.
 * Produzir a anormalidade ensina o limiar melhor do que reconhecê-la pronta.
 */
const DESAFIOS = [
  {
    id: 'bav1',
    pedido: 'Produza um BAV de 1º grau.',
    dica: 'O que define o BAV de 1º grau é um único parâmetro passar do limite.',
    testa: (p) => p.pr > 200,
    resposta: 'PR acima de 200 ms, fixo, com todo P conduzindo.',
  },
  {
    id: 'brady',
    pedido: 'Produza uma bradicardia sinusal.',
    dica: 'Só a frequência muda; o ritmo continua sinusal.',
    testa: (p) => p.fc < 60,
    resposta: 'Frequência abaixo de 60 bpm com ritmo sinusal preservado.',
  },
  {
    id: 'qrsLargo',
    pedido: 'Produza um QRS largo, compatível com bloqueio de ramo.',
    dica: 'O corte da duração do QRS é o mesmo em qualquer livro.',
    testa: (p) => p.qrsMs >= 120,
    resposta: 'QRS com 120 ms ou mais.',
  },
  {
    id: 'hiperK',
    pedido: 'Produza o primeiro sinal eletrocardiográfico da hipercalemia.',
    dica: 'É uma alteração da onda T, não do ritmo.',
    testa: (p) => p.tAmp >= 8,
    resposta: 'Onda T alta e apiculada — acima de ~8 mm já chama atenção. Na hipercalemia ela também é estreita e simétrica.',
  },
  {
    id: 'supra',
    pedido: 'Produza um supradesnivelamento de ST significativo.',
    dica: 'O limiar geral é de 1 mm; em V2–V3 é maior.',
    testa: (p) => p.st >= 1,
    resposta: 'Supra de ST de 1 mm ou mais. Em duas derivações contíguas e com clínica, é critério de reperfusão.',
  },
  {
    id: 'pPulmonale',
    pedido: 'Produza uma onda P de sobrecarga atrial direita.',
    dica: 'A alteração da sobrecarga direita é de amplitude.',
    testa: (p) => p.pAmp > 2.5,
    resposta: 'Onda P acima de 2,5 mm em DII — P pulmonale.',
  },
];

const LAUDO_REGRAS = [
  {
    chave: 'ritmo',
    rotulo: 'Ritmo',
    avaliar: (p) =>
      p.pAmp <= 0.2
        ? { texto: 'Sem onda P identificável — não é possível afirmar ritmo sinusal.', status: 'alterado' }
        : { texto: 'Onda P presente antes de cada QRS, com PR constante: ritmo sinusal.', status: 'normal' },
  },
  {
    chave: 'fc',
    rotulo: 'Frequência',
    avaliar: (p) => {
      if (p.fc < 60) return { texto: `${p.fc} bpm — bradicardia (abaixo de 60).`, status: 'alterado' };
      if (p.fc > 100) return { texto: `${p.fc} bpm — taquicardia (acima de 100).`, status: 'alterado' };
      return { texto: `${p.fc} bpm — dentro da faixa normal (60 a 100).`, status: 'normal' };
    },
  },
  {
    chave: 'pr',
    rotulo: 'Intervalo PR',
    avaliar: (p) => {
      const s = (p.pr / 1000).toFixed(2).replace('.', ',');
      if (p.pr < 120) return { texto: `${s} s — PR curto. Pense em pré-excitação (WPW) ou ritmo juncional.`, status: 'alterado' };
      if (p.pr > 200) return { texto: `${s} s — PR longo. Fixo e com todo P conduzindo, é BAV de 1º grau.`, status: 'alterado' };
      return { texto: `${s} s — normal (0,12 a 0,20 s).`, status: 'normal' };
    },
  },
  {
    chave: 'qrs',
    rotulo: 'Duração do QRS',
    avaliar: (p) => {
      const s = (p.qrsMs / 1000).toFixed(2).replace('.', ',');
      if (p.qrsMs >= 120) return { texto: `${s} s — QRS largo. Olhe V1 para separar bloqueio de ramo direito de esquerdo; se não houver P, considere origem ventricular.`, status: 'alterado' };
      if (p.qrsMs >= 110) return { texto: `${s} s — no limite superior.`, status: 'limite' };
      return { texto: `${s} s — estreito (abaixo de 0,12 s).`, status: 'normal' };
    },
  },
  {
    chave: 'st',
    rotulo: 'Segmento ST',
    avaliar: (p) => {
      const v = p.st.toFixed(1).replace('.', ',');
      if (p.st >= 1) return { texto: `Supra de ${v} mm. Com clínica e em duas derivações contíguas, é critério de reperfusão — e o tempo passa a contar.`, status: 'alterado' };
      if (p.st <= -1) return { texto: `Infra de ${Math.abs(p.st).toFixed(1).replace('.', ',')} mm. Isquemia subendocárdica: não se tromboliza, estratifica-se o risco.`, status: 'alterado' };
      if (Math.abs(p.st) >= 0.5) return { texto: `Desvio de ${v} mm — limítrofe. Compare com traçado anterior.`, status: 'limite' };
      return { texto: 'Isoelétrico.', status: 'normal' };
    },
  },
  {
    chave: 't',
    rotulo: 'Onda T',
    avaliar: (p) => {
      const v = p.tAmp.toFixed(1).replace('.', ',');
      if (p.tAmp >= 8) return { texto: `${v} mm — T alta e apiculada. Em hipercalemia ela é estreita e simétrica; na isquemia hiperaguda, larga e assimétrica.`, status: 'alterado' };
      if (p.tAmp <= 0.5) return { texto: `${v} mm — T achatada. Pense em hipocalemia (procure a onda U).`, status: 'alterado' };
      return { texto: `${v} mm — amplitude normal, com morfologia assimétrica.`, status: 'normal' };
    },
  },
  {
    chave: 'p',
    rotulo: 'Onda P',
    avaliar: (p) => {
      const v = p.pAmp.toFixed(1).replace('.', ',');
      if (p.pAmp > 2.5) return { texto: `${v} mm — P apiculada acima de 2,5 mm: sobrecarga atrial direita (P pulmonale).`, status: 'alterado' };
      if (p.pAmp <= 0.2) return { texto: 'Onda P ausente ou não identificável.', status: 'alterado' };
      return { texto: `${v} mm — normal (abaixo de 2,5 mm).`, status: 'normal' };
    },
  },
];

export function criarGerador(container) {
  const PADRAO = { fc: 72, pr: 160, qrsMs: 90, st: 0, tAmp: 3, pAmp: 1.5 };
  let p = { ...PADRAO };
  let desafioAtual = null;

  container.innerHTML = `
    <div class="cartao empilha">
      <div>
        <h3 class="cartao-titulo">Gerador de traçado</h3>
        <p class="cartao-sub">Mova os controles e leia o laudo, que muda junto. A marca vermelha em cada trilha é o limite do normal — você vê a fronteira antes de cruzá-la.</p>
      </div>
      <div class="desafio" data-desafio hidden>
        <span class="desafio-texto" data-desafio-texto></span>
        <button class="btn btn--contorno btn--pequeno" data-desafio-dica type="button">Dica</button>
        <button class="btn btn--fantasma btn--pequeno" data-desafio-outro type="button">Outro</button>
      </div>
      <div data-controles></div>
      <div class="linha">
        <button class="btn btn--contorno" data-restaurar type="button">Restaurar o normal</button>
        <button class="btn btn--principal" data-desafiar type="button">Receber um desafio</button>
      </div>
      <div class="ecg-tira">
        <div class="ecg-cabeca"><span>Traçado gerado</span><span class="ecg-calib-texto">25 mm/s · 10 mm/mV</span></div>
        <div class="ecg-scroller" tabindex="0" role="group" aria-label="Traçado gerado. Use as setas para rolar." data-palco></div>
      </div>
      <div class="laudo" data-laudo></div>
      <p class="miudo fraco">Traçado sintético, gerado por equações a partir dos controles acima. Serve para ensinar o padrão; não é registro de paciente.</p>
    </div>`;

  const elControles = container.querySelector('[data-controles]');
  const elPalco = container.querySelector('[data-palco]');
  const elLaudo = container.querySelector('[data-laudo]');
  const elDesafio = container.querySelector('[data-desafio]');
  const elDesafioTexto = container.querySelector('[data-desafio-texto]');

  const specs = [
    { chave: 'fc', nome: 'Frequência', min: 30, max: 190, passo: 1, valor: p.fc,
      limites: { normalMin: 60, normalMax: 100 },
      limiares: [{ valor: 60, rotulo: '60' }, { valor: 100, rotulo: '100' }],
      formatar: (v) => `${v} bpm` },
    { chave: 'pr', nome: 'Intervalo PR', min: 80, max: 400, passo: 10, valor: p.pr,
      limites: { normalMin: 120, normalMax: 200 },
      limiares: [{ valor: 120, rotulo: '0,12' }, { valor: 200, rotulo: '0,20' }],
      formatar: (v) => `${(v / 1000).toFixed(2).replace('.', ',')} s` },
    { chave: 'qrsMs', nome: 'Duração do QRS', min: 60, max: 200, passo: 5, valor: p.qrsMs,
      limites: { normalMax: 119 },
      limiares: [{ valor: 120, rotulo: '0,12' }],
      formatar: (v) => `${(v / 1000).toFixed(2).replace('.', ',')} s` },
    { chave: 'st', nome: 'Segmento ST', min: -4, max: 6, passo: 0.5, valor: p.st,
      limites: { normalMin: -0.9, normalMax: 0.9 },
      limiares: [{ valor: -1, rotulo: '−1' }, { valor: 1, rotulo: '+1' }],
      formatar: (v) => `${v.toFixed(1).replace('.', ',')} mm` },
    { chave: 'tAmp', nome: 'Onda T', min: -6, max: 14, passo: 0.5, valor: p.tAmp,
      limites: { normalMin: 0.6, normalMax: 7.9 },
      limiares: [{ valor: 8, rotulo: '8' }],
      formatar: (v) => `${v.toFixed(1).replace('.', ',')} mm` },
    { chave: 'pAmp', nome: 'Onda P', min: 0, max: 5, passo: 0.1, valor: p.pAmp,
      limites: { normalMax: 2.5 },
      limiares: [{ valor: 2.5, rotulo: '2,5' }],
      formatar: (v) => (v <= 0.2 ? 'ausente' : `${v.toFixed(1).replace('.', ',')} mm`) },
  ];

  const controles = specs.map((s) => {
    const c = criarControle(s, (v) => { p[s.chave] = v; desenhar(); });
    elControles.appendChild(c.el);
    return { chave: s.chave, ...c };
  });

  function desenhar() {
    const ritmo = ritmoRegular({
      fc: p.fc,
      duracao: 6000,
      batimento: {
        pAmp: p.pAmp / 10,          // mm -> mV
        pDur: 100,
        pr: p.pr,
        qrsLargura: p.qrsMs / 90,   // 90 ms é a largura do molde normal
        st: p.st / 10,
        stForma: p.st >= 1 ? 'convexo' : p.st <= -1 ? 'descendente' : 'reto',
        tAmp: p.tAmp / 10,
        tDur: p.tAmp >= 8 ? 130 : 180,
        tAssim: p.tAmp >= 8 ? 0 : 0.3,   // T da hipercalemia é simétrica
      },
    });

    const mmPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mm')) || 3;
    elPalco.innerHTML = renderizarTira(ritmo, { estilo: 'papel', mmPx, derivacao: 'DII', id: 'ger' });

    elLaudo.innerHTML = LAUDO_REGRAS.map((r) => {
      const res = r.avaliar(p);
      return `<div class="laudo-linha">
        <span class="laudo-chave">${r.rotulo}</span>
        <span class="laudo-valor" data-status="${res.status}">${res.texto}</span>
      </div>`;
    }).join('');

    if (desafioAtual && desafioAtual.testa(p)) {
      elDesafio.dataset.resolvido = 'true';
      elDesafioTexto.innerHTML = `<strong>Conseguiu.</strong> ${desafioAtual.resposta}`;
    }
  }

  container.querySelector('[data-restaurar]').addEventListener('click', () => {
    p = { ...PADRAO };
    for (const c of controles) { c.input.value = p[c.chave]; c.atualizar(); }
    desenhar();
  });

  function novoDesafio() {
    const outros = DESAFIOS.filter((d) => d !== desafioAtual);
    desafioAtual = outros[Math.floor(Math.random() * outros.length)];
    elDesafio.hidden = false;
    delete elDesafio.dataset.resolvido;
    elDesafioTexto.innerHTML = `<strong>Desafio:</strong> ${desafioAtual.pedido}`;
    desenhar();
  }

  container.querySelector('[data-desafiar]').addEventListener('click', novoDesafio);
  container.querySelector('[data-desafio-outro]').addEventListener('click', novoDesafio);
  container.querySelector('[data-desafio-dica]').addEventListener('click', () => {
    if (desafioAtual) elDesafioTexto.innerHTML = `<strong>Desafio:</strong> ${desafioAtual.pedido}<br><span class="fraco">${desafioAtual.dica}</span>`;
  });

  desenhar();
  return { desenhar };
}

/* ==========================================================================
   2. EIXO ELÉTRICO
   ========================================================================== */

const QUADRANTES = [
  { id: 'normal',   di: '+', avf: '+', faixa: '−30° a +90°',   nome: 'Eixo normal' },
  { id: 'esquerda', di: '+', avf: '−', faixa: '−30° a −90°',   nome: 'Desvio para a esquerda' },
  { id: 'direita',  di: '−', avf: '+', faixa: '+90° a +180°',  nome: 'Desvio para a direita' },
  { id: 'extremo',  di: '−', avf: '−', faixa: '−90° a −180°',  nome: 'Desvio extremo (noroeste)' },
];

const PRESETS_EIXO = [
  { nome: 'Normal', di: 8, avf: 6, nota: 'DI e aVF positivos. O vetor aponta para baixo e para a esquerda, seguindo a massa do ventrículo esquerdo.' },
  { nome: 'Hemibloqueio anterior esquerdo', di: 7, avf: -9, nota: 'Desvio à esquerda além de −45°, com qR em DI e aVL e rS em DII, DIII e aVF. Causa mais comum de desvio esquerdo acentuado.' },
  { nome: 'Hemibloqueio posterior esquerdo', di: -6, avf: 8, nota: 'Desvio à direita com rS em DI e qR em DIII, depois de excluir causas mais comuns de desvio direito. É raro isoladamente.' },
  { nome: 'Sobrecarga de VD / doença pulmonar', di: -7, avf: 7, nota: 'Desvio à direita. Procure P pulmonale e R alta em V1 para sustentar a hipótese.' },
  { nome: 'Desvio extremo', di: -7, avf: -7, nota: 'Quadrante noroeste. Levanta suspeita de ritmo ventricular, hipercalemia grave ou posicionamento invertido dos eletrodos.' },
];

export function criarEixo(container) {
  let di = 8;
  let avf = 6;

  container.innerHTML = `
    <div class="cartao empilha">
      <div>
        <h3 class="cartao-titulo">Eixo elétrico em duas derivações</h3>
        <p class="cartao-sub">DI e aVF sozinhos decidem o quadrante, porque estão a 0° e a 90° — são perpendiculares entre si. Inverta a polaridade e veja o vetor girar.</p>
      </div>
      <div class="linha" data-presets></div>
      <div class="eixo-palco">
        <div data-roda></div>
        <div class="empilha">
          <div data-controles-eixo></div>
          <div class="laudo">
            <div class="laudo-linha">
              <span class="laudo-chave">Quadrante</span>
              <span class="laudo-valor" data-saida></span>
            </div>
          </div>
        </div>
      </div>
      <table class="quad-tabela">
        <thead><tr><th>DI</th><th>aVF</th><th>Quadrante</th><th>Faixa</th></tr></thead>
        <tbody data-tabela></tbody>
      </table>
      <div class="nota nota--info">
        <div class="nota-titulo">Segundo método</div>
        Ache a derivação mais isoelétrica — aquela em que as deflexões positiva e negativa quase se
        anulam. O eixo é perpendicular a ela. Duas rotas para o mesmo destino salvam quando uma
        trava na prova.
      </div>
      <p class="miudo fraco" data-nota-preset></p>
    </div>`;

  const elRoda = container.querySelector('[data-roda]');
  const elSaida = container.querySelector('[data-saida]');
  const elTabela = container.querySelector('[data-tabela]');
  const elNota = container.querySelector('[data-nota-preset]');
  const elControles = container.querySelector('[data-controles-eixo]');
  const elPresets = container.querySelector('[data-presets]');

  const ctrlDi = criarControle(
    { nome: 'DI', min: -10, max: 10, passo: 1, valor: di, formatar: (v) => `${v > 0 ? '+' : ''}${v} mm` },
    (v) => { di = v; desenhar(); },
  );
  const ctrlAvf = criarControle(
    { nome: 'aVF', min: -10, max: 10, passo: 1, valor: avf, formatar: (v) => `${v > 0 ? '+' : ''}${v} mm` },
    (v) => { avf = v; desenhar(); },
  );
  elControles.append(ctrlDi.el, ctrlAvf.el);

  for (const preset of PRESETS_EIXO) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn--contorno btn--pequeno';
    b.textContent = preset.nome;
    b.addEventListener('click', () => {
      di = preset.di; avf = preset.avf;
      ctrlDi.input.value = di; ctrlDi.atualizar();
      ctrlAvf.input.value = avf; ctrlAvf.atualizar();
      elNota.textContent = preset.nota;
      desenhar();
    });
    elPresets.appendChild(b);
  }

  function rodaSVG(angulo, quadrante) {
    const R = 84;
    const cx = 100;
    const cy = 100;
    // No ECG o eixo vertical é invertido: +90° aponta para BAIXO na tela.
    const rad = ((angulo || 0) * Math.PI) / 180;
    const x2 = cx + Math.cos(rad) * R * 0.92;
    const y2 = cy + Math.sin(rad) * R * 0.92;

    const setor = (a0, a1, ativo) => {
      const p0 = [cx + Math.cos((a0 * Math.PI) / 180) * R, cy + Math.sin((a0 * Math.PI) / 180) * R];
      const p1 = [cx + Math.cos((a1 * Math.PI) / 180) * R, cy + Math.sin((a1 * Math.PI) / 180) * R];
      const grande = Math.abs(a1 - a0) > 180 ? 1 : 0;
      return `<path class="eixo-quadrante" data-ativo="${ativo}" d="M${cx} ${cy} L${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${R} ${R} 0 ${grande} 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} Z"/>`;
    };

    return `<svg class="eixo-roda" viewBox="0 0 200 200" role="img" aria-label="Roda hexaxial. ${quadrante.rotulo}${quadrante.angulo != null ? `, ${quadrante.angulo} graus` : ''}.">
      ${setor(-30, 90, quadrante.quadrante === 'normal')}
      ${setor(-90, -30, quadrante.quadrante === 'esquerda')}
      ${setor(90, 180, quadrante.quadrante === 'direita')}
      ${setor(180, 270, quadrante.quadrante === 'extremo')}
      <circle class="eixo-circulo" cx="${cx}" cy="${cy}" r="${R}"/>
      <line class="eixo-grade" x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}"/>
      <line class="eixo-grade" x1="${cx}" y1="${cy - R}" x2="${cx}" y2="${cy + R}"/>
      <text class="eixo-rotulo" x="${cx + R + 2}" y="${cy - 4}" text-anchor="end">DI +</text>
      <text class="eixo-rotulo" x="${cx}" y="${cy + R + 12}" text-anchor="middle">aVF +</text>
      <text class="eixo-rotulo" x="${cx - R}" y="${cy - 4}">DI −</text>
      <text class="eixo-rotulo" x="${cx}" y="${cy - R - 4}" text-anchor="middle">aVF −</text>
      ${angulo != null ? `<line class="eixo-vetor" x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/><circle class="eixo-ponta" cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="4"/>` : ''}
      <circle class="eixo-ponta" cx="${cx}" cy="${cy}" r="3"/>
    </svg>`;
  }

  function miniTira(rotulo, amplitude) {
    const mmPx = 2.4;
    const ritmo = ritmoRegular({
      fc: 72, duracao: 2200,
      batimento: {
        pAmp: Math.sign(amplitude || 1) * 0.12,
        qrsEscala: (amplitude || 0.1) / 10,
        tAmp: Math.sign(amplitude || 1) * 0.25,
      },
    });
    return `<div class="ecg-tira" style="margin-block:4px">
      <div class="ecg-scroller">${renderizarTira(ritmo, { estilo: 'papel', mmPx, alturaMm: 26, derivacao: rotulo, calibracao: false, id: `eixo-${rotulo}` })}</div>
    </div>`;
  }

  function desenhar() {
    const r = eixoEletrico(di, avf);
    elRoda.innerHTML = rodaSVG(r.angulo, r) + miniTira('DI', di) + miniTira('aVF', avf);

    elSaida.textContent = r.angulo == null ? 'Indeterminado — as duas derivações estão isoelétricas.' : `${r.rotulo} (${r.angulo}°)`;
    elSaida.dataset.status = r.quadrante === 'normal' ? 'normal' : 'alterado';

    elTabela.innerHTML = QUADRANTES.map((q) => {
      const ativo = q.id === r.quadrante;
      return `<tr data-ativo="${ativo}"><td class="mono">${q.di}</td><td class="mono">${q.avf}</td><td>${q.nome}</td><td class="mono miudo">${q.faixa}</td></tr>`;
    }).join('');
  }

  desenhar();
  return { desenhar };
}

/* ==========================================================================
   3. PAQUÍMETRO
   ========================================================================== */

const MEDIDAS = {
  pr:  { nome: 'Intervalo PR',   min: 120, max: 200, unidade: 'ms',
         normal: 'PR normal (120 a 200 ms).',
         baixo: 'PR curto — pense em pré-excitação ou ritmo juncional.',
         alto: 'PR longo — acima de 200 ms. Fixo e com todo P conduzindo, é BAV de 1º grau.' },
  qrs: { nome: 'Duração do QRS', min: 0, max: 119, unidade: 'ms',
         normal: 'QRS estreito (abaixo de 120 ms).',
         baixo: 'Medida implausível — reveja os marcadores.',
         alto: 'QRS largo — 120 ms ou mais. Olhe V1 para separar BRD de BRE.' },
  qt:  { nome: 'Intervalo QT',   min: 300, max: 450, unidade: 'ms',
         normal: 'QT dentro da faixa esperada — mas corrija pela frequência antes de concluir.',
         baixo: 'QT curto. Abaixo de 340 ms, considere hipercalcemia ou síndrome do QT curto.',
         alto: 'QT longo. Corrija pela frequência: QTc acima de 500 ms indica risco alto de torsades.' },
  rr:  { nome: 'Intervalo RR',   min: 600, max: 1000, unidade: 'ms',
         normal: 'RR compatível com frequência entre 60 e 100 bpm.',
         baixo: 'RR curto — taquicardia.',
         alto: 'RR longo — bradicardia.' },
};

export function criarPaquimetro(container, { padraoChave = 'normal', montarRitmo } = {}) {
  let medida = 'pr';
  let modoAferido = false;
  let alvo = null;

  container.innerHTML = `
    <div class="cartao empilha">
      <div>
        <h3 class="cartao-titulo">Paquímetro</h3>
        <p class="cartao-sub">Arraste os dois marcadores sobre o traçado e meça de verdade. Medir é habilidade motora: sem corrigir a medida, você treina o próprio erro.</p>
      </div>
      <div class="ctrl">
        <label class="ctrl-nome" for="paq-medida">Estou medindo</label>
        <select id="paq-medida" class="btn btn--contorno cheio" data-seletor>
          ${Object.entries(MEDIDAS).map(([k, m]) => `<option value="${k}">${m.nome}</option>`).join('')}
        </select>
        <span></span>
      </div>
      <div class="ecg-tira">
        <div class="ecg-cabeca"><span>Traçado para medir</span><span class="ecg-calib-texto">25 mm/s · 10 mm/mV</span></div>
        <div class="ecg-scroller" data-scroller>
          <div class="paq-palco" data-palco></div>
        </div>
        <div class="ecg-dica-rolagem" data-toque-apenas>Arraste os marcadores azuis. A área vazia continua rolando o traçado.</div>
      </div>
      <div class="laudo">
        <div class="laudo-linha"><span class="laudo-chave">Medida</span><span class="laudo-valor mono" data-medida>—</span></div>
        <div class="laudo-linha"><span class="laudo-chave">Leitura</span><span class="laudo-valor" data-leitura>—</span></div>
      </div>
      <div class="linha">
        <button class="btn btn--principal" data-aferir type="button">Me dê uma medida para fazer</button>
        <button class="btn btn--fantasma" data-outro-tracado type="button">Outro traçado</button>
      </div>
      <div data-veredito></div>
    </div>`;

  const elPalco = container.querySelector('[data-palco]');
  const elScroller = container.querySelector('[data-scroller]');
  const elMedida = container.querySelector('[data-medida]');
  const elLeitura = container.querySelector('[data-leitura]');
  const elVeredito = container.querySelector('[data-veredito]');
  const elSeletor = container.querySelector('[data-seletor]');

  let mmPx = 3;
  let xA = 60;
  let xB = 120;
  let verdade = null;   // valores REAIS do traçado exibido, em ms
  let geometria = null; // para posicionar os marcadores nos marcos certos

  /**
   * Extrai os valores verdadeiros do ritmo renderizado.
   *
   * Isto substitui uma tabela de valores fixos que existia antes e que era
   * simplesmente uma mentira: o app "corrigia" a medida do aluno contra um
   * número que não pertencia ao traçado na tela. Num app cujo objetivo é
   * ensinar a medir, é o pior defeito possível.
   */
  function extrairVerdade(ritmo) {
    const ev = ritmo.eventos.find((e) => !e.bloqueada && e.modelo.marcos.inicioQRS != null);
    if (!ev) return null;
    const m = ev.modelo.marcos;
    const temP = m.inicioP != null;
    const rr = ritmo.rr || (ritmo.eventos[1] ? ritmo.eventos[1].t0 - ritmo.eventos[0].t0 : null);
    return {
      pr: temP ? Math.round(m.inicioQRS - m.inicioP) : null,
      qrs: Math.round(m.durQRS),
      qt: Math.round(m.qt),
      rr: rr ? Math.round(rr) : null,
      // instantes absolutos, para ancorar os marcadores no lugar certo
      t0: ev.t0,
      marcos: m,
    };
  }

  function desenharTracado() {
    mmPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mm')) || 3;
    const ritmo = montarRitmo
      ? montarRitmo(padraoChave)
      : ritmoRegular({ fc: 72, duracao: 5000 });
    verdade = extrairVerdade(ritmo);
    geometria = { pxPorMs: (PAPEL.velocidade / 1000) * mmPx, offsetX: 10 * mmPx };

    elPalco.innerHTML =
      renderizarTira(ritmo, { estilo: 'papel', mmPx, derivacao: 'DII', id: 'paq' }) +
      `<div class="paq-faixa" data-faixa></div>
       <div class="paq-marcador" data-marcador="A" data-rotulo="A" tabindex="0" role="slider"
            aria-label="Marcador A" aria-valuemin="0" aria-valuenow="0" aria-valuemax="100"></div>
       <div class="paq-marcador" data-marcador="B" data-rotulo="B" tabindex="0" role="slider"
            aria-label="Marcador B" aria-valuemin="0" aria-valuenow="0" aria-valuemax="100"></div>`;

    ligarArraste();
    posicionar();
  }

  function posicionar() {
    const a = container.querySelector('[data-marcador="A"]');
    const b = container.querySelector('[data-marcador="B"]');
    const faixa = container.querySelector('[data-faixa]');
    if (!a || !b) return;
    a.style.left = `${xA}px`;
    b.style.left = `${xB}px`;
    faixa.style.left = `${Math.min(xA, xB)}px`;
    faixa.style.width = `${Math.abs(xB - xA)}px`;
    atualizarLeitura();
  }

  function atualizarLeitura() {
    const dxPx = Math.abs(xB - xA);
    const mm = dxPx / mmPx;
    const ms = Math.round(mmParaMs(mm));
    const quadradoes = mm / 5;

    elMedida.textContent = `${mm.toFixed(1).replace('.', ',')} mm · ${ms} ms · ${quadradoes.toFixed(1).replace('.', ',')} quadradões`;

    const m = MEDIDAS[medida];
    let texto;
    let status;
    if (ms < m.min) { texto = m.baixo; status = 'alterado'; }
    else if (ms > m.max) { texto = m.alto; status = 'alterado'; }
    else { texto = m.normal; status = 'normal'; }

    if (medida === 'rr') {
      const fc = fcDeRR(ms);
      texto = `${texto} Frequência derivada: ${fc} bpm. Pelas contas de bolso: 1500 ÷ ${(mm).toFixed(0)} quadradinhos, ou 300 ÷ ${quadradoes.toFixed(1)} quadradões. Nenhuma das duas vale se o ritmo for irregular — aí conte os QRS em 6 segundos e multiplique por 10.`;
    }
    if (medida === 'qt') {
      texto += ` Bazett com RR de 860 ms daria QTc ≈ ${qtcBazett(ms, 860)} ms; Fridericia, ≈ ${qtcFridericia(ms, 860)} ms.`;
    }

    elLeitura.textContent = texto;
    elLeitura.dataset.status = status;

    if (modoAferido && alvo) avaliarAfericao(ms);
  }

  function avaliarAfericao(msMedido) {
    const erro = Math.abs(msMedido - alvo.valor);
    const tolerancia = 20; // ms — meia divisão do papel, que é o que o olho resolve
    const ok = erro <= tolerancia;
    elVeredito.innerHTML = `
      <div class="nota ${ok ? 'nota--ok' : 'nota--atencao'}">
        <div class="nota-titulo">${ok ? 'Medida correta' : 'Fora da tolerância'}</div>
        Você mediu <strong>${msMedido} ms</strong>. O valor real é <strong>${alvo.valor} ms</strong>
        (diferença de ${erro} ms; a tolerância é ${tolerancia} ms, cerca de meia divisão do papel).
        ${ok ? '' : ' Confira se você ancorou o marcador no <em>início</em> da onda e não no pico.'}
      </div>`;
  }

  function ligarArraste() {
    for (const el of container.querySelectorAll('[data-marcador]')) {
      const qual = el.dataset.marcador;

      el.addEventListener('pointerdown', (ev) => {
        el.setPointerCapture(ev.pointerId);
        ev.preventDefault();
      });

      el.addEventListener('pointermove', (ev) => {
        if (!el.hasPointerCapture(ev.pointerId)) return;
        const caixa = elPalco.getBoundingClientRect();
        const x = Math.max(0, Math.min(caixa.width, ev.clientX - caixa.left));
        if (qual === 'A') xA = x; else xB = x;
        posicionar();
      });

      el.addEventListener('pointerup', (ev) => el.releasePointerCapture(ev.pointerId));

      // Teclado: cada passo é um quadradinho; com Shift, um quadradão.
      el.addEventListener('keydown', (ev) => {
        const passo = ev.shiftKey ? mmPx * 5 : mmPx;
        let d = 0;
        if (ev.key === 'ArrowLeft') d = -passo;
        else if (ev.key === 'ArrowRight') d = passo;
        else return;
        ev.preventDefault();
        if (qual === 'A') xA = Math.max(0, xA + d); else xB = Math.max(0, xB + d);
        posicionar();
      });
    }
  }

  elSeletor.addEventListener('change', () => {
    medida = elSeletor.value;
    modoAferido = false;
    alvo = null;
    elVeredito.innerHTML = '';
    atualizarLeitura();
  });

  const ANCORAS = {
    pr:  'do <strong>início da onda P</strong> ao <strong>início do QRS</strong> — não ao pico do R',
    qrs: 'do <strong>início</strong> ao <strong>fim do complexo</strong>, onde ele volta à linha de base',
    qt:  'do <strong>início do QRS</strong> ao <strong>fim da onda T</strong>, onde ela reencontra a linha de base',
    rr:  'de um <strong>pico R</strong> ao <strong>pico R seguinte</strong>',
  };

  container.querySelector('[data-aferir]').addEventListener('click', () => {
    const m = MEDIDAS[medida];
    const real = verdade ? verdade[medida] : null;

    if (real == null) {
      elVeredito.innerHTML = `<div class="nota nota--atencao">
        <div class="nota-titulo">Não dá para aferir aqui</div>
        Este traçado não tem ${m.nome.toLowerCase()} mensurável — por exemplo, não há onda P para
        medir o PR. Escolha outra medida ou outro traçado.</div>`;
      modoAferido = false;
      alvo = null;
      return;
    }

    modoAferido = true;
    alvo = { valor: real };
    elVeredito.innerHTML = `<div class="nota nota--info">
      <div class="nota-titulo">Medida solicitada</div>
      Meça o <strong>${m.nome.toLowerCase()}</strong> deste traçado. Ancore ${ANCORAS[medida]}.
      A correção aparece sozinha assim que você posicionar os dois marcadores.</div>`;
    atualizarLeitura();
  });

  container.querySelector('[data-outro-tracado]').addEventListener('click', () => {
    elVeredito.innerHTML = '';
    modoAferido = false;
    desenharTracado();
  });

  desenharTracado();
  window.addEventListener('resize', () => desenharTracado(), { passive: true });

  return { desenharTracado };
}
