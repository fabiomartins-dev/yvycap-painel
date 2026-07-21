// Regras de negócio da captação YVYCAP — contratos de mútuo.
// Prazo 36 meses, juros simples desde a data de entrada do recurso.
// Carência (meses 1–6): juros acumulam, pagos no vencimento com o principal.
// Meses 7–36: pagamento mensal dos juros correntes.
// Vencimento (mês 36): principal + juros da carência (6×) + último juro.

import type { Contrato, Fase, StatusContrato } from './types';

export const FASES: Fase[] = [
  { numero: 1, meta: 16_000_000, taxaMensal: 0.03, status: 'aberta', abertura: '2026-07-20' },
  { numero: 2, meta: 24_000_000, taxaMensal: 0.02, status: 'prevista', abertura: null },
  { numero: 3, meta: 32_000_000, taxaMensal: 0.011, status: 'prevista', abertura: null },
];

export const PRAZO_MESES = 36;
export const CARENCIA_MESES = 6;
export const APORTE_MINIMO = 100_000;
export const AVISO_RESGATE_DIAS = 90;
export const AVISO_QUITACAO_DIAS = 60;
export const RETENCAO_ENTRADA_DIAS = 30;
export const COMISSAO_ENTRADA = 0.01; // 1% sobre o aporte, pagamento único
export const COMISSAO_MENSAL = 0.01; // 1% a.m. sobre o saldo ativo

export function fasePorNumero(n: 1 | 2 | 3): Fase {
  return FASES.find((f) => f.numero === n)!;
}

/** Soma `meses` à data ISO, preservando o dia quando possível. */
export function somarMeses(iso: string, meses: number): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const alvo = new Date(Date.UTC(y, m - 1 + meses, 1));
  const ultimoDia = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimoDia));
  return alvo.toISOString().slice(0, 10);
}

export function somarDias(iso: string, dias: number): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Juros mensal do contrato = valor aportado × taxa da fase. */
export function juroMensal(c: Pick<Contrato, 'valorAporte' | 'taxaMensal'>): number {
  return c.valorAporte * c.taxaMensal;
}

export function dataVencimento(c: Pick<Contrato, 'dataInicio'>): string {
  return somarMeses(c.dataInicio, PRAZO_MESES);
}

export type TipoParcela = 'carencia' | 'juros' | 'vencimento';

export interface Parcela {
  mes: number; // 1..36
  data: string;
  tipo: TipoParcela;
  /** Valor pago ao investidor na data (0 na carência). */
  valor: number;
  /** Juros do mês (informativo; na carência acumula). */
  jurosDoMes: number;
  status: 'pago' | 'previsto';
  descricao: string;
}

/** Cronograma completo dos 36 meses do contrato. */
export function gerarCronograma(c: Contrato, ref: string = hoje()): Parcela[] {
  const j = juroMensal(c);
  const parcelas: Parcela[] = [];
  for (let mes = 1; mes <= PRAZO_MESES; mes++) {
    const dataParcela = somarMeses(c.dataInicio, mes);
    let tipo: TipoParcela;
    let valor: number;
    let descricao: string;
    if (mes <= CARENCIA_MESES) {
      tipo = 'carencia';
      valor = 0;
      descricao = 'Carência — juros acumulam para o vencimento';
    } else if (mes < PRAZO_MESES) {
      tipo = 'juros';
      valor = j;
      descricao = 'Pagamento mensal de juros';
    } else {
      tipo = 'vencimento';
      valor = c.valorAporte + CARENCIA_MESES * j + j;
      descricao = 'Vencimento — principal + juros da carência + último juro';
    }
    const pago = c.conciliado && !c.estornado && valor > 0 && dataParcela <= ref && !c.encerradoEm;
    parcelas.push({ mes, data: dataParcela, tipo, valor, jurosDoMes: j, status: pago ? 'pago' : 'previsto', descricao });
  }
  return parcelas;
}

/** Total que o investidor recebe ao longo do contrato (ex.: 100 mil na fase 1 → 208 mil). */
export function totalARecber(c: Contrato): number {
  return c.valorAporte + PRAZO_MESES * juroMensal(c);
}

export function totalJaRecebido(c: Contrato, ref: string = hoje()): number {
  return gerarCronograma(c, ref)
    .filter((p) => p.status === 'pago')
    .reduce((s, p) => s + p.valor, 0);
}

export function proximaParcela(c: Contrato, ref: string = hoje()): Parcela | null {
  return gerarCronograma(c, ref).find((p) => p.status === 'previsto' && p.valor > 0 && p.data > ref) ?? null;
}

export function statusContrato(c: Contrato, ref: string = hoje()): StatusContrato {
  if (c.encerradoEm || c.estornado || dataVencimento(c) <= ref) return 'encerrado';
  if (somarMeses(c.dataInicio, CARENCIA_MESES) > ref) return 'carencia';
  return 'ativo';
}

export const ROTULO_STATUS: Record<StatusContrato, string> = {
  carencia: 'Carência',
  ativo: 'Ativo',
  encerrado: 'Encerrado',
};

/**
 * Saldo ativo do contrato na data de referência (base da comissão recorrente).
 * Diminui com amortizações/quitações e zera no vencimento. Estorno zera.
 */
export function saldoAtivo(c: Contrato, ref: string = hoje()): number {
  if (!c.conciliado || c.estornado) return 0;
  if (c.encerradoEm && c.encerradoEm <= ref) return 0;
  if (dataVencimento(c) <= ref) return 0;
  if (c.dataInicio > ref) return 0;
  const amortizado = c.amortizacoes
    .filter((a) => a.data <= ref)
    .reduce((s, a) => s + a.valor, 0);
  return Math.max(0, c.valorAporte - amortizado);
}

// ————— Comissões do parceiro (por contrato) —————

export type TipoComissao = 'entrada' | 'recorrente' | 'estorno';

export interface LancamentoComissao {
  contratoId: string;
  contratoNumero: string;
  parceiroId: string;
  tipo: TipoComissao;
  /** Mês de competência (YYYY-MM) */
  competencia: string;
  /** Data prevista de pagamento */
  dataPagamento: string;
  valor: number;
  status: 'pago' | 'previsto' | 'retido';
  observacao: string;
}

/**
 * Lançamentos de comissão de um contrato:
 * — Entrada: 1% do aporte, pagamento único com retenção de 30 dias após a conciliação.
 * — Recorrente: 1% a.m. sobre o saldo ativo, desde o 1º mês (inclusive na carência).
 * Valor estornado não gera comissão (gera estorno do que foi reconhecido).
 */
export function comissoesDoContrato(
  c: Contrato,
  numero: string,
  ref: string = hoje(),
  ateMeses: number = PRAZO_MESES
): LancamentoComissao[] {
  if (!c.parceiroId || !c.conciliado) return [];
  const lanc: LancamentoComissao[] = [];
  const base = c.dataConciliacao ?? c.dataInicio;

  if (!c.estornado) {
    const pagEntrada = somarDias(base, RETENCAO_ENTRADA_DIAS);
    lanc.push({
      contratoId: c.id,
      contratoNumero: numero,
      parceiroId: c.parceiroId,
      tipo: 'entrada',
      competencia: base.slice(0, 7),
      dataPagamento: pagEntrada,
      valor: c.valorAporte * COMISSAO_ENTRADA,
      status: pagEntrada <= ref ? 'pago' : 'retido',
      observacao: 'Comissão de entrada (1% do aporte) — retenção de 30 dias',
    });
  } else {
    lanc.push({
      contratoId: c.id,
      contratoNumero: numero,
      parceiroId: c.parceiroId,
      tipo: 'estorno',
      competencia: base.slice(0, 7),
      dataPagamento: base,
      valor: -(c.valorAporte * COMISSAO_ENTRADA),
      status: 'pago',
      observacao: 'Estorno — aporte estornado não gera comissão',
    });
    return lanc;
  }

  for (let mes = 1; mes <= ateMeses; mes++) {
    const dataPag = somarMeses(c.dataInicio, mes);
    const saldo = saldoAtivo(c, somarDias(dataPag, -1));
    if (saldo <= 0) break;
    lanc.push({
      contratoId: c.id,
      contratoNumero: numero,
      parceiroId: c.parceiroId,
      tipo: 'recorrente',
      competencia: dataPag.slice(0, 7),
      dataPagamento: dataPag,
      valor: saldo * COMISSAO_MENSAL,
      status: dataPag <= ref ? 'pago' : 'previsto',
      observacao: `Comissão recorrente (1% a.m. sobre saldo ativo) — mês ${mes}`,
    });
  }
  return lanc;
}
