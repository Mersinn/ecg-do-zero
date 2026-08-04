#!/usr/bin/env python3
"""
Verificador de integridade do conteúdo do ECG Ultimate Learning.

Por que existe
--------------
O site não tem servidor nem banco de dados: todo o conteúdo clínico mora em
módulos JavaScript versionados. Isso é bom para o aluno (abre e lê) e perigoso
para quem edita — nada impede que uma questão entre com o gabarito fora do
intervalo, apontando para um padrão inexistente, ou com o mesmo enunciado
duplicado. Um erro assim não quebra o site: ele ensina errado, em silêncio.

Este script é a rede de proteção. Roda em segundos, não depende de nada além da
biblioteca padrão e falha com código 1 quando encontra problema, para poder ser
usado em CI.

Uso
---
    python tools/verificar.py

O que ele NÃO faz
-----------------
Não valida medicina. Um gabarito pode estar dentro de todos os limites técnicos
e ainda assim estar clinicamente errado. Isso é trabalho de revisão humana e da
auditoria clínica — este script só garante que a estrutura é coerente.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DADOS = RAIZ / "src" / "js" / "data"
BIBLIOTECA = RAIZ / "src" / "js" / "ecg" / "library.js"

problemas: list[str] = []
avisos: list[str] = []


def erro(msg: str) -> None:
    problemas.append(msg)


def aviso(msg: str) -> None:
    avisos.append(msg)


def exportar_via_node(caminho: Path, nomes: list[str]) -> dict:
    """
    Lê um módulo ES executando-o no Node e serializando os exports pedidos.

    Fazer isso com Node em vez de tentar interpretar o JavaScript com regex é
    deliberado: o conteúdo tem crases, acentos e template literals, e qualquer
    tentativa de parsear à mão daria falso positivo.
    """
    url = caminho.resolve().as_uri()
    expr = ", ".join(f"{n}: m.{n} ?? null" for n in nomes)
    script = f"import({json.dumps(url)}).then(m => {{ process.stdout.write(JSON.stringify({{{expr}}})); }})"
    saida = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        capture_output=True, text=True, encoding="utf-8", cwd=RAIZ,
    )
    if saida.returncode != 0:
        erro(f"{caminho.name}: não pôde ser carregado pelo Node.\n{saida.stderr.strip()[:400]}")
        return {}
    try:
        return json.loads(saida.stdout)
    except json.JSONDecodeError:
        erro(f"{caminho.name}: exports não serializáveis em JSON.")
        return {}


def verificar_sintaxe() -> None:
    """`node --check` em todo JavaScript do projeto."""
    for arquivo in sorted((RAIZ / "src").rglob("*.js")):
        r = subprocess.run(["node", "--check", str(arquivo)], capture_output=True, text=True)
        if r.returncode != 0:
            erro(f"sintaxe inválida em {arquivo.relative_to(RAIZ)}:\n{r.stderr.strip()[:300]}")


def main() -> int:
    print("Verificando ECG Ultimate Learning\n" + "=" * 46)

    verificar_sintaxe()

    lib = exportar_via_node(BIBLIOTECA, ["PADROES", "FAMILIAS"])
    padroes = lib.get("PADROES") or {}
    familias = lib.get("FAMILIAS") or {}

    if not padroes:
        erro("library.js: PADROES vazio ou ilegível — nada mais pode ser verificado.")
        return relatar()

    print(f"  padrões: {len(padroes)}   famílias: {len(familias)}")

    # ---- 1. Coerência interna da biblioteca -------------------------------
    campos_obrigatorios = ["nome", "familia", "nivel", "derivacao", "leitura",
                           "dx", "pivo", "conduta", "distrator", "pegadinha"]
    passos_leitura = ["adequacao", "ritmo", "fc", "eixo", "intervalos", "qrs", "st", "sintese", "conduta"]

    for chave, p in padroes.items():
        for campo in campos_obrigatorios:
            if not p.get(campo):
                erro(f"padrão '{chave}': falta o campo obrigatório '{campo}'.")
        if p.get("familia") and p["familia"] not in familias:
            erro(f"padrão '{chave}': família '{p['familia']}' não existe em FAMILIAS.")
        leitura = p.get("leitura") or {}
        faltando = [s for s in passos_leitura if not leitura.get(s)]
        if faltando:
            erro(f"padrão '{chave}': leitura incompleta, faltam {', '.join(faltando)}.")
        alternativas = p.get("alternativas") or []
        if len(alternativas) < 2:
            aviso(f"padrão '{chave}': menos de 2 alternativas erradas no quiz de fechamento.")
        if p.get("dx") in alternativas:
            erro(f"padrão '{chave}': o diagnóstico correto aparece também entre as alternativas erradas.")

    # ---- 2. Lições --------------------------------------------------------
    licoes = exportar_via_node(DADOS / "lessons.js", ["MODULOS", "ROTEIROS"])
    modulos = licoes.get("MODULOS") or []
    roteiros = licoes.get("ROTEIROS") or {}
    print(f"  módulos: {len(modulos)}   roteiros: {len(roteiros)}")

    familias_com_modulo = {m.get("familia") for m in modulos}
    for f in familias:
        if f not in familias_com_modulo:
            erro(f"família '{f}' não tem módulo em lessons.js.")

    for m in modulos:
        for k in ("titulo", "promessa", "porQueImporta", "fisiopatologia", "comoLer"):
            if not m.get(k):
                erro(f"módulo '{m.get('familia')}': falta '{k}'.")
        for chave in m.get("ordemSugerida") or []:
            if chave not in padroes:
                erro(f"módulo '{m.get('familia')}': ordemSugerida cita padrão inexistente '{chave}'.")

    for chave in padroes:
        if chave not in roteiros:
            erro(f"padrão '{chave}' não tem roteiro guiado em ROTEIROS.")
    for chave, passos in roteiros.items():
        if chave not in padroes:
            erro(f"ROTEIROS tem '{chave}', que não existe em PADROES.")
            continue
        if not passos:
            erro(f"roteiro '{chave}': vazio.")
            continue
        if len(passos) < 3:
            aviso(f"roteiro '{chave}': só {len(passos)} paradas; o desenho pede de 3 a 5.")
        # A primeira parada não pode entregar o diagnóstico de graça.
        primeiro = (passos[0].get("texto") or "").lower()
        nome_dx = (padroes[chave].get("dx") or "").lower()
        if nome_dx and len(nome_dx) > 8 and nome_dx in primeiro:
            erro(f"roteiro '{chave}': a primeira parada já entrega o diagnóstico.")

    # ---- 3. Questões ------------------------------------------------------
    questoes = (exportar_via_node(DADOS / "questions.js", ["QUESTOES"]).get("QUESTOES")) or []
    print(f"  questões: {len(questoes)}")

    vistos_id: set[str] = set()
    vistos_enunciado: set[str] = set()
    for q in questoes:
        qid = q.get("id", "<sem id>")
        if qid in vistos_id:
            erro(f"questão '{qid}': id duplicado.")
        vistos_id.add(qid)

        alts = q.get("alternativas") or []
        if len(alts) != 5:
            erro(f"questão '{qid}': {len(alts)} alternativas (esperado 5).")
        if len(set(alts)) != len(alts):
            erro(f"questão '{qid}': alternativas repetidas.")

        correta = q.get("correta")
        if not isinstance(correta, int) or not (0 <= correta < len(alts)):
            erro(f"questão '{qid}': índice de gabarito inválido ({correta!r}) para {len(alts)} alternativas.")

        pqe = q.get("porQueErradas") or []
        if len(pqe) != len(alts):
            erro(f"questão '{qid}': porQueErradas tem {len(pqe)} entradas para {len(alts)} alternativas.")

        if q.get("familia") not in familias:
            erro(f"questão '{qid}': família '{q.get('familia')}' não existe.")
        if q.get("padrao") and q["padrao"] not in padroes:
            erro(f"questão '{qid}': padrão '{q['padrao']}' não existe.")

        for campo in ("enunciado", "porQue", "variavelDecisiva"):
            if not q.get(campo):
                erro(f"questão '{qid}': falta '{campo}'.")

        chave_texto = re.sub(r"\s+", " ", (q.get("enunciado") or "")).strip().lower()[:160]
        if chave_texto and chave_texto in vistos_enunciado:
            aviso(f"questão '{qid}': enunciado muito parecido com outro já existente.")
        vistos_enunciado.add(chave_texto)

        # Sem \b no fim: "incorret" precisa casar dentro de "INCORRETA".
        if q.get("comandoInvertido") and not re.search(r"\b(exceto|incorret\w*|n[aã]o|fals\w*)\b",
                                                      (q.get("enunciado") or ""), re.I):
            aviso(f"questão '{qid}': marcada como comando invertido, mas o enunciado não traz a negação.")

    invertidas = sum(1 for q in questoes if q.get("comandoInvertido"))
    if questoes and invertidas == 0:
        aviso("nenhuma questão de comando invertido — a banca usa esse formato.")

    # ---- 4. Casos ---------------------------------------------------------
    casos = (exportar_via_node(DADOS / "cases.js", ["CASOS"]).get("CASOS")) or []
    print(f"  casos: {len(casos)}")

    vistos_caso: set[str] = set()
    for c in casos:
        cid = c.get("id", "<sem id>")
        if cid in vistos_caso:
            erro(f"caso '{cid}': id duplicado.")
        vistos_caso.add(cid)

        if c.get("familia") not in familias:
            erro(f"caso '{cid}': família '{c.get('familia')}' não existe.")
        if c.get("padrao") and c["padrao"] not in padroes:
            erro(f"caso '{cid}': padrão '{c['padrao']}' não existe.")

        decisoes = c.get("decisoes") or []
        if not decisoes:
            erro(f"caso '{cid}': sem decisões.")
        for i, d in enumerate(decisoes, 1):
            alts = d.get("alternativas") or []
            correta = d.get("correta")
            if len(alts) < 3:
                erro(f"caso '{cid}', decisão {i}: só {len(alts)} alternativas.")
            if not isinstance(correta, int) or not (0 <= correta < len(alts)):
                erro(f"caso '{cid}', decisão {i}: gabarito inválido ({correta!r}).")
            if not d.get("variavelDecisiva"):
                erro(f"caso '{cid}', decisão {i}: falta variavelDecisiva — é o coração do Freio.")

    # ---- 5. Cobertura -----------------------------------------------------
    com_questao = {q.get("padrao") for q in questoes if q.get("padrao")}
    sem_questao = [k for k in padroes if k not in com_questao]
    if sem_questao:
        aviso(f"{len(sem_questao)} padrões sem nenhuma questão: {', '.join(sorted(sem_questao))}")

    return relatar()


def relatar() -> int:
    print()
    for a in avisos:
        print(f"  aviso   {a}")
    for p in problemas:
        print(f"  ERRO    {p}")
    print()
    if problemas:
        print(f"REPROVADO — {len(problemas)} erro(s), {len(avisos)} aviso(s).")
        return 1
    print(f"APROVADO — nenhum erro, {len(avisos)} aviso(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
