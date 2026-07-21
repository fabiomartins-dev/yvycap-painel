// Helpers de sessão para Server Components / Server Actions.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_SESSAO, verificarSessao, type SessaoPayload } from './session';
import { getUsuario } from '@/services/auth';
import type { Permissao, UsuarioPublico } from './types';

export interface SessaoAtual {
  sessao: SessaoPayload;
  usuario: UsuarioPublico;
}

export async function getSessao(): Promise<SessaoAtual | null> {
  const store = await cookies();
  const sessao = await verificarSessao(store.get(COOKIE_SESSAO)?.value);
  if (!sessao) return null;
  const usuario = await getUsuario(sessao.userId);
  if (!usuario || !usuario.ativo) return null;
  return { sessao, usuario };
}

export async function exigirSessao(): Promise<SessaoAtual> {
  const s = await getSessao();
  if (!s) redirect('/login');
  return s;
}

export async function exigirPermissao(permissao: Permissao): Promise<SessaoAtual> {
  const s = await exigirSessao();
  if (!s.sessao.permissoes.includes(permissao)) redirect('/');
  return s;
}
