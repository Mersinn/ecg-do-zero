/**
 * Anatomia do batimento.
 *
 * Toca-se num componente da onda e duas coisas acendem ao mesmo tempo: o
 * trecho correspondente no traçado e a estrutura do coração que o gera.
 *
 * Esta é a peça que transforma o ECG de "desenho a decorar" em "consequência
 * de um evento elétrico". Enquanto o aluno não liga a onda P ao nó sinusal e o
 * intervalo PR ao atraso do nó AV, todo o resto é memorização — e memorização
 * desmonta na primeira pegadinha.
 */

const PECAS = [
  {
    id: 'P',
    titulo: 'Onda P — despolarização atrial',
    onda: ['w-p'],
    coracao: ['c-sa', 'c-atrios'],
    mecanismo: `O <strong>nó sinusal</strong>, no alto do átrio direito, dispara sozinho — é o
      marca-passo natural do coração. O impulso se espalha pelos dois átrios e os faz contrair.
      Essa propagação atrial é a onda P.`,
    serve: `Mostra que o comando nasceu no lugar certo. <strong>Onda P positiva em DII antes de
      cada QRS, com PR constante, é a definição de ritmo sinusal</strong> — o primeiro passo de
      toda leitura.`,
    normal: 'Normal: duração < 120 ms · amplitude < 2,5 mm',
    alterada: 'Alta e pontuda: sobrecarga atrial direita. Larga e entalhada: sobrecarga atrial esquerda. Ausente: fibrilação atrial, ritmo juncional.',
  },
  {
    id: 'PR',
    titulo: 'Intervalo PR — a passagem pelo nó AV',
    onda: ['w-pr'],
    coracao: ['c-av', 'c-his'],
    mecanismo: `O impulso chega ao <strong>nó atrioventricular</strong>, único caminho elétrico
      entre átrios e ventrículos. O nó AV <strong>segura</strong> o sinal por cerca de um décimo de
      segundo antes de liberá-lo pelo feixe de His.`,
    serve: `Esse atraso não é defeito, é função: dá tempo de os átrios terminarem de encher os
      ventrículos antes da contração. <strong>É aqui que se decidem todos os bloqueios AV</strong> —
      e é por isso que medir o PR resolve metade dos traçados de prova.`,
    normal: 'Normal: 120 a 200 ms (3 a 5 quadradinhos)',
    alterada: 'Longo e fixo: BAV de 1º grau. Longo e crescente até falhar: Mobitz I. Fixo com falha súbita: Mobitz II. Curto com onda delta: pré-excitação.',
  },
  {
    id: 'QRS',
    titulo: 'Complexo QRS — despolarização ventricular',
    onda: ['w-qrs'],
    coracao: ['c-ramos', 'c-purkinje', 'c-ventriculos'],
    mecanismo: `Saindo do His, o impulso desce pelos <strong>ramos direito e esquerdo</strong> e se
      espalha pela rede de <strong>fibras de Purkinje</strong>. Essa rede é rápida: despolariza os
      dois ventrículos quase simultaneamente. Por isso o QRS é estreito e alto — muita massa
      muscular ativada em pouquíssimo tempo.`,
    serve: `É a contração que se sente no pulso. <strong>Q</strong> é a primeira deflexão negativa,
      <strong>R</strong> a primeira positiva, <strong>S</strong> a negativa que vem depois do R.
      Quando o QRS é largo, o impulso andou <em>fora</em> do sistema de condução — ramo bloqueado ou
      foco nascendo no próprio ventrículo.`,
    normal: 'Normal: < 120 ms (menos de 3 quadradinhos)',
    alterada: 'Largo com V1 positivo: bloqueio de ramo direito. Largo com V1 negativo: bloqueio de ramo esquerdo. Largo sem onda P, em taquicardia: taquicardia ventricular até prova em contrário.',
  },
  {
    id: 'J',
    titulo: 'Ponto J — o fim da despolarização',
    onda: ['w-j'],
    coracao: ['c-ventriculos'],
    mecanismo: `A junção exata entre o fim do QRS e o começo do segmento ST. Marca o instante em que
      o ventrículo terminou de despolarizar e ainda não começou a repolarizar.`,
    serve: `É a <strong>régua</strong> da isquemia. Supra e infra de ST se medem no ponto J,
      comparando com a linha de base — e não no meio do segmento, onde a inclinação já enganou muita
      gente.`,
    normal: 'Referência: deve coincidir com a linha isoelétrica',
    alterada: 'Elevado: supradesnivelamento. Deprimido: infradesnivelamento. Elevado com entalhe em jovem assintomático: repolarização precoce.',
  },
  {
    id: 'ST',
    titulo: 'Segmento ST — o platô',
    onda: ['w-st'],
    coracao: ['c-ventriculos'],
    mecanismo: `Os ventrículos estão inteiramente despolarizados, num platô elétrico. Como não há
      diferença de potencial entre regiões, não há vetor — e o traçado fica na linha de base.`,
    serve: `Justamente por dever ser plano, qualquer desvio é significativo.
      <strong>Supra convexo e localizado, com imagem em espelho: oclusão coronária aguda.
      Infra horizontal ou descendente: isquemia subendocárdica. Supra difuso e côncavo com infra de
      PR: pericardite.</strong>`,
    normal: 'Normal: isoelétrico, com variação de até 1 mm',
    alterada: 'A distinção que decide conduta é localizado × difuso e convexo × côncavo — não apenas "subiu" ou "desceu".',
  },
  {
    id: 'T',
    titulo: 'Onda T — repolarização ventricular',
    onda: ['w-t'],
    coracao: ['c-ventriculos'],
    mecanismo: `Os ventrículos se <strong>repolarizam</strong>, recarregando para o próximo
      batimento. A repolarização caminha em sentido oposto à despolarização, o que faz a onda T ser
      normalmente concordante com o QRS.`,
    serve: `A forma importa tanto quanto a direção. A T normal é <strong>assimétrica</strong>: sobe
      devagar e desce mais rápido. Quando fica <strong>simétrica, alta e de base estreita</strong>,
      pense em potássio.`,
    normal: 'Normal: arredondada, assimétrica, concordante com o QRS',
    alterada: 'Apiculada e simétrica: hipercalemia. Invertida: isquemia, sobrecarga ou discordância normal do bloqueio de ramo. Achatada com onda U: hipocalemia.',
  },
  {
    id: 'QT',
    titulo: 'Intervalo QT — a sístole elétrica',
    onda: ['w-qt'],
    coracao: ['c-ventriculos'],
    mecanismo: `Do início do QRS ao fim da onda T: o ciclo elétrico ventricular completo,
      despolarização mais repolarização. Como encurta quando o coração acelera, precisa ser
      corrigido pela frequência antes de ser julgado.`,
    serve: `<strong>QT longo é risco de torsades de pointes.</strong> Causas frequentes e
      corrigíveis: drogas que prolongam o QT, hipocalemia e hipomagnesemia. A fórmula de Bazett
      (QT dividido pela raiz quadrada do RR em segundos) é a mais usada, mas superestima em
      taquicardia e subestima em bradicardia — fora da faixa de 60 a 100 bpm, prefira Fridericia.`,
    normal: 'QTc normal: até 450 ms em homens e 470 ms em mulheres (Diretriz SBC 2022)',
    alterada: 'Atenção à divergência de fontes: o Guia OSCE que circula no curso usa 450/460. As duas convenções existem — confirme qual o seu professor cobra. Acima de 500 ms, o risco de torsades é alto em qualquer convenção.',
  },
];

/* Um batimento normal desenhado grande, com cada componente separável. */
function batimentoSVG() {
  return `<svg class="anat-svg ecg-svg ecg-papel" viewBox="0 0 620 220" role="img"
       aria-label="Batimento normal ampliado, com onda P, intervalo PR, complexo QRS, ponto J, segmento ST, onda T e intervalo QT identificáveis">
    <defs>
      <pattern id="anat-grade" width="20" height="20" patternUnits="userSpaceOnUse">
        <path class="ecg-grade-1" d="M0 0H20M0 4H20M0 8H20M0 12H20M0 16H20M0 0V20M4 0V20M8 0V20M12 0V20M16 0V20"/>
        <path class="ecg-grade-5" d="M0 0H20M0 0V20"/>
      </pattern>
    </defs>
    <rect class="ecg-fundo" width="620" height="220"/>
    <rect width="620" height="220" fill="url(#anat-grade)"/>

    <line x1="20" y1="150" x2="600" y2="150" stroke="currentColor" stroke-width="1" opacity="0.15"/>

    <!-- QT: colchete sob o traçado, do início do QRS ao fim da T -->
    <path id="w-qt" class="peca ecg-traco" d="M196 182 L196 194 L436 194 L436 182"/>

    <path id="w-p"   class="peca ecg-traco" d="M60 150 C86 150 92 108 118 108 C144 108 150 150 176 150"/>
    <path id="w-pr"  class="peca ecg-traco" d="M176 150 L196 150"/>
    <path id="w-qrs" class="peca ecg-traco" d="M196 150 L208 166 L222 34 L238 176 L252 150"/>
    <circle id="w-j" class="peca ecg-traco" cx="252" cy="150" r="5" fill="currentColor"/>
    <path id="w-st"  class="peca ecg-traco" d="M252 150 L318 150"/>
    <path id="w-t"   class="peca ecg-traco" d="M318 150 C356 150 372 96 388 96 C406 96 420 150 436 150"/>
    <path class="ecg-traco" d="M436 150 L600 150" opacity="0.2"/>

    <g class="anat-legenda">
      <text x="118" y="98" text-anchor="middle">P</text>
      <text x="222" y="26" text-anchor="middle">QRS</text>
      <text x="388" y="86" text-anchor="middle">T</text>
      <text x="316" y="207" text-anchor="middle">QT</text>
    </g>
  </svg>`;
}

/* O sistema de condução, esquemático. */
function coracaoSVG() {
  return `<svg class="anat-svg" viewBox="0 0 220 260" role="img"
       aria-label="Esquema do sistema de condução cardíaco: nó sinusal, átrios, nó atrioventricular, feixe de His, ramos, fibras de Purkinje e ventrículos">
    <path class="anat-coracao"
          d="M110 34 C142 8 194 18 198 76 C202 138 158 200 108 236 C58 200 22 146 24 88 C26 38 82 26 110 34 Z"/>

    <ellipse id="c-atrios"     class="peca" cx="110" cy="78"  rx="70" ry="28" fill="#58b6f5" opacity="0.2"/>
    <ellipse id="c-ventriculos" class="peca" cx="106" cy="168" rx="72" ry="52" fill="#46f0b9" opacity="0.16"/>

    <circle id="c-sa"  class="peca" cx="158" cy="62"  r="8" fill="#1a6fb5"/>
    <circle id="c-av"  class="peca" cx="108" cy="110" r="7" fill="#a35b0c"/>
    <line   id="c-his" class="peca" x1="108" y1="118" x2="104" y2="146"
            stroke="#a35b0c" stroke-width="4" stroke-linecap="round"/>
    <path   id="c-ramos" class="peca" d="M104 146 L74 202 M104 146 L136 198"
            fill="none" stroke="#0f7a52" stroke-width="3.4" stroke-linecap="round"/>
    <path   id="c-purkinje" class="peca"
            d="M74 202 q-10 10 -20 4 M74 202 q-4 14 -14 16 M136 198 q10 10 20 4 M136 198 q4 14 14 16"
            fill="none" stroke="#0f7a52" stroke-width="2.4" stroke-dasharray="2 3" stroke-linecap="round"/>

    <g class="anat-legenda">
      <text x="170" y="56">nó sinusal</text>
      <text x="118" y="108">nó AV</text>
      <text x="112" y="142">His</text>
      <text x="148" y="228">Purkinje</text>
    </g>
  </svg>`;
}

const TODAS_ONDAS = ['w-p', 'w-pr', 'w-qrs', 'w-j', 'w-st', 'w-t', 'w-qt'];
const TODAS_PECAS_CORACAO = ['c-sa', 'c-atrios', 'c-av', 'c-his', 'c-ramos', 'c-purkinje', 'c-ventriculos'];

export function criarAnatomia(container) {
  container.innerHTML = `
    <div class="empilha-g">
      <section class="prosa empilha">
        <span class="etiqueta">Fundamento</span>
        <h1>Anatomia do batimento</h1>
        <p>Toque em cada parte da onda. Ela acende no traçado e, ao lado, acende a estrutura do
        coração que a produz. Enquanto a onda P não estiver ligada ao nó sinusal e o intervalo PR ao
        atraso do nó AV, ler ECG continua sendo decorar desenho — e desenho decorado desmonta na
        primeira pegadinha.</p>
      </section>

      <div class="cartao empilha">
        <div class="ecg-tira">
          <div class="ecg-cabeca"><span><span class="ecg-pulso"></span>Batimento normal · DII</span><span class="ecg-calib-texto">ampliado</span></div>
          <div class="ecg-scroller">${batimentoSVG()}</div>
        </div>

        <div class="anat-botoes" role="group" aria-label="Componentes do batimento">
          ${PECAS.map((p, i) => `<button class="anat-botao" type="button" data-peca="${i}" aria-pressed="${i === 0}">${p.id}</button>`).join('')}
        </div>

        <div class="anat-grade">
          <div class="anat-explica" data-explica aria-live="polite"></div>
          <div class="cartao cartao--calmo">
            ${coracaoSVG()}
            <p class="miudo fraco centro" style="margin-top:var(--e-2)">Sistema de condução</p>
          </div>
        </div>
      </div>
    </div>`;

  const explica = container.querySelector('[data-explica]');

  function selecionar(i) {
    const p = PECAS[i];

    for (const b of container.querySelectorAll('[data-peca]')) {
      b.setAttribute('aria-pressed', String(Number(b.dataset.peca) === i));
    }

    for (const id of TODAS_ONDAS) {
      container.querySelector(`#${id}`)?.classList.toggle('ativa', p.onda.includes(id));
    }
    for (const id of TODAS_PECAS_CORACAO) {
      container.querySelector(`#${id}`)?.classList.toggle('ativa', p.coracao.includes(id));
    }

    explica.innerHTML = `
      <h4>${p.titulo}</h4>
      <dl>
        <dt>Mecanismo</dt><dd>${p.mecanismo}</dd>
        <dt>Para que serve na leitura</dt><dd>${p.serve}</dd>
        <dt>Quando está alterado</dt><dd>${p.alterada}</dd>
      </dl>
      <p class="anat-normal">${p.normal}</p>`;
  }

  container.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-peca]');
    if (b) selecionar(Number(b.dataset.peca));
  });

  selecionar(0);
  return { selecionar };
}
