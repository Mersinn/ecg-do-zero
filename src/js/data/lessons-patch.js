/**
 * ECG do Zero: patch de calibragem pedagógica sobre `lessons.js`.
 *
 * Este arquivo NÃO substitui `lessons.js`. Ele corrige, por cima, dois defeitos
 * apontados pelo autor.
 *
 * ---------------------------------------------------------------------------
 * DEFEITO 1. Meta sobre o curso no lugar do conteúdo.
 *
 * O texto anterior explicava a PROCEDÊNCIA de alguns erros ("existe um resumo
 * em circulação que enuncia isso invertido", "o guia de OSCE do curso registra
 * assim"). Isso é arqueologia de fontes: serve a quem cruzou os materiais, não
 * a quem está aprendendo o achado. A regra aplicada aqui é: dizer o achado como
 * ele é e como ele é cobrado, sem contar de onde veio o erro alheio.
 *
 * Menção a divergência de fontes só permanece quando ela muda a resposta de uma
 * prova. Sobraram duas, e as duas ficam intocadas por este patch porque vivem em
 * campos que ele não altera: o QTc (450/470 ms pela SBC 2022 contra 450/460 ms
 * do guia de OSCE, em `ancoras` de `outros` e na síntese do roteiro `qtLongo`) e
 * o limiar de duração para cardioversão eletiva na fibrilação atrial (48 h
 * clássicas contra 24 h das Diretrizes ESC/EACTS de 2024), que segue em
 * `errosComuns` de `taqui` e é reescrito aqui sem perder as duas convenções.
 *
 * ---------------------------------------------------------------------------
 * DEFEITO 2. O módulo abre raso, sem ponte entre ver e nomear.
 *
 * Duas correções estruturais:
 *   a) todo `comoLer` termina agora com uma frase imperativa dizendo o que o
 *      aluno vai OLHAR PRIMEIRO e por quê. É a última linha de cada texto, e é
 *      ela que entrega o aluno ao traçado com uma tarefa concreta na mão.
 *   b) a primeira parada dos roteiros que entregavam diagnóstico cedo demais
 *      passou a ser observação ou medida concreta, sem nomear achado nem
 *      excluir hipótese. Nomear continua sendo trabalho da última parada.
 *
 * ---------------------------------------------------------------------------
 * COMO APLICAR
 *
 * `PATCH_MODULOS` é { familia: { campo: valor } } e deve ser mesclado CAMPO A
 * CAMPO sobre o módulo correspondente. Campos não citados (titulo, promessa,
 * fisiopatologia, ancoras, ordemSugerida) permanecem como estão em `lessons.js`.
 *
 * `PATCH_ROTEIROS` é { chaveDoPadrao: [paradas] } e cada array já vem COMPLETO,
 * com todas as paradas do roteiro na ordem final. Substitua o array inteiro, não
 * apenas o primeiro elemento. As paradas não reescritas foram transportadas com
 * o conteúdo clínico intacto, apenas com a pontuação normalizada.
 *
 * Nenhum critério, limiar, dose ou conduta foi alterado. Toda a verdade clínica
 * continua sendo a de `ecg/library.js`.
 */

/* ==========================================================================
   1. MÓDULOS. porQueImporta, comoLer e errosComuns
   ========================================================================== */

export const PATCH_MODULOS = {

  /* ---------------------------------------------------------------- base -- */
  base: {
    porQueImporta:
      'Todo achado anormal é definido por contraste com o traçado normal, então sem ele na memória visual nenhum diagnóstico se sustenta. Na prova, a maior parte dos erros não é confundir dois diagnósticos raros: é não perceber que algo saiu do normal, ou chamar de doença uma variação fisiológica. E a primeira pergunta que alguém faz diante de um traçado, no plantão, é se ele está normal. É essa pergunta que ordena todas as outras.',
    comoLer:
      'Comece pela adequação técnica, antes de qualquer diagnóstico: confirme 25 mm/s, ganho de 10 mm/mV e pulso de calibração de 1 mV medindo 10 mm de altura. Um traçado com ganho pela metade transforma sobrecarga ventricular em ECG normal. Só depois vá a DII longo e responda uma pergunta de cada vez: existe onda P positiva antes de cada complexo, sempre à mesma distância dele? Frequência, intervalos e repolarização só fazem sentido depois dessa resposta. Olhe primeiro o pulso de calibração e, em seguida, a onda P em DII: um diz se a sua régua vale, a outra diz se o comando saiu do lugar certo.',
    errosComuns: [
      {
        erro: 'Pular o passo da adequação técnica e ir direto ao diagnóstico.',
        porQue:
          'Ganho e velocidade alterados mudam amplitude e duração de tudo o que vem depois. Metade do ganho apaga um critério de voltagem; 50 mm/s dobra a largura aparente do complexo.',
        comoEvitar:
          'Olhe o pulso de calibração antes de olhar as ondas. Ele tem que medir 10 mm de altura e estar no início da tira. Se não estiver lá, você não sabe o que está medindo.',
      },
      {
        erro: 'Tratar bradicardia sinusal e taquicardia sinusal como diagnósticos completos.',
        porQue:
          'Nas duas o ritmo sinusal está preservado e só a frequência se deslocou. O diagnóstico verdadeiro é a causa: febre, dor, hipovolemia, hipóxia, sepse, tireotoxicose e embolia pulmonar de um lado; atleta, sono, betabloqueador e hipertonia vagal do outro.',
        comoEvitar:
          'Depois de nomear, pergunte sempre "resposta a quê?". A taquicardia sinusal é sintoma, e frear a frequência sem tratar a causa pode ser deletério.',
      },
      {
        erro: 'Confundir bradicardia sinusal com bloqueio atrioventricular.',
        porQue:
          'As duas dão complexos espaçados. A diferença está na relação entre P e QRS: na bradicardia sinusal ela está intacta, e no bloqueio ela está quebrada, seja por alongamento do PR, seja por falha de condução.',
        comoEvitar:
          'Meça o PR de três batimentos consecutivos e confira se toda P conduziu. Se a resposta for "PR fixo e nenhuma P perdida", é bradicardia sinusal, por mais lento que esteja.',
      },
    ],
  },

  /* ---------------------------------------------------------- sobrecarga -- */
  sobrecarga: {
    porQueImporta:
      'Sobrecarga é o achado crônico que mais aparece no ECG ambulatorial e o pano de fundo mais comum em questão de valvopatia e de hipertensão. O que faz dele um tema difícil é o par que engana: sobrecarga ventricular esquerda com strain desenha quase o mesmo infradesnivelamento e a mesma onda T invertida da isquemia lateral. A diferença entre os dois é a diferença entre marcar um ambulatório e acionar a hemodinâmica.',
    comoLer:
      'Neste tema o olhar vai à onda P antes de ir às precordiais. Na P, decida uma coisa de cada vez: primeiro a altura, contra 2,5 mm, que são dois quadradinhos e meio; depois a largura, contra 120 ms, que são três quadradinhos. Nas precordiais, meça a profundidade da S em V1 e a altura da R em V5 ou V6, some antes de opinar, e confira se a repolarização lateral acompanha as ondas R altas. Comece pela onda P em DII medindo altura antes de largura: é a única onda do traçado em que cada uma das duas dimensões aponta para um átrio diferente.',
    errosComuns: [
      {
        erro: 'Trocar amplitude e duração entre os dois átrios.',
        porQue:
          'É a inversão mais frequente do tema e ela custa a questão inteira: quem troca a regra transforma P pulmonale em P mitrale, e leva junto toda a investigação que vem depois do nome.',
        comoEvitar:
          'Ancore no mecanismo, não na frase. O átrio direito despolariza primeiro e se sobrepõe ao segundo componente, então só pode crescer para cima. O esquerdo despolariza depois e, quando atrasa, só pode alargar a onda no tempo. Amplitude é direita, duração é esquerda.',
      },
      {
        erro: 'Ler o strain da sobrecarga ventricular esquerda como isquemia lateral aguda.',
        porQue:
          'As duas alterações são infradesnivelamento de ST com T invertida nas mesmas derivações. A diferença está na companhia e no contexto: o strain vem com ondas R muito altas, com história de hipertensão ou estenose aórtica de longa data, e é estável ao longo do tempo.',
        comoEvitar:
          'Antes de chamar de isquemia, pergunte se existe critério de voltagem no mesmo traçado e se há sintoma agudo. Hipertenso crônico assintomático com Sokolow altíssimo e infra lateral é sobrecarga até prova em contrário, e a prova em contrário é clínica, não eletrocardiográfica.',
      },
      {
        erro: 'Julgar amplitude sem conferir a calibração.',
        porQue:
          'Todo critério de sobrecarga é um critério de milímetros, e milímetros dependem do ganho. Um traçado registrado em N/2, que é calibração legítima e usada em hipertrofia e em criança, corta pela metade a soma de Sokolow.',
        comoEvitar:
          'Confirme o pulso de calibração de 1 mV antes de somar milímetros. Se o pulso mede 5 mm em vez de 10, dobre mentalmente o que você mediu, ou peça outro traçado.',
      },
      {
        erro: 'Fechar sobrecarga atrial esquerda numa zona de medida ambígua.',
        porQue:
          'Existe uma faixa estreita, entre 0,11 e 0,12 s, em que a onda P já não é claramente normal e ainda não preenche o critério de sobrecarga atrial esquerda. Nomear diagnóstico dentro dela é escolher um lado sem apoio na medida.',
        comoEvitar:
          'Nessa faixa, descreva o achado em vez de nomeá-lo: "P de 0,115 s, sem entalhe nítido". O diagnóstico fica firme quando duração acima de 0,12 s e entalhe aparecem juntos.',
      },
    ],
  },

  /* ----------------------------------------------------------------- bav -- */
  bav: {
    porQueImporta:
      'Cada grau de bloqueio termina em uma conduta diferente: observar, suspender uma droga, ou chamar o serviço de estimulação cardíaca. Por isso esta é a família que mais rende questão de conduta. E a separação entre Mobitz I e Mobitz II decide, no plantão, se o paciente fica em observação ou se você monta o marcapasso, com horas de risco de assistolia no meio das duas escolhas.',
    comoLer:
      'Neste tema, tira longa não é conforto, é requisito: o padrão só se revela ao longo de vários batimentos. Depois de localizar as ondas P, pergunte nesta ordem: toda P conduziu? Se sim, o PR está acima de 200 ms e é fixo? Se alguma P não conduziu, o PR dos batimentos anteriores estava crescendo ou estava fixo? E, por último, existe alguma relação entre P e QRS, ou cada grupo marcha sozinho? Vá primeiro às ondas P de uma tira longa de DII e confirme que elas são regulares entre si: o relógio dos átrios é a régua com que você vai julgar tudo o que o ventrículo faz.',
    errosComuns: [
      {
        erro: 'Chamar de bloqueio de segundo grau um traçado que só tem PR longo.',
        porQue:
          'Um PR de 300 ms impressiona visualmente, mas enquanto todas as ondas P conduzirem não houve falha de condução. O segundo grau começa quando um complexo deixa de acontecer.',
        comoEvitar:
          'Conte as ondas P e conte os complexos na mesma tira. Se os números batem, é primeiro grau, por mais longo que esteja o PR.',
      },
      {
        erro: 'Classificar como Mobitz I ou II um bloqueio 2:1.',
        porQue:
          'No bloqueio 2:1 uma P conduz e a seguinte é bloqueada, alternadamente. Como nunca existem dois PR conduzidos consecutivos, não há como saber se o PR estava crescendo: ele é literalmente inclassificável nos dois tipos.',
        comoEvitar:
          'Nomeie o que é: "BAV 2:1". As pistas indiretas de sítio são a largura do complexo, sendo que largo sugere infranodal, e a resposta à atropina ou ao exercício. Bloqueio avançado, ou de alto grau, é outra entidade: duas ou mais ondas P consecutivas bloqueadas.',
      },
      {
        erro: 'Confundir extrassístole atrial bloqueada com bloqueio atrioventricular.',
        porQue:
          'Nos dois casos aparece uma onda P sem complexo. A diferença é que a P da extrassístole chega adiantada e tem morfologia diferente da sinusal, muitas vezes escondida dentro da onda T do batimento anterior, e a cadência das P sinusais continua regular.',
        comoEvitar:
          'Antes de contar uma P sem complexo como bloqueio, confira duas coisas: se ela veio prematura e se o intervalo entre as demais P está preservado. P adiantada e de forma diferente não é bloqueio.',
      },
      {
        erro: 'Gastar tempo com doses repetidas de atropina em bloqueio infranodal instável.',
        porQue:
          'A atropina acelera o átrio sem melhorar a condução abaixo do nó AV. O resultado pode ser mais ondas P bloqueadas, e não mais batimentos conduzidos, com piora da frequência ventricular.',
        comoEvitar:
          'Em Mobitz II ou bloqueio total com instabilidade, monte o marcapasso transcutâneo desde já e use adrenalina ou dopamina em infusão como ponte. Não espere chegar à dose máxima de atropina para mudar de estratégia.',
      },
    ],
  },

  /* ---------------------------------------------------------------- ramo -- */
  ramo: {
    porQueImporta:
      'Bloqueio de ramo é a causa mais comum de complexo largo em ritmo sinusal, e reconhecê-lo evita dois erros opostos. O primeiro é ler como isquemia uma alteração de repolarização que é obrigatória dentro do bloqueio. O segundo é deixar passar um infarto escondido dentro de um bloqueio de ramo esquerdo, e é esse que mata paciente.',
    comoLer:
      'Aqui a ordem é rígida e curta. Meça a duração do complexo: abaixo de 120 ms, este tema não se aplica. Igual ou acima de 120 ms, vá a V1. Confirme depois com DI e V6, procurando a S alargada do ramo direito ou a R entalhada do ramo esquerdo, e só então olhe ST e T, já sabendo que a alteração discordante é esperada. Meça primeiro a largura do complexo e, passando de 120 ms, olhe só a direção da deflexão principal em V1: essa única direção separa os dois bloqueios antes de qualquer outra medida.',
    errosComuns: [
      {
        erro: 'Chamar de infarto anterosseptal a onda T invertida de V1 e V2 num bloqueio de ramo direito.',
        porQue:
          'A alteração de repolarização é secundária ao distúrbio de condução e está presente por definição. Interpretá-la como evento agudo gera investigação desnecessária.',
        comoEvitar:
          'Sempre que encontrar T invertida nas precordiais direitas, meça antes a largura do complexo e olhe a morfologia em V1. Achou orelha de coelho, a T invertida está explicada.',
      },
      {
        erro: 'Tentar laudar isquemia dentro de um bloqueio de ramo esquerdo pelos critérios habituais de supra.',
        porQue:
          'O bloqueio de ramo esquerdo já desloca o ST por conta própria, e sempre na direção oposta ao complexo. Aplicar o limiar comum de 1 mm sem considerar a discordância produz falso-positivo em série e, pior, falso-negativo quando o supra verdadeiro é discordante e desproporcional.',
        comoEvitar:
          'Use Sgarbossa. Procure primeiro concordância, ou seja, supra onde o complexo é positivo e infra onde ele é negativo, porque concordância nunca é explicada pelo bloqueio.',
      },
      {
        erro: 'Tratar todo bloqueio de ramo esquerdo novo com dor como indicação automática de trombólise.',
        porQue:
          'A formulação "bloqueio de ramo esquerdo novo mais clínica é equivalente de supra" ainda é cobrada, e ela obriga a conduzir como síndrome coronariana aguda, não a reperfundir por reflexo. A oclusão ainda precisa ser identificada dentro do traçado.',
        comoEvitar:
          'Trate a urgência como real e a decisão de reperfusão como clínica somada a critério. Aplique Sgarbossa começando pela concordância, e diga em voz alta qual critério você usou para decidir.',
      },
    ],
  },

  /* --------------------------------------------------------------- taqui -- */
  taqui: {
    porQueImporta:
      'É a família em que a decisão depende mais de tempo, e a que a prova cobra em quase todo caso clínico de palpitação, sempre pelo mesmo algoritmo. No plantão a sequência é a mesma, com o paciente na frente. E é aqui que mora o erro mais perigoso de todo o tema do ECG: escolher o modo errado de choque em um paciente instável.',
    comoLer:
      'Comece pela largura do complexo, medida na derivação em que ele for mais largo, e não pela frequência. Depois marque três ou quatro intervalos RR consecutivos e decida regularidade: irregular com complexo estreito aponta fibrilação atrial. Em seguida procure atividade atrial, seja onda P sinusal, P retrógrada depois do complexo, ondas F em dente de serra ou ondulação fina. Só ao final compare a forma dos complexos entre si. Em paralelo, olhe o paciente: hipotensão, alteração aguda do estado mental, sinais de choque, desconforto torácico isquêmico e insuficiência cardíaca aguda são os cinco sinais de instabilidade. Olhe primeiro a largura do complexo e o paciente, quase ao mesmo tempo: a largura escolhe a lista de drogas proibidas, e o paciente escolhe se ainda há tempo para consultar lista alguma.',
    errosComuns: [
      {
        erro: 'Tentar cardioversão sincronizada numa taquicardia ventricular polimórfica instável.',
        porQue:
          'O aparelho precisa identificar picos de R consistentes para disparar no momento certo. Com amplitude e polaridade variando a cada complexo, ele não encontra o marcador e o choque simplesmente não sai, enquanto o tempo passa com o paciente em colapso.',
        comoEvitar:
          'Diante de complexos de formas diferentes entre si, ou de qualquer dúvida entre monomórfico e polimórfico, use choque não sincronizado em alta energia. Este é o erro mais perigoso de todo o tema.',
      },
      {
        erro: 'Tratar uma taquicardia de complexo largo como se fosse supraventricular e administrar bloqueador do nó AV.',
        porQue:
          'Verapamil e diltiazem em taquicardia ventricular podem causar colapso hemodinâmico e degeneração para fibrilação ventricular. Na fibrilação atrial pré-excitada, bloquear o nó AV favorece a condução pela via acessória e produz o mesmo desfecho.',
        comoEvitar:
          'Assuma origem ventricular por padrão. Sobre a adenosina, a regra de bolso "nunca em complexo largo" é boa porque o erro que ela previne é grave; formalmente, ela pode ser considerada em taquicardia de complexo largo REGULAR e MONOMÓRFICA quando há dúvida diagnóstica e o paciente está estável, e é proibida se o ritmo for irregular, polimórfico ou pré-excitado.',
      },
      {
        erro: 'Cardioverter uma fibrilação atrial de início indeterminado sem preparo.',
        porQue:
          'Restaurar a contração de um átrio que ficou parado por dias pode lançar um trombo na circulação sistêmica. A anticoagulação prévia e o ecocardiograma transesofágico existem para evitar exatamente isso.',
        comoEvitar:
          'Cardioversão eletiva exige anticoagulação adequada por período suficiente ou ecocardiograma transesofágico excluindo trombo, com anticoagulação mantida depois do procedimento. Saiba as duas convenções de limiar de duração, porque elas mudam a resposta: 48 horas no critério clássico e 24 horas nas Diretrizes de 2024 para o manejo da fibrilação atrial da Sociedade Europeia de Cardiologia com a Associação Europeia de Cirurgia Cardiotorácica (ESC/EACTS 2024). Paciente instável cardioverte imediatamente.',
      },
      {
        erro: 'Cardioverter taquicardia sinusal.',
        porQue:
          'Taquicardia sinusal é resposta a uma causa: dor, febre, hipovolemia, hipóxia, sepse, tireotoxicose. Chocar o ritmo próprio do paciente não corrige nada e retira a compensação que o mantinha perfundido.',
        comoEvitar:
          'Antes de indicar choque, confirme que existe onda P sinusal antes de cada complexo. A regra do suporte avançado é literal: nunca faça cardioversão em paciente com ritmo sinusal.',
      },
      {
        erro: 'Considerar diagnóstico fechado a fibrilação atrial só pela irregularidade.',
        porQue:
          'Flutter com condução variável e taquicardia atrial multifocal também são irregulares. O que separa é a atividade atrial: ondas F organizadas em dente de serra no flutter, três ou mais morfologias de onda P na multifocal, e nenhuma onda organizada na fibrilação.',
        comoEvitar:
          'Depois de constatar irregularidade, procure ativamente a linha de base em DII, DIII, aVF e V1. Manobra vagal ou adenosina desmascaram o flutter ao frear o nó AV temporariamente.',
      },
    ],
  },

  /* -------------------------------------------------------------- parada -- */
  parada: {
    porQueImporta:
      'Aqui o ECG deixa de ser exame e vira decisão de segundos. Errar para menos, deixando de desfibrilar uma fibrilação ventricular, custa sobrevida a cada minuto de atraso. Errar para mais, chocando uma assistolia, interrompe compressões que são a única coisa mantendo perfusão cerebral. E antes dessas duas coisas existe uma terceira: confirmar que o traçado é do paciente e não do cabo.',
    comoLer:
      'A leitura formal em nove passos não se aplica aqui, e insistir nela custa tempo. Confirme primeiro que o paciente está sem pulso e sem resposta. Depois olhe o monitor com uma pergunta só: a atividade elétrica está desorganizada, ausente, ou organizada? Antes de declarar linha reta, aumente o ganho e confira outra derivação e os cabos. Olhe o paciente antes da tela: o monitor decide o modo do choque, mas é o pulso que decide se existe parada.',
    errosComuns: [
      {
        erro: 'Apertar o botão de sincronizar antes de chocar uma fibrilação ventricular.',
        porQue:
          'O modo sincronizado espera um pico de onda R para disparar. Na fibrilação ventricular não existe onda R, então a carga permanece no aparelho e o choque não é administrado.',
        comoEvitar:
          'Em parada, o modo é desfibrilação. Lembre também que a maioria dos aparelhos retorna sozinha ao modo não sincronizado depois de cada choque, o que é conveniente aqui e é armadilha na cardioversão eletiva, onde é preciso reativar o sincronismo a cada tentativa.',
      },
      {
        erro: 'Desfibrilar assistolia na esperança de ver se o ritmo volta.',
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
  },

  /* ------------------------------------------------------------ isquemia -- */
  isquemia: {
    porQueImporta:
      'É a família mais dependente de tempo e a que a prova moderna mais cobra. Confundir pericardite com infarto pode levar a trombolisar um paciente que vai sangrar no pericárdio, e não reconhecer um equivalente de oclusão pode custar a artéria inteira. Existe ainda uma armadilha de conduta própria do tema, que é a do infarto de ventrículo direito.',
    comoLer:
      'A pergunta central não é se existe supradesnivelamento, é onde ele está e com que forma. Depois de localizar o desvio, mapeie a distribuição: derivações contíguas de uma parede apontam para artéria, e desvio em quase todas as derivações aponta para pericárdio. Procure ativamente a imagem em espelho na parede oposta, avalie a concavidade, e em todo quadro inferior peça V3R e V4R antes de prescrever. Localize o ponto J antes de medir qualquer coisa, no fim do complexo e não no meio do segmento: é o único lugar em que o milímetro que você mede tem valor de critério.',
    errosComuns: [
      {
        erro: 'Atribuir a contraindicação de nitrato, morfina e diurético ao infarto de parede inferior.',
        porQue:
          'A contraindicação nasce do acometimento do ventrículo direito, cujo débito depende de pré-carga: reduzir a pré-carga nesse paciente causa hipotensão grave. Nem todo infarto inferior tem envolvimento do ventrículo direito, e enunciar a regra por parede troca a causa pela vizinhança.',
        comoEvitar:
          'Em todo infarto inferior, peça V3R e V4R. Havendo infarto de ventrículo direito, a conduta é volume, e nitrato, morfina e diurético estão contraindicados. Sem envolvimento do ventrículo direito, a contraindicação não se aplica automaticamente.',
      },
      {
        erro: 'Trombolisar um supradesnivelamento difuso de pericardite.',
        porQue:
          'A pericardite eleva o ST em quase todas as derivações e engana quem só procurou supra maior que 1 mm. Trombolisar pericárdio inflamado pode causar hemopericárdio.',
        comoEvitar:
          'Antes de reperfundir, confirme distribuição territorial e imagem em espelho. Procure o infra de PR e a concavidade. Some a clínica: dor que piora deitado e melhora sentado inclinado para a frente, e atrito pericárdico à ausculta.',
      },
      {
        erro: 'Tratar supra em aVR com infra difuso como equivalente de STEMI e indicar fibrinólise.',
        porQue:
          'Apenas uma minoria desses pacientes tem oclusão trombótica aguda; o padrão reflete isquemia subendocárdica global por lesão de tronco ou doença triarterial. A trombólise não é a conduta, e o padrão não consta da lista de equivalentes de oclusão.',
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
          'São coisas diferentes: o intervalo PR mede tempo de condução, enquanto o segmento PR é a linha entre o fim da P e o início do complexo, e é ela que se deprime na pericardite.',
        comoEvitar:
          'Olhe a altura da linha entre a onda P e o complexo, comparando com o segmento TP. Se ela está abaixo, isso é infra de PR, e é um dos dois melhores discriminadores contra oclusão.',
      },
    ],
  },

  /* ----------------------------------------------------------- eletrolito -- */
  eletrolito: {
    porQueImporta:
      'A hipercalemia é o distúrbio eletrolítico que mais mata através do ECG, e o traçado costuma mudar antes de o potássio voltar do laboratório. Reconhecer o padrão é o que autoriza começar o tratamento na hora, sem esperar o exame. Do outro lado, a hipocalemia é o terreno da torsades e é causa frequente de arritmia ventricular em quem usa diurético.',
    comoLer:
      'Neste tema o olhar começa na onda T e depois anda para trás. Avalie a T primeiro em altura, largura de base e simetria. Depois volte à onda P e pergunte se ela ainda existe e com que amplitude. Em seguida meça a largura do complexo, comparando com traçados anteriores se houver. Por último, procure onda U depois da T e decida se o que você mediu como QT terminou na T ou já incluiu a U. Comece pela onda T descrevendo a forma antes da altura: é a largura da base, e não o tamanho, que separa a hipercalemia da isquemia.',
    errosComuns: [
      {
        erro: 'Ler a onda T apiculada da hipercalemia como onda T hiperaguda de oclusão coronária.',
        porQue:
          'As duas são ondas T altas e chamam atenção pela amplitude. A diferença está na forma: a da hipercalemia é estreita, simétrica e de base estreita, e a da isquemia é larga, assimétrica e de base ampla, e vem em território coronariano.',
        comoEvitar:
          'Compare a largura da base antes da altura, e leia o contexto: insuficiência renal, uso de inibidor da enzima conversora ou de espironolactona, rabdomiólise e acidose puxam para hipercalemia.',
      },
      {
        erro: 'Esperar o resultado do potássio para tratar um traçado já alterado.',
        porQue:
          'A alteração eletrocardiográfica indica que a membrana já está comprometida, e a progressão para alargamento do complexo e onda sinusoidal pode ser rápida. O laboratório confirma; ele não autoriza começar.',
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
  },

  /* -------------------------------------------------------------- outros -- */
  outros: {
    porQueImporta:
      'Os três padrões desta seção mudam a conduta de forma desproporcional ao espaço que ocupam no traçado. A pré-excitação transforma drogas de rotina em risco de fibrilação ventricular. O QT longo é o substrato da torsades e muitas vezes está sendo produzido por uma prescrição em curso. E o ritmo de escape é a única coisa sustentando o débito de um paciente bradicárdico, de modo que suprimi-lo é iatrogenia direta.',
    comoLer:
      'Nos três padrões o achado mora em um lugar específico e vale ir direto a ele. Na pré-excitação, meça o PR e depois olhe o início do complexo procurando o empastamento, porque delta e PR curto vêm sempre juntos. No QT, escolha a derivação em que a onda T termina de forma mais nítida e em que o QT for mais longo, meça do início do complexo ao fim da T, e corrija pela frequência antes de concluir. No escape, comece pela ausência de onda P sinusal e pela frequência, e só então avalie a largura do complexo para inferir de onde ele nasceu. Meça o intervalo PR antes de julgar qualquer complexo largo: PR curto com alargamento inicial conta uma história, PR normal com alargamento tardio conta outra.',
    errosComuns: [
      {
        erro: 'Administrar bloqueador do nó atrioventricular numa fibrilação atrial pré-excitada.',
        porQue:
          'Bloquear o nó AV redireciona a condução para a via acessória, que não limita a frequência ventricular. O resultado pode ser aumento paradoxal da resposta ventricular e degeneração para fibrilação ventricular.',
        comoEvitar:
          'Diante de taquicardia irregular, de complexo largo e muito rápida, com complexos de larguras diferentes, suspenda a rotina: cardioversão elétrica se instável, procainamida se estável. Adenosina também está proibida nesse cenário.',
      },
      {
        erro: 'Confundir pré-excitação com bloqueio de ramo.',
        porQue:
          'Os dois alargam o complexo. A diferença está no início dele e no intervalo que o precede: na pré-excitação o PR é curto e o alargamento vem do empastamento inicial, enquanto no bloqueio de ramo o PR é normal e o alargamento é da porção média e final.',
        comoEvitar:
          'Meça o PR antes de julgar o complexo. PR abaixo de 120 ms com complexo largo é pré-excitação até prova em contrário.',
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
  },
};

/* ==========================================================================
   2. ROTEIROS. Arrays completos, com a primeira parada reescrita
   --------------------------------------------------------------------------
   Só entram aqui os roteiros cuja primeira parada entregava diagnóstico, ou
   excluía hipótese, antes de o aluno ter olhado o traçado. Os demais roteiros
   de `lessons.js` permanecem como estão.
   ========================================================================== */

export const PATCH_ROTEIROS = {

  /* ------------------------------------------------------------- base ---- */

  normal: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Confira a régua e depois procure repetição',
      texto:
        'Comece pelo pulso retangular no início da tira: ele mede 10 mm de altura e é a prova de que 1 mV vale 10 mm neste papel. Feito isso, percorra a tira de ponta a ponta e repare que o mesmo desenho reaparece, sempre com o mesmo espaçamento. Por enquanto você constatou duas coisas: a régua vale, e existe um padrão que se repete.',
    },
    {
      foco: 'p',
      tMs: 1005,
      titulo: 'Existe uma onda antes de cada complexo?',
      texto:
        'Esta pequena deflexão positiva e arredondada é a onda P, e ela aparece antes de cada complexo. Como estamos em DII, uma P positiva significa que a despolarização atrial caminhou de cima para baixo, ou seja, nasceu onde deveria nascer.',
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

  taquiSinusal: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Compare o espaçamento com o do traçado de referência',
      texto:
        'Os complexos estão visivelmente mais próximos uns dos outros do que no traçado normal, e a distância entre eles se repete igual do começo ao fim da tira. Registre as duas observações separadas: os complexos estão perto, e o espaçamento é constante. Nenhuma das duas, sozinha, dá diagnóstico.',
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
      titulo: 'Procure a onda P: ela ainda está identificável',
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

  /* -------------------------------------------------------------- bav ---- */

  bavt: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Marque as ondas P numa passagem e os complexos em outra',
      texto:
        'Percorra a tira marcando só as ondas P, ignorando todo o resto. Depois volte ao início e marque só os complexos. Com as duas passagens feitas separadamente, compare as posições: algumas P caem logo antes de um complexo, outras no meio dele, outras dentro da onda T.',
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
        'Os complexos também são regulares entre si, mas muito mais lentos, cerca de 36 por minuto, e são largos. Largura indica que este ritmo não desceu pelo sistema de condução normal: é um escape de origem ventricular.',
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

  /* ------------------------------------------------------------ taqui ---- */

  tsv: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Meça três intervalos entre complexos e compare os três',
      texto:
        'Os complexos vêm muito rápidos. Conte os quadradinhos entre o primeiro par, depois entre o segundo par, depois entre o terceiro: os três valores coincidem. Guarde as duas observações lado a lado, frequência alta e espaçamento constante, sem tirar conclusão ainda.',
    },
    {
      foco: 'qrs',
      tMs: 850,
      titulo: 'Meça a largura do complexo',
      texto:
        'O complexo é estreito, abaixo de 120 ms. Isso coloca a origem acima da bifurcação do feixe de His: estamos diante de uma taquicardia supraventricular, e não ventricular.',
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
      titulo: 'Calcule a frequência dos complexos e anote o número',
      texto:
        'Os complexos são regulares e rápidos. Conte os quadradinhos entre dois deles e faça a conta: a frequência fica em torno de 150 por minuto. Anote esse número antes de qualquer outra coisa. Ele não fecha diagnóstico nenhum, mas é ele que obriga a olhar com atenção o espaço entre os complexos.',
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
      titulo: 'Meça três intervalos entre complexos, um de cada vez',
      texto:
        'Escolha um par de complexos e conte os quadradinhos entre eles. Repita em outro par mais adiante, e depois em um terceiro. Os três números saem diferentes entre si. Percorra a tira inteira antes de aceitar essa impressão, porque um trecho curto pode enganar.',
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
      titulo: 'Compare dois intervalos RR e descreva o tipo de irregularidade',
      texto:
        'Volte aos intervalos que você mediu: eles não coincidem, e não coincidem de forma imprevisível, sem padrão que se repita a cada dois ou três batimentos. É isso que se chama irregularmente irregular.',
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
        'Ausência de onda P com RR irregularmente irregular. O diferencial imediato é flutter com condução variável, que também é irregular mas mostra ondas F organizadas. A decisão que mais muda prognóstico não é a frequência: é a anticoagulação, definida pelo escore de risco embólico. E cardioversão eletiva em fibrilação de duração indeterminada exige preparo, com anticoagulação adequada ou ecocardiograma transesofágico antes.',
    },
  ],

  tv: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Compare o tamanho dos complexos com o do traçado de referência',
      texto:
        'Os complexos vêm rápidos, com espaçamento constante entre si, e ocupam bem mais espaço horizontal do que os do traçado normal. Por enquanto são três observações e nenhuma medida: rápido, regular e maior. A medida vem no próximo passo, e é ela que muda o algoritmo inteiro.',
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
        'Não há onda P relacionada aos complexos. Quando presentes, dissociação atrioventricular, batimentos de captura e batimentos de fusão são praticamente diagnósticos, mas a ausência deles não afasta nada.',
    },
    {
      foco: 'qrs',
      tMs: 1250,
      titulo: 'Compare os complexos entre si',
      texto:
        'Todos os complexos têm a mesma morfologia: isto é monomórfico. Guarde essa observação, porque ela é o que autoriza o modo sincronizado se for preciso chocar, e é o que muda quando o ritmo for polimórfico.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: taquicardia ventricular monomórfica',
      texto:
        'Taquicardia regular de QRS largo com complexos idênticos entre si. A ordem das perguntas é fixa: tem pulso? Sem pulso, desfibrilação não sincronizada e protocolo de parada. Com pulso e instável, cardioversão sincronizada. Com pulso e estável, antiarrítmico intravenoso, amiodarona, procainamida ou sotalol, com o desfibrilador preparado. Em quem tem cardiopatia estrutural ou infarto prévio, QRS largo é taquicardia ventricular até prova em contrário.',
    },
  ],

  torsades: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Percorra a tira comparando cada complexo com o anterior',
      texto:
        'A frequência é altíssima e os complexos são grandes. Antes de medir qualquer coisa, faça uma tarefa só: compare cada complexo com o que veio imediatamente antes dele. O tamanho muda de um para o outro, e em alguns trechos a direção também muda. Guarde essa observação, porque é dela que sai todo o resto.',
    },
    {
      foco: 'qrs',
      tMs: 780,
      titulo: 'Meça a cadência e observe a amplitude crescer até um máximo',
      texto:
        'Neste trecho os complexos vão crescendo em amplitude, formando um fuso: é a primeira metade do fenômeno que dá nome ao ritmo. Meça agora a distância entre dois complexos consecutivos, que é de cerca de 6 quadradinhos, ou 240 ms, o equivalente a aproximadamente 250 por minuto. Numa frequência dessas o tempo de enchimento ventricular praticamente desaparece, e é por isso que a apresentação típica é síncope.',
    },
    {
      foco: 'qrs',
      tMs: 1440,
      titulo: 'Agora observe a amplitude diminuir e a polaridade inverter',
      texto:
        'Aqui os complexos afinam até quase encostar na linha de base e depois voltam a crescer, mas apontando para o outro lado. O eixo está girando continuamente: é literalmente uma torção em torno da linha de base.',
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
        'Taquicardia ventricular polimórfica em fuso, sobre um QT prolongado. Sulfato de magnésio 1 a 2 g IV mesmo com magnésio sérico normal, correção do potássio e suspensão de toda droga que prolongue o QT. E o ponto de segurança mais importante de todo o tema: se estiver instável ou sem pulso, o choque é NÃO sincronizado, porque o aparelho não consegue marcar uma onda R consistente em morfologia variável e simplesmente não dispara. Note que torsades pode ter pulso: instabilidade não é sinônimo de parada.',
    },
  ],

  /* ----------------------------------------------------------- parada ---- */

  assistolia: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Antes de interpretar, execute a checagem',
      texto:
        'Este traçado não significa nada sozinho. Confirme o paciente sem pulso e sem resposta, confira eletrodos, cabos e conexões, aumente o ganho e passe para uma segunda derivação. Só depois dessa sequência o que aparece na tela vale como informação.',
    },
    {
      foco: 'ritmo',
      tMs: 2500,
      titulo: 'Compare com a fibrilação ventricular fina',
      texto:
        'Aumente o ganho mentalmente e pergunte se poderia haver ondulação de baixa amplitude escondida nesta linha. Fibrilação ventricular fina é chocável e assistolia não é, e as duas podem parecer iguais num ganho inadequado.',
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

  pericardite: [
    {
      foco: 'tira',
      tMs: null,
      titulo: 'Escolha a linha de referência antes de julgar qualquer segmento',
      texto:
        'O ritmo é sinusal e a frequência está discretamente elevada. Antes de olhar para cima ou para baixo, defina contra o que você vai comparar: o trecho entre o fim da onda T e a onda P seguinte é a linha isoelétrica desta tira. Passe o olho por ela do começo ao fim e fixe essa altura.',
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
        'No traçado completo, este supra aparece em quase todas as derivações, poupando aVR e V1, onde ocorre o inverso. Não respeita território de artéria e não tem imagem em espelho, e essas duas ausências são tão diagnósticas quanto a concavidade.',
    },
    {
      foco: 'sintese',
      tMs: null,
      titulo: 'Nomeie: pericardite aguda',
      texto:
        'Supradesnivelamento difuso e côncavo com infra de PR, sem território coronariano e sem recíproca. Anti-inflamatório não esteroidal ou aspirina em dose alta, associados a colchicina, que reduz recorrência, e ecocardiograma para investigar derrame. Reconhecer não é detalhe acadêmico: trombolisar pericardite pode causar hemopericárdio. Some a clínica: dor que piora deitado e melhora sentado inclinado para a frente, e atrito pericárdico à ausculta.',
    },
  ],
};

/* ==========================================================================
   3. APLICAÇÃO
   ========================================================================== */

/**
 * Aplica `PATCH_MODULOS` sobre a lista de módulos, campo a campo.
 * Não muta o original: devolve uma nova lista.
 *
 * @param {object[]} modulos lista vinda de `lessons.js`
 * @returns {object[]}
 */
export const aplicarPatchModulos = (modulos) =>
  modulos.map((m) => (PATCH_MODULOS[m.familia] ? { ...m, ...PATCH_MODULOS[m.familia] } : m));

/**
 * Aplica `PATCH_ROTEIROS` sobre o mapa de roteiros, substituindo o array
 * inteiro das chaves presentes no patch.
 *
 * @param {Record<string, object[]>} roteiros mapa vindo de `lessons.js`
 * @returns {Record<string, object[]>}
 */
export const aplicarPatchRoteiros = (roteiros) => ({ ...roteiros, ...PATCH_ROTEIROS });
