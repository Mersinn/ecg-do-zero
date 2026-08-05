# ECG do Zero

Curso interativo de eletrocardiograma para estudantes de medicina do ciclo clínico.
Feito para quem **nunca leu um ECG** e precisa chegar ao nível de decisão clínica.

**Site:** em breve · **Licença:** MIT

---

## O que é

Um site estático, sem cadastro e sem servidor, que ensina a ler eletrocardiograma pela
mesma sequência que se usa na prática — e cobra que você a percorra antes de fechar
qualquer diagnóstico.

Cada padrão tem três etapas: você é conduzido pelo traçado, depois lê sozinho, depois
aplica num caso clínico. O site nunca mostra um traçado com o diagnóstico escrito ao lado.

### A bancada

Três instrumentos em que você manipula o traçado em vez de só olhar:

- **Gerador de traçado** — mova a frequência, o PR, o QRS, o ST, a T e a P, e leia o laudo
  que se atualiza junto. Cada trilha mostra o limiar do normal, então você vê a fronteira
  antes de cruzá-la. No modo desafio, o site pede um padrão ("produza um BAV de 1º grau")
  e confere se os seus parâmetros o produzem.
- **Eixo elétrico** — DI e aVF sozinhos decidem o quadrante. Inverta a polaridade e veja o
  vetor girar na roda hexaxial, com presets clínicos (hemibloqueios, sobrecarga direita).
- **Paquímetro** — arraste dois marcadores sobre o traçado e meça de verdade, em mm, ms e
  quadradões. No modo aferido, o site pede uma medida e **corrige a sua**, com tolerância
  explícita. Medir é habilidade motora: sem correção, você treina o próprio erro.

## Honestidade sobre os traçados

**Os traçados deste site são sintéticos.** São gerados por equações a partir de parâmetros
clínicos, para ensinar a morfologia de cada padrão. Não são registros de pacientes, não têm
ruído nem artefato de movimento, e não substituem a leitura de um ECG de 12 derivações
calibrado. Um padrão aprendido aqui precisa ser reconhecido depois em traçado real.

Este material é produzido por estudante, para estudantes. Não é diretriz e não serve para
decisão clínica.

## Sobre divergências de fonte

Onde o material do curso diverge de si mesmo ou das diretrizes nacionais, o site **mostra a
divergência** em vez de escolher um lado em silêncio. Exemplo: o QTc normal aparece como
450 ms para homens e 470 ms para mulheres pela Diretriz da SBC de 2022, e como 450/460 no
guia de OSCE que circula no curso. As duas convenções existem e o aluno precisa saber disso.

## Como rodar localmente

Não há etapa de build nem dependências. Como o site usa módulos ES, ele precisa ser servido
por HTTP — abrir o arquivo direto no navegador não funciona.

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Arquitetura

```
index.html
src/css/app.css          sistema de design em camadas (@layer)
src/js/app.js            navegação e telas
src/js/store.js          progresso e repetição espaçada (localStorage)
src/js/tools.js          gerador, eixo e paquímetro
src/js/ecg/engine.js     síntese de forma de onda e renderização SVG
src/js/ecg/library.js    biblioteca de padrões, com leitura e conduta
src/js/data/             questões, casos e texto dos módulos
```

Duas decisões de engenharia que não devem ser desfeitas sem entender o porquê:

1. **A síntese amostra no domínio do tempo, com passo de 1 ms.** Amostrar por pixel faz o
   passo saltar o pico do R e renderiza batimentos alternados com metade da voltagem — o
   que imita alternância elétrica, sinal de tamponamento. Um artefato ensinando um padrão
   errado.
2. **Nenhuma pintura do SVG vai em atributo de apresentação.** `var()` dentro de atributo
   não é confiável no Chromium; o traçado renderizaria sem cor e sem espessura no Chrome
   Android. Cor e espessura vêm de classe CSS.

## As abas

| Aba | O que faz |
|---|---|
| Método | A sequência de nove passos, executável sobre um traçado |
| O papel | Calibração, quadradinho, quadradão e o pulso de 1 mV |
| Anatomia | Cada onda ligada à estrutura do coração que a gera, com o impulso animado |
| Localizar | Parede do infarto por derivação e artéria; os quatro bloqueios AV lado a lado |
| Módulos | 27 padrões, cada um com aula, leitura guiada e treino |
| Bancada | Gerador de traçado, eixo elétrico e paquímetro |
| Plantão | 18 casos clínicos progressivos, com o Freio antes da correção |
| Questões | 46 questões comentadas |
| Desempenho | Progresso, fila de revisão e repetição espaçada |

## Verificando o conteúdo antes de commitar

O site não tem servidor nem banco: todo o conteúdo clínico mora em módulos
JavaScript versionados. Isso é ótimo para quem quer ler e editar, e perigoso
porque nada impede uma questão de entrar com o gabarito fora do intervalo ou
apontando para um padrão que não existe. Um erro assim não quebra o site — ele
ensina errado, em silêncio.

```bash
python tools/verificar.py
```

O script confere sintaxe de todo o JavaScript, chaves órfãs entre os arquivos,
índices de gabarito, alternativas duplicadas, roteiros faltando, módulos sem
família e a regra de que a primeira parada de um roteiro guiado não pode
entregar o diagnóstico. Sai com código 1 se encontrar erro, então serve em CI.

Ele **não valida medicina**: um gabarito pode passar em todas as checagens
estruturais e ainda assim estar clinicamente errado. Isso é trabalho de revisão
humana.

## Contribuindo

Correção de conteúdo médico é a contribuição mais valiosa aqui. Encontrou um erro clínico,
um critério desatualizado ou uma conduta mal descrita? Abra uma issue com a fonte.

## Licença

MIT — veja `LICENSE`.
