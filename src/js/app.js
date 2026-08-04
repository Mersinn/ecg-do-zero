/**
 * Casca do app: navegação, telas e ligação entre motor, dados e progresso.
 *
 * Sem framework e sem etapa de build. São módulos ES nativos servidos como
 * arquivo estático — qualquer aluno consegue abrir, ler e alterar o código sem
 * instalar nada. Essa é uma decisão de projeto, não uma limitação.
 */

import { PADROES, FAMILIAS, PASSOS, montarRitmo, listarPadroes } from './ecg/library.js';
import { renderizarTira } from './ecg/engine.js';
import { criarMonitor } from './ecg/monitor.js';
import { criarGerador, criarEixo, criarPaquimetro } from './tools.js';
import { criarAnatomia } from './anatomy.js';
import * as store from './store.js';

/* Conteúdo produzido separadamente. Carregado sob demanda para que o app
   continue funcionando mesmo que um desses arquivos falhe ou ainda não exista. */
let LICOES = { MODULOS: [], ROTEIROS: {} };
let QUESTOES = [];
let CASOS = [];

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
    tentar('./data/cases.js', (m) => { CASOS = m.CASOS || []; }),
  ]);
}

/* ==========================================================================
   UTILIDADES
   ========================================================================== */

const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const mmPx = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mm')) || 3;

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
      <span class="etiqueta">Comece por aqui</span>
      <h1>Ler ECG é seguir uma ordem, não ter um dom.</h1>
      <p>Quem acerta eletrocardiograma com consistência não enxerga melhor que você. A diferença é
      que percorre sempre a mesma sequência, mesmo quando o diagnóstico parece óbvio — principalmente
      quando parece óbvio, porque é aí que se erra.</p>
      <p>Este site é construído em torno dessa sequência. Cada módulo mostra o padrão, depois pede
      que você o leia sozinho, depois cobra a decisão num caso. Você nunca vai receber um traçado
      com o nome do diagnóstico já escrito ao lado.</p>
    </section>

    <section class="empilha">
      <h2>A sequência de nove passos</h2>
      <p class="prosa fraco">O curso ensina duas versões dessa sequência, de sete passos cada, que
      não coincidem entre si — uma vem do roteiro de estágio, outra do guia de OSCE. Aqui está a
      união das duas, que não deixa buraco.</p>
      <ol class="empilha" style="padding-left:1.2rem">
        ${PASSOS.map(([, nome, desc]) => `
          <li><strong>${esc(nome)}.</strong> ${esc(desc)}</li>`).join('')}
      </ol>
    </section>

    <section class="cartao empilha">
      <h3 class="cartao-titulo">O Freio</h3>
      <p>Antes de o site abrir qualquer correção, ele faz uma pergunta: <em>o que esta questão está
      de fato pedindo?</em> Você responde em uma linha, e só então vê o gabarito.</p>
      <p>Parece perda de tempo e não é. O erro mais caro em prova quase nunca é não saber o
      conteúdo — é responder uma pergunta parecida com a que foi feita. Nomear o que está sendo
      medido antes de marcar é o hábito que separa quem reconhece o tema de quem acerta a questão.</p>
    </section>

    <div class="nota nota--atencao">
      <div class="nota-titulo">Sobre os traçados</div>
      Todos os traçados deste site são gerados por equações, a partir de parâmetros clínicos. Eles
      reproduzem fielmente a <em>morfologia</em> de cada padrão, mas não têm ruído, artefato de
      movimento nem a variação individual de um paciente real. Aprenda o padrão aqui; treine o olho
      em traçado real depois.
    </div>
  </div>`;
}

/* ---------------------------------------------------------------- PAPEL -- */

function telaPapel() {
  return `
  <div class="empilha-g">
    <section class="prosa empilha">
      <span class="etiqueta">Fundamento</span>
      <h1>O papel é uma régua.</h1>
      <p>Antes de qualquer diagnóstico, é preciso entender que o traçado é um gráfico com duas
      dimensões físicas: a horizontal é <strong>tempo</strong>, a vertical é <strong>voltagem</strong>.
      Toda medida que você vai fazer depende de a velocidade e o ganho estarem no padrão.</p>
    </section>

    <div class="grade-auto">
      <div class="cartao empilha">
        <h3 class="cartao-titulo">Horizontal: tempo</h3>
        <p>A 25 mm/s, o papel anda 25 milímetros a cada segundo.</p>
        <ul>
          <li><strong>1 quadradinho</strong> (1 mm) = 0,04 s</li>
          <li><strong>1 quadradão</strong> (5 mm) = 0,20 s</li>
          <li><strong>5 quadradões</strong> = 1 segundo</li>
          <li><strong>30 quadradões</strong> = 6 segundos</li>
        </ul>
      </div>
      <div class="cartao empilha">
        <h3 class="cartao-titulo">Vertical: voltagem</h3>
        <p>No ganho padrão de 10 mm/mV, cada milímetro vale 0,1 mV.</p>
        <ul>
          <li><strong>1 quadradinho</strong> = 0,1 mV</li>
          <li><strong>10 mm</strong> = 1 mV</li>
          <li>O <strong>pulso de calibração</strong> no início da tira tem exatamente 10 mm de altura — é ele que prova a calibração</li>
        </ul>
      </div>
      <div class="cartao empilha">
        <h3 class="cartao-titulo">Calcular a frequência</h3>
        <ul>
          <li><strong>Ritmo regular:</strong> 1500 ÷ quadradinhos entre dois R</li>
          <li><strong>Régua rápida:</strong> 300 ÷ quadradões entre dois R</li>
          <li><strong>Ritmo irregular:</strong> conte os QRS em 6 segundos e multiplique por 10</li>
        </ul>
        <p class="miudo fraco">As duas primeiras não valem em ritmo irregular. Em fibrilação atrial,
        só a terceira funciona.</p>
      </div>
    </div>

    <section class="empilha">
      <h2>Um traçado normal, calibrado</h2>
      <p class="prosa fraco">Repare no degrau à esquerda: é o pulso de 1 mV. Meça-o — dez
      quadradinhos de altura. É o gabarito da tira inteira.</p>
      ${tira('normal')}
    </section>

    <section class="cartao empilha" id="regua-papel">
      <div>
        <h3 class="cartao-titulo">Régua do papel</h3>
        <p class="cartao-sub">Conte quadradões entre dois R e veja a frequência sair da conta. É
        assim que se calcula frequência sem calculadora, e é assim que cai na prova.</p>
      </div>
      <div class="ecg-tira">
        <div class="ecg-scroller"><div data-regua-palco></div></div>
      </div>
      <div data-regua-ctrl></div>
      <div class="laudo">
        <div class="laudo-linha"><span class="laudo-chave">Tempo</span><span class="laudo-valor mono" data-regua-tempo></span></div>
        <div class="laudo-linha"><span class="laudo-chave">Frequência</span><span class="laudo-valor" data-regua-fc></span></div>
        <div class="laudo-linha"><span class="laudo-chave">A conta</span><span class="laudo-valor mono" data-regua-conta></span></div>
      </div>
      <div class="nota nota--atencao">
        <div class="nota-titulo">A régua dos múltiplos de 300</div>
        Se o segundo R cai exatamente sobre uma linha grossa, a frequência é
        <strong>300, 150, 100, 75, 60, 50</strong> — uma para cada quadradão. Decorar essa sequência
        resolve a maioria dos traçados regulares em dois segundos. <strong>Nenhuma das duas contas
        vale em ritmo irregular</strong>: em fibrilação atrial, conte os QRS em 6 segundos e
        multiplique por 10.
      </div>
    </section>

    <div class="nota nota--info">
      <div class="nota-titulo">Quando a calibração muda</div>
      Metade do ganho (5 mm/mV) é usada quando o complexo é tão alto que sai do papel, como em
      hipertrofia. O dobro (20 mm/mV) aparece em traçados de baixa voltagem — obeso, enfisematoso,
      derrame pericárdico. Se você não conferir o pulso de calibração, vai medir voltagem errada e
      diagnosticar sobrecarga onde não há, ou deixar de ver a que existe.
    </div>
  </div>`;
}

/**
 * Régua do papel: o aluno varia o número de quadradões entre dois R e vê a
 * frequência sair da divisão. Ensinar a conta mostrando a conta acontecer é
 * mais eficaz que enunciá-la.
 */
function ligarRegua(raiz) {
  const palco = raiz.querySelector('[data-regua-palco]');
  const ctrl = raiz.querySelector('[data-regua-ctrl]');
  if (!palco) return;

  let quadradoes = 4;

  function desenhar() {
    const mm = mmPx();
    const larguraMm = 60;
    const alturaMm = 30;
    const w = larguraMm * mm;
    const h = alturaMm * mm;
    const base = h * 0.68;
    const p1 = mm;
    const p5 = mm * 5;
    const x1 = mm * 6;
    const x2 = x1 + quadradoes * p5;

    const rPico = (x) =>
      `M${x - p1 * 2} ${base} L${x - p1} ${base + p1 * 1.6} L${x} ${base - p1 * 9} L${x + p1} ${base + p1 * 2} L${x + p1 * 2} ${base}`;

    palco.innerHTML = `<svg class="ecg-svg ecg-papel" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" role="img" aria-label="Grade de papel de ECG com dois complexos separados por ${quadradoes} quadradões">
      <defs><pattern id="regua-g" width="${p5}" height="${p5}" patternUnits="userSpaceOnUse">
        <path class="ecg-grade-1" d="M0 0H${p5}M0 ${p1}H${p5}M0 ${p1 * 2}H${p5}M0 ${p1 * 3}H${p5}M0 ${p1 * 4}H${p5}M0 0V${p5}M${p1} 0V${p5}M${p1 * 2} 0V${p5}M${p1 * 3} 0V${p5}M${p1 * 4} 0V${p5}"/>
        <path class="ecg-grade-5" d="M0 0H${p5}M0 0V${p5}"/>
      </pattern></defs>
      <rect class="ecg-fundo" width="${w}" height="${h}"/>
      <rect width="${w}" height="${h}" fill="url(#regua-g)"/>
      <line x1="0" y1="${base}" x2="${w}" y2="${base}" class="ecg-traco" opacity="0.25"/>
      <path class="ecg-traco ecg-onda-qrs" d="${rPico(x1)}"/>
      <path class="ecg-traco ecg-onda-qrs" d="${rPico(x2)}"/>
      <line x1="${x1}" y1="${base - p1 * 11}" x2="${x2}" y2="${base - p1 * 11}" stroke="var(--acento)" stroke-width="1.5"/>
      <line x1="${x1}" y1="${base - p1 * 13}" x2="${x1}" y2="${base - p1 * 9}" stroke="var(--acento)" stroke-width="1.5"/>
      <line x1="${x2}" y1="${base - p1 * 13}" x2="${x2}" y2="${base - p1 * 9}" stroke="var(--acento)" stroke-width="1.5"/>
      <text x="${(x1 + x2) / 2}" y="${base - p1 * 13}" text-anchor="middle" fill="var(--acento)" font-family="var(--ff-mono)" font-size="11" font-weight="700">R–R</text>
      <rect x="${mm}" y="${base + p1 * 3}" width="${p1}" height="${p1}" fill="none" stroke="var(--info)" stroke-width="1.2"/>
      <text x="${mm + p1 * 1.6}" y="${base + p1 * 4}" fill="var(--info)" font-family="var(--ff-mono)" font-size="9">1 quadradinho = 0,04 s</text>
      <rect x="${mm}" y="${base + p1 * 5.5}" width="${p5}" height="${p5}" fill="none" stroke="var(--acento)" stroke-width="1.2"/>
      <text x="${mm + p5 + p1}" y="${base + p1 * 8}" fill="var(--acento)" font-family="var(--ff-mono)" font-size="9">1 quadradão = 0,20 s</text>
    </svg>`;

    const ms = quadradoes * 200;
    const fc = Math.round(300 / quadradoes);
    raiz.querySelector('[data-regua-tempo]').textContent =
      `${quadradoes} quadradões = ${quadradoes * 5} quadradinhos = ${(ms / 1000).toFixed(2).replace('.', ',')} s`;
    const elFc = raiz.querySelector('[data-regua-fc]');
    elFc.textContent = `${fc} bpm${fc < 60 ? ' — bradicardia' : fc > 100 ? ' — taquicardia' : ' — dentro do normal'}`;
    elFc.dataset.status = fc < 60 || fc > 100 ? 'alterado' : 'normal';
    raiz.querySelector('[data-regua-conta]').textContent =
      `300 ÷ ${quadradoes} = ${fc}   ·   1500 ÷ ${quadradoes * 5} = ${fc}`;
  }

  ctrl.innerHTML = `<div class="ctrl">
    <label class="ctrl-nome" for="regua-q">Quadradões entre dois R</label>
    <div class="ctrl-trilho-area"><input id="regua-q" class="trilho" type="range" min="1" max="10" step="1" value="4"></div>
    <output class="ctrl-valor" data-regua-out>4</output>
  </div>`;

  const input = ctrl.querySelector('#regua-q');
  const out = ctrl.querySelector('[data-regua-out]');
  const sincronizar = () => {
    quadradoes = Number(input.value);
    out.textContent = quadradoes;
    input.style.setProperty('--preenchido', `${((quadradoes - 1) / 9) * 100}%`);
    desenhar();
  };
  input.addEventListener('input', sincronizar);
  sincronizar();
}

/* -------------------------------------------------------------- MÓDULOS -- */

function telaModulos() {
  const porFamilia = {};
  for (const [chave, p] of Object.entries(PADROES)) (porFamilia[p.familia] ||= []).push({ chave, ...p });

  const familias = Object.entries(FAMILIAS).sort((a, b) => a[1].ordem - b[1].ordem);

  return `
  <div class="empilha-g">
    <section class="prosa empilha">
      <span class="etiqueta">${Object.keys(PADROES).length} padrões</span>
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
      <span class="etiqueta">${esc(FAMILIAS[familia]?.nome || '')}</span>
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
      <span class="etiqueta">${esc(FAMILIAS[p.familia]?.nome || '')} · ${esc(p.nivel)}</span>
      <h1>${esc(p.nome)}</h1>
    </section>

    <section class="empilha">
      <h2>1. Veja bater</h2>
      <p>Antes de medir qualquer coisa, olhe. Este e o ritmo rodando em tempo real,
      na mesma velocidade em que estaria no monitor do paciente.</p>
      <div data-monitor-vivo="${chave}"></div>
      <h3>Agora congelado, com cada onda nomeada</h3>
      <p>Primeiro veja isto acontecendo. O monitor abaixo est&aacute; batendo em tempo real,
      na mesma velocidade de um paciente com essa frequ&ecirc;ncia.</p>
      <div data-monitor-vivo></div>

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
            <p style="margin-top:var(--e-3)">${esc(p.leitura[k] || '—')}</p>
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
    criarMonitor(alvo, montarRitmo(chave), {
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
    // Monitor ao vivo. Um por vez: o anterior é destruído para não deixar
    // requestAnimationFrame e intervalos órfãos rodando em segundo plano.
    const alvoVivo = raiz.querySelector('[data-monitor-vivo]');
    if (alvoVivo) {
      if (window._monitorAtivo) window._monitorAtivo.destruir();
      window._monitorAtivo = criarMonitor(alvoVivo, montarRitmo(chave), {
        mmPx: mmPx(),
        derivacao: PADROES[chave].derivacao,
      });
    }

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
      t.textContent = passo.titulo || '';
      x.innerHTML = passo.texto || '';
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
          : '<span class="pequeno" style="color:var(--atencao)">Registrado como frágil. Acerto por chute não vira domínio — volta na fila de revisão.</span>';
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
      <span class="etiqueta">Instrumentos</span>
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
      <span class="etiqueta">Seu progresso</span>
      <h1>Desempenho</h1>
      <p>Tudo isto fica salvo apenas no seu navegador. Não há conta nem servidor — se você limpar os
      dados do navegador ou trocar de aparelho, o progresso vai junto. Use o botão de exportar para
      guardar uma cópia.</p>
    </section>

    <div class="grade-auto">
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4)">${r.solidos}</div><div class="etiqueta">padrões dominados</div></div>
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4);color:var(--atencao)">${r.frageis}</div><div class="etiqueta">a revisar</div></div>
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4)">${r.aproveitamento ?? '—'}${r.aproveitamento != null ? '%' : ''}</div><div class="etiqueta">acerto em questões</div></div>
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

function telaPlantao() {
  if (!CASOS.length) {
    return `<div class="nota nota--info"><div class="nota-titulo">Casos em preparação</div>
      Esta seção está sendo escrita e revisada clinicamente. Enquanto isso, os módulos e a bancada
      já estão completos.</div>`;
  }
  return `
  <div class="empilha-g">
    <section class="prosa empilha">
      <span class="etiqueta">${CASOS.length} casos</span>
      <h1>Plantão</h1>
      <p>Casos progressivos, uma decisão por vez. Antes de cada correção vem o Freio: você escreve o
      que a questão está pedindo, e só então o gabarito abre.</p>
    </section>
    <div class="grade-auto">
      ${CASOS.map((c) => `<button class="cartao" data-caso="${esc(c.id)}" style="text-align:left;cursor:pointer">
        <h3 class="cartao-titulo" style="font-size:var(--t-1)">${esc(c.titulo)}</h3>
        <p class="cartao-sub">${esc(c.cenario || '')}</p>
      </button>`).join('')}
    </div>
  </div>`;
}

function telaQuestoes() {
  if (!QUESTOES.length) {
    return `<div class="nota nota--info"><div class="nota-titulo">Banco em preparação</div>
      As questões estão sendo escritas e passando por validação clínica antes de entrar no ar.</div>`;
  }
  return `
  <div class="empilha-g">
    <section class="prosa empilha">
      <span class="etiqueta">${QUESTOES.length} questões</span>
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
          <span class="etiqueta">${esc(FAMILIAS[atual.familia]?.nome || '')}</span>
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
        <div class="nota-titulo">Freio — antes de abrir</div>
        <p>Você marcou <strong>${String.fromCharCode(65 + escolha)}</strong>. Em uma linha:
        <strong>o que esta questão está de fato pedindo?</strong> O que ela mede — não a história
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
        ${texto ? `<p style="margin-top:var(--e-2)">Você escreveu: <em>"${esc(texto)}"</em>. Se não bateu, o furo não foi de conteúdo — foi ter respondido outra pergunta.</p>`
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

  if (destino === 'padrao') {
    raiz.innerHTML = telaPadrao(arg);
    ligarTelaPadrao(raiz, arg);
  } else if (destino === 'metodo') {
    raiz.innerHTML = telaMetodo();
  } else if (destino === 'papel') {
    raiz.innerHTML = telaPapel();
    ligarRegua(raiz);
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
    raiz.innerHTML = telaPlantao();
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
