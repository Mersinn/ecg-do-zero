/**
 * Localizar: onde está o infarto, e qual bloqueio é este.
 *
 * Duas habilidades diferentes que a prova cobra com a mesma pergunta implícita,
 * "qual é o lado":
 *
 *  1. Diante de supradesnivelamento, QUAL PAREDE e qual artéria. Isso não se
 *     deduz do traçado isolado: decora-se a correspondência entre derivação e
 *     território, e depois se lê o espelho.
 *  2. Diante de bloqueio atrioventricular, QUAL DOS QUATRO. Aqui não há o que
 *     decorar: é uma única variável observada em batimentos consecutivos, o
 *     comportamento do intervalo PR.
 *
 * FONTES. A tabela de parede, derivação e artéria vem do Guia OSCE do curso do
 * autor, que é a única fonte local que traz V7 a V9 e V3R e V4R. Os limiares de
 * supra por derivação e sexo vêm da Quarta Definição Universal de Infarto do
 * Miocárdio (2018), já citada em library.js. O comportamento do PR nos quatro
 * bloqueios vem de library.js, que passou pela auditoria clínica.
 *
 * NADA aqui é inferido. Onde o material do curso enuncia algo de forma errada,
 * o erro está marcado como erro, com a versão correta ao lado.
 */

/* ==========================================================================
   PAREDES
   ========================================================================== */

const DERIVACOES = ['DI', 'DII', 'DIII', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

const PAREDES = [
  {
    id: 'anterosseptal',
    nome: 'Anterosseptal',
    deriv: ['V1', 'V2', 'V3', 'V4'],
    espelho: [],
    arteria: 'Descendente anterior',
    nota: `O septo e a parede anterior. Supra de V1 a V4 sem envolver DI e aVL costuma ser
      oclusão da descendente anterior depois da primeira diagonal.`,
    cuidado: null,
  },
  {
    id: 'anterior-extenso',
    nome: 'Anterior extenso',
    deriv: ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'DI', 'aVL'],
    espelho: ['DII', 'DIII', 'aVF'],
    arteria: 'Descendente anterior proximal',
    nota: `Quando o supra cobre todo o precórdio e ainda alcança DI e aVL, a oclusão é proximal
      e o território em risco é grande. É o infarto de pior prognóstico imediato entre os
      anteriores.`,
    cuidado: `Massa ventricular extensa comprometida: atenção a choque cardiogênico e a
      bloqueios de ramo novos.`,
  },
  {
    id: 'lateral-alta',
    nome: 'Lateral alta',
    deriv: ['DI', 'aVL'],
    espelho: ['DII', 'DIII', 'aVF'],
    arteria: 'Circunflexa ou primeira diagonal',
    nota: `Duas derivações apenas, e é por isso que passa despercebido. Supra em DI e aVL com
      infra em parede inferior é o par recíproco clássico.`,
    cuidado: null,
  },
  {
    id: 'inferior',
    nome: 'Inferior',
    deriv: ['DII', 'DIII', 'aVF'],
    espelho: ['DI', 'aVL'],
    arteria: 'Coronária direita em cerca de 80% dos casos, circunflexa nos demais',
    nota: `A parede que mais cai em prova, e a que exige uma conduta extra: diante de supra
      inferior, pedir V3R e V4R para descartar envolvimento do ventrículo direito.`,
    cuidado: `Se houver infarto de VENTRÍCULO DIREITO associado, nitrato, morfina e diurético
      estão contraindicados: o débito passa a depender da pré-carga e essas drogas a derrubam.
      A conduta é volume. Atenção, porque o material de OSCE do curso enuncia isso errado,
      atribuindo a contraindicação à "parede inferior". A contraindicação é do acometimento do
      VD, não da parede inferior em si.`,
  },
  {
    id: 'vd',
    nome: 'Ventrículo direito',
    deriv: ['V3R', 'V4R'],
    espelho: [],
    arteria: 'Coronária direita proximal',
    nota: `Não aparece no ECG de rotina: é preciso pedir as derivações direitas. Suspeite sempre
      que houver supra inferior, sobretudo com hipotensão e pulmões limpos.`,
    cuidado: `Mesma contraindicação acima: nitrato, morfina e diurético fora. Volume dentro.`,
  },
  {
    id: 'dorsal',
    nome: 'Dorsal (posterior)',
    deriv: ['V7', 'V8', 'V9'],
    espelho: ['V1', 'V2', 'V3'],
    arteria: 'Coronária direita ou circunflexa',
    nota: `O infarto que se manifesta ao contrário. No ECG de rotina aparece como INFRA de ST em
      V1 a V3 com onda R alta, que é a imagem em espelho do supra que existe atrás.`,
    cuidado: `É equivalente de oclusão: reperfunde. Confundir com "sem supra" e apenas
      estratificar risco é o erro que este quadro cobra.`,
  },
];

const LIMIARES = [
  ['Maioria das derivações', '≥ 1 mm'],
  ['V2 e V3, homem com 40 anos ou mais', '≥ 2 mm'],
  ['V2 e V3, homem abaixo de 40 anos', '≥ 2,5 mm'],
  ['V2 e V3, mulher de qualquer idade', '≥ 1,5 mm'],
  ['V3R e V4R', '≥ 0,5 mm'],
  ['V7 a V9', '≥ 0,5 mm'],
];

/* ==========================================================================
   BLOQUEIOS ATRIOVENTRICULARES
   ========================================================================== */

const BLOQUEIOS = [
  {
    id: 'bav1',
    nome: 'BAV de 1º grau',
    pr: 'Longo e FIXO',
    conduz: 'Todo P conduz. Nenhum QRS falha.',
    nivel: 'Nodal',
    gravidade: 'leve',
    conduta: 'Em geral nenhuma. Revisar drogas que freiam o nó AV.',
  },
  {
    id: 'mobitz1',
    nome: 'Mobitz I (Wenckebach)',
    pr: 'CRESCE a cada batimento até um QRS falhar, depois reinicia',
    conduz: 'Falha periódica, precedida de alongamento progressivo.',
    nivel: 'Nodal',
    gravidade: 'leve',
    conduta: 'Observação. Responde a atropina quando sintomático.',
  },
  {
    id: 'mobitz2',
    nome: 'Mobitz II',
    pr: 'FIXO, e de repente um P não conduz',
    conduz: 'Falha súbita, sem aviso no PR anterior.',
    nivel: 'Infranodal (His-Purkinje)',
    gravidade: 'grave',
    conduta: 'Marcapasso. Atropina é ineficaz e pode piorar.',
  },
  {
    id: 'bavt',
    nome: 'BAV total (3º grau)',
    pr: 'Não existe PR: nenhuma relação entre P e QRS',
    conduz: 'Nenhum P conduz. Dissociação atrioventricular completa.',
    nivel: 'Nodal ou infranodal',
    gravidade: 'grave',
    conduta: 'Marcapasso. Emergência quando há instabilidade.',
  },
];

/* ==========================================================================
   DESENHO DO TORSO COM AS DERIVAÇÕES
   ========================================================================== */

function torsoSVG() {
  const pos = {
    V1: [118, 96], V2: [136, 96], V3: [150, 106], V4: [164, 116],
    V5: [182, 116], V6: [200, 116],
    V3R: [100, 96], V4R: [86, 116],
    V7: [216, 122], V8: [230, 130], V9: [244, 138],
  };
  const membros = { DI: [60, 46], DII: [60, 170], DIII: [232, 170], aVR: [42, 60], aVL: [246, 60], aVF: [146, 190] };

  const eletrodo = (nome, [x, y], classe) =>
    `<g class="loc-eletrodo ${classe}" data-deriv="${nome}">
       <circle cx="${x}" cy="${y}" r="9"/>
       <text x="${x}" y="${y + 3.4}" text-anchor="middle">${nome}</text>
     </g>`;

  return `<svg class="loc-torso" viewBox="0 0 292 208" role="img"
       aria-label="Esquema do tórax com a posição das derivações precordiais, direitas e posteriores">
    <path class="loc-corpo" d="M146 18c30 0 52 10 58 26 6 16 6 42 4 66 -3 34 -10 58 -18 74H102c-8-16-15-40-18-74 -2-24-2-50 4-66 6-16 28-26 58-26z"/>
    <ellipse class="loc-coracao-forma" cx="152" cy="106" rx="30" ry="26"/>
    ${Object.entries(pos).map(([n, p]) => eletrodo(n, p, n.endsWith('R') ? 'e-dir' : (['V7', 'V8', 'V9'].includes(n) ? 'e-post' : 'e-prec'))).join('')}
    ${Object.entries(membros).map(([n, p]) => eletrodo(n, p, 'e-membro')).join('')}
  </svg>`;
}

/* ==========================================================================
   TELA
   ========================================================================== */

export function telaLocalizar() {
  return `
  <div class="empilha-g">
    <section class="prosa empilha">
      <h1>Onde está, e qual é.</h1>
      <p>Duas perguntas que a prova faz o tempo todo e que se respondem de maneiras opostas.
      A parede do infarto se responde por correspondência decorada entre derivação e território.
      O tipo de bloqueio se responde observando uma única variável ao longo de vários batimentos.</p>
    </section>

    <section class="empilha">
      <h2>A parede do infarto</h2>
      <p>Toque numa parede: as derivações dela acendem no tórax, junto com as recíprocas.</p>

      <div class="loc-grade">
        <div class="loc-mapa">${torsoSVG()}</div>
        <div class="loc-lista" role="tablist" aria-label="Paredes">
          ${PAREDES.map((p, i) => `
            <button class="loc-parede" role="tab" data-parede="${i}" aria-selected="${i === 0}">
              <span class="loc-parede-nome">${p.nome}</span>
              <span class="loc-parede-deriv">${p.deriv.join(' · ')}</span>
            </button>`).join('')}
        </div>
      </div>

      <div class="loc-detalhe" data-detalhe aria-live="polite"></div>
    </section>

    <section class="empilha">
      <h2>Quanto de supra conta</h2>
      <p>Medido no ponto J, em duas derivações contíguas. O limiar muda por derivação e por sexo,
      e é justamente essa variação que a prova cobra.</p>
      <div class="loc-limiares">
        ${LIMIARES.map(([onde, quanto]) => `
          <div class="loc-limiar">
            <span class="loc-limiar-onde">${onde}</span>
            <span class="loc-limiar-quanto mono">${quanto}</span>
          </div>`).join('')}
      </div>
      <p class="miudo fraco">Quarta Definição Universal de Infarto do Miocárdio, 2018.</p>
    </section>

    <section class="empilha">
      <h2>Qual bloqueio é este</h2>
      <p>Aqui não há tabela a decorar. Meça o intervalo PR de três batimentos seguidos e observe
      o que ele faz antes de um QRS falhar. Essa única observação separa os quatro.</p>

      <div class="loc-bavs">
        ${BLOQUEIOS.map((b) => `
          <button class="loc-bav" data-padrao="${b.id}" data-grav="${b.gravidade}">
            <span class="loc-bav-nome">${b.nome}</span>
            <span class="loc-bav-pr">${b.pr}</span>
            <dl class="loc-bav-dl">
              <dt>Condução</dt><dd>${b.conduz}</dd>
              <dt>Nível</dt><dd>${b.nivel}</dd>
              <dt>Conduta</dt><dd>${b.conduta}</dd>
            </dl>
            <span class="loc-bav-ir">Ver o traçado</span>
          </button>`).join('')}
      </div>

      <div class="nota nota--perigo">
        <div class="nota-titulo">A pegadinha que o curso marca</div>
        Atropina não funciona em bloqueio infranodal. Em Mobitz II ou BAV total instável, vá direto
        ao marcapasso transcutâneo em vez de repetir doses. O nó AV recebe inervação vagal
        abundante; o feixe de His e os ramos, não. É por isso que atropina resolve Wenckebach e
        não resolve Mobitz II.
      </div>
    </section>
  </div>`;
}

export function ligarLocalizar(raiz) {
  const detalhe = raiz.querySelector('[data-detalhe]');
  const torso = raiz.querySelector('.loc-torso');
  if (!detalhe) return;

  function selecionar(i) {
    const p = PAREDES[i];

    for (const b of raiz.querySelectorAll('[data-parede]')) {
      b.setAttribute('aria-selected', String(Number(b.dataset.parede) === i));
    }

    for (const g of torso.querySelectorAll('[data-deriv]')) {
      const d = g.dataset.deriv;
      g.classList.toggle('acesa', p.deriv.includes(d));
      g.classList.toggle('espelho', p.espelho.includes(d));
    }

    detalhe.innerHTML = `
      <h3>${p.nome}</h3>
      <dl class="loc-dl">
        <dt>Supradesnivelamento em</dt>
        <dd class="mono">${p.deriv.join(' · ')}</dd>
        ${p.espelho.length ? `<dt>Imagem em espelho (infra) em</dt><dd class="mono">${p.espelho.join(' · ')}</dd>` : ''}
        <dt>Artéria</dt><dd>${p.arteria}</dd>
      </dl>
      <p>${p.nota}</p>
      ${p.cuidado ? `<div class="nota nota--perigo"><div class="nota-titulo">Cuidado</div>${p.cuidado}</div>` : ''}`;
  }

  raiz.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-parede]');
    if (b) selecionar(Number(b.dataset.parede));
  });

  // Setas navegam entre paredes, como em qualquer lista de abas.
  raiz.addEventListener('keydown', (ev) => {
    const b = ev.target.closest('[data-parede]');
    if (!b) return;
    const i = Number(b.dataset.parede);
    let alvo = null;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') alvo = (i + 1) % PAREDES.length;
    else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') alvo = (i - 1 + PAREDES.length) % PAREDES.length;
    else if (ev.key === 'Home') alvo = 0;
    else if (ev.key === 'End') alvo = PAREDES.length - 1;
    if (alvo == null) return;
    ev.preventDefault();
    selecionar(alvo);
    raiz.querySelector(`[data-parede="${alvo}"]`)?.focus();
  });

  selecionar(0);
}
