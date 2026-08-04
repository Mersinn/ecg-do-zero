/**
 * Banco de casos clínicos progressivos.
 *
 * Substitui o modo que antes dependia de chamada a IA. Todo conteúdo aqui é
 * autoral e local: nenhuma requisição de rede, nenhuma dependência.
 *
 * ---------------------------------------------------------------------------
 * REGRAS CLÍNICAS QUE ESTE ARQUIVO É OBRIGADO A RESPEITAR
 * (herdadas da auditoria aplicada em src/js/ecg/library.js — não contrariar):
 *
 *  1. Taquicardia ventricular POLIMÓRFICA instável leva choque NÃO sincronizado.
 *     Monomórfica com pulso instável leva choque sincronizado.
 *  2. Supra em aVR com infra difuso NÃO é equivalente de STEMI: a conduta é
 *     angiografia urgente, não trombólise.
 *  3. Atropina não funciona em bloqueio infranodal (Mobitz II, BAVT).
 *  4. A contraindicação a nitrato, morfina e diurético é do infarto de
 *     VENTRÍCULO DIREITO, não da "parede inferior" — o material do curso
 *     enuncia isso errado e o app precisa dizer isso em voz alta.
 *  5. QTc tem duas convenções em circulação (SBC 2022: 450/470 · Guia OSCE do
 *     curso: 450/460). As duas aparecem como divergência declarada.
 *  6. "Nunca adenosina em QRS largo" é regra de bolso, não dogma: ela vale
 *     para verapamil e diltiazem sempre; para adenosina, só quando o ritmo é
 *     irregular, polimórfico ou pré-excitado.
 *
 * ---------------------------------------------------------------------------
 * O FREIO
 *
 * Antes de revelar a correção, o app pergunta ao aluno o que a questão está de
 * fato pedindo, e ele escreve em uma linha. O campo `variavelDecisiva` é a
 * resposta contra a qual ele compara. Ele não é um resumo da explicação: é o
 * NOME da grandeza, do limiar, do mecanismo ou da classificação que separa a
 * alternativa correta da alternativa vizinha. Quando o aluno erra tendo nomeado
 * a variável certa, o furo é de conteúdo. Quando ele acerta sem conseguir
 * nomeá-la, o acerto é frágil e volta para a fila de revisão.
 * ---------------------------------------------------------------------------
 */

/** Taxonomia dos movimentos de erro: o que a questão pede vive no enunciado; o movimento é a forma do erro. */
export const MOVIMENTOS = {
  fechamento_precoce:   'fechamento precoce — decidiu antes de percorrer o dado que faltava',
  erro_de_criterio:     'erro de critério — usou o achado errado para separar as hipóteses',
  inversao_de_criterio: 'inversão de critério — aplicou a regra da exceção ao caso geral, ou o contrário',
  erro_de_prioridade:   'erro de prioridade — a conduta não é errada, é fora de ordem',
  erro_de_conduta:      'erro de conduta — a decisão contraria o tratamento indicado',
  ancoragem:            'ancoragem — o rótulo do quadro puxou uma conduta que não é deste quadro',
};

export const CASOS = [

  /* ==================================================================
     c01 · Taquicardia sinusal na sepse
     ================================================================== */
  {
    id: 'c01',
    titulo: 'Taquicardia de 138 bpm em paciente séptico',
    familia: 'base',
    nivel: 'basico',
    cenario: 'Sala de emergência, madrugada de plantão, paciente trazido pelo SAMU com febre há dois dias.',
    queixa: 'Homem de 68 anos, confuso e prostrado, com tosse produtiva há três dias. A filha diz que ele "não para de tremer" e que hoje não conseguiu levantar da cama.',
    dados: 'PA 88/54 mmHg · FC 138 bpm · FR 28 irpm · Tax 38,9 °C · SatO₂ 91% em ar ambiente · lactato 3,8 mmol/L · crepitações em base direita · extremidades quentes.',
    padrao: 'taquiSinusal',
    notaTracado: 'Procure a onda P antes de cada QRS: ela continua lá, apenas mais próxima da T anterior, e o QRS segue estreito e regular.',
    decisoes: [
      {
        pergunta: 'Qual é o ritmo do traçado?',
        alternativas: [
          'Taquicardia sinusal',
          'Taquicardia supraventricular por reentrada nodal',
          'Flutter atrial com condução 2:1',
          'Fibrilação atrial de alta resposta',
        ],
        correta: 0,
        variavelDecisiva: 'A presença de onda P sinusal antes de cada QRS, com PR constante — e não o número 138 no monitor.',
        porQue: 'Cada QRS estreito é precedido por uma onda P de morfologia sinusal com PR fixo, e o início foi gradual, acompanhando a febre e a hipotensão. Isso define taquicardia sinusal.',
        porQueSeduz: 'A TSV também é regular e de QRS estreito, mas começa e termina de forma súbita, costuma passar de 150 bpm e não mostra onda P identificável antes do QRS.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'O paciente está hipotenso e taquicárdico. Qual a conduta em relação ao ritmo?',
        alternativas: [
          'Cardioversão elétrica sincronizada, porque há hipotensão com FC acima de 100 bpm',
          'Tratar a causa: expansão volêmica, antibiótico precoce e busca do foco — o ritmo não é o alvo',
          'Adenosina 6 mg IV em bólus rápido para reverter a taquicardia',
          'Betabloqueador intravenoso para controlar a frequência e melhorar a pressão',
        ],
        correta: 1,
        variavelDecisiva: 'Se a taquicardia é causa ou consequência da instabilidade — aqui ela é resposta compensatória à sepse.',
        porQue: 'Em taquicardia sinusal o ritmo é sintoma, não doença: corrige-se a causa (hipovolemia, febre, hipóxia, infecção). O manual de ACLS é explícito ao proibir cardioversão em ritmo sinusal.',
        porQueSeduz: 'O algoritmo de taquicardia instável está fresco na memória e a hipotensão parece autorizar o choque; mas o critério de instabilidade só se aplica quando os sintomas são causados pela arritmia, o que abaixo de 150 bpm é improvável.',
        movimento: 'erro_de_prioridade',
      },
      {
        pergunta: 'A equipe pergunta se vale frear a frequência com betabloqueador enquanto o antibiótico corre. O que responder?',
        alternativas: [
          'Sim: frequência acima de 120 bpm sempre aumenta o consumo miocárdico e deve ser reduzida',
          'Não: enquanto o volume não for reposto, o débito cardíaco depende dessa frequência',
          'Sim, mas apenas com diltiazem, que é mais seguro na sepse',
          'Só depois de conhecer o resultado da troponina',
        ],
        correta: 1,
        variavelDecisiva: 'De onde vem o débito cardíaco neste momento — da frequência, porque o volume sistólico está baixo.',
        porQue: 'Frear uma taquicardia sinusal compensatória em paciente hipotenso e hipovolêmico derruba o débito. É exatamente esse o raciocínio que o material de ACLS usa para desaconselhar betabloquear taquicardia sinusal compensatória.',
        porQueSeduz: 'A frase "taquicardia aumenta o consumo de oxigênio do miocárdio" é verdadeira e por isso convence; ela descreve um custo real, mas não autoriza remover o mecanismo que está sustentando a perfusão.',
        movimento: 'erro_de_conduta',
      },
    ],
    fechamento: 'O pivô é a onda P sinusal: ela transforma "taquicardia instável" em "paciente instável que está taquicárdico". Regra de prova: taquicardia sinusal nunca se cardioverte e raramente se freia — trata-se a causa.',
    card: 'Taquicardia regular, QRS estreito, com onda P sinusal e início gradual: é sintoma. Procure febre, dor, hipovolemia, hipóxia, anemia.',
  },

  /* ==================================================================
     c02 · Bradicardia sintomática
     ================================================================== */
  {
    id: 'c02',
    titulo: 'Bradicardia de 38 bpm com hipotensão em usuária de betabloqueador',
    familia: 'base',
    nivel: 'intermediario',
    cenario: 'Pronto-socorro, fim de tarde; paciente chega de ambulância após quase desmaiar no banheiro de casa.',
    queixa: 'Mulher de 74 anos, hipertensa, com tontura intensa ao levantar e "vista escura" há duas horas. Sem dor torácica e sem palpitação.',
    dados: 'PA 82/48 mmHg · FC 38 bpm · FR 18 irpm · SatO₂ 96% · sonolenta, extremidades frias, enchimento capilar 4 s · K 4,2 mEq/L · creatinina 1,1 mg/dL. Usa atenolol 100 mg/dia e hoje tomou a dose dobrada por engano.',
    padrao: 'bradicardia',
    notaTracado: 'Confira se cada QRS continua precedido por uma onda P com PR constante — no traçado, o que mudou foi apenas a frequência.',
    decisoes: [
      {
        pergunta: 'Qual é o ritmo?',
        alternativas: [
          'Bradicardia sinusal',
          'BAV de 1º grau',
          'Ritmo juncional de escape',
          'BAV de 2º grau Mobitz I',
        ],
        correta: 0,
        variavelDecisiva: 'A relação P→QRS: se toda P conduz com PR fixo dentro da faixa normal, a alteração é só de frequência.',
        porQue: 'Onda P positiva em DII precede cada QRS, com PR constante entre 120 e 200 ms, e nenhum batimento se perde. Isso é bradicardia sinusal.',
        porQueSeduz: 'O ritmo juncional também é regular, lento e de QRS estreito — a diferença é que nele não existe onda P sinusal antes do QRS.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Ela preenche critério de bradicardia sintomática instável?',
        alternativas: [
          'Não: FC de 38 bpm isolada não define instabilidade',
          'Sim: frequência lenta, sintomas presentes e sintomas atribuíveis à frequência',
          'Não: só seria instável se houvesse desconforto torácico isquêmico',
          'Sim, porque FC abaixo de 50 bpm é por definição instabilidade',
        ],
        correta: 1,
        variavelDecisiva: 'Os três critérios do ACLS precisam coexistir: frequência lenta, sintomas, e nexo entre uma coisa e a outra.',
        porQue: 'Há hipotensão, rebaixamento do sensório e sinais de má perfusão com FC de 38 bpm, sem outra causa concorrente. Os três critérios estão presentes.',
        porQueSeduz: 'Tratar "FC menor que 50" como definição fechada soa objetivo e é o erro mais comum: o número é gatilho para avaliar, não diagnóstico de instabilidade. Uma FC de 70 bpm pode ser lenta demais para um paciente em choque, e 45 bpm pode ser fisiológico num atleta.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Qual é a primeira medida medicamentosa?',
        alternativas: [
          'Atropina 1 mg IV, repetível a cada 3 a 5 minutos até o total de 3 mg',
          'Atropina 0,5 mg IV, para reduzir efeitos adversos',
          'Marcapasso transcutâneo imediato, sem tentar droga',
          'Adrenalina em infusão de 2 a 10 mcg/min como primeira escolha',
        ],
        correta: 0,
        variavelDecisiva: 'A dose que o algoritmo em vigor estabelece como primeira: 1 mg, e não os 0,5 mg do material antigo.',
        porQue: 'A bradicardia sinusal é de nível sinusal/nodal e responde à vagólise. O ACLS coloca atropina 1 mg IV a cada 3 a 5 minutos, máximo de 3 mg, como primeira linha na bradicardia sintomática. A advertência separada do manual é sobre doses INFERIORES a 0,5 mg, que podem reduzir ainda mais a frequência por efeito paradoxal.',
        porQueSeduz: 'A dose de 0,5 mg circula em material antigo e parece a escolha prudente; ela foi substituída por 1 mg como dose inicial, e subdosar aqui só consome os minutos que antecedem a decisão de estimular.',
        movimento: 'erro_de_conduta',
      },
      {
        pergunta: 'Após 3 mg de atropina ela permanece com FC 40 bpm e PA 80/45 mmHg. Próximo passo?',
        alternativas: [
          'Repetir atropina em bólus maior',
          'Marcapasso transcutâneo com analgesia e sedação, ou infusão de dopamina 5–20 mcg/kg/min ou adrenalina 2–10 mcg/min',
          'Cardioversão elétrica sincronizada',
          'Hidratação isolada, aguardando a eliminação do betabloqueador',
        ],
        correta: 1,
        variavelDecisiva: 'O que existe de segunda linha quando a atropina falha — estimulação ou catecolamina, não mais atropina.',
        porQue: 'A dose máxima de atropina é 3 mg e ultrapassá-la não traz benefício. O algoritmo segue com marcapasso transcutâneo (com sedação e analgesia no paciente consciente), dopamina 5–20 mcg/kg/min ou adrenalina 2–10 mcg/min.',
        porQueSeduz: 'Repetir a droga que "quase funcionou" parece razoável e consome minutos preciosos; o teto de 3 mg existe exatamente para impedir esse impasse.',
        movimento: 'erro_de_conduta',
      },
    ],
    fechamento: 'O pivô é o nexo entre a frequência e os sintomas, não o número no monitor. Regra de prova: atropina 1 mg até o máximo de 3 mg; se falhar, marcapasso transcutâneo ou catecolamina em infusão — e sedar antes de estimular o paciente consciente.',
    card: 'Bradicardia sintomática instável = FC lenta + sintomas + sintomas causados pela FC. Atropina 1 mg (máx. 3 mg) → marcapasso transcutâneo, dopamina ou adrenalina.',
  },

  /* ==================================================================
     c03 · Sobrecarga ventricular esquerda em hipertenso
     ================================================================== */
  {
    id: 'c03',
    titulo: 'ECG laudado como "isquemia lateral" em hipertenso assintomático',
    familia: 'sobrecarga',
    nivel: 'intermediario',
    cenario: 'Ambulatório de clínica médica, consulta de rotina para renovação de receita.',
    queixa: 'Homem de 58 anos, hipertenso há 20 anos com adesão irregular, sem dor torácica, sem dispneia e sem síncope. Traz um ECG feito em farmácia com laudo automático de "alteração isquêmica lateral".',
    dados: 'PA 168/104 mmHg · FC 72 bpm · IMC 29 kg/m² · assintomático no momento · quarta bulha à ausculta, sem sopros · traçado calibrado a 25 mm/s e 10 mm/mV.',
    padrao: 'sve',
    notaTracado: 'Meça a amplitude antes de julgar o ST: R muito alta em V5, com infra descendente e T invertida assimétrica na mesma derivação.',
    decisoes: [
      {
        pergunta: 'Qual é a leitura correta do traçado?',
        alternativas: [
          'Isquemia lateral aguda',
          'Sobrecarga ventricular esquerda com padrão de sobrecarga sistólica (strain)',
          'Bloqueio de ramo esquerdo',
          'Pericardite aguda',
        ],
        correta: 1,
        variavelDecisiva: 'A amplitude do QRS: o infra de ST só pode ser interpretado depois de reconhecer que a voltagem está aumentada.',
        porQue: 'S em V1 somada a R em V5 ou V6 igual ou maior que 35 mm (Sokolow-Lyon), acompanhada de infra descendente com T invertida assimétrica nas derivações esquerdas, define o padrão strain — alteração secundária à hipertrofia.',
        porQueSeduz: 'O strain reproduz a mesma imagem do infra isquêmico. Quem lê o segmento ST antes de olhar a voltagem fecha em isquemia e nunca mais volta atrás.',
        movimento: 'fechamento_precoce',
      },
      {
        pergunta: 'Qual a conduta?',
        alternativas: [
          'Encaminhar ao pronto-socorro para troponina seriada e considerar cateterismo',
          'Otimizar o anti-hipertensivo e solicitar ecocardiograma eletivo',
          'Iniciar dupla antiagregação e anticoagulação',
          'Repetir o ECG em seis meses, sem outra medida',
        ],
        correta: 1,
        variavelDecisiva: 'De onde vem a urgência — do quadro clínico, não do traçado. Aqui o paciente está assintomático e o achado é crônico.',
        porQue: 'O strain da sobrecarga ventricular esquerda é achado crônico. O que muda prognóstico é controlar a pressão; o ecocardiograma define massa e função, e o ECG apenas levanta a hipótese.',
        porQueSeduz: 'A palavra "isquêmica" no laudo automático cria urgência artificial, e mandar ao pronto-socorro parece a atitude segura; ela expõe o paciente a uma cascata de exames por um achado que não mudou nos últimos anos.',
        movimento: 'erro_de_prioridade',
      },
      {
        pergunta: 'Um colega afirma que o critério de voltagem "fecha" hipertrofia ventricular. O que responder?',
        alternativas: [
          'Ele está certo: Sokolow-Lyon igual ou maior que 35 mm é diagnóstico de hipertrofia',
          'Critérios de voltagem têm especificidade alta e sensibilidade baixa, e sofrem influência de biotipo, idade e obesidade — não fecham hipertrofia sozinhos',
          'O critério só vale quando há desvio do eixo para a esquerda',
          'O critério perde toda a validade acima dos 40 anos',
        ],
        correta: 1,
        variavelDecisiva: 'A sensibilidade do critério eletrocardiográfico: o ECG não mede massa ventricular, o ecocardiograma mede.',
        porQue: 'Sokolow-Lyon tem especificidade alta e sensibilidade baixa. Parede torácica fina, idade jovem e treinamento físico geram falso-positivo; obesidade e doença pulmonar geram falso-negativo. Por isso a hipertrofia nunca deve ser diagnosticada apenas pelo ECG.',
        porQueSeduz: 'O número redondo transmite falsa precisão: 35 mm parece uma fronteira diagnóstica quando é apenas um ponto de corte de um teste pouco sensível.',
        movimento: 'erro_de_criterio',
      },
    ],
    fechamento: 'O pivô é a ordem de leitura: voltagem antes de repolarização. Regra de prova: infra descendente com T invertida assimétrica em derivação de R muito alta, num hipertenso crônico assintomático, é strain — não evento agudo.',
    card: 'Sokolow-Lyon: S(V1) + R(V5 ou V6) ≥ 35 mm. Com infra descendente e T invertida assimétrica lateral, é strain — alteração secundária, crônica.',
  },

  /* ==================================================================
     c04 · BRD assintomático em pré-operatório
     ================================================================== */
  {
    id: 'c04',
    titulo: 'Bloqueio de ramo direito encontrado no pré-operatório',
    familia: 'ramo',
    nivel: 'intermediario',
    cenario: 'Ambulatório de avaliação pré-anestésica, colecistectomia eletiva marcada para a semana seguinte.',
    queixa: 'Mulher de 61 anos, sem sintomas cardiovasculares, sobe dois lances de escada sem parar e carrega compras sem dispneia. Vem para liberação de colecistectomia videolaparoscópica.',
    dados: 'PA 128/78 mmHg · FC 72 bpm · SatO₂ 98% · ausculta cardíaca e pulmonar normais · sem edema, sem turgência jugular. No prontuário há um ECG de três anos atrás com exatamente o mesmo padrão.',
    padrao: 'brd',
    notaTracado: 'Olhe V1: QRS alargado com padrão rsR′ e onda T invertida; depois confira a onda S alargada em DI e V6.',
    decisoes: [
      {
        pergunta: 'Qual é o diagnóstico eletrocardiográfico?',
        alternativas: [
          'Bloqueio de ramo esquerdo',
          'Bloqueio de ramo direito',
          'Infarto anterosseptal antigo',
          'Padrão de Brugada tipo 1',
        ],
        correta: 1,
        variavelDecisiva: 'A polaridade do QRS largo em V1: positivo, com orelhas de coelho, aponta ramo direito.',
        porQue: 'QRS igual ou maior que 120 ms com padrão rsR′ em V1 e onda S alargada em DI e V6 é a assinatura do bloqueio de ramo direito.',
        porQueSeduz: 'O bloqueio de ramo esquerdo também alarga o QRS, e ambos aparecem como "QRS largo" na primeira olhada; a regra de bolso do estágio resolve — largo e para cima em V1 é direito, largo e para baixo é esquerdo.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'A onda T invertida em V1 e V2 preocupa?',
        alternativas: [
          'Sim: indica isquemia anterosseptal e exige dosagem de troponina',
          'Não: a inversão de T em V1 e V2 é a discordância esperada do bloqueio de ramo direito',
          'Sim: exige teste ergométrico antes da cirurgia',
          'Só preocupa se houver onda Q associada',
        ],
        correta: 1,
        variavelDecisiva: 'Alteração secundária versus primária da repolarização: no QRS alargado, a onda T acompanha o atraso de condução.',
        porQue: 'No bloqueio de ramo direito a onda T é obrigatoriamente invertida em V1 e V2, por alteração secundária. Chamar isso de isquemia é o erro clássico desse padrão.',
        porQueSeduz: 'T invertida foi ensinada como sinal de isquemia antes de qualquer nuance, e a associação dispara sozinha; o que a desarma é lembrar que a repolarização de um QRS alargado não pode ser lida como a de um QRS estreito.',
        movimento: 'inversao_de_criterio',
      },
      {
        pergunta: 'Qual a conduta em relação à cirurgia?',
        alternativas: [
          'Suspender a cirurgia e encaminhar para estudo eletrofisiológico',
          'Liberar: bloqueio de ramo direito isolado, antigo e assintomático não contraindica nem adia o procedimento',
          'Solicitar implante de marcapasso profilático antes da anestesia',
          'Solicitar cateterismo cardíaco antes da cirurgia',
        ],
        correta: 1,
        variavelDecisiva: 'O par que transforma um achado em problema: o bloqueio é novo ou antigo, e há ou não sintoma.',
        porQue: 'Bloqueio de ramo direito isolado, já presente em traçado de três anos atrás, em paciente com boa capacidade funcional, é achado benigno. Não há indicação de marcapasso nem de investigação isquêmica adicional.',
        porQueSeduz: 'A palavra "bloqueio" evoca risco de parada e puxa a ideia de marcapasso; mas bloqueio de ramo não é bloqueio de condução atrioventricular, e o ventrículo continua sendo despolarizado a cada batimento.',
        movimento: 'ancoragem',
      },
    ],
    fechamento: 'O pivô é o par "novo × antigo, sintomático × assintomático". Regra de prova: bloqueio de ramo direito isolado e antigo é benigno; bloqueio de ramo direito novo com dor torácica ou dispneia muda de categoria e exige investigação.',
    card: 'V1 largo e positivo (rsR′) = bloqueio de ramo direito. T invertida em V1–V2 é discordância esperada, não isquemia.',
  },

  /* ==================================================================
     c05 · Taquicardia supraventricular instável
     ================================================================== */
  {
    id: 'c05',
    titulo: 'Taquicardia regular de 205 bpm com hipotensão',
    familia: 'taqui',
    nivel: 'intermediario',
    cenario: 'Sala de emergência; a paciente entra andando e senta pálida e sudoreica na maca.',
    queixa: 'Mulher de 32 anos, sem cardiopatia conhecida, com palpitações de início súbito há 40 minutos enquanto tomava café. Agora refere dor no peito em aperto e diz que "quase apagou" ao levantar.',
    dados: 'PA 74/40 mmHg · FC 205 bpm · FR 24 irpm · SatO₂ 95% · pálida, sudoreica, sonolenta e pouco responsiva às perguntas · sem uso de medicações · sem asma.',
    padrao: 'tsv',
    notaTracado: 'Taquicardia regular, com todos os QRS iguais e estreitos, sem onda P identificável antes deles.',
    decisoes: [
      {
        pergunta: 'Qual é o ritmo?',
        alternativas: [
          'Taquicardia sinusal',
          'Taquicardia supraventricular',
          'Taquicardia ventricular monomórfica',
          'Fibrilação atrial de alta resposta',
        ],
        correta: 1,
        variavelDecisiva: 'As duas medidas que ordenam qualquer taquiarritmia: a largura do QRS e a regularidade do RR.',
        porQue: 'QRS estreito, abaixo de 120 ms, RR rigorosamente regular, frequência fixa em torno de 200 bpm e início súbito definem taquicardia supraventricular.',
        porQueSeduz: 'A taquicardia sinusal também é regular e de QRS estreito; a diferença está no início súbito, na ausência de onda P e no fato de 205 bpm ultrapassar o teto esperado para a idade (220 − 32 = 188).',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Qual é a conduta imediata?',
        alternativas: [
          'Manobra vagal de Valsalva modificada e, se falhar, adenosina 6 mg IV em bólus rápido',
          'Cardioversão elétrica sincronizada, com sedação e analgesia prévias',
          'Amiodarona 150 mg IV em 10 minutos',
          'Verapamil intravenoso para controle de frequência',
        ],
        correta: 1,
        variavelDecisiva: 'A estabilidade hemodinâmica, não o nome da arritmia: PA 74/40 mmHg com rebaixamento do sensório e dor isquêmica é instabilidade.',
        porQue: 'Há hipotensão, alteração aguda do estado mental e desconforto torácico isquêmico com FC acima de 150 bpm, atribuíveis à arritmia. O tratamento é cardioversão elétrica sincronizada, precedida de sedação no paciente consciente.',
        porQueSeduz: 'Manobra vagal seguida de adenosina é a resposta certa para a TSV estável e está colada ao diagnóstico na memória; a alternativa erra o eixo da decisão, que aqui não é o ritmo e sim a instabilidade.',
        movimento: 'erro_de_prioridade',
      },
      {
        pergunta: 'Após o primeiro choque sincronizado o ritmo persiste. O que conferir antes do segundo?',
        alternativas: [
          'Mudar para modo não sincronizado',
          'Confirmar que o botão SYNC voltou a estar ativo e que há marcador sobre cada onda R',
          'Aumentar o ganho e chocar sem sincronizar',
          'Administrar adenosina antes de um novo choque',
        ],
        correta: 1,
        variavelDecisiva: 'O comportamento do aparelho: a maioria dos desfibriladores volta sozinha ao modo não sincronizado depois de cada choque.',
        porQue: 'O manual de ACLS obriga a reativar o SYNC após cada choque e a ajustar o ganho até aparecer um marcador sobre cada onda R. Se o pico de R não for reconhecido, o choque simplesmente não é liberado.',
        porQueSeduz: 'Passar para o modo não sincronizado parece resolver o impasse por força bruta; num ritmo organizado com pulso, o choque fora do sincronismo pode cair na onda T e induzir fibrilação ventricular.',
        movimento: 'erro_de_conduta',
      },
    ],
    fechamento: 'O pivô é a instabilidade, não a etiqueta do ritmo. Regra de prova: TSV, fibrilação atrial, flutter e TV monomórfica com pulso instáveis levam choque SINCRONIZADO; o ritmo polimórfico e o paciente sem pulso levam choque não sincronizado.',
    card: 'Taquicardia regular + QRS estreito + P ausente = TSV. Instável: cardioversão sincronizada com sedação. Estável: Valsalva modificada → adenosina 6 mg, depois 12 mg.',
  },

  /* ==================================================================
     c06 · Flutter atrial 2:1
     ================================================================== */
  {
    id: 'c06',
    titulo: 'Taquicardia regular de 150 bpm que não cede à manobra vagal',
    familia: 'taqui',
    nivel: 'intermediario',
    cenario: 'Enfermaria de clínica médica, terceiro dia de internação por exacerbação de DPOC.',
    queixa: 'Homem de 69 anos, tabagista de longa data, com palpitação regular e cansaço iniciados há cerca de seis horas. Sem dor torácica e sem síncope.',
    dados: 'PA 118/72 mmHg · FC 150 bpm, notavelmente fixa · FR 22 irpm · SatO₂ 93% com cateter nasal · lúcido, bem perfundido, sem sinais de má perfusão · sem uso de digoxina.',
    padrao: 'flutter',
    notaTracado: 'Procure a linha de base entre os QRS em DII: ela não fica isoelétrica, e sim serrilhada, em dente de serra.',
    decisoes: [
      {
        pergunta: 'Qual é o diagnóstico?',
        alternativas: [
          'Taquicardia supraventricular por reentrada nodal',
          'Flutter atrial com condução 2:1',
          'Fibrilação atrial',
          'Taquicardia sinusal',
        ],
        correta: 1,
        variavelDecisiva: 'A atividade atrial entre os QRS: ondas F contínuas em dente de serra, sem linha isoelétrica, a cerca de 300 por minuto.',
        porQue: 'Frequência ventricular fixa em 150 bpm com atividade atrial regular em torno de 300 por minuto corresponde à condução 2:1 do flutter típico, mais bem vista em DII, DIII e aVF.',
        porQueSeduz: 'A TSV também é regular, estreita e frequentemente próxima de 150 bpm; o que separa as duas é a linha de base — isoelétrica na TSV, serrilhada no flutter.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Ele está estável e a manobra vagal não reverteu. Qual é o papel da adenosina aqui?',
        alternativas: [
          'Nenhum: a adenosina está formalmente contraindicada no flutter',
          'Uso diagnóstico: freia o nó AV e desmascara as ondas F, mesmo sem reverter o ritmo',
          'Uso terapêutico: reverte o flutter em cerca de 90% dos casos',
          'Está proibida em qualquer pneumopata, sem exceção',
        ],
        correta: 1,
        variavelDecisiva: 'O que a adenosina faz mecanicamente: bloqueia transitoriamente o nó AV, e não interrompe circuitos que não passam por ele.',
        porQue: 'A adenosina não termina flutter nem fibrilação atrial, mas retarda a condução atrioventricular e permite enxergar as ondas F ou f. É uso diagnóstico reconhecido. A cautela com broncoespasmo em asma e DPOC é real e deve pesar na decisão, mas não equivale a proibição absoluta em todo pneumopata.',
        porQueSeduz: 'A associação "taquicardia supraventricular reverte com adenosina" é automática; o flutter é justamente a exceção que separa quem entendeu o mecanismo de quem decorou o par droga-arritmia.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Sobre o risco embólico do flutter, o que é correto?',
        alternativas: [
          'Flutter não gera trombo atrial e dispensa anticoagulação',
          'Segue a mesma lógica de anticoagulação da fibrilação atrial',
          'Só se anticoagula quando a resposta ventricular é irregular',
          'Só se anticoagula quando há disfunção ventricular associada',
        ],
        correta: 1,
        variavelDecisiva: 'A régua usada para decidir: risco embólico calculado, e não o nome da arritmia.',
        porQue: 'A conduta antitrombótica do flutter segue a da fibrilação atrial, inclusive a exigência de anticoagulação adequada ou ecocardiograma transesofágico antes de cardioversão eletiva quando a duração ultrapassa 48 horas ou é indeterminada. No flutter típico, a ablação do istmo cavotricuspídeo tem alta taxa de cura.',
        porQueSeduz: 'Como o flutter mantém atividade atrial organizada, é intuitivo supor que o átrio ainda contrai e não forma trombo; a organização elétrica não garante contração mecânica eficaz.',
        movimento: 'erro_de_conduta',
      },
    ],
    fechamento: 'O pivô é a linha de base entre os QRS. Regra de prova: toda taquicardia regular e estreita em torno de 150 bpm deve levantar suspeita de flutter 2:1 até que se demonstre linha de base isoelétrica.',
    card: 'FC ventricular fixa em ~150 + dente de serra sem linha isoelétrica = flutter 2:1. Adenosina desmascara, não reverte. Anticoagulação com a régua da FA.',
  },

  /* ==================================================================
     c07 · Fibrilação atrial de início indeterminado
     ================================================================== */
  {
    id: 'c07',
    titulo: 'Fibrilação atrial de duração desconhecida em paciente estável',
    familia: 'taqui',
    nivel: 'intermediario',
    cenario: 'Pronto-socorro, tarde de sábado; o paciente veio por conta própria, andando.',
    queixa: 'Homem de 71 anos, hipertenso e diabético, relata o coração "descompassado" percebido hoje pela manhã, mas conta que já sentia cansaço aos esforços há umas duas semanas. Não sabe dizer quando começou.',
    dados: 'PA 134/84 mmHg · FC média 116 bpm, irregular · FR 18 irpm · SatO₂ 96% · lúcido, bem perfundido, sem dor torácica e sem dispneia em repouso · não usa anticoagulante · sem AVC prévio · sem insuficiência cardíaca conhecida.',
    padrao: 'fa',
    notaTracado: 'Compare três intervalos RR consecutivos: nenhum se repete, e não há onda P organizada antes de nenhum QRS.',
    decisoes: [
      {
        pergunta: 'Qual é o ritmo?',
        alternativas: [
          'Fibrilação atrial',
          'Flutter atrial com condução variável',
          'Taquicardia atrial multifocal',
          'Taquicardia sinusal com extrassístoles frequentes',
        ],
        correta: 0,
        variavelDecisiva: 'A combinação de ausência total de onda P organizada com RR irregularmente irregular.',
        porQue: 'Não há onda P — a linha de base ondula finamente — e o RR não tem padrão previsível. Isso define fibrilação atrial.',
        porQueSeduz: 'Flutter com condução variável e taquicardia atrial multifocal também são irregulares, e por isso são os distratores preferidos da banca; ambos, porém, têm atividade atrial organizada e identificável (ondas F em dente de serra; três ou mais morfologias de P).',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Como calcular a frequência cardíaca neste traçado?',
        alternativas: [
          '1500 dividido pelo número de quadradinhos entre dois R',
          '300 dividido pelo número de quadradões entre dois R',
          'Contar os QRS em 6 segundos e multiplicar por 10',
          'Medir o intervalo PR e derivar a frequência atrial',
        ],
        correta: 2,
        variavelDecisiva: 'A regularidade do ritmo — as duas fórmulas de RR pressupõem intervalos constantes.',
        porQue: 'Em ritmo irregular o RR muda a cada batimento, e as fórmulas de divisão dão resultados diferentes conforme o par de complexos escolhido. A contagem dos QRS em 6 segundos multiplicada por 10 é o método válido.',
        porQueSeduz: 'As fórmulas de 1500 e de 300 são as mais treinadas e vêm à mão automaticamente; elas estão corretas, apenas não neste ritmo.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Ele está estável e pergunta se dá para "botar no ritmo hoje". O que decide?',
        alternativas: [
          'Pode cardioverter agora, porque está estável e sintomático',
          'Como a duração é indeterminada, a cardioversão eletiva exige anticoagulação prévia adequada ou ecocardiograma transesofágico que exclua trombo',
          'Pode cardioverter após uma dose de heparina de baixo peso molecular',
          'Só se cardioverte se a frequência não responder a betabloqueador',
        ],
        correta: 1,
        variavelDecisiva: 'O tempo de início da arritmia — acima de 48 horas ou desconhecido, o risco é embolizar um trombo já formado.',
        porQue: 'Com duração igual ou maior que 48 horas, ou indeterminada, a cardioversão eletiva exige anticoagulação terapêutica por cerca de três semanas antes, ou ecocardiograma transesofágico que exclua trombo em átrio esquerdo; depois da cardioversão, mantém-se anticoagulação por pelo menos quatro semanas. Registre a divergência de fontes: as Diretrizes de 2024 para o manejo da fibrilação atrial da Sociedade Europeia de Cardiologia com a Associação Europeia de Cirurgia Cardiotorácica (ESC/EACTS 2024, European Heart Journal) reduziram esse limiar de 48 para 24 horas.',
        porQueSeduz: 'A estabilidade hemodinâmica é lida como permissão para cardioverter; ela autoriza escolher o momento com calma, não dispensa a proteção contra embolia.',
        movimento: 'erro_de_conduta',
      },
      {
        pergunta: 'O que define a anticoagulação de longo prazo?',
        alternativas: [
          'A frequência cardíaca estar acima de 110 bpm',
          'A intensidade dos sintomas relatados',
          'O escore de risco tromboembólico (CHA₂DS₂-VASc), e não a frequência nem os sintomas',
          'Não anticoagular, já que ele nunca teve AVC',
        ],
        correta: 2,
        variavelDecisiva: 'O que entra no cálculo do risco embólico — comorbidades e idade, não a apresentação da arritmia.',
        porQue: 'A anticoagulação é a decisão que mais muda prognóstico na fibrilação atrial e é definida por escore. Este paciente soma hipertensão, diabetes e idade entre 65 e 74 anos: três pontos, acima do limiar de indicação para homens. Nota de atualização: as Diretrizes ESC/EACTS de 2024 para fibrilação atrial passaram a usar o CHA₂DS₂-VA, que retira a categoria sexo.',
        porQueSeduz: 'Sintoma e frequência são o que o paciente traz e o que o monitor mostra, e por isso parecem os dados mais concretos; nenhum dos dois entra no cálculo do risco de AVC.',
        movimento: 'erro_de_prioridade',
      },
    ],
    fechamento: 'O pivô é o tempo de início, não a frequência. Regra de prova: fibrilação atrial com mais de 48 horas ou de duração desconhecida não se cardioverte eletivamente sem anticoagulação adequada ou ecocardiograma transesofágico.',
    card: 'FA = sem onda P + RR irregularmente irregular. FC por contagem em 6 s × 10. Cardioversão eletiva só com proteção antitrombótica; anticoagulação crônica por escore.',
  },

  /* ==================================================================
     c08 · Taquicardia estável de QRS largo
     ================================================================== */
  {
    id: 'c08',
    titulo: 'Taquicardia de QRS largo em paciente com infarto prévio',
    familia: 'taqui',
    nivel: 'avancado',
    cenario: 'Pronto-socorro; chegou de carro, dirigido pela esposa, sem acionar ambulância.',
    queixa: 'Homem de 66 anos, com infarto anterior há quatro anos e fração de ejeção de 38%, refere palpitações rápidas há uma hora, com leve tontura. Sem dor torácica e sem dispneia.',
    dados: 'PA 126/76 mmHg · FC 168 bpm · FR 18 irpm · SatO₂ 97% · lúcido, orientado, bem perfundido · K 4,4 mEq/L · QTc do ECG prévio: 430 ms · em uso de losartana e sinvastatina.',
    padrao: 'tv',
    notaTracado: 'Meça a largura do QRS e compare a forma dos complexos entre si: todos largos, todos idênticos, com RR regular.',
    decisoes: [
      {
        pergunta: 'Qual é o diagnóstico mais provável?',
        alternativas: [
          'Taquicardia ventricular monomórfica',
          'Taquicardia supraventricular com aberrância de condução',
          'Fibrilação atrial pré-excitada',
          'Flutter atrial 2:1 com bloqueio de ramo',
        ],
        correta: 0,
        variavelDecisiva: 'A probabilidade pré-teste dada pela cardiopatia estrutural: QRS largo em quem já infartou é taquicardia ventricular até prova em contrário.',
        porQue: 'QRS largo, regular e monomórfico em paciente com infarto prévio e disfunção ventricular: a maioria esmagadora desses casos é taquicardia ventricular. Dissociação AV, batimentos de captura e de fusão, quando presentes, são praticamente diagnósticos.',
        porQueSeduz: 'A TSV com aberrância produz um traçado praticamente idêntico e é o distrator fixo da banca; a diferença não está na forma do complexo, e sim no contexto clínico e no custo de errar — tratar TV como TSV pode degenerar em fibrilação ventricular.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Ele está estável. Qual é a conduta?',
        alternativas: [
          'Verapamil intravenoso, por se tratar de taquicardia regular',
          'Cardioversão elétrica sincronizada imediata',
          'Antiarrítmico intravenoso — procainamida, amiodarona ou sotalol — com material de cardioversão preparado',
          'Adenosina 6 mg como teste terapêutico, seguida de digoxina',
        ],
        correta: 2,
        variavelDecisiva: 'A estabilidade hemodinâmica: com pulso e estável há tempo para droga; sem pulso ou instável, é choque.',
        porQue: 'Em taquicardia de QRS largo monomórfica e estável, o ACLS coloca procainamida, amiodarona e sotalol em pé de igualdade, sempre com o desfibrilador ao lado. Procainamida e sotalol devem ser evitados quando o QT é prolongado — aqui o QTc prévio é normal.',
        porQueSeduz: 'Verapamil funciona bem em taquicardia regular de QRS estreito e a memória transfere a regra pela palavra "regular"; em QRS largo ele pode precipitar colapso hemodinâmico e é justamente a droga a evitar.',
        movimento: 'erro_de_conduta',
      },
      {
        pergunta: 'Um residente afirma: "adenosina nunca, em nenhuma hipótese, em QRS largo". Qual é a formulação correta?',
        alternativas: [
          'Ele está certo: a adenosina é proibida em qualquer taquicardia de QRS largo',
          'Bloqueador de nó AV do tipo verapamil ou diltiazem é que deve ser evitado sempre; a adenosina pode ser considerada quando a taquicardia de QRS largo é regular e monomórfica e há dúvida diagnóstica',
          'A adenosina é a primeira escolha em qualquer QRS largo estável',
          'A adenosina só é proibida se o paciente for asmático',
        ],
        correta: 1,
        variavelDecisiva: 'A regularidade e a monomorfia do QRS largo — é isso que separa o uso admissível da adenosina do uso perigoso.',
        porQue: 'A regra de bolso existe porque o erro que ela previne é grave. Formalmente, a adenosina pode ser considerada em taquicardia de QRS largo regular e monomórfica de etiologia incerta, com valor diagnóstico e terapêutico; é proibida se o ritmo for irregular ou polimórfico e na fibrilação atrial pré-excitada. Verapamil e diltiazem, esses sim, devem ser evitados em QRS largo.',
        porQueSeduz: 'O enunciado absoluto é mais fácil de decorar e quase sempre conduz à atitude segura — por isso ele sobrevive; ele é falso como enunciado, e uma banca que pede a formulação correta cobra exatamente a exceção.',
        movimento: 'inversao_de_criterio',
      },
      {
        pergunta: 'Durante o preparo da droga a PA cai para 70/40 mmHg e ele fica sonolento. Conduta?',
        alternativas: [
          'Cardioversão elétrica sincronizada imediata, com sedação se houver tempo',
          'Desfibrilação não sincronizada',
          'Aumentar a velocidade de infusão da amiodarona',
          'Iniciar noradrenalina e manter o antiarrítmico',
        ],
        correta: 0,
        variavelDecisiva: 'Monomórfica e com pulso: existe onda R para o aparelho marcar, portanto o choque é sincronizado.',
        porQue: 'Taquicardia ventricular monomórfica com pulso que se torna instável é indicação de cardioversão sincronizada. O choque não sincronizado fica para a TV sem pulso e para a taquicardia polimórfica, em que o aparelho não consegue marcar a onda R.',
        porQueSeduz: 'Depois de aprender que "polimórfica instável leva choque não sincronizado", é fácil generalizar a exceção para toda TV instável — a inversão exata do critério.',
        movimento: 'inversao_de_criterio',
      },
    ],
    fechamento: 'O pivô é duplo: a largura do QRS define a família e a estabilidade define a rota. Regra de prova: QRS largo em cardiopata é TV até prova em contrário; monomórfica instável leva choque sincronizado, polimórfica leva não sincronizado.',
    card: 'Taquicardia regular de QRS largo = TV até prova em contrário. Estável: procainamida, amiodarona ou sotalol. Instável e monomórfica: choque sincronizado. Nunca verapamil.',
  },

  /* ==================================================================
     c09 · BAV de 2º grau Mobitz II
     ================================================================== */
  {
    id: 'c09',
    titulo: 'Pausas no monitor no segundo dia de internação por infarto',
    familia: 'bav',
    nivel: 'avancado',
    cenario: 'Unidade coronariana, segundo dia de internação por infarto anterior tratado com angioplastia primária.',
    queixa: 'Homem de 58 anos refere dois episódios de escurecimento visual ao sentar na cama, sem dor torácica. A enfermagem registrou "falhas" no monitor durante a noite.',
    dados: 'PA 104/64 mmHg · FC média 44 bpm, com pausas · SatO₂ 97% · lúcido, discretamente pálido · K 4,1 mEq/L · sem betabloqueador nas últimas 24 horas · troponina em queda.',
    padrao: 'mobitz2',
    notaTracado: 'Meça o PR dos batimentos conduzidos que antecedem a falha: são todos iguais — e então uma onda P simplesmente não conduz.',
    decisoes: [
      {
        pergunta: 'Qual é o diagnóstico?',
        alternativas: [
          'BAV de 2º grau Mobitz I (Wenckebach)',
          'BAV de 2º grau Mobitz II',
          'BAV de 1º grau',
          'BAV total',
        ],
        correta: 1,
        variavelDecisiva: 'O comportamento do intervalo PR nos batimentos que precedem a falha: fixo aponta Mobitz II, crescente aponta Mobitz I.',
        porQue: 'O PR é constante em todos os batimentos conduzidos e uma onda P deixa de conduzir sem qualquer alongamento prévio. Essa é a assinatura do bloqueio infranodal.',
        porQueSeduz: 'Wenckebach é o BAV de 2º grau mais frequente e mais lembrado, e ambos "perdem batimento"; a única coisa que os separa é medir o PR de três batimentos consecutivos antes da falha.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Onde está o bloqueio e o que isso muda?',
        alternativas: [
          'No nó AV; prognóstico bom e boa resposta à atropina',
          'No sistema His-Purkinje; risco de progressão súbita para bloqueio total e má resposta à atropina',
          'No nó sinusal; a conduta é observação',
          'Na junção atrioventricular; responde a manobra vagal',
        ],
        correta: 1,
        variavelDecisiva: 'A topografia do bloqueio — nodal ou infranodal — é o que define prognóstico e resposta a droga.',
        porQue: 'O Mobitz II é predominantemente infranodal, no feixe de His e nos ramos. O nó AV recebe inervação vagal abundante e responde à atropina; o His-Purkinje, não. Daí a indicação formal de marcapasso e o risco real de evolução para bloqueio total.',
        porQueSeduz: 'A expressão "bloqueio atrioventricular" faz pensar automaticamente no nó AV, já que é ele que dá nome ao grupo; a maior parte dos Mobitz II acontece abaixo dele.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'A PA cai para 78/45 mmHg e ele fica sonolento. Qual é a primeira medida?',
        alternativas: [
          'Atropina 1 mg IV, repetindo até 3 mg antes de qualquer outra medida',
          'Marcapasso transcutâneo imediato, com analgesia e sedação, e catecolamina em infusão como ponte',
          'Cardioversão elétrica sincronizada',
          'Adenosina para desmascarar a condução',
        ],
        correta: 1,
        variavelDecisiva: 'A ineficácia da atropina no bloqueio infranodal — insistir nela custa tempo e pode agravar o bloqueio.',
        porQue: 'Em Mobitz II ou bloqueio total instáveis, o ACLS e o guia do curso orientam ir direto ao marcapasso transcutâneo. A atropina acelera o átrio sem melhorar a condução abaixo do nó e pode aumentar o grau de bloqueio. Dopamina 5–20 mcg/kg/min ou adrenalina 2–10 mcg/min servem de ponte.',
        porQueSeduz: 'O algoritmo de bradicardia começa por atropina, e essa sequência é decorada como se fosse universal; a exceção do bloqueio infranodal está marcada como pegadinha explícita no guia do curso.',
        movimento: 'erro_de_prioridade',
      },
      {
        pergunta: 'Antes de indicar marcapasso definitivo, o que é obrigatório?',
        alternativas: [
          'Repetir o ECG em 24 horas',
          'Excluir causas reversíveis: drogas que freiam o nó, hipercalemia, isquemia aguda em curso e hipotireoidismo',
          'Aguardar a normalização completa da troponina',
          'Solicitar teste ergométrico',
        ],
        correta: 1,
        variavelDecisiva: 'A reversibilidade da causa — implantar marcapasso em bloqueio produzido por droga ou eletrólito é erro de indicação.',
        porQue: 'Betabloqueador, verapamil, diltiazem, digoxina e amiodarona, além de hipercalemia, isquemia aguda e hipotireoidismo, produzem bloqueio que pode reverter com o tratamento da causa.',
        porQueSeduz: 'O Mobitz II tem indicação formal de marcapasso, e essa frase, decorada isolada, faz pular a etapa de procurar o que está causando o bloqueio.',
        movimento: 'erro_de_prioridade',
      },
    ],
    fechamento: 'O pivô é o PR fixo antes da falha e o que ele revela sobre a topografia. Regra de prova: bloqueio infranodal não responde a atropina — em Mobitz II e bloqueio total instáveis, vá direto ao marcapasso transcutâneo.',
    card: 'PR fixo + queda súbita de QRS = Mobitz II, infranodal. Atropina não resolve. Marcapasso — depois de excluir causa reversível.',
  },

  /* ==================================================================
     c10 · BAV total em chagásico
     ================================================================== */
  {
    id: 'c10',
    titulo: 'Síncope recorrente em paciente com sorologia positiva para Chagas',
    familia: 'bav',
    nivel: 'avancado',
    cenario: 'Pronto-socorro de hospital regional; paciente trazido pelo filho após o terceiro desmaio do mês.',
    queixa: 'Homem de 52 anos, natural do sertão, refere desmaios súbitos sem pródromo e sem confusão depois do evento, com recuperação em menos de um minuto. Traz cartão de saúde com sorologia positiva para doença de Chagas.',
    dados: 'PA 96/58 mmHg · FC 34 bpm · FR 16 irpm · SatO₂ 97% · lentificado, sem sinais de congestão · K 4,0 mEq/L · função renal normal · não usa betabloqueador, digoxina nem bloqueador de canal de cálcio.',
    padrao: 'bavt',
    notaTracado: 'Marque as ondas P ao longo da tira: elas marcham regulares no ritmo delas, os QRS marcham regulares no ritmo deles, e não há relação entre os dois grupos.',
    decisoes: [
      {
        pergunta: 'Qual é o diagnóstico?',
        alternativas: [
          'BAV de 2º grau Mobitz II com condução 3:1',
          'BAV total, com dissociação atrioventricular',
          'Bradicardia sinusal com extrassístoles atriais bloqueadas',
          'Ritmo juncional de escape',
        ],
        correta: 1,
        variavelDecisiva: 'Existe alguma relação fixa entre P e QRS na tira inteira? Se nenhuma P se relaciona com nenhum QRS, o bloqueio é completo.',
        porQue: 'As ondas P são regulares entre si, os QRS são regulares entre si, a frequência atrial é maior que a ventricular e não há PR mensurável: dissociação atrioventricular completa.',
        porQueSeduz: 'No Mobitz II avançado ainda existe alguma P que conduz, com PR fixo; aqui não há nenhuma. Distinguir exige percorrer a tira inteira, e não olhar dois batimentos.',
        movimento: 'fechamento_precoce',
      },
      {
        pergunta: 'Qual dado do caso mais altera a hipótese etiológica?',
        alternativas: [
          'A idade de 52 anos',
          'A sorologia positiva para doença de Chagas em paciente sem outra cardiopatia aparente',
          'A pressão arterial de 96/58 mmHg',
          'A ausência de pródromo nos desmaios',
        ],
        correta: 1,
        variavelDecisiva: 'A epidemiologia brasileira: Chagas é causa clássica de bloqueio avançado em adulto jovem sem outra cardiopatia.',
        porQue: 'A cardiopatia chagásica crônica acomete o sistema de condução e produz bloqueios atrioventriculares avançados, além do padrão clássico de bloqueio de ramo direito associado a hemibloqueio anterior esquerdo.',
        porQueSeduz: 'A ausência de pródromo é dado clínico forte e aponta corretamente para síncope de origem cardíaca — mas responde a outra pergunta: ela caracteriza o mecanismo da síncope, não a etiologia do bloqueio.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Qual é a conduta?',
        alternativas: [
          'Atropina 1 mg IV até 3 mg como primeira linha, com marcapasso apenas se falhar',
          'Marcapasso transcutâneo com sedação e analgesia, catecolamina em infusão como ponte, e marcapasso transvenoso seguido do definitivo',
          'Observação em monitor, já que ele está lúcido',
          'Cardioversão elétrica sincronizada',
        ],
        correta: 1,
        variavelDecisiva: 'A combinação de instabilidade com bloqueio infranodal: síncope recorrente e FC de 34 bpm não admitem tempo gasto com droga ineficaz.',
        porQue: 'Bloqueio total com escape lento e síncope recorrente é emergência: estimulação transcutânea imediata como ponte, seguida de marcapasso transvenoso e depois definitivo. A atropina não age abaixo do nó AV.',
        porQueSeduz: 'Ele está lúcido e conversando, e isso sugere estabilidade; síncope recorrente por bradiarritmia é, por definição, instabilidade — só que intermitente, e o próximo episódio pode não reverter sozinho.',
        movimento: 'erro_de_prioridade',
      },
      {
        pergunta: 'O QRS do escape é largo. O que isso informa?',
        alternativas: [
          'Que existe bloqueio de ramo associado, sem outro significado',
          'Que o marcapasso subsidiário é ventricular — mais lento e menos confiável do que o escape juncional, de QRS estreito',
          'Que há hipercalemia associada',
          'Que o bloqueio é supra-hissiano',
        ],
        correta: 1,
        variavelDecisiva: 'A largura do QRS do escape indica a altura do foco: quanto mais baixo o foco, mais lento e mais instável o ritmo.',
        porQue: 'O escape juncional é de QRS estreito, com frequência de 40 a 60 bpm; o escape ventricular é de QRS largo, mais lento e sujeito a falhar, o que aumenta a urgência da estimulação.',
        porQueSeduz: 'Atribuir todo QRS largo a bloqueio de ramo é o reflexo mais treinado; num ritmo de escape, a largura informa primeiro a origem do batimento, e só depois eventuais alterações de condução.',
        movimento: 'erro_de_criterio',
      },
    ],
    fechamento: 'O pivô é a ausência de qualquer relação P→QRS ao longo da tira inteira. Regra de prova: bloqueio total com escape largo e síncope é emergência de marcapasso — e no Brasil, em adulto jovem sem outra cardiopatia, pense em Chagas.',
    card: 'P regulares + QRS regulares + nenhuma relação entre eles = BAV total. Escape largo = foco ventricular = mais instável. Marcapasso, não atropina.',
  },

  /* ==================================================================
     c11 · Hipercalemia em doente renal
     ================================================================== */
  {
    id: 'c11',
    titulo: 'Onda T alta em paciente que faltou às sessões de hemodiálise',
    familia: 'eletrolito',
    nivel: 'avancado',
    cenario: 'Pronto-socorro, segunda-feira de manhã; a paciente perdeu as duas últimas sessões de diálise.',
    queixa: 'Mulher de 47 anos, em hemodiálise há três anos, com fraqueza muscular progressiva nas pernas e formigamento nas mãos desde ontem. Sem dor torácica e sem dispneia.',
    dados: 'PA 148/88 mmHg · FC 66 bpm · FR 18 irpm · SatO₂ 97% · força muscular grau 4 em membros inferiores · K 7,4 mEq/L · creatinina 8,9 mg/dL · pH 7,26 · anúrica · em uso de captopril e espironolactona.',
    padrao: 'hipercalemia',
    notaTracado: 'Compare o formato da onda T com o do traçado normal: aqui ela é alta, estreita, simétrica e de base estreita — e a onda P já está achatada.',
    decisoes: [
      {
        pergunta: 'Qual é a leitura do traçado?',
        alternativas: [
          'Isquemia com onda T hiperaguda',
          'Hipercalemia com repercussão eletrocardiográfica',
          'Repolarização precoce',
          'Hipocalemia',
        ],
        correta: 1,
        variavelDecisiva: 'A geometria da onda T: simétrica e de base estreita aponta potássio; larga e assimétrica aponta isquemia.',
        porQue: 'Onda T alta, estreita e simétrica, com achatamento da onda P e alargamento do PR e do QRS, em paciente renal crônica com potássio de 7,4 mEq/L, define hipercalemia com repercussão elétrica.',
        porQueSeduz: 'A onda T hiperaguda da oclusão coronária precoce também é alta e chama a atenção da mesma forma; ela é larga, de base ampla e assimétrica, e vem acompanhada de dor torácica — dois discriminadores que este caso não oferece.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Qual é a primeira medida?',
        alternativas: [
          'Insulina regular com glicose intravenosa',
          'Gluconato de cálcio intravenoso',
          'Hemodiálise de urgência',
          'Resina de troca por via oral',
        ],
        correta: 1,
        variavelDecisiva: 'A presença de alteração eletrocardiográfica: com o ECG já alterado, a prioridade é estabilizar a membrana, não baixar o potássio.',
        porQue: 'A sequência é estabilizar a membrana com cálcio, depois deslocar o potássio para dentro da célula com insulina e glicose e beta-2 inalatório, e por fim removê-lo com diurético, quelante ou diálise. O cálcio não reduz o potássio — protege o miocárdio enquanto o resto age.',
        porQueSeduz: 'Insulina com glicose de fato baixa o potássio e parece atacar o problema de origem; leva de 15 a 30 minutos para agir, e é nesse intervalo que a arritmia acontece.',
        movimento: 'erro_de_prioridade',
      },
      {
        pergunta: 'Ela é anúrica e está em programa dialítico. Qual é a medida definitiva?',
        alternativas: [
          'Diurético de alça em dose alta',
          'Hemodiálise',
          'Bicarbonato de sódio isolado',
          'Repetir gluconato de cálcio a cada hora',
        ],
        correta: 1,
        variavelDecisiva: 'A via de eliminação disponível: sem função renal residual, nenhum diurético remove potássio.',
        porQue: 'Em paciente anúrica em programa dialítico, a remoção efetiva do potássio é a diálise. O bicarbonato não é eficaz como monoterapia e o diurético de alça depende de função renal residual.',
        porQueSeduz: 'Diurético de alça aparece em toda lista de tratamento da hipercalemia e por isso soa correto; a lista pressupõe rim funcionante, que é exatamente o que esta paciente não tem.',
        movimento: 'erro_de_conduta',
      },
      {
        pergunta: 'Dias depois, outro paciente renal chega bradicárdico a 40 bpm com BAV de 2º grau. Qual exame não pode faltar antes de discutir marcapasso?',
        alternativas: [
          'Ecocardiograma',
          'Potássio sérico',
          'Holter de 24 horas',
          'Teste ergométrico',
        ],
        correta: 1,
        variavelDecisiva: 'A existência de causa reversível: hipercalemia produz bloqueio atrioventricular e reverte com tratamento.',
        porQue: 'A hipercalemia é causa reversível reconhecida de bradiarritmia e de bloqueio atrioventricular. Indicar marcapasso definitivo sem dosar potássio é erro de indicação.',
        porQueSeduz: 'O ecocardiograma parece o exame cardiológico "completo" e é pedido por reflexo; ele descreve estrutura e função, e não identifica a causa metabólica que está produzindo o bloqueio agora.',
        movimento: 'erro_de_prioridade',
      },
    ],
    fechamento: 'O pivô é a geometria da onda T somada ao contexto renal. Regra de prova: com ECG já alterado, cálcio primeiro — e potássio é obrigatório antes de qualquer discussão de marcapasso.',
    card: 'T alta, estreita e simétrica + P achatada + QRS alargando = hipercalemia. Cálcio → insulina com glicose e beta-2 → diálise.',
  },

  /* ==================================================================
     c12 · Síncope com QT longo
     ================================================================== */
  {
    id: 'c12',
    titulo: 'Síncope em paciente que iniciou dois medicamentos na semana passada',
    familia: 'outros',
    nivel: 'avancado',
    cenario: 'Pronto-socorro; paciente trazida pela filha após desmaio presenciado na cozinha de casa.',
    queixa: 'Mulher de 63 anos desmaiou sem aviso, ficou pálida e enrijecida por alguns segundos e acordou orientada, sem confusão. Iniciou hidroclorotiazida e um antibiótico macrolídeo há sete dias, e já usava um antiemético.',
    dados: 'PA 118/72 mmHg · FC 62 bpm · SatO₂ 98% · exame neurológico normal, sem sinais focais, sem mordedura de língua · K 3,0 mEq/L · Mg 1,4 mg/dL · troponina negativa.',
    padrao: 'qtLongo',
    notaTracado: 'Meça do início do QRS ao fim da onda T na derivação em que a T termina de forma mais nítida: o segmento ST está alongado e a T aparece tarde.',
    decisoes: [
      {
        pergunta: 'Qual é o achado eletrocardiográfico?',
        alternativas: [
          'Intervalo QT prolongado',
          'Bloqueio de ramo esquerdo',
          'Isquemia subendocárdica',
          'ECG normal para a frequência',
        ],
        correta: 0,
        variavelDecisiva: 'O QT medido e depois corrigido pela frequência — não a impressão visual de "onda T afastada".',
        porQue: 'O segmento ST está alongado, com onda T de aparecimento tardio, e o QT corrigido ultrapassa o limite. A correção pela frequência é obrigatória antes de concluir qualquer coisa sobre o QT.',
        porQueSeduz: 'Chamar de normal é tentador porque o ritmo é sinusal, a frequência é normal e o QRS é estreito: tudo o que se checa primeiro está em ordem, e o QT é o passo que mais se pula.',
        movimento: 'fechamento_precoce',
      },
      {
        pergunta: 'O QTc calculado foi de 468 ms. O traçado é normal?',
        alternativas: [
          'Sim, é normal em qualquer convenção',
          'Depende da convenção: pelo Guia OSCE do curso (450 ms em homens, 460 ms em mulheres) está prolongado; pela Diretriz da SBC de 2022 (450 ms em homens, 470 ms em mulheres) está no limite superior',
          'Não: qualquer QTc acima de 440 ms é prolongado',
          'Sim, porque só acima de 500 ms existe significado clínico',
        ],
        correta: 1,
        variavelDecisiva: 'Qual convenção de corte está em uso — a divergência entre a diretriz nacional e o guia do curso muda a resposta exatamente neste valor.',
        porQue: 'A Diretriz da SBC de 2022 define QTc normal até 450 ms em homens e 470 ms em mulheres; o Guia OSCE que circula no curso usa 450 e 460. Um QTc de 468 ms em mulher é prolongado por uma régua e limítrofe pela outra. Independentemente disso, QTc acima de 500 ms marca risco alto de torsades. Confirme qual valor o seu professor cobra.',
        porQueSeduz: 'A afirmação sobre os 500 ms é verdadeira como marcador de risco alto e por isso soa segura; ela responde a outra pergunta — risco de arritmia, não limite de normalidade.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Qual é a conduta inicial?',
        alternativas: [
          'Iniciar amiodarona profilática',
          'Suspender as drogas que prolongam o QT e corrigir potássio e magnésio',
          'Implantar marcapasso definitivo',
          'Iniciar betabloqueador antes de qualquer outra medida',
        ],
        correta: 1,
        variavelDecisiva: 'A natureza adquirida da causa: droga somada a distúrbio eletrolítico, e não canalopatia congênita.',
        porQue: 'Macrolídeo, antiemético e hipocalemia induzida por tiazídico se somam. A conduta é retirar o agente causador e corrigir potássio e magnésio. O betabloqueador é tratamento das formas congênitas, não da forma adquirida por droga.',
        porQueSeduz: 'A amiodarona é o antiarrítmico mais lembrado e parece a resposta genérica para "risco de arritmia"; ela própria prolonga o QT, de modo que prescrevê-la aqui agrava exatamente o problema.',
        movimento: 'erro_de_conduta',
      },
      {
        pergunta: 'No monitor ela apresenta taquicardia ventricular polimórfica em fuso, com pulso, PA de 70/40 mmHg e rebaixamento do sensório. Conduta?',
        alternativas: [
          'Cardioversão elétrica sincronizada',
          'Desfibrilação não sincronizada, associada a sulfato de magnésio 1 a 2 g IV e correção do potássio',
          'Adenosina 6 mg IV',
          'Amiodarona 150 mg IV em 10 minutos',
        ],
        correta: 1,
        variavelDecisiva: 'A morfologia polimórfica: sem uma onda R consistente, o sincronizador não marca e o choque não é liberado.',
        porQue: 'Em taquicardia ventricular polimórfica instável o choque é não sincronizado. O tratamento específico do torsades é sulfato de magnésio 1 a 2 g IV, mesmo com magnésio sérico normal, junto da correção do potássio e da retirada da droga causadora.',
        porQueSeduz: '"Instável com pulso leva choque sincronizado" é a regra geral e vale para a TV monomórfica; a polimórfica é a exceção, e é o erro mais perigoso do tema, porque o aparelho simplesmente não dispara e o tempo se perde.',
        movimento: 'inversao_de_criterio',
      },
    ],
    fechamento: 'O pivô é o QT corrigido lido junto da lista de drogas em uso. Regra de prova: torsades instável leva choque NÃO sincronizado e magnésio — e o corte de QTc tem duas convenções em circulação, que devem ser sabidas as duas.',
    card: 'Síncope + droga nova + hipocalemia: meça o QTc. Acima de 500 ms, risco alto. Torsades: magnésio, corrigir K e Mg, choque não sincronizado se instável.',
  },

  /* ==================================================================
     c13 · WPW com fibrilação atrial pré-excitada
     ================================================================== */
  {
    id: 'c13',
    titulo: 'Taquicardia larga e totalmente irregular em jovem com palpitações',
    familia: 'outros',
    nivel: 'avancado',
    cenario: 'Pronto-socorro de hospital universitário, sábado à noite, logo após uma partida de futebol.',
    queixa: 'Homem de 24 anos, sem doença conhecida, com palpitações de início súbito há 25 minutos, tontura e sensação de desmaio iminente. Relata episódios semelhantes, mais curtos e autolimitados, desde a adolescência.',
    dados: 'PA 88/52 mmHg · FC em torno de 230 bpm, com RR completamente irregular · SatO₂ 96% · sudoreico e ansioso, ainda lúcido. No monitor, complexos largos cuja largura varia de batimento para batimento.',
    padrao: 'wpw',
    notaTracado: 'O traçado exibido é o registrado após a reversão: PR curto, abaixo de 120 ms, com empastamento inicial do QRS — a onda delta.',
    decisoes: [
      {
        pergunta: 'Qual é o ritmo da chegada?',
        alternativas: [
          'Taquicardia ventricular polimórfica',
          'Fibrilação atrial pré-excitada, conduzida por via acessória',
          'Taquicardia supraventricular com aberrância',
          'Flutter atrial com condução variável',
        ],
        correta: 1,
        variavelDecisiva: 'A tríade da apresentação: QRS largo, RR completamente irregular e frequência muito alta, com larguras de complexo variáveis.',
        porQue: 'Taquicardia irregular, de QRS largo, com complexos de larguras diferentes e frequência muito elevada é a apresentação típica da fibrilação atrial conduzida por uma via acessória.',
        porQueSeduz: 'A TV polimórfica também é larga e irregular; ela oscila a amplitude em fuso sobre um QT longo de base, enquanto a TSV com aberrância é regular. O que decide é olhar a variação da largura, não só a irregularidade.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Ele está hipotenso e pré-sincopal. Qual é a conduta?',
        alternativas: [
          'Adenosina 6 mg IV em bólus rápido',
          'Diltiazem intravenoso para controle de frequência',
          'Cardioversão elétrica sincronizada, com sedação',
          'Digoxina intravenosa',
        ],
        correta: 2,
        variavelDecisiva: 'A existência da via acessória: qualquer bloqueio do nó AV favorece a condução pelo feixe anômalo e pode acelerar a resposta ventricular.',
        porQue: 'Na fibrilação atrial pré-excitada, adenosina, verapamil, diltiazem, digoxina e possivelmente betabloqueadores podem aumentar paradoxalmente a resposta ventricular e degenerar em fibrilação ventricular. Instável: cardioversão elétrica. Estável: procainamida.',
        porQueSeduz: 'Diltiazem é a resposta correta para controle de frequência na fibrilação atrial comum, e o rótulo "fibrilação atrial" puxa sozinho a conduta errada; o que muda tudo é a palavra pré-excitada.',
        movimento: 'ancoragem',
      },
      {
        pergunta: 'Revertido o quadro, o ECG mostra o traçado exibido. Qual é o diagnóstico?',
        alternativas: [
          'Bloqueio de ramo esquerdo',
          'Padrão de pré-excitação ventricular (Wolff-Parkinson-White)',
          'Infarto anterior antigo',
          'ECG normal',
        ],
        correta: 1,
        variavelDecisiva: 'O PR curto somado ao empastamento inicial do QRS — a onda delta.',
        porQue: 'PR abaixo de 120 ms com onda delta e QRS alargado às custas do início lento define pré-excitação ventricular. Parte do ventrículo é despolarizada fora do sistema de condução.',
        porQueSeduz: 'O bloqueio de ramo também alarga o QRS e é a primeira hipótese diante de um complexo largo; nele o PR é normal e não há empastamento inicial.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Qual é o encaminhamento?',
        alternativas: [
          'Alta com betabloqueador de uso contínuo',
          'Encaminhamento à eletrofisiologia: a ablação da via acessória é curativa',
          'Alta com amiodarona de uso contínuo',
          'Implante de cardiodesfibrilador',
        ],
        correta: 1,
        variavelDecisiva: 'A existência de substrato anatômico removível — a via acessória.',
        porQue: 'Paciente com pré-excitação que já apresentou fibrilação atrial pré-excitada sintomática tem indicação de estudo eletrofisiológico com ablação da via, que resolve o problema de forma definitiva.',
        porQueSeduz: 'Prescrever um antiarrítmico de uso contínuo parece a solução mais simples e imediata; ela mantém o substrato e apenas tenta suprimir os episódios, num paciente de 24 anos que conviveria décadas com o risco.',
        movimento: 'erro_de_conduta',
      },
    ],
    fechamento: 'O pivô é a irregularidade de uma taquicardia larga e muito rápida. Regra de prova: complexo largo e irregular é fibrilação atrial pré-excitada, taquicardia polimórfica ou fibrilação atrial com aberrância — e na pré-excitada, nenhum bloqueador do nó AV.',
    card: 'QRS largo + RR totalmente irregular + FC muito alta = FA pré-excitada. Instável: choque. Estável: procainamida. Nunca adenosina, verapamil, diltiazem ou digoxina.',
  },

  /* ==================================================================
     c14 · Dor torácica com supra — inferior com VD
     ================================================================== */
  {
    id: 'c14',
    titulo: 'Supra de ST na parede inferior com hipotensão',
    familia: 'isquemia',
    nivel: 'avancado',
    cenario: 'Pronto-socorro de hospital sem serviço de hemodinâmica, com centro de referência a 40 minutos de ambulância.',
    queixa: 'Homem de 59 anos, tabagista, com dor retroesternal em aperto iniciada há 90 minutos, irradiada para a mandíbula, com náusea e sudorese fria.',
    dados: 'PA 92/56 mmHg · FC 58 bpm · FR 20 irpm · SatO₂ 96% em ar ambiente · turgência jugular presente, pulmões limpos à ausculta · ECG com supra de ST em DII, DIII e aVF, e infra recíproco em DI e aVL.',
    padrao: 'stemi',
    notaTracado: 'Meça o supra no ponto J e observe a morfologia: convexa, em abóbada, e localizada — depois procure a imagem em espelho na parede oposta.',
    decisoes: [
      {
        pergunta: 'Qual é o diagnóstico?',
        alternativas: [
          'Pericardite aguda',
          'Infarto agudo do miocárdio com supradesnivelamento de ST da parede inferior',
          'Repolarização precoce',
          'Sobrecarga ventricular esquerda com strain',
        ],
        correta: 1,
        variavelDecisiva: 'Distribuição e imagem em espelho: supra localizado em território coronariano com infra recíproco na parede oposta.',
        porQue: 'Supra convexo em DII, DIII e aVF, em derivações contíguas, com infra recíproco em DI e aVL, somado a dor típica, define infarto com supradesnivelamento da parede inferior.',
        porQueSeduz: 'A pericardite também eleva o ST e é o diferencial obrigatório; ela o faz de forma difusa, côncava, sem respeitar território de artéria e sem imagem em espelho.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Antes de prescrever, qual registro adicional é obrigatório?',
        alternativas: [
          'V7, V8 e V9',
          'V3R e V4R',
          'Repetir apenas um DII longo',
          'Nenhum: o diagnóstico já está fechado',
        ],
        correta: 1,
        variavelDecisiva: 'A parede acometida: infarto inferior obriga a procurar acometimento do ventrículo direito, porque isso altera a prescrição.',
        porQue: 'O infarto inferior costuma ser da coronária direita, e o comprometimento do ventrículo direito muda a conduta. V3R e V4R são as derivações que o detectam. V7 a V9 investigam parede dorsal e também podem ser pedidas, mas o passo que não pode faltar aqui é o do ventrículo direito.',
        porQueSeduz: 'Com supra evidente e dor típica, parece que o diagnóstico está fechado e que qualquer registro adicional só atrasa; as derivações direitas não mudam o diagnóstico — mudam o que se pode prescrever.',
        movimento: 'fechamento_precoce',
      },
      {
        pergunta: 'V4R mostra supra de ST. Ele refere dor 8/10 e mantém PA de 92/56 mmHg. O que NÃO deve ser prescrito?',
        alternativas: [
          'Ácido acetilsalicílico',
          'Nitrato sublingual, morfina e diurético',
          'Segundo antiagregante plaquetário',
          'Anticoagulação conforme protocolo',
        ],
        correta: 1,
        variavelDecisiva: 'A dependência de pré-carga do ventrículo direito infartado — e não a "parede inferior" em si.',
        porQue: 'Com acometimento do ventrículo direito, o débito depende do enchimento; nitrato, morfina e diurético reduzem a pré-carga e podem causar hipotensão grave. A conduta é volume, com soro fisiológico em bolus. Atenção à divergência: material do próprio curso enuncia essa contraindicação como sendo do "infarto de parede inferior"; o correto é atribuí-la ao acometimento do ventrículo direito.',
        porQueSeduz: 'O nitrato é a droga mais associada ao alívio da dor anginosa e vem primeiro no mnemônico de conduta; é justamente essa automaticidade que produz a hipotensão grave neste subgrupo.',
        movimento: 'erro_de_conduta',
      },
      {
        pergunta: 'O centro com hemodinâmica fica a 40 minutos. Qual é a estratégia de reperfusão?',
        alternativas: [
          'Aguardar o resultado da troponina para confirmar antes de decidir',
          'Reperfusão imediata: transferir para angioplastia primária se realizável em tempo hábil; se não for, trombólise no local seguida de transferência',
          'Trombólise sempre, por se tratar de hospital sem hemodinâmica',
          'Tratamento clínico e cateterismo eletivo em 72 horas',
        ],
        correta: 1,
        variavelDecisiva: 'O tempo estimado até a abertura da artéria — é ele, e não a troponina, que decide entre transferir e trombolisar.',
        porQue: 'A angioplastia primária é a primeira escolha quando alcançável em tempo hábil; caso contrário, faz-se fibrinólise no local e transfere-se em seguida. A decisão de reperfusão não espera exame laboratorial.',
        porQueSeduz: 'Pedir troponina parece a conduta prudente e é a rotina correta de quem não tem supra; diante de supra, esperar o resultado é perder músculo.',
        movimento: 'erro_de_prioridade',
      },
    ],
    fechamento: 'O pivô é a parede acometida: inferior obriga V3R e V4R, e o ventrículo direito reescreve a prescrição. Regra de prova: com ventrículo direito acometido, nada de nitrato, morfina ou diurético — volume.',
    card: 'Supra em DII, DIII e aVF: peça V3R e V4R. Se houver VD, faça volume e evite nitrato, morfina e diurético. Reperfusão não espera troponina.',
  },

  /* ==================================================================
     c15 · Dor torácica sem supra
     ================================================================== */
  {
    id: 'c15',
    titulo: 'Dor torácica em repouso com infradesnivelamento de ST',
    familia: 'isquemia',
    nivel: 'avancado',
    cenario: 'Unidade de dor torácica, paciente encaminhada da unidade básica de saúde.',
    queixa: 'Mulher de 67 anos, diabética e hipertensa, com dor precordial em peso surgida em repouso há três horas, além de dois episódios mais curtos aos esforços na semana passada.',
    dados: 'PA 152/88 mmHg · FC 88 bpm · FR 18 irpm · SatO₂ 97% em ar ambiente · sem sinais de congestão · ECG com infra de ST horizontal de 1,5 mm em V4 a V6 e em DII, com onda T invertida · primeira troponina discretamente elevada · não usa digoxina.',
    padrao: 'infraST',
    notaTracado: 'Confira a forma do infradesnivelamento: horizontal ou descendente tem valor; ascendente tem valor bem menor.',
    decisoes: [
      {
        pergunta: 'Qual é o diagnóstico?',
        alternativas: [
          'Infarto agudo do miocárdio com supradesnivelamento de ST',
          'Síndrome coronariana aguda sem supradesnivelamento de ST',
          'Efeito digitálico',
          'ECG normal para a idade',
        ],
        correta: 1,
        variavelDecisiva: 'A direção do desvio do ST somada à sua morfologia horizontal ou descendente, em derivações contíguas de um mesmo território.',
        porQue: 'Infra de ST horizontal em derivações contíguas, com clínica compatível e marcador de necrose elevado, define síndrome coronariana aguda sem supradesnivelamento.',
        porQueSeduz: 'O efeito digitálico produz infra "em colher" e é distrator clássico da banca — mas exige o uso de digoxina, que este caso exclui de forma explícita.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Antes de rotular o caso como "sem supra", o que precisa ser descartado?',
        alternativas: [
          'Nada: a ausência de supra encerra a discussão',
          'Os equivalentes de oclusão: infarto dorsal (infra em V1–V3 com R alta, confirmado por V7–V9), padrão de De Winter, onda T hiperaguda e critérios de Sgarbossa no bloqueio de ramo esquerdo ou no ritmo de marcapasso',
          'Apenas pericardite',
          'Apenas embolia pulmonar',
        ],
        correta: 1,
        variavelDecisiva: 'A possibilidade de oclusão total sem supra clássico — os equivalentes que exigem reperfusão imediata.',
        porQue: 'Infarto dorsal, padrão de De Winter, onda T hiperaguda e critérios de Sgarbossa são reconhecidos como equivalentes de oclusão e exigem reperfusão imediata, ainda que o traçado convencional não mostre supradesnivelamento.',
        porQueSeduz: 'A regra "sem supra não se tromboliza" é verdadeira na imensa maioria dos casos e por isso é decorada como absoluta; ela vale depois de descartar os equivalentes, não antes.',
        movimento: 'fechamento_precoce',
      },
      {
        pergunta: 'Qual é a conduta?',
        alternativas: [
          'Trombólise imediata',
          'Antiagregação, anticoagulação, antianginoso e estratificação de risco para definir o momento da estratégia invasiva',
          'Alta com teste ergométrico ambulatorial',
          'Apenas observação até a segunda troponina',
        ],
        correta: 1,
        variavelDecisiva: 'A ausência de oclusão total demonstrada: sem ela, não há benefício de fibrinólise.',
        porQue: 'Na síndrome coronariana aguda sem supra não há papel para trombólise. O tratamento é antitrombótico e antianginoso, com o momento do cateterismo definido pelo risco e pela refratariedade dos sintomas.',
        porQueSeduz: 'Troponina elevada com dor em repouso soa como "infarto, logo reperfusão química"; o que indica fibrinólise é a oclusão total demonstrada pelo supra ou por um equivalente, não a elevação do marcador.',
        movimento: 'erro_de_conduta',
      },
      {
        pergunta: 'Em outra paciente, o traçado mostra infra de ST difuso em várias paredes com supra em aVR. Qual é a conduta?',
        alternativas: [
          'Trombólise imediata, porque supra em aVR é equivalente de infarto com supra',
          'Angiografia urgente: o padrão sugere lesão de tronco ou doença triarterial, e a trombólise não é a conduta',
          'Alta após segunda troponina negativa',
          'Cardioversão elétrica',
        ],
        correta: 1,
        variavelDecisiva: 'Se o padrão representa oclusão total de uma artéria ou isquemia subendocárdica global — o primeiro se reperfunde com fibrinólise, o segundo não.',
        porQue: 'Supra em aVR com infra difuso indica alto risco de lesão de tronco ou doença triarterial. Apenas uma minoria desses pacientes tem oclusão trombótica aguda; a conduta é angiografia urgente, não fibrinólise.',
        porQueSeduz: 'O padrão é gravíssimo, e gravidade é lida como indicação de reperfusão química imediata; gravidade e mecanismo são coisas diferentes, e trombolisar aqui não abre nada.',
        movimento: 'erro_de_conduta',
      },
    ],
    fechamento: 'O pivô é a morfologia do infra somada à busca ativa por equivalentes de oclusão. Regra de prova: sem supra não se tromboliza — depois de excluir dorsal, De Winter, T hiperaguda e Sgarbossa; e aVR com infra difuso vai para angiografia, não para trombolítico.',
    card: 'Infra horizontal ou descendente + clínica = SCA sem supra: antitrombótico e estratificação de risco. Antes de fechar, procure os equivalentes de oclusão.',
  },

  /* ==================================================================
     c16 · Pericardite aguda
     ================================================================== */
  {
    id: 'c16',
    titulo: 'Dor torácica que melhora ao sentar, com supra em quase todas as derivações',
    familia: 'isquemia',
    nivel: 'avancado',
    cenario: 'Pronto-socorro; o paciente entra caminhando, inclinado para a frente.',
    queixa: 'Homem de 28 anos, previamente hígido, com dor torácica em pontada há dois dias, que piora ao deitar e à inspiração profunda e melhora ao sentar e inclinar o tronco para a frente. Teve quadro gripal há dez dias.',
    dados: 'PA 122/74 mmHg · FC 96 bpm · Tax 37,8 °C · SatO₂ 98% · atrito pericárdico audível em borda esternal esquerda · sem turgência jugular e sem pulso paradoxal · ECG com supra de ST côncavo em quase todas as derivações, infra do segmento PR, poupando aVR e V1.',
    padrao: 'pericardite',
    notaTracado: 'Observe duas coisas ao mesmo tempo: o supra é côncavo e difuso, e o segmento PR está deprimido.',
    decisoes: [
      {
        pergunta: 'Qual é o diagnóstico?',
        alternativas: [
          'Infarto agudo do miocárdio com supradesnivelamento de ST',
          'Pericardite aguda',
          'Repolarização precoce',
          'Sobrecarga ventricular esquerda',
        ],
        correta: 1,
        variavelDecisiva: 'A distribuição do supra: difusa, sem respeitar território de artéria e sem imagem em espelho.',
        porQue: 'Supra côncavo difuso, com infra do segmento PR, poupando aVR e V1, associado a dor pleurítica posicional e atrito pericárdico, define pericardite aguda.',
        porQueSeduz: 'O infarto também eleva o ST e a altura do supra pode ser parecida; ele o faz de forma localizada, convexa e com infra recíproco na parede oposta. O que decide é distribuição e concavidade, não amplitude.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Por que confundir pericardite com infarto é um erro grave, e não apenas um erro de rótulo?',
        alternativas: [
          'Porque atrasa a realização do ECG seriado',
          'Porque a trombólise em pericardite pode causar hemopericárdio',
          'Porque a pericardite exige cateterismo urgente',
          'Porque muda apenas o tempo de internação',
        ],
        correta: 1,
        variavelDecisiva: 'A consequência do tratamento errado: fibrinolítico administrado a um pericárdio inflamado.',
        porQue: 'Trombolisar uma pericardite expõe o paciente a sangramento no saco pericárdico, com risco de tamponamento. É por isso que o diferencial precisa estar feito antes de liberar reperfusão.',
        porQueSeduz: 'Como os dois quadros cursam com dor torácica e supra, a diferença parece apenas nominal; o desfecho de errar não é diagnóstico, é hemorrágico.',
        movimento: 'erro_de_conduta',
      },
      {
        pergunta: 'Qual é o tratamento?',
        alternativas: [
          'Dupla antiagregação e anticoagulação plena',
          'Anti-inflamatório não esteroidal ou ácido acetilsalicílico em dose alta, associado a colchicina',
          'Corticoide como primeira linha em todos os casos',
          'Antibiótico empírico de amplo espectro',
        ],
        correta: 1,
        variavelDecisiva: 'A natureza do mecanismo: inflamatório, não trombótico.',
        porQue: 'O tratamento é anti-inflamatório não esteroidal ou aspirina em dose alta, com colchicina associada, que reduz recorrência. Investiga-se a etiologia e pesquisa-se derrame por ecocardiograma.',
        porQueSeduz: 'Antiagregação e anticoagulação são a espinha dorsal do tratamento da dor torácica isquêmica e vêm por reflexo; aqui não há trombo a combater, e a anticoagulação aumenta o risco de derrame hemorrágico.',
        movimento: 'ancoragem',
      },
      {
        pergunta: 'Qual achado, se surgir, muda a prioridade imediatamente?',
        alternativas: [
          'Febre de 38 °C',
          'Hipotensão com turgência jugular e bulhas abafadas',
          'Elevação discreta de proteína C reativa',
          'Dor que persiste por três dias',
        ],
        correta: 1,
        variavelDecisiva: 'A repercussão hemodinâmica do derrame — tamponamento é diagnóstico clínico e muda o alvo do tratamento.',
        porQue: 'Hipotensão com turgência jugular e abafamento de bulhas sugere tamponamento cardíaco, situação em que o tratamento deixa de ser o processo inflamatório e passa a ser a drenagem do derrame.',
        porQueSeduz: 'Febre e elevação de marcador inflamatório confirmam que a doença está ativa e por isso parecem relevantes; nenhum dos dois indica compressão das câmaras cardíacas, que é o que muda a prioridade.',
        movimento: 'erro_de_prioridade',
      },
    ],
    fechamento: 'O pivô é a dupla "difuso e côncavo" acompanhada de infra do segmento PR. Regra de prova: o supra da pericardite não respeita território de artéria e não tem imagem em espelho.',
    card: 'Supra difuso côncavo + infra de PR + poupa aVR e V1 = pericardite. AINE ou AAS em dose alta com colchicina. Nunca trombolítico.',
  },

  /* ==================================================================
     c17 · BRE novo com dor torácica
     ================================================================== */
  {
    id: 'c17',
    titulo: 'Dor torácica com bloqueio de ramo esquerdo e sem ECG antigo para comparar',
    familia: 'ramo',
    nivel: 'avancado',
    cenario: 'Pronto-socorro de hospital com hemodinâmica disponível, plantão de domingo.',
    queixa: 'Mulher de 70 anos, hipertensa e diabética, com dor retroesternal em aperto há 50 minutos, associada a sudorese e náusea. Nunca havia feito ECG; não há traçado prévio no sistema.',
    dados: 'PA 138/82 mmHg · FC 74 bpm · FR 20 irpm · SatO₂ 97% · sem sinais de congestão · ECG com QRS de 150 ms, negativo e alargado em V1, com R alargada e entalhada em DI, aVL e V6.',
    padrao: 'bre',
    notaTracado: 'Olhe V1 primeiro: QRS largo e negativo. Em seguida lembre que, no bloqueio de ramo esquerdo, o ST e a T já são discordantes por definição.',
    decisoes: [
      {
        pergunta: 'Qual é o padrão eletrocardiográfico?',
        alternativas: [
          'Bloqueio de ramo direito',
          'Bloqueio de ramo esquerdo',
          'Taquicardia ventricular',
          'Ritmo de marcapasso',
        ],
        correta: 1,
        variavelDecisiva: 'A polaridade do QRS largo em V1: negativo aponta ramo esquerdo.',
        porQue: 'QRS igual ou maior que 120 ms, predominantemente negativo em V1, com R alargada e entalhada em DI, aVL e V6, define bloqueio de ramo esquerdo.',
        porQueSeduz: 'Os dois bloqueios de ramo aparecem como "QRS largo" e são confundidos o tempo todo; a regra de bolso do curso resolve com uma única derivação — largo e para baixo em V1 é esquerdo.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Há supra de ST em V1 a V3 e infra em V5 e V6. Como ler isso?',
        alternativas: [
          'É infarto anterosseptal em evolução',
          'No bloqueio de ramo esquerdo, ST e T discordantes do QRS são esperados; a discordância por si só não indica isquemia',
          'É pericardite associada',
          'É artefato de calibração',
        ],
        correta: 1,
        variavelDecisiva: 'Discordância esperada versus alteração primária — o bloqueio de ramo esquerdo já altera o ST por definição.',
        porQue: 'No BRE o vetor de repolarização se opõe ao do QRS: as precordiais direitas, com QRS negativo, mostram supra, e as esquerdas, com QRS positivo, mostram infra. Isso é regra do padrão, não achado adicional.',
        porQueSeduz: 'Supra de ST em precordiais direitas em paciente com dor típica é exatamente a imagem que se aprendeu a tratar como emergência; sem levar em conta o QRS largo, o traçado parece um infarto anterosseptal evidente.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Como identificar infarto dentro de um bloqueio de ramo esquerdo?',
        alternativas: [
          'Não é possível: o BRE torna o ECG ininterpretável',
          'Pelos critérios de Sgarbossa: supra concordante ≥ 1 mm; infra concordante ≥ 1 mm em V1–V3; supra discordante desproporcional, com razão ST/S ≤ −0,25 na versão modificada de Smith',
          'Basta medir a largura do QRS',
          'Basta comparar com a derivação aVR',
        ],
        correta: 1,
        variavelDecisiva: 'A concordância entre o desvio do ST e a polaridade do QRS — é ela que denuncia alteração primária dentro do bloqueio.',
        porQue: 'Sgarbossa identifica oclusão dentro do BRE: supra concordante com o QRS de pelo menos 1 mm, infra concordante de pelo menos 1 mm em V1 a V3, e supra discordante desproporcional, medido na versão modificada de Smith pela razão entre o desvio do ST e a profundidade da onda S (≤ −0,25).',
        porQueSeduz: 'A ideia de que "BRE inviabiliza a leitura do ST" é meia-verdade confortável: ela é correta quanto à leitura convencional e leva a abandonar a única ferramenta que ainda funciona nesse traçado.',
        movimento: 'erro_de_criterio',
      },
      {
        pergunta: 'Qual é a conduta?',
        alternativas: [
          'Aguardar a curva de troponina antes de acionar a hemodinâmica',
          'Manejar como síndrome coronariana aguda com ativação imediata da equipe de hemodinâmica: bloqueio de ramo esquerdo novo ou de idade indeterminada com dor típica é oclusão até prova em contrário',
          'Alta com controle ambulatorial em sete dias',
          'Iniciar apenas anti-inflamatório e reavaliar',
        ],
        correta: 1,
        variavelDecisiva: 'A idade do bloqueio somada à tipicidade da dor — sem traçado prévio, o bloqueio é de idade indeterminada.',
        porQue: 'Sem ECG anterior para comparar, o bloqueio é de idade indeterminada; com dor típica, maneja-se como síndrome coronariana aguda, sem esperar troponina. O guia do curso ensina que "BRE novo mais clínica equivale a supra"; na prática atual isso significa estratégia invasiva urgente apoiada pelos critérios de Sgarbossa, e não fibrinólise automática diante de qualquer BRE.',
        porQueSeduz: 'Esperar a troponina parece rigor diagnóstico e é a conduta correta em outros cenários; aqui ela converte um caso potencialmente reperfundível em diagnóstico retrospectivo.',
        movimento: 'erro_de_prioridade',
      },
    ],
    fechamento: 'O pivô é a idade do bloqueio somada à tipicidade da dor. Regra de prova: BRE crônico isolado não é emergência; BRE novo ou de idade indeterminada com dor típica é oclusão até prova em contrário, e Sgarbossa é a régua.',
    card: 'V1 largo e negativo = BRE. ST e T discordantes são esperados. Sgarbossa: supra concordante ≥ 1 mm, infra concordante ≥ 1 mm em V1–V3, razão ST/S ≤ −0,25.',
  },

  /* ==================================================================
     c18 · Parada em fibrilação ventricular
     ================================================================== */
  {
    id: 'c18',
    titulo: 'Colapso presenciado na enfermaria com ritmo caótico no monitor',
    familia: 'parada',
    nivel: 'avancado',
    cenario: 'Enfermaria de cardiologia, paciente internado por síndrome coronariana aguda; colapso presenciado pela equipe.',
    queixa: 'Homem de 63 anos perdeu a consciência subitamente enquanto conversava com a equipe. Não responde ao chamado nem ao estímulo.',
    dados: 'Sem pulso central palpável em 10 segundos · sem respiração eficaz, apenas gasping · monitor com ondulação caótica, sem complexos identificáveis · desfibrilador ao lado do leito em 1 minuto · acesso venoso periférico já instalado.',
    padrao: 'fv',
    notaTracado: 'Não há P, QRS ou T reconhecíveis: a linha é uma ondulação irregular e contínua, de amplitude variável.',
    decisoes: [
      {
        pergunta: 'Antes de qualquer conduta, o que precisa ser confirmado?',
        alternativas: [
          'O valor do potássio sérico',
          'Que o paciente não tem pulso e que não se trata de eletrodo solto ou artefato de movimento',
          'O tempo desde a última refeição',
          'A dose do betabloqueador em uso',
        ],
        correta: 1,
        variavelDecisiva: 'A confirmação clínica: o ritmo do monitor só significa parada depois que o paciente é examinado.',
        porQue: 'Artefato de movimento e cabo desconectado imitam fibrilação ventricular. A checagem de responsividade, respiração e pulso central em até 10 segundos é o que define parada cardíaca.',
        porQueSeduz: 'O traçado é dramático e parece dispensar qualquer conferência; tratar o monitor em vez do paciente é o erro que o próprio passo de adequação técnica existe para prevenir.',
        movimento: 'fechamento_precoce',
      },
      {
        pergunta: 'Confirmada a parada, qual é a conduta?',
        alternativas: [
          'Cardioversão elétrica sincronizada',
          'Compressões torácicas de alta qualidade e desfibrilação imediata, não sincronizada',
          'Adrenalina 1 mg IV antes do primeiro choque',
          'Amiodarona 300 mg IV antes do primeiro choque',
        ],
        correta: 1,
        variavelDecisiva: 'É ritmo chocável em paciente sem pulso — e não existe onda R para o sincronizador marcar.',
        porQue: 'A fibrilação ventricular é ritmo chocável. O tratamento é reanimação de alta qualidade com desfibrilação imediata e não sincronizada, retomando as compressões logo após o choque.',
        porQueSeduz: 'A palavra "cardioversão" está associada a arritmia grave e o modo sincronizado parece mais controlado; na fibrilação ventricular ele não dispara, porque não há onda R identificável, e cada segundo perdido reduz a sobrevida.',
        movimento: 'inversao_de_criterio',
      },
      {
        pergunta: 'Após o primeiro choque, com fibrilação ventricular persistente, qual é a sequência medicamentosa?',
        alternativas: [
          'Adrenalina 1 mg IV a cada 3 a 5 minutos e amiodarona 300 mg IV após o terceiro choque',
          'Amiodarona 150 mg IV imediatamente, com adrenalina apenas após o retorno da circulação',
          'Atropina 1 mg IV a cada 3 minutos',
          'Bicarbonato de sódio de rotina em todas as paradas',
        ],
        correta: 0,
        variavelDecisiva: 'A ordem que o algoritmo de ritmo chocável estabelece — a droga entra entre os choques, sem interromper as compressões.',
        porQue: 'No ritmo chocável, adrenalina 1 mg IV a cada 3 a 5 minutos e amiodarona 300 mg após o terceiro choque compõem a sequência, sempre subordinadas à qualidade das compressões e à desfibrilação precoce.',
        porQueSeduz: 'A atropina pertence ao algoritmo de bradicardia e não tem papel na parada em ritmo chocável; o bicarbonato de rotina é conduta abandonada e sobrevive por hábito de sala.',
        movimento: 'erro_de_conduta',
      },
      {
        pergunta: 'Enquanto a reanimação corre, o que precisa ser buscado ativamente?',
        alternativas: [
          'O histórico familiar do paciente',
          'As causas reversíveis: hipóxia, hipovolemia, acidose, hipo e hipercalemia, hipotermia, pneumotórax hipertensivo, tamponamento, toxinas, trombose coronária e trombose pulmonar',
          'O resultado do ecocardiograma prévio',
          'A autorização da família para prosseguir com a reanimação',
        ],
        correta: 1,
        variavelDecisiva: 'A existência de causa tratável durante a parada — sem tratá-la, o ritmo volta a fibrilar depois de cada choque.',
        porQue: 'A busca das causas reversíveis é parte do algoritmo e ocorre em paralelo à reanimação. Neste paciente, internado por síndrome coronariana aguda, a trombose coronária é a hipótese principal.',
        porQueSeduz: 'Buscar exames e antecedentes parece organizar o raciocínio, e é o que se faz em quase todo atendimento; durante a parada, o que muda desfecho é a lista de causas tratáveis agora, não o histórico.',
        movimento: 'erro_de_prioridade',
      },
    ],
    fechamento: 'O pivô é a ausência de pulso somada à ausência de complexos organizados. Regra de prova: fibrilação ventricular é ritmo chocável e o choque é NÃO sincronizado — sincronizar é perder tempo com um aparelho que não vai disparar.',
    card: 'FV: sem pulso, sem complexos organizados. RCP de alta qualidade + desfibrilação imediata não sincronizada. Adrenalina 1 mg a cada 3–5 min; amiodarona 300 mg após o 3º choque.',
  },

];

/* ==========================================================================
   ÍNDICES AUXILIARES
   ========================================================================== */

/** Casos agrupados por família diagnóstica (mesmas chaves de FAMILIAS em library.js). */
export const casosPorFamilia = () => {
  const mapa = {};
  for (const c of CASOS) (mapa[c.familia] ||= []).push(c.id);
  return mapa;
};

/** Casos que exibem um traçado da biblioteca de padrões. */
export const casosComTracado = () => CASOS.filter((c) => c.padrao).map((c) => c.id);

/** Busca direta por id. */
export const casoPorId = (id) => CASOS.find((c) => c.id === id) || null;

/** Total de decisões do banco — usado para dimensionar a barra de progresso. */
export const TOTAL_DECISOES = CASOS.reduce((n, c) => n + c.decisoes.length, 0);
