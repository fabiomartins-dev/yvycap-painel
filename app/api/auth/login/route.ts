import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { autenticar } from '@/services/auth';
import { assinarSessao, COOKIE_SESSAO, DURACAO_SESSAO_SEGUNDOS } from '@/lib/session';

export async function POST(request: Request) {
  const { email, senha } = (await request.json().catch(() => ({}))) as {
    email?: string;
    senha?: string;
  };
  if (!email || !senha) {
    return NextResponse.json({ erro: 'Informe e-mail e senha.' }, { status: 400 });
  }
  const usuario = await autenticar(email, senha);
  if (!usuario) {
    return NextResponse.json({ erro: 'Credenciais inválidas ou usuário inativo.' }, { status: 401 });
  }
  const exp = Math.floor(Date.now() / 1000) + DURACAO_SESSAO_SEGUNDOS;
  const token = await assinarSessao({ userId: usuario.id, permissoes: usuario.permissoes, exp });
  const store = await cookies();
  // Cookie de sessão (sem maxAge — expira ao fechar o navegador; token expira em 1h)
  store.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return NextResponse.json({
    ok: true,
    usuario: { id: usuario.id, nome: usuario.nome, permissoes: usuario.permissoes },
    exp,
  });
}
