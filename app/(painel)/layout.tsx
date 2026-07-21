import { exigirSessao } from '@/lib/auth-server';
import { PainelShell } from '@/components/PainelShell';
import { TermosGate } from '@/components/TermosGate';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const { usuario, sessao } = await exigirSessao();

  return (
    <PainelShell nome={usuario.nome} permissoes={sessao.permissoes} exp={sessao.exp}>
      {usuario.termosAceitosEm ? children : <TermosGate nome={usuario.nome} />}
    </PainelShell>
  );
}
