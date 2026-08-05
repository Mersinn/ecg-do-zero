/**
 * Monitor de cabeceira ao vivo.
 *
 * Não é o traçado se desenhando uma vez e parando. É um monitor de verdade: o
 * cursor varre da esquerda para a direita, desenha o sinal, apaga o que vem
 * pela frente com uma janela de limpeza e volta ao começo quando chega ao fim.
 * É assim que funciona um monitor de UTI, e é o que faz o aluno entender que
 * aquilo é um coração batendo agora, não um desenho.
 *
 * Canvas em vez de SVG porque aqui há repintura a 60 quadros por segundo. SVG
 * seria mutação de DOM a cada quadro, com custo desnecessário.
 *
 * A calibração continua sendo verdade: a varredura anda a 25 mm/s de tempo real
 * quando `tempoReal` está ligado. Um batimento na tela dura o que dura no
 * paciente.
 */

import { amostrar, PAPEL, renderizarTira } from './engine.js';

const PASSO_MS = 1; // mesmo passo de amostragem do motor

export function criarMonitor(container, ritmo, opts = {}) {
  const {
    mmPx = 3,
    alturaMm = 34,
    derivacao = 'DII',
    velocidade = PAPEL.velocidade,
    ganho = PAPEL.ganho,
    tempoReal = true,
    mostrarFC = true,
  } = opts;

  const amostras = amostrar(ritmo);
  const duracao = ritmo.duracao;

  /**
   * A largura vem do CONTÊINER, não da duração do ritmo.
   *
   * Se o canvas tivesse a largura do traçado inteiro e o CSS o encolhesse para
   * caber, a grade deixaria de medir 1 mm — num iPhone de 375 px, 150 mm de
   * traçado viram 343 px e a calibração vira decoração. O monitor mostra uma
   * janela mais curta em escala verdadeira, e o sinal circula dentro dela.
   * É também como funciona um monitor de cabeceira de verdade.
   */
  const larguraCss = Math.max(220, Math.floor(container.getBoundingClientRect().width || 320));
  const w = larguraCss;
  const h = Math.round(alturaMm * mmPx);
  const linhaBase = h * 0.6;
  const pxPorMs = (velocidade / 1000) * mmPx;
  const pxPorMv = ganho * mmPx;

  // Quantos segundos cabem na janela, em escala real. Vira rótulo honesto.
  const segundosVisiveis = w / pxPorMs / 1000;

  // Nitidez em tela Retina: o bitmap é desenhado na resolução do dispositivo e
  // exibido no tamanho CSS. Sem isto, o traçado sai embaçado no iPhone e iPad.
  const dpr = Math.min(3, window.devicePixelRatio || 1);

  const fc = ritmo.rr ? Math.round(60000 / ritmo.rr) : null;

  container.innerHTML = `
    <div class="monitor" data-monitor>
      <div class="monitor-topo">
        <span class="monitor-lead">${derivacao}</span>
        <span class="monitor-calib">${velocidade} mm/s · ${ganho} mm/mV</span>
        ${mostrarFC && fc ? `<span class="monitor-fc"><span class="monitor-coracao" data-coracao></span><b data-fc>${fc}</b> bpm</span>` : ''}
      </div>
      <canvas class="monitor-tela" data-tela width="${w}" height="${h}" role="img"
        aria-label="Monitor mostrando ${derivacao} ao vivo${fc ? `, frequência ${fc} batimentos por minuto` : ''}. Traçado sintético."></canvas>
      <div class="monitor-base">
        <button class="monitor-btn" data-pausar type="button" aria-pressed="false">Pausar</button>
        <span class="monitor-aviso">traçado sintético</span>
      </div>
    </div>`;

  const tela = container.querySelector('[data-tela]');
  const ctx = tela.getContext('2d', { alpha: false });
  const btn = container.querySelector('[data-pausar]');
  const coracao = container.querySelector('[data-coracao]');

  const lerCor = (nome, alt) =>
    getComputedStyle(document.documentElement).getPropertyValue(nome).trim() || alt;

  const cores = {
    fundo: lerCor('--mon-bg', '#071a24'),
    grade1: lerCor('--mon-grade-1', '#2f7c92'),
    grade5: lerCor('--mon-grade-5', '#3f9bb4'),
    traco: lerCor('--mon-tinta', '#46f0b9'),
  };

  /* --- grade desenhada uma vez num canvas fora da tela --- */
  const grade = document.createElement('canvas');
  grade.width = w;
  grade.height = h;
  const gctx = grade.getContext('2d');
  gctx.fillStyle = cores.fundo;
  gctx.fillRect(0, 0, w, h);

  const desenharGrade = (passo, cor, alfa, espessura) => {
    gctx.beginPath();
    gctx.globalAlpha = alfa;
    gctx.strokeStyle = cor;
    gctx.lineWidth = espessura;
    for (let x = 0; x <= w; x += passo) { gctx.moveTo(x + 0.5, 0); gctx.lineTo(x + 0.5, h); }
    for (let y = 0; y <= h; y += passo) { gctx.moveTo(0, y + 0.5); gctx.lineTo(w, y + 0.5); }
    gctx.stroke();
    gctx.globalAlpha = 1;
  };
  desenharGrade(mmPx, cores.grade1, 0.16, 1);
  desenharGrade(mmPx * 5, cores.grade5, 0.3, 1);

  /* --- estado da varredura --- */
  let cursor = 0;          // posição em px
  let anterior = null;      // último ponto desenhado
  let ultimoQuadro = null;
  let rodando = true;
  let raf = null;

  const JANELA_LIMPEZA = Math.max(10, mmPx * 5); // apaga 5 mm à frente do cursor

  const yEm = (px) => {
    const i = Math.round((px / pxPorMs) / PASSO_MS);
    const v = amostras[Math.min(amostras.length - 1, Math.max(0, i))] || 0;
    return linhaBase - v * pxPorMv;
  };

  ctx.drawImage(grade, 0, 0);

  function quadro(agora) {
    if (!rodando) return;
    if (ultimoQuadro == null) ultimoQuadro = agora;
    const dt = Math.min(64, agora - ultimoQuadro); // ignora saltos de aba em segundo plano
    ultimoQuadro = agora;

    // Avanço em px: a 25 mm/s de tempo real, ou 2x mais rápido quando não é.
    const avanco = tempoReal ? (velocidade * mmPx * dt) / 1000 : (velocidade * mmPx * dt) / 500;
    const destino = cursor + avanco;

    // Apaga a janela à frente, restaurando a grade — é o "rastro" do monitor.
    const limpezaX = destino;
    const larguraLimpeza = Math.min(JANELA_LIMPEZA, w - limpezaX);
    if (larguraLimpeza > 0) {
      ctx.drawImage(grade, limpezaX, 0, larguraLimpeza, h, limpezaX, 0, larguraLimpeza, h);
    }

    ctx.strokeStyle = cores.traco;
    ctx.lineWidth = 1.9;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = cores.traco;
    ctx.shadowBlur = 5;
    ctx.beginPath();

    let x = cursor;
    if (anterior) ctx.moveTo(anterior[0], anterior[1]);
    else ctx.moveTo(x, yEm(x));

    // Passo de meio pixel: mais fino que a resolução da tela, então nenhum
    // pico é pulado. É a mesma lição do bug de aliasing do motor.
    for (; x <= destino && x <= w; x += 0.5) ctx.lineTo(x, yEm(x));
    ctx.stroke();
    ctx.shadowBlur = 0;

    anterior = [Math.min(x, w), yEm(Math.min(x, w))];
    cursor = destino;

    if (cursor >= w) {
      cursor = 0;
      anterior = null;
      ctx.drawImage(grade, 0, 0, JANELA_LIMPEZA, h, 0, 0, JANELA_LIMPEZA, h);
    }

    raf = requestAnimationFrame(quadro);
  }

  /* --- o coração pulsa junto com o QRS que está passando --- */
  let pulsoTimer = null;
  if (coracao && ritmo.rr) {
    pulsoTimer = setInterval(() => {
      if (!rodando) return;
      coracao.classList.remove('bate');
      void coracao.offsetWidth; // força reinício da animação
      coracao.classList.add('bate');
    }, ritmo.rr);
  }

  function pausar() {
    rodando = false;
    if (raf) cancelAnimationFrame(raf);
    btn.textContent = 'Continuar';
    btn.setAttribute('aria-pressed', 'true');
  }
  function retomar() {
    if (rodando) return;
    rodando = true;
    ultimoQuadro = null;
    btn.textContent = 'Pausar';
    btn.setAttribute('aria-pressed', 'false');
    raf = requestAnimationFrame(quadro);
  }
  btn.addEventListener('click', () => (rodando ? pausar() : retomar()));

  // Quem pediu menos movimento recebe o traçado inteiro, parado.
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (semMovimento.matches) {
    ctx.strokeStyle = cores.traco;
    ctx.lineWidth = 1.9;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0, yEm(0));
    for (let x = 0; x <= w; x += 0.5) ctx.lineTo(x, yEm(x));
    ctx.stroke();
    rodando = false;
    btn.hidden = true;
  } else {
    raf = requestAnimationFrame(quadro);
  }

  // Não gasta quadro nem bateria com a aba escondida.
  const aoTrocarAba = () => (document.hidden ? pausar() : retomar());
  document.addEventListener('visibilitychange', aoTrocarAba);

  return {
    pausar,
    retomar,
    destruir() {
      rodando = false;
      if (raf) cancelAnimationFrame(raf);
      if (pulsoTimer) clearInterval(pulsoTimer);
      document.removeEventListener('visibilitychange', aoTrocarAba);
    },
  };
}


/* ==========================================================================
   TIRA ALTERNÁVEL: papel impresso ou monitor de cabeceira, no mesmo lugar
   ========================================================================== */

/**
 * As duas linguagens visuais do traçado, com um botão entre elas.
 *
 * O alternador existia numa tela só, a do Plantão, escrito à mão lá dentro.
 * Ele não é um detalhe daquela tela: as duas linguagens têm funções
 * diferentes e as duas ficam. O papel é o que chega na sua mão e é onde se
 * mede; o monitor é onde se entende que aquilo bate agora. Poder trocar entre
 * as duas em qualquer tira do app é o ponto, então o alternador saiu de lá e
 * virou isto.
 *
 * Devolve `{ destruir }`, a mesma assinatura de criarMonitor, para que a tela
 * dona mate a animação na troca de aba pelo mesmo caminho de sempre.
 *
 * @param {HTMLElement} container
 * @param {object} ritmo
 * @param {object} opts
 *   mmPx, alturaMm, derivacao — geometria, igual ao renderizarTira
 *   titulo          — o que aparece no cabeçalho da tira de papel
 *   id              — sufixo do padrão de grade do SVG, precisa ser único na página
 *   monitorPrimeiro — abre já no monitor
 *   fabricaMonitor  — permite injetar um criarMonitor que a tela registra no
 *                     próprio controle de vida
 */
export function criarTiraAlternavel(container, ritmo, opts = {}) {
  const {
    mmPx = 3,
    alturaMm = 40,
    derivacao = 'DII',
    titulo = 'tira de ritmo',
    id = '',
    monitorPrimeiro = false,
    fabricaMonitor = criarMonitor,
  } = opts;

  const limpo = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rotulo = limpo(titulo);
  const lead = limpo(derivacao);

  let monitor = null;
  let noMonitor = Boolean(monitorPrimeiro);

  container.innerHTML = `
    <div class="tira-alt">
      <div data-tira-alvo></div>
      <div class="tira-alt-acoes">
        <button class="btn btn--contorno btn--pequeno" type="button" data-tira-alternar aria-pressed="false"></button>
        <span class="miudo fraco">O papel é onde se mede. O monitor é onde se vê bater.</span>
      </div>
    </div>`;

  const alvo = container.querySelector('[data-tira-alvo]');
  const botao = container.querySelector('[data-tira-alternar]');

  const matar = () => {
    try { if (monitor) monitor.destruir(); } catch { /* já morto */ }
    monitor = null;
  };

  function comoPapel() {
    const svg = renderizarTira(ritmo, { estilo: 'papel', mmPx, alturaMm, derivacao, id });
    alvo.innerHTML = `<div class="ecg-tira">
      <div class="ecg-cabeca">
        <span>${rotulo}</span>
        <span class="ecg-calib-texto">${PAPEL.velocidade} mm/s · ${PAPEL.ganho} mm/mV</span>
      </div>
      <div class="ecg-scroller" tabindex="0" role="group"
           aria-label="${rotulo}, derivação ${lead}. Role para o lado para ver a tira inteira.">${svg}</div>
      <div class="ecg-dica-rolagem" data-toque-apenas>Arraste para o lado para ver a tira inteira. A escala do papel não muda.</div>
    </div>`;
  }

  function desenhar() {
    matar();
    try {
      if (noMonitor) {
        alvo.innerHTML = '<div data-monitor-alvo></div>';
        monitor = fabricaMonitor(alvo.querySelector('[data-monitor-alvo]'), ritmo, { mmPx, derivacao });
      } else {
        comoPapel();
      }
    } catch {
      alvo.innerHTML = '<p class="pequeno fraco">Não consegui desenhar este traçado neste aparelho.</p>';
    }
    botao.textContent = noMonitor ? 'Ver como papel impresso' : 'Ver batendo no monitor';
    botao.setAttribute('aria-pressed', String(noMonitor));
  }

  botao.addEventListener('click', () => { noMonitor = !noMonitor; desenhar(); });

  desenhar();

  return {
    destruir: matar,
    alternar() { noMonitor = !noMonitor; desenhar(); },
  };
}
