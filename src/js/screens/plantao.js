/**
 * Aba Plantão: os casos clínicos, ligados de verdade.
 *
 * A tela antiga listava blocos que não clicavam. Aqui o caso abre, mostra o
 * cenário e o traçado que chegou, e cobra uma decisão por vez.
 *
 * O eixo pedagógico é o Freio: entre a escolha e a correção existe uma parada
 * obrigatória em que o aluno escreve, em uma linha, o que aquela decisão está
 * pedindo. Só depois o gabarito abre, e a linha que ele escreveu fica ao lado
 * da variável decisiva do caso. Quem acerta sem conseguir nomear a variável
 * teve um acerto frágil, e é isso que o texto da correção diz em voz alta.
 *
 * Nenhum dado clínico nasce aqui. Todo conteúdo vem de data/cases.js, que já
 * passou por auditoria. Este arquivo é apresentação e fluxo.
 *
 * Escrita: densa, sem caixa colorida grande, agrupada por filete e espaço.
 * A decisão e a correção são o conteúdo; o resto é moldura.
 */

import { FAMILIAS } from '../ecg/library.js';

/* ==========================================================================
   TEXTO
   ========================================================================== */

const NIVEL = {
  basico: 'básico',
  intermediario: 'intermediário',
  avancado: 'avançado',
};

const LETRA = (i) => String.fromCharCode(65 + i);

/**
 * Escapa HTML e tira o travessão de qualquer texto visível.
 *
 * O banco de casos foi escrito com travessão em várias frases e o projeto o
 * proíbe na interface. Trocar por vírgula é normalização tipográfica: não
 * altera critério, dose nem limiar. O traço de intervalo numérico (–) e o
 * sinal de menos (−) ficam intactos, porque ali eles significam algo.
 */
function esc(valor) {
  return String(valor ?? '')
    .replace(/\s*—\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/\s+,/g, ',')
    .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/**
 * Nome legível do movimento de erro.
 *
 * MOVIMENTOS traz "nome — glosa". Como o travessão não pode aparecer, a glosa
 * vira oração depois de dois-pontos. Sem o mapa, o próprio identificador já é
 * legível ao trocar sublinhado por espaço.
 */
function nomearMovimento(chave, mapa) {
  if (!chave) return '';
  const cru = mapa && mapa[chave];
  if (!cru) return String(chave).replace(/_/g, ' ');
  const partes = String(cru).split('—');
  if (partes.length < 2) return cru;
  return `${partes[0].trim()}, ${partes.slice(1).join(' ').trim()}`;
}

/* ==========================================================================
   LISTA
   ========================================================================== */

function agrupar(CASOS) {
  const mapa = new Map();
  for (const c of CASOS) {
    const fam = c.familia || 'outros';
    if (!mapa.has(fam)) mapa.set(fam, []);
    mapa.get(fam).push(c);
  }
  return [...mapa.entries()].sort(
    (a, b) => (FAMILIAS[a[0]]?.ordem ?? 99) - (FAMILIAS[b[0]]?.ordem ?? 99),
  );
}

function cartaoCaso(caso, PADROES) {
  const temTracado = Boolean(caso.padrao && PADROES && PADROES[caso.padrao]);
  const nDecisoes = caso.decisoes?.length || 0;
  return `<button class="cartao" type="button" data-caso="${esc(caso.id)}"
      style="display:grid;gap:var(--e-2);align-content:start;text-align:left;cursor:pointer">
    <span class="mono miudo" data-estado-caso="${esc(caso.id)}">não iniciado</span>
    <span class="cartao-titulo" style="font-size:var(--t-1)">${esc(caso.titulo)}</span>
    <span class="cartao-sub">${esc(caso.cenario || '')}</span>
    <span class="mono miudo fraco">${nDecisoes} decisões · nível ${esc(NIVEL[caso.nivel] || caso.nivel || '')}${temTracado ? ' · com traçado' : ''}</span>
  </button>`;
}

/** Corpo da lista, sem o invólucro. Reaproveitado a cada volta ao índice. */
function corpoLista(CASOS, PADROES) {
  const grupos = agrupar(CASOS);
  const totalDecisoes = CASOS.reduce((n, c) => n + (c.decisoes?.length || 0), 0);

  return `
    <section class="prosa empilha">
      <span class="etiqueta">Decisão clínica</span>
      <h1>Plantão</h1>
      <p>Cada caso avança uma decisão por vez. Você escolhe, escreve em uma linha o que aquela
      decisão está de fato pedindo, e só então a correção abre. Ler o gabarito antes de nomear o
      que está em jogo é o que faz a prova parecer sorte.</p>
      <p class="mono pequeno fraco"><span data-conta-concluidos>0</span> de ${CASOS.length} casos concluídos · ${totalDecisoes} decisões no banco</p>
    </section>
    ${grupos.map(([fam, lista]) => `
    <section class="empilha">
      <h2>${esc(FAMILIAS[fam]?.nome || fam)}</h2>
      <div class="grade-auto">
        ${lista.map((c) => cartaoCaso(c, PADROES)).join('')}
      </div>
    </section>`).join('')}`;
}

/**
 * Tela inicial da aba. O invólucro [data-plantao] é o palco: tudo o que
 * ligarPlantao troca depois acontece dentro dele, de modo que os ouvintes
 * morrem junto com a tela quando o app navega para outra aba.
 */
export function telaPlantao(CASOS = [], PADROES = {}) {
  if (!Array.isArray(CASOS) || !CASOS.length) {
    return `<div class="nota nota--info">
      <div class="nota-titulo">Casos em preparação</div>
      Esta seção está sendo escrita e revisada clinicamente. Enquanto isso, os módulos e a bancada
      já estão completos.</div>`;
  }
  return `<div class="empilha-g" data-plantao>${corpoLista(CASOS, PADROES)}</div>`;
}

/* ==========================================================================
   FLUXO DO CASO
   ========================================================================== */

/**
 * Liga a aba. Deve ser chamada logo depois de escrever telaPlantao() na raiz.
 *
 * @param {HTMLElement} raiz  o contêiner da vista
 * @param {object} ctx
 *   CASOS, PADROES        bancos já carregados
 *   montarRitmo, renderizarTira, criarMonitor  motor de traçado
 *   store                 progresso; usa registrarCaso e exportar
 *   mmPx                  px por milímetro, número ou função
 *   MOVIMENTOS            opcional; taxonomia de erro de data/cases.js
 *   aoRegistrar           opcional; chamado ao fechar um caso, para que a
 *                         casca redesenhe a barra de progresso do topo
 */
export function ligarPlantao(raiz, ctx = {}) {
  const {
    CASOS = [],
    PADROES = {},
    montarRitmo,
    renderizarTira,
    criarMonitor,
    store,
    MOVIMENTOS,
  } = ctx;

  const palco = raiz.querySelector('[data-plantao]');
  if (!palco || !CASOS.length) return;

  const pxMm = () => {
    const v = typeof ctx.mmPx === 'function' ? ctx.mmPx() : ctx.mmPx;
    return Number(v) > 0 ? Number(v) : 3;
  };

  let monitorVivo = null;
  let atual = null;

  const matarMonitor = () => {
    try { monitorVivo?.destruir(); } catch { /* monitor já morto */ }
    monitorVivo = null;
  };

  const focar = (seletor) => {
    const alvo = palco.querySelector(seletor);
    if (alvo) alvo.focus({ preventScroll: true });
  };

  const aoTopo = () => window.scrollTo({ top: 0, behavior: 'instant' });

  /* ---------------------------------------------------------- progresso -- */

  /**
   * O store guarda os casos concluídos mas não expõe leitor por id. A cópia
   * exportada é a leitura pública disponível, e é barata o bastante para uma
   * lista de dezoito itens.
   */
  function casosRegistrados() {
    try {
      return JSON.parse(store.exportar()).casos || {};
    } catch {
      return {};
    }
  }

  function pintarEstados() {
    const registro = casosRegistrados();
    let concluidos = 0;
    for (const marca of palco.querySelectorAll('[data-estado-caso]')) {
      const r = registro[marca.dataset.estadoCaso];
      if (r && r.concluido) {
        concluidos += 1;
        marca.textContent = `concluído · ${r.decisoesCorretas} de ${r.decisoesTotais} decisões`;
        marca.style.color = 'var(--ok)';
      } else {
        marca.textContent = 'não iniciado';
        marca.style.color = 'var(--tinta-3)';
      }
    }
    const conta = palco.querySelector('[data-conta-concluidos]');
    if (conta) conta.textContent = String(concluidos);
  }

  /* ------------------------------------------------------------- traçado -- */

  function tiraPapel(chave) {
    const p = PADROES[chave] || {};
    const derivacao = p.derivacao || 'DII';
    // O nome do padrão fica de fora do cabeçalho de propósito: escrever o
    // diagnóstico ao lado do traçado do caso responderia a primeira decisão.
    const svg = renderizarTira(montarRitmo(chave), {
      estilo: 'papel', mmPx: pxMm(), alturaMm: 40, derivacao, id: `caso-${chave}`,
    });
    return `<div class="ecg-tira">
      <div class="ecg-cabeca"><span>tira de ritmo</span><span class="ecg-calib-texto">25 mm/s · 10 mm/mV</span></div>
      <div class="ecg-scroller" tabindex="0" role="group" aria-label="Traçado deste caso, derivação ${esc(derivacao)}. Role para o lado para ver a tira inteira.">${svg}</div>
      <div class="ecg-dica-rolagem" data-toque-apenas>Arraste para o lado para ver a tira inteira. A escala do papel não muda.</div>
    </div>`;
  }

  function desenharTracado(caso, comoMonitor) {
    const alvo = palco.querySelector('[data-tracado]');
    if (!alvo || !caso.padrao) return;
    matarMonitor();
    try {
      if (comoMonitor && typeof criarMonitor === 'function') {
        alvo.innerHTML = '<div data-monitor-alvo></div>';
        monitorVivo = criarMonitor(
          alvo.querySelector('[data-monitor-alvo]'),
          montarRitmo(caso.padrao),
          { mmPx: pxMm(), derivacao: PADROES[caso.padrao]?.derivacao || 'DII' },
        );
      } else {
        alvo.innerHTML = tiraPapel(caso.padrao);
      }
    } catch {
      alvo.innerHTML = '<p class="pequeno fraco">Não consegui desenhar este traçado neste aparelho. O caso continua acessível pelos dados acima.</p>';
    }
  }

  /* --------------------------------------------------------- corpo do caso */

  function blocoDados(dados) {
    const itens = String(dados || '').split('·').map((s) => s.trim()).filter(Boolean);
    if (!itens.length) return '';
    return `<ul style="list-style:none;margin:0;padding:0;display:grid;gap:0;grid-template-columns:repeat(auto-fill,minmax(min(100%,13rem),1fr))">
      ${itens.map((it) => `<li class="mono" style="${it.length > 42 ? 'grid-column:1/-1;' : ''}font-size:var(--t--1);border-top:1px solid var(--linha);padding-block:var(--e-2);padding-right:var(--e-3)">${esc(it)}</li>`).join('')}
    </ul>`;
  }

  function corpoCaso(caso) {
    const familia = FAMILIAS[caso.familia]?.nome || caso.familia || '';
    return `
      <div class="linha">
        <button class="btn btn--fantasma btn--pequeno" type="button" data-voltar>Voltar aos casos</button>
        <span class="mono miudo fraco">${esc(familia)} · nível ${esc(NIVEL[caso.nivel] || caso.nivel || '')}</span>
      </div>

      <section class="prosa empilha">
        <h1 tabindex="-1" data-titulo-caso style="font-size:var(--t-3)">${esc(caso.titulo)}</h1>
        <p class="fraco">${esc(caso.cenario || '')}</p>
        <p>${esc(caso.queixa || '')}</p>
      </section>

      <section class="empilha">
        <h2 style="font-size:var(--t-1)">Na chegada</h2>
        ${blocoDados(caso.dados)}
      </section>

      ${caso.padrao ? `
      <section class="empilha">
        <h2 style="font-size:var(--t-1)">O traçado que veio junto</h2>
        <div data-tracado></div>
        ${caso.notaTracado ? `<p class="prosa pequeno fraco">${esc(caso.notaTracado)}</p>` : ''}
        <div class="linha">
          <button class="btn btn--contorno btn--pequeno" type="button" data-alternar-tracado aria-pressed="false">Ver batendo no monitor</button>
        </div>
      </section>` : ''}

      <section class="empilha" style="border-top:1px solid var(--linha-2);padding-top:var(--e-6)">
        <div class="linha">
          <span class="progresso" data-passos></span>
          <span class="mono miudo fraco" data-contador></span>
        </div>
        <div data-decisao></div>
      </section>`;
  }

  /* ----------------------------------------------------------- decisões -- */

  function estadoSegmento(k) {
    const r = atual.respostas[k];
    if (!r) return '';
    return r.acertou ? 'solido' : 'fragil';
  }

  function pintarPassos() {
    const { caso, i } = atual;
    const faixa = palco.querySelector('[data-passos]');
    if (faixa) {
      faixa.innerHTML = caso.decisoes
        .map((_, k) => `<span class="progresso-seg" data-estado="${estadoSegmento(k)}"></span>`)
        .join('');
    }
    const contador = palco.querySelector('[data-contador]');
    if (contador) contador.textContent = `decisão ${i + 1} de ${caso.decisoes.length}`;
  }

  function pintarDecisao() {
    const { caso, i } = atual;
    const d = caso.decisoes[i];
    atual.escolhaPendente = null;
    pintarPassos();

    const alvo = palco.querySelector('[data-decisao]');
    alvo.innerHTML = `
      <h3 tabindex="-1" data-pergunta
        style="font-family:var(--ff-titulo);font-size:var(--t-2);font-weight:640;letter-spacing:-0.015em;line-height:var(--lh-titulo)">${esc(d.pergunta)}</h3>
      <div class="empilha" data-alts style="margin-top:var(--e-5)">
        ${d.alternativas.map((a, k) => `
        <button class="btn btn--contorno cheio" type="button" data-alt="${k}"
          style="justify-content:flex-start;align-items:flex-start;text-align:left;height:auto;padding-block:var(--e-3);line-height:var(--lh-corpo);font-weight:500">
          <strong class="mono" style="color:var(--tinta-3);margin-right:var(--e-2)">${LETRA(k)}</strong>
          <span>${esc(a)}</span>
        </button>`).join('')}
      </div>
      <div data-freio></div>
      <div data-correcao aria-live="polite"></div>`;

    focar('[data-pergunta]');
  }

  /* O Freio. Uma linha, escrita antes de o gabarito abrir. */
  function abrirFreio(escolha) {
    const { caso, i } = atual;
    // A escolha fica no estado, não no DOM: o botão de abrir a correção só
    // precisa saber qual alternativa foi marcada, e ela já está desabilitada.
    atual.escolhaPendente = escolha;
    for (const b of palco.querySelectorAll('[data-alt]')) b.disabled = true;

    const id = `freio-${caso.id}-${i}`;
    palco.querySelector('[data-freio]').innerHTML = `
      <div tabindex="-1" data-freio-bloco class="empilha"
        style="margin-top:var(--e-5);border-left:3px solid var(--acento);padding-left:var(--e-4)">
        <p class="pequeno">Você marcou <strong class="mono">${LETRA(escolha)}</strong>. Antes de abrir a correção,
        em uma linha: <strong>o que esta decisão está de fato pedindo?</strong></p>
        <label class="sr" for="${id}">O que esta decisão está de fato pedindo</label>
        <input id="${id}" type="text" data-freio-texto autocomplete="off"
          placeholder="o que ela pede de verdade é..."
          style="width:100%;min-height:var(--toque);padding:var(--e-2) var(--e-3);border:1px solid var(--linha-2);border-radius:var(--r-2);background:var(--superficie);font:inherit;color:inherit">
        <button class="btn btn--principal" type="button" data-abrir>Abrir correção</button>
      </div>`;

    focar('[data-freio-bloco]');
  }

  function corrigir(escolha) {
    const { caso, i } = atual;
    const d = caso.decisoes[i];
    const escrito = (palco.querySelector('[data-freio-texto]')?.value || '').trim();
    const acertou = escolha === d.correta;

    atual.respostas[i] = { escolha, acertou, freio: escrito };
    pintarPassos();

    for (const b of palco.querySelectorAll('[data-alt]')) {
      const k = Number(b.dataset.alt);
      if (k === d.correta) { b.style.borderColor = 'var(--ok)'; b.style.color = 'var(--ok)'; }
      else if (k === escolha) { b.style.borderColor = 'var(--perigo)'; b.style.color = 'var(--perigo)'; }
      else b.style.opacity = '0.5';
    }

    palco.querySelector('[data-freio]').innerHTML = '';

    const ultima = i === caso.decisoes.length - 1;
    const movimento = nomearMovimento(d.movimento, MOVIMENTOS);

    palco.querySelector('[data-correcao]').innerHTML = `
      <div tabindex="-1" data-correcao-bloco class="empilha"
        style="margin-top:var(--e-5);border-top:1px solid var(--linha-2);padding-top:var(--e-5)">
        <p class="mono pequeno" style="color:var(--${acertou ? 'ok' : 'perigo'})">${acertou ? 'Correta.' : `Errada. A resposta é ${LETRA(d.correta)}.`}</p>
        <p class="prosa"><strong>Por que esta é a correta.</strong> ${esc(d.porQue)}</p>
        <p class="prosa"><strong>O que separava as alternativas.</strong> ${esc(d.variavelDecisiva)}</p>
        ${escrito
          ? `<p class="prosa pequeno fraco">Você escreveu: “${esc(escrito)}”. Se não bateu com a linha acima, o furo não foi de conteúdo: foi ter respondido outra pergunta.</p>`
          : '<p class="prosa pequeno" style="color:var(--atencao)">Você pulou o Freio. Decidir sem nomear o que está em jogo é exatamente o que custa ponto na prova.</p>'}
        <p class="prosa"><strong>Por que a alternativa vizinha seduz.</strong> ${esc(d.porQueSeduz)}</p>
        ${movimento ? `<p class="prosa pequeno fraco"><strong>Movimento de erro cobrado aqui:</strong> ${esc(movimento)}.</p>` : ''}
        <button class="btn btn--principal" type="button" data-avancar>${ultima ? 'Fechar o caso' : 'Próxima decisão'}</button>
      </div>`;

    focar('[data-correcao-bloco]');
  }

  /* --------------------------------------------------------- fechamento -- */

  function corpoFechamento(caso) {
    const total = caso.decisoes.length;
    const corretas = atual.respostas.filter((r) => r && r.acertou).length;
    const freios = atual.respostas.filter((r) => r && r.freio).length;
    const idx = CASOS.findIndex((c) => c.id === caso.id);
    const proximo = idx >= 0 ? CASOS[idx + 1] : null;

    const numero = (v, rotulo) => `<div style="border-top:1px solid var(--linha);padding-top:var(--e-3)">
      <div class="mono" style="font-size:var(--t-3);line-height:1.1">${v}</div>
      <div class="miudo fraco">${rotulo}</div>
    </div>`;

    return `
      <div class="linha">
        <button class="btn btn--fantasma btn--pequeno" type="button" data-voltar>Voltar aos casos</button>
      </div>

      <section class="prosa empilha">
        <h1 tabindex="-1" data-titulo-caso style="font-size:var(--t-3)">Caso fechado</h1>
        <p class="mono pequeno fraco">${esc(caso.titulo)}</p>
        <p>${esc(caso.fechamento || '')}</p>
      </section>

      <section class="empilha">
        <div style="display:grid;gap:var(--e-4);grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr))">
          ${numero(`${corretas}/${total}`, 'decisões corretas')}
          ${numero(`${freios}/${total}`, 'freios escritos')}
        </div>
        ${freios < total
          ? '<p class="prosa pequeno" style="color:var(--atencao)">Acerto sem nomear a variável decisiva é acerto frágil. Ele não se sustenta quando a banca troca o enunciado.</p>'
          : ''}
      </section>

      <section class="empilha">
        <p class="prosa" style="border-left:3px solid var(--acento);padding-left:var(--e-4)">
          <strong>Leve isto.</strong> ${esc(caso.card || '')}</p>
      </section>

      <div class="linha">
        ${proximo ? `<button class="btn btn--principal" type="button" data-caso="${esc(proximo.id)}">Próximo caso</button>` : ''}
        <button class="btn btn--contorno" type="button" data-voltar>Voltar aos casos</button>
      </div>`;
  }

  function fecharCaso() {
    const { caso } = atual;
    const total = caso.decisoes.length;
    const corretas = atual.respostas.filter((r) => r && r.acertou).length;
    const freios = atual.respostas.filter((r) => r && r.freio).length;

    try {
      store.registrarCaso(caso.id, {
        decisoesCorretas: corretas, decisoesTotais: total, freiosEscritos: freios,
      });
    } catch { /* sem persistência; o fechamento continua sendo mostrado */ }

    matarMonitor();
    palco.innerHTML = corpoFechamento(caso);
    aoTopo();
    focar('[data-titulo-caso]');
    if (typeof ctx.aoRegistrar === 'function') ctx.aoRegistrar();
  }

  /* -------------------------------------------------------- navegação --- */

  function mostrarLista() {
    matarMonitor();
    atual = null;
    palco.innerHTML = corpoLista(CASOS, PADROES);
    pintarEstados();
    aoTopo();
  }

  function abrirCaso(id) {
    const caso = CASOS.find((c) => c.id === id);
    if (!caso || !caso.decisoes?.length) return;
    matarMonitor();
    atual = { caso, i: 0, respostas: [] };
    palco.innerHTML = corpoCaso(caso);
    if (caso.padrao) desenharTracado(caso, false);
    pintarDecisao();
    aoTopo();
    focar('[data-titulo-caso]');
  }

  function avancar() {
    const { caso } = atual;
    if (atual.i >= caso.decisoes.length - 1) { fecharCaso(); return; }
    atual.i += 1;
    pintarDecisao();
    palco.querySelector('[data-pergunta]')?.scrollIntoView({ block: 'center', behavior: 'auto' });
  }

  /* Um único ouvinte, no palco. Ele morre quando o app troca de aba, então
     visitar Plantão várias vezes não empilha manipuladores. */
  palco.addEventListener('click', (ev) => {
    const alvo = ev.target instanceof Element ? ev.target : null;
    if (!alvo) return;

    const cartao = alvo.closest('[data-caso]');
    if (cartao) { abrirCaso(cartao.dataset.caso); return; }

    if (alvo.closest('[data-voltar]')) { mostrarLista(); return; }

    const alt = alvo.closest('[data-alt]');
    if (alt && !alt.disabled && atual) { abrirFreio(Number(alt.dataset.alt)); return; }

    if (alvo.closest('[data-abrir]')) {
      if (atual && atual.escolhaPendente != null) corrigir(atual.escolhaPendente);
      return;
    }

    if (alvo.closest('[data-avancar]')) { if (atual) avancar(); return; }

    // O seletor precisa ser este e não [data-monitor]: monitor.js marca o
    // próprio contêiner com data-monitor, e o botão Pausar de dentro dele
    // acabaria trocando o traçado inteiro a cada clique.
    const btnMonitor = alvo.closest('[data-alternar-tracado]');
    if (btnMonitor && atual) {
      const ligar = btnMonitor.getAttribute('aria-pressed') !== 'true';
      btnMonitor.setAttribute('aria-pressed', String(ligar));
      btnMonitor.textContent = ligar ? 'Ver como papel impresso' : 'Ver batendo no monitor';
      desenharTracado(atual.caso, ligar);
    }
  });

  // Enter no campo do Freio abre a correção, como faria o botão.
  palco.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter') return;
    if (!(ev.target instanceof Element) || !ev.target.matches('[data-freio-texto]')) return;
    if (!atual || atual.escolhaPendente == null) return;
    ev.preventDefault();
    corrigir(atual.escolhaPendente);
  });

  pintarEstados();
}
