/**
 * Biblioteca de padrões de ECG.
 *
 * Cada entrada carrega: como sintetizar o traçado, a leitura em 9 passos, o
 * pivô diagnóstico, a conduta e a pegadinha de prova.
 *
 * ---------------------------------------------------------------------------
 * CORREÇÕES CLÍNICAS APLICADAS (auditoria + validação adversarial, ago/2026).
 * Cada uma existe porque a versão anterior ensinava algo falso ou perigoso:
 *
 *  1. TV polimórfica instável → choque NÃO sincronizado. A versão anterior
 *     dizia "instável → cardioversão sincronizada" sem ressalva. O sincronismo
 *     não consegue marcar o R numa TV polimórfica e o choque não sai.
 *  2. "Sem supra não trombolisa" ganhou as exceções reais: IAM posterior,
 *     De Winter, T hiperaguda e Sgarbossa são equivalentes de oclusão.
 *  3. aVR com infra difusa NÃO entra nessa lista. Só ~10% têm oclusão
 *     trombótica aguda; a conduta é angiografia urgente, não trombólise.
 *  4. "Nunca adenosina em QRS largo" virou regra de bolso com o porquê, não
 *     dogma — o erro que ela previne é real, mas o enunciado absoluto é falso.
 *  5. QTc: as duas convenções aparecem lado a lado, com a fonte de cada, porque
 *     o material do próprio curso diverge da diretriz nacional.
 *  6. Atropina não funciona em bloqueio infranodal — marcada como pegadinha
 *     explícita do curso.
 *  7. IAM inferior exige V3R/V4R; se houver VD, nitrato/morfina/diurético estão
 *     contraindicados. O material do curso enuncia isso errado ("parede
 *     inferior"); o correto é infarto de VD.
 * ---------------------------------------------------------------------------
 */

import {
  ritmoRegular, ritmoIrregular, ritmoWenckebach, ritmoMobitz2, ritmoDissociado,
  ondulacaoFibrilatoria, denteDeSerra,
} from './engine.js';

/** Famílias diagnósticas — organizam os módulos e a intercalação das revisões. */
export const FAMILIAS = {
  base:        { nome: 'Fundamentos',              ordem: 1 },
  sobrecarga:  { nome: 'Sobrecargas',              ordem: 2 },
  bav:         { nome: 'Bloqueios AV',             ordem: 3 },
  ramo:        { nome: 'Bloqueios de ramo',        ordem: 4 },
  taqui:       { nome: 'Taquiarritmias',           ordem: 5 },
  parada:      { nome: 'Ritmos de parada',         ordem: 6 },
  isquemia:    { nome: 'Isquemia e infarto',       ordem: 7 },
  eletrolito:  { nome: 'Eletrólitos e drogas',     ordem: 8 },
  outros:      { nome: 'Outros padrões',           ordem: 9 },
};

/**
 * @typedef {object} Padrao
 * @property {string} nome
 * @property {string} familia
 * @property {'basico'|'intermediario'|'avancado'} nivel
 * @property {() => object} ritmo      função que devolve o ritmo sintetizado
 * @property {string} derivacao        derivação mais representativa
 * @property {object} leitura          os 9 passos
 * @property {string} dx               diagnóstico
 * @property {string} pivo             o achado que decide
 * @property {string} conduta
 * @property {string} distrator        o diagnóstico vizinho que engana
 * @property {string} pegadinha
 * @property {string[]} [alternativas] diagnósticos errados plausíveis para o quiz
 * @property {string} [alerta]         texto de segurança, quando aplicável
 */

export const PADROES = {

  /* ====================================================================
     FUNDAMENTOS
     ==================================================================== */

  normal: {
    nome: 'ECG normal',
    familia: 'base',
    nivel: 'basico',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({ fc: 72, duracao: 6000 }),
    leitura: {
      adequacao: 'Calibrado a 25 mm/s e 10 mm/mV. O pulso de calibração de 1 mV mede 10 mm de altura. Sem ruído de base.',
      ritmo: 'Sinusal: onda P positiva em DII precede cada QRS, com PR constante.',
      fc: '~72 bpm. RR regular, ~21 quadradinhos (1500 ÷ 21 ≈ 71).',
      eixo: 'Normal — DI e aVF positivos colocam o vetor no quadrante inferior esquerdo.',
      intervalos: 'PR 160 ms (normal 120–200) · QRS 90 ms (normal < 120) · QT dentro da faixa para a frequência.',
      qrs: 'Estreito, com pequena onda q septal, R dominante e s pequeno.',
      st: 'Segmento ST isoelétrico. Onda T positiva e assimétrica — sobe devagar, desce mais rápido.',
      sintese: 'Ritmo sinusal, frequência e intervalos normais, sem alteração de repolarização.',
      conduta: 'Nenhuma. Este é o traçado de referência contra o qual todos os outros são comparados.',
    },
    dx: 'ECG normal',
    pivo: 'Onda P positiva em DII antes de cada QRS, com PR fixo entre 120 e 200 ms.',
    conduta: 'Nenhuma conduta. Serve de gabarito visual.',
    distrator: 'Achar que frequência normal exclui doença cardíaca — não exclui.',
    pegadinha: 'Quem não confere o ritmo primeiro erra todo o resto depois. A ordem de leitura existe para isso.',
    alternativas: ['Bradicardia sinusal', 'Taquicardia sinusal', 'Ritmo juncional'],
  },

  bradicardia: {
    nome: 'Bradicardia sinusal',
    familia: 'base',
    nivel: 'basico',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({ fc: 45, duracao: 7000 }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal — a P continua positiva em DII e precede cada QRS. O que mudou foi só a frequência.',
      fc: '~45 bpm. RR longo, ~33 quadradinhos.',
      eixo: 'Normal.',
      intervalos: 'PR e QRS normais.',
      qrs: 'Estreito, morfologia preservada.',
      st: 'Sem alteração de repolarização.',
      sintese: 'Bradicardia sinusal — ritmo sinusal com frequência abaixo de 60 bpm.',
      conduta: 'Depende inteiramente dos sintomas. Assintomático (atleta, sono, uso de betabloqueador): nenhuma. Sintomático com instabilidade: atropina 1 mg IV, repetível até 3 mg; se não responder, marcapasso transcutâneo, dopamina ou adrenalina em infusão.',
    },
    dx: 'Bradicardia sinusal',
    pivo: 'Ritmo sinusal preservado com FC < 60 bpm.',
    conduta: 'Tratar o paciente, não o número. Bradicardia assintomática em atleta é fisiológica.',
    distrator: 'Confundir com BAV — no BAV a relação P→QRS está quebrada; aqui ela está intacta.',
    pegadinha: 'A definição operacional do ACLS para bradicardia sintomática é FC < 50/min com sinais de má perfusão, não simplesmente < 60.',
    alternativas: ['BAV de 1º grau', 'Ritmo juncional de escape', 'BAV total'],
  },

  taquiSinusal: {
    nome: 'Taquicardia sinusal',
    familia: 'base',
    nivel: 'basico',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({ fc: 130, duracao: 5000, batimento: { pAmp: 0.18, tDur: 150, stDur: 60 } }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal. A P ainda é identificável antes de cada QRS, embora possa começar a se aproximar da T anterior.',
      fc: '~130 bpm.',
      eixo: 'Normal.',
      intervalos: 'PR normal · QRS estreito.',
      qrs: 'Estreito.',
      st: 'Pode haver infra discreto de ST por demanda — não confundir com isquemia primária.',
      sintese: 'Taquicardia sinusal — quase sempre resposta a algo, não doença primária.',
      conduta: 'Procurar e tratar a causa: dor, febre, hipovolemia, anemia, hipóxia, ansiedade, sepse, tireotoxicose, embolia pulmonar, abstinência. Frear a frequência sem tratar a causa pode ser deletério.',
    },
    dx: 'Taquicardia sinusal',
    pivo: 'Taquicardia com onda P sinusal visível e início/fim graduais.',
    conduta: 'É sintoma, não diagnóstico. Trate a causa.',
    distrator: 'TSV — que tem início e término súbitos e frequência tipicamente mais alta e fixa.',
    pegadinha: 'Taquicardia sinusal tem teto: o manual de suporte avançado registra que ela não excede 220 por minuto e que o limite cai com a idade. Frequência acima do esperado para a idade do paciente aponta outra taquiarritmia. A conta de bolso "220 menos a idade" é só uma estimativa grosseira do máximo, não um critério de diretriz.',
    alternativas: ['Taquicardia supraventricular', 'Flutter atrial 2:1', 'Taquicardia atrial'],
  },

  /* ====================================================================
     SOBRECARGAS
     ==================================================================== */

  sobrecargaAD: {
    nome: 'Sobrecarga atrial direita',
    familia: 'sobrecarga',
    nivel: 'intermediario',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({ fc: 78, duracao: 6000, batimento: { pAmp: 0.32, pDur: 100, pAssim: 0 } }),
    leitura: {
      adequacao: 'Calibração padrão — confirmar antes de julgar amplitude de onda.',
      ritmo: 'Sinusal.',
      fc: '~78 bpm.',
      eixo: 'Pode haver desvio para a direita, quando há doença pulmonar associada.',
      intervalos: 'PR e QRS normais.',
      qrs: 'Estreito.',
      st: 'Sem alteração primária.',
      sintese: 'Onda P alta e apiculada, acima de 2,5 mm em DII — "P pulmonale".',
      conduta: 'Investigar a causa: DPOC, cor pulmonale, hipertensão pulmonar, embolia pulmonar crônica, valvopatia tricúspide.',
    },
    dx: 'Sobrecarga atrial direita (P pulmonale)',
    pivo: 'P apiculada > 2,5 mm em DII. A alteração é de AMPLITUDE.',
    conduta: 'O ECG levanta a hipótese; o ecocardiograma confirma.',
    distrator: 'P mitrale — que é larga e bífida, não alta e pontuda.',
    pegadinha: 'Amplitude aponta para o átrio direito; duração aponta para o esquerdo. Um resumo de aluno que circula no curso troca os dois — não replicar.',
    alternativas: ['Sobrecarga atrial esquerda', 'ECG normal', 'Hipercalemia'],
  },

  sobrecargaAE: {
    nome: 'Sobrecarga atrial esquerda',
    familia: 'sobrecarga',
    nivel: 'intermediario',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({ fc: 70, duracao: 6000, batimento: { pAmp: 0.16, pDur: 150, pBifida: true, pr: 180 } }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal.',
      fc: '~70 bpm.',
      eixo: 'Normal.',
      intervalos: 'Onda P com duração acima de 120 ms · PR e QRS normais.',
      qrs: 'Estreito.',
      st: 'Sem alteração primária.',
      sintese: 'Onda P larga e entalhada, com dois componentes — "P mitrale".',
      conduta: 'Investigar estenose mitral, hipertensão de longa data e disfunção diastólica. É também substrato de fibrilação atrial.',
    },
    dx: 'Sobrecarga atrial esquerda (P mitrale)',
    pivo: 'P com duração > 120 ms e entalhe. A alteração é de DURAÇÃO.',
    conduta: 'Ecocardiograma. Lembre que o átrio esquerdo dilatado é o terreno da FA.',
    distrator: 'P pulmonale, e a variação normal da onda P.',
    pegadinha: 'Mitrale = Mole e larga. Pulmonale = Pontuda. O mnemônico é bobo e funciona.',
    alternativas: ['Sobrecarga atrial direita', 'ECG normal', 'Bloqueio interatrial avançado'],
  },

  sve: {
    nome: 'Sobrecarga ventricular esquerda',
    familia: 'sobrecarga',
    nivel: 'intermediario',
    derivacao: 'V5',
    ritmo: () => ritmoRegular({
      fc: 72, duracao: 6000,
      batimento: { qrs: 'rAlto', st: -0.12, stForma: 'descendente', tAmp: -0.35, tDur: 200, tAssim: -0.2 },
    }),
    leitura: {
      adequacao: 'Calibração padrão é indispensável aqui: metade do ganho invalidaria o critério de voltagem.',
      ritmo: 'Sinusal.',
      fc: '~72 bpm.',
      eixo: 'Frequentemente desviado para a esquerda.',
      intervalos: 'PR normal · QRS no limite superior ou discretamente alargado.',
      qrs: 'R muito alta nas precordiais esquerdas. Critério de Sokolow-Lyon: S em V1 + R em V5 ou V6 ≥ 35 mm.',
      st: 'Infra de ST descendente com T invertida assimétrica na parede lateral — o padrão "strain".',
      sintese: 'Sobrecarga ventricular esquerda com padrão de sobrecarga sistólica.',
      conduta: 'Investigar hipertensão arterial, estenose aórtica e cardiomiopatia hipertrófica. Ecocardiograma define massa e função.',
    },
    dx: 'Sobrecarga ventricular esquerda com strain',
    pivo: 'Sokolow-Lyon ≥ 35 mm somado ao padrão strain lateral.',
    conduta: 'O achado é crônico. A urgência é do quadro clínico, não do traçado.',
    distrator: 'Isquemia lateral aguda — o strain imita infra de ST isquêmico.',
    pegadinha: 'O strain da SVE é alteração SECUNDÁRIA à sobrecarga, não evento agudo. Em hipertenso crônico assintomático com Sokolow altíssimo, é sobrecarga.',
    alerta: 'Critérios de voltagem têm baixa sensibilidade e são afetados por biotipo, idade e obesidade. Nunca diagnostique hipertrofia só pelo ECG.',
    alternativas: ['Isquemia lateral aguda', 'Bloqueio de ramo esquerdo', 'Pericardite'],
  },

  /* ====================================================================
     BLOQUEIOS AV
     ==================================================================== */

  bav1: {
    nome: 'BAV de 1º grau',
    familia: 'bav',
    nivel: 'basico',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({ fc: 68, duracao: 6500, batimento: { pr: 300 } }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal. Cada onda P conduz um QRS — nenhum batimento se perde.',
      fc: '~68 bpm.',
      eixo: 'Normal.',
      intervalos: 'PR de 300 ms — acima de 200 — e, decisivamente, CONSTANTE em todos os batimentos.',
      qrs: 'Estreito.',
      st: 'Sem alteração.',
      sintese: 'PR longo, fixo, com condução preservada de todos os P.',
      conduta: 'Geralmente nenhuma quando assintomático. Revisar drogas que freiam o nó AV: betabloqueador, verapamil, diltiazem, digoxina, amiodarona.',
    },
    dx: 'Bloqueio atrioventricular de 1º grau',
    pivo: 'PR > 200 ms, FIXO, e todo P conduz.',
    conduta: 'Observação e revisão de medicamentos.',
    distrator: 'Mobitz I — que também tem PR longo, mas crescente, e perde batimentos.',
    pegadinha: 'PR longo sozinho não é bloqueio de 2º grau. Só vira 2º grau quando um QRS falha.',
    alternativas: ['BAV 2º grau Mobitz I', 'ECG normal', 'Bradicardia sinusal'],
  },

  mobitz1: {
    nome: 'BAV 2º grau — Mobitz I (Wenckebach)',
    familia: 'bav',
    nivel: 'intermediario',
    derivacao: 'DII',
    ritmo: () => ritmoWenckebach({ fc: 75, duracao: 7500, prs: [180, 260, 350] }),
    leitura: {
      adequacao: 'Calibração padrão. Tira longa é essencial: o padrão só aparece ao longo de vários batimentos.',
      ritmo: 'Sinusal com bloqueio intermitente. As ondas P vêm regulares; os QRS, não.',
      fc: 'Frequência atrial regular; ventricular menor, por causa das pausas.',
      eixo: 'Normal.',
      intervalos: 'O PR ALONGA progressivamente a cada batimento até que um P não conduza. Depois o ciclo reinicia com o PR mais curto.',
      qrs: 'Estreito — o bloqueio é no nó AV, acima da bifurcação do feixe.',
      st: 'Sem alteração.',
      sintese: 'Alongamento progressivo do PR até a falha de um QRS: fenômeno de Wenckebach.',
      conduta: 'Habitualmente benigno. Observação; suspender drogas dromotrópicas negativas. Marcapasso só se houver bradicardia sintomática.',
    },
    dx: 'BAV de 2º grau Mobitz I (Wenckebach)',
    pivo: 'O PR CRESCE batimento a batimento antes da falha.',
    conduta: 'Bloqueio nodal, geralmente benigno. Responde a atropina quando sintomático.',
    distrator: 'Mobitz II — que tem PR fixo.',
    pegadinha: 'Sem o PR crescente não é Wenckebach. Meça o PR de três batimentos consecutivos antes de decidir.',
    alternativas: ['BAV 2º grau Mobitz II', 'BAV de 1º grau', 'Extrassístoles atriais bloqueadas'],
  },

  mobitz2: {
    nome: 'BAV 2º grau — Mobitz II',
    familia: 'bav',
    nivel: 'avancado',
    derivacao: 'DII',
    // QRS largo de propósito: o Mobitz II é predominantemente infranodal, e o
    // roteiro guiado manda o aluno reparar na largura do complexo. Desenhar um
    // complexo estreito faria o texto apontar para um achado inexistente na tira.
    ritmo: () => ritmoMobitz2({ fc: 76, duracao: 7500, pr: 180, razao: 3, batimento: { qrsLargura: 1.45 } }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal com bloqueio.',
      fc: 'Atrial regular; ventricular reduzida de forma abrupta a cada falha.',
      eixo: 'Normal ou desviado.',
      intervalos: 'PR FIXO em todos os batimentos conduzidos — e, sem qualquer aviso, um P não conduz.',
      qrs: 'Largo nesta tira, cerca de 130 ms, que é o mais comum: o bloqueio é infranodal, no His-Purkinje. Pode ser estreito, e aí a lesão é intra-hissiana, mas essa é a minoria.',
      st: 'Sem alteração primária.',
      sintese: 'PR constante com falha súbita de condução — bloqueio infranodal.',
      conduta: 'Marcapasso. Se instável: marcapasso transcutâneo imediato. Atropina é ineficaz e pode piorar, porque acelera o átrio sem melhorar a condução infranodal.',
    },
    dx: 'BAV de 2º grau Mobitz II',
    pivo: 'PR fixo + queda súbita de QRS, sem alongamento prévio.',
    conduta: 'Indicação de marcapasso definitivo. Risco real de progressão para BAV total.',
    distrator: 'Mobitz I. A diferença está inteiramente no comportamento do PR.',
    pegadinha: 'Atropina NÃO funciona em bloqueio infranodal. Em Mobitz II ou BAVT instável, vá direto ao marcapasso transcutâneo — não gaste tempo com doses repetidas.',
    alerta: 'O nó AV recebe inervação vagal abundante; o feixe de His e os ramos, não. É por isso que atropina resolve Wenckebach e não resolve Mobitz II.',
    alternativas: ['BAV 2º grau Mobitz I', 'BAV total', 'Bradicardia sinusal com pausas'],
  },

  bavt: {
    nome: 'BAV total (3º grau)',
    familia: 'bav',
    nivel: 'avancado',
    derivacao: 'DII',
    ritmo: () => ritmoDissociado({ fcAtrial: 88, fcVentricular: 36, duracao: 7500 }),
    leitura: {
      adequacao: 'Calibração padrão; tira longa obrigatória.',
      ritmo: 'Dissociação atrioventricular completa. As ondas P marcham no ritmo delas; os QRS, no deles.',
      fc: 'Frequência atrial maior que a ventricular. O ventrículo depende de um ritmo de escape.',
      eixo: 'Variável, conforme a origem do escape.',
      intervalos: 'Não existe PR: não há relação fixa entre P e QRS. As P aparecem em qualquer posição, inclusive dentro do QRS e da T.',
      qrs: 'Largo quando o escape é ventricular (mais lento e menos confiável); estreito quando é juncional.',
      st: 'Alterada de forma secundária.',
      sintese: 'Nenhum estímulo atrial alcança o ventrículo — bloqueio completo.',
      conduta: 'Marcapasso. Instável: marcapasso transcutâneo imediato, com adrenalina ou dopamina em infusão como ponte. Definitiva: marcapasso transvenoso e depois definitivo.',
    },
    dx: 'Bloqueio atrioventricular total',
    pivo: 'Dissociação AV: P e QRS completamente independentes, cada um regular no seu próprio ritmo.',
    conduta: 'Marcapasso. É emergência quando há instabilidade.',
    distrator: 'Mobitz II avançado — mas ali ainda existe alguma relação P→QRS; aqui não existe nenhuma.',
    pegadinha: 'Confira se as P são regulares entre si e os QRS regulares entre si, mas sem relação entre os dois grupos. Essa é a assinatura.',
    alerta: 'No Brasil, doença de Chagas é causa clássica de BAVT em adulto jovem sem cardiopatia aparente.',
    alternativas: ['BAV 2º grau Mobitz II', 'Ritmo juncional de escape', 'Bradicardia sinusal'],
  },

  /* ====================================================================
     BLOQUEIOS DE RAMO
     ==================================================================== */

  brd: {
    nome: 'Bloqueio de ramo direito',
    familia: 'ramo',
    nivel: 'intermediario',
    derivacao: 'V1',
    ritmo: () => ritmoRegular({
      fc: 72, duracao: 6000,
      batimento: { qrs: 'rsr', tAmp: -0.25, tDur: 190, stDur: 70 },
    }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal.',
      fc: '~72 bpm.',
      eixo: 'Normal. Bloqueio de ramo direito ISOLADO não desvia o eixo; se houver desvio para a direita, pense em bloqueio bifascicular associado (hemibloqueio posterior esquerdo) ou em sobrecarga de ventrículo direito.',
      intervalos: 'PR normal · QRS ≥ 120 ms.',
      qrs: 'Padrão rsR\' em V1 — as "orelhas de coelho". Onda S alargada em DI e V6.',
      st: 'Onda T invertida em V1–V2. Isso é discordância esperada, não isquemia.',
      sintese: 'QRS largo com rsR\' em V1: bloqueio do ramo direito.',
      conduta: 'Isolado e assintomático, costuma ser benigno e não exige tratamento. O contexto define: BRD novo com dor torácica ou dispneia merece investigação.',
    },
    dx: 'Bloqueio de ramo direito',
    pivo: 'QRS ≥ 120 ms com rsR\' em V1.',
    conduta: 'Nenhuma isoladamente. Investigar se novo ou sintomático.',
    distrator: 'Ler a T invertida de V1–V2 como isquemia.',
    pegadinha: 'V1 positivo, com orelha de coelho, é ramo DIREITO. A T invertida ali é obrigatória e não significa infarto.',
    alternativas: ['Bloqueio de ramo esquerdo', 'IAM anterosseptal', 'Padrão de Brugada'],
  },

  bre: {
    nome: 'Bloqueio de ramo esquerdo',
    familia: 'ramo',
    nivel: 'avancado',
    derivacao: 'V1',
    ritmo: () => ritmoRegular({
      fc: 74, duracao: 6000,
      batimento: { qrs: 'bre', st: 0.12, stForma: 'concavo', tAmp: 0.4, tDur: 200, stDur: 60 },
    }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal.',
      fc: '~74 bpm.',
      eixo: 'Normal ou desviado para a esquerda.',
      intervalos: 'PR normal · QRS ≥ 120 ms.',
      qrs: 'Complexo largo e predominantemente negativo em V1 (rS ou QS); R alargado e entalhado em DI, aVL e V6.',
      st: 'Desvio de ST e T discordantes do QRS — esperado no BRE. É essa discordância que mascara isquemia.',
      sintese: 'QRS largo com padrão negativo em V1: bloqueio do ramo esquerdo.',
      conduta: 'BRE novo, ou de idade indeterminada, com dor torácica: manejar como síndrome coronariana aguda. Aplicar os critérios de Sgarbossa para identificar infarto dentro do BRE.',
    },
    dx: 'Bloqueio de ramo esquerdo',
    pivo: 'QRS ≥ 120 ms, negativo e alargado em V1.',
    conduta: 'O BRE isolado crônico não é emergência. BRE novo com dor é tratado como oclusão até prova em contrário.',
    distrator: 'Tentar laudar isquemia ignorando que o BRE já altera o ST por definição.',
    pegadinha: 'V1 negativo = ESQUERDO. O BRE esconde o supra de ST — os critérios de Sgarbossa existem exatamente por isso.',
    alerta: 'Sgarbossa: supra de ST ≥ 1 mm CONCORDANTE com o QRS; infra de ST ≥ 1 mm em V1–V3; supra discordante desproporcional (critério de Smith modificado: razão ST/S ≤ −0,25).',
    alternativas: ['Bloqueio de ramo direito', 'Ritmo de marcapasso', 'Taquicardia ventricular'],
  },

  /* ====================================================================
     TAQUIARRITMIAS
     ==================================================================== */

  tsv: {
    nome: 'Taquicardia supraventricular',
    familia: 'taqui',
    nivel: 'intermediario',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({
      fc: 175, duracao: 4500,
      batimento: { pAmp: 0, pr: 0, tDur: 130, stDur: 40, tAmp: 0.22 },
    }),
    leitura: {
      adequacao: 'Calibração padrão. Considere registrar a 50 mm/s para separar as ondas.',
      ritmo: 'Taquicardia regular sem onda P identificável — a P está escondida dentro ou logo após o QRS.',
      fc: '~175 bpm, notavelmente constante.',
      eixo: 'Normal.',
      intervalos: 'QRS ESTREITO, abaixo de 120 ms.',
      qrs: 'Estreito e regular, todos iguais.',
      st: 'Pode haver infra de ST por demanda, sem significar oclusão.',
      sintese: 'Taquicardia regular de QRS estreito: taquicardia supraventricular.',
      conduta: 'Estável: manobra vagal (Valsalva modificada é a de maior rendimento), depois adenosina 6 mg IV em bólus rápido seguido de flush, podendo repetir 12 mg. Instável: cardioversão elétrica sincronizada.',
    },
    dx: 'Taquicardia supraventricular',
    pivo: 'Taquicardia REGULAR de QRS ESTREITO, com início e término súbitos.',
    conduta: 'A instabilidade é que decide entre droga e choque — não a frequência isolada.',
    distrator: 'Taquicardia sinusal, que tem P visível e frequência mais variável.',
    pegadinha: 'Cautela com adenosina em asma e broncoespasmo. E avise o paciente da sensação torácica intensa e passageira.',
    alternativas: ['Taquicardia ventricular', 'Flutter atrial 2:1', 'Fibrilação atrial'],
  },

  fa: {
    nome: 'Fibrilação atrial',
    familia: 'taqui',
    nivel: 'intermediario',
    derivacao: 'DII',
    ritmo: () => ritmoIrregular({
      intervalos: [520, 760, 440, 880, 600, 500, 720, 640],
      duracao: 6500,
      batimento: { pAmp: 0, pr: 0, stDur: 70, tDur: 160 },
      atrial: ondulacaoFibrilatoria,
    }),
    leitura: {
      adequacao: 'Calibração padrão. Cuidado para não confundir tremor muscular com ondulação fibrilatória.',
      ritmo: 'IRREGULARMENTE irregular, sem qualquer onda P organizada. A linha de base ondula finamente.',
      fc: 'Variável de batimento para batimento. Conte os QRS em 6 segundos e multiplique por 10 — as fórmulas de RR não valem em ritmo irregular.',
      eixo: 'Normal.',
      intervalos: 'RR sem padrão previsível · QRS estreito.',
      qrs: 'Estreito.',
      st: 'Sem alteração primária.',
      sintese: 'Ausência de onda P com RR irregularmente irregular: fibrilação atrial.',
      conduta: 'Controle de frequência ou de ritmo conforme o caso, e anticoagulação decidida pelo escore CHA₂DS₂-VASc — não pela frequência nem pelos sintomas. Instável: cardioversão imediata.',
    },
    dx: 'Fibrilação atrial',
    pivo: 'Ausência de P + RR irregularmente irregular.',
    conduta: 'A decisão que mais muda prognóstico é a anticoagulação, não a frequência.',
    distrator: 'Flutter com condução variável, que também é irregular mas tem ondas F organizadas.',
    pegadinha: 'FA com mais de 48 h, ou de início indeterminado, exige anticoagulação adequada ou ecocardiograma transesofágico ANTES da cardioversão eletiva. Cardioverter direto é risco de embolia.',
    alerta: 'DIVERGÊNCIA DE FONTES, com a referência por extenso. O limiar clássico de duração para cardioversão eletiva sem preparo é de 48 h. As Diretrizes de 2024 para o manejo da fibrilação atrial da Sociedade Europeia de Cardiologia, elaboradas com a Associação Europeia de Cirurgia Cardiotorácica e publicadas no European Heart Journal (2024 ESC/EACTS Guidelines for the management of atrial fibrillation), baixaram esse limiar para 24 h. Nas duas convenções, a anticoagulação segue por pelo menos 4 semanas depois da cardioversão.',
    alternativas: ['Flutter atrial', 'Taquicardia atrial multifocal', 'Taquicardia sinusal com extrassístoles'],
  },

  flutter: {
    nome: 'Flutter atrial',
    familia: 'taqui',
    nivel: 'intermediario',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({
      fc: 150, duracao: 5200,
      batimento: { pAmp: 0, pr: 0, tAmp: 0, stDur: 40 },
    }),
    atrialExtra: denteDeSerra,
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Atividade atrial regular em "dente de serra" — ondas F contínuas, sem linha de base isoelétrica entre elas, melhor vistas em DII, DIII e aVF.',
      fc: 'Atrial em torno de 300 por minuto; ventricular ~150 quando a condução é 2:1.',
      eixo: 'Normal.',
      intervalos: 'QRS estreito.',
      qrs: 'Estreito e regular.',
      st: 'Mascarado pelas ondas F.',
      sintese: 'Ondas F em dente de serra com condução 2:1: flutter atrial.',
      conduta: 'Mesma lógica de anticoagulação da fibrilação atrial. Controle de frequência costuma ser mais difícil. Ablação do istmo cavotricuspídeo tem alta taxa de cura no flutter típico.',
    },
    dx: 'Flutter atrial com condução 2:1',
    pivo: 'Ondas F em dente de serra com frequência ventricular próxima de 150.',
    conduta: 'Trate como FA quanto ao risco embólico. Considere ablação.',
    distrator: 'TSV — porque a frequência de 150 é regular e o QRS é estreito.',
    pegadinha: 'Toda taquicardia regular de QRS estreito a ~150 bpm deve levantar suspeita de flutter 2:1. Manobra vagal ou adenosina desmascara as ondas F ao frear temporariamente o nó AV.',
    alternativas: ['Taquicardia supraventricular', 'Fibrilação atrial', 'Taquicardia sinusal'],
  },

  tv: {
    nome: 'Taquicardia ventricular monomórfica',
    familia: 'taqui',
    nivel: 'avancado',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({
      fc: 168, duracao: 4500,
      batimento: { pAmp: 0, pr: 0, qrs: 'ventricular', st: -0.1, tAmp: -0.4, tDur: 180, stDur: 40 },
    }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Taquicardia regular sem onda P relacionada. Pode haver dissociação AV, batimentos de captura e de fusão — quando presentes, são praticamente diagnósticos.',
      fc: '~168 bpm.',
      eixo: 'Frequentemente bizarro, fora dos quadrantes habituais.',
      intervalos: 'QRS LARGO, ≥ 120 ms e em geral bem acima disso.',
      qrs: 'Largo, monomórfico — todos os complexos com a mesma forma.',
      st: 'Impossível de avaliar de forma independente.',
      sintese: 'Taquicardia regular de QRS largo: taquicardia ventricular até prova em contrário.',
      conduta: 'Sem pulso: desfibrilação NÃO sincronizada e protocolo de parada. Com pulso e instável: cardioversão elétrica SINCRONIZADA. Com pulso e estável: amiodarona, procainamida ou sotalol, com preparo para cardioverter.',
    },
    dx: 'Taquicardia ventricular monomórfica',
    pivo: 'Taquicardia regular de QRS largo.',
    conduta: 'A pergunta que ordena tudo: tem pulso? Depois: está estável?',
    distrator: 'TSV com aberrância de condução.',
    pegadinha: 'Taquicardia de QRS largo é TV até prova em contrário, sobretudo em quem tem cardiopatia estrutural ou infarto prévio. Tratar como TSV e dar bloqueador do nó AV pode degenerar em fibrilação ventricular.',
    alerta: 'A regra "nunca adenosina em QRS largo" é uma boa regra de bolso porque o erro que ela previne é grave. Formalmente, adenosina pode ser considerada em taquicardia de QRS largo REGULAR e MONOMÓRFICA quando há dúvida diagnóstica e o paciente está estável. Verapamil e diltiazem, esses sim, devem ser evitados.',
    alternativas: ['TSV com aberrância', 'Fibrilação atrial pré-excitada', 'Flutter com aberrância'],
  },

  torsades: {
    nome: 'Torsades de pointes',
    familia: 'taqui',
    nivel: 'avancado',
    derivacao: 'DII',
    ritmo: () => {
      // Amplitude oscilante: os complexos "torcem" em torno da linha de base.
      const eventos = [];
      const rr = 240;
      let t = 120;
      let i = 0;
      // A duracao aqui so serve para colher UM batimento-modelo, que e clonado
      // com escala e sinal variaveis logo abaixo. Ela precisa caber pelo menos
      // um evento: o ritmoRegular comeca em t=120 ms e so emite enquanto
      // 120 + inicioQRS < duracao. Com 100 ms nao saia evento nenhum, eventos[0]
      // era undefined e a leitura de .modelo derrubava a tela inteira.
      const base = ritmoRegular({ fc: 250, duracao: 600 }).eventos[0];
      while (t < 5000) {
        const fase = Math.sin((i / 11) * Math.PI * 2);
        const escala = 0.35 + 0.95 * Math.abs(fase);
        eventos.push({
          t0: t,
          modelo: {
            ...base.modelo,
            onda: ((esc, sinal) => (tt) => base.modelo.onda(tt) * esc * sinal)(escala, fase >= 0 ? 1 : -1),
          },
        });
        t += rr;
        i++;
      }
      return { eventos, duracao: 5000, tipo: 'torsades' };
    },
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Taquicardia ventricular POLIMÓRFICA: a amplitude e a polaridade dos complexos variam ciclicamente, como se o traçado torcesse em torno da linha de base.',
      fc: 'Muito rápida, entre 200 e 250 por minuto.',
      eixo: 'Muda continuamente — é esse o fenômeno.',
      intervalos: 'QRS largo. No traçado de base, antes do episódio, o QT está prolongado.',
      qrs: 'Polimórfico, com amplitude crescente e decrescente em fuso.',
      st: 'Não avaliável.',
      sintese: 'Taquicardia ventricular polimórfica associada a QT longo: torsades de pointes.',
      conduta: 'Sulfato de magnésio 1–2 g IV, mesmo com magnésio sérico normal. Corrigir potássio. Suspender toda droga que prolongue o QT. Se instável ou sem pulso: DESFIBRILAÇÃO NÃO SINCRONIZADA. Aceleração do ritmo por marcapasso ou isoproterenol nas formas dependentes de pausa.',
    },
    dx: 'Torsades de pointes',
    pivo: 'TV polimórfica em fuso, sobre um QT prolongado.',
    conduta: 'Magnésio, correção eletrolítica e retirada do agente causador.',
    distrator: 'Fibrilação ventricular — que é caótica e sem qualquer organização em fuso.',
    pegadinha: 'Em taquicardia POLIMÓRFICA instável o choque é NÃO sincronizado. O sincronizador não consegue marcar um R consistente e simplesmente não dispara. Este é o erro mais perigoso de todo o tema.',
    alerta: 'Um resumo em circulação no curso afirma que torsades "não tem pulso". Isso está errado: torsades pode ter pulso, e nesse caso a conduta inclui magnésio e correção da causa, não apenas choque.',
    alternativas: ['Fibrilação ventricular', 'TV monomórfica', 'Artefato de movimento'],
  },

  /* ====================================================================
     RITMOS DE PARADA
     ==================================================================== */

  fv: {
    nome: 'Fibrilação ventricular',
    familia: 'parada',
    nivel: 'avancado',
    derivacao: 'DII',
    ritmo: () => {
      const dur = 5000;
      const eventos = [];
      const caos = (t) =>
        0.55 * Math.sin(t * 0.062) + 0.42 * Math.sin(t * 0.111 + 1.3) +
        0.34 * Math.sin(t * 0.183 + 2.7) + 0.26 * Math.sin(t * 0.241 + 0.4) +
        0.18 * Math.sin(t * 0.397 + 5.1);
      return { eventos, duracao: dur, atrial: caos, tipo: 'fv' };
    },
    leitura: {
      adequacao: 'Antes de qualquer coisa: confirme que não é eletrodo solto. Cheque o paciente, não só o monitor.',
      ritmo: 'Nenhum. Atividade elétrica caótica, sem complexos identificáveis.',
      fc: 'Não mensurável.',
      eixo: 'Não aplicável.',
      intervalos: 'Não aplicável — não há P, QRS ou T reconhecíveis.',
      qrs: 'Ausente enquanto estrutura.',
      st: 'Não aplicável.',
      sintese: 'Fibrilação ventricular: ritmo de parada cardíaca, chocável.',
      conduta: 'RCP de alta qualidade e DESFIBRILAÇÃO IMEDIATA, não sincronizada. Retomar compressões logo após o choque. Adrenalina 1 mg IV a cada 3–5 min; amiodarona 300 mg após o terceiro choque. Procurar as causas reversíveis.',
    },
    dx: 'Fibrilação ventricular',
    pivo: 'Ausência total de complexos organizados em paciente sem pulso.',
    conduta: 'Ritmo CHOCÁVEL. Desfibrilar sem sincronizar. Cada minuto de atraso reduz a sobrevida.',
    distrator: 'Artefato de movimento ou eletrodo desconectado — por isso se examina o paciente.',
    pegadinha: 'Nunca sincronize na FV. Não há onda R para o aparelho marcar; o choque não sai e o tempo se perde.',
    alerta: 'Causas reversíveis: hipóxia, hipovolemia, hidrogênio (acidose), hipo/hipercalemia, hipotermia, tensão no tórax (pneumotórax), tamponamento, toxinas, trombose coronária e trombose pulmonar.',
    alternativas: ['Assistolia', 'Taquicardia ventricular polimórfica', 'Artefato'],
  },

  assistolia: {
    nome: 'Assistolia',
    familia: 'parada',
    nivel: 'avancado',
    derivacao: 'DII',
    ritmo: () => ({
      eventos: [],
      duracao: 5000,
      atrial: (t) => 0.012 * Math.sin(t * 0.02),
      tipo: 'assistolia',
    }),
    leitura: {
      adequacao: 'Confirme em mais de uma derivação e verifique cabos e ganho antes de assumir assistolia.',
      ritmo: 'Ausência de atividade elétrica.',
      fc: 'Zero.',
      eixo: 'Não aplicável.',
      intervalos: 'Não aplicável.',
      qrs: 'Ausente.',
      st: 'Não aplicável.',
      sintese: 'Assistolia: ritmo de parada, NÃO chocável.',
      conduta: 'RCP de alta qualidade e adrenalina 1 mg IV a cada 3–5 minutos, o mais precocemente possível. Buscar e tratar causas reversíveis. NÃO desfibrilar.',
    },
    dx: 'Assistolia',
    pivo: 'Linha praticamente isoelétrica, sem complexos, em paciente sem pulso.',
    conduta: 'Ritmo NÃO chocável. Compressões e adrenalina.',
    distrator: 'FV fina — na dúvida, aumente o ganho e cheque outra derivação.',
    pegadinha: 'Desfibrilar assistolia não traz benefício e interrompe as compressões, que são a única coisa que mantém perfusão.',
    alternativas: ['Fibrilação ventricular fina', 'Atividade elétrica sem pulso', 'Cabo desconectado'],
  },

  /* ====================================================================
     ISQUEMIA E INFARTO
     ==================================================================== */

  stemi: {
    nome: 'IAM com supradesnivelamento de ST',
    familia: 'isquemia',
    nivel: 'avancado',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({
      fc: 82, duracao: 5500,
      batimento: { st: 0.35, stForma: 'convexo', stDur: 100, tAmp: 0.45, tDur: 200, tAssim: 0.1 },
    }),
    leitura: {
      adequacao: 'Calibração padrão. Se o quadro é inferior, peça V3R e V4R; se há suspeita de dorsal, peça V7–V9.',
      ritmo: 'Sinusal.',
      fc: '~82 bpm.',
      eixo: 'Normal.',
      intervalos: 'PR e QRS normais no início; a onda Q patológica aparece na evolução.',
      qrs: 'Ainda preservado nas primeiras horas.',
      st: 'SUPRA de ST convexo, "em abóbada", medido no ponto J, em derivações contíguas — com infra recíproco na parede oposta.',
      sintese: 'Supradesnivelamento localizado, convexo, com imagem em espelho: oclusão coronária aguda.',
      conduta: 'Reperfusão imediata. Angioplastia primária é a primeira escolha quando disponível em tempo hábil; trombólise quando não houver hemodinâmica acessível dentro da janela. Antiagregação dupla e anticoagulação conforme protocolo. Não aguardar troponina para decidir.',
    },
    dx: 'Infarto agudo do miocárdio com supra de ST',
    pivo: 'Supra de ST em duas derivações contíguas, com morfologia convexa e recíproca.',
    conduta: 'Tempo é músculo. A decisão de reperfusão não espera exame laboratorial.',
    distrator: 'Pericardite, que dá supra difuso e côncavo com infra de PR; e repolarização precoce em jovem assintomático.',
    pegadinha: 'Limiares por derivação e por sexo: ≥ 1 mm nas derivações em geral; em V2–V3, ≥ 2 mm em homens com 40 anos ou mais, ≥ 2,5 mm em homens abaixo de 40 e ≥ 1,5 mm em mulheres de qualquer idade.',
    alerta: 'IAM inferior obriga a pedir V3R e V4R. Havendo infarto de ventrículo direito, nitrato, morfina e diurético estão CONTRAINDICADOS — o débito depende da pré-carga. A conduta é volume. Atenção: material do curso atribui essa contraindicação à "parede inferior"; o correto é ao acometimento do VD.',
    alternativas: ['Pericardite aguda', 'Repolarização precoce', 'Sobrecarga ventricular esquerda com strain', 'Aneurisma de ventrículo esquerdo'],
  },

  infraST: {
    nome: 'Infradesnivelamento de ST',
    familia: 'isquemia',
    nivel: 'avancado',
    derivacao: 'V5',
    ritmo: () => ritmoRegular({
      fc: 88, duracao: 5500,
      batimento: { st: -0.18, stForma: 'reto', stDur: 100, tAmp: -0.18, tDur: 190, tAssim: -0.1 },
    }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal.',
      fc: '~88 bpm.',
      eixo: 'Normal.',
      intervalos: 'PR e QRS normais.',
      qrs: 'Estreito.',
      st: 'INFRA de ST horizontal ou descendente, com ou sem inversão de T. Infra ascendente tem valor bem menor.',
      sintese: 'Isquemia subendocárdica — síndrome coronariana aguda sem supradesnivelamento.',
      conduta: 'Antiagregação, anticoagulação, antianginoso e estratificação de risco. NÃO se tromboliza. A estratégia invasiva e seu tempo são definidos pelo risco e pela refratariedade dos sintomas.',
    },
    dx: 'Síndrome coronariana aguda sem supra de ST',
    pivo: 'Infra de ST horizontal ou descendente, em território coronariano, com clínica compatível.',
    conduta: 'Estratificação de risco decide o momento do cateterismo. Trombólise não tem papel.',
    distrator: 'Ler como STEMI e trombolisar; ou descartar como normal.',
    pegadinha: 'Antes de assumir "sem supra", descarte os equivalentes de oclusão: IAM dorsal (infra em V1–V3 espelhando supra em V7–V9), padrão de De Winter, T hiperaguda e critérios de Sgarbossa no BRE ou no ritmo de marcapasso.',
    alerta: 'Supra em aVR com infra difusa NÃO é equivalente de STEMI e não se tromboliza. Indica alto risco de lesão de tronco ou triarterial, e a conduta é angiografia urgente. Digital produz infra "em colher" — cheque se o paciente usa digoxina.',
    alternativas: ['IAM com supra de ST', 'Efeito digitálico', 'Sobrecarga ventricular esquerda', 'ECG normal'],
  },

  pericardite: {
    nome: 'Pericardite aguda',
    familia: 'isquemia',
    nivel: 'avancado',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({
      fc: 96, duracao: 5500,
      batimento: {
        st: 0.16, stForma: 'concavo', stDur: 100, tAmp: 0.3, tDur: 190, pAmp: 0.13,
        // Infra do SEGMENTO PR: o segundo discriminador contra oclusão, e o
        // roteiro guiado pede para medi-lo nesta tira.
        prDesnivel: -0.08,
      },
    }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal, com frequência frequentemente elevada.',
      fc: '~96 bpm.',
      eixo: 'Normal.',
      intervalos: 'PR e QRS normais; o achado está no segmento PR, não no intervalo.',
      qrs: 'Estreito, sem onda Q patológica.',
      st: 'Supra de ST DIFUSO e CÔNCAVO, presente em quase todas as derivações, com infradesnivelamento do segmento PR. Poupa aVR e V1, onde ocorre o inverso.',
      sintese: 'Supra difuso côncavo com infra de PR: pericardite aguda.',
      conduta: 'Anti-inflamatório não esteroidal ou aspirina em dose alta, associado a colchicina, que reduz recorrência. Investigar etiologia e derrame por ecocardiograma.',
    },
    dx: 'Pericardite aguda',
    pivo: 'Supra difuso e côncavo + infra de PR, sem território coronariano e sem imagem em espelho.',
    conduta: 'Anti-inflamatório e colchicina. Reconhecer não é detalhe: trombolisar pericardite pode causar hemopericárdio.',
    distrator: 'STEMI. A diferença está na distribuição (difusa contra localizada), na concavidade e na ausência de recíproca.',
    pegadinha: 'Dor que piora deitado e melhora sentado e inclinado para a frente. Atrito pericárdico à ausculta. O supra da pericardite não respeita território de artéria.',
    alternativas: ['IAM com supra de ST', 'Repolarização precoce', 'Miocardite'],
  },

  /* ====================================================================
     ELETRÓLITOS E DROGAS
     ==================================================================== */

  hipercalemia: {
    nome: 'Hipercalemia',
    familia: 'eletrolito',
    nivel: 'avancado',
    derivacao: 'V3',
    ritmo: () => ritmoRegular({
      fc: 66, duracao: 6000,
      batimento: { pAmp: 0.05, pDur: 120, pr: 220, qrsLargura: 1.35, tAmp: 0.95, tDur: 130, tAssim: 0, stDur: 50 },
    }),
    leitura: {
      adequacao: 'Calibração padrão — a onda T alta pode chegar a sair da faixa do papel.',
      ritmo: 'Sinusal, com onda P já achatada.',
      fc: '~66 bpm.',
      eixo: 'Normal.',
      intervalos: 'PR alargado; QRS alargando progressivamente conforme o potássio sobe.',
      qrs: 'Alargado, sem morfologia típica de bloqueio de ramo.',
      st: 'Onda T ALTA, ESTREITA, SIMÉTRICA e apiculada — "em tenda". É o primeiro sinal.',
      sintese: 'Sequência clássica: T apiculada, achatamento da P, alargamento do QRS e, por fim, onda sinusoidal.',
      conduta: 'Alteração de ECG em hipercalemia é emergência. Primeiro, ESTABILIZAR A MEMBRANA com gluconato de cálcio. Depois deslocar o potássio para dentro da célula com insulina e glicose e beta-2 agonista inalatório. Por fim, remover: diurético de alça, resina de troca ou diálise.',
    },
    dx: 'Hipercalemia com repercussão eletrocardiográfica',
    pivo: 'Onda T alta, estreita e SIMÉTRICA, com base estreita.',
    conduta: 'Cálcio primeiro quando o ECG já mudou. Ele não baixa o potássio — protege o coração enquanto o resto age.',
    distrator: 'T hiperaguda da isquemia, que é larga e assimétrica, e a repolarização precoce.',
    pegadinha: 'A T da hipercalemia é simétrica e de base estreita; a da isquemia é larga e assimétrica. O contexto — insuficiência renal, drogas, rabdomiólise — costuma decidir.',
    alerta: 'A hipercalemia é o eletrólito que mais mata pelo ECG. A ausência de alterações não exclui hipercalemia grave.',
    alternativas: ['Isquemia com T hiperaguda', 'Repolarização precoce', 'ECG normal', 'Hipocalemia'],
  },

  hipocalemia: {
    nome: 'Hipocalemia',
    familia: 'eletrolito',
    nivel: 'avancado',
    derivacao: 'V3',
    ritmo: () => ritmoRegular({
      fc: 76, duracao: 6000,
      batimento: { st: -0.08, stForma: 'descendente', tAmp: 0.08, tDur: 190, uAmp: 0.22, stDur: 90 },
    }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal.',
      fc: '~76 bpm.',
      eixo: 'Normal.',
      intervalos: 'O QT aparente se alonga — na verdade é a onda U se fundindo à T, formando o intervalo QU.',
      qrs: 'Estreito.',
      st: 'Infra discreto de ST, onda T achatada e onda U proeminente após a T.',
      sintese: 'T achatada com onda U proeminente: hipocalemia.',
      conduta: 'Repor potássio, e obrigatoriamente corrigir o MAGNÉSIO junto — sem magnésio a reposição de potássio não sustenta. Suspender ou revisar diuréticos.',
    },
    dx: 'Hipocalemia',
    pivo: 'Onda U proeminente com achatamento da T.',
    conduta: 'Repor potássio e magnésio. Monitorizar: o risco é arritmia ventricular.',
    distrator: 'QT longo verdadeiro — aqui o que se alonga é o QU.',
    pegadinha: 'Hipocalemia predispõe a torsades. Se o paciente usa droga que prolonga o QT, o risco se soma.',
    alternativas: ['QT longo congênito', 'Hipercalemia', 'Efeito digitálico'],
  },

  /* ====================================================================
     OUTROS PADRÕES
     ==================================================================== */

  wpw: {
    nome: 'Pré-excitação (Wolff-Parkinson-White)',
    familia: 'outros',
    nivel: 'avancado',
    derivacao: 'V4',
    ritmo: () => ritmoRegular({
      fc: 74, duracao: 6000,
      batimento: { pr: 90, qrs: 'delta', tAmp: -0.2, tDur: 190, stDur: 60 },
    }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Sinusal.',
      fc: '~74 bpm.',
      eixo: 'Variável conforme a localização da via acessória.',
      intervalos: 'PR CURTO, abaixo de 120 ms · QRS alargado às custas do empastamento inicial.',
      qrs: 'Início empastado e lento — a onda delta — porque parte do ventrículo é despolarizada pela via acessória, fora do sistema de condução.',
      st: 'Alterações secundárias de repolarização.',
      sintese: 'PR curto com onda delta e QRS largo: pré-excitação ventricular.',
      conduta: 'Assintomático: avaliação eletrofisiológica conforme risco. Com taquiarritmia: ablação da via acessória é curativa.',
    },
    dx: 'Padrão de pré-excitação (WPW)',
    pivo: 'PR curto + onda delta + QRS largo.',
    conduta: 'Encaminhar para eletrofisiologia. Ablação resolve.',
    distrator: 'Bloqueio de ramo — mas ali o PR é normal e não há delta.',
    pegadinha: 'Em fibrilação atrial PRÉ-EXCITADA, bloquear o nó AV com adenosina, verapamil, diltiazem ou digoxina favorece a condução pela via acessória e pode degenerar em fibrilação ventricular. O tratamento é cardioversão elétrica, ou procainamida quando estável.',
    alerta: 'Suspeite de FA pré-excitada diante de taquicardia irregular, de QRS largo e muito rápida, com complexos de larguras variáveis.',
    alternativas: ['Bloqueio de ramo esquerdo', 'Taquicardia ventricular', 'ECG normal'],
  },

  qtLongo: {
    nome: 'QT longo',
    familia: 'outros',
    nivel: 'avancado',
    derivacao: 'V4',
    ritmo: () => ritmoRegular({
      fc: 62, duracao: 6500,
      batimento: { tAmp: 0.28, tDur: 320, tAssim: 0.4, stDur: 150 },
    }),
    leitura: {
      adequacao: 'Calibração padrão. Meça o QT na derivação em que ele for mais longo e a T terminar de forma nítida.',
      ritmo: 'Sinusal.',
      fc: '~62 bpm.',
      eixo: 'Normal.',
      intervalos: 'QT visivelmente prolongado; corrigir pela frequência antes de concluir.',
      qrs: 'Estreito.',
      st: 'Segmento ST alongado com onda T de aparecimento tardio.',
      sintese: 'Intervalo QT corrigido acima do limite: risco de torsades de pointes.',
      conduta: 'Suspender drogas que prolongam o QT. Corrigir potássio e magnésio. Investigar causa congênita quando não houver causa adquirida. Betabloqueador nas formas congênitas.',
    },
    dx: 'Síndrome do QT longo',
    pivo: 'QTc acima do limite para o sexo, medido corretamente e corrigido pela frequência.',
    conduta: 'Retirar o agente causador e corrigir eletrólitos. QTc acima de 500 ms indica risco alto de torsades.',
    distrator: 'Onda U proeminente da hipocalemia sendo medida como parte da T.',
    pegadinha: 'A fórmula de Bazett (QT dividido pela raiz quadrada do RR em segundos) superestima em taquicardia e subestima em bradicardia. Fora da faixa de 60 a 100 bpm, prefira Fridericia.',
    alerta: 'DIVERGÊNCIA DE FONTES. A Diretriz da SBC de 2022 define QTc normal até 450 ms em homens e 470 ms em mulheres. O Guia OSCE que circula no curso usa 450 e 460. As duas convenções existem; a de 470 é a nacional. Confirme qual o seu professor cobra.',
    alternativas: ['Hipocalemia', 'Hipercalemia', 'ECG normal'],
  },

  juncional: {
    nome: 'Ritmo juncional de escape',
    familia: 'outros',
    nivel: 'intermediario',
    derivacao: 'DII',
    ritmo: () => ritmoRegular({
      fc: 46, duracao: 7000,
      batimento: { pAmp: 0, pr: 0, qrs: 'juncional', tAmp: 0.25, tDur: 180 },
    }),
    leitura: {
      adequacao: 'Calibração padrão.',
      ritmo: 'Regular, sem onda P precedendo o QRS. A P pode estar ausente, retrógrada e negativa em DII, ou escondida no QRS.',
      fc: '~46 bpm — a faixa própria do nó AV como marcapasso subsidiário é de 40 a 60.',
      eixo: 'Normal.',
      intervalos: 'Sem PR mensurável · QRS estreito.',
      qrs: 'Estreito, porque o estímulo nasce acima da bifurcação e desce pelo sistema normal.',
      st: 'Sem alteração primária.',
      sintese: 'Ritmo de escape juncional: o nó AV assumiu porque o nó sinusal falhou ou foi bloqueado.',
      conduta: 'Tratar a causa — hipertonia vagal, isquemia inferior, drogas que freiam o nó, hipercalemia. O escape é um mecanismo de proteção; suprimi-lo sem substituir seria um erro.',
    },
    dx: 'Ritmo juncional de escape',
    pivo: 'Bradicardia regular de QRS estreito, sem onda P sinusal.',
    conduta: 'Nunca suprima um ritmo de escape. Ele é o que está mantendo o débito.',
    distrator: 'Bradicardia sinusal, que mantém a onda P; e BAVT, que tem P dissociadas visíveis.',
    pegadinha: 'Escape juncional é consequência, não doença. Procure o que silenciou o nó sinusal.',
    alternativas: ['Bradicardia sinusal', 'BAV total', 'Ritmo idioventricular'],
  },
};

/* ==========================================================================
   ÍNDICES AUXILIARES
   ========================================================================== */

export const chavesPorFamilia = () => {
  const mapa = {};
  for (const [chave, p] of Object.entries(PADROES)) {
    (mapa[p.familia] ||= []).push(chave);
  }
  return mapa;
};

export const listarPadroes = () => Object.entries(PADROES).map(([chave, p]) => ({ chave, ...p }));

/** Ritmo já montado, aplicando eventual atividade atrial extra da entrada. */
export function montarRitmo(chave) {
  const p = PADROES[chave];
  if (!p) throw new Error(`Padrão desconhecido: ${chave}`);
  const r = p.ritmo();
  if (p.atrialExtra && !r.atrial) r.atrial = p.atrialExtra;
  return r;
}

/** Os nove passos, na ordem em que o app ensina a percorrê-los. */
export const PASSOS = [
  ['adequacao',  'Adequação técnica',  'O traçado está calibrado e legível? 25 mm/s, 10 mm/mV, sem ruído.'],
  ['ritmo',      'Ritmo',              'Existe onda P antes de cada QRS, com PR constante?'],
  ['fc',         'Frequência',         'Regular: 1500 ÷ quadradinhos entre R-R. Irregular: QRS em 6 s × 10.'],
  ['eixo',       'Eixo',               'DI e aVF positivos colocam o eixo no quadrante normal.'],
  ['intervalos', 'Intervalos',         'PR 120–200 ms · QRS < 120 ms · QT corrigido pela frequência.'],
  ['qrs',        'Morfologia do QRS',  'Estreito ou largo? Onda Q patológica? Voltagem?'],
  ['st',         'Segmento ST e onda T', 'Supra, infra, ou repolarização normal?'],
  ['sintese',    'Síntese',            'Junte os achados numa única frase diagnóstica.'],
  ['conduta',    'Conduta',            'O que fazer, e o que a prova cobra sobre isso.'],
];
