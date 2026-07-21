'use server';

// Server Actions — todas as mutações passam pela sessão e pelos services tipados.

import { revalidatePath } from 'next/cache';
import { exigirPermissao, exigirSessao } from '@/lib/auth-server';
import * as auth from '@/services/auth';
import * as investimentos from '@/services/investimentos';
import * as admin from '@/services/admin';
import type { Permissao } from '@/lib/types';

export async function acaoAceitarTermos(): Promise<void> {
  const { sessao } = await exigirSessao();
  await auth.aceitarTermos(sessao.userId);
  revalidatePath('/', 'layout');
}

export async function acaoSolicitarAlteracaoCadastro(mensagem: string): Promise<void> {
  const { sessao } = await exigirSessao();
  await auth.solicitarAlteracaoCadastro(sessao.userId, mensagem);
}

export async function acaoSolicitarResgate(contratoId: string): Promise<{ ok: boolean }> {
  const { sessao } = await exigirPermissao('investidor');
  const r = await investimentos.solicitarResgate(sessao.userId, contratoId);
  revalidatePath('/investimentos', 'layout');
  return { ok: !!r };
}

// ————— Admin —————

export async function acaoCadastrarParceiro(input: admin.NovoParceiroInput): Promise<void> {
  await exigirPermissao('admin');
  await admin.cadastrarParceiro(input);
  revalidatePath('/admin', 'layout');
}

export async function acaoAlternarParceiroAtivo(parceiroId: string): Promise<void> {
  await exigirPermissao('admin');
  await admin.alternarParceiroAtivo(parceiroId);
  revalidatePath('/admin', 'layout');
}

export async function acaoAprovarCadastroInvestidor(id: string): Promise<void> {
  await exigirPermissao('admin');
  await admin.aprovarCadastroInvestidor(id);
  revalidatePath('/admin', 'layout');
}

export async function acaoConfirmarConciliacao(contratoId: string): Promise<void> {
  await exigirPermissao('admin');
  await admin.confirmarConciliacao(contratoId);
  revalidatePath('/', 'layout');
}

export async function acaoRegistrarAmortizacao(
  contratoId: string,
  valor: number,
  tipo: 'amortizacao' | 'quitacao'
): Promise<void> {
  await exigirPermissao('admin');
  await admin.registrarAmortizacao(contratoId, valor, tipo);
  revalidatePath('/', 'layout');
}

export async function acaoEncerrarNoVencimento(contratoId: string): Promise<void> {
  await exigirPermissao('admin');
  await admin.encerrarNoVencimento(contratoId);
  revalidatePath('/', 'layout');
}

export async function acaoAprovarResgate(id: string): Promise<void> {
  await exigirPermissao('admin');
  await admin.aprovarResgate(id);
  revalidatePath('/', 'layout');
}

export async function acaoRegistrarPagamentoResgate(id: string): Promise<void> {
  await exigirPermissao('admin');
  await admin.registrarPagamentoResgate(id);
  revalidatePath('/', 'layout');
}

export async function acaoCriarUsuario(input: admin.NovoUsuarioInput): Promise<void> {
  await exigirPermissao('admin');
  await admin.criarUsuario(input);
  revalidatePath('/admin', 'layout');
}

export async function acaoAtualizarPermissoes(userId: string, permissoes: Permissao[]): Promise<void> {
  await exigirPermissao('admin');
  await admin.atualizarPermissoes(userId, permissoes);
  revalidatePath('/admin', 'layout');
}

export async function acaoAlternarUsuarioAtivo(userId: string): Promise<void> {
  await exigirPermissao('admin');
  await admin.alternarUsuarioAtivo(userId);
  revalidatePath('/admin', 'layout');
}

export async function acaoResetarAcesso(userId: string): Promise<void> {
  await exigirPermissao('admin');
  await admin.resetarAcesso(userId);
  revalidatePath('/admin', 'layout');
}
