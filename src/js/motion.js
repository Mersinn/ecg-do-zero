/**
 * Fachada da biblioteca Motion.
 *
 * Por que existe
 * --------------
 * O arquivo em vendor/motion.js e um bundle UMD: importado por um modulo ES ele
 * nao expoe exports nomeados, ele escreve `globalThis.Motion`. Ninguem no app
 * deveria precisar saber disso. Esta fachada faz a traducao uma vez, num lugar
 * so, e passa a ser a unica porta de entrada da biblioteca no projeto. Se um dia
 * o vendor virar ESM de verdade, muda este arquivo e mais nada.
 *
 * O import e estatico de proposito: nao ha etapa de build, entao um import
 * dinamico so adiaria a mesma requisicao para depois da primeira pintura, com o
 * agravante de fazer os cartoes ficarem sem resposta ao toque nos primeiros
 * instantes, que e justamente o que a animacao veio resolver.
 *
 * Regra do projeto: TODA animacao passa por respeitaMovimento(). Nada de
 * animar direto a partir do objeto Motion.
 */

import '../../vendor/motion.js';

const M = globalThis.Motion || {};

/* Se o vendor nao carregou (arquivo ausente, navegador antigo engasgando dentro
   do bundle), o app nao pode quebrar por causa de enfeite. Os cotos abaixo
   mantem as assinaturas validas e respeitaMovimento() passa a devolver false,
   o que faz todo ponto de uso desistir antes de mexer em qualquer estilo. */
const CARREGOU = typeof M.animate === 'function';

const cotoControle = () => ({
  finished: Promise.resolve(),
  stop() {}, cancel() {}, complete() {}, play() {}, pause() {},
});
const cotoDesligar = () => () => {};

export const animate = CARREGOU ? M.animate : cotoControle;
export const scroll = CARREGOU ? M.scroll : cotoDesligar;
export const inView = CARREGOU ? M.inView : cotoDesligar;
export const hover = CARREGOU ? M.hover : cotoDesligar;
export const press = CARREGOU ? M.press : cotoDesligar;
export const spring = CARREGOU ? M.spring : undefined;
export const stagger = CARREGOU ? M.stagger : () => 0;

/**
 * Devolve false quando nao se deve animar.
 *
 * Duas causas, e as duas terminam no mesmo lugar: o vendor nao estar disponivel
 * e o aluno ter pedido menos movimento no sistema (prefers-reduced-motion:
 * reduce). Nos dois casos a interface precisa continuar inteira e legivel sem
 * nenhuma animacao, o que significa que quem chama deve desistir ANTES de
 * esconder qualquer coisa. Nunca esconda para revelar depois sem checar isto.
 *
 * A consulta e feita a cada chamada, e nao guardada, porque a preferencia do
 * sistema muda com o aparelho ligado: iPadOS e iOS trocam sozinhos quando a
 * bateria entra em modo de economia.
 *
 * @returns {boolean} true quando animar e permitido.
 */
export function respeitaMovimento() {
  if (!CARREGOU) return false;
  try {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
}
