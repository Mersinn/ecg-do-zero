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
  qtcBazett, qtcFridericia, fcDeRR, PAPEL, QRS,
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
    resposta: 'Onda T alta e apiculada, acima de cerca de 8 mm já chama atenção. Na hipercalemia ela também é estreita e simétrica.',
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
    resposta: 'Onda P acima de 2,5 mm em DII. P pulmonale.',
  },
];

const LAUDO_REGRAS = [
  {
    chave: 'ritmo',
    rotulo: 'Ritmo',
    avaliar: (p) =>
      p.pAmp <= 0.2
        ? { texto: 'Sem onda P identificável, não é possível afirmar ritmo sinusal.', status: 'alterado' }
        : { texto: 'Onda P presente antes de cada QRS, com PR constante: ritmo sinusal.', status: 'normal' },
  },
  {
    chave: 'fc',
    rotulo: 'Frequência',
    avaliar: (p) => {
      if (p.fc < 60) return { texto: `${p.fc} bpm, bradicardia (abaixo de 60).`, status: 'alterado' };
      if (p.fc > 100) return { texto: `${p.fc} bpm, taquicardia (acima de 100).`, status: 'alterado' };
      return { texto: `${p.fc} bpm, dentro da faixa normal (60 a 100).`, status: 'normal' };
    },
  },
  {
    chave: 'pr',
    rotulo: 'Intervalo PR',
    avaliar: (p) => {
      const s = (p.pr / 1000).toFixed(2).replace('.', ',');
      if (p.pr < 120) return { texto: `${s} s. PR curto. Pense em pré-excitação (WPW) ou ritmo juncional.`, status: 'alterado' };
      if (p.pr > 200) return { texto: `${s} s. PR longo. Fixo e com todo P conduzindo, é BAV de 1º grau.`, status: 'alterado' };
      return { texto: `${s} s, normal (0,12 a 0,20 s).`, status: 'normal' };
    },
  },
  {
    chave: 'qrs',
    rotulo: 'Duração do QRS',
    avaliar: (p) => {
      const s = (p.qrsMs / 1000).toFixed(2).replace('.', ',');
      if (p.qrsMs >= 120) return { texto: `${s} s. QRS largo. Olhe V1 para separar bloqueio de ramo direito de esquerdo; se não houver P, considere origem ventricular.`, status: 'alterado' };
      if (p.qrsMs >= 110) return { texto: `${s} s, no limite superior.`, status: 'limite' };
      return { texto: `${s} s, estreito (abaixo de 0,12 s).`, status: 'normal' };
    },
  },
  {
    chave: 'st',
    rotulo: 'Segmento ST',
    avaliar: (p) => {
      const v = p.st.toFixed(1).replace('.', ',');
      if (p.st >= 1) return { texto: `Supra de ${v} mm. Com clínica e em duas derivações contíguas, é critério de reperfusão, e o tempo passa a contar.`, status: 'alterado' };
      if (p.st <= -1) return { texto: `Infra de ${Math.abs(p.st).toFixed(1).replace('.', ',')} mm. Isquemia subendocárdica: não se tromboliza, estratifica-se o risco.`, status: 'alterado' };
      if (Math.abs(p.st) >= 0.5) return { texto: `Desvio de ${v} mm, limítrofe. Compare com traçado anterior.`, status: 'limite' };
      return { texto: 'Isoelétrico.', status: 'normal' };
    },
  },
  {
    chave: 't',
    rotulo: 'Onda T',
    avaliar: (p) => {
      const v = p.tAmp.toFixed(1).replace('.', ',');
      if (p.tAmp >= 8) return { texto: `${v} mm. T alta e apiculada. Em hipercalemia ela é estreita e simétrica; na isquemia hiperaguda, larga e assimétrica.`, status: 'alterado' };
      if (p.tAmp <= 0.5) return { texto: `${v} mm. T achatada. Pense em hipocalemia (procure a onda U).`, status: 'alterado' };
      return { texto: `${v} mm, amplitude normal, com morfologia assimétrica.`, status: 'normal' };
    },
  },
  {
    chave: 'p',
    rotulo: 'Onda P',
    avaliar: (p) => {
      const v = p.pAmp.toFixed(1).replace('.', ',');
      if (p.pAmp > 2.5) return { texto: `${v} mm. P apiculada acima de 2,5 mm: sobrecarga atrial direita (P pulmonale).`, status: 'alterado' };
      if (p.pAmp <= 0.2) return { texto: 'Onda P ausente ou não identificável.', status: 'alterado' };
      return { texto: `${v} mm, normal (abaixo de 2,5 mm).`, status: 'normal' };
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
        <p class="cartao-sub">Mova os controles e leia o laudo, que muda junto. A marca vermelha em cada trilha é o limite do normal. Você vê a fronteira antes de cruzá-la.</p>
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
        <p class="cartao-sub">DI e aVF sozinhos decidem o quadrante, porque estão a 0° e a 90°: são perpendiculares entre si. Inverta a polaridade e veja o vetor girar.</p>
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
        Ache a derivação mais isoelétrica: aquela em que as deflexões positiva e negativa quase se
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

  // Ao mexer nos controles a mao, nenhum preset descreve mais o tracado.
  const limparPreset = () => {
    for (const b of elPresets.querySelectorAll('[data-preset]')) b.setAttribute('aria-pressed', 'false');
    elNota.textContent = '';
  };

  const ctrlDi = criarControle(
    { nome: 'DI', min: -10, max: 10, passo: 1, valor: di, formatar: (v) => `${v > 0 ? '+' : ''}${v} mm` },
    (v) => { di = v; limparPreset(); desenhar(); },
  );
  const ctrlAvf = criarControle(
    { nome: 'aVF', min: -10, max: 10, passo: 1, valor: avf, formatar: (v) => `${v > 0 ? '+' : ''}${v} mm` },
    (v) => { avf = v; limparPreset(); desenhar(); },
  );
  elControles.append(ctrlDi.el, ctrlAvf.el);

  /**
   * Estado ativo nos presets.
   *
   * Sem isto o realce de hover parecia seleção: o aluno passava o dedo em
   * "hemibloqueio anterior esquerdo", via os valores de OUTRO preset na tela e
   * concluía que hemibloqueio anterior dá desvio à direita. O app não errava a
   * conta, mas mentia na leitura, que dá no mesmo.
   */
  function marcarAtivo(indice) {
    for (const b of elPresets.querySelectorAll('[data-preset]')) {
      b.setAttribute('aria-pressed', String(Number(b.dataset.preset) === indice));
    }
  }

  PRESETS_EIXO.forEach((preset, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn--contorno btn--pequeno';
    b.dataset.preset = i;
    b.setAttribute('aria-pressed', 'false');
    b.textContent = preset.nome;
    b.addEventListener('click', () => {
      di = preset.di; avf = preset.avf;
      ctrlDi.input.value = di; ctrlDi.atualizar();
      ctrlAvf.input.value = avf; ctrlAvf.atualizar();
      elNota.textContent = preset.nota;
      marcarAtivo(i);
      desenhar();
    });
    elPresets.appendChild(b);
  });

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

    elSaida.textContent = r.angulo == null ? 'Indeterminado: as duas derivações estão isoelétricas.' : `${r.rotulo} (${r.angulo}°)`;
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
   --------------------------------------------------------------------------
   Reescrito depois do relato do autor: "não entendi a estrutura e a
   funcionalidade, mesmo alternando entre A e B". Havia três defeitos
   concretos por trás disso, e cada um tem aqui a sua correção.

   1. Os marcadores se chamavam A e B. Não diziam o que eram nem onde
      ancorar. Agora cada marcador carrega o nome do ponto em que ele vai
      ("início da P", "início do QRS") e esse nome muda junto com a tarefa.
   2. A ferramenta abria vazia, com os dois marcadores num lugar arbitrário
      do traçado e nenhuma tarefa. Agora abre com UMA tarefa já proposta,
      "meça o intervalo PR deste traçado", e os marcadores pousados perto do
      lugar certo, deslocados de propósito. O aluno ajusta, não adivinha.
   3. A correção morava atrás de um botão que não explicava nada e, uma vez
      ligada, revelava o valor verdadeiro no primeiro milímetro de arrasto.
      Isso transformava medir em caçar o número até ele bater. Agora conferir
      é um passo explícito, a tolerância é dita antes, e o gabarito aparece
      desenhado sobre o traçado, no lugar exato onde ele estava.

   O traçado desta ferramenta é desenhado ampliado duas vezes. A 3 px por
   milímetro, meio quadradinho tem 1,5 px e nenhum dedo acerta isso. Ampliado,
   meio quadradinho passa a ter 3 px e a tolerância vira alcançável sem deixar
   de ser exigente. As contagens em milímetro continuam corretas, porque saem
   da mesma escala usada para desenhar.
   ========================================================================== */

/** Ampliação da tira do paquímetro. Ver a nota acima: existe pelo dedo. */
const ZOOM_PAQ = 2;

/** Tira curta: o aluno mede um batimento, não navega por sete segundos. */
const DURACAO_PAQ = 3600;

/**
 * Padrões que servem de traçado para medir.
 *
 * Todos são ritmos regulares da biblioteca, com onda P identificável e
 * amplitude que cabe na altura da tira. Nenhum deles é gerado aqui: a
 * ferramenta mede traçados que existem no resto do app.
 */
const TRACADOS_PAQ = ['normal', 'bradicardia', 'taquiSinusal', 'bav1', 'brd', 'sobrecargaAD', 'qtLongo'];

/**
 * As tarefas de medição.
 *
 * `de` e `ate` são o texto que vai NO marcador, não numa legenda distante:
 * era exatamente isso que faltava. `tolerancia` é a folga aceita, em ms, e
 * aparece na tela antes de o aluno conferir, nunca depois.
 *
 * As faixas de normalidade repetem as que já estão em library.js e no laudo do
 * gerador. Nenhum critério novo é introduzido aqui.
 */
const TAREFAS = [
  {
    id: 'pr',
    nome: 'intervalo PR',
    artigo: 'o',
    rotulo: 'Intervalo PR',
    de: 'início da P',
    ate: 'início do QRS',
    ancorar: 'Comece onde a onda P deixa a linha de base. Termine onde o QRS começa a subir, não no pico do R.',
    treina: 'O PR mede a viagem do estímulo do átrio até o ventrículo. É por ele que se separa condução normal de bloqueio AV.',
    tolerancia: 20,
    min: 120,
    max: 200,
    normal: 'PR dentro da faixa normal, de 120 a 200 ms.',
    baixo: 'PR curto, abaixo de 120 ms. Pense em pré-excitação (WPW) ou em ritmo juncional.',
    alto: 'PR longo, acima de 200 ms. Fixo e com todo P conduzindo, é BAV de 1º grau.',
  },
  {
    id: 'qrs',
    nome: 'duração do QRS',
    artigo: 'a',
    rotulo: 'Duração do QRS',
    de: 'início do QRS',
    ate: 'ponto J',
    ancorar: 'Comece onde o complexo deixa a linha de base. Termine no ponto J, onde ele volta a ela. O ponto J é o fim do QRS mesmo quando o ST sobe ou desce logo depois.',
    treina: 'Estreito ou largo é a bifurcação que decide metade das taquicardias e todos os bloqueios de ramo.',
    tolerancia: 20,
    min: 0,
    max: 119,
    normal: 'QRS estreito, abaixo de 120 ms.',
    baixo: 'Medida implausível para um QRS. Reveja onde você ancorou.',
    alto: 'QRS largo, 120 ms ou mais. Olhe V1 para separar bloqueio de ramo direito de esquerdo. Se não houver onda P, considere origem ventricular.',
  },
  {
    id: 'qt',
    nome: 'intervalo QT',
    artigo: 'o',
    rotulo: 'Intervalo QT',
    de: 'início do QRS',
    ate: 'fim da onda T',
    ancorar: 'Comece no mesmo ponto do QRS. Termine onde a onda T reencontra a linha de base. Quando a T termina em rampa, a saída é a tangente ao ramo descendente.',
    treina: 'O QT bruto quase não decide nada sozinho: ele só passa a significar alguma coisa depois de corrigido pela frequência.',
    tolerancia: 40,
    min: 340,
    max: 450,
    normal: 'QT bruto dentro da faixa esperada. Corrija pela frequência antes de concluir qualquer coisa.',
    baixo: 'QT bruto curto. Corrija pela frequência: QTc abaixo de 340 ms levanta síndrome do QT curto ou hipercalcemia (Diretriz da SBC de 2022).',
    alto: 'QT longo. Corrija pela frequência: QTc acima de 500 ms indica risco alto de torsades.',
  },
  {
    id: 'rr',
    nome: 'intervalo RR',
    artigo: 'o',
    rotulo: 'Intervalo RR e frequência',
    de: 'pico do R',
    ate: 'pico do R seguinte',
    ancorar: 'De pico a pico. O R é o ponto mais reprodutível do traçado, por isso a frequência se mede nele e não no início do QRS.',
    treina: 'É daqui que sai a frequência sem contar batimento, e é aqui que se descobre se o ritmo é regular.',
    tolerancia: 40,
    min: 600,
    max: 1000,
    normal: 'RR compatível com frequência entre 60 e 100 bpm.',
    baixo: 'RR curto, o que corresponde a taquicardia.',
    alto: 'RR longo, o que corresponde a bradicardia.',
  },
];

/** Instante do pico do R dentro do batimento, em ms a partir do início dele. */
function picoR(modelo) {
  const cfg = modelo.cfg || {};
  const forma = QRS[cfg.qrs] || QRS.normal;
  const pico = forma.reduce((a, b) => (Math.abs(b[1]) > Math.abs(a[1]) ? b : a));
  return modelo.marcos.inicioQRS + pico[0] * (cfg.qrsLargura || 1);
}

/**
 * Onde a medida pedida COMEÇA e ONDE TERMINA neste traçado, em ms absolutos,
 * mais o valor verdadeiro em ms.
 *
 * Sai da geometria do próprio ritmo renderizado. A versão anterior guardava
 * uma tabela de valores fixos e corrigia o aluno contra um número que não
 * pertencia ao traçado da tela. Num app que ensina a medir, é o pior defeito
 * possível, e ele não pode voltar: tudo aqui vem de `modelo.marcos`.
 */
function extrairAncoras(ritmo, idTarefa) {
  const evs = (ritmo.eventos || []).filter((e) => !e.bloqueada && e.modelo && e.modelo.marcos);
  if (!evs.length) return null;

  // O segundo batimento, quando existe: o primeiro encosta na margem de
  // calibração e fica apertado para ancorar com o dedo.
  const i = evs.length > 2 ? 1 : 0;
  const ev = evs[i];
  const prox = evs[i + 1];
  const m = ev.modelo.marcos;

  let r = null;
  if (idTarefa === 'pr') {
    if (m.inicioP == null) return null;
    r = { tDe: ev.t0 + m.inicioP, tAte: ev.t0 + m.inicioQRS, valor: Math.round(m.inicioQRS - m.inicioP) };
  } else if (idTarefa === 'qrs') {
    r = { tDe: ev.t0 + m.inicioQRS, tAte: ev.t0 + m.fimQRS, valor: Math.round(m.durQRS) };
  } else if (idTarefa === 'qt') {
    r = { tDe: ev.t0 + m.inicioQRS, tAte: ev.t0 + m.fimT, valor: Math.round(m.qt) };
  } else if (idTarefa === 'rr') {
    if (!prox) return null;
    const a = ev.t0 + picoR(ev.modelo);
    const b = prox.t0 + picoR(prox.modelo);
    r = { tDe: a, tAte: b, valor: Math.round(b - a) };
  }

  if (!r || !(r.valor > 0)) return null;
  // A medida inteira precisa caber na tira, senão o marcador cai fora do papel.
  if (r.tAte > ritmo.duracao - 60) return null;
  return r;
}

/**
 * @param {HTMLElement} container
 * @param {object} opts
 *   montarRitmo — função da biblioteca que devolve o ritmo de um padrão
 *   padroes     — mapa PADROES, usado só para saber quais chaves existem e
 *                 para revelar o nome do traçado DEPOIS da correção
 */
export function criarPaquimetro(container, { montarRitmo, padroes = null } = {}) {
  const escapar = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let tarefa = TAREFAS[0];
  let encaixar = true;
  let conferido = false;

  let ritmo = null;
  let chaveAtual = null;
  let derivacao = 'DII';
  let verdade = null;      // { tDe, tAte, valor }

  let mmPx = 3 * ZOOM_PAQ;
  let offsetX = 0;
  let pxPorMs = 0;
  let larguraPalco = 0;
  let xDe = 0;
  let xAte = 0;

  container.innerHTML = `
    <div class="cartao empilha">
      <div>
        <h3 class="cartao-titulo">Paquímetro</h3>
        <p class="cartao-sub">Medir é habilidade motora, e habilidade motora sem correção vira erro treinado. Aqui você recebe uma medida para fazer, ajusta os dois marcadores e confere contra o valor real deste traçado.</p>
      </div>

      <div class="paq-tarefa">
        <p class="paq-pedido" data-pedido></p>
        <p class="paq-ancorar" data-ancorar></p>
        <p class="paq-treina" data-treina></p>
      </div>

      <div class="paq-opcoes">
        <label class="ctrl-nome" for="paq-medida">Estou medindo</label>
        <select id="paq-medida" class="btn btn--contorno" data-seletor>
          ${TAREFAS.map((t) => `<option value="${t.id}">${t.rotulo}</option>`).join('')}
        </select>
        <label class="paq-encaixe">
          <input type="checkbox" data-encaixe checked>
          Encaixar na grade, de meio em meio quadradinho
        </label>
      </div>

      <div class="ecg-tira">
        <div class="ecg-cabeca">
          <span data-cabeca>tira de ritmo</span>
          <span class="ecg-calib-texto">25 mm/s · 10 mm/mV · ampliado 2 vezes</span>
        </div>
        <div class="ecg-scroller" data-scroller>
          <div class="paq-palco" data-palco></div>
        </div>
        <div class="ecg-dica-rolagem">Arraste os dois marcadores rotulados. A área vazia do papel continua rolando a tira. Pelo teclado: Tab até um marcador e setas, meio quadradinho por vez, cinco quadradinhos com Shift.</div>
      </div>

      <div class="laudo">
        <div class="laudo-linha"><span class="laudo-chave">Sua medida</span><span class="laudo-valor mono" data-medida></span></div>
        <div class="laudo-linha"><span class="laudo-chave">O que a sua medida diria</span><span class="laudo-valor" data-leitura></span></div>
      </div>

      <div class="linha">
        <button class="btn btn--principal" data-conferir type="button">Conferir minha medida</button>
        <button class="btn btn--contorno" data-proxima type="button">Outra medida</button>
        <button class="btn btn--fantasma" data-mostrar type="button">Mostrar onde é</button>
      </div>

      <div data-veredito></div>

      <p class="miudo fraco">Traçado sintético, gerado por equações a partir dos parâmetros da biblioteca de padrões. O valor conferido é o valor real desse traçado, calculado da mesma geometria que o desenhou, e não uma tabela à parte.</p>
    </div>`;

  const elPalco = container.querySelector('[data-palco]');
  const elScroller = container.querySelector('[data-scroller]');
  const elPedido = container.querySelector('[data-pedido]');
  const elAncorar = container.querySelector('[data-ancorar]');
  const elTreina = container.querySelector('[data-treina]');
  const elCabeca = container.querySelector('[data-cabeca]');
  const elMedida = container.querySelector('[data-medida]');
  const elLeitura = container.querySelector('[data-leitura]');
  const elVeredito = container.querySelector('[data-veredito]');
  const elSeletor = container.querySelector('[data-seletor]');
  const elEncaixe = container.querySelector('[data-encaixe]');

  /* ------------------------------------------------------------ geometria -- */

  const xDeT = (t) => offsetX + t * pxPorMs;
  const passoGrade = () => mmPx * 0.5;

  const grudar = (x) => {
    if (!encaixar) return x;
    const p = passoGrade();
    return offsetX + Math.round((x - offsetX) / p) * p;
  };

  const limitar = (x) => Math.max(0, Math.min(larguraPalco || 1e5, x));

  /* -------------------------------------------------------------- traçado -- */

  function escolherTracado() {
    const disponiveis = TRACADOS_PAQ.filter((k) => (!padroes || padroes[k]) && k !== chaveAtual);
    const ordem = disponiveis.sort(() => Math.random() - 0.5);

    for (const chave of ordem) {
      try {
        const r = montarRitmo(chave);
        r.duracao = Math.min(r.duracao, DURACAO_PAQ);
        const anc = extrairAncoras(r, tarefa.id);
        if (anc) {
          ritmo = r;
          chaveAtual = chave;
          derivacao = (padroes && padroes[chave] && padroes[chave].derivacao) || 'DII';
          verdade = anc;
          return true;
        }
      } catch {
        /* padrão indisponível neste ambiente: tenta o próximo */
      }
    }

    // Rede de segurança: um ritmo sinusal montado aqui mesmo, para a ferramenta
    // nunca abrir quebrada se a biblioteca não estiver acessível.
    const r = ritmoRegular({ fc: 72, duracao: DURACAO_PAQ });
    const anc = extrairAncoras(r, tarefa.id);
    ritmo = r;
    chaveAtual = null;
    derivacao = 'DII';
    verdade = anc;
    return Boolean(anc);
  }

  /** O mesmo traçado continua; só as âncoras mudam porque a tarefa mudou. */
  function reancorar() {
    if (!ritmo) return false;
    const anc = extrairAncoras(ritmo, tarefa.id);
    if (!anc) return escolherTracado();
    verdade = anc;
    return true;
  }

  function pousarMarcadores() {
    if (!verdade) return;
    // Deslocamento proposital: perto do lugar certo, nunca em cima dele. Entre
    // um e um quadradinho e meio, para cada lado sorteado de forma
    // independente. Deslocar sempre os dois para fora daria uma medida errada
    // com viés fixo, e o aluno aprenderia a compensar o viés em vez de
    // aprender a ancorar.
    const sorteio = () => (Math.random() < 0.5 ? -1 : 1) * mmPx * (0.75 + Math.random() * 0.5);
    const a = xDeT(verdade.tDe) + sorteio();
    const b = xDeT(verdade.tAte) + sorteio();
    // Nunca cruzados: marcador do fim antes do marcador do começo confunde
    // mais do que ensina.
    xDe = limitar(Math.min(a, b));
    xAte = limitar(Math.max(a, b));
  }

  /**
   * Traz o trecho a medir para dentro da janela de rolagem.
   *
   * A 375 px a tira tem o dobro da largura do scroller, e um RR de 20 mm cai
   * fora dela. Abrir com o segundo marcador escondido é a mesma falha de
   * "ferramenta que não diz o que fazer", só que geográfica.
   */
  function centralizar() {
    if (!elScroller || elScroller.scrollWidth <= elScroller.clientWidth) return;
    const centro = (xDe + xAte) / 2;
    // Salto seco, não rolagem animada: o traçado inteiro acabou de ser
    // redesenhado, e o `scroll-snap-type` do .ecg-scroller cancela uma rolagem
    // suave no meio do caminho e devolve a tira ao começo.
    elScroller.scrollLeft = Math.max(0, centro - elScroller.clientWidth / 2);
  }

  function desenhar() {
    const base = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mm')) || 3;
    mmPx = base * ZOOM_PAQ;
    offsetX = 10 * mmPx;                       // margem do pulso de calibração
    pxPorMs = (PAPEL.velocidade / 1000) * mmPx;

    const svg = renderizarTira(ritmo, {
      estilo: 'papel', mmPx, alturaMm: 38, derivacao, id: 'paq',
    });

    elPalco.innerHTML = `${svg}
      <div class="paq-faixa" data-faixa><span class="paq-conta" data-conta></span></div>
      <div class="paq-gabarito" data-gabarito="de" hidden><span>certo</span></div>
      <div class="paq-gabarito" data-gabarito="ate" hidden><span>certo</span></div>
      <div class="paq-marcador" data-marcador="de" tabindex="0" role="slider"
           aria-valuemin="0" aria-valuenow="0" aria-valuemax="100">
        <span class="paq-chip" data-chip="de"></span>
      </div>
      <div class="paq-marcador" data-marcador="ate" tabindex="0" role="slider"
           aria-valuemin="0" aria-valuenow="0" aria-valuemax="100">
        <span class="paq-chip" data-chip="ate"></span>
      </div>`;

    const svgEl = elPalco.querySelector('svg');
    larguraPalco = svgEl ? Number(svgEl.getAttribute('width')) : elPalco.clientWidth;

    ligarArraste();
    pintarTarefa();
    posicionar();
  }

  /* ---------------------------------------------------------------- texto -- */

  function pintarTarefa() {
    elPedido.innerHTML = `<strong>Sua tarefa:</strong> meça ${tarefa.artigo} ${escapar(tarefa.nome)} deste traçado.`;
    elAncorar.innerHTML = `Marcador <em>${escapar(tarefa.de)}</em> no começo, marcador <em>${escapar(tarefa.ate)}</em> no fim. ${escapar(tarefa.ancorar)}`;
    elTreina.textContent = `O que isto treina: ${tarefa.treina} Acerto é ficar a até ${tarefa.tolerancia} ms do valor real, ou seja ${(tarefa.tolerancia / 40).toFixed(1).replace('.', ',')} mm no papel.`;
    elCabeca.textContent = `tira de ritmo · ${derivacao}`;

    const chipDe = container.querySelector('[data-chip="de"]');
    const chipAte = container.querySelector('[data-chip="ate"]');
    if (chipDe) chipDe.textContent = tarefa.de;
    if (chipAte) chipAte.textContent = tarefa.ate;

    const marcDe = container.querySelector('[data-marcador="de"]');
    const marcAte = container.querySelector('[data-marcador="ate"]');
    if (marcDe) marcDe.setAttribute('aria-label', `Marcador do ${tarefa.de}`);
    if (marcAte) marcAte.setAttribute('aria-label', `Marcador do ${tarefa.ate}`);

    if (elSeletor.value !== tarefa.id) elSeletor.value = tarefa.id;
  }

  function posicionar() {
    const a = container.querySelector('[data-marcador="de"]');
    const b = container.querySelector('[data-marcador="ate"]');
    const faixa = container.querySelector('[data-faixa]');
    if (!a || !b || !faixa) return;

    a.style.left = `${xDe}px`;
    b.style.left = `${xAte}px`;
    faixa.style.left = `${Math.min(xDe, xAte)}px`;
    faixa.style.width = `${Math.abs(xAte - xDe)}px`;

    const mm = Math.abs(xAte - xDe) / mmPx;
    a.setAttribute('aria-valuetext', `${(xDe / mmPx).toFixed(1).replace('.', ',')} mm`);
    b.setAttribute('aria-valuetext', `${(xAte / mmPx).toFixed(1).replace('.', ',')} mm`);

    atualizarLeitura(mm);
  }

  function atualizarLeitura(mm) {
    const ms = Math.round(mmParaMs(mm));
    const quadradinhos = mm;                 // 1 mm = 1 quadradinho
    const quadradoes = mm / 5;

    const conta = container.querySelector('[data-conta]');
    if (conta) conta.textContent = `${quadradinhos.toFixed(1).replace('.', ',')} quadradinhos`;

    elMedida.textContent = `${mm.toFixed(1).replace('.', ',')} mm · ${ms} ms · ${quadradoes.toFixed(1).replace('.', ',')} quadradões`;

    let texto;
    let status;
    if (ms < tarefa.min) { texto = tarefa.baixo; status = 'alterado'; }
    else if (ms > tarefa.max) { texto = tarefa.alto; status = 'alterado'; }
    else { texto = tarefa.normal; status = 'normal'; }

    if (tarefa.id === 'rr' && ms > 0) {
      const fc = fcDeRR(ms);
      texto = `${texto} Frequência derivada: ${fc} bpm. Pelas contas de bolso, 1500 ÷ ${quadradinhos.toFixed(0)} quadradinhos, ou 300 ÷ ${quadradoes.toFixed(1).replace('.', ',')} quadradões. Nenhuma das duas vale se o ritmo for irregular: aí conte os QRS em 6 segundos e multiplique por 10.`;
    }
    if (tarefa.id === 'qt') {
      const rr = ritmo && ritmo.rr ? Math.round(ritmo.rr) : null;
      texto = rr
        ? `${texto} Neste traçado o RR é de ${rr} ms, então Bazett daria QTc de cerca de ${qtcBazett(ms, rr)} ms e Fridericia, cerca de ${qtcFridericia(ms, rr)} ms.`
        : `${texto} Para corrigir, você precisa do RR deste mesmo traçado.`;
    }

    elLeitura.textContent = texto;
    elLeitura.dataset.status = status;
  }

  /* -------------------------------------------------------------- arrasto -- */

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
        const x = grudar(limitar(ev.clientX - caixa.left));
        if (qual === 'de') xDe = x; else xAte = x;
        posicionar();
      });

      el.addEventListener('pointerup', (ev) => {
        if (el.hasPointerCapture(ev.pointerId)) el.releasePointerCapture(ev.pointerId);
      });

      el.addEventListener('keydown', (ev) => {
        const passo = ev.shiftKey ? passoGrade() * 10 : passoGrade();
        let d = 0;
        if (ev.key === 'ArrowLeft') d = -passo;
        else if (ev.key === 'ArrowRight') d = passo;
        else return;
        ev.preventDefault();
        if (qual === 'de') xDe = grudar(limitar(xDe + d)); else xAte = grudar(limitar(xAte + d));
        posicionar();
      });
    }
  }

  /* ------------------------------------------------------------- correção -- */

  function mostrarGabarito() {
    const g1 = container.querySelector('[data-gabarito="de"]');
    const g2 = container.querySelector('[data-gabarito="ate"]');
    if (!g1 || !g2 || !verdade) return;
    g1.style.left = `${xDeT(verdade.tDe)}px`;
    g2.style.left = `${xDeT(verdade.tAte)}px`;
    g1.hidden = false;
    g2.hidden = false;
  }

  function esconderGabarito() {
    for (const g of container.querySelectorAll('[data-gabarito]')) g.hidden = true;
  }

  function conferir() {
    if (!verdade) return;
    const mm = Math.abs(xAte - xDe) / mmPx;
    const medido = Math.round(mmParaMs(mm));
    const erro = Math.abs(medido - verdade.valor);
    const ok = erro <= tarefa.tolerancia;
    conferido = true;
    mostrarGabarito();

    // Onde exatamente o aluno errou. Dizer "errou 60 ms" sem dizer em qual
    // ponta não ensina a corrigir o gesto.
    const desvioDe = Math.round((xDe - xDeT(verdade.tDe)) / pxPorMs);
    const desvioAte = Math.round((xAte - xDeT(verdade.tAte)) / pxPorMs);
    const lado = (d, nome) => {
      if (Math.abs(d) <= 10) return `o marcador do ${nome} estava no lugar`;
      return `o marcador do ${nome} estava ${Math.abs(d)} ms ${d > 0 ? 'à direita' : 'à esquerda'} do ponto certo`;
    };

    const nomeTracado = chaveAtual && padroes && padroes[chaveAtual] ? padroes[chaveAtual].nome : null;

    /* Os dois marcadores fora do lugar, para o mesmo lado, devolvem a distância
       certa entre pontos errados. O número passa e o gesto continua errado, e
       no traçado seguinte ele não passa mais. Vale dizer isso em voz alta. */
    const compensou = ok
      && Math.abs(desvioDe) > 20 && Math.abs(desvioAte) > 20
      && Math.sign(desvioDe) === Math.sign(desvioAte);

    elVeredito.innerHTML = `
      <div class="nota ${ok ? 'nota--ok' : 'nota--atencao'}">
        <div class="nota-titulo">${ok ? 'Dentro da tolerância' : 'Fora da tolerância'}</div>
        <p>Você mediu <strong>${medido} ms</strong>. ${tarefa.artigo === 'a' ? 'A' : 'O'} ${escapar(tarefa.nome)} real deste traçado é
        <strong>${verdade.valor} ms</strong>: diferença de ${erro} ms, para uma tolerância de
        ${tarefa.tolerancia} ms.</p>
        <p>As duas linhas tracejadas sobre o papel mostram onde a medida realmente começa e termina.
        Conferindo ponta por ponta, ${lado(desvioDe, escapar(tarefa.de))} e ${lado(desvioAte, escapar(tarefa.ate))}.</p>
        ${compensou ? '<p>Repare que a medida passou por compensação: os dois marcadores erraram para o mesmo lado, então a distância entre eles saiu certa entre pontos errados. No próximo traçado esse mesmo gesto não passa.</p>' : ''}
        ${nomeTracado ? `<p class="miudo">Este traçado é o de <strong>${escapar(nomeTracado)}</strong>, da biblioteca de padrões.</p>` : ''}
      </div>`;
  }

  /* --------------------------------------------------------------- ações -- */

  elSeletor.addEventListener('change', () => {
    const nova = TAREFAS.find((t) => t.id === elSeletor.value);
    if (!nova) return;
    tarefa = nova;
    conferido = false;
    elVeredito.innerHTML = '';
    esconderGabarito();
    reancorar();
    desenhar();
    pousarMarcadores();
    posicionar();
    centralizar();
  });

  elEncaixe.addEventListener('change', () => {
    encaixar = elEncaixe.checked;
    xDe = grudar(xDe);
    xAte = grudar(xAte);
    posicionar();
  });

  container.querySelector('[data-conferir]').addEventListener('click', conferir);

  container.querySelector('[data-mostrar]').addEventListener('click', () => {
    mostrarGabarito();
    if (!conferido) {
      elVeredito.innerHTML = `<div class="nota nota--info">
        <div class="nota-titulo">Gabarito à mostra</div>
        As duas linhas tracejadas marcam onde a medida começa e onde termina. Encoste os marcadores
        nelas para gravar o gesto, depois peça outra medida e faça sem olhar.</div>`;
    }
  });

  container.querySelector('[data-proxima]').addEventListener('click', () => {
    // Avança a tarefa e troca o traçado: medir sempre a mesma coisa no mesmo
    // papel vira memória de posição, não habilidade de medir.
    const i = TAREFAS.indexOf(tarefa);
    tarefa = TAREFAS[(i + 1) % TAREFAS.length];
    conferido = false;
    elVeredito.innerHTML = '';
    escolherTracado();
    desenhar();
    pousarMarcadores();
    posicionar();
    centralizar();
  });

  /* ---------------------------------------------------------------- vida -- */

  escolherTracado();
  desenhar();
  pousarMarcadores();
  posicionar();
  centralizar();

  /* Redesenhar a cada resize apagaria a medida em curso a cada vez que a barra
     de endereço do celular some. Só interessa a mudança de escala do papel, e
     só enquanto esta ferramenta continuar na tela. */
  let mmAnterior = mmPx;
  window.addEventListener('resize', () => {
    if (!container.isConnected) return;
    const base = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mm')) || 3;
    if (Math.abs(base * ZOOM_PAQ - mmAnterior) < 0.01) return;
    mmAnterior = base * ZOOM_PAQ;
    conferido = false;
    elVeredito.innerHTML = '';
    desenhar();
    pousarMarcadores();
    posicionar();
    centralizar();
  }, { passive: true });

  return { desenhar };
}
