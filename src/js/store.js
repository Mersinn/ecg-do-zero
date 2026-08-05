/**
 * Progresso do aluno.
 *
 * Tudo fica em localStorage, no próprio navegador. Não há servidor, não há
 * conta e nada é enviado para lugar nenhum — o que também significa que trocar
 * de aparelho ou limpar o navegador apaga o progresso. Por isso existe
 * exportar()/importar(): o aluno consegue levar o próprio histórico.
 *
 * Substitui window.storage, que só existia dentro do runtime de artefato.
 */

const CHAVE = 'ecg-do-zero:v1';

/* Chave anterior ao renome do projeto. Quem já tinha progresso salvo não pode
   perdê-lo só porque o site trocou de nome: lemos a antiga uma vez, gravamos
   na nova e apagamos a velha. */
const CHAVE_ANTIGA = 'ecg-ultimate-learning:v1';

const VAZIO = {
  versao: 1,
  criadoEm: null,
  padroes: {},   // chave -> { estado, tentativas, acertos, ultimaVez, proximaRevisao, intervaloDias }
  questoes: {},  // id -> { tentativas, acertos, ultimaVez }
  casos: {},     // id -> { concluido, freiosEscritos, decisoesCorretas, decisoesTotais }
  ajustes: { mmPorPixel: null, mostrarDicaRolagem: true },
};

let estado = carregar();

function carregar() {
  try {
    let cru = localStorage.getItem(CHAVE);
    if (!cru) {
      const antigo = localStorage.getItem(CHAVE_ANTIGA);
      if (antigo) {
        localStorage.setItem(CHAVE, antigo);
        localStorage.removeItem(CHAVE_ANTIGA);
        cru = antigo;
      }
    }
    if (!cru) return { ...VAZIO, criadoEm: Date.now() };
    const lido = JSON.parse(cru);
    return { ...VAZIO, ...lido, ajustes: { ...VAZIO.ajustes, ...(lido.ajustes || {}) } };
  } catch {
    // localStorage bloqueado (navegação privada em alguns navegadores) ou JSON
    // corrompido. O app continua funcionando, só não persiste.
    return { ...VAZIO, criadoEm: Date.now() };
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* sem persistência; o app segue em memória */
  }
}

/* ==========================================================================
   REPETIÇÃO ESPAÇADA
   Intervalos crescentes em dias. Acerto avança um degrau; erro volta ao início.
   Não é SM-2: para ~25 padrões, um escalonamento simples é suficiente e não
   introduz uma complexidade que o aluno não consegue auditar.
   ========================================================================== */

const DEGRAUS = [1, 3, 7, 16, 35];
const DIA = 86400000;

function proximoIntervalo(intervaloAtual, acertou) {
  if (!acertou) return DEGRAUS[0];
  const i = DEGRAUS.indexOf(intervaloAtual);
  return i < 0 ? DEGRAUS[0] : DEGRAUS[Math.min(i + 1, DEGRAUS.length - 1)];
}

/* ==========================================================================
   API
   ========================================================================== */

export function progressoPadrao(chave) {
  return estado.padroes[chave] || {
    estado: 'nao_visto', tentativas: 0, acertos: 0,
    ultimaVez: null, proximaRevisao: null, intervaloDias: 0,
  };
}

/**
 * Registra uma tentativa num padrão.
 * @param {boolean} acertou
 * @param {boolean} confiante  o aluno declarou que não chutou
 */
export function registrarPadrao(chave, acertou, confiante = true) {
  const p = progressoPadrao(chave);
  p.tentativas += 1;
  if (acertou) p.acertos += 1;

  // Acerto sem confiança não vira domínio. Acerto frágil é frágil.
  p.estado = acertou ? (confiante ? 'solido' : 'fragil') : 'fragil';

  p.intervaloDias = proximoIntervalo(p.intervaloDias, acertou && confiante);
  p.ultimaVez = Date.now();
  p.proximaRevisao = Date.now() + p.intervaloDias * DIA;

  estado.padroes[chave] = p;
  salvar();
  return p;
}

export function registrarQuestao(id, acertou) {
  const q = estado.questoes[id] || { tentativas: 0, acertos: 0, ultimaVez: null };
  q.tentativas += 1;
  if (acertou) q.acertos += 1;
  q.ultimaVez = Date.now();
  estado.questoes[id] = q;
  salvar();
  return q;
}

export function registrarCaso(id, { decisoesCorretas, decisoesTotais, freiosEscritos }) {
  estado.casos[id] = {
    concluido: true,
    decisoesCorretas, decisoesTotais, freiosEscritos,
    ultimaVez: Date.now(),
  };
  salvar();
}

/** Padrões vencidos, do mais atrasado para o menos. É a fila de revisão. */
export function filaDeRevisao(agora = Date.now()) {
  return Object.entries(estado.padroes)
    .filter(([, p]) => p.proximaRevisao && p.proximaRevisao <= agora)
    .sort((a, b) => a[1].proximaRevisao - b[1].proximaRevisao)
    .map(([chave, p]) => ({ chave, ...p }));
}

/** Padrões marcados como frágeis, independentemente da data. */
export function fragilidades() {
  return Object.entries(estado.padroes)
    .filter(([, p]) => p.estado === 'fragil')
    .map(([chave, p]) => ({ chave, ...p }));
}

export function resumo(totalPadroes) {
  const vals = Object.values(estado.padroes);
  const solidos = vals.filter((p) => p.estado === 'solido').length;
  const frageis = vals.filter((p) => p.estado === 'fragil').length;
  const qs = Object.values(estado.questoes);
  const tentativasQ = qs.reduce((s, q) => s + q.tentativas, 0);
  const acertosQ = qs.reduce((s, q) => s + q.acertos, 0);
  return {
    solidos, frageis,
    vistos: vals.length,
    total: totalPadroes,
    pct: totalPadroes ? Math.round((solidos / totalPadroes) * 100) : 0,
    questoesRespondidas: tentativasQ,
    aproveitamento: tentativasQ ? Math.round((acertosQ / tentativasQ) * 100) : null,
    casosConcluidos: Object.keys(estado.casos).length,
    aRevisar: filaDeRevisao().length,
  };
}

export function ajuste(chave, valor) {
  if (valor === undefined) return estado.ajustes[chave];
  estado.ajustes[chave] = valor;
  salvar();
  return valor;
}

/** Exporta o progresso como JSON, para o aluno guardar ou levar de aparelho. */
export function exportar() {
  return JSON.stringify(estado, null, 2);
}

export function importar(json) {
  const lido = JSON.parse(json);
  if (!lido || lido.versao !== 1) throw new Error('Arquivo de progresso inválido ou de outra versão.');
  estado = { ...VAZIO, ...lido, ajustes: { ...VAZIO.ajustes, ...(lido.ajustes || {}) } };
  salvar();
}

export function zerar() {
  estado = { ...VAZIO, criadoEm: Date.now() };
  salvar();
}
