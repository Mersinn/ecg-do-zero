/**
 * Casca do app: navegação, telas e ligação entre motor, dados e progresso.
 *
 * Sem framework e sem etapa de build. São módulos ES nativos servidos como
 * arquivo estático — qualquer aluno consegue abrir, ler e alterar o código sem
 * instalar nada. Essa é uma decisão de projeto, não uma limitação.
 */

import { PADROES, FAMILIAS, PASSOS, montarRitmo, listarPadroes } from './ecg/library.js';
import { renderizarTira } from './ecg/engine.js';
import { criarGerador, criarEixo, criarPaquimetro } from './tools.js';
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

/* ==========================================================================
   TELAS
   ========================================================================== */

const TELAS = [
  { id: 'metodo',     rotulo: 'Método' },
  { id: 'papel',      rotulo: 'O papel' },
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

    <div class="nota nota--info">
      <div class="nota-titulo">Quando a calibração muda</div>
      Metade do ganho (5 mm/mV) é usada quando o complexo é tão alto que sai do papel, como em
      hipertrofia. O dobro (20 mm/mV) aparece em traçados de baixa voltagem — obeso, enfisematoso,
      derrame pericárdico. Se você não conferir o pulso de calibração, vai medir voltagem errada e
      diagnosticar sobrecarga onde não há, ou deixar de ver a que existe.
    </div>
  </div>`;
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
      <h2>1. Observe</h2>
      ${tira(chave, { estilo: 'monitor' })}
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

function ligarTelaPadrao(raiz, chave) {
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
    const pintar = () => {
      const passo = roteiro[i];
      t.textContent = passo.titulo || '';
      x.innerHTML = passo.texto || '';
      c.textContent = `${i + 1} / ${roteiro.length}`;
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
    <div id="questao-atual"></div>
    <button class="btn btn--principal" data-sortear type="button">Sortear questão</button>
  </div>`;
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
  } else if (destino === 'desempenho') {
    raiz.innerHTML = telaDesempenho();
    ligarDesempenho(raiz);
  }

  const abaAtiva = destino === 'padrao' ? 'modulos' : destino;
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
