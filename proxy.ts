// Controle de acesso do painel: sessão obrigatória e permissão por grupo de rotas.

import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_SESSAO, verificarSessao } from '@/lib/session';
import type { Permissao } from '@/lib/types';

const ROTAS_PUBLICAS = ['/login', '/esqueci-senha'];

const PERMISSAO_POR_PREFIXO: [string, Permissao][] = [
  ['/investimentos', 'investidor'],
  ['/parceria', 'parceiro'],
  ['/admin', 'admin'],
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  const token = request.cookies.get(COOKIE_SESSAO)?.value;
  const sessao = await verificarSessao(token);

  if (ROTAS_PUBLICAS.some((r) => pathname.startsWith(r))) {
    // Já autenticado → home do painel
    if (sessao && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!sessao) {
    // Token expirado/inválido → limpa cookie e volta ao login
    const res = pathname.startsWith('/api')
      ? NextResponse.json({ erro: 'Sessão expirada.' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    if (token) res.cookies.delete(COOKIE_SESSAO);
    return res;
  }

  for (const [prefixo, permissao] of PERMISSAO_POR_PREFIXO) {
    if (pathname.startsWith(prefixo) && !sessao.permissoes.includes(permissao)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json|.*\\.(?:svg|png|jpg|ico)$).*)'],
};
