/**
 * ECG Ultimate Learning — texto didático dos módulos e roteiros de leitura guiada.
 *
 * Este arquivo é a camada de ENSINO. Ele não sintetiza traçado nem calcula nada:
 * apenas diz o que o aluno precisa entender antes de olhar, e conduz o olhar
 * quando ele estiver olhando.
 *
 * ---------------------------------------------------------------------------
 * DE ONDE VEM O CONTEÚDO
 *
 * Todo critério, limiar, dose e conduta aqui está alinhado a `ecg/library.js`,
 * que passou por auditoria clínica e validação adversarial. Onde a biblioteca
 * registra uma divergência de fontes (QTc, limiar de tempo na fibrilação
 * atrial), este arquivo mostra as duas convenções em vez de escolher uma em
 * silêncio: resolver a divergência escondendo metade dela é o que faz o aluno
 * errar na prova do professor que usa a outra.
 *
 * Correções obrigatórias que este texto respeita e nunca contraria:
 *   1. Taquicardia ventricular POLIMÓRFICA instável leva choque NÃO sincronizado.
 *   2. Supra em aVR com infra difuso NÃO é equivalente de STEMI: é angiografia
 *      urgente, não trombólise.
 *   3. Atropina não funciona em bloqueio infranodal.
 *   4. A contraindicação a nitrato, morfina e diurético é do infarto de
 *      ventrículo direito, não da "parede inferior".
 *   5. O QTc tem duas convenções em circulação e as duas aparecem.
 *
 * ---------------------------------------------------------------------------
 * ARQUITETURA PEDAGÓGICA
 *
 * `MODULOS` é o material do estágio E1 (exemplo trabalhado) e a referência de
 * consulta dos estágios seguintes. Cada módulo abre com uma promessa
 * verificável, explica o mecanismo antes do padrão — para que o traçado seja
 * consequência e não item de memorização — e fecha com os erros que a
 * literatura e o material do curso registram como recorrentes.
 *
 * `ROTEIROS` é a leitura guiada: 3 a 5 paradas sobre a mesma tira, uma de cada
 * vez, na progressão OBSERVAR → MEDIR → COMPARAR → NOMEAR. A primeira parada
 * nunca entrega o diagnóstico; a última sempre o nomeia. A segmentação existe
 * porque ECG é conteúdo de carga intrínseca alta: mostrar traçado, vinheta e
 * pergunta aberta ao mesmo tempo para quem nunca viu um traçado não ensina,
 * satura.
 *
 * `tMs` é o instante do traçado a destacar, em milissegundos a partir do início
 * da tira, calculado sobre o ritmo que `library.js` sintetiza para aquele
 * padrão. `tMs: null` significa "sem destaque — olhe a tira inteira", usado
 * quando o achado é a organização geral e não um ponto.
 */

/* ==========================================================================
   1. MÓDULOS — um por família diagnóstica
   ========================================================================== */

export const MODULOS = [

  /* ---------------------------------------------------------------- base -- */
  {
    familia: 'base',
    titulo: 'Fundamentos: o traçado normal e as duas variações de frequência',
    promessa:
      'Ao final, você percorre um traçado na ordem correta e afirma, com critério numérico na mão, se ele é normal — e, se não for, em qual dos nove passos ele deixou de ser.',
    porQueImporta:
      'Nenhum diagnóstico de ECG se sustenta sem o traçado normal na memória visual, porque todo achado anormal é definido por contraste com ele. Na prova, a maioria dos erros de aluno não é confundir dois diagnósticos raros: é deixar de perceber que algo está fora do normal, ou ver anormalidade onde há variação fisiológica. No plantão, a primeira pergunta que alguém vai lhe fazer diante de um traçado é "está normal?", e é essa pergunta que ordena todas as outras.',
    fisiopatologia:
      'O impulso nasce no nó sinusal, no alto do átrio direito, e se espalha pelos dois átrios de cima para baixo e da direita para a esquerda. Como a derivação DII enxerga o coração justamente nesse sentido, a despolarização atrial se aproxima do eletrodo positivo e escreve uma onda P positiva. É por isso que "P positiva em DII" não é uma regra a decorar: é a consequência geométrica de o estímulo ter nascido onde deveria.\n\nEm seguida o impulso encontra o nó atrioventricular, único ponto de passagem elétrica entre átrios e ventrículos, e ali sofre um atraso fisiológico. Esse atraso não é defeito: é o que dá tempo para os átrios terminarem de esvaziar nos ventrículos antes da sístole ventricular. No papel, o atraso aparece como o segmento isoelétrico entre o fim da P e o início do QRS, e o conjunto P + atraso é o intervalo PR, de 120 a 200 ms. Vencido o nó AV, o estímulo desce pelo feixe de His e pela rede de Purkinje, que é um sistema de condução rápido: os dois ventrículos despolarizam quase simultaneamente, e por isso o QRS é estreito, abaixo de 120 ms. Toda vez que o QRS estiver largo, é porque essa autoestrada foi contornada por algum caminho mais lento — bloqueio de ramo, origem ventricular, pré-excitação.\n\nA repolarização ventricular escreve a onda T. Ela é assimétrica por natureza: sobe devagar e desce mais rápido. Guarde esse detalhe, porque uma onda T que ficou simétrica e apiculada é um dos sinais mais precoces de hipercalemia, e uma onda T simétrica e invertida é a assinatura da isquemia. A frequência, por sua vez, é apenas com que rapidez esse ciclo inteiro se repete: entre 60 e 100 por minuto no adulto em repouso, abaixo de 60 na bradicardia sinusal, acima de 100 na taquicardia sinusal. Em nenhum dos dois casos o mecanismo mudou — mudou o quanto o nó sinusal está sendo estimulado ou freado.',
    comoLer:
      'Comece pela adequação técnica, antes de qualquer diagnóstico: confirme 25 mm/s, ganho de 10 mm/mV e o pulso de calibração de 1 mV medindo 10 mm de altura. Um traçado com ganho pela metade transforma sobrecarga ventricular em ECG normal. Depois vá para DII longo e responda uma única pergunta: existe onda P positiva antes de cada QRS, sempre com a mesma distância até ele? Só quando essa resposta for sim é que faz sentido medir frequência, intervalos e repolarização.',
    ancoras: [
      'Ritmo sinusal em três checagens: P positiva em DI e DII, P negativa em aVR, e toda P seguida de QRS.',
      'Ritmo regular: 1500 dividido pelo número de quadradinhos entre dois R. Ritmo irregular: conte os QRS em 6 segundos e multiplique por 10.',
      'Cada quadradinho vale 0,04 s na horizontal e 0,1 mV na vertical; cada quadradão vale 0,20 s e 0,5 mV.',
      'PR de 120 a 200 ms, ou seja, 3 a 5 quadradinhos. QRS abaixo de 120 ms, ou seja, menos de 3 quadradinhos.',
      'Onda T normal é assimétrica. Simetria de onda T é achado a investigar, não variação de normalidade.',
      'Frequência normal não exclui doença cardíaca, e frequência anormal não é diagnóstico por si só.',
    ],
    errosComuns: [
      {
        erro: 'Pular o passo da adequação técnica e ir direto ao diagnóstico.',
        porQue:
          'Ganho e velocidade alterados mudam amplitude e duração de tudo o que vem depois. Metade do ganho apaga um critério de voltagem; 50 mm/s dobra a largura aparente do QRS.',
        comoEvitar:
          'Olhe o pulso de calibração antes de olhar as ondas. Ele tem que medir 10 mm de altura e estar no início da tira. Se não estiver lá, você não sabe o que está medindo.',
      },
      {
        erro: 'Tratar bradicardia sinusal e taquicardia sinusal como diagnósticos completos.',
        porQue:
          'Ambas são ritmo sinusal preservado com a frequência deslocada. O diagnóstico verdadeiro é a causa: febre, dor, hipovolemia, hipóxia, sepse, tireotoxicose e embolia pulmonar de um lado; atleta, sono, betabloqueador e hipertonia vagal do outro.',
        comoEvitar:
          'Depois de nomear, pergunte sempre "resposta a quê?". A taquicardia sinusal é sintoma; frear a frequência sem tratar a causa pode ser deletério.',
      },
      {
        erro: 'Confundir bradicardia sinusal com bloqueio atrioventricular.',
        porQue:
          'As duas dão QRS espaçados. A diferença está na relação entre P e QRS: na bradicardia sinusal ela está intacta, e no bloqueio ela está quebrada, seja por alongamento do PR, seja por falha de condução.',
        comoEvitar:
          'Meça o PR de três batimentos consecutivos e confira se toda P conduziu. Se a resposta for "PR fixo e nenhuma P perdida", é bradicardia sinusal, por mais lento que esteja.',
      },
    ],
    ordemSugerida: ['normal', 'bradicardia', 'taquiSinusal'],
  },

  /* ---------------------------------------------------------- sobrecarga -- */
  {
    familia: 'sobrecarga',
    titulo: 'Sobrecargas: quando a câmara cresce, a onda dela cresce junto',
    promessa:
      'Ao final, você separa sobrecarga atrial direita de esquerda apenas decidindo se a onda P mudou de altura ou de largura, e aplica o critério de Sokolow-Lyon com as ressalvas que ele exige.',
    porQueImporta:
      'Sobrecarga é o achado crônico mais comum do ECG ambulatorial e o que mais aparece como pano de fundo em questão de valvopatia e de hipertensão. Além disso, o padrão de sobrecarga ventricular esquerda com strain imita infradesnivelamento isquêmico de forma convincente, e essa confusão tem consequência: um pode terminar em sala de hemodinâmica, o outro em ambulatório.',
    fisiopatologia:
      'A onda P é a soma de duas despolarizações que acontecem quase em sequência: primeiro o átrio direito, depois o esquerdo. Quando o átrio direito se dilata ou hipertrofia, ele gera um vetor mais intenso no mesmo intervalo de tempo, e os dois componentes continuam se sobrepondo. O resultado é uma P mais ALTA, com duração preservada — o chamado P pulmonale, acima de 2,5 mm em DII, DIII ou aVF. Quando é o átrio esquerdo que cresce, o que aumenta é o tempo que a despolarização leva para atravessá-lo: o segundo componente atrasa, se separa do primeiro, e a P fica mais LARGA e entalhada, com dois picos — o P mitrale. Amplitude aponta para a direita; duração aponta para a esquerda. Essa é a regra inteira, e o mecanismo é o motivo pelo qual ela funciona.\n\nNo ventrículo esquerdo o raciocínio é o mesmo aplicado ao QRS. Uma massa muscular maior gera um vetor elétrico maior orientado para a esquerda e para trás, e as derivações que enxergam esse lado registram ondas R mais altas, enquanto V1, que olha de frente para o lado oposto, registra ondas S mais profundas. Daí o critério de Sokolow-Lyon: a soma da S em V1 com a R em V5 ou V6 igual ou maior que 35 mm. É um critério de voltagem, e voltagem depende de quanto tecido existe entre o coração e o eletrodo — por isso ele produz falso-positivo em jovem magro e atleta, e falso-negativo em obeso e enfisematoso.\n\nO padrão strain merece parágrafo próprio. Um miocárdio muito espesso repolariza de forma alterada, e essa alteração é secundária à sobrecarga, não a um evento agudo. No traçado, aparece como infradesnivelamento de ST descendente com onda T invertida e assimétrica nas derivações laterais, exatamente onde as ondas R estão altas. Perceba a ligação: o strain vive onde o R é alto. Isquemia aguda não tem esse compromisso topográfico com a amplitude do QRS.',
    comoLer:
      'Neste tema, olhe primeiro a onda P em DII e só depois o QRS nas precordiais. Na P, decida uma coisa de cada vez: primeiro a altura, comparando com 2,5 mm — dois quadradinhos e meio; depois a largura, comparando com 120 ms — três quadradinhos. Nas precordiais, meça a profundidade da S em V1 e a altura da R em V5 ou V6 e some antes de opinar, e confira se a repolarização lateral acompanha as ondas R altas.',
    ancoras: [
      'P pulmonale é Pontuda: amplitude acima de 2,5 mm em DII, DIII ou aVF, com duração normal.',
      'P mitrale é Mole e larga: duração acima de 120 ms, com entalhe e dois componentes.',
      'Sokolow-Lyon: S em V1 somada a R em V5 ou V6 igual ou maior que 35 mm.',
      'Strain vive onde o R é alto: infra descendente com T invertida assimétrica na parede lateral.',
      'Critério de voltagem tem especificidade razoável e sensibilidade baixa. ECG não diagnostica hipertrofia; ele levanta a hipótese e o ecocardiograma resolve.',
      'Átrio esquerdo dilatado é o terreno da fibrilação atrial: achar P mitrale muda o que você vai procurar depois.',
    ],
    errosComuns: [
      {
        erro: 'Trocar amplitude e duração entre os dois átrios.',
        porQue:
          'Existe pelo menos um resumo em circulação no curso que enuncia isso invertido, dizendo que o átrio direito altera a duração e o esquerdo a amplitude. Quem estudou por ele decora a troca.',
        comoEvitar:
          'Ancore no mecanismo, não na frase: o átrio direito despolariza primeiro e some com o segundo componente, então só pode crescer para cima; o esquerdo despolariza depois e, quando atrasa, só pode alargar a onda para a direita no tempo.',
      },
      {
        erro: 'Ler o strain da sobrecarga ventricular esquerda como isquemia lateral aguda.',
        porQue:
          'As duas alterações são infra de ST com T invertida nas mesmas derivações. A diferença está no contexto e na companhia: o strain vem acompanhado de ondas R muito altas e de história de hipertensão ou estenose aórtica de longa data, e é estável ao longo do tempo.',
        comoEvitar:
          'Antes de chamar de isquemia, pergunte se existe critério de voltagem no mesmo traçado e se há sintoma agudo. Hipertenso crônico assintomático com Sokolow altíssimo e infra lateral é sobrecarga até prova em contrário — e a prova em contrário é clínica, não eletrocardiográfica.',
      },
      {
        erro: 'Julgar amplitude sem conferir a calibração.',
        porQue:
          'Todo critério de sobrecarga é um critério de milímetros, e milímetros dependem do ganho. Um traçado registrado em N/2, que é uma calibração legítima e usada em hipertrofia e em criança, corta pela metade a soma de Sokolow.',
        comoEvitar:
          'Confirme o pulso de calibração de 1 mV antes de somar milímetros. Se o pulso mede 5 mm em vez de 10, dobre mentalmente o que você mediu, ou peça outro traçado.',
      },
      {
        erro: 'Fechar sobrecarga atrial esquerda numa zona de medida ambígua.',
        porQue:
          'O guia de OSCE do curso define onda P normal até 0,11 s, enquanto o critério de sobrecarga atrial esquerda mais usado exige duração acima de 0,12 s. Entre esses dois valores existe uma faixa em que nenhuma das duas convenções afirma nada.',
        comoEvitar:
          'Nessa faixa, descreva o achado ("P de 0,115 s, sem entalhe nítido") em vez de nomear diagnóstico. Diagnóstico de sobrecarga atrial esquerda fica mais forte quando duração e entalhe aparecem juntos.',
      },
    ],
    ordemSugerida: ['sobrecargaAD', 'sobrecargaAE', 'sve'],
  },

  /* ----------------------------------------------------------------- bav -- */
  {
    familia: 'bav',
    titulo: 'Bloqueios atrioventriculares: o comportamento do PR classifica tudo',
    promessa:
      'Ao final, diante de uma tira longa você mede o PR de batimentos consecutivos e classifica o bloqueio em primeiro grau, Mobitz I, Mobitz II ou total — e diz, para cada um, se a atropina tem alguma chance de funcionar.',
    porQueImporta:
      'É o tema mais desenvolvido do material do curso e o que mais rende questão de conduta, porque cada grau tem um desfecho diferente: observação, suspensão de droga, ou marcapasso. No plantão, a distinção entre Mobitz I e Mobitz II decide se você observa o paciente ou se chama o serviço de estimulação cardíaca, e a diferença entre as duas condutas é medida em horas de risco de assistolia.',
    fisiopatologia:
      'O nó atrioventricular é o único caminho elétrico entre átrios e ventrículos, e ele é um tecido de condução lenta e decremental: quanto mais rápido você o estimula, mais devagar ele conduz. Além disso, ele recebe inervação vagal abundante. Guarde essas duas propriedades, porque elas explicam praticamente todo o tema.\n\nSe a condução pelo nó está apenas lentificada, mas ainda completa, toda onda P alcança o ventrículo e o único achado é um PR longo e fixo: é o bloqueio de primeiro grau. Se o nó vai se cansando batimento a batimento — condução decremental — o PR cresce progressivamente até que uma onda P chega quando o nó ainda está refratário e simplesmente não passa. Depois da pausa, o nó se recupera e o ciclo recomeça com o PR mais curto. Esse é o fenômeno de Wenckebach, o Mobitz I, e o alongamento progressivo é a impressão digital do mecanismo.\n\nAgora desça um andar. Abaixo do nó AV está o feixe de His e seus ramos, tecido de condução rápida do tipo tudo-ou-nada, e sem inervação vagal significativa. Um bloqueio ali não avisa: a condução é normal, normal, normal, e de repente falha. É o Mobitz II, com PR rigorosamente fixo nos batimentos conduzidos e queda súbita de um QRS. Como a lesão é infranodal, o QRS costuma ser largo, e como o tecido subjacente é instável, a progressão para bloqueio total é uma possibilidade real. Aqui está a consequência prática mais importante do tema: a atropina age bloqueando o vago, e o vago inerva o nó AV, não o His-Purkinje. Por isso atropina resolve Wenckebach e NÃO resolve Mobitz II. Em Mobitz II ou bloqueio total instável, insistir em doses repetidas de atropina é perder tempo — vá para o marcapasso transcutâneo.\n\nNo bloqueio total, nenhum estímulo atrial alcança o ventrículo. Os átrios seguem no ritmo do nó sinusal e os ventrículos passam a depender de um foco de escape que assume mais abaixo. Se o escape nasce na junção, ele é relativamente rápido e o QRS é estreito; se nasce no ventrículo, é lento e o QRS é largo, e é a situação mais frágil. Não existe intervalo PR nesse cenário, porque não existe relação: as ondas P aparecem em qualquer posição, inclusive dentro do QRS e da onda T.',
    comoLer:
      'Neste tema, tira longa não é conforto, é requisito: o padrão só se revela ao longo de vários batimentos. Vá direto a DII longo, localize primeiro as ondas P e confirme que elas estão regulares entre si. Depois pergunte, nesta ordem: toda P conduziu? Se sim, o PR está acima de 200 ms e é fixo? Se alguma P não conduziu, o PR dos batimentos anteriores estava crescendo ou estava fixo? E, por último, existe alguma relação entre P e QRS, ou cada grupo marcha sozinho?',
    ancoras: [
      'PR longo, fixo, e toda P conduz: bloqueio de primeiro grau.',
      'PR que cresce até uma P falhar, e depois recomeça mais curto: Mobitz I, Wenckebach.',
      'PR fixo e uma P falha sem aviso: Mobitz II. Geralmente com QRS largo, porque a lesão é infranodal.',
      'P regulares entre si, QRS regulares entre si, e nenhuma relação entre os dois grupos: bloqueio total.',
      'Atropina funciona no nó AV e não funciona abaixo dele. Mobitz II e bloqueio total instáveis vão direto para marcapasso transcutâneo.',
      'Antes de indicar marcapasso definitivo, exclua causa reversível: betabloqueador, verapamil, diltiazem, digoxina, amiodarona, hipercalemia, isquemia aguda e hipotireoidismo.',
    ],
    errosComuns: [
      {
        erro: 'Chamar de bloqueio de segundo grau um traçado que só tem PR longo.',
        porQue:
          'Um PR de 300 ms impressiona visualmente, mas enquanto todas as ondas P conduzirem não houve falha de condução. O segundo grau começa quando um QRS deixa de acontecer.',
        comoEvitar:
          'Conte as ondas P e conte os QRS na mesma tira. Se os números batem, é primeiro grau, por mais longo que esteja o PR.',
      },
      {
        erro: 'Classificar como Mobitz I ou II um bloqueio 2:1.',
        porQue:
          'No bloqueio 2:1, uma P conduz e a seguinte é bloqueada, alternadamente. Como nunca existem dois PR conduzidos consecutivos, não há como saber se o PR estava crescendo. Ele é literalmente inclassificável nos dois tipos.',
        comoEvitar:
          'Nomeie o que é: "BAV 2:1". As pistas indiretas de sítio são a largura do QRS — largo sugere infranodal — e a resposta à atropina ou ao exercício. Bloqueio avançado, ou de alto grau, é outra entidade: duas ou mais ondas P consecutivas bloqueadas.',
      },
      {
        erro: 'Confundir extrassístole atrial bloqueada com bloqueio atrioventricular.',
        porQue:
          'Nos dois casos aparece uma onda P sem QRS. A diferença é que a P da extrassístole é prematura e tem morfologia diferente da sinusal, muitas vezes escondida dentro da onda T do batimento anterior, e o intervalo entre as P sinusais permanece regular.',
        comoEvitar:
          'Antes de contar a P sem QRS como bloqueio, confira se ela chegou adiantada e se a cadência das demais P está preservada. O material do curso registra explicitamente que essa é uma confusão frequente na prática.',
      },
      {
        erro: 'Gastar tempo com doses repetidas de atropina em bloqueio infranodal instável.',
        porQue:
          'A atropina acelera o átrio sem melhorar a condução abaixo do nó AV. O resultado pode ser mais ondas P bloqueadas, e não mais batimentos conduzidos, com piora da frequência ventricular.',
        comoEvitar:
          'Em Mobitz II ou bloqueio total com instabilidade, monte o marcapasso transcutâneo desde já e use adrenalina ou dopamina em infusão como ponte. Não espere chegar à dose máxima de atropina para mudar de estratégia.',
      },
    ],
    ordemSugerida: ['bav1', 'mobitz1', 'mobitz2', 'bavt'],
  },

  /* ---------------------------------------------------------------- ramo -- */
  {
    familia: 'ramo',
    titulo: 'Bloqueios de ramo: o QRS largo e o que V1 responde',
    promessa:
      'Ao final, diante de um QRS igual ou maior que 120 ms você olha V1 e decide em segundos se é bloqueio de ramo direito ou esquerdo, e sabe por que só um dos dois muda a conduta em dor torácica.',
    porQueImporta:
      'Bloqueio de ramo é a causa mais comum de QRS largo em ritmo sinusal, e reconhecê-lo evita dois erros opostos: ler como isquemia uma alteração de repolarização que é obrigatória no bloqueio, e deixar passar um infarto escondido dentro de um bloqueio de ramo esquerdo. O segundo erro é o que mata paciente.',
    fisiopatologia:
      'Em condições normais, o feixe de His se divide em ramo direito e ramo esquerdo, e os dois ventrículos são ativados quase ao mesmo tempo por Purkinje. Se um dos ramos está bloqueado, o ventrículo correspondente não recebe o estímulo pela via rápida: ele é despolarizado depois, de forma indireta, pelo miocárdio do outro lado, célula a célula. Conduzir músculo a músculo é lento, e é isso que alarga o QRS para 120 ms ou mais. O QRS largo, portanto, é literalmente o tempo extra que o estímulo levou para dar a volta.\n\nNo bloqueio de ramo direito, o ventrículo esquerdo despolariza primeiro e no tempo certo, e o direito depois. V1 fica em cima do ventrículo direito. Ele registra primeiro a atividade septal e esquerda e depois, com atraso, um segundo vetor vindo em sua direção — daí o padrão rsR’, as chamadas orelhas de coelho, e a onda S alargada em DI e V6, que são as derivações do lado oposto. No bloqueio de ramo esquerdo é o inverso: o ventrículo esquerdo, que é a maior massa, ativa por último e da direita para a esquerda. V1 vê todo esse vetor se afastando e escreve um complexo largo e negativo; DI, aVL e V6 escrevem uma R larga e entalhada. Fica a regra de bolso que o material do estágio ensina e que funciona: em V1, QRS largo para cima é ramo direito; QRS largo para baixo é ramo esquerdo.\n\nA repolarização é a parte que confunde. Quando a despolarização é anormal, a repolarização acompanha, e o segmento ST e a onda T ficam discordantes do QRS — apontando para o lado oposto da deflexão principal. Isso é esperado, não é isquemia. No bloqueio de ramo direito, a T invertida em V1 e V2 é obrigatória. No bloqueio de ramo esquerdo, existe supradesnivelamento nas precordiais direitas e infra nas esquerdas por definição, e é exatamente isso que mascara um infarto. Os critérios de Sgarbossa foram criados para achar oclusão coronária dentro desse ruído: supra de ST igual ou maior que 1 mm CONCORDANTE com o QRS; infra de ST igual ou maior que 1 mm em V1 a V3; e supra discordante desproporcional, que na versão modificada de Smith é avaliado pela razão entre o desvio do ST e a amplitude da S, com corte em menos 0,25.',
    comoLer:
      'Aqui a ordem é rígida e curta. Meça a duração do QRS: abaixo de 120 ms, este tema não se aplica. Igual ou acima de 120 ms, vá a V1 e olhe apenas a direção da deflexão principal. Confirme com DI e V6, procurando a S alargada do ramo direito ou a R entalhada do ramo esquerdo. Só então olhe ST e T, e olhe já sabendo que a alteração discordante é esperada.',
    ancoras: [
      'QRS igual ou maior que 120 ms é o portão de entrada. Entre 110 e 120 ms fala-se em bloqueio incompleto.',
      'V1 positivo com rsR’: ramo direito. V1 negativo e largo: ramo esquerdo.',
      'T invertida em V1 e V2 no bloqueio de ramo direito é discordância obrigatória, não infarto.',
      'Bloqueio de ramo direito isolado não desvia o eixo. Se houver desvio, pense em bloqueio bifascicular associado a hemibloqueio.',
      'Bloqueio de ramo esquerdo novo, ou de idade indeterminada, com dor torácica: conduza como síndrome coronariana aguda.',
      'No Brasil, a associação de bloqueio de ramo direito com hemibloqueio anterior esquerdo é o padrão clássico da cardiopatia chagásica.',
    ],
    errosComuns: [
      {
        erro: 'Chamar de infarto anterosseptal a onda T invertida de V1 e V2 num bloqueio de ramo direito.',
        porQue:
          'A alteração de repolarização é secundária ao distúrbio de condução e está presente por definição. Interpretá-la como evento agudo gera investigação desnecessária.',
        comoEvitar:
          'Sempre que encontrar T invertida nas precordiais direitas, meça antes a largura do QRS e olhe a morfologia em V1. Achou orelha de coelho, a T invertida está explicada.',
      },
      {
        erro: 'Tentar laudar isquemia dentro de um bloqueio de ramo esquerdo pelos critérios habituais de supra.',
        porQue:
          'O bloqueio de ramo esquerdo já desloca o ST por conta própria, e sempre na direção oposta ao QRS. Aplicar o limiar comum de 1 mm sem considerar a discordância produz falso-positivo em série e, pior, falso-negativo quando o supra verdadeiro é discordante e desproporcional.',
        comoEvitar:
          'Use Sgarbossa. Procure primeiro concordância — supra onde o QRS é positivo, infra onde ele é negativo — porque concordância nunca é explicada pelo bloqueio.',
      },
      {
        erro: 'Assumir que bloqueio de ramo esquerdo com dor sempre libera trombólise imediata.',
        porQue:
          'O guia do curso registra "bloqueio de ramo esquerdo novo mais clínica igual a equivalente de supra", que era a formulação antiga. A prática atual não trata todo bloqueio de ramo esquerdo novo como equivalente automático: ele obriga a conduzir como síndrome coronariana aguda e a aplicar Sgarbossa para identificar a oclusão.',
        comoEvitar:
          'Trate a urgência como real e a decisão de reperfusão como clínica somada a critério, não como reflexo. Saiba que as duas formulações circulam e confirme qual o seu professor cobra.',
      },
    ],
    ordemSugerida: ['brd', 'bre'],
  },

  /* --------------------------------------------------------------- taqui -- */
  {
    familia: 'taqui',
    titulo: 'Taquiarritmias: largura, regularidade e estabilidade decidem tudo',
    promessa:
      'Ao final, diante de qualquer taquicardia você responde em ordem: o QRS é estreito ou largo, o ritmo é regular ou irregular, os complexos são monomórficos ou polimórficos, e o paciente está estável — e a conduta sai dessas quatro respostas.',
    porQueImporta:
      'Esta é a família em que a decisão é mais tempo-dependente e em que o erro tem consequência imediata. A prova cobra o algoritmo em quase todo caso clínico de palpitação, e o plantão cobra a mesma sequência com o paciente na sua frente. Além disso, é aqui que mora o erro mais perigoso de todo o tema do ECG: escolher o modo errado de choque.',
    fisiopatologia:
      'Uma taquicardia acontece por um de três mecanismos: automatismo aumentado, atividade deflagrada ou reentrada. A reentrada é o mecanismo dominante das taquicardias que você vai reconhecer no traçado, e explica dois achados que a prova adora. Primeiro, o início e o término súbitos: um circuito ou está girando ou não está, sem meio-termo — por isso a taquicardia supraventricular paroxística começa e para de uma vez, enquanto a taquicardia sinusal, que é automatismo modulado por catecolaminas, acelera e desacelera gradualmente. Segundo, a frequência fixa: o circuito tem um tempo de volta praticamente constante.\n\nA largura do QRS diz onde a taquicardia está usando o sistema de condução normal. Se o circuito está acima da bifurcação do feixe de His, o estímulo desce por Purkinje e o QRS é estreito: é uma taquicardia supraventricular, e nela se encaixam a reentrada nodal, o flutter e a fibrilação atrial. Se o QRS é largo, ou o estímulo nasce no próprio ventrículo — taquicardia ventricular — ou nasce acima mas encontra um ramo bloqueado no caminho, o que se chama aberrância. Em quem tem cardiopatia estrutural ou infarto prévio, a maioria esmagadora das taquicardias de QRS largo é ventricular, e é por isso que a regra é: QRS largo é taquicardia ventricular até prova em contrário.\n\nA regularidade separa o resto. A fibrilação atrial nasce de múltiplos circuitos caóticos nos átrios, que despolarizam centenas de vezes por minuto sem contração organizada; o nó AV deixa passar alguns estímulos ao acaso, e é esse filtro aleatório que produz o RR irregularmente irregular e a ausência de onda P. O flutter, ao contrário, é um macrocircuito único e organizado, girando a cerca de 300 por minuto, que escreve ondas F em dente de serra sem linha isoelétrica entre elas; quando o nó AV conduz uma em cada duas, a frequência ventricular cai perto de 150. Por isso toda taquicardia regular de QRS estreito em torno de 150 bpm deve levantar a suspeita de flutter 2:1.\n\nA morfologia dos complexos separa as duas taquicardias ventriculares. Na monomórfica, todos os complexos têm a mesma forma, porque o circuito é fixo. Na polimórfica, a forma e a polaridade mudam continuamente, e quando isso acontece sobre um QT prolongado, chama-se torsades de pointes: o eixo parece torcer em torno da linha de base, produzindo fusos de amplitude crescente e decrescente. Essa diferença morfológica não é estética; ela determina o modo do choque, porque o sincronizador precisa marcar uma onda R consistente para disparar, e em morfologia variável ele não consegue.',
    comoLer:
      'Comece pela largura do QRS, medida na derivação em que o complexo for mais largo, e não pela frequência. Depois marque três ou quatro intervalos RR consecutivos e decida regularidade — irregularidade em taquicardia de QRS estreito aponta fibrilação atrial. Em seguida procure atividade atrial: onda P sinusal, onda P retrógrada depois do QRS, ondas F em dente de serra ou ondulação fina. Só ao final compare a forma dos complexos entre si. E, em paralelo a tudo isso, olhe o paciente: hipotensão, alteração aguda do estado mental, sinais de choque, desconforto torácico isquêmico e insuficiência cardíaca aguda são os cinco sinais que definem instabilidade.',
    ancoras: [
      'Estreito e regular: manobra vagal, depois adenosina 6 mg IV em bólus rápido com flush, repetível com 12 mg.',
      'Estreito e irregular: fibrilação atrial até prova em contrário.',
      'Largo e regular: taquicardia ventricular até prova em contrário, sobretudo com cardiopatia estrutural.',
      'Largo e irregular: pense em fibrilação atrial pré-excitada, fibrilação atrial com aberrância ou taquicardia polimórfica.',
      'Instável com ritmo organizado e monomórfico: cardioversão SINCRONIZADA, com sedação no paciente consciente.',
      'Instável com ritmo POLIMÓRFICO, ou na dúvida entre monomórfico e polimórfico: choque NÃO sincronizado. Não atrase o choque para analisar melhor o ritmo.',
    ],
    errosComuns: [
      {
        erro: 'Tentar cardioversão sincronizada numa taquicardia ventricular polimórfica instável.',
        porQue:
          'O aparelho precisa identificar picos de R consistentes para disparar no momento certo. Com amplitude e polaridade variando a cada complexo, ele não encontra o marcador e o choque simplesmente não sai — e o tempo passa com o paciente em colapso.',
        comoEvitar:
          'Diante de complexos de formas diferentes entre si, ou de qualquer dúvida entre monomórfico e polimórfico, use choque não sincronizado em alta energia. Este é o erro mais perigoso de todo o tema.',
      },
      {
        erro: 'Tratar uma taquicardia de QRS largo como se fosse supraventricular e administrar bloqueador do nó AV.',
        porQue:
          'Verapamil e diltiazem em taquicardia ventricular podem causar colapso hemodinâmico e degeneração para fibrilação ventricular. Na fibrilação atrial pré-excitada, bloquear o nó AV favorece a condução pela via acessória e produz o mesmo desfecho.',
        comoEvitar:
          'Assuma origem ventricular por padrão. Sobre a adenosina, a regra de bolso "nunca em QRS largo" é boa porque o erro que ela previne é grave; formalmente, ela pode ser considerada em taquicardia de QRS largo REGULAR e MONOMÓRFICA quando há dúvida diagnóstica e o paciente está estável, e é proibida se o ritmo for irregular, polimórfico ou pré-excitado.',
      },
      {
        erro: 'Cardioverter uma fibrilação atrial de início indeterminado sem preparo.',
        porQue:
          'Restaurar a contração atrial em um átrio que ficou parado por dias pode lançar um trombo na circulação sistêmica. A anticoagulação prévia ou o ecocardiograma transesofágico existem para evitar isso.',
        comoEvitar:
          'Cardioversão eletiva exige anticoagulação adequada por período suficiente ou ecocardiograma transesofágico excluindo trombo, e anticoagulação mantida depois do procedimento. Note a divergência de convenções: o limiar clássico de duração é de 48 horas, e a diretriz europeia de 2024 baixou esse limiar para 24 horas. Paciente instável, contudo, cardioverte imediatamente.',
      },
      {
        erro: 'Cardioverter taquicardia sinusal.',
        porQue:
          'Taquicardia sinusal é resposta a uma causa — dor, febre, hipovolemia, hipóxia, sepse, tireotoxicose. Chocar o ritmo próprio do paciente não corrige nada e retira a compensação que o mantinha perfundido.',
        comoEvitar:
          'Antes de indicar choque, confirme que existe onda P sinusal antes de cada QRS. O manual de suporte avançado é literal: nunca faça cardioversão em paciente com ritmo sinusal.',
      },
      {
        erro: 'Considerar diagnóstico fechado a fibrilação atrial só pela irregularidade.',
        porQue:
          'Flutter com condução variável e taquicardia atrial multifocal também são irregulares. O que separa é a atividade atrial: ondas F organizadas em dente de serra no flutter, três ou mais morfologias de onda P na multifocal, e nenhuma onda organizada na fibrilação.',
        comoEvitar:
          'Depois de constatar irregularidade, procure ativamente a linha de base em DII, DIII, aVF e V1. Manobra vagal ou adenosina desmascaram o flutter ao frear o nó AV temporariamente.',
      },
    ],
    ordemSugerida: ['tsv', 'flutter', 'fa', 'tv', 'torsades'],
  },

  /* -------------------------------------------------------------- parada -- */
  {
    familia: 'parada',
    titulo: 'Ritmos de parada: a única pergunta que importa é se choca',
    promessa:
      'Ao final, diante de um monitor em parada cardiorrespiratória você separa em segundos ritmo chocável de não chocável e sabe o que fazer com cada um, sem sincronizar nada.',
    porQueImporta:
      'Aqui o ECG deixa de ser exame e vira decisão de segundos. Errar para menos, deixando de desfibrilar uma fibrilação ventricular, custa sobrevida a cada minuto de atraso; errar para mais, chocando uma assistolia, interrompe compressões que são a única coisa mantendo perfusão cerebral. E antes das duas coisas existe uma terceira, que é confirmar que o traçado é do paciente e não do cabo.',
    fisiopatologia:
      'A fibrilação ventricular é a desorganização elétrica completa do ventrículo: múltiplas frentes de despolarização girando ao acaso, sem que nenhuma consiga recrutar a massa muscular de forma coordenada. Sem despolarização organizada não há contração, e sem contração não há débito. No traçado não existem P, QRS ou T reconhecíveis — apenas ondulação caótica, inicialmente grosseira e progressivamente mais fina à medida que as reservas de energia do miocárdio se esgotam, até chegar à assistolia. O choque não sincronizado funciona porque despolariza toda a massa ventricular de uma vez, apagando os circuitos simultaneamente e dando ao marcapasso natural a chance de reassumir. Não há onda R para sincronizar, e por isso o modo sincronizado não deve ser usado: ele procuraria um marcador que não existe e não dispararia.\n\nA assistolia é a ausência de atividade elétrica. O traçado é praticamente uma linha, com no máximo uma oscilação mínima de base. Não há o que desfibrilar, porque não há circuito girando para interromper — o problema não é desorganização, é ausência. A conduta é compressão de alta qualidade e adrenalina precoce, enquanto se procuram as causas reversíveis. Antes de aceitar o diagnóstico, porém, confirme o óbvio: cheque o paciente, confira os cabos, aumente o ganho e olhe outra derivação, porque fibrilação ventricular fina e eletrodo desconectado desenham a mesma coisa no monitor.\n\nEssa é a lógica que organiza o tema inteiro: ritmo desorganizado com atividade elétrica presente é chocável; ausência de atividade elétrica, ou atividade organizada sem pulso, não é. A atividade elétrica sem pulso pertence a este último grupo e é diagnóstico clínico, não eletrocardiográfico: o monitor mostra um ritmo que parece capaz de gerar débito, e o paciente não tem pulso. Nesses casos a resposta está nas causas reversíveis — hipóxia, hipovolemia, acidose, distúrbios do potássio, hipotermia, pneumotórax hipertensivo, tamponamento, toxinas, trombose coronária e trombose pulmonar.',
    comoLer:
      'A leitura formal em nove passos não se aplica aqui, e insistir nela custa tempo. Confirme primeiro que o paciente está sem pulso e sem resposta. Depois olhe o monitor para uma pergunta só: existe atividade elétrica desorganizada, existe ausência de atividade, ou existe atividade organizada? Antes de declarar linha reta, aumente o ganho e confira outra derivação e os cabos.',
    ancoras: [
      'Fibrilação ventricular e taquicardia ventricular sem pulso são chocáveis. Assistolia e atividade elétrica sem pulso não são.',
      'Em parada, o choque é sempre NÃO sincronizado. Não existe onda R para o aparelho marcar.',
      'Retome as compressões imediatamente após o choque, sem parar para reavaliar o ritmo.',
      'Adrenalina 1 mg IV a cada 3 a 5 minutos; amiodarona 300 mg após o terceiro choque no ritmo chocável.',
      'Linha reta no monitor pede protocolo: checar paciente, cabos, ganho e uma segunda derivação antes de assumir assistolia.',
      'Causas reversíveis: hipóxia, hipovolemia, acidose, hipo e hipercalemia, hipotermia, pneumotórax hipertensivo, tamponamento, toxinas, trombose coronária e trombose pulmonar.',
    ],
    errosComuns: [
      {
        erro: 'Apertar o botão de sincronizar antes de chocar uma fibrilação ventricular.',
        porQue:
          'O modo sincronizado espera um pico de onda R para disparar. Na fibrilação ventricular não existe onda R, então a carga permanece no aparelho e o choque não é administrado.',
        comoEvitar:
          'Em parada, o modo é desfibrilação. Lembre também que a maioria dos aparelhos retorna sozinha ao modo não sincronizado depois de cada choque — o que é conveniente aqui e é armadilha na cardioversão eletiva, onde é preciso reativar o sincronismo a cada tentativa.',
      },
      {
        erro: 'Desfibrilar assistolia na esperança de "ver se volta".',
        porQue:
          'Não há atividade elétrica organizada para interromper e o choque não recruta nada. O custo é real: a pausa nas compressões derruba a pressão de perfusão coronária, que leva vários ciclos para ser reconstruída.',
        comoEvitar:
          'Trate a assistolia como o que ela é: compressões de alta qualidade, adrenalina precoce e busca ativa de causa reversível.',
      },
      {
        erro: 'Aceitar linha reta no monitor sem examinar o paciente.',
        porQue:
          'Eletrodo desconectado, cabo partido e ganho muito baixo produzem exatamente a mesma imagem. Fibrilação ventricular fina também pode parecer assistolia num ganho inadequado.',
        comoEvitar:
          'A regra é olhar o paciente, não o monitor. Confirme ausência de pulso, confira as conexões, aumente o ganho e troque a derivação antes de mudar de algoritmo.',
      },
    ],
    ordemSugerida: ['fv', 'assistolia'],
  },

  /* ------------------------------------------------------------ isquemia -- */
  {
    familia: 'isquemia',
    titulo: 'Isquemia e infarto: distribuição, morfologia e imagem em espelho',
    promessa:
      'Ao final, diante de um supradesnivelamento você decide se ele é localizado e convexo com recíproca — oclusão coronária — ou difuso e côncavo com infra de PR — pericardite; e, diante de um infra, você lista o que precisa descartar antes de dizer que não há oclusão.',
    porQueImporta:
      'É a família em que a decisão é mais tempo-dependente e em que a prova moderna mais cobra. Confundir pericardite com infarto pode levar a trombolisar um paciente que sangraria no pericárdio; deixar de reconhecer um equivalente de oclusão pode custar a artéria inteira. E existe uma armadilha de conduta específica, marcada pelo próprio guia do curso, que é a do infarto de ventrículo direito.',
    fisiopatologia:
      'A oclusão de uma artéria coronária interrompe o fluxo em um território definido, e a lesão se instala de fora para dentro da parede: a região subepicárdica, transmural, é a que produz supradesnivelamento do segmento ST. Como o território é o de uma artéria, o supra aparece em derivações contíguas — as que enxergam aquela parede — e as derivações que olham a parede oposta registram o mesmo fenômeno de trás, escrevendo infradesnivelamento. Essa é a imagem em espelho, ou recíproca, e ela é uma consequência geométrica da oclusão localizada. A morfologia acompanha: o supra da oclusão é convexo, abaulado, "em abóbada", e tende a se fundir com a onda T.\n\nQuando a isquemia é subendocárdica, atingindo só a camada interna, o vetor de lesão aponta para dentro e o resultado é infradesnivelamento horizontal ou descendente, com ou sem inversão de T. Esse é o padrão da síndrome coronariana aguda sem supradesnivelamento, em que não há indicação de trombólise e a estratégia invasiva é definida por risco e refratariedade dos sintomas. O ponto que a prova moderna cobra é o que se descarta antes de aceitar essa classificação: o infarto dorsal, que se apresenta como infra em V1 a V3 espelhando um supra que só aparece em V7 a V9; o padrão de De Winter, com infra ascendente no ponto J acompanhado de onda T hiperaguda, que indica oclusão proximal da artéria descendente anterior; a onda T hiperaguda isolada, larga e de base ampla; e os critérios de Sgarbossa dentro de bloqueio de ramo esquerdo ou de ritmo de marcapasso. Esses quatro são equivalentes de oclusão. O supradesnivelamento em aVR acompanhado de infra difuso NÃO entra nessa lista: ele indica isquemia subendocárdica global por lesão de tronco ou doença triarterial, e a conduta é angiografia urgente, não trombólise.\n\nA pericardite tem outra fisiopatologia e por isso outro desenho. A inflamação envolve o saco pericárdico inteiro, e não o território de uma artéria: o supra é difuso, presente em quase todas as derivações, poupando aVR e V1, onde ocorre o inverso. Como não há território, não há imagem em espelho. A morfologia é côncava, "em sorriso", e há um achado adicional e bastante específico: o infradesnivelamento do segmento PR, produzido pelo comprometimento da repolarização atrial. Note que se trata do segmento PR, não do intervalo — a confusão entre os dois é comum e faz o achado passar despercebido.',
    comoLer:
      'Aqui a pergunta central não é "existe supra", é "onde e com que forma". Localize o desvio no ponto J, que é o fim do QRS, e não no meio do segmento. Depois mapeie a distribuição: derivações contíguas de uma parede apontam para artéria; distribuição por quase todas as derivações aponta para pericárdio. Procure ativamente a imagem em espelho na parede oposta. Avalie a concavidade. E, em todo quadro inferior, peça V3R e V4R antes de prescrever.',
    ancoras: [
      'Supra medido no ponto J, em duas derivações contíguas: igual ou maior que 1 mm na maioria das derivações — mas em V2 e V3 o limiar muda para 2 mm em homens de 40 anos ou mais, 2,5 mm em homens abaixo de 40 e 1,5 mm em mulheres de qualquer idade.',
      'Supra localizado, convexo e com recíproca aponta oclusão. Supra difuso, côncavo, com infra de PR e sem recíproca aponta pericardite.',
      'Infra horizontal ou descendente tem valor; infra ascendente tem valor bem menor.',
      'Equivalentes de oclusão sem supra clássico: dorsal, De Winter, T hiperaguda e Sgarbossa no bloqueio de ramo esquerdo ou no ritmo de marcapasso.',
      'Supra em aVR com infra difuso: alto risco de lesão de tronco ou triarterial, angiografia urgente, NÃO trombólise.',
      'Tempo é músculo: a decisão de reperfusão não espera troponina.',
    ],
    errosComuns: [
      {
        erro: 'Atribuir a contraindicação de nitrato, morfina e diurético ao infarto de "parede inferior".',
        porQue:
          'O material de OSCE do curso enuncia dessa forma, e está impreciso. A contraindicação existe quando há acometimento do ventrículo direito, cujo débito depende de pré-carga: reduzir a pré-carga nesse paciente causa hipotensão grave. Nem todo infarto inferior tem envolvimento do ventrículo direito.',
        comoEvitar:
          'Em todo infarto inferior, peça V3R e V4R. Havendo infarto de ventrículo direito, a conduta é volume, e nitrato, morfina e diurético estão contraindicados. Sem envolvimento do ventrículo direito, a contraindicação não se aplica automaticamente.',
      },
      {
        erro: 'Trombolisar um supradesnivelamento difuso de pericardite.',
        porQue:
          'A pericardite eleva o ST em quase todas as derivações e pode enganar quem só procurou "supra maior que 1 mm". Trombolisar pericárdio inflamado pode causar hemopericárdio.',
        comoEvitar:
          'Antes de reperfundir, confirme distribuição territorial e imagem em espelho. Procure o infra de PR e a concavidade. Some a clínica: dor que piora deitado e melhora sentado inclinado para a frente, e atrito pericárdico à ausculta.',
      },
      {
        erro: 'Tratar supra em aVR com infra difuso como equivalente de STEMI e indicar fibrinólise.',
        porQue:
          'Apenas uma minoria desses pacientes tem oclusão trombótica aguda; o padrão reflete isquemia subendocárdica global. A trombólise não é a conduta e o padrão não consta da lista de equivalentes de oclusão.',
        comoEvitar:
          'Reconheça como marcador de alto risco e encaminhe para angiografia urgente. Mantenha essa linha separada da lista de equivalentes, para não misturar as duas condutas.',
      },
      {
        erro: 'Concluir "sem supra, sem oclusão" e encerrar a investigação.',
        porQue:
          'Infarto dorsal, De Winter, T hiperaguda e Sgarbossa se apresentam sem o supra clássico nas derivações habituais e exigem reperfusão. O infra em V1 a V3 com R alta é justamente o espelho de um supra que ninguém registrou.',
        comoEvitar:
          'Diante de infra nas precordiais direitas com clínica compatível, peça V7 a V9. Diante de bloqueio de ramo esquerdo ou de ritmo de marcapasso com dor, aplique Sgarbossa antes de descartar.',
      },
      {
        erro: 'Confundir infra de PR com alteração do intervalo PR.',
        porQue:
          'São coisas diferentes: o intervalo PR mede tempo de condução; o segmento PR é a linha entre o fim da P e o início do QRS, e é ela que se deprime na pericardite.',
        comoEvitar:
          'Olhe a altura da linha entre a onda P e o QRS, comparando com o segmento TP. Se ela está abaixo, isso é infra de PR e é um dos dois melhores discriminadores contra oclusão.',
      },
    ],
    ordemSugerida: ['stemi', 'infraST', 'pericardite'],
  },

  /* ----------------------------------------------------------- eletrolito -- */
  {
    familia: 'eletrolito',
    titulo: 'Potássio no traçado: a onda T que sobe e a onda U que aparece',
    promessa:
      'Ao final, você reconhece a sequência eletrocardiográfica da hipercalemia antes que o QRS alargue, distingue a onda T da hipercalemia da onda T hiperaguda da isquemia e sabe qual droga entra primeiro quando o ECG já mudou.',
    porQueImporta:
      'A hipercalemia é o distúrbio eletrolítico que mais mata através do ECG, e o traçado costuma mudar antes de o resultado do potássio chegar do laboratório. Reconhecer o padrão é o que autoriza começar o tratamento imediatamente. Do outro lado, a hipocalemia é o terreno da torsades e é causa frequente de arritmia ventricular em paciente que usa diurético.',
    fisiopatologia:
      'O potássio extracelular determina o potencial de repouso da célula miocárdica. Quando ele sobe, o potencial de repouso fica menos negativo e a repolarização passa a acontecer mais rápido e de forma mais uniforme: no traçado, isso escreve uma onda T alta, ESTREITA, SIMÉTRICA e apiculada, a chamada T "em tenda". É o primeiro sinal, e é o que dá tempo de agir. Se o potássio continua subindo, os canais rápidos de sódio começam a se inativar por despolarização parcial: a condução atrial fica lenta e a onda P se achata até desaparecer, o intervalo PR se alarga, e depois o próprio QRS se alarga de forma difusa, sem assumir a morfologia típica de bloqueio de ramo — porque a lentificação é do miocárdio inteiro, e não de um fascículo. No extremo, QRS e T se fundem em uma onda sinusoidal, que antecede a parada.\n\nEssa sequência explica a ordem do tratamento. O gluconato de cálcio não baixa o potássio: ele restaura a diferença entre o potencial de repouso e o limiar, estabilizando eletricamente a membrana e protegendo o coração enquanto o resto age. Por isso, quando o ECG já mudou, o cálcio vem primeiro. Só depois se desloca o potássio para dentro da célula com insulina associada a glicose e com beta-2 agonista inalatório, e por último se remove potássio do corpo, com diurético de alça, resina de troca ou diálise conforme o caso.\n\nNa hipocalemia o mecanismo se inverte: a repolarização se prolonga e se torna heterogênea. A onda T achata e uma onda U, que corresponde à repolarização tardia, ganha amplitude e aparece logo depois dela. Quando as duas se fundem, o que parece um QT muito longo é na verdade um intervalo QU, e essa distinção importa na hora de medir. Some a isso um infradesnivelamento discreto de ST e você tem o padrão completo. A consequência clínica é a instabilidade elétrica ventricular, com predisposição a torsades — risco que se soma ao de qualquer droga que prolongue o QT. E existe um detalhe de tratamento que a prova cobra: sem corrigir o magnésio, a reposição de potássio não se sustenta, porque a hipomagnesemia aumenta a excreção renal de potássio.',
    comoLer:
      'Neste tema o olhar começa na onda T e depois anda para trás. Avalie a T primeiro: altura, largura da base e simetria. Depois volte para a onda P e pergunte se ela ainda existe e com que amplitude. Em seguida meça a largura do QRS, comparando com traçados anteriores se houver. Por último, procure onda U depois da T, e decida se o que você mediu como QT terminou na T ou já incluiu a U.',
    ancoras: [
      'A T da hipercalemia é alta, estreita, simétrica e de base estreita. A T hiperaguda da isquemia é larga e de base ampla.',
      'Sequência da hipercalemia: T em tenda, achatamento da P, alargamento do PR e do QRS, onda sinusoidal.',
      'Com ECG alterado, o gluconato de cálcio vem primeiro: ele protege a membrana sem baixar o potássio.',
      'Hipocalemia: T achatada, onda U proeminente, infra discreto de ST. O que se alonga é o QU, não o QT.',
      'Reponha potássio e magnésio juntos. Sem magnésio, a reposição de potássio não sustenta.',
      'Hipercalemia é causa reversível de bradicardia e de bloqueio atrioventricular. Cheque o potássio antes de indicar marcapasso.',
    ],
    errosComuns: [
      {
        erro: 'Ler a onda T apiculada da hipercalemia como onda T hiperaguda de oclusão coronária.',
        porQue:
          'As duas são ondas T altas e chamam atenção pela amplitude. A diferença está na forma: a da hipercalemia é estreita, simétrica e de base estreita; a da isquemia é larga, assimétrica e de base ampla, e vem em território coronariano.',
        comoEvitar:
          'Compare a largura da base antes da altura, e leia o contexto: insuficiência renal, uso de inibidor da enzima conversora ou de espironolactona, rabdomiólise e acidose puxam para hipercalemia.',
      },
      {
        erro: 'Esperar o resultado do potássio para tratar um traçado já alterado.',
        porQue:
          'A alteração eletrocardiográfica indica que a membrana já está comprometida, e a progressão para alargamento do QRS e onda sinusoidal pode ser rápida. O laboratório confirma; ele não autoriza começar.',
        comoEvitar:
          'ECG compatível com hipercalemia em paciente de risco é emergência: cálcio primeiro, depois insulina com glicose e beta-2, depois remoção. Colha o exame, mas não pare o tratamento por causa dele.',
      },
      {
        erro: 'Excluir hipercalemia grave porque o ECG está normal.',
        porQue:
          'A correlação entre o nível sérico de potássio e as alterações eletrocardiográficas é imperfeita. Existem pacientes com hipercalemia grave e traçado pouco alterado, sobretudo quando a elevação é crônica.',
        comoEvitar:
          'Use o ECG para acelerar a decisão quando ele estiver alterado, e não para descartar quando ele estiver normal. Aqui, ausência de achado não é achado de ausência.',
      },
      {
        erro: 'Medir o QT incluindo a onda U na hipocalemia.',
        porQue:
          'Quando a T se funde com a U, a medida resultante é o intervalo QU, sistematicamente maior que o QT. Isso produz um QTc falsamente alarmante e desvia a conduta.',
        comoEvitar:
          'Meça na derivação em que o fim da onda T for mais nítido e identifique o ponto em que a T volta à linha de base antes de a U começar. Na dúvida, registre que a medida está prejudicada pela onda U.',
      },
    ],
    ordemSugerida: ['hipercalemia', 'hipocalemia'],
  },

  /* -------------------------------------------------------------- outros -- */
  {
    familia: 'outros',
    titulo: 'Outros padrões de alto rendimento: pré-excitação, QT longo e escape',
    promessa:
      'Ao final, você reconhece a tríade de PR curto, onda delta e QRS largo da pré-excitação, mede e corrige o QT sabendo qual convenção está usando, e identifica um ritmo de escape sem tentar suprimi-lo.',
    porQueImporta:
      'Os três padrões desta seção têm em comum o fato de mudarem a conduta de forma desproporcional ao seu tamanho no traçado. A pré-excitação transforma drogas rotineiras em risco de fibrilação ventricular. O QT longo é o substrato da torsades e está frequentemente sendo produzido por uma prescrição em curso. E o ritmo de escape é a única coisa mantendo o débito de um paciente bradicárdico — suprimi-lo é iatrogenia direta.',
    fisiopatologia:
      'Na pré-excitação existe uma via acessória, uma ponte de músculo que liga átrio e ventrículo por fora do nó atrioventricular, mais conhecida como feixe de Kent. Como essa via não tem o atraso fisiológico do nó, parte do ventrículo começa a despolarizar mais cedo — daí o PR curto, abaixo de 120 ms. Mas essa despolarização precoce acontece fora do sistema de condução rápido, propagando-se músculo a músculo: o início do QRS fica lento e empastado, e é isso que se chama onda delta. O restante do ventrículo é ativado normalmente pelo estímulo que veio pelo nó AV, e o complexo final é uma fusão dos dois. O perigo aparece quando surge fibrilação atrial: a via acessória não tem a capacidade de filtrar estímulos que o nó AV tem, e pode conduzir centenas de impulsos por minuto ao ventrículo. Bloquear o nó AV nessa situação — com adenosina, verapamil, diltiazem, digoxina e possivelmente betabloqueador — direciona ainda mais tráfego para a via acessória e pode degenerar em fibrilação ventricular. A conduta na fibrilação atrial pré-excitada é cardioversão elétrica se instável, e procainamida quando estável.\n\nO intervalo QT mede o tempo total entre o início da despolarização ventricular e o fim da repolarização, e ele encurta quando a frequência sobe e alonga quando ela cai. Por isso não se interpreta o QT bruto: corrige-se pela frequência. A fórmula de Bazett divide o QT pela raiz quadrada do RR em segundos; ela é a mais usada e a que o guia do curso ensina, mas superestima em taquicardia e subestima em bradicardia, de modo que fora da faixa de 60 a 100 bpm é preferível Fridericia. Um QT prolongado significa repolarização heterogênea e janela vulnerável ampliada, que é o terreno em que uma extrassístole bem posicionada dispara a torsades. Aqui existe uma divergência de fontes que você precisa conhecer, e não resolver por conta própria: a Diretriz da Sociedade Brasileira de Cardiologia de 2022 define QTc normal até 450 ms em homens e 470 ms em mulheres, enquanto o guia de OSCE que circula no curso usa 450 e 460 ms. As duas convenções existem e são citáveis; a de 470 é a nacional. Independentemente da convenção, QTc acima de 500 ms indica risco alto de torsades.\n\nO ritmo de escape é o mecanismo de proteção do coração. Quando o nó sinusal falha ou é bloqueado, um marcapasso subsidiário mais lento assume: a junção atrioventricular, com frequência própria de 40 a 60 por minuto, ou o tecido ventricular, ainda mais lento. No escape juncional, o estímulo nasce acima da bifurcação do feixe de His e desce pelo sistema normal, de modo que o QRS é estreito; a onda P pode estar ausente, escondida dentro do QRS ou retrógrada e negativa nas derivações inferiores. O escape não é a doença: é a resposta a ela. A pergunta correta diante de um escape nunca é "como eu suprimo isto", e sim "o que silenciou o nó sinusal" — hipertonia vagal, isquemia inferior, drogas que freiam o nó, hipercalemia.',
    comoLer:
      'Nos três padrões, o achado está em um lugar específico e vale ir direto a ele. Para a pré-excitação, meça o PR e depois olhe o início do QRS procurando o empastamento; delta e PR curto vêm sempre juntos. Para o QT, escolha a derivação em que a onda T termina de forma mais nítida e em que o QT for mais longo, meça do início do QRS ao fim da T, e corrija pela frequência antes de concluir. Para o escape, comece pela ausência de onda P sinusal e pela frequência, e só então avalie a largura do QRS para inferir de onde o escape nasceu.',
    ancoras: [
      'Pré-excitação: PR abaixo de 120 ms, onda delta e QRS alargado às custas do empastamento inicial.',
      'Fibrilação atrial pré-excitada: taquicardia irregular, de QRS largo, muito rápida e com complexos de larguras variáveis. Não bloqueie o nó AV.',
      'QTc por Bazett é o QT dividido pela raiz quadrada do RR em segundos. Fora de 60 a 100 bpm, prefira Fridericia.',
      'QTc normal: até 450 ms em homens e 470 ms em mulheres pela Diretriz da SBC de 2022; 450 e 460 ms pelo guia de OSCE do curso. Saiba qual convenção o seu professor cobra — e, em qualquer uma delas, QTc acima de 500 ms indica risco alto de torsades.',
      'Escape juncional: bradicardia regular, QRS estreito, sem onda P sinusal, entre 40 e 60 bpm.',
      'Escape é consequência, não doença. Nunca suprima um ritmo de escape.',
    ],
    errosComuns: [
      {
        erro: 'Administrar bloqueador do nó atrioventricular numa fibrilação atrial pré-excitada.',
        porQue:
          'Bloquear o nó AV redireciona a condução para a via acessória, que não limita a frequência ventricular. O resultado pode ser aumento paradoxal da resposta ventricular e degeneração para fibrilação ventricular.',
        comoEvitar:
          'Diante de taquicardia irregular, de QRS largo e muito rápida, com complexos de larguras diferentes, suspenda a rotina: cardioversão elétrica se instável, procainamida se estável. Adenosina também está proibida nesse cenário.',
      },
      {
        erro: 'Confundir pré-excitação com bloqueio de ramo.',
        porQue:
          'Os dois alargam o QRS. A diferença está no início do complexo e no intervalo que o precede: na pré-excitação o PR é curto e o alargamento vem do empastamento inicial; no bloqueio de ramo o PR é normal e o alargamento é da porção média e final.',
        comoEvitar:
          'Meça o PR antes de julgar o QRS. PR abaixo de 120 ms com QRS largo é pré-excitação até prova em contrário.',
      },
      {
        erro: 'Concluir QT longo sem corrigir pela frequência, ou corrigir com a fórmula errada.',
        porQue:
          'O QT bruto varia com a frequência, e Bazett distorce nos extremos: superestima em taquicardia, gerando falso alarme, e subestima em bradicardia, escondendo risco real.',
        comoEvitar:
          'Corrija sempre. Dentro de 60 a 100 bpm, Bazett serve. Fora dessa faixa, prefira Fridericia, e diga qual fórmula usou ao registrar o valor.',
      },
      {
        erro: 'Tentar acelerar ou suprimir um ritmo de escape sem antes garantir substituição.',
        porQue:
          'O escape é o que está mantendo o débito cardíaco. Removê-lo ou suprimi-lo sem um marcapasso disponível deixa o paciente sem nenhum ritmo.',
        comoEvitar:
          'Trate a causa e, se for necessário elevar a frequência, tenha o marcapasso transcutâneo montado antes de qualquer intervenção. Procure o que silenciou o nó sinusal em vez de mirar no escape.',
      },
    ],
    ordemSugerida: ['juncional', 'wpw', 'qtLongo'],
  },
];

/* ==========================================================================
   2. ROTEIROS — leitura guiada, parada a parada
   --------------------------------------------------------------------------
   Progressão obrigatória em todos: OBSERVAR → MEDIR → COMPARAR → NOMEAR.
   A primeira parada nunca entrega o diagnóstico; a última sempre o nomeia.
   `foco` indica o elemento do traçado em jogo e alimenta o destaque visual.
   ========================================================================== */

export const ROTEIROS = {

  /* ------------------------------------------------------------- base ---- */

  normal: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Olhe a tira inteira antes de olhar qualquer onda',
      texto:
        'Antes de medir coisa alguma, veja se o desenho se repete de forma parecida do começo ao fim da tira. Repare também no pulso retangular no início: ele tem 10 mm de altura e é a prova de que este traçado está calibrado a 10 mm por milivolt.',
    },
    {
      foco: 'p',
      tMs: 1005,
      titulo: 'Existe uma onda antes de cada complexo?',
      texto:
        'Esta pequena deflexão positiva e arredondada é a onda P, e ela aparece antes de cada complexo. Como estamos em DII, uma P positiva significa que a despolarização atrial caminhou de cima para baixo — ou seja, nasceu onde deveria nascer.',
    },
    {
      foco: 'pr',
      tMs: 1085,
      titulo: 'Meça a distância entre a P e o complexo',
      texto:
        'Conte os quadradinhos do início da onda P ao início do complexo: são quatro, o que dá 160 ms. A faixa normal é de 120 a 200 ms, isto é, de 3 a 5 quadradinhos. Confira em mais de um batimento e verifique se esse valor se mantém constante.',
    },
    {
      foco: 'fc',
      tMs: 1550,
      titulo: 'Compare os intervalos entre complexos e calcule a frequência',
      texto:
        'Os intervalos entre um R e o seguinte são iguais entre si, o que define ritmo regular. Em ritmo regular vale dividir 1500 pelo número de quadradinhos entre dois R: são cerca de 21, o que dá aproximadamente 72 por minuto.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: ECG normal',
      texto:
        'Onda P positiva em DII antes de cada complexo, PR fixo dentro da faixa, QRS estreito, frequência entre 60 e 100 e repolarização sem desvio. Este é o traçado de referência: guarde a imagem, porque todo achado anormal que você vai aprender é definido pelo contraste com ela.',
    },
  ],

  bradicardia: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Repare no espaçamento entre os complexos',
      texto:
        'A primeira coisa que salta aos olhos é a distância entre um complexo e o próximo, bem maior do que no traçado de referência. Ainda não sabemos por quê — só sabemos que o coração está batendo devagar.',
    },
    {
      foco: 'p',
      tMs: 1500,
      titulo: 'Verifique se a onda P continua no lugar',
      texto:
        'A onda P segue presente, positiva e imediatamente antes de cada complexo. Isso já elimina uma família inteira de hipóteses: a relação entre átrio e ventrículo está preservada.',
    },
    {
      foco: 'fc',
      tMs: 2100,
      titulo: 'Meça o intervalo entre dois R',
      texto:
        'Entre dois R há cerca de 33 quadradinhos. Dividindo 1500 por 33, chega-se a aproximadamente 45 por minuto. O intervalo é longo, mas é sempre o mesmo — o ritmo é regular.',
    },
    {
      foco: 'intervalos',
      tMs: 1580,
      titulo: 'Compare o PR com o do traçado normal',
      texto:
        'O PR continua dentro de 120 a 200 ms e não varia de um batimento para o outro, e nenhuma onda P deixou de conduzir. É exatamente isso que separa este traçado de um bloqueio atrioventricular, onde a relação entre P e QRS está quebrada.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: bradicardia sinusal',
      texto:
        'Ritmo sinusal preservado com frequência abaixo de 60 por minuto. O nome fecha o traçado, mas não fecha o caso: pergunte se o paciente tem sintomas atribuíveis à frequência e se usa betabloqueador, verapamil, diltiazem, digoxina ou amiodarona. Bradicardia assintomática em atleta é fisiológica.',
    },
  ],

  taquiSinusal: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Os complexos estão próximos e igualmente espaçados',
      texto:
        'A tira mostra complexos apertados uns contra os outros, mas com espaçamento constante. Regularidade em alta frequência já é informação: exclui de saída a fibrilação atrial.',
    },
    {
      foco: 'qrs',
      tMs: 1250,
      titulo: 'Meça a largura do complexo',
      texto:
        'O complexo continua estreito, abaixo de 120 ms. Isso significa que o estímulo desceu pelo sistema de condução normal e, portanto, que a origem está acima da bifurcação do feixe de His.',
    },
    {
      foco: 'p',
      tMs: 1080,
      titulo: 'Procure a onda P — ela ainda está identificável',
      texto:
        'Antes de cada complexo ainda existe uma onda P positiva, com PR constante. Esse detalhe é o que separa este traçado de uma taquicardia supraventricular, em que a P desaparece dentro ou logo depois do complexo.',
    },
    {
      foco: 'fc',
      tMs: 1460,
      titulo: 'Compare: a T do batimento anterior encosta na P do seguinte',
      texto:
        'Com cerca de 130 por minuto, a diástole encurta e a onda T de um batimento quase toca a onda P do próximo. Guarde isso: em frequências mais altas essa sobreposição é o que faz a onda P "sumir" e leva o aluno a diagnosticar taquicardia supraventricular por engano.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: taquicardia sinusal',
      texto:
        'Ritmo sinusal com frequência acima de 100 por minuto, de início e término graduais. Este é um diagnóstico incompleto por natureza: é sintoma, não doença. Procure dor, febre, hipovolemia, anemia, hipóxia, sepse, tireotoxicose, embolia pulmonar ou abstinência antes de pensar em frear a frequência.',
    },
  ],

  /* ------------------------------------------------------- sobrecarga ---- */

  sobrecargaAD: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'O ritmo está normal — o que mudou é uma onda só',
      texto:
        'Frequência, regularidade e complexos estão dentro do esperado. Percorrendo a tira, a única estrutura que destoa do traçado de referência é a onda que precede cada complexo.',
    },
    {
      foco: 'p',
      tMs: 940,
      titulo: 'Olhe a forma dessa onda inicial',
      texto:
        'A onda P está pontuda e proeminente, subindo bem acima do que você viu no traçado normal. Note que ela não parece mais larga — ela parece mais alta.',
    },
    {
      foco: 'p',
      tMs: 940,
      titulo: 'Meça a altura em quadradinhos',
      texto:
        'Da linha de base ao pico há mais de dois quadradinhos e meio, ou seja, acima de 2,5 mm em DII. A duração, medida na horizontal, permanece dentro de 120 ms. A alteração é de amplitude, não de tempo.',
    },
    {
      foco: 'p',
      tMs: 1700,
      titulo: 'Compare as duas medidas da mesma onda',
      texto:
        'Repita a dupla medida em outro batimento e coloque os dois números lado a lado: a altura ultrapassou o limite de 2,5 mm, e a largura não chegou perto do limite de 120 ms. A onda P tem duas dimensões e apenas uma delas se moveu — guardar qual foi é o que vai separar esta sobrecarga da próxima, em que acontece exatamente o contrário.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: sobrecarga atrial direita, ou P pulmonale',
      texto:
        'P apiculada acima de 2,5 mm em DII, DIII ou aVF, com duração preservada. Como o átrio direito despolariza primeiro, ele só pode crescer para cima — amplitude aponta para a direita. O ECG levanta a hipótese; o ecocardiograma confirma, e a investigação vai para doença pulmonar obstrutiva, cor pulmonale, hipertensão pulmonar e valvopatia tricúspide.',
    },
  ],

  sobrecargaAE: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Novamente o ritmo é sinusal e regular',
      texto:
        'Nada chama atenção na frequência nem nos complexos. Como no traçado anterior, a diferença está na onda inicial de cada batimento — mas ela é de outro tipo.',
    },
    {
      foco: 'p',
      tMs: 1050,
      titulo: 'Observe o contorno da onda P',
      texto:
        'A onda P tem dois picos separados por um pequeno entalhe, como um camelo de duas corcovas. A altura não impressiona; o que impressiona é a extensão dela na horizontal.',
    },
    {
      foco: 'p',
      tMs: 1060,
      titulo: 'Meça a duração e compare com a sobrecarga anterior',
      texto:
        'A onda ocupa mais de três quadradinhos, ou seja, ultrapassa 120 ms, enquanto a amplitude permanece abaixo de 2,5 mm. É o espelho exato do padrão anterior: lá a alteração era de altura, aqui é de largura.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: sobrecarga atrial esquerda, ou P mitrale',
      texto:
        'Onda P larga e entalhada, com duração acima de 120 ms. Como o átrio esquerdo despolariza por último, quando ele atrasa a onda se alonga — duração aponta para a esquerda. Investigue estenose mitral, hipertensão de longa data e disfunção diastólica, e lembre que o átrio esquerdo dilatado é o terreno onde nasce a fibrilação atrial.',
    },
  ],

  sve: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'A amplitude dos complexos chama atenção',
      texto:
        'Esta tira é de V5. Antes de qualquer coisa, confirme a calibração: só faz sentido julgar amplitude com o pulso de 1 mV medindo 10 mm. Feito isso, note o quanto os complexos são altos em comparação com o traçado de referência.',
    },
    {
      foco: 'qrs',
      tMs: 1150,
      titulo: 'Meça a altura da onda R',
      texto:
        'A onda R sobe muito acima do habitual para esta derivação. O critério de Sokolow-Lyon soma a profundidade da S em V1 com a altura da R em V5 ou V6 e usa 35 mm como corte — então metade dessa soma já está aqui.',
    },
    {
      foco: 'st',
      tMs: 1250,
      titulo: 'Agora olhe a repolarização, logo depois do complexo',
      texto:
        'O segmento ST está deprimido e desce em rampa, e a onda T que se segue é invertida e assimétrica. Repare onde isso está acontecendo: exatamente nas derivações em que a onda R é alta.',
    },
    {
      foco: 't',
      tMs: 1400,
      titulo: 'Compare com o que seria isquemia lateral aguda',
      texto:
        'O desenho é praticamente o mesmo de um infra isquêmico, e é por isso que a confusão é frequente. O que decide não está no traçado isolado: está na companhia das ondas R altas, na estabilidade ao longo do tempo e na história de hipertensão ou estenose aórtica de longa data.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: sobrecarga ventricular esquerda com strain',
      texto:
        'Critério de voltagem satisfeito somado ao padrão de repolarização secundária na parede lateral. A alteração é crônica, e a urgência de um paciente assim vem do quadro clínico, não do traçado. Lembre da limitação: critérios de voltagem têm sensibilidade baixa e sofrem influência de biotipo, idade e obesidade — o ECG não fecha hipertrofia sozinho.',
    },
  ],

  /* -------------------------------------------------------------- bav ---- */

  bav1: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Conte as ondas P e conte os complexos',
      texto:
        'Percorra a tira e conte quantas ondas P existem e quantos complexos existem. Os números batem: nenhum batimento se perdeu. Guarde essa informação, porque ela vale ouro no restante desta família.',
    },
    {
      foco: 'pr',
      tMs: 1200,
      titulo: 'Olhe o espaço entre a onda P e o complexo',
      texto:
        'Existe um trecho reto e visivelmente longo entre o fim da onda P e o início do complexo. Esse trecho é o atraso da condução no nó atrioventricular, e aqui ele está exagerado.',
    },
    {
      foco: 'intervalos',
      tMs: 1200,
      titulo: 'Meça o PR e repita a medida em outros batimentos',
      texto:
        'Do início da P ao início do complexo há cerca de 7,5 quadradinhos, o que dá aproximadamente 300 ms — bem acima do limite de 200. Agora repita a medida no batimento anterior e no seguinte: o valor é o mesmo.',
    },
    {
      foco: 'intervalos',
      tMs: 2080,
      titulo: 'Compare com o traçado normal e pergunte o que faltaria para ser mais grave',
      texto:
        'No traçado de referência esse mesmo intervalo media 160 ms; aqui ele quase dobrou. Mas repare no que NÃO mudou: nenhum complexo desapareceu e o valor não oscila de um batimento para o outro. São essas duas ausências que mantêm o quadro no grau mais leve — bastaria um único complexo faltar para a classificação inteira mudar de patamar.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: bloqueio atrioventricular de 1º grau',
      texto:
        'PR acima de 200 ms, FIXO, com todas as ondas P conduzindo. Os três elementos precisam estar presentes: PR longo sozinho não é bloqueio de segundo grau, porque o segundo grau só começa quando um complexo falha. A conduta habitual é observação e revisão de drogas que freiam o nó atrioventricular.',
    },
  ],

  mobitz1: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Procure onde o traçado "tropeça"',
      texto:
        'Percorrendo a tira, existem trechos em que os complexos vêm em cadência e, de repente, um espaço maior. As ondas P, por outro lado, parecem manter um ritmo próprio e constante. Ainda não temos o diagnóstico — temos o lugar para investigar.',
    },
    {
      foco: 'p',
      tMs: 2570,
      titulo: 'Aqui existe uma onda P que não gerou complexo',
      texto:
        'Esta onda P está sozinha: nenhum complexo se segue a ela. Isso já define bloqueio de segundo grau, porque um batimento se perdeu. O que ainda não sabemos é de que tipo.',
    },
    {
      foco: 'pr',
      tMs: 1100,
      titulo: 'Meça o PR dos batimentos que vieram antes da falha',
      texto:
        'Volte ao primeiro batimento do grupo e meça o PR; depois meça o segundo e o terceiro. Os valores crescem: cerca de 180 ms, depois 260 ms, depois 350 ms. O intervalo foi ficando maior a cada ciclo, até que uma onda P encontrou o nó ainda refratário.',
    },
    {
      foco: 'pr',
      tMs: 3450,
      titulo: 'Compare com o PR do primeiro batimento depois da pausa',
      texto:
        'Depois da pausa, o nó atrioventricular se recuperou e o PR voltou a ser curto, reiniciando a sequência. Esse retorno ao valor mais curto é a segunda metade da assinatura, e é o que confirma o mecanismo de fadiga progressiva.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: BAV de 2º grau Mobitz I, ou Wenckebach',
      texto:
        'Alongamento progressivo do PR até a falha de um complexo, com reinício depois da pausa e QRS estreito. O bloqueio é nodal, geralmente benigno, e responde à atropina quando sintomático. Sem o PR crescente documentado em pelo menos dois batimentos consecutivos, o diagnóstico não se sustenta.',
    },
  ],

  mobitz2: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'De novo há pausas — e de novo as P são regulares',
      texto:
        'A imagem geral se parece com a do traçado anterior: ondas P em cadência constante e complexos que faltam de tempos em tempos. Não decida pelo aspecto geral; a diferença entre os dois diagnósticos está numa medida.',
    },
    {
      foco: 'p',
      tMs: 1750,
      titulo: 'Localize a onda P bloqueada',
      texto:
        'Esta onda P também não conduziu. Como antes, isso caracteriza bloqueio de segundo grau. Agora vem a pergunta que classifica: o que o PR estava fazendo antes dela?',
    },
    {
      foco: 'pr',
      tMs: 1040,
      titulo: 'Meça o PR do batimento imediatamente anterior à falha',
      texto:
        'O PR aqui é de cerca de 180 ms. Meça agora o batimento anterior a este: também 180 ms. Não houve alongamento nenhum — a condução estava perfeitamente estável até parar de existir.',
    },
    {
      foco: 'pr',
      tMs: 2620,
      titulo: 'Compare com o PR do primeiro batimento depois da pausa',
      texto:
        'Depois da pausa o PR continua o mesmo, 180 ms. É aí que os dois diagnósticos se separam: no Wenckebach o PR cresce e depois encurta; aqui ele nunca se moveu. Repare também na largura do complexo, que costuma estar aumentada porque a lesão é abaixo do nó atrioventricular.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: BAV de 2º grau Mobitz II',
      texto:
        'PR fixo com queda súbita de complexo, sem alongamento prévio. Bloqueio infranodal, com risco real de progressão para bloqueio total e indicação de marcapasso. Atropina não funciona aqui, porque ela age no nó atrioventricular e a lesão está abaixo dele: em paciente instável, monte o marcapasso transcutâneo em vez de repetir doses.',
    },
  ],

  bavt: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Olhe a tira procurando não um ritmo, mas dois',
      texto:
        'Percorra o traçado tentando encaixar cada onda P com um complexo, e você não vai conseguir: algumas P aparecem logo antes do complexo, outras no meio dele, outras dentro da onda T. Existem dois relógios funcionando ao mesmo tempo.',
    },
    {
      foco: 'p',
      tMs: 850,
      titulo: 'Confirme que as ondas P são regulares entre si',
      texto:
        'Marque uma onda P e a seguinte, e depois a seguinte: a distância é sempre a mesma, em torno de 680 ms, o que corresponde a cerca de 88 por minuto. Os átrios estão sendo comandados normalmente pelo nó sinusal.',
    },
    {
      foco: 'qrs',
      tMs: 2080,
      titulo: 'Meça agora o intervalo entre os complexos',
      texto:
        'Os complexos também são regulares entre si, mas muito mais lentos — cerca de 36 por minuto — e são largos. Largura indica que este ritmo não desceu pelo sistema de condução normal: é um escape de origem ventricular.',
    },
    {
      foco: 'intervalos',
      tMs: 2150,
      titulo: 'Compare: não existe PR para medir',
      texto:
        'Tente medir o PR e o exercício se desfaz. A distância entre cada P e o complexo seguinte é diferente a cada vez, porque não há relação nenhuma entre eles. Aqui, inclusive, uma onda P cai praticamente em cima do complexo.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: bloqueio atrioventricular total',
      texto:
        'Dissociação atrioventricular completa: P regulares entre si, complexos regulares entre si, e nenhuma relação entre os dois grupos. Nenhum estímulo atrial alcança o ventrículo. É indicação de marcapasso, e emergência quando há instabilidade. No Brasil, doença de Chagas é causa clássica em adulto jovem sem cardiopatia aparente.',
    },
  ],

  /* ------------------------------------------------------------- ramo ---- */

  brd: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'O ritmo é sinusal, mas os complexos parecem alargados',
      texto:
        'Esta tira é de V1. As ondas P estão presentes e o ritmo é regular, então a origem é sinusal. O que destoa é o desenho do complexo, que ocupa mais espaço horizontal do que deveria.',
    },
    {
      foco: 'qrs',
      tMs: 1180,
      titulo: 'Meça a largura do complexo em quadradinhos',
      texto:
        'O complexo ocupa mais de três quadradinhos, ou seja, ultrapassa 120 ms. Esse é o portão de entrada do tema: QRS largo significa que o estímulo contornou o sistema de condução rápido em algum ponto.',
    },
    {
      foco: 'qrs',
      tMs: 1205,
      titulo: 'Agora olhe a forma, e não só a largura',
      texto:
        'Em V1 aparecem duas deflexões positivas em sequência, o padrão rsR’, conhecido como orelhas de coelho. A segunda deflexão é o ventrículo direito despolarizando com atraso, vindo na direção do eletrodo.',
    },
    {
      foco: 't',
      tMs: 1420,
      titulo: 'Compare a onda T com o que você esperaria',
      texto:
        'A onda T está invertida em V1. Antes de chamar isso de isquemia, note que ela é discordante do complexo, que é predominantemente positivo. Essa discordância é obrigatória quando a despolarização é anormal — é repolarização secundária, não evento agudo.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: bloqueio de ramo direito',
      texto:
        'QRS igual ou maior que 120 ms com padrão rsR’ em V1 e onda S alargada em DI e V6. Em V1, largo e para cima é ramo direito. Isolado e assintomático costuma ser benigno; se for novo, ou vier com dor torácica ou dispneia, o contexto é que manda investigar.',
    },
  ],

  bre: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Mesma derivação, complexo largo, desenho oposto',
      texto:
        'Também estamos em V1 e o ritmo continua sinusal. O complexo é largo como no traçado anterior, mas a deflexão principal aponta para o outro lado. Guarde a comparação antes de medir.',
    },
    {
      foco: 'qrs',
      tMs: 1160,
      titulo: 'Meça a largura e observe a direção',
      texto:
        'O complexo ultrapassa 120 ms e é predominantemente negativo e profundo em V1. O ventrículo esquerdo, que é a maior massa, está sendo ativado por último e no sentido oposto ao eletrodo.',
    },
    {
      foco: 'st',
      tMs: 1300,
      titulo: 'Compare a repolarização com a do bloqueio de ramo direito',
      texto:
        'Aqui o ST está desviado para cima e a onda T é positiva — de novo discordantes do complexo, que é negativo. Perceba o problema clínico: esse desvio de ST existe por definição no bloqueio de ramo esquerdo, e é exatamente ele que esconde um supradesnivelamento verdadeiro.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: bloqueio de ramo esquerdo',
      texto:
        'QRS igual ou maior que 120 ms, negativo e alargado em V1, com R larga e entalhada em DI, aVL e V6. Em V1, largo e para baixo é ramo esquerdo. Crônico e isolado não é emergência; novo, ou de idade indeterminada, com dor torácica, conduza como síndrome coronariana aguda e aplique os critérios de Sgarbossa — procurando primeiro supra ou infra CONCORDANTES com o complexo, porque concordância o bloqueio não explica.',
    },
  ],

  /* ------------------------------------------------------------ taqui ---- */

  tsv: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Frequência muito alta e espaçamento constante',
      texto:
        'Os complexos vêm rápido e a distância entre eles é sempre a mesma. Regularidade em taquicardia já é um dado forte: exclui a fibrilação atrial de imediato.',
    },
    {
      foco: 'qrs',
      tMs: 850,
      titulo: 'Meça a largura do complexo',
      texto:
        'O complexo é estreito, abaixo de 120 ms. Isso coloca a origem acima da bifurcação do feixe de His — estamos diante de uma taquicardia supraventricular, e não ventricular.',
    },
    {
      foco: 'p',
      tMs: 1100,
      titulo: 'Procure a onda P onde ela deveria estar',
      texto:
        'No espaço antes de cada complexo não há onda P identificável. Na reentrada nodal, a ativação atrial retrógrada acontece quase junto com a ventricular, e a P acaba escondida dentro do complexo ou logo depois dele.',
    },
    {
      foco: 'fc',
      tMs: 1000,
      titulo: 'Compare o intervalo com o de uma taquicardia sinusal',
      texto:
        'A frequência aqui é de cerca de 175 por minuto e notavelmente constante, sem a variação batimento a batimento que a taquicardia sinusal costuma ter. Some a isso o histórico típico de início e término súbitos.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: taquicardia supraventricular',
      texto:
        'Taquicardia regular de QRS estreito, sem onda P visível, de início e término súbitos. Estável: manobra vagal, com preferência pela Valsalva modificada, e depois adenosina 6 mg IV em bólus rápido seguido de flush, repetível com 12 mg. Instável: cardioversão elétrica sincronizada. Cautela com adenosina em asma e broncoespasmo, e avise o paciente da sensação torácica intensa e passageira.',
    },
  ],

  flutter: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Taquicardia regular — mas a linha de base não está parada',
      texto:
        'Os complexos são regulares e rápidos. Antes de olhar para eles, porém, olhe para o espaço entre eles: a linha de base não é reta, e essa é a pista que vale a tira inteira.',
    },
    {
      foco: 'ritmo',
      tMs: 1150,
      titulo: 'Observe o desenho da linha de base entre os complexos',
      texto:
        'Existe uma sucessão contínua de deflexões em dente de serra, sem trecho isoelétrico entre elas. Não são ondas P: são ondas F, atividade atrial organizada de um macrocircuito único.',
    },
    {
      foco: 'fc',
      tMs: 1150,
      titulo: 'Meça a distância entre duas ondas F e depois entre dois R',
      texto:
        'As ondas F se repetem a cada 5 quadradinhos, o que corresponde a cerca de 300 por minuto. Os complexos, por sua vez, aparecem na metade dessa cadência, perto de 150 por minuto. A conta fecha: uma em cada duas ondas atriais conduz.',
    },
    {
      foco: 'ritmo',
      tMs: null,
      titulo: 'Compare com o que você veria numa taquicardia supraventricular',
      texto:
        'Se você tivesse olhado só os complexos, este traçado seria indistinguível de uma taquicardia supraventricular: regular, estreito, perto de 150 por minuto. A diferença inteira está na linha de base, que ali estaria reta entre um complexo e o outro e aqui não tem trecho isoelétrico nenhum. É por isso que a suspeita começa pela frequência e se resolve olhando o espaço entre os complexos, não os complexos.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: flutter atrial com condução 2:1',
      texto:
        'Ondas F em dente de serra a cerca de 300 por minuto com resposta ventricular próxima de 150. Toda taquicardia regular de QRS estreito em torno de 150 bpm deve levantar essa suspeita; manobra vagal ou adenosina desmascaram as ondas F ao frear o nó atrioventricular. Quanto ao risco embólico, trate com a mesma lógica da fibrilação atrial, e considere ablação do istmo cavotricuspídeo no flutter típico.',
    },
  ],

  fa: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Olhe o espaçamento entre os complexos ao longo da tira',
      texto:
        'Não existe cadência. Alguns complexos vêm quase colados, outros deixam um intervalo longo, e não há um padrão que se repita. Antes de nomear, confirme percorrendo a tira inteira, e não só um trecho.',
    },
    {
      foco: 'p',
      tMs: 1250,
      titulo: 'Procure onda P e observe a linha de base',
      texto:
        'Não há onda P em lugar nenhum. No lugar dela, a linha de base ondula de forma fina e irregular. Cuidado para não confundir essa ondulação com tremor muscular do paciente, que é um artefato clássico.',
    },
    {
      foco: 'fc',
      tMs: 1900,
      titulo: 'Meça dois intervalos RR diferentes e compare',
      texto:
        'Meça o intervalo entre este par de complexos e depois entre outro par mais adiante: os valores não coincidem, e não coincidem de forma imprevisível. É isso que se chama irregularmente irregular.',
    },
    {
      foco: 'fc',
      tMs: 2400,
      titulo: 'Compare os métodos de calcular a frequência',
      texto:
        'Aqui a fórmula de 1500 dividido pelos quadradinhos entre dois R não vale, porque cada par daria um número diferente. Em ritmo irregular, conte os complexos em 6 segundos e multiplique por 10.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: fibrilação atrial',
      texto:
        'Ausência de onda P com RR irregularmente irregular. O diferencial imediato é flutter com condução variável, que também é irregular mas mostra ondas F organizadas. A decisão que mais muda prognóstico não é a frequência: é a anticoagulação, definida pelo escore de risco embólico. E cardioversão eletiva em fibrilação de duração indeterminada exige preparo — anticoagulação adequada ou ecocardiograma transesofágico antes.',
    },
  ],

  tv: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Taquicardia regular com complexos grandes e alargados',
      texto:
        'Os complexos vêm rápido, com espaçamento constante, e ocupam muito espaço horizontal. Repare também que todos têm a mesma forma, um igual ao outro.',
    },
    {
      foco: 'qrs',
      tMs: 900,
      titulo: 'Meça a largura do complexo',
      texto:
        'O complexo passa bem de 120 ms. Esse único dado já muda o algoritmo inteiro: taquicardia de QRS largo tem outra lista de diagnósticos e outra lista de drogas proibidas.',
    },
    {
      foco: 'p',
      tMs: 1150,
      titulo: 'Procure atividade atrial relacionada',
      texto:
        'Não há onda P relacionada aos complexos. Quando presentes, dissociação atrioventricular, batimentos de captura e batimentos de fusão são praticamente diagnósticos — mas a ausência deles não afasta nada.',
    },
    {
      foco: 'qrs',
      tMs: 1250,
      titulo: 'Compare os complexos entre si',
      texto:
        'Todos os complexos têm a mesma morfologia: isto é monomórfico. Guarde essa observação, porque ela é o que autoriza o modo sincronizado se for preciso chocar — e é o que muda quando o ritmo for polimórfico.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: taquicardia ventricular monomórfica',
      texto:
        'Taquicardia regular de QRS largo com complexos idênticos entre si. A ordem das perguntas é fixa: tem pulso? Sem pulso, desfibrilação não sincronizada e protocolo de parada. Com pulso e instável, cardioversão sincronizada. Com pulso e estável, antiarrítmico intravenoso — amiodarona, procainamida ou sotalol — com o desfibrilador preparado. Em quem tem cardiopatia estrutural ou infarto prévio, QRS largo é taquicardia ventricular até prova em contrário.',
    },
  ],

  torsades: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Taquicardia de complexos largos que não se repetem iguais',
      texto:
        'A frequência é altíssima e os complexos são largos, mas há algo diferente da tira anterior: eles mudam de tamanho e de direção ao longo do traçado, em vez de se repetirem idênticos.',
    },
    {
      foco: 'qrs',
      tMs: 780,
      titulo: 'Meça a cadência e observe a amplitude crescer até um máximo',
      texto:
        'Neste trecho os complexos vão crescendo em amplitude, formando um fuso: é a primeira metade do fenômeno que dá nome ao ritmo. Meça agora a distância entre dois complexos consecutivos, que é de cerca de 6 quadradinhos, ou 240 ms — o equivalente a aproximadamente 250 por minuto. Numa frequência dessas o tempo de enchimento ventricular praticamente desaparece, e é por isso que a apresentação típica é síncope.',
    },
    {
      foco: 'qrs',
      tMs: 1440,
      titulo: 'Agora observe a amplitude diminuir e a polaridade inverter',
      texto:
        'Aqui os complexos afinam até quase encostar na linha de base e depois voltam a crescer, mas apontando para o outro lado. O eixo está girando continuamente — é literalmente uma torção em torno da linha de base.',
    },
    {
      foco: 'intervalos',
      tMs: null,
      titulo: 'Compare com a taquicardia ventricular monomórfica',
      texto:
        'Lá todos os complexos eram iguais; aqui nenhum é igual ao anterior. Vale ainda procurar o traçado de base do paciente antes do episódio: nesta arritmia, o QT costuma estar prolongado, e é isso que constitui o substrato.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: torsades de pointes',
      texto:
        'Taquicardia ventricular polimórfica em fuso, sobre um QT prolongado. Sulfato de magnésio 1 a 2 g IV mesmo com magnésio sérico normal, correção do potássio e suspensão de toda droga que prolongue o QT. E o ponto de segurança mais importante de todo o tema: se estiver instável ou sem pulso, o choque é NÃO sincronizado — o aparelho não consegue marcar uma onda R consistente em morfologia variável e simplesmente não dispara. Torsades pode ter pulso, ao contrário do que afirma um resumo em circulação no curso.',
    },
  ],

  /* ----------------------------------------------------------- parada ---- */

  fv: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Antes de olhar o monitor, olhe o paciente',
      texto:
        'Este traçado só significa alguma coisa junto de um paciente sem pulso e sem resposta. Um eletrodo solto ou um paciente tremendo desenham imagens parecidas — a diferença é clínica, não eletrocardiográfica.',
    },
    {
      foco: 'ritmo',
      tMs: 1500,
      titulo: 'Procure as estruturas que você aprendeu a identificar',
      texto:
        'Procure onda P, complexo QRS e onda T neste trecho. Nenhuma das três existe: há apenas oscilação contínua e desorganizada, com amplitude e frequência variando ao acaso.',
    },
    {
      foco: 'fc',
      tMs: null,
      titulo: 'Constate que não há o que medir',
      texto:
        'Não existe intervalo RR para contar, porque não existe R. Aqui a leitura sistemática em nove passos não se aplica, e insistir nela custa tempo que o paciente não tem.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: fibrilação ventricular',
      texto:
        'Atividade elétrica caótica sem complexos organizados, em paciente sem pulso: ritmo de parada e CHOCÁVEL. Reanimação cardiopulmonar de alta qualidade e desfibrilação imediata, NÃO sincronizada — não há onda R para o aparelho marcar, e tentar sincronizar significa não chocar. Retome as compressões logo após o choque; adrenalina 1 mg IV a cada 3 a 5 minutos e amiodarona 300 mg após o terceiro choque, enquanto se procuram as causas reversíveis.',
    },
  ],

  assistolia: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Uma linha quase reta — e um protocolo antes do diagnóstico',
      texto:
        'O traçado é praticamente plano, com no máximo uma oscilação mínima. Antes de aceitar isso como diagnóstico, execute a checagem: paciente, cabos, conexões, ganho e uma segunda derivação.',
    },
    {
      foco: 'ritmo',
      tMs: 2500,
      titulo: 'Compare com a fibrilação ventricular fina',
      texto:
        'Aumente o ganho mentalmente e pergunte se poderia haver ondulação de baixa amplitude escondida nesta linha. Fibrilação ventricular fina é chocável e assistolia não é — e as duas podem parecer iguais num ganho inadequado.',
    },
    {
      foco: 'fc',
      tMs: null,
      titulo: 'Constate a ausência total de atividade',
      texto:
        'Confirmado o traçado em mais de uma derivação e com ganho adequado, não há despolarização nenhuma acontecendo. Não é desorganização da atividade elétrica: é ausência dela.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: assistolia',
      texto:
        'Ritmo de parada NÃO chocável. Reanimação cardiopulmonar de alta qualidade e adrenalina 1 mg IV a cada 3 a 5 minutos, o mais precocemente possível, com busca ativa de causa reversível. Desfibrilar não traz benefício e interrompe as compressões, que são a única coisa mantendo alguma perfusão.',
    },
  ],

  /* --------------------------------------------------------- isquemia ---- */

  stemi: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'O ritmo está preservado — o problema é a linha depois do complexo',
      texto:
        'Frequência e ritmo estão dentro do esperado e o complexo é estreito. O que destoa é o que acontece imediatamente depois do complexo: o traçado não volta à linha de base.',
    },
    {
      foco: 'st',
      tMs: 1110,
      titulo: 'Localize o ponto J e meça o desvio ali',
      texto:
        'O ponto J é onde o complexo termina e o segmento ST começa, e é nele que a medida se faz. Aqui o traçado parte de um nível claramente acima da linha de base, com um desvio superior a 3 mm.',
    },
    {
      foco: 'st',
      tMs: 1160,
      titulo: 'Observe a forma desse supradesnivelamento',
      texto:
        'O segmento sobe e se abaula, com convexidade para cima — a chamada imagem em abóbada — e se funde com a onda T em vez de retornar à linha de base. Guarde essa forma: ela vai ser o contraste com a pericardite.',
    },
    {
      foco: 'st',
      tMs: null,
      titulo: 'Compare com as outras derivações do traçado completo',
      texto:
        'O que fecha o raciocínio não está nesta tira isolada. Confirme que o supra aparece em pelo menos duas derivações contíguas, que correspondem a uma parede, e procure infradesnivelamento nas derivações que olham a parede oposta — a imagem em espelho.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: infarto agudo do miocárdio com supradesnivelamento de ST',
      texto:
        'Supra convexo em duas derivações contíguas com recíproca: oclusão coronária aguda. O limiar é igual ou maior que 1 mm na maioria das derivações, mas em V2 e V3 muda para 2 mm em homens de 40 anos ou mais, 2,5 mm em homens abaixo de 40 e 1,5 mm em mulheres. Reperfusão imediata, sem esperar troponina. Em quadro inferior, peça V3R e V4R: havendo infarto de ventrículo direito, nitrato, morfina e diurético estão contraindicados e a conduta é volume — a contraindicação é do ventrículo direito, não da "parede inferior", como enuncia parte do material do curso.',
    },
  ],

  infraST: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Ritmo sinusal, complexo estreito, repolarização deslocada',
      texto:
        'Esta tira é de V5. O ritmo é sinusal e o complexo é normal em largura e morfologia. A alteração está inteiramente na porção que se segue ao complexo, e ela desce em vez de subir.',
    },
    {
      foco: 'st',
      tMs: 1060,
      titulo: 'Meça o desvio a partir do ponto J',
      texto:
        'A partir do ponto J o segmento se instala abaixo da linha de base. Meça a profundidade em milímetros comparando com o segmento entre a onda T e a onda P seguinte, que é a referência isoelétrica.',
    },
    {
      foco: 'st',
      tMs: 1120,
      titulo: 'Observe a inclinação do segmento',
      texto:
        'O segmento se mantém horizontal, sem subir de volta em rampa. Isso importa: infra horizontal ou descendente tem valor isquêmico, enquanto infra ascendente tem valor bem menor e é achado comum em taquicardia por demanda.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: síndrome coronariana aguda sem supradesnivelamento de ST',
      texto:
        'Infra horizontal ou descendente em território coronariano, com clínica compatível, aponta isquemia subendocárdica. Não se tromboliza: antiagregação, anticoagulação, antianginoso e estratificação de risco definem o momento do cateterismo. Antes de fechar como "sem supra", descarte os equivalentes de oclusão — infarto dorsal com V7 a V9, padrão de De Winter, onda T hiperaguda e critérios de Sgarbossa. E note à parte: supra em aVR com infra difuso indica alto risco de lesão de tronco ou triarterial, e a conduta é angiografia urgente, NÃO trombólise.',
    },
  ],

  pericardite: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Há supradesnivelamento — mas repare na frequência e no desenho',
      texto:
        'Como no traçado de infarto, o segmento ST está acima da linha de base. A frequência está discretamente elevada. Antes de concluir qualquer coisa, olhe a forma do supra e o que acontece antes do complexo.',
    },
    {
      foco: 'st',
      tMs: 1040,
      titulo: 'Observe a concavidade do supradesnivelamento',
      texto:
        'O segmento sobe com concavidade para cima, formando uma curva suave que lembra um sorriso, e não a abóbada convexa do infarto. Guarde a comparação lado a lado; a forma é um dos discriminadores.',
    },
    {
      foco: 'pr',
      tMs: 870,
      titulo: 'Agora meça a linha entre a onda P e o complexo',
      texto:
        'Este trecho, o segmento PR, está deprimido em relação à linha de base. Não confunda com o intervalo PR, que mede tempo: aqui o que interessa é a altura da linha. Essa depressão vem do comprometimento da repolarização atrial pela inflamação.',
    },
    {
      foco: 'st',
      tMs: null,
      titulo: 'Compare a distribuição com a de uma oclusão coronária',
      texto:
        'No traçado completo, este supra aparece em quase todas as derivações, poupando aVR e V1, onde ocorre o inverso. Não respeita território de artéria e não tem imagem em espelho — e essas duas ausências são tão diagnósticas quanto a concavidade.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: pericardite aguda',
      texto:
        'Supradesnivelamento difuso e côncavo com infra de PR, sem território coronariano e sem recíproca. Anti-inflamatório não esteroidal ou aspirina em dose alta, associados a colchicina, que reduz recorrência, e ecocardiograma para investigar derrame. Reconhecer não é detalhe acadêmico: trombolisar pericardite pode causar hemopericárdio. Some a clínica — dor que piora deitado e melhora sentado inclinado para a frente, e atrito pericárdico à ausculta.',
    },
  ],

  /* ------------------------------------------------------- eletrolito ---- */

  hipercalemia: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Alguma coisa está grande demais neste traçado',
      texto:
        'Esta tira é de V3. Percorra os batimentos e localize qual estrutura está desproporcional em relação ao traçado de referência. Não é o complexo que chama atenção primeiro: é o que vem depois dele.',
    },
    {
      foco: 't',
      tMs: 1480,
      titulo: 'Olhe a onda T e descreva a forma antes da altura',
      texto:
        'A onda T está alta, mas o que a define aqui é a forma: base ESTREITA, contorno SIMÉTRICO e ápice pontiagudo, como uma tenda. Compare mentalmente com a onda T normal, que sobe devagar e desce mais rápido.',
    },
    {
      foco: 'p',
      tMs: 1090,
      titulo: 'Agora volte para a onda P',
      texto:
        'A onda P está achatada, com amplitude bem menor que a habitual, e o segmento até o complexo se alongou. A condução atrial está lenta porque os canais rápidos de sódio começaram a se inativar.',
    },
    {
      foco: 'qrs',
      tMs: 1310,
      titulo: 'Meça a largura do complexo e compare com a de um bloqueio de ramo',
      texto:
        'O complexo está alargado, mas sem assumir a morfologia típica de bloqueio de ramo direito ou esquerdo: o alargamento é difuso, porque a lentificação atinge o miocárdio inteiro e não um fascículo. Esse detalhe distingue os dois cenários.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: hipercalemia com repercussão eletrocardiográfica',
      texto:
        'T apiculada e simétrica, achatamento da P, PR e QRS alargados — a sequência clássica, que termina em onda sinusoidal se nada for feito. Com o ECG já alterado, isto é emergência: gluconato de cálcio PRIMEIRO, para estabilizar a membrana, depois insulina com glicose e beta-2 agonista inalatório para deslocar o potássio, e por fim remoção com diurético de alça, resina de troca ou diálise. O cálcio não baixa o potássio: ele protege o coração enquanto o resto age. Atenção ao diferencial: a T hiperaguda da isquemia é larga e assimétrica.',
    },
  ],

  hipocalemia: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'A repolarização parece ter se espalhado no tempo',
      texto:
        'Também em V3. O ritmo é sinusal e o complexo é estreito. O que muda é a região depois do complexo: ela ficou longa e com mais de uma deflexão, em vez de uma onda T bem definida seguida de linha reta.',
    },
    {
      foco: 't',
      tMs: 1340,
      titulo: 'Observe a onda T',
      texto:
        'A onda T está achatada, com amplitude muito reduzida. Sozinho, esse achado é inespecífico e aparece em muitos contextos — ele precisa da segunda peça.',
    },
    {
      foco: 'u',
      tMs: 1560,
      titulo: 'Localize a deflexão que vem depois da onda T',
      texto:
        'Depois da T aparece uma segunda onda positiva, mais tardia e aqui bastante proeminente: é a onda U, que corresponde à repolarização tardia. Quando ela cresce e a T achata, as duas tendem a se fundir.',
    },
    {
      foco: 'intervalos',
      tMs: 1500,
      titulo: 'Compare com o que aconteceria se você medisse o QT aqui',
      texto:
        'Se você medir do início do complexo até o fim dessa segunda onda, estará medindo o intervalo QU, e não o QT — o valor sai falsamente longo. Identifique o ponto em que a T retorna à linha de base antes de a U começar.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: hipocalemia',
      texto:
        'Onda T achatada com onda U proeminente e infra discreto de ST. Reponha potássio e, obrigatoriamente, corrija o magnésio junto: sem magnésio a reposição de potássio não se sustenta. Revise diuréticos. O risco a monitorizar é arritmia ventricular, e a hipocalemia predispõe a torsades — risco que se soma ao de qualquer droga que prolongue o QT.',
    },
  ],

  /* ----------------------------------------------------------- outros ---- */

  juncional: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Bradicardia regular — e alguma coisa faltando',
      texto:
        'Os complexos vêm devagar, com espaçamento constante entre si. Percorra o trecho que antecede cada complexo e note o que não está lá.',
    },
    {
      foco: 'p',
      tMs: 1300,
      titulo: 'Não há onda P antes do complexo',
      texto:
        'O espaço anterior ao complexo está isoelétrico: nenhuma onda P sinusal. Ela pode estar ausente, escondida dentro do complexo, ou retrógrada e negativa nas derivações inferiores. O que importa aqui é que o comando não veio do nó sinusal.',
    },
    {
      foco: 'qrs',
      tMs: 1460,
      titulo: 'Meça a largura do complexo',
      texto:
        'O complexo é estreito, abaixo de 120 ms. Isso indica que o estímulo nasceu acima da bifurcação do feixe de His e desceu pelo sistema de condução normal — ou seja, na própria junção atrioventricular.',
    },
    {
      foco: 'fc',
      tMs: 2100,
      titulo: 'Compare a frequência com as faixas de marcapasso subsidiário',
      texto:
        'A frequência está em torno de 46 por minuto, dentro da faixa própria do nó atrioventricular como marcapasso subsidiário, que vai de 40 a 60. Um escape ventricular seria mais lento e teria complexo largo.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: ritmo juncional de escape',
      texto:
        'Bradicardia regular de QRS estreito sem onda P sinusal. Este não é o diagnóstico final: escape é consequência, e a pergunta correta é o que silenciou o nó sinusal — hipertonia vagal, isquemia inferior, drogas que freiam o nó, hipercalemia. Nunca suprima um ritmo de escape: ele é o que está mantendo o débito.',
    },
  ],

  wpw: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Ritmo sinusal, mas o complexo tem um começo estranho',
      texto:
        'Esta tira é de V4. O ritmo é regular e há onda P antes de cada complexo. O que destoa é a transição entre a onda P e o complexo, que parece não ter o intervalo reto que você já viu no traçado normal.',
    },
    {
      foco: 'pr',
      tMs: 1015,
      titulo: 'Meça o intervalo PR',
      texto:
        'Do início da onda P ao início do complexo há menos de três quadradinhos, ou seja, menos de 120 ms. Um PR curto significa que alguma coisa chegou ao ventrículo sem passar pelo atraso fisiológico do nó atrioventricular.',
    },
    {
      foco: 'qrs',
      tMs: 1050,
      titulo: 'Olhe agora a subida inicial do complexo',
      texto:
        'O início do complexo não é anguloso: ele sobe devagar, empastado, antes de ganhar velocidade. Esse empastamento é a onda delta, e corresponde à porção do ventrículo despolarizada músculo a músculo pela via acessória.',
    },
    {
      foco: 'qrs',
      tMs: 1080,
      titulo: 'Compare a largura total com a de um bloqueio de ramo',
      texto:
        'O complexo está alargado, mas o alargamento vem do início, não do meio nem do fim. No bloqueio de ramo o PR é normal e o alargamento é tardio; aqui o PR é curto e o alargamento é inicial. São padrões opostos.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: padrão de pré-excitação (Wolff-Parkinson-White)',
      texto:
        'PR curto, onda delta e QRS alargado. Assintomático, avaliação eletrofisiológica conforme o risco; com taquiarritmia, a ablação da via acessória é curativa. A consequência mais perigosa: em fibrilação atrial pré-excitada — taquicardia irregular, de QRS largo, muito rápida e com complexos de larguras variáveis — bloquear o nó atrioventricular com adenosina, verapamil, diltiazem ou digoxina favorece a condução pela via acessória e pode degenerar em fibrilação ventricular. Nesse caso: cardioversão elétrica se instável, procainamida se estável.',
    },
  ],

  qtLongo: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'A frequência é normal, mas cada ciclo parece esticado',
      texto:
        'Esta tira é de V4. O ritmo é sinusal e a frequência é normal-baixa. Percorra um batimento inteiro e note quanto tempo se passa entre o fim do complexo e o retorno definitivo à linha de base.',
    },
    {
      foco: 'st',
      tMs: 1400,
      titulo: 'Observe o segmento entre o complexo e a onda T',
      texto:
        'O segmento ST está alongado e a onda T demora a começar. Não há desvio para cima nem para baixo — o que mudou foi a duração da repolarização, não o seu nível.',
    },
    {
      foco: 'intervalos',
      tMs: 1780,
      titulo: 'Meça do início do complexo até o fim da onda T',
      texto:
        'Meça na derivação em que o fim da onda T for mais nítido e em que o QT for mais longo. Aqui o intervalo passa de 500 ms. Esse é o QT bruto — ele ainda não pode ser interpretado.',
    },
    {
      foco: 'fc',
      tMs: null,
      titulo: 'Compare com a frequência: o QT precisa ser corrigido',
      texto:
        'O QT encurta quando a frequência sobe e alonga quando ela cai, então o valor bruto não significa nada isolado. Pela fórmula de Bazett, divide-se o QT pela raiz quadrada do intervalo RR em segundos. Fora da faixa de 60 a 100 bpm, prefira Fridericia, porque Bazett superestima em taquicardia e subestima em bradicardia.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: síndrome do QT longo',
      texto:
        'QTc acima do limite, medido corretamente e corrigido pela frequência. Aqui existe uma divergência de fontes que você precisa conhecer, e não resolver sozinho: a Diretriz da SBC de 2022 usa 450 ms em homens e 470 ms em mulheres, enquanto o guia de OSCE do curso usa 450 e 460 ms. Confirme qual convenção o seu professor cobra. Em qualquer uma delas, QTc acima de 500 ms indica risco alto de torsades. Conduta: suspender drogas que prolongam o QT, corrigir potássio e magnésio, e investigar causa congênita quando não houver causa adquirida.',
    },
  ],
};

/* ==========================================================================
   3. ÍNDICES AUXILIARES
   ========================================================================== */

/** Módulo de uma família diagnóstica. */
export const moduloDaFamilia = (familia) =>
  MODULOS.find((m) => m.familia === familia) || null;

/** Roteiro de leitura guiada de um padrão. Devolve [] se ainda não houver. */
export const roteiroDe = (chave) => ROTEIROS[chave] || [];

/** Ordem didática global: concatena a ordem sugerida de cada módulo. */
export const ordemDidatica = () => MODULOS.flatMap((m) => m.ordemSugerida);
