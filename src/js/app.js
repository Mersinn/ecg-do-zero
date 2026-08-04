/**
 * Casca do app: navegação, telas e ligação entre motor, dados e progresso.
 *
 * Sem framework e sem etapa de build. São módulos ES nativos servidos como
 * arquivo estático — qualquer aluno consegue abrir, ler e alterar o código sem
 * instalar nada. Essa é uma decisão de projeto, não uma limitação.
 */

import { PADROES, FAMILIAS, PASSOS, montarRitmo } from './ecg/library.js';
import { renderizarTira } from './ecg/engine.js';
import { criarMonitor } from './ecg/monitor.js';
import { criarGerador, criarEixo, criarPaquimetro } from './tools.js';
import { criarAnatomia } from './anatomy.js';
import { telaPapel, ligarPapel } from './screens/papel.js';
import { telaPlantao, ligarPlantao } from './screens/plantao.js';
import * as store from './store.js';

/* Conteúdo produzido separadamente. Carregado sob demanda para que o app
   continue funcionando mesmo que um desses arquivos falhe ou ainda não exista. */
let LICOES = { MODULOS: [], ROTEIROS: {} };
let QUESTOES = [];
let CASOS = [];
let MOVIMENTOS = {};

async function carregarConteudo() {
  const tentar = async (caminho, aoObter) => {
    try {
      aoObter(await import(caminho));
    } catch {
      /* segue sem esta parte do conteúdo */
    }
  };
  await Promise.all([
    tentar('./data/lessons.js', (m) => { LICOES = { MODULOS: m.MODULOS || [], ROTEIROS: m.ROTEIROS || {} }; }),
    tentar('./data/questions.js', (m) => { QUESTOES = m.QUESTOES || []; }),
    tentar('./data/cases.js', (m) => { CASOS = m.CASOS || []; MOVIMENTOS = m.MOVIMENTOS || {}; }),
  ]);

  /* O patch de calibragem pedagógica entra POR CIMA de lessons.js, campo a
     campo. Fica em arquivo separado para que a revisão de redação continue
     legível ao lado do texto original. Se o patch faltar, o app segue com o
     texto de lessons.js. */
  await tentar('./data/lessons-patch.js', (m) => {
    if (typeof m.aplicarPatchModulos === 'function') LICOES.MODULOS = m.aplicarPatchModulos(LICOES.MODULOS);
    if (typeof m.aplicarPatchRoteiros === 'function') LICOES.ROTEIROS = m.aplicarPatchRoteiros(LICOES.ROTEIROS);
  });
}

/* ==========================================================================
   UTILIDADES
   ========================================================================== */

/**
 * Tira o travessão de qualquer texto visível.
 *
 * Os bancos (library.js, lessons.js, cases.js, questions.js) foram escritos com
 * travessão em centenas de frases e o projeto o proíbe na interface. Normalizar
 * na saída é mais seguro do que reescrever quatro arquivos de conteúdo clínico:
 * troca de pontuação não mexe em critério, limiar nem dose. O traço de intervalo
 * numérico (–) e o sinal de menos (−) ficam intactos, porque ali significam algo.
 */
const semTravessao = (s) => String(s ?? '')
  .replace(/\s*—\s*/g, ', ')
  .replace(/,\s*,/g, ',')
  .replace(/\s+,/g, ',');

const esc = (s) => semTravessao(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const mmPx = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mm')) || 3;

/**
 * Monitores ao vivo abertos na tela atual.
 *
 * Cada monitor roda um requestAnimationFrame contínuo. Trocar de aba substitui o
 * innerHTML da vista, mas o laço de animação NÃO morre com o nó: ele continua
 * desenhando num canvas que ninguém vê, e num aparelho fraco isso é bateria e
 * travamento. A vista tem um dono só, então basta matar todos antes de redesenhar.
 */
const monitoresVivos = new Set();

function criarMonitorRastreado(container, ritmo, opts) {
  const m = criarMonitor(container, ritmo, opts);
  monitoresVivos.add(m);
  return m;
}

function matarMonitores() {
  for (const m of monitoresVivos) {
    try { m.destruir(); } catch { /* já morto */ }
  }
  monitoresVivos.clear();
}

const embaralhar = (a) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** Tira renderizada dentro do contêiner rolável, com cabeçalho e rodapé. */
function tira(chave, { estilo = 'papel', altura = 40 } = {}) {
  const p = PADROES[chave];
  const svg = renderizarTira(montarRitmo(chave), {
    estilo, mmPx: mmPx(), alturaMm: altura, derivacao: p.derivacao, id: chave,
  });
  return `<div class="ecg-tira">
    <div class="ecg-cabeca"><span>${esc(p.nome)}</span><span class="ecg-calib-texto">25 mm/s · 10 mm/mV</span></div>
    <div class="ecg-scroller" tabindex="0" role="group" aria-label="Traçado de ${esc(p.nome)}. Role para ver a tira inteira.">${svg}</div>
    <div class="ecg-dica-rolagem" data-toque-apenas>Arraste para o lado para ver a tira inteira. A escala do papel não muda.</div>
  </div>`;
}

/**
 * Tira do modo "Observe": ondas coloridas com rótulo, traço que se desenha e
 * holofote que caminha até o achado sendo explicado.
 *
 * As três coisas juntas são o que separa "ver um rabisco" de "ver P, QRS e T".
 * Sem o holofote, o aluno lê "olhe o intervalo PR" e não sabe onde é o PR.
 */
function tiraGuiada(chave) {
  const p = PADROES[chave];
  const ritmo = montarRitmo(chave);
  const svg = renderizarTira(ritmo, {
    estilo: 'monitor', mmPx: mmPx(), derivacao: p.derivacao, id: `g-${chave}`,
    segmentado: true, rotularOndas: true, animar: true,
  });
  return `<div class="ecg-tira" data-tira-guiada data-duracao="${ritmo.duracao}">
    <div class="ecg-cabeca">
      <span><span class="ecg-pulso"></span>${esc(p.nome)} · ${esc(p.derivacao)}</span>
      <span class="ecg-calib-texto">25 mm/s · 10 mm/mV</span>
    </div>
    <div class="ecg-scroller" tabindex="0" role="group" aria-label="Traçado de ${esc(p.nome)}, com as ondas em cores. Role para ver a tira inteira.">
      <div class="ecg-palco" data-palco-guiado>
        ${svg}
        <div class="ecg-varredura" aria-hidden="true"></div>
        <div class="ecg-holofote" data-holofote hidden></div>
        <div class="ecg-holofote-rotulo" data-holofote-rotulo hidden>olhe aqui</div>
      </div>
    </div>
    <div class="ecg-pe">
      <span style="color:var(--mon-p)">P · átrios</span>
      <span style="color:var(--mon-qrs)">QRS · ventrículos</span>
      <span style="color:var(--mon-t)">T · repolarização</span>
    </div>
  </div>`;
}

/* ==========================================================================
   TELAS
   ========================================================================== */

const TELAS = [
  { id: 'metodo',     rotulo: 'Método' },
  { id: 'papel',      rotulo: 'O papel' },
  { id: 'anatomia',   rotulo: 'Anatomia' },
  { id: 'modulos',    rotulo: 'Módulos' },
  { id: 'bancada',    rotulo: 'Bancada' },
  { id: 'plantao',    rotulo: 'Plantão' },
  { id: 'questoes',   rotulo: 'Questões' },
  { id: 'desempenho', rotulo: 'Desempenho' },
];

/* --------------------------------------------------------------- MÉTODO -- */

function telaMetodo() {
  return `
  <div class="empilha-g">
    <section class="prosa empilha">
      <h1>Ler ECG é seguir uma ordem, não ter um dom.</h1>
      <p>Quem acerta eletrocardiograma com consistência não enxerga melhor que você. A diferença é
      que percorre sempre a mesma sequência, mesmo quando o diagnóstico parece óbvio. Principalmente
      quando parece óbvio, porque é aí que se erra.</p>
      <p>Este site é construído em torno dessa sequência. Cada módulo mostra o padrão, depois pede
      que você o leia sozinho, depois cobra a decisão num caso. Você nunca vai receber um traçado
      com o nome do diagnóstico já escrito ao lado.</p>
    </section>

    <section class="empilha">
      <h2>A sequência de nove passos</h2>
      <p class="prosa fraco">O curso ensina duas versões dessa sequência, de sete passos cada, que
      não coincidem entre si: uma vem do roteiro de estágio, outra do guia de OSCE. Aqui está a
      união das duas, que não deixa buraco.</p>
      <ol class="empilha" style="padding-left:1.2rem">
        ${PASSOS.map(([, nome, desc]) => `
          <li><strong>${esc(nome)}.</strong> ${esc(desc)}</li>`).join('')}
      </ol>
    </section>

  </div>`;
}

/* ---------------------------------------------------------------- PAPEL -- */

/* A tela "O papel" vive em ./screens/papel.js: ela é quase toda desenho técnico
   em SVG (grade ampliada, cotas de prancha, pulso de calibração), e esse volume
   de geometria não cabia aqui sem sufocar a casca. */

/* -------------------------------------------------------------- MÓDULOS -- */

function telaModulos() {
  const porFamilia = {};
  for (const [chave, p] of Object.entries(PADROES)) (porFamilia[p.familia] ||= []).push({ chave, ...p });

  const familias = Object.entries(FAMILIAS).sort((a, b) => a[1].ordem - b[1].ordem);

  return `
  <div class="empilha-g">
    <section class="prosa empilha">
      <h1>Módulos</h1>
      <p>Cada padrão tem três etapas: você é conduzido pelo traçado, depois lê sozinho e fecha o
      diagnóstico, depois aplica num caso. Comece pelos Fundamentos, mesmo que já ache que sabe.</p>
    </section>

    ${familias.map(([fam, meta]) => {
      const lista = porFamilia[fam] || [];
      if (!lista.length) return '';
      const modulo = (LICOES.MODULOS || []).find((m) => m.familia === fam);
      return `
      <section class="empilha">
        <h2>${esc(meta.nome)}</h2>
        ${modulo?.promessa ? `<p class="prosa fraco">${esc(modulo.promessa)}</p>` : ''}
        ${modulo ? `<button class="btn btn--contorno btn--pequeno" data-aula="${fam}" type="button">Ler a aula deste tema</button>` : ''}
        <div class="grade-auto">
          ${lista.map((p) => {
            const prog = store.progressoPadrao(p.chave);
            const marca = prog.estado === 'solido' ? '<span class="divergencia" style="background:var(--ok-fraco);color:var(--ok);border-color:var(--ok-borda)">dominado</span>'
              : prog.estado === 'fragil' ? '<span class="divergencia">revisar</span>' : '';
            return `
            <button class="cartao" data-padrao="${p.chave}" style="text-align:left;cursor:pointer">
              <div class="linha" style="justify-content:space-between;align-items:flex-start">
                <h3 class="cartao-titulo" style="font-size:var(--t-1)">${esc(p.nome)}</h3>
                ${marca}
              </div>
              <p class="cartao-sub">${esc(p.pivo)}</p>
            </button>`;
          }).join('')}
        </div>
      </section>`;
    }).join('')}
  </div>`;
}

/**
 * Aula da família: a fisiopatologia contada de forma que o padrão do traçado
 * passe a ser CONSEQUÊNCIA, não coisa a decorar. É a diferença entre saber que
 * o PR alonga no Wenckebach e entender por que o nó AV faz isso.
 */
function telaAula(familia) {
  const m = (LICOES.MODULOS || []).find((x) => x.familia === familia);
  if (!m) return '<div class="nota nota--info">Aula deste tema ainda não disponível.</div>';

  const padroes = (m.ordemSugerida || []).filter((k) => PADROES[k]);

  return `
  <div class="empilha-g">
    <button class="btn btn--fantasma btn--pequeno" data-voltar>← Voltar aos módulos</button>

    <section class="prosa empilha">
      <h1>${esc(m.titulo)}</h1>
      <div class="nota nota--ok">
        <div class="nota-titulo">Ao final desta aula você consegue</div>
        ${esc(m.promessa)}
      </div>
    </section>

    <section class="prosa empilha">
      <h2>Por que isto importa</h2>
      <p>${esc(m.porQueImporta)}</p>
    </section>

    <section class="prosa empilha">
      <h2>O mecanismo</h2>
      ${String(m.fisiopatologia).split(/\n\s*\n/).map((par) => `<p>${esc(par.trim())}</p>`).join('')}
    </section>

    <section class="cartao empilha">
      <h3 class="cartao-titulo">Onde olhar primeiro, neste tema</h3>
      <p>${esc(m.comoLer)}</p>
    </section>

    ${Array.isArray(m.ancoras) && m.ancoras.length ? `
    <section class="empilha">
      <h2>Frases-âncora</h2>
      <p class="prosa fraco">São estas que você quer conseguir recuperar na hora da prova.</p>
      <div class="empilha">
        ${m.ancoras.map((a) => `<div class="nota nota--info">${esc(a)}</div>`).join('')}
      </div>
    </section>` : ''}

    ${Array.isArray(m.errosComuns) && m.errosComuns.length ? `
    <section class="empilha">
      <h2>Erros que derrubam a maioria</h2>
      <div class="empilha">
        ${m.errosComuns.map((e) => `
          <div class="erro-item">
            <h4>${esc(e.erro)}</h4>
            <p class="erro-saida">${esc(e.comoEvitar)}</p>
            <p class="erro-porque">${esc(e.porQue)}</p>
          </div>`).join('')}
      </div>
    </section>` : ''}

    ${padroes.length ? `
    <section class="empilha">
      <h2>Agora os traçados, nesta ordem</h2>
      <div class="grade-auto">
        ${padroes.map((k, i) => {
          const p = PADROES[k];
          const prog = store.progressoPadrao(k);
          return `<button class="cartao" data-padrao="${k}" style="text-align:left;cursor:pointer">
            <div class="linha" style="justify-content:space-between;align-items:flex-start">
              <h3 class="cartao-titulo" style="font-size:var(--t-1)">${i + 1}. ${esc(p.nome)}</h3>
              ${prog.estado === 'solido' ? '<span class="divergencia" style="background:var(--ok-fraco);color:var(--ok);border-color:var(--ok-borda)">dominado</span>' : ''}
            </div>
            <p class="cartao-sub">${esc(p.pivo)}</p>
          </button>`;
        }).join('')}
      </div>
    </section>` : ''}
  </div>`;
}

/* ------------------------------------------------------- ESTUDO DE UM PADRÃO */

function telaPadrao(chave) {
  const p = PADROES[chave];
  const roteiro = (LICOES.ROTEIROS || {})[chave] || [];

  return `
  <div class="empilha-g">
    <button class="btn btn--fantasma btn--pequeno" data-voltar>← Voltar aos módulos</button>

    <section class="prosa empilha">
      <h1>${esc(p.nome)}</h1>
    </section>

    <section class="empilha">
      <h2>1. Veja bater</h2>
      <p>Antes de medir qualquer coisa, olhe. Este é o ritmo rodando em tempo real, na mesma
      velocidade em que estaria no monitor do paciente.</p>
      <div data-monitor-vivo="${chave}"></div>

      <div class="bloco">
        <h3>Agora onda por onda</h3>
        <p>O mesmo tra&ccedil;ado, parado e com cada componente na sua cor. A faixa se move at&eacute;
        o achado que est&aacute; sendo explicado, para voc&ecirc; nunca ficar procurando onde olhar.</p>
        ${tiraGuiada(chave)}
      </div>
      ${roteiro.length ? `
      <div class="cartao empilha" data-roteiro>
        <div class="progresso" data-roteiro-prog></div>
        <h3 class="cartao-titulo" data-roteiro-titulo></h3>
        <p data-roteiro-texto></p>
        <div class="linha">
          <button class="btn btn--contorno btn--pequeno" data-roteiro-ant type="button">← Anterior</button>
          <span class="progresso-texto" data-roteiro-conta></span>
          <button class="btn btn--principal btn--pequeno" data-roteiro-prox type="button">Próximo →</button>
        </div>
      </div>` : ''}
    </section>

    <section class="empilha">
      <h2>2. Leia sozinho</h2>
      <p class="prosa fraco">Percorra os nove passos antes de abrir cada resposta. A ordem é o método.</p>
      ${tira(chave)}
      <div class="empilha" data-passos>
        ${PASSOS.map(([k, nome], i) => `
          <details class="cartao cartao--calmo" data-passo="${i}">
            <summary style="cursor:pointer;font-weight:650">${i + 1}. ${esc(nome)}</summary>
            <p style="margin-top:var(--e-3)">${esc(p.leitura[k] || 'sem leitura registrada para este passo.')}</p>
          </details>`).join('')}
      </div>
    </section>

    <section class="empilha" data-quiz>
      <h2>3. Feche o diagnóstico</h2>
      <div class="cartao empilha">
        <p><strong>Juntando os nove passos, qual é o diagnóstico deste traçado?</strong></p>
        <div class="empilha" data-alternativas></div>
        <div data-resultado></div>
      </div>
    </section>
  </div>`;
}

function ligarMonitoresVivos(raiz) {
  for (const alvo of raiz.querySelectorAll('[data-monitor-vivo]')) {
    const chave = alvo.dataset.monitorVivo;
    if (!PADROES[chave]) continue;
    criarMonitorRastreado(alvo, montarRitmo(chave), {
      mmPx: mmPx(), derivacao: PADROES[chave].derivacao, alturaMm: 32,
    });
  }
}

function ligarTelaPadrao(raiz, chave) {
  ligarMonitoresVivos(raiz);
  const p = PADROES[chave];

  raiz.querySelector('[data-voltar]')?.addEventListener('click', () => ir('modulos'));

  /* --- roteiro guiado --- */
  const roteiro = (LICOES.ROTEIROS || {})[chave] || [];
  if (roteiro.length) {
    let i = 0;
    const t = raiz.querySelector('[data-roteiro-titulo]');
    const x = raiz.querySelector('[data-roteiro-texto]');
    const c = raiz.querySelector('[data-roteiro-conta]');
    const g = raiz.querySelector('[data-roteiro-prog]');
    /* O monitor ao vivo já foi criado por ligarMonitoresVivos, logo acima, e
       está registrado para ser destruído na troca de tela. Criar outro aqui,
       como a versão anterior fazia, deixava o primeiro tocando invisível. */

    const tiraEl = raiz.querySelector('[data-tira-guiada]');
    const holo = raiz.querySelector('[data-holofote]');
    const holoRot = raiz.querySelector('[data-holofote-rotulo]');
    const duracao = Number(tiraEl?.dataset.duracao || 0);
    const svgEl = raiz.querySelector('[data-palco-guiado] svg');

    /** Move a faixa de destaque até o instante tMs do traçado. */
    const holofote = (tMs, rotulo) => {
      if (!holo || !svgEl || !duracao) return;
      if (tMs == null) { holo.hidden = true; holoRot.hidden = true; return; }
      const largura = svgEl.viewBox.baseVal.width || svgEl.clientWidth;
      // O traçado começa depois da margem do pulso de calibração.
      const inicio = 10 / (largura / svgEl.clientWidth || 1);
      const fracao = Math.max(0, Math.min(1, (tMs / duracao) * 0.9 + 0.06));
      const larguraFaixa = 0.14;
      holo.hidden = false; holoRot.hidden = false;
      holo.style.left = `${Math.max(0, Math.min(1 - larguraFaixa, fracao - larguraFaixa / 2)) * 100}%`;
      holo.style.width = `${larguraFaixa * 100}%`;
      holoRot.style.left = `${Math.max(8, Math.min(92, fracao * 100))}%`;
      holoRot.textContent = rotulo || 'olhe aqui';
      void inicio;
    };

    const pintar = () => {
      const passo = roteiro[i];
      // O texto do roteiro traz marcação (<strong>, <em>) escrita à mão no banco,
      // então vai por innerHTML. Só a pontuação é normalizada.
      t.textContent = semTravessao(passo.titulo || '');
      x.innerHTML = semTravessao(passo.texto || '');
      c.textContent = `${i + 1} / ${roteiro.length}`;
      holofote(passo.tMs ?? passo.t ?? null, passo.foco);
      g.innerHTML = roteiro.map((_, k) => `<span class="progresso-seg" data-estado="${k <= i ? 'solido' : ''}"></span>`).join('');
      raiz.querySelector('[data-roteiro-ant]').disabled = i === 0;
      raiz.querySelector('[data-roteiro-prox]').disabled = i === roteiro.length - 1;
    };
    raiz.querySelector('[data-roteiro-prox]').addEventListener('click', () => { if (i < roteiro.length - 1) { i++; pintar(); } });
    raiz.querySelector('[data-roteiro-ant]').addEventListener('click', () => { if (i > 0) { i--; pintar(); } });
    pintar();
  }

  /* --- quiz de fechamento --- */
  const alternativas = embaralhar([
    { texto: p.dx, certa: true },
    ...(p.alternativas || []).map((a) => ({ texto: a, certa: false })),
  ]);

  const elAlts = raiz.querySelector('[data-alternativas]');
  const elRes = raiz.querySelector('[data-resultado]');
  let respondido = false;

  elAlts.innerHTML = alternativas.map((a, i) =>
    `<button class="btn btn--contorno cheio" data-alt="${i}" style="justify-content:flex-start;text-align:left">${esc(a.texto)}</button>`).join('');

  elAlts.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-alt]');
    if (!btn || respondido) return;
    respondido = true;
    const i = Number(btn.dataset.alt);
    const acertou = alternativas[i].certa;

    for (const b of elAlts.querySelectorAll('[data-alt]')) {
      const k = Number(b.dataset.alt);
      b.disabled = true;
      if (alternativas[k].certa) b.style.borderColor = 'var(--ok)';
      else if (k === i) b.style.borderColor = 'var(--perigo)';
      else b.style.opacity = '0.5';
    }

    elRes.innerHTML = `
      <div class="nota ${acertou ? 'nota--ok' : 'nota--perigo'}">
        <div class="nota-titulo">${acertou ? 'Correto' : `A resposta é ${esc(p.dx)}`}</div>
        <p><strong>Pivô:</strong> ${esc(p.pivo)}</p>
        <p><strong>Conduta:</strong> ${esc(p.conduta)}</p>
        <p><strong>Distrator perigoso:</strong> ${esc(p.distrator)}</p>
        <p><strong>Pegadinha:</strong> ${esc(p.pegadinha)}</p>
        ${p.alerta ? `<p><strong>Atenção:</strong> ${esc(p.alerta)}</p>` : ''}
      </div>
      ${acertou ? `
      <div class="linha" style="margin-top:var(--e-4)">
        <span class="pequeno">Você tinha certeza, ou chutou?</span>
        <button class="btn btn--contorno btn--pequeno" data-certeza="sim" type="button">Tinha certeza</button>
        <button class="btn btn--contorno btn--pequeno" data-certeza="nao" type="button">Chutei</button>
      </div>` : ''}`;

    if (acertou) {
      elRes.querySelectorAll('[data-certeza]').forEach((b) => b.addEventListener('click', () => {
        const confiante = b.dataset.certeza === 'sim';
        store.registrarPadrao(chave, true, confiante);
        b.parentElement.innerHTML = confiante
          ? '<span class="pequeno" style="color:var(--ok)">Registrado como dominado.</span>'
          : '<span class="pequeno" style="color:var(--atencao)">Registrado como frágil. Acerto por chute não vira domínio: volta na fila de revisão.</span>';
        atualizarProgressoTopo();
      }));
    } else {
      store.registrarPadrao(chave, false);
      atualizarProgressoTopo();
    }
  });
}

/* -------------------------------------------------------------- BANCADA -- */

function telaBancada() {
  return `
  <div class="empilha-g">
    <section class="prosa empilha">
      <h1>Bancada</h1>
      <p>Aqui você manipula o traçado em vez de só olhar. Produzir a anormalidade e medir com as
      próprias mãos fixa o critério de um jeito que reconhecer padrão pronto não consegue.</p>
    </section>
    <div id="ferramenta-gerador"></div>
    <div id="ferramenta-eixo"></div>
    <div id="ferramenta-paquimetro"></div>
  </div>`;
}

/* ----------------------------------------------------------- DESEMPENHO -- */

function telaDesempenho() {
  const r = store.resumo(Object.keys(PADROES).length);
  const frageis = store.fragilidades();
  const revisar = store.filaDeRevisao();

  return `
  <div class="empilha-g">
    <section class="prosa empilha">
      <h1>Desempenho</h1>
      <p>Tudo isto fica salvo apenas no seu navegador. Não há conta nem servidor. Se você limpar os
      dados do navegador ou trocar de aparelho, o progresso vai junto. Use o botão de exportar para
      guardar uma cópia.</p>
    </section>

    <div class="grade-auto">
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4)">${r.solidos}</div><div class="etiqueta">padrões dominados</div></div>
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4);color:var(--atencao)">${r.frageis}</div><div class="etiqueta">a revisar</div></div>
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4)">${r.aproveitamento ?? 'sem dados'}${r.aproveitamento != null ? '%' : ''}</div><div class="etiqueta">acerto em questões</div></div>
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4)">${r.casosConcluidos}</div><div class="etiqueta">casos concluídos</div></div>
    </div>

    ${revisar.length ? `
    <section class="empilha">
      <h2>Vencidos para revisão</h2>
      <p class="prosa fraco">A repetição espaçada agenda cada padrão para voltar quando você está
      prestes a esquecê-lo. Estes já venceram.</p>
      <div class="grade-auto">
        ${revisar.map((f) => `<button class="cartao" data-padrao="${f.chave}" style="text-align:left;cursor:pointer">
          <h3 class="cartao-titulo" style="font-size:var(--t-1)">${esc(PADROES[f.chave]?.nome || f.chave)}</h3>
          <p class="cartao-sub">Última vez: ${new Date(f.ultimaVez).toLocaleDateString('pt-BR')}</p>
        </button>`).join('')}
      </div>
    </section>` : ''}

    ${frageis.length ? `
    <section class="empilha">
      <h2>Marcados como frágeis</h2>
      <p class="prosa fraco">Você acertou por chute, ou errou. Acerto frágil não vira domínio.</p>
      <div class="grade-auto">
        ${frageis.map((f) => `<button class="cartao" data-padrao="${f.chave}" style="text-align:left;cursor:pointer">
          <h3 class="cartao-titulo" style="font-size:var(--t-1)">${esc(PADROES[f.chave]?.nome || f.chave)}</h3>
          <p class="cartao-sub">${f.acertos} de ${f.tentativas} tentativas</p>
        </button>`).join('')}
      </div>
    </section>` : '<div class="nota nota--ok"><div class="nota-titulo">Fila limpa</div>Nenhum padrão pendente de revisão no momento.</div>'}

    <section class="cartao empilha">
      <h3 class="cartao-titulo">Levar o progresso com você</h3>
      <div class="linha">
        <button class="btn btn--contorno" data-exportar type="button">Exportar progresso</button>
        <button class="btn btn--contorno" data-importar type="button">Importar</button>
        <button class="btn btn--fantasma" data-zerar type="button">Apagar tudo</button>
      </div>
      <input type="file" accept="application/json" hidden data-arquivo>
    </section>
  </div>`;
}

function ligarDesempenho(raiz) {
  raiz.querySelector('[data-exportar]')?.addEventListener('click', () => {
    const blob = new Blob([store.exportar()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ecg-progresso.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  const arq = raiz.querySelector('[data-arquivo]');
  raiz.querySelector('[data-importar]')?.addEventListener('click', () => arq.click());
  arq?.addEventListener('change', async () => {
    const f = arq.files?.[0];
    if (!f) return;
    try {
      store.importar(await f.text());
      ir('desempenho');
    } catch (e) {
      alert(`Não consegui importar: ${e.message}`);
    }
  });

  raiz.querySelector('[data-zerar]')?.addEventListener('click', () => {
    if (confirm('Isto apaga todo o seu progresso neste navegador. Não dá para desfazer. Continuar?')) {
      store.zerar();
      ir('desempenho');
    }
  });
}

/* --------------------------------------------------- PLANTÃO E QUESTÕES -- */

/* A aba Plantão vive em ./screens/plantao.js: telaPlantao monta o índice e
   ligarPlantao conduz o caso decisão a decisão, com o Freio antes de cada
   correção. Um único ouvinte, no palco, que morre ao trocar de aba. */

function telaQuestoes() {
  if (!QUESTOES.length) {
    return `<div class="nota nota--info"><div class="nota-titulo">Banco em preparação</div>
      As questões estão sendo escritas e passando por validação clínica antes de entrar no ar.</div>`;
  }
  return `
  <div class="empilha-g">
    <section class="prosa empilha">
      <h1>Questões</h1>
      <p>Comentadas item a item: por que a correta está correta e por que cada errada seduz.</p>
    </section>
    <div class="linha">
      <button class="btn btn--principal" data-sortear type="button">Sortear questão</button>
      <select class="btn btn--contorno" data-filtro aria-label="Filtrar por tema">
        <option value="">Todos os temas</option>
        ${Object.entries(FAMILIAS).sort((a, b) => a[1].ordem - b[1].ordem)
          .map(([k, v]) => `<option value="${k}">${esc(v.nome)}</option>`).join('')}
      </select>
    </div>
    <div id="questao-atual"></div>
  </div>`;
}

function ligarQuestoes(raiz) {
  const alvo = raiz.querySelector('#questao-atual');
  const filtro = raiz.querySelector('[data-filtro]');
  if (!alvo) return;

  let atual = null;
  let respondida = false;

  function sortear() {
    const pool = filtro.value ? QUESTOES.filter((q) => q.familia === filtro.value) : QUESTOES;
    if (!pool.length) {
      alvo.innerHTML = '<div class="nota nota--info">Ainda não há questões deste tema.</div>';
      return;
    }
    atual = pool[Math.floor(Math.random() * pool.length)];
    respondida = false;

    alvo.innerHTML = `
      <div class="cartao empilha">
        <div class="linha">
          ${atual.comandoInvertido ? '<span class="divergencia">comando invertido</span>' : ''}
        </div>
        <p>${esc(atual.enunciado)}</p>
        <div class="empilha" data-alts>
          ${atual.alternativas.map((a, i) =>
            `<button class="btn btn--contorno cheio" data-alt="${i}" style="justify-content:flex-start;text-align:left;height:auto;padding-block:var(--e-3)">
              <strong style="margin-right:var(--e-2)">${String.fromCharCode(65 + i)}</strong> ${esc(a)}
            </button>`).join('')}
        </div>
        <div data-freio></div>
        <div data-correcao></div>
      </div>`;

    alvo.querySelector('[data-alts]').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-alt]');
      if (b && !respondida) freio(Number(b.dataset.alt));
    });
  }

  /* O Freio: antes de abrir o gabarito, o aluno nomeia o que a questão pede. */
  function freio(escolha) {
    respondida = true;
    for (const b of alvo.querySelectorAll('[data-alt]')) b.disabled = true;

    alvo.querySelector('[data-freio]').innerHTML = `
      <div class="nota nota--atencao">
        <div class="nota-titulo">Freio, antes de abrir</div>
        <p>Você marcou <strong>${String.fromCharCode(65 + escolha)}</strong>. Em uma linha:
        <strong>o que esta questão está de fato pedindo?</strong> O que ela mede, não a história
        que ela contou.</p>
        <textarea data-freio-texto rows="2" style="width:100%;margin-top:var(--e-2);padding:var(--e-2);border:1px solid var(--linha-2);border-radius:var(--r-2);font:inherit" placeholder="o que ela pede de verdade é..."></textarea>
        <button class="btn btn--principal btn--pequeno" data-abrir type="button" style="margin-top:var(--e-2)">Abrir correção</button>
      </div>`;

    alvo.querySelector('[data-abrir]').addEventListener('click', () => corrigir(escolha));
  }

  function corrigir(escolha) {
    const texto = (alvo.querySelector('[data-freio-texto]')?.value || '').trim();
    const acertou = escolha === atual.correta;
    store.registrarQuestao(atual.id, acertou);

    for (const b of alvo.querySelectorAll('[data-alt]')) {
      const i = Number(b.dataset.alt);
      if (i === atual.correta) b.style.borderColor = 'var(--ok)';
      else if (i === escolha) b.style.borderColor = 'var(--perigo)';
      else b.style.opacity = '0.5';
    }

    alvo.querySelector('[data-freio]').innerHTML = '';
    alvo.querySelector('[data-correcao]').innerHTML = `
      <div class="nota ${acertou ? 'nota--ok' : 'nota--perigo'}">
        <div class="nota-titulo">${acertou ? 'Correta' : `A resposta é ${String.fromCharCode(65 + atual.correta)}`}</div>
        <p>${esc(atual.porQue)}</p>
      </div>
      <div class="nota nota--info" style="margin-top:var(--e-3)">
        <div class="nota-titulo">O que a questão pedia</div>
        <p>${esc(atual.variavelDecisiva)}</p>
        ${texto ? `<p style="margin-top:var(--e-2)">Você escreveu: <em>"${esc(texto)}"</em>. Se não bateu, o furo não foi de conteúdo: foi ter respondido outra pergunta.</p>`
                : '<p style="margin-top:var(--e-2);color:var(--atencao)">Você pulou o Freio. Fechar sem dizer o que a questão pede é exatamente o que custa ponto na prova.</p>'}
      </div>
      ${Array.isArray(atual.porQueErradas) ? `
      <details class="cartao cartao--calmo" style="margin-top:var(--e-3)">
        <summary style="cursor:pointer;font-weight:650">Por que cada alternativa</summary>
        <div class="empilha" style="margin-top:var(--e-3)">
          ${atual.porQueErradas.map((t, i) => `<p><strong>${String.fromCharCode(65 + i)}.</strong> ${esc(t)}</p>`).join('')}
        </div>
      </details>` : ''}
      ${atual.pegadinha ? `<div class="nota nota--atencao" style="margin-top:var(--e-3)"><div class="nota-titulo">Pegadinha</div>${esc(atual.pegadinha)}</div>` : ''}
      ${atual.fonte ? `<p class="miudo fraco" style="margin-top:var(--e-3)">Fonte: ${esc(atual.fonte)}</p>` : ''}
      <button class="btn btn--principal" data-proxima type="button" style="margin-top:var(--e-4)">Próxima questão</button>`;

    alvo.querySelector('[data-proxima]').addEventListener('click', sortear);
    atualizarProgressoTopo();
  }

  raiz.querySelector('[data-sortear]').addEventListener('click', sortear);
  filtro.addEventListener('change', sortear);
  sortear();
}

/* ==========================================================================
   NAVEGAÇÃO
   ========================================================================== */

const vista = () => document.getElementById('vista');

function atualizarProgressoTopo() {
  const r = store.resumo(Object.keys(PADROES).length);
  const barra = document.getElementById('progresso-topo');
  const total = Object.keys(PADROES).length;
  barra.innerHTML = Array.from({ length: Math.min(total, 12) }, (_, i) => {
    const preenchidos = Math.round((r.solidos / total) * Math.min(total, 12));
    return `<span class="progresso-seg" data-estado="${i < preenchidos ? 'solido' : ''}"></span>`;
  }).join('');
  document.getElementById('progresso-texto').textContent = `${r.solidos}/${total}`;
}

function ir(destino, arg) {
  const raiz = vista();

  // A vista inteira vai ser substituída: nada da tela anterior pode continuar
  // animando.
  matarMonitores();

  if (destino === 'padrao') {
    raiz.innerHTML = telaPadrao(arg);
    ligarTelaPadrao(raiz, arg);
  } else if (destino === 'metodo') {
    raiz.innerHTML = telaMetodo();
  } else if (destino === 'papel') {
    raiz.innerHTML = telaPapel();
    ligarPapel(raiz);
  } else if (destino === 'anatomia') {
    criarAnatomia(raiz);
  } else if (destino === 'aula') {
    raiz.innerHTML = telaAula(arg);
    raiz.querySelector('[data-voltar]')?.addEventListener('click', () => ir('modulos'));
  } else if (destino === 'modulos') {
    raiz.innerHTML = telaModulos();
  } else if (destino === 'bancada') {
    raiz.innerHTML = telaBancada();
    criarGerador(document.getElementById('ferramenta-gerador'));
    criarEixo(document.getElementById('ferramenta-eixo'));
    criarPaquimetro(document.getElementById('ferramenta-paquimetro'), { montarRitmo });
  } else if (destino === 'plantao') {
    raiz.innerHTML = telaPlantao(CASOS, PADROES);
    ligarPlantao(raiz, {
      CASOS, PADROES, MOVIMENTOS, store,
      montarRitmo, renderizarTira, criarMonitor: criarMonitorRastreado,
      mmPx, aoRegistrar: atualizarProgressoTopo,
    });
  } else if (destino === 'questoes') {
    raiz.innerHTML = telaQuestoes();
    ligarQuestoes(raiz);
  } else if (destino === 'desempenho') {
    raiz.innerHTML = telaDesempenho();
    ligarDesempenho(raiz);
  }

  const abaAtiva = (destino === 'padrao' || destino === 'aula') ? 'modulos' : destino;
  for (const t of document.querySelectorAll('.aba')) {
    t.setAttribute('aria-selected', String(t.dataset.tela === abaAtiva));
  }

  if (location.hash.slice(1) !== destino) history.replaceState(null, '', `#${destino}`);
  document.getElementById('principal').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
  atualizarProgressoTopo();
}

function montarAbas() {
  const nav = document.getElementById('abas');
  nav.innerHTML = TELAS.map((t) =>
    `<button class="aba" role="tab" data-tela="${t.id}" aria-selected="false">${t.rotulo}</button>`).join('');
  nav.addEventListener('click', (ev) => {
    const b = ev.target.closest('.aba');
    if (b) ir(b.dataset.tela);
  });
}

/* ==========================================================================
   INÍCIO
   ========================================================================== */

async function iniciar() {
  montarAbas();

  // Delegação de clique registrada UMA única vez. Se fosse religada a cada
  // navegação, os manipuladores se acumulariam e um clique dispararia N vezes.
  vista().addEventListener('click', (ev) => {
    const alvoAula = ev.target.closest('[data-aula]');
    if (alvoAula) { ir('aula', alvoAula.dataset.aula); return; }
    const alvoPadrao = ev.target.closest('[data-padrao]');
    if (alvoPadrao) { ir('padrao', alvoPadrao.dataset.padrao); return; }
  });

  await carregarConteudo();
  const inicial = location.hash.slice(1);
  ir(TELAS.some((t) => t.id === inicial) ? inicial : 'metodo');

  // Redesenha os traçados quando a escala do papel muda de faixa.
  let larguraAnterior = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - larguraAnterior) > 80) {
      larguraAnterior = window.innerWidth;
      const atual = location.hash.slice(1) || 'metodo';
      if (['papel', 'bancada'].includes(atual)) ir(atual);
    }
  }, { passive: true });
}

iniciar();
