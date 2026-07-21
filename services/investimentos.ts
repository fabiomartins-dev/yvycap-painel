// Serviços da seção Meus Investimentos (permissão investidor).
// Nunca expõe dados de comissão.

import {
  dataVencimento,
  gerarCronograma,
  hoje,
  juroMensal,
  proximaParcela,
  ROTULO_STATUS,
  somarDias,
  statusContrato,
  totalJaRecebido,
  AVISO_RESGATE_DIAS,
  type Parcela,
} from '@/lib/calc';
import { db } from '@/lib/store';
import type { Contrato, Documento, SolicitacaoResgate, StatusContrato } from '@/lib/types';

export interface ContratoInvestidor {
  id: string;
  numero: string;
  fase: 1 | 2 | 3;
  valorAporte: number;
  taxaMensal: number;
  dataInicio: string;
  dataVencimento: string;
  status: StatusContrato;
  statusRotulo: string;
  jurosMensal: number;
  totalRecebido: number;
  proximoPagamento: { data: string; valor: number } | null;
}

export interface ResumoInvestidor {
  totalAportado: number;
  contratosAtivos: number;
  proximoPagamento: { data: string; valor: number; contratoNumero: string } | null;
  totalRecebido: number;
  contratos: ContratoInvestidor[];
}

export interface ComprovantePagamento {
  identificador: string;
  meio: 'PIX' | 'TED';
  efetivadoEm: string;
  arquivo: string;
}

export interface PagamentoInvestidor {
  contratoId: string;
  contratoNumero: string;
  mes: number;
  data: string;
  tipo: Parcela['tipo'];
  valor: number;
  status: 'pago' | 'previsto';
  descricao: string;
  comprovante: ComprovantePagamento | null;
}

export interface DetalheContrato {
  contrato: ContratoInvestidor;
  cronograma: Parcela[];
  documentos: Documento[];
  resgate: SolicitacaoResgate | null;
  avisoResgateDias: number;
}

function investidorDoUsuario(userId: string) {
  return db().investidores.find((i) => i.usuarioId === userId) ?? null;
}

function toDto(c: Contrato): ContratoInvestidor {
  const prox = proximaParcela(c);
  return {
    id: c.id,
    numero: c.numero,
    fase: c.fase,
    valorAporte: c.valorAporte,
    taxaMensal: c.taxaMensal,
    dataInicio: c.dataInicio,
    dataVencimento: dataVencimento(c),
    status: statusContrato(c),
    statusRotulo: ROTULO_STATUS[statusContrato(c)],
    jurosMensal: juroMensal(c),
    totalRecebido: totalJaRecebido(c),
    proximoPagamento: prox ? { data: prox.data, valor: prox.valor } : null,
  };
}

export async function getResumoInvestidor(userId: string): Promise<ResumoInvestidor> {
  const inv = investidorDoUsuario(userId);
  const contratos = inv
    ? db().contratos.filter((c) => c.investidorId === inv.id && !c.estornado)
    : [];
  const dtos = contratos.map(toDto);
  const ativos = dtos.filter((d) => d.status !== 'encerrado');
  const proximos = ativos
    .filter((d) => d.proximoPagamento)
    .sort((a, b) => a.proximoPagamento!.data.localeCompare(b.proximoPagamento!.data));
  const p = proximos[0] ?? null;
  return {
    totalAportado: ativos.reduce((s, d) => s + d.valorAporte, 0),
    contratosAtivos: ativos.length,
    proximoPagamento: p
      ? { ...p.proximoPagamento!, contratoNumero: p.numero }
      : null,
    totalRecebido: dtos.reduce((s, d) => s + d.totalRecebido, 0),
    contratos: dtos,
  };
}

export async function getDetalheContrato(userId: string, contratoId: string): Promise<DetalheContrato | null> {
  const inv = investidorDoUsuario(userId);
  if (!inv) return null;
  const c = db().contratos.find((x) => x.id === contratoId && x.investidorId === inv.id);
  if (!c) return null;
  return {
    contrato: toDto(c),
    cronograma: gerarCronograma(c),
    documentos: db().documentos.filter((d) => d.contratoId === c.id),
    resgate:
      db().resgates.find((r) => r.contratoId === c.id && (r.status === 'pendente' || r.status === 'aprovado')) ?? null,
    avisoResgateDias: AVISO_RESGATE_DIAS,
  };
}

export async function getPagamentosInvestidor(userId: string): Promise<PagamentoInvestidor[]> {
  const inv = investidorDoUsuario(userId);
  if (!inv) return [];
  const contratos = db().contratos.filter((c) => c.investidorId === inv.id && !c.estornado);
  return contratos
    .flatMap((c) =>
      gerarCronograma(c)
        .filter((p) => p.valor > 0)
        .map((p) => ({
          contratoId: c.id,
          contratoNumero: c.numero,
          mes: p.mes,
          data: p.data,
          tipo: p.tipo,
          valor: p.valor,
          status: p.status,
          descricao: p.descricao,
          comprovante:
            p.status === 'pago'
              ? {
                  identificador: `${c.numero}-M${String(p.mes).padStart(2, '0')}`,
                  meio: (p.mes % 2 === 0 ? 'TED' : 'PIX') as 'PIX' | 'TED',
                  efetivadoEm: p.data,
                  arquivo: `Comprovante ${c.numero} - ${p.mes}o mes.pdf`,
                }
              : null,
        }))
    )
    .sort((a, b) => a.data.localeCompare(b.data));
}

export async function solicitarResgate(userId: string, contratoId: string): Promise<SolicitacaoResgate | null> {
  const inv = investidorDoUsuario(userId);
  if (!inv) return null;
  const d = db();
  const c = d.contratos.find((x) => x.id === contratoId && x.investidorId === inv.id);
  if (!c || statusContrato(c) === 'encerrado') return null;
  const jaExiste = d.resgates.some(
    (r) => r.contratoId === contratoId && (r.status === 'pendente' || r.status === 'aprovado')
  );
  if (jaExiste) return null;
  const solicitacao: SolicitacaoResgate = {
    id: `r-${d.seq.resgate++}`,
    contratoId,
    investidorId: inv.id,
    dataSolicitacao: hoje(),
    dataLiberacao: somarDias(hoje(), AVISO_RESGATE_DIAS),
    status: 'pendente',
    pagoEm: null,
  };
  d.resgates.push(solicitacao);
  return solicitacao;
}
