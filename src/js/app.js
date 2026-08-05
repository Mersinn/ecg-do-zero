/**
 * Casca do app: navegação, telas e ligação entre motor, dados e progresso.
 *
 * Sem framework e sem etapa de build. São módulos ES nativos servidos como
 * arquivo estático — qualquer aluno consegue abrir, ler e alterar o código sem
 * instalar nada. Essa é uma decisão de projeto, não uma limitação.
 */

import { PADROES, FAMILIAS, PASSOS, montarRitmo } from './ecg/library.js';
import { renderizarTira, PAPEL } from './ecg/engine.js';
import { criarMonitor, criarTiraAlternavel } from './ecg/monitor.js';
import { criarGerador, criarEixo, criarPaquimetro } from './tools.js';
import { criarAnatomia } from './anatomy.js';
import { telaLocalizar, ligarLocalizar } from './screens/localizar.js';
import { telaPapel, ligarPapel } from './screens/papel.js';
import { telaPlantao, ligarPlantao } from './screens/plantao.js';
import { animate, inView, hover, press, scroll, spring, stagger, respeitaMovimento } from './motion.js';
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

/**
 * Marca o lugar de uma tira que pode ser vista como papel ou como monitor.
 *
 * Devolve só o buraco. Quem preenche é ligarTirasAlternaveis, logo abaixo,
 * chamada uma vez por navegação: assim qualquer tela do app ganha o alternador
 * só por escrever este marcador no HTML, sem repetir a fiação.
 */
function tira(chave, { altura = 40 } = {}) {
  const p = PADROES[chave];
  if (!p) return '';
  return `<div data-tira-alt="${chave}" data-tira-altura="${altura}" data-tira-titulo="${esc(p.nome)}"></div>`;
}

/**
 * Preenche todos os marcadores de tira alternável da tela atual.
 *
 * Cada tira volta registrada em monitoresVivos: quando ela estiver no modo
 * monitor e o aluno trocar de aba, a animação morre junto com a vista, pelo
 * mesmo caminho dos monitores criados diretamente.
 */
function ligarTirasAlternaveis(raiz) {
  for (const alvo of raiz.querySelectorAll('[data-tira-alt]')) {
    const chave = alvo.dataset.tiraAlt;
    if (!PADROES[chave]) continue;
    try {
      monitoresVivos.add(criarTiraAlternavel(alvo, montarRitmo(chave), {
        mmPx: mmPx(),
        alturaMm: Number(alvo.dataset.tiraAltura) || 40,
        derivacao: PADROES[chave].derivacao,
        titulo: alvo.dataset.tiraTitulo || PADROES[chave].nome,
        id: `alt-${chave}`,
      }));
    } catch {
      alvo.innerHTML = '<p class="pequeno fraco">Não consegui desenhar este traçado neste aparelho.</p>';
    }
  }
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
  // Geometria exata do SVG, para o holofote nao precisar adivinhar.
  // Espelha renderizarTira: margem de calibracao + tracado + folga.
  const margemMm = 2;
  const larguraMm = (ritmo.duracao / 1000) * 25 + margemMm + 2;
  return `<div class="ecg-tira" data-tira-guiada data-duracao="${ritmo.duracao}"
       data-largura-mm="${larguraMm.toFixed(2)}" data-margem-mm="${margemMm}">
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
   MOVIMENTO

   A biblioteca e a Motion, vendorizada em vendor/motion.js e importada pela
   fachada em ./motion.js. Aqui ficam apenas os pontos de uso, e cada um existe
   por um motivo declarado no comentario acima dele.

   O que deliberadamente NAO se anima: o tracado do ECG (tem motor proprio, em
   engine.js e monitor.js), os numeros do laudo das ferramentas e qualquer texto
   que o aluno precise ler parado. Movimento aqui serve para dizer "isto
   respondeu" e para costurar a troca de tela, nunca para enfeitar leitura.
   ========================================================================== */

/* Uma mola so, usada em quase tudo, para que o site tenha uma fisica e nao
   cinco. Curta e com pouco balanco: a intencao e responder, nao saltar. */
const MOLA = { type: spring, stiffness: 320, damping: 30, mass: 0.9 };
/* Mais dura e mais leve: toque precisa devolver resposta dentro do tempo em
   que o dedo ainda esta na tela, senao nao e lido como resposta. */
const MOLA_TOQUE = { type: spring, stiffness: 560, damping: 26, mass: 0.55 };

/**
 * Tudo que precisa ser desligado quando a tela troca.
 *
 * hover, press, inView e scroll registram ouvintes que sobrevivem ao innerHTML,
 * exatamente como os monitores ao vivo sobrevivem. Mesmo problema, mesma
 * solucao: a vista tem um dono so, entao basta desligar todos antes de
 * redesenhar.
 */
const movimentosVivos = new Set();

/**
 * Pode animar algo que comeca escondido para so depois aparecer?
 *
 * Alem da preferencia do sistema, entra aqui a aba em segundo plano. Numa aba
 * oculta o navegador congela o requestAnimationFrame, e uma animacao que
 * comeca em opacidade zero simplesmente nunca sai do zero: o aluno que abrir o
 * site em nova aba e so depois trocar para ela encontraria a pagina em branco.
 * Nesse caso nao se esconde nada, e a tela aparece pronta, que e o
 * comportamento correto de qualquer forma.
 *
 * Gesto de toque nao passa por aqui: nao ha dedo em aba oculta.
 */
const podeRevelar = () => respeitaMovimento() && !document.hidden;

/**
 * Cartoes ja ligados a hover e press, e como desliga-los.
 *
 * Mapa, e nao apenas um conjunto de funcoes, porque o Plantao recria a lista de
 * casos toda vez que o aluno volta de um caso sem que a casca navegue. Sem uma
 * chave por elemento, cada ida e volta deixaria dezoito cartoes desconectados
 * presos na memoria pelo proprio fecho que iria desliga-los.
 */
const gestosPorCartao = new Map();

/** Desliga os gestos dos cartoes que ja sairam do documento. */
function podarGestos() {
  for (const [el, desligadores] of gestosPorCartao) {
    if (el.isConnected) continue;
    for (const desligar of desligadores) {
      try { desligar(); } catch { /* ja desligado */ }
    }
    gestosPorCartao.delete(el);
  }
}

function matarMovimentos() {
  for (const desligar of movimentosVivos) {
    try { desligar(); } catch { /* ja desligado */ }
  }
  movimentosVivos.clear();

  for (const desligadores of gestosPorCartao.values()) {
    for (const desligar of desligadores) {
      try { desligar(); } catch { /* ja desligado */ }
    }
  }
  gestosPorCartao.clear();
}

/** Devolve o elemento ao estado do CSS, sem sobra de estilo embutido. */
function limparMovimento(el) {
  el.style.removeProperty('opacity');
  el.style.removeProperty('transform');
  el.style.removeProperty('will-change');
}

/**
 * Rede de seguranca de toda animacao que comeca escondendo alguma coisa.
 *
 * Nao basta checar document.hidden. Uma aba pode estar com visibilityState
 * "visible" e mesmo assim nao receber quadro nenhum: janela totalmente coberta
 * por outra, aparelho em economia de energia, janela minimizada em parte dos
 * sistemas. Nesses estados o requestAnimationFrame congela, a animacao nunca
 * avanca e o `finished` que devolveria o conteudo nunca resolve. O resultado
 * seria uma pagina em branco sem nenhum erro no console, que e o pior defeito
 * possivel de mandar para um calouro.
 *
 * O setTimeout continua correndo nesses estados, ainda que mais devagar. Ele e
 * o unico ponto de apoio confiavel, e por isso e ele que fecha a conta: passado
 * o prazo, o que ainda estiver exatamente em opacidade zero volta ao CSS. Se a
 * animacao correu normalmente, nao ha o que fazer e a rede nao faz nada.
 */
function redeDeSeguranca(alvos, ms = 1400) {
  const t = setTimeout(() => {
    for (const el of alvos) if (el.style.opacity === '0') limparMovimento(el);
  }, ms);
  movimentosVivos.add(() => clearTimeout(t));
}

/**
 * Entrada de conteudo: deslocamento curto para cima, com mola, em cascata.
 *
 * Existe porque a troca seca de tela era parte do que fazia a navegacao parecer
 * amadora: o conteudo simplesmente aparecia trocado, sem nada dizer de onde
 * veio. Dez pixels e o suficiente para o olho registrar a direcao da troca sem
 * que ninguem precise esperar a animacao acabar para ler.
 *
 * O estilo embutido e removido no fim de proposito: um `transform` residual
 * mantem o elemento numa camada de composicao propria, e ai o canvas do monitor
 * e o SVG do tracado ficam reamostrados e levemente borrados no iPad.
 */
function deslizarEntrada(elementos, { distancia = 10, escalonar = 0.035 } = {}) {
  const alvos = elementos.filter(Boolean);
  if (!alvos.length || !podeRevelar()) return;

  for (const el of alvos) {
    el.style.opacity = '0';
    el.style.transform = `translateY(${distancia}px)`;
    el.style.willChange = 'opacity, transform';
  }

  const restaurar = () => { for (const el of alvos) limparMovimento(el); };

  try {
    const controle = animate(
      alvos,
      { opacity: [0, 1], y: [distancia, 0] },
      { ...MOLA, delay: stagger(escalonar) },
    );
    controle.finished.then(restaurar, restaurar);
    movimentosVivos.add(() => { try { controle.stop(); } catch { /* ja parou */ } restaurar(); });
    redeDeSeguranca(alvos);
  } catch {
    restaurar();
  }
}

/**
 * As secoes de primeiro nivel da tela atual, na ordem em que estao na pagina.
 *
 * Nao da para assumir que sao os filhos da vista. A tela "O papel" devolve uma
 * folha <style> antes do conteudo, e quase toda tela embrulha tudo num
 * .empilha-g. Sem descer um nivel, a animacao de entrada trataria a tela inteira
 * como um bloco unico e a cascata nao existiria.
 */
function secoesDaVista(raiz) {
  const SEM_CAIXA = ['STYLE', 'SCRIPT', 'LINK', 'TEMPLATE'];
  const visiveis = (lista) => lista.filter((el) => !SEM_CAIXA.includes(el.tagName));

  let nivel = visiveis([...raiz.children]);
  if (nivel.length === 1 && nivel[0].children.length > 1) nivel = visiveis([...nivel[0].children]);

  /* A fila de revisao tem animacao propria, item a item. Sem esta exclusao ela
     entraria duas vezes, a secao inteira e depois cada cartao dentro dela. */
  return nivel.filter((el) => !el.hasAttribute('data-fila'));
}

/**
 * hover e press nos cartoes clicaveis de modulo, de padrao e de caso.
 *
 * No desktop o cursor ja denuncia o que e clicavel. No celular e no iPad nao ha
 * cursor nenhum, e um cartao que nao se mexe ao ser tocado nao se distingue de
 * uma caixa de texto. O afundar sob o dedo e o unico sinal disponivel ali, e
 * por isso este e o unico ponto de movimento que o app tem em estado ocioso.
 *
 * Idempotente: pode ser chamada de novo quando conteudo novo entra na vista.
 */
function ligarGestosDeCartao(raiz) {
  if (!respeitaMovimento()) return;
  podarGestos();

  for (const el of raiz.querySelectorAll('button.cartao:not([data-gesto])')) {
    el.dataset.gesto = '1';
    gestosPorCartao.set(el, [
      hover(el, () => {
        animate(el, { scale: 1.012 }, MOLA);
        return () => animate(el, { scale: 1 }, MOLA);
      }),
      press(el, () => {
        animate(el, { scale: 0.975 }, MOLA_TOQUE);
        return () => animate(el, { scale: 1 }, MOLA_TOQUE);
      }),
    ]);
  }
}

/**
 * Fila de revisao: os cartoes entram um a um.
 *
 * A fila e uma cobranca, nao um enfeite. Vendo os cartoes chegarem em sequencia
 * o aluno le "sao tantos", que e a informacao que a tela quer passar. Uma grade
 * inteira aparecendo pronta le como fundo de pagina.
 */
function animarFilaDeRevisao(raiz) {
  const secoes = [...raiz.querySelectorAll('[data-fila]')];
  for (const secao of secoes) {
    const cartoes = [...secao.querySelectorAll('.cartao')];
    deslizarEntrada([secao], { distancia: 8, escalonar: 0 });
    if (cartoes.length) deslizarEntrada(cartoes, { distancia: 12, escalonar: 0.045 });
  }
}

/**
 * Contadores do painel de desempenho: o numero sobe ate o valor.
 *
 * Aqui contar tem funcao. O painel e o unico lugar onde o aluno ve o total do
 * que ja domina, e o numero subindo dá a esse total o peso de algo acumulado.
 * Nao confundir com os numeros do laudo das ferramentas, que sao medida e
 * precisam estar parados e certos no primeiro quadro.
 */
function animarContadores(raiz) {
  if (!podeRevelar()) return;

  for (const el of raiz.querySelectorAll('[data-conta-ate]')) {
    const fim = Number(el.dataset.contaAte);
    if (!Number.isFinite(fim) || fim <= 0) continue;
    const sufixo = el.dataset.contaSufixo || '';
    const encerrar = () => { el.textContent = `${fim}${sufixo}`; };

    el.textContent = `0${sufixo}`;
    try {
      const controle = animate(0, fim, {
        duration: Math.min(0.9, 0.3 + fim * 0.03),
        ease: 'easeOut',
        onUpdate: (v) => { el.textContent = `${Math.round(v)}${sufixo}`; },
      });
      controle.finished.then(encerrar, encerrar);
      movimentosVivos.add(() => { try { controle.stop(); } catch { /* ja parou */ } encerrar(); });
      /* Mesma rede das secoes, e aqui ela importa ainda mais: uma secao presa
         fica invisivel, mas um contador preso mostra um numero ERRADO. Dizer a
         quem dominou onze padroes que ele dominou zero nao e defeito de
         animacao, e informacao falsa sobre o proprio estudo. */
      const t = setTimeout(encerrar, 1400);
      movimentosVivos.add(() => clearTimeout(t));
    } catch {
      encerrar();
    }
  }
}

/**
 * Secoes longas revelam-se conforme entram na tela.
 *
 * Vale para as aulas e para a tela de um padrao, que passam de tres alturas de
 * tela. So as secoes fora do primeiro lote entram por aqui: as primeiras ja
 * chegaram pela animacao de troca de tela e nao devem esperar rolagem.
 */
function revelarAoEntrar(raiz) {
  if (!podeRevelar()) return;
  if (typeof IntersectionObserver !== 'function') return;

  const alvos = secoesDaVista(raiz).slice(3);
  if (!alvos.length) return;

  for (const el of alvos) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
  }

  try {
    /* Sem `amount`: o padrao da Motion dispara com qualquer pedaco visivel.
       Exigir uma fracao do elemento deixaria secao mais alta que a tela sem
       nunca atingir o limiar, e portanto invisivel para sempre. */
    const parar = inView(alvos, (el) => {
      const restaurar = () => limparMovimento(el);
      /* Este try nao e decorativo. Este e o unico ponto do app onde conteudo
         fica invisivel esperando uma segunda chamada acontecer. Se essa chamada
         falhar sem rede, a secao some da pagina em silencio, e nada e pior de
         entregar a um calouro do que meia aula em branco. */
      try {
        animate(el, { opacity: [0, 1], y: [14, 0] }, MOLA).finished.then(restaurar, restaurar);
        redeDeSeguranca([el]);
      } catch {
        restaurar();
      }
    });
    movimentosVivos.add(parar);
    movimentosVivos.add(() => { for (const el of alvos) limparMovimento(el); });
  } catch {
    for (const el of alvos) limparMovimento(el);
  }
}

/**
 * A dica "arraste para o lado" some conforme a tira e arrastada.
 *
 * E a unica coisa ligada a rolagem no site, e nao toca no tracado: some o aviso,
 * nao o ECG. O motivo e simples, a dica ja cumpriu a funcao dela no instante em
 * que o aluno arrastou, e um aviso que fica depois de obedecido vira ruido.
 */
function ligarDicaDeRolagem(raiz) {
  if (!respeitaMovimento()) return;

  for (const tira of raiz.querySelectorAll('.ecg-tira')) {
    const rolador = tira.querySelector('.ecg-scroller');
    const dica = tira.querySelector('.ecg-dica-rolagem');
    if (!rolador || !dica) continue;
    if (rolador.scrollWidth <= rolador.clientWidth + 4) continue;

    try {
      movimentosVivos.add(scroll(
        (progresso) => { dica.style.opacity = String(Math.max(0, 1 - progresso * 5)); },
        { source: rolador, axis: 'x' },
      ));
      movimentosVivos.add(() => dica.style.removeProperty('opacity'));
    } catch { /* sem rolagem ligada, a dica so fica parada */ }
  }
}

/**
 * Conteudo que nasce depois da troca de tela.
 *
 * O Plantao troca o proprio miolo sem passar por ir(): entra num caso, volta ao
 * indice, e nesse momento aparecem cartoes que nunca viram ligarGestosDeCartao.
 * Observar a vista resolve isso para o Plantao e para qualquer tela futura, sem
 * obrigar cada uma a lembrar de avisar a casca.
 */
function observarConteudoNovo(raiz) {
  if (typeof MutationObserver !== 'function') return;

  let agendado = false;
  const observador = new MutationObserver((registros) => {
    /* Entrada de tela interna do Plantao: filhos diretos do palco. */
    const entrando = [];
    for (const r of registros) {
      if (!(r.target instanceof Element) || !r.target.matches('[data-plantao]')) continue;
      for (const n of r.addedNodes) if (n.nodeType === 1) entrando.push(n);
    }
    if (entrando.length) deslizarEntrada(entrando.slice(0, 6));

    /* Agrupa a rajada de mutacoes de um innerHTML numa passada so. O adiamento
       e por setTimeout e nao por requestAnimationFrame de proposito: em aba
       oculta o rAF fica congelado, e ligar gesto e fiacao de interacao, nao
       desenho. Com rAF, um caso do Plantao aberto em segundo plano voltava ao
       indice com os dezoito cartoes sem resposta ao toque. */
    if (agendado) return;
    agendado = true;
    setTimeout(() => {
      agendado = false;
      ligarGestosDeCartao(raiz);
    }, 0);
  });

  /* Apenas childList: as animacoes mexem em `style` e em `data-gesto`, e
     observar atributos faria o observador acordar a si mesmo em laco. */
  observador.observe(raiz, { childList: true, subtree: true });
}

/* ==========================================================================
   TELAS
   ========================================================================== */

const TELAS = [
  { id: 'metodo',     rotulo: 'Método' },
  { id: 'papel',      rotulo: 'O papel' },
  { id: 'anatomia',   rotulo: 'Anatomia' },
  { id: 'localizar',  rotulo: 'Localizar' },
  { id: 'modulos',    rotulo: 'Módulos' },
  { id: 'bancada',    rotulo: 'Bancada' },
  { id: 'plantao',    rotulo: 'Plantão' },
  { id: 'questoes',   rotulo: 'Questões' },
  { id: 'desempenho', rotulo: 'Desempenho' },
];

/* --------------------------------------------------------------- MÉTODO -- */

/**
 * Os nove passos deixaram de ser uma lista.
 *
 * Relato do autor sobre a versão anterior desta tela: "eu mesmo não entendi
 * porra nenhuma e como usar esses passos, pois eles só estão soltos jogados,
 * sem qualquer direção ou intuição". Estava certo. Uma lista ordenada informa
 * a sequência e não ensina a executá-la: o aluno sai sabendo que existem nove
 * passos e sem saber o que fazer com o primeiro.
 *
 * Cada passo virou três coisas: o que PERGUNTAR, o que este traçado RESPONDE,
 * e para onde a leitura IRIA se a resposta fosse outra. A terceira é a que dá
 * intuição, e nada nela é inventado: cada desvio aponta para um padrão que já
 * existe em library.js e mostra o pivô daquele padrão com o texto da própria
 * biblioteca. Clicar leva ao estudo do padrão, então a sequência também vira
 * o índice do curso.
 *
 * Ao lado fica um traçado de exemplo com o trecho do passo atual destacado.
 * Trocar de exemplo mantém o passo, de propósito: comparar a mesma pergunta
 * num traçado normal e num alterado é onde o critério gruda.
 */
const METODO_GUIA = {
  adequacao: {
    ondeOlhar: 'No pulso de calibração, no canto esquerdo da tira, e no rótulo da derivação.',
    rotuloDesvios: 'Por que este passo vem antes de todos',
    desvios: [],
    nota: 'Este passo não dá diagnóstico nenhum. Ele decide se os oito seguintes valem alguma coisa. Metade do ganho apaga um critério de voltagem, e 50 mm/s dobra a largura aparente do QRS: você mediria com precisão sobre um papel errado.',
    notaIr: { tela: 'papel', rotulo: 'Ver como o papel funciona' },
  },
  ritmo: {
    ondeOlhar: 'Imediatamente antes de cada QRS, procurando a onda P, e depois comparando os intervalos entre os R.',
    rotuloDesvios: 'Se a resposta fosse outra',
    desviosIntro: 'Se não houvesse P antes de cada QRS, ou se a relação entre P e QRS estivesse quebrada, este passo mudaria de resposta e o traçado seria um destes.',
    desvios: ['fa', 'flutter', 'bavt', 'juncional'],
  },
  fc: {
    ondeOlhar: 'Entre dois R seguidos, contando quadradinhos.',
    rotuloDesvios: 'Se a resposta fosse outra',
    desviosIntro: 'A conta é sempre a mesma. O que muda é o número que sai dela, e o nome que esse número recebe.',
    desvios: ['bradicardia', 'taquiSinusal', 'tsv'],
  },
  eixo: {
    ondeOlhar: 'Em DI e em aVF, que uma tira de ritmo sozinha não mostra.',
    rotuloDesvios: 'O que esta tira não responde',
    desvios: [],
    nota: 'Este é o único dos nove passos que uma tira de ritmo não consegue responder. Eixo precisa de duas derivações ao mesmo tempo, DI e aVF, e por isso ele mora na Bancada, na ferramenta de eixo elétrico. Reconhecer que um passo não é respondível com o que está na sua frente também é parte do método.',
    notaIr: { tela: 'bancada', rotulo: 'Abrir a ferramenta de eixo' },
  },
  intervalos: {
    ondeOlhar: 'PR do início da P ao início do QRS. QRS de ponta a ponta. QT do início do QRS ao fim da T.',
    rotuloDesvios: 'Se a resposta fosse outra',
    desviosIntro: 'Cada intervalo tem o seu próprio corte, e estourar um deles leva a um traçado diferente.',
    desvios: ['bav1', 'wpw', 'qtLongo', 'mobitz1'],
  },
  qrs: {
    ondeOlhar: 'Na largura do complexo, na existência de onda Q e na altura das deflexões.',
    rotuloDesvios: 'Se a resposta fosse outra',
    desviosIntro: 'Largura, onda Q e voltagem são três perguntas dentro do mesmo passo, e cada uma leva para um lado.',
    desvios: ['brd', 'bre', 'tv', 'sve'],
  },
  st: {
    ondeOlhar: 'Do ponto J em diante, comparando com a linha de base entre o fim da T e a P seguinte.',
    rotuloDesvios: 'Se a resposta fosse outra',
    desviosIntro: 'É aqui que a isquemia aparece, e é o passo em que mais se erra por pressa.',
    desvios: ['stemi', 'infraST', 'pericardite', 'hipercalemia'],
  },
  sintese: {
    ondeOlhar: 'Em nada novo. Aqui você junta o que os sete passos anteriores devolveram, numa frase só.',
    rotuloDesvios: 'O que sustenta a síntese',
    desvios: [],
    nota: (p) => `O pivô deste traçado é: ${p.pivo} O distrator perigoso é: ${p.distrator}`,
  },
  conduta: {
    ondeOlhar: 'No paciente, não no papel. O traçado propõe a hipótese, o quadro clínico decide o que fazer com ela.',
    rotuloDesvios: 'O que a prova costuma cobrar aqui',
    desvios: [],
    nota: (p) => `${p.conduta} ${p.pegadinha}${p.alerta ? ` ${p.alerta}` : ''}`,
  },
};

/**
 * Traçados sobre os quais a sequência pode ser percorrida.
 *
 * Escolhidos porque a sequência trava num passo diferente em cada um: no
 * normal ela não trava, no BAV de 1º grau ela trava nos intervalos, na
 * fibrilação atrial ela trava logo no ritmo. É o que mostra que a ordem serve
 * para alguma coisa.
 */
const METODO_EXEMPLOS = ['normal', 'bav1', 'fa'];

function telaMetodo() {
  const exemplos = METODO_EXEMPLOS.filter((k) => PADROES[k]);

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

    ${exemplos.length ? `
    <section class="empilha" data-metodo-secao>
      <h2>Percorra a sequência uma vez, inteira, sobre um traçado</h2>
      <p class="prosa fraco">Ler a lista dos nove passos não ensina a usá-los. O que ensina é
      executá-los uma vez, na ordem, com um traçado na frente. Em cada passo você vê o que
      perguntar, o que este traçado responde e para onde a leitura iria se a resposta fosse outra.
      Trocar de exemplo mantém o passo em que você está, para comparar a mesma pergunta em dois
      traçados diferentes.</p>

      <div class="linha" role="group" aria-label="Traçado de exemplo">
        ${exemplos.map((k, n) => `
          <button class="btn btn--contorno btn--pequeno" type="button"
                  data-metodo-exemplo="${k}" aria-pressed="${n === 0}">${esc(PADROES[k].nome)}</button>`).join('')}
      </div>

      <div class="metodo-grade">
        <div class="empilha">
          <div class="ecg-tira">
            <div class="ecg-cabeca">
              <span data-metodo-cabeca></span>
              <span class="ecg-calib-texto">25 mm/s · 10 mm/mV</span>
            </div>
            <div class="ecg-scroller" tabindex="0" role="group" data-metodo-scroller
                 aria-label="Traçado de exemplo. Role para o lado para ver a tira inteira.">
              <div class="ecg-palco" data-metodo-palco></div>
            </div>
            <div class="ecg-dica-rolagem" data-toque-apenas>Arraste para o lado para ver a tira inteira. A faixa destacada é o trecho do passo atual.</div>
          </div>
          <ol class="metodo-trilha" data-metodo-trilha></ol>
        </div>

        <div class="cartao empilha metodo-passo">
          <h3 class="cartao-titulo" data-metodo-titulo></h3>

          <div class="metodo-bloco">
            <p class="metodo-rot">Pergunte</p>
            <p data-metodo-pergunta></p>
            <p class="pequeno fraco" data-metodo-onde></p>
          </div>

          <div class="metodo-bloco">
            <p class="metodo-rot">Neste traçado, a resposta é</p>
            <p data-metodo-resposta></p>
          </div>

          <div class="metodo-bloco" data-metodo-bloco-desvios>
            <p class="metodo-rot" data-metodo-rot-desvios></p>
            <p class="pequeno fraco" data-metodo-desvios-intro></p>
            <div class="empilha" data-metodo-desvios></div>
          </div>

          <div class="linha">
            <button class="btn btn--contorno btn--pequeno" type="button" data-metodo-ant>← Passo anterior</button>
            <span class="progresso-texto" data-metodo-conta></span>
            <button class="btn btn--principal btn--pequeno" type="button" data-metodo-prox>Próximo passo →</button>
          </div>
        </div>
      </div>
    </section>` : ''}

    <section class="empilha">
      <h2>A sequência inteira, para consultar depois</h2>
      <p class="prosa fraco">O curso ensina duas versões dessa sequência, de sete passos cada, que
      não coincidem entre si: uma vem do roteiro de estágio, outra do guia de OSCE. Esta é a união
      das duas, que não deixa buraco.</p>
      <ol class="empilha" style="padding-left:1.2rem">
        ${PASSOS.map(([, nome, desc]) => `
          <li><strong>${esc(nome)}.</strong> ${esc(desc)}</li>`).join('')}
      </ol>
    </section>

  </div>`;
}

/**
 * Onde, na tira, mora o passo atual.
 *
 * A conta é a geometria real do SVG: x = margem de calibração + tempo a
 * 25 mm/s. É a mesma que o paquímetro usa para ancorar os marcadores, e é a
 * razão de o holofote cair sobre a onda certa em vez de perto dela.
 */
function metodoFoco(chavePasso, ritmo, escala) {
  const offsetX = 10 * escala;                       // margem do pulso de calibração
  const pxPorMs = (PAPEL.velocidade / 1000) * escala;
  const x = (t) => offsetX + t * pxPorMs;

  if (chavePasso === 'adequacao') {
    return { xIni: 0, xFim: offsetX, rotulo: 'calibração' };
  }

  const evs = (ritmo.eventos || []).filter((e) => !e.bloqueada && e.modelo && e.modelo.marcos);
  if (!evs.length) return null;
  const i = evs.length > 2 ? 1 : 0;
  const ev = evs[i];
  const prox = evs[i + 1];
  const m = ev.modelo.marcos;

  if (chavePasso === 'ritmo') {
    // Sem onda P, o holofote passa a mostrar o lugar VAZIO onde ela deveria
    // estar. Ausência é achado, e achado precisa de endereço na tela.
    if (m.inicioP == null) {
      return { xIni: x(ev.t0 - 200), xFim: x(ev.t0 + m.inicioQRS), rotulo: 'onde a P deveria estar' };
    }
    return { xIni: x(ev.t0 + m.inicioP - 30), xFim: x(ev.t0 + m.fimP + 30), rotulo: 'onda P' };
  }
  if (chavePasso === 'fc') {
    if (!prox) return null;
    return { xIni: x(ev.t0 + m.inicioQRS), xFim: x(prox.t0 + prox.modelo.marcos.inicioQRS), rotulo: 'um intervalo R a R' };
  }
  if (chavePasso === 'intervalos') {
    if (m.inicioP == null) return { xIni: x(ev.t0 + m.inicioQRS), xFim: x(ev.t0 + m.fimT), rotulo: 'QRS e QT' };
    return { xIni: x(ev.t0 + m.inicioP), xFim: x(ev.t0 + m.inicioQRS), rotulo: 'intervalo PR' };
  }
  if (chavePasso === 'qrs') {
    return { xIni: x(ev.t0 + m.inicioQRS), xFim: x(ev.t0 + m.fimQRS), rotulo: 'complexo QRS' };
  }
  if (chavePasso === 'st') {
    return { xIni: x(ev.t0 + m.pontoJ), xFim: x(ev.t0 + m.fimT), rotulo: 'do ponto J ao fim da T' };
  }
  return null;   // eixo, síntese e conduta não moram num ponto da tira
}

function ligarMetodo(raiz) {
  const palco = raiz.querySelector('[data-metodo-palco]');
  if (!palco) return;

  const exemplos = METODO_EXEMPLOS.filter((k) => PADROES[k]);
  if (!exemplos.length) return;

  let chave = exemplos[0];
  let i = 0;
  let ritmo = null;
  let escala = mmPx();

  const elCabeca = raiz.querySelector('[data-metodo-cabeca]');
  const elScroller = raiz.querySelector('[data-metodo-scroller]');
  const elTrilha = raiz.querySelector('[data-metodo-trilha]');
  const elTitulo = raiz.querySelector('[data-metodo-titulo]');
  const elPergunta = raiz.querySelector('[data-metodo-pergunta]');
  const elOnde = raiz.querySelector('[data-metodo-onde]');
  const elResposta = raiz.querySelector('[data-metodo-resposta]');
  const elBloco = raiz.querySelector('[data-metodo-bloco-desvios]');
  const elRotDesvios = raiz.querySelector('[data-metodo-rot-desvios]');
  const elIntro = raiz.querySelector('[data-metodo-desvios-intro]');
  const elDesvios = raiz.querySelector('[data-metodo-desvios]');
  const elConta = raiz.querySelector('[data-metodo-conta]');

  function desenharTira() {
    const p = PADROES[chave];
    escala = mmPx();
    ritmo = montarRitmo(chave);
    palco.innerHTML =
      renderizarTira(ritmo, {
        estilo: 'papel', mmPx: escala, alturaMm: 36, derivacao: p.derivacao, id: `met-${chave}`,
      }) +
      '<div class="ecg-holofote" data-metodo-holofote hidden></div>' +
      '<div class="ecg-holofote-rotulo" data-metodo-holofote-rotulo hidden></div>';
    elCabeca.textContent = `${semTravessao(p.nome)} · ${p.derivacao}`;
  }

  function pintarHolofote() {
    const holo = palco.querySelector('[data-metodo-holofote]');
    const rot = palco.querySelector('[data-metodo-holofote-rotulo]');
    if (!holo || !rot) return;

    const alvo = metodoFoco(PASSOS[i][0], ritmo, escala);
    if (!alvo) { holo.hidden = true; rot.hidden = true; return; }

    holo.hidden = false;
    rot.hidden = false;
    holo.style.left = `${Math.max(0, alvo.xIni)}px`;
    holo.style.width = `${Math.max(8, alvo.xFim - alvo.xIni)}px`;
    rot.style.left = `${(alvo.xIni + alvo.xFim) / 2}px`;
    rot.textContent = alvo.rotulo;

    if (elScroller && elScroller.scrollWidth > elScroller.clientWidth) {
      const centro = (alvo.xIni + alvo.xFim) / 2;
      elScroller.scrollTo({ left: Math.max(0, centro - elScroller.clientWidth / 2), behavior: 'smooth' });
    }
  }

  /* A trilha é montada UMA vez. Repintá-la a cada passo destruiria o botão que
     acabou de ser clicado, e quem navega por teclado perderia o foco no meio
     da sequência. Só o aria-current muda. */
  function montarTrilha() {
    elTrilha.innerHTML = PASSOS.map(([, nome], k) => `
      <li>
        <button class="metodo-chip" type="button" data-metodo-passo="${k}"
                aria-current="false">
          <span class="metodo-chip-n">${k + 1}</span>${esc(nome)}
        </button>
      </li>`).join('');
  }

  function marcarTrilha() {
    for (const b of elTrilha.querySelectorAll('[data-metodo-passo]')) {
      b.setAttribute('aria-current', Number(b.dataset.metodoPasso) === i ? 'step' : 'false');
    }
  }

  function pintarDesvios(guia, p) {
    const lista = (guia.desvios || []).filter((k) => PADROES[k] && k !== chave);
    const nota = typeof guia.nota === 'function' ? guia.nota(p) : guia.nota;

    elBloco.hidden = !lista.length && !nota;
    elRotDesvios.textContent = guia.rotuloDesvios || 'Se a resposta fosse outra';
    elIntro.textContent = guia.desviosIntro || '';
    elIntro.hidden = !guia.desviosIntro;

    const cartoes = lista.map((k) => {
      const q = PADROES[k];
      return `<button class="metodo-desvio" type="button" data-padrao="${k}">
        <span class="metodo-desvio-nome">${esc(q.nome)}</span>
        <span class="metodo-desvio-pivo">${esc(q.pivo)}</span>
      </button>`;
    });

    if (nota) {
      cartoes.push(`<div class="nota nota--info">
        <p>${esc(nota)}</p>
        ${guia.notaIr ? `<button class="btn btn--contorno btn--pequeno" type="button" style="margin-top:var(--e-3)" data-metodo-ir="${guia.notaIr.tela}">${esc(guia.notaIr.rotulo)}</button>` : ''}
      </div>`);
    }

    elDesvios.innerHTML = cartoes.join('');
  }

  function pintar() {
    const p = PADROES[chave];
    const [chavePasso, nome, pergunta] = PASSOS[i];
    const guia = METODO_GUIA[chavePasso] || {};

    elTitulo.textContent = `${i + 1}. ${semTravessao(nome)}`;
    elPergunta.textContent = semTravessao(pergunta);
    elOnde.textContent = guia.ondeOlhar ? `Onde olhar: ${guia.ondeOlhar}` : '';
    elResposta.textContent = semTravessao(p.leitura[chavePasso] || 'Sem leitura registrada para este passo.');
    elConta.textContent = `passo ${i + 1} de ${PASSOS.length}`;

    pintarDesvios(guia, p);
    marcarTrilha();
    pintarHolofote();

    raiz.querySelector('[data-metodo-ant]').disabled = i === 0;
    raiz.querySelector('[data-metodo-prox]').disabled = i === PASSOS.length - 1;
  }

  raiz.querySelector('[data-metodo-prox]').addEventListener('click', () => {
    if (i < PASSOS.length - 1) { i += 1; pintar(); }
  });
  raiz.querySelector('[data-metodo-ant]').addEventListener('click', () => {
    if (i > 0) { i -= 1; pintar(); }
  });

  elTrilha.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-metodo-passo]');
    if (!b) return;
    i = Number(b.dataset.metodoPasso);
    pintar();
  });

  /* Um ouvinte só, na SEÇÃO: os botões de desvio e o de exemplo são recriados
     a cada passo, então ligar um por um deixaria ouvintes órfãos a cada troca.
     E ele fica na seção, não em #vista: #vista sobrevive à navegação, e um
     ouvinte pendurado nela se acumularia a cada volta ao Método até um clique
     disparar N vezes. Os botões com data-padrao já são atendidos pela
     delegação global de iniciar(). */
  const secao = raiz.querySelector('[data-metodo-secao]') || palco;
  secao.addEventListener('click', (ev) => {
    const exemplo = ev.target.closest('[data-metodo-exemplo]');
    if (exemplo) {
      chave = exemplo.dataset.metodoExemplo;
      for (const b of secao.querySelectorAll('[data-metodo-exemplo]')) {
        b.setAttribute('aria-pressed', String(b === exemplo));
      }
      desenharTira();
      pintar();
      return;
    }
    const destino = ev.target.closest('[data-metodo-ir]');
    if (destino) ir(destino.dataset.metodoIr);
  });

  montarTrilha();
  desenharTira();
  pintar();
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

    /**
     * Move a faixa de destaque ate o instante tMs do tracado.
     *
     * A conta vem da geometria real do SVG, nao de aproximacao. A versao
     * anterior usava (tMs/duracao)*0.9 + 0.06, um fator inventado que errava
     * por cerca de 229 ms: o holofote da onda P caia em cima do QRS.
     */
    const larguraMm = Number(tiraEl?.dataset.larguraMm || 0);
    const margemMm = Number(tiraEl?.dataset.margemMm || 0);

    const ROTULO_FOCO = {
      p: 'onda P', pr: 'intervalo PR', qrs: 'complexo QRS', j: 'ponto J',
      st: 'segmento ST', t: 'onda T', qt: 'intervalo QT',
      fc: 'frequencia', ritmo: 'ritmo', eixo: 'eixo',
      intervalos: 'intervalos', tira: 'a tira inteira', sintese: 'sintese',
    };

    const holofote = (tMs, foco) => {
      if (!holo) return;
      if (tMs == null || !larguraMm) { holo.hidden = true; holoRot.hidden = true; return; }

      // Posicao em mm dentro do SVG: margem de calibracao + tempo a 25 mm/s.
      const posMm = margemMm + (tMs / 1000) * 25;
      const fracao = Math.max(0, Math.min(1, posMm / larguraMm));

      // Faixa de 6 mm: larga o bastante para conter uma onda, estreita o
      // bastante para nao cobrir o batimento vizinho.
      const larguraFaixa = Math.min(0.5, 6 / larguraMm);

      holo.hidden = false;
      holoRot.hidden = false;
      holo.style.left = `${Math.max(0, Math.min(1 - larguraFaixa, fracao - larguraFaixa / 2)) * 100}%`;
      holo.style.width = `${larguraFaixa * 100}%`;
      holoRot.style.left = `${Math.max(6, Math.min(94, fracao * 100))}%`;
      holoRot.textContent = ROTULO_FOCO[foco] || 'olhe aqui';

      // Rola a tira para deixar o achado visivel no celular.
      const sc = raiz.querySelector('[data-tira-guiada] .ecg-scroller');
      if (sc && sc.scrollWidth > sc.clientWidth) {
        sc.scrollTo({ left: fracao * sc.scrollWidth - sc.clientWidth / 2, behavior: 'smooth' });
      }
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
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4)" data-conta-ate="${r.solidos}">${r.solidos}</div><div class="etiqueta">padrões dominados</div></div>
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4);color:var(--atencao)" data-conta-ate="${r.frageis}">${r.frageis}</div><div class="etiqueta">a revisar</div></div>
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4)"${r.aproveitamento != null ? ` data-conta-ate="${r.aproveitamento}" data-conta-sufixo="%"` : ''}>${r.aproveitamento ?? 'sem dados'}${r.aproveitamento != null ? '%' : ''}</div><div class="etiqueta">acerto em questões</div></div>
      <div class="cartao centro"><div style="font-family:var(--ff-titulo);font-size:var(--t-4)" data-conta-ate="${r.casosConcluidos}">${r.casosConcluidos}</div><div class="etiqueta">casos concluídos</div></div>
    </div>

    ${revisar.length ? `
    <section class="empilha" data-fila>
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
    <section class="empilha" data-fila>
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

/* Quantos segmentos da barra do topo ja estavam cheios na pintura anterior.
   null = ainda nao houve pintura nesta sessao. */
let segmentosCheiosAntes = null;

function atualizarProgressoTopo() {
  const r = store.resumo(Object.keys(PADROES).length);
  const barra = document.getElementById('progresso-topo');
  const total = Object.keys(PADROES).length;
  barra.innerHTML = Array.from({ length: Math.min(total, 12) }, (_, i) => {
    const preenchidos = Math.round((r.solidos / total) * Math.min(total, 12));
    return `<span class="progresso-seg" data-estado="${i < preenchidos ? 'solido' : ''}"></span>`;
  }).join('');
  document.getElementById('progresso-texto').textContent = `${r.solidos}/${total}`;

  /* A barra e reescrita inteira a cada pintura, entao sem esta contagem os doze
     segmentos reapareceriam do zero a cada troca de aba. So o que ganhou valor
     desde a ultima pintura se anima: o resto ja estava la e ja foi visto. */
  const cheios = [...barra.querySelectorAll('.progresso-seg[data-estado="solido"]')];
  const desde = segmentosCheiosAntes === null ? 0 : Math.min(segmentosCheiosAntes, cheios.length);
  const novos = cheios.slice(desde);
  segmentosCheiosAntes = cheios.length;

  if (!novos.length || !podeRevelar()) return;
  try {
    for (const seg of novos) seg.style.transformOrigin = 'left center';
    const controle = animate(
      novos,
      { scaleX: [0, 1], opacity: [0.4, 1] },
      { ...MOLA, delay: stagger(0.04) },
    );
    const restaurar = () => {
      for (const seg of novos) {
        seg.style.removeProperty('transform');
        seg.style.removeProperty('opacity');
        seg.style.removeProperty('transform-origin');
      }
    };
    controle.finished.then(restaurar, restaurar);
    /* A barra do topo nao mora na vista e por isso nao passa por
       matarMovimentos. A rede fica aqui mesmo, solta: sem quadro nenhum, os
       segmentos ficariam em scaleX(0) e a barra pareceria vazia para quem ja
       dominou metade dos padroes. */
    setTimeout(restaurar, 1400);
  } catch { /* a barra ja esta correta sem a animacao */ }
}

function ir(destino, arg) {
  const raiz = vista();

  // A vista inteira vai ser substituída: nada da tela anterior pode continuar
  // animando. Vale para os monitores ao vivo e para os ouvintes de gesto,
  // rolagem e entrada em tela registrados pela Motion.
  matarMonitores();
  matarMovimentos();

  if (destino === 'padrao') {
    raiz.innerHTML = telaPadrao(arg);
    ligarTelaPadrao(raiz, arg);
  } else if (destino === 'metodo') {
    raiz.innerHTML = telaMetodo();
    ligarMetodo(raiz);
  } else if (destino === 'papel') {
    raiz.innerHTML = telaPapel();
    ligarPapel(raiz);
  } else if (destino === 'anatomia') {
    criarAnatomia(raiz);
  } else if (destino === 'aula') {
    raiz.innerHTML = telaAula(arg);
    raiz.querySelector('[data-voltar]')?.addEventListener('click', () => ir('modulos'));
  } else if (destino === 'localizar') {
    raiz.innerHTML = telaLocalizar();
    ligarLocalizar(raiz);
  } else if (destino === 'modulos') {
    raiz.innerHTML = telaModulos();
  } else if (destino === 'bancada') {
    raiz.innerHTML = telaBancada();
    criarGerador(document.getElementById('ferramenta-gerador'));
    criarEixo(document.getElementById('ferramenta-eixo'));
    // PADROES entra aqui para que o paquímetro possa sortear traçados de
    // verdade da biblioteca e revelar, depois da correção, qual era.
    criarPaquimetro(document.getElementById('ferramenta-paquimetro'), { montarRitmo, padroes: PADROES });
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

  // Uma passagem só, depois que a tela já montou o HTML: qualquer marcador
  // [data-tira-alt] vira uma tira com alternador papel e monitor.
  ligarTirasAlternaveis(raiz);

  const abaAtiva = (destino === 'padrao' || destino === 'aula') ? 'modulos' : destino;
  for (const t of document.querySelectorAll('.aba')) {
    t.setAttribute('aria-selected', String(t.dataset.tela === abaAtiva));
  }

  if (location.hash.slice(1) !== destino) history.replaceState(null, '', `#${destino}`);
  document.getElementById('principal').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });

  /* Movimento sempre por ultimo: a tela ja esta montada e ligada, entao o que se
     anima aqui e conteudo final, e nao um esqueleto que ainda vai mudar de
     altura no meio da animacao. */
  deslizarEntrada(secoesDaVista(raiz).slice(0, 3));
  revelarAoEntrar(raiz);
  animarFilaDeRevisao(raiz);
  animarContadores(raiz);
  ligarGestosDeCartao(raiz);
  ligarDicaDeRolagem(raiz);

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

  // Também uma única vez: cobre o conteúdo que nasce sem passar por ir(),
  // como o índice do Plantão quando o aluno volta de um caso.
  observarConteudoNovo(vista());

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
