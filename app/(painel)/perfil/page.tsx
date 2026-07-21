import { exigirSessao } from '@/lib/auth-server';
import { db } from '@/lib/store';
import { PerfilScreen } from './screen';

export const metadata = { title: 'Perfil' };

export default async function PerfilPage() {
  const { usuario, sessao } = await exigirSessao();
  // Dados complementares via mock (somente do próprio usuário)
  const investidor = db().investidores.find((i) => i.usuarioId === usuario.id) ?? null;
  const parceiro = db().parceiros.find((p) => p.usuarioId === usuario.id) ?? null;

  return (
    <PerfilScreen
      usuario={usuario}
      permissoes={sessao.permissoes}
      investidor={investidor}
      parceiro={parceiro}
    />
  );
}
