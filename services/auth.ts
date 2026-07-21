// Serviço de autenticação (mock atrás de contrato tipado).

import { db } from '@/lib/store';
import type { Usuario, UsuarioPublico } from '@/lib/types';

function publico(u: Usuario): UsuarioPublico {
  const { senha: _senha, ...resto } = u;
  return resto;
}

export async function autenticar(email: string, senha: string): Promise<UsuarioPublico | null> {
  const u = db().usuarios.find(
    (x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.senha === senha && x.ativo
  );
  return u ? publico(u) : null;
}

export async function getUsuario(id: string): Promise<UsuarioPublico | null> {
  const u = db().usuarios.find((x) => x.id === id);
  return u ? publico(u) : null;
}

export async function aceitarTermos(userId: string): Promise<void> {
  const u = db().usuarios.find((x) => x.id === userId);
  if (u && !u.termosAceitosEm) u.termosAceitosEm = new Date().toISOString();
}

export async function solicitarAlteracaoCadastro(userId: string, mensagem: string): Promise<void> {
  const d = db();
  d.alteracoesCadastro.push({
    id: `alt-${d.alteracoesCadastro.length + 1}`,
    usuarioId: userId,
    mensagem,
    data: new Date().toISOString(),
  });
}
