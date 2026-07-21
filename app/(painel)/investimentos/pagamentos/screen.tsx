'use client';

import { PageHeader } from '@/components/PageHeader';
import { TabelaPagamentos } from '@/components/investimentos/TabelaPagamentos';
import type { PagamentoInvestidor } from '@/services/investimentos';

export function PagamentosScreen({ pagamentos }: { pagamentos: PagamentoInvestidor[] }) {
  return (
    <>
      <PageHeader
        titulo="Pagamentos"
        descricao="Histórico e agenda de todos os recebimentos dos seus contratos."
        migalhas={[
          { rotulo: 'Painel', href: '/' },
          { rotulo: 'Meus Investimentos', href: '/investimentos' },
          { rotulo: 'Pagamentos' },
        ]}
      />
      <TabelaPagamentos pagamentos={pagamentos} />
    </>
  );
}
