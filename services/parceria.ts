// Serviços da seção Parceria (permissão parceiro).
// O parceiro só enxerga a própria carteira — nunca credenciais ou conta de investidor.

import {
  comissoesDoContrato,
  dataVencimento,
  hoje,
  juroMensal,
  ROTULO_STATUS,
  saldoAtivo,
  somarMeses,
  statusContrato,
  COMISSAO_MENSAL,
  type LancamentoComissao,
} from '@/lib/calc';
import { db } from '@/lib/store';
import type { Cliente, Contrato, SolicitacaoResgate, StatusContrato } from '@/lib/types';

export interface ContratoCarteira {
  id: string;
  numero: string;
  clienteNome: string;
  fase: 1 | 2 | 3;
  valorAporte: number;
  taxaMensal: number;
  dataInicio: string;
  dataVencimento: string;
  status: StatusContrato;
  statusRotulo: string;
  conciliado: boolean;
  estornado: boolean;
  /** Comissão só é reconhecida após aporte conciliado. */
  comissaoReconhecida: boolean;
  comissaoMensalAtual: number;
  saldoAtivo: number;
}

export interface PontoEvolucao {
  mes: string; // rótulo ex.: "jan/26"
  competencia: string; // YYYY-MM
  saldoAtivo: number;
  comissaoMensal: number;
}

export interface ResumoParceiro {
  saldoAtivoCarteira: number;
  contratosAtivos: number;
  comissaoDoMes: number;
  proximoPagamentoComissao: { data: string; valor: number } | null;
  comissaoAcumulada: number;
  evolucao: PontoEvolucao[];
  contratos: ContratoCarteira[];
}

export interface ComissoesMes {
  competencia: string; // YYYY-MM
  entrada: number;
  recorrente: number;
  estornos: number;
  total: number;
  lancamentos: LancamentoComissao[];
}

export interface ExtratoComissoes {
  meses: ComissoesMes[];
  proximosPagamentos: LancamentoComissao[];
  totalPago: number;
  totalPrevisto: number;
}

export interface ResgateCarteira {
  id: string;
  contratoNumero: string;
  clienteNome: string;
  valorAporte: number;
  dataSolicitacao: string;
  dataLiberacao: string;
  status: SolicitacaoResgate['status'];
}

function parceiroDoUsuario(userId: string) {
  return db().parceiros.find((p) => p.usuarioId === userId) ?? null;
}

function nomeInvestidor(investidorId: string): string {
  return db().investidores.find((i) => i.id === investidorId)?.nome ?? '—';
}

function contratosDoParceiro(parceiroId: string): Contrato[] {
  return db().contratos.filter((c) => c.parceiroId === parceiroId);
}

function toCarteiraDto(c: Contrato): ContratoCarteira {
  const st = statusContrato(c);
  const saldo = saldoAtivo(c);
  return {
    id: c.id,
    numero: c.numero,
    clienteNome: nomeInvestidor(c.investidorId),
    fase: c.fase,
    valorAporte: c.valorAporte,
    taxaMensal: c.taxaMensal,
    dataInicio: c.dataInicio,
    dataVencimento: dataVencimento(c),
    status: st,
    statusRotulo: c.estornado ? 'Estornado' : c.conciliado ? ROTULO_STATUS[st] : 'Aguardando conciliação',
    conciliado: c.conciliado,
    estornado: c.estornado,
    comissaoReconhecida: c.conciliado && !c.estornado,
    comissaoMensalAtual: saldo * COMISSAO_MENSAL,
    saldoAtivo: saldo,
  };
}

function lancamentosDoParceiro(parceiroId: string): LancamentoComissao[] {
  return contratosDoParceiro(parceiroId)
    .flatMap((c) => comissoesDoContrato(c, c.numero))
    .sort((a, b) => a.dataPagamento.localeCompare(b.dataPagamento));
}

const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function rotuloMes(competencia: string): string {
  const [y, m] = competencia.split('-').map(Number);
  return `${MESES_PT[m - 1]}/${String(y).slice(2)}`;
}

export async function getResumoParceiro(userId: string): Promise<ResumoParceiro | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const contratos = contratosDoParceiro(p.id);
  const dtos = contratos.map(toCarteiraDto);
  const lanc = lancamentosDoParceiro(p.id);
  const ref = hoje();
  const compAtual = ref.slice(0, 7);

  // Evolução: dos últimos 8 meses até +4 meses de previsão
  const evolucao: PontoEvolucao[] = [];
  for (let off = -7; off <= 4; off++) {
    const dataRef = somarMeses(`${compAtual}-15`, off);
    const comp = dataRef.slice(0, 7);
    const saldo = contratos.reduce((s, c) => s + saldoAtivo(c, dataRef), 0);
    const comissao = lanc
      .filter((l) => l.competencia === comp && l.tipo !== 'entrada')
      .reduce((s, l) => s + l.valor, 0);
    evolucao.push({ mes: rotuloMes(comp), competencia: comp, saldoAtivo: saldo, comissaoMensal: comissao });
  }

  const proximos = lanc.filter((l) => l.status !== 'pago' && l.dataPagamento >= ref);
  const saldoCarteira = contratos.reduce((s, c) => s + saldoAtivo(c), 0);
  return {
    saldoAtivoCarteira: saldoCarteira,
    contratosAtivos: dtos.filter((d) => d.conciliado && !d.estornado && d.status !== 'encerrado').length,
    comissaoDoMes: saldoCarteira * COMISSAO_MENSAL,
    proximoPagamentoComissao: proximos[0]
      ? { data: proximos[0].dataPagamento, valor: proximos[0].valor }
      : null,
    comissaoAcumulada: lanc.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0),
    evolucao,
    contratos: dtos,
  };
}

export async function getClientes(userId: string): Promise<Cliente[]> {
  const p = parceiroDoUsuario(userId);
  return p ? db().clientes.filter((c) => c.parceiroId === p.id) : [];
}

export interface DetalheCliente {
  cliente: Cliente;
  contratos: ContratoCarteira[];
}

export async function getDetalheCliente(userId: string, clienteId: string): Promise<DetalheCliente | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const cliente = db().clientes.find((c) => c.id === clienteId && c.parceiroId === p.id);
  if (!cliente) return null;
  const contratos = cliente.investidorId
    ? db()
        .contratos.filter((c) => c.investidorId === cliente.investidorId && c.parceiroId === p.id)
        .map(toCarteiraDto)
    : [];
  return { cliente, contratos };
}

export async function getContratosCarteira(userId: string): Promise<ContratoCarteira[]> {
  const p = parceiroDoUsuario(userId);
  return p ? contratosDoParceiro(p.id).map(toCarteiraDto) : [];
}

export async function getContratoCarteira(userId: string, contratoId: string): Promise<ContratoCarteira | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const c = db().contratos.find((x) => x.id === contratoId && x.parceiroId === p.id);
  return c ? toCarteiraDto(c) : null;
}

export async function getExtratoComissoes(userId: string): Promise<ExtratoComissoes | null> {
  const p = parceiroDoUsuario(userId);
  if (!p) return null;
  const lanc = lancamentosDoParceiro(p.id);
  const ref = hoje();
  const porComp = new Map<string, LancamentoComissao[]>();
  lanc.forEach((l) => {
    const arr = porComp.get(l.competencia) ?? [];
    arr.push(l);
    porComp.set(l.competencia, arr);
  });
  const meses: ComissoesMes[] = [...porComp.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([competencia, ls]) => ({
      competencia,
      entrada: ls.filter((l) => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0),
      recorrente: ls.filter((l) => l.tipo === 'recorrente').reduce((s, l) => s + l.valor, 0),
      estornos: ls.filter((l) => l.tipo === 'estorno').reduce((s, l) => s + l.valor, 0),
      total: ls.reduce((s, l) => s + l.valor, 0),
      lancamentos: ls,
    }));
  return {
    meses,
    proximosPagamentos: lanc.filter((l) => l.status !== 'pago' && l.dataPagamento >= ref).slice(0, 12),
    totalPago: lanc.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0),
    totalPrevisto: lanc.filter((l) => l.status !== 'pago').reduce((s, l) => s + l.valor, 0),
  };
}

export async function getResgatesCarteira(userId: string): Promise<ResgateCarteira[]> {
  const p = parceiroDoUsuario(userId);
  if (!p) return [];
  const ids = new Set(contratosDoParceiro(p.id).map((c) => c.id));
  return db()
    .resgates.filter((r) => ids.has(r.contratoId))
    .map((r) => {
      const c = db().contratos.find((x) => x.id === r.contratoId)!;
      return {
        id: r.id,
        contratoNumero: c.numero,
        clienteNome: nomeInvestidor(c.investidorId),
        valorAporte: c.valorAporte,
        dataSolicitacao: r.dataSolicitacao,
        dataLiberacao: r.dataLiberacao,
        status: r.status,
      };
    })
    .sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao));
}
